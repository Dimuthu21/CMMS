jQuery(function ($) {
    var $form = $('#itemCategoryForm');
    var $code = $('#Code');
    var $toggle = $('#btnToggleCode');

    function setValidationMessage(fieldName, message) {
        var $msg = $("[data-valmsg-for='" + fieldName + "']");
        if ($msg.length) {
            $msg.text(message);
        } else {
            var $fld = $("[name='" + fieldName + "']");
            if ($fld.length) {
                var $f = $fld.closest('.form-group').find('.text-danger');
                if ($f.length) $f.text(message);
            }
        }
    }

    function clearValidationMessages() {
        $("[data-valmsg-for]").text('');
        $('.text-danger').not('[data-valmsg-for]').text('');
        $('.input-validation-error').removeClass('input-validation-error');
    }

    function clearFieldValidation(fieldName) {
        if (!fieldName) return;
        $("[data-valmsg-for='" + fieldName + "']").text('');

        $("[data-valmsg-for]").each(function () {
            var fn = $(this).attr('data-valmsg-for');
            if (fn && fn.split('.').pop() === fieldName) {
                $(this).text('');
            }
        });

        $("[name='" + fieldName + "'], #" + fieldName).removeClass('input-validation-error');
        var $fld = $("[name='" + fieldName + "']");
        if ($fld.length) {
            var $f = $fld.closest('.form-group').find('.text-danger');
            if ($f.length) $f.text('');
        }
    }

    function showServerErrors(errors) {
        try {
            if (!errors) return;
            Object.keys(errors).forEach(function (key) {
                var messages = errors[key];
                if (messages && messages.length) {
                    var msg = messages.join(' ');
                    setValidationMessage(key, msg);
                    var shortKey = key.split('.').pop();
                    if (shortKey !== key) setValidationMessage(shortKey, msg);
                }
            });
        } catch (e) {
            console.error('Error showing server validation messages', e);
        }
    }

    function updateDeleteButton() {
        var id = parseInt($('#ItemCategoryId').val() || 0, 10);
        if (!id || id <= 0) {
            $('#btnDelete').hide();
        } else {
            $('#btnDelete').show();
        }
    }

    function ensureHiddenCode(val) {
        var $hidden = $('#Code_disabled_hidden');
        if ($hidden.length) {
            $hidden.val(val);
        } else {
            $('<input>').attr({ type: 'hidden', id: 'Code_disabled_hidden', name: 'Code', value: val }).appendTo($form);
        }
    }

    function removeHiddenCode() {
        $('#Code_disabled_hidden').remove();
    }

    var originalCode = '';
    var preEditCode = '';

    function fetchNextCode() {
        var url = $('#nextCodeUrl').length ? $('#nextCodeUrl').val() : null;
        if (!url) {
            console.error('nextCodeUrl hidden input not found');
            return;
        }

        $.getJSON(url).done(function (resp) {
            if (resp && resp.success && resp.code) {
                originalCode = resp.code;
                preEditCode = resp.code;
                $code.val(resp.code);
                if ($code.prop('disabled')) ensureHiddenCode(resp.code);
            } else {
                console.warn('Could not retrieve next code', resp);
            }
        }).fail(function (xhr) {
            console.error('Failed to fetch next code', xhr.responseText);
        });
    }

    function setCodeEditable(editable) {
        if (!$code.length) return;

        if (editable) {
            preEditCode = $code.val() || '';
            $code.prop('readonly', false).removeAttr('readonly');
            $code.prop('disabled', false).removeClass('readonly-code').focus();
            removeHiddenCode();

            if ($toggle.is(':checkbox')) {
                $toggle.prop('checked', true);
            } else {
                $toggle.text('Lock');
            }
        } else {
            $code.prop('readonly', true).attr('readonly', 'readonly');
            $code.prop('disabled', true).addClass('readonly-code');

            if (preEditCode) {
                $code.val(preEditCode);
            } else if (originalCode) {
                $code.val(originalCode);
            }

            ensureHiddenCode($code.val());

            if ($toggle.is(':checkbox')) {
                $toggle.prop('checked', false);
            } else {
                $toggle.text('Edit');
            }
        }
    }

    function clearForm() {
        $form.find('input[type="text"]').val('');
        $form.find('textarea').val('');
        $form.find('select').each(function () { this.selectedIndex = 0; });
        $form.find('input[type="hidden"][name="ItemCategoryId"]').val('0');
        clearValidationMessages();
        updateDeleteButton();
        if ($toggle.is(':checkbox')) $toggle.prop('checked', false);
        originalCode = '';
        preEditCode = '';
        removeHiddenCode();
        fetchNextCode();
        setCodeEditable(false);
    }

    function trimInputs() {
        if ($code.length) {
            var c = $code.val() || '';
            var tc = $.trim(c);
            if (c !== tc) $code.val(tc);
            if ($code.prop('disabled')) ensureHiddenCode(tc);
        }
        var $name = $('#Name');
        if ($name.length) {
            var n = $name.val() || '';
            var tn = $.trim(n);
            if (n !== tn) $name.val(tn);
        }
    }

    function validateItemCategory() {
        $('[data-valmsg-for]').text('');

        var $code = $('#Code');
        var code = ($code.length ? $code.val() : '').trim();
        var name = ($('#Name').length ? $('#Name').val() : '').trim();
        var status = ($('#StatusId').length ? $('#StatusId').val() : '').toString();
        var existingId = parseInt($('#ItemCategoryId').val() || 0, 10);

        var isValid = true;

        if (!code) {
            setValidationMessage('Code', 'Code is required.');
            isValid = false;
        } else if (code.length > 10) {
            setValidationMessage('Code', 'Code cannot exceed 10 characters.');
            isValid = false;
        }

        if (!name) {
            setValidationMessage('Name', 'Name is required.');
            isValid = false;
        } else if (name.length > 50) {
            setValidationMessage('Name', 'Name cannot exceed 50 characters.');
            isValid = false;
        }

        if (existingId && existingId > 0 && status === '3') {
            setValidationMessage('StatusId', 'Cannot save a deleted item. Change status to Active or Inactive.');
            isValid = false;
        }

        if (!status || (status !== '1' && status !== '2')) {
            setValidationMessage('StatusId', 'Status is required.');
            isValid = false;
        }

        return isValid;
    }

    function saveItemCategory() {
        trimInputs();
        clearValidationMessages();

        if (!validateItemCategory()) return;

        var url = $('#saveUrl').length ? $('#saveUrl').val() : ($form.length ? $form.attr('action') : null);
        if (!url) {
            console.error('saveUrl not found');
            return;
        }

        var listUrl = $('#listUrl').length ? $('#listUrl').val() : null;
        var data = $form.serialize();

        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            dataType: 'json',
            beforeSend: function () {
                $('#btnSave').prop('disabled', true).text('Saving...');
            },
            success: function (resp) {
                if (resp && typeof resp === 'object' && resp.success !== undefined) {
                    if (resp.success) {
                        var successMsg = resp.message || 'Inserted data successfully!';
                        if (window.Swal) {
                            Swal.fire({ icon: 'success', title: successMsg }).then(function () {
                                if (listUrl) window.location.href = listUrl; else location.reload();
                            });
                        } else if (window.toastr) {
                            toastr.success(successMsg);
                            if (listUrl) window.location.href = listUrl; else location.reload();
                        } else {
                            alert(successMsg);
                            if (listUrl) window.location.href = listUrl; else location.reload();
                        }
                    } else {
                        if (resp.errors && Object.keys(resp.errors).length) {
                            showServerErrors(resp.errors);
                            var topMsg = resp.message;
                            if (window.Swal) Swal.fire({ icon: 'error', title: 'Validation error', text: topMsg });
                            else alert(topMsg);
                        } else {
                            var msg = resp.message || 'Save failed';
                            if (window.Swal) Swal.fire({ icon: 'error', title: 'Error', text: msg });
                            else if (window.toastr) toastr.error(msg);
                            else alert(msg);
                        }
                    }
                } else {
                    location.reload();
                }
            },
            error: function (xhr) {
                var msg = 'Save request failed. See console for details.';
                try {
                    var json = JSON.parse(xhr.responseText);
                    if (json && json.message) msg = json.message;
                } catch (e) { }
                if (window.Swal) Swal.fire({ icon: 'error', title: 'Error', text: msg });
                else alert(msg);
                console.error('Save request failed:', xhr.status, xhr.responseText);
            },
            complete: function () {
                $('#btnSave').prop('disabled', false).text('Save');
                updateDeleteButton();
            }
        });
    }

    // Toggle handler
    $toggle.off('click.toggleCode change.toggleCode').on('click.toggleCode change.toggleCode', function (e) {
        var isCheckbox = $toggle.is(':checkbox');
        if (isCheckbox) {
            setTimeout(function () {
                setCodeEditable($toggle.prop('checked'));
            }, 0);
        } else {
            e.preventDefault();
            setCodeEditable($code.prop('disabled'));
        }
    });

    // Delete handler
    $('#btnDelete').off('click.delete').on('click.delete', function (e) {
        e.preventDefault();
        var id = parseInt($('input[name="ItemCategoryId"]').val() || 0);
        if (!id || id <= 0) {
            if (window.Swal) Swal.fire({ icon: 'error', title: 'No selection', text: 'No item selected to delete.' });
            else alert('No item selected to delete.');
            return;
        }

        var token = $form.find('input[name="__RequestVerificationToken"]').val();
        var url = $('#deleteUrl').val();
        var listUrl = $('#listUrl').val();

        function doDelete() {
            $.post(url, { id: id, __RequestVerificationToken: token })
                .done(function (resp) {
                    if (resp && resp.success) {
                        if (window.Swal) {
                            Swal.fire({ icon: 'success', title: 'Item deleted successfully' }).then(function () {
                                if (listUrl) window.location.href = listUrl; else location.reload();
                            });
                        } else if (window.toastr) {
                            toastr.success('Item deleted successfully');
                            if (listUrl) window.location.href = listUrl; else location.reload();
                        } else {
                            alert('Item deleted successfully');
                            if (listUrl) window.location.href = listUrl; else location.reload();
                        }
                    } else {
                        var msg = resp && resp.message ? resp.message : 'Delete failed';
                        if (window.Swal) Swal.fire({ icon: 'error', title: 'Error', text: msg });
                        else if (window.toastr) toastr.error(msg);
                        else alert(msg);
                    }
                })
                .fail(function (xhr, status, err) {
                    console.error('Delete request failed:', status, err, xhr.responseText);
                    var serverMsg = xhr && xhr.responseText ? xhr.responseText : 'Server error';
                    if (window.Swal) Swal.fire({ icon: 'error', title: 'Delete failed', text: serverMsg });
                    else alert('Delete request failed: ' + (xhr.status || '') + '\n' + serverMsg);
                });
        }

        if (window.Swal) {
            Swal.fire({
                title: 'Are you sure?',
                text: 'This will mark the item category as deleted.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            }).then(function (result) {
                if (result.isConfirmed) doDelete();
            });
        } else {
            if (confirm('Are you sure you want to delete this item category?')) {
                doDelete();
            }
        }
    });

    // Clear handler
    $('#btnClear').off('click.itemClear').on('click.itemClear', function (e) {
        e.preventDefault();
        var existingId = parseInt($('#ItemCategoryId').val() || 0, 10);
        if (existingId && existingId > 0) {
            location.reload();
        } else {
            clearForm();
        }
    });

    // Initialize
    var existingId = parseInt($('#ItemCategoryId').val() || 0, 10);
    if (!existingId || existingId <= 0) {
        fetchNextCode();
    } else {
        originalCode = $code.val() || '';
        preEditCode = originalCode;
    }

    setCodeEditable(false);
    updateDeleteButton();

    $(document).ready(function () {
        $('#btnSave').on('click', function (e) {
            e.preventDefault();
            saveItemCategory();
        });

        $('#Code, #Name').off('.clearValidation').on('input.clearValidation', function () {
            var field = $(this).attr('id');
            clearFieldValidation(field);
        });

        $('#StatusId').off('.clearValidation').on('change.clearValidation', function () {
            clearFieldValidation('StatusId');
        });
    });
});