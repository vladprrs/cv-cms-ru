/**
 * One-time cleanup: remove duplicate user_databases rows.
 * Keeps the most recent record (MAX created_at) per user, deletes the rest.
 * Run with: npx dotenv -e .env.local -- npx tsx src/db/cleanup-duplicate-user-dbs.ts
 */
import { createClient } from '@libsql/client/web';

async function main() {
  const adminUrl = process.env.TURSO_ADMIN_DB_URL;
  const adminToken = process.env.TURSO_ADMIN_DB_TOKEN;
  if (!adminUrl || !adminToken) {
    throw new Error('Missing TURSO_ADMIN_DB_URL or TURSO_ADMIN_DB_TOKEN');
  }

  const client = createClient({ url: adminUrl, authToken: adminToken });

  // Find users with duplicate records
  const duplicates = await client.execute(
    `SELECT user_id, COUNT(*) as cnt FROM user_databases GROUP BY user_id HAVING cnt > 1`
  );

  if (duplicates.rows.length === 0) {
    console.log('No duplicate records found. Nothing to clean up.');
    const total = await client.execute(`SELECT COUNT(*) as cnt FROM user_databases`);
    console.log(`Total user_databases records: ${total.rows[0].cnt}`);
    return;
  }

  console.log(`Found ${duplicates.rows.length} user(s) with duplicate records:\n`);

  let totalDeleted = 0;

  for (const row of duplicates.rows) {
    const userId = row.user_id as string;
    const count = row.cnt as number;

    // Get all records for this user, ordered by created_at DESC
    const records = await client.execute({
      sql: `SELECT id, turso_db_name, status, created_at FROM user_databases WHERE user_id = ? ORDER BY created_at DESC`,
      args: [userId],
    });

    // Keep the first (most recent), delete the rest
    const kept = records.rows[0];
    const toDelete = records.rows.slice(1);

    console.log(`User ${userId}: ${count} records, keeping ${kept.id} (${kept.created_at})`);

    for (const dup of toDelete) {
      await client.execute({
        sql: `DELETE FROM user_databases WHERE id = ?`,
        args: [dup.id as string],
      });
      console.log(`  Deleted ${dup.id} (${dup.created_at})`);
      totalDeleted++;
    }
  }

  // Verify final state
  const finalCount = await client.execute(`SELECT COUNT(*) as cnt FROM user_databases`);
  const stillDuplicates = await client.execute(
    `SELECT user_id, COUNT(*) as cnt FROM user_databases GROUP BY user_id HAVING cnt > 1`
  );

  console.log(`\n--- Summary ---`);
  console.log(`Records deleted: ${totalDeleted}`);
  console.log(`Records remaining: ${finalCount.rows[0].cnt}`);
  console.log(`Users still with duplicates: ${stillDuplicates.rows.length}`);

  if (stillDuplicates.rows.length > 0) {
    console.error('ERROR: Duplicates still exist after cleanup!');
    process.exit(1);
  }

  console.log('Cleanup complete.');
}

main().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
