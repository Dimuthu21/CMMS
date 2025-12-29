// ===============================
// industry.js (Industries UI logic)
// Version: 1.0.0
// ===============================

(function () {

    var STORE_KEY = "CMMS_CORE_INDUSTRY";
    var CODE_PREFIX = "IND";
    var CODE_FIELD = "code";

    var store = CsmData.createStore(STORE_KEY);
    var _dt = null;

    function clearValidation() {
        $("#valIndustryCode").text("");
        $("#valIndustryName").text("");
        $("#valIndustryStatus").text("");
    }

    function bindLookups() {
        // default Active, not searchable
        CsmCommon.bindDropdown($("#IndustryStatus"), CsmData.Lookups.Status, "Active", false);
    }

    // Seed only if store is empty (so refresh will not change your saved data)
    function seedIfEmpty() {
        var existing = store.listAll();
        if (existing && existing.length > 0) return;

        var seed = [
            { id: "SEED-IND-1", code: "IND1", industryName: "Civil", status: "Active", isUserPreferred: false, isDeleted: false },
            { id: "SEED-IND-2", code: "IND2", industryName: "Electrical", status: "Active", isUserPreferred: false, isDeleted: false },
            { id: "SEED-IND-3", code: "IND3", industryName: "Mechanical", status: "Active", isUserPreferred: false, isDeleted: false },
            { id: "SEED-IND-4", code: "IND4", industryName: "Refrigeration and air condition", status: "Active", isUserPreferred: false, isDeleted: false }
        ];

        seed.forEach(function (x) { store.save(x); });
    }

    function setDefaultState() {
        $("#IndustryId").val("");
        $("#IndustryName").val("");

        $("#IndustryUserPreferred").prop("checked", false);
        $("#IndustryCode").prop("readonly", true);

        // auto code: IND1001, IND1002...
        $("#IndustryCode").val(CsmData.getNextCode(STORE_KEY, CODE_FIELD, CODE_PREFIX, 1001, 0));

        bindLookups();
        clearValidation();
        renderTable();
    }

    function validateForm() {
        clearValidation();

        var code = ($("#IndustryCode").val() || "").trim();
        var name = ($("#IndustryName").val() || "").trim();
        var status = ($("#IndustryStatus").val() || "").trim();

        var ok = true;

        if (!code) {
            $("#valIndustryCode").text("Code is required");
            ok = false;
        }

        if (!name) {
            $("#valIndustryName").text("Industry Name is required");
            ok = false;
        }

        if (!status) {
            $("#valIndustryStatus").text("Status is required");
            ok = false;
        }

        return ok;
    }

    function readForm() {
        return {
            id: ($("#IndustryId").val() || "").trim(),
            code: ($("#IndustryCode").val() || "").trim(),
            isUserPreferred: $("#IndustryUserPreferred").is(":checked"),
            industryName: ($("#IndustryName").val() || "").trim(),
            status: ($("#IndustryStatus").val() || "").trim(),
            isDeleted: false
        };
    }

    function fillForm(item) {
        $("#IndustryId").val(item.id || "");
        $("#IndustryCode").val(item.code || "");
        $("#IndustryName").val(item.industryName || "");

        $("#IndustryUserPreferred").prop("checked", item.isUserPreferred === true);
        $("#IndustryCode").prop("readonly", item.isUserPreferred !== true);

        bindLookups();
        $("#IndustryStatus").val(item.status || "Active");

        clearValidation();
    }

    function renderTable() {
        var list = store.listActive();

        // Destroy existing DataTable if present to avoid re-init issues
        if ($.fn.DataTable && $.fn.DataTable.isDataTable("#tblIndustry")) {
            try { $("#tblIndustry").DataTable().destroy(); } catch (e) { }
            $("#tblIndustry tbody").empty();
        }

        var $tbody = $("#tblIndustry tbody");
        $tbody.empty();

        list.forEach(function (x) {
            var tr = $("<tr/>")
                .attr("data-id", x.id)
                .append($("<td/>").text(x.code || ""))
                .append($("<td/>").text(x.industryName || ""))
                .append($("<td/>").text(x.status || ""))
                .append(
                    $("<td class='text-center'/>").append(
                        $("<a href='#' class='btn-delete text-danger' title='Delete'><i class='fa fa-trash'></i></a>")
                    )
                );

            $tbody.append(tr);
        });

        _dt = CsmCommon.initDataTable("#tblIndustry", {
            pageLength: 10,
            lengthMenu: [10, 20, 30, 50],
            searching: true
        });
    }

    function toggleUserPreferred() {
        var isOn = ($("#IndustryUserPreferred").is(":checked"));

        if (isOn) {
            $("#IndustryCode").prop("readonly", false).focus();
        } else {
            $("#IndustryCode").prop("readonly", true);

            // for new record only, restore auto code
            if (!($("#IndustryId").val() || "").trim()) {
                $("#IndustryCode").val(CsmData.getNextCode(STORE_KEY, CODE_FIELD, CODE_PREFIX, 1001, 0));
            }
        }
    }

    function save() {
        if (!validateForm()) return;

        var item = readForm();
        var isEdit = !!item.id;

        // if new and not user preferred -> ensure auto code
        if (!isEdit && item.isUserPreferred !== true) {
            item.code = CsmData.getNextCode(STORE_KEY, CODE_FIELD, CODE_PREFIX, 1001, 0);
            $("#IndustryCode").val(item.code);
        }

        store.save(item);
        CsmCommon.success(isEdit ? "Updated successfully" : "Saved successfully");

        // refresh UI immediately
        renderTable();
        setDefaultState();
    }

    function softDelete(id) {
        CsmCommon.confirmDelete("Are you sure you want to delete this Industry?", function () {
            store.softDelete(id);
            CsmCommon.success("Deleted successfully");

            // refresh UI immediately
            renderTable();
            setDefaultState();
        });
    }

    function onRowDblClick(id) {
        var item = store.getById(id);
        if (!item || item.isDeleted === true) return;
        fillForm(item);
    }

    function wireEvents() {
        $("#btnIndustryClear").off('click').on("click", function () {
            setDefaultState();
        });

        $("#btnIndustrySave").off('click').on("click", function () {
            save();
        });

        $("#IndustryUserPreferred").off('change').on("change", function () {
            toggleUserPreferred();
        });

        // delegated handlers to ensure they work after table re-render
        $("#tblIndustry").off('click', '.btn-delete').on("click", ".btn-delete", function (e) {
            e.preventDefault();
            var id = $(this).closest("tr").attr("data-id");
            if (id) softDelete(id);
        });

        $("#tblIndustry").off('dblclick', 'tbody tr').on("dblclick", "tbody tr", function () {
            var id = $(this).attr("data-id");
            if (id) onRowDblClick(id);
        });
    }

    $(function () {
        seedIfEmpty();
        bindLookups();
        wireEvents();
        setDefaultState();
    });

})();
