window.splitCsvField = function(raw){
  if(raw == null) return [];
  const s = String(raw).trim();
  if(!s) return [];
  // 兼容逗号分隔（CSV常规）与中文顿号分隔
  const parts = s.split(/[,，;；\n]/).map(x=>(x||'').trim()).filter(Boolean);
  // 去重、保留顺序
  const out = [];
  const seen = new Set();
  for(const p of parts){ if(!seen.has(p)){ seen.add(p); out.push(p); } }
  return out;
};
