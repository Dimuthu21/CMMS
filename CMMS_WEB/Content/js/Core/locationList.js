const navigationMenuName = "Location";
const currentCompanyId = $("#CurrentCompanyId").val();
const currentBranchId = $("#CurrentBranchId").val();

var tblDetails;
$(document).ready(function () {
    FilterLocationList();

    var dataTableClickEvent = 'dblclick';
    if (IsMobileDeviceBrowsing()) dataTableClickEvent = 'click';
    $(document).on(dataTableClickEvent, '#tblDetails tr', function (e) {
        if (IsMobileDeviceBrowsing() && $(e.target).closest('td').hasClass('dtr-control')) {
            return;
        }

        if (!tblDetails) return;
        var data = tblDetails.row(this).data();
        if (!data) return;
        OpenResourceUrl($("#ViewLocationUrl").val() + "/" + data.LocationId, null, null);
    });
});

function ClearLocationListFilter() {
    $("#Code").val('');
    $("#Name").val('');
    $("#StatusId").val('').trigger('change');

    FilterLocationList();
}

function ValidateLocationListFilter() {
    var result = true;
    // list filter validations if exists any
    return result;
}

function FilterLocationList() {
    if (ValidateLocationListFilter()) {
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
                { targets: '_all', className: 'dt-left' }
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
                    url: $("#BrowseLocationListUrl").val(),
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
                            // ensure data items have expected properties
                            result.data = (result.data || []).map(function (d) {
                                return {
                                    Code: d.Code || '',
                                    Name: d.Name || '',
                                    Description: d.Description || '',
                                    StatusName: d.StatusName || '',
                                    CreatedBy: d.CreatedBy || 'N/A',
                                    CreatedDateStr: d.CreatedDateStr || 'N/A',
                                    UpdatedBy: d.UpdatedBy || 'N/A',
                                    UpdatedDateStr: d.UpdatedDateStr || 'N/A',
                                    LocationId: d.LocationId || ''
                                };
                            });

                            callback(result);
                            $('#tblDetailsOverlay').css('display', 'none');
                            var enableDisableInput = result.data.length == 0 ? "disabled='disabled'" : "";
                            $("#tblDetails_wrapper .dataTables_paginate .pagination").append("<li class='paginate_button'><input class='form-control input input-text no-autofill' autocomplete='off' placeholder='Page No' style='width:90px' name='tblInputPaging' onkeyup='DataTablePagingKeyUp(this)' type='text' " + enableDisableInput + "></li>");

                            setTimeout(function () {
                                tblDetails.columns.adjust();
                            }, 150);
                        } else {
                            handleLocationListLoadFailure(null)
                        }
                    },
                    error: function (e) {
                        handleLocationListLoadFailure(null)
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
                { "data": "LocationId", "visible": false }
            ]
        });

        $("#tblDetails_wrapper .dataTables_scroll").css("overflow-x", "auto");
    }
}

function handleLocationListLoadFailure(ex) {
    if (ex != null) console.log(ex);
    $('#tblDetailsOverlay').css('display', 'none');
    DisplayUserActionAlert(Alert_Action_Enum.View, Alert_Type_Enum.Danger, null, "An error occurred while loading location list.", null, null, null)
}

function formatDetails(d) {
    var html = '<div style="padding:10px 30px">';
    html += '<div><strong>Code:</strong> ' + (d.Code || 'N/A') + '</div>';
    html += '<div><strong>Name:</strong> ' + (d.Name || 'N/A') + '</div>';
    html += '<div><strong>Description:</strong> ' + (d.Description || 'N/A') + '</div>';
    html += '</div>';
    return html;
}
