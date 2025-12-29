window.App = window.App || {};

const SweetAlert_Version_Enum = {
    SweetAlert1: 1,
    SweetAlert2: 2,
}

const Alert_Display_Method_Enum = {
    NiftyAlert: 1,
    SweetAlert: 2,
}

const Status_Enum = {
    Active: 1,
    Inactive: 2,
}

const Alert_Action_Enum = {
    Create: 1,
    Update: 2,
    Delete: 3,
    View: 4,
    Browse: 5,
}

const Alert_Type_Enum = {
    Success: 'success',
    Danger: 'danger',
    Warning: 'warning',
    Info: 'info',
    Primary: 'primary',
    Secondary: 'secondary',
    Light: 'light',
    Dark: 'dark',
}

const Common_User_Alert_Enum = {
    ActionFailedTitle: 'Internal Server Error!',
    ActionFailedMessage: 'An error occurred while processing your request. Please try again later.',
}

const Default_NiftyAlert_Timer = 3000;
const Default_SweetAlert_Short_Timer = 3000;
const Default_SweetAlert_Medium_Timer = 7000;
const Default_SweetAlert_Long_Timer = 10000;
const Default_Alert_Display_Method = Alert_Display_Method_Enum.SweetAlert;
const Default_SweetAlert_Version = SweetAlert_Version_Enum.SweetAlert1;

const Color_ID_Enum = {
    Success: 1,
    Warning: 2,
    Danger: 3,
    Info: 4,
    Primary: 5,
    Default: 6,
    Dark: 7,
    Purple: 8,
    Pink: 9,
}

const Resource_Url_Open_Method_Enum = {
    CurrentTabWithoutReplace: 1,
    CurrentTabWithReplace: 2,
    NewTabInForeground: 3,
}

const Default_Resource_Url_Open_Method = Resource_Url_Open_Method_Enum.NewTabInForeground;

const Execution_Result_Enum = {
    Success: 1,
    TwoFactorAuthenticationPending: 2,
    AuthenticationFailure: 3,
    MissingParameters: 4,
    InvalidParameters: 5,
    ResourceNotFound: 6,
    ResourceBlocked: 7,
    InsufficientPermission: 8,
    NoAttemptsExceeded: 9,
    TooManyRequests: 10,
    InternalServerError: 11,
    Gone: 12,
    SystemTrialExpired: 13,
    SessionExpired: 14,
    UserAccountBlocked: 15,
    ActionExpired: 16,
    IPAddressBlocked: 17,
    OutdatedVersion: 18,
    DuplicateResource: 19,
    DecryptionFailed: 20,
}

const Server_Error_Message_Display_Execution_Results = [Execution_Result_Enum.DecryptionFailed, Execution_Result_Enum.DuplicateResource,
Execution_Result_Enum.InsufficientPermission, Execution_Result_Enum.InternalServerError, Execution_Result_Enum.InvalidParameters,
Execution_Result_Enum.MissingParameters, Execution_Result_Enum.ResourceBlocked, Execution_Result_Enum.ResourceNotFound, Execution_Result_Enum.OutdatedVersion];

const Animation_Class_Enum = {
    Bounce: 'animated bounce',
    Flash: 'animated flash',
    Pulse: 'animated pulse',
    RubberBand: 'animated rubberBand',
    Shake: 'animated shake',
    Swing: 'animated swing',
    Tada: 'animated tada',
    Wobble: 'animated wobble',
    Jello: 'animated jello',
}

const Form_Submit_Method_Enum = {
    Get: 'GET',
    Post: 'POST'
}

const Form_Submit_Target_Enum = {
    Self: '_self',
    Blank: '_blank'
}

const Document_Export_Format_Enum = {
    PDF: 1,
    Excel: 2
}

const Document_Approval_State_Enum = {
    Rejected: 0,
    Approved: 1,
}
const Approval_State_Enum = {
    Pendingforapproval: 3,
    Approved: 4,
    Rejected: 5,

}

