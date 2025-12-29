// ===============================
// relationship.js (UI-only)
// Version: 1.0.0
// ===============================

(function () {

    var STORE_KEY = "csm_typemaster_relationship";
    var store = null;
    var dt = null;

    function init() {
        if (!window.CsmData) {
            console.error("CsmData is not loaded.");
            return;
        }

        store = CsmData.createStore(STORE_KEY);

        bindLookups();
        seedIfEmpty();
        resetForm();
        initDataTableIfNeeded();
        renderTable();
        wireEvents();
    }

    // ---------- Lookups ----------
    function bindLookups() {
        var $ddl = $("#RelationshipStatus");
        if (!$ddl.length) return;

        if (window.CsmCommon && CsmCommon.bindDropdown) {
            // includeSelect=true but default=Active
            CsmCommon.bindDropdown($ddl, CsmData.Lookups.Status, "Active", true);
            return;
        }

        // fallback
        $ddl.empty();
        $ddl.append($("<option/>").val("").text("Select"));
        (CsmData.Lookups.Status || []).forEach(function (x) {
            $ddl.append($("<option/>").val(x.value).text(x.text));
        });
        $ddl.val("Active");
    }

    // ---------- Seed ----------
    function seedIfEmpty() {
        var list = store.listActive();
        if (list && list.length > 0) return;

        // Hardcoded sample data like SS #22
        store.save({ code: "RL101", relationshipName: "Father", status: "Active", isUserPreferred: false, isDeleted: false });
        store.save({ code: "RL102", relationshipName: "Mother", status: "Active", isUserPreferred: false, isDeleted: false });
        store.save({ code: "RL103", relationshipName: "Son", status: "Active", isUserPreferred: false, isDeleted: false });
    }

    // ---------- Events ----------
    function wireEvents() {

        $("#btnRelationshipClear").off("click").on("click", function () {
            clearValidation();
            resetForm();
        });

        $("#btnRelationshipSave").off("click").on("click", function () {
            clearValidation();

            var model = readForm();
            if (!validate(model)) return;

            store.save(model);

            showSuccess("Saved successfully.");
            resetForm();
            renderTable();
        });

        // Delete
        $(document).off("click", ".btn-rel-delete").on("click", ".btn-rel-delete", function (e) {
            e.preventDefault();
            e.stopPropagation();

            var id = $(this).attr("data-id");
            if (!id) return;

            showConfirmDelete(function () {
                var ok = store.softDelete(id);
                if (ok) {
                    showSuccess("Deleted successfully.");
                    resetForm();
                    renderTable();
                } else {
                    showError("Delete failed.");
                }
            });
        });

        // Double click row => edit (DataTables-safe)
        $("#tblRelationship tbody").off("dblclick", "tr").on("dblclick", "tr", function () {

            // If DataTables exists, get row data from DT
            if (dt) {
                var row = dt.row(this);
                var rowData = row.data(); // [id, code, name, status, actionHtml]
                if (!rowData || rowData.length < 1) return;

                var id = rowData[0]; // hidden id column
                if (!id) return;

                var obj = store.getById(id);
                if (!obj) return;

                fillForm(obj);
                clearValidation();
                return;
            }

            // fallback (non-DataTable)
            var id2 = $(this).attr("data-id");
            if (!id2) return;

            var obj2 = store.getById(id2);
            if (!obj2) return;

            fillForm(obj2);
            clearValidation();
        });
    }

    // ---------- DataTable ----------
    function initDataTableIfNeeded() {
        if (!$.fn.DataTable) {
            console.warn("DataTables not loaded.");
            return;
        }

        // destroy if already created
        if ($.fn.DataTable.isDataTable("#tblRelationship")) {
            $("#tblRelationship").DataTable().destroy();
        }

        dt = $("#tblRelationship").DataTable({
            paging: true,
            searching: true,
            ordering: true,
            autoWidth: false,
            pageLength: 10,
            // Column 0 = hidden ID
            columnDefs: [
                { targets: 0, visible: false, searchable: false },
                { targets: 4, orderable: false, searchable: false }
            ]
        });
    }

    function renderTable() {
        var list = store.listActive();

        // DataTables path (recommended)
        if (dt) {
            var rows = (list || []).map(function (x) {
                return [
                    x.id || "",                         // hidden id
                    escapeHtml(x.code || ""),
                    escapeHtml(x.relationshipName || ""),
                    escapeHtml(x.status || ""),
                    "<a href='#' class='btn-rel-delete text-danger' data-id='" + (x.id || "") + "' title='Delete'>"
                    + "<i class='fa fa-trash'></i></a>"
                ];
            });

            dt.clear();
            dt.rows.add(rows);
            dt.draw(false);
            return;
        }

        // fallback (no DataTables)
        var $tbody = $("#tblRelationship tbody");
        $tbody.empty();

        (list || []).forEach(function (x) {
            var tr = ""
                + "<tr data-id='" + (x.id || "") + "'>"
                + "<td>" + escapeHtml(x.code || "") + "</td>"
                + "<td>" + escapeHtml(x.relationshipName || "") + "</td>"
                + "<td>" + escapeHtml(x.status || "") + "</td>"
                + "<td class='text-center'>"
                + "<a href='#' class='btn-rel-delete text-danger' data-id='" + (x.id || "") + "' title='Delete'>"
                + "<i class='fa fa-trash'></i></a>"
                + "</td>"
                + "</tr>";

            $tbody.append(tr);
        });
    }

    // ---------- Form ----------
    function resetForm() {
        $("#RelationshipId").val("");
        $("#RelationshipIsUserPreferred").prop("checked", false);

        var nextCode = CsmData.getNextCode(STORE_KEY, "code", "RL", 1001, 0);
        $("#RelationshipCode").val(nextCode);

        $("#RelationshipName").val("");
        $("#RelationshipStatus").val("Active");
    }

    function readForm() {
        return {
            id: $("#RelationshipId").val() || "",
            code: ($("#RelationshipCode").val() || "").trim(),
            relationshipName: ($("#RelationshipName").val() || "").trim(),
            status: ($("#RelationshipStatus").val() || "").trim(),
            isUserPreferred: $("#RelationshipIsUserPreferred").is(":checked"),
            isDeleted: false
        };
    }

    function fillForm(x) {
        $("#RelationshipId").val(x.id || "");
        $("#RelationshipCode").val(x.code || "");
        $("#RelationshipIsUserPreferred").prop("checked", x.isUserPreferred === true);
        $("#RelationshipName").val(x.relationshipName || "");
        $("#RelationshipStatus").val(x.status || "Active");
    }

    // ---------- Validation ----------
    function validate(m) {
        var ok = true;

        if (!m.code) {
            $("#valRelationshipCode").text("Code is required.");
            ok = false;
        }
        if (!m.relationshipName) {
            $("#valRelationshipName").text("Name Of Relationship is required.");
            ok = false;
        }
        if (!m.status) {
            $("#valRelationshipStatus").text("Status is required.");
            ok = false;
        }

        return ok;
    }

    function clearValidation() {
        $("#valRelationshipCode").text("");
        $("#valRelationshipName").text("");
        $("#valRelationshipStatus").text("");
    }

    // ---------- Alerts ----------
    function showSuccess(msg) {
        if (window.CsmCommon && CsmCommon.showSuccess) {
            CsmCommon.showSuccess(msg);
            return;
        }
        if (window.Swal) {
            Swal.fire({ icon: "success", title: "Success", text: msg });
            return;
        }
        alert(msg);
    }

    function showError(msg) {
        if (window.CsmCommon && CsmCommon.showError) {
            CsmCommon.showError(msg);
            return;
        }
        if (window.Swal) {
            Swal.fire({ icon: "error", title: "Error", text: msg });
            return;
        }
        alert(msg);
    }

    function showConfirmDelete(onYes) {
        if (window.Swal) {
            Swal.fire({
                icon: "warning",
                title: "Are you sure?",
                text: "Do you want to delete this record?",
                showCancelButton: true,
                confirmButtonText: "Yes, delete",
                cancelButtonText: "Cancel"
            }).then(function (r) {
                if (r.isConfirmed) onYes();
            });
            return;
        }

        if (confirm("Do you want to delete this record?")) onYes();
    }

    // ---------- Utils ----------
    function escapeHtml(s) {
        s = (s || "").toString();
        return s
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // DOM ready
    $(init);

})();
