// ===============================
// issuemethod.js (UI-only)
// Version: 1.0.0
// ===============================

(function () {

    var STORE_KEY = "csm_typemaster_issuemethod";
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

    function bindLookups() {
        var $ddl = $("#IssueMethodStatus");
        if (!$ddl.length) return;

        if (window.CsmCommon && CsmCommon.bindDropdown) {
            CsmCommon.bindDropdown($ddl, CsmData.Lookups.Status, "Active", true);
            return;
        }

        $ddl.empty().append($("<option/>").val("").text("Select"));
        (CsmData.Lookups.Status || []).forEach(function (x) {
            $ddl.append($("<option/>").val(x.value).text(x.text));
        });
        $ddl.val("Active");
    }

    function seedIfEmpty() {
        var list = store.listActive();
        if (list && list.length > 0) return;

        // hardcoded like screenshot
        store.save({ code: "IT1004", issueTypeName: "C TO C", status: "Active", isUserPreferred: false, isDeleted: false });
        store.save({ code: "IT1005", issueTypeName: "C TO B", status: "Active", isUserPreferred: false, isDeleted: false });
    }

    function wireEvents() {

        $("#btnIssueMethodClear").off("click").on("click", function () {
            clearValidation();
            resetForm();
        });

        $("#btnIssueMethodSave").off("click").on("click", function () {
            clearValidation();

            var model = readForm();
            if (!validate(model)) return;

            store.save(model);
            showSuccess("Saved successfully.");

            resetForm();
            renderTable(); // refresh without page reload
        });

        // delete
        $(document).off("click", ".btn-issuemethod-delete").on("click", ".btn-issuemethod-delete", function (e) {
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

        // dblclick row => fill form (DataTables-safe)
        $("#tblIssueMethod tbody").off("dblclick", "tr").on("dblclick", "tr", function () {

            if (dt) {
                var id = $(this).attr("data-id");
                if (!id) return;

                var obj = store.getById(id);
                if (!obj) return;

                fillForm(obj);
                clearValidation();
                return;
            }


            // fallback
            var id2 = $(this).attr("data-id");
            if (!id2) return;

            var obj2 = store.getById(id2);
            if (!obj2) return;

            fillForm(obj2);
            clearValidation();
        });
    }

    function initDataTableIfNeeded() {
        if (!$.fn.DataTable) {
            console.warn("DataTables not loaded.");
            return;
        }

        if ($.fn.DataTable.isDataTable("#tblIssueMethod")) {
            $("#tblIssueMethod").DataTable().destroy();
        }

        dt = $("#tblIssueMethod").DataTable({
            paging: true,
            searching: true,
            ordering: true,
            autoWidth: false,
            pageLength: 10,
            columnDefs: [
                { targets: 3, orderable: false, searchable: false } // Action column
            ]
        });
    }

    function renderTable() {
        var list = store.listActive();

        if (dt) {

            var rows = (list || []).map(function (x) {
                return [
                    escapeHtml(x.code || ""),
                    escapeHtml(x.issueTypeName || ""),
                    escapeHtml(x.status || ""),
                    "<a href='#' class='btn-issuemethod-delete text-danger' data-id='" + (x.id || "") + "' title='Delete'>"
                    + "<i class='fa fa-trash'></i></a>"
                ];
            });

            dt.clear();
            dt.rows.add(rows);
            dt.draw(false);

            // IMPORTANT: store id on row node for double click
            dt.rows().every(function (idx) {
                var data = this.data();
                var item = (list || [])[idx];
                if (item && item.id) {
                    $(this.node()).attr("data-id", item.id);
                }
            });

            return;
        }


        var $tbody = $("#tblIssueMethod tbody");
        $tbody.empty();

        (list || []).forEach(function (x) {
            var tr = ""
                + "<tr data-id='" + (x.id || "") + "'>"
                + "<td>" + escapeHtml(x.code || "") + "</td>"
                + "<td>" + escapeHtml(x.issueTypeName || "") + "</td>"
                + "<td>" + escapeHtml(x.status || "") + "</td>"
                + "<td class='text-center'>"
                + "<a href='#' class='btn-issuemethod-delete text-danger' data-id='" + (x.id || "") + "' title='Delete'>"
                + "<i class='fa fa-trash'></i></a>"
                + "</td>"
                + "</tr>";

            $tbody.append(tr);
        });
    }

    function resetForm() {
        $("#IssueMethodId").val("");
        $("#IssueMethodIsUserPreferred").prop("checked", false);

        var nextCode = CsmData.getNextCode(STORE_KEY, "code", "IT", 1001, 0);
        $("#IssueMethodCode").val(nextCode);

        $("#IssueMethodName").val("");
        $("#IssueMethodStatus").val("Active");
    }

    function readForm() {
        return {
            id: $("#IssueMethodId").val() || "",
            code: ($("#IssueMethodCode").val() || "").trim(),
            issueTypeName: ($("#IssueMethodName").val() || "").trim(),
            status: ($("#IssueMethodStatus").val() || "").trim(),
            isUserPreferred: $("#IssueMethodIsUserPreferred").is(":checked"),
            isDeleted: false
        };
    }

    function fillForm(x) {
        $("#IssueMethodId").val(x.id || "");
        $("#IssueMethodCode").val(x.code || "");
        $("#IssueMethodIsUserPreferred").prop("checked", x.isUserPreferred === true);
        $("#IssueMethodName").val(x.issueTypeName || "");
        $("#IssueMethodStatus").val(x.status || "Active");
    }

    function validate(m) {
        var ok = true;

        if (!m.code) { $("#valIssueMethodCode").text("Code is required."); ok = false; }
        if (!m.issueTypeName) { $("#valIssueMethodName").text("Issue Type Name is required."); ok = false; }
        if (!m.status) { $("#valIssueMethodStatus").text("Status is required."); ok = false; }

        return ok;
    }

    function clearValidation() {
        $("#valIssueMethodCode").text("");
        $("#valIssueMethodName").text("");
        $("#valIssueMethodStatus").text("");
    }

    function showSuccess(msg) {
        if (window.CsmCommon && CsmCommon.showSuccess) { CsmCommon.showSuccess(msg); return; }
        if (window.Swal) { Swal.fire({ icon: "success", title: "Success", text: msg }); return; }
        alert(msg);
    }

    function showError(msg) {
        if (window.CsmCommon && CsmCommon.showError) { CsmCommon.showError(msg); return; }
        if (window.Swal) { Swal.fire({ icon: "error", title: "Error", text: msg }); return; }
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
            }).then(function (r) { if (r.isConfirmed) onYes(); });
            return;
        }
        if (confirm("Do you want to delete this record?")) onYes();
    }

    function escapeHtml(s) {
        s = (s || "").toString();
        return s
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    $(init);

})();
