//khb,js
const urlParams = new URLSearchParams(window.location.search);
const tranId = urlParams.get('tranId');
let isPrint = 0;
let isShowCancellationLetter = 0;
let isShowNoticeLetter = 0;
let NoOfInstalment = null;
let GlobalUserApplicatioNo = null;
let exchange_flag = false;
let no_of_installments = 0;
if (urlParams.has("print")) {
    isPrint = urlParams.get('print');
}
if (urlParams.has("showCancellation")) {
    isShowCancellationLetter = urlParams.get('showCancellation');
}
if (urlParams.has("showNotice")) {
    isShowNoticeLetter = urlParams.get('showNotice');
}

let GlobalEsakStudentId = 0;
$(document).ajaxStart(function () {
    //ajax request went so show the loading image
    $("div.loading_icon").removeClass("hidden");
});
$(document).ajaxStop(function () {
    //got response so hide the loading image
    $("div.loading_icon").addClass("hidden");
});

$(document).ready(function () {
    $(`<div class="loading_icon hidden">
        <center>
            <img src="https://app.edumerge.com/V2/security/ui/images/loading_icon.gif" alt="Loading..." />
            <br />
            <b>Loading...</b>
        </center>
    </div>`).prependTo("body");
    // document.oncontextmenu = document.body.oncontextmenu = function() {return false;}
    if (isShowCancellationLetter == 1) {
        // console.log("isshowcancellation")
        $("#PaymentCancellationBlock").removeClass("hidden");
        $("#RequestExtentionBlock").addClass("hidden");
        $("#PaymentScheduleBlock").addClass("hidden");
        $("#PaymentNoticeLetter1").addClass("hidden");
        $("#PaymentNoticeLetter2").addClass("hidden");
        $("#PaymentNoticeLetter3").addClass("hidden");
        $("#PaymentNoticeLetter4").addClass("hidden");
    }
    if (isShowNoticeLetter == 1) {
        // console.log("isshowcancellation")
        $("#PaymentCancellationBlock").addClass("hidden");
        $("#RequestExtentionBlock").addClass("hidden");
        $("#PaymentScheduleBlock").addClass("hidden");
        $("#PaymentNoticeLetter1").removeClass("hidden");
    }
    $("select").select2({
        matcher: matchCustom
    });
    if ($.trim(tranId) > 0) {
        $(".OTPdiv").hide();
        $(".invdiv").show();
        showapplicationdetails("", tranId);
        if (isPrint == 1) {
            $("#btnapprove").hide();
            $("#btnreject").hide();
            // $("#btn_contact_update").hide();
        } else {
            $("#btnapprove").show();
            $("#btnreject").show();
            // $("#btn_contact_update").show();
        }
    } else {
        $(".OTPdiv").show();
        $(".invdiv").hide();
        getAllDistricts('#seldistrict');
    }
    get_notification_details();
    get_districts_without_noticefication_id();
    $("#selnotificationno").on('change', function () {
        // let notification_id = $(this).val();
        // get_districts(notification_id);
        $("input[name='PropertyTypeRadioOptions']").prop("checked", false);
        emptySelectBoxes();
    });
    $('input[name=PropertyTypeRadioOptions]').change(function () {
        let projectid = $("#selproject").val();
        let propertytype = $("input[name=PropertyTypeRadioOptions]:checked").val();
        $("#property_flats").empty();
        $("#property_sites_or_house").empty();
        $("#property_flats").trigger("change");
        $("#property_sites_or_house").trigger("change");
        $("#property_cost").val('');
        getproperties(projectid, propertytype);
    });
    $(document).on("change", "#selproperty", function () {
        let propertyno = $(this).val();
        let projectid = $("#selproject").val();
        let propertytype = $("input[name=PropertyTypeRadioOptions]:checked").val();
        getProductDesc(propertyno, propertytype, projectid);
        getregistrationfee(propertyno);
    });
    $(document).on("click", "#btnregister", function () {
        let notificationno = $("#selnotificationno").val();
        if (notificationno == 0) {
            emalert("Select a Notification No.");
            return false;
        }
        let districtid = $("#select_project_district").val();
        if (districtid == 0) {
            emalert("Select a District");
            return false;
        }
        let projectid = $("#selproject").val();
        if (projectid == 0) {
            emalert("Select a Project");
            return false;
        }
        let propertytype = $("input[name=PropertyTypeRadioOptions]:checked").val();
        if ($.trim(propertytype) == "") {
            emalert("Select a Property Type");
            return false;
        }

        let propertycategory = $("#property_sites_or_house").val();
        let propertyflat = $("#property_flats").val();
        if (propertytype == 'House' || propertytype == "Site") {
            if ($.trim(propertycategory) == "") {
                emalert("Select Property Category");
                return false;
            }
        }
        if (propertytype == "Flat") {
            if ($.trim(propertyflat) == "") {
                emalert("Select Flat Category");
                return false;
            }
        }
        let propertyno = $("#selproperty").val();
        if ($.trim(propertyno) == "0") {
            emalert("Select Property No.");
            return false;
        }
        let registrationtype = $("input[name=isJointRegistration]:checked").val();
        if ($.trim(registrationtype) == "") {
            emalert("Select Registration Type");
            return false;
        }
        // let applicationno = $("#applicationno").val();
        let applicationno = $("#applicationno").data("ApplicationNo");
        let EsakStudentId = $("#applicationno").data("EsakStudentId");
        if ($.trim(applicationno) == '') {
            emalert("Application No has not been generated.");
            return false;
        }
        let applicantname = $("#applicantname").val();
        if ($.trim(applicantname) == "") {
            emalert("Enter Applicant Name");
            return false;
        }
        let spousename = $("#spousename").val();
        if ($.trim(spousename) == "") {
            emalert("Enter Father/Husband/Wife's Name");
            return false;
        }
        let gender = $("input[name=gender]:checked").val();
        if ($.trim(gender) == "") {
            emalert("Select a Gender");
            return false;
        }
        let applicantDOB = $("#applicantdob").val();
        if ($.trim(applicantDOB) == "") {
            emalert("Enter Applicant's Date of Birth");
            return false;
        }
        let applicantpan = $("#applicantpan").val();
        if ($.trim(applicantpan) == "") {
            emalert("Enter Applicant's PAN No.");
            return false;
        }
        if (applicantpan.trim().length != 10) {
            emalert("Enter Valid PAN No.");
            return false;
        }
        let applicantaadharno = $("#applicantaadharno").val();
        if ($.trim(applicantaadharno) == "") {
            emalert("Enter Applicant's Aadhar No.");
            return false;
        }
        if (applicantaadharno.trim().length != 12) {
            emalert("Enter Valid Aadhar No.");
            return false;
        }

        let religion = $("#selreligion").val();
        if (religion == "0") {
            emalert("Select a Religion");
            return false;
        }
        if (religion == "Others") {
            let otherreligion = $("#other_religion").val();
            if ($.trim(otherreligion) == "") {
                emalert("Enter Other Religion");
                return false;
            }
            religion = otherreligion;
        }
        let reservation = $("#selreservation").val();
        if (reservation == "0") {
            emalert("Select a Reservation");
            return false;
        }
        if (reservation == "Others") {
            let otherreservation = $("#other_reservation").val();
            if ($.trim(otherreservation) == "") {
                emalert("Enter Other Reservation");
                return false;
            }
            reservation = otherreservation;
        }
        let annualincome = 0;
        if ($(".income_slab_opt_one_block").is(":visible")) {
            annualincome = $("#income_slab_opt_one").val();
            if (annualincome == "0") {
                emalert("Select Annual Income");
                return false;
            }
        } else {
            annualincome = $("#income_slab_opt_two").val();
            if (annualincome == "0") {
                emalert("Select Annual Income");
                return false;
            }
        }
        let noofyearsinkarnataka = $("#noofyearsinkarnataka").val();
        if ($.trim(noofyearsinkarnataka) == "") {
            emalert("Enter No. of Years in Karnataka");
            return false;
        }
        let nomineename = $("#nomineename").val();
        if ($.trim(nomineename) == "") {
            emalert("Enter Nominee Name");
            return false;
        }
        let nomineerelation = $("#selnomineerelation").val();
        if ($.trim(nomineerelation) == "") {
            emalert("Select Nominee Relation");
            return false;
        }
        let address1 = $("#address1").val();
        let address2 = $("#address2").val();
        let address3 = $("#address3").val();
        let address4 = $("#address4").val();
        if ($.trim(address1) == "" && $.trim(address2) == "" && $.trim(address3) == "" && $.trim(address4) == "") {
            emalert("Enter either Address1 or Address2 or Address3 or Address4");
            return false;
        }
        let comdistrict = $.trim($("#seldistrict").val());
        if ($.trim(comdistrict) == "") {
            emalert("Select a District for communication");
            return false;
        }
        let pincode = $.trim($("#Pincode").val());
        if ($.trim(pincode) == "") {
            emalert("Enter Pincode");
            return false;
        }
        let mobileno = $.trim($("#mobileno").val());
        let emailid = $.trim($("#emailid").val());
        if (mobileno == "" && emailid == "") {
            emalert("Enter either Mobile No or Email Id");
            return false;
        }
        if (mobileno.length != 10) {
            emalert("Enter Valid 10 digit Mobile No.");
            return false;
        }
        if (isNaN(mobileno)) {
            emalert("Enter Valid 10 digit Mobile No.");
            return false;
        }
        if ($.trim(emailid) != "") {
            if (!isEmail(emailid)) {
                emalert("Enter a valid Email Id");
                return false;
            }
        }
        let bankname = $.trim($("#bankname").val());
        if (bankname == "") {
            emalert("Enter Bank Name");
            return false;
        }
        let branchname = $.trim($("#branchname").val());
        if (branchname == "") {
            emalert("Enter Branch Name");
            return false;
        }
        let ifsccode = $.trim($("#ifsccode").val());
        if (ifsccode == "") {
            emalert("Enter IFS Code");
            return false;
        }
        let accountnumber = $.trim($("#accountnumber").val());
        if (accountnumber == "") {
            emalert("Enter Bank A/c No.");
            return false;
        }
        let conaccountnumber = $.trim($("#conaccountnumber").val());
        if (conaccountnumber == "") {
            emalert("Enter Confirmation Bank A/c No.");
            return false;
        }
        if (accountnumber != conaccountnumber) {
            emalert("Entered Bank A/c No. should same as Confirmation Bank A/c No.");
            return false;
        }
        let RegistionFee = $.trim($("#registrationfee").val());
        if ($.trim(RegistionFee) == "") {
            emalert("Registration Fee is not Entered");
            return false;
        }
        let IDAmount = $.trim($("#idamount").val());
        if ($.trim(IDAmount) == "") {
            emalert("ID Amount is not Entered");
            return false;
        }
        $("#btnregister").addClass("hidden");
        saveapplication(notificationno, districtid, projectid, propertytype, propertyno, propertycategory, propertyflat, registrationtype, applicationno, applicantname, spousename, gender, applicantDOB, applicantpan, applicantaadharno, religion, reservation, annualincome, noofyearsinkarnataka, nomineename, nomineerelation, address1, address2, address3, address4, comdistrict, pincode, mobileno, emailid, bankname, branchname, ifsccode, accountnumber, RegistionFee, IDAmount, EsakStudentId);
    });
    $(document).on("click", "#btncancel", function () {
        $('select').each(function () {
            $(this).val($(this).find("option:first").val()).trigger("change");
        });
        $("#KHB_Form")[0].reset();
    });
    $("#select_project_district").on("change", function () {
        let district_id = $(this).val();
        $("input[name='PropertyTypeRadioOptions']").prop("checked", false);
        emptySelectBoxes();
        get_project_details(district_id);
    });
    $(document).on("change", "#selproject", function () {
        let applicationno = "O";
        let districtletter = $("#select_project_district option:selected").text().substr(0, 1);
        let projectletters = $("#selproject option:selected").text().substr(0, 2);
        // console.log("districtletter=>", districtletter);
        // console.log("projectletters=>", projectletters);
        // console.log("applicationno_old=>", applicationno);
        applicationno = applicationno + districtletter + projectletters;

        $("input[name='PropertyTypeRadioOptions']").prop("checked", false);
        emptySelectBoxes();
        // console.log("applicationno_new=>", applicationno);
        generateapplicationno(applicationno);
    });
    $("#selreservation").change(function () {
        if ($("#selreservation").val() == "Others") {
            $("#other_reservation").removeClass("d-none");
        } else {
            $("#other_reservation").addClass("d-none");
        }
    });
    $("#selreligion").change(function () {
        if ($("#selreligion").val() == "Others") {
            $("#other_religion").removeClass("d-none");
        } else {
            $("#other_religion").addClass("d-none");
        }
    });
    $('input[type=radio][name=PropertyTypeRadioOptions]').change(function () {
        if ($('input[name="PropertyTypeRadioOptions"]:checked').val() == "House" || $('input[name="PropertyTypeRadioOptions"]:checked').val() == "Site") {
            $(".property_sites_or_house_block").removeClass("d-none");
            $(".property_flats_block").addClass("d-none");
        }
        if ($('input[name="PropertyTypeRadioOptions"]:checked').val() == "Flat") {
            $(".property_sites_or_house_block").addClass("d-none");
            $(".property_flats_block").removeClass("d-none");
            $(".income_slab_opt_one_block").addClass("d-none");
            $(".income_slab_opt_two_block").removeClass("d-none");
        }
        $(".PropertyCostDiv").removeClass('d-none');
    });
    $("#property_sites_or_house").change(function () {
        if ($(this).val() == "EWS - Economic Weaker Section") {
            $(".income_slab_opt_one_block").removeClass("d-none");
            $(".income_slab_opt_two_block").addClass("d-none");
            $("#income_certificate_block").removeClass("d-none");
        } else {
            $(".income_slab_opt_one_block").addClass("d-none");
            $(".income_slab_opt_two_block").removeClass("d-none");
            $("#income_certificate_block").addClass("d-none");
        }
    });
    $("#applicantdob").change(function () {
        let age = ageCalculator($(this).val());
        if (!isNaN(age)) {
            if (age < 18) {
                emalert("Minimum age should be greater than 18 years!");
                return false;
            }
            if (age < 120) {
                $("#age").val("Age is: " + age + " years.");
            }
        }
    });
    $("#selreservation").change(function () {
        $(".reservation_certificate").addClass("d-none");
        $("#" + $("#selreservation option:selected").attr("data-certificate")).removeClass("d-none");
    });
    //Application download 
    $(document).on("click", "#btnappsendOTP", function () {
        let downloadapplicationno = $.trim($("#downloadapplicationno").val());
        if (downloadapplicationno == '') {
            emalert("Enter Application No.");
            return false;
        }
        sendappOTP(downloadapplicationno);
    });
    $(document).on("click", "#btnappvalidOTP", async function () {
        let downloadapplicationno = $.trim($("#downloadapplicationno").val());
        if (downloadapplicationno == '') {
            emalert("Enter Application No.");
            return false;
        }
        let OTP = $.trim($("#applicationOTP").val());
        if (OTP == '') {
            emalert("Enter OTP");
            return false;
        }
        await validateappOTP(downloadapplicationno, OTP);
    });
    $(document).on("click", "#btnappvalidpayOTP", async function () {
        let downloadapplicationno = $.trim($("#downloadapplicationno").val());
        if (downloadapplicationno == '') {
            emalert("Enter Application No.");
            return false;
        }
        let OTP = $.trim($("#applicationOTP").val());
        if (OTP == '') {
            emalert("Enter OTP");
            return false;
        }
        await validateapppayOTP(downloadapplicationno, OTP);
       
        tblBodyData(downloadapplicationno);
    });
    $(document).on("click", "#btnappPrint", function () {
        window.print();
    });
    $(document).on("click", "#btnallotPrint", function () {
        window.print();
    });
    $(document).on("click", "#btnapprove", function () {
        // window.open("https://stage.edumerge.com/V2/onlineadmissionform/KHB_InvetoryDetails.html?tranId=" + tranId);
        let sendUrl = "./KHB_AllotmentLetter.html?tranId=" + tranId;
        sendMailToApplicant(sendUrl, tranId);
        // window.open(sendUrl);
    });
    $(document).on("click", "#btnreject", function () {
        updateStatusOnReject(tranId);
    });

    $(".close_modal").click(function () {
        $("#defaultMessageModal").css("display", "none");
    });
    $("#proceedCheckbox").click(function (e) {
        if ($(this).prop("checked") == true) {
            $("#proceedButton").removeClass("hidden");
        } else {
            $("#proceedButton").addClass("hidden");
        }
    });
    $("#pay_installment_data").click(function () {

        let total_amount = 0;
        let amount = 0;
        let fee_heads = [];
        $(".payment_schedule_checkbox").each(function (i) {
            if ($(this).prop("checked") == true && $(this).prop("disabled") == false) {
                total_amount += parseFloat($(this).closest("tr").find(".installment_amount_box").val());

                // emalert("checked=> "+amount);
                let temparr = {};
                temparr['FeeHeadID'] = $(this).closest("tr").find(".installment_amount_box").attr("data-feehead-id");
                temparr['amount'] = parseFloat($(this).closest("tr").find(".installment_amount_box").val());
                fee_heads.push(temparr);
            }
        });
        if (exchange_flag == true) {
            exchangeamt = parseFloat($("#exchangeamount").val());
            if (exchangeamt > 0) {
                total_amount += exchangeamt;
                let temparr = {};
                temparr['FeeHeadID'] = 5
                temparr['amount'] = exchangeamt;
                fee_heads.push(temparr);
            }
        }
        if (total_amount > 0 && fee_heads.length > 0) {
            total_amount = total_amount;
            // console.log("total_amount=> ", total_amount);
            // return false;
            createorder("", fee_heads, total_amount, GlobalEsakStudentId, false);
        }
    });
    $("#payRequestExtentionBtn").click(function () {
        // total_amount = total_amount/10;
        let fee_heads = [];
        let temparr = {};
        temparr['FeeHeadID'] = 6;
        temparr['amount'] = 5000;
        fee_heads.push(temparr);
        let total_amount = 5000;
        createorder("", fee_heads, total_amount, GlobalEsakStudentId, true);
    });
    $("#retryApplicationForm").click(function () {
        $(".main_status_success").addClass("hidden");
        $(".main_status_failed").addClass("hidden");
        $(".main_form_content").removeClass("hidden");
    });
    $(document).on("click", "#proceedCheckboxNoticeLetter", function () {
        if ($(this).prop("checked") == true) {
            $("#proceedButtonNoticeLetter").removeClass("hidden");
        } else {
            $("#proceedButtonNoticeLetter").addClass("hidden");
        }
    });
    $(document).on("click", "#proceedButtonNoticeLetter", function () {
        if (NoOfInstalment < 4) {
            $("#PaymentCancellationBlock").addClass("hidden");
            $("#RequestExtentionBlock").removeClass("hidden");
            $("#PaymentScheduleBlock").removeClass("hidden");
            $("#PaymentNoticeLetter1").addClass("hidden");
            $("#PaymentNoticeLetter2").addClass("hidden");
            $("#PaymentNoticeLetter3").addClass("hidden");
            $("#PaymentNoticeLetter4").addClass("hidden");
        } else if (NoOfInstalment == 4) {
            emsuccess("Your allotment has been cancelled.");
            $(".proceedNoticeLetterBlock").addClass("hidden");
        }
        saveNoticeStatus(NoOfInstalment, GlobalUserApplicatioNo);
    });
    $("input[name=requestExtentionPaymentConfirmationRadio]").change(function () {
        if ($(this).val() == "Yes") {
            // alert("Yes");
            $(".requestExtentionPaymentDetailsBlock").removeClass("hidden");
        } else {
            // alert("No");
            $(".requestExtentionPaymentDetailsBlock").addClass("hidden");

        }
    });
    
    
    $("#btn_contact_update").click(function () {
        let ApplicationNo = $("#applicationno").data("ApplicationNo");
        let applicantname = $("#applicantname").val();
        let r = confirm("Update " + applicantname + "(" + ApplicationNo + ") information?");
        if (r == true) {
            let mobileno = $("#mobileno").val();
            let emailid = $("#emailid").val();
            let accountnumber = $("#accountnumber").val();
            let ApplicationAllotmentDate = $("#ApplicationAllotmentDate").val();
            if (mobileno.trim() == "") {
                emalert("Enter mobile no.!");
                return false;
            }
            if (emailid.trim() == "") {
                emalert("Enter email id!");
                return false;
            }
            if (accountnumber.trim() == "") {
                emalert("Enter Bank Account No.!");
                return false;
            }
            // if (ApplicationAllotmentDate.trim() == "") {
            //     emalert("Enter Application Allotment Date.!");
            //     return false;
            // }
            $.ajax({
                type: "POST",
                url: "./server/KHB_Wrapper.php",
                dataType: "json",
                data: {
                    req_type: "updateApplicantContactInfo",
                    tranId: tranId,
                    ApplicationNo: ApplicationNo,
                    mobileno: mobileno,
                    emailid: emailid,
                    accountnumber: accountnumber,
                    ApplicationAllotmentDate: ApplicationAllotmentDate
                },
                success: function (data) {
                    if (typeof data != "undefined") {
                        if (data["success"] == 1) {
                            emsuccess("Data successfully updated");
                            showapplicationdetails("", tranId);
                        } else {
                            emalert(data.error_message);
                        }
                    }
                }
            });
        }
    });



});
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function tblBodyData(downloadapplicationno = 0) {
    try {
        await delay(3000);    
        let res = await getPaymentScheduleDetails(downloadapplicationno);

        console.log("no_of_installments=> ", no_of_installments);
        let installmentNames = ["first", "second", "third", "fourth"];
    
        let tbody = document.querySelector("#payment_schedule_table");
        tbody.innerHTML = "";
    
        if(!tbody){
            return;
        }
        for (let i = 1; i <= no_of_installments; i++) {
            let installmentLabel = installmentNames[i - 1] || `installment${i}`; // Fallback if more than 4
    
            let row = `
                    <tr>
                        <th scope="row">${i}</th>
                        <td><input readonly type="text" class="txtfull form-control installment_amount_box" name="amount${i}" id="amount${i}" data-feehead-id="${i + 1}"></td>
                        <td><input readonly type="date" class="txtfull form-control" name="duedate${i}" id="duedate${i}"></td>
                        <td><span id="transactionId${i}"></span></td>
                        <td><span id="transactionDate${i}"></span></td>
                        <td class="hideprintdiv">
                            <input type="checkbox" id="${installmentLabel}_installment_checkbox" checked class="payment_schedule_checkbox" data-id="installment_checkbox${i}" />
                        </td>
                    </tr>
                `;
            tbody.innerHTML += row;
        }
        $(".payment_schedule_checkbox").click(function () {
            let total_amount = 0;
            $(".payment_schedule_checkbox").each(function (i) {
                if ($(this).prop("checked") == true && $(this).prop("disabled") == false) {
                    total_amount += parseFloat($(this).closest("tr").find(".installment_amount_box").val());
                    // emalert("checked=> "+amount);
                }
            });
            $("#total_payment_schedule_amout").text(convertAmoutToINR(total_amount));
    
        });
    } catch (error) {
        console.log("error=> ", error);
    }
}

