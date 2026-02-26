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
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_steps`
--

LOCK TABLES `approval_steps` WRITE;
/*!40000 ALTER TABLE `approval_steps` DISABLE KEYS */;
INSERT INTO `approval_steps` VALUES (1,1,1,1,NULL,NULL,'PENDING',NULL,NULL,1),(2,1,2,16,NULL,NULL,'PENDING',NULL,NULL,11),(3,1,3,3,NULL,NULL,'PENDING',NULL,NULL,3),(4,1,4,16,NULL,NULL,'PENDING',NULL,NULL,11),(5,1,5,18,NULL,NULL,'PENDING',NULL,NULL,4),(6,1,6,15,NULL,NULL,'PENDING',NULL,NULL,10),(7,2,1,1,NULL,NULL,'PENDING',NULL,NULL,1),(8,2,2,16,NULL,NULL,'PENDING',NULL,NULL,11),(9,2,3,3,NULL,NULL,'PENDING',NULL,NULL,3),(10,2,4,16,NULL,NULL,'PENDING',NULL,NULL,11),(11,2,5,18,NULL,NULL,'PENDING',NULL,NULL,4),(12,2,6,15,NULL,NULL,'PENDING',NULL,NULL,10),(17,5,1,1,NULL,NULL,'PENDING',NULL,NULL,1),(18,5,2,15,NULL,NULL,'PENDING',NULL,NULL,10),(29,8,1,1,NULL,NULL,'PENDING',NULL,NULL,1),(30,8,2,16,NULL,NULL,'PENDING',NULL,NULL,11),(31,8,3,3,NULL,NULL,'PENDING',NULL,NULL,3),(32,8,4,16,NULL,NULL,'PENDING',NULL,NULL,11),(33,8,5,18,NULL,NULL,'PENDING',NULL,NULL,4),(34,8,6,21,NULL,NULL,'PENDING',NULL,NULL,8),(35,8,7,20,NULL,NULL,'PENDING',NULL,NULL,6),(36,8,8,15,NULL,NULL,'PENDING',NULL,NULL,10),(37,9,1,1,NULL,NULL,'PENDING',NULL,NULL,1),(38,9,2,16,NULL,NULL,'PENDING',NULL,NULL,11),(39,9,3,3,NULL,NULL,'PENDING',NULL,NULL,3),(40,9,4,16,NULL,NULL,'PENDING',NULL,NULL,11),(41,9,5,18,NULL,NULL,'PENDING',NULL,NULL,4),(42,9,6,21,NULL,NULL,'PENDING',NULL,NULL,8),(43,9,7,20,NULL,NULL,'PENDING',NULL,NULL,6),(44,9,8,15,NULL,NULL,'PENDING',NULL,NULL,10),(45,10,1,1,NULL,NULL,'PENDING',NULL,NULL,1),(46,10,2,16,NULL,NULL,'PENDING',NULL,NULL,11),(47,10,3,3,NULL,NULL,'PENDING',NULL,NULL,3),(48,10,4,16,NULL,NULL,'PENDING',NULL,NULL,11),(49,10,5,18,NULL,NULL,'PENDING',NULL,NULL,4),(50,10,6,21,NULL,NULL,'PENDING',NULL,NULL,8),(51,10,7,20,NULL,NULL,'PENDING',NULL,NULL,6),(52,10,8,15,NULL,NULL,'PENDING',NULL,NULL,10);
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approver_roles`
--

