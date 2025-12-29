const navigationMenuName = "QualityPlan";

const qualityPlanId = $("#QualityPlanId").val();
const entryIdentifier = $("#EntryIdentifier").val();
const entryVersion = $("#EntryVersion").val();
const currentCompanyId = $("#CurrentCompanyId").val();
const currentBranchId = $("#CurrentBranchId").val();

let currentItemRow = null;

$(document).ready(function () {
    // load approval templates once
    fetchApprovalTemplates();
    // hydrate items if coming from View
    tryHydrateItemsFromModel();
    tryHydrateQPFromModel();

    // Restore event bindings for item selection modal
    $(document).on('dblclick', '#tblItemDetails input[name="ItemCode"]', function () {
        currentItemRow = $(this).closest('tr');
        openItemModal();
    });
    $(document).on('click', '#tblItemDetails button[name="btnSearchItem"]', function () {
        currentItemRow = $(this).closest('tr');
        openItemModal();
    });

    // modal filter/clear
    $('#btnMdlFilterItems').on('click', function () { loadItemsToModal(); });
    $('#btnMdlClearItems').on('click', function () { $('#mdlItemCode').val(''); $('#mdlItemName').val(''); loadItemsToModal(); });

    // add/remove main item rows
    $(document).on('click', '#tblItemDetails button[name="btnAddRow"]', function () {
        const tr = $(this).closest('tr');
        const clone = tr.clone();
        clone.find('input').val('');
        clone.find('select[name="InspectionMode"]').val('2');
        clone.find('[name="ItemId"]').text('');
        tr.after(clone);
    });
    $(document).on('click', '#tblItemDetails button[name="btnClearRow"]', function () {
        const tr = $(this).closest('tr');
        tr.find('input').val('');
        tr.find('select[name="InspectionMode"]').val('2');
        tr.find('[name="ItemId"]').text('');
        evaluateQualityParamTabState();
    });

    // QP add stage rows
    $(document).on('click', '.quality-parameter-section .add-row-btn', function () {
        const tbody = $(this).closest('table').find('tbody');
        const row = $(this).closest('tr');
        const clone = row.clone();
        clone.find('input').val('');
        // update stage options for clone
        updateStageOptionsForTable(clone.closest('table'));
        tbody.append(clone);
        // re-apply value type adaptation (fire change to reuse existing logic in qualityPlanValueType.js)
        const section = $(this).closest('.quality-parameter-section');
        section.find('select[name="QualityParameter"]').trigger('change');
    });
    // QP add new section
    $(document).on('click', '.btn-add-section', function () {
        const section = $(this).closest('.quality-parameter-section');
        const clone = section.clone();
        // reset fields
        clone.find('select[name="QPItem"]').empty().append('<option value="">Select Item</option>');
        clone.find('select[name="QualityParameter"]').empty().append('<option value="">Select Quality Parameter</option>');
        clone.find('input[name="MinValue"],input[name="MaxValue"],input[name="DesiredValue"]').val('');
        // remove any dropdown desired value remnants
        clone.find('select[name="DesiredValueDropdown"]').remove();
        // reset stage table rows to one
        const tbl = clone.find('table[name="tblStageValues"]');
        tbl.find('tbody').html('');
        const originalRow = section.find('table[name="tblStageValues"] tbody tr').first().clone();
        originalRow.find('input').val('');
        // remove stage desired dropdown if exists in cloned row
        originalRow.find('select[name="StageDesiredDropdown"]').remove();
        originalRow.find('input[name="StageDesired"]').show();
        tbl.find('tbody').append(originalRow);
        // reset stage select to Stage 1
        tbl.find('select.stage-select').html('<option value="1">Stage 1</option>');
        $('#quality-parameter-sections').append(clone);
        // repopulate items and parameters for new section
        populateQPSectionDropDowns(clone);
        // trigger adaptation (value type script will hide/show elements based on selected parameter)
        clone.find('select[name="QualityParameter"]').trigger('change');
    });

    // remove stage row
    $(document).on('click', '.quality-parameter-section .remove-stage-btn', function () {
        const row = $(this).closest('tr');
        row.remove();
        updateStageOptionsForTable($(this).closest('table'));
    });

    // first load
    evaluateQualityParamTabState();
});

function fetchApprovalTemplates(){
    var url = $('#GetApprovalTemplatesUrl').val();
    if(!url) return;
    $.post(url, {}, function(list){
        $('#quality-parameter-sections select[name="ApprovalTemplate"]').each(function(){ fillTemplateOptions($(this), list); });
    });
}
function fillTemplateOptions(sel, list){
    sel.html('<option value="">Select Template</option>');
    (list||[]).forEach(function(o){ sel.append('<option value="'+o.Id+'">'+o.Text+'</option>'); });
}

