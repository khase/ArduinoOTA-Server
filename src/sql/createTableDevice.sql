CREATE TABLE IF NOT EXISTS `device` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mac` VARCHAR(18) NOT NULL,
  `name` VARCHAR(25) NULL,
  `description` VARCHAR(255) NULL,
  `lastseen` DATETIME NULL,
  `currentversion` VARCHAR(255) NULL,
  `lasterror` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `mac_UNIQUE` (`mac` ASC))
ENGINE = InnoDB;