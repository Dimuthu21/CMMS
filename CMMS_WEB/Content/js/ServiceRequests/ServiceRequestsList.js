$(function () {
    // Expose URLs needed by JS as global variables
    window.filterServiceRequestsUrl = window.filterServiceRequestsUrl || '';
    window.viewServiceRequestUrl = window.viewServiceRequestUrl || '';

    // Module hierarchy - same as CreateServiceRequest
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

    function getLastChildText(modulePath) {
        if (!modulePath) return '';
        var parts = modulePath.split('/');
        if (parts.length === 0) return '';
        var node = moduleHierarchy[parts[0]];
        if (!node) return parts[parts.length - 1];
        for (var i = 1; i < parts.length; i++) {
            if (node.children && node.children[parts[i]]) {
                node = node.children[parts[i]];
            } else {
                return parts[parts.length - 1];
            }
        }
        return node.text || parts[parts.length - 1];
    }

    function formatChildRow(reportedBy, requestedBy) {
        return `
            <div class="child-row-content">
                <div class="detail-row">
                    <span class="detail-label">Reported By:</span>
                    <span class="detail-value">${reportedBy || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Requested By:</span>
                    <span class="detail-value">${requestedBy || 'N/A'}</span>
                </div>
            </div>
        `;
    }

    // Cascading dropdown logic for filters
    (function () {
        var $filterModule = $('#filterModule');
        var $submoduleRowContainer = $('#filterSubmoduleRowContainer');
        var $submoduleRow = $('#filterSubmoduleRow');

        function clearFilterSubmodules() {
            $submoduleRow.empty();
            $submoduleRowContainer.hide();
            updateFilterModulePath();
        }

        function buildFilterSubmoduleSelect(options, level, parentLabel) {
            var $wrapper = $('<div class="col-md-3 col-12 filter-submodule-wrapper">').attr('data-level', level);
            var labelText = 'Sub module of ' + (parentLabel || '');
            var $label = $('<label class="form-label">').text(labelText);
            var $selectWrap = $('<div class="select-with-icon">');
            var $select = $('<select class="form-control filter-control filter-submodule-select">').attr('data-level', level);
            $select.append($('<option>').val('').text('Select Submodule'));
            Object.keys(options).forEach(function (k) {
                $select.append($('<option>').val(k).text(options[k].text || k));
            });
            var $caret = $('<i class="fa fa-caret-down"></i>');
            $selectWrap.append($select).append($caret);
            $wrapper.append($label).append($selectWrap);
            return $wrapper;
        }

        function updateFilterModulePath() {
            var parts = [];
            var mainVal = $filterModule.val();
            if (mainVal) {
                parts.push(mainVal);
            }
            $submoduleRow.find('.filter-submodule-select').each(function () {
                var v = $(this).val();
                if (v) parts.push(v);
            });
            $('#filterModulePath').val(parts.join('/'));
        }

        $filterModule.on('change', function () {
            var val = $(this).val();
            clearFilterSubmodules();
            if (!val) return;
            var node = moduleHierarchy[val];
            if (node && node.children) {
                var $subSelect = buildFilterSubmoduleSelect(node.children, 1, node.text);
                $submoduleRow.append($subSelect);
                $submoduleRowContainer.show();
            }
        });

        $submoduleRow.on('change', '.filter-submodule-select', function () {
            var level = parseInt($(this).attr('data-level'));
            var selected = $(this).val();
            $submoduleRow.find('.filter-submodule-wrapper').filter(function () {
                var lvl = parseInt($(this).attr('data-level'));
                return lvl > level;
            }).remove();
            updateFilterModulePath();
            if (!selected) return;
            var main = $filterModule.val();
            if (!main) return;
            var path = [main];
            $submoduleRow.find('.filter-submodule-select').each(function () {
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
                var $subSelect = buildFilterSubmoduleSelect(node.children, level + 1, parentLabel);
                $submoduleRow.append($subSelect);
            }
        });
    })();

    // Clear filter button
    document.getElementById('btnClearFilter').addEventListener('click', function () {
        document.getElementById('filterForm').reset();
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        $('#filterSubmoduleRow').empty();
        $('#filterSubmoduleRowContainer').hide();
        $('#filterModulePath').val('');
        window.location.reload();
    });

    function mapStatusBadges() {
        var rows = document.querySelectorAll('#issueTable tbody tr');
        rows.forEach(function (row) {
            var statusCell = row.cells[7];
            if (!statusCell) return;
            var text = (statusCell.textContent || '').trim();
            var key = text.toLowerCase();
            var cls = '';
            if (key.indexOf('raised') !== -1) {
                cls = 'status-raised';
            } else if (key.indexOf('reopen') !== -1) {
                cls = 'status-reopened';
            } else if (key.indexOf('in review') !== -1 || key === 'inreview') {
                cls = 'status-inreview';
            } else if (key.indexOf('in progress') !== -1 || key.indexOf('in prgress') !== -1) {
                cls = 'status-inprogress';
            } else if (key.indexOf('approved') !== -1) {
                cls = 'status-approved';
            } else if (key.indexOf('completed') !== -1) {
                cls = 'status-completed';
            } else if (key.indexOf('closed') !== -1) {
                cls = 'status-closed';
            } else if (key.indexOf('rejected') !== -1) {
                cls = 'status-rejected';
            }
            if (cls) {
                statusCell.innerHTML = '<span class="status-badge ' + cls + '">' + text + '</span>';
            } else {
                statusCell.innerHTML = '<span class="status-badge" style="background:#e0e0e0;color:#222">' + text + '</span>';
            }
        });
    }

    function updateModuleDisplayInTable() {
        $('#issueTable tbody tr').each(function () {
            var $row = $(this);
            var modulePath = $row.data('module-path');
            var $moduleCell = $row.find('td:eq(4)');
            if (modulePath) {
                var displayText = getLastChildText(modulePath);
                $moduleCell.text(displayText);
            }
        });
    }

    $('#btnFilter').on('click', function() {
        var filterData = {
            filterCode: $('#filterCode').val(),
            filterProduct: $('#filterProduct').val(),
            filterModulePath: $('#filterModulePath').val(),
            filterIssueType: $('#filterIssueType').val(),
            filterPriority: $('#filterPriority').val(),
            filterStatus: $('#filterStatus').val(),
            filterReportedBy: $('#filterReportedBy').val(),
            filterRequestedBy: $('#filterRequestedBy').val(),
            filterDateFrom: $('#filterDateFrom').val(),
            filterDateTo: $('#filterDateTo').val()
        };
        $.ajax({
            url: window.filterServiceRequestsUrl || '',
            type: 'POST',
            data: filterData,
            success: function(response) {
                if (response.success) {
                    renderTableRows(response.data);
                } else {
                    alert('Error filtering: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                alert('Error filtering service requests: ' + error);
            }
        });
    });

    function renderTableRows(data) {
        if ($.fn.DataTable.isDataTable('#issueTable')) {
            $('#issueTable').DataTable().destroy();
        }
        var $tbody = $('#issueTable tbody');
        $tbody.empty();
        if (!data || data.length === 0) {
            // Do not add any row; let DataTables show the emptyTable message
            initializeDataTable();
            attachRowDoubleClickHandler();
            attachChildRowHandler();
            return;
        }
        data.forEach(function (request) {
            var $tr = $('<tr>')
                .attr('data-id', request.ServiceRequestId)
                .attr('data-reported-by', request.ReportedBy)
                .attr('data-requested-by', request.RequestedBy)
                .attr('data-module-path', request.ModulePath);
            $tr.append($('<td>').addClass('dt-control'));
            $tr.append($('<td>').text(request.SRCode));
            $tr.append($('<td>').text(request.Title));
            $tr.append($('<td>').text(request.Project));
            $tr.append($('<td>').text(request.Module));
            $tr.append($('<td>').text(request.RequestType));
            $tr.append($('<td>').text(request.PriorityLevel));
            $tr.append($('<td>').text(request.Status));
            $tr.append($('<td>').text(request.CreatedDate));
            $tbody.append($tr);
        });
        updateModuleDisplayInTable();
        mapStatusBadges();
        initializeDataTable();
        attachRowDoubleClickHandler();
        attachChildRowHandler();
    }

    function attachRowDoubleClickHandler() {
        $('#issueTable tbody tr').off('dblclick').on('dblclick', function(e) {
            if ($(e.target).hasClass('dt-control')) return;
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || $(e.target).closest('.dropdown').length)) return;
            var id = $(this).attr('data-id');
            if (id) {
                window.location.href = window.viewServiceRequestUrl + '?id=' + id;
            }
        });
    }

    function initializeDataTable() {
        var table = $('#issueTable').DataTable({
            "pageLength": 10,
            "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
            "order": [[8, "desc"]],
            "columnDefs": [
                {
                    "orderable": false,
                    "targets": 0,
                    "className": "dt-control"
                },
                {
                    "targets": 8,
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
                "emptyTable": "<span style='font-weight:bold;color:#555;'>No service requests found</span>"
            },
            "drawCallback": function() {
                attachRowDoubleClickHandler();
                attachChildRowHandler();
            }
        });
        attachChildRowHandler();
    }

    function attachChildRowHandler() {
        var table = $('#issueTable').DataTable();
        $('#issueTable tbody').off('click', 'td.dt-control').on('click', 'td.dt-control', function () {
            var tr = $(this).closest('tr');
            var row = table.row(tr);
            if (row.child.isShown()) {
                row.child.hide();
                tr.removeClass('shown');
            } else {
                var reportedBy = tr.attr('data-reported-by');
                var requestedBy = tr.attr('data-requested-by');
                row.child(formatChildRow(reportedBy, requestedBy)).show();
                tr.addClass('shown');
            }
        });
    }

    $(document).ready(function() {
        updateModuleDisplayInTable();
        mapStatusBadges();
        $('#filterReportedBy, #filterRequestedBy').each(function () {
            var $select = $(this);
            var $wrap = $select.closest('.select-with-icon');
            var $icon = $wrap.find('i.fa-caret-down');
            $select.select2({
                placeholder: $select.find('option[value=""]').text() || '',
                allowClear: false,
                width: '100%'
            });
            var $select2Container = $wrap.find('.select2-container');
            $icon.insertAfter($select2Container);
            $wrap.addClass('select2-enabled');
        });
        initializeDataTable();
        attachRowDoubleClickHandler();
        attachChildRowHandler();
    });
});
