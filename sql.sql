CREATE DATABASE  IF NOT EXISTS `e_form_database` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `e_form_database`;
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
-- Table structure for table `approval_history`
--

DROP TABLE IF EXISTS `approval_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `approver_id` int NOT NULL,
  `action` enum('APPROVED','REJECTED') NOT NULL,
  `action_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `note` text,
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  KEY `approver_id` (`approver_id`),
  CONSTRAINT `approval_history_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`submission_id`),
  CONSTRAINT `approval_history_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `approvers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_history`
--

LOCK TABLES `approval_history` WRITE;
/*!40000 ALTER TABLE `approval_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_history` ENABLE KEYS */;
UNLOCK TABLES;

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
  `combined_roles` json DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `updated_at` datetime DEFAULT NULL,
  `reject_reason` text,
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  KEY `assigned_approver_id` (`assigned_approver_id`),
  CONSTRAINT `approval_steps_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `approval_steps_ibfk_2` FOREIGN KEY (`assigned_approver_id`) REFERENCES `approvers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_steps`
--

LOCK TABLES `approval_steps` WRITE;
/*!40000 ALTER TABLE `approval_steps` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approver_roles`
--

LOCK TABLES `approver_roles` WRITE;
/*!40000 ALTER TABLE `approver_roles` DISABLE KEYS */;
INSERT INTO `approver_roles` VALUES (1,1,1),(2,1,2);
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvers`
--

LOCK TABLES `approvers` WRITE;
/*!40000 ALTER TABLE `approvers` DISABLE KEYS */;
INSERT INTO `approvers` VALUES (1,'ผศ.ดร','ต้องใจ แย้มผกา','tongjai','123456','tongjai@example.com',11,'0812345678',NULL,1),(2,'อ.','รัฐ บุรีรัตน์','rat','123456','rat@example.com',11,'0812345679',NULL,1),(3,'อ.','สุธีรา วงศ์อนันทรัพย์','sutira','123456','sutira@example.com',11,'0812345680',NULL,1),(4,'ผศ.','อรวรรณ ชุณหปราณ','orawan','123456','orawan@example.com',11,'0812345681',NULL,1),(5,'ผศ.ดวงใจ','หนูเล็ก','duangjai','123456','duangjai@example.com',11,'0812345682',NULL,1),(6,'อ.','ปรินดา ลาภเจริญวงศ์','parinda','123456','parinda@example.com',11,'0812345683',NULL,1),(7,'ผศ.ดร.','พิชัย จอดพิมาย','pichai','123456','pichai@example.com',11,'0812345684',NULL,1);
/*!40000 ALTER TABLE `approvers` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
-- Table structure for table `form_templates`
--

DROP TABLE IF EXISTS `form_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `form_name` varchar(255) NOT NULL,
  `description` text,
  `required_roles` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_templates`
--

LOCK TABLES `form_templates` WRITE;
/*!40000 ALTER TABLE `form_templates` DISABLE KEYS */;
INSERT INTO `form_templates` VALUES (1,'ใบคำร้องทั่วไป','คำร้องทั่วไปที่นักศึกษาส่งเพื่อขออนุมัติ','[\"อ.ที่ปรึกษา\", \"รองคณบดี\", \"คณบดี\", \"หัวหน้างานทะเบียน\"]');
/*!40000 ALTER TABLE `form_templates` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'อ.ที่ปรึกษา'),(2,'หัวหน้าแผนก'),(3,'รองคณบดี'),(4,'คณบดี'),(5,'เจ้าหน้าที่งานทะเบียน'),(6,'หัวหน้างานทะเบียน'),(7,'อธิการบดี'),(8,'การเงิน'),(9,'ผู้อำนวยการสำนักส่งเสริมวิชาการ'),(10,'งานทะเบียน');
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
  CONSTRAINT `fk_students_advisor` FOREIGN KEY (`advisor_id`) REFERENCES `approvers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'STU001','สมชาย ใจดี','123456',5,1,'somchai@example.com','12','5','ซอยสุขใจ','ถนนรามคำแหง','หัวหมาก','บางกะปิ','กรุงเทพฯ','10240','1'),(2,'STU002','สมหญิง แสนสวย','123456',3,3,'somying@example.com','34','2','ซอยร่มเย็น','ถนนลาดพร้าว','จันทรเกษม','จตุจักร','กรุงเทพฯ','10900','1'),(3,'STU003','จันทร์เพ็ญ กลิ่นหอม','123456',2,2,'janpen@example.com','56','7','ซอยสวนพลู','ถนนสาทร','ทุ่งมหาเมฆ','สาทร','กรุงเทพฯ','10120','1'),(4,'STU004','ณัฐพล สุขใจ','123456',4,1,'natpol@example.com','78','3','ซอยสุขสวัสดิ์','ถนนพระราม 3','ช่องนนทรี','ยานนาวา','กรุงเทพฯ','10120','0'),(5,'STU005','กมลรัตน์ แสงทอง','123456',5,4,'kamonrat@example.com','90','1','ซอยทองหล่อ','ถนนสุขุมวิท','คลองตันเหนือ','วัฒนา','กรุงเทพฯ','10110','0'),(6,'STU011','ทดสอบ2','123456',7,NULL,'name@email.com','1','2','3','4','5','6','7','21000','0');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
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
  KEY `form_id` (`form_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`form_id`) REFERENCES `form_templates` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,1,1,'2025-12-03 09:15:43','PENDING','{\"reason\": \"ขออนุมัติเรื่องเรียนต่อ\", \"details\": \"รายละเอียดเพิ่มเติม...\"}'),(2,1,1,'2025-12-03 10:09:47','PENDING','{\"subject\": \"ขอผ่อนชำระค่าเทอม\", \"student_info\": {\"email\": \"somchai@example.com\", \"full_name\": \"สมชาย ใจดี\", \"address_no\": \"12\", \"department\": \"สาขาการบัญชี\", \"student_id\": \"STU001\", \"address_moo\": \"5\", \"address_soi\": \"ซอยสุขใจ\", \"address_street\": \"ถนนรามคำแหง\", \"address_district\": \"บางกะปิ\", \"address_postcode\": \"10240\", \"address_province\": \"กรุงเทพฯ\", \"address_subdistrict\": \"หัวหมาก\"}, \"request_reason\": \"ทดสอบระบบเฉยๆ\"}');
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

-- Dump completed on 2025-12-03 22:36:59