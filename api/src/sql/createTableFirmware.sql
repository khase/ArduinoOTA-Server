CREATE TABLE IF NOT EXISTS `firmware` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `description` VARCHAR(255) NULL,
  `hash` BLOB NULL,
  `path` VARCHAR(255) NULL,
  `size` INT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;