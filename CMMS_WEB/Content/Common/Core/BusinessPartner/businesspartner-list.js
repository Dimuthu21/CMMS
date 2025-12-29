// ===============================
// businesspartner-list.js (UI-only)
// Version: 1.0.0
// ===============================

(function () {

    var STORE_KEY = (CsmData.Masters && CsmData.Masters.Keys)
        ? CsmData.Masters.Keys.BusinessPartner
        : "CMMS_CORE_BP";

    var store = CsmData.createStore(STORE_KEY);

    function _safeText(x) {
        return (x === undefined || x === null) ? "" : String(x);
    }

    function _trusteeText(x) {
        var name = _safeText(x.trusteeName || x.name);
        var code = _safeText(x.code);
        if (name && code) return name + " (" + code + ")";
        return name || code;
    }

    function bindFilters() {
        // Type dropdown includes Supplier/Customer
        var typeOpts = (CsmData.Lookups.BusinessPartnerType || []).map(function (x) {
            return { value: x.value, text: x.text };
        });
        CsmCommon.bindDropdown($("#fltBpType"), typeOpts, "", true);

        // Trustee filter comes from Trustee store
        var trustees = (CsmData.Masters ? CsmData.Masters.getTrustees() : []);
        var trusteeOpts = (trustees || []).map(function (x) {
            return { value: x.id, text: _trusteeText(x) };
        });
        CsmCommon.bindDropdown($("#fltBpTrustee"), trusteeOpts, "", true);

        // Status
        CsmCommon.bindDropdown($("#fltBpStatus"), CsmData.Lookups.Status, "", true);
    }

    function getTypeText(bp) {
        var t = [];
        if (bp.isSupplier === true) t.push("Supplier");
        if (bp.isCustomer === true) t.push("Customer");
        return t.join(", ");
    }

    function renderTable(list) {
        // Destroy existing DataTable if present
        if ($.fn.DataTable && $.fn.DataTable.isDataTable("#tblBpList")) {
            try { $("#tblBpList").DataTable().destroy(); } catch (e) { }
            $("#tblBpList tbody").empty();
        }

        var $tbody = $("#tblBpList tbody").empty();

        (list || []).forEach(function (bp) {
            var tr = $("<tr/>")
                .attr("data-id", bp.id)
                .append($("<td/>").text(bp.code || ""))
                .append($("<td/>").text(bp.name || ""))
                .append($("<td/>").text(getTypeText(bp)))
                .append($("<td/>").text(bp.trusteeText || ""))
                .append($("<td/>").text(bp.status || ""))
                .append(
                    $("<td class='text-center'/>").append(
                        $("<a href='#' class='btn-delete text-danger' title='Delete'><i class='fa fa-trash'></i></a>")
                    )
                );

            $tbody.append(tr);
        });

        CsmCommon.initDataTable("#tblBpList", {
            pageLength: 10,
            lengthMenu: [10, 20, 30, 50],
            searching: true
        });
    }

    function getFilteredList() {
        var type = ($("#fltBpType").val() || "").trim();
        var trusteeId = ($("#fltBpTrustee").val() || "").trim();
        var status = ($("#fltBpStatus").val() || "").trim();

        var list = store.listActive();

        // join trustee name for display
        var trustees = (CsmData.Masters ? CsmData.Masters.getTrustees() : []);
        var trusteeMap = {};
        (trustees || []).forEach(function (t) { if (t && t.id) trusteeMap[t.id] = _trusteeText(t); });

        list = (list || []).map(function (bp) {
            bp.trusteeText = trusteeMap[bp.trusteeId] || "";
            return bp;
        });

        if (type) {
            list = list.filter(function (bp) {
                if (type === "Supplier") return bp.isSupplier === true;
                if (type === "Customer") return bp.isCustomer === true;
                return true;
            });
        }

        if (trusteeId) {
            list = list.filter(function (bp) { return (bp.trusteeId || "") === trusteeId; });
        }

        if (status) {
            list = list.filter(function (bp) { return (bp.status || "") === status; });
        }

        return list;
    }

    function openEdit(id) {
        // goes to create page in edit mode
        window.location.href = "/BusinessPartner/Create?id=" + encodeURIComponent(id);
    }

    function softDelete(id) {
        CsmCommon.confirmDelete("Are you sure you want to delete this Business Partner?", function () {
            store.softDelete(id);
            CsmCommon.success("Deleted successfully");
            renderTable(getFilteredList());
        });
    }

    function clearFilters() {
        $("#fltBpType").val("");
        $("#fltBpTrustee").val("");
        $("#fltBpStatus").val("");
        renderTable(getFilteredList());
    }

    function wireEvents() {
        $("#btnBpFilter").off('click').on("click", function () {
            renderTable(getFilteredList());
        });

        $("#btnBpClearFilter").off('click').on("click", function () {
            clearFilters();
        });

        $("#tblBpList").off('dblclick', 'tbody tr').on("dblclick", "tbody tr", function () {
            var id = $(this).attr("data-id");
            if (id) openEdit(id);
        });

        $("#tblBpList").off('click', '.btn-delete').on("click", ".btn-delete", function (e) {
            e.preventDefault();
            var id = $(this).closest("tr").attr("data-id");
            if (id) softDelete(id);
        });
    }

    $(function () {
        bindFilters();
        renderTable(getFilteredList());
        wireEvents();
    });

})();
