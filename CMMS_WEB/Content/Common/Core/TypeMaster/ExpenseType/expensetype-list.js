// ===============================
// expensetype-list.js (UI-only)
// Module : Core > TypeMaster > ExpenseType
// Version: 1.0.1
// ===============================

(function () {

    var STORE_KEY = "CMMS_CORE_TM_EXPENSETYPE";
    var store = null;
    var dt = null;

    function init() {
        if (!window.CsmData || !window.CsmCommon) {
            console.error("CsmData / CsmCommon not loaded.");
            return;
        }

        store = CsmData.createStore(STORE_KEY);

        bindStatusFilter();
        bindExpenseNameFilter();
        initSelect2();
        wireEvents();

        renderTable();
    }

    function getStatusOptions() {
        var src = (CsmData.Lookups && CsmData.Lookups.Status) ? CsmData.Lookups.Status : [];
        return src.map(function (x) {
            var v = (x && x.value) ? x.value.toString() : "";
            var id = (v.toLowerCase() === "active") ? 1 : 2; // 1=Active, 2=Inactive
            return { value: id, text: (x && x.text) ? x.text : v };
        });
    }

    function bindStatusFilter() {
        var $ddl = $("#fltExpenseTypeStatus");
        if (!$ddl.length) return;

        $ddl.empty().append($("<option/>").val("").text("- Select Status -"));

        getStatusOptions().forEach(function (x) {
            $ddl.append($("<option/>").val(x.value).text(x.text));
        });
    }

    function bindExpenseNameFilter() {
        var $ddl = $("#fltExpenseTypeName");
        if (!$ddl.length) return;

        $ddl.empty().append($("<option/>").val("").text("- Select Expense -"));

        var list = store.listActive() || [];
        list.forEach(function (x) {
            $ddl.append($("<option/>").val(x.id).text(x.name || ""));
        });
    }

    function initSelect2() {
        if ($.fn.select2) {
            $("#fltExpenseTypeName").select2({ width: "100%" });
        }
    }

    function wireEvents() {

        $("#btnNewExpenseType").off("click").on("click", function () {
            window.location.href = "/ExpenseType/ExpenseTypeIndex";
        });

        $("#btnBpFilter").off("click").on("click", function () {
            renderTable();
        });

        $("#btnBpClearFilter").off("click").on("click", function () {
            $("#fltExpenseTypeCode").val("");
            $("#fltExpenseTypeName").val("").trigger("change");
            $("#fltExpenseTypeStatus").val("");

            renderTable();
        });
    }

    function getFilterData() {
        return {
            code: ($("#fltExpenseTypeCode").val() || "").toString().trim(),
            id: ($("#fltExpenseTypeName").val() || "").toString().trim(),
            statusId: ($("#fltExpenseTypeStatus").val() || "").toString().trim()
        };
    }

    function filterList(list, f) {
        var out = (list || []).slice(0);

        if (f.code) {
            out = out.filter(function (x) {
                return (x.code || "").toString().toLowerCase().indexOf(f.code.toLowerCase()) >= 0;
            });
        }

        if (f.id) {
            out = out.filter(function (x) {
                return (x.id || "") === f.id;
            });
        }

        if (f.statusId) {
            out = out.filter(function (x) {
                return parseInt(x.statusId, 10) === parseInt(f.statusId, 10);
            });
        }

        return out;
    }

    function destroyDataTableIfAny() {
        if ($.fn.DataTable && $.fn.DataTable.isDataTable("#tblExpenseTypes")) {
            $("#tblExpenseTypes").DataTable().destroy();
        }
    }

    function renderTable() {

        // ✅ IMPORTANT FIX:
        // Destroy DataTable BEFORE changing tbody, otherwise it can restore old DOM and filtering looks broken.
        destroyDataTableIfAny();

        var list = store.listActive() || [];
        var f = getFilterData();
        var filtered = filterList(list, f);

        var $tbody = $("#tblExpenseTypes tbody");
        $tbody.empty();

        filtered.forEach(function (x) {
            var tr = $("<tr/>").attr("data-id", x.id);
            tr.append($("<td/>").text(x.code || ""));
            tr.append($("<td/>").text(x.name || ""));
            tr.append($("<td/>").text(x.statusText || ""));
            $tbody.append(tr);
        });

        initDataTable();
        wireRowDoubleClick();
    }

    function initDataTable() {
        dt = CsmCommon.initDataTable("#tblExpenseTypes", {
            ordering: false,
            scrollX: true
        });
    }

    function wireRowDoubleClick() {
        $("#tblExpenseTypes tbody tr").off("dblclick").on("dblclick", function () {
            var id = (($(this).data("id") || "").toString());
            if (!id) return;

            window.location.href = "/ExpenseType/ExpenseTypeIndex?id=" + encodeURIComponent(id);
        });
    }

    $(document).ready(init);

})();
