(function () {
    const navigationMenuName = "QualityRequest";
    const currentCompanyId = $("#CurrentCompanyId").val();
    const currentBranchId = $("#CurrentBranchId").val();

    // Approval-like enum mapping: 1=Pending, 2=Approved, 3=Rejected
    const ApprovalStatusEnum = Object.freeze({ Pending: 1, Approved: 2, Rejected: 3 });
    const ApprovalStatusTextById = Object.freeze({ 1: 'Pending', 2: 'Approved', 3: 'Rejected' });
    function getApprovalText(valOrName) {
        if (valOrName == null || valOrName === '') return null;
        if (typeof valOrName === 'number') return ApprovalStatusTextById[valOrName] || null;
        const s = String(valOrName).toLowerCase();
        if (s === '1' || s === 'pending') return 'Pending';
        if (s === '2' || s === 'approved') return 'Approved';
        if (s === '3' || s === 'rejected') return 'Rejected';
        return null;
    }

    var tblDetails;
    $(document).ready(function () {
        FilterQualityRequestList();

        var dataTableClickEvent = IsMobileDeviceBrowsing() ? 'click' : 'dblclick';
        $(document).on(dataTableClickEvent, '#tblDetails tbody tr', function (e) {
            if (IsMobileDeviceBrowsing() && $(e.target).closest('td').hasClass('dtr-control')) {
                return;
            }
            var data = tblDetails.row(this).data();
            if (!data) return;
            var viewUrl = $("#ViewQualityRequestUrl").val();
            if (viewUrl) {
                OpenResourceUrl(viewUrl + "/" + data.QualityRequestId, null, null);
            }
        });
    });

    function ClearQualityRequestListFilter() {
        $("#FromDate").val('');
        $("#ToDate").val('');
        $("#RequestNo").val('');
        $("#FunctionId").val('').trigger('change');
        $("#StatusId").val('').trigger('change');

        FilterQualityRequestList();
    }

    function ValidateQualityRequestListFilter() { return true; }

    function FilterQualityRequestList() {
        if (!ValidateQualityRequestListFilter()) return;

        var currentFilter = {
            "RequestNo": $("#RequestNo").val(),
            "FromDate": $("#FromDate").val(),
            "ToDate": $("#ToDate").val(),
            "FunctionId": $("#FunctionId").val(),
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
                { targets: [8], visible: false }
            ],
            ajax: function (data, callback, s) {
                var ajaxData = {
                    draw: data.draw,
                    start: data.start,
                    length: data.length,
                    search: data.search,
                    RequestNo: currentFilter.RequestNo,
                    FromDate: currentFilter.FromDate,
                    ToDate: currentFilter.ToDate,
                    FunctionId: currentFilter.FunctionId || null,
                    StatusId: currentFilter.StatusId || null
                };

                $.ajax({
                    url: $("#BrowseQualityRequestListUrl").val(),
                    type: "POST",
                    contentType: "application/json",
                    dataType: 'json',
                    data: JSON.stringify(ajaxData),
                    headers: { "RequestVerificationToken": $('input[name="__RequestVerificationToken"]').val() },
                    beforeSend: function () { $('#tblDetailsOverlay').css('display', 'flex'); },
                    success: function (result) {
                        if (result && (result.ExecutionResultId == null || result.ExecutionResultId == 1)) {
                            callback({
                                data: result.data || [],
                                recordsTotal: result.recordsTotal || 0,
                                recordsFiltered: result.recordsFiltered || 0
                            });
                            $('#tblDetailsOverlay').css('display', 'none');
                            var enableDisableInput = (result.data || []).length == 0 ? "disabled='disabled'" : "";
                            $("#tblDetails_wrapper .dataTables_paginate .pagination").append("<li class='paginate_button'><input class='form-control input input-text no-autofill' autocomplete='off' placeholder='Page No' style='width:90px' name='tblInputPaging' onkeyup='DataTablePagingKeyUp(this)' type='text' " + enableDisableInput + "></li>");
                            setTimeout(function () { tblDetails.columns.adjust(); }, 150);
                        } else { handleQualityRequestListLoadFailure(null); }
                    },
                    error: function (e) { handleQualityRequestListLoadFailure(e); }
                });
            },
            columns: [
                { data: 'RequestNo' },
                { data: 'RequestDate', render: function (d) { if (!d) return ''; var dd = new Date(d); return isNaN(dd.getTime()) ? d : dd.toISOString().slice(0, 10); } },
                { data: 'DocumentReferenceNo' },
                { data: null, render: function (_d, _t, row) { return row.FunctionName || (row.FunctionId ?? ''); } },
                { data: 'NoOfItems' },
                { data: null, render: function (_d, _t, row) { return row.StatusName || getApprovalText(row.StatusId) || (row.StatusId ?? ''); } },
                { data: null, render: function (_d, _t, row) { return row.QCStatusName || getApprovalText(row.QCStatusId) || (row.QCStatusId ?? 'N/A'); } },
                { data: 'CreatedBy' },
                { data: 'QualityRequestId' }
            ]
        });

        $("#tblDetails_wrapper .dataTables_scroll").css("overflow-x", "auto");
    }

    function handleQualityRequestListLoadFailure(ex) {
        if (ex != null) console.log(ex);
        $('#tblDetailsOverlay').css('display', 'none');
        DisplayUserActionAlert(Alert_Action_Enum.View, Alert_Type_Enum.Danger, null, "An error occurred while loading quality request list.", null, null, null)
    }
})();
