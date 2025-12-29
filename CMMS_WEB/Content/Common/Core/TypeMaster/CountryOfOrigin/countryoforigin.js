// ===============================
// countryoforigin.js (UI-only)
// Version: 1.0.0
// ===============================

(function () {

    var STORE_KEY = "csm_typemaster_countryoforigin";
    var store = CsmData.createStore(STORE_KEY);

    var dt = null;

    function init() {
        bindLookups();
        seedIfEmpty();
        resetForm();
        renderTable();
        wireEvents();
    }

    function bindLookups() {
        if (window.CsmCommon && CsmCommon.bindDropdown) {
            CsmCommon.bindDropdown($("#CountryStatus"), CsmData.Lookups.Status, "Active", true);
        }
    }

    function seedIfEmpty() {
        var list = store.listActive();
        if (list && list.length > 0) return;

        store.save({ code: "CT1001", countryName: "Sri Lanka", status: "Active", isUserPreferred: false, isDeleted: false });
        store.save({ code: "CT1002", countryName: "India", status: "Active", isUserPreferred: false, isDeleted: false });
        store.save({ code: "CT1003", countryName: "United Kindom", status: "Active", isUserPreferred: false, isDeleted: false });
        store.save({ code: "CT1004", countryName: "USA", status: "Active", isUserPreferred: false, isDeleted: false });
        store.save({ code: "CT1007", countryName: "China", status: "Active", isUserPreferred: false, isDeleted: false });
    }

    function wireEvents() {

        $("#btnCountryClear").on("click", function () {
            clearValidation();
            resetForm();
        });

        $("#btnCountrySave").on("click", function () {
            clearValidation();

            var model = readForm();
            if (!validate(model)) return;

            store.save(model);

            if (window.CsmCommon && CsmCommon.success) {
                CsmCommon.success("Saved successfully.");
            } else if (window.Swal) {
                Swal.fire({ icon: "success", title: "Success", text: "Saved successfully." });
            } else {
                alert("Saved successfully.");
            }

            // refresh list and form immediately in UI and also reload page so other parts of app pick up changes
            resetForm();
            renderTable();

            // reload after short delay so user sees the alert
            setTimeout(function () { window.location.reload(); }, 800);
        });

        $("#tblCountry tbody").on("click", ".btn-country-delete", function (e) {
            e.preventDefault();
            e.stopPropagation();

            var id = $(this).data("id");

            if (window.Swal) {
                Swal.fire({
                    icon: "warning",
                    title: "Delete?",
                    text: "Do you want to delete this record?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete",
                    cancelButtonText: "Cancel"
                }).then(function (r) {
                    if (r.isConfirmed) doDelete(id);
                });
            } else {
                if (confirm("Do you want to delete this record?")) doDelete(id);
            }
        });

        $("#tblCountry tbody").on("dblclick", "tr", function () {
            var id = $(this).attr("data-id");
            if (!id) return;

            var obj = store.getById(id);
            if (!obj) return;

            fillForm(obj);
            clearValidation();
        });
    }

    function doDelete(id) {
        var ok = store.softDelete(id);

        if (ok) {
            if (window.CsmCommon && CsmCommon.success) {
                CsmCommon.success("Deleted successfully.");
            } else if (window.Swal) {
                Swal.fire({ icon: "success", title: "Success", text: "Deleted successfully." });
            } else {
                alert("Deleted successfully.");
            }
            resetForm();
            renderTable();

            // reload so changes are visible across the app
            setTimeout(function () { window.location.reload(); }, 800);
        } else {
            if (window.CsmCommon && CsmCommon.error) {
                CsmCommon.error("Delete failed.");
            } else if (window.Swal) {
                Swal.fire({ icon: "error", title: "Error", text: "Delete failed." });
            } else {
                alert("Delete failed.");
            }
        }
    }

    function renderTable() {
        var list = store.listActive();

        var $tbody = $("#tblCountry tbody");
        $tbody.empty();

        (list || []).forEach(function (x) {
            var $tr = $("<tr/>").attr("data-id", x.id);

            $tr.append($("<td/>").text(x.code || ""));
            $tr.append($("<td/>").text(x.countryName || ""));
            $tr.append($("<td/>").text(x.status || ""));

            var $act = $("<td/>").addClass("text-center");
            $act.append(
                $("<a/>")
                    .attr("href", "#")
                    .addClass("btn-country-delete text-danger")
                    .data("id", x.id)
                    .attr("title", "Delete")
                    .html("<i class='fa fa-trash'></i>")
            );

            $tr.append($act);
            $tbody.append($tr);
        });

        // DataTable re-init safely
        if ($.fn.DataTable && $.fn.DataTable.isDataTable("#tblCountry")) {
            $("#tblCountry").DataTable().destroy();
        }

        if ($.fn.DataTable) {
            dt = $("#tblCountry").DataTable({
                paging: true,
                searching: true,
                ordering: true,
                autoWidth: false,
                pageLength: 10
            });
        }
    }

    function resetForm() {
        $("#CountryId").val("");
        $("#CountryIsUserPreferred").prop("checked", false);

        var nextCode = CsmData.getNextCode(STORE_KEY, "code", "CT", 1001, 0);
        $("#CountryCode").val(nextCode);

        $("#CountryName").val("");
        $("#CountryStatus").val("Active");
    }

    function readForm() {
        return {
            id: $("#CountryId").val() || "",
            code: ($("#CountryCode").val() || "").trim(),
            countryName: ($("#CountryName").val() || "").trim(),
            status: ($("#CountryStatus").val() || "").trim(),
            isUserPreferred: $("#CountryIsUserPreferred").is(":checked"),
            isDeleted: false
        };
    }

    function fillForm(x) {
        $("#CountryId").val(x.id || "");
        $("#CountryCode").val(x.code || "");
        $("#CountryIsUserPreferred").prop("checked", x.isUserPreferred === true);
        $("#CountryName").val(x.countryName || "");
        $("#CountryStatus").val(x.status || "Active");
    }

    function validate(m) {
        var ok = true;

        if (!m.code) { $("#valCountryCode").text("Code is required."); ok = false; }
        if (!m.countryName) { $("#valCountryName").text("Country Name is required."); ok = false; }
        if (!m.status) { $("#valCountryStatus").text("Status is required."); ok = false; }

        return ok;
    }

    function clearValidation() {
        $("#valCountryCode").text("");
        $("#valCountryName").text("");
        $("#valCountryStatus").text("");
    }

    $(init);

})();
