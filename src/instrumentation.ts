/**
 * Next.js instrumentation — runs once on server startup.
 * Used to verify external service connectivity early.
 */
export async function register() {
  // Only run on the server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await checkTursoConnectivity();
  }
}

async function checkTursoConnectivity() {
  const adminUrl = process.env.TURSO_ADMIN_DB_URL;
  const adminToken = process.env.TURSO_ADMIN_DB_TOKEN;

  if (!adminUrl || !adminToken) {
    console.log('[startup] ⚠ TURSO_ADMIN_DB_URL or TURSO_ADMIN_DB_TOKEN not set — skipping connectivity check');
    return;
  }

  console.log('[startup] Checking Turso connectivity...');

  // Check admin DB
  try {
    const { createClient } = await import('@libsql/client/web');
    const client = createClient({ url: adminUrl, authToken: adminToken });
    const result = await client.execute('SELECT COUNT(*) as cnt FROM users');
    console.log(`[startup] ✓ Admin DB OK (${adminUrl}) — ${result.rows[0].cnt} users`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[startup] ✗ Admin DB FAILED (${adminUrl}) — ${message}`);
  }

  // Check Turso Platform API
  const platformToken = process.env.TURSO_PLATFORM_API_TOKEN;
  const orgName = process.env.TURSO_ORG_NAME;
  if (platformToken && orgName) {
    try {
      const res = await fetch(
        `https://api.turso.tech/v1/organizations/${orgName}/databases`,
        { headers: { Authorization: `Bearer ${platformToken}` } }
      );
      if (res.ok) {
        const data = await res.json();
        console.log(`[startup] ✓ Turso Platform API OK — ${data.databases?.length ?? 0} databases`);
      } else {
        console.error(`[startup] ✗ Turso Platform API FAILED — HTTP ${res.status}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[startup] ✗ Turso Platform API unreachable — ${message}`);
    }
  }

  // Spot-check a user DB (first ready one)
  try {
    const { createClient } = await import('@libsql/client/web');
    const adminClient = createClient({ url: adminUrl, authToken: adminToken });
    const rec = await adminClient.execute(
      "SELECT turso_db_url, turso_auth_token FROM user_databases WHERE status = 'ready' LIMIT 1"
    );
    if (rec.rows[0]) {
      const userUrl = String(rec.rows[0].turso_db_url);
      const userToken = String(rec.rows[0].turso_auth_token);
      const userClient = createClient({ url: userUrl, authToken: userToken });
      await userClient.execute('SELECT 1');
      console.log(`[startup] ✓ User DB spot-check OK (${userUrl})`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[startup] ✗ User DB spot-check FAILED — ${message}`);
  }
}
