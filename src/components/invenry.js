let Global_Is_Storekeeper = 0;
var serverpath = "server/";
let InventoryWrapper = "../newDashboard/dashboard/src/server/Inventory/";

var autocomp_opt;
var invprofileid = 0;
var global_showbranches = 0;
var global_profileid = 0;
var global_loggedinuserid = 0;

var global_storeid = 0;
var global_storetypevalue = 0;
var global_products = [];
let global_school_id = 0;
var global_ECommerce = "";
var print_disable = 0;
var custombilltempflag = 0;
let globalIsHideDeleteButtonInTransaction = 0;
var indent_list_filter_data = "";
var Global_show_indent_list = 0;
var Global_Level = 0;
let Global_ShowStudentPageInTransaction = 0;

let global_allow_zero_stock_add_indent = 0;
$(document).ajaxStart(function () {
    //ajax request went so show the loading image
    $("div.em_loading_icon_block").show();
});
$(document).ajaxStop(function () {
    //got response so hide the loading image
    $("div.em_loading_icon_block").hide();
});
$(document).ajaxError(function () {
    //got error so hide the loading image
    $("div.em_loading_icon_block").hide();
});
$(document).ready(function () {


    getconfigjson();
    getindentlist();
    get_filter_data("indent_list");
    global_getproducts();
    $(document).on("click", "#navPOManagement", function () {
        window.location.href = "pomanagement.html";
    });
    $(document).on("click", "#navAddIndent", function () {
        // getindentlist(Global_Level);
        getindentlist();
    });
    tableFilter(
        "input#transaction_list_filter_table_input",
        "table tbody#showtrans tr"
    );
    $("select#selProject").select2({
        matcher: matchCustom,
    });
    $("select#cbxindentstores").select2({
        matcher: matchCustom,
    });
    $("select#cbxrptcostcenter").select2({
        matcher: matchCustom,
    });
    $("select#cbxdistricts").select2({
        matcher: matchCustom,
    });
    $("select#cbxInstallments").select2({
        matcher: matchCustom,
    });
    $("select#transactionStatusFilter").select2({
        matcher: matchCustom,
    });
    $(document).on("click", ".grant_authority", function () {
        $(".select_auth_staff").select2();
        $("#cbxstorebranch").select2();
        getallstaffsforauthority();
        getgrantedauthority();
    });
    $(document).on("click", "#navGrantAuthority", function () {
        get_grant_authority();
    });
    $(document).on("click", "#btnsaveauthority", function () {
        var authlevel = $("#txtautholevel").val();
        var addedlevel = $("#addedlevel").val();
        var authoritystaff = [];
        if ($.trim(authlevel) == "") {
            emalert("Enter Level");
            return false;
        }
        if ($.trim(authlevel) == 0) {
            emalert("Level should be greater than or equal to 1");
            return false;
        }
        branchid = 0;
        if (global_showbranches == 1) {
            var branchid = $("#cbxstorebranch").val();
            if (branchid == 0) {
                emalert("Select Branch Name");
                return false;
            }
        }

        var LevelWiseStaffArr = [];
        if (authlevel > 0) {
            for (var i = 1; i <= authlevel; i++) {
                var stfdrpdwn = $("#select_auth_staff_" + i).val();
                if (stfdrpdwn.length > 0) {
                    LevelWiseStaffArr[i] = stfdrpdwn;
                } else {
                    emalert("Select Authority Person");
                    return false;
                }
            }
        }

        saveauthdata(authlevel, addedlevel, branchid, LevelWiseStaffArr);
    });
    $(document).on("keyup", "#txtautholevel", function () {
        getallstaffsforauthority();

        var level = $("#txtautholevel").val();
        var appendDiv = $(".authoritymodal");
        if (level > 0) {
            appendDiv.empty();
            for (var i = 1; i <= level; i++) {
                $(
                    '<label for="cbxauthoritystaff">Level : ' +
                    i +
                    '</label><br /><select multiple style="width:100%" id="select_auth_staff_' +
                    i +
                    '" class="form-control select_auth_staff"></select>'
                ).appendTo(appendDiv);
                $("#select_auth_staff_" + i).select2();
                $("#cbxstorebranch").select2();
            }
        } else {
            appendDiv.empty();
        }
    });
    $(document).on("change", ".select_auth_staff", function () {
        var eleID = $(this).attr("id").match(/\d+/);
        var level = $("#txtautholevel").val();
        var eleID = parseInt(eleID, 10);
        eleID = eleID + 1;

        if (level > 0) {
            for (var i = 1; i <= level; i++) {
                var staffid = $("#select_auth_staff_" + i).val();
                if (staffid != 0) {
                    get_rem_staff(staffid, eleID);
                }
            }
        }
    });
    $(document).on("click", "#navProject", function () {
        getAllprojects();
    });
    $(document).on("click", "#navDashboard1", function () {
        getDashboardData();
    });
    $(document).on("click", "#export_data", function () {
        getDashboardData(1);
    });
    $(document).on("click", "#exportproject_data", function () {
        var project_id = $("#select_project option:selected").val();
        getProjectDetails(project_id, 1);
    });
    $(document).on("change", "#select_project", function () {
        var project_id = $(this).val();
        getProjectDetails(project_id);
    });
    $(document).on("click", "#add_project_btn", function () {
        let seldistricts = $("#cbxdistricts");
        let selInstallments = $("#cbxInstallments");
        $("#project_id").val(0);
        $("#project_name").val("");
        $("#project_description").val("");
        seldistricts.val("");
        selInstallments.val("");
        getcostcenters(seldistricts);
        getInstallments(selInstallments);
    });
    $(document).on("click", ".edit_project", function () {
        let projectid = $(this).closest("tr").data("ProjectId");
        let projectname = $(this).closest("tr").data("ProjectName");
        let projectdesc = $(this).closest("tr").data("ProjectDesc");
        let districtid = $(this).closest("tr").data("CostCenterId");
        let cbxInstallments = $(this).closest("tr").data("no_of_installment");
        seldistricts = $("#cbxdistricts");
        getcostcenters(seldistricts, districtid);
        selInstallments = $("#cbxInstallments");
        $("#project_id").val(projectid);
        $("#project_name").val(projectname);
        $("#project_description").val(projectdesc);
        $("#cbxInstallments").val(cbxInstallments).trigger("change.select2");
    });
    $(document).on("click", ".delete_project", function () {
        var projectid = $(this).closest("tr").data("ProjectId");
        var projectname = $(this).closest("tr").data("ProjectName");

        var r = confirm(projectname + " will be deleted?");
        if (r == true) {
            deleteproject(projectid); //"You pressed OK!";
        } else {
            return false; //"You pressed Cancel!";
        }
    });
    $(document).on("click", ".status_project", function () {
        const projectid = $(this).closest("tr").data("ProjectId");
        const projectname = $(this).closest("tr").data("ProjectName");

        changeprojectstatus(projectid);
      
    });
    $(document).on("click", "#save_project", function () {
        let projectname = $.trim($("#project_name").val());
        if (projectname == "") {
            showAlert(
                $("#add_project_modal .alertarea"),
                "danger",
                "Mandatory!",
                "Enter Project Name"
            );
            return false;
        }
        let projectdesc = $.trim($("#project_description").val());
        if (projectdesc == "") {
            showAlert(
                $("#add_project_modal .alertarea"),
                "danger",
                "Mandatory!",
                "Enter Project Description"
            );
            return false;
        }
        let CostCenterId = $("#cbxdistricts").val();
        if (parseInt(CostCenterId) == 0) {
            showAlert(
                $("#add_project_modal .alertarea"),
                "danger",
                "Mandatory!",
                "Select a District"
            );
            return false;
        }

        let Installments = $("#cbxInstallments").val();
        
        if (parseInt(Installments) == 0) {
            showAlert(
                $("#add_project_modal .alertarea"),
                "danger",
                "Mandatory!",
                "Select an Installment"
            );
            return false;
        }
        let projectid = $("#project_id").val();
        saveproject(projectid, projectname, projectdesc, CostCenterId, Installments);
    });
    $(document).on("click", "#btnaddindent", function () {
        getindstorelist();
        $("#modalAddIndent").data({ indentno: 0 });
        clearindentdata();
        $("#modalAddIndent").modal("show");
    });
    $(document).on("click", "#btnaddindtranrow", function () {
        var reqhead = $("#reqhead");
        reqhead.empty();
        $(
            "<th>Remove</th><th>Product</th><th>Stock</th><th>Unit of Measurement</th><th>Qty. Required</th>"
        ).appendTo(reqhead);
        var indenttablebody = $("#indenttran");
        var indenttablerow = $(
            "<tr><td><button type='button' class='btn btn-secondary btn-delete'>X</button></td><td><select class='cbxproduct' data-role='none' style='width: 98%'><option value='0'>Select a Product</option></select></td><td><label class='indentstock'>Stock</label></td><td><label class='indentUOM'>UOM</label></td><td><input type='text' class='form-control txtindentqtyreq' placeholder='Qty. Required' aria-label='Qty. Required' aria-describedby='addon-wrapping'></td></tr>"
        );
        indenttablerow.appendTo(indenttablebody);
        $("select.cbxproduct").select2({
            matcher: matchCustom,
        });
        var selprod = $("#indenttran>tr:last-child").find(".cbxproduct");
        getproducts(selprod);
    });
    $(document).on("click", ".btn-delete", function () {
        $(this).closest("tr").remove();
    });
    $(document).on("change", ".cbxproduct", function () {
        var productid = $(this).val();
        if (productid > 0) {
            var UOM = global_products[productid].UOM;
            var currentstock = getstockbyproductid(productid, $(this).closest("tr"));
            $(this).closest("tr").find(".indentUOM").text(UOM);
        }
    });
    $(document).on("click", ".indno", function () {
        indentno = $(this).text();
        getindstorelist();
        getindentdetailsforview(indentno);
    });
    $(document).on("click", ".edit_indent", function () {
        var indentno = $(this).closest("tr").find(".indno").text();        
        getindstorelist();
        getindentdetailsforedit(indentno);
    });
    $(document).on("click", ".delete_indent", function () {
        var indentno = $(this).closest("tr").find(".indno").text();
        $("#modalDeleteIndent").data("indentno", indentno);
        $("#lblindentno").text(indentno);
        $("#modalDeleteIndent").modal("show");
    });
    $(document).on("click", "#delete_indent", function () {
        var indentno = $("#modalDeleteIndent").data("indentno");
        deleteIndent(indentno);
    });
    $(document).on("click", "#save_indent", function () {
        var indentno = $("#modalAddIndent").data("indentno");
        var inddesc = $("#txtindentdescription").val();
        if ($.trim(inddesc) == "") {
            showAlert(
                $("#modalAddIndentbody>.alertarea"),
                "danger",
                "Mandatory!",
                "Enter Indent Title"
            );
            return false;
        }
        var storeid = $("#cbxindentstores").val();
        if (storeid == 0) {
            showAlert(
                $("#modalAddIndentbody>.alertarea"),
                "danger",
                "Mandatory!",
                "Select Store"
            );
            return false;
        }

        var remarks = $("#indentComent").val();
        var noofrows = $("#indenttran>tr").length;
        if (noofrows == 0) {
            showAlert(
                $("#modalAddIndentbody>.alertarea"),
                "danger",
                "Mandatory!",
                "Enter your requirements"
            );
            return false;
        }
        var indenttran = [];
        var error_count = 0;
        var warning_count = 0;
        $("#indenttran>tr").each(function (row) {
            var productid = $(this).find(".cbxproduct").val();
            if (productid == 0) {
                error_count++;

                // showAlert($("#modalAddIndentbody>.alertarea"), "danger", "Mandatory!", "Select Product in row " + (row + 1));
                // return false;
            }
            var qtyreq = isNaN(parseFloat($(this).find(".txtindentqtyreq").val())) ?
                0 :
                parseFloat($(this).find(".txtindentqtyreq").val());
            if (qtyreq == 0) {
                // showAlert($("#modalAddIndentbody>.alertarea"), "danger", "Mandatory!", "Enter Quantity required in row " + (row + 1));
                // return false;
                error_count++;
            }
            var stock = isNaN(parseFloat($(this).find(".indentstock").text())) ?
                0 :
                parseFloat($(this).find(".indentstock").text());
            if (qtyreq > stock) {
                // showAlert($("#modalAddIndentbody>.alertarea"), "warning", "Warning!", "Entered Quantity > Available stock in row " + (row + 1));
                warning_count++;
            }
            var indenttranobj = {
                indentno: indentno,
                desc: inddesc,
                storeid: storeid,
                productid: productid,
                qtyreq: qtyreq,
                remarks: remarks,
            };
            indenttran.push(indenttranobj);
        });

        if (error_count > 0) {
            showAlert(
                $("#modalAddIndentbody>.alertarea"),
                "danger",
                "Mandatory!",
                "Entered Proper Product/Quantity Details"
            );
            return false;
        }
        if (global_allow_zero_stock_add_indent == 1) {
            //Allow Indent
        } else {
            if (warning_count > 0) {
                showAlert(
                    $("#modalAddIndentbody>.alertarea"),
                    "warning",
                    "Warning!",
                    "Entered Quantity > Available stock"
                );
                return false;
            }
        }

        save_indent(indenttran);
    });
    $(document).on("click", "#navIndentlist", function () {
        getallindentlist(0, Global_Level);
        // getindentlist(Global_Level);
    });
    $(document).on("click", "#btnindentdownload", function () {
        from = 1;
        var search_filterlen = $(".indent_selected_filters > div").length;
        if (search_filterlen == 0) {
            getallindentlist(from, Global_Level);
        } else {
            get_indent_search_res(from, Global_Level);
        }
    });
    $(document).on("click", "#btnsearchstore", function () {
        var storename = $("#txtsearchstore").val().toUpperCase();
        $("#showallindents>tr").hide();
        $("#showallindents>tr").each(function () {
            txt = $(this).find(".invdesc").text().toUpperCase();
            if (txt.indexOf(storename) != -1) {
                $(this).show();
            }
            txt = $(this).find(".invstaff").text().toUpperCase();
            if (txt.indexOf(storename) != -1) {
                $(this).show();
            }
            txt = $(this).find(".invstore").text().toUpperCase();
            if (txt.indexOf(storename) != -1) {
                $(this).show();
            }
        });
    });
    $(document).on("click", ".view_indent", function () {
        indentno = $(this).closest("tr").find("td:nth-child(2)").text();
        getindviewstorelist();
        getindentlistdetailsforview(indentno);
    });
    $(document).on("click", ".btn-deleteinview", function () {
        $(this).closest("tr").remove();
    });
    $(document).on("click", "#reject_indent", function () {
        var level = $(this).data("rejectlevel");
        if ($("#viewindentRemarks").val() == "") {
            emalert("Enter Comment");
            return false;
        }
        // console.log(level);
        // return false;
        var indentdata = [];
        $("#viewindenttran>tr").each(function () {
            var indentno = $(this).data("indentno");
            var indentdate = $("#txtviewindentdate").val();
            var staffid = $(this).data("emstaffid");
            var indentdesc = $("#txtviewindentdescription").val();
            var productid = $(this).data("productid");
            var storeid = $(this).data("storeid");
            // var requiredqty = isNaN(parseFloat($(this).find(".qtyinv").text())) ? 0 : parseFloat($(this).find(".qtyinv").text());
            var requiredqty = isNaN(parseFloat($(this).data("qtyreq"))) ?
                0 :
                parseFloat($(this).data("qtyreq"));
            var remarks = $("#viewindentComent").val();
            var comment = $("#viewindentRemarks").val();
            var indentobj = {
                indentno: indentno,
                indentdate: indentdate,
                emstaffid: staffid,
                indentdesc: indentdesc,
                storeid: storeid,
                productid: productid,
                qtyreq: requiredqty,
                remark: remarks,
                level: level,
                comment: comment,
            };
            indentdata.push(indentobj);
        });
        if (indentdata.length > 0) {
            rejectindentinv(indentdata);
        } else {
            showAlert(
                $("#modalViewIndentbody>.alertarea"),
                "danger",
                "Failure!",
                "No Transactions to reject"
            );
        }
    });
    $(document).on("click", "#issue_indent", function () {
        var level = $(this).data("issuelevel");
        if ($("#viewindentRemarks").val() == "") {
            emalert("Enter Comment");
            return false;
        }
        var indentdata = [];
        $("#viewindenttran>tr").each(function () {
            var indentno = $(this).data("indentno");
            var indentdate = $("#txtviewindentdate").val();
            var staffid = $(this).data("emstaffid");
            var indentdesc = $("#txtviewindentdescription").val();
            var productid = $(this).data("productid");
            var storeid = $(this).data("storeid");

            // var requiredqty = isNaN(parseFloat($(this).find(".qtyinv").text())) ? 0 : parseFloat($(this).find(".qtyinv").text());
            var requiredqty = isNaN(parseFloat($(this).data("qtyreq"))) ?
                0 :
                parseFloat($(this).data("qtyreq"));

            var remarks = $("#viewindentComent").val();
            var comment = $("#viewindentRemarks").val();
            var indentobj = {
                indentno: indentno,
                indentdate: indentdate,
                emstaffid: staffid,
                indentdesc: indentdesc,
                storeid: storeid,
                productid: productid,
                qtyreq: requiredqty,
                remark: remarks,
                level: level,
                comment: comment,
            };
            indentdata.push(indentobj);
        });
        if (indentdata.length > 0) {
            saveindentinv(indentdata);
        } else {
            showAlert(
                $("#modalViewIndentbody>.alertarea"),
                "danger",
                "Failure!",
                "No Transactions to reject"
            );
        }
    });
    $(document).on("click", "#navInvTran", function () {
        if (Global_ShowStudentPageInTransaction == 1) {
            $(".ShowStudentPageInTransaction").empty();
            $(
                "<br> <a class='btn btn-primary' role='button' href='../feereceipt/PayForUniform.html?from_new_dashboard=1' target='_blank'> Verify Student Data </a>"
            ).appendTo(".ShowStudentPageInTransaction");
        }

        var accounttype = 0;
        searchaccount(accounttype);
        filsearchaccount(accounttype);
        selprod = $("#cbxfilproduct");
        getproducts(selprod);
        $("select#cbxfilaccount").select2({
            matcher: matchCustom,
        });
        $("select#cbxfilproduct").select2({
            matcher: matchCustom,
        });
        $("select#cbxfilcostcenter").select2({
            matcher: matchCustom,
        });
        var selcostcenters = $("select#cbxfilcostcenter");
        getcostcenters(selcostcenters);
        showtodaysdate("#tranfromdate");
        showtodaysdate("#trantodate");
        getalltransactions(1);
    });
    $(document).on("click", "#btnshowfilters", function () {
        $(this).closest("div").hide();
        $("#tranfilters").show("slow");
    });
    $(document).on("click", "#btnclosefilters", function () {
        $(".filterbutton").show();
        $(this).closest("div").hide("slow");
    });
    $(document).on("click", "#InvTranPagination .previous", function () {
        var currentpage = parseInt($(this).closest("div").data("currentpage"));
        paginationprev(currentpage, getalltransactions, $(this));
    });
    $(document).on("click", "#InvTranPagination .next", function () {
        var currentpage = parseInt($(this).closest("div").data("currentpage"));
        paginationnext(currentpage, getalltransactions, $(this));
    });
    $(document).on("click", "#InvTranPagination .normal", function () {
        var currentpage = parseInt($(this).find(".page-link").text());
        paginationpageitem(currentpage, getalltransactions);
    });
    $(document).on("click", "#btnaddtransaction", function () {
        $("#modalAddTran").modal("show");
        $("#invno").val("");
        $(".ibrn_cls").addClass("hidden");

        $(".GenCheckDiv").removeClass("hidden");
        $(".ReceiverCheckDiv").addClass("hidden");

        $("select#cbxaccount").select2({
            matcher: matchCustom,
        });
        $("select#cbxcostcenter").select2({
            matcher: matchCustom,
        });
        $("select#cbxstores").select2({
            matcher: matchCustom,
        });
        $("button#btnaddindtranrow").removeClass("hidden");
        var selcostcenters = $("select#cbxcostcenter");
        getcostcenters(selcostcenters);
        $(".mopdiv").addClass("hidden");
        $("#invtranbody").empty();
        var datetime = getDateTime();
        console.log("datetime=" + datetime);
        $("#txttrandate").val(datetime);
        addaTranrow();
    });
    $(document).on("click", "#radReceipt", function () {
        $("#trantypelabel").text("From");
        $("#save_invtran").text("Save");
        $(".mopdiv").addClass("hidden");

        $(".GenCheckDiv").removeClass("hidden");
        $(".ReceiverCheckDiv").addClass("hidden");
    });
    $(document).on("click", "#radIssueR", function () {
        $("#trantypelabel").text("To");
        $("#save_invtran").text("Save");
        $(".mopdiv").addClass("hidden");

        $(".GenCheckDiv").addClass("hidden");
        $(".StudentCheckDiv").removeClass("hidden");
    });
    $(document).on("click", "#radIssue", function () {
        $("#trantypelabel").text("To");
        $("#save_invtran").text("Save");
        $(".mopdiv").addClass("hidden");

        $(".GenCheckDiv").removeClass("hidden");
        $(".ReceiverCheckDiv").addClass("hidden");
    });
    $(document).on("click", "#radSales", function () {
        $("#trantypelabel").text("To");
        $("#save_invtran").text("Save & Print");
        $(".mopdiv").removeClass("hidden");

        $(".GenCheckDiv").removeClass("hidden");
        $(".SupplierCheckDiv").addClass("hidden");
        $(".StoresCheckDiv").addClass("hidden");
    });
    $(document).on("click", "#radStudent", function () {
        var accounttype = $("input:radio[name='typeofaccount']:checked").val();
        searchaccount(accounttype);
    });
    $(document).on("click", "#radStaff", function () {
        var accounttype = $("input:radio[name='typeofaccount']:checked").val();
        searchaccount(accounttype);
    });
    $(document).on("click", "#radSupplier", function () {
        var accounttype = $("input:radio[name='typeofaccount']:checked").val();
        searchaccount(accounttype);
    });
    $(document).on("click", "#radReceiver", function () {
        var accounttype = $("input:radio[name='typeofaccount']:checked").val();
        searchaccount(accounttype);
    });
    $(document).on("click", "#radStores", function () {
        var accounttype = $("input:radio[name='typeofaccount']:checked").val();
        searchaccount(accounttype);
    });
    $(document).on("click", "#radfilissue", function () {
        $("#filtrantypelabel").text("To");
    });
    $(document).on("click", "#radfilreceipt", function () {
        $("#filtrantypelabel").text("From");
    });
    $(document).on("click", "#radfilStudent", function () {
        var accounttype = $("input:radio[name='filtypeofaccount']:checked").val();
        filsearchaccount(accounttype);
    });
    $(document).on("click", "#radfilStaff", function () {
        var accounttype = $("input:radio[name='filtypeofaccount']:checked").val();
        filsearchaccount(accounttype);
    });
    $(document).on("click", "#radfilSupplier", function () {
        var accounttype = $("input:radio[name='filtypeofaccount']:checked").val();
        filsearchaccount(accounttype);
    });
    $(document).on("click", "#radfilReceiver", function () {
        var accounttype = $("input:radio[name='filtypeofaccount']:checked").val();
        filsearchaccount(accounttype);
    });
    $(document).on("click", "#radfilStores", function () {
        var accounttype = $("input:radio[name='filtypeofaccount']:checked").val();
        filsearchaccount(accounttype);
    });
    $(document).on("click", "#btntranfilter", function () {
        var transtype = $("input:radio[name='filtrantype']:checked").val();
        var accounttype = $("input:radio[name='filtypeofaccount']:checked").val();
        var accountid = $("#cbxfilaccount").val();
        var productid = $("#cbxfilproduct").val();
        var fromdate = $("#tranfromdate").val();
        var todate = $("#trantodate").val();
        var costcenterid = $("#cbxfilcostcenter").val();
        getallfiltertransactions(
            transtype,
            accounttype,
            accountid,
            costcenterid,
            productid,
            fromdate,
            todate,
            1
        );
    });
    $(document).on("click", "#btntrandownload", function () {
        if ($("#tranfilters").is(":visible")) {
            var transtype = $("input:radio[name='filtrantype']:checked").val();
            var accounttype = $("input:radio[name='filtypeofaccount']:checked").val();
            var accountid = $("#cbxfilaccount").val();
            var productid = $("#cbxfilproduct").val();
            var fromdate = $("#tranfromdate").val();
            var todate = $("#trantodate").val();
            var costcenterid = $("#cbxfilcostcenter").val();
            var fromdownload = 1;
            getallfiltertransactions(
                transtype,
                accounttype,
                accountid,
                costcenterid,
                productid,
                fromdate,
                todate,
                1,
                fromdownload
            );
        } else {
            var fromdownload = 1;
            getalltransactions(1, fromdownload, $("#transactionStatusFilter").val());
        }
    });
    $(document).on("click", "#btnaddindtranrow", function () {
        addaTranrow();
    });
    $(document).on("change", ".cbxinvproduct", function () {
        var productid = $(this).val();
        let prod_this = this;
        if (productid > 0) {
            var UOM = global_products[productid].UOM;
            var Tax = parseFloat(global_products[productid].Tax);
            var Rate = parseFloat(global_products[productid].Rate);
            var taxper = Tax / 100;
            var taxamt = Rate * taxper;
            var MRP = Rate + taxamt;
            var currentstock = getstockbyinvproductid(
                productid,
                $(this).closest("tr")
            );
            $(this).closest("tr").find(".invUOM").text(UOM);
            $(this).closest("tr").find(".invPrice").val(Rate);
            $(this).closest("tr").find(".invPrice").data("MRP", MRP);
            console.log("MRP=" + MRP);
            $(this).closest("tr").find(".invTax").text(Tax);
            /*if (global_school_id == 5036) {
                      $.ajax({
                          url: serverpath + "get_product_cost.php",
                          type: "post",
                          dataType: "json",
                          data: { product_id: productid, cost_center_id: $("#cbxcostcenter").val() },
                          success: function(data) {
                              if (typeof data != "undefined" && data != null) {
                                  $(prod_this).closest("tr").find(".txtinvunitcost").val(data.cost);
                                  $(prod_this).closest("tr").find(".txtinvqty").val(0);
                                  $(prod_this).closest("tr").find(".invtotal").text("");
                                  calculatetranamount();
                              } else {
                                  $(prod_this).closest("tr").find(".txtinvunitcost").val(Rate);
                                  $(prod_this).closest("tr").find(".txtinvqty").val(0);
                                  $(prod_this).closest("tr").find(".invtotal").text("");
                                  calculatetranamount();
                              }
                          }
                      });
                  } else {*/
            /*$(this).closest("tr").find(".txtinvunitcost").text(Cost);
                  $(this).closest("tr").find(".txtinvunitcost").data("Rate", Rate);*/
            $(this).closest("tr").find(".txtinvqty").val(0);
            $(this).closest("tr").find(".invtotal").text("");
            calculatetranamount();
            /*}*/
        }
    });
    $(document).on("blur", ".invPrice", function () {
        calculatetranamount();
    });
    $(document).on("blur", ".txtinvqty", function () {
        calculatetranamount();
    });
    $(document).on("click", ".btn-deleteinv", function () {
        $(this).closest("tr").remove();
    });
    $(document).on("change", "#cbxmop", function () {
        let mop = $.trim($(this).val());
        console.log(mop);
        switch (mop) {
            case "C":
                $(".chqdiv").addClass("hidden");
                $(".carddiv").addClass("hidden");
                $(".onlinediv").addClass("hidden");
                break;
            case "Q":
                $(".chqdiv").removeClass("hidden");
                $(".carddiv").addClass("hidden");
                $(".onlinediv").addClass("hidden");
                break;
            case "R":
                $(".chqdiv").addClass("hidden");
                $(".carddiv").removeClass("hidden");
                $(".onlinediv").addClass("hidden");
                break;
            case "O":
                $(".chqdiv").addClass("hidden");
                $(".carddiv").addClass("hidden");
                $(".onlinediv").removeClass("hidden");
                break;
        }
    });
    $(document).on("click", "#save_invtran", function () {
        var transtype = 0;
        acctype = 0;
        accname = "Student Name";
        var paid = "";
        if ($("#radIssue").is(":checked")) {
            transtype = 1;
        }
        if ($("#radReceipt").is(":checked")) {
            transtype = 2;
        }
        if ($("#radSales").is(":checked")) {
            transtype = 10;
            paid = 1;
        }
        if ($(".issue_by_receipt_no").is(":checked")) {
            //issue by invoice receipt
            transtype = 1;
            paid = 1; //hard coded because we are only showing the paid sales invoice details only.
        }
        var storeid = 0;
        acctype = $("input:radio[name='typeofaccount']:checked").val();
        switch (parseInt(acctype, 10)) {
            case 0:
                accname = "Student Name";
                break;
            case 1:
                accname = "Staff Name";
                break;
            case 2:
                accname = "Supplier Name";
                break;
            case 3:
                accname = "Receiver Name";
                break;
            case 4:
                accname = "Store Name";
                storeid = parseInt($("#cbxaccount").val());
                break;
        }
        //console.log(accname);
        accountid = parseInt($("#cbxaccount").val());
        if (accountid) { } else {
            showAlert(
                $("#modalAddTranbody>.alertarea"),
                "danger",
                "Failure!",
                "Select " + accname
            );
            return false;
        }
        costcenterid = $("#cbxcostcenter").val();
        // if (costcenterid) { } else {
        //     showAlert($("#modalAddTranbody>.alertarea"), "danger", "Failure!", "Select a Cost Center Name");
        //     return false;
        // }
        issuedate = $("#txttrandate").val();
        if ($.trim(issuedate) == "") {
            showAlert(
                $("#modalAddTranbody>.alertarea"),
                "danger",
                "Failure!",
                "Select Date of Transaction"
            );
            return false;
        }
        d = new Date(issuedate);
        if (!isValidDate(d)) {
            showAlert(
                $("#modalAddTranbody>.alertarea"),
                "danger",
                "Failure!",
                "Enter Proper Date of Transaction"
            );
            return false;
        } else {
            transactiontmstp = d.getTime();
            todaystmstp = new Date().getTime();
            console.log(transactiontmstp + "-" + todaystmstp);
            if (transactiontmstp - todaystmstp > 0) {
                showAlert(
                    $("#modalAddTranbody>.alertarea"),
                    "danger",
                    "Failure!",
                    "Enter Proper Date of Transaction"
                );
                return false;
            }
        }
        transactions = [];
        noerror = 1;
        $("#invtranbody tr").each(function () {
            productid = parseInt($(this).find(".cbxinvproduct").val());
            if (productid) {
                cost = $(this).find(".invPrice").val();
                price = $(this).find(".invPrice").data("MRP");
                tax = $(this).find(".invTax").text();
                if (isNaN(parseFloat(cost, 10))) {
                    // || cost == 0
                    console.log(cost);
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Rate for " +
                        $(this).find(".cbxinvproduct option:selected").text() +
                        " is not a number"
                    );
                    noerror = 0;
                    return false;
                }
                qty = $(this).find(".txtinvqty").val();
                if (isNaN(parseFloat(qty, 10)) || qty == 0) {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Quantity for " +
                        $(this).find(".cbxinvproduct option:selected").text() +
                        " is not a number"
                    );
                    noerror = 0;
                    return false;
                }
                row = {
                    productid: productid,
                    price: price,
                    tax: tax,
                    cost: cost,
                    qty: qty,
                };
                transactions.push(row);
            } else {
                showAlert(
                    $("#modalAddTranbody>.alertarea"),
                    "danger",
                    "Failure!",
                    "Select Product"
                );
                noerror = 0;
                return false;
            }
        });
        if (noerror == 0) {
            return false;
        }
        let mop = $.trim($("#cbxmop").val());
        let mopdet = [];
        let mopobj = {};
        if (mop != "C") {
            if (mop == "Q") {
                let bankname = $("#txtbankname").val();
                if ($.trim(bankname) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Bank Name"
                    );
                    return false;
                }

                let chqno = $("#txtchqno").val();
                if ($.trim(chqno) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Cheque/DD No."
                    );
                    return false;
                }
                let chqdate = $("#txtchqdate").val();
                if ($.trim(chqdate) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Cheque/DD Date"
                    );
                    return false;
                }
                mopobj = { bankname: bankname, chqno: chqno, chqdate: chqdate };
            } else if (mop == "R") {
                let bankname = $("#txtrbankname").val();
                if ($.trim(bankname) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Bank Name"
                    );
                    return false;
                }
                let cardno = $("#txtcardno").val();
                if ($.trim(cardno) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Last 4 Digits of Card No."
                    );
                    return false;
                }
                if (cardno.length > 4) {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Only Last 4 Digits of Card No."
                    );
                    return false;
                }
                let cardtype = $("#txtcardtype").val();
                if ($.trim(cardtype) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Card Type"
                    );
                    return false;
                }
                let rrno = $("#txtrrno").val();
                if ($.trim(rrno) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter RR Number"
                    );
                    return false;
                }
                let apprcode = $("#txtapprcode").val();
                if ($.trim(apprcode) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Appr Code"
                    );
                    return false;
                }
                mopobj = {
                    bankname: bankname,
                    cardno: cardno,
                    cardtype: cardtype,
                    rrno: rrno,
                    apprcode: apprcode,
                };
            } else if (mop == "O") {
                let bankname = $("#txtobankname").val();
                if ($.trim(bankname) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Bank Name"
                    );
                    return false;
                }
                let tranno = $("#txttranno").val();
                if ($.trim(tranno) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Transaction No."
                    );
                    return false;
                }
                let trandate = $("#txttrandate").val();
                if ($.trim(trandate) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Tran. Date"
                    );
                    return false;
                }
                let refno = $("#txtrefno").val();
                if ($.trim(refno) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Ref. No."
                    );
                    return false;
                }
                let trantype = $("#cbxtrantype").val();
                if ($.trim(trantype) == 0) {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Tran. Type"
                    );
                    return false;
                }
                let gateway = $("#txtgateway").val();
                if ($.trim(gateway) == "") {
                    showAlert(
                        $("#modalAddTranbody>.alertarea"),
                        "danger",
                        "Failure!",
                        "Enter Gateway"
                    );
                    return false;
                }
                mopobj = {
                    bankname: bankname,
                    tranno: tranno,
                    trandate: trandate,
                    refno: refno,
                    trantype: trantype,
                    gateway: gateway,
                };
            }
            mopdet.push(mopobj);
        }
        total = 0;
        var remark = $("#invtranComment").val();
        var invoiceno = $("#invno").val() == "" ? 0 : $("#invno").val();

        if (transactions.length > 0) {
            total = parseFloat($("#invgrandtotal").html(), 10);
            if (total == 0) {
                showAlert(
                    $("#modalAddTranbody>.alertarea"),
                    "danger",
                    "Failure!",
                    "Enter Transactions"
                );
                return false;
            } else {
                $.ajax({
                    url: serverpath + "savetransactions.php",
                    type: "post",
                    dataType: "json",
                    data: {
                        transtype: transtype,
                        acctype: acctype,
                        accountid: accountid,
                        costcenterid: costcenterid,
                        storeid: storeid,
                        issuedate: issuedate,
                        transactions: transactions,
                        invoiceno: invoiceno,
                        mop: mop,
                        mopdet: mopdet,
                        remark: remark,
                        paid: paid,
                    },
                    success: function (data) {
                        showAlert(
                            $("#Transactionlistdiv>.alertarea"),
                            "success",
                            "Success!",
                            "Transaction Saved"
                        );
                        $("#radIssue").prop("checked", true);
                        $("#radReceipt").prop("checked", false);
                        $("#radSales").prop("checked", false);
                        $("#radStudent").prop("checked", true);
                        $("#radStaff").prop("checked", false);
                        $("#radSupplier").prop("checked", false);
                        $("#radReceiver").prop("checked", false);
                        $("#radStores").prop("checked", false);
                        if (global_ECommerce == "property") {
                            $("#lbltranby").text("Customer");
                        } else {
                            $("#lbltranby").text("Student");
                        }

                        $("#cbxaccount").val(0);
                        $("#cbxcostcenter").val(0);
                        $("#chqdiv").addClass("hidden");
                        $("#carddiv").addClass("hidden");
                        $("#onlinediv").addClass("hidden");
                        $("#mopdiv").addClass("hidden");
                        $("#invtranbody").empty();
                        $("#invgrandtotal").text("");
                        $("#txtbankname").val("");
                        $("#txtchqno").val("");
                        $("#txtchqdate").val("");
                        $("#txtrbankname").val("");
                        $("#txtcardno").val("");
                        $("#txtcardtype").val("");
                        $("#txtrrno").val("");
                        $("#txtapprcode").val("");
                        $("#txtobankname").val("");
                        $("#txttranno").val("");
                        $("#txttrandate").val("");
                        $("#refno").val("");
                        $("#cbxtrantype").val(0);
                        $("#txtgateway").val("");
                        addaTranrow();
                        $("#modalAddTran").modal("hide");
                        getalltransactions(1);
                        if (transtype == 10 && print_disable == 0) {
                            let win = window.open("./templates/tempbill.html?BillNo=" + data);
                            win.focus();
                        }
                    },
                });
            }
        } else {
            showAlert(
                $("#modalAddTranbody>.alertarea"),
                "danger",
                "Failure!",
                "Enter Transactions"
            );
            return false;
        }
    });
    $(document).on("click", "#navReports", function () {
        $("select#cbxrptproduct").select2({
            matcher: matchCustom,
        });
        var selprod = $("#cbxrptproduct");
        getproducts(selprod);
        var selcostcenters = $("#cbxrptcostcenter");
        getcostcenters(selcostcenters);
        showtodaysdate("#rptfromdate");
        showtodaysdate("#rpttodate");
        showtodaysdate("#rptsrfromdate");
        showtodaysdate("#rptsrtodate");
    });
    $(document).on("click", "#navProjectDetails", function () {
        $("select#select_project").select2({
            matcher: matchCustom,
        });
        var projectsel = $("#select_project");
        getprojects(projectsel);
    });
    $(document).on("click", "#btnproducthistory", function () {
        var productid = $("#cbxrptproduct").val();
        if (productid == 0) {
            showAlert(
                $("#Reports>.alertarea"),
                "danger",
                "Failure!",
                "Select Product"
            );
            return false;
        }
        var fromdate = $("#rptfromdate").val();
        var todate = $("#rpttodate").val();
        $.ajax({
            url: serverpath + "producthistory.php",
            dataType: "json",
            type: "post",
            data: { productid: productid, fromdate: fromdate, todate: todate },
            success: function (data) {
                createproducthistorytable(data);
            },
        });
    });
    $(document).on("click", "#btnproducthistorydownload", function () {
        var from = 1;
        var productid = $("#cbxrptproduct").val();
        if (productid == 0) {
            showAlert(
                $("#Reports>.alertarea"),
                "danger",
                "Failure!",
                "Select Product"
            );
            return false;
        }
        var fromdate = $("#rptfromdate").val();
        var todate = $("#rpttodate").val();
        $.ajax({
            url: serverpath + "producthistory.php",
            dataType: "text",
            type: "post",
            data: {
                productid: productid,
                fromdate: fromdate,
                todate: todate,
                from: from,
            },
            success: function (filename) {
                if (typeof filename != "undefined") {
                    window.location.href = serverpath + "/download.php?f=" + filename;
                }
            },
        });
    });
    $(document).on("click", "#btnstockregister", function () {
        var fromdate = $("#rptsrfromdate").val();
        var todate = $("#rptsrtodate").val();
        var costcenterid = $("#cbxrptcostcenter").val();
        var costcentername = $("#cbxrptcostcenter option:selected").text();
        $.ajax({
            url: serverpath + "stockregister.php",
            dataType: "json",
            type: "post",
            data: {
                costcenterid: costcenterid,
                fromdate: fromdate,
                todate: todate,
                costcentername: costcentername,
            },
            success: function (data) {
                createstockregistertable(data);
            },
        });
    });
    $(document).on("click", "#btnstockregisterdownload", function () {
        var from = 1;
        var fromdate = $("#rptsrfromdate").val();
        var todate = $("#rptsrtodate").val();
        var costcenterid = $("#cbxrptcostcenter").val();
        var costcentername = $("#cbxrptcostcenter option:selected").text();
        $.ajax({
            url: serverpath + "stockregister.php",
            dataType: "text",
            type: "post",
            data: {
                from: from,
                costcenterid: costcenterid,
                fromdate: fromdate,
                todate: todate,
                costcentername: costcentername,
            },
            success: function (filename) {
                if (typeof filename != "undefined") {
                    window.location.href = serverpath + "/download.php?f=" + filename;
                }
            },
        });
    });
    $(document).on("click", "#navStores", function () {
        $("select#cbxstoretype").select2({
            matcher: matchCustom,
        });

        $("#cbxstorebranch").select2({
            matcher: matchCustom,
        });
        $("#cbxstorekeeper").select2({
            matcher: matchCustom,
        });
        getallstoretypes();
        getallstores();
        getallstaffs();
    });
    $(document).on("click", ".edit_store", function () {
        var storeid = $(this).closest("tr").data("storeid");
        var storename = $(this).closest("tr").data("storename");
        var branchid = $(this).closest("tr").data("branchid");
        var BranchName = $(this).closest("tr").data("BranchName");
        var BranchNick = $(this).closest("tr").data("BranchNick");
        var storetypeid = $(this).closest("tr").data("storetypeid");
        var storetype = $(this).closest("tr").data("storetype");
        var storetypevalue = $(this).closest("tr").data("storetypevalue");
        var storekeepers = $(this).closest("tr").data("storekeepers");
        var storekeeperids = $(this).closest("tr").data("storekeeperids");
        var storekeeperidarr = storekeeperids.split(",");
        $("#txtstorename").val(storename);
        $("#txtstoreid").val(storeid);
        $("#cbxstoretype").val(storetypeid).trigger("change.select2");
        if (global_showbranches == 1) {
            $("#cbxstorebranch").val(branchid).trigger("change.select2");
        }
        $("#cbxstorekeeper").val(storekeeperidarr).trigger("change.select2");
        // $("#storelist").hide();
        // $("#storedetails").show();
        scrolltoTop();
    });
    $(document).on("change", "#cbxstorebranch", function () {
        getallstaffs();
    });
    $(document).on("click", "#btnsavestore", function () {
        var ECommerceFlag = 0;
        var storename = $("#txtstorename").val();
        if (global_ECommerce == "property") {
            ECommerceFlag = 1;
        }
        if ($.trim(storename) == "") {
            if (ECommerceFlag == 1) {
                showAlert(
                    $("#add_store_modal .alertarea"),
                    "danger",
                    "Mandatory!",
                    "Enter Notification No"
                );
            } else {
                showAlert(
                    $("#add_store_modal .alertarea"),
                    "danger",
                    "Mandatory!",
                    "Enter Store Name"
                );
            }

            // emalert("Enter Store Name");
            return false;
        }
        var storetype = $("#cbxstoretype").val();
        if (ECommerceFlag == 1) {
            storetype = "1";
        }

        if (storetype == 0) {
            showAlert(
                $("#add_store_modal .alertarea"),
                "danger",
                "Mandatory!",
                "Enter Store Type"
            );
            // emalert("Enter Store Type");
            return false;
        }
        branchid = 0;
        if (global_showbranches == 1) {
            var branchid = $("#cbxstorebranch").val();
            if (branchid == 0) {
                showAlert(
                    $("#add_store_modal .alertarea"),
                    "danger",
                    "Mandatory!",
                    "Select Branch Name"
                );
                // emalert("Select Branch Name");
                return false;
            }
        }
        var storekeepers = $("#cbxstorekeeper").val();
        if ((ECommerceFlag = 1)) {
            storekeepers.push(global_loggedinuserid);
        }
        console.log("jir");
        console.log(storekeepers);
        if (storekeepers.length == 0) {
            showAlert(
                $("#add_store_modal .alertarea"),
                "danger",
                "Mandatory!",
                "Select Storekeepers"
            );
            // emalert("Select Storekeepers");
            return false;
        }
        var storeid = $("#txtstoreid").val();
        console.log("Store Type->" + storetype);
        console.log("E Comm ->" + global_ECommerce);
        savestoredata(storeid, storename, storetype, branchid, storekeepers);
    });
    $(document).on("click", ".delete_store", function () {
        var storeid = $(this).closest("tr").data("storeid");
        var storename = $(this).closest("tr").data("storename");

        var r = confirm(storename + " will be deleted?");
        if (r == true) {
            deletestore(storeid); //"You pressed OK!";
        } else {
            return false; //"You pressed Cancel!";
        }
    });
    $(document).on("click", "#navProductTypes", function () {
        get_product_type_info();
    });
    $(document).on("click", ".edit_product_type", function () {
        let product_type_id = $(this).closest("tr").data("product_type_id");
        $("input#product_type_id").val(product_type_id);
        // console.log("product_type_id =>", product_type_id);
        get_product_type(product_type_id);
    });
    $("#add_product_type_btn").click(function () {
        $("input#product_type_id").val(0);
        $("#add_product_type_modal input").val("");
    });
    $(document).on("click", ".delete_product_type", function () {
        let product_type_id = $(this).closest("tr").data("product_type_id");
        let product_type_name = $(this).closest("tr").data("product_type_name");
        var r = confirm(product_type_name + " will be deleted?");
        if (r == true) {
            delete_product_type(product_type_id); //"You pressed OK!";
        } else {
            return false; //"You pressed Cancel!";
        }
    });
    $("#save_produt_type").click(function () {
        let product_type_name = $("input#product_type_name").val();
        let product_type_description = $("input#product_type_description").val();
        let product_type_id = $("input#product_type_id").val();
        if (
            product_type_description.trim() != "" &&
            product_type_name.trim() != ""
        ) {
            save_product_type(
                product_type_id,
                product_type_name,
                product_type_description
            );
        } else {
            // emalert("Product Name and Description are mandatory!");
            showAlert(
                $("#add_product_type_modal .alertarea"),
                "danger",
                "Mandatory!",
                "Enter Product Name and Description"
            );
        }
    });
    $(document).on("click", "#navProducts", function () {
        $("#product_type_select").select2({
            matcher: matchCustom,
        });
        get_product_info();
        getproducttypes();
    });
    $(document).on("click", "#dwnld_product_frmat", function () {
        downloadFormat();
    });
    $(document).on("click", "#upload_product_data", function () {
        uploadProductData();
    });
    $("#add_product_btn").click(function () {
        $("input#product_id").val(0);
        $("#add_product_modal input").val("");
    });
    $(document).on("click", ".edit_product", function () {
        product_id = $(this).closest("tr").data("product_id");
        get_product_details(product_id);
    });
    $("button#save_produt_info").click(function () {
        if ($.trim($("#product_name").val()) == "") {
            showAlert(
                $("#add_product_modal .alertarea"),
                "danger",
                "Mandatory!",
                "Enter Product Name"
            );
            // emalert('Enter Product Name');
            return false;
        }
        if ($.trim($("#product_opening_stock").val()) != "") {
            if (isNaN(parseFloat($("#product_opening_stock").val(), 10))) {
                showAlert(
                    $("#add_product_modal .alertarea"),
                    "danger",
                    "Mandatory!",
                    "Enter Numeric Value in Opening Stock"
                );
                // emalert("Enter Numeric Value in Opening Stock");
                return false;
            }
        }
        var productid = $("input#product_id").val();
        producttypeid = $("#product_type_select").val();
        if (producttypeid == 0) {
            showAlert(
                $("#add_product_modal .alertarea"),
                "danger",
                "Mandatory!",
                "Select Product Type"
            );
            // emalert("Select Product Type");
            return false;
        }
        if ((productid = "")) {
            productid = 0;
            productname = $("#product_name").val();
            productdesc = $("#product_description").val();
            uom = $("#product_unit_measurement").val();
            assetno = $("#product_asset_no").val();
            place = $("#txtplace").val();
            unitcost = $("#product_unit_cost").val();
            openingstock = $("#product_opening_stock").val();
        } else {
            productid = $("input#product_id").val();
            productname = $("#product_name").val();
            productdesc = $("#product_description").val();
            uom = $("#product_unit_measurement").val();
            assetno = $("#product_asset_no").val();
            place = $("#txtplace").val();
            unitcost = $("#product_unit_cost").val();
            openingstock = $("#product_opening_stock").val();
        }
        var product_tax = $("#product_tax").val();
        if (isNaN(product_tax)) {
            showAlert(
                $("#add_product_modal .alertarea"),
                "danger",
                "Mandatory!",
                "Tax should be a number"
            );
            // emalert("Select Product Type");
            return false;
        }
        var ProjectId = 0;
        var RegistrationFee = 0;
        var IDAmount = 0;

        var specificationOrMeasurement = "";
        var Model = "";
        var roomNumber = 0;
        var blockName = "";
        var vendorOrSupplier = "";
        var dateOfPurchase = "";

        if ($("#selProject").is(":visible")) {
            ProjectId = $("#selProject").val();
            if (ProjectId == 0) {
                showAlert(
                    $("#add_product_modal .alertarea"),
                    "danger",
                    "Mandatory!",
                    "Select a Project"
                );
                // emalert("Select Product Type");
                return false;
            }
            RegistrationFee = $("#registration_fee").val();
            if (RegistrationFee == 0) {
                showAlert(
                    $("#add_product_modal .alertarea"),
                    "danger",
                    "Mandatory!",
                    "Enter Registration Fee"
                );
                // emalert("Select Product Type");
                return false;
            }
            IDAmount = $("#ID_Amount").val();
            if (IDAmount == 0) {
                showAlert(
                    $("#add_product_modal .alertarea"),
                    "danger",
                    "Mandatory!",
                    "Enter ID Amount"
                );
                // emalert("Select Product Type");
                return false;
            }
        }
        var is_quantity_selectable = $("#is_quantity_selectable").val();
        var max_quantity_selectable = $("#max_quantity_selectable").val();
        var min_quantity_selectable = $("#min_quantity_selectable").val();

        specificationOrMeasurement = $("#specificationOrMeasurement").val();
        Model = $("#Model").val();
        roomNumber = $("#roomNumber").val();
        blockName = $("#blockName").val();
        vendorOrSupplier = $("#vendorOrSupplier").val();
        dateOfPurchase = $("#dateOfPurchase").val();

        var MinimumQty = $("#MinimumQty").val();

        if (MinimumQty == 0 || MinimumQty == "") {
            showAlert(
                $("#add_product_modal .alertarea"),
                "danger",
                "Mandatory!",
                "Enter Min Stock Level"
            );
            return false;
        }

        var ManufacturerName = $("#ManufacturerName").val();
        var ManufacturingDate = $("#ManufacturingDate").val();
        var ExpiryDate = $("#ExpiryDate").val();

        $.ajax({
            type: "post",
            url: serverpath + "saveproduct.php",
            data: {
                productid: productid,
                productname: productname,
                productdesc: productdesc,
                uom: uom,
                place: place,
                openingstock: openingstock,
                producttypeid: producttypeid,
                unitcost: unitcost,
                assetno: assetno,
                product_tax: product_tax,
                ProjectId: ProjectId,
                RegistrationFee: RegistrationFee,
                IDAmount: IDAmount,
                is_quantity_selectable: is_quantity_selectable,
                max_quantity_selectable: max_quantity_selectable,
                min_quantity_selectable: min_quantity_selectable,
                MinimumQty: MinimumQty,
                ManufacturerName: ManufacturerName,
                ManufacturingDate: ManufacturingDate,
                ExpiryDate: ExpiryDate,

                specificationOrMeasurement: specificationOrMeasurement,
                Model: Model,
                roomNumber: roomNumber,
                blockName: blockName,
                vendorOrSupplier: vendorOrSupplier,
                dateOfPurchase: dateOfPurchase,
            },
            dataType: "json",
            success: function (Data) {
                // console.log("I am here " + productid);
                if (productid == 0) {
                    showAlert(
                        $("#Products .main_alert"),
                        "success",
                        "Success!",
                        productname + " Added"
                    );
                    global_getproducts();
                    // emsuccess(productname + ' Added');
                } else {
                    showAlert(
                        $("#Products .main_alert"),
                        "success",
                        "Success!",
                        productname + " Updated"
                    );
                    // emsuccess(productname + ' Updated');
                }
                $("#close_product_modal").click();
            },
            complete: function () {
                get_product_info();
                scrolltoTop();
            },
        });
    });
    $(document).on("click", "a.delete_product", function () {
        let product_id = $(this).closest("tr").data("product_id");
        let product_name = $(this).closest("tr").data("product_name");
        var r = confirm(product_name + " will be deleted?");
        if (r == true) {
            delete_product_fn(product_id); //"You pressed OK!";
        } else {
            return false; //"You pressed Cancel!";
        }
    });
    $("#filter_input").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#product_list_table tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
    $("#search_project").on("keyup", function () {
        var value = $(this).val().toLowerCase();
        $("#dashboard_tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
    $(document).on("click", "#navSuppliers", function () {
        get_supplier_info();
    });
    $(document).on("click", "a.edit_supplier", function () {
        customer_id = $(this).closest("tr").data("customer_id");
        customer_name = $(this).closest("tr").data("customer_name");
        customer_type_id = $(this).closest("tr").data("customer_type_id");
        getaccountbyid(customer_id, customer_type_id);
    });
    $("#add_supplier").click(function () {
        $("input#input_supplier_id").val(0);
        $("#add_supplier_modal input").val("");
    });
    //Save Account
    $("#save_supp_info").click(function () {
        var customerid = $("#input_supplier_id").val();
        if ((customerid = "")) {
            customerid = 0;
        } else {
            customerid = $("#input_supplier_id").val();
        }
        if ($("#supp_type_1").is(":checked")) {
            typeid = 0;
        } else if ($("#supp_type_3").is(":checked")) {
            typeid = 3;
        } else {
            typeid = 1;
        }
        customername = $("#supp_name").val();
        address = $("#supp_address").val();
        phoneno = $("#supp_phone").val();
        if (customername == "") {
            // emalert("Enter Supplier/Receiver name");
            showAlert(
                $("#add_supplier_modal .alertarea"),
                "danger",
                "Mandatory!",
                "Enter Supplier/Receiver name"
            );
            return false;
        }
        $.ajax({
            type: "post",
            url: serverpath + "saveaccount.php",
            data: {
                customerid: customerid,
                customername: customername,
                address: address,
                phoneno: phoneno,
                typeid: typeid,
            },
            dataType: "json",
            success: function () {
                if (customerid == 0) {
                    showAlert(
                        $("#Suppliers .main_alert"),
                        "success",
                        "Success!",
                        "Account Saved"
                    );
                    // emsuccess("Account Saved");
                } else {
                    showAlert(
                        $("#Suppliers .main_alert"),
                        "success",
                        "Success!",
                        "Account Updated"
                    );
                    // emsuccess("Account Updated");
                }
                $("#close_supplier_modal").click();
            },
            complete: function () {
                get_supplier_info();
                scrolltoTop();
            },
        });
    });
    $(document).on("click", "a.delete_supplier", function () {
        customer_id = $(this).closest("tr").data("customer_id");
        customer_name = $(this).closest("tr").data("customer_name");
        // customer_type_id = $(this).closest("tr").data("customer_type_id");
        var r = confirm(customer_name + " will be deleted?");
        if (r == true) {
            delete_supplier(customer_id); //"You pressed OK!";
        } else {
            return false; //"You pressed Cancel!";
        }
    });
    $(document).on("click", "#navCostCenters", function () {
        $("select#cbxstores").select2({
            matcher: matchCustom,
        });
        getallstoresforcostcenter();
        get_cost_center();
    });
    $("#add_cost_center_btn").click(function () {
        $("input#cost_center_id").val(0);
        $("#cost_center_description").val("");
        $("#add_cost_center_modal input").val("");
        if (global_ECommerce == "property") {
            $("#cost_center_name").hide();
            $("#cost_center_drpdwn").show();
            $("#cost_center_drpdwn").select2({
                matcher: matchCustom,
            });
            getDistricts();
        } else {
            $("#cost_center_name").show();
            $("#cost_center_drpdwn").hide();
        }
    });

    $(document).on("click", ".edit_cost_center", function () {
        let CostCenterId = $(this).closest("tr").data("CostCenterId");
        let CostCenterName = $(this).closest("tr").data("CostCenterName");
        // getallstoresforcostcenter();
        getcostcenterbyid(CostCenterId);
    });
    $("#save_cost_center").click(function () {
        var costcenterid = $("#cost_center_id").val();
        if (global_ECommerce == "property") {
            if ($("#cost_center_drpdwn").val() == 0) {
                // emalert("Enter Cost Center Name");
                showAlert(
                    $("#add_cost_center_modal .alertarea"),
                    "danger",
                    "Mandatory!",
                    "Select District"
                );
                return false;
            }
        } else {
            if ($("#cost_center_name").val().trim() == "") {
                // emalert("Enter Cost Center Name");
                showAlert(
                    $("#add_cost_center_modal .alertarea"),
                    "danger",
                    "Mandatory!",
                    "Enter Cost Center Name"
                );
                return false;
            }
        }

        var storeid = $("#cbxstores").val();
        if (storeid == 0) {
            if (global_ECommerce == "property") {
                showAlert(
                    $("#add_cost_center_modal .alertarea"),
                    "danger",
                    "Mandatory!",
                    "Select a Notification"
                );
            } else {
                showAlert(
                    $("#add_cost_center_modal .alertarea"),
                    "danger",
                    "Mandatory!",
                    "Select a Store"
                );
            }
            // emalert("Select a Store");
            return false;
        }
        if ((costcenterid = "")) {
            costcenterid = 0;
            if (global_ECommerce == "property") {
                costcentername = $("#cost_center_drpdwn").val();
            } else {
                costcentername = $("#cost_center_name").val();
            }
        } else {
            costcenterid = $("#cost_center_id").val();
            if (global_ECommerce == "property") {
                costcentername = $("#cost_center_drpdwn").val();
            } else {
                costcentername = $("#cost_center_name").val();
            }
        }
        costcenterdesc = $("#cost_center_description").val();
        $.ajax({
            type: "post",
            url: serverpath + "savecostcenter.php",
            data: {
                costcenterid: costcenterid,
                costcentername: costcentername,
                costcenterdesc: costcenterdesc,
                storeid: storeid,
            },
            dataType: "json",
            success: function () {
                if (costcenterid == 0) {
                    showAlert(
                        $("#CostCenters .main_alert"),
                        "success",
                        "Success!",
                        costcentername + " Added"
                    );
                    // emsuccess(costcentername + ' Added');
                } else {
                    showAlert(
                        $("#CostCenters .main_alert"),
                        "success",
                        "Success!",
                        costcentername + " Updated"
                    );
                    // emsuccess(costcentername + ' Updated');
                }
                $("#close_cost_center_modal").click();
            },
            complete: function () {
                get_cost_center();
            },
        });
    });
    $(document).on("click", "a.delete_cost_center", function () {
        let CostCenterId = $(this).closest("tr").data("CostCenterId");
        let CostCenterName = $(this).closest("tr").data("CostCenterName");
        var r = confirm(CostCenterName + " will be deleted?");
        if (r == true) {
            delete_cost_center(CostCenterId); //"You pressed OK!";
        } else {
            return false; //"You pressed Cancel!";
        }
    });
    $(document).on("click", "button.delete_transaction", function () {
        // alert("delete clicked");
        const r = confirm("Confirm you want to delete this transaction!");
        if (!r == true) {
            return false;
        }
        let row_data = $(this).closest("tr").data();
        console.log("row_data=>", row_data);
        const this_row = this;
        // delete_transaction_function(row_data["transactionid"]);
        if (row_data["transactionid"] > 0) {
            $.ajax({
                type: "post",
                url: serverpath + "delete_transaction.php",
                data: { transaction_id: row_data["transactionid"] },
                dataType: "json",
                success: function (data) {
                    if (typeof data != "undefined" && data != null) {
                        if (data.success) {
                            emsuccess("Transaction Deleted");
                            $(this_row).closest("tr").remove();
                        } else {
                            emlert("Deletion failed! Please try again!");
                        }
                    }
                },
                complete: function () {
                    // get_supplier_info();
                },
            });
        } else {
            emalert("Invalid Transaction Id");
        }
    });
    $(document).on("change", "#cbxaccount", function () {
        if (global_school_id != 5029) {
            let cost_center = $("#cbxaccount option:selected").data("cost-center");
            if (typeof cost_center != "undefined") {
                // $("#cbxcostcenter").val(cost_center);
                $("#cbxcostcenter").val(
                    $("#cbxcostcenter option:contains(" + cost_center + ")").val()
                );
                $("#cbxcostcenter").trigger("change.select2"); // Notify only Select2 of changes
            }
            if (global_school_id == 5036) {
                getinvreceipt(cost_center);
            }
        }
    });
    $(document).on("click", ".show_transaction_btn", function () {
        let transactionid = $(this).closest("tr").data("transactionid");
        let transtype = $(this).closest("tr").data("transtype");
        let billNo = $(this).closest("tr").data("billNo");
        if (global_school_id == 5249) {
            window.open(
                "../onlineadmissionform/KHB_Application_Download.html?tranId=" +
                transactionid
            );
        } else {
            if (custombilltempflag) {
                window.open("./templates/customtempbill.html?BillNo=" + billNo);
            } else {
                window.open(
                    "./templates/tempbill.html?BillNo=" +
                    billNo +
                    "&transtype=" +
                    transtype
                );
            }
        }
    });
    $(document).on("click", ".show_allotment_letter_btn", function () {
        let transactionid = $(this).closest("tr").data("transactionid");
        let billNo = $(this).closest("tr").data("billNo");
        if (global_school_id == 5249) {
            window.open(
                "../onlineadmissionform/KHB_AllotmentLetter.html?tranId=" +
                transactionid
            );
        } else {
            emalert("It is not configured for your Institute!");
        }
        // else {
        //     if(custombilltempflag){
        //         window.open("./templates/customtempbill.html?BillNo=" + billNo);
        //     }else{
        //         window.open("./templates/tempbill.html?BillNo=" + billNo);
        //     }
        // }
    });
    $(document).on("click", ".delete_intransit_transaction_btn", function () {
        let applicationNo = $(this).closest("tr").data("applicationNo");
        // let transaction_id = $(this).closest("tr").data("transactionid");
        if (global_school_id == 5249) {
            var r = confirm("Delete " + applicationNo + " transaction?");
            if (r == true) {
                $.ajax({
                    type: "POST",
                    url: serverpath + "deletePropertyTransation.php",
                    dataType: "json",
                    data: {
                        applicationNo: applicationNo,
                        // transaction_id: transaction_id
                    },
                    success: function (data) {
                        if (typeof data != "undefined") {
                            if (data["success"] == 1) {
                                emsuccess(applicationNo + " is successfully deleted!");
                                getalltransactions(1, 0, $("#transactionStatusFilter").val());
                            } else {
                                emalert(data.error_message);
                            }
                        }
                    },
                });
            }
        } else {
            emalert("It is not configured for your Institute!");
        }
    });
    $(document).on("click", ".moveToPendingAllotment", function () {
        let applicationNo = $(this).closest("tr").data("applicationNo");
        // let transaction_id = $(this).closest("tr").data("transactionid");
        if (global_school_id == 5249) {
            var r = confirm("Move " + applicationNo + " to Pending Allotment stage?");
            if (r == true) {
                $.ajax({
                    type: "POST",
                    url: serverpath + "inventory_wrapper.php",
                    data: {
                        req_type: "moveCandidateToPendingAllotment",
                        applicationNo: applicationNo,
                    },
                    dataType: "json",
                    success: function (data) {
                        if (typeof data != "undefined") {
                            if (data["success"] == 1) {
                                emsuccess(
                                    applicationNo + " stage changed to Pending Allotment!"
                                );
                                getalltransactions(1, 0, $("#transactionStatusFilter").val());
                            } else {
                                emalert(data.error_message);
                            }
                        }
                    },
                });
            }
        } else {
            emalert("It is not configured for your Institute!");
        }
    });
    $(document).on("click", ".moveToPendingCreditApproval", function () {
        let applicationNo = $(this).closest("tr").data("applicationNo");
        // let transaction_id = $(this).closest("tr").data("transactionid");
        if (global_school_id == 5249) {
            var r = confirm("Move " + applicationNo + " to Credit Approval stage?");
            if (r == true) {
                $.ajax({
                    type: "POST",
                    url: serverpath + "inventory_wrapper.php",
                    data: {
                        req_type: "moveToPendingCreditApproval",
                        applicationNo: applicationNo,
                    },
                    dataType: "json",
                    success: function (data) {
                        if (typeof data != "undefined") {
                            if (data["success"] == 1) {
                                emsuccess(applicationNo + " stage changed to Credit Approval!");
                                getalltransactions(1, 0, $("#transactionStatusFilter").val());
                            } else {
                                emalert(data.error_message);
                            }
                        }
                    },
                });
            }
        } else {
            emalert("It is not configured for your Institute!");
        }
    });
    $(document).on("click", ".moveToRefundCreditVerification", function () {
        let applicationNo = $(this).closest("tr").data("applicationNo");
        // let transaction_id = $(this).closest("tr").data("transactionid");
        if (global_school_id == 5249) {
            var r = confirm(
                "Move " + applicationNo + " to Refund Credit Verification stage?"
            );
            if (r == true) {
                $.ajax({
                    type: "POST",
                    url: serverpath + "inventory_wrapper.php",
                    data: {
                        req_type: "moveToRefundCreditVerification",
                        applicationNo: applicationNo,
                    },
                    dataType: "json",
                    success: function (data) {
                        if (typeof data != "undefined") {
                            if (data["success"] == 1) {
                                emsuccess(
                                    applicationNo +
                                    " stage changed to Refund Credit Verification!"
                                );
                                getalltransactions(1, 0, $("#transactionStatusFilter").val());
                            } else {
                                emalert(data.error_message);
                            }
                        }
                    },
                });
            }
        } else {
            emalert("It is not configured for your Institute!");
        }
    });
    $(document).on("click", ".moveToCancellationRefundApproval", function () {
        let applicationNo = $(this).closest("tr").data("applicationNo");
        // let transaction_id = $(this).closest("tr").data("transactionid");
        if (global_school_id == 5249) {
            var r = confirm(
                "Move " + applicationNo + " to Cancellation Refund Approval stage?"
            );
            if (r == true) {
                $.ajax({
                    type: "POST",
                    url: serverpath + "inventory_wrapper.php",
                    data: {
                        req_type: "moveToCancellationRefundApproval",
                        applicationNo: applicationNo,
                    },
                    dataType: "json",
                    success: function (data) {
                        if (typeof data != "undefined") {
                            if (data["success"] == 1) {
                                emsuccess(
                                    applicationNo +
                                    " stage changed to Cancellation Refund Approval"
                                );
                                getalltransactions(1, 0, $("#transactionStatusFilter").val());
                            } else {
                                emalert(data.error_message);
                            }
                        }
                    },
                });
            }
        } else {
            emalert("It is not configured for your Institute!");
        }
    });
    $(document).on("click", ".completePropertyRefund", function () {
        let applicationNo = $(this).closest("tr").data("applicationNo");
        let utrNo = $(this)
            .closest("td")
            .find("input.cancellationRefundApprovalUTRNo")
            .val();
        let cancellationRefundApprovalDate = $(this)
            .closest("td")
            .find("input.cancellationRefundApprovalDate")
            .val();
        if (utrNo.trim() == "") {
            emalert("Enter UTR No.!");
            return false;
        }
        if (cancellationRefundApprovalDate == "") {
            emalert("Enter Date!");
            return false;
        }
        // let transaction_id = $(this).closest("tr").data("transactionid");
        if (global_school_id == 5249) {
            var r = confirm("Complete Refund for " + applicationNo + " ?");
            if (r == true) {
                $.ajax({
                    type: "POST",
                    url: serverpath + "inventory_wrapper.php",
                    data: {
                        req_type: "completePropertyRefund",
                        applicationNo: applicationNo,
                        utrNo: utrNo,
                        cancellationRefundApprovalDate: cancellationRefundApprovalDate,
                    },
                    dataType: "json",
                    success: function (data) {
                        if (typeof data != "undefined") {
                            if (data["success"] == 1) {
                                emsuccess(applicationNo + " Propery Refund Completed!");
                                getalltransactions(1, 0, $("#transactionStatusFilter").val());
                            } else {
                                emalert(data.error_message);
                            }
                        }
                    },
                });
            }
        } else {
            emalert("It is not configured for your Institute!");
        }
    });

    $(document).on("click", ".verifyInstalmentPayment", function () {
        let applicationNo = $(this).closest("tr").data("applicationNo");
        let paymentId = $(this).closest("tr").data("paymentId");
        let PayUTxnId = $(this).closest("tr").data("PayUTxnId");
        let PayUAmount = $(this).closest("tr").data("PayUAmount");
        let ProductId = $(this).closest("tr").data("ProductId");
        // let transaction_id = $(this).closest("tr").data("transactionid");
        if (paymentId == "--") {
            emalert("Invalid payment Id!");
            return false;
        }
        if (PayUTxnId == "") {
            emalert("Invalid payment transaction Id!");
            return false;
        }
        if (PayUAmount == "" || PayUAmount < 1) {
            emalert("Invalid payment amount!");
            return false;
        }
        if (ProductId == 0) {
            emalert("Invalid property!");
            return false;
        }
        $.ajax({
            type: "POST",
            url: serverpath + "inventory_wrapper.php",
            data: {
                req_type: "verifyInstalmentPayment",
                applicationNo: applicationNo,
                paymentId: paymentId,
                PayUTxnId: PayUTxnId,
                PayUAmount: PayUAmount,
                ProductId: ProductId,
            },
            dataType: "json",
            success: function (data) {
                if (typeof data != "undefined") {
                    if (data["success"] == 1) {
                        emsuccess(
                            applicationNo +
                            " payment verified for payment id(" +
                            paymentId +
                            ")"
                        );
                        getalltransactions(1, 0, $("#transactionStatusFilter").val());
                    } else {
                        emalert(data.error_message);
                    }
                }
            },
        });
    });
    $(document).on("click", ".moveToSaleDeedGenerated", function () {
        let applicationNo = $(this).closest("tr").data("applicationNo");
        let saleDeedNo = $(this)
            .closest("td.saleDeedInfo")
            .find(".saleDeedNo")
            .val();
        let saleDeedDate = $(this)
            .closest("td.saleDeedInfo")
            .find(".saleDeedDate")
            .val();
        let saleDeedFile = $(this)
            .closest("td.saleDeedInfo")
            .find(".saleDeedFile")
            .prop("files")[0];

        // let transaction_id = $(this).closest("tr").data("transactionid");
        if (saleDeedNo.trim() == "") {
            emalert("Enter Sale Deed No.!");
            return false;
        }
        if (saleDeedDate == "") {
            emalert("Enter Sale Deed Date!");
            return false;
        }
        var form_data = new FormData();
        form_data.append("Files", saleDeedFile);
        form_data.append("req_type", "moveToSaleDeedGenerated");
        form_data.append("applicationNo", applicationNo);
        form_data.append("saleDeedDate", saleDeedDate);
        form_data.append("saleDeedNo", saleDeedNo);
        $.ajax({
            type: "POST",
            url: serverpath + "inventory_wrapper.php",
            data: form_data,
            dataType: "json",
            processData: false,
            contentType: false,
            success: function (data) {
                if (typeof data != "undefined") {
                    if (data["success"] == 1) {
                        emsuccess(
                            applicationNo +
                            " Sale Deed Info successfully saved and this candidate moved to Sale Deed Generated stage!"
                        );
                        getalltransactions(1, 0, $("#transactionStatusFilter").val());
                    } else {
                        emalert(data.error_message);
                    }
                }
            },
        });
    });

    $(document).on("click", "button.search_indent_filter", function () {
        $(".indent_filters_div").removeClass("hidden");
    });

    $(document).on("change", "#indent_list_add_filter", function () {
        if ($(".indent_selected_filters>div").length == 0) {
            $(".indent_selected_filters").empty();
        }
        var selected_val = $(this).val();
        if (selected_val != 0) {
            var arr_index = $("#indent_list_add_filter option:selected").attr(
                "arr_index"
            );
            var selected_option_text = $(
                "#indent_list_add_filter option:selected"
            ).text();
            var type = indent_list_filter_data[arr_index].filter_type;
            var id_attr = indent_list_filter_data[arr_index].filter_coloumname;
            if (type == "text") {
                $(".indent_selected_filters").append(
                    "<div class='indent_list_filter_div'><div>" +
                    selected_option_text +
                    "</div><div><input type='text' id=" +
                    id_attr +
                    "  class='form-control indent_filter_ele' filter_type='" +
                    type +
                    "'></input></div><div class='del_indentlist_filter'><i class='fas fa-times-circle'></i></div></div>"
                );
            } else if (type == "date") {
                $(".indent_selected_filters").append(
                    "<div class='indent_list_filter_div'><div>" +
                    selected_option_text +
                    "</div><div><div class='indent_list_filter_div_date'><label>From date</label><input type='date' filter_type='" +
                    type +
                    "' coloumid='" +
                    id_attr +
                    "' filter_date_id='fromdate' id='indent_list_search_fromdate' class='form-control indent_filter_ele'></div><div><label>To date</label><input type='date' filter_type='" +
                    type +
                    "' id='indent_list_search_todate' class='form-control indent_filter_ele' filter_date_id='todate' coloumid='" +
                    id_attr +
                    "' ></div></div><div class='del_indentlist_filter'><i class='fas fa-times-circle'></i></div></div>"
                );
            } else if (type == "select") {
                var select_data = indent_list_filter_data[arr_index].filter_data;
                //console.log(select_data);
                var option_text = "";
                if (select_data != "") {
                    if (select_data.length > 0) {
                        select_data.map((item, index) => {
                            option_text =
                                option_text +
                                "<option value='" +
                                item.option_val +
                                "'>" +
                                item.option_label +
                                "</option>";
                        });
                    }
                }
                $(".indent_selected_filters").append(
                    "<div class='indent_list_filter_div'><div>" +
                    selected_option_text +
                    "</div><div><select filter_type='" +
                    type +
                    "' class='form-control indent_filter_ele' id=" +
                    id_attr +
                    ">" +
                    option_text +
                    "</select></div><div class='del_indentlist_filter'><i class='fas fa-times-circle'></i></div></div>"
                );
            }
            // if(selected_val == 2){
            //     $(".indent_selected_filters").append("<div class='indent_list_filter_div'><div>"+selected_option_text+"</div><div><div class='indent_list_filter_div_date'><label>From date</label><input type='date' id='indent_list_search_fromdate' class='form-control'></div><div><label>To date</label><input type='date' id='indent_list_search_todate' class='form-control'></div></div><div class='del_indentlist_filter'><i class='fas fa-times-circle'></i></div></div>");
            // }else{
            //     $(".indent_selected_filters").append("<div class='indent_list_filter_div'><div>"+selected_option_text+"</div><div><input type='text' class='form-control'></input></div><div class='del_indentlist_filter'><i class='fas fa-times-circle'></i></div></div>");
            // }
        }
    });

    $(document).on("click", ".del_indentlist_filter", function () {
        $(this).closest(".indent_list_filter_div").remove();
        if ($(".indent_selected_filters>div").length == 0) {
            $(".indent_selected_filters").append("No Filters Selected");
        }
    });

    $(document).on("click", ".get_indent_search_res", function () {
        var search_filterlen = $(".indent_selected_filters > div").length;
        if (search_filterlen == 0) {
            getallindentlist(Global_Level);
            $(".indent_filters_div").addClass("hidden");
            return false;
        }
        get_indent_search_res();
        $("#indent_list_add_filter").val(0);
    });
    $(document).on("change", "#transactionStatusFilter", function () {
        let selectedTransactionStatus = $(this).val();
        getalltransactions(1, 0, selectedTransactionStatus);
    });
    $("#searchTransactionStatusByApplicationNoBtn").click(function () {
        let applicationNo = $("#searchTransactionStatusByApplicationNo").val();
        if (applicationNo.trim() != "") {
            getApplicantsCurrentStage(applicationNo);
        } else {
            emalert("Enter Application No.");
        }
    });

    $(document).on(
        "click",
        "input[type=radio][name=typeoftransaction]",
        function () {
            var check_val = $(this).attr("value2");
            if (check_val != 1) {
                $(".ibrn_cls").addClass("hidden");
                $("button#btnaddindtranrow").removeClass("hidden");
            } else {
                $(".ibrn_cls").removeClass("hidden");
                $("button#btnaddindtranrow").addClass("hidden");
            }
        }
    );

    $(document).on("click", ".get_rec_details_btn", function () {
        get_recpt_details();
    });
    // Collection Report Start
    $("#navCollectionReport").click(function () {
        $("#collection_report_classess").select2({
            matcher: matchCustom,
        });

        getClasses("#collection_report_classess");
    });



    $("#collection_report_get_report").click(function () {
        let classId = $("#collection_report_classess").val();
        let fromDate = $("#collection_report_from_date").val();
        let toDate = $("#collection_report_to_date").val();
        if (classId == 0) {
            emalert("Select a class");
            return false;
        }
        getCollectionReport(classId, fromDate, toDate);
    });
    $("#collection_report_export_report").click(function () {
        let classId = $("#collection_report_classess").val();
        let fromDate = $("#collection_report_from_date").val();
        let toDate = $("#collection_report_to_date").val();
        if (classId == 0) {
            emalert("Select a class");
            return false;
        }
        exportCollectionReport(classId, fromDate, toDate);
    });
    $(document).on("click", ".student_wise_collection_report", function () {
        let studentEMUniqueId = $(this).attr("data-student-id");
        if (studentEMUniqueId) {
            getCollectionReportStudentWise(studentEMUniqueId);
        }
    });
    // Collection Report Ends

});

function getCollectionReportStudentWise(studentEMUniqueId) {
    try {
        $.ajax({
            type: "POST",
            url: "server/inventory_wrapper.php",
            data: {
                req_type: "getCollectionReportStudentWise",
                studentEMUniqueId,
            },
            dataType: "json",
            success: function (res) {
                if (typeof res != "undefined" && res != null) {
                    if (res["success"] != true) {
                        emalert(res["error_message"]);
                    }
                    $("#collection_report_student_wise_table").empty();
                    let data = res["data"];
                    if (data.length == 0) {
                        $("<tr><td colspan='7'>No recors found!</td></tr>").appendTo(
                            "#collection_report_student_wise_table"
                        );
                        return false;
                    }
                    let tableRows = "",
                        slNo = 1;
                    $("#collection_report_student_wise_modal .modal-title").text(
                        data[0]["StudentName"]
                    );
                    for (let i in data) {
                        tableRows += `
                            <tr>
                                <td>${slNo++}</td>
                                <td>${data[i]["ReceiptDate"]}</td>
                                <td>${data[i]["ProductName"]}</td>
                                <td>${data[i]["quantity"]}</td>
                                <td>${convertNumberToINR(data[i]["Rate"])}</td>
                                <td>${convertNumberToINR(
                            data[i]["Amount"]
                        )}</td>
                            </tr>
                        `;
                    }
                    $(tableRows).appendTo("#collection_report_student_wise_table");
                }
            },
        });
    } catch (err) {
        emalert(err.message);
    }
}

function getCollectionReport(classId, fromDate, toDate) {
    try {
        $.ajax({
            type: "POST",
            url: "server/inventory_wrapper.php",
            data: {
                req_type: "getCollectionReport",
                classId,
                fromDate,
                toDate,
            },
            dataType: "json",
            success: function (res) {
                if (typeof res != "undefined" && res != null) {
                    if (res["success"] != true) {
                        emalert(res["error_message"]);
                    }
                    $("#collection_report_table").empty();
                    let data = res["data"];
                    if (data.length == 0) {
                        $("<tr><td colspan='8'>No recors found!</td></tr>").appendTo(
                            "#collection_report_table"
                        );
                        return false;
                    }
                    let tableRows = "",
                        slNo = 1;
                    for (let i in data) {
                        tableRows += `
                            <tr>
                                <td>${slNo++}</td>
                                <td>${data[i]["ReceiptDate"]}</td>
                                <td class='text-primary cursor_pointer student_wise_collection_report' data-toggle="modal"
                                    data-target="#collection_report_student_wise_modal"
                                    data-student-id="${data[i]["EMUniqueId"]}"
                                ><u>${data[i]["StudentName"]}</u></td>
                                <td>${data[i]["Class"]}</td>
                                <td>${data[i]["ProductName"]}</td>
                                <td>${data[i]["quantity"]}</td>
                                <td>${convertNumberToINR(data[i]["Rate"])}</td>
                                <td>${convertNumberToINR(
                            data[i]["Amount"]
                        )}</td>
                            </tr>
                        `;
                    }
                    $(tableRows).appendTo("#collection_report_table");
                }
            },
        });
    } catch (err) {
        emalert(err.message);
    }
}

function exportCollectionReport(classId, fromDate, toDate) {
    try {
        $.ajax({
            type: "POST",
            url: "server/inventory_wrapper.php",
            data: {
                req_type: "exportCollectionReport",
                classId,
                fromDate,
                toDate,
            },
            dataType: "json",
            success: function (res) {
                if (typeof res != "undefined" && res != null) {
                    if (res["success"] != true) {
                        emalert(res["error_message"]);
                        return false;
                    }
                    let fileName = res["fileName"];
                    window.location.href = serverpath + "/download.php?f=" + fileName;
                }
            },
        });
    } catch (err) {
        emalert(err.message);
    }
}

function getClasses(elementId) {
    try {
        $.ajax({
            type: "POST",
            url: "server/inventory_wrapper.php",
            data: { req_type: "getClasses" },
            dataType: "json",
            success: function (res) {
                if (typeof res != "undefined" && res != null) {
                    if (res["success"] != true) {
                        emalert(res["error_message"]);
                    }
                    $(elementId).empty();
                    let data = res["data"];
                    let optionStr = `<option value="-1">All Classes</option>`;
                    for (let i in data) {
                        optionStr += `<option value="${data[i]["StandardSectionId"]}"> ${data[i]["ClassName"]}</option>`;
                    }
                    $(optionStr).appendTo(elementId);
                    if (res["dates"]) {
                        $("#collection_report_from_date").val(res["dates"]["fromDate"]);
                        $("#collection_report_to_date").val(res["dates"]["toDate"]);
                    }
                }
            },
        });
    } catch (err) {
        emalert(err.message);
    }
}

function get_recpt_details() {
    var entered_rec_no = $("#invno").val();
    if (
        entered_rec_no == "" ||
        entered_rec_no <= 0 ||
        parseInt(entered_rec_no) == 0
    ) {
        emalert("Kindly enter receipt no!!");
        return false;
    }
    var issue_completed_for_invoice = 0;
    $.ajax({
        type: "POST",
        url: serverpath + "getproductdetails_by_receiptno.php",
        data: { entered_rec_no: entered_rec_no },
        dataType: "json",
        success: function (res) {
            if (typeof res != "undefined" && res != null) {
                if (res["error_code"] == 1) {
                    issue_completed_for_invoice = res["issue_completed_for_invoice"];
                    if (res["invoice_data"] != "") {
                        if (res["EMUniqueId"] > 0 && res["costcenterid"] > 0) {
                            $("#cbxaccount").val(res["EMUniqueId"]).trigger("change.select2");
                            $("#cbxcostcenter")
                                .val(res["costcenterid"])
                                .trigger("change.select2");
                        }
                        var data = res["invoice_data"];
                        $("#invtranbody").empty();
                        addaTranrow();
                        for (i in data) {
                            let row = $("#invtranbody>tr:last-child");
                            let productid = data[i].productid;
                            row.find(".cbxinvproduct").val(data[i].productid);
                            row.find(".cbxinvproduct").trigger("change.select2");
                            let UOM = global_products[productid].UOM;
                            let Rate = data[i].cost;
                            let Qty = data[i].quantity;
                            let Tax = data[i].tax;
                            var taxper = Tax / 100;
                            var taxamt = Rate * taxper;
                            var MRP = Rate + taxamt;
                            let currentstock = getstockbyinvproductid(productid, row);
                            row.find(".invUOM").text(UOM);
                            row.find(".invPrice").val(Rate);
                            row.find(".invPrice").data("MRP", MRP);
                            row.find(".txtinvqty").val(Qty);
                            if (i < data.length - 1) {
                                addaTranrow();
                            }
                        }
                        //disbale price and quantity edition
                        $("#invtranbody").find(".invPrice").attr("disabled", "disabled");
                        $("#invtranbody").find(".txtinvqty").attr("disabled", "disabled");
                        $(".cbxinvproduct").attr("disabled", "disabled");
                        $("button#btnaddindtranrow").addClass("hidden");
                        calculatetranamount();
                    } else {
                        if (issue_completed_for_invoice == 1) {
                            emalert("All the Products for this receipt No. are issued!!");
                        } else {
                            emalert("No Data found for receipt no entered!!");
                        }
                    }
                } else {
                    emalert(res["error_desc"]);
                }
            }
        },
        error: function (err) {
            emalert(err);
        },
    });
}

function getApplicantsCurrentStage(applicationNo) {
    $("#applicantsCurrentStageInfo").empty();
    try {
        $.ajax({
            type: "POST",
            url: serverpath + "inventory_wrapper.php",
            data: {
                req_type: "getApplicantsCurrentStage",
                applicationNo: applicationNo,
            },
            dataType: "json",
            success: function (res) {
                if (typeof res != "undefined" && res != null) {
                    if (res["success"] == 1) {
                        $("#applicantsCurrentStageInfo").html(`
                        <b>Name:</b> &nbsp; ${res.applicantName}<br/>
                        <b>Property:</b> &nbsp; ${res.propertyName}<br/>
                        <b>Current Stage:</b> &nbsp; ${res.currentStage}<br/>
                        `);
                    } else {
                        emalert(res["error_message"]);
                    }
                }
            },
            error: function (err) {
                emalert(err);
            },
        });
    } catch (err) {
        emalert(err);
    }
}

function getTransactionsStages(selectBoxId) {
    $.ajax({
        type: "POST",
        url: serverpath + "inventory_wrapper.php",
        data: { req_type: "getTransactionsStages" },
        dataType: "json",
        success: function (res) {
            if (typeof res != "undefined" && res != null) {
                $(selectBoxId).empty();
                for (let i in res["data"]) {
                    $(
                        `<option value='${res["data"][i]["CandidateStagesID"]}'>${res["data"][i]["StageName"]}</option>`
                    ).appendTo(selectBoxId);
                }
                if (res["data"].length > 0) {
                    getalltransactions(1, 0, res["data"][0]["CandidateStagesID"]);
                }
            }
        },
    });
}
async function get_indent_search_res(from = 0) {
    var filter_data = [];
    let option = {
        method: "POST",
        header: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        credentials: "same-origin",
    };
    $(".indent_filter_ele").each(function () {
        var temp_filter_data = {};
        temp_filter_data.coloumid = $(this).attr("id");
        temp_filter_data.value = $(this).val();
        temp_filter_data.filtertype = $(this).attr("filter_type");
        temp_filter_data.internal_coloumid = $(this).attr("coloumid");
        temp_filter_data.filter_date_id = $(this).attr("filter_date_id");
        filter_data.push(temp_filter_data);
    });
    let formdata = new FormData();
    formdata.append("indent_filter_data", JSON.stringify({ filter_data }));
    formdata.append("req_type", "indent_filter");
    formdata.append("from", from);
    formdata.append("level", Global_Level);
    option.body = formdata;
    let response = await fetch(serverpath + "inventory_wrapper.php", option);
    let response_json = await response.json();
    show_all_indent_list(response_json);
}

function getconfigjson() {
    $.ajax({
        type: "POST",
        url: serverpath + "getinvconfig.php",
        dataType: "json",
        success: function (data) {
            console.log("config", data);
            if (typeof data != "undefined") {
                let config = data.config;
                let userdetails = data.userdetails;
                global_showbranches = config.showBranches;
                global_ECommerce = config.ECommerce;
                print_disable = config.hasOwnProperty("print_disable") ?
                    config.print_disable :
                    0;
                global_allow_zero_stock_add_indent =
                    typeof config.allow_zero_stock_add_indent != undefined ?
                        config.allow_zero_stock_add_indent :
                        0;

                custombilltempflag = config.enablecustombilltemplate;
                console.log(global_ECommerce);
                if (global_showbranches == 1) {
                    // $(".hidebranches").removeClass();
                    getallbranches();
                }
                global_profileid = userdetails.profileid;
                Global_Is_Storekeeper = userdetails.Is_Storekeeper;
                Global_show_indent_list = userdetails.show_indent_list;
                Global_Level = userdetails.Level;
                if (Global_Is_Storekeeper == 1) {
                    $(".nav-item").removeClass("hidden");
                } else if (Global_show_indent_list == 1) {
                    $("#navIndentlist").removeClass("hidden");
                }
                global_loggedinuserid = userdetails.loggedinuser;
                global_storeid = userdetails.storeid;
                global_storetypevalue = userdetails.storetypevalue;
                if (global_ECommerce == "property") {
                    changeToECommerceProperties();
                    $("#transactionStatusFilter")
                        .closest("div.tranbuttons")
                        .removeClass("hidden");
                    getTransactionsStages("#transactionStatusFilter");
                    $("#searchApplicantsCurrentStage").removeClass("hidden");
                } else {
                    $("#transactionStatusFilter")
                        .closest("div.tranbuttons")
                        .addClass("hidden");
                    $("#searchApplicantsCurrentStage").addClass("hidden");
                }
                if (config.hasOwnProperty("is_hide_delete_transaction_button")) {
                    globalIsHideDeleteButtonInTransaction =
                        config.is_hide_delete_transaction_button;
                }
                if (config.hasOwnProperty("ShowStudentPageInTransaction")) {
                    Global_ShowStudentPageInTransaction =
                        config.ShowStudentPageInTransaction;
                }
            }
        },
    });
}

function getallbranches() {
    $.ajax({
        type: "POST",
        url: serverpath + "getallbranches.php",
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined") {
                let sel = $("#cbxstorebranch");
                sel.empty();
                $("<option value=-1>Select a Branch</option>").appendTo(sel);
                for (i in data) {
                    $(
                        "<option value=" +
                        data[i].InstitutionBranchID +
                        ">" +
                        data[i].BranchName +
                        "</option>"
                    ).appendTo(sel);
                }
            }
        },
    });
}

