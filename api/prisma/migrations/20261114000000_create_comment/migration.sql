-- CreateTable
CREATE TABLE `comentario` (
    `id` VARCHAR(36) NOT NULL,
    `conteudo` TEXT NOT NULL,
    `autorId` VARCHAR(36) NOT NULL,
    `postSlug` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataDelecao` DATETIME(3) NULL,

    INDEX `Comentario_postSlug_fkey`(`postSlug`),
    INDEX `Comentario_autorId_fkey`(`autorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `comentario` ADD CONSTRAINT `Comentario_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentario` ADD CONSTRAINT `Comentario_postSlug_fkey` FOREIGN KEY (`postSlug`) REFERENCES `post`(`slug`) ON DELETE RESTRICT ON UPDATE CASCADE;