// when adding new section ensure template dropdown filled
$(document).on('click', '.btn-add-section', function(){
    setTimeout(function(){
        var listCache = $('#quality-parameter-sections select[name="ApprovalTemplate"]').first().html();
        $('#quality-parameter-sections select[name="ApprovalTemplate"]').last().html(listCache);
    },20);
});

// on template change -> load stages
$(document).on('change','select[name="ApprovalTemplate"]', function(){
    var templateId = parseInt($(this).val()||'0');
    var section = $(this).closest('.quality-parameter-section');
    if(!templateId){ clearStageRows(section); return; }
    var url = $('#GetApprovalTemplateStagesUrl').val();
    $.post(url,{ approvalTemplateId: templateId }, function(stages){
        populateStagesFromTemplate(section, stages||[]);
    });
});

function clearStageRows(section){
    var tbl = section.find('table[name="tblStageValues"] tbody');
    tbl.html('');
    tbl.append(buildStageRow(1));
    updateStageOptionsForTable(section.find('table[name="tblStageValues"]'));
    section.trigger('qpStagesPopulated');
    // ensure value type adaptation runs for this section
    section.find('select[name="QualityParameter"]').trigger('change');
}

function populateStagesFromTemplate(section, stages){
    var qpId = parseInt(section.find('select[name="QualityParameter"]').val()||'0');

    // Helper to build a stage row, optionally with a desired dropdown
    function buildStageRowWithDesired(stageNo, desiredVal, dropdownValues, parameterTypeId){
        var $row = $('<tr>');
        $row.append('<td><select class="form-control stage-select" style="width:150px" name="Stage"></select></td>');
        var minType = (parameterTypeId === 1) ? 'number' : 'text';
        $row.append('<td><input class="form-control input input-sm" type="'+minType+'" placeholder="Min Value" name="StageMin" style="width:125px;"></td>');
        $row.append('<td><input class="form-control input input-sm" type="'+minType+'" placeholder="Max Value" name="StageMax" style="width:125px;"></td>');
        var $desiredTd = $('<td></td>');
        if (dropdownValues && dropdownValues.length){
            var $ddl = $('<select class="form-control" name="StageDesiredDropdown" style="width:125px"></select>');
            $ddl.append('<option value="">Select Value</option>');
            dropdownValues.forEach(function(v){ $ddl.append('<option value="'+v.Id+'">'+v.Text+'</option>'); });
            if(desiredVal) $ddl.val(desiredVal);
            $desiredTd.append($ddl);
        } else {
            var desiredType = (parameterTypeId === 1) ? 'number' : 'text';
            var $inp = $('<input class="form-control input input-sm" type="'+desiredType+'" placeholder="Desired Value" name="StageDesired" style="width:125px;">');
            if(desiredVal) $inp.val(desiredVal);
            $desiredTd.append($inp);
        }
        $row.append($desiredTd);
        $row.append('<td class="d-flex gap-1"><button class="btn btn-default add-row-btn" type="button" title="Add"><i class="demo-pli-add" style="color:#28a745;font-size:1.3rem;"></i></button><button class="btn btn-default remove-row-btn" type="button" title="Remove"><i class="demo-pli-cross" style="color:#dc3545;font-size:1.3rem;"></i></button></td>');
        // set stage select option
        $row.find('select.stage-select').append('<option value="'+stageNo+'">Stage '+stageNo+'</option>');
        return $row;
    }

    var tbody = section.find('table[name="tblStageValues"] tbody');
    tbody.html('');

    function appendRowsUsingDropdowns(dropdownValues, parameterTypeId){
        if(!Array.isArray(stages) || stages.length===0){
            tbody.append(buildStageRowWithDesired(1, '', dropdownValues, parameterTypeId));
        } else {
            for(var i=0;i<stages.length;i++){
                var st = stages[i];
                var displayName = (st.Text || '').trim();
                if(!displayName) displayName = 'Stage '+(i+1);
                var row = buildStageRowWithDesired(i+1, st.DesiredValue || '', dropdownValues, parameterTypeId);
                // mark stage select with custom name so numbering won't overwrite
                row.find('select.stage-select').html('<option data-custom-name="1" value="'+ (st.Id || (i+1)) +'">'+ displayName +'</option>');

                // populate min/max values if present
                row.find('input[name="StageMin"]').val(st.MinValue || '');
                row.find('input[name="StageMax"]').val(st.MaxValue || '');

                tbody.append(row);
            }
        }
        updateStageOptionsForTable(section.find('table[name="tblStageValues"]'));
        section.trigger('qpStagesPopulated');
        // Ensure value type adaptation runs for this section (update stage input types / dropdowns)
        section.find('select[name="QualityParameter"]').trigger('change');
    }

    if(!qpId){
        // No quality parameter selected, just append default rows
        appendRowsUsingDropdowns(null, null);
        return;
    }

    // fetch parameter support to know whether to render desired as dropdown
    var url = $('#GetQualityParameterValueSupportUrl').val();
    var token = $('input[name="__RequestVerificationToken"]').val();
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: { qualityParameterId: qpId },
        headers: { 'RequestVerificationToken': token },
        success: function(res){
            var dropdowns = (res && res.DropdownValues) ? res.DropdownValues : [];
            var paramTypeId = (res && res.ParameterValueTypeId) ? parseInt(res.ParameterValueTypeId, 10) : null;
            // if parameter type not dropdown, dropdowns will be empty and rows will include text/number inputs based on paramTypeId
            appendRowsUsingDropdowns(dropdowns, paramTypeId);
        },
        error: function(){
            // fallback: append without dropdowns
            appendRowsUsingDropdowns(null, null);
        }
    });
}

