// ===============================
// sector.js (Sector UI logic)
// Version: 1.0.0
// ===============================

(function () {

    var STORE_KEY = "CMMS_CORE_SECTOR";
    var CODE_PREFIX = "SE";
    var CODE_FIELD = "code";

    var store = CsmData.createStore(STORE_KEY);
    var _dt = null;

    function clearValidation() {
        $("#valSectorCode").text("");
        $("#valSectorName").text("");
        $("#valSectorStatus").text("");
    }

    function bindLookups() {
        // Status default Active (NOT searchable)
        CsmCommon.bindDropdown($("#SectorStatus"), CsmData.Lookups.Status, "Active", false);
    }

    // Seed hardcoded data ONCE (Private/Government)
    function seedOnce() {
        // If store already has any data, DO NOT seed again
        var existing = store.listAll();
        if (existing && existing.length > 0) return;

        var seed = [
            {
                id: "SEED-SE-1001",
                code: "SE1001",
                sectorName: "Private Sector",
                category: "Private",
                status: "Active",
                isUserPreferred: false,
                isDeleted: false
            },
            {
                id: "SEED-SE-1002",
                code: "SE1002",
                sectorName: "Government Sector",
                category: "Government",
                status: "Active",
                isUserPreferred: false,
                isDeleted: false
            }
        ];

        seed.forEach(function (x) { store.save(x); });
    }


    function setDefaultState() {
        $("#SectorId").val("");
        $("#SectorName").val("");

        $("#SectorUserPreferred").prop("checked", false);
        $("#SectorCode").prop("readonly", true);

        $("#SectorCode").val(CsmData.getNextCode(STORE_KEY, CODE_FIELD, CODE_PREFIX, 1001, 0));

        bindLookups();
        clearValidation();
        renderTable();
    }

    function validateForm() {
        clearValidation();

        var code = ($("#SectorCode").val() || "").trim();
        var name = ($("#SectorName").val() || "").trim();
        var status = ($("#SectorStatus").val() || "").trim();

        var ok = true;

        if (!code) {
            $("#valSectorCode").text("Code is required");
            ok = false;
        }

        if (!name) {
            $("#valSectorName").text("Sector Name is required");
            ok = false;
        }

        if (!status) {
            $("#valSectorStatus").text("Status is required");
            ok = false;
        }

        return ok;
    }

    function readForm() {
        return {
            id: ($("#SectorId").val() || "").trim(),
            code: ($("#SectorCode").val() || "").trim(),
            isUserPreferred: $("#SectorUserPreferred").is(":checked"),
            sectorName: ($("#SectorName").val() || "").trim(),
            // No UI field: default category for new records
            category: "Private",
            status: ($("#SectorStatus").val() || "").trim(),
            isDeleted: false
        };
    }

    function fillForm(item) {
        $("#SectorId").val(item.id || "");
        $("#SectorCode").val(item.code || "");
        $("#SectorName").val(item.sectorName || "");

        $("#SectorUserPreferred").prop("checked", item.isUserPreferred === true);
        $("#SectorCode").prop("readonly", item.isUserPreferred !== true);

        bindLookups();
        $("#SectorStatus").val(item.status || "Active");

        clearValidation();
    }

    function renderTable() {
        var list = store.listActive();

        // Destroy existing DataTable if present to avoid re-init issues
        if ($.fn.DataTable && $.fn.DataTable.isDataTable("#tblSector")) {
            try { $("#tblSector").DataTable().destroy(); } catch (e) { }
            $("#tblSector tbody").empty();
        }

        var $tbody = $("#tblSector tbody");
        $tbody.empty();

        list.forEach(function (x) {
            var tr = $("<tr/>")
                .attr("data-id", x.id)
                .append($("<td/>").text(x.code || ""))
                .append($("<td/>").text(x.sectorName || ""))
                .append($("<td/>").text(x.category || ""))     // <-- Private/Government shown here
                .append($("<td/>").text(x.status || ""))
                .append(
                    $("<td class='text-center'/>").append(
                        $("<a href='#' class='btn-delete text-danger' title='Delete'><i class='fa fa-trash'></i></a>")
                    )
                );

            $tbody.append(tr);
        });

        _dt = CsmCommon.initDataTable("#tblSector", {
            pageLength: 10,
            lengthMenu: [10, 20, 30, 50],
            searching: true
        });
    }

    function toggleUserPreferred() {
        var isOn = $("#SectorUserPreferred").is(":checked");

        if (isOn) {
            $("#SectorCode").prop("readonly", false).focus();
        } else {
            $("#SectorCode").prop("readonly", true);
            if (!($("#SectorId").val() || "").trim()) {
                $("#SectorCode").val(CsmData.getNextCode(STORE_KEY, CODE_FIELD, CODE_PREFIX, 1001, 0));
            }
        }
    }

    function save() {
        if (!validateForm()) return;

        var item = readForm();

        // keep existing category if editing (Private/Government seed)
        if (item.id) {
            var old = store.getById(item.id);
            if (old && old.category) item.category = old.category;
        }

        // new record + not user preferred => ensure auto code
        if (!item.id && item.isUserPreferred !== true) {
            item.code = CsmData.getNextCode(STORE_KEY, CODE_FIELD, CODE_PREFIX, 1001, 0);
            $("#SectorCode").val(item.code);
        }

        var isEdit = !!item.id;
        store.save(item);

        CsmCommon.success(isEdit ? "Updated successfully" : "Saved successfully");

        // Refresh UI immediately
        renderTable();
        setDefaultState();
    }

    function softDelete(id) {
        CsmCommon.confirmDelete("Are you sure you want to delete this Sector?", function () {
            store.softDelete(id);
            CsmCommon.success("Deleted successfully");

            // Refresh UI immediately
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
        $("#btnSectorClear").off('click').on("click", function () { setDefaultState(); });
        $("#btnSectorSave").off('click').on("click", function () { save(); });
        $("#SectorUserPreferred").off('change').on("change", function () { toggleUserPreferred(); });

        // delegated handlers to ensure they work after table re-render
        $("#tblSector").off('click', '.btn-delete').on("click", ".btn-delete", function (e) {
            e.preventDefault();
            var id = $(this).closest("tr").attr("data-id");
            if (id) softDelete(id);
        });

        $("#tblSector").off('dblclick', 'tbody tr').on("dblclick", "tbody tr", function () {
            var id = $(this).attr("data-id");
            if (id) onRowDblClick(id);
        });
    }

    $(function () {
        seedOnce();        // <-- adds Private/Government rows
        bindLookups();
        wireEvents();
        setDefaultState();
    });

})();
