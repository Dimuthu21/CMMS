const navigationMenuName = "UOMGroup";
const currentCompanyId = $("#CurrentCompanyId").val();
const currentBranchId = $("#CurrentBranchId").val();

var tblDetails;
$(document).ready(function () {
    FilterUOMGroupList();

    var dataTableClickEvent = 'dblclick';
    if (IsMobileDeviceBrowsing()) dataTableClickEvent = 'click';
    $(document).on(dataTableClickEvent, '#tblDetails tr', function (e) {
        if (IsMobileDeviceBrowsing() && $(e.target).closest('td').hasClass('dtr-control')) {
            return;
        }

        if (!tblDetails) return;
        var data = tblDetails.row(this).data();
        if (!data) return;
        OpenResourceUrl($("#ViewUOMGroupUrl").val() + "/" + data.UOMGroupId, null, null);
    });
});

function ClearUOMGroupListFilter() {
    $("#Code").val('');
    $("#Name").val('');
    $("#StatusId").val('').trigger('change');

    FilterUOMGroupList();
}

function ValidateUOMGroupListFilter() {
    var result = true;
    // list filter validations if exists any
    return result;
}

function FilterUOMGroupList() {
    if (ValidateUOMGroupListFilter()) {
        var currentFilter = {
            "Code": $("#Code").val(),
            "Name": $("#Name").val(),
            "StatusId": $("#StatusId").val(),
            "CompanyId": currentCompanyId,
            "BranchId": currentBranchId
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
                    url: $("#BrowseUOMGroupListUrl").val(),
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
                            handleUOMGroupListLoadFailure(null)
                        }
                    },
                    error: function (e) {
                        handleUOMGroupListLoadFailure(null)
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
                { "data": "UOMGroupId" },
            ]
        });

        $("#tblDetails_wrapper .dataTables_scroll").css("overflow-x", "auto");
    }
}

function handleUOMGroupListLoadFailure(ex) {
    if (ex != null) console.log(ex);
    $('#tblDetailsOverlay').css('display', 'none');
    DisplayUserActionAlert(Alert_Action_Enum.View, Alert_Type_Enum.Danger, null, "An error occurred while loading uom group list.", null, null, null)
}

function formatDetails(d) {
    var html = '<div style="padding:10px 30px">';
    html += '<div><strong>Code:</strong> ' + (d.Code || 'N/A') + '</div>';
    html += '<div><strong>Name:</strong> ' + (d.Name || 'N/A') + '</div>';
    html += '<div><strong>Description:</strong> ' + (d.Description || 'N/A') + '</div>';
    html += '</div>';
    return html;
}
