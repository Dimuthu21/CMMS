$(function () {
    'use strict';

    // Get URLs from hidden fields
    var saveUrl = $('#saveUrl').val();
    var deleteUrl = $('#deleteUrl').val();
    var listUrl = $('#listUrl').val();

    // Show success message if exists
    var successMsg = $('#pageSuccessMessage').val();
    if (successMsg) {
        toastr.success(successMsg);
    }

    // Disable jQuery Validate for this form
    if ($.validator && $('#userForm').length) {
        $('#userForm').removeData('validator');
        $('#userForm').removeData('unobtrusiveValidation');
    }

    // Store validation state
    var validationState = {
        phoneNumberError: null,
        emailError: null,
        emailExistsError: null,
        userNameError: null,
        userNameCheckInProgress: false,
        emailCheckInProgress: false
    };

    // Prevent form submit via Enter key if validation fails
    $('#userForm').on('submit', function(e) {
        // Hide all validation messages by default
        hideAllValidationMessages();
        var validationErrors = validateForm();
        if (validationErrors.length > 0) {
            showValidationMessages(validationErrors);
            e.preventDefault();
            return false;
        }
    });

    // Save button click handler
    $('#btnSave').on('click', function (e) {
        e.preventDefault();

        // Hide all validation messages by default
        hideAllValidationMessages();

        // Client-side validation
        var validationErrors = validateForm();
        if (validationErrors.length > 0) {
            // Show validation messages for failed fields
            showValidationMessages(validationErrors);
            return false;
        }

        // Gather form data
        var formData = {
            UserId: $('#UserId').val() || '',
            UserCode: $('#UserCode').val().trim(),
            FirstName: $('#FirstName').val().trim(),
            LastName: $('#LastName').val().trim(),
            PhoneNumber: $('#PhoneNumber').val().trim(),
            Email: $('#Email').val().trim(),
            UserName: $('#UserName').val().trim(),
            Password: $('#Password').val(),
            ConfirmPassword: $('#ConfirmPassword').val(),
            UserRole: $('#UserRole').val(),
            UserStatus: $('#UserStatus').val(),
            Project: $('#Products').val() || ''
        };

        console.log('Form data to be sent:', formData);

        // Show loading indicator
        var $btn = $(this);
        //$btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...');

        // Get anti-forgery token
        var token = $('input[name="__RequestVerificationToken"]').val();

        // Send AJAX request
        $.ajax({
            url: saveUrl,
            type: 'POST',
            data: formData,
            headers: {
                'RequestVerificationToken': token
            },
            success: function (response) {
                console.log('Save response:', response);

                if (response.success) {
                    // Show success message
                    if (typeof toastr !== 'undefined') {
                        toastr.success(response.message || 'User saved successfully');
                    } else {
                        alert(response.message || 'User saved successfully');
                    }
                    // 1. Clear the form fields and reset form state
                    $('#userForm')[0].reset(); // Resets all form elements to their initial values

                    // 2. Manually clear hidden or non-standard fields if they need resetting
                    $('#UserId').val('');
                    $('#Products').val('');

                    // 3. Remove validation classes from Password and ConfirmPassword
                    $('#Password').removeClass('is-valid is-invalid');
                    $('#ConfirmPassword').removeClass('is-valid is-invalid');

                    // 4. Hide validation messages
                    hideAllValidationMessages();

                    // 5. Update the "Clear" button text back to "Clear" for a new entry
                    $('#btnClear').text('Clear');

                    // Reset validation state
                    validationState = {
                        phoneNumberError: null,
                        emailError: null,
                        userNameError: null,
                        userNameCheckInProgress: false
                    };

                    // Redirect to list page after short delay
                    //setTimeout(function () {
                    //    window.location.href = listUrl;
                    //}, 1500);
                } else {
                    // Show error message
                    if (typeof toastr !== 'undefined') {
                        toastr.error(response.message || 'Failed to save user');
                    } else {
                        alert(response.message || 'Failed to save user');
                    }
                    $btn.prop('disabled', false).html('Save');
                }
            },
            error: function (xhr, status, error) {
                console.error('Save error:', xhr.responseText);

                var errorMessage = 'An error occurred while saving the user';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    errorMessage = xhr.responseText;
                }

                if (typeof toastr !== 'undefined') {
                    toastr.error(errorMessage);
                } else {
                    alert(errorMessage);
                }
                $btn.prop('disabled', false).html('Save');
            }
        });
    });

    // Clear/Reset button click handler
    $('#btnClear').on('click', function (e) {
        e.preventDefault();

        var userId = $('#UserId').val();

        if (userId && userId !== '0' && userId !== '') {
            // Reset form to original values (for edit mode)
            window.location.reload();
        } else {
            // Clear all fields (for create mode)
            $('#userForm')[0].reset();
            $('#UserId').val('');
            $('#UserCode').val('');
            $('#FirstName').val('');
            $('#LastName').val('');
            $('#PhoneNumber').val('');
            $('#Email').val('');
            $('#UserName').val('');
            $('#Password').val('');
            $('#ConfirmPassword').val('');
            $('#UserRole').val('');
            $('#UserStatus').val('');
            $('#Products').val('');

            // Remove validation classes
            $('#Password').removeClass('is-valid is-invalid');
            $('#ConfirmPassword').removeClass('is-valid is-invalid');

            // Hide validation messages
            hideAllValidationMessages();

            // Reset validation state
            validationState = {
                phoneNumberError: null,
                emailError: null,
                userNameError: null,
                userNameCheckInProgress: false
            };
        }
    });

    // Helper function to hide all validation messages
    function hideAllValidationMessages() {
        $('#userCodeValidationMessage, #firstNameValidationMessage, #lastNameValidationMessage, #phoneNumberValidationMessage, #phoneNumberFormatMessage, #emailValidationMessage, #emailFormatMessage, #emailExistsMessage, #userNameValidationMessage, #userNameExistsMessage, #passwordValidationMessage, #confirmPasswordValidationMessage, #userRoleValidationMessage, #userStatusValidationMessage').hide();
    }

    // Form validation function
    function validateForm() {
        var errors = [];

        // User Code validation
        var userCode = $('#UserCode').val().trim();
        if (!userCode) {
            errors.push('userCode');
        }

        // First Name validation
        var firstName = $('#FirstName').val().trim();
        if (!firstName) {
            errors.push('firstName');
        }

        // Last Name validation
        var lastName = $('#LastName').val().trim();
        if (!lastName) {
            errors.push('lastName');
        }

        // Phone Number validation
        var phoneNumber = $('#PhoneNumber').val().trim();
        if (!phoneNumber) {
            errors.push({ type: 'phoneNumber', errorType: 'required' });
        } else if (!isValidPhoneNumber(phoneNumber)) {
            errors.push({ type: 'phoneNumber', errorType: 'format' });
        }

        // Email validation
        var email = $('#Email').val().trim();
        if (!email) {
            errors.push({ type: 'email', errorType: 'required' });
        } else if (!isValidEmail(email)) {
            errors.push({ type: 'email', errorType: 'format' });
        } else if (validationState.emailExistsError) {
            errors.push({ type: 'email', errorType: 'exists' });
        }

        // Username validation
        var userName = $('#UserName').val().trim();
        if (!userName) {
            errors.push('userName');
        } else if (validationState.userNameError) {
            errors.push({ type: 'userName', errorType: 'exists' });
        }

        // Password validation (only for new users or if password is entered)
        var userId = $('#UserId').val();
        var password = $('#Password').val();
        var confirmPassword = $('#ConfirmPassword').val();

        if (!userId || userId === '0' || userId === '' || password) {
            if (!password) {
                errors.push('password');
            } else if (!isValidPassword(password)) {
                errors.push('password');
            }

            // Confirm password validation
            if (!confirmPassword) {
                errors.push('confirmPassword');
            } else if (password !== confirmPassword) {
                errors.push('confirmPassword');
            }
        }

        // User Role validation
        var userRole = $('#UserRole').val();
        if (!userRole) {
            errors.push('userRole');
        }

        // User Status validation
        var userStatus = $('#UserStatus').val();
        if (!userStatus) {
            errors.push('userStatus');
        }

        return errors;
    }

    // Helper function to show validation messages
    function showValidationMessages(errors) {
        errors.forEach(function(error) {
            var errorType = error.type || error;
            var errorSubType = error.errorType || null;

            switch(errorType) {
                case 'userCode':
                    $('#userCodeValidationMessage').show();
                    break;
                case 'firstName':
                    $('#firstNameValidationMessage').show();
                    break;
                case 'lastName':
                    $('#lastNameValidationMessage').show();
                    break;
                case 'phoneNumber':
                    if (errorSubType === 'format') {
                        $('#phoneNumberFormatMessage').show();
                    } else {
                        $('#phoneNumberValidationMessage').show();
                    }
                    break;
                case 'email':
                    if (errorSubType === 'format') {
                        $('#emailFormatMessage').show();
                    } else if (errorSubType === 'exists') {
                        $('#emailExistsMessage').show();
                    } else {
                        $('#emailValidationMessage').show();
                    }
                    break;
                case 'userName':
                    if (errorSubType === 'exists') {
                        $('#userNameExistsMessage').show();
                    } else {
                        $('#userNameValidationMessage').show();
                    }
                    break;
                case 'password':
                    $('#passwordValidationMessage').show();
                    break;
                case 'confirmPassword':
                    $('#confirmPasswordValidationMessage').show();
                    break;
                case 'userRole':
                    $('#userRoleValidationMessage').show();
                    break;
                case 'userStatus':
                    $('#userStatusValidationMessage').show();
                    break;
            }
        });
    }

    // Email validation helper
    function isValidEmail(email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password validation helper
    function isValidPassword(password) {
        if (password.length < 8 || password.length > 20) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        if (!/[^A-Za-z0-9]/.test(password)) return false;
        if (/\s/.test(password)) return false;
        return true;
    }

    // Phone number validation helper
    function isValidPhoneNumber(phoneNumber) {
        // Allows for 8 to 15 digits (a common range for international numbers)
        // and optionally allows for spaces, dashes, or parentheses.
        var phoneRegex = /^\+?[\d\s-()]{8,15}$/;

        // Optional: Remove non-digit characters before testing for length/format
        var cleanNumber = phoneNumber.replace(/[\s-()]/g, '');

        // Check if the cleaned number is between 8 and 15 digits AND matches the regex pattern.
        return cleanNumber.length >= 8 && cleanNumber.length <= 15 && phoneRegex.test(phoneNumber);
    }

    // Use delegated handlers so focusout/input events fire reliably
    $(document).on('focusout', '#UserCode', function () {
        if ($(this).val().trim() === '') {
            $('#userCodeValidationMessage').show();
        }
    });
    $(document).on('focusout', '#FirstName', function () {
        if ($(this).val().trim() === '') {
            $('#firstNameValidationMessage').show();
        }
    });
    $(document).on('focusout', '#LastName', function () {
        if ($(this).val().trim() === '') {
            $('#lastNameValidationMessage').show();
        }
    });
    $(document).on('focusout', '#PhoneNumber', function () {
        var phoneNumber = $(this).val().trim();
        if (phoneNumber === '') {
            $('#phoneNumberFormatMessage').hide();
            $('#phoneNumberValidationMessage').show();
        } else if (!isValidPhoneNumber(phoneNumber)) {
            $('#phoneNumberValidationMessage').hide();
            $('#phoneNumberFormatMessage').show();
        }
    });
    $(document).on('focusout', '#Email', function () {
        var email = $(this).val().trim();
        if (email === '') {
            $('#emailFormatMessage').hide();
            $('#emailValidationMessage').show();
            $('#emailExistsMessage').hide();
            validationState.emailExistsError = false;
        } else if (!isValidEmail(email)) {
            $('#emailValidationMessage').hide();
            $('#emailFormatMessage').show();
            $('#emailExistsMessage').hide();
            validationState.emailExistsError = false;
        } else {
            $('#emailValidationMessage').hide();
            $('#emailFormatMessage').hide();
            checkEmailAvailability(email);
        }
    });

    // Debounce timer for username check
    var userNameCheckTimeout;

    $(document).on('focusout', '#UserName', function () {
        var userName = $(this).val().trim();
        if (userName === '') {
            $('#userNameValidationMessage').show();
            $('#userNameExistsMessage').hide();
            validationState.userNameError = false;
        } else {
            $('#userNameValidationMessage').hide();
            checkUserNameAvailability(userName);
        }
    });

    // Check username availability
    function checkUserNameAvailability(userName) {
        var currentUserId = $('#UserId').val();

        validationState.userNameCheckInProgress = true;

        $.ajax({
            url: '/Users/CheckUserNameAvailability',
            type: 'GET',
            data: {
                userName: userName,
                userId: currentUserId || ''
            },
            success: function (response) {
                validationState.userNameCheckInProgress = false;

                if (response.available) {
                    $('#userNameExistsMessage').hide();
                    validationState.userNameError = false;
                } else {
                    $('#userNameExistsMessage').show();
                    validationState.userNameError = true;
                }
            },
            error: function () {
                validationState.userNameCheckInProgress = false;
                console.error('Error checking username availability');
            }
        });
    }

    // Check email availability
    function checkEmailAvailability(email) {
        var currentUserId = $('#UserId').val();

        validationState.emailCheckInProgress = true;

        $.ajax({
            url: '/Users/CheckEmailAvailability',
            type: 'GET',
            data: {
                email: email,
                userId: currentUserId || ''
            },
            success: function (response) {
                validationState.emailCheckInProgress = false;

                if (response.available) {
                    $('#emailExistsMessage').hide();
                    validationState.emailExistsError = false;
                } else {
                    $('#emailExistsMessage').show();
                    validationState.emailExistsError = true;
                }
            },
            error: function () {
                validationState.emailCheckInProgress = false;
                console.error('Error checking email availability');
            }
        });
    }

    $(document).on('focusout', '#Password', function () {
        if ($(this).val() === '') {
            $('#passwordValidationMessage').show();
        }
    });
    $(document).on('focusout', '#ConfirmPassword', function () {
        if ($(this).val() === '') {
            $('#confirmPasswordValidationMessage').show();
        }
    });
    $(document).on('focusout change', '#UserRole', function () {
        var $el = $(this);
        if ($el.val() === '') {
            $('#userRoleValidationMessage').show();
        }
    });
    $(document).on('focusout change', '#UserStatus', function () {
        var $el = $(this);
        if ($el.val() === '') {
            $('#userStatusValidationMessage').show();
        }
    });

    // Extra: when user clicks/touches another element, if an input had focus and is empty, show its required message immediately
    $(document).on('mousedown touchstart', function (e) {
        var active = document.activeElement;
        if (!active) return;
        var $active = $(active);
        var id = active.id;

        switch(id) {
            case 'UserCode':
                if ($active.val().trim() === '') $('#userCodeValidationMessage').show();
                break;
            case 'FirstName':
                if ($active.val().trim() === '') $('#firstNameValidationMessage').show();
                break;
            case 'LastName':
                if ($active.val().trim() === '') $('#lastNameValidationMessage').show();
                break;
            case 'PhoneNumber':
                var phoneNumber = $active.val().trim();
                if (phoneNumber === '') {
                    $('#phoneNumberFormatMessage').hide();
                    $('#phoneNumberValidationMessage').show();
                } else if (!isValidPhoneNumber(phoneNumber)) {
                    $('#phoneNumberValidationMessage').hide();
                    $('#phoneNumberFormatMessage').show();
                }
                break;
            case 'Email':
                var email = $active.val().trim();
                if (email === '') {
                    $('#emailFormatMessage').hide();
                    $('#emailValidationMessage').show();
                    $('#emailExistsMessage').hide();
                    validationState.emailExistsError = false;
                } else if (!isValidEmail(email)) {
                    $('#emailValidationMessage').hide();
                    $('#emailFormatMessage').show();
                    $('#emailExistsMessage').hide();
                    validationState.emailExistsError = false;
                }
                break;
            case 'UserName':
                if ($active.val().trim() === '') {
                    $('#userNameValidationMessage').show();
                    $('#userNameExistsMessage').hide();
                    validationState.userNameError = false;
                }
                break;
            case 'Password':
                if ($active.val() === '') $('#passwordValidationMessage').show();
                break;
            case 'ConfirmPassword':
                if ($active.val() === '') $('#confirmPasswordValidationMessage').show();
                break;
            case 'UserRole':
                if ($active.val() === '') $('#userRoleValidationMessage').show();
                break;
            case 'UserStatus':
                if ($active.val() === '') $('#userStatusValidationMessage').show();
                break;
        }
    });

    // Hide validation messages on input/change (delegated)
    $(document).on('input', '#UserCode', function () {
        if ($(this).val().trim() !== '') {
            $('#userCodeValidationMessage').hide();
        }
    });
    $(document).on('input', '#FirstName', function () {
        if ($(this).val().trim() !== '') {
            $('#firstNameValidationMessage').hide();
        }
    });
    $(document).on('input', '#LastName', function () {
        if ($(this).val().trim() !== '') {
            $('#lastNameValidationMessage').hide();
        }
    });
    $(document).on('input', '#PhoneNumber', function () {
        var phoneNumber = $(this).val().trim();
        if (phoneNumber !== '') {
            if (isValidPhoneNumber(phoneNumber)) {
                $('#phoneNumberValidationMessage').hide();
                $('#phoneNumberFormatMessage').hide();
            } else {
                $('#phoneNumberValidationMessage').hide();
                $('#phoneNumberFormatMessage').show();
            }
        } else {
            $('#phoneNumberValidationMessage').hide();
            $('#phoneNumberFormatMessage').hide();
        }
    });
    $(document).on('input', '#Email', function () {
        var email = $(this).val().trim();
        if (email !== '') {
            if (isValidEmail(email)) {
                $('#emailValidationMessage').hide();
                $('#emailFormatMessage').hide();
                // Clear exists message until re-validation
                $('#emailExistsMessage').hide();
                validationState.emailExistsError = false;
            } else {
                $('#emailValidationMessage').hide();
                $('#emailFormatMessage').show();
                $('#emailExistsMessage').hide();
                validationState.emailExistsError = false;
            }
        } else {
            $('#emailValidationMessage').hide();
            $('#emailFormatMessage').hide();
            $('#emailExistsMessage').hide();
            validationState.emailExistsError = false;
        }
    });
    $(document).on('input', '#UserName', function () {
        var userName = $(this).val().trim();
        if (userName !== '') {
            $('#userNameValidationMessage').hide();
            // Clear exists message until re-validation
            $('#userNameExistsMessage').hide();
            validationState.userNameError = false;
        }
    });
    $(document).on('input', '#Password', function () {
        if ($(this).val() !== '') {
            $('#passwordValidationMessage').hide();
        }
    });
    $(document).on('input', '#ConfirmPassword', function () {
        if ($(this).val() !== '') {
            $('#confirmPasswordValidationMessage').hide();
        }
    });
    $(document).on('change', '#UserRole', function () {
        if ($(this).val() !== '') {
            $('#userRoleValidationMessage').hide();
        }
    });
    $(document).on('change', '#UserStatus', function () {
        if ($(this).val() !== '') {
            $('#userStatusValidationMessage').hide();
        }
    });

    // Show/Hide password
    $('#toggleShowPwd').on('click', function(e){
        e.preventDefault();
        var p=$('#Password');
        p.attr('type', p.attr('type')==='password' ? 'text' : 'password');
        $(this).text(p.attr('type')==='password' ? 'Show Password' : 'Hide Password');
    });

    // Password requirements popup
    $(document).on('focus', '#Password', function(){
        var pos=$(this).position();
        $('#pwReq').css({ top: pos.top + $(this).outerHeight()+6, left: pos.left }).show();
    });
    $(document).on('blur', '#Password', function(){
        setTimeout(()=>$('#pwReq').hide(),200);
    });

    // Validate password on input
    $(document).on('input', '#Password', function(){
        var v=$(this).val();
        function setRequirement($el, isValid){
            $el.toggleClass('pw-valid', !!isValid);
            $el.toggleClass('pw-invalid', !isValid);
        }
        setRequirement($('#req-length'), v.length>=8 && v.length<=20);
        setRequirement($('#req-symbol'), /[^A-Za-z0-9]/.test(v));
        setRequirement($('#req-upper'), /[A-Z]/.test(v));
        setRequirement($('#req-number'), /[0-9]/.test(v));
        setRequirement($('#req-space'), !/\s/.test(v));
    });

    // Confirm password match
    $(document).on('input', '#ConfirmPassword', function(){
        var match = $('#Password').val() === $(this).val();
        if(match){
            $(this).removeClass('is-invalid').addClass('is-valid');
        } else {
            $(this).removeClass('is-valid').addClass('is-invalid');
        }
    });

    // Product-wise user totals
    var productTotals = { 'Product A':12, 'Product B':7 };
    var productCapacities = { 'Product A':20, 'Product B':15 };

    function updateProductTotalsUI(){
        var a = productTotals['Product A'] ||0;
        var b = productTotals['Product B'] ||0;
        var capA = productCapacities['Product A'] ||100;
        var capB = productCapacities['Product B'] ||100;
        var totalAvailable = a + b;
        var totalCapacity = capA + capB;

        $('#prodAcount').text(a + ' / ' + capA + ' Users');
        $('#prodBcount').text(b + ' / ' + capB + ' Users');
        $('#prodAbar').css('width', Math.min(100, Math.round((a / capA) *100)) + '%');
        $('#prodBbar').css('width', Math.min(100, Math.round((b / capB) *100)) + '%');
        $('#totalUsersText').text(totalAvailable + ' / ' + totalCapacity + ' Users');
        $('#totalUsersSub').text('Available / Capacity (product-wise)');
    }

    updateProductTotalsUI();

    // Load total users data from server
    $.getJSON($('#userForm').length ? $('#userForm').attr('action').replace('UserCreate','GetTotalUsers') : '/Users/GetTotalUsers').done(function(data){
        if(data){
            if(data.productTotals){ productTotals = data.productTotals; }
            if(data.productCapacities){ productCapacities = data.productCapacities; }
            updateProductTotalsUI();
        }
    });
});