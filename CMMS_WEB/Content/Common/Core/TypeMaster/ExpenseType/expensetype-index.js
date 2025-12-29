// ===============================
// expensetype-index.js (UI-only)
// Module : Core > TypeMaster > ExpenseType
// Version: 1.0.0
// ===============================

(function () {

    var STORE_KEY = "CMMS_CORE_TM_EXPENSETYPE";
    var store = null;

    function init() {
        if (!window.CsmData || !window.CsmCommon) {
            console.error("CsmData / CsmCommon not loaded.");
            return;
        }

        store = CsmData.createStore(STORE_KEY);

        bindStatusDropdown();
        seedIfEmpty();

        wireEvents();
        loadForEditIfAny();
        ensureCodeIfNew();
    }

    // Convert shared Status lookup into numeric IDs (so it works with your Model StatusId int)
    function getStatusOptions() {
        var src = (CsmData.Lookups && CsmData.Lookups.Status) ? CsmData.Lookups.Status : [];
        return src.map(function (x) {
            var v = (x && x.value) ? x.value.toString() : "";
            var id = (v.toLowerCase() === "active") ? 1 : 2; // 1=Active, 2=Inactive
            return { value: id, text: (x && x.text) ? x.text : v };
        });
    }

    function getStatusTextById(statusId) {
        var opts = getStatusOptions();
        var found = opts.find(function (x) { return parseInt(x.value, 10) === parseInt(statusId, 10); });
        return found ? found.text : "";
    }

    function bindStatusDropdown() {
        var $ddl = $("#ExpenseTypeStatus");
        if (!$ddl.length) return;

        $ddl.empty().append($("<option/>").val("").text("Select"));

        getStatusOptions().forEach(function (x) {
            $ddl.append($("<option/>").val(x.value).text(x.text));
        });
    }

    function seedIfEmpty() {
        // Rough UI sample seed (only if empty)
        var list = store.listAll();
        if (list && list.length > 0) return;

        store.save({
            code: "EP1005",
            name: "ddd",
            isUserPreferred: false,
            statusId: 1,
            statusText: "Active",
            isDeleted: false,
            createdOn: new Date().toISOString()
        });
    }

    function wireEvents() {

        $("#btnGoExpenseTypeList").on("click", function () {
            window.location.href = "/ExpenseType/ExpenseTypeList";
        });

        $("#btnExpenseTypeClear").on("click", function () {
            resetForm();
            ensureCodeIfNew();
        });

        $("#btnExpenseTypeSave").on("click", function () {
            onSave();
        });

        $("#btnExpenseTypeDelete").on("click", function () {
            onDelete();
        });
    }

    function getQueryParam(name) {
        name = name || "";
        var url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    function loadForEditIfAny() {
        var id = getQueryParam("id");
        if (!id) return;

        var item = store.getById(id);
        if (!item || item.isDeleted === true) {
            CsmCommon.error("Record not found.");
            return;
        }

        $("#ExpenseTypeId").val(item.id);
        $("#ExpenseTypeCode").val(item.code || "");
        $("#ExpenseTypeName").val(item.name || "");
        $("#ExpenseTypeIsUserPreferred").prop("checked", item.isUserPreferred === true);

        $("#ExpenseTypeStatus").val(item.statusId ? item.statusId.toString() : "");

        // show delete in edit mode
        $("#btnExpenseTypeDelete").show();
    }

    function ensureCodeIfNew() {
        var id = ($("#ExpenseTypeId").val() || "").toString().trim();
        if (id) return; // edit mode (do nothing)

        // ✅ 1) Default Status = Active when creating NEW
        // Active = 1 in our mapping
        var statusVal = ($("#ExpenseTypeStatus").val() || "").toString().trim();
        if (!statusVal) {
            $("#ExpenseTypeStatus").val("1");
        }

        // ✅ 2) Auto-generate Code only if empty
        var code = ($("#ExpenseTypeCode").val() || "").toString().trim();
        if (code) return;

        var next = CsmData.getNextCode(STORE_KEY, "code", "EP", 1001, 0);
        $("#ExpenseTypeCode").val(next);
    }


    function resetForm() {
        $("#ExpenseTypeId").val("");
        $("#ExpenseTypeCode").val("");
        $("#ExpenseTypeName").val("");
        $("#ExpenseTypeIsUserPreferred").prop("checked", false);
        $("#ExpenseTypeStatus").val("");

        clearValidation();

        $("#btnExpenseTypeDelete").hide();
    }

    function clearValidation() {
        $("#valExpenseTypeCode").text("");
        $("#valExpenseTypeName").text("");
        $("#valExpenseTypeStatus").text("");

        $("#ExpenseTypeName").removeClass("input-validation-error");
        $("#ExpenseTypeStatus").removeClass("input-validation-error");
    }

    function validateForm() {
        clearValidation();

        var ok = true;

        var name = ($("#ExpenseTypeName").val() || "").toString().trim();
        var statusId = ($("#ExpenseTypeStatus").val() || "").toString().trim();

        if (!name) {
            $("#valExpenseTypeName").text("Expense type name is required");
            $("#ExpenseTypeName").addClass("input-validation-error");
            ok = false;
        }

        if (!statusId) {
            $("#valExpenseTypeStatus").text("Status is required");
            $("#ExpenseTypeStatus").addClass("input-validation-error");
            ok = false;
        }

        return ok;
    }

    function onSave() {

        if (!validateForm()) {
            // Do not show SweetAlert for validation failures; inline text-danger messages are displayed above.
            // Focus and scroll to first invalid field so user can correct it.
            var $first = $(".input-validation-error").first();
            if ($first && $first.length) {
                try { $first.focus(); } catch (e) { }
                if ($first.offset && typeof $first.offset === 'function') {
                    $('html, body').animate({ scrollTop: $first.offset().top - 120 }, 200);
                }
            }
            return;
        }

        var id = ($("#ExpenseTypeId").val() || "").toString().trim();
        var isEdit = !!id;

        var statusId = parseInt($("#ExpenseTypeStatus").val(), 10);

        var payload = {
            id: id || null,
            code: ($("#ExpenseTypeCode").val() || "").toString().trim(),
            name: ($("#ExpenseTypeName").val() || "").toString().trim(),
            isUserPreferred: $("#ExpenseTypeIsUserPreferred").is(":checked"),
            statusId: statusId,
            statusText: getStatusTextById(statusId),
            isDeleted: false,
            updatedOn: new Date().toISOString()
        };

        if (!isEdit) {
            payload.createdOn = new Date().toISOString();
        }

        store.save(payload);

        CsmCommon.success(isEdit ? "Expense Type updated successfully." : "Expense Type saved successfully.");

        // After save -> go to list (your SS flow)
        window.location.href = "/ExpenseType/ExpenseTypeList";
    }

    function onDelete() {
        var id = ($("#ExpenseTypeId").val() || "").toString().trim();
        if (!id) return;

        CsmCommon.confirmDelete("Are you sure you want to delete this expense type?", function () {
            var ok = store.softDelete(id);
            if (ok) {
                CsmCommon.success("Deleted successfully.");
                window.location.href = "/ExpenseType/ExpenseTypeList";
            } else {
                CsmCommon.error("Delete failed.");
            }
        });
    }

    $(document).ready(init);

})();