// remove row handler (avoid duplicates by delegating once)
$(document).off('click.qpStageRemove','.quality-parameter-section .remove-row-btn').on('click.qpStageRemove','.quality-parameter-section .remove-row-btn', function(){
    const tbl = $(this).closest('table');
    const tbody = tbl.find('tbody');
    if(tbody.find('tr').length>1){ $(this).closest('tr').remove(); updateStageOptionsForTable(tbl); }
});

// QP parameters tab hydration
function tryHydrateQPFromModel() {
    const params = window.__QUALITY_PLAN_VIEW_PARAMETERS__ || [];
    const stages = window.__QUALITY_PLAN_VIEW_STAGES__ || [];
    if (!params.length && !stages.length) return;

    // Ensure items are reflected in the QP item dropdowns
    populateAllQPSectionDropDowns();

    const container = $('#quality-parameter-sections');
    const firstSection = container.find('.quality-parameter-section').first();

    function setSection(section, p) {
        section.find('select[name="QPItem"]').val(p.ItemId);
        section.find('select[name="QualityParameter"]').val(p.QualityParameterId);
        section.find('input[name="MinValue"]').val(p.MinValue || '');
        section.find('input[name="MaxValue"]').val(p.MaxValue || '');
        section.find('input[name="DesiredValue"]').val(p.DesiredValue || '');

        const tbl = section.find('table[name="tblStageValues"]');
        const tbody = tbl.find('tbody');
        tbody.html('');
        const rows = stages.filter(s => s.ItemId === p.ItemId && s.QualityParameterId === p.QualityParameterId)
                           .sort((a,b)=> a.StageNo - b.StageNo);
        if (rows.length === 0) {
            const baseRow = $('<tr>\n<td><select class="form-control stage-select" style="width:150px" name="Stage"><option value="1">Stage 1</option></select></td>\n<td><input class="form-control input input-sm" type="text" placeholder="Min Value" name="StageMin" style="width:125px;"></td>\n<td><input class="form-control input input-sm" type="text" placeholder="Max Value" name="StageMax" style="width:125px;"></td>\n<td><input class="form-control input input-sm" type="text" placeholder="Desired Value" name="StageDesired" style="width:125px;"></td>\n<td><button class="btn btn-default add-row-btn" type="button"><i class="demo-pli-add" style="color: #28a745; font-size: 1.5rem;"></i></button></td>\n</tr>');
            tbody.append(baseRow);
        } else {
            rows.forEach(function (r) {
                const row = $('<tr');
                row.append(`<td><select class='form-control stage-select' style='width:150px' name='Stage'></select></td>`);
                row.append(`<td><input class='form-control input input-sm' type='text' placeholder='Min Value' name='StageMin' style='width:125px;' value='${r.MinValue || ''}'></td>`);
                row.append(`<td><input class='form-control input input-sm' type='text' placeholder='Max Value' name='StageMax' style='width:125px;' value='${r.MaxValue || ''}'></td>`);
                row.append(`<td><input class='form-control input input-sm' type='text' placeholder='Desired Value' name='StageDesired' style='width:125px;' value='${r.DesiredValue || ''}'></td>`);
                row.append(`<td><button class='btn btn-default add-row-btn' type='button'><i class='demo-pli-add' style='color: #28a745; font-size: 1.5rem;'></i></button></td>`);
                tbody.append(row);
            });
        }
        updateStageOptionsForTable(tbl);
    }

    if (params.length) {
        // first param in first section
        setSection(firstSection, params[0]);
        // remaining -> clone sections
        for (let i = 1; i < params.length; i++) {
            const section = firstSection.clone();
            // clear selects before setting values to ensure options get set later
            container.append(section);
            populateQPSectionDropDowns(section);
            setSection(section, params[i]);
        }
    }
}