function downloadFormat() {
    console.log(global_ECommerce);
    $.ajax({
        type: "POST",
        url: serverpath + "downloadFormat.php",
        data: { invflag: global_ECommerce },
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined") {
                var filename = data.filename;
                window.location.href = serverpath + "/download.php?f=" + filename;
            }
        },
    });
}

function uploadProductData() {
    var file_data = $("#upload_product_file").prop("files")[0];
    if ($("#upload_product_file").prop("files")[0]) {
        if (
            $("#upload_product_file").prop("files")[0]["name"].split(".")[1] == "csv"
        ) {
            var form_data = new FormData();
            form_data.append("Files", file_data);
            $.ajax({
                type: "post",
                url: serverpath + "uploadProductData.php",
                data: form_data,
                dataType: "json",
                processData: false,
                contentType: false,
                success: function (data) {
                    // console.log(data);
                    if (typeof data != "undefined") {
                        if (data.Status == 1) {
                            $("#upload_product_file").val("");
                            $(".hidden_div").hide();
                            get_product_info();
                            emsuccess("Data uploaded successfully!");
                        } else {
                            emalert(
                                "Something went wrong. Please fix the issues listed and try again!"
                            );
                            $(".hidden_div").show();
                            $("#err_product_thead,#err_product_tbody").empty();
                            let table_thead = $("#err_product_thead");
                            let table_tbody = $("#err_product_tbody");
                            let tblData = data["Tbl_Data"];
                            let tblheader = data["Tbl_Data"][1]["Product_Data"];
                            let tblkeys = data["Tbl_Data"][0]["Product_Data"];
                            let table_thead_row = $("<tr></tr>").appendTo(table_thead);
                            let header_str = "";
                            for (let i in tblheader) {
                                header_str += "<td>" + tblheader[i] + "</td>";
                            }
                            $(header_str).appendTo(table_thead_row);
                            //populate tbody
                            $.each(tblData, function (key, val) {
                                let tbody_str = "";
                                if (key > 1) {
                                    let table_tbody_row = $("<tr></tr>").appendTo(table_tbody);
                                    let productData = val.Product_Data;
                                    for (i in productData) {
                                        let Index_Label = tblkeys[i];
                                        let Class_Val = "";
                                        let Class_Type = "";
                                        let Data_Label = val[Index_Label];
                                        if (typeof Data_Label != "undefined") {
                                            if (
                                                Data_Label.hasOwnProperty("Invalid_Name") ||
                                                Data_Label.hasOwnProperty("Invalid_Type") ||
                                                Data_Label.hasOwnProperty("Invalid_Format") ||
                                                Data_Label.hasOwnProperty("Duplicate_Entry")
                                            ) {
                                                Class_Val = Object.keys(Data_Label)[0];
                                                Class_Type = "badge badge-pill badge-danger";
                                            }
                                        }
                                        if (Class_Val != "") {
                                            tbody_str +=
                                                "<td scope='col'><span class='" +
                                                Class_Type +
                                                "'>" +
                                                Class_Val +
                                                "</span><br>" +
                                                productData[i] +
                                                "</td>";
                                        } else {
                                            tbody_str +=
                                                "<td scope='col'>" + productData[i] + "</td>";
                                        }
                                    }
                                    $(tbody_str).appendTo(table_tbody_row);
                                }
                            });
                        }
                    }
                },
                complete: function () { },
            });
        } else {
            emalert("Not a csv file!");
            return false;
        }
    } else {
        emalert("Select a file!");
    }
}