function DisplayTableRowDeleteConfirmationAlert(recordName, confirmAction, confirmActionParameters, cancelAction, cancelActionParameters) {
    DisplayConfirmationAlert(Alert_Action_Enum.Delete, Alert_Type_Enum.Warning, "Delete Confirmation",
        "You are about to delete the " + recordName.toLowerCase() + ". This action cannot be undone. Are you sure you want to proceed?",
        null, null, confirmAction, [confirmActionParameters], true, null, null, cancelAction, cancelActionParameters);
}

function DisplayDataValidationErrorAlert(validate, preResult, fieldName, fieldElement, fieldId, text, rowNumber, tabId, tabName, panelId, panelName) {
    if (validate && preResult) {
        if (text == null) {
            if (tabName != null) {
                if (rowNumber != null) {
                    text = "Please ensure that the " + fieldName + " is provided for row " + rowNumber + " in the '" + tabName + "' tab.";
                } else {
                    text = "Please ensure that the " + fieldName + " is provided in the '" + tabName + "' tab.";
                }
            } else if (panelName != null) {
                if (rowNumber != null) {
                    text = "Please ensure that the " + fieldName + " is provided for row " + rowNumber + " in the '" + panelName + "' panel.";
                } else {
                    text = "Please ensure that the " + fieldName + " is provided in the '" + panelName + "' panel.";
                }
            } else {
                text = "Please ensure that the " + fieldName + " is provided.";
            }
        }

        var scrollPosition = 0;

        if (tabId != null) {
            var navTabsLi = $("#" + tabId).parent().parent().find('ul li');
            navTabsLi.each(function () {
                var ahref = $(this).find('a').attr('href');
                if (ahref == "#" + tabId) {
                    if (!$(this).hasClass('active')) {
                        $(this).addClass('active');
                    }
                } else {
                    $(this).removeClass('active');
                }
            });

            scrollPosition = $("#" + tabId).offset().top - 200;

            var tabContentDivs = $("#" + tabId).closest('.tab-content').find('div');
            tabContentDivs.each(function () {
                var divId = $(this).attr('id');
                if (divId == tabId) {
                    if (!$(this).hasClass('active')) {
                        $(this).addClass('active');
                    }
                    if (!$(this).hasClass('in')) {
                        $(this).addClass('in');
                    }
                } else {
                    $(this).removeClass('active');
                    $(this).removeClass('in');
                }
            });
        } else if (panelId != null) {
            scrollPosition = $("#" + panelId).offset().top - 200;
        }

        if (fieldElement != null) {
            scrollPosition = $(fieldElement).offset().top - 200;
            setTimeout(function () {
                $(fieldElement).focus();
                AnimateInputFieldElement(fieldElement, Animation_Class_Enum.Pulse, 2500, 1, 750);
            }, 100);
        }
        else if (fieldId != null) {
            scrollPosition = $(fieldId).offset().top - 200;
            setTimeout(function () {
                $(fieldId).focus();
                AnimateInputFieldElement(fieldElement, Animation_Class_Enum.Pulse, 2500, 1, 750);
            }, 100);
        }

        window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });

        DisplayUserActionAlert(Alert_Action_Enum.Create, Alert_Type_Enum.Danger, 'Validation Error!', text, null, null, null, null, null);
    }
}

function DisplayUserActionSaveFailureAlert(entryId, type, title, messageContent) {
    if (title == null || messageContent == null) {
        if (entryId == '') {
            DisplayUserActionAlert(Alert_Action_Enum.Create, (type || Alert_Type_Enum.Danger), null, null, null, null, null)
        } else {
            DisplayUserActionAlert(Alert_Action_Enum.Update, (type || Alert_Type_Enum.Danger), null, null, null, null, null)
        }
    } else {
        if (entryId == '') {
            DisplayUserActionAlert(Alert_Action_Enum.Create, (type || Alert_Type_Enum.Danger), title, messageContent, null, null, null)
        } else {
            DisplayUserActionAlert(Alert_Action_Enum.Update, (type || Alert_Type_Enum.Danger), title, messageContent, null, null, null)
        }
    }
}

