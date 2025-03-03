<?php
require_once "dbconstants.php";
require_once "connectDB.php";
require_once 'tbluserservice.php';
require_once emabs . "/mailing/fill_em_mailqueue.php";
require_once emabs . "/inventory/server/Inventory.php";

date_default_timezone_set("Asia/Calcutta");

class KHBApplicationForm
{
	private $db;

	function __construct()
	{
		$this->db = new connectDB(1, "EM5249");
	}

	function __destruct()
	{
		$this->db->disconnectDB();
		$this->db = null;
	}
	public function getregistrationfee($data)
	{
		$propertyno = $data['propertyno'];
		$sql = "SELECT MinStockLevel, MaxOrderLevel FROM tblproduct WHERE assetno=:propertyno AND MinStockLevel>0 AND MaxOrderLevel>0";
		$stmt = $this->db->conn->prepare($sql);
		$stmt->execute(array(":propertyno" => $propertyno));
		$RFrows = $stmt->fetchAll();
		$return_array = array();
		$return_array['MinStockLevel'] = $RFrows[0]['MinStockLevel'];
		$return_array['MaxOrderLevel'] = $RFrows[0]['MaxOrderLevel'];
		return $return_array;
	}
	public function getproperties($data)
	{
		$propertyarr = $data['propertydata'];
		$projectid = $propertyarr['projectid'];
		$propertytype = $propertyarr['propertytype'];
		$tempTranIdFlag = $propertyarr['tempTranIdFlag'];
		$currentDateTime =  date("Y-m-d H:i:s");
		if ($tempTranIdFlag == 1) {
			$sql = "SELECT
				AssetNo,
				ProductName
			FROM
				tblproduct prod
			INNER JOIN tblproductType prodtype ON
				prodtype.ProductTypeId = prod.ProductTypeId
			WHERE
				ProjectId = :ProjectId AND ProductTypeName = :ProductTypeName";
			$stmt = $this->db->conn->prepare($sql);
			$params = array(
				":ProjectId" => $projectid,
				":ProductTypeName" => $propertytype
			);
			$stmt->execute($params);
		} else {
			// $sql = "SELECT
			// 	AssetNo,
			// 	ProductName
			// FROM
			// 	tblproduct prod
			// INNER JOIN tblproductType prodtype ON
			// 	prodtype.ProductTypeId = prod.ProductTypeId
			// WHERE
			// 	ProjectId = :ProjectId AND ProductTypeName = :ProductTypeName AND prod.OpeningStock > 0 AND prod.Booked = 0 AND prod.MOP = 1 AND (CURRENT_TIMESTAMP() > prod.LockedUpTo OR prod.LockedUpTo IS NULL)";
			$sql = "SELECT
				AssetNo,
				ProductName
			FROM
				tblproduct prod
			INNER JOIN tblproductType prodtype ON
				prodtype.ProductTypeId = prod.ProductTypeId
			WHERE
				ProjectId = :ProjectId AND ProductTypeName = :ProductTypeName AND prod.OpeningStock > 0 AND prod.Booked = 0 AND (:currentDateTime > prod.LockedUpTo OR prod.LockedUpTo IS NULL)";
			$stmt = $this->db->conn->prepare($sql);
			$params = array(
				":ProjectId" => $projectid,
				":ProductTypeName" => $propertytype,
				":currentDateTime" => $currentDateTime
			);
			$stmt->execute($params);
		}


		$propertyrows = $stmt->fetchAll();
		return $propertyrows;
	}
	public function getAllDistricts()
	{
		$return_array["data"] = array(
			'name' => 'Karnataka',
			'capital' => 'Bengaluru',
			'districts' => array(
				1 => 'Bagalkot',
				2 => 'Ballari (Bellary)',
				3 => 'Belagavi (Belgaum)',
				4 => 'Bengaluru (Bangalore) Rural',
				5 => 'Bengaluru (Bangalore) Urban',
				6 => 'Bidar',
				7 => 'Chamarajanagar',
				8 => 'Chikballapur',
				9 => 'Chikkamagaluru (Chikmagalur)',
				10 => 'Chitradurga',
				11 => 'Dakshina Kannada',
				12 => 'Davangere',
				13 => 'Dharwad',
				14 => 'Gadag',
				15 => 'Hassan',
				16 => 'Haveri',
				17 => 'Kalaburagi (Gulbarga)',
				18 => 'Kodagu',
				19 => 'Kolar',
				20 => 'Koppal',
				21 => 'Mandya',
				22 => 'Mysuru (Mysore)',
				23 => 'Raichur',
				24 => 'Ramanagara',
				25 => 'Shivamogga (Shimoga)',
				26 => 'Tumakuru (Tumkur)',
				27 => 'Udupi',
				28 => 'Uttara Kannada (Karwar)',
				29 => 'Vijayapura (Bijapur)',
				30 => 'Vijayanagara',
				31 => 'Yadgir',
			),
		);

		return $return_array;
	}
	public function generateapplicationno($data)
	{
		$applicationno = $data['applicationno'];
		$sql = "INSERT INTO masteraddparent(Fname) VALUES('APPLICANT')";
		$stmt = $this->db->conn->prepare($sql);
		$stmt->execute();
		$parentid = $this->db->conn->LastInsertId();
		$sql = "INSERT INTO masteraddstudent (EMUniqueId, Fname, ParentId, AdmissionStageId, Status) VALUES(-1,'APPLICANT',:ParentId, 2,-1)";
		$stmt = $this->db->conn->prepare($sql);
		$stmt->execute(array(":ParentId" => $parentid));
		$applicantid = $this->db->conn->LastInsertId();
		$tempappno = str_pad($applicantid, 5, "0", STR_PAD_LEFT);
		// $tempappno = str_pad($applicantid, 7, "0", STR_PAD_LEFT);
		// $applicationno = $applicationno . $tempappno;
		$applicationno = "KHBZF" . $tempappno;
		$return_array = array();
		$return_array['applicationno'] = $applicationno;
		$return_array['EsakStudentId'] = $applicantid;
		return $return_array;
	}
	public function saveapplication($postdata)
	{
		$data = $postdata['applicationdata'];
		$notificationno = $data['notificationno'];
		$districtid = $data['districtid'];
		$projectid = $data['projectid'];
		$propertytype = $data['propertytype'];
		$propertyno = $data['propertyno'];
		$propertycategory = $data['propertycategory'];
		$propertyflat = $data['propertyflat'];
		$registrationtype = $data['registrationtype'];
		$applicationno = $data['applicationno'];
		$applicantname = $data['applicantname'];
		$spousename = $data['spousename'];
		$gender = $data['gender'];
		$applicantDOB = $data['applicantDOB'];
		$applicantpan = $data['applicantpan'];
		$applicantaadharno = $data['applicantaadharno'];
		$religion = $data['religion'];
		$reservation = $data['reservation'];
		$annualincome = $data['annualincome'];
		$noofyearsinkarnataka = $data['noofyearsinkarnataka'];
		$nomineename = $data['nomineename'];
		$nomineerelation = $data['nomineerelation'];
		$address1 = $data['address1'];
		$address2 = $data['address2'];
		$address3 = $data['address3'];
		$address4 = $data['address4'];
		$comdistrict = $data['comdistrict'];
		$pincode = $data['pincode'];
		$mobileno = $data['mobileno'];
		$emailid = $data['emailid'];
		$bankname = $data['bankname'];
		$branchname = $data['branchname'];
		$ifsccode = $data['ifsccode'];
		$accountnumber = $data['accountnumber'];
		$RegistrationFee = $data['RegistionFee'];
		$IDAmount = $data['IDAmount'];
		$EsakStudentId = $data['EsakStudentId'];

		$sql = "SELECT ParentId FROM masteraddstudent WHERE EsakStudentId=:EsakStudentId";
		$stmt = $this->db->conn->prepare($sql);
		$stmt->execute(array(":EsakStudentId" => $EsakStudentId));
		$rows = $stmt->fetchAll();
		$EsakParentId = $rows[0]['ParentId'];

		$sql = "UPDATE masteraddstudent SET Fname=:applicantname, Enrolment_no=:propertyno, RegistrationNo=:notificationno, AdmissionNo=:applicationno, StandardSectionId=:projectid, HostelId=:districtid, OtherLanguagesKnown=:propertytype,  OtherKidInfo=:propertycategory, LastSchoolAttended=:propertyflat, ExamPassed=:registrationtype, Sex=:gender, DateOfBirth=:applicantDOB, Religion=:religion, Caste=:reservation, YearOfPassing=:noofyearsinkarnataka, CurrResidingWith=:address1, PrefferedContact=:address2, TotalMarks=:RegistrationFee, ClassObtained=:IDAmount  WHERE EsakStudentId=:EsakStudentId";
		$stmt = $this->db->conn->prepare($sql);
		$stmt->execute(array(":applicantname" => $applicantname, ":propertyno" => $propertyno, ":notificationno" => $notificationno, ":applicationno" => $applicationno, ":projectid" => $projectid, ":districtid" => $districtid, ":propertytype" => $propertytype, ":propertycategory" => $propertycategory, ":propertyflat" => $propertyflat, ":registrationtype" => $registrationtype, ":gender" => $gender, ":applicantDOB" => $applicantDOB, ":religion" => $religion, ":reservation" => $reservation, ":noofyearsinkarnataka" => $noofyearsinkarnataka, ":address1" => $address1, ":address2" => $address2, ":RegistrationFee" => $RegistrationFee, ":IDAmount" => $IDAmount, ":EsakStudentId" => $EsakStudentId));

		$sql = "UPDATE masteraddparent SET Fname=:spousename, PapaPANCard=:applicantpan, MamaPANCard=:applicantaadharno, PapaAnnualIncome=:annualincome, GuardianName=:nomineename, GuardianDesignation=:nomineerelation, CurrentResidentialAddress=:address3, PapaOfficeAddress=:address4, City=:comdistrict, Zip=:pincode, PapaMobileNo=:mobileno, PapaEmailID_Primary=:emailid, PapaCompanyName=:bankname,  PapaOccupation=:branchname, PapaOfficeNo=:ifsccode, PapaOfficeFax=:accountnumber WHERE EsakParentId=:EsakParentId";
		$stmt = $this->db->conn->prepare($sql);
		$stmt->execute(array(":spousename" => $spousename, ":applicantpan" => $applicantpan, ":applicantaadharno" => $applicantaadharno, ":annualincome" => $annualincome, ":nomineename" => $nomineename, ":nomineerelation" => $nomineerelation, ":address3" => $address3, ":address4" => $address4, ":comdistrict" => $comdistrict, ":pincode" => $pincode, ":mobileno" => $mobileno, ":emailid" => $emailid, ":bankname" => $bankname, ":branchname" => $branchname, ":ifsccode" => $ifsccode, ":accountnumber" => $accountnumber, ":EsakParentId" => $EsakParentId));

		$sql = "UPDATE tblproduct prod SET prod.LockedUpTo = :LockedUpTo  WHERE prod.assetno = :Enrolment_no";
		$stmt = $this->db->conn->prepare($sql);
		$Enrolment_no = $propertyno;
		$stmt->execute([
			":LockedUpTo" => strtotime("+5 minutes"),
			":Enrolment_no" => $Enrolment_no
		]);
		$return_array = array();
		$return_array['EsakStudentId'] = $EsakStudentId;
		return $return_array;
	}
	public function get_districts($data)
	{
		$return_array = array();

		$notification_id = $data['notification_id'];
		$sql = "SELECT `CostCenterName`,`CostCenterId` FROM `tblcostcenter` where storeid=:storeid order by CostCenterName";

		$return_array = $this->db->getQuery($sql, [":storeid" => $notification_id]);
		return $return_array;
	}
	public function getOpenedProjects()
	{
		$sql = "SELECT `config` FROM `tblconfigjson` WHERE moduleId = 139";
		$stmt = $this->db->conn->prepare($sql);
		$stmt->execute();
		$allowed_project_ids = [];
		if ($row = $stmt->fetch()) {
			$configArray = json_decode($row['config'], true);
			$allowed_project_ids = isset($configArray['allowed_project_ids']) ? $configArray['allowed_project_ids'] : [];
		}

		return $allowed_project_ids;
	}
	public function get_districts_without_noticefication_id()
	{
		$return_array = array();
		$allowed_project_ids = $this->getOpenedProjects();
		$allowed_district_ids = [];
		if (count($allowed_project_ids) > 0) {
			$sql = "SELECT `CostCenterId` FROM `tblproject` where ProjectId IN (" . implode(",", $allowed_project_ids) . ")";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute();
			$dataArray = $stmt->fetchAll();
			foreach ($dataArray as $row) {
				$allowed_district_ids[] = $row['CostCenterId'];
			}
		}
		$custWhere = "1";
		if (count($allowed_district_ids) > 0) {
			$custWhere = " CostCenterId IN (" . implode(",", $allowed_district_ids) . ")";
		}

		// $notification_id = $data['notification_id'];
		// $sql = "SELECT `CostCenterName`,`CostCenterId` FROM `tblcostcenter` where storeid=:storeid order by CostCenterName";
		$sql = "SELECT `CostCenterName`,`CostCenterId` FROM `tblcostcenter` WHERE {$custWhere} order by CostCenterName";

		// $return_array = $this->db->getQuery($sql, [":storeid" => $notification_id]);
		$return_array = $this->db->getQuery($sql);
		return $return_array;
	}
	public function get_notification_details()
	{
		$return_array = array();
		$sql = "SELECT * FROM `tblstores` order by storeid";
		$return_array = $this->db->getQuery($sql);
		return $return_array;
	}
	public function get_project_details($data)
	{
		$allowed_project_ids = $this->getOpenedProjects();
		$custWhere = "1";
		if (count($allowed_project_ids) > 0) {
			$custWhere = "ProjectId IN (" . implode(",", $allowed_project_ids) . ")";
		}

		$return_array = array();
		$DistrictId = $data['district_id'];
		$sql = "SELECT * FROM `tblproject` WHERE {$custWhere} AND CostCenterId=:CostCenterId";
		$return_array = $this->db->getQuery($sql, [":CostCenterId" => $DistrictId]);
		return $return_array;
	}
	public function sendappOTP($data)
	{
		$applicationno = $data['applicationno'];
		$time = time();
		$UserService = new tbluserservice();
		$MailService = new fill_em_mailqueue();

		$passcode = $UserService->generatePassword(6, 1);

		$sql = "SELECT pt.PapaEmailID_Primary FROM masteraddstudent st
			INNER JOIN masteraddparent pt ON pt.EsakParentId=st.ParentId
			WHERE st.AdmissionNo=:ApplicationNo AND st.Status != 0";
		$stmt = $this->db->conn->prepare($sql);
		$stmt->execute(array(":ApplicationNo" => $applicationno));
		$applicantrows = $stmt->fetchAll();
		$applicant_emailid = empty($applicantrows[0]['PapaEmailID_Primary']) ? "" : $applicantrows[0]['PapaEmailID_Primary'];
		$return_array = array();
		if (trim($applicant_emailid) != "") {
			$sql = "UPDATE masteraddstudent SET RollNo=:RollNo WHERE AdmissionNo=:ApplicationNo";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute(array(":RollNo" => $passcode, ":ApplicationNo" => $applicationno));
			$message = "Your OTP for downloading Application No. " . $applicationno . " is " . $passcode;
			$html = 1;
			$send_at = 0;
			$transactionid = time();
			$subject = "OTP for Karnataka Housing Board Application Download";
			$from = "Karnataka Housing Board <khb_do_not_reply@login.edumerge.com>";
			if (trim($send_at) == "" || trim($send_at) == 0) {
				$send_at = time();
			}
			$senttime = date("Y-m-d H:i:s");
			$finalmessage = $message;
			$fileuploaded = "";
			$MailService->queueMails($finalmessage, $applicant_emailid, $from, $subject, $html, "", "", "", $send_at, 0, 0, "EM5249");
			$return_array['Error_Code'] = 0;
			$return_array['OTP_Error'] = "An OTP has been sent your Email";
		} else {
			if (count($applicantrows) == 0) {
				$return_array['Error_Code'] = 1;
				$return_array['OTP_Error'] = "Enter Valid Application Number";
			} else {
				$return_array['Error_Code'] = 1;
				$return_array['OTP_Error'] = "Communication details are missing! Please contact KHB Team.";
			}
		}
		return $return_array;
	}
	public function validateappOTP($data)
	{
		$OTP_data = $data['OTP_data'];
		$applicationno = $OTP_data['applicationno'];
		$OTP = $OTP_data['OTP'];
		$sql = "SELECT RollNo, EMUniqueId FROM masteraddstudent WHERE AdmissionNo=:ApplicationNo AND Status != 0";
		$stmt = $this->db->conn->prepare($sql);
		$stmt->execute(array(":ApplicationNo" => $applicationno));
		$otprows = $stmt->fetchAll();
		
		if (count($otprows) > 0) {
			$passcode = $otprows[0]['RollNo'];
			$EMUniqueId = $otprows[0]['EMUniqueId'];
			if ($OTP == $passcode) {
				$return_array['Error_Code'] = 0;
				$return_array['OTP_Error'] = "OTP is successfully validated. Getting Application Details. Please wait...";
			} else {
				$return_array['Error_Code'] = 1;
				$return_array['OTP_Error'] = "Enter Valid OTP";
				$return_array["requestExtentionTransactionDate"] = null;
				$return_array["requestExtentionTransactionID"] = null;
				$return_array["validationFiled"] = 1;
				return $return_array;
			}

			$sql1 = "SELECT log.MihPayID, DATE_FORMAT(log.TranStartDate, '%d-%m-%Y') AS transactionDate FROM tblfeereceipt_tran fee
			INNER JOIN tblpayumoneylog log ON log.txnid = fee.pgtranid
			WHERE fee.DiscountHeadID = :EMUniqueId AND fee.FeeHeadID = 6";
			$stmt1 = $this->db->conn->prepare($sql1);
			$stmt1->execute([
				":EMUniqueId" => $EMUniqueId,
			]);
			if ($row = $stmt1->fetch()) {
				$return_array["requestExtentionTransactionDate"] = $row["transactionDate"];
				$return_array["requestExtentionTransactionID"] = $row["MihPayID"];
			} else {
				$return_array["requestExtentionTransactionDate"] = null;
				$return_array["requestExtentionTransactionID"] = null;
			}
			/* Checking Application Status*/
			$sql2 = "SELECT COUNT(*) AS applicationStatusCount FROM tblinvtransaction tran WHERE tran.transtype = 10 AND tran.purchasereceiveid > 0 AND tran.accountid = :EMUniqueId";
			$stmt2 = $this->db->conn->prepare($sql2);
			$stmt2->execute([
				":EMUniqueId" => $EMUniqueId,
			]);
			$return_array["applicationStatus"] = 0;
			if ($row = $stmt2->fetch()) {
				if ($row["applicationStatusCount"] > 0) {
					$return_array["applicationStatus"] = 1;
				} else {
					$return_array["applicationStatus"] = 0;
				}
			}
		} else {
			$return_array['Error_Code'] = 1;
			$return_array['OTP_Error'] = "Enter Valid OTP";
			$return_array["requestExtentionTransactionDate"] = null;
			$return_array["requestExtentionTransactionID"] = null;
		}
		return $return_array;
	}
	public function getapplicationdetails($data)
	{
		$applicationno = $data['applicationno'];
		$tranId = $data['tranId'];
		if (trim($applicationno) != "") {
			$sql = "SELECT
				st.EsakStudentId, st.Fname as applicantname, st.AdmissionNo as applicationno,
				st.RegistrationNo as notificationno, st.Enrolment_no as propertyno,
				st.StandardSectionId as projectid, st.HostelId as districtid,
				st.OtherLanguagesKnown as propertytype,
				st.OtherKidInfo as propertycategory, st.LastSchoolAttended as propertyflat,
				st.ExamPassed as registrationtype, st.Sex as gender,
				st.DateOfBirth as applicantDOB, st.Religion as religion,
				st.Caste as reservation, st.YearOfPassing as noofyearsinkarnataka,
				st.CurrResidingWith as address1, st.PrefferedContact as address2,
				st.TotalMarks as RegistrationFee, st.ClassObtained as IDAmount,
				pt.Fname as spousename, pt.PapaPANCard as applicantpan,
				pt.MamaPANCard as applicantaadharno, pt.PapaAnnualIncome as annualincome,
				pt.GuardianName as nomineename, pt.GuardianDesignation as nomineerelation,
				pt.CurrentResidentialAddress as address3, pt.PapaOfficeAddress as address4,
				pt.City as comdistrict, pt.Zip as pincode, pt.PapaMobileNo as mobileno,
				pt.PapaEmailID_Primary as emailid, pt.PapaCompanyName as bankname,
				pt.PapaOccupation as bankbrname, pt.PapaOfficeNo as ifsccode,
				pt.PapaOfficeFax as bankacno, log.MihPayID as transactionno,
				DATE(log.TranStartDate) as transactiondate,
				cost.CostCenterName AS DistrictName,
				pro.ProjectName,
				pro.no_of_installment,
				st.EMUniqueId
			FROM masteraddstudent st
			INNER JOIN masteraddparent pt ON pt.EsakParentId=st.ParentId
			INNER JOIN tblpayumoneylog log ON log.EMUniqueId=st.EMUniqueId
			INNER JOIN tblcostcenter cost ON cost.CostCenterId = st.HostelId
			INNER JOIN tblproject pro ON pro.ProjectId = st.StandardSectionId
			WHERE st.AdmissionNo=:ApplicationNo AND st.Status != 0";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute(array(":ApplicationNo" => $applicationno));
			$paymentScheduleInfo = $this->getPaymentScheduleDetails(["applicatioNo" => $applicationno]);
			$showCancellationLetterFlag = $paymentScheduleInfo["data"]["showCancellationLetterFlag"];
			$cancellationDate = $paymentScheduleInfo["data"]["cancellationDate"];
			$AllotmentDate = $paymentScheduleInfo["data"]["AllotmentDate"];
			$InstallmentAmount = $paymentScheduleInfo["data"]["one_installment_amount"];
			$cost = $paymentScheduleInfo["data"]["cost"];
			$showNoticeLetterFlag = $paymentScheduleInfo["data"]["showNoticeLetterFlag"];
			$noticeDate = $paymentScheduleInfo["data"]["noticeDate"];
			$TagStatus = $paymentScheduleInfo["data"]["TagStatus"];
		} else {
			$sql = "SELECT
				st.EsakStudentId, st.Fname as applicantname, st.AdmissionNo as applicationno,
				st.RegistrationNo as notificationno, st.Enrolment_no as propertyno,
				st.StandardSectionId as projectid, st.HostelId as districtid,
				st.OtherLanguagesKnown as propertytype,
				st.OtherKidInfo as propertycategory, st.LastSchoolAttended as propertyflat,
				st.ExamPassed as registrationtype, st.Sex as gender,
				st.DateOfBirth as applicantDOB, st.Religion as religion,
				st.Caste as reservation, st.YearOfPassing as noofyearsinkarnataka,
				st.CurrResidingWith as address1, st.PrefferedContact as address2,
				st.TotalMarks as RegistrationFee, st.ClassObtained as IDAmount,
				pt.Fname as spousename, pt.PapaPANCard as applicantpan,
				pt.MamaPANCard as applicantaadharno, pt.PapaAnnualIncome as annualincome,
				pt.GuardianName as nomineename, pt.GuardianDesignation as nomineerelation,
				pt.CurrentResidentialAddress as address3, pt.PapaOfficeAddress as address4,
				pt.City as comdistrict, pt.Zip as pincode, pt.PapaMobileNo as mobileno,
				pt.PapaEmailID_Primary as emailid, pt.PapaCompanyName as bankname,
				pt.PapaOccupation as bankbrname, pt.PapaOfficeNo as ifsccode,
				pt.PapaOfficeFax as bankacno, log.MihPayID as transactionno,
				DATE(log.TranStartDate) as transactiondate,
				inv.transtype,
				inv.purchasereceiveid,
				pr.MOP,
				DATE_FORMAT(invno.invdate, '%Y-%m-%d') AS ApprovedDate,
				st.EMUniqueId
			FROM masteraddstudent st
			INNER JOIN tblinvtransaction inv ON inv.accountid=st.EMUniqueId
			INNER JOIN masteraddparent pt ON pt.EsakParentId=st.ParentId
			INNER JOIN tblpayumoneylog log ON log.EMUniqueId=st.EMUniqueId
			INNER JOIN tblproduct pr ON pr.ProductId = inv.productid
			LEFT JOIN tblinvtranno invno ON invno.tblinvtrannoid = inv.purchasereceiveid
			WHERE inv.transactionid=:tranId AND st.Status != 0";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute(array(":tranId" => $tranId));
		}
		$applicantrows = $stmt->fetchAll();
		$applicantrows[0]["loggedInUserProfileId"] = $_SESSION["profileid"];
		//$applicantrows[0]['transactiondate'] = date("d/m/Y", strtotime($applicantrows[0]['transactiondate']));
		$return_array = $applicantrows[0];
		if (trim($applicationno) != "") {

			$return_array["showCancellationLetterFlag"] = $showCancellationLetterFlag;
			$return_array["cancellationDate"] = $cancellationDate;

			$return_array["showNoticeLetterFlag"] = $showNoticeLetterFlag;
			$return_array["noticeDate"] = $noticeDate;

			$return_array["AllotmentDate"] = $AllotmentDate;
			$return_array["InstallmentAmount"] = $InstallmentAmount;
			$return_array["TagStatus"] = $TagStatus;
			$return_array["cost"] = $cost;
			$return_array["no_of_installment"] = $paymentScheduleInfo["data"]["no_of_installment"];

			//Checking Candidates existing Stage
			$sql = "SELECT CandidateStagesID FROM CandidateCurrentStage WHERE CandidateEMUniqueId = :EMUniqueId";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute([
				":EMUniqueId" => $applicantrows[0]['EMUniqueId']
			]);
			if ($row = $stmt->fetch()) {
				$return_array["CandidateStagesID"] = $row['CandidateStagesID'];
			}
		}
		return $return_array;
	}