function updateStatusOnReject(tranId) {
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "updateStatusOnReject",
            tranId: tranId
        },
        success: function (data) {
            if (data["success"] == true) {
                emsuccess("Application rejected successfully!");
                location.reload();
            } else {
                emalert("Something went wrong! Please try again!");
            }
        }
    });
}

function emptySelectBoxes() {
    $("#property_sites_or_house").empty();
    $("#property_flats").empty();
    $("#selproperty").empty();
    $("#property_cost").val('');
}

function getProductDesc(propertyno, propertytype = null, projectid = 0) {
    // console.log("getProductDesc cla")
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "getProductDesc",
            propertyno: propertyno,
            propertytype: propertytype,
            projectid: projectid
        },
        success: function (data) {
            if (typeof data != "undefined") {
                if (data["ProductDesc"] != null) {
                    let selectBoxId = "#property_flats";
                    if (propertytype != null) {
                        if (propertytype == "House" || propertytype == "Site") {
                            selectBoxId = "#property_sites_or_house";
                        } else {
                            selectBoxId = "#property_flats";
                        }
                    } else {
                        if ($('input[name="PropertyTypeRadioOptions"]:checked').val() == "House" || $('input[name="PropertyTypeRadioOptions"]:checked').val() == "Site") {
                            selectBoxId = "#property_sites_or_house";
                        } else {
                            selectBoxId = "#property_flats";
                        }
                    }

                    $(selectBoxId).empty();
                    $(`<option value="0">-- Select --</option>`).appendTo(selectBoxId);
                    $(`<option value="${data["ProductDesc"]}" selected>${data["ProductDesc"]}</option>`).appendTo(selectBoxId);
                    $("#property_cost").val(data["ProductCost"]);

                    $(selectBoxId).prop("disabled", true);
                    $(selectBoxId).trigger("change");

                } else {
                    emalert("Something went wrong! Please reload the web page!");
                }
            }
        }
    });
}

