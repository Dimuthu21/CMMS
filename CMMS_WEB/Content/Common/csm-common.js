// ===============================
// csm-common.js (Shared UI helpers)
// Version: 1.0.0
// ===============================

var CsmCommon = (function () {

    // ---------- SweetAlert wrappers ----------
    function success(message, title) {
        title = title || "Success";
        if (window.Swal) {
            Swal.fire({ icon: "success", title: title, text: message });
        } else {
            alert(title + ": " + message);
        }
    }

    function error(message, title) {
        title = title || "Error";
        if (window.Swal) {
            Swal.fire({ icon: "error", title: title, text: message });
        } else {
            alert(title + ": " + message);
        }
    }

    function confirmDelete(message, onYes) {
        message = message || "Are you sure you want to delete this record?";
        if (window.Swal) {
            Swal.fire({
                icon: "warning",
                title: "Confirm",
                text: message,
                showCancelButton: true,
                confirmButtonText: "Yes, Delete",
                cancelButtonText: "Cancel"
            }).then(function (result) {
                if (result.isConfirmed) onYes();
            });
        } else {
            if (confirm(message)) onYes();
        }
    }

    // ---------- Trim leading spaces ----------
    function initTrimStart() {
        // Any input with class 'trim-start' will remove leading spaces
        $(document).on("input", ".trim-start", function () {
            var v = $(this).val();
            if (typeof v === "string") {
                $(this).val(v.replace(/^\s+/, ""));
            }
        });
    }

    // ---------- Bind dropdown ----------
    function bindDropdown($ddl, items, defaultValue, includeSelect) {
        if (!$ddl || $ddl.length === 0) return;

        $ddl.empty();

        if (includeSelect === true) {
            $ddl.append($("<option/>").val("").text("Select"));
        }

        (items || []).forEach(function (x) {
            $ddl.append($("<option/>").val(x.value).text(x.text));
        });

        if (defaultValue !== undefined && defaultValue !== null) {
            $ddl.val(defaultValue);
        }
    }

    // ---------- DataTable initializer ----------
    function initDataTable(selector, options) {
        if (!$.fn.DataTable) return null;

        var defaultOptions = {
            paging: true,
            pageLength: 10,
            lengthMenu: [10, 20, 30, 50],
            searching: true,
            ordering: false,
            info: true,
            autoWidth: false
        };

        var finalOptions = $.extend(true, {}, defaultOptions, (options || {}));

        // Prevent re-init
        if ($.fn.DataTable.isDataTable(selector)) {
            $(selector).DataTable().destroy();
        }

        return $(selector).DataTable(finalOptions);
    }

    // ---------- Clear validation messages ----------
    function clearValidation(containerSelector) {
        var $c = containerSelector ? $(containerSelector) : $(document);
        $c.find(".field-validation-error").text("");
        $c.find(".input-validation-error").removeClass("input-validation-error");
    }

    // ---------- Tile-based nav filter ----------
    // In _NavigationMenu.cshtml: wrap each tile menu with .csm-tile-nav data-tile="Core|HR|..."
    function applyTileNavFilter() {
        var active = (window.CsmData && CsmData.Tile) ? CsmData.Tile.getActive() : "Core";

        $(".csm-tile-nav").each(function () {
            var tile = ($(this).data("tile") || "").toString();
            if (!tile) return;

            if (tile.toLowerCase() === active.toLowerCase()) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // ---------- Common init ----------
    function init() {
        if (window.jQuery) {
            initTrimStart();
            applyTileNavFilter();
        }
    }

    return {
        init: init,
        success: success,
        error: error,
        confirmDelete: confirmDelete,
        bindDropdown: bindDropdown,
        initDataTable: initDataTable,
        clearValidation: clearValidation,
        applyTileNavFilter: applyTileNavFilter
    };

})();