LOCK TABLES `approver_roles` WRITE;
/*!40000 ALTER TABLE `approver_roles` DISABLE KEYS */;
INSERT INTO `approver_roles` VALUES (1,1,1),(2,1,2),(3,2,1),(4,3,3),(5,4,1),(6,5,1),(7,6,1),(8,7,1),(9,15,10),(10,16,11),(11,17,3),(12,18,4),(13,19,5),(14,20,6),(15,21,8);
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvers`
--

LOCK TABLES `approvers` WRITE;
/*!40000 ALTER TABLE `approvers` DISABLE KEYS */;
INSERT INTO `approvers` VALUES (1,'ผศ.ดร','ต้องใจ แย้มผกา','tongjai','123456','tongjai@example.com',11,'0812345678',NULL,1),(2,'อ.','รัฐ บุรีรัตน์','rat','123456','rat@example.com',11,'0812345679',NULL,1),(3,'อ.','สุธีรา วงศ์อนันทรัพย์','sutira','123456','sutira@example.com',11,'0812345680',NULL,1),(4,'ผศ.','อรวรรณ ชุณหปราณ','orawan','123456','orawan@example.com',11,'0812345681',NULL,1),(5,'ผศ.','ดวงใจ หนูเล็ก','duangjai','123456','duangjai@example.com',11,'0812345682',NULL,1),(6,'อ.','ปรินดา ลาภเจริญวงศ์','parinda','123456','parinda@example.com',11,'0812345683',NULL,1),(7,'ผศ.ดร.','พิชัย จอดพิมาย','pichai','123456','pichai@example.com',11,'0812345684',NULL,1),(15,'อาจารย์','พิสิทธิ์ชัย จิราธนศัดดิ์','Q','123456','Phisitchai@rmutto.ac.th',11,'0923856784',NULL,1),(16,'นาย','กรรเชียง ท่าไม้','kancheng','123456','Kancheng@rmutto.ac.th',1,'0842384562',NULL,1),(17,'ดร.','ก้อง ร.คณบดี','kong','kong','kong@rmutto.ac.th',NULL,'0975423877',NULL,1),(18,'ดร','กรรไชย คณบดี','kanchai','kan','Kanchai@rmutto.ac.th',NULL,'0964583258',NULL,1),(19,'นาย','กรรศร หน.งานทะเบียน','kansorn','kan','Kansorn@rmutto.ac.th',NULL,'0874539677',NULL,1),(20,'นาง','กัลยา จทน.งานทะเบียน','kallaya','kall','Kallaya@rmutto.ac.th',NULL,'0953587862',NULL,1),(21,'นาย','พิกุลแก้ว ท่าไม่','pikul','pikul','PikulKeaw@rmutto.ac.th',NULL,'0876352419',NULL,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='ตารางนี้ใช้กำหนดลำดับขั้นตอน (Workflow Pipeline) ของการอนุมัติคำร้องในระบบ โดยอ้างอิงตามประเภทคำร้อง (form_id) ซึ่งจะเรียงลำดับการตรวจสอบจากน้อยไปมากตามคอลัมน์ step_order เพื่อระบุว่าในแต่ละลำดับชั้น ผู้ที่มีสิทธิ์จัดการตามตำแหน่งหรือบทบาท (role_id) ใดจะต้องเป็นผู้พิจารณาคำร้องนั้นก่อนจะส่งต่อไปยังขั้นตอนถัดไป จนกว่าจะครบถ้วนตามลำดับที่กำหนดไว้ จึงจะถือว่ากระบวนการอนุมัติสิ้นสุดสมบูรณ์';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_workflows`
--

LOCK TABLES `form_workflows` WRITE;
/*!40000 ALTER TABLE `form_workflows` DISABLE KEYS */;
INSERT INTO `form_workflows` VALUES (1,1,1,1),(2,1,2,2),(3,1,3,11),(4,1,4,3),(5,2,1,1),(6,2,2,11),(7,2,3,2),(8,2,4,11),(9,2,5,4),(10,2,6,6),(11,2,7,5),(12,3,1,1),(13,3,2,3),(14,3,3,4),(15,3,4,9),(16,3,5,6),(17,3,6,5),(18,4,1,1),(19,4,2,3),(20,4,3,4),(21,4,4,9),(22,4,5,6),(23,4,6,5),(24,5,1,1),(25,5,2,3),(26,5,3,4),(27,5,4,9),(28,5,5,6),(29,5,6,5),(30,6,1,1),(31,6,2,3),(32,6,3,4),(33,6,4,7),(34,6,5,6),(35,6,6,5),(36,7,1,10),(37,8,1,1),(38,8,2,11),(39,8,3,3),(40,8,4,11),(41,8,5,4),(42,8,6,10),(43,9,1,1),(44,9,2,11),(45,9,3,3),(46,9,4,11),(47,9,5,4),(48,9,6,10),(49,10,1,1),(50,10,2,10),(51,11,1,1),(52,11,2,11),(53,11,3,3),(54,11,4,11),(55,11,5,4),(56,11,6,8),(57,11,7,6),(58,11,8,10);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_payments`
--

LOCK TABLES `student_payments` WRITE;
/*!40000 ALTER TABLE `student_payments` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'STU001','สมชาย ใจดี','123456',5,1,1,'somchai.Jaidee@example.com','12','5','ซอยสุขใจ','ถนนรามคำแหง','หัวหมาก','บางกะปิ','กรุงเทพฯ','10240','1'),(2,'STU002','สมหญิง แสนสวย','123456',3,1,3,'somying@example.com','34','2','ซอยร่มเย็น','ถนนลาดพร้าว','จันทรเกษม','จตุจักร','กรุงเทพฯ','10900','1'),(3,'STU003','จันทร์เพ็ญ กลิ่นหอม','123456',2,1,2,'janpen@example.com','56','7','ซอยสวนพลู','ถนนสาทร','ทุ่งมหาเมฆ','สาทร','กรุงเทพฯ','10120','1'),(4,'STU004','ณัฐพล สุขใจ','123456',8,2,6,'natpol@example.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),(5,'STU005','กมลรัตน์ แสงทอง','123456',5,2,4,'kamonrat@example.com','90','1','ซอยทองหล่อ','ถนนสุขุมวิท','คลองตันเหนือ','วัฒนา','กรุงเทพฯ','10110','0'),(7,'STU011','ทดสอบ ระบบ','123456',11,3,1,'test.sys@rmutto.ac.th','1','2','3','4','5','6','7','8','1'),(8,'STU012','อิค คิว_1','123456',7,1,1,'eiq@rmutto.ac.th','1','2','3','4','5','6','7','8','1'),(9,'026740461006-0','สิรายุส กาญจนโอฬารศิริ','123456',11,1,1,'sirayus.jok@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submission_action_logs`
--

