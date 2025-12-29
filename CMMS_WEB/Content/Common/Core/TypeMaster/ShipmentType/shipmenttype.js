// ===============================
// shipmenttype.js (UI-only)
// Version: 1.0.0
// ===============================
(function () {

    var STORE_KEY = "CMMS_CORE_SHIPMENTTYPE";
    var store = CsmData.createStore(STORE_KEY);

    // elements
    var $id = $("#ShipmentTypeId");
    var $code = $("#ShipmentTypeCode");
    var $isUserPreferred = $("#ShipmentTypeIsUserPreferred");
    var $name = $("#ShipmentTypeName");
    var $status = $("#ShipmentTypeStatus");

    var $btnClear = $("#btnShipmentTypeClear");
    var $btnSave = $("#btnShipmentTypeSave");

    var $tbl = $("#tblShipmentType");

    function init() {
        bindLookups();
        wireEvents();
        ensureSeed();
        resetForm();
        renderTable();
    }

    function bindLookups() {
        // Status (Active/Inactive)
        if (window.CsmCommon && window.CsmData) {
            CsmCommon.bindDropdown($status, CsmData.Lookups.Status, "Active", true);
        }
    }

    function wireEvents() {

        $isUserPreferred.on("change", function () {
            var on = $(this).is(":checked");
            if (on) $code.prop("readonly", false);
            else $code.prop("readonly", true);
        });

        $btnClear.on("click", function () {
            resetForm();
        });

        $btnSave.on("click", function () {
            save();
        });

        // row double click -> edit
        $tbl.off('dblclick', 'tbody tr').on("dblclick", "tbody tr", function () {
            var id = $(this).data("id");
            if (!id) return;

            var item = store.getById(id);
            if (!item) return;

            loadToForm(item);
        });

        // delete
        $tbl.off('click', '.btn-delete').on("click", ".btn-delete", function (e) {
            e.preventDefault();

            var id = $(this).data("id") || $(this).closest('a').data('id') || $(this).closest('tr').data('id');
            if (!id) return;

            CsmCommon.confirmDelete("Are you sure you want to delete this Shipment Type?", function () {
                var ok = store.softDelete(id);
                if (ok) {
                    CsmCommon.success("Deleted successfully.");
                    renderTable();
                    resetForm();
                    // reload page so other pages pick up master changes
                    setTimeout(function () { window.location.reload(); }, 800);
                }
            });
        });
    }

    function ensureSeed() {
        // Optional: if you want initial hardcoded rows, add here.
        // Leave empty if not needed.
    }

    function resetForm() {
        clearValidation();

        $id.val("");
        $isUserPreferred.prop("checked", false);
        $code.prop("readonly", true);

        // auto code
        $code.val(CsmData.getNextCode(STORE_KEY, "code", "ST", 1001, 0));

        $name.val("");
        $status.val("Active");
    }

    function clearValidation() {
        $("#valShipmentTypeCode").text("");
        $("#valShipmentTypeName").text("");
        $("#valShipmentTypeStatus").text("");
    }

    function validate() {
        clearValidation();

        var ok = true;

        var code = ($code.val() || "").trim();
        var name = ($name.val() || "").trim();
        var status = ($status.val() || "").trim();

        if (!code) {
            $("#valShipmentTypeCode").text("Code is required");
            ok = false;
        }

        if (!name) {
            $("#valShipmentTypeName").text("Shipment Type Name is required");
            ok = false;
        }

        if (!status) {
            $("#valShipmentTypeStatus").text("Status is required");
            ok = false;
        }

        return ok;
    }

    function save() {
        if (!validate()) return;

        var isEdit = !!$id.val();

        var item = {
            id: $id.val() || null,
            code: ($code.val() || "").trim(),
            shipmentTypeName: ($name.val() || "").trim(),
            isUserPreferred: $isUserPreferred.is(":checked"),
            status: ($status.val() || "").trim(),
            isDeleted: false
        };

        store.save(item);

        CsmCommon.success(isEdit ? "Updated successfully." : "Saved successfully.");
        renderTable();
        resetForm();

        // reload page so changes are visible across app (other pages reading masters)
        setTimeout(function () { window.location.reload(); }, 800);
    }

    function loadToForm(item) {
        clearValidation();

        $id.val(item.id);
        $code.val(item.code);
        $name.val(item.shipmentTypeName);
        $status.val(item.status);

        $isUserPreferred.prop("checked", item.isUserPreferred === true);
        $code.prop("readonly", item.isUserPreferred !== true);
    }

    function renderTable() {
        var list = store.listActive();

        var rowsHtml = "";
        (list || []).forEach(function (x) {
            rowsHtml += ""
                + "<tr data-id='" + escapeHtml(x.id) + "'>"
                + " <td>" + escapeHtml(x.code) + "</td>"
                + " <td>" + escapeHtml(x.shipmentTypeName) + "</td>"
                + " <td>" + escapeHtml(x.status) + "</td>"
                + " <td class='text-center'>"
                + "   <a href='#' class='btn-delete text-danger' data-id='" + escapeHtml(x.id) + "' title='Delete'>"
                + "     <i class='fa fa-trash'></i>"
                + "   </a>"
                + " </td>"
                + "</tr>";
        });

        $tbl.find("tbody").html(rowsHtml);

        // DataTable init/re-init
        if (window.CsmCommon) {
            CsmCommon.initDataTable("#tblShipmentType", {
                pageLength: 10,
                lengthMenu: [10, 20, 30, 50],
                searching: true
            });
        }
    }

    function escapeHtml(s) {
        if (s === null || s === undefined) return "";
        return s.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    $(init);

})();
