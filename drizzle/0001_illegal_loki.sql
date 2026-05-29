CREATE TABLE `fault_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`machineId` int NOT NULL,
	`reportedBy` varchar(128) NOT NULL,
	`description` text NOT NULL,
	`status` enum('open','in_progress','resolved') NOT NULL DEFAULT 'open',
	`resolvedAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fault_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `machines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`name` varchar(128) NOT NULL,
	`type` varchar(64) NOT NULL,
	`location` varchar(128) NOT NULL,
	`status` enum('available','in_use','faulty') NOT NULL DEFAULT 'available',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `machines_id` PRIMARY KEY(`id`),
	CONSTRAINT `machines_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `usage_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`machineId` int NOT NULL,
	`teacherName` varchar(128) NOT NULL,
	`className` varchar(128) NOT NULL,
	`startTime` bigint NOT NULL,
	`endTime` bigint,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usage_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `fault_reports` ADD CONSTRAINT `fault_reports_machineId_machines_id_fk` FOREIGN KEY (`machineId`) REFERENCES `machines`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usage_records` ADD CONSTRAINT `usage_records_machineId_machines_id_fk` FOREIGN KEY (`machineId`) REFERENCES `machines`(`id`) ON DELETE no action ON UPDATE no action;