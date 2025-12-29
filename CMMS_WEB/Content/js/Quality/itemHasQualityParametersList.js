const currentCompanyId = $("#CurrentCompanyId").val();
const currentBranchId = $("#CurrentBranchId").val();

var tblDetails;
$(document).ready(function () {
    FilterIHQPList();
});

function ClearIHQPListFilter() {
    $("#Code").val('');
    $("#Name").val('');
    $("#ItemCategoryId").val('').trigger('change');
    $("#StatusId").val('').trigger('change');
    FilterIHQPList();
}

function ValidateIHQPListFilter() { return true; }

function FilterIHQPList() {
    if (!ValidateIHQPListFilter()) return;

    var currentFilter = {
        "Code": $("#Code").val(),
        "Name": $("#Name").val(),
        "ItemCategoryId": $("#ItemCategoryId").val(),
        "StatusId": $("#StatusId").val(),
        "CompanyId": currentCompanyId,
        "BranchId": currentBranchId
    };

    tblDetails = $("#tblDetails").DataTable({
        serverSide: true,
        processing: false,
        deferRender: true,
        bPaginate: true,
        bLengthChange: true,
        bFilter: false,
        bInfo: true,
        bAutoWidth: false,
        ordering: false,
        bSortClasses: true,
        bDestroy: true,
        iDisplayLength: 10,
        responsive: false,
        scrollX: true,
        scrollCollapse: true,
        columnDefs: [
            { targets: '_all', className: 'dt-left' },
            { targets: [9], visible: false }
        ],
        ajax: function (data, callback, s) {
            var ajaxData = {
                draw: data.draw,
                start: data.start,
                length: data.length,
                search: data.search,
                Code: currentFilter.Code,
                Name: currentFilter.Name,
                ItemCategoryId: currentFilter.ItemCategoryId,
                StatusId: currentFilter.StatusId,
                CompanyId: currentFilter.CompanyId,
                BranchId: currentFilter.BranchId
            };

            $.ajax({
                url: $("#BrowseItemHasQualityParametersListUrl").val(),
                type: "POST",
                contentType: "application/json",
                dataType: 'json',
                data: JSON.stringify(ajaxData),
                headers: {
                    "RequestVerificationToken": $('input[name="__RequestVerificationToken"]').val()
                },
                beforeSend: function () { $('#tblDetailsOverlay').css('display', 'flex'); },
                success: function (result) {
                    if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                        callback(result);
                        $('#tblDetailsOverlay').css('display', 'none');
                        var enableDisableInput = result.data.length == 0 ? "disabled='disabled'" : "";
                        $("#tblDetails_wrapper .dataTables_paginate .pagination").append("<li class='paginate_button'><input class='form-control input input-text no-autofill' autocomplete='off' placeholder='Page No' style='width:90px' name='tblInputPaging' onkeyup='DataTablePagingKeyUp(this)' type='text' " + enableDisableInput + "></li>");
                        setTimeout(function () { tblDetails.columns.adjust(); }, 150);
                    } else {
                        handleIHQPListLoadFailure(null)
                    }
                },
                error: function (e) { handleIHQPListLoadFailure(null) }
            });
        },
        columns: [
            { data: "Code" },
            { data: "Name" },
            { data: "ItemCategoryName" },
            { data: "TotalAssignedParameters" },
            { data: "StatusName" },
            { data: "CreatedBy" },
            { data: "CreatedDateStr" },
            { data: "UpdatedBy", render: function (data) { return (data || 'N/A'); } },
            { data: "UpdatedDateStr", render: function (data) { return (data || 'N/A'); } },
            { data: "ItemId" }
        ]
    });

    $("#tblDetails_wrapper .dataTables_scroll").css("overflow-x", "auto");
}

function handleIHQPListLoadFailure(ex) {
    if (ex != null) console.log(ex);
    $('#tblDetailsOverlay').css('display', 'none');
    DisplayUserActionAlert(Alert_Action_Enum.View, Alert_Type_Enum.Danger, null, "An error occurred while loading list.", null, null, null)
}
