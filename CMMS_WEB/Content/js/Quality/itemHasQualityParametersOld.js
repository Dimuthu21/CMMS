const ihqp_currentCompanyId = $("#CurrentCompanyId").val();
const ihqp_currentBranchId = $("#CurrentBranchId").val();

var tblItems;

$(document).ready(function () {
    initItemsTable();
});

function initItemsTable() {
    tblItems = $("#tblItems").DataTable({
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
                Code: $("#FilterItemCode").val(),
                Name: $("#FilterItemName").val(),
                ItemCategoryId: $("#ItemCategoryId").val(),
            };

            $.ajax({
                url: $("#BrowseItemHasQualityParametersListUrl").val(),
                type: "POST",
                contentType: "application/json",
                dataType: 'json',
                data: JSON.stringify(ajaxData),
                headers: { "RequestVerificationToken": $('input[name="__RequestVerificationToken"]').val() },
                success: function (result) {
                    if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                        var mapped = (result.data || []).map(function (r) {
                            return { Code: r.Code, Name: r.Name, ItemId: r.ItemId };
                        });
                        callback({ draw: data.draw, recordsTotal: result.recordsTotal, recordsFiltered: result.recordsTotal, data: mapped });

                        // if we are in edit mode (URL /ViewItemHasQualityParameters/{id}), try to pre-select the item row
                        try {
                            var path = window.location.pathname.toLowerCase();
                            var match = path.match(/viewitemhasqualityparameters\/(\d+)/i);
                            if (match) {
                                var itemId = match[1];
                                setTimeout(function () {
                                    $(".itemCheckbox[value='" + itemId + "']").prop('checked', true);
                                }, 100);
                            }
                        } catch (e) { }
                    } else {
                        callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
                    }
                },
                error: function () { callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] }); }
            });
        },
        columns: [
            { data: "Code" },
            { data: "Name" },
            { data: "ItemId", render: function (data) { return '<input type="checkbox" class="itemCheckbox" value="' + data + '" />'; }, orderable: false, searchable: false }
        ]
    });
}

function FilterItems() { if (tblItems) tblItems.ajax.reload(); }
function ClearItemsFilter() { $("#FilterItemCode").val(''); $("#FilterItemName").val(''); $("#ItemCategoryId").val('').trigger('change'); if (tblItems) tblItems.ajax.reload(); }

function SaveIHQP() {
    var selectedItems = []; $('.itemCheckbox:checked').each(function () { selectedItems.push(parseInt($(this).val())); });
    var selectedQPs = []; $('.qpCheckbox:checked').each(function () { selectedQPs.push(parseInt($(this).val())); });

    $('span[data-valmsg-for="FunctionId"]').text('');
    $('span[data-valmsg-for="SelectedQualityParameterIds"]').text('');

    var functionId = $("#FunctionId").val();
    if (!functionId) { $('span[data-valmsg-for="FunctionId"]').text('Function is required.'); return; }
    if (selectedItems.length === 0) { alert('Select at least one item.'); return; }
    if (selectedQPs.length === 0) { $('span[data-valmsg-for="SelectedQualityParameterIds"]').text('Select at least one quality parameter.'); return; }

    ChangeSaveButtonState(true);
    showProgressLoading(null, 'Saving assignments. Please wait...');

    $.ajax({
        url: $("#SaveItemHasQualityParametersUrl").val(),
        method: 'POST',
        dataType: 'JSON',
        data: { CurrentCompanyId: ihqp_currentCompanyId, CurrentBranchId: ihqp_currentBranchId, FunctionId: functionId, ItemCategoryId: $("#ItemCategoryId").val(), SelectedItemIds: selectedItems, SelectedQualityParameterIds: selectedQPs },
        success: function (result) {
            if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                window.location.href = $("#ItemHasQualityParameterListUrl").val();
            } else {
                dismissProgressLoading();
                DisplayUserActionSaveFailureAlert(null, result.UserInformationMessageType, result.UserInformationMessageTitle, result.UserInformationMessageContent)
                ChangeSaveButtonState(false);
            }
        },
        error: function () { dismissProgressLoading(); ChangeSaveButtonState(false); DisplayUserActionSaveFailureAlert(null, null, null, null); }
    });
}