function DisplayUserActionDeleteFailureAlert(type, title, messageContent) {
    if (title == null || messageContent == null) {
        DisplayUserActionAlert(Alert_Action_Enum.Delete, (type || Alert_Type_Enum.Danger), null, null, null, null, null)
    } else {
        DisplayUserActionAlert(Alert_Action_Enum.Delete, (type || Alert_Type_Enum.Danger), title, messageContent, null, null, null)
    }
}

function AnimateInputFieldElement(fieldElement, animationClass, autoRemovalTime, repeatCount, repeatDelay) {
    if (fieldElement != null) {
        if (!$(fieldElement).hasClass(animationClass)) {
            $(fieldElement).addClass(animationClass);
        }

        if (autoRemovalTime != null && autoRemovalTime > 0) {
            setTimeout(function () {
                $(fieldElement).removeClass(animationClass);
            }, (((repeatCount || 0) * (repeatDelay || 0)) + autoRemovalTime));
        }

        if (repeatCount != null && repeatCount > 0 && repeatDelay != null && repeatDelay > 0) {
            setTimeout(function repeatAnimation() {
                $(fieldElement).removeClass(animationClass);
                setTimeout(function () {
                    $(fieldElement).addClass(animationClass);
                }, repeatDelay);
                repeatCount--;
                if (repeatCount > 0) {
                    setTimeout(repeatAnimation, repeatDelay);
                }
            }, repeatDelay);
        }
    }
}

