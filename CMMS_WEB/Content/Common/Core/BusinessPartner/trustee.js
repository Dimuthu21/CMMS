// ===============================
// trustee.js (Trustee UI logic)
// Version: 1.0.0
// ===============================

(function () {

    var STORE_KEY = "CMMS_CORE_TRUSTEE";
    var CODE_PREFIX = "TE";
    var CODE_FIELD = "code";

    var store = CsmData.createStore(STORE_KEY);
    var _dt = null; // DataTable instance

    function setDefaultState() {
        // default status Active
        CsmCommon.bindDropdown($("#TrusteeStatus"), CsmData.Lookups.Status, "Active", false);

        // auto-generate code
        var nextCode = CsmData.getNextCode(STORE_KEY, CODE_FIELD, CODE_PREFIX, 1001, 0);
        $("#TrusteeCode").val(nextCode);
        $("#TrusteeCode").prop("readonly", true);

        $("#TrusteeUserPreferred").prop("checked", false);
        $("#TrusteeId").val("");
        $("#TrusteeName").val("");

        clearValidation();
        renderTable();
    }

    function clearValidation() {
        $("#valTrusteeCode").text("");
        $("#valTrusteeName").text("");
        $("#valTrusteeStatus").text("");
    }

    function validateForm() {
        clearValidation();

        var code = ($("#TrusteeCode").val() || "").trim();
        var name = ($("#TrusteeName").val() || "").trim();
        var status = ($("#TrusteeStatus").val() || "").trim();

        var ok = true;

        if (!code) {
            $("#valTrusteeCode").text("Code is required");
            ok = false;
        }

        if (!name) {
            $("#valTrusteeName").text("Trustee Name is required");
            ok = false;
        }

        if (!status) {
            $("#valTrusteeStatus").text("Status is required");
            ok = false;
        }

        return ok;
    }

    function readForm() {
        return {
            id: ($("#TrusteeId").val() || "").trim(),
            code: ($("#TrusteeCode").val() || "").trim(),
            trusteeName: ($("#TrusteeName").val() || "").trim(),
            status: ($("#TrusteeStatus").val() || "").trim(),
            isUserPreferred: $("#TrusteeUserPreferred").is(":checked"),
            isDeleted: false
        };
    }

    function fillForm(item) {
        $("#TrusteeId").val(item.id || "");
        $("#TrusteeCode").val(item.code || "");
        $("#TrusteeName").val(item.trusteeName || "");
        $("#TrusteeUserPreferred").prop("checked", item.isUserPreferred === true);

        CsmCommon.bindDropdown($("#TrusteeStatus"), CsmData.Lookups.Status, item.status || "Active", false);

        // if user preferred -> allow editing code
        if (item.isUserPreferred === true) {
            $("#TrusteeCode").prop("readonly", false);
        } else {
            $("#TrusteeCode").prop("readonly", true);
        }

        clearValidation();
    }

    function renderTable() {
        var list = store.listActive();

        // Destroy existing DataTable if present to avoid re-init issues
        if ($.fn.DataTable && $.fn.DataTable.isDataTable("#tblTrustee")) {
            try {
                $("#tblTrustee").DataTable().destroy();
            } catch (e) { /* ignore */ }
            $("#tblTrustee tbody").empty();
        }

        var $tbody = $("#tblTrustee tbody");
        $tbody.empty();

        list.forEach(function (x) {
            var tr = $("<tr/>")
                .attr("data-id", x.id)
                .append($("<td/>").text(x.code || ""))
                .append($("<td/>").text(x.trusteeName || ""))
                .append($("<td/>").text(x.status || ""))
                .append(
                    $("<td class='text-center'/>").append(
                        $("<a href='#' class='btn-delete text-danger' title='Delete'><i class='fa fa-trash'></i></a>")
                    )
                );

            $tbody.append(tr);
        });

        _dt = CsmCommon.initDataTable("#tblTrustee", {
            pageLength: 10,
            lengthMenu: [10, 20, 30, 50],
            searching: true
        });
    }

    function save() {
        if (!validateForm()) return;

        var item = readForm();

        // New record: if not user preferred, ensure auto code is applied
        if (!item.id && item.isUserPreferred !== true) {
            item.code = CsmData.getNextCode(STORE_KEY, CODE_FIELD, CODE_PREFIX, 1001, 0);
            $("#TrusteeCode").val(item.code);
        }

        store.save(item);

        // success message
        if (item.id) {
            CsmCommon.success("Updated successfully");
        } else {
            CsmCommon.success("Saved successfully");
        }

        // Update UI immediately without requiring full page refresh
        renderTable();
        setDefaultState();
    }

    function softDelete(id) {
        CsmCommon.confirmDelete("Are you sure you want to delete this Trustee?", function () {
            store.softDelete(id);
            CsmCommon.success("Deleted successfully");

            // Update table immediately
            renderTable();
            setDefaultState();
        });
    }

    function onRowDblClick(id) {
        var item = store.getById(id);
        if (!item || item.isDeleted === true) return;

        fillForm(item);
    }

    function toggleUserPreferred() {
        var isOn = $("#TrusteeUserPreferred").is(":checked");

        if (isOn) {
            $("#TrusteeCode").prop("readonly", false);
            $("#TrusteeCode").focus();
        } else {
            $("#TrusteeCode").prop("readonly", true);

            // restore auto generated code (for new record only)
            if (!($("#TrusteeId").val() || "").trim()) {
                $("#TrusteeCode").val(CsmData.getNextCode(STORE_KEY, CODE_FIELD, CODE_PREFIX, 1001, 0));
            }
        }
    }

    function wireEvents() {
        $("#btnTrusteeClear").on("click", function () {
            setDefaultState();
        });

        $("#btnTrusteeSave").on("click", function () {
            save();
        });

        $("#TrusteeUserPreferred").on("change", function () {
            toggleUserPreferred();
        });

        // delete click (delegated)
        $("#tblTrustee").off('click', '.btn-delete').on("click", ".btn-delete", function (e) {
            e.preventDefault();
            var id = $(this).closest("tr").attr("data-id");
            if (id) softDelete(id);
        });

        // double click row -> edit (delegated)
        $("#tblTrustee").off('dblclick', 'tbody tr').on("dblclick", "tbody tr", function () {
            var id = $(this).attr("data-id");
            if (id) onRowDblClick(id);
        });
    }

    $(function () {
        // bind status from shared lookup (no duplication)
        CsmCommon.bindDropdown($("#TrusteeStatus"), CsmData.Lookups.Status, "Active", false);

        wireEvents();
        setDefaultState();
    });

})();
