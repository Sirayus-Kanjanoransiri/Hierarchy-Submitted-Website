-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: e_form_database
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
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
  `step_id` int NOT NULL,
  `submission_id` int DEFAULT NULL,
  `step_order` int DEFAULT NULL,
  `approver_role_or_title` varchar(45) DEFAULT NULL,
  `assigned_approver_id` int DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `approve_on` varchar(45) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`step_id`)
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
-- Table structure for table `approvers`
--

DROP TABLE IF EXISTS `approvers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approvers` (
  `approver_id` int NOT NULL AUTO_INCREMENT,
  `approver_prefix` varchar(45) DEFAULT NULL,
  `approver_name` varchar(45) DEFAULT NULL,
  `approver_username` varchar(45) DEFAULT NULL,
  `approver_password` varchar(45) DEFAULT NULL,
  `approver_department` int DEFAULT NULL,
  `approver_tel` varchar(10) DEFAULT NULL,
  `approver_email` varchar(100) DEFAULT NULL,
  `approver_signature` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`approver_id`),
  KEY `fk_approver_department_idx` (`approver_department`),
  CONSTRAINT `fk_approver_department` FOREIGN KEY (`approver_department`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1002 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='ผู้อนุมัติแบบคำร้อง\n';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvers`
--

LOCK TABLES `approvers` WRITE;
/*!40000 ALTER TABLE `approvers` DISABLE KEYS */;
INSERT INTO `approvers` VALUES (1,'ดร.','สมชาย ประเสริฐ','somchai.p','1234',7,'0812345678','somchai.p@university.ac.th',NULL),(2,'รศ.','ศิริลักษณ์ วงษา','sirilak.w','abcd',14,'0898765432','sirilak.w@university.ac.th',NULL),(3,'นาย','กิตติพงษ์ รัตนากร','kittipong.r','password',5,'0861122334','kittipong.r@university.ac.th',NULL),(4,'นาย','สิรายุส กาญจนโอฬารศิริ','sirayut.k','hashed_Pw1001',12,'0811234567','sirayut.k@corp.co.th',NULL),(5,'นางสาว','ดารุณี ใจดี','darunee.j','hashed_Pw1002',17,'0929876543','darunee.j@corp.co.th',NULL);
/*!40000 ALTER TABLE `approvers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approvers_position`
--

DROP TABLE IF EXISTS `approvers_position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approvers_position` (
  `user_id` int NOT NULL,
  `position_id` int DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvers_position`
--

LOCK TABLES `approvers_position` WRITE;
/*!40000 ALTER TABLE `approvers_position` DISABLE KEYS */;
/*!40000 ALTER TABLE `approvers_position` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `department_id` int NOT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `faculty_id` int DEFAULT NULL,
  PRIMARY KEY (`department_id`),
  KEY `faculty_id_idx` (`faculty_id`),
  CONSTRAINT `faculty_id` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='สาขาวิชาของนักศึกษา';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'การบัญชี',1),(2,'การตลาด',1),(3,'การจัดการ',1),(4,'เศรษฐศาสตร์',1),(5,'ระบบสารสนเทศ',1),(6,'เทคโนโลยีสารสนเทศ',1),(7,'วิทยาการคอมพิวเตอร์',1),(8,'เทคโนโลยีการโฆษณาและประชาสัมพันธ์',1),(9,'เทคโนโลยีโลจิสติกส์และการจัดการระบบขนส่ง',1),(10,'เทคโนโลยีมัลติมีเดีย',1),(11,'นวัตกรรมและธุรกิจดิจิทัล',1),(12,'BUSIT INTER',1),(13,'ภาษาอังกฤษเพื่อการประกอบธุรกิจและการสื่อสารนานาชาติ',2),(14,'ภาษาจีนเพื่ออุตสาหกรรมบริการ',2),(15,'นวัตกรรมการท่องเที่ยวและการโรงแรม',2),(16,'จัดการธุรกิจและเทคโนโลยีค้าปลีก',2),(17,'จัดการทุนมนุษย์และนวัตกรรมสังคม',2);
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty`
--

DROP TABLE IF EXISTS `faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty` (
  `faculty_id` int NOT NULL,
  `faculty_name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty`
--

LOCK TABLES `faculty` WRITE;
/*!40000 ALTER TABLE `faculty` DISABLE KEYS */;
INSERT INTO `faculty` VALUES (1,'บริหารธุรกิจและเทคโนโลยีสารสนเทศ'),(2,'ศิลปศาสตร์');
/*!40000 ALTER TABLE `faculty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forms`
--

DROP TABLE IF EXISTS `forms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forms` (
  `form_id` int NOT NULL AUTO_INCREMENT,
  `form_name` varchar(255) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`form_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forms`
--

LOCK TABLES `forms` WRITE;
/*!40000 ALTER TABLE `forms` DISABLE KEYS */;
/*!40000 ALTER TABLE `forms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `position`
--

DROP TABLE IF EXISTS `position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `position` (
  `position_id` int NOT NULL AUTO_INCREMENT,
  `position_name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`position_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `position`
--

LOCK TABLES `position` WRITE;
/*!40000 ALTER TABLE `position` DISABLE KEYS */;
INSERT INTO `position` VALUES (1,'นักศึกษา'),(2,'อ.ที่ปรึกษา'),(3,'คณบดี'),(4,'หัวหน้าแผนก');
/*!40000 ALTER TABLE `position` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program_of_study`
--

DROP TABLE IF EXISTS `program_of_study`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program_of_study` (
  `program_id` int NOT NULL,
  `program_name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`program_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program_of_study`
--

LOCK TABLES `program_of_study` WRITE;
/*!40000 ALTER TABLE `program_of_study` DISABLE KEYS */;
INSERT INTO `program_of_study` VALUES (1,'ภาคปกติ'),(2,'ภาคนอกเวลา(จ-ศ)'),(3,'ภาคนอกเวลา(ส-อ)');
/*!40000 ALTER TABLE `program_of_study` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registration-related request form`
--

DROP TABLE IF EXISTS `registration-related request form`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration-related request form` (
  `request_form_id` int NOT NULL,
  `request_form_name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`request_form_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration-related request form`
--

LOCK TABLES `registration-related request form` WRITE;
/*!40000 ALTER TABLE `registration-related request form` DISABLE KEYS */;
INSERT INTO `registration-related request form` VALUES (1,'ใบคำร้องทั่วไป');
/*!40000 ALTER TABLE `registration-related request form` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `request_approval`
--

DROP TABLE IF EXISTS `request_approval`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `request_approval` (
  `approval_id` int NOT NULL,
  `form_type_master_id` int DEFAULT NULL,
  `request_approval_current_statuscol` int DEFAULT NULL,
  `approvalstep_id` int DEFAULT NULL,
  `approver_id` int DEFAULT NULL,
  `approver_status` varchar(45) DEFAULT NULL,
  `approval_date` datetime DEFAULT NULL,
  `comment` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`approval_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `request_approval`
--

LOCK TABLES `request_approval` WRITE;
/*!40000 ALTER TABLE `request_approval` DISABLE KEYS */;
/*!40000 ALTER TABLE `request_approval` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffs`
--

DROP TABLE IF EXISTS `staffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffs` (
  `staffs_id` int NOT NULL,
  `staff_name` varchar(100) NOT NULL,
  `staff_username` varchar(45) NOT NULL,
  `staff_password` varchar(45) NOT NULL,
  PRIMARY KEY (`staffs_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffs`
--

LOCK TABLES `staffs` WRITE;
/*!40000 ALTER TABLE `staffs` DISABLE KEYS */;
INSERT INTO `staffs` VALUES (1,'สมชาย ใจดี','Admin001','1'),(2,'สมชาย ร่างสอง','Admin002','2');
/*!40000 ALTER TABLE `staffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `std_id` varchar(13) NOT NULL,
  `std_password` varchar(10) NOT NULL,
  `std_prefix` varchar(45) NOT NULL,
  `std_name` varchar(45) NOT NULL,
  `std_faculty` int DEFAULT NULL,
  `std_department` int DEFAULT NULL,
  `std_address_no` varchar(45) DEFAULT NULL,
  `std_address_moo` varchar(45) DEFAULT NULL,
  `std_address_soi` varchar(45) DEFAULT NULL,
  `std_address_street` varchar(45) DEFAULT NULL,
  `std_address_tumbol` varchar(45) DEFAULT NULL,
  `std_address_amphoe` varchar(45) DEFAULT NULL,
  `std_province` varchar(45) DEFAULT NULL,
  `std_postcode` varchar(45) DEFAULT NULL,
  `std_tel` varchar(45) DEFAULT NULL,
  `std_facebook` varchar(45) DEFAULT NULL,
  `std_email` varchar(45) DEFAULT NULL,
  `std_STATUS` varchar(10) DEFAULT NULL,
  `program_id` int DEFAULT NULL,
  `advisor` int DEFAULT NULL,
  PRIMARY KEY (`std_id`),
  KEY `fk_std_faculty` (`std_faculty`),
  KEY `fk_std_department` (`std_department`),
  KEY `fk_program_of_study` (`program_id`),
  KEY `fk_std_advisor_idx` (`advisor`),
  CONSTRAINT `fk_program_of_study` FOREIGN KEY (`program_id`) REFERENCES `program_of_study` (`program_id`),
  CONSTRAINT `fk_std_advisor` FOREIGN KEY (`advisor`) REFERENCES `approvers` (`approver_id`),
  CONSTRAINT `fk_std_department` FOREIGN KEY (`std_department`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_std_faculty` FOREIGN KEY (`std_faculty`) REFERENCES `faculty` (`faculty_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('1','1','นาย','สิรายุส ขั้นเทพ',2,15,'19/3','4','อินทมาระ40','สุทธิสาร','ดินแดง','ดินแดง','กรุงเทพมหานคร','21000','0985340509','Sirayus Kanjanaoransiri ','name@email.com','Pending',3,5),('123','1234','นาง','สิตา ดีใจ',1,7,'1150','6','asd','ยางมะตอย','ดินแดง','ดินแดง','กทม','123','0893333333','facebook_test','sita@rmutto.ac.th','Pending',1,NULL),('650001','pass123','Mr.','Anan Kittipong',1,1,'12','5','Soi 3','Ratchada Rd.','Din Daeng','Din Daeng','Bangkok','10400','0812345678','anan.k','anan@example.com','Confirmed',1,2),('650002','pass234','Ms.','Chanya Wongsa',2,3,'55','2','Soi 7','Silom Rd.','Silom','Bang Rak','Bangkok','10500','0898765432','chanya.w','chanya@example.com','Confirmed',1,3),('650003','pass345','Mr.','Prasert Maneewan',1,6,'88','1','Soi 10','Changklan Rd.','Chang Khlan','Mueang','Chiang Mai','50100','0865551212','prasert.m','prasert@example.com','Confirmed',2,4),('650004','pass456','Mrs.','Sirilak Boonmee',2,6,'101','3','Soi 5','Sukhumvit Rd.','Phra Khanong','Khlong Toei','Bangkok','10110','0823334444','sirilak.b','sirilak@example.com','Confirmed',3,4),('650005','pass567','Mr.','Kittisak Jaidee',1,1,'23','7','Soi 12','Mittraphap Rd.','Nai Mueang','Mueang','Khon Kaen','40000','0857778888','kittisak.j','kittisak@example.com','Confirmed',2,5);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `submission_id` int NOT NULL AUTO_INCREMENT,
  `form_id` int NOT NULL,
  `form_data` json NOT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`submission_id`),
  KEY `form_id` (`form_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `forms` (`form_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
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

-- Dump completed on 2025-10-18 13:05:28
