CREATE TABLE `galleries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`photographer_id` integer NOT NULL,
	`title` text NOT NULL,
	`client_name` text NOT NULL,
	`share_token` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `galleries_share_token_unique` ON `galleries` (`share_token`);--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gallery_id` integer NOT NULL,
	`invoice_number` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`pdf_path` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `photographers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`business_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photographers_email_unique` ON `photographers` (`email`);--> statement-breakpoint
CREATE TABLE `photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gallery_id` integer NOT NULL,
	`filename` text NOT NULL,
	`storage_path` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer
);
