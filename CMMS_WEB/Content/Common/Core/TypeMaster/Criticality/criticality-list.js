// ===============================
// criticality-list.js (UI-only)
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

        bindStatusFilter();
        wireEvents();
        renderTable();
    }

    function getStatusOptions() {
        var src = (CsmData.Lookups && CsmData.Lookups.Status) ? CsmData.Lookups.Status : [];
        return src.map(function (x) {
            var v = (x && x.value) ? x.value.toString() : "";
            var id = (v.toLowerCase() === "active") ? 1 : 2;
            return { value: id, text: (x && x.text) ? x.text : v };
        });
    }

    function bindStatusFilter() {
        var $ddl = $("#fltCriticalityStatus");
        if (!$ddl.length) return;

        $ddl.empty().append($("<option/>").val("").text("Select Status"));

        getStatusOptions().forEach(function (x) {
            $ddl.append($("<option/>").val(x.value).text(x.text));
        });
    }

    function wireEvents() {

        $("#btnNewCriticality").off("click").on("click", function () {
            window.location.href = "/Criticality/CriticalityIndex";
        });

        $("#btnCriticalityFilter").off("click").on("click", function () {
            renderTable();
        });

        $("#btnCriticalityFilterClear").off("click").on("click", function () {
            $("#fltCriticalityCode").val("");
            $("#fltCriticalityLevel").val("");
            $("#fltCriticalityStatus").val("");

            renderTable();
        });
    }

    function getFilterData() {
        return {
            code: ($("#fltCriticalityCode").val() || "").toString().trim(),
            level: ($("#fltCriticalityLevel").val() || "").toString().trim(),
            statusId: ($("#fltCriticalityStatus").val() || "").toString().trim()
        };
    }

    function filterList(list, f) {
        var out = (list || []).slice(0);

        if (f.code) {
            out = out.filter(function (x) {
                return (x.code || "").toLowerCase().indexOf(f.code.toLowerCase()) >= 0;
            });
        }

        if (f.level) {
            out = out.filter(function (x) {
                return (x.level || "").toLowerCase().indexOf(f.level.toLowerCase()) >= 0;
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
        if ($.fn.DataTable && $.fn.DataTable.isDataTable("#tblCriticality")) {
            $("#tblCriticality").DataTable().destroy();
        }
    }

    function renderTable() {

        // IMPORTANT: destroy DataTable before changing tbody
        destroyDataTableIfAny();

        var list = store.listActive() || [];
        var f = getFilterData();
        var filtered = filterList(list, f);

        var $tbody = $("#tblCriticality tbody");
        $tbody.empty();

        filtered.forEach(function (x) {
            var tr = $("<tr/>").attr("data-id", x.id);
            tr.append($("<td/>").text(x.code || ""));
            tr.append($("<td/>").text(x.level || ""));
            tr.append($("<td/>").text(x.statusText || ""));
            $tbody.append(tr);
        });

        CsmCommon.initDataTable("#tblCriticality", {
            ordering: false,
            scrollX: true
        });

        wireRowDoubleClick();
    }

    function wireRowDoubleClick() {
        $("#tblCriticality tbody tr").off("dblclick").on("dblclick", function () {
            var id = (($(this).data("id") || "").toString());
            if (!id) return;

            window.location.href = "/Criticality/CriticalityIndex?id=" + encodeURIComponent(id);
        });
    }

    $(document).ready(init);

})();
