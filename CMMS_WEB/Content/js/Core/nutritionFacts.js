const navigationMenuName = "NutritionFacts";

const nutritionFactsId = $("#NutritionFactId").val();
const entryIdentifier = $("#EntryIdentifier").val();
const entryVersion = $("#EntryVersion").val();
const currentCompanyId = $("#CurrentCompanyId").val();
const currentBranchId = $("#CurrentBranchId").val();

function CodeChange(validate, preResult) {
    var codeVal = (fieldElement = $("#Code")).val();
    $('span[data-valmsg-for="Code"]').text('');
    if (codeVal == "") {
        $('span[data-valmsg-for="Code"]').text('Code is required.');
        DisplayDataValidationErrorAlert(validate, preResult, "code", fieldElement);
        preResult = false;
    }
    return preResult;
}

function NameChange(validate, preResult) {
    var nameVal = (fieldElement = $("#Name")).val();
    $('span[data-valmsg-for="Name"]').text('');
    if (nameVal == "") {
        $('span[data-valmsg-for="Name"]').text('Name is required.');
        DisplayDataValidationErrorAlert(validate, preResult, "name", fieldElement);
        preResult = false;
    }
    return preResult;
}

function StatusChange(validate, preResult) {
    var statusVal = (fieldElement = $("#StatusId")).val();
    $('span[data-valmsg-for="StatusId"]').text('');
    if (statusVal == "") {
        $('span[data-valmsg-for="StatusId"]').text('Status is required.');
        DisplayDataValidationErrorAlert(validate, preResult, "status", fieldElement);
        preResult = false;
    }
    return preResult;
}

function ValidateNutritionFacts() {
    var result = true;
    result = CodeChange(true, result);
    result = NameChange(true, result);
    result = StatusChange(true, result);
    return result;
}

function ReturnNutritionFacts() {
    var code = $("#Code").val();
    var isUserPreferredCode = $("#IsUserPreferredCode").is(":checked");
    var name = $("#Name").val();
    var description = $("#Description").val();
    var statusId = $("#StatusId").val();
    return {
        'CurrentCompanyId': currentCompanyId,
        'CurrentBranchId': currentBranchId,
        'NutritionFactId': nutritionFactsId,
        'Code': code,
        'IsUserPreferredCode': isUserPreferredCode,
        'Name': name,
        'Description': description,
        'StatusId': statusId,
        'EntryIdentifier': entryIdentifier,
        'EntryVersion': entryVersion,
    };
}

function SaveNutritionFacts() {
    ChangeSaveButtonState(true);
    if (ValidateNutritionFacts()) {
        showProgressLoading(null, 'Saving nutrition facts. Please wait...');
        $.ajax({
            url: $("#NutritionFactsSaveUrl").val(),
            method: 'POST',
            dataType: 'JSON',
            data: ReturnNutritionFacts(),
            beforeSend: function () {},
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.reload();
                } else {
                    dismissProgressLoading();
                    if (Server_Error_Message_Display_Execution_Results.includes(result.ExecutionResultId)) {
                        DisplayUserActionSaveFailureAlert(nutritionFactsId, result.UserInformationMessageType, result.UserInformationMessageTitle, result.UserInformationMessageContent)
                    } else {
                        DisplayUserActionSaveFailureAlert(nutritionFactsId, null, null, null);
                    }
                    ChangeSaveButtonState(false);
                }
            },
            error: function () {
                dismissProgressLoading();
                ChangeSaveButtonState(false);
                DisplayUserActionSaveFailureAlert(nutritionFactsId, null, null, null);
            },
            complete: function () {}
        });
    } else {
        ChangeSaveButtonState(false);
    }
}

function ConfirmDeleteEntry() {
    DisplayConfirmationAlert(Alert_Action_Enum.Delete, Alert_Type_Enum.Warning, null, null, null, null, ProceedDeleteNutritionFacts, null, true, null, null, null, null, 'nutrition facts');
}

function ProceedDeleteNutritionFacts() {
    if (nutritionFactsId != null) {
        ChangeDeleteButtonState(true);
        showProgressLoading(null, 'Deleting nutrition facts. Please wait...');
        $.ajax({
            url: $("#NutritionFactsDeleteUrl").val(),
            type: "POST",
            dataType: "JSON",
            data: {
                CompanyId: currentCompanyId,
                BranchId: currentBranchId,
                NutritionFactId: nutritionFactsId,
                EntryVersion: entryVersion,
            },
            beforeSend: function () {},
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.href = $("#NutritionFactsListUrl").val();
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
            error: function (jqXHR, textStatus, errorThrown) {
                dismissProgressLoading();
                ChangeDeleteButtonState(false);
                DisplayUserActionAlert(Alert_Action_Enum.Delete, Alert_Type_Enum.Danger, null, null, null, null, null)
            },
        });
    }
}