	public function getPaymentScheduleDetails($params)
	{
		try {
			$return_array = [];
			$applicatioNo = $params["applicatioNo"];
			$IDAmount = 0;
			$Rate = 0;
			$EsakStudentId = 0;
			$EMUniqueId = 0;
			$isExtentionAmountPaid = false;
			$extentionAmountPaymentID = '';
			$extentionFeeDate = '';
			$extentionAmountPaid = 0;
			$TagStatus = 0;
			$sql = "SELECT
				st.EMUniqueId,
				st.EsakStudentId,
				st.ClassObtained AS IDAmount,
				pd.Rate,
				st.TagStatus,
				pr.no_of_installment
			FROM
				masteraddstudent st
			INNER JOIN tblproduct pd ON
				(TRIM(pd.assetno) = TRIM(st.Enrolment_no) AND pd.ProjectId = st.StandardSectionId)
			LEFT JOIN tblproject pr ON
				pr.ProjectId = pd.ProjectId
			WHERE
				st.AdmissionNo = :applicatioNo AND st.Status != 0";
			$data = $this->db->getQuery($sql, [":applicatioNo" => $applicatioNo]);
			foreach ($data as $val) {
				$IDAmount = $val["IDAmount"];
				$Rate = $val["Rate"];
				$EsakStudentId = $val["EsakStudentId"];
				$EMUniqueId = $val["EMUniqueId"];
				$TagStatus = empty($val["TagStatus"]) ? 0 : $val["TagStatus"];
				$no_of_installment = empty($val["no_of_installment"]) ? 4 : $val["no_of_installment"];
			}
			// $Rate = 3551283;
			if ($IDAmount == 0 && $Rate == 0) {
				$return_array["success"] = false;
				$return_array["message"] = "Amount not found!";
			} else {
				$sql = "SELECT
					tran.FeeHeadID,
					pay.MihPayID,
					DATE_FORMAT(pay.TranStartDate, '%d-%m-%Y') AS TranStartDate, tran.AmountPaid as installmentamt
				FROM
					tblpayumoneylog pay
				INNER JOIN tblfeereceipt_tran tran ON
					tran.pgtranid = pay.txnid
				INNER JOIN tblinvtransaction inv ON
					inv.invoiceno = pay.txnid
				WHERE
					pay.EMUniqueId = :EMUniqueId AND tran.FeeHeadID IN(2, 3, 4, 5)
				ORDER BY pay.TranStartDate";
				$feeData = $this->db->getQuery($sql, [":EMUniqueId" => $EMUniqueId]);

				$sqlTotalAmountPaid = "SELECT
					tran.FeeHeadID,
					pay.MihPayID,
					DATE_FORMAT(pay.TranStartDate, '%d-%m-%Y') AS TranStartDate, tran.AmountPaid as installmentamt, SUM(tran.AmountPaid) AS totalAmountPaid
				FROM
					tblpayumoneylog pay
				INNER JOIN tblfeereceipt_tran tran ON
					tran.pgtranid = pay.txnid
				INNER JOIN tblinvtransaction inv ON
					inv.invoiceno = pay.txnid
				WHERE
					pay.EMUniqueId = :EMUniqueId AND tran.FeeHeadID IN(2, 3, 4, 5)
				ORDER BY pay.TranStartDate";
				$feeDataTotalAmountPaid = $this->db->getQuery($sqlTotalAmountPaid, [":EMUniqueId" => $EMUniqueId]);

				$totalAmountPaid = 0;
				if (count($feeDataTotalAmountPaid) > 0) {
					$totalAmountPaid = $feeDataTotalAmountPaid[0]["totalAmountPaid"];
				}
				$sqlAllotment = "SELECT DATE_FORMAT(tranno.invdate, '%Y-%m-%d') AS AllotmentDate FROM tblinvtranno tranno
				INNER JOIN tblinvtransaction inv ON inv.purchasereceiveid = tranno.tblinvtrannoid WHERE tranno.EMUniqueId = :EMUniqueId AND inv.transtype > 0";
				$stmtAllotment = $this->db->conn->prepare($sqlAllotment);
				$stmtAllotment->execute([
					":EMUniqueId" => $EMUniqueId,
				]);
				$AllotmentDate = null;
				if ($allotmentRow = $stmtAllotment->fetch()) {
					$AllotmentDate = $allotmentRow["AllotmentDate"];
				}
				$sqlCheck = "SELECT
					pay.MihPayID, pay.TranStartDate, pay.amount
				FROM
					tblpayumoneylog pay
				INNER JOIN tblfeereceipt_tran tran ON
					tran.pgtranid = pay.txnid
				WHERE
					pay.EMUniqueId = :EMUniqueId AND tran.FeeHeadID = 6";
				$stmtCheck = $this->db->conn->prepare($sqlCheck);
				$stmtCheck->execute([
					":EMUniqueId" => $EMUniqueId,
				]);

				if ($row = $stmtCheck->fetch()) {
					$isExtentionAmountPaid = empty($row["MihPayID"]) ? false : true;
					$extentionAmountPaymentID = empty($row["MihPayID"]) ? "" : $row["MihPayID"];
					$extentionAmountPaid = empty($row["MihPayID"]) ? "" : $row["amount"];
					$extentionFeeDate = empty($row["MihPayID"]) ? "" : date("d/m/Y", strtotime($row["TranStartDate"]));
				}

				$total_installment_amount = floatval($Rate) - floatval($IDAmount);

				$one_installment_amount = floatval($total_installment_amount / $no_of_installment);
				$todaysDate = date("Y-m-d"); //"2021-08-27";
				$date1 = date("Y-m-d", strtotime($AllotmentDate . "+ 31 days"));
				$date2 = date("Y-m-d", strtotime($date1 . "+ 31 days"));
				$date3 = date("Y-m-d", strtotime($date2 . "+ 31 days"));
				if ($isExtentionAmountPaid) {
					$date4 = date("Y-m-d", strtotime($date3 . "+ 31 days"));
					$date4 = date("Y-m-d", strtotime($date4 . "+ 31 days"));
				} else {
					$date4 = date("Y-m-d", strtotime($date3 . "+ 31 days"));
				}
				$showNoticeLetterFlag = 0;
				$noticeDate = "";
				$cancellationLetterdate = "";
				$return_array["success"] = true;
				$showCancellationLetterFlag = 0;

				$noticeLetterCheckArray = [];
				$paymentIdArray = [];
				$noticeDateArray = [];
				if (count($feeData) == 0) {
					$feeData[0]["MihPayID"] = "";
					$feeData[1]["MihPayID"] = "";
					$feeData[2]["MihPayID"] = "";
					$feeData[3]["MihPayID"] = "";
				}
				//Process for exchange
				$isExchanged = false;
				$exchangedFeeDate = '';
				$exchangedAmountPaymentID = '';
				$exchangedAmountPaid = 0;
				$sqlCheck = "SELECT pay.MihPayID, pay.TranStartDate, pay.amount
				FROM tblpayumoneylog pay
				INNER JOIN tblfeereceipt_tran tran ON tran.pgtranid = pay.txnid
				INNER JOIN tblinvtransaction inv ON inv.invoiceno = pay.txnid
				WHERE pay.EMUniqueId = :EMUniqueId AND tran.FeeHeadID = 9";
				$stmtCheck = $this->db->conn->prepare($sqlCheck);
				$stmtCheck->execute([
					":EMUniqueId" => $EMUniqueId,
				]);
				if ($row = $stmtCheck->fetch()) {
					$isExchanged = empty($row["MihPayID"]) ? false : true;
					$exchangedAmountPaymentID = empty($row["MihPayID"]) ? "" : $row["MihPayID"];
					$exchangedAmountPaid = empty($row["amount"]) ? 0 : $row["amount"];
					$exchangedFeeDate = empty($row["MihPayID"]) ? "" : date("d/m/Y", strtotime($row["TranStartDate"]));
				}
				$installmentArr = array();

				$ExchangeAmtBal = 0;
				if ($isExchanged) {
					$pendinginstallments = 4;
					$paidinstallments = 0;
					$totalamtdiff = 0;
					$AmountPaid = 0;
					$exchangeamtPaid = 0;
					// $feeData = [];
					foreach ($feeData as $key => $val) {
						if (isset($val['MihPayID']) && !empty($val['MihPayID'])) {
							if ($pendinginstallments > 0) {
								$pendinginstallments--;
								$paidinstallments++;
								$AmountPaid += $val['installmentamt'];
								$installmentArr['installmentamt_' . ($key + 1)] = $val['installmentamt'];
							} else {
								$exchangeamtPaid = $val['installmentamt'];
							}
						}
					}

					$totalamtdiff = floatval($total_installment_amount) - floatval($AmountPaid);
					if ($totalamtdiff > 0) {
						if ($pendinginstallments > 0) {
							$newinstallmentamt = floatval($totalamtdiff / $pendinginstallments);
							for ($i = $pendinginstallments; $i > 0; $i--) {
								$installmentArr['installmentamt_' . (++$paidinstallments)] = $newinstallmentamt;
							}
						} else {
							$ExchangeAmtBal = floatval($totalamtdiff) - floatval($exchangeamtPaid);
						}
					}
				}

				$datesArray = [
					"date1" => $date1,
					"date2" => $date2,
					"date3" => $date3,
					"date4" => $date4
				];
				
				// $idx = 0;
				// foreach ($feeData as $row) {
				// 	$paymentIdArray[] = empty($row["MihPayID"]) ? "" : $row["MihPayID"];
				// 	if (empty($row["MihPayID"]) && strtotime($todaysDate) > strtotime($date1) && $idx == 0 && $idx <= $TagStatus) {
				// 		$showCancellationLetterFlag = 0;

				// 		$showNoticeLetterFlag += 1;
				// 		$noticeLetterCheckArray[] = 1;
				// 		$noticeDateArray[] = date("d-m-Y", strtotime($date1 . "+1 days"));
				// 		// $showNoticeLetterFlag = 1;
				// 		// $noticeDate = date("d-m-Y", strtotime($date1, "+1 days"));
				// 	}
				// 	if (empty($row["MihPayID"]) && strtotime($todaysDate) > strtotime($date2) && $idx == 1 && $idx <= $TagStatus) {
				// 		$showCancellationLetterFlag = 0;

				// 		$showNoticeLetterFlag += 1;
				// 		$noticeLetterCheckArray[] = 2;
				// 		$noticeDateArray[] = date("d-m-Y", strtotime($date2 . "+1 days"));
				// 		// $showNoticeLetterFlag = 1;
				// 		// $noticeDate = date("d-m-Y", strtotime($date2, "+1 days"));
				// 	}
				// 	if (empty($row["MihPayID"]) && strtotime($todaysDate) > strtotime($date3) && $idx == 2 && $idx <= $TagStatus) {
				// 		$showCancellationLetterFlag = 0;
				// 		$showNoticeLetterFlag += 1;
				// 		$noticeLetterCheckArray[] = 3;
				// 		$noticeDateArray[] = date("d-m-Y", strtotime($date3 . "+1 days"));
				// 		// $showNoticeLetterFlag = 1;
				// 		// $noticeDate = date("d-m-Y", strtotime($date3, "+1 days"));
				// 	}
				// 	if (empty($row["MihPayID"]) && strtotime($todaysDate) > strtotime($date4) && $idx == 3 && $idx <= $TagStatus) {
				// 		$showCancellationLetterFlag = 0;
				// 		$showNoticeLetterFlag += 1;
				// 		$noticeLetterCheckArray[] = 4;
				// 		$noticeDateArray[] = date("d-m-Y", strtotime($date4 . "+1 days"));
				// 		// $cancellationLetterdate = date("d-m-Y", strtotime($date4, "+1 days"));

				// 	}
				// 	$idx++;
				// }

				$idx = 0;
				foreach ($feeData as $row) {
					
					$paymentIdArray[] = empty($row["MihPayID"]) ? "" : $row["MihPayID"];
					for ($i = 0; $i < $no_of_installment; $i++) {
						// $dateVar = "date" . ($i + 1);
						$dateVar = $datesArray["date" . ($i + 1)];
						if (
							empty($row["MihPayID"]) &&
							strtotime($todaysDate) > strtotime($dateVar) &&
							$idx == $i &&
							$idx <= $TagStatus
						) {
							$showCancellationLetterFlag = 0;
							$showNoticeLetterFlag += 1;
							$noticeLetterCheckArray[] = $i + 1;
							$noticeDateArray[] = date("d-m-Y", strtotime($dateVar . "+1 days"));
						}
					}
					$idx++;
				}
				if ($showNoticeLetterFlag == 4) {
					$showCancellationLetterFlag = 1;
					$cancellationLetterdate = date("d-m-Y", strtotime($date4 . "+1 days"));
				} else {
					$showCancellationLetterFlag = 0;
					$cancellationLetterdate = "";
				}

				// $dates = [
				// 	[
				// 		"date_1" => $date1,
				// 		"FeeHeadID" => empty($feeData[0]["FeeHeadID"]) ? 1 : $feeData[0]["FeeHeadID"],
				// 		"MihPayID" => empty($paymentIdArray[0]) ? "" : $paymentIdArray[0],
				// 		"TranStartDate" => empty($feeData[0]["TranStartDate"]) ? "" : $feeData[0]["TranStartDate"],
				// 		"installmentamount" => empty($installmentArr['installmentamt_1']) ? 0 : $installmentArr['installmentamt_1']
				// 	],
				// 	[
				// 		"date_2" => $date2,
				// 		"FeeHeadID" => empty($feeData[1]["FeeHeadID"]) ? 1 : $feeData[1]["FeeHeadID"],
				// 		// "MihPayID"=> empty($feeData[1]["MihPayID"]) ? "" : $feeData[1]["MihPayID"],
				// 		"MihPayID" => empty($paymentIdArray[1]) ? "" : $paymentIdArray[1],

				// 		"TranStartDate" => empty($feeData[1]["TranStartDate"]) ? "" : $feeData[1]["TranStartDate"],
				// 		"installmentamount" => empty($installmentArr['installmentamt_2']) ? 0 : $installmentArr['installmentamt_2']
				// 	],
				// 	[
				// 		"date_3" => $date3,
				// 		"FeeHeadID" => empty($feeData[2]["FeeHeadID"]) ? 1 : $feeData[2]["FeeHeadID"],
				// 		// "MihPayID"=> empty($feeData[2]["MihPayID"]) ? "" : $feeData[2]["MihPayID"],
				// 		"MihPayID" => empty($paymentIdArray[2]) ? "" : $paymentIdArray[2],
				// 		"TranStartDate" => empty($feeData[2]["TranStartDate"]) ? "" : $feeData[2]["TranStartDate"],
				// 		"installmentamount" => empty($installmentArr['installmentamt_3']) ? 0 : $installmentArr['installmentamt_3']
				// 	],
				// 	[
				// 		"date_4" => $date4,
				// 		"FeeHeadID" => empty($feeData[3]["FeeHeadID"]) ? 1 : $feeData[3]["FeeHeadID"],
				// 		// "MihPayID"=> empty($feeData[3]["MihPayID"]) ? "" : $feeData[3]["MihPayID"],
				// 		"MihPayID" => empty($paymentIdArray[3]) ? "" : $paymentIdArray[3],
				// 		"TranStartDate" => empty($feeData[3]["TranStartDate"]) ? "" : $feeData[3]["TranStartDate"],
				// 		"installmentamount" => empty($installmentArr['installmentamt_4']) ? 0 : $installmentArr['installmentamt_4']
				// 	],
				// ];

				
				$dates = [];
				
				for ($i = 0; $i < $no_of_installment; $i++) {
					// $dateVar = "date" . ($i + 1);
					$counter = $i + 1;
					$dateVar = $datesArray["date" . ($counter)];
					$dates[] = [
						"date_" . ($counter) => $dateVar, // Correct dynamic key name
						"FeeHeadID" => empty($feeData[$i]["FeeHeadID"]) ? 1 : $feeData[$i]["FeeHeadID"],
						"MihPayID" => empty($paymentIdArray[$i]) ? "" : $paymentIdArray[$i],
						"TranStartDate" => empty($feeData[$i]["TranStartDate"]) ? "" : $feeData[$i]["TranStartDate"],
						"installmentamount" => empty($installmentArr["installmentamt_" . ($counter)]) ? 0 : $installmentArr["installmentamt_" . ($counter)]
					];
				}
				$return_array["data"] = [
					"showCancellationLetterFlag" => $showCancellationLetterFlag,
					"cancellationDate" => $cancellationLetterdate,
					"showNoticeLetterFlag" => $showNoticeLetterFlag,
					"noticeDate" => $noticeDateArray,
					"TagStatus" => $TagStatus,
					"AllotmentDate" => date("d-m-Y", strtotime($AllotmentDate)),
					"total_installment_amount" => $total_installment_amount,
					"one_installment_amount" => $one_installment_amount,
					"cost" => $Rate,
					"IDAmount" => $IDAmount,
					"isExtentionAmountPaid" => $isExtentionAmountPaid,
					"extentionAmountPaymentID" => $extentionAmountPaymentID,
					"extentionFeeDate" => $extentionFeeDate,
					"extentionAmountPaid" => $extentionAmountPaid,
					"exchangeflag" => $isExchanged,
					"exchangedAmountPaymentID" => $exchangedAmountPaymentID,
					"exchangedFeeDate" => $exchangedFeeDate,
					"exchangeamount" => $ExchangeAmtBal,
					"exchangeamtPaid" => $exchangeamtPaid,
					"exchangedAmountPaid" => $exchangedAmountPaid,
					"EsakStudentId" => $EsakStudentId,
					"totalAmountPaid" => $totalAmountPaid,
					"dates" => $dates,
					"no_of_installment" => $no_of_installment
				];
				
				
			}
			
			return $return_array;
		} catch (Exception $e) {
			$return_array = [];
			$return_array["success"] = false;
			$return_array["data"] = [];
			$return_array["message"] = $e->getMessage();
			return $return_array;
		}
	}
	public function sendMailToApplicant($params)
	{
		try {
			$MailService = new fill_em_mailqueue();
			$transactionId = $params["tranId"];
			$return_array = [];
			$sql = "SELECT
				st.EMUniqueId,
				st.Fname AS StudentName,
				pt.PapaMobileNo,
				pt.PapaEmailID_Primary
			FROM
				tblinvtransaction inv
			INNER JOIN masteraddstudent st ON
				st.EMUniqueId = inv.accountid
			INNER JOIN masteraddparent pt ON
				pt.EsakParentId = st.ParentId
			WHERE
				inv.transactionid = :transactionId AND st.Status != 0";
			$data = $this->db->getQuery($sql, [":transactionId" => $transactionId])[0];
			if (!empty($data)) {
				$sqlInsert = "INSERT INTO tblinvtranno(EMUniqueId, invdate, invdesc)
				VALUES(:EMUniqueId, :CurrentDate, :invdesc)";
				$stmt = $this->db->conn->prepare($sqlInsert);
				$stmt->execute([
					":EMUniqueId" => $data["EMUniqueId"],
					":CurrentDate" => date("Y-m-d H:i:s"),
					":invdesc" => "Allotment Letter",
				]);
				$tblinvtrannoid = $this->db->conn->lastInsertId();
				$sqlUpdate = "UPDATE
					tblinvtransaction
				SET
					`purchasereceiveid` = :tblinvtrannoid
				WHERE
					`transactionid` = :transactionId";
				$stmt = $this->db->conn->prepare($sqlUpdate);
				$stmt->execute([
					":tblinvtrannoid" => $tblinvtrannoid,
					":transactionId" => $transactionId,
				]);
				$invetory = new Inventory();
				$loggedinuserEMUniqueId = $_SESSION['EMUniqueId'];
				$updatedToStageId = 3; //Allotted

				$invetory->updateCandidatesStage($data["EMUniqueId"], $loggedinuserEMUniqueId, $updatedToStageId);

				$applicant_emailid = $data["PapaEmailID_Primary"];
				$message = "Dear " . $data["StudentName"] . ",<br/>
				Your Allotment is approved, please find below link for Allotment Letter.<br/>
				<a href='https://" . $_SERVER["HTTP_HOST"] . "/V2/onlineadmissionform/KHB_AllotmentLetter.html?tranId=" . $transactionId . "'>https://" . $_SERVER["HTTP_HOST"] . "/V2/onlineadmissionform/KHB_AllotmentLetter.html?tranId=" . $transactionId . "</a><br/>

				Regards,<br/>
				Karnataka Housing Board";
				$html = 1;
				$send_at = 0;
				$transactionid = time();
				$subject = "Allotment Letter";
				$from = "Karnataka Housing Board <khb_do_not_reply@login.edumerge.com>";
				if (trim($send_at) == "" || trim($send_at) == 0) {
					$send_at = time();
				}
				$senttime = date("Y-m-d H:i:s");
				$finalmessage = $message;
				$fileuploaded = "";
				$check = $MailService->queueMails($finalmessage, $applicant_emailid, $from, $subject, $html, "", "", "", $send_at, 0, 0, "EM5249");
				// $return_array["is_sent"] = $check;
				$return_array["success"] = true;
				// $return_array["server"] = $_SERVER;
			} else {
				$return_array["message"] = "No record found!";
				$return_array["success"] = false;
			}

			return $return_array;
		} catch (Exception $e) {
			$return_array = [];
			$return_array["message"] = $e->getMessage();
			$return_array["success"] = false;
			return $return_array;
		}
	}
	public function updateStatusOnReject($params)
	{
		try {
			$transactionId = $params["tranId"];
			$return_array = [];
			$sql = "SELECT
				st.EMUniqueId,
				st.Fname AS StudentName,
				pt.PapaMobileNo,
				pt.PapaEmailID_Primary
			FROM
				tblinvtransaction inv
			INNER JOIN masteraddstudent st ON
				st.EMUniqueId = inv.accountid
			INNER JOIN masteraddparent pt ON
				pt.EsakParentId = st.ParentId
			WHERE
				inv.transactionid = :transactionId";
			$data = $this->db->getQuery($sql, [":transactionId" => $transactionId])[0];
			if (!empty($data)) {
				$sqlInsert = "INSERT INTO tblinvtranno(EMUniqueId, invdate, invdesc)
				VALUES(:EMUniqueId, :CurrentDate, :invdesc)";
				$stmt = $this->db->conn->prepare($sqlInsert);
				$stmt->execute([
					":EMUniqueId" => $data["EMUniqueId"],
					":CurrentDate" => date("Y-m-d H:i:s"),
					":invdesc" => "Application Rejected",
				]);
				$tblinvtrannoid = $this->db->conn->lastInsertId();
				$sqlUpdate = "UPDATE
					tblinvtransaction
				SET
					`purchasereceiveid` = :tblinvtrannoid,
					 transtype = -1
				WHERE
					`transactionid` = :transactionId";
				$stmt = $this->db->conn->prepare($sqlUpdate);
				$stmt->execute([
					":tblinvtrannoid" => $tblinvtrannoid,
					":transactionId" => $transactionId,
				]);
				// $return_array["is_sent"] = $check;
				$return_array["success"] = true;
				// $return_array["server"] = $_SERVER;
			} else {
				$return_array["message"] = "No record found!";
				$return_array["success"] = false;
			}

			return $return_array;
		} catch (Exception $e) {
			$return_array = [];
			$return_array["message"] = $e->getMessage();
			$return_array["success"] = false;
			return $return_array;
		}
	}
	public function saveNoticeStatus($params)
	{
		try {
			$NoOfInstalment = $params["NoOfInstalment"];
			$ApplicatioNo = $params["ApplicatioNo"];
			$return_array = [];
			$sql = "UPDATE masteraddstudent st SET st.TagStatus = :NoOfInstalment WHERE st.AdmissionNo = :ApplicatioNo";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute([
				":NoOfInstalment" => $NoOfInstalment,
				":ApplicatioNo" => $ApplicatioNo,
			]);
			$return_array["success"] = true;
			return $return_array;
		} catch (Exception $e) {
			$return_array = [];
			$return_array["message"] = $e->getMessage();
			$return_array["success"] = false;
			return $return_array;
		}
	}
	public function getProductDesc($params)
	{
		try {
			$propertyno = trim($params["propertyno"]);
			$projectid = trim($params["projectid"]);
			$return_array = [];
			if ($projectid == 0) {
				$sql = "SELECT ProductDesc, Rate FROM `tblproduct` WHERE `ProductName` = :propertyno";
				$stmt = $this->db->conn->prepare($sql);
				$stmt->execute([
					":propertyno" => $propertyno
				]);
			} else {
				$sql = "SELECT prod.ProductDesc, prod.Rate, proj.no_of_installment FROM tblproduct AS prod
					INNER JOIN tblproject AS proj ON proj.ProjectId = prod.ProjectId
				WHERE prod.ProductName = :propertyno AND prod.ProjectId = :ProjectId";
				$stmt = $this->db->conn->prepare($sql);
				$stmt->execute([
					":propertyno" => $propertyno,
					":ProjectId" => $projectid
				]);
			}
			if ($row = $stmt->fetch()) {
				$return_array["ProductDesc"] = trim($row["ProductDesc"]);
				$return_array["ProductCost"] = trim($row["Rate"]);
				$return_array["no_of_installment"] = trim($row["no_of_installment"]);
			} else {
				$return_array["ProductDesc"] = null;
				$return_array["ProductCost"] = null;
				$return_array["no_of_installment"] = 0;
			}
			$return_array["success"] = true;
			
			
			return $return_array;

		} catch (Exception $e) {
			$return_array = [];
			$return_array["message"] = $e->getMessage();
			$return_array["success"] = false;
			return $return_array;
		}
	}
	public function updateApplicantContactInfo($params)
	{
		try {
			$return_array = [];
			if ($_SESSION["profileid"] != 10 && $_SESSION["profileid"] != 8 && $_SESSION["profileid"] != 6) {
				$return_array["error_message"] = "Unauthorised access! Pelase re-login to your account!";
				$return_array["success"] = false;
				return $return_array;
			}
			$ApplicationNo = trim($params["ApplicationNo"]);
			$mobileno = trim($params["mobileno"]);
			$emailid = trim($params["emailid"]);
			$accountnumber = trim($params["accountnumber"]);
			$tranId = trim($params["tranId"]);
			$ApplicationAllotmentDate = trim($params["ApplicationAllotmentDate"]);
			$return_array = [];
			// $sql = "UPDATE masteraddstudent ";
			$sql = "UPDATE masteraddparent pt INNER JOIN masteraddstudent st ON st.ParentId = pt.EsakParentId SET pt.PapaMobileNo = :mobileno, pt.PapaEmailID_Primary = :emailid, pt.PapaOfficeFax = :accountnumber WHERE st.AdmissionNo = :ApplicationNo";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute([
				":mobileno" => $mobileno,
				":emailid" => $emailid,
				":accountnumber" => $accountnumber,
				":ApplicationNo" => $ApplicationNo
			]);
			if ($ApplicationAllotmentDate != "") {
				if ($this->validateDate($ApplicationAllotmentDate)) {
					$ApplicationAllotmentDate = date("Y-m-d", strtotime($ApplicationAllotmentDate));
					$sql = "UPDATE tblinvtranno invno 
					INNER JOIN tblinvtransaction inv ON invno.tblinvtrannoid = inv.purchasereceiveid SET invno.invdate = :ApplicationAllotmentDate 
					WHERE inv.transactionid = :tranId AND inv.transtype = 10 AND inv.purchasereceiveid > 0";
					$stmt = $this->db->conn->prepare($sql);
					$stmt->execute([
						":ApplicationAllotmentDate" => $ApplicationAllotmentDate,
						":tranId" => $tranId
					]);
				}
			}
			$return_array["success"] = true;
			return $return_array;
		} catch (Exception $e) {
			$return_array = [];
			$return_array["error_message"] = $e->getMessage();
			$return_array["success"] = false;
			return $return_array;
		}
	}
	public function getAmountDetailsForExchange($params)
	{
		$applicationno = $params['applicationno'];
		$newpropertyno = $params['new_propertyno'];
		$oldpropertycost = 0;
		$newpropertycost = 0;
		$diff_in_amt = 0;
		$exchange_fee = 0;
		$total_payable_amt = 0;
		$AmountPaid = 0;
		$noofinstallments = 0;
		$allotmentdate = '';

		$sendArr = array();
		if (!empty($applicationno) && !empty($newpropertyno)) {
			$sql = "SELECT ProductDesc, Rate FROM `tblproduct` WHERE `ProductName` = :propertyno";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute([
				":propertyno" => $newpropertyno
			]);
			if ($row = $stmt->fetch()) {
				$newpropertycost = $row['Rate'];
			}
			//calculate exchange fee
			$percentage = 1;
			$exchange_fee = round(floatval(($percentage / 100) * $newpropertycost), 2);
			$paymentScheduleInfo = $this->getPaymentScheduleDetails(["applicatioNo" => $applicationno]);

			
			$allotmentdate = $paymentScheduleInfo['data']['AllotmentDate'];
			$oldpropertycost = $paymentScheduleInfo['data']['cost'];
			$IDAmount = $paymentScheduleInfo['data']['IDAmount'];
			$InstallmentAmount = $paymentScheduleInfo['data']['one_installment_amount'];
			$AmountPaid = $IDAmount;
			$installmentDate4 = '';
			foreach ($paymentScheduleInfo['data']['dates'] as $key => $val) {
				$TranID = $val['MihPayID'];
				$installmentDate4 = $val['date_4'];
				if (isset($TranID) && !empty($TranID)) {
					$AmountPaid += $InstallmentAmount;
					$noofinstallments += 1;
				}
			}
			$diff_in_amt = floatval($newpropertycost) - floatval($AmountPaid);
			$todaysDate = date("Y-m-d");
			$eligibleForExchange = 0;
			$eligibilitydate = date("Y-m-d", strtotime($todaysDate . "+ 15 days"));
			if (strtotime($installmentDate4) >  strtotime($eligibilitydate)) {
				$eligibleForExchange = 1;
				if ($diff_in_amt > 0) {
					if (strtotime($todaysDate) > strtotime($installmentDate4)) {
						$total_payable_amt = round((floatval($diff_in_amt) + floatval($exchange_fee)), 2);
					} else {
						$total_payable_amt = floatval($exchange_fee);
					}
				} else {
					$amounttoget = $diff_in_amt * -1;
					$total_payable_amt = round((floatval($exchange_fee) - floatval($amounttoget)), 2);
					if ($total_payable_amt < 0) {
						$diff_in_amt = $total_payable_amt;
						$total_payable_amt = 0;
					}
				}
			}
		}
		$formatted_insdate = date("d-m-Y", strtotime($installmentDate4));
		$final_total_payable = round((floatval($total_payable_amt) + floatval($diff_in_amt)), 2);
		$sendArr = array(
			'oldpropertycost' => $oldpropertycost,
			'newpropertycost' => $newpropertycost,
			'diff_in_amt' => $diff_in_amt,
			'amountpaid' => $AmountPaid,
			'exchangefee' => $exchange_fee,
			'amountpayable' => $total_payable_amt,
			'noofinstallments' => $noofinstallments,
			'lastinstallmentdate' => $formatted_insdate,
			'allotmentdate' => $allotmentdate,
			'eligibleForExchange' => $eligibleForExchange,
			'final_total_payable' => $final_total_payable
		);
		return $sendArr;
	}
	public function saveexchangedetails($postdata)
	{
		$data = $postdata['applicationdata'];
		$propertyno = $data['propertyno'];
		$EsakStudentId = $data['EsakStudentId'];

		$sql = "UPDATE tblproduct prod SET prod.LockedUpTo = :LockedUpTo  WHERE prod.assetno = :Enrolment_no";
		$stmt = $this->db->conn->prepare($sql);
		$Enrolment_no = $propertyno;
		$stmt->execute([
			":LockedUpTo" => date('Y-m-d H:i:s', strtotime("+5 min")),
			":Enrolment_no" => $Enrolment_no
		]);

		$return_array = array();
		$return_array['EsakStudentId'] = $EsakStudentId;
		return $return_array;
	}
	public function initiaterefund($data = array())
	{
		try {
			$EsakStudentId = $data['EsakStudentId'];
			$oldpropertyno = $data['oldpropertyno'];
			$newpropertyno = $data['newpropertyno'];
			$refundamount = $data['refundamount'];

			//Get Application details
			$sql = "SELECT st.EsakStudentId, st.EMUniqueId, st.AdmissionNo, st.Enrolment_no, st.StandardSectionId FROM masteraddstudent st WHERE st.EsakStudentId=:EsakStudentId";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute(array(":EsakStudentId" => $EsakStudentId));
			$results = $stmt->fetchAll();
			$EMUniqueId = $results[0]['EMUniqueId'];
			$projectid = $results[0]['StandardSectionId'];
			$AdmissionNo = $results[0]['AdmissionNo'];

			//Update new and old property
			$sql = "UPDATE masteraddstudent SET Enrolment_no=:newpropertyno, ReasonForLeaving=:oldpropertyno  WHERE EsakStudentId=:EsakStudentId";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute(array(":newpropertyno" => $newpropertyno, ":oldpropertyno" => $oldpropertyno, ":EsakStudentId" => $EsakStudentId));

			$sqlProduct = "SELECT `ProductId`, `Rate`, `ProjectId`
			FROM `tblproduct` WHERE `assetno` = :Enrolment_no  AND ProjectId = :ProjectId GROUP BY `assetno`";
			$stmtProduct = $this->db->conn->prepare($sqlProduct);
			$stmtProduct->execute(array(
				":Enrolment_no" => $newpropertyno,
				":ProjectId" => $projectid
			));
			$prodres = $stmtProduct->fetchAll();
			$productid = $prodres[0]['ProductId'];
			$rate = $prodres[0]['Rate'];

			//update product id in inv transaction
			$sql = "UPDATE `tblinvtransaction` SET productid = :productid, cost = :cost, purchasereceiveid = :purchasereceiveid
			WHERE `accountid` = :accountid";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute([
				":productid" => $productid,
				":accountid" => $EMUniqueId,
				":cost" => $rate,
				":purchasereceiveid" => -1
			]);