function DisplayUserActionAlert(action, type, title, text, confirmButtonText, confirmButtonColor, timer, dismissAction, dismissActionParameters) {
    if (action == null || !(action == Alert_Action_Enum.Create || action == Alert_Action_Enum.Update || action == Alert_Action_Enum.Delete || action == Alert_Action_Enum.View || action == Alert_Action_Enum.Browse)) return;

    if (type == null || !(type == Alert_Type_Enum.Success || type == Alert_Type_Enum.Danger || type == Alert_Type_Enum.Warning || type == Alert_Type_Enum.Info ||
        type == Alert_Type_Enum.Primary || type == Alert_Type_Enum.Secondary || type == Alert_Type_Enum.Light || type == Alert_Type_Enum.Dark)) return;

    if (title == null) {
        if (type == Alert_Type_Enum.Success) title = 'Success';
        else if (type == Alert_Type_Enum.Danger) title = 'Error';
        else if (type == Alert_Type_Enum.Warning) title = 'Warning';
        else if (type == Alert_Type_Enum.Info) title = 'Info';
    }

    if (text == null) {
        if (action == Alert_Action_Enum.Create) {
            if (type == Alert_Type_Enum.Success) {
                text = 'Successfully created your record.';
            } else if (type == Alert_Type_Enum.Danger) {
                text = 'An error occurred while creating your record.';
            }
        } else if (action == Alert_Action_Enum.Update) {
            if (type == Alert_Type_Enum.Success) {
                text = 'Successfully updated your record.';
            } else if (type == Alert_Type_Enum.Danger) {
                text = 'An error occurred while updating your record.';
            }
        } else if (action == Alert_Action_Enum.Delete) {
            if (type == Alert_Type_Enum.Success) {
                text = 'Successfully deleted your record.';
            } else if (type == Alert_Type_Enum.Danger) {
                text = 'An error occurred while deleting your record.';
            }
        } else if (action == Alert_Action_Enum.View) {
            if (type == Alert_Type_Enum.Danger) {
                text = 'An error occurred while processing your request.';
            }
        }
    }

    if (confirmButtonColor == null) confirmButtonColor = '#294f75';

    if (confirmButtonText == null) {
        if (action == Alert_Action_Enum.Create || action == Alert_Action_Enum.Update || action == Alert_Action_Enum.Delete || action == Alert_Action_Enum.View || action == Alert_Action_Enum.Browse) confirmButtonText = 'Ok';
    }

    setTimeout(function () {
        if (Default_Alert_Display_Method == Alert_Display_Method_Enum.NiftyAlert) {
            if (timer == null) timer = Default_NiftyAlert_Timer;

            $.niftyNoty({
                type: type,
                container: 'floating',
                title: title,
                message: text,
                closeBtn: true,
                floating: {
                    position: "top-right",
                    animationIn: "lightSpeedIn",
                    animationOut: "lightSpeedOut"
                },
                timer: timer
            });
        } else {
            if (!(type == Alert_Type_Enum.Success || type == Alert_Type_Enum.Danger || type == Alert_Type_Enum.Warning || type == Alert_Type_Enum.Info)) return;

            if (timer == null) {
                var alertContentWordCount = GetWordsCountInText(text);
                var additionalTimeBasedOnContent = (alertContentWordCount > 12 ? (((alertContentWordCount - 12) / 3) * 1000) : 0);

                if (type == Alert_Type_Enum.Success) {
                    timer = Default_SweetAlert_Short_Timer + additionalTimeBasedOnContent;
                } else if (type == Alert_Type_Enum.Warning || type == Alert_Type_Enum.Info) {
                    timer = Default_SweetAlert_Medium_Timer + additionalTimeBasedOnContent;
                } else if (type == Alert_Type_Enum.Danger) {
                    timer = Default_SweetAlert_Long_Timer + additionalTimeBasedOnContent;
                }
            }

            if (type == Alert_Type_Enum.Danger) type = 'error';

            if (Default_SweetAlert_Version == SweetAlert_Version_Enum.SweetAlert1) {
                swal({
                    title: title,
                    text: text,
                    type: type,
                    timer: timer,
                    showCancelButton: false,
                    confirmButtonColor: confirmButtonColor,
                    confirmButtonText: confirmButtonText
                }, function (result) {
                    if (result == null) {
                        swal.close();
                    }
                    if (dismissAction != null) {
                        if (dismissActionParameters != null) {
                            dismissAction(...dismissActionParameters);
                        } else {
                            dismissAction();
                        }
                    }
                });
            } else if (Default_SweetAlert_Version == SweetAlert_Version_Enum.SweetAlert2) {
                Swal.fire({
                    title: title,
                    text: text,
                    type: type,
                    timer: timer,
                    showCancelButton: false,
                    confirmButtonColor: confirmButtonColor,
                    confirmButtonText: confirmButtonText
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.overlay || result.dismiss === Swal.DismissReason.cancel ||
                        result.dismiss === Swal.DismissReason.close || result.dismiss === Swal.DismissReason.timer || result.dismiss === Swal.DismissReason.esc) {
                        if (dismissAction != null) {
                            if (dismissActionParameters != null) {
                                dismissAction(...dismissActionParameters);
                            } else {
                                dismissAction();
                            }
                        }
                    }
                });
            }
        }
    }, 350);
}

