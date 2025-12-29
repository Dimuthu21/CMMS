// ===============================
// csm-init.js
// Version: 1.0.0
// ===============================

$(function () {

    // Init common behaviors
    if (window.CsmCommon) {
        CsmCommon.init();               // trim-start + tile nav filter
        CsmCommon.applyTileNavFilter(); // ensure nav is filtered
    }

    // Dashboard tile click: save active tile
    $(document).on("click", ".cmms-tile-link", function () {
        var tile = ($(this).data("tile") || "").toString().trim();
        if (tile && window.CsmData && CsmData.Tile) {
            CsmData.Tile.setActive(tile);
        }
    });

});
