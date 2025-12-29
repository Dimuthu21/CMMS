const navigationMenuName = "ItemHasQualityParameters";

const currentCompanyId = $("#CurrentCompanyId").val();
const currentBranchId = $("#CurrentBranchId").val();

function ValidateIHQP() {
    var result = true;

    var functionId = (fieldElement = $("#FunctionId")).val();
    $('span[data-valmsg-for="FunctionId"]').text('');
    if (!functionId) {
        $('span[data-valmsg-for="FunctionId"]').text('Function is required.');
        DisplayDataValidationErrorAlert(true, result, "function", fieldElement);
        result = false;
    }

    // at least one item
    var itemCount = $('.itemCheckbox:checked').length;
    var $itemVal = $('span[data-valmsg-for="SelectedItemIds"]');
    $itemVal.text('');
    if (itemCount === 0) {
        $itemVal.text('Select at least one item.');
        result = false;
    }

    // at least one qp
    var qpCount = $('.qpCheckbox:checked').length;
    var $qpVal = $('span[data-valmsg-for="SelectedQualityParameterIds"]');
    $qpVal.text('');
    if (qpCount === 0) {
        $qpVal.text('Select at least one quality parameter.');
        result = false;
    }

    return result;
}

function ReturnIHQPModel() {
    var selectedItems = [];
    $('.itemCheckbox:checked').each(function () { selectedItems.push(parseInt($(this).val())); });

    var selectedQPs = [];
    $('.qpCheckbox:checked').each(function () { selectedQPs.push(parseInt($(this).val())); });

    return {
        'CurrentCompanyId': currentCompanyId,
        'CurrentBranchId': currentBranchId,
        'FunctionId': $("#FunctionId").val(),
        'ItemCategoryId': $("#ItemCategoryId").val(),
        'SelectedItemIds': selectedItems,
        'SelectedQualityParameterIds': selectedQPs
    };
}

function SaveItemHasQualityParameters() {
    ChangeSaveButtonState(true);

    if (ValidateIHQP()) {
        showProgressLoading(null, 'Saving assignments. Please wait...');

        $.ajax({
            url: $("#SaveItemHasQualityParametersUrl").val(),
            method: 'POST',
            dataType: 'JSON',
            data: ReturnIHQPModel(),
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.reload();
                } else {
                    dismissProgressLoading();
                    if (Server_Error_Message_Display_Execution_Results.includes(result.ExecutionResultId)) {
                        DisplayUserActionSaveFailureAlert(null, result.UserInformationMessageType, result.UserInformationMessageTitle, result.UserInformationMessageContent)
                    } else {
                        DisplayUserActionSaveFailureAlert(null, null, null, null);
                    }
                    ChangeSaveButtonState(false);
                }
            },
            error: function () {
                dismissProgressLoading();
                ChangeSaveButtonState(false);
                DisplayUserActionSaveFailureAlert(null, null, null, null);
            }
        });
    } else {
        ChangeSaveButtonState(false);
    }
}

function ConfirmDeleteEntry() {
    DisplayConfirmationAlert(Alert_Action_Enum.Delete, Alert_Type_Enum.Warning, null, null, null, null, ProceedDeleteIHQP, null, true, null, null, null, null, 'item assignments');
}

function ProceedDeleteIHQP() {
    var functionId = $("#FunctionId").val();
    var selectedItems = [];
    $('.itemCheckbox:checked').each(function () { selectedItems.push(parseInt($(this).val())); });

    if (functionId && selectedItems.length > 0) {
        ChangeDeleteButtonState(true);
        showProgressLoading(null, 'Deleting assignments. Please wait...');

        $.ajax({
            url: $("#DeleteItemHasQualityParametersUrl").val(),
            method: 'POST',
            dataType: 'JSON',
            data: {
                CompanyId: currentCompanyId,
                BranchId: currentBranchId,
                FunctionId: functionId,
                SelectedItemIds: selectedItems
            },
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.href = $("#ItemHasQualityParametersListUrl").val();
                } else {
                    dismissProgressLoading();
                    if (Server_Error_Message_Display_Execution_Results.includes(result.ExecutionResultId)) {
                        DisplayUserActionDeleteFailureAlert(result.UserInformationMessageType, result.UserInformationMessageTitle, result.UserInformationMessageContent)
                    } else {
                        DisplayUserActionDeleteFailureAlert(null, null, null);
                    }
                    ChangeDeleteButtonState(false);
                }
            },
            error: function () {
                dismissProgressLoading();
                ChangeDeleteButtonState(false);
                DisplayUserActionAlert(Alert_Action_Enum.Delete, Alert_Type_Enum.Danger, null, null, null, null, null)
            }
        });
    }
}

$(document).ready(function () {
    $(document).on('change', '#ItemCategoryId', function () {
        var catId = $(this).val();
        // Optional: could fetch items by category via an endpoint; for now, left static
    });
});
