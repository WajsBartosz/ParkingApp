/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.22-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: parking-app
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `otp`
--

DROP TABLE IF EXISTS `otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `expires_at` timestamp NOT NULL,
  `password` varchar(256) NOT NULL DEFAULT '',
  `email` varchar(128) NOT NULL DEFAULT '',
  `used` tinyint NOT NULL DEFAULT (0),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp`
--

LOCK TABLES `otp` WRITE;
/*!40000 ALTER TABLE `otp` DISABLE KEYS */;
INSERT INTO `otp` VALUES (1,'2025-05-23 08:19:50','2025-05-23 10:24:50','$2b$12$QYdJOCtv3/jJpiibxYWJduIJgziCrTrdfEDvia6zaCKHZcTW2gRS6','bkazmierczak@edu.cdv.pl',1),(2,'2025-05-23 08:27:08','2025-05-23 10:32:09','$2b$12$VqO/sHtxPqn2IMyLxjF3zeqxQJlu/.KGsjMlIynQlgEC9dGXGscmy','bkazmierczak@edu.cdv.pl',1),(3,'2025-05-23 08:44:33','2025-05-23 10:49:33','$2b$12$ArKHd2PRDxo7omNypoR7P./1hfasEy3BleyNlc0xa26GhJLzQe47y','bkazmierczak@edu.cdv.pl',1),(4,'2025-05-23 08:47:26','2025-05-23 10:52:26','$2b$12$Q23Fe.SYMU3bGHrjLur.yu.40FPrevzEeMmjyHT0jVw32Kk/eeuXW','bkazmierczak@edu.cdv.pl',0),(5,'2025-05-23 08:48:16','2025-05-23 10:53:16','$2b$12$nBvV/J.bJDB5D.wkhGZYy.pgfE/Ah4kz5f8w/2i2c3jTJV9IzocuK','bkazmierczak@edu.cdv.pl',0),(6,'2025-05-23 08:49:08','2025-05-23 10:54:08','$2b$12$ZWDZ/Z.IJiyVdjwPLhHiUe6CThPsDROVgptbChdbtdioHa0cm5cVm','bkazmierczak@edu.cdv.pl',0),(7,'2025-05-23 08:50:52','2025-05-23 10:55:53','$2b$12$iwgy8sgHlGw2g8BEekdkceyD1SeTjZjGSjrXQTE.HrD93amRxjlqG','bkazmierczak@edu.cdv.pl',0),(8,'2025-05-23 08:51:38','2025-05-23 10:56:38','$2b$12$yWenY4X069/UeaM7xSsnr.HleMblS7X69e2W0Ppp5M0CbkMcrOU9u','bkazmierczak@edu.cdv.pl',0),(9,'2025-05-23 08:51:41','2025-05-23 10:56:42','$2b$12$iXf3V3.sOXanZqNwa6YRo.MPbAjzriUg3HbFEQEdFK1A6E9f6pMNS','bkazmierczak@edu.cdv.pl',0),(10,'2025-05-23 08:51:59','2025-05-23 10:56:59','$2b$12$DPfBWY3tK5tl1G5kBYRiQ.A4GHn7N3ElhYpcU9f8BqfZc2i5YW5DK','bkazmierczak@edu.cdv.pl',0),(11,'2025-05-23 08:52:03','2025-05-23 10:57:03','$2b$12$EQ/3gLDbTmxu.XEl6el5PehEvdwcfbN0NPmbjSIkuYFoOVLqZHLu.','bkazmierczak@edu.cdv.pl',0),(12,'2025-05-23 08:52:31','2025-05-23 10:57:31','$2b$12$oyc9RIqU7Sim3uAr6ShscO8jwqx9hbhySd1v9HXpqXbv/J2LtryTe','bkazmierczak@edu.cdv.pl',0),(13,'2025-05-23 08:52:36','2025-05-23 10:57:36','$2b$12$oEnhLzfBW.3IX9mmmpymcukh/aXG1dAw2sDuORGjQceWwwoOIqvBe','bkazmierczak@edu.cdv.pl',0),(14,'2025-05-23 08:52:51','2025-05-23 10:57:52','$2b$12$EY4X1L1aXUNWC6.PsAIpsOIYlTdgz8gCBYoYqaXZ/hm9xLTXaz8NK','bkazmierczak@edu.cdv.pl',0),(15,'2025-05-23 09:16:53','2025-05-23 11:21:54','$2b$12$i0VxO.L4KjxiMVlnyP77o.ECA/0QJOk8qe8V1PJSZBsUoLAB4hFYe','bkazmierczak@edu.cdv.pl',1),(16,'2025-05-23 09:20:52','2025-05-23 11:25:53','$2b$12$jvDfiEs4vtkY4kDdSxuMZekADO6NY402lr.c42hCMqOuh7YXjb0jO','bkazmierczak@edu.cdv.pl',1),(17,'2025-05-23 10:32:18','2025-05-23 12:37:19','$2b$12$608b0.1MR6Dfv982te0MJ.3DnySJ1D6Sv0/YjhbfN.Bg8ansYIyo2','bkazmierczak@edu.cdv.pl',1),(18,'2025-05-23 13:39:00','2025-05-23 15:44:00','$2b$12$QisyWUjmC/8NCH2z3jGsQOMD7lXcb24O7vBHX5jtkWmSkK3SiANVK','bkazmierczak@edu.cdv.pl',0),(19,'2025-05-23 13:39:15','2025-05-23 15:44:16','$2b$12$V8Dc3nBuFMuSyLTtOeqlregTrgOXQtv1UsBkNWbBPGe50GPBVH9qW','bkazmierczak@edu.cdv.pl',0),(20,'2025-05-23 13:40:36','2025-05-23 15:45:36','$2b$12$XNZdx7WXJH6xv4tddnR8NeLOUZEIIbFrAFu3lkit.bmXgUmOxJKxO','bkazmierczak@edu.cdv.pl',0),(21,'2025-05-23 13:40:44','2025-05-23 15:45:44','$2b$12$x05EBgdtDbRnbjFUR44FneeqfVP/x3zOTd6GW94wx5bLnCh0Xvjjq','bkazmierczak@edu.cdv.pl',1);
/*!40000 ALTER TABLE `otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parking-spaces`
--

DROP TABLE IF EXISTS `parking-spaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `parking-spaces` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `parking-space` varchar(20) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `parking_spaces_unique` (`parking-space`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parking-spaces`
--

LOCK TABLES `parking-spaces` WRITE;
/*!40000 ALTER TABLE `parking-spaces` DISABLE KEYS */;
INSERT INTO `parking-spaces` VALUES (1,'A1'),(10,'A10'),(2,'A2'),(3,'A3'),(4,'A4'),(5,'A5'),(6,'A6'),(7,'A7'),(8,'A8'),(9,'A9');
/*!40000 ALTER TABLE `parking-spaces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `start` timestamp NOT NULL,
  `end` timestamp NOT NULL,
  `parking-space` varchar(20) DEFAULT NULL,
  `confirmed-reservation` tinyint(1) DEFAULT '0',
  `email` varchar(128) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `parking-space` (`parking-space`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`parking-space`) REFERENCES `parking-spaces` (`parking-space`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES (1,'2025-05-23 12:13:22','2025-05-23 12:43:22','A1',0,'bkazmierczak@edu.cdv.pl'),(2,'2025-05-23 12:25:11','2025-05-23 14:25:17','A3',0,'test@edu.cdv.pl'),(4,'2025-05-23 14:50:41','2025-05-23 17:50:44','A8',1,'test@test.test');
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-23 15:47:02