function saveNoticeStatus(NoOfInstalment, GlobalUserApplicatioNo) {
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "saveNoticeStatus",
            NoOfInstalment: NoOfInstalment,
            ApplicatioNo: GlobalUserApplicatioNo
        },
        success: function (data) {
            if (typeof data != "undefined") {
                if (data["success"] == true) {
                    // window.open(sendUrl);
                } else {
                    emalert(data["message"]);
                }
            }
        }
    });
}

function sendMailToApplicant(sendUrl, tranId) {
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "sendMailToApplicant",
            tranId: tranId
        },
        success: function (data) {
            if (typeof data != "undefined") {
                if (data["success"] == true) {
                    window.open(sendUrl);
                    location.reload();
                } else {
                    emalert(data["message"]);
                }
            }
        }
    });
}

function getregistrationfee(propertyno) {
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "getregistrationfee",
            "propertyno": propertyno
        },
        success: function (data) {
            if (typeof data != "undefined") {
                $("#registrationfee").val(data.MinStockLevel);
                $("#idamount").val(data.MaxOrderLevel);
                $("#registrationfee").prop("disabled", true);
                $("#idamount").prop("disabled", true);
            }
        }
    });
}

function validateappOTP(downloadapplicationno, OTP) {
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "validateappOTP",
            OTP_data: {
                "applicationno": downloadapplicationno,
                "OTP": OTP
            }
        },
        success: function (data) {
            if (typeof data != "undefined") {
                let errorcode = data.Error_Code;
                let errormsg = data.OTP_Error;
                if (errorcode > 0) {
                    emalert(errormsg);
                } else {
                    // console.log("outside");
                    emsuccess(errormsg);
                    getPaymentScheduleDetails(downloadapplicationno);
                    showapplicationdetails(downloadapplicationno, 0, 0);
                }
            }
        }
    })
}