function DisplayConfirmationAlert(action, type, title, text, confirmButtonText, confirmButtonColor, confirmAction, confirmActionParameters, showCancelButton, cancelButtonText, cancelButtonColor, cancelAction, cancelActionParameters, entryName) {
    debugger

    if (action == null || !(action == Alert_Action_Enum.Create || action == Alert_Action_Enum.Update || action == Alert_Action_Enum.Delete)) return;

    if (type == null || !(type == Alert_Type_Enum.Success || type == Alert_Type_Enum.Danger || type == Alert_Type_Enum.Warning || type == Alert_Type_Enum.Info ||
        type == Alert_Type_Enum.Primary || type == Alert_Type_Enum.Secondary || type == Alert_Type_Enum.Light || type == Alert_Type_Enum.Dark)) return;

    if (title == null) {
        if (action == Alert_Action_Enum.Delete) {
            title = 'Delete Confirmation';
        } else if (action == Alert_Action_Enum.Create) {
            title = 'Create Confirmation';
        } else if (action == Alert_Action_Enum.Update) {
            title = 'Update Confirmation';
        }
    }

    if (text == null) {
        if (entryName == null) {
            if (action == Alert_Action_Enum.Delete) text = 'Are you sure want to delete this record!';
            else if (action == Alert_Action_Enum.Update) text = 'Are you sure want to update this record!';
            else if (action == Alert_Action_Enum.Create) text = 'Are you sure want create this record!';
        } else {
            if (action == Alert_Action_Enum.Delete) text = 'You are about to delete the ' + entryName.toLowerCase() + '. This action cannot be undone. Are you sure you want to proceed?';
            else if (action == Alert_Action_Enum.Update) text = 'You are about to update the ' + entryName.toLowerCase() + '. This action cannot be undone. Are you sure you want to proceed?';
            else if (action == Alert_Action_Enum.Create) text = 'You are about to create the ' + entryName.toLowerCase() + '. This action cannot be undone. Are you sure you want to proceed?';
        }
    }

    if (showCancelButton == null) showCancelButton = true;

    if (cancelButtonColor == null) cancelButtonColor = '#d33';

    if (confirmButtonColor == null) confirmButtonColor = '#294f75';

    if (cancelButtonText == null) {
        if (action == Alert_Action_Enum.Delete || action == Alert_Action_Enum.Update || action == Alert_Action_Enum.Create) cancelButtonText = 'No';
    }

    if (confirmButtonText == null) {
        if (action == Alert_Action_Enum.Delete) confirmButtonText = 'Yes, delete it!';
        else if (action == Alert_Action_Enum.Update) confirmButtonText = 'Yes, update it!';
        else if (action == Alert_Action_Enum.Create) confirmButtonText = 'Yes, create it!';
    }

    if (Default_SweetAlert_Version == SweetAlert_Version_Enum.SweetAlert1) {
        swal({
            title: title,
            text: text,
            type: type,
            showCancelButton: showCancelButton,
            cancelButtonColor: cancelButtonColor,
            cancelButtonText: cancelButtonText,
            confirmButtonColor: confirmButtonColor,
            confirmButtonText: confirmButtonText
        }, function (result) {
            if (result == true) {
                if (confirmActionParameters != null) {
                    confirmAction(...confirmActionParameters);
                } else {
                    confirmAction();
                }
            } else if (result == false) {
                if (typeof cancelAction === 'function') {
                    if (confirmActionParameters != null) {
                        cancelAction(...cancelActionParameters);
                    } else {
                        cancelAction();
                    }
                }
            }
        });
    } else if (Default_SweetAlert_Version == SweetAlert_Version_Enum.SweetAlert2) {
        Swal.fire({
            title: title,
            text: text,
            type: type,
            showCancelButton: true,
            cancelButtonColor: cancelButtonColor,
            cancelButtonText: cancelButtonText,
            confirmButtonColor: confirmButtonColor,
            confirmButtonText: confirmButtonText
        }).then((result) => {
            if (result.value == true) {
                if (confirmActionParameters != null) {
                    confirmAction(confirmActionParameters);
                } else {
                    confirmAction();
                }
            } else if (result.value == false) {
                if (typeof cancelAction === 'function') {
                    if (confirmActionParameters != null) {
                        cancelAction(cancelActionParameters);
                    } else {
                        cancelAction();
                    }
                }
            }
        });
    }
}

function FormatIntegerNumber(input, negative, thousandSeperator, nullAllowed) {
    var value = input.value;
    if (thousandSeperator == false) value = value.replace(',', '');
    if (negative == false) value = value.replace(/[^0-9]/g, '');
    else if (negative == true) value = value.replace(/[^0-9,-]/g, '');
    if (value != "") {
        var intVal = parseInt(value.replace(/[^\d-]/g, '').trim());
        if (!isNaN(intVal)) {
            if (thousandSeperator) {
                var formattedNumber = intVal.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                });
                input.value = formattedNumber;
            } else {
                input.value = intVal;
            }
        }
    } else {
        if (nullAllowed == false) input.value = "0";
        else input.value = '';
    }
}