// export collection when saving
function collectQPParameters(){
    var arr=[]; 
    $('#quality-parameter-sections .quality-parameter-section').each(function(){
        var qpId = parseInt($(this).find('select[name="QualityParameter"]').val()||'0');
        var itemId = parseInt($(this).find('select[name="QPItem"]').val()||'0');
        if(!qpId || !itemId) return; 
        var desiredDropdown = $(this).find('select[name="DesiredValueDropdown"]').val();
        var desiredValue = desiredDropdown || $(this).find('input[name="DesiredValue"]').val();
        arr.push({ ItemId:itemId, QualityParameterId: qpId, MinValue: $(this).find('input[name="MinValue"]').val(), MaxValue: $(this).find('input[name="MaxValue"]').val(), DesiredValue: desiredValue });
    });
    return arr; }

// NEW: collect stage values respecting value type UI (only if table visible)
function collectQPStages(){
    var stages=[];
    $('#quality-parameter-sections .quality-parameter-section').each(function(){
        var section = $(this);
        var itemId = parseInt(section.find('select[name="QPItem"]').val()||'0');
        var qpId = parseInt(section.find('select[name="QualityParameter"]').val()||'0');
        if(!itemId || !qpId) return;
        var stageTableWrapperVisible = section.find('table[name="tblStageValues"]').closest('.table-responsive').is(':visible');
        if(!stageTableWrapperVisible) return; // text/other type hidden
        section.find('table[name="tblStageValues"] tbody tr').each(function(){
            var tr = $(this);
            var stageNo = parseInt(tr.find('select.stage-select').val()||'0');
            if(!stageNo) return;
            var minV = tr.find('input[name="StageMin"]').val();
            var maxV = tr.find('input[name="StageMax"]').val();
            var desiredV = tr.find('select[name="StageDesiredDropdown"]').val() || tr.find('input[name="StageDesired"]').val();
            stages.push({ ItemId:itemId, QualityParameterId:qpId, StageNo:stageNo, MinValue:minV, MaxValue:maxV, DesiredValue:desiredV });
        });
    });
    return stages;
}

// ensure existing save payload uses updated function
if(typeof ReturnQualityPlan === 'function'){
    var _origReturnQualityPlan = ReturnQualityPlan;
    ReturnQualityPlan = function(){
        var obj = _origReturnQualityPlan();
        obj.ViewItemParameters = collectQPParameters();
        // include stage values
        obj.ViewItemParameterStages = collectQPStages();
        return obj; };
}

// ================= RESTORED / SAFEGUARD FUNCTIONS =================
// Only define if they are not already defined (to avoid double definitions if file merges later)
if (typeof openItemModal === 'undefined') {
    function openItemModal() {
        $('#mdlQualityPlanItems').modal('show');
        loadItemsToModal();
    }
}

if (typeof loadItemsToModal === 'undefined') {
    function loadItemsToModal() {
        const url = $('#BrowseItemsForQualityPlanUrl').val();
        if (!url) return;
        const ajaxData = {
            draw: 1,
            start: 0,
            length: 50,
            Code: $('#mdlItemCode').val(),
            Name: $('#mdlItemName').val(),
            CompanyId: currentCompanyId,
            BranchId: currentBranchId
        };
        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(ajaxData),
            headers: { "RequestVerificationToken": $('input[name="__RequestVerificationToken"]').val() },
            success: function (result) {
                const tbody = $('#tblMdlItems tbody');
                tbody.html('');
                (result.data || []).forEach(function (row) {
                    const tr = $('<tr>');
                    tr.append(`<td>${row.Code}</td>`);
                    tr.append(`<td>${row.Name}</td>`);
                    tr.append(`<td>${row.UOMName || ''}</td>`);
                    tr.append(`<td>${row.StockHandlingMethodName || ''}</td>`);
                    tr.append(`<td><button type='button' class='btn btn-primary btn-sm' onclick='selectItemFromModal(${row.ItemId}, ${JSON.stringify(row.Code)}, ${JSON.stringify(row.Name)}, ${JSON.stringify(row.UOMName || '')}, ${JSON.stringify(row.StockHandlingMethodName || '')})'>Select</button></td>`);
                    tr.append(`<td hidden>${row.ItemId}</td>`);
                    tbody.append(tr);
                });
            },
            error: function () { /* swallow */ }
        });
    }
}

if (typeof selectItemFromModal === 'undefined') {
    function selectItemFromModal(itemId, code, name, uomName, stockHandlingName) {
        if (!currentItemRow) return;
        currentItemRow.find('input[name="ItemCode"]').val(code);
        currentItemRow.find('input[name="ItemName"]').val(name);
        currentItemRow.find('input[name="UOM"]').val(uomName);
        currentItemRow.find('input[name="StockHandlingMethod"]').val(stockHandlingName);
        // last hidden cell holds ItemId
        currentItemRow.find('td[hidden]').last().text(itemId);
        $('#mdlQualityPlanItems').modal('hide');
        evaluateQualityParamTabState();
        // NEW: refresh SampleItem select options after item selection
        if (window.refreshSampleItemOptions) { window.refreshSampleItemOptions(); }
        // Fire a custom event for any other listeners
        $(document).trigger('qpItemsChanged');
    }
}

