(function(){
  // Simple client-side only mock save; replace with real endpoint when implemented
  function validate(){
    var batch = document.getElementById('BatchNo').value.trim();
    var func = document.getElementById('FunctionId').value.trim();
    var status = document.getElementById('StatusId').value.trim();
    if(!batch){ alert('Batch No required'); return false; }
    if(!func){ alert('Function required'); return false; }
    if(!status){ alert('Status required'); return false; }
    return true;
  }
  document.getElementById('btnSaveBatch')?.addEventListener('click', function(){
    if(!validate()) return;
    var payload = {
      BatchNo: document.getElementById('BatchNo').value.trim(),
      FunctionId: parseInt(document.getElementById('FunctionId').value)||null,
      StatusId: parseInt(document.getElementById('StatusId').value)||null,
      Description: document.getElementById('Description').value.trim()||null
    };
    // TODO: post to real backend endpoint; for now, immediately notify opener
    try{
      if(window.opener && !window.opener.closed){
        window.opener.postMessage({ source:'CreateBatchNo', action:'BatchCreated', data: payload }, '*');
      }
    }catch(e){ console.warn('postMessage failed', e); }
    alert('Batch saved (mock). Close this tab or create another.');
  });
})();