function FormatDecimalPoints(input, fractions, negative, nullAllowed) {
    var value = input.value;
    if (negative == false) value = value.replace(/[^0-9,.]/g, '');
    else if (negative == true) value = value.replace(/[^0-9,.-]/g, '');
    if (value != "") {
        var decimalVal = parseFloat(value.replace(/[^\d.-]/g, '').trim());
        if (!isNaN(decimalVal)) {
            var formattedNumber = decimalVal.toLocaleString("en-US", {
                minimumFractionDigits: fractions,
                maximumFractionDigits: fractions
            });
            input.value = formattedNumber;
        }
    } else {
        if (nullAllowed == false) input.value = "0.00";
        else input.value = '';
    }
}

function FormatInputDateTimeStringAsDateTime(dateTimeValue) {
    if (!dateTimeValue.includes('T')) {
        dateTimeValue += 'T00:00:00';
    }

    return new Date(dateTimeValue);
}

function parseBool(value) {
    if (typeof (value) === "string") {
        value = value.trim().toLowerCase();
    }

    switch (value) {
        case true:
        case "true":
        case 1:
        case "1":
        case "on":
        case "yes":
            return true;
        default:
            return false;
    }
}

var numberRegex = /[0-9]/g;
var wholeNumbersOnlyRegex = /^[0-9]+$/;
var upperCaseRegex = /[A-Z]/g;
var lowerCaseRegex = /[a-z]/g;
var lettersOnlyRegex = /^[a-zA-Z]+$/;
var lettersNumbersOnlyRegex = /^[a-zA-Z0-9]+$/;
var lettersSpacesOnlyRegex = /^[a-zA-Z\s]+$/;
var lettersSpacesPeriodsOnlyRegex = /^[a-zA-Z\s]+$/;
var specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g;
var phoneNumberRegex = /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
var ipAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
var emailAddressRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

function isValidIPAddress(ipAddr) {
    return ipAddressRegex.test(ipAddr);
}

function validateLettersOnly(str) {
    return lettersOnlyRegex.test(str);
}

function isStringContainsUppercaseLetters(str) {
    return str.match(upperCaseRegex)
}

function isStringContainsLowercaseLetters(str) {
    return str.match(lowerCaseRegex)
}

function validateLettersSpacesOnly(str) {
    return lettersSpacesOnlyRegex.test(str);
}

function validateLettersSpacesPeriodsOnly(str) {
    return lettersSpacesPeriodsOnlyRegex.test(str);
}

function validateLettersNumbersOnly(str) {
    return lettersNumbersOnlyRegex.test(str);
}

function validateWholeNumbersOnly(str) {
    return wholeNumbersOnlyRegex.test(str);
}

function isStringContainsNumbers(str) {
    return str.match(numberRegex)
}

function validatePhoneNumber(str) {
    return phoneNumberRegex.test(str);
}

function validateEmailAddress(email) {
    if (emailAddressRegex.test(email)) {
        return (true)
    }
    else {
        return false
    }
}

function isStringContainsSpecialCharacters(str) {
    return str.match(specialCharRegex)
}

function isValidDate(value) {
    var dateVal = value.split('/')[1] + '/' + value.split('/')[0] + '/' + value.split('/')[2];
    var regex = /^(?=\d)(?:(?:31(?!.(?:0?[2469]|11))|(?:30|29)(?!.0?2)|29(?=.0?2.(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(?:\x20|$))|(?:2[0-8]|1\d|0?[1-9]))([-.\/])(?:1[012]|0?[1-9])\1(?:1[6-9]|[2-9]\d)?\d\d(?:(?=\x20\d)\x20|$))?(((0?[1-9]|1[012])(:[0-5]\d){0,2}(\x20[AP]M))|([01]\d|2[0-3])(:[0-5]\d){1,2})?$/;
    return regex.test(dateVal);
}




//Sameera Perera
function initAutoTrim(selectors) {
    var selector = Array.isArray(selectors) ? selectors.join(', ') : selectors;

    $(selector).on('blur', function () {
        var $input = $(this);
        var originalValue = $input.val();
        var trimmedValue = originalValue.trim();

        // Only update if the value has changed after trimming
        if (originalValue !== trimmedValue) {
            $input.val(trimmedValue);
        }
    });
}

// Auto-initialize for all inputs with 'auto-trim' class
$(document).ready(function () {
    initAutoTrim('.auto-trim');
});