if (typeof evaluateQualityParamTabState === 'undefined') {
    function evaluateQualityParamTabState() {
        let hasItem = false;
        $('#tblItemDetails tbody tr').each(function () {
            const idCell = $(this).find('td[hidden]').last();
            if (idCell && idCell.text().trim() !== '') hasItem = true;
        });
        const qpTabBtn = $('button[data-bs-target="#tabQualityParameters"]');
        if (hasItem) {
            qpTabBtn.removeClass('disabled');
            populateAllQPSectionDropDowns();
        } else {
            qpTabBtn.addClass('disabled');
        }
    }
}

if (typeof getSelectedItemOptions === 'undefined') {
    function getSelectedItemOptions() {
        const options = [];
        $('#tblItemDetails tbody tr').each(function () {
            const itemId = $(this).find('td[hidden]').last().text().trim();
            const code = $(this).find('input[name="ItemCode"]').val();
            if (itemId) options.push({ id: itemId, text: code });
        });
        return options;
    }
}

if (typeof populateAllQPSectionDropDowns === 'undefined') {
    function populateAllQPSectionDropDowns() {
        $('#quality-parameter-sections .quality-parameter-section').each(function () {
            populateQPSectionDropDowns($(this));
        });
    }
}

if (typeof populateQPSectionDropDowns === 'undefined') {
    function populateQPSectionDropDowns(section) {
        const items = getSelectedItemOptions();
        const ddlItem = section.find('select[name="QPItem"]');
        ddlItem.html('<option value="">Select Item</option>');
        items.forEach(function (it) { ddlItem.append(`<option value='${it.id}'>${it.text}</option>`); });

        // bind change once
        if (!section.data('qpitem-change-bound')) {
            section.on('change', 'select[name="QPItem"]', function () {
                const itemId = $(this).val();
                const qpDdl = section.find('select[name="QualityParameter"]');
                qpDdl.html('<option value="Loading...">Loading...</option>');
                if (!itemId) { qpDdl.html('<option value="">Select Quality Parameter</option>'); return; }
                loadQualityParametersForItem(parseInt(itemId, 10), qpDdl);
            });
            section.data('qpitem-change-bound', true);
        }

        // ensure QP ddl default
        section.find('select[name="QualityParameter"]').html('<option value="">Select Quality Parameter</option>');
    }
}

if (typeof loadQualityParametersForItem === 'undefined') {
    function loadQualityParametersForItem(itemId, qpDropdown) {
        const functionId = parseInt($('#FunctionId').val() || '0');
        if (!functionId || !itemId) { qpDropdown.html('<option value="">Select Quality Parameter</option>'); return; }
        const url = $('#GetAssignedQualityParametersUrl').val();
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: { itemId: itemId, functionId: functionId },
            headers: { 'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val() },
            success: function (res) {
                qpDropdown.html('<option value="">Select Quality Parameter</option>');
                if (res && Array.isArray(res)) {
                    res.forEach(function (o) { qpDropdown.append(`<option value='${o.Id}'>${o.Text}</option>`); });
                }
            },
            error: function () { qpDropdown.html('<option value="">Select Quality Parameter</option>'); }
        });
    }
}

// Modify updateStageOptionsForTable to respect custom stage names
if (typeof updateStageOptionsForTable !== 'undefined') {
    const _origUpdateStageOptionsForTable = updateStageOptionsForTable;
    updateStageOptionsForTable = function(tbl){
        // If any stage-select in this table has options tagged with data-custom-name, skip auto numbering
        const hasCustom = tbl.find('select.stage-select option[data-custom-name="1"]').length > 0;
        if(hasCustom) return; // keep provided names (e.g., approval template stages)
        _origUpdateStageOptionsForTable(tbl);
    };
}

// On initial hydration apply UI for any pre-selected QPs
function applyValueTypeForHydratedSections(){
    $('#quality-parameter-sections .quality-parameter-section').each(function(){
        var sec = $(this); var qpId = parseInt(sec.find('select[name="QualityParameter"]').val()||'0');
        if(qpId){ getQualityParameterMeta(qpId, function(meta){ applyQPValueTypeUI(sec, meta); }); }
    });
}
$(function(){ setTimeout(applyValueTypeForHydratedSections,150); });

