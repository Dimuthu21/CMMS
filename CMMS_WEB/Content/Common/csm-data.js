// ===============================
// csm-data.js (UI-only hardcoded data + reusable stores)
// Version: 1.0.0
// ===============================

var CsmData = (function () {

    // ---------- Shared Lookups (DO NOT duplicate in pages) ----------
    var Lookups = {
        Status: [
            { value: "Active", text: "Active" },
            { value: "Inactive", text: "Inactive" }
        ],
        YesNo: [
            { value: true, text: "Yes" },
            { value: false, text: "No" }
        ],
        SectorType: [
            { value: "Private", text: "Private" },
            { value: "Government", text: "Government" }
        ],

        Currency: [
            { value: "HKD", text: "HKD" },
            { value: "LKR", text: "LKR" },
            { value: "S$", text: "S$" },
            { value: "USD", text: "USD" },
            { value: "Yen", text: "Yen" }
        ],

        BusinessPartnerType: [
            { value: "Supplier", text: "Supplier" },
            { value: "Customer", text: "Customer" }
        ],

        Designation: [
            { value: "CEO", text: "CEO" },
            { value: "Assistant Manager", text: "Assistant Manager" },
            { value: "HR Manager", text: "HR Manager" },
            { value: "IT Manager", text: "IT Manager" },
            { value: "Manager - Maintenance", text: "Manager - Maintenance" }
        ],

        CreditCardType: [
            { value: "Master", text: "Master" },
            { value: "Visa", text: "Visa" }
        ]
    };

    // ---------- LocalStorage helpers ----------
    function _get(key, defaultValue) {
        var raw = localStorage.getItem(key);
        if (!raw) return defaultValue;
        try { return JSON.parse(raw); } catch (e) { return defaultValue; }
    }

    function _set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function _remove(key) {
        localStorage.removeItem(key);
    }

    // ---------- Store Factory ----------
    function createStore(storeKey) {

        function listAll() {
            return _get(storeKey, []);
        }

        function listActive() {
            var list = listAll();
            return list.filter(function (x) { return x && x.isDeleted !== true; });
        }

        function getById(id) {
            var list = listAll();
            return list.find(function (x) { return x && x.id === id; }) || null;
        }

        function save(item) {
            var list = listAll();

            // new
            if (!item.id) {
                item.id = _newId();
                list.push(item);
            } else {
                // update
                var idx = list.findIndex(function (x) { return x && x.id === item.id; });
                if (idx >= 0) list[idx] = item;
                else list.push(item);
            }

            _set(storeKey, list);
            return item;
        }

        function softDelete(id) {
            var list = listAll();
            var idx = list.findIndex(function (x) { return x && x.id === id; });
            if (idx >= 0) {
                list[idx].isDeleted = true;
                _set(storeKey, list);
                return true;
            }
            return false;
        }

        function clear() {
            _remove(storeKey);
        }

        function _newId() {
            // simple unique id for UI stage
            return "ID-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        }

        return {
            listAll: listAll,
            listActive: listActive,
            getById: getById,
            save: save,
            softDelete: softDelete,
            clear: clear
        };
    }

    // ---------- Code Generator ----------
    // Example: prefix "TE" => TE1001, TE1002...
    function getNextCode(storeKey, codeFieldName, prefix, startNumber, pad) {
        startNumber = startNumber || 1001;
        pad = pad || 0;

        var list = _get(storeKey, []);
        var maxNum = 0;

        list.forEach(function (x) {
            if (!x || x.isDeleted === true) return;

            var code = (x[codeFieldName] || "").toString().trim();
            if (code.indexOf(prefix) !== 0) return;

            var numPart = code.substring(prefix.length);
            var n = parseInt(numPart, 10);
            if (!isNaN(n) && n > maxNum) maxNum = n;
        });

        var next = (maxNum > 0) ? (maxNum + 1) : startNumber;

        if (pad > 0) {
            var s = next.toString();
            while (s.length < pad) s = "0" + s;
            return prefix + s;
        }

        return prefix + next;
    }

    // ---------- Active Tile ----------
    var Tile = {
        getActive: function () {
            return localStorage.getItem("csm_activeTile") || "Core";
        },
        setActive: function (tileName) {
            localStorage.setItem("csm_activeTile", tileName);
        }
    };

    // ---------- Master Readers (NEW - safe add, no breaking) ----------
    // These functions allow Business Partner to read previously saved masters.

    // IMPORTANT: keys must match your module JS store keys
    var MasterStoreKeys = {
        Trustee: "CMMS_CORE_TRUSTEE",
        Sector: "CMMS_CORE_SECTOR",
        Industry: "CMMS_CORE_INDUSTRY",
        BusinessPartner: "CMMS_CORE_BP"
    };

    function toOptions(list, valueField, textField) {
        valueField = valueField || "id";
        textField = textField || "name";

        return (list || []).map(function (x) {
            return {
                value: (x && x[valueField] !== undefined) ? x[valueField] : "",
                text: (x && x[textField] !== undefined) ? x[textField] : ""
            };
        });
    }

    var Masters = {
        Keys: MasterStoreKeys,

        getTrustees: function () {
            return createStore(MasterStoreKeys.Trustee).listActive();
        },
        getSectors: function () {
            return createStore(MasterStoreKeys.Sector).listActive();
        },
        getIndustries: function () {
            return createStore(MasterStoreKeys.Industry).listActive();
        },
        getBusinessPartners: function () {
            return createStore(MasterStoreKeys.BusinessPartner).listActive();
        },

        toOptions: toOptions
    };

    return {
        Lookups: Lookups,
        createStore: createStore,
        getNextCode: getNextCode,
        Tile: Tile,

        // NEW (safe)
        Masters: Masters
    };

})();
