// ===============================
// criticality-index.js (UI-only)
// Module : Core > TypeMaster > Criticality
// Version: 1.0.0
// ===============================

(function () {

    var STORE_KEY = "CMMS_CORE_TM_CRITICALITY";
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
        ensureDefaultsIfNew();   // code + default active status
    }

    function getStatusOptions() {
        var src = (CsmData.Lookups && CsmData.Lookups.Status) ? CsmData.Lookups.Status : [];
        return src.map(function (x) {
            var v = (x && x.value) ? x.value.toString() : "";
            var id = (v.toLowerCase() === "active") ? 1 : 2;
            return { value: id, text: (x && x.text) ? x.text : v };
        });
    }

    function getStatusTextById(statusId) {
        var opts = getStatusOptions();
        var found = opts.find(function (x) { return parseInt(x.value, 10) === parseInt(statusId, 10); });
        return found ? found.text : "";
    }

    function bindStatusDropdown() {
        var $ddl = $("#CriticalityStatus");
        if (!$ddl.length) return;

        $ddl.empty().append($("<option/>").val("").text("Select"));

        getStatusOptions().forEach(function (x) {
            $ddl.append($("<option/>").val(x.value).text(x.text));
        });
    }

    function seedIfEmpty() {
        var list = store.listAll();
        if (list && list.length > 0) return;

        // hardcoded seed only if empty
        store.save({
            code: "CT0013",
            level: "High",
            statusId: 1,
            statusText: "Active",
            userPreferred: false,
            isDeleted: false,
            createdOn: new Date().toISOString()
        });

        store.save({
            code: "CT0014",
            level: "Medium",
            statusId: 1,
            statusText: "Active",
            userPreferred: false,
            isDeleted: false,
            createdOn: new Date().toISOString()
        });
    }

    function wireEvents() {

        $("#btnGoCriticalityList").on("click", function () {
            window.location.href = "/Criticality/CriticalityList";
        });

        $("#btnCriticalityClear").on("click", function () {
            resetForm();
            ensureDefaultsIfNew();
        });

        $("#btnCriticalitySave").on("click", function () {
            onSave();
        });

        $("#btnCriticalityDelete").on("click", function () {
            onDelete();
        });
    }

    function getQueryParam(name) {
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

        $("#CriticalityId").val(item.id);
        $("#CriticalityCode").val(item.code || "");
        $("#CriticalityLevel").val(item.level || "");
        $("#CriticalityUserPreferred").prop("checked", item.userPreferred === true);
        $("#CriticalityStatus").val(item.statusId ? item.statusId.toString() : "");

        $("#btnCriticalityDelete").show();
    }

    function ensureDefaultsIfNew() {
        var id = ($("#CriticalityId").val() || "").toString().trim();
        if (id && id !== "0") return; // edit mode

        // default status = Active
        if (!$("#CriticalityStatus").val()) {
            $("#CriticalityStatus").val("1");
        }

        // auto code if empty
        if (!$("#CriticalityCode").val()) {
            var next = CsmData.getNextCode(STORE_KEY, "code", "CT", 1, 4); // CT0001 style
            $("#CriticalityCode").val(next);
        }
    }

    function resetForm() {
        $("#CriticalityId").val("");
        $("#CriticalityCode").val("");
        $("#CriticalityLevel").val("");
        $("#CriticalityUserPreferred").prop("checked", false);
        $("#CriticalityStatus").val("");

        clearValidation();
        $("#btnCriticalityDelete").hide();
    }

    function clearValidation() {
        $("#valCriticalityCode").text("");
        $("#valCriticalityLevel").text("");
        $("#valCriticalityStatus").text("");

        $("#CriticalityLevel").removeClass("input-validation-error");
        $("#CriticalityStatus").removeClass("input-validation-error");
    }

    function validateForm() {
        clearValidation();

        var ok = true;

        var code = ($("#CriticalityCode").val() || "").toString().trim();
        var level = ($("#CriticalityLevel").val() || "").toString().trim();
        var statusId = ($("#CriticalityStatus").val() || "").toString().trim();

        if (!code) {
            $("#valCriticalityCode").text("Code is required");
            ok = false;
        }

        if (!level) {
            $("#valCriticalityLevel").text("Criticality level is required");
            $("#CriticalityLevel").addClass("input-validation-error");
            ok = false;
        }

        if (!statusId) {
            $("#valCriticalityStatus").text("Status is required");
            $("#CriticalityStatus").addClass("input-validation-error");
            ok = false;
        }

        return ok;
    }

    function onSave() {

        if (!validateForm()) {
            CsmCommon.error("Please fix validation errors.");
            return;
        }

        var id = ($("#CriticalityId").val() || "").toString().trim();
        var isEdit = !!id;

        var statusId = parseInt($("#CriticalityStatus").val(), 10);

        var payload = {
            id: id || null,
            code: ($("#CriticalityCode").val() || "").toString().trim(),
            level: ($("#CriticalityLevel").val() || "").toString().trim(),
            userPreferred: $("#CriticalityUserPreferred").is(":checked"),
            statusId: statusId,
            statusText: getStatusTextById(statusId),
            isDeleted: false,
            updatedOn: new Date().toISOString()
        };

        if (!isEdit) {
            payload.createdOn = new Date().toISOString();
        }

        store.save(payload);

        CsmCommon.success(isEdit ? "Criticality updated successfully." : "Criticality saved successfully.");

        // After save -> go to list
        window.location.href = "/Criticality/CriticalityList";
    }

    function onDelete() {
        var id = ($("#CriticalityId").val() || "").toString().trim();
        if (!id) return;

        CsmCommon.confirmDelete("Are you sure you want to delete this criticality?", function () {
            var ok = store.softDelete(id);
            if (ok) {
                CsmCommon.success("Deleted successfully.");
                window.location.href = "/Criticality/CriticalityList";
            } else {
                CsmCommon.error("Delete failed.");
            }
        });
    }

    $(document).ready(init);

})();
