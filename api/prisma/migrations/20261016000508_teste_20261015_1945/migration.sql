/*
  Warnings:

  - A unique constraint covering the columns `[userId,postSlug]` on the table `Favorited` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,postSlug]` on the table `Liked` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tagNome,postSlug]` on the table `Tagged` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `Followed` (
    `id` VARCHAR(191) NOT NULL,
    `perfilId` VARCHAR(191) NOT NULL,
    `seguidorId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Followed_perfilId_seguidorId_key`(`perfilId`, `seguidorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Favorited_userId_postSlug_key` ON `Favorited`(`userId`, `postSlug`);

-- CreateIndex
CREATE UNIQUE INDEX `Liked_userId_postSlug_key` ON `Liked`(`userId`, `postSlug`);

-- CreateIndex
CREATE UNIQUE INDEX `Tagged_tagNome_postSlug_key` ON `Tagged`(`tagNome`, `postSlug`);

-- AddForeignKey
ALTER TABLE `Followed` ADD CONSTRAINT `Followed_perfilId_fkey` FOREIGN KEY (`perfilId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Followed` ADD CONSTRAINT `Followed_seguidorId_fkey` FOREIGN KEY (`seguidorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
