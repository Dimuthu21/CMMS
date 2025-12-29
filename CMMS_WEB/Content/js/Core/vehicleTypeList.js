const navigationMenuName = "VehicleType";
const currentCompanyId = $("#CurrentCompanyId").val();
const currentBranchId = $("#CurrentBranchId").val();

var tblDetails
$(document).ready(function () {
    FilterVehicleTypeList();

    tblDetails.on('click', '.details-control', function (e) {
        let tr = e.target.closest('tr');
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

    var dataTableClickEvent = 'dblclick';
    if (IsMobileDeviceBrowsing()) dataTableClickEvent = 'click';
    tblDetails.on(dataTableClickEvent, 'tr', function (e) {
        if (IsMobileDeviceBrowsing() && $(e.target).closest('td').hasClass('dtr-control')) {
            return;
        }

        var data = tblDetails.row(this).data();
        if (!data) return;
        OpenResourceUrl($("#ViewVehicleTypeUrl").val() + "/" + data.VehicleTypeId, null, null);
    });
});

function ClearVehicleTypeListFilter() {
    $("#Code").val('');
    $("#Name").val('');
    $("#StatusId").val('').trigger('change');

    FilterVehicleTypeList();
}

function ValidateVehicleTypeListFilter() {
    var result = true;

    // list filter validations if exists any

    return result;
}

function FilterVehicleTypeList() {

    if (ValidateVehicleTypeListFilter()) {

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
            // disable responsive collapsing so DataTables won't convert columns to child rows
            responsive: false,
            // enable horizontal scrolling when table width exceeds container
            scrollX: true,
            scrollCollapse: true,
            "columnDefs": [
                { targets: '_all', className: 'dt-left' },
                { targets: [8], visible: false }
            ],
            //dom: 'lfrtip',
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

                ajax =
                    $.ajax({
                        url: $("#BrowseVehicleTypeListUrl").val(),
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
                                handleVehicleTypeListLoadFailure(null)
                            }
                        },
                        error: function (e) {
                            handleVehicleTypeListLoadFailure(null)
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
                { "data": "VehicleTypeId" },
            ]
        });

        $("#tblDetails_wrapper .dataTables_scroll").css("overflow-x", "auto");
    }
}


function handleVehicleTypeListLoadFailure(ex) {
    if (ex != null) console.log(ex);
    $('#tblDetailsOverlay').css('display', 'none');
    DisplayUserActionAlert(Alert_Action_Enum.View, Alert_Type_Enum.Danger, null, "An error occurred while loading vehicle type list.", null, null, null)
}