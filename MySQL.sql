-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: e_form_database
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `approval_steps`
--

DROP TABLE IF EXISTS `approval_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_steps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `step_order` int NOT NULL,
  `assigned_approver_id` int NOT NULL,
  `role_name_at_step` varchar(255) DEFAULT NULL,
  `combined_roles` json DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','NEED_REVISION','APPROVED','REJECTED') DEFAULT 'PENDING',
  `updated_at` datetime DEFAULT NULL,
  `reject_reason` text,
  `role_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  KEY `assigned_approver_id` (`assigned_approver_id`),
  KEY `fk_steps_role` (`role_id`),
  CONSTRAINT `approval_steps_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `approval_steps_ibfk_2` FOREIGN KEY (`assigned_approver_id`) REFERENCES `approvers` (`id`),
  CONSTRAINT `fk_steps_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_steps`
--

LOCK TABLES `approval_steps` WRITE;
/*!40000 ALTER TABLE `approval_steps` DISABLE KEYS */;
INSERT INTO `approval_steps` VALUES (56,12,1,1,NULL,NULL,'APPROVED','2026-03-02 13:19:10',NULL,1),(57,12,2,3,NULL,NULL,'APPROVED','2026-03-02 13:24:29',NULL,3),(58,12,3,18,NULL,NULL,'APPROVED','2026-03-05 14:45:12',NULL,4),(59,12,4,22,NULL,NULL,'PENDING',NULL,NULL,9),(60,12,5,20,NULL,NULL,'PENDING',NULL,NULL,6),(61,12,6,21,NULL,NULL,'PENDING',NULL,NULL,8),(62,12,7,19,NULL,NULL,'PENDING',NULL,NULL,5),(63,13,1,1,NULL,NULL,'APPROVED','2026-03-02 13:19:25',NULL,1),(64,13,2,3,NULL,NULL,'APPROVED','2026-03-02 13:24:32',NULL,3),(65,13,3,18,NULL,NULL,'APPROVED','2026-03-05 14:45:16',NULL,4),(66,13,4,22,NULL,NULL,'PENDING',NULL,NULL,9),(67,13,5,20,NULL,NULL,'PENDING',NULL,NULL,6),(68,13,6,21,NULL,NULL,'PENDING',NULL,NULL,8),(69,13,7,19,NULL,NULL,'PENDING',NULL,NULL,5),(70,14,1,1,NULL,NULL,'REJECTED','2026-03-05 14:07:55','สาขาไม่ตรงในระบบ',1),(71,14,2,3,NULL,NULL,'PENDING',NULL,NULL,3),(72,14,3,18,NULL,NULL,'PENDING',NULL,NULL,4),(73,14,4,22,NULL,NULL,'PENDING',NULL,NULL,9),(74,14,5,20,NULL,NULL,'PENDING',NULL,NULL,6),(75,14,6,21,NULL,NULL,'PENDING',NULL,NULL,8),(76,14,7,19,NULL,NULL,'PENDING',NULL,NULL,5),(77,15,1,1,NULL,NULL,'APPROVED','2026-03-05 14:07:33',NULL,1),(78,15,2,3,NULL,NULL,'APPROVED','2026-03-05 14:10:09',NULL,3),(79,15,3,18,NULL,NULL,'APPROVED','2026-03-05 14:12:23',NULL,4),(80,15,4,22,NULL,NULL,'APPROVED','2026-03-05 14:13:06',NULL,9),(81,15,5,20,NULL,NULL,'APPROVED','2026-03-05 14:14:37',NULL,6),(82,15,6,21,NULL,NULL,'APPROVED','2026-03-05 14:23:00',NULL,8),(83,15,7,19,NULL,NULL,'APPROVED','2026-03-05 14:24:04',NULL,5),(84,16,1,1,NULL,NULL,'APPROVED','2026-03-05 14:41:43',NULL,1),(85,16,2,1,NULL,NULL,'APPROVED','2026-03-05 14:42:49',NULL,2),(86,16,3,16,NULL,NULL,'APPROVED','2026-03-05 14:44:08',NULL,11),(87,16,4,3,NULL,NULL,'APPROVED','2026-03-05 14:47:12',NULL,3),(88,17,1,1,NULL,NULL,'APPROVED','2026-03-05 14:41:55',NULL,1),(89,17,2,16,NULL,NULL,'APPROVED','2026-03-05 14:44:15',NULL,11),(90,17,3,3,NULL,NULL,'APPROVED','2026-03-05 14:47:15',NULL,3),(91,17,4,16,NULL,NULL,'PENDING',NULL,NULL,11),(92,17,5,18,NULL,NULL,'PENDING',NULL,NULL,4),(93,17,6,21,NULL,NULL,'PENDING',NULL,NULL,8),(94,17,7,20,NULL,NULL,'PENDING',NULL,NULL,6),(95,17,8,15,NULL,NULL,'PENDING',NULL,NULL,10),(99,19,1,1,NULL,NULL,'APPROVED','2026-03-05 14:42:54',NULL,1),(100,19,2,3,NULL,NULL,'APPROVED','2026-03-05 14:43:35',NULL,3),(101,19,3,18,NULL,NULL,'APPROVED','2026-03-05 14:45:20',NULL,4),(102,19,4,7,NULL,NULL,'APPROVED','2026-03-05 14:45:53',NULL,7),(103,19,5,20,NULL,NULL,'APPROVED','2026-03-05 14:46:26',NULL,6),(104,19,6,19,NULL,NULL,'APPROVED','2026-03-05 14:46:45',NULL,5);
/*!40000 ALTER TABLE `approval_steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approver_roles`
--

DROP TABLE IF EXISTS `approver_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approver_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `approver_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `approver_id` (`approver_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `approver_roles_ibfk_1` FOREIGN KEY (`approver_id`) REFERENCES `approvers` (`id`),
  CONSTRAINT `approver_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approver_roles`