LOCK TABLES `submission_action_logs` WRITE;
/*!40000 ALTER TABLE `submission_action_logs` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,1,8,'2026-02-26 01:11:26','PENDING','{\"gpa\": \"1.75\", \"courses\": [{\"id\": 1, \"code\": \"0785-6\", \"nameEn\": \"Dog\", \"nameTh\": \"หมา\", \"credits\": \"3\", \"oldYear\": \"2568\", \"section\": \"2\", \"oldGrade\": \"D\", \"oldSemester\": \"1\"}], \"semester\": \"ฤดูร้อน\", \"programYear\": \"2567\", \"academicYear\": \"2569\"}'),(2,1,9,'2026-02-26 01:38:03','PENDING','{\"gpa\": \"1.75\", \"major\": \"\", \"minor\": \"\", \"changes\": [{\"id\": 1, \"newCode\": \"0692\", \"newName\": \"แมว\", \"newYear\": \"\", \"oldCode\": \"0691\", \"oldName\": \"หมา\", \"oldYear\": \"\", \"oldGrade\": \"C+\", \"newCredits\": \"3\", \"oldCredits\": \"3\", \"newSemester\": \"2/67\", \"oldSemester\": \"1/66\"}], \"faculty\": \"เกษตรศาสตร์ฯ\", \"semester\": \"1\", \"academicYear\": \"2569\", \"curriculumYear\": \"2567\"}'),(5,1,10,'2026-02-26 01:58:26','PENDING','{\"address\": {\"no\": \"\", \"moo\": \"\", \"soi\": \"\", \"tel\": \"0985340509\", \"road\": \"\", \"village\": \"\", \"zipcode\": \"\", \"district\": \"\", \"province\": \"\", \"subdistrict\": \"\"}, \"semester\": \"1\", \"yearLevel\": \"4\", \"studentType\": \"ปกติ\", \"withdrawals\": [{\"id\": 1772045860578, \"sec\": \"03\", \"code\": \"0693\", \"name\": \"dog&cat\", \"credits\": \"2\"}], \"academicYear\": \"2569\"}'),(8,1,11,'2026-02-26 02:10:27','PENDING','{\"phone\": \"\", \"reason\": \"\", \"address\": {\"no\": \"\", \"moo\": \"\", \"soi\": \"\", \"road\": \"\", \"village\": \"\", \"zipcode\": \"\", \"district\": \"\", \"province\": \"\", \"subdistrict\": \"\"}, \"semester\": \"1\", \"yearLevel\": \"0\", \"addCourses\": [{\"id\": 1772046475833, \"sec\": \"01\", \"code\": \"0691\", \"name\": \"dog\", \"credits\": \"3\"}], \"dropCourses\": [{\"id\": 1772046475834, \"sec\": \"\", \"code\": \"0691\", \"name\": \"dog\", \"credits\": \"2\"}], \"requestType\": \"late_add\", \"studentType\": \"ปกติ\", \"academicYear\": \"2569\"}'),(9,1,11,'2026-02-26 02:13:12','PENDING','{\"phone\": \"\", \"reason\": \"\", \"address\": {\"no\": \"\", \"moo\": \"\", \"soi\": \"\", \"road\": \"\", \"village\": \"\", \"zipcode\": \"\", \"district\": \"\", \"province\": \"\", \"subdistrict\": \"\"}, \"semester\": \"1\", \"yearLevel\": \"2\", \"addCourses\": [{\"id\": 1772046777623, \"sec\": \"\", \"code\": \"\", \"name\": \"\", \"credits\": \"\"}], \"dropCourses\": [{\"id\": 1772046777624, \"sec\": \"02\", \"code\": \"0692\", \"name\": \"Cat\", \"credits\": \"3\"}], \"requestType\": \"late_drop\", \"studentType\": \"ปกติ\", \"academicYear\": \"2569\"}'),(10,1,11,'2026-02-26 02:13:39','PENDING','{\"phone\": \"\", \"reason\": \"\", \"address\": {\"no\": \"\", \"moo\": \"\", \"soi\": \"\", \"road\": \"\", \"village\": \"\", \"zipcode\": \"\", \"district\": \"\", \"province\": \"\", \"subdistrict\": \"\"}, \"semester\": \"1\", \"yearLevel\": \"3\", \"addCourses\": [{\"id\": 1772046793161, \"sec\": \"02\", \"code\": \"0691-1\", \"name\": \"Dog\", \"credits\": \"3\"}], \"dropCourses\": [{\"id\": 1772046793162, \"sec\": \"02\", \"code\": \"0691-2\", \"name\": \"Cat\", \"credits\": \"3\"}], \"requestType\": \"late_both\", \"studentType\": \"ปกติ\", \"academicYear\": \"2569\"}');
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-26 12:21:59
