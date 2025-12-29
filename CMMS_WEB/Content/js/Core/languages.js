const navigationMenuName = "Languages";

const languagesId = $("#LanguagesId").val();
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

function ValidateLanguages() {
    var result = true;

    result = CodeChange(true, result);
    result = NameChange(true, result);
    result = StatusChange(true, result);

    return result;
}

function ReturnLanguages() {
    var code = $("#Code").val();
    var isUserPreferredCode = $("#IsUserPreferredCode").is(":checked");
    var name = $("#Name").val();
    var description = $("#Description").val();
    var statusId = $("#StatusId").val();

    return {
        'CurrentCompanyId': currentCompanyId,
        'CurrentBranchId': currentBranchId,
        'LanguagesId': languagesId,
        'Code': code,
        'IsUserPreferredCode': isUserPreferredCode,
        'Name': name,
        'Description': description,
        'StatusId': statusId,
        'EntryIdentifier': entryIdentifier,
        'EntryVersion': entryVersion,
    };
}

function SaveLanguages() {
    ChangeSaveButtonState(true);

    if (ValidateLanguages()) {

        showProgressLoading(null, 'Saving languages. Please wait...');

        $.ajax({
            url: $("#LanguagesSaveUrl").val(),
            method: 'POST',
            dataType: 'JSON',
            data: ReturnLanguages(),
            beforeSend: function () {
                // statements need to be executed before calling controller action
            },
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.reload();
                } else {
                    dismissProgressLoading();
                    if (Server_Error_Message_Display_Execution_Results.includes(result.ExecutionResultId)) {
                        DisplayUserActionSaveFailureAlert(languagesId, result.UserInformationMessageType, result.UserInformationMessageTitle, result.UserInformationMessageContent)
                    } else {
                        DisplayUserActionSaveFailureAlert(languagesId, null, null, null);
                    }
                    ChangeSaveButtonState(false);
                }
            },
            error: function () {
                dismissProgressLoading();
                ChangeSaveButtonState(false);
                DisplayUserActionSaveFailureAlert(languagesId, null, null, null);
            },
            complete: function () {
                // statements need to be executed after success/error functions
            }
        });
    } else {
        ChangeSaveButtonState(false);
    }
}

function ConfirmDeleteEntry() {
    DisplayConfirmationAlert(Alert_Action_Enum.Delete, Alert_Type_Enum.Warning, null, null, null, null, ProceedDeleteEntry, null, true, null, null, null, null, 'languages');
}

function ProceedDeleteEntry() {
    if (languagesId != null) {
        ChangeDeleteButtonState(true);

        showProgressLoading(null, 'Deleting languages. Please wait...');

        $.ajax({
            url: $("#LanguagesDeleteUrl").val(),
            type: "POST",
            dataType: "JSON",
            data: {
                CompanyId: currentCompanyId,
                BranchId: currentBranchId,
                LanguagesId: languagesId,
                EntryVersion: entryVersion,
            },
            beforeSend: function () {
                // statements need to be executed before calling controller action
            },
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.href = $("#LanguagesListUrl").val();
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