function validateapppayOTP(downloadapplicationno, OTP) {
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "validateappOTP",
            OTP_data: {
                "applicationno": downloadapplicationno,
                "OTP": OTP
            }
        },
        success: function (data) {
            if (typeof data != "undefined") {
                let errorcode = data.Error_Code;
                let errormsg = data.OTP_Error;
                if (errorcode > 0) {
                    emalert(errormsg);
                } else if (data.applicationStatus != 1) {
                    emalert("Your application is not yet approved!");
                } else {
                    emsuccess(errormsg);
                    getPaymentScheduleDetails(downloadapplicationno);
                    showapplicationdetails(downloadapplicationno, 0, 1);
                    if (data["requestExtentionTransactionID"] != null && data["requestExtentionTransactionDate"] != null) {
                        // console.log("inside");
                        $("#RequestExtentionBlock").removeClass("hidden");
                        $(".requestExtentionPaymentButtondetails").addClass("hidden");
                        $(".requestExtentionPaymentDetails").removeClass("hidden");
                        $("#requestExtentionPaymentID").text(data["requestExtentionTransactionID"]);
                        $("#requestExtentionPaymentDate").text(data["requestExtentionTransactionDate"]);
                    }
                }
            }
        }
    })
}

function getPaymentScheduleDetails(applicatioNo) {
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "getPaymentScheduleDetails",
            applicatioNo: applicatioNo
        },
        success: function (res) {
            if (typeof res != "undefined") {
                if (res["success"] == true) {
                    exchange_flag = res["data"]['exchangeflag'];
                    $("#payment_info_cost_amount").text(convertAmoutToINR(res["data"]["cost"]));
                    $("#payment_info_idamount_amount").text(convertAmoutToINR(res["data"]["IDAmount"]));
                    $("#payment_info_total_amount").text(convertAmoutToINR(res["data"]["total_installment_amount"]));
                    $("#no_of_installments").text(res.data?.no_of_installment);
                    no_of_installments = res.data?.no_of_installment;
                    let balanceamt = 0;
                    let k = 1;
                    if (exchange_flag == true) {
                        for (let i in res["data"]["dates"]) {
                            var tranid = res["data"]["dates"][i]["MihPayID"];
                            if (tranid != undefined && tranid != null && tranid != '') {
                                $("[data-id='installment_checkbox" + k + "']").attr('disabled', true);
                            } else {
                                balanceamt += res["data"]["dates"][i]["installmentamount"];
                            }
                            $("#amout" + k).val(res["data"]["dates"][i]["installmentamount"]);
                            $("#duedate" + k).val(res["data"]["dates"][i]["date_" + k]);
                            $("#transactionId" + k).text(res["data"]["dates"][i]["MihPayID"]);
                            $("#transactionDate" + k).text(res["data"]["dates"][i]["TranStartDate"]);
                            k++;
                        }
                        $("#exchanged_payment_info_block").removeClass('hidden');
                        for (let i in res["data"]) {
                            $(`#exchanged_payment_info_block .${i}`).text(res["data"][i]);
                        }
                    } else {
                        $("#exchanged_payment_info_block").addClass('hidden');

                        $(".installment_amount_box").val(res["data"]["one_installment_amount"]);
                        for (let i in res["data"]["dates"]) {
                            var tranid = res["data"]["dates"][i]["MihPayID"];
                            if (tranid != undefined && tranid != null && tranid != '') {
                                $("[data-id='installment_checkbox" + k + "']").attr('disabled', true);
                            } else {
                                balanceamt += res["data"]["one_installment_amount"];
                            }
                            $("#duedate" + k).val(res["data"]["dates"][i]["date_" + k]);
                            $("#transactionId" + k).text(res["data"]["dates"][i]["MihPayID"]);
                            $("#transactionDate" + k).text(res["data"]["dates"][i]["TranStartDate"]);
                            k++;
                        }
                    }
                    if (res["data"]["isExtentionAmountPaid"] == true) {
                        $("#extention_payment_info_block").removeClass('hidden');
                        for (let i in res["data"]) {
                            $(`#extention_payment_info_block .${i}`).text(res["data"][i]);
                        }
                    } else {
                        $("#extention_payment_info_block").addClass('hidden');
                    }
                    $("#exchangeamount").val(res["data"]["exchangeamount"]);
                    if (exchange_flag == true) {
                        if (res["data"]["exchangeamount"] > 0) {
                            balanceamt += res["data"]["exchangeamount"];
                        }
                    }
                    $("#total_payment_schedule_amout").text(convertAmoutToINR(balanceamt));
                    if (res["data"]["showCancellationLetterFlag"] == 1) {
                        $("#PaymentCancellationBlock").removeClass("hidden");
                        $("#RequestExtentionBlock").addClass("hidden");
                        $("#PaymentScheduleBlock").addClass("hidden");
                    } else {
                        $("#PaymentCancellationBlock").addClass("hidden");
                        $("#RequestExtentionBlock").removeClass("hidden");
                        $("#PaymentScheduleBlock").removeClass("hidden");
                    }
                    // $("#duedate1").val(res["data"]["dates"]["date_1"]);
                    // $("#duedate2").val(res["data"]["dates"]["date_2"]);
                    // $("#duedate3").val(res["data"]["dates"]["date_3"]);
                    // $("#duedate4").val(res["data"]["dates"]["date_4"]);
                    GlobalEsakStudentId = res["data"]["EsakStudentId"];
                    // if (res["data"]["isExtentionAmountPaid"] == true) {
                    //     $("#RequestExtentionBlock").addClass("hidden");
                    // } else {
                    //     $("#RequestExtentionBlock").removeClass("hidden");
                    // }

                } else {
                    $(".installment_amount_box").val(0);
                    emalert(data["message"]);
                }
            }
        }
    })
}

