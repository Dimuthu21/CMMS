// ===============================
// businesspartner-create.js (UI-only)
// Version: 1.0.0
// ===============================

(function () {

    var STORE_KEY = (CsmData.Masters && CsmData.Masters.Keys)
        ? CsmData.Masters.Keys.BusinessPartner
        : "CMMS_CORE_BP";

    var CODE_PREFIX = "BP";
    var CODE_FIELD = "code";

    var store = CsmData.createStore(STORE_KEY);

    // keeps last saved object for Reset
    var originalJson = null;

    // keeps loaded object (so we don't wipe contactPersons/payment later)
    var loadedObj = null;

    // in-memory lists for new record scenario
    var contactPersons = [];
    var banks = [];

    function getQueryParam(name) {
        var url = window.location.search || "";
        var params = new URLSearchParams(url);
        return params.get(name);
    }

    function clearValidation() {
        $("#valBpCode").text("");
        $("#valBpName").text("");
        $("#valBpTrustee").text("");
        $("#valBpSector").text("");
        $("#valBpStatus").text("");
        $("#valBpType").text("");
    }

    function _safeText(x) {
        return (x === undefined || x === null) ? "" : String(x);
    }

    function _trusteeText(x) {
        var name = _safeText(x.trusteeName || x.name);
        var code = _safeText(x.code);
        if (name && code) return name + " (" + code + ")";
        return name || code;
    }

    function _sectorText(x) {
        var name = _safeText(x.sectorName || x.name);
        var code = _safeText(x.code);
        if (name && code) return name + " (" + code + ")";
        return name || code;
    }

    function _industryText(x) {
        var name = _safeText(x.industryName || x.name);
        var code = _safeText(x.code);
        if (name && code) return name + " (" + code + ")";
        return name || code;
    }

    function _toOptions(list, textFn) {
        return (list || [])
            .filter(function (x) { return x && x.isDeleted !== true; })
            .map(function (x) {
                return { value: x.id, text: textFn(x) };
            });
    }

    function bindLookups() {
        // Currency
        CsmCommon.bindDropdown($("#BpCurrency"), CsmData.Lookups.Currency, "LKR", true);

        // Status default Active
        CsmCommon.bindDropdown($("#BpStatus"), CsmData.Lookups.Status, "Active", true);

        // Tabs lookups
        CsmCommon.bindDropdown($("#CpDesignation"), CsmData.Lookups.Designation, "", true);
        CsmCommon.bindDropdown($("#PayCardType"), CsmData.Lookups.CreditCardType, "", true);

        // Masters
        var trustees = (CsmData.Masters ? CsmData.Masters.getTrustees() : []);
        var sectors = (CsmData.Masters ? CsmData.Masters.getSectors() : []);
        var industries = (CsmData.Masters ? CsmData.Masters.getIndustries() : []);

        var trusteeOpts = _toOptions(trustees, _trusteeText);
        var sectorOpts = _toOptions(sectors, _sectorText);
        var industryOpts = _toOptions(industries, _industryText);

        CsmCommon.bindDropdown($("#BpTrustee"), trusteeOpts, "", true);
        CsmCommon.bindDropdown($("#BpSector"), sectorOpts, "", true);
        CsmCommon.bindDropdown($("#BpIndustry"), industryOpts, "", true);

        // Head Office dropdown = Business Partners
        var bps = (CsmData.Masters ? CsmData.Masters.getBusinessPartners() : store.listActive());

        // exclude current record itself (if editing)
        var currentId = ($("#BpId").val() || "").trim();
        var filtered = (bps || []).filter(function (x) { return x && x.id !== currentId; });

        var bpOpts = (filtered || []).map(function (x) {
            return { value: x.id, text: (x.name || "") + (x.code ? (" (" + x.code + ")") : "") };
        });

        CsmCommon.bindDropdown($("#BpHeadOffice"), bpOpts, "", true);
    }

    function setAutoCodeIfNew() {
        var id = ($("#BpId").val() || "").trim();
        if (id) return;

        $("#BpCode").val(CsmData.getNextCode(STORE_KEY, CODE_FIELD, CODE_PREFIX, 1001, 0));
        $("#BpCode").prop("readonly", true);
        $("#BpUserPreferred").prop("checked", false);
    }

    function toggleUserPreferred() {
        var on = $("#BpUserPreferred").is(":checked");
        $("#BpCode").prop("readonly", !on);

        // if turning off and new record => set auto code back
        if (!on) {
            setAutoCodeIfNew();
        }
    }

    function validateHeader() {
        clearValidation();

        var ok = true;

        var code = ($("#BpCode").val() || "").trim();
        var name = ($("#BpName").val() || "").trim();
        var trustee = ($("#BpTrustee").val() || "").trim();
        var sector = ($("#BpSector").val() || "").trim();
        var status = ($("#BpStatus").val() || "").trim();

        var isSupplier = $("#BpIsSupplier").is(":checked");
        var isCustomer = $("#BpIsCustomer").is(":checked");

        if (!code) { $("#valBpCode").text("Code is required"); ok = false; }
        if (!name) { $("#valBpName").text("Name is required"); ok = false; }
        if (!trustee) { $("#valBpTrustee").text("Trustee is required"); ok = false; }
        if (!sector) { $("#valBpSector").text("Sector is required"); ok = false; }
        if (!status) { $("#valBpStatus").text("Status is required"); ok = false; }
        if (!isSupplier && !isCustomer) { $("#valBpType").text("Select Supplier or Customer (or both)"); ok = false; }

        return ok;
    }

    function buildBpObjectForSave() {
        // If editing, start from loaded object so we don't lose other tab data later
        var base = loadedObj ? JSON.parse(JSON.stringify(loadedObj)) : {};

        var id = ($("#BpId").val() || "").trim();

        base.id = id || null;

        base.code = ($("#BpCode").val() || "").trim();
        base.userPreferred = $("#BpUserPreferred").is(":checked");

        base.name = ($("#BpName").val() || "").trim();
        base.currency = ($("#BpCurrency").val() || "").trim();

        base.deliveries = $("#BpDeliveries").val() || "0";
        base.orders = $("#BpOrders").val() || "0";
        base.accountBalance = $("#BpAccountBalance").val() || "0";

        base.industryId = ($("#BpIndustry").val() || "").trim();
        base.trusteeId = ($("#BpTrustee").val() || "").trim();
        base.sectorId = ($("#BpSector").val() || "").trim();

        base.isSupplier = $("#BpIsSupplier").is(":checked");
        base.isCustomer = $("#BpIsCustomer").is(":checked");

        base.status = ($("#BpStatus").val() || "").trim();

        base.remarks = ($("#BpRemarks").val() || "").trim();
        base.parentBusinessPartnerId = ($("#BpHeadOffice").val() || "").trim();

        // ensure these exist (future tabs)
        if (!base.contactPersons) base.contactPersons = [];
        if (!base.addresses) base.addresses = [];
        if (!base.payment) base.payment = { banks: [] };
        if (!base.payment.banks) base.payment.banks = [];

        // If creating new, use in-memory lists
        if (!loadedObj) {
            base.contactPersons = contactPersons.slice();
            base.payment.banks = banks.slice();
        }

        base.isDeleted = false;

        return base;
    }

    function fillForm(obj) {
        $("#BpId").val(obj.id || "");
        $("#BpCode").val(obj.code || "");

        $("#BpUserPreferred").prop("checked", obj.userPreferred === true);
        $("#BpCode").prop("readonly", obj.userPreferred !== true);

        $("#BpName").val(obj.name || "");
        $("#BpCurrency").val(obj.currency || "");

        $("#BpDeliveries").val(obj.deliveries || "0");
        $("#BpOrders").val(obj.orders || "0");
        $("#BpAccountBalance").val(obj.accountBalance || "0");

        $("#BpIndustry").val(obj.industryId || "");
        $("#BpTrustee").val(obj.trusteeId || "");
        $("#BpSector").val(obj.sectorId || "");

        $("#BpIsSupplier").prop("checked", obj.isSupplier === true);
        $("#BpIsCustomer").prop("checked", obj.isCustomer === true);

        $("#BpStatus").val(obj.status || "Active");

        $("#BpRemarks").val(obj.remarks || "");
        $("#BpHeadOffice").val(obj.parentBusinessPartnerId || "");

        clearValidation();

        // show Reset button when a record is loaded for editing
        $("#btnBpReset").show();

        // load contact persons and banks into in-memory lists and render
        contactPersons = (obj.contactPersons && Array.isArray(obj.contactPersons)) ? JSON.parse(JSON.stringify(obj.contactPersons)) : [];
        banks = (obj.payment && Array.isArray(obj.payment.banks)) ? JSON.parse(JSON.stringify(obj.payment.banks)) : [];
        renderContactPersons();
        renderBanks();
    }

    function clearForm() {
        loadedObj = null;
        originalJson = null;

        $("#BpId").val("");
        $("#BpName").val("");
        $("#BpRemarks").val("");

        $("#BpIsSupplier").prop("checked", false);
        $("#BpIsCustomer").prop("checked", false);

        bindLookups();
        setAutoCodeIfNew();
        clearValidation();

        $("#tblBranches tbody").empty();

        // hide Reset button when creating new record
        $("#btnBpReset").hide();

        // clear in-memory lists and tables
        contactPersons = [];
        banks = [];
        renderContactPersons();
        renderBanks();
    }

    function resetForm() {
        if (!originalJson) {
            clearForm();
            return;
        }

        var obj = JSON.parse(originalJson);
        loadedObj = JSON.parse(originalJson);

        bindLookups();
        fillForm(obj);
    }

    function save() {
        if (!validateHeader()) return;

        var obj = buildBpObjectForSave();

        // If new and not user preferred -> ensure auto code
        if (!obj.id && obj.userPreferred !== true) {
            obj.code = CsmData.getNextCode(STORE_KEY, CODE_FIELD, CODE_PREFIX, 1001, 0);
            $("#BpCode").val(obj.code);
        }

        var isEdit = !!obj.id;
        store.save(obj);

        // reload saved version (to get generated id)
        var saved = store.getById(obj.id) || obj;

        // persist loadedObj/originalJson only for internal use, but we will clear form after save
        loadedObj = JSON.parse(JSON.stringify(saved));
        originalJson = JSON.stringify(saved);

        // show feedback
        CsmCommon.success(isEdit ? "Updated successfully" : "Saved successfully");

        // ensure Reset button visible after save (now editing)
        $("#btnBpReset").show();

        // After saving (create or update) show a fresh create form.
        // Delay a bit so user can see the success toast/modal.
        setTimeout(function () {
            clearForm();
            // ensure lookup data refreshed
            bindLookups();
            setAutoCodeIfNew();
        }, 700);
    }

    function renderBranchesForHeadOffice(parentId) {
        // UI-only placeholder: show empty if no parent selected
        var $tbody = $("#tblBranches tbody").empty();
        if (!parentId) return;

        var parent = store.getById(parentId);
        if (!parent || parent.isDeleted === true) return;

        // simple branch row from parent general info (you can expand later)
        var tr = $("<tr/>")
            .append($("<td/>").text(parent.name || ""))
            .append($("<td/>").text(parent.telNo1 || ""))     // future field
            .append($("<td/>").text(parent.email || ""));     // future field

        $tbody.append(tr);
    }

    /* Contact Persons handling */
    function renderContactPersons() {
        var $tbody = $("#tblContactPersons tbody").empty();
        (contactPersons || []).forEach(function (cp) {
            var tr = $("<tr/>")
                .attr('data-id', cp.id || '')
                .append($("<td/>").text(cp.firstName || ''))
                .append($("<td/>").text(cp.lastName || ''))
                .append($("<td/>").text(cp.nicNumber || ''))
                .append($("<td/>").text(cp.mobileNumber || ''))
                .append($("<td/>").text(cp.email || ''))
                .append($("<td/>").text(cp.designation || ''))
                .append($("<td/>").text(cp.address01Line01 || ''))
                .append($("<td/>").text(cp.address02Line01 || ''))
                .append($("<td class=\'text-center\'/>").append($("<a href='#' class='btn-delete text-danger' title='Delete'><i class='fa fa-trash'></i></a>")));
            $tbody.append(tr);
        });
    }

    function addContactPerson() {
        var cp = {
            id: 'CP-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            firstName: ($("#CpFirstName").val() || '').trim(),
            lastName: ($("#CpLastName").val() || '').trim(),
            nicNumber: ($("#CpNicNumber").val() || '').trim(),
            mobileNumber: ($("#CpMobileNumber").val() || '').trim(),
            email: ($("#CpEmail").val() || '').trim(),
            designation: ($("#CpDesignation").val() || '').trim(),
            address01Line01: ($("#CpAddress01Line01").val() || '').trim(),
            address02Line01: ($("#CpAddress02Line01").val() || '').trim(),
            address01Line02: ($("#CpAddress01Line02").val() || '').trim(),
            address02Line02: ($("#CpAddress02Line02").val() || '').trim(),
            city01: ($("#CpCity01").val() || '').trim(),
            city02: ($("#CpCity02").val() || '').trim(),
            postalCode01: ($("#CpPostalCode01").val() || '').trim(),
            postalCode02: ($("#CpPostalCode02").val() || '').trim(),
            state01: ($("#CpState01").val() || '').trim(),
            state02: ($("#CpState02").val() || '').trim(),
            country01: ($("#CpCountry01").val() || '').trim(),
            country02: ($("#CpCountry02").val() || '').trim(),
            isDefault: $("#CpIsDefaultPerson").is(":checked") === true
        };

        contactPersons.push(cp);
        renderContactPersons();

        // clear inputs
        $("#CpFirstName,#CpLastName,#CpNicNumber,#CpMobileNumber,#CpEmail,#CpDesignation,#CpAddress01Line01,#CpAddress02Line01,#CpAddress01Line02,#CpAddress02Line02,#CpCity01,#CpCity02,#CpPostalCode01,#CpPostalCode02,#CpState01,#CpState02,#CpCountry01,#CpCountry02").val('');
        $("#CpIsDefaultPerson").prop('checked', false);
    }

    /* Banks handling */
    function renderBanks() {
        var $tbody = $("#tblBanks tbody").empty();
        (banks || []).forEach(function (b) {
            var tr = $("<tr/>")
                .attr('data-id', b.id || '')
                .append($("<td/>").text(b.bankCountry || ''))
                .append($("<td/>").text(b.swift || ''))
                .append($("<td/>").text(b.iban || ''))
                .append($("<td/>").text(b.bankName || ''))
                .append($("<td/>").text(b.accountName || ''))
                .append($("<td/>").text(b.branch || ''))
                .append($("<td/>").text(b.bankCode || ''))
                .append($("<td/>").text(b.accountNo || ''))
                .append($("<td class=\'text-center\'/>").append($("<a href='#' class='btn-delete text-danger' title='Delete'><i class='fa fa-trash'></i></a>")));
            $tbody.append(tr);
        });
    }

    function addBank() {
        var b = {
            id: 'BK-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            bankCountry: ($("#BankCountry").val() || '').trim(),
            swift: ($("#BankSwift").val() || '').trim(),
            iban: ($("#BankIban").val() || '').trim(),
            bankName: ($("#BankName").val() || '').trim(),
            accountName: ($("#BankAccountName").val() || '').trim(),
            branch: ($("#BankBranch").val() || '').trim(),
            bankCode: ($("#BankCode").val() || '').trim(),
            accountNo: ($("#BankAccountNo").val() || '').trim()
        };

        banks.push(b);
        renderBanks();

        // clear inputs
        $("#BankCountry,#BankSwift,#BankIban,#BankName,#BankAccountName,#BankBranch,#BankCode,#BankAccountNo").val('');
    }

    function deleteContactPerson(id) {
        contactPersons = (contactPersons || []).filter(function (x) { return x && x.id !== id; });
        renderContactPersons();
    }

    function deleteBank(id) {
        banks = (banks || []).filter(function (x) { return x && x.id !== id; });
        renderBanks();
    }

    function loadForEditIfAny() {
        var id = getQueryParam("id");
        if (!id) {
            clearForm();
            return;
        }

        var obj = store.getById(id);
        if (!obj || obj.isDeleted === true) {
            clearForm();
            return;
        }

        loadedObj = JSON.parse(JSON.stringify(obj));
        originalJson = JSON.stringify(obj);

        bindLookups();
        fillForm(obj);

        renderBranchesForHeadOffice(obj.parentBusinessPartnerId);

        // show Reset button when page is loaded for edit
        $("#btnBpReset").show();
    }

    function wireEvents() {
        $("#BpUserPreferred").on("change", toggleUserPreferred);

        $("#btnBpClear").on("click", clearForm);
        $("#btnBpReset").on("click", resetForm);
        $("#btnBpSave").on("click", save);

        $("#btnAddContactPerson").off('click').on("click", function () { addContactPerson(); });
        $("#btnAddBank").off('click').on("click", function () { addBank(); });

        // delegated delete handlers for contact persons and banks
        $("#tblContactPersons").off('click', '.btn-delete').on('click', '.btn-delete', function (e) {
            e.preventDefault();
            var id = $(this).closest('tr').attr('data-id');
            if (id) deleteContactPerson(id);
        });

        $("#tblBanks").off('click', '.btn-delete').on('click', '.btn-delete', function (e) {
            e.preventDefault();
            var id = $(this).closest('tr').attr('data-id');
            if (id) deleteBank(id);
        });

        $("#btnAddContactPerson").on("click", function () {
            // noop handled above
        });

        $("#BpHeadOffice").on("change", function () {
            renderBranchesForHeadOffice($(this).val());
        });
    }

    $(function () {
        bindLookups();
        wireEvents();
        loadForEditIfAny();
        setAutoCodeIfNew();

        // Hide Reset by default; it will be shown when editing an existing record
        $("#btnBpReset").hide();
    });

})();
