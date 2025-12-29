$(function () {
    var selectedFiles = [];

    // Initialize Select2 for Reported By and Requested By with search enabled
    $('#ReportedBy, #RequestedBy').each(function () {
        var $select = $(this);
        var $wrap = $select.closest('.select-with-icon');
        var $icon = $wrap.find('i.fa-caret-down');

        $select.select2({
            placeholder: $select.find('option[value=""]').text() || '',
            allowClear: false,
            width: '100%'
        });

        // Move the icon after the Select2 container so it's visible
        var $select2Container = $wrap.find('.select2-container');
        $icon.insertAfter($select2Container);

        $wrap.addClass('select2-enabled');
    });

    // Generate S/R Code on page load (you can customize this logic)
    function generateCode() {
        var dt = new Date();
        var ts = dt.getFullYear().toString().slice(-2) +
            ('0' + (dt.getMonth() + 1)).slice(-2) +
            ('0' + dt.getDate()).slice(-2) +
            dt.getHours().toString().padStart(2, '0') +
            dt.getMinutes().toString().padStart(2, '0') +
            dt.getSeconds().toString().padStart(2, '0');
        var rand = Math.floor(Math.random() * 900 + 100);
        return 'SR-' + ts + '-' + rand;
    }

    // Attach change event to file input
    $(document).on('change', 'input[name="Attachments"]', function() {
        var files = this.files;
        for (var i = 0; i < files.length; i++) {
            selectedFiles.push(files[i]);
        }
        renderFileList();
        // Reset input to allow selecting same file again
        $(this).val('');
    });

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        var k = 1024;
        var sizes = ['Bytes', 'KB', 'MB', 'GB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    function renderFileList() {
        var $fileList = $('#fileList');
        $fileList.empty();

        if (selectedFiles.length === 0) {
            $fileList.html('<p class="text-muted">No files selected</p>');
            return;
        }

        selectedFiles.forEach(function(file, index) {
            var $fileItem = $('<div class="file-item">');
            var $fileName = $('<span class="file-item-name">').text(file.name);
            var $fileSize = $('<span class="file-item-size">').text(formatFileSize(file.size));
            var $removeBtn = $('<button type="button" class="btn btn-sm btn-danger btn-remove-file">Remove</button>');

            $removeBtn.on('click', function() {
                selectedFiles.splice(index, 1);
                renderFileList();
            });

            $fileItem.append($fileName).append($fileSize).append($removeBtn);
            $fileList.append($fileItem);
        });
    }

    $('#btnClearFiles').on('click', function () {
        selectedFiles = [];
        renderFileList();
    });

    // Form submission with AJAX
    $('#btnSave').on('click', function (e) {
        e.preventDefault();
        updateModulePath();
        var isValid = true;
        // Hide all validation messages by default
        $('#srCodeValidationMessage, #projectValidationMessage, #moduleValidationMessage, #reportedByValidationMessage, #requestedByValidationMessage, #titleValidationMessage, #requestTypeValidationMessage, #priorityLevelValidationMessage, #descriptionValidationMessage').hide();
        if ($('#SRCode').val().trim() === '') {
            isValid = false;
            $('#srCodeValidationMessage').show();
        }
        if ($('#Project').val() === '') {
            isValid = false;
            $('#projectValidationMessage').show();
        }
        if ($('#Module').val() === '') {
            isValid = false;
            $('#moduleValidationMessage').show();
        }
        if ($('#ReportedBy').val() === '') {
            isValid = false;
            $('#reportedByValidationMessage').show();
        }
        if ($('#RequestedBy').val() === '') {
            isValid = false;
            $('#requestedByValidationMessage').show();
        }
        if ($('#Title').val().trim() === '') {
            isValid = false;
            $('#titleValidationMessage').show();
        }
        if ($('#RequestType').val() === '') {
            isValid = false;
            $('#requestTypeValidationMessage').show();
        }
        if ($('#PriorityLevel').val() === '') {
            isValid = false;
            $('#priorityLevelValidationMessage').show();
        }
        if ($('#Description').val().trim() === '') {
            isValid = false;
            $('#descriptionValidationMessage').show();
        }
        if (!isValid) {
            return false;
        }
        var formData = new FormData();
        formData.append('__RequestVerificationToken', $('input[name="__RequestVerificationToken"]').val());
        formData.append('SRCode', $('#SRCode').val());
        formData.append('Project', $('#Project').val());
        formData.append('Module', $('#Module').val());
        formData.append('ModulePath', $('#ModulePath').val());
        formData.append('ReportedBy', $('#ReportedBy').val());
        formData.append('RequestedBy', $('#RequestedBy').val());
        formData.append('Title', $('#Title').val());
        formData.append('RequestType', $('#RequestType').val());
        formData.append('PriorityLevel', $('#PriorityLevel').val());
        formData.append('Description', $('#Description').val());
        for (var i = 0; i < selectedFiles.length; i++) {
            formData.append('Attachments', selectedFiles[i]);
        }
        $.ajax({
            url: window.createServiceRequestUrl || '',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Service request saved successfully!',
                    confirmButtonText: 'OK'
                }).then(function() {
                    window.location.href = window.createServiceRequestUrl || '';
                });
            },
            error: function(xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error saving service request: ' + error,
                    confirmButtonText: 'OK'
                });
            }
        });
    });

    // Show validation on blur/change for required fields
    $('#SRCode').on('blur', function () {
        if ($(this).val().trim() === '') {
            $('#srCodeValidationMessage').show();
        }
    });
    $('#Project').on('blur change', function () {
        if ($(this).val() === '') {
            $('#projectValidationMessage').show();
        }
    });
    $('#Module').on('blur change', function () {
        if ($(this).val() === '') {
            $('#moduleValidationMessage').show();
        }
    });
    $('#ReportedBy').on('blur change', function () {
        if ($(this).val() === '') {
            $('#reportedByValidationMessage').show();
        }
    });
    $('#RequestedBy').on('blur change', function () {
        if ($(this).val() === '') {
            $('#requestedByValidationMessage').show();
        }
    });
    $('#Title').on('blur', function () {
        if ($(this).val().trim() === '') {
            $('#titleValidationMessage').show();
        }
    });
    $('#RequestType').on('blur change', function () {
        if ($(this).val() === '') {
            $('#requestTypeValidationMessage').show();
        }
    });
    $('#PriorityLevel').on('blur change', function () {
        if ($(this).val() === '') {
            $('#priorityLevelValidationMessage').show();
        }
    });
    $('#Description').on('blur', function () {
        if ($(this).val().trim() === '') {
            $('#descriptionValidationMessage').show();
        }
    });

    // Hide validation messages on input/change
    $('#SRCode').on('input', function () {
        if ($(this).val().trim() !== '') {
            $('#srCodeValidationMessage').hide();
        }
    });
    $('#Project').on('change', function () {
        if ($(this).val() !== '') {
            $('#projectValidationMessage').hide();
        }
    });
    $('#Module').on('change', function () {
        if ($(this).val() !== '') {
            $('#moduleValidationMessage').hide();
        }
    });
    $('#ReportedBy').on('change', function () {
        if ($(this).val() !== '') {
            $('#reportedByValidationMessage').hide();
        }
    });
    $('#RequestedBy').on('change', function () {
        if ($(this).val() !== '') {
            $('#requestedByValidationMessage').hide();
        }
    });
    $('#Title').on('input', function () {
        if ($(this).val().trim() !== '') {
            $('#titleValidationMessage').hide();
        }
    });
    $('#RequestType').on('change', function () {
        if ($(this).val() !== '') {
            $('#requestTypeValidationMessage').hide();
        }
    });
    $('#PriorityLevel').on('change', function () {
        if ($(this).val() !== '') {
            $('#priorityLevelValidationMessage').hide();
        }
    });
    $('#Description').on('input', function () {
        if ($(this).val().trim() !== '') {
            $('#descriptionValidationMessage').hide();
        }
    });

    // Module hierarchy for cascading dropdowns
    var moduleHierarchy = {
        "WorkOrder": {
            text: "Work Order",
            children: {
                "CreateWO": {
                    text: "Create Work Order",
                    children: {
                        "CreateWO-Manual": { text: "Manual Create" },
                        "CreateWO-Auto": { text: "Automatic Create" }
                    }
                },
                "CloseWO": { text: "Close Work Order" },
                "AssignWO": {
                    text: "Assign Work Order",
                    children: {
                        "AssignWO-User": { text: "Assign to User" },
                        "AssignWO-Group": { text: "Assign to Group" }
                    }
                }
            }
        },
        "PreventiveMaintance": {
            text: "Preventive Maintance",
            children: {
                "SchedulePM": {
                    text: "Schedule PM",
                    children: {
                        "Monthly": { text: "Monthly" },
                        "Yearly": { text: "Yearly" }
                    }
                },
                "InspectPM": { text: "Inspect PM" }
            }
        }
    };

    function clearSubmodulesFrom(level) {
        $('#submoduleRow').find('.submodule-col').filter(function () {
            var lvl = parseInt($(this).data('level'));
            return lvl >= level;
        }).remove();
    }

    function buildSubmoduleColumn(options, level, parentLabel) {
        var $col = $('<div class="col-md-3 col-12 submodule-col mb-4">').attr('data-level', level);
        var labelText = 'Sub module of ' + (parentLabel || '');
        var $formGroup = $('<div class="form-group">');
        var $label = $('<label class="form-label">').text(labelText);
        var $selectWrap = $('<div class="select-with-icon">');
        var $select = $('<select class="form-control submodule-select">').attr('data-level', level);
        $select.append($('<option>').val('').text('Select Submodule'));
        Object.keys(options).forEach(function (k) {
            $select.append($('<option>').val(k).text(options[k].text || options[k]));
        });
        var $caret = $('<i class="fa fa-caret-down"></i>');
        $selectWrap.append($select).append($caret);
        $formGroup.append($label).append($selectWrap);
        $col.append($formGroup);
        return $col;
    }

    function updateModulePath() {
        var parts = [];
        var mainVal = $('#Module').val();
        if (mainVal) {
            parts.push(mainVal);
        }
        $('#submoduleRow').find('.submodule-select').each(function () {
            var v = $(this).val();
            if (v) parts.push(v);
        });
        $('#ModulePath').val(parts.join('/'));
    }

    // When top-level Module changes
    $('#Module').on('change', function () {
        var val = $(this).val();
        clearSubmodulesFrom(1);
        updateModulePath();

        if (!val) return;

        var node = moduleHierarchy[val];
        if (node && node.children) {
            var $col = buildSubmoduleColumn(node.children, 1, node.text);
            $('#submoduleRow').append($col);
        }
    });

    // Delegate change event for dynamic submodule selects
    $('#submoduleRow').on('change', '.submodule-select', function () {
        var level = parseInt($(this).attr('data-level'));
        var selected = $(this).val();

        clearSubmodulesFrom(level + 1);

        if (!selected) {
            updateModulePath();
            return;
        }

        var main = $('#Module').val();
        if (!main) return;

        var path = [main];
        $('#submoduleRow').find('.submodule-select').each(function () {
            var lev = parseInt($(this).attr('data-level'));
            if (lev <= level) {
                var v = $(this).val();
                if (v) path.push(v);
            }
        });

        var node = moduleHierarchy[main];
        for (var i = 1; i < path.length; i++) {
            var key = path[i];
            if (!node || !node.children || !node.children[key]) {
                node = null;
                break;
            }
            node = node.children[key];
        }

        if (node && node.children) {
            var parentLabel = node.text || '';
            var $col = buildSubmoduleColumn(node.children, level + 1, parentLabel);
            $('#submoduleRow').append($col);
        }

        updateModulePath();
    });

    // Clear button
    $('#btnClear').on('click', function () {
        // Clear form fields
        $('#serviceRequestForm')[0].reset();

        // Clear file list
        selectedFiles = [];
        $('#fileInput').val('');
        renderFileList();

        // Clear submodules
        clearSubmodulesFrom(1);
        $('#ModulePath').val('');

        // Regenerate S/R Code
        //$('#SRCode').val(generateCode());

        // Initialize Select2 for Reported By and Requested By with search enabled
        $('#ReportedBy, #RequestedBy').each(function () {
            var $select = $(this);
            var $wrap = $select.closest('.select-with-icon');
            var $icon = $wrap.find('i.fa-caret-down');

            $select.select2({
                placeholder: $select.find('option[value=""]').text() || '',
                allowClear: false,
                width: '100%'
            });

            // Move the icon after the Select2 container so it's visible
            var $select2Container = $wrap.find('.select2-container');
            $icon.insertAfter($select2Container);

            $wrap.addClass('select2-enabled');
        });
    });
});
