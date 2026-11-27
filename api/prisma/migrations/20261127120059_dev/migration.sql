/*
  Warnings:

  - The primary key for the `comentario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `postSlug` on the `comentario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- DropForeignKey
ALTER TABLE `comentario` DROP FOREIGN KEY `Comentario_autorId_fkey`;

-- DropForeignKey
ALTER TABLE `comentario` DROP FOREIGN KEY `Comentario_postSlug_fkey`;

-- DropForeignKey
ALTER TABLE `passwordreset` DROP FOREIGN KEY `PasswordReset_userId_fkey`;

-- AlterTable
ALTER TABLE `comentario` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `autorId` VARCHAR(191) NOT NULL,
    MODIFY `postSlug` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE INDEX `PasswordReset_token_idx` ON `PasswordReset`(`token`);

-- AddForeignKey
ALTER TABLE `comentario` ADD CONSTRAINT `Comentario_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentario` ADD CONSTRAINT `Comentario_postSlug_fkey` FOREIGN KEY (`postSlug`) REFERENCES `post`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordReset` ADD CONSTRAINT `PasswordReset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
