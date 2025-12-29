const navigationMenuName = "SampleSerialNoSetup";

const sampleSerialNoSetupId = $("#SampleSerialNoSetupId").val();
const entryIdentifier = $("#EntryIdentifier").val();
const entryVersion = $("#EntryVersion").val();
const currentCompanyId = $("#CurrentCompanyId").val();
const currentBranchId = $("#CurrentBranchId").val();

function FunctionChange(validate, preResult) {
    var val = (fieldElement = $("#FunctionId")).val();
    $('span[data-valmsg-for="FunctionId"]').text('');
    if (val == "") {
        $('span[data-valmsg-for="FunctionId"]').text('Function is required.');
        DisplayDataValidationErrorAlert(validate, preResult, "function", fieldElement);
        preResult = false;
    }

    return preResult;
}

function PrefixChange(validate, preResult) {
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

function ValidateSampleSerialNoSetup() {
    var result = true;

    result = FunctionChange(true, result);
    result = StatusChange(true, result);

    return result;
}

function ReturnSampleSerialNoSetup() {
    var functionId = $("#FunctionId").val();
    var prefix = $("#Prefix").val();
    var suffix = $("#Suffix").val();
    var startNo = $("#StartNo").val();
    var currentIndex = $("#CurrentIndex").val();
    var prefixFormat = $("#PrefixNumberFormat").val();
    var resetAfter = $("#ResetAfter").val();
    var statusId = $("#StatusId").val();

    return {
        'CurrentCompanyId': currentCompanyId,
        'CurrentBranchId': currentBranchId,
        'SampleSerialNoSetupId': sampleSerialNoSetupId,
        'FunctionId': functionId,
        'Prefix': prefix,
        'Suffix': suffix,
        'StartNo': startNo,
        'CurrentIndex': currentIndex,
        'PrefixNumberFormat': prefixFormat,
        'ResetAfter': resetAfter,
        'StatusId': statusId,
        'EntryIdentifier': entryIdentifier,
        'EntryVersion': entryVersion,
    };
}

function SaveSampleSerialNoSetup() {
    ChangeSaveButtonState(true);

    if (ValidateSampleSerialNoSetup()) {

        showProgressLoading(null, 'Saving serial setup. Please wait...');

        $.ajax({
            url: $("#SampleSerialNoSetupSaveUrl").val(),
            method: 'POST',
            dataType: 'JSON',
            data: ReturnSampleSerialNoSetup(),
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.reload();
                } else {
                    dismissProgressLoading();
                    if (Server_Error_Message_Display_Execution_Results.includes(result.ExecutionResultId)) {
                        DisplayUserActionSaveFailureAlert(sampleSerialNoSetupId, result.UserInformationMessageType, result.UserInformationMessageTitle, result.UserInformationMessageContent)
                    } else {
                        DisplayUserActionSaveFailureAlert(sampleSerialNoSetupId, null, null, null);
                    }
                    ChangeSaveButtonState(false);
                }
            },
            error: function () {
                dismissProgressLoading();
                ChangeSaveButtonState(false);
                DisplayUserActionSaveFailureAlert(sampleSerialNoSetupId, null, null, null);
            }
        });
    } else {
        ChangeSaveButtonState(false);
    }
}

function ConfirmDeleteEntry() {
    DisplayConfirmationAlert(Alert_Action_Enum.Delete, Alert_Type_Enum.Warning, null, null, null, null, ProceedDeleteEntry, null, true, null, null, null, null, 'serial number setup');
}

function ProceedDeleteEntry() {
    if (sampleSerialNoSetupId != null) {
        ChangeDeleteButtonState(true);

        showProgressLoading(null, 'Deleting serial setup. Please wait...');

        $.ajax({
            url: $("#SampleSerialNoSetupDeleteUrl").val(),
            type: "POST",
            dataType: "JSON",
            data: {
                CompanyId: currentCompanyId,
                BranchId: currentBranchId,
                SampleSerialNoSetupId: sampleSerialNoSetupId,
                EntryVersion: entryVersion,
            },
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.href = $("#SampleSerialNoSetupListUrl").val();
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
