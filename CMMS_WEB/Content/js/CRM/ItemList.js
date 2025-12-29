var ItemList = (function ($) {
    var table;

    function initialize() {
        if (typeof jQuery === 'undefined') {
            console.error('jQuery is not loaded');
            return;
        }

        var $table = $('#itemTable');
        if (!$table.length) {
            console.error('#itemTable not found in DOM');
            return;
        }

        if (typeof $.fn.DataTable === 'undefined') {
            console.error('DataTables plugin is not loaded');
            return;
        }

        initializeTable($table);
        bindFilters();
    }

    function initializeTable($table) {
        try {
            var ajaxUrl = $('#getAllItemCategoriesUrl').length ? $('#getAllItemCategoriesUrl').val() : null;

            if (!ajaxUrl) {
                console.error('#getAllItemCategoriesUrl hidden input not found');
                return;
            }

            table = $table.DataTable({
                paging: true,
                searching: false,
                ordering: true,
                processing: true,
                serverSide: true,
                dom: 'lrtip',
                ajax: {
                    url: ajaxUrl,
                    type: 'GET',
                    data: function (d) {
                        var start = typeof d.start !== 'undefined' ? parseInt(d.start, 10) : 0;
                        var length = typeof d.length !== 'undefined' ? parseInt(d.length, 10) : 10;

                        var page = 1;
                        if (length > 0) {
                            page = Math.floor(start / length) + 1;
                        }

                        d.page = page;
                        d.pagesize = length > 0 ? length : 10;

                        d.code = $('#filterCode').val() || null;
                        d.name = $('#filterName').val() || null;
                        d.statusId = $('#filterStatus').val() || null;
                    },
                    error: function (xhr, error, thrown) {
                        console.error('DataTable Ajax error:', error, thrown);
                        if (window.Swal) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Data Load Error',
                                text: 'Failed to load item data. Please try again.',
                                confirmButtonText: 'OK'
                            });
                        }
                    }
                },
                columns: [
                    { className: 'dt-control', orderable: false, data: null, defaultContent: '+' },
                    { data: 'Code' },
                    { data: 'Name' },
                    {
                        data: 'Description',
                        render: function (data) {
                            if (!data) return '';
                            var txt = data.toString();
                            return txt.length > 20 ? txt.substring(0, 20) + '...' : txt;
                        }
                    },
                    { data: 'StatusText' },
                    { data: 'CreatedBy' },
                    { data: 'CreatedDate' }
                ],
                order: [[1, 'asc']]
            });

            // Child row toggle
            $('#itemTable tbody').off('click.dt-control').on('click.dt-control', 'td.dt-control', function (e) {
                try {
                    var tr = $(this).closest('tr');
                    var row = table.row(tr);
                    if (row.child.isShown()) {
                        row.child.hide();
                        tr.removeClass('shown');
                        $(this).text('+');
                    } else {
                        var rowData = row.data();
                        if (rowData) {
                            row.child(formatChildRow(rowData)).show();
                            tr.addClass('shown');
                            $(this).text('-');
                        }
                    }
                } catch (err) {
                    console.error('Error toggling child row:', err);
                }
            });

            // Double-click to edit
            $('#itemTable tbody').off('dblclick.item').on('dblclick.item', function (e) {
                try {
                    var $targetTr = $(e.target).closest('tr');
                    var rowData = null;

                    if ($targetTr.length && table.row($targetTr).data()) {
                        rowData = table.row($targetTr).data();
                    } else {
                        var $child = $(e.target).closest('.child-row-details');
                        if ($child.length) {
                            var id = $child.data('id');
                            if (id) {
                                try {
                                    var encoded = btoa(id.toString());
                                    window.location.href = '/Inventory/ItemCategory/' + encodeURIComponent(encoded);
                                } catch (ex) {
                                    console.error('Failed to encode id', ex);
                                    window.location.href = '/Inventory/ItemCategory/' + encodeURIComponent(id.toString());
                                }
                                return;
                            }
                        }

                        var $prev = $targetTr.prevAll('tr').filter(function () {
                            return table.row(this).data() !== undefined && table.row(this).data() !== null;
                        }).first();

                        if ($prev && $prev.length) {
                            rowData = table.row($prev).data();
                        }
                    }

                    if (rowData && rowData.ItemCategoryId) {
                        var id = rowData.ItemCategoryId;
                        try {
                            var encoded = btoa(id.toString());
                            window.location.href = '/Inventory/ItemCategory/' + encodeURIComponent(encoded);
                        } catch (ex) {
                            console.error('Failed to encode id', ex);
                            window.location.href = '/Inventory/ItemCategory/' + encodeURIComponent(id.toString());
                        }
                    }
                } catch (err) {
                    console.error('Row dblclick handler error:', err);
                }
            });

        } catch (error) {
            console.error('Error initializing DataTable:', error);
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Initialization Error',
                    text: 'Failed to initialize the data table.\n' + (error && error.message ? error.message : ''),
                    confirmButtonText: 'OK'
                });
            }
        }
    }

    function formatChildRow(data) {
        if (!data) return '';

        var updatedBy = data.UpdatedBy || 'N/A';
        var updatedDate = data.UpdatedDate || 'N/A';

        return `
            <div class="child-row-details p-3" data-id="${data.ItemCategoryId}">
                <div class="updated-info">
                    <div><strong>Updated By:</strong> ${escapeHtml(updatedBy)}</div>
                    <div><strong>Updated Date:</strong> ${escapeHtml(updatedDate)}</div>
                </div>
            </div>
        `;
    }

    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function bindFilters() {
        $('#btnFilter').off('click').on('click', function (e) {
            e.preventDefault();
            var code = $('#filterCode').val();
            var name = $('#filterName').val();
            var status = $('#filterStatus').val();

            if (!code && !name && !status) {
                if (window.Swal) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Filter Required',
                        text: 'Please enter at least one filter criteria.',
                        confirmButtonText: 'OK'
                    });
                } else {
                    alert('Please enter at least one filter criteria.');
                }
                return;
            }

            if (table && table.ajax) {
                table.ajax.reload(null, false);
            } else {
                console.warn('DataTable not initialized; cannot reload.');
                if (window.Swal) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Table not properly initialized. Please refresh the page.',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });

        $('#btnClearFilter').off('click').on('click', function (e) {
            e.preventDefault();
            if ($('#filterCode').length) $('#filterCode').val('');
            if ($('#filterName').length) $('#filterName').val('');
            if ($('#filterStatus').length) $('#filterStatus').val('');
            if (table && table.ajax) {
                table.ajax.reload(null, false);
            } else {
                console.warn('DataTable not initialized; cannot reload.');
            }
        });
    }

    function reloadTable() {
        if (table && table.ajax) {
            table.ajax.reload(null, false);
        } else {
            console.warn('DataTable not initialized; cannot reload.');
        }
    }

    return {
        initialize: initialize,
        reload: reloadTable
    };
})(jQuery);

$(document).ready(function () {
    try {
        ItemList.initialize();
    } catch (error) {
        console.error('Error initializing ItemList:', error);
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Initialization Error',
                text: 'Failed to initialize the page. Please refresh and try again.',
                confirmButtonText: 'OK'
            });
        }
    }
});