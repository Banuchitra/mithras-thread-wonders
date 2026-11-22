CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`name` text NOT NULL,
	`contact` text NOT NULL,
	`country` text DEFAULT '' NOT NULL,
	`business` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`links` text DEFAULT '[]' NOT NULL,
	`photo_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`notes` text DEFAULT '' NOT NULL
);
