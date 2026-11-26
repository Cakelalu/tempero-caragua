 -- Adicionar coluna 'used' apenas se não existir
   SET @col := (
     SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'PasswordReset'
       AND column_name = 'used'
   );

   SET @sql := IF(@col = 0,
     'ALTER TABLE `PasswordReset` ADD COLUMN `used` BOOLEAN NOT NULL DEFAULT false',
     'SELECT "Coluna used ja existe"'
   );

   PREPARE stmt FROM @sql;
   EXECUTE stmt;
   DEALLOCATE PREPARE stmt;

   -- Criar índice da coluna 'used' apenas se não existir
   SET @idx := (
     SELECT COUNT(*)
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = 'PasswordReset'
       AND index_name = 'PasswordReset_used_idx'
   );

   SET @sql := IF(@idx = 0,
     'CREATE INDEX `PasswordReset_used_idx` ON `PasswordReset`(`used`)',
     'SELECT "Indice ja existe"'
   );

   PREPARE stmt FROM @sql;
   EXECUTE stmt;
   DEALLOCATE PREPARE stmt;