function getinvreceipt(cost_center) {
    $.ajax({
        type: "POST",
        url: serverpath + "getinvreceipt.php",
        data: { costcenterid: cost_center },
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined") {
                $("#invtranbody").empty();
                addaTranrow();
                for (i in data) {
                    let row = $("#invtranbody>tr:last-child");
                    let productid = data[i].productid;
                    row.find(".cbxinvproduct").val(data[i].productid);
                    row.find(".cbxinvproduct").trigger("change.select2");
                    let UOM = global_products[productid].UOM;
                    let Rate = data[i].cost;
                    let Qty = data[i].quantity;
                    let currentstock = getstockbyinvproductid(productid, row);
                    row.find(".invUOM").text(UOM);
                    row.find(".invPrice").val(Rate);
                    row.find(".txtinvqty").val(Qty);
                    if (i < data.length - 1) {
                        addaTranrow();
                    }
                }
                calculatetranamount();
            }
        },
    });
}

function delete_supplier(customerid) {
    $.ajax({
        type: "post",
        url: serverpath + "deleteaccount.php",
        data: { customerid: customerid },
        dataType: "json",
        success: function (data) {
            emsuccess("Account Deleted");
        },
        complete: function () {
            get_supplier_info();
        },
    });
}

function delete_cost_center(costcenterid) {
    $.ajax({
        type: "post",
        url: serverpath + "deletecostcenter.php",
        data: { costcenterid: costcenterid },
        dataType: "json",
        success: function (data) {
            emalert("Cost Center Deleted");
        },
        complete: function () {
            get_cost_center();
        },
    });
}
//CostCenter by costcenterid
function getcostcenterbyid(costcenterid) {
    $.ajax({
        type: "post",
        url: serverpath + "getcostcenterbyid.php",
        data: { costcenterid: costcenterid },
        dataType: "json",
        success: function (data) {
            $("#cbxstores").val(data[0].storeid).trigger("change.select2");
            $("#cost_center_id").val(data[0].CostCenterId);
            $("#cost_center_name").val(data[0].CostCenterName);
            $("#cost_center_description").val(data[0].CostCenterDesc);
        },
        complete: function () {
            scrolltoTop();
        },
    });
}
//Account by customerid
function getaccountbyid(customerid, typeid) {
    $.ajax({
        type: "post",
        url: serverpath + "getaccountbyid.php",
        data: { customerid: customerid },
        dataType: "json",
        success: function (data) {
            if (typeid == 0) {
                $("#supp_type_1").attr("checked", true);
            } else if (typeid == 3) {
                $("#supp_type_3").attr("checked", true);
            } else {
                $("#supp_type_2").attr("checked", true);
            }
            $("#input_supplier_id").val(data[0].CustomerId);
            $("#supp_name").val(data[0].CustomerName);
            $("#supp_address").val(data[0].Address);
            $("#supp_phone").val(data[0].Phone1);
            scrolltoTop();
        },
    });
}

