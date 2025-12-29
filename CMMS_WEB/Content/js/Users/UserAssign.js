$(function () {
    'use strict';

    console.log('UserAssign.js loaded');
    console.log('UserId:', $('#UserId').val());
    console.log('Current Projects:', '@Model.Project');

    // Initialize Select2 for projects
    var $prodSelect = $('#ProductsSelect');
    if ($.fn.select2) {
        // Set the value from model before initializing Select2
        var productsValue = $('#Products').val() || '@Model.Project';
        console.log('Initial projects value:', productsValue);

        if (productsValue && productsValue !== '') {
            var selectedProducts = productsValue.split(',').map(function (p) {
                return p.trim();
            });
            $prodSelect.val(selectedProducts);
        }

        $prodSelect.select2({
            placeholder: 'Select Projects',
            width: '100%',
            minimumResultsForSearch: Infinity,
            tags: false
        });

        // Trigger change to update display
        $prodSelect.trigger('change');
    }

    // Sync selected values to hidden Products field
    function updateSelectedProductsField() {
        var selected = $prodSelect.val() || [];
        $('#Products').val(selected.join(','));
        console.log('Updated Products field:', selected.join(','));
    }

    $prodSelect.on('change', function () {
        updateSelectedProductsField();
    });

    // Initialize hidden field
    updateSelectedProductsField();

    // Save/Assign button click handler
    $('#btnSave').on('click', function (e) {
        e.preventDefault();

        var selectedProjects = $prodSelect.val();

        if (!selectedProjects || selectedProjects.length === 0) {
            if (typeof toastr !== 'undefined') {
                toastr.error('Please select at least one project');
            } else {
                alert('Please select at least one project');
            }
            return false;
        }

        var userId = $('#UserId').val();
        var projectsString = selectedProjects.join(',');

        console.log('Assigning projects:', {
            userId: userId,
            projects: projectsString
        });

        // Show loading
        var $btn = $(this);
        $btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Assigning...');

        // Get anti-forgery token
        var token = $('input[name="__RequestVerificationToken"]').val();

        // Submit the assignment
        $.ajax({
            url: '/Users/AssignProjects',
            type: 'POST',
            data: {
                userId: userId,
                projects: projectsString,
                __RequestVerificationToken: token
            },
            success: function (response) {
                console.log('Response:', response);

                if (response.success) {
                    if (typeof toastr !== 'undefined') {
                        toastr.success(response.message || 'Projects assigned successfully!');
                    } else {
                        alert(response.message || 'Projects assigned successfully!');
                    }

                    // Redirect back to list after short delay
                    setTimeout(function () {
                        window.location.href = '/Users/UserAssignList';
                    }, 1500);
                } else {
                    if (typeof toastr !== 'undefined') {
                        toastr.error(response.message || 'Failed to assign projects');
                    } else {
                        alert(response.message || 'Failed to assign projects');
                    }
                    $btn.prop('disabled', false).html('Assign');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error:', xhr.responseText);

                var errorMessage = 'Failed to assign projects. Please try again.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }

                if (typeof toastr !== 'undefined') {
                    toastr.error(errorMessage);
                } else {
                    alert(errorMessage);
                }
                $btn.prop('disabled', false).html('Assign');
            }
        });
    });

    console.log('All event handlers attached');
});