// --- Enhanced modal opener (always override to ensure availability) ---
function openItemModal() {
    try { console.log('[QualityPlan] openItemModal invoked'); } catch(e){}
    var modalId = 'mdlQualityPlanItems';
    var $modal = $('#'+modalId);
    if ($modal.length === 0) { console.warn('[QualityPlan] Modal element #' + modalId + ' not found'); return; }

    // Bootstrap 4 (jQuery plugin) vs Bootstrap 5 (JS class) fallback
    if ($.fn && $.fn.modal) {
        try { $modal.modal('show'); } catch (e) { console.warn('[QualityPlan] jQuery modal show failed, fallback to bootstrap.Modal', e); fallbackBs5(); }
    } else { fallbackBs5(); }

    function fallbackBs5(){
        try {
            if (window.bootstrap && bootstrap.Modal) {
                var inst = bootstrap.Modal.getOrCreateInstance($modal[0]);
                inst.show();
            } else {
                // last resort just force display
                $modal.show();
            }
        } catch(ex){ console.error('[QualityPlan] Bootstrap fallback failed', ex); }
    }

    // Load items each time modal opens
    if (typeof loadItemsToModal === 'function') loadItemsToModal();
}

// Ensure event handlers (re-bind cleanly)
$(document).off('dblclick.qpItem','\#tblItemDetails input[name="ItemCode"]').on('dblclick.qpItem','\#tblItemDetails input[name="ItemCode"]', function(){
    currentItemRow = $(this).closest('tr');
    openItemModal();
});
$(document).off('click.qpItem','\#tblItemDetails button[name="btnSearchItem"]').on('click.qpItem','\#tblItemDetails button[name="btnSearchItem"]', function(){
    currentItemRow = $(this).closest('tr');
    openItemModal();
});

// Add quick visual cue (cursor) so user knows cell is interactive
(function addItemCodeCursor(){
    var styleId = 'qp-itemcode-style';
    if (!document.getElementById(styleId)) {
        var css = '#tblItemDetails input[name="ItemCode"]{cursor:pointer;}';
        var s = document.createElement('style'); s.id = styleId; s.innerHTML = css; document.head.appendChild(s);
    }
})();

// insert buildStageRow helper if missing...
if (typeof buildStageRow === 'undefined') {
    function buildStageRow(stageNo){
        return $('<tr>'+
            '<td><select class="form-control stage-select" style="width:150px" name="Stage"><option value="'+stageNo+'">Stage '+stageNo+'</option></select></td>'+
            '<td><input class="form-control input input-sm" type="text" placeholder="Min Value" name="StageMin" style="width:125px;"></td>'+
            '<td><input class="form-control input input-sm" type="text" placeholder="Max Value" name="StageMax" style="width:125px;"></td>'+
            '<td><input class="form-control input input-sm" type="text" placeholder="Desired Value" name="StageDesired" style="width:125px;"></td>'+
            '<td class="d-flex gap-1">'+
                '<button class="btn btn-default add-row-btn" type="button" title="Add"><i class="demo-pli-add" style="color:#28a745;font-size:1.3rem;"></i></button>'+
                '<button class="btn btn-default remove-row-btn" type="button" title="Remove"><i class="demo-pli-cross" style="color:#dc3545;font-size:1.3rem;"></i></button>'+
            '</td>'+
        '</tr>');
    }
}

