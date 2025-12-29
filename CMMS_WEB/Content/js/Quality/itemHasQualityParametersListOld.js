var ihqp_tbl;
$(document).ready(function () {
    loadIHQPList();

    var dataTableClickEvent = 'dblclick';
    if (IsMobileDeviceBrowsing()) dataTableClickEvent = 'click';
    $('#tblDetails').on(dataTableClickEvent, 'tr', function (e) {
        if (IsMobileDeviceBrowsing() && $(e.target).closest('td').hasClass('dtr-control')) {
            return;
        }
        var data = ihqp_tbl.row(this).data();
        if (!data) return;
        OpenResourceUrl($("#ViewItemHasQualityParametersUrl").val() + "/" + data.ItemId, null, null);
    });
});

function loadIHQPList() {
    ihqp_tbl = $("#tblDetails").DataTable({
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
        ajax: function (data, callback, s) {
            var ajaxData = {
                draw: data.draw,
                start: data.start,
                length: data.length,
                search: data.search,
                Code: null,
                Name: null,
                StatusId: null
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
                success: function (result) {
                    if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                        callback(result);
                    } else {
                        callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
                    }
                },
                error: function (e) {
                    callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
                }
            });
        },
        columns: [
            { data: "FunctionName", defaultContent: '' },
            { data: "Code" },
            { data: "Name" },
            { data: "TotalAssignedParameters" },
            { data: "CreatedBy" },
            { data: "CreatedDateStr" }
        ]
    });
}

function FilterIHQPListOld() {
    if (ihqp_tbl) ihqp_tbl.ajax.reload();
}

function ClearIHQPListOld() {
    if (ihqp_tbl) ihqp_tbl.ajax.reload();
}
