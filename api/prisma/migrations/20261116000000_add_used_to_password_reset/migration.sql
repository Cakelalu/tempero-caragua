-- AlterTable
ALTER TABLE `PasswordReset` ADD COLUMN `used` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `PasswordReset_used_idx` ON `PasswordReset`(`used`);
