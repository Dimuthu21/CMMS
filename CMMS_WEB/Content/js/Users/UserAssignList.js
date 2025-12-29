$(function () {
    'use strict';

    console.log('UserAssignList.js loaded');

    // Initialize Select2 with a slight delay to ensure DOM is ready
    setTimeout(function() {
        if ($.fn.select2) {
            try {
                var $productSelect = $('#filterProducts');

                if ($productSelect.length === 0) {
                    console.error('filterProducts element not found');
                    return;
                }

                console.log('Initializing Select2 for filterProducts');

                $productSelect.select2({
                    placeholder: 'Select Projects',
                    width: '100%',
                    minimumResultsForSearch: Infinity,
                    tags: false,
                    allowClear: true
                });

                // Force the attribute for CSS placeholder display
                var $container = $productSelect.data('select2');
                if ($container && $container.$container) {
                    $container.$container
                        .find('.select2-selection--multiple')
                        .attr('data-placeholder', 'Select Projects');
                    console.log('Select2 initialized successfully');
                } else {
                    console.warn('Select2 container not found');
                }
            } catch (e) {
                console.error('Error initializing Select2:', e);
            }
        } else {
            console.warn('Select2 plugin not available');
        }
    }, 100);

    // Load users on page load (only users without projects)
    loadUsers();

    // Filter button
    $('#btnFilter').on('click', function (e) {
        e.preventDefault();
        console.log('Filter clicked');
        loadUsers();
    });

    // Clear button
    $('#btnClearFilter').on('click', function (e) {
        e.preventDefault();
        console.log('Clear clicked');

        $('#filterEmpNo').val('');
        $('#filterFirstName').val('');
        $('#filterLastName').val('');
        $('#filterUserName').val('');
        
        if ($.fn.select2) {
            $('#filterProducts').val(null).trigger('change');
        }
        
        $('#filterRole').val('');
        $('#filterStatus').val('');
        $('#filterDateFrom').val('');
        $('#filterDateTo').val('');

        loadUsers();
    });

    // Function to load users (only those without projects)
    function loadUsers() {
        var filterData = {
            filterEmpNo: $('#filterEmpNo').val() || '',
            filterFirstName: $('#filterFirstName').val() || '',
            filterLastName: $('#filterLastName').val() || '',
            filterUserName: $('#filterUserName').val() || '',
            filterProducts: '',
            filterRole: $('#filterRole').val() || '',
            filterStatus: $('#filterStatus').val() || '',
            filterDateFrom: $('#filterDateFrom').val() || '',
            filterDateTo: $('#filterDateTo').val() || ''
        };

        // Get selected products
        var selectedProducts = $('#filterProducts').val();
        if (selectedProducts && selectedProducts.length > 0) {
            filterData.filterProducts = selectedProducts.join(',');
        }

        console.log('Loading users with filters:', filterData);

        // Show loading message
        $('#employeeTable tbody').html('<tr><td colspan="8" class="text-center">Loading...</td></tr>');

        $.ajax({
            url: '/Users/GetUsers',
            type: 'POST',
            data: filterData,
            success: function (response) {
                console.log('Response received:', response);

                if (response.success && response.data) {
                    var users = response.data;
                    console.log('Number of users:', users.length);

                    var tbody = $('#employeeTable tbody');
                    tbody.empty();

                    if (users.length === 0) {
                        tbody.append('<tr><td colspan="8" class="text-center">No users found</td></tr>');
                    } else {
                        users.forEach(function (user, index) {
                            console.log('Processing user ' + index + ':', JSON.stringify(user));

                            var row = $('<tr></tr>').attr('data-id', user.UserId);

                            row.append('<td>' + (user.UserCode || '-') + '</td>');
                            row.append('<td>' + (user.FirstName || '-') + '</td>');
                            row.append('<td>' + (user.LastName || '-') + '</td>');
                            row.append('<td>' + (user.UserName || '-') + '</td>');
                            
                            // DEBUG: Log what we're displaying for Projects
                            var projectValue = user.Project || 'N/A';
                            console.log('User ' + user.UserCode + ' Project value:', projectValue);
                            row.append('<td>' + projectValue + '</td>');
                            
                            row.append('<td>' + formatRole(user.UserRole) + '</td>');
                            row.append('<td>' + formatStatus(user.UserStatus) + '</td>');
                            row.append('<td>' + formatDate(user.CreatedDate) + '</td>');

                            tbody.append(row);
                        });

                        // Add double-click handler to rows - navigate to assign projects page
                        $('#employeeTable tbody tr').on('dblclick', function () {
                            var userId = $(this).attr('data-id');
                            console.log('Row double-clicked. UserId:', userId);

                            if (userId) {
                                // Navigate to UserAssign page with the userId
                                window.location.href = '/Users/UserAssign?id=' + userId;
                            }
                        });

                        console.log('Table populated successfully');
                    }
                } else {
                    console.error('Error in response:', response);
                    $('#employeeTable tbody').html(
                        '<tr><td colspan="8" class="text-center text-danger">Error loading users: ' +
                        (response.message || 'Unknown error') +
                        '</td></tr>'
                    );
                }
            },
            error: function (xhr, status, error) {
                console.error('AJAX Error:', {
                    status: status,
                    error: error,
                    response: xhr.responseText
                });

                $('#employeeTable tbody').html(
                    '<tr><td colspan="8" class="text-center text-danger">Failed to load users. Please try again.</td></tr>'
                );
            }
        });
    }

    // Helper function to format role
    function formatRole(role) {
        if (!role) return '-';

        switch (role) {
            case '1':
            case 'GeneralUser':
                return 'General User';
            case '2':
            case 'Admin':
                return 'Admin';
            case '3':
            case 'Reviewer':
                return 'Reviewer';
            default:
                return role;
        }
    }

    // Helper function to format status
    function formatStatus(status) {
        if (!status) return '-';

        switch (status) {
            case '1':
            case 'Active':
                return 'Active';
            case '2':
            case 'Inactive':
                return 'Inactive';
            default:
                return status;
        }
    }

    // Helper function to format date - handles ASP.NET JSON format
    function formatDate(dateStr) {
        if (!dateStr) return '-';

        try {
            var date;

            // Handle ASP.NET JSON date format: /Date(1234567890000)/
            if (typeof dateStr === 'string' && dateStr.indexOf('/Date(') === 0) {
                var timestamp = parseInt(dateStr.replace(/\/Date\((\d+)\)\//, '$1'));
                date = new Date(timestamp);
            }
            // Handle ISO date string
            else if (typeof dateStr === 'string') {
                date = new Date(dateStr);
            }
            // Already a Date object
            else if (dateStr instanceof Date) {
                date = dateStr;
            }
            else {
                return '-';
            }

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return '-';
            }

            // Format as YYYY-MM-DD
            var year = date.getFullYear();
            var month = String(date.getMonth() + 1).padStart(2, '0');
            var day = String(date.getDate()).padStart(2, '0');

            return year + '-' + month + '-' + day;
        } catch (e) {
            console.error('Error formatting date:', dateStr, e);
            return '-';
        }
    }

    console.log('All event handlers attached');
});