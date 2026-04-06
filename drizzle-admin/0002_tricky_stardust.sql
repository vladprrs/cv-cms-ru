CREATE TABLE `consents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`consent_version` text NOT NULL,
	`scope` text NOT NULL,
	`consented_at` text NOT NULL,
	`withdrawn_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `consents_user_scope_idx` ON `consents` (`user_id`,`scope`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_databases_user_id_unique` ON `user_databases` (`user_id`);