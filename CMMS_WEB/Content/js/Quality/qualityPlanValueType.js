/* Fresh value type handling for Quality Plan parameter UI
 Rules:
  - When Quality Parameter dropdown changes we fetch meta (value type + dropdown values + descriptive name)
  - ValueType 3 (Dropdown): show Min/Max/Desired columns; Desired becomes dropdown; stage table visible; stage desired becomes dropdown
  - ValueType 2 (Text): hide Min/Max/Desired row, hide stage table
  - ValueType 1 (Numeric): show Min/Max/Desired numeric inputs; stage table visible; stage fields numeric
  - Function isolated; does not disturb previous script logic
*/
(function(){
    const PARAM_TYPE_DROPDOWN = 3;
    const PARAM_TYPE_NUMBER = 1; // Numeric = 1 in Enums

    // fetch both descriptive type and dropdown support
    function fetchMeta(qpId, cb){
        if(!qpId){ cb(null); return; }

        const token = $('input[name="__RequestVerificationToken"]').val();
        // first fetch descriptive type
        $.ajax({
            url: $('#GetQualityParameterTypeUrl') && $('#GetQualityParameterTypeUrl').val() ? $('#GetQualityParameterTypeUrl').val() : $('#GetQualityParameterValueSupportUrl').val(),
            type: 'POST', dataType:'json', data:{ qualityParameterId: qpId },
            headers: { 'RequestVerificationToken': token },
            success: function(typeRes){
                // then fetch dropdown values/support (existing endpoint)
                $.ajax({
                    url: $('#GetQualityParameterValueSupportUrl').val(),
                    type: 'POST', dataType:'json', data:{ qualityParameterId: qpId },
                    headers: { 'RequestVerificationToken': token },
                    success: function(supportRes){
                        // merge results: ensure ParameterValueTypeId and DropdownValues and ParameterValueTypeName
                        const meta = supportRes || {};
                        if(typeRes && typeRes.ParameterValueTypeName) meta.ParameterValueTypeName = typeRes.ParameterValueTypeName;
                        if(typeRes && (typeRes.ParameterValueTypeId || typeRes.ParameterValueTypeId === 0)) meta.ParameterValueTypeId = typeRes.ParameterValueTypeId;
                        cb(meta);
                    },
                    error: function(){
                        // fallback to typeRes only
                        const meta = typeRes || null;
                        cb(meta);
                    }
                });
            },
            error:function(){
                // fallback: try support endpoint only
                $.ajax({
                    url: $('#GetQualityParameterValueSupportUrl').val(),
                    type: 'POST', dataType:'json', data:{ qualityParameterId: qpId },
                    headers: { 'RequestVerificationToken': token },
                    success: function(supportRes){ cb(supportRes); },
                    error:function(){ cb(null); }
                });
            }
        });
    }

    function buildValueDropdown(name, values){
        const ddl = $('<select class="form-select" name="'+name+'"><option value="">Select Value</option></select>');
        (values||[]).forEach(v=> ddl.append('<option value="'+v.Id+'">'+v.Text+'</option>'));
        return ddl;
    }

    function resolveTypeLabel(typeId, typeName){
        // Prefer descriptive name from DB if present
        if(typeName && typeName.trim().length>0) return typeName;
        if(typeId === PARAM_TYPE_DROPDOWN) return 'Dropdown';
        if(typeId === PARAM_TYPE_NUMBER) return 'Numeric';
        return 'Text';
    }

    function applySection(section, meta){
        const typeId = meta ? parseInt(meta.ParameterValueTypeId,10) : 0;
        const typeName = meta && meta.ParameterValueTypeName ? meta.ParameterValueTypeName : '';
        const minCol = section.find('input[name="MinValue"]').closest('.col-md-2');
        const maxCol = section.find('input[name="MaxValue"]').closest('.col-md-2');
        const desiredInput = section.find('input[name="DesiredValue"]');
        const desiredCol = desiredInput.closest('.col-md-2');
        desiredCol.find('select[name="DesiredValueDropdown"]').remove();
        desiredInput.show(); desiredInput.attr('type','text');

        // set value type textbox (prefer DB name)
        section.find('input[name="ParameterValueType"]').val(resolveTypeLabel(typeId, typeName));

        const stageTableWrapper = section.find('table[name="tblStageValues"]').closest('.row, .table-responsive').first().length ? section.find('table[name="tblStageValues"]').closest('.row, .table-responsive').first() : section.find('table[name="tblStageValues"]').parent();
        const stageTable = section.find('table[name="tblStageValues"]');

        if(typeId === PARAM_TYPE_DROPDOWN){
            minCol.show(); maxCol.show(); desiredCol.show(); stageTableWrapper.show();
            desiredInput.hide();
            desiredInput.after(buildValueDropdown('DesiredValueDropdown', meta.DropdownValues));
            // If dropdown values missing, fetch them and then adapt stage table
            if(!(meta && meta.DropdownValues && meta.DropdownValues.length)){
                var qpIdLocal = parseInt(section.find('select[name="QualityParameter"]').val()||'0');
                if(qpIdLocal){
                    var token = $('input[name="__RequestVerificationToken"]').val();
                    $.ajax({
                        url: $('#GetQualityParameterValueSupportUrl').val(),
                        type: 'POST', dataType: 'json', data: { qualityParameterId: qpIdLocal },
                        headers: { 'RequestVerificationToken': token },
                        success: function(supportRes){
                            var dropdowns = (supportRes && supportRes.DropdownValues) ? supportRes.DropdownValues : [];
                            // replace desired dropdown created earlier
                            desiredCol.find('select[name="DesiredValueDropdown"]').remove();
                            desiredInput.after(buildValueDropdown('DesiredValueDropdown', dropdowns));
                            adaptStageTable(section, typeId, dropdowns);
                            ensureStageDesiredConverted(section, dropdowns);
                        },
                        error: function(){
                            // still attempt to adapt with empty list
                            adaptStageTable(section, typeId, []);
                        }
                    });
                    return; // wait for async adapt
                }
            }
            adaptStageTable(section, typeId, meta.DropdownValues);
            // Ensure stage desired conversion if meta already has dropdowns
            if(typeId === PARAM_TYPE_DROPDOWN && meta && meta.DropdownValues && meta.DropdownValues.length){
                ensureStageDesiredConverted(section, meta.DropdownValues);
            }
        } else if(typeId === PARAM_TYPE_NUMBER){
            minCol.show(); maxCol.show(); desiredCol.show(); stageTableWrapper.show();
            minCol.find('input').attr('type','number');
            maxCol.find('input').attr('type','number');
            desiredInput.attr('type','number');
            adaptStageTable(section, typeId, null);
        } else { // Text / Other
            minCol.hide(); maxCol.hide(); desiredCol.hide();
            stageTableWrapper.hide();
        }
    }

    function adaptStageTable(section, typeId, dropdownValues){
        const tbody = section.find('table[name="tblStageValues"] tbody');

        // If dropdown type but no dropdown values supplied, fetch them once and re-run adaptation
        if(typeId===PARAM_TYPE_DROPDOWN && !(dropdownValues && dropdownValues.length)){
            const qpId = parseInt(section.find('select[name="QualityParameter"]').val()||'0');
            if(qpId){
                const token = $('input[name="__RequestVerificationToken"]').val();
                $.ajax({
                    url: $('#GetQualityParameterValueSupportUrl').val(),
                    type: 'POST', dataType: 'json', data: { qualityParameterId: qpId },
                    headers: { 'RequestVerificationToken': token },
                    success: function(supportRes){
                        const values = (supportRes && supportRes.DropdownValues) ? supportRes.DropdownValues : [];
                        // call again with fetched values
                        adaptStageTable(section, typeId, values);
                        ensureStageDesiredConverted(section, values);
                    },
                    error: function(){
                        // nothing to do, leave as-is
                    }
                });
                return; // wait for async fetch
            }
        }

        tbody.find('tr').each(function(){
            const row = $(this);
            const min = row.find('input[name="StageMin"]').closest('td');
            const max = row.find('input[name="StageMax"]').closest('td');
            const desiredInput = row.find('input[name="StageDesired"]');
            const desiredTd = desiredInput.closest('td');
            desiredTd.find('select[name="StageDesiredDropdown"]').remove();
            desiredInput.show().attr('type','text');
            if(typeId===PARAM_TYPE_DROPDOWN){
                min.show(); max.show(); desiredTd.show();
                desiredInput.hide();
                if(dropdownValues && dropdownValues.length){
                    const ddl = buildValueDropdown('StageDesiredDropdown', dropdownValues);
                    desiredInput.after(ddl);
                }
            } else if(typeId===PARAM_TYPE_NUMBER){
                min.show(); max.show(); desiredTd.show();
                row.find('input[name="StageMin"]').attr('type','number');
                row.find('input[name="StageMax"]').attr('type','number');
                desiredInput.attr('type','number');
            } else { // Text
                min.hide(); max.hide(); desiredTd.hide();
            }
        });
    }

    function ensureStageDesiredConverted(section, dropdownValues){
        // Convert any visible input[name="StageDesired"] to select[name="StageDesiredDropdown"] when dropdownValues provided
        if(!(dropdownValues && dropdownValues.length)) return;
        section.find('table[name="tblStageValues"] tbody tr').each(function(){
            var tr = $(this);
            var desiredInput = tr.find('input[name="StageDesired"]');
            if(desiredInput.length && desiredInput.is(':visible')){
                // preserve value if it's an id/text
                var val = desiredInput.val();
                desiredInput.hide();
                // remove existing dropdown just in case
                desiredInput.closest('td').find('select[name="StageDesiredDropdown"]').remove();
                var ddl = buildValueDropdown('StageDesiredDropdown', dropdownValues);
                if(val) ddl.val(val);
                desiredInput.after(ddl);
            }
        });
    }

    // event binding (delegate)
    $(document).off('change.qpValueTypeNew','select[name="QualityParameter"]').on('change.qpValueTypeNew','select[name="QualityParameter"]',function(){
        const section = $(this).closest('.quality-parameter-section');
        const qpId = parseInt($(this).val()||'0');
        if(!qpId){ applySection(section,null); return; }
        fetchMeta(qpId,function(meta){ applySection(section, meta); });
    });

    // hydrate already selected on load
    $(function(){
        setTimeout(function(){
            $('#quality-parameter-sections .quality-parameter-section').each(function(){
                const sec = $(this); const qpid = parseInt(sec.find('select[name="QualityParameter"]').val()||'0');
                if(!qpid){ applySection(sec,null); } else { fetchMeta(qpid,function(meta){ applySection(sec, meta); }); }
            });
        },120);
    });

    // Export collection functions patch (non destructive) so DesiredValue picks dropdown selection
    if(typeof collectQPParameters === 'function' && !window.__QP_PARAM_PATCH_FRESH__){
        window.__QP_PARAM_PATCH_FRESH__ = true;
        const oldFn = collectQPParameters;
        collectQPParameters = function(){
            const list = oldFn();
            // Already handled inside oldFn maybe; ensure substitution
            $('#quality-parameter-sections .quality-parameter-section').each(function(){
                const sec = $(this); const qpId = parseInt(sec.find('select[name="QualityParameter"]').val()||'0'); const itemId = parseInt(sec.find('select[name="QPItem"]').val()||'0');
                if(!qpId || !itemId) return;
                const idx = list.findIndex(x=> x.ItemId==itemId && x.QualityParameterId==qpId);
                const desired = sec.find('select[name="DesiredValueDropdown"]').val() || sec.find('input[name="DesiredValue"]').val();
                if(idx>=0) list[idx].DesiredValue = desired;
            });
            return list;
        };
    }
    if(typeof collectQPStages === 'function' && !window.__QP_STAGE_PATCH_FRESH__){
        window.__QP_STAGE_PATCH_FRESH__ = true;
        const oldStageFn = collectQPStages;
        collectQPStages = function(){
            const list = oldStageFn();
            $('#quality-parameter-sections .quality-parameter-section').each(function(){
                const sec = $(this); const qpId = parseInt(sec.find('select[name="QualityParameter"]').val()||'0'); const itemId = parseInt(sec.find('select[name="QPItem"]').val()||'0');
                if(!qpId || !itemId) return;
                sec.find('table[name="tblStageValues"] tbody tr').each(function(){
                    const tr = $(this); const stageNo = parseInt(tr.find('select.stage-select').val()||'0');
                    const desired = tr.find('select[name="StageDesiredDropdown"]').val() || tr.find('input[name="StageDesired"]').val();
                    const hit = list.find(x=> x.ItemId==itemId && x.QualityParameterId==qpId && x.StageNo==stageNo);
                    if(hit) hit.DesiredValue = desired;
                });
            });
            return list;
        };
    }
    // Re-apply adaptation after stage rows populated
    $(document).on('qpStagesPopulated', '.quality-parameter-section', function(){
        const sec = $(this);
        const qpId = parseInt(sec.find('select[name="QualityParameter"]').val()||'0');
        if(!qpId) return;
        fetchMeta(qpId, function(meta){ applySection(sec, meta); });
    });
})();
