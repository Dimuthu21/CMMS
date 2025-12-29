const navigationMenuName = "UnitOfMeasure";

const uomId = $("#UOMId").val();
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

function UOMGroupChange(validate, preResult) {
    var groupVal = (fieldElement = $("#UOMGroupId")).val();
    $('span[data-valmsg-for="UOMGroupId"]').text('');
    if (groupVal == "") {
        $('span[data-valmsg-for="UOMGroupId"]').text('UOM Group is required.');
        DisplayDataValidationErrorAlert(validate, preResult, "uomgroup", fieldElement);
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

function ValidateUnitOfMeasure() {
    var result = true;

    result = CodeChange(true, result);
    result = NameChange(true, result);
    result = UOMGroupChange(true, result);
    result = StatusChange(true, result);

    return result;
}

function ReturnUnitOfMeasure() {
    var code = $("#Code").val();
    var isUserPreferredCode = $("#IsUserPreferredCode").is(":checked");
    var name = $("#Name").val();
    var description = $("#Description").val();
    var uomGroupId = $("#UOMGroupId").val();
    var statusId = $("#StatusId").val();

    return {
        'CurrentCompanyId': currentCompanyId,
        'CurrentBranchId': currentBranchId,
        'UOMId': uomId,
        'Code': code,
        'IsUserPreferredCode': isUserPreferredCode,
        'Name': name,
        'Description': description,
        'UOMGroupId': uomGroupId,
        'StatusId': statusId,
        'EntryIdentifier': entryIdentifier,
        'EntryVersion': entryVersion,
    };
}

function SaveUnitOfMeasure() {
    ChangeSaveButtonState(true);

    if (ValidateUnitOfMeasure()) {

        showProgressLoading(null, 'Saving unit of measure. Please wait...');

        $.ajax({
            url: $("#UnitOfMeasureSaveUrl").val(),
            method: 'POST',
            dataType: 'JSON',
            data: ReturnUnitOfMeasure(),
            beforeSend: function () {
                // statements need to be executed before calling controller action
            },
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.reload();
                } else {
                    dismissProgressLoading();
                    if (Server_Error_Message_Display_Execution_Results.includes(result.ExecutionResultId)) {
                        DisplayUserActionSaveFailureAlert(uomId, result.UserInformationMessageType, result.UserInformationMessageTitle, result.UserInformationMessageContent)
                    } else {
                        DisplayUserActionSaveFailureAlert(uomId, null, null, null);
                    }
                    ChangeSaveButtonState(false);
                }
            },
            error: function () {
                dismissProgressLoading();
                ChangeSaveButtonState(false);
                DisplayUserActionSaveFailureAlert(uomId, null, null, null);
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
    DisplayConfirmationAlert(Alert_Action_Enum.Delete, Alert_Type_Enum.Warning, null, null, null, null, ProceedDeleteEntry, null, true, null, null, null, null, 'unit of measure');
}

function ProceedDeleteEntry() {
    if (uomId != null) {
        ChangeDeleteButtonState(true);

        showProgressLoading(null, 'Deleting unit of measure. Please wait...');

        $.ajax({
            url: $("#UnitOfMeasureDeleteUrl").val(),
            type: "POST",
            dataType: "JSON",
            data: {
                CompanyId: currentCompanyId,
                BranchId: currentBranchId,
                UOMId: uomId,
                EntryVersion: entryVersion,
            },
            beforeSend: function () {
                // statements need to be executed before calling controller action
            },
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.href = $("#UnitOfMeasureListUrl").val();
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