function delete_product_fn(product_id) {
    $.ajax({
        type: "post",
        url: serverpath + "deleteproduct.php",
        data: { productid: product_id },
        dataType: "json",
        success: function (data) {
            emsuccess("Product Deleted");
        },
        complete: function () {
            get_product_info();
            scrolltoTop();
        },
    });
}

function getproducttypes() {
    let selproducttypes = $("#product_type_select");
    selproducttypes.empty();
    if (global_ECommerce == "property") {
        $(
            "<option selected='selected' value='0'>Select Property Type</option>"
        ).appendTo(selproducttypes);
    } else {
        $(
            "<option selected='selected' value='0'>Select Product Type</option>"
        ).appendTo(selproducttypes);
    }
    $.ajax({
        type: "post",
        url: serverpath + "getproducttypes.php",
        dataType: "json",
        success: function (data) {
            for (i in data) {
                $(
                    "<option value='" +
                    data[i].producttypeid +
                    "'>" +
                    data[i].producttypename +
                    "</option>"
                ).appendTo(selproducttypes);
            }
        },
        complete: function (data) {
            //selproducttypes.selectmenu();
            //selproducttypes.selectmenu("refresh");
        },
    });
}

function get_product_details(product_id) {
    $.ajax({
        type: "post",
        url: serverpath + "getproductbyid.php",
        data: { productid: product_id },
        dataType: "json",
        success: function (data) {
            console.log(data);
            $("input#product_id").val(data[0].ProductId);
            $("#product_name").val(data[0].ProductName);
            $("#product_description").val(data[0].ProductDesc);
            $("#product_unit_measurement").val(data[0].UOM);
            $("#product_asset_no").val(data[0].assetno);
            $("#product_unit_cost").val(data[0].Rate);
            $("#product_tax").val(data[0].Tax);
            $("#is_quantity_selectable").val(data[0].is_quantity_selectable);
            $("#max_quantity_selectable").val(data[0].max_quantity_selectable);
            $("#min_quantity_selectable").val(data[0].min_quantity_selectable);
            // $("#txtplace").val(data[0].place);
            producttypeid = data[0].producttypeid;
            //$('#cbxproducttype option[value="'+producttypeid+'"]').prop("selected",true);
            $("#product_type_select").val(producttypeid).trigger("change.select2");
            //$('#cbxproducttype').selectmenu();
            //$('#cbxproducttype').selectmenu("refresh");
            $("#product_opening_stock").val(data[0].OpeningStock);

            $("#selProject").val(data[0].ProjectId).trigger("change.select2");
            $("#registration_fee").val(data[0].Registration_Fee);
            $("#ID_Amount").val(data[0].ID_Amount);

            $("#specificationOrMeasurement").val(data[0].specificationOrMeasurement);
            $("#Model").val(data[0].Model);
            $("#roomNumber").val(data[0].roomNumber);
            $("#blockName").val(data[0].blockName);
            $("#vendorOrSupplier").val(data[0].vendorOrSupplier);
            $("#dateOfPurchase").val(data[0].dateOfPurchase);

            $("#MinimumQty").val(data[0].MinimumQty);
            $("#ManufacturerName").val(data[0].ManufacturerName);
            $("#ManufacturingDate").val(data[0].ManufacturingDate);
            $("#ExpiryDate").val(data[0].ExpiryDate);
        },
    });
}

