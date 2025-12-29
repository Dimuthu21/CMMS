$(function () {
    'use strict';

    console.log('UserList.js loaded - Simple version');

    // Initialize Select2
    if ($.fn.select2) {
        var $productSelect = $('#filterProducts');

        $productSelect.select2({
            placeholder: 'Select Projects',
            width: '100%',
            minimumResultsForSearch: Infinity,
            tags: false
        });

        // --- NEW CODE: Force the attribute for your CSS ---
        // This finds the rendered Select2 container and adds the attribute 
        // that your CSS rule "content: attr(data-placeholder)" is looking for.
        $productSelect.data('select2').$container
            .find('.select2-selection--multiple')
            .attr('data-placeholder', 'Select Projects');
    }

    // Load users on page load
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
        $('#filterRole').val('');
        $('#filterStatus').val('');
        $('#filterDateFrom').val('');
        $('#filterDateTo').val('');

        if ($.fn.select2) {
            $('#filterProducts').val(null).trigger('change');
        }

        loadUsers();
    });

    // Function to load users
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

                    renderTableRows(users);
                } else {
                    console.error('Error in response:', response);
                    // If DataTable is available, destroy and re-init with empty message
                    if ($.fn.DataTable && $.fn.DataTable.isDataTable('#employeeTable')) {
                        $('#employeeTable').DataTable().clear().destroy();
                    }
                    var tbody = $('#employeeTable tbody');
                    tbody.html('<tr><td colspan="8" class="text-center text-danger">Error loading users: ' + (response.message || 'Unknown error') + '</td></tr>');
                }
            },
            error: function (xhr, status, error) {
                console.error('AJAX Error:', {
                    status: status,
                    error: error,
                    response: xhr.responseText
                });

                if ($.fn.DataTable && $.fn.DataTable.isDataTable('#employeeTable')) {
                    $('#employeeTable').DataTable().clear().destroy();
                }

                $('#employeeTable tbody').html(
                    '<tr><td colspan="8" class="text-center text-danger">Failed to load users. Please try again.</td></tr>'
                );
            }
        });
    }

    function renderTableRows(users) {
        if ($.fn.DataTable && $.fn.DataTable.isDataTable('#employeeTable')) {
            $('#employeeTable').DataTable().destroy();
        }

        var tbody = $('#employeeTable tbody');
        tbody.empty();

        if (!users || users.length === 0) {
            tbody.append('<tr><td colspan="8" class="text-center">No users found</td></tr>');
            if ($.fn.DataTable) initializeDataTable();
            attachRowDoubleClickHandler();
            return;
        }

        users.forEach(function (user) {
            var row = $('<tr></tr>').attr('data-id', user.UserId);
            row.append('<td>' + (user.UserCode || '-') + '</td>');
            row.append('<td>' + (user.FirstName || '-') + '</td>');
            row.append('<td>' + (user.LastName || '-') + '</td>');
            row.append('<td>' + (user.UserName || '-') + '</td>');
            row.append('<td>' + (user.Project || 'N/A') + '</td>');
            row.append('<td>' + formatRole(user.UserRole) + '</td>');
            row.append('<td>' + formatStatus(user.UserStatus) + '</td>');
            row.append('<td>' + formatDate(user.CreatedDate) + '</td>');
            tbody.append(row);
        });

        if ($.fn.DataTable) {
            initializeDataTable();
        } else {
            // If DataTable not present, attach dblclick handler manually
            attachRowDoubleClickHandler();
        }
    }

    function attachRowDoubleClickHandler() {
        $('#employeeTable tbody tr').off('dblclick').on('dblclick', function () {
            var userId = $(this).attr('data-id');
            console.log('Row double-clicked. UserId:', userId);

            if (userId) {
                window.location.href = '/Users/UserView?id=' + userId;
            }
        });
    }

    function initializeDataTable() {
        // Ensure DataTable plugin exists
        if (!$.fn.DataTable) return;

        $('#employeeTable').DataTable({
            "pageLength": 10,
            "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
            "order": [[7, "desc"]],
            "columnDefs": [
                {
                    "targets": 7,
                    "className": "dt-left"
                }
            ],
            "language": {
                "search": "Search:",
                "lengthMenu": "Show _MENU_ entries",
                "info": "Showing _START_ to _END_ of _TOTAL_ entries",
                "infoEmpty": "Showing 0 to 0 of 0 entries",
                "infoFiltered": "(filtered from _MAX_ total entries)",
                "paginate": {
                    "first": "First",
                    "last": "Last",
                    "next": "Next",
                    "previous": "Previous"
                },
                "emptyTable": "<span style='font-weight:bold;color:#555;'>No users found</span>"
            },
            "drawCallback": function () {
                attachRowDoubleClickHandler();
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

    // Helper function to format date with time
    function formatDate(dateStr) {
        if (!dateStr) return '-';

        try {
            var date;

            if (typeof dateStr === 'string' && dateStr.indexOf('/Date(') === 0) {
                var timestamp = parseInt(dateStr.replace(/\/Date\((\d+)\)\//, '$1'));
                date = new Date(timestamp);
            }
            else if (typeof dateStr === 'string') {
                date = new Date(dateStr);
            }
            else if (dateStr instanceof Date) {
                date = dateStr;
            }
            else {
                return '-';
            }

            if (isNaN(date.getTime())) {
                return '-';
            }

            // Format as YYYY-MM-DD HH:mm:ss
            var year = date.getFullYear();
            var month = String(date.getMonth() + 1).padStart(2, '0');
            var day = String(date.getDate()).padStart(2, '0');
            var hours = String(date.getHours()).padStart(2, '0');
            var minutes = String(date.getMinutes()).padStart(2, '0');
            var seconds = String(date.getSeconds()).padStart(2, '0');

            return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
        } catch (e) {
            console.error('Error formatting date:', dateStr, e);
            return '-';
        }
    }

    console.log('All event handlers attached');
});