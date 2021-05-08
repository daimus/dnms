-- ----------------------------
-- Table structure for devices
-- ----------------------------
DROP TABLE IF EXISTS `devices`;
CREATE TABLE `devices` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `serverId` int DEFAULT NULL,
  `name` varchar(32) DEFAULT NULL,
  `comment` varchar(128) DEFAULT NULL,
  `connectTo` varchar(64) DEFAULT '',
  `snmpCommunity` varchar(16) DEFAULT 'public',
  `connectedTo` int DEFAULT '0',
  `os` enum('routeros','airos','other') DEFAULT NULL,
  `wireless` tinyint(1) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT '1',
  `visible` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `extras`;
CREATE TABLE `extras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ----------------------------
-- Records of extras
-- ----------------------------
BEGIN;
INSERT INTO `extras` VALUES (1, 'radarTelegramReport', '1', NULL, '2021-05-08 15:31:21');
COMMIT;

-- ----------------------------
-- Table structure for servers
-- ----------------------------
DROP TABLE IF EXISTS `servers`;
CREATE TABLE `servers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) DEFAULT NULL,
  `comment` varchar(128) DEFAULT NULL,
  `connectTo` varchar(64) DEFAULT NULL,
  `apiPort` int DEFAULT '8728',
  `username` varchar(16) DEFAULT NULL,
  `password` varchar(64) DEFAULT NULL,
  `winboxPort` int DEFAULT '8291',
  `singleCredential` tinyint(1) DEFAULT '1',
  `snmpCommunity` varchar(16) DEFAULT NULL,
  `mainInterface` varchar(16) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `sid` varchar(255) NOT NULL,
  `session` text NOT NULL,
  `expires` int DEFAULT NULL,
  PRIMARY KEY (`sid`)
);

-- ----------------------------
-- Table structure for subnetworks
-- ----------------------------
DROP TABLE IF EXISTS `subnetworks`;
CREATE TABLE `subnetworks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `serverId` int DEFAULT NULL,
  `name` varchar(32) DEFAULT NULL,
  `deviceId` text,
  `enabled` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) DEFAULT NULL,
  `username` varchar(64) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
);

-- ----------------------------
-- Records of users
-- ----------------------------
BEGIN;
INSERT INTO `users` VALUES (1, 'Daimus Suudi', 'admin', '$2b$10$mtrIX7U61PS1.VaiTbLcbeBt1HwLAJafHom/DViHR3y7nmHymyp3e', NULL, '2021-05-09 00:58:24');
COMMIT;