function delete_product_type(product_type_id) {
    $.ajax({
        type: "POST",
        url: serverpath + "inventory_wrapper.php",
        dataType: "json",
        data: { req_type: "delete_product_type", product_type_id: product_type_id },
        success: function (data) {
            if (typeof data != "undefined" && data != null) {
                if (data.success == true) {
                    emsuccess("Successfully deleted!");
                    get_product_type_info();
                } else {
                    emalert("Network error. Please try again!");
                }
            }
        },
    });
}

function save_product_type(
    product_type_id,
    product_type_name,
    product_type_description
) {
    $.ajax({
        type: "POST",
        url: serverpath + "inventory_wrapper.php",
        dataType: "json",
        data: {
            req_type: "save_product_type",
            product_type_id: product_type_id,
            product_type_name: product_type_name,
            product_type_description: product_type_description,
        },
        success: function (data) {
            if (typeof data != "undefined" && data != null) {
                if (data.success == true) {
                    emsuccess(product_type_name + " saved");
                    showAlert(
                        $("#ProductsTypes .main_alert"),
                        "success",
                        "Success!",
                        product_type_name + " saved"
                    );
                    $("#close_product_type_modal").click();
                    get_product_type_info();
                } else {
                    showAlert(
                        $("#add_product_type_modal .alertarea"),
                        "danger",
                        "Network error!",
                        "Please try again!"
                    );
                    // emalert("Network error. Please try again!");
                }
            }
        },
    });
}
//Cost Center List Population
function get_cost_center() {
    $.ajax({
        type: "post",
        url: serverpath + "getcostcenters.php",
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined" && data != null) {
                let slno = 1;
                $("#cost_center_table").empty();
                for (let i in data) {
                    let table_row = $(
                        "<tr><td>" +
                        slno++ +
                        "</td><td>" +
                        data[i].CostCenterName +
                        "</td><td>" +
                        data[i].storename +
                        "</td><td class='actions'><a  data-toggle='modal' data-target='#add_cost_center_modal' title='Edit' class='edit btn subtle icon edit_cost_center'><i class='far fa-edit'></i> <span></span></a></td><td class='actions'><a title='Delete' class='delete btn subtle icon delete_cost_center' href='#'><i class='fas fa-trash-alt'></i> <span></span></a></td></tr>"
                    ).appendTo("#cost_center_table");
                    table_row.data({
                        CostCenterId: data[i].CostCenterId,
                        CostCenterName: data[i].CostCenterName,
                    });
                }
            }
        },
    });
}

function getallstoresforcostcenter() {
    $.ajax({
        type: "POST",
        url: serverpath + "getallstores.php",
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined") {
                var selstore = $("#cbxstores");
                selstore.empty();
                if (global_ECommerce == "property") {
                    $("<option value='0'>Select a Notification</option>").appendTo(
                        selstore
                    );
                } else {
                    $("<option value='0'>Select a Store</option>").appendTo(selstore);
                }

                for (i in data) {
                    if (data[i].BranchNick == "") {
                        $(
                            "<option value='" +
                            data[i].storeid +
                            "'>" +
                            data[i].storename +
                            "</option>"
                        ).appendTo(selstore);
                    } else {
                        $(
                            "<option value='" +
                            data[i].storeid +
                            "'>" +
                            data[i].storename +
                            " (" +
                            data[i].BranchNick +
                            ")</option>"
                        ).appendTo(selstore);
                    }
                }
            }
        },
    });
}

function get_supplier_info() {
    $.ajax({
        type: "POST",
        url: serverpath + "getaccounts.php",
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined" && data != null) {
                let slno = 1;
                $("#supplier_details_table").empty();
                for (let i in data) {
                    let supp_type = "";
                    if (data[i].Typeid == 0) {
                        supp_type = "Supplier";
                    } else if (data[i].Typeid == 3) {
                        supp_type = "School Account";
                    } else {
                        supp_type = "Customer";
                    }
                    let table_row = $(
                        "<tr><td>" +
                        slno++ +
                        "</td><td>" +
                        data[i].CustomerName +
                        "</td><td>" +
                        data[i].Address +
                        "</td><td>" +
                        data[i].Phone1 +
                        "</td><td>" +
                        supp_type +
                        "</td><td class='actions'><a  data-toggle='modal' data-target='#add_supplier_modal' title='Edit' class='edit btn subtle icon edit_supplier'><i class='far fa-edit'></i> <span></span></a></td><td class='actions'><a title='Delete' class='delete btn subtle icon delete_supplier' href='#'><i class='fas fa-trash-alt'></i> <span></span></a></td></tr>"
                    ).appendTo("#supplier_details_table");
                    table_row.data({
                        customer_id: data[i].CustomerId,
                        customer_name: data[i].CustomerName,
                        customer_type_id: data[i].Typeid,
                    });
                }
            }
        },
    });
}

function get_product_info() {
    $.ajax({
        type: "POST",
        url: serverpath + "getproducts.php",
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined" && data != null) {
                let products = data.products;
                global_school_id = data.school_id;
                let slno = 1;
                $("#product_list_table").empty();
                for (let i in products) {
                    let table_row = $(
                        "<tr><td>" +
                        slno++ +
                        "</td><td>" +
                        products[i].ProductName +
                        "</td><td>" +
                        products[i].OpeningStock +
                        "</td><td>" +
                        products[i].UOM +
                        "</td><td class='actions'><a  data-toggle='modal' data-target='#add_product_modal' title='Edit' class='edit btn subtle icon edit_product'><i class='far fa-edit'></i> <span></span></a></td><td class='actions'><a title='Delete' class='delete btn subtle icon delete_product' href='#'><i class='fas fa-trash-alt'></i> <span></span></a></td></tr>"
                    ).appendTo("#product_list_table");
                    table_row.data({
                        product_id: products[i].ProductId,
                        product_name: products[i].ProductName,
                    });
                }
            }
        },
    });
}

function get_product_type(product_type_id) {
    $.ajax({
        type: "POST",
        url: serverpath + "inventory_wrapper.php",
        dataType: "json",
        data: { req_type: "get_product_type", product_type_id: product_type_id },
        success: function (data) {
            if (typeof data != "undefined" && data != null) {
                $("#product_type_name").val(data[0].ProductTypeName);
                $("#product_type_description").val(data[0].ProductTypeDesc);
                $("#product_type_id").val(data[0].ProductTypeId);
                console.log("data=>", data);
            }
        },
    });
}

function get_product_type_info() {
    $.ajax({
        type: "POST",
        url: serverpath + "inventory_wrapper.php",
        dataType: "json",
        data: { req_type: "get_product_type_info" },
        success: function (data) {
            if (typeof data != "undefined" && data != null) {
                let slno = 1;
                $("#product_type_table").empty();
                for (let i in data) {
                    let tabel_row = $(
                        "<tr><td>" +
                        slno++ +
                        "</td><td>" +
                        data[i].ProductTypeName +
                        "</td><td>" +
                        data[i].ProductTypeDesc +
                        "</td><td class='actions'><a  data-toggle='modal' data-target='#add_product_type_modal' title='Edit' class='edit btn subtle icon edit_product_type'><i class='far fa-edit'></i> <span></span></a></td><td class='actions'><a title='Delete' class='delete btn subtle icon delete_product_type' href='#'><i class='fas fa-trash-alt'></i> <span></span></a></td></tr>"
                    ).appendTo("#product_type_table");
                    tabel_row.data({
                        product_type_id: data[i].ProductTypeId,
                        product_type_name: data[i].ProductTypeName,
                    });
                }
            }
        },
    });
}

function deletestore(storeid) {
    $.ajax({
        type: "POST",
        url: serverpath + "deletestore.php",
        dataType: "json",
        data: { storeid: storeid },
        success: function (data) {
            if (data == 1) {
                emsuccess("Store Deleted");
                // scrolltoTop();
                getallstores();
            }
        },
    });
}

function savestoredata(storeid, storename, storetype, branchid, storekeepers) {
    $.ajax({
        type: "POST",
        url: serverpath + "savestoredata.php",
        dataType: "json",
        data: {
            storeid: storeid,
            storename: storename,
            storetype: storetype,
            branchid: branchid,
            storekeepers: storekeepers,
        },
        success: function (data) {
            if (typeof data != "undefined") {
                if (data.success == true) {
                    clearstoredata();
                    getallstores();
                    if (storeid == 0) {
                        emsuccess(storename + " Added");
                    } else {
                        emsuccess(storename + " Updated");
                    }
                    $("#close_add_store_modal").click();
                } else {
                    emalert("Something went wrong, Please try again!");
                }

                // scrolltoTop();
            }
        },
    });
}

function getallstaffs() {
    var branchid = 0;
    // if (global_showbranches == 1) {
    //     branchid = $("#cbxstorebranch").val();
    // }
    var branches_available = global_showbranches;
    $.ajax({
        type: "POST",
        url: serverpath + "getallstaffs.php",
        dataType: "json",
        data: { branchid: branchid, branches_available: branches_available },
        success: function (data) {
            if (typeof data != "undefined") {
                var selstorekeeper = $("#cbxstorekeeper");
                selstorekeeper.empty();
                $("<option value='0'>Select Storekeepers</option>").appendTo(
                    selstorekeeper
                );
                for (i in data) {
                    var opt = $(
                        "<option value='" +
                        data[i].EMUniqueId +
                        "'>" +
                        data[i].Fname +
                        "</option>"
                    ).appendTo(selstorekeeper);
                    opt.data({ EsakStaffId: data[i].EsakStaffId });
                }
            }
        },
    });
}

function getallstoretypes() {
    $.ajax({
        type: "POST",
        url: serverpath + "getallstoretypes.php",
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined") {
                var selstoretype = $("#cbxstoretype");
                selstoretype.empty();
                $("<option value='0'>Select Store Type</option>").appendTo(
                    selstoretype
                );
                for (i in data) {
                    var opt = $(
                        "<option value='" +
                        data[i].storetypeid +
                        "'>" +
                        data[i].storetype +
                        "</option>"
                    ).appendTo(selstoretype);
                    opt.data({ storetypevalue: data[i].storetypevalue });
                }
            }
        },
    });
}

function getallstores() {
    $.ajax({
        type: "POST",
        url: serverpath + "getallstores.php",
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined") {
                var storetablebody = $("#showstores");
                storetablebody.empty();
                for (i in data) {
                    var storetablerow = $("<tr></tr>").appendTo(storetablebody);
                    if (global_ECommerce == "property") {
                        $("<td>" + data[i].storename + "</td>").appendTo(storetablerow);
                    } else {
                        $(
                            "<td>" +
                            data[i].storename +
                            "</td><td>" +
                            data[i].storekeepers +
                            "</td><td>" +
                            data[i].storetype +
                            "</td><td>" +
                            data[i].BranchNick +
                            "</td>"
                        ).appendTo(storetablerow);
                    }

                    $(
                        "<td class='actions'><a  data-toggle='modal' data-target='#add_store_modal' title='Edit' class='edit btn subtle icon edit_store' data-role='none' ><i class='far fa-edit'></i> <span></span></a></td>"
                    ).appendTo(storetablerow);
                    $(
                        "<td class='actions'><a title='Delete' class='delete btn subtle icon delete_store' href='#'><i class='fas fa-trash-alt'></i> <span></span></a></td>"
                    ).appendTo(storetablerow);
                    storetablerow.data({
                        storeid: data[i].storeid,
                        storename: data[i].storename,
                        branchid: data[i].branchid,
                        BranchName: data[i].BranchName,
                        BranchNick: data[i].BranchNick,
                        storetypeid: data[i].storetypeid,
                        storetype: data[i].storetype,
                        storetypevalue: data[i].storetypevalue,
                        storekeepers: data[i].storekeepers,
                        storekeeperids: data[i].storekeeperids,
                    });
                }
            }
        },
    });
}

function clearstoredata() {
    $("#txtstorename").val("");
    $("#txtstoreid").val(0);
    $("#cbxstoretype").val(0).trigger("change.select2");
    if (global_showbranches == 1) {
        $("#cbxstorebranch").val(0).trigger("change.select2");
    }
    $("#cbxstorekeeper").val("").trigger("change.select2");
    // $("#storelist").show();
    // $("#storedetails").hide();
}

function showtodaysdate(txtinput) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + "-" + mm + "-" + dd;
    $(txtinput).val(today);
}

function getallfiltertransactions(
    transtype,
    accounttype,
    accountid,
    costcenterid,
    productid,
    fromdate,
    todate,
    currentpage = 1,
    fromdownload = 0
) {
    $.ajax({
        url: serverpath + "getinvtransactions.php",
        type: "post",
        dataType: "json",
        data: {
            transtype: transtype,
            accounttype: accounttype,
            accountid: accountid,
            costcenterid: costcenterid,
            productid: productid,
            fromdate: fromdate,
            todate: todate,
            fromfilter: 1,
            fromdownload: fromdownload,
            pageno: currentpage,
        },
        success: function (data) {
            if (typeof data != "undefined") {
                if (!fromdownload) {
                    var trantablebody = $("#showtrans");
                    trantablebody.empty();
                    if (data.length > 0) {
                        var noofrecords = parseInt(data[0].noofrecords);
                        var noofrecordsperpage = parseInt(data[0].noofrecordsperpage);
                        preparepagination(
                            currentpage,
                            noofrecordsperpage,
                            noofrecords,
                            "#InvTranPagination"
                        );
                    }
                    let deleteButton = "";
                    if (globalIsHideDeleteButtonInTransaction == 1) {
                        deleteButton = "";
                        $(".show_or_delete_transactions_table_head").text("Show");
                    } else {
                        deleteButton =
                            "<button class='delete_transaction btn btn-danger'><i class='fa fa-trash' aria-hidden='true'></i></button>";
                    }
                    var show_files_btn =
                        "<button title='Application Form' class='show_transaction_btn btn'><i class='fas fa-globe-asia'></i></button> ";
                    for (i in data) {
                        var tranrow = $("<tr></tr>").appendTo(trantablebody);
                        if (data[i].transtype == "Receipt") {
                            $(
                                "<td>" +
                                data[i].slno +
                                "</td><td>" +
                                data[i].trandate +
                                "</td><td>" +
                                data[i].GRNNo +
                                "</td><td>" +
                                data[i].accountname +
                                "</td><td>" +
                                data[i].StoreName +
                                "</td><td>" +
                                data[i].CostCenterName +
                                "</td><td>" +
                                data[i].ProductName +
                                "</td><td>" +
                                data[i].cost +
                                "</td><td>" +
                                data[i].quantity +
                                "</td><td>" +
                                data[i].amount +
                                "</td><td>" +
                                data[i].transtype +
                                "</td><td>" +
                                deleteButton +
                                "</td>"
                            ).appendTo(tranrow);
                        } else {
                            if (data[i].Paid == 1) {
                                //if paid then show invoice printing
                                $(
                                    "<td>" +
                                    data[i].slno +
                                    "</td><td>" +
                                    data[i].trandate +
                                    "</td><td>--</td><td>" +
                                    data[i].accountname +
                                    "</td><td>" +
                                    data[i].StoreName +
                                    "</td><td>" +
                                    data[i].CostCenterName +
                                    "</td><td>" +
                                    data[i].ProductName +
                                    "</td><td>" +
                                    data[i].cost +
                                    "</td><td>" +
                                    data[i].quantity +
                                    "</td><td>" +
                                    data[i].amount +
                                    "</td><td>" +
                                    data[i].transtype +
                                    "</td><td>" +
                                    deleteButton +
                                    "" +
                                    show_files_btn +
                                    "</td>"
                                ).appendTo(tranrow);
                            } else {
                                $(
                                    "<td>" +
                                    data[i].slno +
                                    "</td><td>" +
                                    data[i].trandate +
                                    "</td><td>--</td><td>" +
                                    data[i].accountname +
                                    "</td><td>" +
                                    data[i].StoreName +
                                    "</td><td>" +
                                    data[i].CostCenterName +
                                    "</td><td>" +
                                    data[i].ProductName +
                                    "</td><td>" +
                                    data[i].cost +
                                    "</td><td>" +
                                    data[i].quantity +
                                    "</td><td>" +
                                    data[i].amount +
                                    "</td><td>" +
                                    data[i].transtype +
                                    "</td><td>" +
                                    deleteButton +
                                    "</td>"
                                ).appendTo(tranrow);
                            }
                            // $("<td>" + data[i].slno + "</td><td>" + data[i].trandate + "</td><td>" + data[i].applicationNo + "</td><td>" + data[i].accountname + "</td><td>" + data[i].StoreName + "</td><td>" + data[i].CostCenterName + "</td><td>" + data[i].ProductName + "</td><td>" + data[i].cost + "</td><td>" + data[i].quantity + "</td><td>" + data[i].amount + "</td><td>" + data[i].transtype + "</td><td>" + deleteButton + "</td>").appendTo(tranrow);
                        }

                        tranrow.data({
                            transactionid: data[i].transactionid,
                            billNo: data[i].TranNo,
                            applicationNo: data[i].applicationNo,
                            transtype: data[i].transtype == "Issue" ? 1 : 0,
                        });
                    }
                } else {
                    var filename = data.filename;
                    window.location.href = serverpath + "/download.php?f=" + filename;
                }
            }
        },
    });
}

