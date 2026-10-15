/*
  Warnings:

  - You are about to drop the column `postId` on the `favorited` table. All the data in the column will be lost.
  - Added the required column `postSlug` to the `Favorited` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `favorited` DROP FOREIGN KEY `Favorited_postId_fkey`;

-- DropIndex
DROP INDEX `Favorited_postId_fkey` ON `favorited`;

-- AlterTable
ALTER TABLE `favorited` DROP COLUMN `postId`,
    ADD COLUMN `postSlug` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Favorited` ADD CONSTRAINT `Favorited_postSlug_fkey` FOREIGN KEY (`postSlug`) REFERENCES `Post`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;
