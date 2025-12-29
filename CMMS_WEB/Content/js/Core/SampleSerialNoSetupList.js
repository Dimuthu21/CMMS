const navigationMenuName = "SampleSerialNoSetup";
const currentCompanyId = $("#CurrentCompanyId").val();
const currentBranchId = $("#CurrentBranchId").val();

var tblDetails;
$(document).ready(function () {
    FilterSampleSerialNoSetupList();

    var dataTableClickEvent = 'dblclick';
    if (IsMobileDeviceBrowsing()) dataTableClickEvent = 'click';
    $(document).on(dataTableClickEvent, '#tblDetails tbody tr', function (e) {
        if (IsMobileDeviceBrowsing() && $(e.target).closest('td').hasClass('dtr-control')) {
            return;
        }

        var data = tblDetails.row(this).data();
        if (!data) return;
        OpenResourceUrl($("#ViewSampleSerialNoSetupUrl").val() + "/" + data.SampleSerialNoSetupId, null, null);
    });
});

function ClearSampleSerialNoSetupListFilter() {
    $("#FunctionId").val('').trigger('change');
    $("#StatusId").val('').trigger('change');

    FilterSampleSerialNoSetupList();
}

function ValidateSampleSerialNoSetupListFilter() {
    var result = true;
    // list filter validations if exists any
    return result;
}

function FilterSampleSerialNoSetupList() {
    if (ValidateSampleSerialNoSetupListFilter()) {
        var currentFilter = {
            "FunctionId": $("#FunctionId").val(),
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
                    FunctionId: currentFilter.FunctionId,
                    StatusId: currentFilter.StatusId,
                    CompanyId: currentFilter.CompanyId,
                    BranchId: currentFilter.BranchId,
                }

                $.ajax({
                    url: $("#BrowseSampleSerialNoSetupListUrl").val(),
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
                            handleSampleSerialNoSetupListLoadFailure(null)
                        }
                    },
                    error: function (e) {
                        handleSampleSerialNoSetupListLoadFailure(null)
                    }
                });
            },
            "columns": [
                { "data": "FunctionName" },
                { "data": "Prefix" },
                { "data": "Suffix" },
                { "data": "CurrentIndex" },
                { "data": "PrefixNumberFormat" },
                { "data": "StatusName" },
                { "data": "CreatedBy" },
                { "data": "CreatedDateStr" },
                { "data": "SampleSerialNoSetupId" },
            ]
        });

        $("#tblDetails_wrapper .dataTables_scroll").css("overflow-x", "auto");
    }
}

function handleSampleSerialNoSetupListLoadFailure(ex) {
    if (ex != null) console.log(ex);
    $('#tblDetailsOverlay').css('display', 'none');
    DisplayUserActionAlert(Alert_Action_Enum.View, Alert_Type_Enum.Danger, null, "An error occurred while loading serial setup list.", null, null, null)
}
