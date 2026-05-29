DROP TABLE `usage_records`;--> statement-breakpoint
ALTER TABLE `machines` MODIFY COLUMN `status` enum('available','faulty') NOT NULL DEFAULT 'available';