function getAllPropertyTransaction(
    currentpage = 1,
    fromdownload = 0,
    transactionStatus = 0
) {
    if (transactionStatus == 0) {
        transactionStatus = $("#transactionStatusFilter").val();
    }
    const req_type =
        fromdownload == 0 ?
            "getAllPropertyTransaction" :
            "getAllPropertyTransactionExport";
    $.ajax({
        url: serverpath + "inventory_wrapper.php",
        type: "post",
        dataType: "json",
        data: {
            req_type: req_type,
            pageno: currentpage,
            transactionStatus: transactionStatus,
        },
        //, ECommerce_type: global_ECommerce
        success: function (data) {
            if (typeof data != "undefined") {
                if (!fromdownload) {
                    var trantablebody = $("#showtrans");
                    $("th.trans_quantity").remove();
                    $("th.trans_type").text("Payment Id");
                    $(".IDAmount").removeClass("hidden");
                    $(".RefundAmount").removeClass("hidden");
                    $(".amount_received").removeClass("hidden");

                    $("th.show_or_delete_transactions_table_head").addClass(
                        "transTypeProperty"
                    );
                    if (
                        transactionStatus == 11 ||
                        transactionStatus == 12 ||
                        transactionStatus == 13
                    ) {
                        $(".ReasonForCancellation").removeClass("hidden");
                    } else {
                        $(".ReasonForCancellation").addClass("hidden");
                    }
                    // if(transactionStatus == 11){
                    //     $(".RefundAmount").addClass('hidden');
                    // }else{
                    //     $(".RefundAmount").removeClass('hidden');
                    // }
                    if (transactionStatus == 13) {
                        $(".show_or_delete_transactions_table_head").addClass("hidden");
                    } else {
                        $(".show_or_delete_transactions_table_head").removeClass("hidden");
                    }
                    trantablebody.empty();
                    if (data.length > 0) {
                        var noofrecords = data[0].noofrecords;
                        var noofrecordsperpage = data[0].noofrecordsperpage;
                        preparepagination(
                            currentpage,
                            noofrecordsperpage,
                            noofrecords,
                            "#InvTranPagination"
                        );
                    }
                    let deleteButton = "";
                    if (globalIsHideDeleteButtonInTransaction == 1) {
                        deleteButton = "";
                        $("th.show_or_delete_transactions_table_head").text("Show");
                    } else {
                        deleteButton =
                            "<button class='delete_transaction btn btn-danger'><i class='fa fa-trash' aria-hidden='true'></i></button>";
                    }
                    let showAllotmentLetterToStageId = [3, 4, 5, 6];
                    let allotmentLetter = `<button title="Allotment Letter"  class='show_allotment_letter_btn btn'>
                        <i class="fas fa-file-alt"></i>
                    </button>`;
                    let applicationFormLink = `<button title="Application Form" class='show_transaction_btn btn'>
                        <i class='fas fa-globe-asia'></i>
                    </button>`;
                    let reasonForCancellation = "";
                    for (i in data) {
                        let show_files_cell = "";
                        if (data[i].StagesID == 1) {
                            //Credit Verification
                            $("th.show_or_delete_transactions_table_head").text("Action");
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "120px",
                            });
                            show_files_cell = `<td>
                            <button title="Verify Candidate" class='moveToPendingCreditApproval btn  btn-success'>
                                <i class="fas fa-user-check"></i>
                                Verify
                            </button>
                                </td>`;
                        } else if (data[i].StagesID == 7) {
                            //Credit Approval
                            $("th.show_or_delete_transactions_table_head").text("Action");
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "120px",
                            });
                            show_files_cell = `<td>
                            <button title="Approve Candidate" class='moveToPendingAllotment btn  btn-success' style="font-size: 12px;font-weight: 600;">
                                <i class="fas fa-user-check" style='font-size: 12px;'></i>
                                Approve
                            </button>
                                </td>`;
                        } else if (data[i].StagesID == 2) {
                            //Pending Allotment
                            $("th.show_or_delete_transactions_table_head").text(
                                "Allot Allotement Letter"
                            );
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "auto",
                            });
                            show_files_cell = `<td>
                                    <button title="Allotment"  class='show_transaction_btn btn'>
                                        <i class='fas fa-globe-asia'></i>
                                    </button>
                                </td>`;
                        } else if (data[i].StagesID == 3) {
                            //Allotted
                            $("th.show_or_delete_transactions_table_head").text(
                                "Show / Update Info"
                            );
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "110px",
                            });
                            show_files_cell = `<td>
                                    ${allotmentLetter}
                                    ${applicationFormLink}
                                </td>`;
                        } else if (data[i].StagesID == 4) {
                            //Instalment Credit Verification
                            $("th.show_or_delete_transactions_table_head").text(
                                "Verify Payment Instalments"
                            );
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "184px",
                            });
                            if (data[i].TransactionPaymentVerified == 1) {
                                show_files_cell = `<td>
                                    ${allotmentLetter}
                                    <i class="fas fa-check"></i> Verified
                                </td>`;
                            } else {
                                show_files_cell = `<td>
                                    ${allotmentLetter}
                                    <button title="Verify Instalment Payment " class='verifyInstalmentPayment btn btn-success'>
                                        <i class="fas fa-check"></i>
                                        Verify
                                    </button>
                                </td>`;
                            }
                        } else if (data[i].StagesID == 5) {
                            //Sale Deed
                            $("th.show_or_delete_transactions_table_head").text(
                                "Update Sale Deed Info"
                            );
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "180px",
                            });
                            show_files_cell = `<td class='saleDeedInfo'>
                                    ${allotmentLetter}
                                    <div class='form-group'>
                                        <label for='saleDeedNo'>Deed No.</label>
                                        <input class='form-control saleDeedNo' placeholder='Enter Deed No.' type='text'/>
                                    </div>
                                    <div class='form-group'>
                                        <label for='saleDeedDate'>Deed Date</label>
                                        <input class='form-control saleDeedDate' type='date'/>
                                    </div>
                                    <div class='form-group'>
                                        <label for='saleDeedFile'>Upload Deed Copy</label>
                                        <input class='form-control saleDeedFile' type='file' accept="application/pdf" />
                                    </div>
                                    <button title="Verify Instalment Payment " class='moveToSaleDeedGenerated btn btn-success'>
                                        <i class="fas fa-check"></i>
                                        Save
                                    </button>
                                </td>`;
                        } else if (data[i].StagesID == 6) {
                            //Sale Deed Generated
                            $("th.show_or_delete_transactions_table_head").text("Show");
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "auto",
                            });
                            show_files_cell = `<td class='saleDeedInfo'>
                                    ${allotmentLetter}
                                </td>`;
                        } else if (data[i].StagesID == 8) {
                            //Exchange credit verification
                            $("th.show_or_delete_transactions_table_head").text("Action");
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "120px",
                            });
                            show_files_cell = `<td>
                            <button title="Approve Candidate" class='moveToPendingCreditApproval btn  btn-success' style="font-size: 12px;font-weight: 600;">
                                <i class="fas fa-user-check" style='font-size: 12px;'></i>
                                Verify
                            </button>
                                </td>`;
                        } else if (data[i].StagesID == 9) {
                            //Exchange refund verification
                            $("th.show_or_delete_transactions_table_head").text("Action");
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "120px",
                            });
                            show_files_cell = `<td>
                            <button title="Move Candidate to Refund Approval" class='moveToRefundCreditVerification btn  btn-success' style="font-size: 12px;font-weight: 600;">
                                <i class="fas fa-user-check" style='font-size: 12px;'></i>
                                Verify
                            </button>
                                </td>`;
                        } else if (data[i].StagesID == 11) {
                            // Cancellation Verification
                            $("th.show_or_delete_transactions_table_head").text("Action");
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "120px",
                            });
                            show_files_cell = `<td>
                            <button title="Move Candidate to Cancellation Refund Approval" class='moveToCancellationRefundApproval btn  btn-success' style="font-size: 12px;font-weight: 600;">
                                <i class="fas fa-user-check" style='font-size: 12px;'></i>
                                Verify
                            </button>
                                </td>`;
                        } else if (data[i].StagesID == 12) {
                            // Cancellation Refund Approval
                            $("th.show_or_delete_transactions_table_head").text("Action");
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "120px",
                            });
                            show_files_cell = `<td>
                            <div class='form-group'>
                                <label for='cancellationRefundApprovalUTRNo'>UTR No.</label>
                                <input class='form-control cancellationRefundApprovalUTRNo' placeholder='Enter UTR No.' type='text'/>
                            </div>
                            <div class='form-group'>
                                <label for='cancellationRefundApprovalDate'>Date</label>
                                <input class='form-control cancellationRefundApprovalDate' type='date'/>
                            </div>
                            <button title="Complete Property Refund" class='completePropertyRefund btn  btn-danger' style="font-size: 12px;font-weight: 600;">
                                <i class="fas fa-user-check" style='font-size: 12px;'></i>
                                Verify
                            </button>
                                </td>`;
                        } else if (data[i].StagesID == 10) {
                            //Exchange refund verification
                            $("th.show_or_delete_transactions_table_head").text("Action");
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "120px",
                            });
                            show_files_cell = `<td>
                            <button title="Approve Candidate" class='moveToPendingAllotment btn  btn-success' style="font-size: 12px;font-weight: 600;">
                                <i class="fas fa-user-check" style='font-size: 12px;'></i>
                                Approve
                            </button>
                                </td>`;
                        } else if (data[i].StagesID == -1) {
                            //In Transit
                            $("th.show_or_delete_transactions_table_head").text("Delete");
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "auto",
                            });
                            show_files_cell = `<td>
                                    <button class='delete_intransit_transaction_btn btn btn-danger'><i class='fa fa-trash' aria-hidden='true'></i></button>
                                </td>`;
                            /*<button title="Application Form" class='show_transaction_btn btn'>
                                                  <i class='fas fa-globe-asia'></i>
                                              </button> 
                                          */
                        } else if (data[i].StagesID == -2) {
                            //Rejected
                            $("th.show_or_delete_transactions_table_head").text("Status");
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "auto",
                            });
                            show_files_cell = `<td>
                                    Rejected
                                </td>`;
                        } else {
                            $("th.show_or_delete_transactions_table_head").css({
                                "min-width": "auto",
                            });
                            show_files_cell = ``;
                        }
                        if (
                            data[i].StagesID == 11 ||
                            data[i].StagesID == 12 ||
                            data[i].StagesID == 13
                        ) {
                            reasonForCancellation = `<td>${data[i]["ReasonForRefundApplication"]}</td>`;
                            if (data[i].StagesID == 13) {
                                reasonForCancellation = `<td>${data[i]["ReasonForRefundApplication"]}
                                <hr/>
                                <br/>
                                <b>UTR No.:</b>&nbsp;${data[i]["UTRNo"]}
                                <hr/>
                                <br/>
                                <b>Date:</b>&nbsp;${data[i]["TransactionDate"]}
                                </td>`;
                            }
                        } else {
                            reasonForCancellation = "";
                        }
                        let property_str = data[i].ProductName;
                        let cost_str = convertAmoutToINR(data[i].cost);
                        let totalamt_str = convertAmoutToINR(data[i].amount);
                        if (data[i].oldproperty != "" && data[i].oldproperty != undefined) {
                            property_str =
                                "<b>New:</b>" +
                                data[i].ProductName +
                                " <br><b> Old:</b>" +
                                data[i].oldproperty;
                            cost_str =
                                "<b>New:</b>" +
                                convertAmoutToINR(data[i].cost) +
                                " <br><b> Old:</b>" +
                                convertAmoutToINR(data[i].oldpropertycost);
                            totalamt_str =
                                "<b>New:</b>" +
                                convertAmoutToINR(data[i].amount) +
                                " <br> <b>Old:</b>" +
                                convertAmoutToINR(data[i].oldpropertytotalcost);
                        }
                        $(".ProjectName").removeClass("hidden");
                        var tranrow = $("<tr></tr>").appendTo(trantablebody);
                        $(
                            "<td>" +
                            data[i].slno + 
                            "</td><td>" +
                            data[i].StageChangeDate +
                            "</td><td>" +
                            data[i].trandate +
                            "</td><td>" +
                            data[i].applicationNo +
                            "</td><td>" +
                            data[i].accountname +
                            "</td><td>" +
                            data[i].ProjectName +
                            "</td><td class='NotificationNoCell'>" +
                            data[i].StoreName +
                            "</td><td>" +
                            data[i].CostCenterName +
                            "</td><td>" +
                            property_str +
                            "</td><td>" +
                            cost_str +
                            "</td><td>" +
                            totalamt_str +
                            "</td><td>" +
                            convertAmoutToINR(data[i].PayUAmount) +
                            "</td><td>" +
                            data[i].PaymentId +
                            "</td><td>" +
                            convertAmoutToINR(data[i].IDAmount) +
                            "</td><td>" +
                            convertAmoutToINR(data[i].RefundAmount) +
                            "</td>" +
                            reasonForCancellation +
                            "</td>" +
                            show_files_cell
                        ).appendTo(tranrow);
                        //<td>" + data[i].quantity + "</td><td>" + data[i].transtype + "</td>
                        tranrow.data({
                            transactionid: data[i].transactionid,
                            billNo: data[i].TranNo,
                            applicationNo: data[i].applicationNo,
                            paymentId: data[i].PaymentId,
                            PayUTxnId: data[i].PayUTxnId,
                            PayUAmount: data[i].PayUAmount,
                        });
                    }
                } else {
                    var filename = data.filename;
                    window.location.href = serverpath + "/download.php?f=" + filename;
                }
            }
        },
    });
}

function getalltransactions(
    currentpage = 1,
    fromdownload = 0,
    transactionStatus = 0
) {
    if (global_ECommerce == "property") {
        getAllPropertyTransaction(currentpage, fromdownload, transactionStatus);
        return false;
    }
    // console.log("ECommerce_type:", global_ECommerce);
    $.ajax({
        url: serverpath + "getinvtransactions.php",
        type: "post",
        dataType: "json",
        data: {
            pageno: currentpage,
            fromdownload: fromdownload,
            transactionStatus: transactionStatus,
        },
        //, ECommerce_type: global_ECommerce
        success: function (data) {
            console.log("data:", data);
            if (typeof data != "undefined") {
                if (!fromdownload) {
                    var trantablebody = $("#showtrans");
                    trantablebody.empty();
                    if (data.length > 0) {
                        var noofrecords = parseInt(data[0].noofrecords);
                        var noofrecordsperpage = parseInt(data[0].noofrecordsperpage);
                        preparepagination(
                            currentpage,
                            noofrecordsperpage,
                            noofrecords,
                            "#InvTranPagination"
                        );
                    }
                    let deleteButton = "";
                    if (global_ECommerce != "property") {
                        $(".applicationNoForProperty").text("GRN No.");
                    }
                    if (globalIsHideDeleteButtonInTransaction == 1) {
                        deleteButton = "";
                        $(".show_or_delete_transactions_table_head").text("Show");
                    } else {
                        deleteButton =
                            "<button class='delete_transaction btn btn-danger'><i class='fa fa-trash' aria-hidden='true'></i></button>";
                    }
                    var show_files_btn =
                        "<button title='Application Form' class='show_transaction_btn btn'><i class='fas fa-globe-asia'></i></button> ";
                    for (i in data) {
                        var status_transaction = data[i].status ? data[i].status : "-";
                        var transaction_type = data[i].transaction_type ?
                            data[i].transaction_type :
                            data[i].transtype;
                        if (
                            data[i].transtype != "Sales" &&
                            data[i].transtype != "Rejected" &&
                            data[i].transtype != "Approved" &&
                            data[i].transtype != "Pending" &&
                            data[i].transtype != "In Transit"
                        ) {
                            var tranrow = $("<tr></tr>").appendTo(trantablebody);
                            if (data[i].transtype == "Receipt") {
                                $(
                                    "<td>" +
                                    data[i].slno +
                                    "</td><td>" +
                                    data[i].trandate +
                                    "</td><td>" +
                                    data[i].GRNNo +
                                    "</td><td>" +
                                    data[i].accountname +
                                    "</td><td>" +
                                    data[i].StoreName +
                                    "</td><td>" +
                                    data[i].CostCenterName +
                                    "</td><td>" +
                                    data[i].ProductName +
                                    "</td><td>" +
                                    convertAmoutToINR(data[i].cost) +
                                    "</td><td>" +
                                    data[i].quantity +
                                    "</td><td>" +
                                    convertAmoutToINR(data[i].amount) +
                                    "</td><td>" +
                                    transaction_type +
                                    "</td><td>" +
                                    status_transaction +
                                    "</td><td>" +
                                    deleteButton +
                                    "</td>"
                                ).appendTo(tranrow);
                            } else {
                                // $("<td>" + data[i].slno + "</td><td>" + data[i].trandate + "</td><td>--</td><td>" + data[i].accountname + "</td><td>" + data[i].StoreName + "</td><td>" + data[i].CostCenterName + "</td><td>" + data[i].ProductName + "</td><td>" + convertAmoutToINR(data[i].cost) + "</td><td>" + data[i].quantity + "</td><td>" + convertAmoutToINR(data[i].amount) + "</td><td>" + data[i].transtype + "</td><td>" + deleteButton + "</td>").appendTo(tranrow);
                                console.log("iam here" + data[i].Paid);
                                if (data[i].Paid == 1) {
                                    //if paid then show invoice printing
                                    $(
                                        "<td>" +
                                        data[i].slno +
                                        "</td><td>" +
                                        data[i].trandate +
                                        "</td><td>--</td><td>" +
                                        data[i].accountname +
                                        "</td><td>" +
                                        data[i].StoreName +
                                        "</td><td>" +
                                        data[i].CostCenterName +
                                        "</td><td>" +
                                        data[i].ProductName +
                                        "</td><td>" +
                                        convertAmoutToINR(data[i].cost) +
                                        "</td><td>" +
                                        data[i].quantity +
                                        "</td><td>" +
                                        convertAmoutToINR(data[i].amount) +
                                        "</td><td>" +
                                        transaction_type +
                                        "</td><td>" +
                                        status_transaction +
                                        "</td><td>" +
                                        deleteButton +
                                        "" +
                                        show_files_btn +
                                        "</td>"
                                    ).appendTo(tranrow);
                                } else {
                                    $(
                                        "<td>" +
                                        data[i].slno +
                                        "</td><td>" +
                                        data[i].trandate +
                                        "</td><td>--</td><td>" +
                                        data[i].accountname +
                                        "</td><td>" +
                                        data[i].StoreName +
                                        "</td><td>" +
                                        data[i].CostCenterName +
                                        "</td><td>" +
                                        data[i].ProductName +
                                        "</td><td>" +
                                        convertAmoutToINR(data[i].cost) +
                                        "</td><td>" +
                                        data[i].quantity +
                                        "</td><td>" +
                                        convertAmoutToINR(data[i].amount) +
                                        "</td><td>" +
                                        transaction_type +
                                        "</td><td>" +
                                        status_transaction +
                                        "</td><td>" +
                                        deleteButton +
                                        "</td>"
                                    ).appendTo(tranrow);
                                }
                                // $("<td>" + data[i].slno + "</td><td>" + data[i].trandate + "</td><td>" + data[i].applicationNo + "</td><td>" + data[i].accountname + "</td><td>" + data[i].StoreName + "</td><td>" + data[i].CostCenterName + "</td><td>" + data[i].ProductName + "</td><td>" + convertAmoutToINR(data[i].cost) + "</td><td>" + data[i].quantity + "</td><td>" + convertAmoutToINR(data[i].amount) + "</td><td>" + data[i].transtype + "</td><td>" + deleteButton + "</td>").appendTo(tranrow);
                            }
                        } else {
                            let show_files_cell = "";
                            if (data[i].transtype == "Approved") {
                                show_files_cell = `<td>
                                    <button title="Allotment Letter"  class='show_allotment_letter_btn btn'>
                                        <i class="fas fa-file-alt"></i>
                                    </button> 
                                    <button title="Application Form" class='show_transaction_btn btn'>
                                        <i class='fas fa-globe-asia'></i>
                                    </button> 
                                    ${deleteButton}
                                </td>`;
                            } else if (data[i].transtype == "In Transit") {
                                show_files_cell = `<td>
                                    <button class='delete_intransit_transaction_btn btn btn-danger'><i class='fa fa-trash' aria-hidden='true'></i></button>
                                    ${deleteButton}
                                </td>`;
                                /*<button title="Application Form" class='show_transaction_btn btn'>
                                                        <i class='fas fa-globe-asia'></i>
                                                    </button> 
                                                */
                            } else {
                                show_files_cell = `<td>
                                    <button title="Application Form"  class='show_transaction_btn btn'>
                                        <i class='fas fa-globe-asia'></i>
                                    </button> 
                                    ${deleteButton}
                                </td>`;
                            }
                            var tranrow = $("<tr></tr>").appendTo(trantablebody);
                            $(
                                "<td>" +
                                data[i].slno +
                                "</td><td>" +
                                data[i].trandate +
                                "</td><td>" +
                                data[i].applicationNo +
                                "</td><td>" +
                                data[i].accountname +
                                "</td><td>" +
                                data[i].StoreName +
                                "</td><td>" +
                                data[i].CostCenterName +
                                "</td><td>" +
                                data[i].ProductName +
                                "</td><td>" +
                                convertAmoutToINR(data[i].cost) +
                                "</td><td>" +
                                data[i].quantity +
                                "</td><td>" +
                                convertAmoutToINR(data[i].amount) +
                                "</td><td>" +
                                transaction_type +
                                "</td><td>" +
                                status_transaction +
                                "</td>" +
                                show_files_cell
                            ).appendTo(tranrow);
                        }
                        tranrow.data({
                            transactionid: data[i].transactionid,
                            billNo: data[i].TranNo,
                            applicationNo: data[i].applicationNo,
                            transtype: data[i].transtype == "Issue" ? 1 : 0,
                        });
                    }
                } else {
                    var filename = data.filename;
                    window.location.href = serverpath + "/download.php?f=" + filename;
                }
            }
        },
    });
}

function preparepagination(
    currentpage,
    noofrecordsperpage,
    noofrecords,
    appendtodiv
) {
    var paginationdiv = $(appendtodiv);
    paginationdiv.data("currentpage", currentpage);
    var displayedpages = paginationdiv.find(".page-item").length;
    var firstpageno = 5;
    var lastpageno = 0;
    var pageno = 0;
    if (displayedpages > 0) {
        paginationdiv.find(".normal").each(function () {
            pageno = parseInt($(this).find(".page-link").text());
            console.log(pageno);
            if (pageno < firstpageno) {
                firstpageno = pageno;
                lastpageno;
            }
            console.log("pageno=" + pageno);
            if (pageno > lastpageno) {
                lastpageno = pageno;
            }
        });
    } else {
        paginationdiv.empty();
        var nav = $("<nav aria-label='Page navigation'></nav>").appendTo(
            paginationdiv
        );
        lastpageno = 5;
        var mainul = $("<ul class='pagination justify-content-end'>").appendTo(nav);
    }
    if (noofrecords > noofrecordsperpage) {
        var noofpages = parseInt(noofrecords / noofrecordsperpage);
        var noofpageitems = 5;
    } else {
        var noofpages = 1;
        var noofpageitems = 1;
    }
    var changenumbering = 0;
    if (noofpages > noofpageitems && displayedpages > 0) {
        if (currentpage < firstpageno) {
            firstpageno = currentpage;
            lastpageno = currentpage + (noofpageitems - 1);
            changenumbering = 1;
        }
        if (currentpage > lastpageno) {
            firstpageno = currentpage - (noofpageitems - 1);
            lastpageno = currentpage;
            changenumbering = 1;
        }
    } else if (displayedpages == 0) {
        firstpageno = 1;
        lastpageno = noofpageitems;
        changenumbering = 1;
    }
    if (changenumbering) {
        paginationdiv.empty();
        var nav = $("<nav aria-label='Page navigation'></nav>").appendTo(
            paginationdiv
        );
        var mainul = $("<ul class='pagination justify-content-end'>").appendTo(nav);
        if (currentpage != 1) {
            var prevli = $(
                "<li class='page-item previous'><a class='page-link' href='#' tabindex='-1'>Previous</a></li>"
            ).appendTo(mainul);
        } else {
            var prevli = $(
                "<li class='page-item disabled previous'><a class='page-link' href='#' tabindex='-1'>Previous</a></li>"
            ).appendTo(mainul);
        }

        for (var i = firstpageno; i <= lastpageno; i++) {
            if (i == currentpage) {
                $(
                    '<li class="page-item active normal"><a class="page-link" href="#">' +
                    i +
                    "</a></li>"
                ).appendTo(mainul);
            } else {
                $(
                    '<li class="page-item normal"><a class="page-link" href="#">' +
                    i +
                    "</a></li>"
                ).appendTo(mainul);
            }
        }

        if (currentpage != noofpages) {
            var nextli = $(
                "<li class='page-item next'><a class='page-link' href='#''>Next</a></li>"
            ).appendTo(mainul);
        } else {
            var nextli = $(
                "<li class='page-item disabled next'><a class='page-link' href='#''>Next</a></li>"
            ).appendTo(mainul);
        }
    } else {
        paginationdiv.find("li.normal").removeClass("active");
        paginationdiv.find("li.normal").each(function () {
            var pageno = parseInt($(this).find(".page-link").text());
            if (currentpage == pageno) {
                $(this).addClass("active");
                return false;
            }
        });
        if (currentpage != 1) {
            paginationdiv.find(".previous").removeClass("disabled");
        } else {
            paginationdiv.find(".previous").addClass("disabled");
        }
        if (currentpage < lastpageno) {
            paginationdiv.find(".next").removeClass("disabled");
        } else if (currentpage >= noofpages) {
            paginationdiv.find(".next").addClass("disabled");
        }
    }
}

function paginationpageitem(currentpage, funcname) {
    if ($("#tranfilters").is(":visible")) {
        var transtype = $("input:radio[name='filtrantype']:checked").val();
        var accounttype = $("input:radio[name='filtypeofaccount']:checked").val();
        var accountid = $("#cbxfilaccount").val();
        var productid = $("#cbxfilproduct").val();
        var fromdate = $("#tranfromdate").val();
        var todate = $("#trantodate").val();
        var costcenterid = $("#cbxfilcostcenter").val();
        getallfiltertransactions(
            transtype,
            accounttype,
            accountid,
            costcenterid,
            productid,
            fromdate,
            todate,
            1
        );
    } else {
        funcname(currentpage, 0, $("#transactionStatusFilter").val());
    }
}

function paginationnext(currentpage, funcname, ele) {
    if (ele.hasClass("disabled")) {
        return false;
    }
    currentpage++;
    if ($("#tranfilters").is(":visible")) {
        var transtype = $("input:radio[name='filtrantype']:checked").val();
        var accounttype = $("input:radio[name='filtypeofaccount']:checked").val();
        var accountid = $("#cbxfilaccount").val();
        var productid = $("#cbxfilproduct").val();
        var fromdate = $("#tranfromdate").val();
        var todate = $("#trantodate").val();
        var costcenterid = $("#cbxfilcostcenter").val();
        getallfiltertransactions(
            transtype,
            accounttype,
            accountid,
            costcenterid,
            productid,
            fromdate,
            todate,
            1
        );
    } else {
        funcname(currentpage, 0, $("#transactionStatusFilter").val());
    }
}

function paginationprev(currentpage, funcname, ele) {
    if (ele.hasClass("disabled")) {
        return false;
    }
    currentpage--;
    if ($("#tranfilters").is(":visible")) {
        var transtype = $("input:radio[name='filtrantype']:checked").val();
        var accounttype = $("input:radio[name='filtypeofaccount']:checked").val();
        var accountid = $("#cbxfilaccount").val();
        var productid = $("#cbxfilproduct").val();
        var fromdate = $("#tranfromdate").val();
        var todate = $("#trantodate").val();
        var costcenterid = $("#cbxfilcostcenter").val();
        getallfiltertransactions(
            transtype,
            accounttype,
            accountid,
            costcenterid,
            productid,
            fromdate,
            todate,
            1
        );
    } else {
        funcname(currentpage, 0, $("#transactionStatusFilter").val());
    }
}

function addaTranrow() {
    var indenttablebody = $("#invtranbody");
    var indenttablerow = $(
        "<tr><td><button type='button' class='btn btn-secondary btn-deleteinv'>X</button></td><td><select class='cbxinvproduct' data-role='none' style='width: 98%'><option value='0'>Select a Product</option></select></td><td><label class='invstock'>Stock</label></td><td><label class='invUOM'>UOM</label></td><td><input type='text' class='form-control  invPrice' placeholder='Cost' aria-label='Rate' aria-describedby='addon-wrapping'></td><td><label class='invTax'>0</label></td><td><input type='text' class='form-control txtinvqty' placeholder='Quantity' aria-label='Quantity' aria-describedby='addon-wrapping'></td><td><label class='invtotal'>Total</label></td></tr>"
    ); //<td><label class='txtinvunitcost'>Cost Price</label></td>
    indenttablerow.appendTo(indenttablebody);
    $("select.cbxinvproduct").select2({
        matcher: matchCustom,
    });
    var selprod = $("#invtranbody>tr:last-child").find(".cbxinvproduct");
    getproducts(selprod);
    calculatetranamount();
    if (global_ECommerce == "property") {
        $(".cbxinvproduct").find("option:selected").text("Select a Project");
    }
}

function calculatetranamount() {
    var grandtotal = 0;
    var subtotal = 0;
    var taxtotal = 0;
    $("#invtranbody>tr").each(function () {
        var cost = isNaN(parseFloat($(this).find(".invPrice").val())) ?
            0 :
            parseFloat($(this).find(".invPrice").val()).toFixed(2);
        var taxper = isNaN(parseFloat($(this).find(".invTax").text())) ?
            0 :
            parseFloat($(this).find(".invTax").text());
        //var MRP = isNaN(parseFloat($(this).find(".invPrice").data("MRP"))) ? 0 :
        //parseFloat($(this).find(".invPrice").data("MRP"));
        var qty = isNaN(parseFloat($(this).find(".txtinvqty").val())) ?
            0 :
            parseFloat($(this).find(".txtinvqty").val()).toFixed(2);
        total = parseFloat(cost) * parseFloat(qty);
        //var orgtotal = parseFloat(MRP) * parseFloat(qty);
        var Tax = (parseFloat(total) * parseFloat(taxper)) / 100;
        taxtotal = taxtotal + Tax;
        $(this).find(".invtotal").text(parseFloat(total).toFixed(2));
        subtotal = subtotal + total;
        grandtotal = grandtotal + (total + Tax);
    });
    $("#invsubtotal").text(parseFloat(subtotal).toFixed(2));
    $("#invtaxtotal").text(parseFloat(taxtotal).toFixed(2));
    $("#invgrandtotal").text(parseFloat(grandtotal).toFixed(2));
}

