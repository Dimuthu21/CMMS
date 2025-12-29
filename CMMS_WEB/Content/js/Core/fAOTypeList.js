const navigationMenuName = "FAOType";
const currentCompanyId = $("#CurrentCompanyId").val();
const currentBranchId = $("#CurrentBranchId").val();

var tblDetails;
$(document).ready(function () {
    FilterFAOTypeList();
});

// delegated handler for details-control toggle
$(document).on('click', '#tblDetails tbody .details-control', function (e) {
    let tr = $(this).closest('tr')[0];
    if (!tblDetails) return;
    let row = tblDetails.row(tr);

    if (row.child.isShown()) {
        row.child.hide();
        $(tr).find("img[name='imgShowHide']").attr('src', $("#imgTableDetailOpen").val());
    }
    else {
        row.child(formatDetails(row.data())).show();
        $(tr).find("img[name='imgShowHide']").attr('src', $("#imgTableDetailClose").val());
    }
});

// delegated handler for row double-click (or single click on mobile)
$(document).on('dblclick', '#tblDetails tbody tr', function (e) {
    var dataTableClickEvent = 'dblclick';
    if (IsMobileDeviceBrowsing()) dataTableClickEvent = 'click';

    // if mobile and triggered by responsive control, ignore
    if (IsMobileDeviceBrowsing() && $(e.target).closest('td').hasClass('dtr-control')) {
        return;
    }

    if (!tblDetails) return;
    var data = tblDetails.row(this).data();
    if (!data) return;
    OpenResourceUrl($("#ViewFAOTypeUrl").val() + "/" + data.FAOTypeId, null, null);
});

function ClearFAOTypeListFilter() {
    $("#Code").val('');
    $("#Name").val('');
    $("#StatusId").val('').trigger('change');

    FilterFAOTypeList();
}

function ValidateFAOTypeListFilter() {
    var result = true;
    // list filter validations if exists any
    return result;
}

function FilterFAOTypeList() {
    if (ValidateFAOTypeListFilter()) {
        var currentFilter = {
            "Code": $("#Code").val(),
            "Name": $("#Name").val(),
            "StatusId": $("#StatusId").val(),
            "CompanyId": currentCompanyId,
            "BranchId": currentBranchId
        }

        // destroy existing table if exists
        if ($.fn.DataTable.isDataTable('#tblDetails')) {
            try {
                $('#tblDetails').DataTable().clear().destroy();
            } catch (e) { }
        }

        tblDetails = $("#tblDetails").DataTable({
            "serverSide": true,
            "processing": false,
            deferRender: true,
            "bPaginate": true,
            "bLengthChange": true,
            "bFilter": false,
            "bInfo": true,
            "bAutoWidth": false,
            "ordering": false,
            "bSortClasses": true,
            "bDestroy": true,
            "iDisplayLength": 10,
            responsive: false,
            scrollX: true,
            scrollCollapse: true,
            "columnDefs": [
                { targets: '_all', className: 'dt-left' },
                { targets: [8], visible: false }
            ],
            ajax: function (data, callback, s) {
                var ajaxData = {
                    draw: data.draw,
                    start: data.start,
                    length: data.length,
                    search: data.search,
                    Code: currentFilter.Code,
                    Name: currentFilter.Name,
                    StatusId: currentFilter.StatusId,
                    CompanyId: currentFilter.CompanyId,
                    BranchId: currentFilter.BranchId,
                }

                $.ajax({
                    url: $("#BrowseFAOTypeListUrl").val(),
                    type: "POST",
                    contentType: "application/json",
                    dataType: 'json',
                    data: JSON.stringify(ajaxData),
                    headers: {
                        "RequestVerificationToken": $('input[name="__RequestVerificationToken"]').val()
                    },
                    beforeSend: function () {
                        $('#tblDetailsOverlay').css('display', 'flex');
                    },
                    success: function (result) {
                        if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                            callback(result);
                            $('#tblDetailsOverlay').css('display', 'none');
                            var enableDisableInput = result.data.length == 0 ? "disabled='disabled'" : "";
                            $("#tblDetails_wrapper .dataTables_paginate .pagination").append("<li class='paginate_button'><input class='form-control input input-text no-autofill' autocomplete='off' placeholder='Page No' style='width:90px' name='tblInputPaging' onkeyup='DataTablePagingKeyUp(this)' type='text' " + enableDisableInput + "></li>");

                            setTimeout(function () {
                                tblDetails.columns.adjust();
                            }, 150);
                        } else {
                            handleFAOTypeListLoadFailure(null)
                        }
                    },
                    error: function (e) {
                        handleFAOTypeListLoadFailure(null)
                    }
                });
            },
            "columns": [
                { "data": "Code" },
                { "data": "Name" },
                { "data": "Description" },
                { "data": "StatusName" },
                { "data": "CreatedBy" },
                { "data": "CreatedDateStr" },
                {
                    "data": "UpdatedBy",
                    "render": function (data, row) {
                        return (data || 'N/A');
                    },
                },
                {
                    "data": "UpdatedDateStr",
                    "render": function (data, row) {
                        return (data || 'N/A');
                    },
                },
                { "data": "FAOTypeId" },
            ]
        });

        $("#tblDetails_wrapper .dataTables_scroll").css("overflow-x", "auto");
    }
}

function handleFAOTypeListLoadFailure(ex) {
    if (ex != null) console.log(ex);
    $('#tblDetailsOverlay').css('display', 'none');
    DisplayUserActionAlert(Alert_Action_Enum.View, Alert_Type_Enum.Danger, null, "An error occurred while loading FAO type list.", null, null, null)
}
