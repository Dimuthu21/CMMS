// ===============================
// bloodgrouptype.js (UI-only)
// Version: 1.0.0
// ===============================
var dt = null;


var BloodGroupTypePage = (function () {

    var storeKey = "CMMS_CORE_BLOODGROUP";
    var store = null;

    // ---------- Init ----------
    function init() {
        if (!window.CsmData || !window.CsmCommon) return;

        store = CsmData.createStore(storeKey);

        seedIfEmpty();
        bindLookups();
        wireEvents();

        resetForm();
        renderTable();
    }

    // ---------- Seed (Hardcoded) ----------
    function seedIfEmpty() {
        var list = store.listActive();
        if (list && list.length > 0) return;

        var seed = [
            { code: "BG1001", bloodGroupType: "A", isUserPreferred: false, status: "Active" },
            { code: "BG1002", bloodGroupType: "A-", isUserPreferred: false, status: "Active" },
            { code: "BG1003", bloodGroupType: "A+", isUserPreferred: false, status: "Active" },
            { code: "BG1004", bloodGroupType: "O+", isUserPreferred: false, status: "Active" },
            { code: "BG1005", bloodGroupType: "B+", isUserPreferred: false, status: "Active" }
        ];

        seed.forEach(function (x) {
            store.save({
                id: null,
                code: x.code,
                bloodGroupType: x.bloodGroupType,
                isUserPreferred: x.isUserPreferred,
                status: x.status,
                isDeleted: false
            });
        });
    }

    // ---------- Lookups ----------
    function bindLookups() {
        // Status dropdown from shared lookup
        CsmCommon.bindDropdown($("#BgStatus"), CsmData.Lookups.Status, "Active", true);
    }

    // ---------- Events ----------
    function wireEvents() {
        $("#btnBgSave").off('click').on("click", onSave);
        $("#btnBgClear").off('click').on("click", function () {
            resetForm();
            clearValidation();
        });

        // Row double click -> edit
        $("#tblBloodGroupType").off('dblclick', 'tbody tr').on("dblclick", "tbody tr", function () {
            var id = $(this).attr("data-id");
            if (!id) return;

            var item = store.getById(id);
            if (!item) return;

            fillForm(item);
            clearValidation();
        });

        // Delete
        $("#tblBloodGroupType").off('click', '.btn-bg-del').on("click", ".btn-bg-del", function (e) {
            e.preventDefault();
            var id = $(this).attr("data-id");
            if (!id) return;

            CsmCommon.confirmDelete("Are you sure you want to delete this Blood Group?", function () {
                store.softDelete(id);
                CsmCommon.success("Deleted successfully.");
                resetForm();
                renderTable();
            });
        });
    }

    // ---------- Save ----------
    function onSave() {
        clearValidation();

        var model = getForm();
        if (!validate(model)) return;

        store.save(model);

        CsmCommon.success("Saved successfully.");
        resetForm();
        renderTable();
    }

    // ---------- Form helpers ----------
    function getForm() {
        return {
            id: $("#BgId").val() || null,
            code: ($("#BgCode").val() || "").trim(),
            isUserPreferred: $("#BgUserPreferred").is(":checked"),
            bloodGroupType: ($("#BgType").val() || "").trim(),
            status: ($("#BgStatus").val() || "").trim(),
            isDeleted: false
        };
    }

    function fillForm(x) {
        $("#BgId").val(x.id || "");
        $("#BgCode").val(x.code || "");
        $("#BgUserPreferred").prop("checked", x.isUserPreferred === true);
        $("#BgType").val(x.bloodGroupType || "");
        $("#BgStatus").val(x.status || "");
    }

    function resetForm() {
        $("#BgId").val("");

        var nextCode = CsmData.getNextCode(storeKey, "code", "BG", 1001, 0);
        $("#BgCode").val(nextCode);

        $("#BgUserPreferred").prop("checked", false);
        $("#BgType").val("");
        $("#BgStatus").val("Active");
    }

    // ---------- Validation ----------
    function validate(m) {
        var ok = true;

        if (!m.code) {
            $("#valBgCode").text("Code is required.");
            ok = false;
        }

        if (!m.bloodGroupType) {
            $("#valBgType").text("Blood Group Type is required.");
            ok = false;
        }

        if (!m.status) {
            $("#valBgStatus").text("Status is required.");
            ok = false;
        }

        return ok;
    }

    function clearValidation() {
        $("#valBgCode").text("");
        $("#valBgType").text("");
        $("#valBgStatus").text("");
    }

    // ---------- Table ----------
    function renderTable() {
        var list = store.listActive();

        // build rows array for DataTable
        var rows = (list || []).map(function (x) {
            return [
                escapeHtml(x.code || x.Code),
                escapeHtml(x.bloodGroupType || x.BloodGroupType),
                escapeHtml(x.status || x.Status),
                "<a href='#' class='btn-bg-del text-danger' data-id='" + (x.id || "") + "' title='Delete'>" +
                "<i class='fa fa-trash'></i></a>"
            ];
        });

        // init once
        if (!dt) {
            dt = $("#tblBloodGroupType").DataTable({
                pageLength: 10
            });
        }

        // refresh table instantly
        dt.clear();
        dt.rows.add(rows);
        dt.draw(false);
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

    return {
        init: init
    };

})();

$(function () {
    BloodGroupTypePage.init();
});