function showapplicationdetails(ApplicationNo, tranId, flag) {
    GlobalUserApplicatioNo = ApplicationNo;
    get_notification_details();
    // getAllDistricts('#seldistrict');
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "getapplicationdetails",
            "applicationno": ApplicationNo,
            "tranId": tranId
        },
        success: function (data) {
            if (typeof data != "undefined") {
                let TransactionNo = data.transactionno;
                no_of_installments = data.no_of_installment;                              
                let TransactionDate = data.transactiondate;
                $("#transactionno").val(TransactionNo);
                $("#transactiondate").val(TransactionDate);
                let notificationno = data.notificationno;
                get_notification_details(notificationno);
                let district_id = data.districtid;
                get_districts(notificationno, district_id);
                $("#selnotificationno").prop("disabled", true);
                $("#select_project_district").prop("disabled", true);
                let projectid = data.projectid;
                get_project_details(district_id, projectid);
                $("#selproject").prop("disabled", true);
                let propertytype = data.propertytype;
                $("input[type=radio][name=PropertyTypeRadioOptions][value='" + propertytype + "']").prop("checked", true);
                $("input[type=radio][name=PropertyTypeRadioOptions]").prop("disabled", true);
                propertyno = data.propertyno;
                getproperties(projectid, propertytype, propertyno);
                $("#selproperty").prop("disabled", true);
                registrationtype = data.registrationtype;
                $("input[name=isJointRegistration][value='" + registrationtype + "']").prop("checked", true);
                $("input[name=isJointRegistration]").prop("disabled", true);
                let propertycategory = data.propertycategory;
                if (propertytype == "House" || propertytype == "Site") {
                    $(".property_sites_or_house_block").removeClass('d-none');
                    $(".property_flats_block").addClass("d-none");
                    // $("#property_sites_or_house").val(propertycategory).change();
                    // $("#property_sites_or_house").prop("disabled", true);
                } else {
                    $(".property_flats_block").removeClass("d-none");
                    $(".property_sites_or_house_block").addClass('d-none');
                    // $("#property_flats").val(propertycategory).change();
                    // $("#property_flats").prop("disabled", true);
                }
                $(".PropertyCostDiv").removeClass('d-none');
                getProductDesc(propertyno, propertytype, projectid);
                let applicationno = data.applicationno;
                $("#applicationno").val(applicationno);
                $("#applicationno").data("ApplicationNo", applicationno);
                $("#applicationno").prop("disabled", true);
                let applicantname = data.applicantname;
                $("#applicantname").val(applicantname);
                $("#applicantname").prop("disabled", true);
                let spousename = data.spousename;
                $("#spousename").val(spousename);
                $("#spousename").prop("disabled", true);
                let applicantDOB = data.applicantDOB;
                $("#applicantdob").val(applicantDOB);
                $("#applicantdob").prop("disabled", true);
                let gender = data.gender;
                $("input[name='gender'][value='" + gender + "']").prop("checked", true);
                $("input[name='gender']").prop("disabled", true);
                let age = ageCalculator($("#applicantdob").val());
                $("#age").val(age);
                let applicantpan = data.applicantpan;
                $("#applicantpan").val(applicantpan);
                $("#applicantpan").prop("disabled", true);
                let applicantaadharno = data.applicantaadharno;
                $("#applicantaadharno").val(applicantaadharno);
                $("#applicantaadharno").prop("disabled", true);
                let religion = data.religion;
                $("#selreligion").val(religion).change();
                $("#selreligion").prop("disabled", true);
                let reservation = data.reservation;
                $("#selreservation").val(reservation).change();
                $("#selreservation").prop("disabled", true);
                let annualincome = data.annualincome;
                if ($(".income_slab_opt_one_block").is(":visible")) {
                    $("#income_slab_opt_one").val(annualincome).change();
                    $("#income_slab_opt_one").prop("disabled", true);
                } else {
                    $("#income_slab_opt_two").val(annualincome).change();
                    $("#income_slab_opt_two").prop("disabled", true);
                }
                let noofyearsinkarnataka = data.noofyearsinkarnataka;
                $("#noofyearsinkarnataka").val(noofyearsinkarnataka);
                $("#noofyearsinkarnataka").prop("disabled", true);
                let nomineename = data.nomineename;
                $("#nomineename").val(nomineename);
                $("#nomineename").prop("disabled", true);
                let nomineerelation = data.nomineerelation;
                $("#selnomineerelation").val(nomineerelation).change();
                $("#selnomineerelation").prop("disabled", true);
                let address1 = data.address1;
                $("#address1").val(address1);
                $("#address1").prop("disabled", true);
                let address2 = data.address2;
                $("#address2").val(address2);
                $("#address2").prop("disabled", true);
                let address3 = data.address3;
                $("#address3").val(address3);
                $("#address3").prop("disabled", true);
                let address4 = data.address4;
                $("#address4").val(address4);
                $("#address4").prop("disabled", true);
                let comdistrict = data.comdistrict;
                $("#seldistrict").empty();
                $("<option value='0'>-- Select --</option>").appendTo("#seldistrict");
                $("<option value='" + comdistrict + "' selected>" + comdistrict + "</option>").appendTo("#seldistrict");
                // console.log("comdistrict=> ", comdistrict);
                $("#seldistrict").val(comdistrict).trigger("change.select2");
                $("#seldistrict").prop("disabled", true);
                let pincode = data.pincode;
                $("#Pincode").val(pincode);
                $("#Pincode").prop("disabled", true);
                let mobileno = data.mobileno;
                $("#mobileno").val(mobileno);
                $("#mobileno").prop("disabled", true);
                let emailid = data.emailid;
                $("#emailid").val(emailid);
                $("#emailid").prop("disabled", true);
                let bankname = data.bankname;
                $("#bankname").val(bankname);
                $("#bankname").prop("disabled", true);
                let bankbrname = data.bankbrname;
                $("#branchname").val(bankbrname);
                $("#branchname").prop("disabled", true);
                let ifsccode = data.ifsccode;
                $("#ifsccode").val(ifsccode);
                $("#ifsccode").prop("disabled", true);
                let bankacno = data.bankacno;
                $("#accountnumber").val(bankacno);
                $("#accountnumber").prop("disabled", true);
                let registrationfee = data.RegistrationFee;
                $("#registrationfee").val(registrationfee);
                $("#registrationfee").prop("disabled", true);
                let IDAmount = data.IDAmount;
                $("#idamount").val(IDAmount);
                $("#idamount").prop("disabled", true);
                if (data["showCancellationLetterFlag"] == 1 || data["showNoticeLetterFlag"] > 1) {
                    if (data["AllotmentDate"] == null) {
                        alert("Your allotment has not been done!");
                        return false;
                    }
                    $(".District").text(data["DistrictName"]);
                    $(".Project").text(data["ProjectName"]);
                    $(".PropertyNo").text(data["propertyno"]);
                    $(".cancellationDate").text(data["cancellationDate"]);
                    $(".AllotmentDate").text(data["AllotmentDate"]);
                    $(".AlloteeName").text(data["applicantname"]);
                    $(".AlloteeAddress1").text(data["address1"]);
                    $(".AlloteeAddress2").text(data["address2"]);
                    $(".AlloteeAddress3").text(data["address3"]);
                    $(".AlloteeAddress4").text(data["address4"]);
                    $(".IDAmount").text(convertAmoutToINR(data["IDAmount"]));
                    $(".TotalCost").text(convertAmoutToINR(data["cost"]));
                    $(".InstallmentAmount").text(convertAmoutToINR(data["InstallmentAmount"]));
                    $(".InstallmentDate").text(data["InstallmentDate"]);
                }
                if (data["showCancellationLetterFlag"] == 1) {
                    $("#PaymentCancellationBlock").removeClass("hidden");
                    $("#RequestExtentionBlock").addClass("hidden");
                    $("#PaymentScheduleBlock").addClass("hidden");
                    $("#PaymentNoticeLetter1").addClass("hidden");
                    $("#PaymentNoticeLetter2").addClass("hidden");
                    $("#PaymentNoticeLetter3").addClass("hidden");
                    $("#PaymentNoticeLetter4").addClass("hidden");
                }
                if (data["showNoticeLetterFlag"] > 0) {
                    if (data["showCancellationLetterFlag"] == 1) {
                        $("#PaymentCancellationBlock").removeClass("hidden");
                    } else {
                        $("#PaymentCancellationBlock").addClass("hidden");
                    }
                    // $("#RequestExtentionBlock").addClass("hidden");
                    $("#PaymentScheduleBlock").addClass("hidden");
                    NoOfInstalment = data["showNoticeLetterFlag"];
                    for (let i = 1; i <= data["showNoticeLetterFlag"]; i++) {
                        $("#PaymentNoticeLetter" + i).removeClass("hidden");
                        $(".noticeDate" + i).text(data["noticeDate"][i - 1]);
                        if (data["TagStatus"] != 4) {
                            if (i == data["showNoticeLetterFlag"]) {
                                $(`<div class="d-flex mt-2 proceedNoticeLetterBlock">
                                <div class="w-100">
                                    <input type="checkbox" id="proceedCheckboxNoticeLetter" />
                                    <label for="proceedCheckboxNoticeLetter">I have read the notice.</label>
                                </div>
                                <div class="w-100">
    
                                    <button type="button" id="proceedButtonNoticeLetter"
                                        class="btn btn-primary hidden">Proceed</button>
                                </div>
                            </div>`).appendTo("#PaymentNoticeLetter" + i);
                            }
                        }

                    }
                }
                $("select").trigger('change.select2');
                if (urlParams.has("tranId")) {
                    if (urlParams.get('tranId') > 0) {
                        if (typeof data.purchasereceiveid != "undefined") {
                            if (data.purchasereceiveid > 0) {
                                $("#btnapprove").addClass("hidden");
                                $("#btnreject").addClass("hidden");
                            }
                            // if (data.hasOwnProperty("MOP")) {
                            //     if (data["MOP"] == 0) {
                            //         $("#btnapprove").addClass("hidden");
                            //         $("#btnreject").addClass("hidden");
                            //     }
                            // }
                            if (data.hasOwnProperty("loggedInUserProfileId")) {
                                if (data["loggedInUserProfileId"] == 10) {
                                    $("#btn_contact_update").removeClass("hidden");
                                    $("#mobileno").prop("disabled", false);
                                    $("#emailid").prop("disabled", false);
                                    $("#accountnumber").prop("disabled", false);
                                    if (data.hasOwnProperty("ApprovedDate")) {
                                        if (data["ApprovedDate"] != "" && data["ApprovedDate"] != null) {
                                            $("#ApplicationAllotmentDateBlock").remove();
                                            $("<div class='text-center mt-2 mb-4' id='ApplicationAllotmentDateBlock'><label for='ApplicationAllotmentDate'>Allotment Date</label><br/><input type='date' class='from-control' value='" + data['ApprovedDate'] + "' id='ApplicationAllotmentDate'/></div>").prependTo(".invdiv");
                                        }
                                    }
                                } else {
                                    $("#btn_contact_update").addClass("hidden");
                                }
                            } else {
                                $("#btn_contact_update").addClass("hidden");
                            }
                        }
                    }
                }
                if (flag) {
                    // $("#PaymentScheduleBlock").removeClass('hidden');
                    // $("#RequestExtentionBlock").removeClass('hidden');
                } else {
                    $("#application_details").removeClass('hidden');
                }
                if ($("body").find("#payment_schedule_info_block").length > 0) {
                    for (let i in data) {
                        $(`.${i}`).text(data[i]);
                    }
                }
            }
        }
    });
}