function isValidDate(d) {
    if (Object.prototype.toString.call(d) !== "[object Date]") return false;
    return !isNaN(d.getTime());
}

function searchaccount(accounttype) {
    var selacc = $("#cbxaccount");
    selacc.empty();
    switch (parseInt(accounttype)) {
        case 0:
            if (global_ECommerce == "property") {
                $("#lbltranby").text("Customer");
                $("<option value='0'>Select a Customer</option>").appendTo(selacc);
            } else {
                $("#lbltranby").text("Student");
                $("<option value='0'>Select a Student</option>").appendTo(selacc);
            }
            break;
        case 1:
            $("#lbltranby").text("Staff");
            $("<option value='0'>Select a Staff</option>").appendTo(selacc);
            break;
        case 2:
            $("#lbltranby").text("Supplier");
            $("<option value='0'>Select a Supplier</option>").appendTo(selacc);
            break;
        case 3:
            $("#lbltranby").text("Receiver");
            $("<option value='0'>Select a Receiver</option>").appendTo(selacc);
            break;
        case 4:
            $("#lbltranby").text("Stores");
            $("<option value='0'>Select a Store</option>").appendTo(selacc);
            break;
    }
    $.ajax({
        type: "POST",
        url: serverpath + "searchaccounts.php",
        dataType: "json",
        data: { acctype: accounttype },
        success: function (data) {
            if (typeof data != "undefined") {
                for (i in data) {
                    let opt = $(
                        "<option value='" + data[i].id + "'>" + data[i].label + "</option>"
                    ).appendTo(selacc);
                    opt.data("cost-center", data[i].standard);
                }
            }
        },
    });
}

function filsearchaccount(accounttype) {
    var selacc = $("#cbxfilaccount");
    selacc.empty();
    switch (parseInt(accounttype)) {
        case 0:
            $("#lbltranby").text("Student");
            $("<option value='0'>Select a Student</option>").appendTo(selacc);
            break;
        case 1:
            $("#lbltranby").text("Staff");
            $("<option value='0'>Select a Staff</option>").appendTo(selacc);
            break;
        case 2:
            $("#lbltranby").text("Supplier");
            $("<option value='0'>Select a Supplier</option>").appendTo(selacc);
            break;
        case 3:
            $("#lbltranby").text("Receiver");
            $("<option value='0'>Select a Receiver</option>").appendTo(selacc);
            break;
        case 4:
            $("#lbltranby").text("Stores");
            $("<option value='0'>Select a Store</option>").appendTo(selacc);
            break;
    }
    $.ajax({
        type: "POST",
        url: serverpath + "searchaccounts.php",
        dataType: "json",
        data: { acctype: accounttype },
        success: function (data) {
            if (typeof data != "undefined") {
                for (i in data) {
                    $(
                        "<option value='" + data[i].id + "'>" + data[i].label + "</option>"
                    ).appendTo(selacc);
                }
            }
        },
    });
}

function getcostcenters(selcostcenters, costcenterid = 0) {
    selcostcenters.empty();
    $.ajax({
        type: "POST",
        url: serverpath + "searchcostcenters.php",
        dataType: "json",
        data: { term: "" },
        success: function (data) {
            
            if (data != "undefined") {
                let cnt = 1;
                for (i in data) {
                    if (cnt == 1) {
                        if (global_ECommerce == "property") {
                            $(
                                "<option value='0' selected='selected'>Select a District</option>"
                            ).appendTo(selcostcenters);
                        } else {
                            $(
                                "<option value='0' selected='selected'>Select a Cost Center</option>"
                            ).appendTo(selcostcenters);
                        }
                        $(
                            "<option value='" +
                            data[i].id +
                            "'>" +
                            data[i].label +
                            "</option>"
                        ).appendTo(selcostcenters);
                    } else {
                        $(
                            "<option value='" +
                            data[i].id +
                            "'>" +
                            data[i].label +
                            "</option>"
                        ).appendTo(selcostcenters);
                    }
                    cnt++;
                }
                selcostcenters.val(costcenterid);
            }
        },
    });
}

function global_getproducts() {
    $.ajax({
        type: "post",
        url: serverpath + "getproducts.php",
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined" && data) {
                global_products.length = 0;
                $("#txttrandate").val(data.today_date);
                var product = data.products;
                for (i in product) {
                    global_products[product[i].ProductId] = [];
                    global_products[product[i].ProductId]["ProductId"] =
                        product[i].ProductId;
                    global_products[product[i].ProductId]["ProductName"] =
                        product[i].ProductName;
                    global_products[product[i].ProductId]["Rate"] = product[i].Rate;
                    global_products[product[i].ProductId]["OpeningStock"] =
                        product[i].OpeningStock;
                    global_products[product[i].ProductId]["UOM"] = product[i].UOM;
                    global_products[product[i].ProductId]["Tax"] = product[i].Tax;
                    global_products[product[i].ProductId]["place"] = product[i].place;
                }
                global_school_id = data.school_id;
            }
        },
    });
}

function deleteproject(projectid) {
    $.ajax({
        url: serverpath + "deleteproject.php",
        type: "POST",
        dataType: "json",
        data: { projectid: projectid },
        success: function (data) {
            if (typeof data != "undefined") {
                if (data > 0) {
                    emsuccess("Project Deleted");
                    getAllprojects();
                }
            }
        },
    });
}

function changeprojectstatus(projectid) {
    $.ajax({
        url: serverpath + "changeprojectstatus.php",
        type: "POST",
        dataType: "json",
        data: { projectid: projectid },
        success: function (data) {
            if (typeof data != "undefined") {
                if (data > 0) {
                    emsuccess("Project Status Changed");
                    getAllprojects();
                }
            }
        },
    });
}

function getprojects(selproj) {
    $.ajax({
        url: serverpath + "getAllprojects.php",
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined") {
                selproj.empty();
                $("<option value='0'>Select a Project</option>").appendTo(selproj);
                for (i in data) {
                    $(
                        "<option value='" +
                        data[i].ProjectId +
                        "'>" +
                        data[i].ProjectName +
                        "</option>"
                    ).appendTo(selproj);
                }
            }
        },
    });
}

function get_filter_data(from_page = "") {
    var selid = "";
    if (from_page == "indent_list") {
        selid = "indent_list_add_filter";
    }
    $("#" + selid).empty();
    console.log("selid=" + selid);
    $.ajax({
        url: serverpath + "inventory_wrapper.php",
        type: "POST",
        dataType: "json",
        data: { from_page: from_page, req_type: "getfilterdata" },
        success: function (filterdata) {
            if (typeof filterdata != "undefined") {
                indent_list_filter_data = filterdata;
                $("#" + selid).append('<option value="0">Add a Filter</option>');
                for (i in filterdata) {
                    var appended_option = $("#" + selid).append(
                        '<option arr_index="' +
                        i +
                        '" value="' +
                        filterdata[i].filter_coloumname +
                        '">' +
                        filterdata[i].filter_label +
                        "</option>"
                    );
                }
            }
        },
    });
}


function getAllprojects() {
    $.ajax({
        url: serverpath + "getAllprojects.php",
        type: "POST",
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined") {
                let projectbody = $("#project_table");
                projectbody.empty();
                let SlNo = 1;
                for (i in data) {
                    const status = data[i].status == 1 ? "on" : "off";
                    tablerow = $("<tr></tr>").appendTo(projectbody);
                    $(
                        "<td>" +
                        SlNo +
                        "</td><td>" +
                        data[i].ProjectName +
                        "</td><td>" +
                        data[i].ProjectDesc +
                        "</td><td>" +
                        data[i].CostCenterName +
                        "</td><td>" +
                        data[i].no_of_installment +
                        "</td><td class='actions'><button data-toggle='modal' data-target='#add_project_modal' type='button' title='Edit' class='btn btn-light edit_project' data-role='none' ><i class='fa fa-pencil'></i></button></td> <td class='actions'><button type='button' class='delete btn btn-light delete_project'><i class='fa fa-trash'></i></button></td> <td class='actions'><button type='button' class='delete btn btn-light status_project'><i class='fa fa-toggle-" + status + "'></i></button></td>" 
                    ).appendTo(tablerow);
                    tablerow.data({
                        ProjectId: data[i].ProjectId,
                        ProjectName: data[i].ProjectName,
                        ProjectDesc: data[i].ProjectDesc,
                        no_of_installment: data[i].no_of_installment,
                        CostCenterId: data[i].CostCenterId,
                        CostCenterName: data[i].CostCenterName,
                    });
                    SlNo++;
                }
            }
        },
    });
}

function clearprojectdata() {
    $("#project_id").val(0);
    $("#project_name").val("");
    $("#project_description").val("");
    $("#seldistricts").val(0);
    $("#no_of_installment").val(0);
}

function saveproject(projectid, projectname, projectdesc, CostCenterId, no_of_installment) {
    $.ajax({
        url: serverpath + "saveproject.php",
        type: "POST",
        dataType: "json",
        data: {
            projectid: projectid,
            projectname: projectname,
            projectdesc: projectdesc,
            CostCenterId: CostCenterId,
            no_of_installment: no_of_installment,
        },
        success: function (data) {
            if (data > 0) {
                showAlert(
                    $("#Project .alertarea"),
                    "success",
                    "Success!",
                    "Project Saved."
                );
                clearprojectdata();
            } else {
                showAlert(
                    $("#Project .alertarea"),
                    "danger",
                    "Failure!",
                    "Server Busy. Try after sometime"
                );
            }
        },
        complete: function () {
            $("#add_project_modal").modal("hide");
            getAllprojects();
        },
    });
}

function getindentlist(level = "") {
    $.ajax({
        url: serverpath + "getindentlist.php",
        type: "POST",
        dataType: "json",
        data: { level: level },
        success: function (inddata) {
            indenttablebody = $("#showindents");
            if (typeof inddata != "undefined") {
                data = inddata.indentlist;
                indenttablebody.empty();
                SlNo = 1;
                if (data.length == 0) {
                    tablerow = $("<tr/>").appendTo(indenttablebody);
                    $("<td colspan='8'>No Records found</td>").appendTo(tablerow);
                    return false;
                }
                for (i in data) {
                    tablerow = $("<tr/>").appendTo(indenttablebody);
                    if (data[i].status == "Pending" && data[i].show_edit == 1) {
                        $(
                            "<td>" +
                            SlNo +
                            "</td><td class='indno'>" +
                            data[i].indentno +
                            "</td><td>" +
                            data[i].trandate +
                            "</td><td>" +
                            data[i].invdesc +
                            "</td><td>" +
                            data[i].remark +
                            "</td><td>" +
                            data[i].staffname +
                            "</td><td>" +
                            data[i].status +
                            "</td><td class='actions'><button type='button' title='Edit' class='btn btn-primary edit_indent' data-role='none' ><i class='fa fa-pencil'></i></button></td> <td class='actions'><button type='button' class='delete btn btn-primary delete_indent'><i class='fa fa-trash'></i></button></td>"
                        ).appendTo(tablerow);
                    } else {
                        $(
                            "<td>" +
                            SlNo +
                            "</td><td class='indno'>" +
                            data[i].indentno +
                            "</td><td>" +
                            data[i].trandate +
                            "</td><td>" +
                            data[i].invdesc +
                            "</td><td>" +
                            data[i].remark +
                            "</td><td>" +
                            data[i].staffname +
                            "</td><td>" +
                            data[i].status +
                            "</td><td class='actions'></td> <td class='actions'></td>"
                        ).appendTo(tablerow);
                    }
                    tablerow.data({
                        indentno: data[i].indentno,
                        invdate: data[i].trandate,
                        invdesc: data[i].invdesc,
                        remark: data[i].remark,
                        emstaffid: data[i].emstaffid,
                        staffname: data[i].staffname,
                        storeid: data[i].storeid,
                        storename: data[i].storename,
                    });
                    SlNo++;
                }
                $("#indentlistdiv").show();
            }
        },
    });
}

function save_indent(indenttran) {
    $.ajax({
        url: InventoryWrapper + "/Wrapper.php",
        type: "POST",
        dataType: "json",
        data: { Type: "SaveIndent", indentdata: indenttran },
        success: function (data) {
            if (data.Status == 1) {
                showAlert(
                    $("#indentlistdiv>.alertarea"),
                    "success",
                    "Success!",
                    "Indent Saved."
                );
                clearindentdata();
            } else {
                showAlert(
                    $("#indentlistdiv>.alertarea"),
                    "danger",
                    "Failure!",
                    "Server Busy. Try after sometime"
                );
            }
        },
        complete: function () {
            $("#modalAddIndent").modal("hide");
            getindentlist();
        },
    });
}

function clearindentdata() {
    $("#modalAddIndent").data({ indentno: 0 });
    $("#modalAddIndent .modal-title").text("Add an Indent");
    $("#lblrequestby").text("Request to Store : ");
    $("#btnaddindtranrow").closest("div").show();
    $("#save_indent").show();
    $("#txtindentdescription").val("");
    $("#cbxindentstores").val(0);
    $("#indentComent").val("");
    $("#indenttran").empty();
    $(".comment_div").hide();
}

function getproducts(selprod) {
    selprod.empty();
    if (global_ECommerce == "property") {
        $("<option value='0'>Select a Property</option>").appendTo(selprod);
    } else {
        $("<option value='0'>Select a Product</option>").appendTo(selprod);
    }

    for (var i in global_products) {
        var product = global_products[i];
        let opt = $(
            "<option value='" +
            product.ProductId +
            "'>" +
            product.ProductName +
            "</option>"
        ).appendTo(selprod);
        opt.data("product_rate", product.Rate);
    }
}

function getindentdetailsforedit(indentno) {
    $.ajax({
        url: serverpath + "getindentdetails.php",
        type: "POST",
        dataType: "json",
        data: { indentno: indentno },
        success: function (data) {
            if (typeof data != "undefined") {
                if (data[0].noofrows > 0) {
                    $("#modalAddIndent").data({ indentno: data[0].indentno });
                    $("#modalAddIndent .modal-title").text(
                        "Indent Details for Indent No. " + data[0].indentno
                    );
                    var invdesc = data[0].invdesc;
                    var remarks = data[0].remark;
                    var storeid = data[0].storeid;
                    var staffid = data[0].emstaffid;
                    var staffname = data[0].staffname;

                    // var comments=data[0].comments;
                    $("#txtindentdescription").val(invdesc);
                    $("#lblrequestby").data({ staffid: staffid });
                    $("#lblrequestby").text("Request by " + staffname + " to ");
                    $("#cbxindentstores").val(storeid).trigger("change");
                    $("#indentComent").val(remarks);
                    $("#btnaddindtranrow").closest("div").show();
                    var indenttablebody = $("#indenttran");
                    indenttablebody.empty();
                    var reqhead = $("#reqhead");
                    reqhead.empty();
                    $(
                        "<th>Remove</th><th>Product</th><th>Stock</th><th>Unit of Measurement</th><th>Qty. Required</th>"
                    ).appendTo(reqhead);
                    for (var i in data) {
                        var indenttablerow = $(
                            "<tr><td><button type='button' class='btn btn-secondary btn-delete'>X</button></td><td><select class='cbxproduct' data-role='none' style='width: 98%'><option value='0'>Select a Product</option></select></td><td><label class='indentstock'>Stock</label></td><td><label class='indentUOM'>UOM</label></td><td><input type='text' class='form-control txtindentqtyreq' placeholder='Qty. Required' aria-label='Qty. Required' aria-describedby='addon-wrapping'></td></tr>"
                        );
                        indenttablerow.appendTo(indenttablebody);
                        var selprod = $("#indenttran>tr:last-child").find(".cbxproduct");
                        getproducts(selprod);
                        indenttablebody
                            .find("tr:last-child")
                            .find(".cbxproduct")
                            .val(data[i].productid)
                            .trigger("change");
                        indenttablebody
                            .find("tr:last-child")
                            .find(".indentstock")
                            .text(data[i].stock);
                        indenttablebody
                            .find("tr:last-child")
                            .find(".indentUOM")
                            .text(data[i].uom);
                        indenttablebody
                            .find("tr:last-child")
                            .find(".txtindentqtyreq")
                            .val(data[i].qty);
                    }
                    $(".comment_div").hide();
                    // var viewcommentlist=$("#showcomments");
                    // viewcommentlist.empty();
                    // for(var i in comments){
                    //     $('<tr><td>'+comments[i].Fname+'</td><td>'+comments[i].Comment+'</td></tr>').appendTo(viewcommentlist);
                    // }
                    $("#save_indent").show();
                    $("#modalAddIndent").modal("show");
                } else {
                    showAlert(
                        $("#indentlistdiv>.alertarea"),
                        "danger",
                        "Failure!",
                        "Server Busy. Try after sometime"
                    );
                }
            }
        },
    });
}

function getindentdetailsforview(indentno) {
    $.ajax({
        url: serverpath + "getindentdetails.php",
        type: "POST",
        dataType: "json",
        data: { indentno: indentno },
        success: function (data) {
            if (typeof data != "undefined") {
                if (data[0].noofrows > 0) {
                    $("#modalAddIndent").data({ indentno: data[0].indentno });
                    $("#modalAddIndent .modal-title").text(
                        "Indent Details for Indent No. " + data[0].indentno
                    );
                    var invdesc = data[0].invdesc;
                    var remarks = data[0].remark;
                    var storeid = data[0].storeid;
                    var staffid = data[0].emstaffid;
                    var staffname = data[0].staffname;
                    var comments = data[0].comments;

                    $("#txtindentdescription").val(invdesc);
                    $("#lblrequestby").data({ staffid: staffid });
                    $("#lblrequestby").text("Request by " + staffname + " to ");
                    $("#cbxindentstores").val(storeid).trigger("change");
                    $("#indentComent").val(remarks);

                    $("#btnaddindtranrow").closest("div").hide();
                    var indenttablebody = $("#indenttran");
                    indenttablebody.empty();
                    var reqhead = $("#reqhead");
                    reqhead.empty();
                    $(
                        "<th>Product</th><th>Stock</th><th>Unit of Measurement</th><th>Qty. Required</th>"
                    ).appendTo(reqhead);
                    for (i in data) {
                        tablerow = $("<tr/>").appendTo(indenttablebody);
                        // $("<td>&nbsp&nbsp&nbsp</td><td>" + data[i].productname + "</td><td>" + data[i].stock + "</td><td>" + data[i].uom + "</td><td>" + data[i].qty + "</td>").appendTo(tablerow);
                        $(
                            "<td>" +
                            data[i].productname +
                            "</td><td>" +
                            data[i].stock +
                            "</td><td>" +
                            data[i].uom +
                            "</td><td>" +
                            data[i].qty +
                            "</td>"
                        ).appendTo(tablerow);
                    }
                    var viewcommentlist = $("#showcomments");
                    viewcommentlist.empty();
                    for (var i in comments) {
                        $(
                            "<tr><td>" +
                            comments[i].Fname +
                            "</td><td>" +
                            comments[i].Comment +
                            "</td></tr>"
                        ).appendTo(viewcommentlist);
                    }
                    $(".comment_div").show();
                    $("#save_indent").hide();
                    $("#modalAddIndent").modal("show");
                } else {
                    showAlert(
                        $("#indentlistdiv>.alertarea"),
                        "danger",
                        "Failure!",
                        "Server Busy. Try after sometime"
                    );
                }
            }
        },
    });
}

function getindentlistdetailsforview(indentno) {
    $.ajax({
        url: serverpath + "getindentdetails.php",
        type: "POST",
        dataType: "json",
        data: { indentno: indentno },
        success: function (data) {
            if (typeof data != "undefined") {
                if (data[0].noofrows > 0) {
                    var indentno = data[0].indentno;
                    $("#modalViewIndent").data({ indentno: data[0].indentno });
                    $("#modalViewIndent .modal-title").text(
                        "Indent Details for Indent No. " + data[0].indentno
                    );
                    var invdesc = data[0].invdesc;
                    var remarks = data[0].remark;
                    var storeid = data[0].storeid;
                    var staffid = data[0].emstaffid;
                    console.log("staffid=" + staffid);
                    var staffname = data[0].staffname;
                    var indentdate = data[0].invdate;
                    var GrantingLevel = data[0].GrantingLevel;
                    var MaxGrantingLevel = data[0].MaxGrantingLevel;
                    var comments = data[0].comments;

                    $("#txtviewindentdescription").val(invdesc);
                    $("#txtviewindentdate").val(indentdate);
                    $("#lblviewrequestby").data({ staffid: staffid });
                    $("#lblviewrequestby").text("Request by " + staffname + " to ");
                    $("#cbxviewindentstores").val(storeid).trigger("change");
                    $("#viewindentComent").val(remarks);
                    $("#reject_indent").attr("data-Rejectlevel", GrantingLevel);
                    $("#issue_indent").attr("data-Issuelevel", GrantingLevel);
                    $("#viewindentRemarks").val("");
                    var indenttablebody = $("#viewindenttran");

                    indenttablebody.empty();
                    for (i in data) {
                        tablerow = $("<tr/>").appendTo(indenttablebody);
                        // $("<td><button type='button' class='btn btn-secondary btn-deleteinview'>X</button></td><td>" + data[i].productname + "</td><td>" + data[i].stock + "</td><td>" + data[i].uom + "</td><td class='qtyreq'>" + data[i].qty + "</td>").appendTo(tablerow);
                        $(
                            "<td>" +
                            data[i].productname +
                            "</td><td>" +
                            data[i].stock +
                            "</td><td>" +
                            data[i].uom +
                            "</td><td class='qtyreq'>" +
                            data[i].qty +
                            "</td>"
                        ).appendTo(tablerow);
                        var productid = data[i].productid;
                        var requiredqty = data[i].qty;
                        tablerow.data({
                            indentno: indentno,
                            indentdate: indentdate,
                            emstaffid: staffid,
                            indentdesc: invdesc,
                            storeid: storeid,
                            productid: productid,
                            qtyreq: requiredqty,
                        });
                        console.log(tablerow.data("emstaffid"));
                    }
                    var viewcommentlist = $("#viewcommentlist");
                    viewcommentlist.empty();
                    for (var i in comments) {
                        $(
                            "<tr><td>" +
                            comments[i].Fname +
                            "</td><td>" +
                            comments[i].Comment +
                            "</td></tr>"
                        ).appendTo(viewcommentlist);
                    }
                    $("#modalViewIndent").modal("show");
                } else {
                    showAlert(
                        $("#IndentList>.alertarea"),
                        "danger",
                        "Failure!",
                        "Server Busy. Try after sometime"
                    );
                }
            }
        },
    });
}

function getindstorelist() {
    $.ajax({
        type: "post",
        url: serverpath + "getindentstores.php",
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined") {
                var selindentstores = $("#cbxindentstores");
                selindentstores.empty();
                $("<option value='0'>Select a Store</option>").appendTo(
                    selindentstores
                );
                for (i in data) {
                    $(
                        "<option value='" +
                        data[i].storeid +
                        "'>" +
                        data[i].storename +
                        "</option>"
                    ).appendTo(selindentstores);
                }
            }
        },
    });
}

function getindviewstorelist() {
    $.ajax({
        type: "post",
        url: serverpath + "getindentstores.php",
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined") {
                var selindentstores = $("#cbxviewindentstores");
                selindentstores.empty();
                $("<option value='0'>Select a Store</option>").appendTo(
                    selindentstores
                );
                for (i in data) {
                    $(
                        "<option value='" +
                        data[i].storeid +
                        "'>" +
                        data[i].storename +
                        "</option>"
                    ).appendTo(selindentstores);
                }
            }
        },
    });
}
async function getstockbyinvproductid(productid, tablerow) {
    let option = {
        method: "POST",
        header: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        credentials: "same-origin",
    };
    let data = new FormData();
    data.append("productid", productid);
    option.body = data;
    var response = await fetch(
        serverpath + "getcurrentstockbyproduct.php",
        option
    );
    let productstockobj = await response.json();
    currentstock = productstockobj[0].openingstock;
    tablerow.find(".invstock").text(currentstock);
}
async function getstockbyproductid(productid, tablerow) {
    let option = {
        method: "POST",
        header: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        credentials: "same-origin",
    };
    let data = new FormData();
    data.append("productid", productid);
    option.body = data;
    var response = await fetch(
        serverpath + "getcurrentstockbyproduct.php",
        option
    );
    let productstockobj = await response.json();
    currentstock = productstockobj[0].openingstock;
    tablerow.find(".indentstock").text(currentstock);
}

