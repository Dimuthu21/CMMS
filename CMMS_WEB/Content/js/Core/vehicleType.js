const navigationMenuName = "VehicleType";

const vehicleTypeId = $("#VehicleTypeId").val();
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

function ValidateVehicleType() {
    var result = true;

    result = CodeChange(true, result);
    result = NameChange(true, result);
    result = StatusChange(true, result);

    return result;
}

function ReturnVehicleType() {
    var code = $("#Code").val();
    var isUserPreferredCode = $("#IsUserPreferredCode").is(":checked");
    var name = $("#Name").val();
    var description = $("#Description").val();
    var statusId = $("#StatusId").val();

    return {
        'CurrentCompanyId': currentCompanyId,
        'CurrentBranchId': currentBranchId,
        'VehicleTypeId': vehicleTypeId,
        'Code': code,
        'IsUserPreferredCode': isUserPreferredCode,
        'Name': name,
        'Description': description,
        'StatusId': statusId,
        'EntryIdentifier': entryIdentifier,
        'EntryVersion': entryVersion,
    };
}

function SaveVehicleType() {
    ChangeSaveButtonState(true);

    if (ValidateVehicleType()) {

        showProgressLoading(null, 'Saving vehicle type. Please wait...');

        $.ajax({
            url: $("#VehicleTypeSaveUrl").val(),
            method: 'POST',
            dataType: 'JSON',
            data: ReturnVehicleType(),
            beforeSend: function () {
                // statements need to be executed before calling controller action
            },
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.reload();
                } else {
                    dismissProgressLoading();
                    if (Server_Error_Message_Display_Execution_Results.includes(result.ExecutionResultId)) {
                        DisplayUserActionSaveFailureAlert(vehicleTypeId, result.UserInformationMessageType, result.UserInformationMessageTitle, result.UserInformationMessageContent)
                    } else {
                        DisplayUserActionSaveFailureAlert(vehicleTypeId, null, null, null);
                    }
                    ChangeSaveButtonState(false);
                }
            },
            error: function () {
                dismissProgressLoading();
                ChangeSaveButtonState(false);
                DisplayUserActionSaveFailureAlert(vehicleTypeId, null, null, null);
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
    DisplayConfirmationAlert(Alert_Action_Enum.Delete, Alert_Type_Enum.Warning, null, null, null, null, ProceedDeleteEntry, null, true, null, null, null, null, 'vehicle type');
}

function ProceedDeleteEntry() {
    if (vehicleTypeId != null) {
        ChangeDeleteButtonState(true);

        showProgressLoading(null, 'Deleting vehicle type. Please wait...');

        $.ajax({
            url: $("#VehicleTypeDeleteUrl").val(),
            type: "POST",
            dataType: "JSON",
            data: {
                CompanyId: currentCompanyId,
                BranchId: currentBranchId,
                VehicleTypeId: vehicleTypeId,
                EntryVersion: entryVersion,
            },
            beforeSend: function () {
                // statements need to be executed before calling controller action
            },
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.href = $("#VehicleTypeListUrl").val();
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
