-- PropAlign MySQL Schema
-- Run this against your MySQL/MariaDB database before starting the app.

CREATE TABLE IF NOT EXISTS `Property` (
  `id`           VARCHAR(191)  NOT NULL,
  `title`        VARCHAR(191)  NOT NULL,
  `description`  TEXT          NOT NULL,
  `price`        DOUBLE        NOT NULL,
  `location`     VARCHAR(191)  NOT NULL,
  `propertyType` VARCHAR(191)  NOT NULL,
  `bedrooms`     INT           NOT NULL,
  `bathrooms`    INT           NOT NULL,
  `lat`          DOUBLE        NOT NULL,
  `lng`          DOUBLE        NOT NULL,
  `features`     TEXT          NOT NULL,
  `imageUrl`     VARCHAR(191)  NULL,
  `isForRent`    TINYINT(1)    NOT NULL DEFAULT 1,
  `createdAt`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3)   NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `Property_location_idx` (`location`),
  INDEX `Property_price_idx` (`price`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- -------------------------------------------------------
-- Seed data — 4 sample properties (safe to re-run with INSERT IGNORE)
-- -------------------------------------------------------

INSERT IGNORE INTO `Property`
  (`id`, `title`, `description`, `price`, `location`, `propertyType`,
   `bedrooms`, `bathrooms`, `lat`, `lng`, `features`, `imageUrl`, `isForRent`, `createdAt`, `updatedAt`)
VALUES
  ('clprop0001000000', 'Modern Apartment in Sandton',
   'A luxury 2-bedroom apartment with a view of the skyline.',
   15000, 'Sandton', 'Apartment', 2, 2, -26.1076, 28.0567,
   '["Security","Gym","Pool"]',
   'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
   1, NOW(), NOW()),

  ('clprop0002000000', 'Cozy Garden Cottage in Melville',
   'Quiet garden cottage perfect for students or young professionals.',
   6500, 'Melville', 'Cottage', 1, 1, -26.1751, 28.0055,
   '["Garden","Quiet","Safe"]',
   'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
   1, NOW(), NOW()),

  ('clprop0003000000', 'Family Home in Rosebank',
   'Spacious 4-bedroom house with a large backyard and electric fence.',
   25000, 'Rosebank', 'House', 4, 3, -26.1455, 28.0433,
   '["Security","Garden","Garage"]',
   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
   1, NOW(), NOW()),

  ('clprop0004000000', 'Studio in Cape Town CBD',
   'Compact studio near all transport routes and nightlife.',
   12000, 'Cape Town', 'Studio', 1, 1, -33.9249, 18.4241,
   '["Nightlife","Central","Transport"]',
   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
   1, NOW(), NOW());