			//Update booked status for old property
			$sql = "UPDATE `tblproduct` SET Booked = 0 WHERE `assetno` = :Enrolment_no  AND ProjectId = :ProjectId";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute([
				":Enrolment_no" => $oldpropertyno,
				":ProjectId" => $projectid
			]);

			//Update diff in property 
			$sql = "UPDATE `tblproduct` SET Booked = 1, RefundAmount = :RefundAmount
			WHERE `ProductId` = :ProductId";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute([
				":ProductId" => $productid,
				":RefundAmount" => $refundamount
			]);

			//Checking Candidates existing Stage
			$sql = "SELECT CandidateStagesID FROM CandidateCurrentStage WHERE CandidateEMUniqueId = :EMUniqueId";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute([
				":EMUniqueId" => $EMUniqueId
			]);
			if ($canRow = $stmt->fetch()) {
				//Changing Candidate Status to Exchange Refund Verification
				$stageUpdateSql = "UPDATE CandidateCurrentStage SET CandidateStagesID = 9 WHERE CandidateEMUniqueId = :EMUniqueId";
				$stageUpdateStmt = $this->db->conn->prepare($stageUpdateSql);
				$stageUpdateStmt->execute([
					":EMUniqueId" => $EMUniqueId
				]);
			} else {
				$sql = "INSERT INTO `CandidateCurrentStage`(`CandidateStagesID`, `CandidateEMUniqueId`, `CandidateApplicationNo`) VALUES (9, :EMUniqueId, :AdmissionNo)";
				$stmt = $this->db->conn->prepare($sql);
				$stmt->execute([
					":EMUniqueId" => $EMUniqueId,
					":AdmissionNo" => $AdmissionNo
				]);
			}
			$sql1 = "INSERT INTO `CandidateStageHistory`(`CandidateStagesID`, `CandidateEMUniqueId`, `CreatorEMUniqueId`) VALUES (9, :EMUniqueId, -1)";
			$stmt1 = $this->db->conn->prepare($sql1);
			$stmt1->execute([
				":EMUniqueId" => $EMUniqueId
			]);

			$return_array = [];
			$return_array["success"] = true;
			$return_array["message"] = "success";
			return $return_array;
		} catch (Exception $e) {
			$return_array = [];
			$return_array["success"] = false;
			$return_array["message"] = $e->getMessage();
			return $return_array;
		}
	}
	private function validateDate($date, $format = 'Y-m-d')
	{
		$d = DateTime::createFromFormat($format, $date);
		return $d && $d->format($format) == $date;
	}

	public function applyForRefund($params = [])
	{
		try {
			$return_array = [];
			if (empty($params['ApplicationNo']) || empty($params['reasonForRefund']) || empty($params['OTP'])) {
				$return_array["success"] = false;
				$return_array["error_message"] = "Empty parameter detected!";
				return $return_array;
			}
			$checkOTP = $this->validateappOTP(["OTP_data" => [
				"applicationno" => $params['ApplicationNo'],
				"OTP" => $params['OTP']
			]]);
			if ($checkOTP['Error_Code'] > 0) {
				$return_array["success"] = false;
				$return_array["error_message"] = $checkOTP["OTP_Error"];
				return $return_array;
			}
			$sql = "UPDATE
				masteraddparent
			SET
				PreviousPlace = :reasonForRefund,
				MotherHouse = 'Cancellation Applied By User'
			WHERE
				EsakParentId =(
				SELECT
					st.ParentId
				FROM
					masteraddstudent st
				WHERE
					st.AdmissionNo = :ApplicationNo
			)";
			$stmt = $this->db->conn->prepare($sql);
			$stmt->execute([
				":reasonForRefund" => $params['reasonForRefund'],
				":ApplicationNo" => $params['ApplicationNo']
			]);
			//Moving to Cancellation Verification
			$stageUpdateSql = "UPDATE CandidateCurrentStage SET CandidateStagesID = 11 WHERE CandidateEMUniqueId = (SELECT
				st.EMUniqueId
			FROM
				masteraddstudent st
			WHERE
				st.AdmissionNo = :ApplicationNo
			)";
			$stmtStageUpdate = $this->db->conn->prepare($stageUpdateSql);
			$stmtStageUpdate->execute([
				":ApplicationNo" => $params['ApplicationNo']
			]);
			$return_array["success"] = true;
			return $return_array;
		} catch (Exception $e) {
			$return_array = [];
			$return_array["success"] = false;
			$return_array["error_message"] = $e->getMessage();
			return $return_array;
		}
	}
}
