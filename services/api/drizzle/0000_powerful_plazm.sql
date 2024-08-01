CREATE TABLE `transaction` (
	`id` int AUTO_INCREMENT NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL,
	`amount` int NOT NULL,
	`tax` int NOT NULL DEFAULT 0.01,
	`payment_gateway_transaction_qr_url` text NOT NULL,
	`payment_gateway_transaction_id` text NOT NULL,
	`payment_gateway_transaction_status` text NOT NULL,
	`payment_gateway_transaction_expire_at` timestamp NOT NULL,
	CONSTRAINT `transaction_id` PRIMARY KEY(`id`)
);