function sendappOTP(downloadapplicationno) {
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "sendappOTP",
            applicationno: downloadapplicationno
        },
        success: function (data) {
            if (typeof data != "undefined") {
                let errorcode = data.Error_Code;
                let errormsg = data.OTP_Error;
                if (errorcode > 0) {
                    emalert(errormsg);
                } else {
                    emsuccess(errormsg);
                }
            }
        }
    });
}

function getproperties(projectid, propertytype, propertyno = 0) {
    let tempTranIdFlag = 0;
    if (urlParams.has("tranId")) {
        if (urlParams.get('tranId') > 0) {
            tempTranIdFlag = 1;
        }
    }
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "getproperties",
            "propertydata": { "projectid": projectid, "propertytype": propertytype, tempTranIdFlag: tempTranIdFlag }
        },
        success: function (data) {
            if (typeof data != "undefined") {
                let selproperty = $("#selproperty");
                selproperty.empty();
                let propertyValiue = null;
                $("<option value='0'>Select a Property</option>").appendTo(selproperty);
                for (i in data) {
                    if (propertyno == data[i].AssetNo) {
                        propertyValiue = propertyno;
                        $("<option selected='selected' value='" + data[i].AssetNo + "'>" + data[i].ProductName + "</option>").appendTo(selproperty);
                    } else {
                        $("<option value='" + data[i].AssetNo + "'>" + data[i].ProductName + "</option>").appendTo(selproperty);
                    }
                }
                if (propertyValiue != null) {
                    $("#selproperty").val(propertyValiue);
                }
                $("#selproperty").trigger('change.select2');
            }
        }
    });
}

function generateapplicationno(applicationno) {
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "generateapplicationno",
            "applicationno": applicationno
        },
        success: function (data) {
            if (typeof data != "undefined") {
                let applicationno = data.applicationno;
                $("#applicationno").val(applicationno);
                $("#applicationno").data("ApplicationNo", applicationno);
                let EsakStudentId = data.EsakStudentId;
                $("#applicationno").data("EsakStudentId", EsakStudentId);
            }
        }
    });
}

