CREATE TABLE `analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resumeId` int NOT NULL,
	`userId` int NOT NULL,
	`summaryFeedback` text,
	`experienceFeedback` text,
	`educationFeedback` text,
	`skillsFeedback` text,
	`overallFeedback` text,
	`skillGaps` text,
	`skillMatches` text,
	`targetJobDescription` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resumeId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generatedContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resumeId` int NOT NULL,
	`userId` int NOT NULL,
	`contentType` enum('coverLetter','linkedinHeadline','linkedinSummary','linkedinSkills') NOT NULL,
	`jobDescription` text,
	`generatedText` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generatedContent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` varchar(512) NOT NULL,
	`fileType` varchar(20) NOT NULL,
	`extractedText` text,
	`atsScore` int,
	`readabilityScore` int,
	`keywordDensity` text,
	`skillsExtracted` text,
	`jobRoleMatches` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resumes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_resumeId_resumes_id_fk` FOREIGN KEY (`resumeId`) REFERENCES `resumes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chatHistory` ADD CONSTRAINT `chatHistory_resumeId_resumes_id_fk` FOREIGN KEY (`resumeId`) REFERENCES `resumes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chatHistory` ADD CONSTRAINT `chatHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generatedContent` ADD CONSTRAINT `generatedContent_resumeId_resumes_id_fk` FOREIGN KEY (`resumeId`) REFERENCES `resumes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generatedContent` ADD CONSTRAINT `generatedContent_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resumes` ADD CONSTRAINT `resumes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;