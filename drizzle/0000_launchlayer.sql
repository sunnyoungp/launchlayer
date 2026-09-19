CREATE TABLE `assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`product_version_id` text NOT NULL,
	`market` text NOT NULL,
	`status` text NOT NULL,
	`confidence` text NOT NULL,
	`assessed_at` text NOT NULL,
	FOREIGN KEY (`product_version_id`) REFERENCES `product_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_assessments_product_market` ON `assessments` (`product_version_id`,`market`);--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`payload_json` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_audit_entity` ON `audit_events` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `findings` (
	`id` text PRIMARY KEY NOT NULL,
	`assessment_id` text NOT NULL,
	`source_id` text NOT NULL,
	`rule_id` text,
	`dimension` text NOT NULL,
	`severity` text NOT NULL,
	`status` text NOT NULL,
	`title` text NOT NULL,
	`explanation` text NOT NULL,
	`trigger_fact` text NOT NULL,
	`action` text NOT NULL,
	`confidence` text NOT NULL,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `regulatory_sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rule_id`) REFERENCES `rules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_findings_assessment_status` ON `findings` (`assessment_id`,`status`);--> statement-breakpoint
CREATE TABLE `formula_ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`product_version_id` text NOT NULL,
	`original_name` text NOT NULL,
	`standardized_name` text,
	`function_name` text,
	`concentration_ppm` integer,
	`identity_confirmed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`product_version_id`) REFERENCES `product_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_formula_ingredients_product_version` ON `formula_ingredients` (`product_version_id`);--> statement-breakpoint
CREATE TABLE `launch_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`product_version_id` text NOT NULL,
	`strategy` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`product_version_id`) REFERENCES `product_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_memberships_workspace_user` ON `memberships` (`workspace_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `product_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`version` text NOT NULL,
	`facts_json` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_product_versions_product_version` ON `product_versions` (`product_id`,`version`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`sku` text NOT NULL,
	`stage` text NOT NULL,
	`category` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_products_workspace_sku` ON `products` (`workspace_id`,`sku`);--> statement-breakpoint
CREATE TABLE `regulatory_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`jurisdiction` text NOT NULL,
	`authority` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`version` text NOT NULL,
	`effective_date` text NOT NULL,
	`reviewed_date` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sources_jurisdiction` ON `regulatory_sources` (`jurisdiction`);--> statement-breakpoint
CREATE TABLE `rules` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`jurisdiction` text NOT NULL,
	`dimension` text NOT NULL,
	`condition_json` text NOT NULL,
	`outcome_json` text NOT NULL,
	`effective_from` text NOT NULL,
	`effective_to` text,
	FOREIGN KEY (`source_id`) REFERENCES `regulatory_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_rules_jurisdiction_effective` ON `rules` (`jurisdiction`,`effective_from`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`launch_plan_id` text NOT NULL,
	`finding_id` text,
	`title` text NOT NULL,
	`workstream` text NOT NULL,
	`owner` text NOT NULL,
	`due_date` text,
	`country` text NOT NULL,
	`status` text NOT NULL,
	`dependency_id` text,
	FOREIGN KEY (`launch_plan_id`) REFERENCES `launch_plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`finding_id`) REFERENCES `findings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_plan_status` ON `tasks` (`launch_plan_id`,`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL
);--> statement-breakpoint
PRAGMA optimize;