function saveapplication(notificationno, districtid, projectid, propertytype, propertyno, propertycategory, propertyflat, registrationtype, applicationno, applicantname, spousename, gender, applicantDOB, applicantpan, applicantaadharno, religion, reservation, annualincome, noofyearsinkarnataka, nomineename, nomineerelation, address1, address2, address3, address4, comdistrict, pincode, mobileno, emailid, bankname, branchname, ifsccode, accountnumber, RegistionFee, IDAmount, EsakStudentId) {
    applicationdata = { "notificationno": notificationno, "districtid": districtid, "projectid": projectid, "propertytype": propertytype, "propertyno": propertyno, "propertycategory": propertycategory, "propertyflat": propertyflat, "registrationtype": registrationtype, "applicationno": applicationno, "applicantname": applicantname, "spousename": spousename, "gender": gender, "applicantDOB": applicantDOB, "applicantpan": applicantpan, "applicantaadharno": applicantaadharno, "religion": religion, "reservation": reservation, "annualincome": annualincome, "noofyearsinkarnataka": noofyearsinkarnataka, "nomineename": nomineename, "nomineerelation": nomineerelation, "address1": address1, "address2": address2, "address3": address3, "address4": address4, "comdistrict": comdistrict, "pincode": pincode, "mobileno": mobileno, "emailid": emailid, "bankname": bankname, "branchname": branchname, "ifsccode": ifsccode, "accountnumber": accountnumber, "RegistionFee": RegistionFee, "IDAmount": IDAmount, "EsakStudentId": EsakStudentId };
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            "req_type": "saveapplication",
            "applicationdata": applicationdata
        },
        success: function (data) {
            if (typeof data != "undefined") {
                if (parseInt(data.EsakStudentId) > 0) {
                    proceedtopay(applicantname);
                }
            }
        }
    });
}

function proceedtopay(applicantname = "") {
    feeheads = [];
    temparr = {};
    temparr['FeeHeadID'] = 1;
    temparr['amount'] = $("#idamount").val();
    feeheads.push(temparr);
    temparr = {};
    temparr['FeeHeadID'] = 7;
    temparr['amount'] = $("#registrationfee").val();
    feeheads.push(temparr);
    feetotal = parseFloat($("#idamount").val()) + parseFloat($("#registrationfee").val());

    createorder(applicantname, feeheads, feetotal, 0, false);
}

function createorder(applicantname, feeheads, feetotal, EsakStudentId = 0, callFromExtentionBlock = false) {
    let mobile_no = $.trim($("#mobileno").val());
    let Email = $.trim($("#emailid").val());
    if (EsakStudentId == 0) {
        EsakStudentId = $("#applicationno").data("EsakStudentId");
    }
    let ApplicationNo = EsakStudentId;
    let StandardSectionId = $("#selproject").val();
    $.ajax({
        url: "./server/KHB_createorder.php",
        type: "POST",
        dataType: "json",
        data: { "StudentId": EsakStudentId, "ClassID": StandardSectionId, "mobile_no": mobile_no, "Email": Email, "feeheads": feeheads, "feetotal": feetotal, applicantname: applicantname },
        success: function (data) {
            // return false;
            if (typeof data != "undefined") {
                if (data.Status == 1) {
                    let order_id = data.razororderid;
                    let curl = data.curl;
                    let callbackurl = data.callbackurl;
                    let txnid = data.txnid;
                    let mobile_no = data.MobileNo;
                    let Email = data.EmailID;
                    $("#order_id").val(order_id);
                    let stname = $("#StudentName").val();
                    $("#stname").val(stname);
                    // $("#stemid").val(stemid);
                    $("#stmobile").val(mobile_no);
                    $("#stemail").val(Email);
                    $("#txnid").val(txnid);
                    $("#cancel_url").val(curl);
                    $("#callback_url").val(callbackurl);
                    let razoramount = feetotal * 100;
                    let razorkey_id = data.Key_ID;
                    let razormerchant_name = data.Merchant_Name;
                    let razorproduct_desc = data.Product_Desc;
                    let razorlogopath = data.LogoPath;
                    let StudentName = applicantname;
                    let ApplicationNo = data.ApplicationNo;
                    let ProjectName = data.ProjectName;
                    let PropertyNo = data.PropertyNo;
                    let Place = data.Place;
                    let customerId = data.customerId;
                    init_razorpay(razoramount, razorkey_id, razormerchant_name, razorproduct_desc, razorlogopath, order_id, txnid, mobile_no, Email, StudentName, ApplicationNo, ProjectName, Place, PropertyNo, callFromExtentionBlock, customerId);

                } else {
                    emalert("Server Busy. Try after sometime.");
                    return false;
                }
            }
        }
    });
}

function init_razorpay(razoramount, razorkey_id, razormerchant_name, razorproduct_desc, razorlogopath, razororderid, txnid, mobile_no, Email, StudentName, ApplicationNo, ProjectName, Place, PropertyNo, callFromExtentionBlock = false, customerId) {
    let notesobj = {
        "Applicant_Name": StudentName,
        "ApplicationNo": ApplicationNo,
        "ProjectName": ProjectName,
        "Place": Place,
        "PropertyNo": PropertyNo,
        "mobileno": mobile_no,
        "emailid": Email,
        "txnid": txnid,
        "From_ParentPaymnet": 1,
        "SchoolDB": "EM5249",
        "customerId": customerId
    };
    var options = {
        "key": razorkey_id, //"rzp_test_kxzxQoEBvfhETi"
        "amount": razoramount, // 2000 paise = INR 20
        "name": razormerchant_name,
        "customer_id": customerId,
        "description": razorproduct_desc,
        "image": razorlogopath,
        "order_id": razororderid,
        "prefill": {
            "name": StudentName,
            "email": Email,
            "contact": mobile_no
        },
        "notes": notesobj,
        "theme": {
            "color": "#F37254"
        },
        "handler": function (response) {
            var paymentid = response.razorpay_payment_id;
            var signature = response.razorpay_signature;
            var orderid = response.razorpay_order_id;
            $.ajax({
                url: "../feereceipt/server/processcapture.php",
                type: "POST",
                dataType: "json",
                data: { "paymentid": paymentid, "razorsignature": signature, "orderid": orderid, "razoramount": razoramount, "txnid": txnid, old_payment_method: 0, "loggedinuser_SchoolDB": "EM5249" },
                success: function (data) {
                    if (typeof data != "undefined") {
                        if (data.errorno == 0) {
                            emsuccess(data.Status);
                        } else {
                            $(".main_status_failed").removeClass("hidden");
                            $(".main_status_success").addClass("hidden");
                            $(".main_form_content").addClass("hidden");
                            // $(".applicationNo").text($("#applicationno").val());
                            $(".applicationNo").text($("#applicationno").data("ApplicationNo"));
                            emalert(data.Status);
                        }
                    }
                },
                complete: function () {
                    //return false;
                    emsuccess("Please wait we are processing your transaction. This may take few seconds.");
                    $(".studentfee").addClass("hidden");
                    $(".TransactionProcess").removeClass("hidden");
                    $.ajax({
                        url: "../feereceipt/server/getfeereceiptno.php",
                        type: "POST",
                        dataType: "json",
                        data: { "paymentid": paymentid, "razoramount": razoramount, "txnid": txnid, "dbname": "EM5249" },
                        success: function (data) {
                            if (typeof data != "undefined") {
                                var FeeReceiptNo = data.ReceiptNo;
                                $(".OuterDiv").empty();
                                if (FeeReceiptNo > 0) {
                                    emsuccess("Fee Receipt No " + FeeReceiptNo + " is generated successfully");

                                    $(".main_status_success").removeClass("hidden");
                                    $(".main_status_failed").addClass("hidden");
                                    $(".main_form_content").addClass("hidden");

                                    // $(".applicationNo").text($("#applicationno").val());
                                    $(".applicationNo").text($("#applicationno").data("ApplicationNo"));
                                    $(".transactionId").text(txnid);
                                    $("#applicationDonloadURL").attr("href", "./KHB_Application_Download.html?tranId=" + data.invtran_transaction_id + "&print=1");

                                    // $(".OuterDiv").html("<div class='container'> <div class='alert alert-success' role='alert'> <h4 class='alert-heading'>Registration Successful !!!</h4><hr><p>Dear Applicant,</p><p>We have received your application. Thank you for your interest in us. </p><p> You will receive an E-mail & SMS acknowledgement on your registered mobile number & E-Mail Id. </p><p> Your Receipt No is <b> " + FeeReceiptNo + "</b> . Kindly preserve this mail for future transactions.</p><hr></div></div> ");
                                    if (callFromExtentionBlock == true) {

                                        // $("#RequestExtentionBlock").addClass("hidden");
                                        if (data["requestExtentionTransactionID"] != null && data["requestExtentionTransactionDate"] != null) {
                                            $(".requestExtentionPaymentButtondetails").addClass("hidden");
                                            $(".requestExtentionPaymentDetails").removeClass("hidden");
                                            $("#requestExtentionPaymentID").text(data["requestExtentionTransactionID"]);
                                            $("#requestExtentionPaymentDate").text(data["requestExtentionTransactionDate"]);
                                        }
                                        getPaymentScheduleDetails($("#downloadapplicationno").val());
                                    }
                                } else {
                                    $(".OuterDiv").html("<div class='container'> <div class='alert alert-danger' role='alert'> <h4 class=''alert-heading'>Registration Failed !!!</h4><hr><p>Dear Applicant,</p><p>We regret to inform you that your transaction has been failed. </p><p> Please try Again. </p><p> <b> Any amount debited from the account will be reverted in 7 working days. </b> </p> </div></div>");
                                }
                            }
                        },
                        complete: function () { }
                    });
                }
            });
        }
    };

    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function getAllDistricts(selid) {
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "getAllDistricts"
        },
        success: function (res) {

            if (typeof res != "undefined" && res != null) {
                $(selid).empty();
                $("<option value='0'>-- Select --</option>").appendTo(selid);
                const districts = res.data.districts;
                for (let i in districts) {
                    $("<option value='" + districts[i] + "'>" + districts[i] + "</option>").appendTo(selid);
                }
            } else {
                emalert("Something went wrong! Please relod page!");
            }
        }
    });
}

