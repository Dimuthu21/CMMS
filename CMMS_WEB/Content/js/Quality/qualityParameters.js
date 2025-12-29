const navigationMenuName = "QualityParameters";

const qualityParameterId = $("#QualityParameterId").val();
const entryIdentifier = $("#EntryIdentifier").val();
const entryVersion = $("#EntryVersion").val();
const currentCompanyId = $("#CurrentCompanyId").val();
const currentBranchId = $("#CurrentBranchId").val();

function CodeChange(validate, preResult) {
    var codeVal = (fieldElement = $("#Code")).val();
    $('span[data-valmsg-for="Code"]').text('');

    // Only validate Code when user has chosen to provide their own code
    if ($('#IsUserPreferredCode').is(':checked')) {
        if (codeVal == "") {
            $('span[data-valmsg-for="Code"]').text('Code is required.');
            DisplayDataValidationErrorAlert(validate, preResult, "code", fieldElement);
            preResult = false;
        }
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

function TestMethodChange(validate, preResult) {
    var val = (fieldElement = $("#TestMethodId")).val();
    $('span[data-valmsg-for="TestMethodId"]').text('');
    if (val == "" || val == null) {
        $('span[data-valmsg-for="TestMethodId"]').text('Test Method is required.');
        DisplayDataValidationErrorAlert(validate, preResult, "testmethod", fieldElement);
        preResult = false;
    }

    return preResult;
}

function ParameterValueTypeChange(validate, preResult) {
    var val = (fieldElement = $("#ParameterValueTypeId")).val();
    $('span[data-valmsg-for="ParameterValueTypeId"]').text('');
    if (val == "" || val == null) {
        $('span[data-valmsg-for="ParameterValueTypeId"]').text('Parameter Value Type is required.');
        DisplayDataValidationErrorAlert(validate, preResult, "parametervaluetype", fieldElement);
        preResult = false;
    }

    return preResult;
}

// Helper: ensure there's a validation container after dropdownValuesContainer
function ensureDropdownValidationContainer() {
    var $container = $('#dropdownValuesContainer');
    if ($container.length === 0) return null;
    var $val = $container.next('span[data-valmsg-for="SelectedParameterDropdownValueIds"]');
    if ($val.length === 0) {
        $val = $('<span/>').attr('data-valmsg-for', 'SelectedParameterDropdownValueIds').addClass('text-danger').css('display', 'block').insertAfter($container);
    }
    return $val;
}

function DropdownValuesValidationSet(message) {
    var $val = ensureDropdownValidationContainer();
    if ($val) $val.text(message);
}

function DropdownValuesValidationClear() {
    var $val = ensureDropdownValidationContainer();
    if ($val) $val.text('');
}

function ValidateQualityParameter() {
    var result = true;

    result = CodeChange(true, result);
    result = NameChange(true, result);
    result = TestMethodChange(true, result);
    result = ParameterValueTypeChange(true, result);
    result = StatusChange(true, result);

    // Clear previous dropdown validation message
    DropdownValuesValidationClear();

    // If Parameter Value Type is Dropdown (id = 3) ensure at least one dropdown value is selected
    try {
        var pvt = $("#ParameterValueTypeId").val();
        if (pvt == "3") {
            var selectedCount = $('.paramDropdownCheckbox:checked').length;
            if (selectedCount === 0) {
                // show inline validation next to dropdown values container
                DropdownValuesValidationSet('Select at least one dropdown value.');

                // Prefer SweetAlert (swal) for popup if available
                if (typeof swal === 'function') {
                    try {
                        swal({
                            title: 'Validation',
                            text: 'Please select at least one dropdown value.',
                            type: 'warning',
                            allowOutsideClick: false,
                            confirmButtonClass: 'btn-primary'
                        });
                    } catch (e) {
                        // fallback to other alerts
                        if (typeof DisplayUserActionAlert === 'function' && typeof Alert_Action_Enum !== 'undefined' && typeof Alert_Type_Enum !== 'undefined') {
                            try {
                                DisplayUserActionAlert(Alert_Action_Enum.Save, Alert_Type_Enum.Warning, null, null, 'Please select at least one dropdown value.', null, null);
                            } catch (ex) {
                                alert('Please select at least one dropdown value.');
                            }
                        } else {
                            alert('Please select at least one dropdown value.');
                        }
                    }
                } else if (typeof DisplayUserActionAlert === 'function' && typeof Alert_Action_Enum !== 'undefined' && typeof Alert_Type_Enum !== 'undefined') {
                    try {
                        DisplayUserActionAlert(Alert_Action_Enum.Save, Alert_Type_Enum.Warning, null, null, 'Please select at least one dropdown value.', null, null);
                    } catch (e) {
                        alert('Please select at least one dropdown value.');
                    }
                } else {
                    alert('Please select at least one dropdown value.');
                }

                result = false;
            }
        }
    } catch (e) {
        // ignore errors and continue
    }

    return result;
}

function ReturnQualityParameter() {
    var code = $("#Code").val();
    var isUserPreferredCode = $("#IsUserPreferredCode").is(":checked");
    var name = $("#Name").val();
    var description = $("#Description").val();
    var statusId = $("#StatusId").val();
    var testMethodId = $("#TestMethodId").val();
    var uomId = $("#UnitOfMeasurementId").val();
    var parameterValueTypeId = $("#ParameterValueTypeId").val();

    var selectedDropdownIds = [];
    $('.paramDropdownCheckbox:checked').each(function () {
        selectedDropdownIds.push(parseInt($(this).val()));
    });

    return {
        'CurrentCompanyId': currentCompanyId,
        'CurrentBranchId': currentBranchId,
        'QualityParameterId': qualityParameterId,
        'Code': code,
        'IsUserPreferredCode': isUserPreferredCode,
        'Name': name,
        'Description': description,
        'StatusId': statusId,
        'TestMethodId': testMethodId,
        'UnitOfMeasurementId': uomId,
        'ParameterValueTypeId': parameterValueTypeId,
        'SelectedParameterDropdownValueIds': selectedDropdownIds,
        'EntryIdentifier': entryIdentifier,
        'EntryVersion': entryVersion,
    };
}

function SaveQualityParameter() {
    ChangeSaveButtonState(true);

    if (ValidateQualityParameter()) {

        showProgressLoading(null, 'Saving quality parameter. Please wait...');

        $.ajax({
            url: $("#QualityParameterSaveUrl").val(),
            method: 'POST',
            dataType: 'JSON',
            data: ReturnQualityParameter(),
            beforeSend: function () {
                // statements need to be executed before calling controller action
            },
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.reload();
                } else {
                    dismissProgressLoading();
                    if (Server_Error_Message_Display_Execution_Results.includes(result.ExecutionResultId)) {
                        DisplayUserActionSaveFailureAlert(qualityParameterId, result.UserInformationMessageType, result.UserInformationMessageTitle, result.UserInformationMessageContent)
                    } else {
                        DisplayUserActionSaveFailureAlert(qualityParameterId, null, null, null);
                    }
                    ChangeSaveButtonState(false);
                }
            },
            error: function () {
                dismissProgressLoading();
                ChangeSaveButtonState(false);
                DisplayUserActionSaveFailureAlert(qualityParameterId, null, null, null);
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
    DisplayConfirmationAlert(Alert_Action_Enum.Delete, Alert_Type_Enum.Warning, null, null, null, null, ProceedDeleteEntry, null, true, null, null, null, null, 'quality parameter');
}

function ProceedDeleteEntry() {
    if (qualityParameterId != null) {
        ChangeDeleteButtonState(true);

        showProgressLoading(null, 'Deleting quality parameter. Please wait...');

        $.ajax({
            url: $("#QualityParameterDeleteUrl").val(),
            type: "POST",
            dataType: "JSON",
            data: {
                CompanyId: currentCompanyId,
                BranchId: currentBranchId,
                QualityParameterId: qualityParameterId,
                EntryVersion: entryVersion,
            },
            beforeSend: function () {
                // statements need to be executed before calling controller action
            },
            success: function (result) {
                if (result.ExecutionResultId == Execution_Result_Enum.Success) {
                    location.href = $("#QualityParameterListUrl").val();
                } else {
                    dismissProgressLoading();
                    if (Server_Error_Message_Display_EXECUTION_Results && Server_Error_Message_Display_Execution_Results.includes && Server_Error_Message_Display_Execution_Results.includes(result.ExecutionResultId)) {
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

function OnParameterValueTypeChange() {
    var val = $("#ParameterValueTypeId").val();
    var $rowDesired = $('#rowDesiredValue');
    var $container = $('#desiredValueContainer');

    // reset desired value UI
    if($container.length){
        var existingDdl = $container.find('select[name="DesiredValueDropdown"]');
        if(existingDdl.length && val !== '3'){
            // revert back to textbox
            existingDdl.remove();
            if($container.find('#DesiredValue').length === 0){
                $container.append('<input type="text" id="DesiredValue" name="DesiredValue" class="form-control" placeholder="Desired Value" />');
            } else {
                $container.find('#DesiredValue').show();
            }
        }
    }

    if (val == "3") { // Dropdown
        $('#dropdownValuesContainer').show();
        // show desired row and build dropdown from selected checkboxes
        if($rowDesired.length) $rowDesired.show();
        if($container.length){
            var selected = [];
            $('.paramDropdownCheckbox').each(function(){
                var txt = $(this).closest('label').find('span').text().trim();
                var id = $(this).val();
                selected.push({ id:id, text:txt });
            });
            // replace textbox with dropdown
            $container.find('#DesiredValue').hide();
            if($container.find('select[name="DesiredValueDropdown"]').length===0){
                var ddl = $('<select class="form-select" name="DesiredValueDropdown"><option value="">Select Desired Value</option></select>');
                selected.forEach(function(o){ ddl.append('<option value="'+o.id+'">'+o.text+'</option>'); });
                $container.append(ddl);
            }
        }
    } else if (val == "2") { // Number
        $('#dropdownValuesContainer').hide();
        $('.paramDropdownCheckbox').prop('checked', false);
        DropdownValuesValidationClear();
        if($rowDesired.length) $rowDesired.show();
        if($container.length){
            var input = $container.find('#DesiredValue');
            if(input.length){ input.attr('type','number').show(); }
            $container.find('select[name="DesiredValueDropdown"]').remove();
        }
    } else { // Text / Other
        $('#dropdownValuesContainer').hide();
        $('.paramDropdownCheckbox').prop('checked', false);
        DropdownValuesValidationClear();
        if($rowDesired.length) $rowDesired.hide();
    }
}

function ToggleCodeFieldBasedOnPreference() {
    var isPreferred = $('#IsUserPreferredCode').is(':checked');
    if (isPreferred) {
        $('#Code').prop('disabled', false);
        $('#Code').removeClass('disabled');
    } else {
        $('#Code').prop('disabled', true);
        $('#Code').addClass('disabled');
    }
}

$(document).ready(function () {
    OnParameterValueTypeChange();

    // Initialize Code field state based on IsUserPreferredCode
    ToggleCodeFieldBasedOnPreference();

    // bind change on IsUserPreferredCode checkbox
    $(document).on('change', '#IsUserPreferredCode', function () {
        ToggleCodeFieldBasedOnPreference();
    });

    // bind onchange for selects to perform inline validation
    $(document).on('change', '#TestMethodId', function () { TestMethodChange(false, true); });
    $(document).on('change', '#ParameterValueTypeId', function () { ParameterValueTypeChange(false, true); OnParameterValueTypeChange(); });

    // clear dropdown validation when user selects a value
    $(document).on('change', '.paramDropdownCheckbox', function () {
        if ($('.paramDropdownCheckbox:checked').length > 0) {
            DropdownValuesValidationClear();
        }
    });
});