// Sample Details client logic
$(function(){
    // Populate SampleItem select from current items in tblItemDetails
    function refreshSampleItemOptions(){
        var ddl = $('#SampleItemSelect'); ddl.html('<option value="">Select Item</option>');
        $('#tblItemDetails tbody tr').each(function(){
            var id = $(this).find('td[hidden]').last().text().trim();
            var code = $(this).find('input[name="ItemCode"]').val();
            if(id){ ddl.append('<option value="'+id+'">'+code+'</option>'); }
        });
    }
    // expose globally so other functions (e.g., selectItemFromModal) can invoke
    window.refreshSampleItemOptions = refreshSampleItemOptions;

    // initial population
    refreshSampleItemOptions();
    // call on add / clear row
    $(document).on('click', '#tblItemDetails button[name="btnAddRow"], #tblItemDetails button[name="btnClearRow"]', function(){ setTimeout(refreshSampleItemOptions,50); });
    // also refresh when custom qpItemsChanged event fired
    $(document).on('qpItemsChanged', function(){ setTimeout(refreshSampleItemOptions,10); });

    // Toggle tabs visibility based on sample type selection
    $('#SampleTypeSelect').on('change', function(){
        var val = $(this).val();
        // hide tabs first
        $('#tabBasedonSample, #tabBasedonSamplewithQuantity, #tabBasedonSamplewithQuantityRange').removeClass('show active');
        $('.nav .nav-link').removeClass('active');
        if(!val){ return; }
        if(val==='based_on_sample'){
            $('.nav .nav-link[data-bs-target="#tabBasedonSample"]').addClass('active');
            $('#tabBasedonSample').addClass('show active');
        } else if(val==='based_on_sample_per_quantity'){
            $('.nav .nav-link[data-bs-target="#tabBasedonSamplewithQuantity"]').addClass('active');
            $('#tabBasedonSamplewithQuantity').addClass('show active');
        } else if(val==='based_on_sample_quantity_range'){
            $('.nav .nav-link[data-bs-target="#tabBasedonSamplewithQuantityRange"]').addClass('active');
            $('#tabBasedonSamplewithQuantityRange').addClass('show active');
        }
    });

    // Based on Sample add
    $('#btnAddBasedOnSample').on('click', function(){
        var itemId = $('#SampleItemSelect').val();
        var itemText = $('#SampleItemSelect option:selected').text();
        var no = $('#NoofSamples').val();
        if(!itemId || !no) { alert('Select item and enter number of samples'); return; }
        var tr = $('<tr>');
        tr.append('<td>'+itemText+'</td>');
        tr.append('<td>'+no+'</td>');
        tr.append('<td><button type="button" class="btn btn-danger btn-sm btn-remove-sample">Remove</button></td>');
        tr.data('itemId', itemId);
        tr.data('no', no);
        $('#tblBasedOnSample tbody').append(tr);
        $('#NoofSamples').val('');
    });

    // Based on Sample Per Quantity add
    $('#btnAddBasedOnSamplePerQty').on('click', function(){
        var itemId = $('#SampleItemSelect').val();
        var itemText = $('#SampleItemSelect option:selected').text();
        var perQty = $('#_dm-inputPassword').val();
        var no = $('#_dm-inputEmail').val();
        if(!itemId || !perQty || !no) { alert('Select item and enter per quantity and number of samples'); return; }
        var tr = $('<tr>');
        tr.append('<td>'+itemText+'</td>');
        tr.append('<td>'+perQty+'</td>');
        tr.append('<td>'+no+'</td>');
        tr.append('<td><button type="button" class="btn btn-danger btn-sm btn-remove-sample">Remove</button></td>');
        tr.data('itemId', itemId); tr.data('perQty', perQty); tr.data('no', no);
        $('#tblBasedOnSamplePerQty tbody').append(tr);
        $('#_dm-inputPassword').val(''); $('#_dm-inputEmail').val('');
    });

    // Range add
    $('#btnAddRangeRow').on('click', function(){
        var itemId = $('#SampleItemSelect').val();
        var itemText = $('#SampleItemSelect option:selected').text();
        var from = $('#txtRangeFromQuantity').val();
        var to = $('#txtRangeToQuantity').val();
        var no = $('#txtRangeNoOfSamples').val();
        if(!itemId){ alert('Select item'); return; }
        if(!from || !to || !no){ alert('Enter from, to and number of samples'); return; }
        var tr = $('<tr>');
        tr.append('<td>'+from+'</td>');
        tr.append('<td>'+to+'</td>');
        tr.append('<td>'+no+'</td>');
        tr.append('<td><button type="button" class="btn btn-danger btn-sm btn-remove-range">Remove</button></td>');
        tr.data('itemId', itemId); tr.data('from', from); tr.data('to', to); tr.data('no', no);
        $('#tblRangeDetails tbody').append(tr);
        // clear inputs
        $('#txtRangeFromQuantity').val(''); $('#txtRangeToQuantity').val(''); $('#txtRangeNoOfSamples').val('');
    });

    // remove handlers
    $(document).on('click', '.btn-remove-sample', function(){ $(this).closest('tr').remove(); });
    $(document).on('click', '.btn-remove-range', function(){ $(this).closest('tr').remove(); });

    // collect sample data into model payload
    if(typeof ReturnQualityPlan === 'function'){
        var _orig = ReturnQualityPlan;
        ReturnQualityPlan = function(){
            var obj = _orig();
            // Based on Sample
            obj.ItemHasSamples = [];
            $('#tblBasedOnSample tbody tr').each(function(){
                obj.ItemHasSamples.push({ ItemId: $(this).data('itemId'), InspectionModeId: 1, HasSample: true, NoOfSamples: $(this).data('no') });
            });
            // Based on Sample Per Quantity
            obj.ItemHasSamplePerQuantities = [];
            $('#tblBasedOnSamplePerQty tbody tr').each(function(){
                obj.ItemHasSamplePerQuantities.push({ ItemId: $(this).data('itemId'), QualityParameterId: null, PerQuantity: $(this).data('perQty'), SampleQuantity: $(this).data('no') });
            });
            // Range
            obj.ItemHasSampleQuantityRanges = [];
            $('#tblRangeDetails tbody tr').each(function(){
                obj.ItemHasSampleQuantityRanges.push({ ItemId: $(this).data('itemId'), QualityParameterId: null, FromQuantity: $(this).data('from'), ToQuantity: $(this).data('to'), SampleQuantity: $(this).data('no') });
            });
            return obj;
        };
    }
});