function get_districts(notification_id = '0', districtid = 0) {
    select_id = $('#select_project_district');
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "get_districts",
            notification_id: notification_id
        },
        success: function (res) {
            if (typeof res != "undefined" && res != null) {
                $(select_id).empty();
                $("<option value='0'>-- Select --</option>").appendTo(select_id);
                const districts = res;
                for (let i in districts) {
                    if (districts[i].CostCenterId == districtid) {
                        $("<option selected='selected' value='" + districts[i].CostCenterId + "'>" + districts[i].CostCenterName + "</option>").appendTo(select_id);
                    } else {
                        $("<option value='" + districts[i].CostCenterId + "'>" + districts[i].CostCenterName + "</option>").appendTo(select_id);
                    }
                }
            } else {
                emalert("Something went wrong! Please reload page!");
            }
        }
    });
}

function get_districts_without_noticefication_id(districtid = 0) {
    select_id = $('#select_project_district');
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "get_districts_without_noticefication_id"
        },
        success: function (res) {
            if (typeof res != "undefined" && res != null) {
                $(select_id).empty();
                $("<option value='0'>-- Select --</option>").appendTo(select_id);
                const districts = res;
                for (let i in districts) {
                    if (districts[i].CostCenterId == districtid) {
                        $("<option selected='selected' value='" + districts[i].CostCenterId + "'>" + districts[i].CostCenterName + "</option>").appendTo(select_id);
                    } else {
                        $("<option value='" + districts[i].CostCenterId + "'>" + districts[i].CostCenterName + "</option>").appendTo(select_id);
                    }
                }
            } else {
                emalert("Something went wrong! Please reload page!");
            }
        }
    });
}

function get_notification_details(notificationno) {
    var select_id = $('#selnotificationno');
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            req_type: "get_notification_details"
        },
        success: function (res) {
            if (typeof res != "undefined" && res != null) {
                $(select_id).empty();
                $("<option value='0'>-- Select --</option>").appendTo(select_id);
                const notification = res;
                for (let i in notification) {
                    if (notificationno == notification[i].storeid) {
                        $("<option selected='selected' value='" + notification[i].storeid + "'>" + notification[i].storename + "</option>").appendTo(select_id);
                    } else {
                        $("<option value='" + notification[i].storeid + "'>" + notification[i].storename + "</option>").appendTo(select_id);
                    }
                }
            } else {
                emalert("Something went wrong! Please relod page!");
            }
        }
    });
}

function get_project_details(district_id, projectid = 0) {
    var select_id = $('#selproject');
    $.ajax({
        url: "./server/KHB_Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            "req_type": "get_project_details",
            "district_id": district_id
        },
        success: function (res) {

            if (typeof res != "undefined" && res != null) {
                $(select_id).empty();
                $("<option value='0'>-- Select --</option>").appendTo(select_id);
                const project = res;
                for (let i in project) {
                    if (project[i].ProjectId == projectid) {
                        $("<option selected='selected' value='" + project[i].ProjectId + "'>" + project[i].ProjectName + "</option>").appendTo(select_id);
                    } else {
                        $("<option value='" + project[i].ProjectId + "'>" + project[i].ProjectName + "</option>").appendTo(select_id);
                    }
                }
            } else {
                emalert("Something went wrong! Please relod page!");
            }
        }
    });
}

function ageCalculator(userinput) {
    // var userinput = document.getElementById("DOB").value;
    var dob = new Date(userinput);
    if (userinput == null || userinput == '') {
        // document.getElementById("message").innerHTML = "**Choose a date please!";
        return false;
    } else {
        //calculate month difference from current date in time
        var month_diff = Date.now() - dob.getTime();

        //convert the calculated difference in date format
        var age_dt = new Date(month_diff);

        //extract year from date    
        var year = age_dt.getUTCFullYear();

        //now calculate the age of the user
        var age = Math.abs(year - 1970);
        return age;
        //display the calculated age
        // return document.getElementById("result").innerHTML =
        //     "Age is: " + age + " years. ";
    }
}

function matchCustom(params, data) {
    // If there are no search terms, return all of the data
    if ($.trim(params.term) === '') {
        return data;
    }

    // Do not display the item if there is no 'text' property
    if (typeof data.text === 'undefined') {
        return null;
    }

    // `params.term` should be the term that is used for searching
    // `data.text` is the text that is displayed for the data object
    if (data.text.toUpperCase().indexOf(params.term.toUpperCase()) > -1) {
        var modifiedData = $.extend({}, data, true);
        modifiedData.text += ' (matched)';

        // You can return modified objects from here
        // This includes matching the `children` how you want in nested data sets
        return modifiedData;
    }

    // Return `null` if the term should not be displayed
    return null;
}

function convertAmoutToINR(x) {
    // var x=12345652457.557;
    x = x.toString();
    var afterPoint = '';
    if (x.indexOf('.') > 0)
        afterPoint = x.substring(x.indexOf('.'), x.length);
    x = Math.floor(x);
    x = x.toString();
    var lastThree = x.substring(x.length - 3);
    var otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers != '')
        lastThree = ',' + lastThree;
    var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;

    // alert(res);
    return res;
}

function isEmail(email) {
    return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(email);
}