--

LOCK TABLES `approver_roles` WRITE;
/*!40000 ALTER TABLE `approver_roles` DISABLE KEYS */;
INSERT INTO `approver_roles` VALUES (1,1,1),(2,1,2),(3,2,1),(4,3,3),(5,4,1),(6,5,1),(7,6,1),(8,7,7),(9,15,10),(10,16,11),(11,17,3),(12,18,4),(13,19,5),(14,20,6),(15,21,8),(16,22,9),(17,23,2);
/*!40000 ALTER TABLE `approver_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approvers`
--

DROP TABLE IF EXISTS `approvers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approvers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `approver_prefix` varchar(45) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `approver_tel` varchar(15) DEFAULT NULL,
  `approver_signature` mediumblob,
  `is_active` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `approvers_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvers`
--

LOCK TABLES `approvers` WRITE;
/*!40000 ALTER TABLE `approvers` DISABLE KEYS */;
INSERT INTO `approvers` VALUES (1,'ผศ.ดร','ต้องใจ แย้มผกา','tongjai','123456','tongjai@example.com',11,'0812345678',NULL,1),(2,'อ.','รัฐ บุรีรัตน์','rat','123456','rat@example.com',11,'0812345679',NULL,1),(3,'อ.','สุธีรา วงศ์อนันทรัพย์','sutira','123456','sutira@example.com',11,'0812345680',NULL,1),(4,'ผศ.','อรวรรณ ชุณหปราณ','orawan','123456','orawan@example.com',11,'0812345681',NULL,1),(5,'ผศ.','ดวงใจ หนูเล็ก','duangjai','123456','duangjai@example.com',11,'0812345682',NULL,1),(6,'อ.','ปรินดา ลาภเจริญวงศ์','parinda','123456','parinda@example.com',11,'0812345683',NULL,1),(7,'ผศ.ดร.','พิชัย จอดพิมาย','pichai','123456','pichai@example.com',11,'0812345684',NULL,1),(15,'อาจารย์','พิสิทธิ์ชัย จิราธนศัดดิ์','Q','123456','Phisitchai@rmutto.ac.th',11,'0923856784',NULL,1),(16,'นาย','กรรเชียง ท่าไม้','kancheng','123456','Kancheng@rmutto.ac.th',1,'0842384562',NULL,1),(17,'ดร.','ก้อง ร.คณบดี','kong','kong','kong@rmutto.ac.th',NULL,'0975423877',NULL,1),(18,'ดร','กรรไชย คณบดี','kanchai','kan','Kanchai@rmutto.ac.th',NULL,'0964583258',NULL,1),(19,'นาย','กรรศร หน.งานทะเบียน','kansorn','kan','Kansorn@rmutto.ac.th',NULL,'0874539677',NULL,1),(20,'นาง','กัลยา จทน.งานทะเบียน','kallaya','kall','Kallaya@rmutto.ac.th',NULL,'0953587862',NULL,1),(21,'นาย','พิกุลแก้ว ท่าไม่','pikul','pikul','PikulKeaw@rmutto.ac.th',NULL,'0876352419',NULL,1),(22,'นาง','บรรณ เลง','Ban','Ban','BanLeng@rmutto.ac.th',NULL,'0856345889',NULL,1),(23,'ผศ.','วีริยา สุภาณิชย์','wiriya','123','wiriya@rmutto.ac.th',7,'089145625',NULL,1);
/*!40000 ALTER TABLE `approvers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'งานทะเบียน','คำร้องเกี่ยวกับสถานภาพนักศึกษา',1,'2026-02-18 20:48:00','2026-02-18 20:48:00'),(2,'การลงทะเบียน','คำร้องเกี่ยวกับรายวิชาและหน่วยกิต',1,'2026-02-18 20:48:00','2026-02-18 20:48:00');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_name` varchar(255) NOT NULL,
  `faculty_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `departments_ibfk_2` (`faculty_id`),
  CONSTRAINT `departments_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'สาขาเทคโนโลยีสื่อดิจิทัล - การจัดการธุรกิจดิจิทัล',2),(2,'สาขาการจัดการ',2),(3,'สาขาการจัดการโลจิสติกส์และซัพพลายเชน',2),(4,'สาขาการตลาด',2),(5,'สาขาการบัญชี',2),(6,'สาขาเทคโนโลยีสารสนเทศ',2),(7,'สาขาเทคโนโลยีสื่อดิจิทัล-ดิจิทัลมีเดียและแอนิเมชั่น',2),(8,'สาขาเทคโนโลยีสื่อสารมวลชน',2),(9,'สาขาบัญชีบัณฑิต',2),(10,'สาขาระบบสารสนเทศ',2),(11,'สาขาวิทยาการคอมพิวเตอร์',2),(12,'สาขาเศรษฐศาสตร์',2),(13,'สาขาการท่องเที่ยว',1),(14,'สาขาการโรงแรม',1),(15,'สาขาภาษาอังกฤษเพื่อการสื่อสารสากล',1);
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty`
--

DROP TABLE IF EXISTS `faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty`
--

LOCK TABLES `faculty` WRITE;
/*!40000 ALTER TABLE `faculty` DISABLE KEYS */;
INSERT INTO `faculty` VALUES (1,'คณะศิลปศาสตร์'),(2,'คณะบริหารธุรกิจและเทคโนโลยีสารสนเทศ');
/*!40000 ALTER TABLE `faculty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `form_workflows`
--

DROP TABLE IF EXISTS `form_workflows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_workflows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `form_id` int NOT NULL,
  `step_order` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_flow_role` (`role_id`),
  CONSTRAINT `fk_flow_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='ตารางนี้ใช้กำหนดลำดับขั้นตอน (Workflow Pipeline) ของการอนุมัติคำร้องในระบบ โดยอ้างอิงตามประเภทคำร้อง (form_id) ซึ่งจะเรียงลำดับการตรวจสอบจากน้อยไปมากตามคอลัมน์ step_order เพื่อระบุว่าในแต่ละลำดับชั้น ผู้ที่มีสิทธิ์จัดการตามตำแหน่งหรือบทบาท (role_id) ใดจะต้องเป็นผู้พิจารณาคำร้องนั้นก่อนจะส่งต่อไปยังขั้นตอนถัดไป จนกว่าจะครบถ้วนตามลำดับที่กำหนดไว้ จึงจะถือว่ากระบวนการอนุมัติสิ้นสุดสมบูรณ์';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_workflows`
--

LOCK TABLES `form_workflows` WRITE;
/*!40000 ALTER TABLE `form_workflows` DISABLE KEYS */;
INSERT INTO `form_workflows` VALUES (1,1,1,1),(2,1,2,2),(3,1,3,11),(4,1,4,3),(5,2,1,1),(6,2,2,11),(7,2,3,2),(8,2,4,11),(9,2,5,4),(10,2,6,6),(11,2,7,5),(18,4,1,1),(19,4,2,3),(20,4,3,4),(21,4,4,9),(22,4,5,6),(23,4,6,5),(24,5,1,1),(25,5,2,3),(26,5,3,4),(27,5,4,9),(28,5,5,6),(29,5,6,5),(30,6,1,1),(31,6,2,3),(32,6,3,4),(33,6,4,7),(34,6,5,6),(35,6,6,5),(36,7,1,10),(37,8,1,1),(38,8,2,11),(39,8,3,3),(40,8,4,11),(41,8,5,4),(42,8,6,10),(43,9,1,1),(44,9,2,11),(45,9,3,3),(46,9,4,11),(47,9,5,4),(48,9,6,10),(49,10,1,1),(50,10,2,10),(51,11,1,1),(52,11,2,11),(53,11,3,3),(54,11,4,11),(55,11,5,4),(56,11,6,8),(57,11,7,6),(58,11,8,10),(59,3,1,1),(60,3,2,3),(61,3,3,4),(62,3,4,9),(63,3,5,6),(64,3,6,8),(65,3,7,5);
/*!40000 ALTER TABLE `form_workflows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forms`
--

DROP TABLE IF EXISTS `forms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_forms_category_id` (`category_id`),
  CONSTRAINT `fk_forms_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forms`
--

LOCK TABLES `forms` WRITE;
/*!40000 ALTER TABLE `forms` DISABLE KEYS */;
INSERT INTO `forms` VALUES (1,1,'คำร้องทั่วไป','ใบคำร้องทั่วไป',1,'2026-02-18 20:51:16','2026-02-18 20:51:16'),(2,2,'เรียนเกินหน่วยกิต','ใบคำร้องขอลงทะเบียนเรียนเกินกว่าหน่วยกิตที่กำหนด',1,'2026-02-18 20:51:16','2026-02-18 20:51:16'),(3,2,'ลงทะเบียนเรียนล่าช้า','ใบคำร้องขอลงทะเบียนเรียนล่าช้า',1,'2026-02-23 12:19:34','2026-02-23 12:19:34'),(4,2,'ขอยกเลิกการลงทะเบียนเรียน','ใบคำร้องขอยกเลิกการลงทะเบียนเรียน',1,'2026-02-23 12:19:34','2026-02-23 12:19:34'),(5,2,'ขอยืนยันการลงทะเบียนเรียน','ใบคำร้องขอยืนยันการลงทะเบียนเรียน',1,'2026-02-23 12:19:34','2026-02-23 12:19:34'),(6,2,'ขอลงทะเบียนเรียนต่ำกว่าหน่วยกิตที่กำหนด','ใบคำร้องขอลงทะเบียนเรียนต่ำกว่าหน่วยกิตที่กำหนด',1,'2026-02-23 12:19:34','2026-02-23 12:19:34'),(7,2,'แบบคำขอเปลี่ยนกลุ่มเรียน','แบบคำขอเปลี่ยนกลุ่มเรียน',1,'2026-02-24 14:06:41','2026-02-24 14:06:41'),(8,2,'ใบคำร้องขอลงทะเบียนเรียนซ้ำ','ใบคำร้องขอลงทะเบียนเรียนซ้ำ',1,'2026-02-25 17:51:42','2026-02-25 17:51:42'),(9,2,'ใบคำร้องขอเปลี่ยนวิชาเลือก ','ใบคำร้องขอเปลี่ยนวิชาเลือก ',1,'2026-02-25 17:51:42','2026-02-25 17:51:42'),(10,2,'ใบคำร้องขอถอนรายวิชาโดยได้รับอักษร W ','ใบคำร้องขอถอนรายวิชาโดยได้รับอักษร W ',1,'2026-02-25 17:51:42','2026-02-25 17:51:42'),(11,2,'ใบคำร้องขอเพิ่ม – ถอนรายวิชาล่าช้า ','ใบคำร้องขอเพิ่ม – ถอนรายวิชาล่าช้า ',1,'2026-02-25 17:51:42','2026-02-25 17:51:42');
/*!40000 ALTER TABLE `forms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program_of_study`
--

DROP TABLE IF EXISTS `program_of_study`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program_of_study` (
  `id` int NOT NULL AUTO_INCREMENT,
  `program_name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `program_name` (`program_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program_of_study`
--

LOCK TABLES `program_of_study` WRITE;
/*!40000 ALTER TABLE `program_of_study` DISABLE KEYS */;
INSERT INTO `program_of_study` VALUES (1,'ภาคปกติ','หลักสูตรภาคปกติ'),(2,'ภาคสมทบ(จ-ศ)','หลักสูตรภาคสมทบ จันทร์–ศุกร์'),(3,'ภาคสมทบ(ส-อ)','หลักสูตรภาคสมทบ เสาร์–อาทิตย์');
/*!40000 ALTER TABLE `program_of_study` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'อ.ที่ปรึกษา'),(2,'หัวหน้าสาขา'),(3,'รองคณบดี'),(4,'คณบดี'),(5,'เจ้าหน้าที่งานทะเบียน'),(6,'หัวหน้างานทะเบียน'),(7,'อธิการบดี'),(8,'การเงิน'),(9,'ผู้อำนวยการสำนักส่งเสริมวิชาการ'),(10,'งานทะเบียน'),(11,'เจ้าหน้าที่สารบรรณ');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `role` varchar(45) DEFAULT NULL COMMENT 'ตำแหน่งที่จะมีในนี้\\n1.ผู้ดูแลระบบ(หัวหน้าผู้ดูแลระบบสามารถเพิ่ม admin,approverด้วยกันได้และ อนุมัติการสมัครสมาชิก)\\n2.ผู้ดูแลงานสารบัญ(ส่งเอกสารไปหาผู้ที่เกี่ยวข้อง)',
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'admin1','123456','สมชาย ใจดี','somchai.staff@example.com','2025-12-03 04:43:45',NULL),(2,'admin2','123456','สมหญิง แสนสวย','somying.staff@example.com','2025-12-03 04:43:45',NULL),(3,'admin3','123456','ณัฐพล สุขใจ','natpol.staff@example.com','2025-12-03 04:43:45',NULL);
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_payments`
--

DROP TABLE IF EXISTS `student_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `submission_id` int DEFAULT NULL COMMENT 'เชื่อมกับตารางใบคำร้อง',
  `description` varchar(255) NOT NULL,
  `amount_due` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT '0.00',
  `due_date` date DEFAULT NULL,
  `receipt_image_path` varchar(255) DEFAULT NULL COMMENT 'ที่อยู่ไฟล์สลิปโอนเงิน',
  `payment_status` enum('UNPAID','PARTIAL','PAID') GENERATED ALWAYS AS ((case when (`amount_paid` = 0) then _utf8mb4'UNPAID' when (`amount_paid` < `amount_due`) then _utf8mb4'PARTIAL' else _utf8mb4'PAID' end)) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_payment_student` (`student_id`),
  KEY `fk_payment_submission` (`submission_id`),
  CONSTRAINT `fk_payment_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payment_submission` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_payments`
--

LOCK TABLES `student_payments` WRITE;
/*!40000 ALTER TABLE `student_payments` DISABLE KEYS */;
INSERT INTO `student_payments` (`id`, `student_id`, `submission_id`, `description`, `amount_due`, `amount_paid`, `due_date`, `receipt_image_path`, `created_at`) VALUES (1,9,15,'ค่าลงทะเบียนเรียนล่าช้า และ ค่าหน่วยกิต (คำร้อง #15)',150.00,150.00,NULL,'/uploads/receipts/slip-1772695314296-687758170.png','2026-03-05 07:14:37');
/*!40000 ALTER TABLE `student_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(50) DEFAULT NULL,
  `department_id` int NOT NULL,
  `program_of_study` int DEFAULT NULL,
  `advisor_id` int DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address_no` varchar(50) DEFAULT NULL,
  `address_moo` varchar(50) DEFAULT NULL,
  `address_soi` varchar(100) DEFAULT NULL,
  `address_street` varchar(100) DEFAULT NULL,
  `address_subdistrict` varchar(100) DEFAULT NULL,
  `address_district` varchar(100) DEFAULT NULL,
  `address_province` varchar(100) DEFAULT NULL,
  `address_postcode` varchar(10) DEFAULT NULL,
  `status` enum('0','1','2') NOT NULL DEFAULT '0' COMMENT '0=รอพิจารณา, 1=อนุมัติการสมัครเรียบร้อย, 2=ปฏิเสธ',
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`),
  KEY `department_id` (`department_id`),
  KEY `fk_students_advisor` (`advisor_id`),
  KEY `fk_program_study` (`program_of_study`),
  CONSTRAINT `fk_program_study` FOREIGN KEY (`program_of_study`) REFERENCES `program_of_study` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_advisor` FOREIGN KEY (`advisor_id`) REFERENCES `approvers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'STU001','สมชาย ใจดี','123456',5,1,1,'somchai.Jaidee@example.com','12','5','ซอยสุขใจ','ถนนรามคำแหง','หัวหมาก','บางกะปิ','กรุงเทพฯ','10240','1'),(2,'STU002','สมหญิง แสนสวย','123456',3,1,3,'somying@example.com','34','2','ซอยร่มเย็น','ถนนลาดพร้าว','จันทรเกษม','จตุจักร','กรุงเทพฯ','10900','1'),(3,'STU003','จันทร์เพ็ญ กลิ่นหอม','123456',2,1,2,'janpen@example.com','56','7','ซอยสวนพลู','ถนนสาทร','ทุ่งมหาเมฆ','สาทร','กรุงเทพฯ','10120','1'),(4,'STU004','ณัฐพล สุขใจ','123456',8,2,6,'natpol@example.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),(5,'STU005','กมลรัตน์ แสงทอง','123456',5,2,4,'kamonrat@example.com','90','1','ซอยทองหล่อ','ถนนสุขุมวิท','คลองตันเหนือ','วัฒนา','กรุงเทพฯ','10110','0'),(7,'STU011','ทดสอบ ระบบ','123456',11,3,1,'test.sys@rmutto.ac.th','1','2','3','4','5','6','7','8','1'),(8,'STU012','อิค คิว_1','123456',7,1,1,'eiq@rmutto.ac.th','1','2','3','4','5','6','7','8','1'),(9,'026740461006-0','สิรายุส กาญจนโอฬารศิริ','123456',11,1,1,'sirayus.jok@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),(10,'026740461002-9','พิสิทธิ์ชัย จิราธนศัดดิ์','phi123',7,NULL,1,'Phisitchai@rmutto.ac.th','333','5','มังกร','เทพารักษ์','แพรกษา','เมือง','สมุทรปราการ','10280','1');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submission_action_logs`
--

DROP TABLE IF EXISTS `submission_action_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submission_action_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `approver_id` int NOT NULL,
  `action` enum('APPROVED','REJECTED','NEED_REVISION') NOT NULL,
  `action_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `note` text,
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  KEY `approver_id` (`approver_id`),
  CONSTRAINT `submission_action_logs_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `submission_action_logs_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `approvers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submission_action_logs`
--

LOCK TABLES `submission_action_logs` WRITE;
/*!40000 ALTER TABLE `submission_action_logs` DISABLE KEYS */;
INSERT INTO `submission_action_logs` VALUES (1,12,1,'NEED_REVISION','2026-03-01 03:58:07','บอกเหตุผลมาตอนนี้'),(2,12,1,'APPROVED','2026-03-02 13:19:10',NULL),(3,13,1,'APPROVED','2026-03-02 13:19:25',NULL),(4,12,3,'APPROVED','2026-03-02 13:24:29',NULL),(5,13,3,'APPROVED','2026-03-02 13:24:32',NULL),(6,15,1,'APPROVED','2026-03-05 14:07:33',NULL),(7,14,1,'REJECTED','2026-03-05 14:07:55','สาขาไม่ตรงในระบบ'),(8,15,3,'APPROVED','2026-03-05 14:10:09',NULL),(9,15,18,'APPROVED','2026-03-05 14:12:23',NULL),(10,15,22,'APPROVED','2026-03-05 14:13:06',NULL),(11,15,20,'APPROVED','2026-03-05 14:14:37',NULL),(12,15,21,'APPROVED','2026-03-05 14:23:00','การเงิน: ตรวจสอบหลักฐานการชำระเงินเรียบร้อยแล้ว ส่งต่อให้งานทะเบียน'),(13,15,19,'APPROVED','2026-03-05 14:24:04',NULL),(14,16,1,'APPROVED','2026-03-05 14:41:43',NULL),(15,17,1,'APPROVED','2026-03-05 14:41:55',NULL),(16,16,1,'APPROVED','2026-03-05 14:42:49',NULL),(17,19,1,'APPROVED','2026-03-05 14:42:54',NULL),(18,19,3,'APPROVED','2026-03-05 14:43:35',NULL),(19,16,16,'APPROVED','2026-03-05 14:44:08',NULL),(20,17,16,'APPROVED','2026-03-05 14:44:15',NULL),(21,12,18,'APPROVED','2026-03-05 14:45:12',NULL),(22,13,18,'APPROVED','2026-03-05 14:45:16',NULL),(23,19,18,'APPROVED','2026-03-05 14:45:20',NULL),(24,19,7,'APPROVED','2026-03-05 14:45:53',NULL),(25,19,20,'APPROVED','2026-03-05 14:46:26',NULL),(26,19,19,'APPROVED','2026-03-05 14:46:45',NULL),(27,16,3,'APPROVED','2026-03-05 14:47:12',NULL),(28,17,3,'APPROVED','2026-03-05 14:47:15',NULL);
/*!40000 ALTER TABLE `submission_action_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `form_id` int NOT NULL,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `submission_status` enum('PENDING','IN_PROGRESS','NEED_REVISION','APPROVED','REJECTED') DEFAULT 'PENDING',
  `form_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `submissions_ibfk_2_idx` (`form_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`form_id`) REFERENCES `form_workflows` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (12,1,3,'2026-03-01 03:57:29','IN_PROGRESS','{\"term\": \"1\", \"subject\": \"ขอลงทะเบียนเรียนล่าช้า\", \"courses_list\": [{\"id\": 1, \"credits\": \"3\", \"section\": \"3\", \"courseCode\": \"123\", \"courseName\": \"วิชาแพะ\"}, {\"id\": 2, \"credits\": \"3\", \"section\": \"2\", \"courseCode\": \"122\", \"courseName\": \"วิชาลิง\"}, {\"id\": 3, \"credits\": \"3\", \"section\": \"1\", \"courseCode\": \"121\", \"courseName\": \"วิชาเป็ด\"}], \"student_type\": \"ปกติ\", \"academic_year\": \"2569\", \"year_of_study\": \"1\", \"request_reason\": \"จะบอกภายในอนาคต\", \"total_credits_requested\": \"9\"}'),(13,1,3,'2026-03-02 13:14:47','IN_PROGRESS','{\"term\": \"1\", \"subject\": \"ขอลงทะเบียนเรียนล่าช้า\", \"courses_list\": [{\"id\": 1, \"credits\": \"3\", \"section\": \"1\", \"courseCode\": \"001\", \"courseName\": \"1\"}, {\"id\": 2, \"credits\": \"3\", \"section\": \"1\", \"courseCode\": \"002\", \"courseName\": \"2\"}], \"student_type\": \"ปกติ\", \"academic_year\": \"2569\", \"year_of_study\": \"3\", \"request_reason\": \"ระบบลงทะเบียนมีปัญหา\", \"total_credits_requested\": \"6\"}'),(14,10,3,'2026-03-05 14:01:14','REJECTED','{\"term\": \"2\", \"subject\": \"ขอลงทะเบียนเรียนล่าช้า\", \"courses_list\": [{\"id\": 1, \"credits\": \"3\", \"section\": \"1\", \"courseCode\": \"00-12-001\", \"courseName\": \"การพัฒนาบุคลิกภาพ\"}, {\"id\": 2, \"credits\": \"3\", \"section\": \"2\", \"courseCode\": \"04-13-318\", \"courseName\": \"การเป็นผู้ประกอบการดิจิทัล\"}, {\"id\": 3, \"credits\": \"3\", \"section\": \"3\", \"courseCode\": \"04-13-319\", \"courseName\": \"การบริหารโครงการธุรกิจดิจิทัล\"}], \"student_type\": \"ปกติ\", \"academic_year\": \"2569\", \"year_of_study\": \"4\", \"request_reason\": \"ติดภารกิจ\", \"total_credits_requested\": \"9\"}'),(15,9,3,'2026-03-05 14:06:55','APPROVED','{\"term\": \"2\", \"subject\": \"ขอลงทะเบียนเรียนล่าช้า\", \"courses_list\": [{\"id\": 1, \"credits\": \"3\", \"section\": \"1\", \"courseCode\": \"00-12-001\", \"courseName\": \"การพัฒนาบุคลิกภาพ\"}, {\"id\": 2, \"credits\": \"3\", \"section\": \"2\", \"courseCode\": \"04-13-316\", \"courseName\": \"การวิเคราะห์ข้อมูลเชิงธุรกิจ\"}], \"student_type\": \"ปกติ\", \"academic_year\": \"2569\", \"year_of_study\": \"4\", \"request_reason\": \"ติดภารกิจส่วนตัว\", \"total_credits_requested\": \"6\"}'),(16,10,1,'2026-03-05 14:27:36','APPROVED','{\"subject\": \"ขอใบรับรองการเป็นนักศึกษา\", \"request_reason\": \"ขอรับใบสมัครเพื่อยืนยันตัวไปทำงาน\"}'),(17,10,11,'2026-03-05 14:29:54','IN_PROGRESS','{\"phone\": \"\", \"reason\": \"เหตุผล\", \"address\": {\"no\": \"\", \"moo\": \"\", \"soi\": \"\", \"road\": \"\", \"village\": \"\", \"zipcode\": \"\", \"district\": \"\", \"province\": \"\", \"subdistrict\": \"\"}, \"semester\": \"1\", \"yearLevel\": \"4\", \"addCourses\": [{\"id\": 1772695677703, \"sec\": \"1\", \"code\": \"00-12-001\", \"name\": \"การพัฒนาบุคลิกภาพ\", \"credits\": \"3\"}], \"dropCourses\": [{\"id\": 1772695677704, \"sec\": \"1\", \"code\": \"04-13-318\", \"name\": \"การเป็นผู้ประกอปการดิจิทัล\", \"credits\": \"3\"}], \"requestType\": \"late_both\", \"studentType\": \"ปกติ\", \"academicYear\": \"2569\"}'),(19,10,6,'2026-03-05 14:33:58','APPROVED','{\"gpa\": \"2.2\", \"term\": \"1\", \"subject\": \"ขอลงทะเบียนเรียนต่ำกว่าหน่วยกิตที่กำหนด\", \"student_type\": \"ปกติ\", \"academic_year\": \"2659\", \"year_of_study\": \"4\", \"request_reason\": \"เป็นภาคการศึกษาสุดท้าย\", \"reason_category\": \"เป็นภาคการศึกษาสุดท้ายที่จะสำเร็จการศึกษาตามหลักสูตร\", \"other_reason_text\": \"\", \"accumulated_credits\": \"115\", \"past_underload_term\": \"\", \"past_underload_year\": \"\", \"past_underload_status\": \"ไม่เคยลงทะเบียนต่ำกว่าเกณฑ์\", \"total_credits_requested\": \"9\"}');
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES ('credit_cost','0','ราคาต่อหน่วยกิต'),('late_fee_per_day','50','ค่าปรับล่าช้าต่อวัน (ไม่รวมเสาร์-อาทิตย์)'),('late_reg_deadline','2026-03-02','วันสุดท้ายของการลงทะเบียนปกติ (YYYY-MM-DD)');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-06  5:02:18
