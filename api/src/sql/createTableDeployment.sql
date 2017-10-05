CREATE TABLE IF NOT EXISTS `deployment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `device_id` INT NULL,
  `firmware_id` INT NULL,
  `triggered` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_deployment_device_idx` (`device_id` ASC),
  INDEX `fk_deployment_firmware1_idx` (`firmware_id` ASC),
  CONSTRAINT `fk_deployment_device`
    FOREIGN KEY (`device_id`)
    REFERENCES `device` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_deployment_firmware1`
    FOREIGN KEY (`firmware_id`)
    REFERENCES `firmware` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;