// ================== SAVE HANDLER (added) ==================
if (typeof ReturnQualityPlan === 'undefined') {
    function ReturnQualityPlan() {
        var obj = {};
        obj.QualityPlanId = $('#QualityPlanId').val() || null;
        obj.Code = $('#Code').val();
        obj.IsUserPreferredCode = $('#IsUserPreferredCode').is(':checked');
        obj.Name = $('#Name').val();
        obj.Description = $('#Description').val();
        obj.FunctionId = $('#FunctionId').val();
        obj.Remark = $('#Remark').val();
        obj.StatusId = $('#StatusId').val();
        obj.EntryIdentifier = $('#EntryIdentifier').val();
        obj.EntryVersion = $('#EntryVersion').val();
        obj.CurrentCompanyId = $('#CurrentCompanyId').val();
        obj.CurrentBranchId = $('#CurrentBranchId').val();
        // Items grid -> SelectedItemIds & sampling collections (if not already overridden later)
        obj.SelectedItemIds = [];
        $('#tblItemDetails tbody tr').each(function(){
            var id = $(this).find('td[hidden]').last().text().trim();
            if(id) obj.SelectedItemIds.push(parseInt(id,10));
        });
        // Ensure sampling arrays present if earlier augmentation not yet executed
        obj.ItemHasSamples = obj.ItemHasSamples || [];
        obj.ItemHasSamplePerQuantities = obj.ItemHasSamplePerQuantities || [];
        obj.ItemHasSampleQuantityRanges = obj.ItemHasSampleQuantityRanges || [];
        return obj;
    }
}

if (typeof SaveQualityPlan === 'undefined') {
    function SaveQualityPlan() {
        try {
            var url = $('#QualityPlanSaveUrl').val();
            if(!url){ alert('Save URL not found'); return; }
            var payload = ReturnQualityPlan();
            // augment again to guarantee latest sampling sets
            // Based on Sample
            payload.ItemHasSamples = [];
            $('#tblBasedOnSample tbody tr').each(function(){
                payload.ItemHasSamples.push({ ItemId: $(this).data('itemId'), InspectionModeId: 1, HasSample: true, NoOfSamples: $(this).data('no') });
            });
            // Per Quantity
            payload.ItemHasSamplePerQuantities = [];
            $('#tblBasedOnSamplePerQty tbody tr').each(function(){
                payload.ItemHasSamplePerQuantities.push({ ItemId: $(this).data('itemId'), QualityParameterId: null, PerQuantity: $(this).data('perQty'), SampleQuantity: $(this).data('no') });
            });
            // Range
            payload.ItemHasSampleQuantityRanges = [];
            $('#tblRangeDetails tbody tr').each(function(){
                payload.ItemHasSampleQuantityRanges.push({ ItemId: $(this).data('itemId'), QualityParameterId: null, FromQuantity: $(this).data('from'), ToQuantity: $(this).data('to'), SampleQuantity: $(this).data('no') });
            });
            // Parameter sections (if collect functions exist)
            if (typeof collectQPParameters === 'function') payload.ViewItemParameters = collectQPParameters();
            if (typeof collectQPStages === 'function') payload.ViewItemParameterStages = collectQPStages();

            $('#EntrySavingProgress').show(); $('#EntrySaveText').text('Saving...');
            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(payload),
                headers: { 'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val() },
                success: function(res){
                    $('#EntrySavingProgress').hide(); $('#EntrySaveText').text('Save');
                    if(res && res.ExecutionResultId === 1){
                        DisplayUserActionAlert && DisplayUserActionAlert(Alert_Action_Enum.Create, Alert_Type_Enum.Success, null, 'Quality plan saved successfully.', null, null, null);
                        if(res.ReferenceId){ window.location.href = $('#QualityPlanListUrl').val(); }
                    } else {
                        var msg = (res && res.UserInformationMessageContent) || 'Save failed';
                        DisplayUserActionAlert && DisplayUserActionAlert(Alert_Action_Enum.Create, Alert_Type_Enum.Danger, null, msg, null, null, null);
                    }
                },
                error: function(){
                    $('#EntrySavingProgress').hide(); $('#EntrySaveText').text('Save');
                    DisplayUserActionAlert && DisplayUserActionAlert(Alert_Action_Enum.Create, Alert_Type_Enum.Danger, null, 'Error occurred while saving quality plan.', null, null, null);
                }
            });
        } catch(ex){ console.error('SaveQualityPlan error', ex); }
    }
}
// =========================================================