function deleteIndent(indentno) {
    $.ajax({
        url: serverpath + "deleteindent.php",
        type: "POST",
        dataType: "json",
        data: { indentno: indentno },
        success: function (data) {
            if (typeof data != "undefined") {
                showAlert(
                    $("#indentlistdiv>.alertarea"),
                    "success",
                    "Success!",
                    "Indent Deleted."
                );
                $("#modalDeleteIndent").modal("hide");
                getindentlist();
            } else {
                showAlert(
                    $("#indentlistdiv>.alertarea"),
                    "danger",
                    "Failure!",
                    "Server Busy. Try after sometime"
                );
            }
        },
    });
}

function getallindentlist(From) {
    $.ajax({
        url: InventoryWrapper + "/Wrapper.php",
        type: "POST",
        dataType: "json",
        data: { Type: "GetIndentList", From: From },
        success: function (inddata) {
            show_all_indent_list(inddata);
        },
    });
}

function show_all_indent_list(inddata = "") {
    indenttablebody = $("#showallindents");
    if (typeof inddata != "undefined") {
        from = inddata.from;
        data = inddata.indentdata;
        if (from == 0) {
            SlNo = 1;
            indenttablebody.empty();
            if (data.length == 0) {
                tablerow = $("<tr/>").appendTo(indenttablebody);
                $("<td colspan='8'>No Records found.</td>").appendTo(tablerow);
            }
            for (i in data) {
                tablerow = $("<tr/>").appendTo(indenttablebody);
                // $("<td>" + SlNo + "</td><td>" + data[i].indentno + "</td><td>" + data[i].trandate + "</td><td class='invdesc'>" + data[i].invdesc + "</td><td>" + data[i].remark + "</td><td class='invstaff'>" + data[i].staffname + "</td><td class='invstore'>" + data[i].storename + "</td><td class='actions'><a href='#' title='View' class='view btn subtle icon view_indent' data-role='none' ><span>View</span></a></td>").appendTo(tablerow);
                $(
                    "<td>" +
                    SlNo +
                    "</td><td>" +
                    data[i].indentno +
                    "</td><td>" +
                    data[i].trandate +
                    "</td><td class='invdesc'>" +
                    data[i].invdesc +
                    "</td><td>" +
                    data[i].remark +
                    "</td><td class='invstaff'>" +
                    data[i].staffname +
                    "</td><td class='invstore'>" +
                    data[i].storename +
                    "</td><td class='view_actions'><i class='fa fa-eye view_indent' aria-hidden='true'></i></a></td>"
                ).appendTo(tablerow);
                tablerow.data({
                    indentno: data[i].indentno,
                    invdate: data[i].trandate,
                    invdesc: data[i].invdesc,
                    emstaffid: data[i].emstaffid,
                    staffname: data[i].staffname,
                });
                SlNo++;
            }
        } else {
            filename = inddata.filename;
            window.location.href = serverpath + "/download.php?f=" + filename;
        }
    } else {
        showAlert(
            $("#IndentList>.alertarea"),
            "danger",
            "Failure!",
            "Server Busy. Try after sometime"
        );
    }
}

function saveindentinv(datatosaveinv) {
    $.ajax({
        url: InventoryWrapper + "/Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            Type: "Approve_Reject_Indent",
            IndentStatus: "Approve",
            indentdata: datatosaveinv,
        },
        success: function (data) {
            if (data.Status == 1) {
                showAlert(
                    $("#IndentList>.alertarea"),
                    "success",
                    "Success!",
                    "Indent Items Issued"
                );
                cleardatainv();
            } else {
                showAlert(
                    $("#IndentList>.alertarea"),
                    "danger",
                    "Failure!",
                    "Server Busy. Try after sometime"
                );
            }
            $("#modalViewIndent").modal("hide");
        },
        complete: function () {
            // getallindentlist();
            getallindentlist(0, Global_Level);
        },
    });
}

function rejectindentinv(datatosaveinv) {
    $.ajax({
        url: InventoryWrapper + "/Wrapper.php",
        type: "POST",
        dataType: "json",
        data: {
            Type: "Approve_Reject_Indent",
            IndentStatus: "Reject",
            indentdata: datatosaveinv,
        },
        success: function (data) {
            if (data.Status == 1) {
                showAlert(
                    $("#IndentList>.alertarea"),
                    "success",
                    "Success!",
                    "Indent Rejected"
                );
                cleardatainv();
            } else {
                showAlert(
                    $("#IndentList>.alertarea"),
                    "danger",
                    "Failure!",
                    "Server Busy. Try after sometime"
                );
            }
            $("#modalViewIndent").modal("hide");
        },
        complete: function () {
            // getallindentlist();
            getallindentlist(0, Global_Level);
        },
    });
}

//show Product History in table
function createproducthistorytable(data) {
    tablebody = $("#showproducthistory");
    tablebody.empty();
    for (i = 0; i < data.length; i++) {
        uom = data[i].uom;
        var tablerow = $("<tr class='maintr' id='trcstid-1'></tr>").appendTo(
            tablebody
        );
        $(
            "<td class='name'><div class='email'>" + data[i].trandate + "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name'><div class='email'>" + data[i].acctype + "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name'><div class='email'>" +
            data[i].costcenter +
            "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name'><div class='email'>" +
            $.trim(data[i].description) +
            "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name' align='right'><div class='email'>" +
            data[i].issuedqty +
            "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name' align='right'><div class='email'>" +
            data[i].receivedqty +
            "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name' align='right'><div class='email'>" +
            data[i].balanceqty +
            "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name' align='left'><div class='email'>" + uom + "</div></td>"
        ).appendTo(tablerow);
        closingstock = data[i].balanceqty;
    }
    var tablerow = $("<tr class='maintr' id='trcstid-1'></tr>").appendTo(
        tablebody
    );
    $("<td class='name'><div class='email'></div></td>").appendTo(tablerow);
    $("<td class='name'><div class='email'></div></td>").appendTo(tablerow);
    $("<td class='name'><div class='email'></div></td>").appendTo(tablerow);
    $("<td class='name'><div class='email'>Closing Stock</div></td>").appendTo(
        tablerow
    );
    $("<td class='name' align='right'><div class='email'></div></td>").appendTo(
        tablerow
    );
    $("<td class='name' align='right'><div class='email'></div></td>").appendTo(
        tablerow
    );
    $(
        "<td class='name' align='right'><div class='email'>" +
        closingstock +
        "</div></td>"
    ).appendTo(tablerow);
    $(
        "<td class='name' align='left'><div class='email'>" + uom + "</div></td>"
    ).appendTo(tablerow);
}

//show Stock Register in table
function createstockregistertable(data) {
    var tablebody = $("#showstockregister");
    tablebody.empty();
    for (i = 0; i < data.length; i++) {
        uom = data[i].uom;
        var tablerow = $("<tr class='maintr' id='trcstid-1'/>").appendTo(tablebody);
        $(
            "<td class='name'><div class='bulk'>" +
            data[i].productname +
            "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name' align='right'><div class='email'>" +
            data[i].openingstock +
            "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name' align='right'><div class='email'>" +
            data[i].receiptqty +
            "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name' align='right'><div class='email'>" +
            data[i].totalstock +
            "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name' align='right'><div class='email'>" +
            data[i].issueqty +
            "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name' align='right'><div class='email'>" +
            data[i].balanceqty +
            "</div></td>"
        ).appendTo(tablerow);
        $(
            "<td class='name' align='lef'><div class='email'>" + uom + "</div></td>"
        ).appendTo(tablerow);
    }
}

function cleardatainv() {
    $("#viewindenttran").empty();
}

function dismissAlert() {
    window.setTimeout(function () {
        $(".alert")
            .fadeTo(1000, 0)
            .slideUp(1000, function () {
                $(this).remove();
            });
    }, 5000);
}

function showAlert(container, alertType, strongText, msgText) {
    container.append(
        '<div class="alert alert-' +
        alertType +
        ' alert-dismissible fade show" role="alert"><strong>' +
        strongText +
        "</strong> " +
        msgText +
        ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>'
    );
    dismissAlert();
}

function matchCustom(params, data) {
    // If there are no search terms, return all of the data
    if ($.trim(params.term) === "") {
        return data;
    }

    // Do not display the item if there is no 'text' property
    if (typeof data.text === "undefined") {
        return null;
    }

    // `params.term` should be the term that is used for searching
    // `data.text` is the text that is displayed for the data object
    if (data.text.toUpperCase().indexOf(params.term.toUpperCase()) > -1) {
        var modifiedData = $.extend({}, data, true);
        modifiedData.text += " (matched)";

        // You can return modified objects from here
        // This includes matching the `children` how you want in nested data sets
        return modifiedData;
    }

    // Return `null` if the term should not be displayed
    return null;
}

function scrolltoTop() {
    window.parent.scrollTo(top);
}

function getDistricts() {
    var select_id = $("#cost_center_drpdwn");
    $.ajax({
        type: "POST",
        url: serverpath + "inventory_wrapper.php",
        dataType: "json",
        data: { req_type: "getDistricts" },
        success: function (res) {
            if (typeof res != "undefined" && res != null) {
                // console.log("res=>", res);
                $(select_id).empty();
                $("<option value='0'>Select District</option>").appendTo(select_id);
                const districts = res["data"]["districts"];
                for (let i in districts) {
                    $(
                        "<option value='" + districts[i] + "'>" + districts[i] + "</option>"
                    ).appendTo(select_id);
                }
            } else {
                emalert("Something went wrong! Please relod page!");
            }
        },
    });
}

function getDashboardData(export_flag = 0) {
    $.ajax({
        url: serverpath + "getDashboardData.php",
        type: "POST",
        dataType: "json",
        data: { export_flag: export_flag },
        success: function (data) {
            if (typeof data != "undefined") {
                if (export_flag) {
                    if (typeof data.filename != "undefined") {
                        window.location.href =
                            serverpath + "/download.php?f=" + data.filename;
                    }
                } else {
                    let tbody = $("#dashboard_tbody");
                    tbody.empty();
                    let SlNo = 1;

                    for (i in data) {
                        tablerow = $("<tr></tr>").appendTo(tbody);
                        $(
                            "<td>" +
                            SlNo +
                            "</td><td>" +
                            data[i].ProjectName +
                            "</td><td>" +
                            data[i].productcnt +
                            "</td><td>" +
                            convertAmoutToINR(parseFloat(data[i].totalcst).toFixed(2)) +
                            "</td><td>" +
                            data[i].allotcnt +
                            "</td><td>" +
                            convertAmoutToINR(parseFloat(data[i].allotcst).toFixed(2)) +
                            "</td><td>" +
                            data[i].unallotcnt +
                            "</td><td>" +
                            convertAmoutToINR(parseFloat(data[i].unallotcst).toFixed(2)) +
                            "</td><td>" +
                            convertAmoutToINR(
                                parseFloat(data[i].totalAmountReceived).toFixed(2)
                            ) +
                            "</td>"
                        ).appendTo(tablerow);
                        SlNo++;
                    }
                }
            } else {
                let tbody = $("#dashboard_tbody");
                tbody.empty();
                tablerow = $("<tr></tr>").appendTo(tbody);
                $('<td colspan="17">No data found!</td>').appendTo(tablerow);
            }
        },
    });
}

function changeToECommerceProperties() {
    $(".PONav").addClass("hidden");
    $("#navAddIndent").addClass("hidden");
    $("#navIndentlist").addClass("hidden");
    $("#Dashboard1").removeClass("hidden");
    $("#navInvTran a ").trigger("click");
    $(".ecom").show();
    selProject = $("#selProject");
    getprojects(selProject);

    $("#navStores a").text("Notifications");
    $("#navProductTypes a").text("Property Types");
    $("#navProducts a").text("Property");
    $("#navSuppliers a").text("Customers");
    $("#navCostCenters a").text("District");

    $(".trans_store").text("Notification No");
    $(".trans_product").text("Property");
    $(".lblcostcenter").text("Select District");
    $("#cbxfilcostcenter").find("option:selected").text("Select a District");
    $(".lblcbxfilproduct").text("Select a Property");
    $("#cbxfilproduct").find("option:selected").text("Select a Property");
    $(".ECfiltrantypelablehide").hide();
    $(".lbltranstu").text("Customer");

    //add transaction lables
    $("#btnshowfilters").hide();
    $(".customer").text("Customer");
    // $('#lblprependCC').text('District');
    $("#cbxcostcenter").find("option:selected").text("Select a District");
    $(".trans_productname").text("Project Name");
    $(".transHideRbtn").hide();
    $("#radSales").attr("checked", true);
    $("#radIssue").attr("checked", false);

    //reports labels
    $("#navProductHistory a").text("Property History");
    $(".lblrptproduct").text("Select a Property");
    $("#cbxrptproduct").find("option:selected").text("Select a Property");
    $(".CC").text("District");

    //store label changes to notification
    $(".store").text("Notification");
    $(".btnaddstr").text("Add a Notification");
    $("label[for='txtstorename']").text("Notification No");
    $("#txtstorename").attr("placeholder", "Enter Notification No");
    $(".storeColHide").hide();
    $(".store_name").text("Notification No");
    $(".hidestrcol").hide();

    //Product type label changes to Property type
    $(".Product_Type").text("Property Type");
    $("#add_product_type_btn").text("Add Property Type");
    $(".product_type_name").text("Property Type Name");
    $(".product_type_desc").text("Property Type Description");
    $("#product_type_name").attr("placeholder", "Enter property type name");
    $("#product_type_description").attr(
        "placeholder",
        "Enter property type description"
    );
    $("#lblassetno").text("Property No.");
    $("#product_asset_no").attr("placeholder", "Enter Property No.");
    //Product changes to Property
    $(".Products").text("Property");
    $(".lblProdName").text("Property Name");
    $(".prodDesc").text("Property Description");
    $("#add_product_btn").text("Add Property");
    $("#filter_input").attr("placeholder", "Search by Property Name");
    $("#product_name").attr("placeholder", "Enter property name");
    $("#product_description").attr("placeholder", "Enter Property description");
    $("label[for='product_type_select']").text("Property Type");

    //Supplier Changes to Customer
    $(".supplier").text("Customer");
    $("#add_supplier").text("Add a Customer");
    $(".customerHiderdbtn").hide();
    $("label[for='supp_type_2']").text("Customer");
    $("#supp_type_2").attr("checked", true);
    $("#supp_name").attr("placeholder", "Enter Customer name");

    //Cost Center label changes to District
    $(".lblCC").text("District");
    $("#add_cost_center_btn").text("Add a District");
    $(".CCName").text("District Name");
    $(".StoreName").text("Notification No");
    $("label[for='cbxstores']").text("Notification");
}

function getProjectDetails(project_id, export_flag = 0) {
    if (project_id == 0 || project_id == -1) {
        emalert("Please select Project");
        return false;
    }
    $.ajax({
        url: serverpath + "getProjectDetailsData.php",
        type: "POST",
        dataType: "json",
        data: { project_id: project_id, export_flag: export_flag },
        success: function (data) {
            if (typeof data != "undefined") {
                if (export_flag) {
                    if (typeof data.filename != "undefined") {
                        window.location.href =
                            serverpath + "/download.php?f=" + data.filename;
                    }
                } else {
                    let tbody = $("#projectdetails_tbody");
                    tbody.empty();
                    let SlNo = 1;
                    let payment_info_cell = "";
                    if (data.length > 0) {
                        for (i in data) {
                            
                            if (data[i]["PaymentInfo"].length > 0) {
                                let PaymentInfo = data[i]["PaymentInfo"];
                                payment_info_array = [];
                                for (let j in PaymentInfo) {
                                    payment_info_array.push(`
                                    <b>Amount(${parseInt(j) + 1
                                        }): </b> ${convertAmoutToINR(
                                            PaymentInfo[j]["Amount"]
                                        )} <br/>
                                    <b>Payment ID(${parseInt(j) + 1}): </b> ${PaymentInfo[j]["MihPayID"]
                                        } <br/>
                                    <b>Date(${parseInt(j) + 1}): </b> ${PaymentInfo[j]["TranStartDate"]
                                        } <br/>`);
                                }
                                payment_info_cell = payment_info_array.join("<hr/>");
                            } else {
                                payment_info_cell = "--";
                            }
                            tablerow = $("<tr></tr>").appendTo(tbody);
                            $(
                                "<td>" +
                                SlNo +
                                "</td><td>" +
                                data[i].District +
                                "</td><td>" +
                                data[i].ProjectName +
                                "</td><td>" +
                                data[i].PropertyName +
                                "</td><td>" +
                                data[i].PropertyType +
                                "</td><td>" +
                                data[i].Category +
                                "</td><td>" +
                                data[i].AllotmentDate +
                                "</td><td>" +
                                data[i].Fname +
                                "</td><td>" +
                                data[i].ApplicantNo +
                                "</td><td>" +
                                convertAmoutToINR(data[i].RefAmount) +
                                "</td><td>" +
                                convertAmoutToINR(data[i].cost) +
                                "</td><td>" +
                                convertAmoutToINR(data[i].IdAmount) +
                                "</td><td>" +
                                convertAmoutToINR(data[i].instalmentpayable) +
                                "</td><td>" +
                                convertAmoutToINR(data[i].instalmentamountpaid) +
                                "</td><td>" +
                                payment_info_cell +
                                "</td><td>" +
                                convertAmoutToINR(data[i].Balance) +
                                "</td>"
                            ).appendTo(tablerow);
                            SlNo++;
                        }
                    } else {
                        tablerow = $("<tr></tr>").appendTo(tbody);
                        $(
                            '<td colspan="18" style="text-align:center !important">No data Found!</td>'
                        ).appendTo(tablerow);
                    }
                }
            }
        },
    });
}

function getallstaffsforauthority() {
    var branchid = 0;
    var branches_available = global_showbranches;
    // if (global_showbranches == 1) {
    //     branchid = $("#cbxstorebranch").val();
    // }
    $.ajax({
        type: "POST",
        url: serverpath + "getallstaffs.php",
        dataType: "json",
        data: { branchid: branchid, branches_available: branches_available },
        success: function (data) {
            if (typeof data != "undefined") {
                var selauthority = $(".select_auth_staff");
                selauthority.empty();
                $("<option value='0'>Select Staff/Staffs</option>").appendTo(
                    selauthority
                );
                for (i in data) {
                    var opt = $(
                        "<option value='" +
                        data[i].EMUniqueId +
                        "'>" +
                        data[i].Fname +
                        "</option>"
                    ).appendTo(selauthority);
                    opt.data({ EsakStaffId: data[i].EsakStaffId });
                }
            }
        },
    });
}

function saveauthdata(currentlevel, addedlevel, branchid, staffid) {
    $.ajax({
        type: "POST",
        url: serverpath + "inventory_wrapper.php",
        dataType: "json",
        data: {
            req_type: "saveauthdata",
            currentlevel: currentlevel,
            addedlevel: addedlevel,
            branchid: branchid,
            staffid: staffid,
        },
        success: function (data) {
            if (data == "insert") {
                emsuccess("Data Saved");
                $("#close_grant_authority_modal").click();
                get_grant_authority();
            } else if (data == "update") {
                emsuccess("Data Updated");
                $("#close_grant_authority_modal").click();
                get_grant_authority();
            } else {
                emalert("Something went wrong, Please try again!");
            }
        },
    });
}

function get_grant_authority() {
    $.ajax({
        type: "POST",
        url: serverpath + "inventory_wrapper.php",
        data: { req_type: "getgrantedauthority" },
        dataType: "json",
        success: function (data) {
            if (typeof data != "undefined" && data != null) {
                let slno = 1;
                $("#grant_inventory_table").empty();
                for (let i in data) {
                    // let table_row = $("<tr><td>" + (slno++) + "</td><td class='inventlevel'>" + data[i].level + "</td><td>" + data[i].Fname + "</td><td>" + data[i].creator_emId + "</td></tr>").appendTo("#grant_inventory_table");
                    let table_row = $(
                        "<tr><td>" +
                        slno++ +
                        "</td><td class='inventlevel'>" +
                        data[i].level +
                        "</td><td>" +
                        data[i].Fname +
                        "</td><td>" +
                        data[i].creator_emId +
                        "</td><td><button type='button' title='Edit' class='btn btn-primary grant_authority' data-role='none' data-toggle='modal' data-target='#grant_authority_modal'><i class='fa fa-pencil' aria-hidden='true'></i></button></td></tr>"
                    ).appendTo("#grant_inventory_table");
                    table_row.data({
                        level: data[i].level,
                        Fname: data[i].Fname,
                    });
                }
            }
        },
    });
}

function showselectedstaff(level, staffid) {
    var staffarray = [];

    var branchid = 0;
    // if (global_showbranches == 1) {
    //     branchid = $("#cbxstorebranch").val();
    // }
    var branches_available = global_showbranches;
    $.ajax({
        type: "POST",
        url: serverpath + "getallstaffs.php",
        dataType: "json",
        data: { branchid: branchid, branches_available: branches_available },
        success: function (data) {
            if (typeof data != "undefined") {
                staffarray = staffid;

                var selauthority = $("#select_auth_staff_" + level);

                selauthority.empty();
                $("<option value='0'>Select Staff/Staffs</option>").appendTo(
                    selauthority
                );
                for (i in data) {
                    if (staffarray.includes(data[i].EMUniqueId)) {
                        var opt = $(
                            "<option value='" +
                            data[i].EMUniqueId +
                            "' selected>" +
                            data[i].Fname +
                            "</option>"
                        ).appendTo(selauthority);
                        opt.data({ EsakStaffId: data[i].EsakStaffId });
                    } else {
                        var opt = $(
                            "<option value='" +
                            data[i].EMUniqueId +
                            "'>" +
                            data[i].Fname +
                            "</option>"
                        ).appendTo(selauthority);
                        opt.data({ EsakStaffId: data[i].EsakStaffId });
                    }
                }
            }
        },
    });
}

function getgrantedauthority() {
    let level = 0;
    let temp = 0;
    let slno = 1;
    var appendDiv = $(".authoritymodal");
    $.ajax({
        type: "post",
        url: serverpath + "inventory_wrapper.php",
        data: { req_type: "getgrantedauthority" },
        dataType: "json",
        success: function (data) {
            if (data.length != 0) {
                appendDiv.empty();
                for (let i in data) {
                    temp = 1;
                    level += temp;
                    $(
                        '<label for="cbxauthoritystaff">Level : ' +
                        data[i].level +
                        '</label><br /><select multiple style="width:100%" id="select_auth_staff_' +
                        data[i].level +
                        '" class="form-control select_auth_staff"></select>'
                    ).appendTo(appendDiv);
                    $("#select_auth_staff_" + data[i].level).select2();
                    $("#cbxstorebranch").select2();
                    showselectedstaff(data[i].level, data[i].EMUniqueId);
                }

                $("#txtautholevel").val(level);
                $("#addedlevel").val(level);
            }
        },
    });
}

function get_rem_staff(staffid, eleID) {
    var branchid = 0;
    var level = $("#txtautholevel").val();
    // if (global_showbranches == 1) {
    //     branchid = $("#cbxstorebranch").val();
    // }
    var branches_available = global_showbranches;
    $.ajax({
        type: "POST",
        url: serverpath + "inventory_wrapper.php",
        dataType: "json",
        data: {
            req_type: "getremstaffs",
            branchid: branchid,
            staffid: staffid,
            branches_available: branches_available,
        },
        success: function (data) {
            if (typeof data != "undefined") {
                for (var j = eleID; j <= level; j++) {
                    var selauthority = $("#select_auth_staff_" + j);
                    selauthority.empty();
                    $("<option value='0'>Select Staff/Staffs</option>").appendTo(
                        selauthority
                    );
                    for (i in data) {
                        var opt = $(
                            "<option value='" +
                            data[i].EMUniqueId +
                            "'>" +
                            data[i].Fname +
                            "</option>"
                        ).appendTo(selauthority);
                        opt.data({ EsakStaffId: data[i].EsakStaffId });
                    }
                }
            }
        },
    });
}

function convertAmoutToINR(x) {
    // var x=12345652457.557;
    x = x.toString();
    var afterPoint = "";
    if (x.indexOf(".") > 0) afterPoint = x.substring(x.indexOf("."), x.length);
    x = Math.floor(x);
    x = x.toString();
    var lastThree = x.substring(x.length - 3);
    var otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers != "") lastThree = "," + lastThree;
    var res =
        otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;

    // alert(res);
    return res;
}

function convertNumberToINR(number) {
    let res = number;
    if (!isNaN(number)) {
        res = number.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
            style: "currency",
            currency: "INR",
        });
    }
    return res;
}

function getDateTime() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    if (month.toString().length == 1) {
        month = "0" + month;
    }
    if (day.toString().length == 1) {
        day = "0" + day;
    }
    if (hour.toString().length == 1) {
        hour = "0" + hour;
    }
    if (minute.toString().length == 1) {
        minute = "0" + minute;
    }
    if (second.toString().length == 1) {
        second = "0" + second;
    }
    var dateTime =
        year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
    return dateTime;
}
