

/* FASE 18.7.2 - Compatibilidad GitHub Pages y seguridad de imágenes */
const JIM_ASSET_BASE = new URL('./assets/', window.location.href).href;
function assetUrl1872(file){ return new URL(file, JIM_ASSET_BASE).href; }
function logoUrl1872(){ return assetUrl1872('logo.jpg'); }
function imgSafe1872(src){ return src || logoUrl1872(); }
document.addEventListener('error', function(e){
  const t=e.target;
  if(t && t.tagName==='IMG' && !t.dataset.fallback1872){
    t.dataset.fallback1872='1';
    t.src=logoUrl1872();
  }
}, true);

const $=id=>document.getElementById(id);const money=n=>'$'+Number(n||0).toFixed(2);const bs=n=>'Bs '+Number(n||0).toFixed(2);let state=JSON.parse(localStorage.getItem('jimmoreDB')||'{}');state={rate:state.rate||120,tax:state.tax||0,products:state.products||[],invoices:state.invoices||[],workOrders:state.workOrders||[],clients:state.clients||[],accounting:state.accounting||[],config:state.config||{companyName:'Inversiones Jimmore 0331 C.A.'},cart:[]};function save(){localStorage.setItem('jimmoreDB',JSON.stringify(state));renderAll()}function login(){let r=$('roleSelect').value;$('login').classList.add('hidden');$('app').classList.remove('hidden');$('currentRole').textContent='Usuario: '+$('userName').value+' · Rol: '+r;applyRole(r);renderAll()}function logout(){$('app').classList.add('hidden');$('login').classList.remove('hidden')}function applyRole(r){document.querySelectorAll('.sidebar button').forEach(b=>b.style.display='block');if(r==='vendedor')hide(['inventario','contabilidad','config']);if(r==='almacen')hide(['pos','facturas','contabilidad','config','clientes']);if(r==='taller')hide(['pos','facturas','inventario','contabilidad','config','reportes']);if(r==='cliente'){openClientPortal();logout()}}function hide(pages){pages.forEach(p=>{let b=document.querySelector(`[data-page="${p}"]`);if(b)b.style.display='none'})}function showPage(p){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$(p).classList.add('active');$('pageTitle').textContent=document.querySelector(`[data-page="${p}"]`)?.textContent||'Sistema';document.querySelectorAll('.sidebar button').forEach(b=>b.classList.remove('active'));document.querySelector(`[data-page="${p}"]`)?.classList.add('active');renderAll()}function saveRate(){state.rate=Number($('bcvRate').value||state.rate);save()}async function mockAutoRate(){alert('Modo gratis: para tasa automática real se conecta en fase Firebase/API. Por ahora coloca la tasa manual diaria.');}function saveTax(){state.tax=Number($('taxRate').value||0);save()}function saveConfig(){state.config={companyName:$('companyName').value,rif:$('companyRif').value,address:$('companyAddress').value,phone:$('companyPhone').value,firebase:$('firebaseConfig').value};save();alert('Configuración guardada')}function saveProduct(){let id=$('prodId').value||Date.now().toString();let f=$('prodImg').files[0];let done=img=>{let p={id,name:$('prodName').value,code:$('prodCode').value||id,category:$('prodCategory').value,brand:$('prodBrand').value,supplier:$('prodSupplier').value,location:$('prodLocation').value,cost:Number($('prodCost').value||0),price:Number($('prodPrice').value||0),stock:Number($('prodStock').value||0),min:Number($('prodMin').value||0),img:img||state.products.find(x=>x.id===id)?.img||''};state.products=state.products.filter(x=>x.id!==id);state.products.push(p);clearProductForm();save()};if(f){let reader=new FileReader();reader.onload=e=>done(e.target.result);reader.readAsDataURL(f)}else done()}function editProduct(id){let p=state.products.find(x=>x.id===id);['Id','Name','Code','Category','Brand','Supplier','Location','Cost','Price','Stock','Min'].forEach(k=>{$('prod'+k).value=p[k.toLowerCase()]||''});showPage('inventario')}function delProduct(id){if(confirm('¿Eliminar producto?')){state.products=state.products.filter(p=>p.id!==id);save()}}function clearProductForm(){['Id','Name','Code','Category','Brand','Supplier','Location','Cost','Price','Stock','Min'].forEach(k=>{$('prod'+k).value=''})}function massPriceUpdate(){let pct=Number($('pricePercent').value||0);state.products=state.products.map(p=>({...p,price:p.price+(p.price*pct/100)}));save();alert('Precios actualizados')}function renderProducts(){let html='<table class="table"><tr><th>Foto</th><th>Producto</th><th>Código</th><th>Ubicación</th><th>Stock</th><th>Precio</th><th></th></tr>';state.products.forEach(p=>html+=`<tr><td>${p.img?`<img class="thumb" src="${p.img}">`:''}</td><td>${p.name}<br><small>${p.category} · ${p.brand}</small></td><td>${p.code}</td><td>${p.location}</td><td><b class="${p.stock<=p.min?'status':''}">${p.stock}</b></td><td>${money(p.price)}<br><small>${bs(p.price*state.rate)}</small></td><td><button onclick="editProduct('${p.id}')">Editar</button><button class="danger" onclick="delProduct('${p.id}')">Eliminar</button></td></tr>`);$('productTable').innerHTML=html+'</table>'}function renderProductsPOS(){let q=($('searchProduct')?.value||'').toLowerCase();$('posProducts').innerHTML=state.products.filter(p=>(p.name+p.code).toLowerCase().includes(q)).map(p=>`<div class="product-item">${p.img?`<img src="${p.img}">`:''}<b>${p.name}</b><br><small>${p.code}</small><p>${money(p.price)} / ${bs(p.price*state.rate)}</p><button onclick="addCart('${p.id}')">Agregar</button></div>`).join('')}function addCart(id){let p=state.products.find(x=>x.id===id);let item=state.cart.find(x=>x.id===id);if(item)item.qty++;else state.cart.push({id,qty:1,price:p.price,name:p.name});renderCart()}function renderCart(){let total=state.cart.reduce((s,i)=>s+i.price*i.qty,0);$('cart').innerHTML=state.cart.map(i=>`<div class="product-item"><b>${i.name}</b> x ${i.qty} = ${money(i.price*i.qty)} <button onclick="removeCart('${i.id}')">Quitar</button></div>`).join('');$('cartTotal').textContent=`Total: ${money(total)} / ${bs(total*state.rate)}`}function removeCart(id){state.cart=state.cart.filter(i=>i.id!==id);renderCart()}function completeSale(){if(!state.cart.length)return alert('Agrega productos');let total=state.cart.reduce((s,i)=>s+i.price*i.qty,0);let inv={id:Date.now().toString(),date:new Date().toLocaleString(),client:$('posClient').value||'Cliente general',items:[...state.cart],total,rate:state.rate,payments:{usd:+$('payCashUsd').value||0,bs:+$('payCashBs').value||0,card:+$('payCard').value||0,mobile:+$('payMobile').value||0,binance:+$('payBinance').value||0,zelle:+$('payZelle').value||0}};inv.items.forEach(i=>{let p=state.products.find(x=>x.id===i.id);if(p)p.stock-=i.qty});state.invoices.push(inv);state.accounting.push({id:inv.id,date:inv.date,type:'ingreso',desc:'Venta factura '+inv.id,amount:total});state.cart=[];save();showPage('facturas')}function renderInvoices(){$('invoiceList').innerHTML=state.invoices.slice().reverse().map(i=>`<div class="product-item"><b>Factura #${i.id}</b> · ${i.date}<br>Cliente: ${i.client}<br>Total: ${money(i.total)} / ${bs(i.total*i.rate)}<br><small>Pagos: ${JSON.stringify(i.payments)}</small><br><button onclick="printOneInvoice('${i.id}')">Imprimir factura</button></div>`).join('')}function printOneInvoice(id){let i=state.invoices.find(x=>x.id===id);let w=window.open('','_blank');w.document.write(`<h1>${state.config.companyName}</h1><img src="${logoUrl1872()}" width="220"><h2>Factura #${i.id}</h2><p>${i.date}</p><p>Cliente: ${i.client}</p><table border=1 cellpadding=8>${i.items.map(x=>`<tr><td>${x.name}</td><td>${x.qty}</td><td>${money(x.price)}</td></tr>`).join('')}</table><h2>${money(i.total)} / ${bs(i.total*i.rate)}</h2>`);w.print()}function printInvoices(){window.print()}function saveWorkOrder(){let id=$('woId').value||Date.now().toString();let o={id,client:$('woClient').value,phone:$('woPhone').value,vehicle:$('woVehicle').value,code:$('woCode').value||('JM-'+id.slice(-5)),received:$('woReceived').value,type:$('woType').value,status:$('woStatus').value,notes:$('woNotes').value,updated:new Date().toLocaleString()};state.workOrders=state.workOrders.filter(x=>x.id!==id);state.workOrders.push(o);['woId','woClient','woPhone','woVehicle','woCode','woReceived','woNotes'].forEach(x=>$(x).value='');save()}function renderWorkOrders(){$('workOrders').innerHTML=state.workOrders.slice().reverse().map(o=>`<div class="product-item"><b>${o.client}</b> · ${o.vehicle}<br>Código: <b>${o.code}</b><br>Recibido: ${o.received||'-'} · Tipo: ${o.type}<br>Estado: <span class="status">${o.status}</span><p>${o.notes||''}</p><small>Actualizado: ${o.updated}</small></div>`).join('')}function openClientPortal(){$('clientPortal').classList.remove('hidden')}function closeClientPortal(){$('clientPortal').classList.add('hidden')}function clientCheck(){let c=$('clientCodeInput').value.trim().toLowerCase();let o=state.workOrders.find(x=>(x.code||'').toLowerCase()===c);$('clientResult').innerHTML=o?`<div class="product-item"><h3>${o.vehicle}</h3><p>Cliente: ${o.client}</p><p>Trabajo: ${o.type}</p><p>Estado: <b>${o.status}</b></p><p>${o.notes||''}</p><small>Actualizado: ${o.updated}</small></div>`:'No encontramos ese código. Verifica con la tienda.'}function saveClient(){state.clients.push({id:Date.now(),name:$('crmName').value,phone:$('crmPhone').value,vehicle:$('crmVehicle').value,notes:$('crmNotes').value});['crmName','crmPhone','crmVehicle','crmNotes'].forEach(x=>$(x).value='');save()}function renderClients(){$('clientList').innerHTML=state.clients.map(c=>`<div class="product-item"><b>${c.name}</b><br>${c.phone} · ${c.vehicle}<p>${c.notes}</p></div>`).join('')}function saveAccounting(){state.accounting.push({id:Date.now(),date:new Date().toLocaleString(),desc:$('accDesc').value,type:$('accType').value,amount:+$('accAmount').value||0});['accDesc','accAmount'].forEach(x=>$(x).value='');save()}function renderAccounting(){$('accountingList').innerHTML=state.accounting.slice().reverse().map(a=>`<div class="product-item"><b>${a.type.toUpperCase()}</b> ${money(a.amount)}<br>${a.desc}<br><small>${a.date}</small></div>`).join('')}function verifyPrice(){let c=$('verifyCode').value.toLowerCase();let p=state.products.find(x=>(x.code||'').toLowerCase()===c||(x.name||'').toLowerCase().includes(c)&&c.length>2);$('verifyResult').innerHTML=p?`<b>${p.name}</b><br>${money(p.price)}<br>${bs(p.price*state.rate)}<br>Stock: ${p.stock}`:''}function renderReports(){let income=state.accounting.filter(a=>a.type==='ingreso').reduce((s,a)=>s+a.amount,0),expenses=state.accounting.filter(a=>a.type==='gasto').reduce((s,a)=>s+a.amount,0);$('reportsBox').textContent=JSON.stringify({ingresos:income,gastos:expenses,ganancia:income-expenses,productos:state.products.length,facturas:state.invoices.length,ordenesTrabajo:state.workOrders.length,stockBajo:state.products.filter(p=>p.stock<=p.min).length},null,2)}function exportCSV(name,rows){let csv=rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=name;a.click()}function exportProductsCSV(){exportCSV('productos_jimmore.csv',[['codigo','nombre','categoria','marca','proveedor','ubicacion','costo','precio','stock'],...state.products.map(p=>[p.code,p.name,p.category,p.brand,p.supplier,p.location,p.cost,p.price,p.stock])])}function exportInvoicesCSV(){exportCSV('facturas_jimmore.csv',[['id','fecha','cliente','total_usd','tasa','total_bs'],...state.invoices.map(i=>[i.id,i.date,i.client,i.total,i.rate,i.total*i.rate])])}function importProductsCSV(){let f=$('importFile').files[0];if(!f)return;let r=new FileReader();r.onload=e=>{e.target.result.split(/\r?\n/).slice(1).forEach(line=>{let v=line.split(',').map(x=>x.replaceAll('"',''));if(v[0])state.products.push({id:Date.now()+Math.random(),code:v[0],name:v[1],category:v[2],brand:v[3],supplier:v[4],location:v[5],cost:+v[6]||0,price:+v[7]||0,stock:+v[8]||0,min:1})});save()};r.readAsText(f)}function exportAll(){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='respaldo_jimmore.json';a.click()}let chart;function renderChart(){let ctx=$('salesChart');if(!ctx)return;let days=[...Array(7)].map((_,i)=>{let d=new Date();d.setDate(d.getDate()-6+i);return d.toLocaleDateString()});let data=days.map(d=>state.invoices.filter(i=>i.date.includes(d)).reduce((s,i)=>s+i.total,0));if(chart)chart.destroy();chart=new Chart(ctx,{type:'line',data:{labels:days,datasets:[{label:'Ventas $',data}]},options:{responsive:true,plugins:{legend:{display:false}}}})}function renderDashboard(){let today=new Date().toLocaleDateString();let tincome=state.invoices.filter(i=>i.date.includes(today)).reduce((s,i)=>s+i.total,0);$('bcvRate').value=state.rate;$('taxRate').value=state.tax;$('todayIncome').textContent=money(tincome);$('todayIncomeBs').textContent=bs(tincome*state.rate);$('salesCount').textContent=state.invoices.length;$('clientCount').textContent=state.clients.length;$('lowStock').textContent=state.products.filter(p=>p.stock<=p.min).length;renderChart()}function renderAll(){renderDashboard();renderProducts();renderProductsPOS();renderCart();renderInvoices();renderWorkOrders();renderClients();renderAccounting();renderReports();$('companyName').value=state.config.companyName||'';$('companyRif').value=state.config.rif||'';$('companyAddress').value=state.config.address||'';$('companyPhone').value=state.config.phone||'';$('firebaseConfig').value=state.config.firebase||''}document.addEventListener('DOMContentLoaded',()=>{showPage('dashboard');renderAll()});

/* ===================== FASE 2: FIREBASE + SINCRONIZACION ===================== */
let firebaseDb=null, firebaseReady=false, receivingRemote=false;
function setSyncStatus(txt, mode=''){
  const el=$('syncStatus'); if(!el) return;
  el.textContent=txt; el.className='sync-status '+mode;
}
function parseFirebaseConfig(text){
  text=(text||'').trim();
  if(!text) throw new Error('Pega la configuración de Firebase.');
  const start=text.indexOf('{'), end=text.lastIndexOf('}');
  if(start<0||end<0) throw new Error('No encontré el objeto firebaseConfig.');
  const objText=text.slice(start,end+1);
  return Function('return ('+objText+')')();
}
function normalizeFirebaseConfig(cfg){
  cfg = cfg || {};
  if(!cfg.databaseURL && cfg.projectId){
    cfg.databaseURL = 'https://' + cfg.projectId + '-default-rtdb.firebaseio.com';
  }
  return cfg;
}
function connectFirebase(){
  try{
    if(typeof firebase==='undefined') throw new Error('No cargó la librería Firebase. Revisa internet.');
    const cfg=normalizeFirebaseConfig(parseFirebaseConfig($('firebaseConfig').value||state.config.firebase));
    if(!cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId){
      throw new Error('El firebaseConfig está incompleto. Copia el bloque completo de Firebase > Configuración del proyecto > General > Tus apps.');
    }
    if(!cfg.databaseURL){
      throw new Error('No pude crear databaseURL. Copia la URL de Realtime Database o agrega databaseURL al firebaseConfig.');
    }
    if(!firebase.apps.length) firebase.initializeApp(cfg);
    firebaseDb=firebase.database(); firebaseReady=true;
    setSyncStatus('Firebase conectado','online');
    if($('firebaseMsg')) $('firebaseMsg').textContent='Firebase conectado correctamente. Los datos se sincronizan en tiempo real.';
    firebaseDb.ref('jimmoreDB').on('value', snap=>{
      const data=snap.val();
      if(!data) return;
      receivingRemote=true;
      state={...state,...data,cart:state.cart||[]};
      localStorage.setItem('jimmoreDB',JSON.stringify(state));
      receivingRemote=false;
      renderAll();
      setSyncStatus('Sincronizado','online');
    });
  }catch(e){ setSyncStatus('Error Firebase','error'); alert('Firebase no conectó: '+e.message); }
}
const saveLocalOriginal=save;
save=function(){
  localStorage.setItem('jimmoreDB',JSON.stringify(state));
  if(firebaseReady && firebaseDb && !receivingRemote){
    const copy={...state,cart:[]};
    firebaseDb.ref('jimmoreDB').set(copy).then(()=>setSyncStatus('Sincronizado','online')).catch(err=>{setSyncStatus('Error guardando','error'); console.error(err);});
  }
  renderAll();
}
function pushLocalToFirebase(){
  if(!firebaseReady||!firebaseDb) return alert('Primero conecta Firebase.');
  firebaseDb.ref('jimmoreDB').set({...state,cart:[]}).then(()=>alert('Datos locales subidos a Firebase.'));
}
function pullFirebaseOnce(){
  if(!firebaseReady||!firebaseDb) return alert('Primero conecta Firebase.');
  firebaseDb.ref('jimmoreDB').get().then(snap=>{
    const data=snap.val(); if(!data) return alert('Firebase está vacío.');
    state={...state,...data,cart:[]}; localStorage.setItem('jimmoreDB',JSON.stringify(state)); renderAll(); alert('Datos bajados de Firebase.');
  });
}
const oldSaveConfig=saveConfig;
saveConfig=function(){
  state.config={companyName:$('companyName').value,rif:$('companyRif').value,address:$('companyAddress').value,phone:$('companyPhone').value,firebase:$('firebaseConfig').value};
  save(); alert('Configuración guardada');
}
mockAutoRate=async function(){
  try{
    setSyncStatus('Buscando BCV...');
    const r=await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
    const data=await r.json();
    const rate=Number(data.promedio||data.price||data.venta||data.compra);
    if(!rate) throw new Error('No se pudo leer la tasa');
    state.rate=rate; $('bcvRate').value=rate; save();
    alert('Tasa BCV actualizada: '+rate);
  }catch(e){ alert('No se pudo traer la tasa automática. Puedes colocarla manualmente.'); }
}

document.addEventListener('DOMContentLoaded',()=>{
  setSyncStatus('Local');
  if(state.config&&state.config.firebase&&state.config.firebase.includes('apiKey')){
    setTimeout(()=>{ try{ connectFirebase(); }catch(e){} },800);
  }
});

/* ===================== FASE 3: CLIENTES + HISTORIAL + TALLER CON SEGUIMIENTO ===================== */
function normalizeText(v){return String(v||'').trim().toLowerCase()}
function findClientByNamePhone(name, phone=''){
  const n=normalizeText(name), ph=normalizeText(phone);
  return state.clients.find(c=>normalizeText(c.name)===n || (ph && normalizeText(c.phone)===ph));
}
function upsertClientFromData(data){
  const name=(data.name||'').trim(); if(!name) return null;
  let c=data.id?state.clients.find(x=>String(x.id)===String(data.id)):findClientByNamePhone(name,data.phone);
  if(c){Object.assign(c,{name,phone:data.phone||c.phone||'',document:data.document||c.document||'',address:data.address||c.address||'',vehicle:data.vehicle||c.vehicle||'',notes:data.notes??c.notes??'',updated:new Date().toLocaleString()});}
  else{c={id:Date.now().toString()+Math.floor(Math.random()*999),name,phone:data.phone||'',document:data.document||'',address:data.address||'',vehicle:data.vehicle||'',notes:data.notes||'',created:new Date().toLocaleString(),updated:new Date().toLocaleString()};state.clients.push(c)}
  return c;
}
function clearClientForm(){['crmId','crmName','crmPhone','crmDocument','crmAddress','crmVehicle','crmNotes'].forEach(id=>{if($(id))$(id).value=''}); if($('clientHistory'))$('clientHistory').innerHTML='';}
function saveClient(){
  const c=upsertClientFromData({id:$('crmId')?.value,name:$('crmName')?.value,phone:$('crmPhone')?.value,document:$('crmDocument')?.value,address:$('crmAddress')?.value,vehicle:$('crmVehicle')?.value,notes:$('crmNotes')?.value});
  if(c){$('crmId').value=c.id; save(); renderClientHistory(c.id); alert('Cliente guardado y disponible para ventas/taller.');}
}
function editClient(id){
  const c=state.clients.find(x=>String(x.id)===String(id)); if(!c)return;
  showPage('clientes');
  $('crmId').value=c.id; $('crmName').value=c.name||''; $('crmPhone').value=c.phone||'';
  if($('crmDocument'))$('crmDocument').value=c.document||''; if($('crmAddress'))$('crmAddress').value=c.address||'';
  $('crmVehicle').value=c.vehicle||''; $('crmNotes').value=c.notes||''; renderClientHistory(c.id);
}
function delClient(id){if(confirm('¿Eliminar cliente? No borra facturas ni trabajos.')){state.clients=state.clients.filter(c=>String(c.id)!==String(id));save();}}
function renderClientOptions(){
  const dl=$('clientDatalist'); if(!dl) return;
  dl.innerHTML=state.clients.map(c=>`<option value="${(c.name||'').replaceAll('"','&quot;')}">${c.phone||''} ${c.vehicle||''}</option>`).join('');
}
function clientInvoices(client){return state.invoices.filter(i=>String(i.clientId||'')===String(client.id)||normalizeText(i.client)===normalizeText(client.name))}
function clientOrders(client){return state.workOrders.filter(o=>String(o.clientId||'')===String(client.id)||normalizeText(o.client)===normalizeText(client.name))}
function renderClientHistory(id){
  const c=state.clients.find(x=>String(x.id)===String(id)); const box=$('clientHistory'); if(!box||!c)return;
  const inv=clientInvoices(c), ord=clientOrders(c);
  const invHtml=inv.length?inv.slice().reverse().map(i=>`<div class="product-item"><b>Factura #${i.id}</b><br>${i.date}<br>Total: ${money(i.total)} / ${bs(i.total*i.rate)}<br><small>${(i.items||[]).map(x=>x.name+' x'+x.qty).join(' · ')}</small></div>`).join(''):'<p>Sin compras registradas.</p>';
  const ordHtml=ord.length?ord.slice().reverse().map(o=>`<div class="product-item"><b>${o.type}</b> · ${o.vehicle||c.vehicle||''}<br>Código: <b>${o.code}</b><br>Estado: <span class="status">${o.status}</span><br><small>${o.updated||''}</small></div>`).join(''):'<p>Sin trabajos registrados.</p>';
  box.innerHTML=`<h4>${c.name}</h4><p>${c.phone||''} ${c.vehicle?'· '+c.vehicle:''}</p><h4>Compras</h4>${invHtml}<h4>Trabajos de taller</h4>${ordHtml}`;
}
function renderClients(){
  renderClientOptions();
  const q=normalizeText($('clientSearch')?.value||'');
  const rows=state.clients.filter(c=>normalizeText((c.name||'')+' '+(c.phone||'')+' '+(c.vehicle||'')+' '+(c.document||'')).includes(q));
  if($('clientList'))$('clientList').innerHTML=rows.map(c=>{
    const inv=clientInvoices(c), ord=clientOrders(c);
    return `<div class="product-item"><b>${c.name}</b><br>${c.phone||'-'} · ${c.vehicle||'-'}<p>${c.notes||''}</p><small>Compras: ${inv.length} · Trabajos: ${ord.length}</small><br><button onclick="editClient('${c.id}')">Editar / historial</button><button onclick="startWorkForClient('${c.id}')">Crear trabajo</button><button class="danger" onclick="delClient('${c.id}')">Eliminar</button></div>`
  }).join('')||'<p>No hay clientes guardados.</p>';
}
function fillClientFromName(){
  const c=findClientByNamePhone($('woClient')?.value||''); if(!c)return;
  $('woClientId').value=c.id; $('woPhone').value=c.phone||''; $('woVehicle').value=c.vehicle||'';
}
function startWorkForClient(id){
  const c=state.clients.find(x=>String(x.id)===String(id)); if(!c)return;
  showPage('taller'); clearWorkOrderForm(); $('woClientId').value=c.id; $('woClient').value=c.name||''; $('woPhone').value=c.phone||''; $('woVehicle').value=c.vehicle||'';
}
function clearWorkOrderForm(){['woId','woClientId','woClient','woPhone','woVehicle','woCode','woReceived','woNotes'].forEach(id=>{if($(id))$(id).value=''}); if($('woStatus'))$('woStatus').value='Recibido';}
function saveWorkOrder(){
  let id=$('woId').value||Date.now().toString();
  let client=upsertClientFromData({id:$('woClientId')?.value,name:$('woClient').value,phone:$('woPhone').value,vehicle:$('woVehicle').value,notes:''});
  let old=state.workOrders.find(x=>String(x.id)===String(id));
  let history=old?.history||[]; const status=$('woStatus').value;
  if(!old || old.status!==status) history.push({date:new Date().toLocaleString(),status,notes:$('woNotes').value||''});
  let o={id,clientId:client?.id||'',client:$('woClient').value,phone:$('woPhone').value,vehicle:$('woVehicle').value,code:$('woCode').value||old?.code||('JM-'+id.slice(-5)),received:$('woReceived').value,type:$('woType').value,status,notes:$('woNotes').value,history,updated:new Date().toLocaleString()};
  state.workOrders=state.workOrders.filter(x=>String(x.id)!==String(id)); state.workOrders.push(o);
  save(); editWorkOrder(id); alert('Orden guardada. Código del cliente: '+o.code);
}
function editWorkOrder(id){
  const o=state.workOrders.find(x=>String(x.id)===String(id)); if(!o)return; showPage('taller');
  $('woId').value=o.id; $('woClientId').value=o.clientId||''; $('woClient').value=o.client||''; $('woPhone').value=o.phone||''; $('woVehicle').value=o.vehicle||''; $('woCode').value=o.code||''; $('woReceived').value=o.received||''; $('woType').value=o.type||'Reparación mecánica'; $('woStatus').value=o.status||'Recibido'; $('woNotes').value=o.notes||'';
}
function renderStatusTimeline(o){
  const steps=['Recibido','Diagnóstico','En reparación','En pintura','Rectificación','Motor','Listo','Entregado'];
  return `<div class="timeline">${steps.map(s=>`<span class="${s===o.status?'active':''}">${s}</span>`).join('')}</div>`;
}
function renderWorkOrders(){
  if(!$('workOrders'))return;
  $('workOrders').innerHTML=state.workOrders.slice().reverse().map(o=>`<div class="product-item"><b>${o.client}</b> · ${o.vehicle}<br>Código cliente: <b>${o.code}</b><br>Recibido: ${o.received||'-'} · Tipo: ${o.type}<br>Estado actual: <span class="status">${o.status}</span>${renderStatusTimeline(o)}<p>${o.notes||''}</p><small>Actualizado: ${o.updated}</small><br><button onclick="editWorkOrder('${o.id}')">Editar / actualizar estatus</button><button onclick="copyCode('${o.code}')">Copiar código</button></div>`).join('')||'<p>No hay órdenes registradas.</p>';
}
function copyCode(code){navigator.clipboard?.writeText(code); alert('Código copiado: '+code)}
function clientCheck(){
  let c=$('clientCodeInput').value.trim().toLowerCase(); let o=state.workOrders.find(x=>(x.code||'').toLowerCase()===c);
  $('clientResult').innerHTML=o?`<div class="product-item"><h3>${o.vehicle||'Trabajo registrado'}</h3><p>Cliente: ${o.client}</p><p>Trabajo: ${o.type}</p><p>Estado actual: <b>${o.status}</b></p>${renderStatusTimeline(o)}<h4>Historial del proceso</h4>${(o.history||[]).map(h=>`<div class="product-item"><b>${h.status}</b><br><small>${h.date}</small><p>${h.notes||''}</p></div>`).join('')||'<p>Sin movimientos todavía.</p>'}<small>Última actualización: ${o.updated}</small></div>`:'No encontramos ese código. Verifica con la tienda.';
}
function completeSale(){
  if(!state.cart.length)return alert('Agrega productos');
  const client=upsertClientFromData({name:$('posClient').value||'Cliente general'});
  let total=state.cart.reduce((s,i)=>s+i.price*i.qty,0);
  let inv={id:Date.now().toString(),date:new Date().toLocaleString(),clientId:client?.id||'',client:client?.name||$('posClient').value||'Cliente general',items:[...state.cart],total,rate:state.rate,payments:{usd:+$('payCashUsd').value||0,bs:+$('payCashBs').value||0,card:+$('payCard').value||0,mobile:+$('payMobile').value||0,binance:+$('payBinance').value||0,zelle:+$('payZelle').value||0}};
  inv.items.forEach(i=>{let p=state.products.find(x=>x.id===i.id);if(p)p.stock-=i.qty});
  state.invoices.push(inv); state.accounting.push({id:inv.id,date:inv.date,type:'ingreso',desc:'Venta factura '+inv.id+' - '+inv.client,amount:total});
  state.cart=[]; ['payCashUsd','payCashBs','payCard','payMobile','payBinance','payZelle','posClient'].forEach(id=>{if($(id))$(id).value=''}); save(); showPage('facturas');
}

/* ===================== FASE 4: CLIENTE DIRECTO EN PUNTO DE VENTA ===================== */
function fullClientName(c){return [c.name,c.lastName].filter(Boolean).join(' ').trim()||c.name||'Cliente'}
function openPOSClientModal(){
  if($('posClientModal')){$('posClientModal').classList.remove('hidden'); renderPOSClientPicker(); clearPOSClientForm();}
}
function closePOSClientModal(){ if($('posClientModal')) $('posClientModal').classList.add('hidden'); }
function clearPOSClientForm(){['posFormClientId','posFormName','posFormLastName','posFormDocument','posFormPhone','posFormAddress','posFormNotes'].forEach(id=>{if($(id))$(id).value=''})}
function renderPOSClientPicker(){
  const box=$('posClientPicker'); if(!box) return;
  const q=normalizeText($('posClientSearch')?.value||'');
  const rows=state.clients.filter(c=>normalizeText([c.name,c.lastName,c.document,c.phone,c.address,c.vehicle].join(' ')).includes(q));
  box.innerHTML=rows.map(c=>`<div class="picker-row"><div><b>${fullClientName(c)}</b><br><small>${c.document||'Sin RIF/CI'} · ${c.phone||'Sin teléfono'}<br>${c.address||''}</small></div><div><button onclick="selectPOSClient('${c.id}')">Elegir</button><button class="outline" onclick="loadPOSClientForm('${c.id}')">Editar</button></div></div>`).join('')||'<p>No hay clientes. Puedes crearlo abajo.</p>';
}
function loadPOSClientForm(id){
  const c=state.clients.find(x=>String(x.id)===String(id)); if(!c)return;
  $('posFormClientId').value=c.id; $('posFormName').value=c.name||''; $('posFormLastName').value=c.lastName||''; $('posFormDocument').value=c.document||''; $('posFormPhone').value=c.phone||''; $('posFormAddress').value=c.address||''; $('posFormNotes').value=c.notes||'';
}
function selectPOSClient(id){
  const c=state.clients.find(x=>String(x.id)===String(id)); if(!c)return;
  if($('posClientId')) $('posClientId').value=c.id;
  if($('posClient')) $('posClient').value=fullClientName(c);
  renderPOSClientSummary(c); closePOSClientModal();
}
function renderPOSClientSummary(c){
  const box=$('posClientSummary'); if(!box)return;
  if(!c){box.innerHTML='Ningún cliente seleccionado.'; return;}
  const inv=clientInvoices(c), ord=clientOrders(c);
  box.innerHTML=`<b>${fullClientName(c)}</b><br>RIF/CI: ${c.document||'-'} · Tel: ${c.phone||'-'}<br>Dirección: ${c.address||'-'}<br><small>Historial: ${inv.length} compra(s) · ${ord.length} trabajo(s)</small>`;
}
function clearPOSClient(){
  if($('posClientId'))$('posClientId').value=''; if($('posClient'))$('posClient').value=''; renderPOSClientSummary(null);
}
function selectPOSClientByName(){
  const name=$('posClient')?.value||''; const c=state.clients.find(x=>normalizeText(fullClientName(x))===normalizeText(name)||normalizeText(x.name)===normalizeText(name));
  if(c){$('posClientId').value=c.id; renderPOSClientSummary(c);} else {if($('posClientId'))$('posClientId').value=''; renderPOSClientSummary(null);}
}
function savePOSClientAndSelect(){
  const name=($('posFormName')?.value||'').trim();
  if(!name) return alert('Coloca por lo menos el nombre del cliente.');
  const id=$('posFormClientId')?.value||'';
  let c=upsertClientFromData({id,name,lastName:$('posFormLastName').value,document:$('posFormDocument').value,phone:$('posFormPhone').value,address:$('posFormAddress').value,notes:$('posFormNotes').value});
  if(c){c.lastName=$('posFormLastName').value||c.lastName||''; c.document=$('posFormDocument').value||c.document||''; c.address=$('posFormAddress').value||c.address||''; c.updated=new Date().toLocaleString(); save(); selectPOSClient(c.id); alert('Cliente guardado y seleccionado para la factura.');}
}
const _oldUpsertClientFromData=upsertClientFromData;
upsertClientFromData=function(data){
  const c=_oldUpsertClientFromData(data); if(c){ if(data.lastName!==undefined)c.lastName=data.lastName||''; if(data.document!==undefined)c.document=data.document||c.document||''; if(data.address!==undefined)c.address=data.address||c.address||''; }
  return c;
}
const _oldRenderClientOptions=renderClientOptions;
renderClientOptions=function(){
  const dl=$('clientDatalist'); if(!dl)return;
  dl.innerHTML=state.clients.map(c=>`<option value="${fullClientName(c).replaceAll('"','&quot;')}">${c.document||''} ${c.phone||''} ${c.vehicle||''}</option>`).join('');
}
const _oldCompleteSale=completeSale;
completeSale=function(){
  if(!state.cart.length)return alert('Agrega productos');
  let selected=state.clients.find(c=>String(c.id)===String($('posClientId')?.value||''));
  if(!selected && ($('posClient')?.value||'').trim()) selected=state.clients.find(c=>normalizeText(fullClientName(c))===normalizeText($('posClient').value));
  const client=selected || upsertClientFromData({name:$('posClient')?.value||'Cliente general'});
  let total=state.cart.reduce((s,i)=>s+i.price*i.qty,0);
  let inv={id:Date.now().toString(),date:new Date().toLocaleString(),clientId:client?.id||'',client:client?fullClientName(client):'Cliente general',clientDocument:client?.document||'',clientAddress:client?.address||'',items:[...state.cart],total,rate:state.rate,payments:{usd:+$('payCashUsd').value||0,bs:+$('payCashBs').value||0,card:+$('payCard').value||0,mobile:+$('payMobile').value||0,binance:+$('payBinance').value||0,zelle:+$('payZelle').value||0}};
  inv.items.forEach(i=>{let p=state.products.find(x=>x.id===i.id);if(p)p.stock-=i.qty});
  state.invoices.push(inv); state.accounting.push({id:inv.id,date:inv.date,type:'ingreso',desc:'Venta factura '+inv.id+' - '+inv.client,amount:total});
  state.cart=[]; ['payCashUsd','payCashBs','payCard','payMobile','payBinance','payZelle','posClient','posClientId'].forEach(id=>{if($(id))$(id).value=''}); renderPOSClientSummary(null); save(); showPage('facturas');
}
const _oldPrintOneInvoice=printOneInvoice;
printOneInvoice=function(id){
  let i=state.invoices.find(x=>x.id===id);let w=window.open('','_blank');
  w.document.write(`<h1>${state.config.companyName}</h1><img src="${logoUrl1872()}" width="220"><h2>Factura #${i.id}</h2><p>${i.date}</p><p><b>Cliente:</b> ${i.client}</p><p><b>RIF/CI:</b> ${i.clientDocument||'-'}</p><p><b>Dirección:</b> ${i.clientAddress||'-'}</p><table border=1 cellpadding=8>${i.items.map(x=>`<tr><td>${x.name}</td><td>${x.qty}</td><td>${money(x.price)}</td></tr>`).join('')}</table><h2>${money(i.total)} / ${bs(i.total*i.rate)}</h2>`);w.print();
}
const _oldRenderInvoices=renderInvoices;
renderInvoices=function(){
  $('invoiceList').innerHTML=state.invoices.slice().reverse().map(i=>`<div class="product-item"><b>Factura #${i.id}</b> · ${i.date}<br>Cliente: ${i.client}<br>RIF/CI: ${i.clientDocument||'-'}<br>Dirección: ${i.clientAddress||'-'}<br>Total: ${money(i.total)} / ${bs(i.total*i.rate)}<br><small>Pagos: ${JSON.stringify(i.payments)}</small><br><button onclick="printOneInvoice('${i.id}')">Imprimir factura</button></div>`).join('')||'<p>No hay facturas registradas.</p>';
}
const _oldRenderAll=renderAll;
renderAll=function(){_oldRenderAll(); renderPOSClientPicker(); const c=state.clients.find(x=>String(x.id)===String($('posClientId')?.value||'')); if(c)renderPOSClientSummary(c);}

/* ===================== FASE 5: FINALIZACION DE FACTURA CON PAGOS EDITABLES ===================== */
let currentPaymentDraft={method:'pago_movil',label:'Pago Móvil',currency:'VES',editIndex:null};
let pendingPayments=[]; let payMode='multiple';
const paymentLabels={binance:'Binance USDT',cuenta:'Cuenta por Cobrar',efectivo_usd:'Efectivo $',efectivo_bs:'Efectivo Bs',efectivo_eur:'Efectivo Euros',pago_movil:'Pago Móvil',pos_banesco:'PosVenta Banesco',zelle:'Zelle',tarjeta:'Tarjeta',transferencia:'Transferencia'};
function cartSubtotalUsd(){return state.cart.reduce((s,i)=>s+i.price*i.qty,0)}
function invoiceTotalUsdWithDelivery(){return cartSubtotalUsd()+Number($('deliveryAmount')?.value||0)}
function amountToUsd(amount,currency){amount=Number(amount||0); if(currency==='VES')return amount/Number(state.rate||1); if(currency==='EUR')return amount; return amount;}
function amountToBs(amount,currency){amount=Number(amount||0); if(currency==='VES')return amount; return amount*Number(state.rate||1);}
function setPayMode(m){payMode=m; $('tabSimple')?.classList.toggle('active',m==='simple'); $('tabMultiple')?.classList.toggle('active',m==='multiple'); if(m==='simple'&&pendingPayments.length>1)pendingPayments=pendingPayments.slice(0,1); renderPaymentLines(); recalcPaymentModal();}
function openPaymentModal(){
  if(!state.cart.length)return alert('Agrega productos');
  pendingPayments=[]; currentPaymentDraft={method:'pago_movil',label:'Pago Móvil',currency:'VES',editIndex:null};
  if($('deliveryAmount'))$('deliveryAmount').value=''; if($('deliveryNote'))$('deliveryNote').value=''; if($('payReferenceInput'))$('payReferenceInput').value=''; if($('payNoteInput'))$('payNoteInput').value='';
  $('paymentModal')?.classList.remove('hidden'); selectPaymentMethod('pago_movil','VES'); setPayMode('multiple'); recalcPaymentModal(); renderPaymentLines();
}
function closePaymentModal(){ $('paymentModal')?.classList.add('hidden'); }
function toggleDeliveryBox(){ $('deliveryBox')?.classList.toggle('hidden'); recalcPaymentModal(); }
function selectPaymentMethod(method,currency){
  currentPaymentDraft.method=method; currentPaymentDraft.label=paymentLabels[method]||method; currentPaymentDraft.currency=currency; currentPaymentDraft.editIndex=null;
  if($('selectedPayLabel'))$('selectedPayLabel').textContent=currentPaymentDraft.label+' ('+currency+')';
  document.querySelectorAll('.payment-method-grid button').forEach(b=>b.classList.remove('active'));
  const btn=[...document.querySelectorAll('.payment-method-grid button')].find(b=>b.textContent.includes(currentPaymentDraft.label)); if(btn)btn.classList.add('active');
  const total=invoiceTotalUsdWithDelivery(); const paid=pendingPayments.reduce((s,p)=>s+amountToUsd(p.amount,p.currency),0); const faltante=Math.max(total-paid,0);
  if($('payAmountInput')) $('payAmountInput').value= currency==='VES' ? Math.round(faltante*state.rate*100)/100 : Math.round(faltante*100)/100;
  recalcPaymentModal();
}
function clearPaymentDraft(){ currentPaymentDraft.editIndex=null; if($('payAmountInput'))$('payAmountInput').value=''; if($('payReferenceInput'))$('payReferenceInput').value=''; if($('payNoteInput'))$('payNoteInput').value=''; }
function addPaymentLine(){
  const amount=Number($('payAmountInput')?.value||0); if(amount<=0)return alert('Coloca el monto recibido.');
  const line={method:currentPaymentDraft.method,label:currentPaymentDraft.label,currency:currentPaymentDraft.currency,amount,reference:$('payReferenceInput')?.value||'',note:$('payNoteInput')?.value||''};
  if(payMode==='simple') pendingPayments=[];
  if(currentPaymentDraft.editIndex!==null && currentPaymentDraft.editIndex>=0) pendingPayments[currentPaymentDraft.editIndex]=line; else pendingPayments.push(line);
  clearPaymentDraft(); renderPaymentLines(); recalcPaymentModal();
}
function editPaymentLine(i){
  const p=pendingPayments[i]; if(!p)return; currentPaymentDraft={method:p.method,label:p.label,currency:p.currency,editIndex:i};
  if($('selectedPayLabel'))$('selectedPayLabel').textContent=p.label+' ('+p.currency+')'; if($('payAmountInput'))$('payAmountInput').value=p.amount; if($('payReferenceInput'))$('payReferenceInput').value=p.reference||''; if($('payNoteInput'))$('payNoteInput').value=p.note||'';
}
function deletePaymentLine(i){pendingPayments.splice(i,1); renderPaymentLines(); recalcPaymentModal();}
function renderPaymentLines(){
  const box=$('paymentLines'); if(!box)return;
  box.innerHTML=pendingPayments.map((p,i)=>`<div class="payment-line"><div><b>${p.label}</b> · ${p.currency}<br><small>Monto: ${p.currency==='VES'?bs(p.amount):money(p.amount)} ${p.reference?'· Ref: '+p.reference:''}</small></div><div><button onclick="editPaymentLine(${i})">Editar</button><button class="danger" onclick="deletePaymentLine(${i})">Quitar</button></div></div>`).join('')||'<p class="note">Todavía no agregaste pagos. Elige método, monto y presiona “Agregar / editar pago”.</p>';
}
function recalcPaymentModal(){
  const total=invoiceTotalUsdWithDelivery(), totalBs=total*Number(state.rate||1);
  const paidUsd=pendingPayments.reduce((s,p)=>s+amountToUsd(p.amount,p.currency),0), paidBs=paidUsd*Number(state.rate||1);
  const changeUsd=Math.max(paidUsd-total,0), changeBs=changeUsd*Number(state.rate||1);
  if($('payModalRate'))$('payModalRate').textContent=Number(state.rate||0).toFixed(2);
  if($('payTotalUsd'))$('payTotalUsd').textContent=money(total); if($('payTotalBs'))$('payTotalBs').textContent=bs(totalBs);
  if($('payPaidUsd'))$('payPaidUsd').textContent=money(paidUsd); if($('payPaidBs'))$('payPaidBs').textContent=bs(paidBs);
  if($('payChangeUsd'))$('payChangeUsd').textContent=money(changeUsd); if($('payChangeBs'))$('payChangeBs').textContent=bs(changeBs);
}
function completeSaleFromModal(){
  if(!state.cart.length)return alert('Agrega productos');
  if(!pendingPayments.length)return alert('Agrega por lo menos un pago.');
  const total=invoiceTotalUsdWithDelivery();
  const paid=pendingPayments.reduce((s,p)=>s+amountToUsd(p.amount,p.currency),0);
  if(paid+0.001<total && !confirm('El pago no completa el total. ¿Deseas dejarlo como cuenta por cobrar?')) return;
  let selected=state.clients.find(c=>String(c.id)===String($('posClientId')?.value||''));
  if(!selected && ($('posClient')?.value||'').trim()) selected=state.clients.find(c=>normalizeText(fullClientName(c))===normalizeText($('posClient').value));
  const client=selected || upsertClientFromData({name:$('posClient')?.value||'Cliente general'});
  const delivery=Number($('deliveryAmount')?.value||0);
  let inv={id:Date.now().toString(),date:new Date().toLocaleString(),clientId:client?.id||'',client:client?fullClientName(client):'Cliente general',clientDocument:client?.document||'',clientAddress:client?.address||'',items:[...state.cart],subtotal:cartSubtotalUsd(),delivery,deliveryNote:$('deliveryNote')?.value||'',total,rate:state.rate,payments:pendingPayments.map(p=>({...p})),paidUsd:paid,changeUsd:Math.max(paid-total,0)};
  inv.items.forEach(i=>{let p=state.products.find(x=>x.id===i.id);if(p)p.stock-=i.qty});
  state.invoices.push(inv); state.accounting.push({id:inv.id,date:inv.date,type:'ingreso',desc:'Venta factura '+inv.id+' - '+inv.client,amount:Math.min(paid,total)});
  state.cart=[]; pendingPayments=[]; ['payCashUsd','payCashBs','payCard','payMobile','payBinance','payZelle','posClient','posClientId'].forEach(id=>{if($(id))$(id).value=''}); renderPOSClientSummary(null); closePaymentModal(); save(); showPage('facturas');
}
completeSale=function(){openPaymentModal()}
const _fase5RenderInvoices=renderInvoices;
renderInvoices=function(){
  $('invoiceList').innerHTML=state.invoices.slice().reverse().map(i=>{let pays=Array.isArray(i.payments)?i.payments.map((p,idx)=>`${idx+1}. ${p.label||p.method}: ${p.currency==='VES'?bs(p.amount):money(p.amount)} ${p.reference?'Ref: '+p.reference:''}`).join('<br>'):JSON.stringify(i.payments||{});return `<div class="product-item"><b>Factura #${i.id}</b> · ${i.date}<br>Cliente: ${i.client}<br>RIF/CI: ${i.clientDocument||'-'}<br>Dirección: ${i.clientAddress||'-'}<br>Total: ${money(i.total)} / ${bs(i.total*i.rate)}<br>Pagado: ${money(i.paidUsd||i.total)} · Cambio: ${money(i.changeUsd||0)}<br><small>Pagos:<br>${pays}</small><br><button onclick="printOneInvoice('${i.id}')">Imprimir factura</button><button onclick="editInvoicePayments('${i.id}')">Editar pagos</button></div>`}).join('')||'<p>No hay facturas registradas.</p>';
}
function editInvoicePayments(id){
  const i=state.invoices.find(x=>String(x.id)===String(id)); if(!i)return;
  const raw=prompt('Editar pagos de la factura. Escribe un resumen o referencia nueva:', Array.isArray(i.payments)?i.payments.map(p=>`${p.label} ${p.amount} ${p.currency} ${p.reference||''}`).join(' | '):JSON.stringify(i.payments||{}));
  if(raw===null)return; i.paymentEditNote=raw; i.updatedPayments=new Date().toLocaleString(); save(); alert('Nota de pagos actualizada en la factura.');
}
const _fase5PrintOneInvoice=printOneInvoice;
printOneInvoice=function(id){
  let i=state.invoices.find(x=>x.id===id);let w=window.open('','_blank');
  const pays=Array.isArray(i.payments)?i.payments.map(p=>`<tr><td>${p.label||p.method}</td><td>${p.currency}</td><td>${p.currency==='VES'?bs(p.amount):money(p.amount)}</td><td>${p.reference||''}</td></tr>`).join(''):'';
  w.document.write(`<h1>${state.config.companyName}</h1><img src="${logoUrl1872()}" width="220"><h2>Factura #${i.id}</h2><p>${i.date}</p><p><b>Cliente:</b> ${i.client}</p><p><b>RIF/CI:</b> ${i.clientDocument||'-'}</p><p><b>Dirección:</b> ${i.clientAddress||'-'}</p><table border=1 cellpadding=8><tr><th>Producto</th><th>Cant.</th><th>Precio</th></tr>${i.items.map(x=>`<tr><td>${x.name}</td><td>${x.qty}</td><td>${money(x.price)}</td></tr>`).join('')}</table>${i.delivery?`<p>Delivery / cargo extra: ${money(i.delivery)} ${i.deliveryNote||''}</p>`:''}<h2>Total: ${money(i.total)} / ${bs(i.total*i.rate)}</h2><h3>Pagos</h3><table border=1 cellpadding=8><tr><th>Método</th><th>Moneda</th><th>Monto</th><th>Referencia</th></tr>${pays}</table><p>Pagado: ${money(i.paidUsd||i.total)} · Cambio: ${money(i.changeUsd||0)}</p>${i.paymentEditNote?`<p><b>Nota edición pagos:</b> ${i.paymentEditNote}</p>`:''}`);w.print();
}

/* ===================== FASE 6: LOGIN POR ROLES + ACCESO CLIENTE SIN CONTRASEÑA ===================== */
function selectAccessRole(role){
  const roleInput=$('roleSelect'); if(roleInput) roleInput.value=role;
  document.querySelectorAll('.access-card').forEach(b=>b.classList.toggle('active', b.dataset.role===role));
  const staff=$('staffLoginBox'), client=$('clientLoginBox'), user=$('userName');
  if(role==='cliente'){
    staff?.classList.add('hidden'); client?.classList.remove('hidden');
  }else{
    client?.classList.add('hidden'); staff?.classList.remove('hidden');
    const names={admin:'Administrador',vendedor:'Vendedor',almacen:'Almacén',taller:'Taller'};
    if(user) user.value=names[role]||'';
  }
}
function togglePassword(){ const p=$('userPassword'); if(p)p.type=p.type==='password'?'text':'password'; }
login=function(){
  let r=$('roleSelect')?.value||'admin';
  if(r==='cliente'){ clientCheckFromLogin(); return; }
  const pass=$('userPassword')?.value||'';
  const stored=(state.config&&state.config.passwords&&state.config.passwords[r])||'1234';
  if(pass!==stored){ alert('Usuario o contraseña incorrectos'); return; }
  $('login').classList.add('hidden'); $('app').classList.remove('hidden');
  $('currentRole').textContent='Usuario: '+(($('userName')?.value)||'')+' · Rol: '+r;
  applyRole(r); renderAll(); showPage('dashboard');
}
function clientCheckFromLogin(){
  const code=($('loginClientCode')?.value||'').trim();
  if(!code){alert('Coloca el código del trabajo.');return;}
  openClientPortal();
  if($('clientCodeInput')) $('clientCodeInput').value=code;
  clientCheck();
}
document.addEventListener('DOMContentLoaded',()=>selectAccessRole('admin'));

/* ===================== FASE 7: PRECIO DIVISA AL COSTO + CONTROL DE AUTORIZACIÓN ===================== */
let currentUserRole = 'admin';
const originalLoginFase7 = login;
login = function(){
  const roleBefore = $('roleSelect')?.value || 'admin';
  originalLoginFase7();
  if(!$('app')?.classList.contains('hidden')) currentUserRole = roleBefore;
};
function saleMode(){ return $('salePriceMode')?.value || 'venta'; }
function priceForProduct(p){
  const mode = saleMode();
  if(mode==='divisa_costo') return Number(p.cost || p.price || 0);
  if(mode==='mayorista') return Number(p.wholesale || p.price || 0);
  return Number(p.price || 0);
}
function priceModeLabel(mode=saleMode()){
  return {venta:'Venta normal',divisa_costo:'Divisa al costo / precio costo',mayorista:'Mayorista / precio especial',manual:'Precio manual por producto'}[mode] || 'Venta normal';
}
function changeSalePriceMode(){
  const mode=saleMode();
  if(mode==='divisa_costo' && currentUserRole!=='admin'){
    alert('Precio al costo protegido: solo Administrador puede activar venta en divisa al costo.');
    $('salePriceMode').value='venta';
  }
  const finalMode=saleMode();
  if($('salePriceModeNote')){
    $('salePriceModeNote').innerHTML = finalMode==='divisa_costo'
      ? '<b>Alerta:</b> esta factura usará el costo USD del producto. Queda registrada como venta al costo y sin ganancia.'
      : finalMode==='mayorista'
        ? 'Usa precio mayorista si el producto lo tiene. Si no tiene, usa precio venta.'
        : finalMode==='manual'
          ? 'Permite editar manualmente el precio de cada producto en el carrito.'
          : 'Venta normal: usa el precio de venta del producto.';
  }
  state.cart = state.cart.map(i=>{ const p=state.products.find(x=>x.id===i.id); return p?{...i, price: priceForProduct(p), priceMode: finalMode, cost:p.cost||0, normalPrice:p.price||0}:i; });
  renderProductsPOS(); renderCart(); recalcPaymentModal?.();
}
saveProduct = function(){
  let id=$('prodId').value||Date.now().toString();let f=$('prodImg').files[0];
  let done=img=>{let p={id,name:$('prodName').value,code:$('prodCode').value||id,category:$('prodCategory').value,brand:$('prodBrand').value,supplier:$('prodSupplier').value,location:$('prodLocation').value,cost:Number($('prodCost').value||0),price:Number($('prodPrice').value||0),wholesale:Number($('prodWholesale')?.value||0),stock:Number($('prodStock').value||0),min:Number($('prodMin').value||0),img:img||state.products.find(x=>x.id===id)?.img||''};state.products=state.products.filter(x=>x.id!==id);state.products.push(p);clearProductForm();save()};
  if(f){let reader=new FileReader();reader.onload=e=>done(e.target.result);reader.readAsDataURL(f)}else done();
};
editProduct = function(id){let p=state.products.find(x=>x.id===id);['Id','Name','Code','Category','Brand','Supplier','Location','Cost','Price','Stock','Min'].forEach(k=>{if($('prod'+k)) $('prod'+k).value=p[k.toLowerCase()]||''}); if($('prodWholesale')) $('prodWholesale').value=p.wholesale||''; showPage('inventario')};
clearProductForm = function(){['Id','Name','Code','Category','Brand','Supplier','Location','Cost','Price','Wholesale','Stock','Min'].forEach(k=>{if($('prod'+k)) $('prod'+k).value=''})};
renderProducts = function(){let html='<table class="table"><tr><th>Foto</th><th>Producto</th><th>Código</th><th>Ubicación</th><th>Stock</th><th>Precios</th><th></th></tr>';state.products.forEach(p=>html+=`<tr><td>${p.img?`<img class="thumb" src="${p.img}">`:''}</td><td>${p.name}<br><small>${p.category||''} · ${p.brand||''}</small></td><td>${p.code}</td><td>${p.location||''}</td><td><b class="${p.stock<=p.min?'status':''}">${p.stock}</b></td><td>Venta: ${money(p.price)}<br><small>Costo/divisa: ${money(p.cost)} · Mayorista: ${money(p.wholesale||p.price)}</small></td><td><button onclick="editProduct('${p.id}')">Editar</button><button class="danger" onclick="delProduct('${p.id}')">Eliminar</button></td></tr>`);$('productTable').innerHTML=html+'</table>'};
renderProductsPOS = function(){let q=($('searchProduct')?.value||'').toLowerCase();let mode=saleMode();$('posProducts').innerHTML=state.products.filter(p=>(p.name+p.code).toLowerCase().includes(q)).map(p=>`<div class="product-item">${p.img?`<img src="${p.img}">`:''}<b>${p.name}</b><br><small>${p.code}</small><p><b>${priceModeLabel(mode)}:</b><br>${money(priceForProduct(p))} / ${bs(priceForProduct(p)*state.rate)}</p><small>Venta normal: ${money(p.price)} · Costo: ${money(p.cost)}</small><br><button onclick="addCart('${p.id}')">Agregar</button></div>`).join('')};
addCart = function(id){let p=state.products.find(x=>x.id===id);let mode=saleMode();let item=state.cart.find(x=>x.id===id && x.priceMode===mode);if(item)item.qty++;else state.cart.push({id,qty:1,price:priceForProduct(p),name:p.name,priceMode:mode,cost:p.cost||0,normalPrice:p.price||0});renderCart()};
renderCart = function(){let total=state.cart.reduce((s,i)=>s+i.price*i.qty,0);$('cart').innerHTML=state.cart.map((i,idx)=>`<div class="product-item cart-line"><b>${i.name}</b> x <input class="mini-input" type="number" value="${i.qty}" min="1" onchange="updateCartQty(${idx},this.value)"> <br><small>${priceModeLabel(i.priceMode)} · Costo ref: ${money(i.cost)} · Venta normal: ${money(i.normalPrice)}</small><div class="cart-price-row">Precio usado: <input class="mini-input" type="number" value="${i.price}" step="0.01" ${saleMode()==='manual'?'':'disabled'} onchange="updateCartPrice(${idx},this.value)"> = <b>${money(i.price*i.qty)}</b> <button onclick="removeCart('${i.id}')">Quitar</button></div></div>`).join('');$('cartTotal').textContent=`Total: ${money(total)} / ${bs(total*state.rate)} · ${priceModeLabel()}`};
function updateCartQty(idx,val){state.cart[idx].qty=Number(val||1);renderCart();}
function updateCartPrice(idx,val){if(saleMode()!=='manual')return;state.cart[idx].price=Number(val||0);state.cart[idx].priceMode='manual';renderCart();}
const oldCompleteSaleFromModal = typeof completeSaleFromModal==='function' ? completeSaleFromModal : null;
completeSaleFromModal = function(){
  if(!state.cart.length)return alert('Agrega productos');
  const mode=saleMode();
  if(mode==='divisa_costo' && currentUserRole!=='admin'){ alert('Solo Administrador puede completar venta al costo.'); return; }
  const totalCost=state.cart.reduce((s,i)=>s+(Number(i.cost||0)*i.qty),0);
  const totalSale=state.cart.reduce((s,i)=>s+(Number(i.price||0)*i.qty),0);
  if(mode==='divisa_costo' && !confirm('Esta factura está en DIVISA AL COSTO. Quedará registrada sin ganancia. ¿Deseas continuar?')) return;
  oldCompleteSaleFromModal?.();
  const last=state.invoices[state.invoices.length-1];
  if(last){ last.priceMode=mode; last.priceModeLabel=priceModeLabel(mode); last.totalCost=totalCost; last.estimatedProfit=totalSale-totalCost; last.authorizedBy=currentUserRole; localStorage.setItem('jimmoreDB',JSON.stringify(state)); renderAll(); }
};
const oldRenderInvoicesF7 = renderInvoices;
renderInvoices = function(){
  $('invoiceList').innerHTML=state.invoices.slice().reverse().map(i=>`<div class="product-item"><b>Factura #${i.id}</b> · ${i.date}<br>Cliente: ${i.client}<br><span class="status">${i.priceModeLabel||'Venta normal'}</span><br>Total: ${money(i.total)} / ${bs(i.total*i.rate)}<br><small>Costo: ${money(i.totalCost||0)} · Ganancia estimada: ${money(i.estimatedProfit||0)} · Autorizó: ${i.authorizedBy||'-'}</small><br><button onclick="printOneInvoice('${i.id}')">Imprimir factura</button></div>`).join('')
};
const oldPrintOneInvoiceF7 = printOneInvoice;
printOneInvoice=function(id){let i=state.invoices.find(x=>x.id===id);let w=window.open('','_blank');const pays=Array.isArray(i.payments)?i.payments.map(p=>`<tr><td>${p.label||p.method}</td><td>${p.currency}</td><td>${p.currency==='VES'?bs(p.amount):money(p.amount)}</td><td>${p.reference||''}</td></tr>`).join(''):'';w.document.write(`<h1>${state.config.companyName}</h1><img src="${logoUrl1872()}" width="220"><h2>Factura #${i.id}</h2><p>${i.date}</p><p><b>Cliente:</b> ${i.client}</p><p><b>Tipo de precio:</b> ${i.priceModeLabel||'Venta normal'}</p><table border=1 cellpadding=8><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Modo</th></tr>${i.items.map(x=>`<tr><td>${x.name}</td><td>${x.qty}</td><td>${money(x.price)}</td><td>${priceModeLabel(x.priceMode)}</td></tr>`).join('')}</table><h2>Total: ${money(i.total)} / ${bs(i.total*i.rate)}</h2><h3>Pagos</h3><table border=1 cellpadding=8><tr><th>Método</th><th>Moneda</th><th>Monto</th><th>Referencia</th></tr>${pays}</table><p><small>Control interno: costo ${money(i.totalCost||0)} · ganancia estimada ${money(i.estimatedProfit||0)} · autorizó ${i.authorizedBy||'-'}</small></p>`);w.print();}

/* ===================== FASE 8: USUARIOS REALES + PERMISOS + AUDITORÍA ===================== */
function ensureUsersF8(){
  state.users = state.users || [
    {id:'u-admin', username:'admin', name:'Administrador', role:'admin', password:'1234', active:true},
    {id:'u-vendedor', username:'vendedor', name:'Vendedor', role:'vendedor', password:'1234', active:true},
    {id:'u-almacen', username:'almacen', name:'Almacén', role:'almacen', password:'1234', active:true},
    {id:'u-taller', username:'taller', name:'Mecánico / Taller', role:'taller', password:'1234', active:true},
    {id:'u-pintor', username:'pintor', name:'Pintor', role:'pintor', password:'1234', active:true}
  ];
  state.audit = state.audit || [];
  localStorage.setItem('jimmoreDB',JSON.stringify(state));
}
ensureUsersF8();
let currentUserF8 = null;
function addAudit(action, detail){
  ensureUsersF8();
  state.audit.unshift({id:Date.now().toString(),date:new Date().toLocaleString(),user:currentUserF8?.username||'sistema',role:currentUserF8?.role||'',action,detail:detail||''});
  state.audit = state.audit.slice(0,250);
  localStorage.setItem('jimmoreDB',JSON.stringify(state));
}
function selectAccessRoleFinal(){
  const role=$('roleSelect')?.value||'admin';
  const staff=$('staffLoginBox'), client=$('clientLoginBox'), user=$('userName'), pass=$('userPassword');
  if(role==='cliente'){
    staff?.classList.add('hidden'); client?.classList.remove('hidden');
  }else{
    client?.classList.add('hidden'); staff?.classList.remove('hidden');
    const defaultUser={admin:'admin',vendedor:'vendedor',almacen:'almacen',taller:'taller',pintor:'pintor'}[role]||'admin';
    if(user) user.value=defaultUser;
    if(pass) pass.value='';
  }
}
function togglePasswordFinal(){ const p=$('userPassword'); if(p) p.type=p.type==='password'?'text':'password'; }
function roleLabelF8(r){return {admin:'Administrador',vendedor:'Vendedor',almacen:'Almacén',taller:'Mecánico / Taller',pintor:'Pintor',cliente:'Cliente'}[r]||r}
login=function(){
  ensureUsersF8();
  const role=$('roleSelect')?.value||'admin';
  if(role==='cliente'){ clientCheckFromLoginFinal(); return; }
  const username=($('userName')?.value||'').trim().toLowerCase();
  const pass=($('userPassword')?.value||'').trim();
  const u=state.users.find(x=>String(x.username||'').toLowerCase()===username && x.role===role && x.active!==false);
  if(!u || String(u.password)!==pass){ alert('Usuario o contraseña incorrectos'); return; }
  currentUserF8=u; currentUserRole=role;
  $('login').classList.add('hidden'); $('app').classList.remove('hidden');
  $('currentRole').textContent='Usuario: '+u.name+' · Rol: '+roleLabelF8(role);
  applyRole(role); addAudit('Inicio de sesión','Entró al sistema'); renderAll(); showPage('dashboard');
}
function clientCheckFromLoginFinal(){
  const code=($('loginClientCode')?.value||'').trim();
  if(!code){alert('Coloca el código del trabajo.');return;}
  openClientPortal(); if($('clientCodeInput')) $('clientCodeInput').value=code; clientCheck();
}
logout=function(){ addAudit('Cerrar sesión','Salió del sistema'); currentUserF8=null; $('app').classList.add('hidden'); $('login').classList.remove('hidden'); selectAccessRoleFinal(); }
applyRole=function(r){
  document.querySelectorAll('.sidebar button').forEach(b=>b.style.display='block');
  const hidePages=(pages)=>pages.forEach(p=>{let b=document.querySelector(`[data-page="${p}"]`);if(b)b.style.display='none'});
  if(r==='vendedor') hidePages(['inventario','contabilidad','config']);
  if(r==='almacen') hidePages(['pos','facturas','contabilidad','config','clientes','taller']);
  if(r==='taller') hidePages(['pos','facturas','inventario','contabilidad','config','reportes','verificador']);
  if(r==='pintor') hidePages(['pos','facturas','inventario','contabilidad','config','reportes','verificador','clientes']);
}
function saveSystemUser(){
  ensureUsersF8();
  if(currentUserRole!=='admin'){alert('Solo administrador puede crear o modificar usuarios.');return;}
  const username=($('newUserName')?.value||'').trim().toLowerCase(), password=($('newUserPass')?.value||'').trim(), role=$('newUserRole')?.value||'vendedor';
  if(!username||!password)return alert('Coloca usuario y contraseña.');
  let u=state.users.find(x=>x.username===username);
  if(u){u.password=password;u.role=role;u.name=username;u.active=true}else state.users.push({id:Date.now().toString(),username,name:username,role,password,active:true});
  addAudit('Usuario guardado','Usuario: '+username+' · Rol: '+roleLabelF8(role));
  save(); renderUsers(); alert('Usuario guardado.');
}
function toggleUserActive(id){
  if(currentUserRole!=='admin'){alert('Solo administrador.');return;}
  const u=state.users.find(x=>x.id===id); if(!u)return;
  u.active=!u.active; addAudit('Usuario activado/desactivado',u.username+' · activo: '+u.active); save(); renderUsers();
}
function renderUsers(){
  const box=$('usersList'); if(!box)return; ensureUsersF8();
  box.innerHTML=state.users.map(u=>`<div class="product-item"><b>${u.name||u.username}</b><span class="role-badge">${roleLabelF8(u.role)}</span><br>Usuario: ${u.username}<br>Estado: ${u.active!==false?'Activo':'Bloqueado'}<br><button onclick="toggleUserActive('${u.id}')">${u.active!==false?'Bloquear':'Activar'}</button></div>`).join('');
}
function renderAudit(){
  const box=$('auditList'); if(!box)return; ensureUsersF8();
  box.innerHTML=state.audit.slice(0,80).map(a=>`<div class="audit-item"><b>${a.action}</b><span class="role-badge">${roleLabelF8(a.role)}</span><br>${a.detail||''}<br><small>${a.date} · ${a.user}</small></div>`).join('')||'<p>No hay movimientos todavía.</p>';
}
const oldRenderAllF8=renderAll;
renderAll=function(){oldRenderAllF8(); renderUsers(); renderAudit();}
const oldSaveProductF8=saveProduct;
saveProduct=function(){ oldSaveProductF8(); addAudit('Producto guardado','Se creó o editó producto'); }
const oldDelProductF8=delProduct;
delProduct=function(id){ const p=state.products.find(x=>x.id===id); oldDelProductF8(id); addAudit('Producto eliminado',p?.name||id); }
const oldSaveWorkOrderF8=saveWorkOrder;
saveWorkOrder=function(){ oldSaveWorkOrderF8(); addAudit('Orden de trabajo guardada','Se creó o actualizó una orden de taller'); }
const oldCompleteSaleFromModalF8=completeSaleFromModal;
completeSaleFromModal=function(){ const before=state.invoices.length; oldCompleteSaleFromModalF8(); if(state.invoices.length>before){ const last=state.invoices[state.invoices.length-1]; last.user=currentUserF8?.username||''; last.userRole=currentUserF8?.role||''; addAudit('Factura completada','Factura #'+last.id+' · '+(last.priceModeLabel||'Venta normal')+' · Total '+money(last.total)); localStorage.setItem('jimmoreDB',JSON.stringify(state)); renderAll(); } }
const oldRenderInvoicesF8=renderInvoices;
renderInvoices=function(){
  oldRenderInvoicesF8();
  document.querySelectorAll('#invoiceList .product-item').forEach((el,idx)=>{ const inv=state.invoices.slice().reverse()[idx]; if(inv) el.innerHTML += `<br><small>Usuario: ${inv.user||inv.authorizedBy||'-'} · Rol: ${roleLabelF8(inv.userRole||'')}</small>`; });
}
document.addEventListener('DOMContentLoaded',()=>{ensureUsersF8();selectAccessRoleFinal();renderUsers();});

/* ===================== FASE 9 PRO: FACTURA CLIENTE / INTERNA + CAJA + QR ===================== */
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));}
function paymentRowsClient(i){
  if(!Array.isArray(i.payments)) return '<tr><td colspan="3">Pago registrado</td></tr>';
  return i.payments.map(p=>`<tr><td>${escapeHtml(p.label||p.method)}</td><td>${escapeHtml(p.currency||'')}</td><td>${p.currency==='VES'?bs(p.amount):money(p.amount)}</td></tr>`).join('');
}
function paymentRowsInternal(i){
  if(!Array.isArray(i.payments)) return '<tr><td colspan="5">'+escapeHtml(JSON.stringify(i.payments||{}))+'</td></tr>';
  return i.payments.map(p=>`<tr><td>${escapeHtml(p.label||p.method)}</td><td>${escapeHtml(p.currency||'')}</td><td>${p.currency==='VES'?bs(p.amount):money(p.amount)}</td><td>${escapeHtml(p.reference||'')}</td><td>${escapeHtml(p.note||'')}</td></tr>`).join('');
}
function invoiceItemRowsClient(i){
  return (i.items||[]).map(x=>`<tr><td>${escapeHtml(x.name)}</td><td>${x.qty}</td><td>${money(x.price)}</td><td>${money(x.price*x.qty)}</td></tr>`).join('');
}
function invoiceItemRowsInternal(i){
  return (i.items||[]).map(x=>{
    const p=state.products.find(prod=>String(prod.id)===String(x.id))||{};
    const cost=Number(x.cost ?? p.cost ?? 0);
    const gain=(Number(x.price||0)-cost)*Number(x.qty||0);
    return `<tr><td>${escapeHtml(x.name)}</td><td>${x.qty}</td><td>${money(cost)}</td><td>${money(x.price)}</td><td>${money(gain)}</td></tr>`;
  }).join('');
}
function invoiceHtmlClient(i){
  const cfg=state.config||{};
  const verifyUrl='Código: '+i.id;
  return `<!doctype html><html><head><meta charset="utf-8"><title>Factura ${i.id}</title><style>
    body{font-family:Arial,sans-serif;margin:0;background:#f5f7fb;color:#111}.invoice{max-width:850px;margin:20px auto;background:white;padding:28px;border-radius:18px;box-shadow:0 10px 30px #0002}.head{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:16px}.logo{max-width:150px;max-height:110px;object-fit:contain}.muted{color:#555;font-size:13px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}.box{border:1px solid #ddd;border-radius:12px;padding:12px}table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#111;color:#fff}td,th{padding:10px;border:1px solid #ddd;text-align:left}.total{font-size:24px;text-align:right;margin-top:18px}.qr{border:1px solid #ddd;width:120px;height:120px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:11px}.printbar{text-align:center;margin:16px}.printbar button{padding:12px 20px;border:0;border-radius:10px;background:#111;color:white;font-weight:bold}@media print{.printbar{display:none}body{background:white}.invoice{box-shadow:none;margin:0;max-width:none;border-radius:0}}</style></head><body><div class="printbar"><button onclick="window.print()">Imprimir para cliente</button></div><div class="invoice">
    <div class="head"><div><img class="logo" src="${logoUrl1872()}"><h2>${escapeHtml(cfg.companyName||'Inversiones Jimmore')}</h2><div class="muted">RIF: ${escapeHtml(cfg.rif||'Pendiente')}<br>${escapeHtml(cfg.address||'Dirección pendiente')}<br>${escapeHtml(cfg.phone||'Teléfono pendiente')}</div></div><div><h1>FACTURA</h1><b>#${escapeHtml(i.id)}</b><br><span class="muted">${escapeHtml(i.date||'')}</span><div class="qr">${escapeHtml(verifyUrl)}</div></div></div>
    <div class="grid"><div class="box"><b>Cliente</b><br>${escapeHtml(i.client||'Cliente general')}<br>RIF/CI: ${escapeHtml(i.clientDocument||'-')}<br>Dirección: ${escapeHtml(i.clientAddress||'-')}</div><div class="box"><b>Moneda</b><br>USD y Bs<br>Tasa BCV usada: ${Number(i.rate||state.rate||0).toFixed(2)}<br>Tipo: ${escapeHtml(i.saleModeLabel||i.priceMode||'Venta normal')}</div></div>
    <table><tr><th>Producto / servicio</th><th>Cant.</th><th>Precio</th><th>Total</th></tr>${invoiceItemRowsClient(i)}</table>
    ${i.delivery?`<p><b>Delivery / cargo extra:</b> ${money(i.delivery)} ${escapeHtml(i.deliveryNote||'')}</p>`:''}
    <div class="total"><b>Total USD:</b> ${money(i.total)}<br><b>Total Bs:</b> ${bs(i.total*i.rate)}</div>
    <h3>Pagos</h3><table><tr><th>Método</th><th>Moneda</th><th>Monto</th></tr>${paymentRowsClient(i)}</table>
    <p class="muted">Gracias por su compra. Documento emitido por el sistema Inversiones Jimmore.</p>
  </div></body></html>`;
}
function invoiceHtmlInternal(i){
  const cfg=state.config||{};
  const gain=(i.items||[]).reduce((s,x)=>{const p=state.products.find(prod=>String(prod.id)===String(x.id))||{};const cost=Number(x.cost ?? p.cost ?? 0);return s+(Number(x.price||0)-cost)*Number(x.qty||0)},0);
  return `<!doctype html><html><head><meta charset="utf-8"><title>Factura interna ${i.id}</title><style>
    body{font-family:Arial,sans-serif;margin:0;background:#eef2f7;color:#111}.invoice{max-width:950px;margin:20px auto;background:white;padding:28px;border-radius:18px;box-shadow:0 10px 30px #0002}.internal{background:#fff4d6;border:1px solid #e2b94c;border-radius:12px;padding:12px;margin:14px 0}table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#222;color:#fff}td,th{padding:9px;border:1px solid #ddd;text-align:left}.printbar{text-align:center;margin:16px}.printbar button{padding:12px 20px;border:0;border-radius:10px;background:#111;color:white;font-weight:bold}.danger{color:#b00020;font-weight:bold}@media print{.printbar{display:none}body{background:white}.invoice{box-shadow:none;margin:0;max-width:none;border-radius:0}}</style></head><body><div class="printbar"><button onclick="window.print()">Imprimir interno</button></div><div class="invoice">
    <h1>${escapeHtml(cfg.companyName||'Inversiones Jimmore')}</h1><h2>Factura interna #${escapeHtml(i.id)}</h2><p>${escapeHtml(i.date||'')}</p>
    <div class="internal"><b>CONTROL INTERNO - NO ENTREGAR AL CLIENTE</b><br>Usuario: ${escapeHtml(i.user||$('userName')?.value||'Sistema')}<br>Tipo precio: ${escapeHtml(i.saleModeLabel||i.priceMode||'Venta normal')}<br>Ganancia estimada: <span class="danger">${money(gain)}</span><br>Pagado: ${money(i.paidUsd||i.total)} · Cambio: ${money(i.changeUsd||0)}<br>Auditoría: ${escapeHtml(i.auditNote||'Factura generada desde POS')}</div>
    <p><b>Cliente:</b> ${escapeHtml(i.client||'')} · RIF/CI: ${escapeHtml(i.clientDocument||'-')}</p>
    <table><tr><th>Producto</th><th>Cant.</th><th>Costo</th><th>Venta</th><th>Ganancia</th></tr>${invoiceItemRowsInternal(i)}</table>
    <h2>Total: ${money(i.total)} / ${bs(i.total*i.rate)}</h2>
    <h3>Pagos detallados</h3><table><tr><th>Método</th><th>Moneda</th><th>Monto</th><th>Referencia</th><th>Nota</th></tr>${paymentRowsInternal(i)}</table>
  </div></body></html>`;
}
function openInvoiceWindow(html){const w=window.open('','_blank');w.document.open();w.document.write(html);w.document.close();}
printOneInvoice=function(id){const i=state.invoices.find(x=>String(x.id)===String(id)); if(!i)return alert('Factura no encontrada'); openInvoiceWindow(invoiceHtmlClient(i));}
function printInternalInvoice(id){const i=state.invoices.find(x=>String(x.id)===String(id)); if(!i)return alert('Factura no encontrada'); openInvoiceWindow(invoiceHtmlInternal(i));}
function renderCashControl(){
  const totals={usd:0,ves:0,zelle:0,binance:0,tarjeta:0,pago_movil:0,cuenta:0,otros:0};
  state.invoices.forEach(i=>{(Array.isArray(i.payments)?i.payments:[]).forEach(p=>{const m=p.method||''; const usd=amountToUsd(p.amount,p.currency); if(m.includes('zelle'))totals.zelle+=usd; else if(m.includes('binance'))totals.binance+=usd; else if(m.includes('tarjeta')||m.includes('pos'))totals.tarjeta+=usd; else if(m.includes('pago_movil')||m.includes('transferencia'))totals.pago_movil+=usd; else if(m.includes('cuenta'))totals.cuenta+=usd; else if(m.includes('efectivo_usd'))totals.usd+=usd; else if(m.includes('efectivo_bs'))totals.ves+=amountToBs(p.amount,p.currency); else totals.otros+=usd;});});
  return `<div class="cards"><div class="card"><h3>Efectivo USD</h3><strong>${money(totals.usd)}</strong></div><div class="card"><h3>Efectivo Bs</h3><strong>${bs(totals.ves)}</strong></div><div class="card"><h3>Pago móvil / Transf.</h3><strong>${money(totals.pago_movil)}</strong></div><div class="card"><h3>Zelle</h3><strong>${money(totals.zelle)}</strong></div><div class="card"><h3>Binance</h3><strong>${money(totals.binance)}</strong></div><div class="card"><h3>Tarjeta / POS</h3><strong>${money(totals.tarjeta)}</strong></div><div class="card"><h3>Cuentas por cobrar</h3><strong>${money(totals.cuenta)}</strong></div></div>`;
}
const _fase9CompleteSaleFromModal=completeSaleFromModal;
completeSaleFromModal=function(){
  if(!state.cart.length)return alert('Agrega productos');
  const before=state.invoices.length;
  _fase9CompleteSaleFromModal();
  if(state.invoices.length>before){
    const inv=state.invoices[state.invoices.length-1];
    inv.user=$('userName')?.value||'Sistema';
    inv.priceMode=$('salePriceMode')?.value||'venta';
    inv.saleModeLabel=$('salePriceMode')?.selectedOptions?.[0]?.textContent||'Venta normal';
    inv.auditNote='Factura creada. Vista cliente oculta costos, ganancias y control interno.';
    save();
  }
}
renderInvoices=function(){
  const box=$('invoiceList'); if(!box)return;
  box.innerHTML='<div class="panel"><h3>Control de caja por método</h3>'+renderCashControl()+'</div>'+ (state.invoices.slice().reverse().map(i=>{let pays=Array.isArray(i.payments)?i.payments.map((p,idx)=>`${idx+1}. ${escapeHtml(p.label||p.method)}: ${p.currency==='VES'?bs(p.amount):money(p.amount)} ${p.reference?'Ref: '+escapeHtml(p.reference):''}`).join('<br>'):escapeHtml(JSON.stringify(i.payments||{}));return `<div class="product-item"><b>Factura #${escapeHtml(i.id)}</b> · ${escapeHtml(i.date)}</br>Cliente: ${escapeHtml(i.client)}<br>RIF/CI: ${escapeHtml(i.clientDocument||'-')}<br>Dirección: ${escapeHtml(i.clientAddress||'-')}<br>Total: ${money(i.total)} / ${bs(i.total*i.rate)}<br><small>Pagos:<br>${pays}</small><br><button onclick="printOneInvoice('${i.id}')">Imprimir para cliente</button><button class="outline" onclick="printInternalInvoice('${i.id}')">Ver factura interna</button><button onclick="editInvoicePayments('${i.id}')">Editar pagos</button></div>`}).join('')||'<p>No hay facturas registradas.</p>');
}
const _fase9ClientCheck=clientCheck;
clientCheck=function(){
  let c=$('clientCodeInput').value.trim().toLowerCase(); let o=state.workOrders.find(x=>(x.code||'').toLowerCase()===c);
  $('clientResult').innerHTML=o?`<div class="product-item"><h3>${escapeHtml(o.vehicle||'Trabajo registrado')}</h3><p>Cliente: ${escapeHtml(o.client)}</p><p>Trabajo: ${escapeHtml(o.type)}</p><p>Fecha recibido: ${escapeHtml(o.received||'-')}</p><p>Estado actual: <b>${escapeHtml(o.status)}</b></p>${renderStatusTimeline(o)}<h4>Historial del proceso</h4>${(o.history||[]).map(h=>`<div class="product-item"><b>${escapeHtml(h.status)}</b><br><small>${escapeHtml(h.date)}</small><p>${escapeHtml(h.notes||'')}</p></div>`).join('')||'<p>Sin movimientos todavía.</p>'}<small>Última actualización: ${escapeHtml(o.updated)}</small></div>`:'No encontramos ese código. Verifica con la tienda.';
}

/* ===================== FASE 10: HISTORIAL POR VENDEDOR + PERMISOS REALES ===================== */
function isAdminF10(){ return (currentUserF8?.role||'') === 'admin'; }
function isSellerF10(){ return (currentUserF8?.role||'') === 'vendedor'; }
function currentUsernameF10(){ return currentUserF8?.username || ($('userName')?.value||''); }
function invoicesAllowedF10(){
  const user=currentUsernameF10();
  if(isAdminF10()) return state.invoices||[];
  if(isSellerF10()) return (state.invoices||[]).filter(i=>(i.user||'')===user);
  return (state.invoices||[]).filter(i=>(i.user||'')===user);
}
function clientsAllowedF10(){
  const user=currentUsernameF10();
  if(isAdminF10()) return state.clients||[];
  // Cliente atendido por vendedor en factura o creado por ese usuario
  const clientNames=new Set(invoicesAllowedF10().map(i=>(i.client||'').toLowerCase()));
  return (state.clients||[]).filter(c=>(c.createdBy||'')===user || clientNames.has((c.name||'').toLowerCase()));
}
const oldApplyRoleF10 = applyRole;
applyRole = function(r){
  oldApplyRoleF10(r);
  // Mi historial visible para vendedor y administrador. Oculto para almacén/taller/pintor.
  const btn=document.querySelector('[data-page="miHistorial"]');
  if(btn) btn.style.display = (r==='admin'||r==='vendedor') ? 'block' : 'none';
  if(r==='vendedor'){
    hidePages(['inventario','contabilidad','config','reportes']);
  }
};
const oldSaveSystemUserF10 = saveSystemUser;
saveSystemUser = function(){
  const before=(state.users||[]).length;
  oldSaveSystemUserF10();
  const username=($('newUserName')?.value||'').trim().toLowerCase();
  const u=(state.users||[]).find(x=>x.username===username);
  if(u && (state.users||[]).length>=before){
    u.createdAt=u.createdAt||new Date().toLocaleString();
    u.createdBy=currentUsernameF10()||'admin';
    localStorage.setItem('jimmoreDB',JSON.stringify(state));
  }
};
const oldSaveClientF10 = saveClient;
saveClient = function(){
  oldSaveClientF10();
  const last=(state.clients||[])[(state.clients||[]).length-1];
  if(last && !last.createdBy){
    last.createdBy=currentUsernameF10()||'admin';
    last.createdAt=new Date().toLocaleString();
    localStorage.setItem('jimmoreDB',JSON.stringify(state));
  }
};
function sellerTotalsF10(list){
  const total=list.reduce((s,i)=>s+Number(i.total||0),0);
  const count=list.length;
  const today=new Date().toLocaleDateString();
  const todayTotal=list.filter(i=>(i.date||'').includes(today)).reduce((s,i)=>s+Number(i.total||0),0);
  const payments={};
  list.forEach(i=>{(Array.isArray(i.payments)?i.payments:[]).forEach(p=>{const k=(p.label||p.method||'Pago').toString(); payments[k]=(payments[k]||0)+Number(p.amount||0);});});
  return {total,count,todayTotal,payments};
}
function renderSellerHistoryF10(){
  const box=$('sellerHistoryList'); if(!box) return;
  const list=invoicesAllowedF10().slice().reverse();
  const t=sellerTotalsF10(list);
  const cards=$('sellerSummaryCards');
  if(cards){
    cards.innerHTML=`<div class="card"><h3>${isAdminF10()?'Ventas generales':'Mis ventas'}</h3><strong>${t.count}</strong><span>Facturas</span></div><div class="card"><h3>${isAdminF10()?'Total vendido':'Mi total vendido'}</h3><strong>${money(t.total)}</strong><span>${bs(t.total*state.rate)}</span></div><div class="card"><h3>Hoy</h3><strong>${money(t.todayTotal)}</strong><span>${bs(t.todayTotal*state.rate)}</span></div><div class="card"><h3>Usuario</h3><strong>${escapeHtml(currentUsernameF10()||'admin')}</strong><span>${escapeHtml(roleLabelF8(currentUserF8?.role||'admin'))}</span></div>`;
  }
  box.innerHTML=list.map(i=>{
    const pays=Array.isArray(i.payments)?i.payments.map((p,idx)=>`${idx+1}. ${escapeHtml(p.label||p.method)}: ${p.currency==='VES'?bs(p.amount):money(p.amount)} ${p.reference?'Ref: '+escapeHtml(p.reference):''}`).join('<br>'):'Sin pagos detallados';
    return `<div class="product-item"><b>Factura #${escapeHtml(i.id)}</b> · ${escapeHtml(i.date||'')}<br>Cliente: ${escapeHtml(i.client||'Cliente general')}<br>Total: ${money(i.total)} / ${bs(i.total*i.rate)}<br><small>Pagos:<br>${pays}</small><br><button onclick="printOneInvoice('${i.id}')">Imprimir cliente</button>${isAdminF10()?`<button class="outline" onclick="printInternalInvoice('${i.id}')">Factura interna</button>`:''}</div>`;
  }).join('') || '<p>No hay ventas para este usuario todavía.</p>';
}
const oldRenderDashboardF10 = renderDashboard;
renderDashboard = function(){
  oldRenderDashboardF10();
  if(!isAdminF10()){
    const list=invoicesAllowedF10(); const total=list.reduce((s,i)=>s+Number(i.total||0),0);
    if($('todayIncome')) $('todayIncome').textContent=money(total);
    if($('todayIncomeBs')) $('todayIncomeBs').textContent=bs(total*state.rate);
    if($('salesCount')) $('salesCount').textContent=list.length;
    const cc=clientsAllowedF10().length; if($('clientCount')) $('clientCount').textContent=cc;
  }
};
const oldRenderInvoicesF10 = renderInvoices;
renderInvoices = function(){
  const box=$('invoiceList'); if(!box) return;
  if(isAdminF10()) return oldRenderInvoicesF10();
  const list=invoicesAllowedF10().slice().reverse();
  box.innerHTML='<div class="panel"><h3>Mis facturas</h3><p class="note">Solo ves tus ventas. Las ganancias, costos y caja general están protegidos para administrador.</p></div>'+ (list.map(i=>{let pays=Array.isArray(i.payments)?i.payments.map((p,idx)=>`${idx+1}. ${escapeHtml(p.label||p.method)}: ${p.currency==='VES'?bs(p.amount):money(p.amount)} ${p.reference?'Ref: '+escapeHtml(p.reference):''}`).join('<br>'):escapeHtml(JSON.stringify(i.payments||{}));return `<div class="product-item"><b>Factura #${escapeHtml(i.id)}</b> · ${escapeHtml(i.date)}</br>Cliente: ${escapeHtml(i.client)}<br>Total: ${money(i.total)} / ${bs(i.total*i.rate)}<br><small>Pagos:<br>${pays}</small><br><button onclick="printOneInvoice('${i.id}')">Imprimir para cliente</button><button onclick="editInvoicePayments('${i.id}')">Editar pagos</button></div>`}).join('')||'<p>No tienes facturas registradas.</p>');
};
const oldPrintInternalInvoiceF10 = printInternalInvoice;
printInternalInvoice = function(id){
  if(!isAdminF10()){ alert('Solo el administrador puede ver costos, ganancias y factura interna.'); return; }
  oldPrintInternalInvoiceF10(id);
};
const oldRenderReportsF10 = renderReports;
renderReports = function(){
  if(isAdminF10()) return oldRenderReportsF10();
  const list=invoicesAllowedF10(); const total=list.reduce((s,i)=>s+Number(i.total||0),0);
  if($('reportsBox')) $('reportsBox').textContent='MI REPORTE DE VENDEDOR\n\nFacturas: '+list.length+'\nTotal vendido: '+money(total)+' / '+bs(total*state.rate)+'\n\nNota: Las ganancias generales, costos y ventas de otros vendedores están ocultas.';
};
function renderSellerRankingF10(){
  if(!isAdminF10()) return '';
  const users=(state.users||[]).filter(u=>u.role==='vendedor');
  const rows=users.map(u=>{const list=(state.invoices||[]).filter(i=>i.user===u.username);const total=list.reduce((s,i)=>s+Number(i.total||0),0);return {user:u.username,total,count:list.length};}).sort((a,b)=>b.total-a.total);
  return `<div class="panel"><h3>Ranking de vendedores</h3><table class="table"><tr><th>Vendedor</th><th>Facturas</th><th>Total</th></tr>${rows.map(r=>`<tr><td>${escapeHtml(r.user)}</td><td>${r.count}</td><td>${money(r.total)} / ${bs(r.total*state.rate)}</td></tr>`).join('')}</table></div>`;
}
const oldRenderAllF10 = renderAll;
renderAll = function(){
  oldRenderAllF10();
  renderSellerHistoryF10();
  const dash=document.querySelector('#dashboard .grid2');
  if(dash && isAdminF10() && !document.getElementById('sellerRankingF10')){
    const div=document.createElement('div'); div.id='sellerRankingF10'; div.innerHTML=renderSellerRankingF10(); dash.after(div);
  } else if(document.getElementById('sellerRankingF10')) document.getElementById('sellerRankingF10').innerHTML=renderSellerRankingF10();
};

/* ===================== FASE 11: CIERRE DE CAJA + CUENTAS POR COBRAR + HISTORIAL POR VEHÍCULO ===================== */
state.cashClosings = state.cashClosings || [];
state.accountsReceivable = state.accountsReceivable || [];
state.vehicles = state.vehicles || [];
localStorage.setItem('jimmoreDB', JSON.stringify(state));
function todayISOF11(){ return new Date().toISOString().slice(0,10); }
function invoiceISODateF11(inv){
  if(inv.isoDate) return inv.isoDate;
  const d = inv.createdAt ? new Date(inv.createdAt) : new Date(inv.date||Date.now());
  if(isNaN(d.getTime())) return todayISOF11();
  return d.toISOString().slice(0,10);
}
function invoiceUserF11(inv){ return inv.user || inv.createdBy || inv.seller || 'admin'; }
function allowedUsersF11(){
  const users=(state.users||[]).map(u=>u.username).filter(Boolean);
  const invoiceUsers=(state.invoices||[]).map(invoiceUserF11).filter(Boolean);
  return [...new Set([...users,...invoiceUsers,'admin'])];
}
function isAdminF11(){ return typeof isAdminF10==='function' ? isAdminF10() : ((currentUserF8?.role||'admin')==='admin'); }
function currentUserF11(){ return typeof currentUsernameF10==='function' ? currentUsernameF10() : (currentUserF8?.username||'admin'); }
function paymentsToUsdF11(p){ return (p.currency==='VES') ? Number(p.amount||0)/Number(state.rate||1) : Number(p.amount||0); }
function invoiceListForCashF11(){
  const date=$('cashDate')?.value || todayISOF11();
  const selectedUser=$('cashUserFilter')?.value || '';
  const current=currentUserF11();
  return (state.invoices||[]).filter(inv=>{
    const okDate=invoiceISODateF11(inv)===date;
    const u=invoiceUserF11(inv);
    const okUser=isAdminF11() ? (!selectedUser || u===selectedUser) : u===current;
    return okDate && okUser;
  });
}
function cashTotalsF11(list){
  const totals={}; let totalUsd=0;
  list.forEach(inv=>{
    (Array.isArray(inv.payments)?inv.payments:[]).forEach(p=>{
      const label=p.label||p.method||'Pago';
      const key=label+' ('+(p.currency||'USD')+')';
      const amount=Number(p.amount||0);
      totals[key]=(totals[key]||0)+amount;
      totalUsd+=paymentsToUsdF11(p);
    });
  });
  return {totals,totalUsd,count:list.length};
}
function fillCashUserFilterF11(){
  const sel=$('cashUserFilter'); if(!sel) return;
  const current=sel.value;
  if(isAdminF11()){
    sel.innerHTML='<option value="">Todos los usuarios</option>'+allowedUsersF11().map(u=>`<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join('');
    sel.disabled=false;
  }else{
    sel.innerHTML=`<option value="${escapeHtml(currentUserF11())}">${escapeHtml(currentUserF11())}</option>`;
    sel.disabled=true;
  }
  if([...sel.options].some(o=>o.value===current)) sel.value=current;
}
function renderCashCloseF11(){
  if($('cashDate') && !$('cashDate').value) $('cashDate').value=todayISOF11();
  fillCashUserFilterF11();
  const list=invoiceListForCashF11(); const t=cashTotalsF11(list);
  if($('cashCloseSummary')) $('cashCloseSummary').innerHTML=`<div class="card"><h3>Facturas</h3><strong>${t.count}</strong><span>Del día</span></div><div class="card"><h3>Total caja</h3><strong>${money(t.totalUsd)}</strong><span>${bs(t.totalUsd*state.rate)}</span></div><div class="card"><h3>Usuario</h3><strong>${escapeHtml(isAdminF11()?($('cashUserFilter')?.value||'Todos'):currentUserF11())}</strong><span>Caja filtrada</span></div><div class="card"><h3>Fecha</h3><strong>${escapeHtml($('cashDate')?.value||todayISOF11())}</strong><span>Cierre</span></div>`;
  const methods=Object.entries(t.totals).map(([k,v])=>`<tr><td>${escapeHtml(k)}</td><td>${k.includes('VES')?bs(v):money(v)}</td></tr>`).join('') || '<tr><td colspan="2">Sin pagos registrados</td></tr>';
  const invoices=list.slice().reverse().map(i=>`<div class="product-item"><b>Factura #${escapeHtml(i.id)}</b> · ${escapeHtml(i.date||'')}<br>Vendedor: ${escapeHtml(invoiceUserF11(i))}<br>Cliente: ${escapeHtml(i.client||'Cliente general')}<br>Total: ${money(i.total)} / ${bs(i.total*i.rate)}</div>`).join('') || '<p>No hay ventas para cerrar.</p>';
  if($('cashCloseList')) $('cashCloseList').innerHTML=`<table class="table"><tr><th>Método</th><th>Monto</th></tr>${methods}</table><h3>Facturas incluidas</h3>${invoices}`;
}
function saveCashCloseF11(){
  const list=invoiceListForCashF11(); const t=cashTotalsF11(list);
  const close={id:Date.now().toString(),date:$('cashDate')?.value||todayISOF11(),user:isAdminF11()?($('cashUserFilter')?.value||'todos'):currentUserF11(),createdBy:currentUserF11(),createdAt:new Date().toLocaleString(),invoiceIds:list.map(i=>i.id),count:t.count,totalUsd:t.totalUsd,totals:t.totals};
  state.cashClosings.unshift(close);
  if(typeof addAudit==='function') addAudit('Cierre de caja','Fecha '+close.date+' · '+close.user+' · '+money(close.totalUsd));
  save(); alert('Cierre de caja guardado.'); showPage('caja');
}
function exportCashCloseCSVF11(){
  const rows=[['fecha','usuario','facturas','total_usd','creado_por','creado_en'],...(state.cashClosings||[]).map(c=>[c.date,c.user,c.count,c.totalUsd,c.createdBy,c.createdAt])];
  exportCSV('cierres_caja_jimmore.csv', rows);
}
function clearARFormF11(){ ['arId','arClient','arInvoice','arAmount','arPaid','arRef'].forEach(id=>{if($(id))$(id).value=''}); }
function saveAccountReceivableF11(){
  const id=$('arId')?.value || Date.now().toString();
  const amount=Number($('arAmount')?.value||0); const paid=Number($('arPaid')?.value||0);
  if(!($('arClient')?.value||'').trim()) return alert('Coloca el cliente.');
  if(amount<=0) return alert('Coloca el monto total de la deuda.');
  let ar=(state.accountsReceivable||[]).find(x=>String(x.id)===String(id));
  if(!ar){ ar={id,client:$('arClient').value,invoiceId:$('arInvoice')?.value||'',amount,paid:0,abonos:[],createdAt:new Date().toLocaleString(),createdBy:currentUserF11(),status:'Pendiente'}; state.accountsReceivable.push(ar); }
  ar.client=$('arClient').value; ar.invoiceId=$('arInvoice')?.value||ar.invoiceId||''; ar.amount=amount;
  if(paid>0){ ar.paid=Number(ar.paid||0)+paid; ar.abonos=ar.abonos||[]; ar.abonos.push({date:new Date().toLocaleString(),amount:paid,method:$('arPayMethod')?.value||'',ref:$('arRef')?.value||'',user:currentUserF11()}); state.accounting.push({id:Date.now().toString(),date:new Date().toLocaleString(),type:'ingreso',desc:'Abono cuenta por cobrar '+(ar.invoiceId||ar.client),amount:paid}); }
  ar.balance=Math.max(Number(ar.amount||0)-Number(ar.paid||0),0); ar.status=ar.balance<=0?'Pagado':'Pendiente'; ar.updatedAt=new Date().toLocaleString();
  if(typeof addAudit==='function') addAudit('Cuenta por cobrar','Cliente '+ar.client+' · saldo '+money(ar.balance));
  clearARFormF11(); save(); showPage('cobrar');
}
function addAbonoF11(id){
  const ar=(state.accountsReceivable||[]).find(x=>String(x.id)===String(id)); if(!ar) return;
  const amount=Number(prompt('Monto del abono en dólares:', '0')||0); if(amount<=0) return;
  const method=prompt('Método de pago:', 'Pago Móvil')||'Pago'; const ref=prompt('Referencia / nota:', '')||'';
  ar.paid=Number(ar.paid||0)+amount; ar.abonos=ar.abonos||[]; ar.abonos.push({date:new Date().toLocaleString(),amount,method,ref,user:currentUserF11()}); ar.balance=Math.max(Number(ar.amount||0)-Number(ar.paid||0),0); ar.status=ar.balance<=0?'Pagado':'Pendiente'; ar.updatedAt=new Date().toLocaleString();
  state.accounting.push({id:Date.now().toString(),date:new Date().toLocaleString(),type:'ingreso',desc:'Abono cuenta por cobrar '+(ar.invoiceId||ar.client),amount}); save(); renderAccountsReceivableF11();
}
function editARF11(id){ const ar=(state.accountsReceivable||[]).find(x=>String(x.id)===String(id)); if(!ar)return; $('arId').value=ar.id; $('arClient').value=ar.client; $('arInvoice').value=ar.invoiceId||''; $('arAmount').value=ar.amount||0; $('arPaid').value=''; $('arRef').value=''; showPage('cobrar'); }
function renderAccountsReceivableF11(){
  const list=(state.accountsReceivable||[]); const pending=list.filter(a=>a.status!=='Pagado'); const total=pending.reduce((s,a)=>s+Number((a.balance ?? (a.amount-a.paid)) || 0),0); const paid=list.reduce((s,a)=>s+Number(a.paid||0),0);
  if($('arSummary')) $('arSummary').innerHTML=`<div class="card"><h3>Pendientes</h3><strong>${pending.length}</strong><span>Clientes/deudas</span></div><div class="card"><h3>Saldo por cobrar</h3><strong>${money(total)}</strong><span>${bs(total*state.rate)}</span></div><div class="card"><h3>Abonado</h3><strong>${money(paid)}</strong><span>Histórico</span></div>`;
  if($('arList')) $('arList').innerHTML=list.slice().reverse().map(a=>{ const bal=Number((a.balance ?? (a.amount-a.paid)) || 0); return `<div class="product-item"><b>${escapeHtml(a.client)}</b> · Factura/Ref: ${escapeHtml(a.invoiceId||'-')}<br>Total deuda: ${money(a.amount)} · Abonado: ${money(a.paid||0)} · <b>Saldo: ${money(bal)}</b><br>Estado: <span class="status">${escapeHtml(a.status||'Pendiente')}</span><br><small>Creado: ${escapeHtml(a.createdAt||'')} · Actualizado: ${escapeHtml(a.updatedAt||'')}</small><h4>Abonos</h4>${(a.abonos||[]).map(b=>`<small>${escapeHtml(b.date)} · ${money(b.amount)} · ${escapeHtml(b.method||'')} ${b.ref?'· Ref: '+escapeHtml(b.ref):''}</small><br>`).join('')||'<small>Sin abonos</small>'}<br><button onclick="addAbonoF11('${a.id}')">Agregar abono</button><button class="outline" onclick="editARF11('${a.id}')">Editar</button></div>`; }).join('') || '<p>No hay cuentas por cobrar.</p>';
}
function clearVehicleFormF11(){ ['vehId','vehPlate','vehClient','vehBrand','vehModel','vehYear','vehColor','vehNotes'].forEach(id=>{if($(id))$(id).value=''}); if($('vehicleHistoryBox')) $('vehicleHistoryBox').innerHTML=''; }
function normalizePlateF11(v){ return String(v||'').toUpperCase().replace(/\s+/g,'').trim(); }
function saveVehicleF11(){
  const plate=normalizePlateF11($('vehPlate')?.value||''); if(!plate) return alert('Coloca la placa.');
  const id=$('vehId')?.value || plate;
  const veh={id,plate,client:$('vehClient')?.value||'',brand:$('vehBrand')?.value||'',model:$('vehModel')?.value||'',year:$('vehYear')?.value||'',color:$('vehColor')?.value||'',notes:$('vehNotes')?.value||'',updatedAt:new Date().toLocaleString(),createdBy:currentUserF11()};
  state.vehicles=(state.vehicles||[]).filter(v=>String(v.id)!==String(id) && normalizePlateF11(v.plate)!==plate); state.vehicles.push(veh);
  clearVehicleFormF11(); save(); showPage('vehiculos');
}
function editVehicleF11(id){ const v=(state.vehicles||[]).find(x=>String(x.id)===String(id)); if(!v)return; $('vehId').value=v.id; $('vehPlate').value=v.plate||''; $('vehClient').value=v.client||''; $('vehBrand').value=v.brand||''; $('vehModel').value=v.model||''; $('vehYear').value=v.year||''; $('vehColor').value=v.color||''; $('vehNotes').value=v.notes||''; showVehicleHistoryF11(v.plate); showPage('vehiculos'); }
function vehicleHistoryF11(plate){ const p=normalizePlateF11(plate); return {orders:(state.workOrders||[]).filter(o=>normalizePlateF11(o.plate||o.vehicle||'').includes(p) || normalizePlateF11(o.vehicle||'')===p), invoices:(state.invoices||[]).filter(i=>(i.vehiclePlate&&normalizePlateF11(i.vehiclePlate)===p) || (i.items||[]).some(it=>normalizePlateF11(it.vehicle||'')===p))}; }
function showVehicleHistoryF11(plate){
  const h=vehicleHistoryF11(plate); const box=$('vehicleHistoryBox'); if(!box)return;
  box.innerHTML=`<h4>Historial de placa ${escapeHtml(normalizePlateF11(plate))}</h4><p>Órdenes: ${h.orders.length} · Facturas relacionadas: ${h.invoices.length}</p><h4>Trabajos</h4>${h.orders.map(o=>`<div class="product-item"><b>${escapeHtml(o.type||'Trabajo')}</b> · ${escapeHtml(o.status||'')}<br>Fecha: ${escapeHtml(o.received||o.updated||'')}<br>Código: ${escapeHtml(o.code||'')}<p>${escapeHtml(o.notes||'')}</p></div>`).join('')||'<p>Sin trabajos registrados.</p>'}<h4>Facturas</h4>${h.invoices.map(i=>`<div class="product-item"><b>Factura #${escapeHtml(i.id)}</b><br>${escapeHtml(i.date||'')} · ${money(i.total)}</div>`).join('')||'<p>Sin facturas relacionadas.</p>'}`;
}
function renderVehiclesF11(){
  const q=normalizeText($('vehSearch')?.value||'');
  const list=(state.vehicles||[]).filter(v=>normalizeText((v.plate||'')+' '+(v.client||'')+' '+(v.brand||'')+' '+(v.model||'')).includes(q));
  if($('vehicleList')) $('vehicleList').innerHTML=list.map(v=>`<div class="product-item"><b>Placa: ${escapeHtml(v.plate)}</b><br>Cliente: ${escapeHtml(v.client||'-')}<br>${escapeHtml([v.brand,v.model,v.year,v.color].filter(Boolean).join(' · '))}<p>${escapeHtml(v.notes||'')}</p><button onclick="editVehicleF11('${v.id}')">Editar / ver historial</button><button class="outline" onclick="showVehicleHistoryF11('${escapeHtml(v.plate)}')">Ver historial</button></div>`).join('') || '<p>No hay vehículos registrados.</p>';
}
const _saveWorkOrderF11 = saveWorkOrder;
saveWorkOrder = function(){
  const vehicleText=$('woVehicle')?.value||''; const plate=normalizePlateF11(vehicleText.split('/').pop() || vehicleText);
  const client=$('woClient')?.value||'';
  _saveWorkOrderF11();
  if(plate && !(state.vehicles||[]).some(v=>normalizePlateF11(v.plate)===plate)){
    state.vehicles.push({id:plate,plate,client,brand:'',model:vehicleText,year:'',color:'',notes:'Creado automáticamente desde orden de trabajo',createdBy:currentUserF11(),updatedAt:new Date().toLocaleString()});
    localStorage.setItem('jimmoreDB',JSON.stringify(state));
  }
};
const _completeSaleFromModalF11 = completeSaleFromModal;
completeSaleFromModal = function(){
  const before=(state.invoices||[]).length;
  _completeSaleFromModalF11();
  if((state.invoices||[]).length>before){
    const inv=state.invoices[state.invoices.length-1]; inv.isoDate=inv.isoDate||todayISOF11();
    const balance=Math.max(Number(inv.total||0)-Number(inv.paidUsd||0),0);
    const hasCuenta=Array.isArray(inv.payments) && inv.payments.some(p=>(p.method||'')==='cuenta' || (p.label||'').toLowerCase().includes('cobrar'));
    if(balance>0.001 || hasCuenta){
      const paid=Math.max(Number(inv.paidUsd||0),0);
      state.accountsReceivable.push({id:'AR-'+inv.id,client:inv.client,invoiceId:inv.id,amount:Number(inv.total||0),paid, balance:Math.max(Number(inv.total||0)-paid,0),status:Math.max(Number(inv.total||0)-paid,0)<=0?'Pagado':'Pendiente',abonos:[],createdAt:new Date().toLocaleString(),createdBy:currentUserF11(),note:'Generada automáticamente desde factura.'});
    }
    localStorage.setItem('jimmoreDB',JSON.stringify(state)); renderAll();
  }
};
const _applyRoleF11 = applyRole;
applyRole = function(r){
  _applyRoleF11(r);
  if(r==='vendedor') hidePages(['contabilidad','reportes','config']);
  if(r==='almacen') hidePages(['caja','cobrar','vehiculos']);
  if(r==='taller'||r==='pintor') hidePages(['pos','facturas','inventario','contabilidad','reportes','config','caja','cobrar']);
};
const _renderReportsF11 = renderReports;
renderReports = function(){
  _renderReportsF11();
  if(!isAdminF11()) return;
  const ar=(state.accountsReceivable||[]).filter(a=>a.status!=='Pagado').reduce((s,a)=>s+Number(a.balance||0),0);
  const closes=(state.cashClosings||[]).length;
  const vehicles=(state.vehicles||[]).length;
  if($('reportsBox')) $('reportsBox').textContent += '\n\nFASE 11\nCierres de caja guardados: '+closes+'\nCuentas por cobrar pendientes: '+money(ar)+' / '+bs(ar*state.rate)+'\nVehículos registrados: '+vehicles;
};
const _renderAllF11 = renderAll;
renderAll = function(){
  _renderAllF11();
  renderCashCloseF11();
  renderAccountsReceivableF11();
  renderVehiclesF11();
};


/* ===================== FASE 12 PRO: COMPRAS, PROVEEDORES, GARANTÍAS Y EVIDENCIAS ===================== */
state.suppliers = state.suppliers || [];
state.purchases = state.purchases || [];
state.warranties = state.warranties || [];
state.evidences = state.evidences || [];
localStorage.setItem('jimmoreDB', JSON.stringify(state));
function escF12(v){ return typeof escapeHtml==='function' ? escapeHtml(String(v??'')) : String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function userF12(){ return typeof currentUserF11==='function' ? currentUserF11() : 'admin'; }
function adminF12(){ return typeof isAdminF11==='function' ? isAdminF11() : true; }
function clearPurchaseFormF12(){ ['poId','poSupplier','poPhone','poInvoice','poDate','poProduct','poCode','poQty','poCost','poNotes'].forEach(id=>{if($(id))$(id).value=''}); if($('poStatus'))$('poStatus').value='Pendiente'; }
function saveSupplierF12(){
  const name=($('supName')?.value||'').trim(); if(!name) return alert('Coloca el nombre del proveedor.');
  let s=(state.suppliers||[]).find(x=>normalizeText(x.name)===normalizeText(name));
  if(!s){ s={id:Date.now().toString(),createdAt:new Date().toLocaleString()}; state.suppliers.push(s); }
  s.name=name; s.phone=$('supPhone')?.value||''; s.rif=$('supRif')?.value||''; s.address=$('supAddress')?.value||''; s.notes=$('supNotes')?.value||''; s.updatedAt=new Date().toLocaleString(); s.createdBy=userF12();
  ['supName','supPhone','supRif','supAddress','supNotes'].forEach(id=>{if($(id))$(id).value=''});
  if(typeof addAudit==='function') addAudit('Proveedor','Guardó proveedor '+s.name);
  save(); showPage('compras');
}
function savePurchaseF12(){
  const product=($('poProduct')?.value||'').trim(); const supplier=($('poSupplier')?.value||'').trim();
  const qty=Number($('poQty')?.value||0); const cost=Number($('poCost')?.value||0);
  if(!supplier) return alert('Coloca el proveedor.'); if(!product) return alert('Coloca el producto comprado.'); if(qty<=0) return alert('Coloca la cantidad.');
  const id=$('poId')?.value || Date.now().toString();
  const code=($('poCode')?.value||product.slice(0,4)+'-'+id.slice(-4)).toUpperCase();
  const po={id,supplier,phone:$('poPhone')?.value||'',invoice:$('poInvoice')?.value||'',date:$('poDate')?.value||new Date().toISOString().slice(0,10),status:$('poStatus')?.value||'Pendiente',product,code,qty,cost,total:qty*cost,notes:$('poNotes')?.value||'',createdAt:new Date().toLocaleString(),createdBy:userF12()};
  state.purchases=(state.purchases||[]).filter(x=>String(x.id)!==String(id)); state.purchases.push(po);
  // Actualiza o crea producto en inventario
  let p=(state.products||[]).find(x=>String(x.code||'').toUpperCase()===code || normalizeText(x.name)===normalizeText(product));
  if(!p){ p={id:'P-'+Date.now(),name:product,code,category:'Repuestos / compras',brand:'',supplier,location:'Almacén principal',cost,price:cost,stock:0,min:1,img:''}; state.products.push(p); }
  p.stock=Number(p.stock||0)+qty; p.cost=cost; p.supplier=supplier; p.code=p.code||code; p.updatedAt=new Date().toLocaleString();
  let sup=(state.suppliers||[]).find(x=>normalizeText(x.name)===normalizeText(supplier)); if(!sup){ state.suppliers.push({id:'S-'+Date.now(),name:supplier,phone:po.phone,createdAt:new Date().toLocaleString(),createdBy:userF12()}); }
  state.accounting=state.accounting||[]; state.accounting.push({id:'PO-'+id,date:new Date().toLocaleString(),type:'gasto',desc:'Compra proveedor '+supplier+' - '+product,amount:po.total});
  if(typeof addAudit==='function') addAudit('Compra','Compra '+product+' x '+qty+' · '+money(po.total));
  clearPurchaseFormF12(); save(); showPage('compras');
}
function editPurchaseF12(id){ const p=(state.purchases||[]).find(x=>String(x.id)===String(id)); if(!p)return; showPage('compras'); ['poId','poSupplier','poPhone','poInvoice','poDate','poProduct','poCode','poQty','poCost','poNotes'].forEach(k=>{}); $('poId').value=p.id; $('poSupplier').value=p.supplier||''; $('poPhone').value=p.phone||''; $('poInvoice').value=p.invoice||''; $('poDate').value=p.date||''; $('poStatus').value=p.status||'Pendiente'; $('poProduct').value=p.product||''; $('poCode').value=p.code||''; $('poQty').value=p.qty||0; $('poCost').value=p.cost||0; $('poNotes').value=p.notes||''; }
function renderSuppliersF12(){ const box=$('supplierList'); if(!box)return; box.innerHTML=(state.suppliers||[]).slice().reverse().map(s=>`<div class="product-item"><b>${escF12(s.name)}</b><br>${escF12(s.phone||'')} · ${escF12(s.rif||'')}<br><small>${escF12(s.address||'')}</small><p>${escF12(s.notes||'')}</p></div>`).join('')||'<p>No hay proveedores registrados.</p>'; }
function renderPurchasesF12(){ const box=$('purchaseList'); if(!box)return; const list=(state.purchases||[]).slice().reverse(); box.innerHTML=list.map(p=>`<div class="product-item"><b>${escF12(p.product)}</b> · ${escF12(p.code)}</br>Proveedor: ${escF12(p.supplier)} · Ref: ${escF12(p.invoice||'-')}<br>Cantidad: ${p.qty} · Costo: ${money(p.cost)} · Total: <b>${money(p.total)}</b><br>Estado: <span class="status">${escF12(p.status)}</span> · Fecha: ${escF12(p.date)}<p>${escF12(p.notes||'')}</p><button onclick="editPurchaseF12('${p.id}')">Editar</button></div>`).join('')||'<p>No hay compras registradas.</p>'; }
function exportPurchasesCSVF12(){ const rows=[['fecha','proveedor','factura','producto','codigo','cantidad','costo','total','estatus'],...(state.purchases||[]).map(p=>[p.date,p.supplier,p.invoice,p.product,p.code,p.qty,p.cost,p.total,p.status])]; exportCSV('compras_proveedores_jimmore.csv',rows); }
function clearWarrantyFormF12(){ ['warId','warClient','warVehicle','warInvoice','warStart','warEnd','warNotes'].forEach(id=>{if($(id))$(id).value=''}); if($('warType'))$('warType').value='Reparación'; if($('warStatus'))$('warStatus').value='Activa'; }
function saveWarrantyF12(){ const client=($('warClient')?.value||'').trim(); if(!client)return alert('Coloca el cliente.'); const id=$('warId')?.value||Date.now().toString(); let w=(state.warranties||[]).find(x=>String(x.id)===String(id)); if(!w){w={id,claims:[],createdAt:new Date().toLocaleString(),createdBy:userF12()}; state.warranties.push(w);} w.client=client; w.vehicle=$('warVehicle')?.value||''; w.invoice=$('warInvoice')?.value||''; w.type=$('warType')?.value||''; w.start=$('warStart')?.value||''; w.end=$('warEnd')?.value||''; w.status=$('warStatus')?.value||'Activa'; w.notes=$('warNotes')?.value||''; w.updatedAt=new Date().toLocaleString(); if(typeof addAudit==='function') addAudit('Garantía','Garantía '+w.type+' · '+w.client); clearWarrantyFormF12(); save(); showPage('garantias'); }
function editWarrantyF12(id){ const w=(state.warranties||[]).find(x=>String(x.id)===String(id)); if(!w)return; showPage('garantias'); $('warId').value=w.id; $('warClient').value=w.client||''; $('warVehicle').value=w.vehicle||''; $('warInvoice').value=w.invoice||''; $('warType').value=w.type||'Reparación'; $('warStart').value=w.start||''; $('warEnd').value=w.end||''; $('warStatus').value=w.status||'Activa'; $('warNotes').value=w.notes||''; }
function addWarrantyClaimF12(id){ const w=(state.warranties||[]).find(x=>String(x.id)===String(id)); if(!w)return; const note=prompt('Detalle del reclamo o solución:',''); if(!note)return; w.claims=w.claims||[]; w.claims.push({date:new Date().toLocaleString(),note,user:userF12()}); w.status='Reclamo recibido'; w.updatedAt=new Date().toLocaleString(); save(); renderWarrantiesF12(); }
function renderWarrantiesF12(){ const list=(state.warranties||[]); const active=list.filter(w=>w.status!=='Resuelta'&&w.status!=='Vencida').length; if($('warrantySummary')) $('warrantySummary').innerHTML=`<div class="cards"><div class="card"><h3>Activas</h3><strong>${active}</strong><span>Garantías abiertas</span></div><div class="card"><h3>Total</h3><strong>${list.length}</strong><span>Registros</span></div></div>`; if($('warrantyList')) $('warrantyList').innerHTML=list.slice().reverse().map(w=>`<div class="product-item"><b>${escF12(w.client)}</b> · ${escF12(w.vehicle||'-')}<br>Tipo: ${escF12(w.type)} · Factura/Orden: ${escF12(w.invoice||'-')}<br>Vigencia: ${escF12(w.start||'-')} hasta ${escF12(w.end||'-')}<br>Estado: <span class="status">${escF12(w.status)}</span><p>${escF12(w.notes||'')}</p><h4>Reclamos / seguimiento</h4>${(w.claims||[]).map(c=>`<small>${escF12(c.date)} · ${escF12(c.user)}: ${escF12(c.note)}</small><br>`).join('')||'<small>Sin reclamos.</small>'}<br><button onclick="editWarrantyF12('${w.id}')">Editar</button><button class="outline" onclick="addWarrantyClaimF12('${w.id}')">Agregar reclamo</button></div>`).join('')||'<p>No hay garantías registradas.</p>'; }
function clearEvidenceFormF12(){ ['evOrder','evClient','evVehicle','evNotes'].forEach(id=>{if($(id))$(id).value=''}); if($('evStage'))$('evStage').value='Antes'; if($('evFile'))$('evFile').value=''; }
function saveEvidenceF12(){ const code=($('evOrder')?.value||'').trim(); if(!code)return alert('Coloca el código de orden o factura.'); const f=$('evFile')?.files?.[0]; const finish=(img)=>{ const e={id:Date.now().toString(),orderCode:code,client:$('evClient')?.value||'',vehicle:$('evVehicle')?.value||'',stage:$('evStage')?.value||'Proceso',notes:$('evNotes')?.value||'',img:img||'',date:new Date().toLocaleString(),createdBy:userF12()}; state.evidences.push(e); if(typeof addAudit==='function') addAudit('Evidencia','Foto/evidencia '+e.stage+' · '+e.orderCode); clearEvidenceFormF12(); save(); showPage('evidencias'); };
  if(f){ const reader=new FileReader(); reader.onload=ev=>finish(ev.target.result); reader.readAsDataURL(f); } else finish(''); }
function renderEvidenceF12(){ const box=$('evidenceList'); if(!box)return; const q=normalizeText($('evSearch')?.value||''); const list=(state.evidences||[]).filter(e=>normalizeText([e.orderCode,e.client,e.vehicle,e.stage,e.notes].join(' ')).includes(q)).slice().reverse(); box.innerHTML=list.map(e=>`<div class="product-item evidence-card">${e.img?`<img class="evidence-img" src="${e.img}">`:''}<b>${escF12(e.stage)}</b> · Código: ${escF12(e.orderCode)}<br>Cliente: ${escF12(e.client||'-')} · Vehículo: ${escF12(e.vehicle||'-')}<p>${escF12(e.notes||'')}</p><small>${escF12(e.date)} · ${escF12(e.createdBy)}</small></div>`).join('')||'<p>No hay evidencias registradas.</p>'; }
// Mostrar evidencias en el portal del cliente junto con el código de trabajo
const _clientCheckF12 = clientCheck;
clientCheck = function(){
  _clientCheckF12();
  const c=$('clientCodeInput')?.value.trim().toLowerCase(); if(!c || !$('clientResult'))return;
  const ev=(state.evidences||[]).filter(e=>String(e.orderCode||'').toLowerCase()===c);
  if(ev.length){ $('clientResult').innerHTML += `<h3>Fotos del proceso</h3>`+ev.map(e=>`<div class="product-item">${e.img?`<img class="evidence-img" src="${e.img}">`:''}<b>${escF12(e.stage)}</b><p>${escF12(e.notes||'')}</p><small>${escF12(e.date)}</small></div>`).join(''); }
};
const _applyRoleF12 = applyRole;
applyRole = function(r){ _applyRoleF12(r); if(r==='vendedor') hidePages(['compras','garantias','evidencias']); if(r==='almacen') hidePages(['garantias','evidencias']); if(r==='taller'||r==='pintor') hidePages(['compras','caja','cobrar','contabilidad','reportes','config']); };
const _renderReportsF12 = renderReports;
renderReports = function(){ _renderReportsF12(); if(!adminF12())return; if($('reportsBox')) $('reportsBox').textContent += `\n\nFASE 12 PRO\nCompras registradas: ${(state.purchases||[]).length}\nProveedores: ${(state.suppliers||[]).length}\nGarantías: ${(state.warranties||[]).length}\nEvidencias/fotos: ${(state.evidences||[]).length}`; };
const _renderAllF12 = renderAll;
renderAll = function(){ _renderAllF12(); renderSuppliersF12(); renderPurchasesF12(); renderWarrantiesF12(); renderEvidenceF12(); };

/* ===================== FASE 13 PRO: RESPALDOS, EXCEL, TERMICA, CODIGOS Y ESCANER ===================== */
state.backups = state.backups || [];
let scannerStream=null, scannerTimer=null;

function phase13Safe(v){ return String(v ?? '').replace(/[<>&]/g, s=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[s])); }
function csvEscape(v){ return '"'+String(v??'').replaceAll('"','""')+'"'; }
function downloadTextFile(name, content, type='text/plain;charset=utf-8'){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([content],{type}));
  a.download=name; a.click();
}
function createLocalBackup(){
  const copy={...state,cart:[]};
  const item={id:Date.now().toString(),date:new Date().toLocaleString(),products:state.products.length,invoices:state.invoices.length,clients:state.clients.length,data:copy};
  state.backups=state.backups||[];
  state.backups.unshift(item);
  state.backups=state.backups.slice(0,10);
  save();
  alert('Respaldo interno creado.');
}
function downloadFullBackup(){
  const copy={...state,cart:[]};
  downloadTextFile('respaldo_jimmore_fase13_'+new Date().toISOString().slice(0,10)+'.json', JSON.stringify(copy,null,2), 'application/json');
}
function restoreBackupFile(){
  const f=$('restoreFile')?.files?.[0];
  if(!f) return alert('Selecciona un archivo JSON de respaldo.');
  const r=new FileReader();
  r.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      if(!confirm('Esto reemplazará los datos actuales por el respaldo. ¿Continuar?')) return;
      state={...data,cart:[],backups:data.backups||state.backups||[]};
      localStorage.setItem('jimmoreDB',JSON.stringify(state));
      renderAll();
      alert('Respaldo restaurado correctamente.');
    }catch(err){ alert('No se pudo restaurar. Archivo inválido.'); }
  };
  r.readAsText(f);
}
function restoreInternalBackup(id){
  const b=(state.backups||[]).find(x=>x.id===id); if(!b) return;
  if(!confirm('Restaurar este respaldo interno?')) return;
  state={...b.data,cart:[],backups:state.backups};
  localStorage.setItem('jimmoreDB',JSON.stringify(state));
  renderAll();
}
function renderBackups(){
  const box=$('backupList'); if(!box) return;
  const arr=state.backups||[];
  box.innerHTML=arr.length?arr.map(b=>`<div class="row"><b>${phase13Safe(b.date)}</b><br><small>${b.products} productos · ${b.invoices} facturas · ${b.clients} clientes</small><br><button onclick="restoreInternalBackup('${b.id}')">Restaurar</button></div>`).join(''):'<p class="note">Todavía no hay respaldos internos.</p>';
}
function downloadProductTemplate(){
  const rows=[['codigo','nombre','categoria','marca','proveedor','ubicacion','costo_usd','precio_venta_usd','precio_mayorista_usd','stock','stock_minimo'],['REP-001','Filtro de aceite','Repuestos','Marca ejemplo','Proveedor ejemplo','Almacén principal','3','6','5','10','2']];
  downloadTextFile('plantilla_productos_jimmore.csv', rows.map(r=>r.map(csvEscape).join(',')).join('\n'), 'text/csv;charset=utf-8');
}
function bulkImportProductsPro(){
  const f=$('bulkImportFile')?.files?.[0]; if(!f) return alert('Selecciona un CSV.');
  const r=new FileReader();
  r.onload=e=>{
    const lines=e.target.result.split(/\r?\n/).filter(x=>x.trim());
    let count=0;
    lines.slice(1).forEach(line=>{
      const v=line.match(/("[^"]*(?:""[^"]*)*"|[^,]+)/g)?.map(x=>x.replace(/^"|"$/g,'').replaceAll('""','"'))||[];
      if(!v[0]&&!v[1]) return;
      const code=v[0]||('PROD-'+Date.now()+count);
      let p=state.products.find(x=>(x.code||'').toLowerCase()===code.toLowerCase());
      const data={id:p?.id||Date.now().toString()+Math.random(),code,name:v[1]||'',category:v[2]||'',brand:v[3]||'',supplier:v[4]||'',location:v[5]||'',cost:+v[6]||0,price:+v[7]||0,wholesale:+v[8]||0,stock:+v[9]||0,min:+v[10]||1,img:p?.img||''};
      if(p) Object.assign(p,data); else state.products.push(data);
      count++;
    });
    save();
    if($('bulkImportResult')) $('bulkImportResult').textContent=`Importación completada: ${count} productos procesados.`;
  };
  r.readAsText(f);
}
function exportAllCSVZipLite(){
  const products=[['codigo','nombre','categoria','marca','proveedor','ubicacion','costo','precio','stock'],...state.products.map(p=>[p.code,p.name,p.category,p.brand,p.supplier,p.location,p.cost,p.price,p.stock])];
  const clients=[['nombre','telefono','rif_ci','direccion','vehiculo'],...state.clients.map(c=>[c.name,c.phone,c.document,c.address,c.vehicle])];
  const invoices=[['factura','fecha','cliente','total_usd','tasa','total_bs'],...state.invoices.map(i=>[i.id,i.date,i.client,i.total,i.rate,i.total*i.rate])];
  const content='PRODUCTOS\n'+products.map(r=>r.map(csvEscape).join(',')).join('\n')+'\n\nCLIENTES\n'+clients.map(r=>r.map(csvEscape).join(',')).join('\n')+'\n\nFACTURAS\n'+invoices.map(r=>r.map(csvEscape).join(',')).join('\n');
  downloadTextFile('tablas_jimmore_fase13.csv', content, 'text/csv;charset=utf-8');
}
function findInvoiceForThermal(){
  const id=($('thermalInvoiceId')?.value||'').trim();
  if(id) return state.invoices.find(i=>String(i.id)===id);
  return state.invoices[state.invoices.length-1];
}
function thermalHTML(i){
  if(!i) return '<p>No hay factura seleccionada.</p>';
  return `<div class="thermal-ticket" id="thermalPrintArea"><h2>${phase13Safe(state.config.companyName||'Inversiones Jimmore')}</h2><div class="center">RIF: ${phase13Safe(state.config.rif||'')}<br>${phase13Safe(state.config.phone||'')}</div><div class="line"></div><b>FACTURA:</b> ${phase13Safe(i.id)}<br><b>FECHA:</b> ${phase13Safe(i.date)}<br><b>CLIENTE:</b> ${phase13Safe(i.client||'Cliente general')}<div class="line"></div><table>${(i.items||[]).map(x=>`<tr><td>${phase13Safe(x.name)} x${x.qty}</td><td style="text-align:right">${money(x.price*x.qty)}</td></tr>`).join('')}</table><div class="line"></div><h2>${money(i.total)}</h2><div class="center">${bs(i.total*i.rate)}<br>Tasa: ${i.rate}</div><div class="line"></div><div class="center">Gracias por su compra<br>Control cliente · Sin datos internos</div></div>`;
}
function previewThermalInvoice(){ const box=$('thermalPreview'); if(box) box.innerHTML=thermalHTML(findInvoiceForThermal()); }
function printThermalInvoice(){
  previewThermalInvoice();
  const html=$('thermalPreview')?.innerHTML||'';
  const div=document.createElement('div'); div.innerHTML=html; document.body.appendChild(div);
  document.body.classList.add('print-thermal'); window.print(); document.body.classList.remove('print-thermal'); div.remove();
}
function barcodeFor(code){ return `<div class="fake-barcode"></div><small>${phase13Safe(code)}</small>`; }
function labelHTML(p){
  return `<div class="product-label"><b>${phase13Safe(p.name||'Producto')}</b><br><small>${phase13Safe(p.brand||'')} · ${phase13Safe(p.location||'')}</small>${barcodeFor(p.code||p.id)}<b>${money(p.price||0)}</b><br><small>${bs((p.price||0)*state.rate)} · Stock: ${p.stock||0}</small></div>`;
}
function renderLabelSelect(){
  const sel=$('labelProductSelect'); if(!sel) return;
  sel.innerHTML=state.products.map(p=>`<option value="${phase13Safe(p.id)}">${phase13Safe(p.code||'')} · ${phase13Safe(p.name||'')}</option>`).join('');
  const p=state.products[0]; if($('labelPreview')) $('labelPreview').innerHTML=p?labelHTML(p):'<p class="note">Crea productos para generar etiquetas.</p>';
  sel.onchange=()=>{const p=state.products.find(x=>String(x.id)===sel.value); $('labelPreview').innerHTML=p?labelHTML(p):'';};
}
function printSelectedLabel(){
  const p=state.products.find(x=>String(x.id)===$('labelProductSelect')?.value); if(!p) return alert('Selecciona un producto.');
  printLabelsHTML(labelHTML(p));
}
function printAllLabels(){
  if(!state.products.length) return alert('No hay productos.');
  printLabelsHTML(state.products.map(labelHTML).join(''));
}
function printLabelsHTML(html){
  const div=document.createElement('div'); div.id='labelPrintArea'; div.innerHTML=html; document.body.appendChild(div);
  document.body.classList.add('print-labels'); window.print(); document.body.classList.remove('print-labels'); div.remove();
}
async function startBarcodeScanner(){
  const video=$('scannerVideo'); if(!video) return;
  try{
    scannerStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    video.srcObject=scannerStream;
    if('BarcodeDetector' in window){
      const detector=new BarcodeDetector({formats:['code_128','ean_13','ean_8','qr_code','upc_a','upc_e']});
      scannerTimer=setInterval(async()=>{
        try{ const codes=await detector.detect(video); if(codes.length){ $('manualScanCode').value=codes[0].rawValue; findProductByScan(); stopBarcodeScanner(); } }catch(e){}
      },700);
    }else{
      $('scannerResult').innerHTML='Tu navegador no tiene lectura automática. Usa la cámara como ayuda visual y escribe el código manual.';
    }
  }catch(e){ alert('No se pudo abrir la cámara. Revisa permisos del navegador.'); }
}
function stopBarcodeScanner(){ if(scannerTimer) clearInterval(scannerTimer); scannerTimer=null; if(scannerStream){scannerStream.getTracks().forEach(t=>t.stop()); scannerStream=null;} const v=$('scannerVideo'); if(v) v.srcObject=null; }
function findProductByScan(){
  const c=($('manualScanCode')?.value||'').trim().toLowerCase();
  const p=state.products.find(x=>(x.code||'').toLowerCase()===c || (x.name||'').toLowerCase().includes(c)&&c.length>2);
  const box=$('scannerResult'); if(!box) return;
  box.innerHTML=p?`<b>${phase13Safe(p.name)}</b><br>Código: ${phase13Safe(p.code)}<br>Precio: ${money(p.price)} / ${bs(p.price*state.rate)}<br>Stock: ${p.stock}<br>Ubicación: ${phase13Safe(p.location)}`:'No encontrado.';
}
function clearOldScannerResult(){ if($('scannerResult')) $('scannerResult').innerHTML=''; if($('manualScanCode')) $('manualScanCode').value=''; }
function printLowStockReport(){
  const low=state.products.filter(p=>(+p.stock||0)<=(+p.min||0));
  const html=`<h2>Productos con stock bajo</h2><table border="1" cellpadding="8"><tr><th>Código</th><th>Producto</th><th>Stock</th><th>Mínimo</th><th>Ubicación</th></tr>${low.map(p=>`<tr><td>${phase13Safe(p.code)}</td><td>${phase13Safe(p.name)}</td><td>${p.stock}</td><td>${p.min}</td><td>${phase13Safe(p.location)}</td></tr>`).join('')}</table>`;
  const w=window.open('','_blank'); w.document.write(html); w.print();
}
function downloadInventoryValuation(){
  const rows=[['codigo','producto','stock','costo_unitario','valor_costo','precio_venta','valor_venta'],...state.products.map(p=>[p.code,p.name,p.stock,p.cost,(+p.stock||0)*(+p.cost||0),p.price,(+p.stock||0)*(+p.price||0)])];
  downloadTextFile('valor_inventario_jimmore.csv', rows.map(r=>r.map(csvEscape).join(',')).join('\n'), 'text/csv;charset=utf-8');
}
function renderPhase13(){ renderBackups(); renderLabelSelect(); previewThermalInvoice(); }
const renderAllBeforePhase13=renderAll;
renderAll=function(){ renderAllBeforePhase13(); renderPhase13(); };

/* ===================== FASE 14 PRO: AGENDA, CITAS Y FOTOS AMPLIADAS ===================== */
state.appointments = state.appointments || [];
function escF14(v){ return String(v ?? '').replace(/[<>&]/g, s=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[s])); }
function userF14(){ return (typeof currentUsernameF10==='function' ? currentUsernameF10() : ($('userName')?.value||'admin')) || 'admin'; }
function clearAppointmentF14(){ ['apptId','apptClient','apptPhone','apptVehicle','apptCode','apptDate','apptTime','apptNotes'].forEach(id=>{if($(id))$(id).value=''}); if($('apptService'))$('apptService').value='Revisión general'; if($('apptPriority'))$('apptPriority').value='Normal'; if($('apptAssigned'))$('apptAssigned').value='Mecánico'; if($('apptStatus'))$('apptStatus').value='Programada'; }
function saveAppointmentF14(){
  const client=($('apptClient')?.value||'').trim();
  const date=($('apptDate')?.value||'').trim();
  if(!client) return alert('Coloca el cliente.');
  if(!date) return alert('Coloca la fecha de la cita.');
  const id=$('apptId')?.value || Date.now().toString();
  let a=(state.appointments||[]).find(x=>String(x.id)===String(id));
  if(!a){ a={id,createdAt:new Date().toLocaleString(),createdBy:userF14(),history:[]}; state.appointments.push(a); }
  const oldStatus=a.status;
  a.client=client; a.phone=$('apptPhone')?.value||''; a.vehicle=$('apptVehicle')?.value||''; a.code=$('apptCode')?.value||'';
  a.date=date; a.time=$('apptTime')?.value||''; a.service=$('apptService')?.value||'Revisión general'; a.priority=$('apptPriority')?.value||'Normal';
  a.assigned=$('apptAssigned')?.value||'Mecánico'; a.status=$('apptStatus')?.value||'Programada'; a.notes=$('apptNotes')?.value||''; a.updatedAt=new Date().toLocaleString();
  if(oldStatus!==a.status) a.history.push({date:a.updatedAt,status:a.status,user:userF14(),notes:a.notes||''});
  if(typeof addAudit==='function') addAudit('Agenda','Cita '+a.service+' · '+a.client+' · '+a.date+' '+(a.time||''));
  clearAppointmentF14(); save(); showPage('agenda');
}
function editAppointmentF14(id){ const a=(state.appointments||[]).find(x=>String(x.id)===String(id)); if(!a)return; showPage('agenda'); $('apptId').value=a.id; $('apptClient').value=a.client||''; $('apptPhone').value=a.phone||''; $('apptVehicle').value=a.vehicle||''; $('apptCode').value=a.code||''; $('apptDate').value=a.date||''; $('apptTime').value=a.time||''; $('apptService').value=a.service||'Revisión general'; $('apptPriority').value=a.priority||'Normal'; $('apptAssigned').value=a.assigned||'Mecánico'; $('apptStatus').value=a.status||'Programada'; $('apptNotes').value=a.notes||''; }
function quickAppointmentStatusF14(id,status){ const a=(state.appointments||[]).find(x=>String(x.id)===String(id)); if(!a)return; a.status=status; a.updatedAt=new Date().toLocaleString(); a.history=a.history||[]; a.history.push({date:a.updatedAt,status,user:userF14(),notes:'Cambio rápido'}); save(); renderAppointmentsF14(); }
function deleteAppointmentF14(id){ if(!confirm('¿Eliminar esta cita?'))return; state.appointments=(state.appointments||[]).filter(x=>String(x.id)!==String(id)); save(); }
function renderAppointmentsF14(){
  const box=$('appointmentList'); if(!box)return;
  const fdate=$('apptFilterDate')?.value||''; const fstatus=$('apptFilterStatus')?.value||'';
  let list=(state.appointments||[]).slice().sort((a,b)=>String(a.date+a.time).localeCompare(String(b.date+b.time)));
  if(fdate) list=list.filter(a=>a.date===fdate); if(fstatus) list=list.filter(a=>a.status===fstatus);
  const today=new Date().toISOString().slice(0,10);
  const todayList=(state.appointments||[]).filter(a=>a.date===today && !['Terminada','Cancelada'].includes(a.status));
  const pending=(state.appointments||[]).filter(a=>!['Terminada','Cancelada'].includes(a.status)).length;
  const urgent=(state.appointments||[]).filter(a=>a.priority==='Urgente' && !['Terminada','Cancelada'].includes(a.status)).length;
  if($('appointmentSummary')) $('appointmentSummary').innerHTML=`<div class="card"><h3>Hoy</h3><strong>${todayList.length}</strong><span>Citas pendientes</span></div><div class="card"><h3>Pendientes</h3><strong>${pending}</strong><span>Agenda activa</span></div><div class="card"><h3>Urgentes</h3><strong>${urgent}</strong><span>Prioridad alta</span></div><div class="card"><h3>Total</h3><strong>${(state.appointments||[]).length}</strong><span>Citas creadas</span></div>`;
  box.innerHTML=list.map(a=>`<div class="product-item appointment-card ${a.priority==='Urgente'?'urgent-appt':''}"><b>${escF14(a.client)}</b> · ${escF14(a.vehicle||'-')}<br><b>${escF14(a.date)} ${escF14(a.time||'')}</b> · ${escF14(a.service)}<br>Estado: <span class="status">${escF14(a.status)}</span> · Prioridad: ${escF14(a.priority)} · Asignado: ${escF14(a.assigned)}<br>Código: <b>${escF14(a.code||'-')}</b><p>${escF14(a.notes||'')}</p><small>Creada por ${escF14(a.createdBy||'-')} · Actualizada: ${escF14(a.updatedAt||a.createdAt||'-')}</small><br><button onclick="editAppointmentF14('${a.id}')">Editar</button><button class="outline" onclick="quickAppointmentStatusF14('${a.id}','Confirmada')">Confirmar</button><button class="outline" onclick="quickAppointmentStatusF14('${a.id}','En proceso')">En proceso</button><button class="outline" onclick="quickAppointmentStatusF14('${a.id}','Terminada')">Terminada</button><button class="danger" onclick="deleteAppointmentF14('${a.id}')">Eliminar</button></div>`).join('') || '<p>No hay citas registradas.</p>';
}
function exportAppointmentsCSVF14(){ const rows=[['fecha','hora','cliente','telefono','vehiculo','codigo','servicio','prioridad','asignado','estado','notas'],...(state.appointments||[]).map(a=>[a.date,a.time,a.client,a.phone,a.vehicle,a.code,a.service,a.priority,a.assigned,a.status,a.notes])]; exportCSV('agenda_citas_jimmore.csv',rows); }

function openEvidenceFullF14(id){
  const e=(state.evidences||[]).find(x=>String(x.id)===String(id)); if(!e||!e.img)return;
  let modal=$('evidenceFullModalF14');
  if(!modal){
    modal=document.createElement('div'); modal.id='evidenceFullModalF14'; modal.className='modal hidden';
    modal.innerHTML='<div class="modal-card evidence-full-card"><h2 id="evFullTitle"></h2><img id="evFullImg" class="evidence-full-img"><p id="evFullNotes"></p><div class="toolbar"><a id="evDownloadLink" class="download-btn" download="evidencia_jimmore.jpg">Descargar foto</a><button class="outline" onclick="closeEvidenceFullF14()">Cerrar</button></div></div>';
    document.body.appendChild(modal);
  }
  $('evFullTitle').textContent=(e.stage||'Evidencia')+' · '+(e.orderCode||'');
  $('evFullImg').src=e.img;
  $('evFullNotes').textContent=(e.notes||'')+'  '+(e.date||'');
  $('evDownloadLink').href=e.img;
  $('evDownloadLink').download='jimmore_'+(e.orderCode||'evidencia')+'_'+(e.stage||'foto')+'.jpg';
  modal.classList.remove('hidden');
}
function closeEvidenceFullF14(){ const m=$('evidenceFullModalF14'); if(m)m.classList.add('hidden'); }
const _renderEvidenceBeforeF14 = renderEvidenceF12;
renderEvidenceF12 = function(){
  const box=$('evidenceList'); if(!box) return;
  const q=normalizeText($('evSearch')?.value||'');
  const list=(state.evidences||[]).filter(e=>normalizeText([e.orderCode,e.client,e.vehicle,e.stage,e.notes].join(' ')).includes(q)).slice().reverse();
  box.innerHTML=list.map(e=>`<div class="product-item evidence-card">${e.img?`<img class="evidence-img evidence-click" src="${e.img}" onclick="openEvidenceFullF14('${e.id}')">`:''}<b>${escF12(e.stage)}</b> · Código: ${escF12(e.orderCode)}<br>Cliente: ${escF12(e.client||'-')} · Vehículo: ${escF12(e.vehicle||'-')}<p>${escF12(e.notes||'')}</p><small>${escF12(e.date)} · ${escF12(e.createdBy)}</small><br>${e.img?`<button onclick="openEvidenceFullF14('${e.id}')">Ver grande</button><a class="download-btn small-download" href="${e.img}" download="jimmore_${escF12(e.orderCode)}_${escF12(e.stage)}.jpg">Descargar</a>`:''}</div>`).join('')||'<p>No hay evidencias registradas.</p>';
};
const _clientCheckBeforeF14 = clientCheck;
clientCheck = function(){
  _clientCheckBeforeF14();
  const c=$('clientCodeInput')?.value.trim().toLowerCase(); if(!c || !$('clientResult'))return;
  const ev=(state.evidences||[]).filter(e=>String(e.orderCode||'').toLowerCase()===c);
  if(ev.length){
    const marker='<h3>Fotos del proceso</h3>';
    const base=$('clientResult').innerHTML.split(marker)[0];
    $('clientResult').innerHTML = base + `<h3>Fotos del proceso</h3><p class="note">Toca una foto para verla grande o usa Descargar para guardarla.</p>` + ev.map(e=>`<div class="product-item evidence-card client-evidence">${e.img?`<img class="evidence-img evidence-click" src="${e.img}" onclick="openEvidenceFullF14('${e.id}')">`:''}<b>${escF12(e.stage)}</b><p>${escF12(e.notes||'')}</p><small>${escF12(e.date)}</small><br>${e.img?`<button onclick="openEvidenceFullF14('${e.id}')">Ver grande</button><a class="download-btn small-download" href="${e.img}" download="jimmore_${escF12(e.orderCode)}_${escF12(e.stage)}.jpg">Descargar</a>`:''}</div>`).join('');
  }
};
const _applyRoleBeforeF14 = applyRole;
applyRole = function(r){ _applyRoleBeforeF14(r); if(r==='cliente') return; if(r==='vendedor') hidePages(['agenda']); };
const _renderAllBeforeF14 = renderAll;
renderAll = function(){ _renderAllBeforeF14(); renderAppointmentsF14(); };

/* =========================
   FASE 15 PRO - Roles limpios y permisos reales
   ========================= */
const ROLE_PAGES_F15 = {
  admin: ['roles','dashboard','pos','facturas','clientes','miHistorial','inventario','compras','taller','vehiculos','evidencias','garantias','caja','cobrar','contabilidad','reportes','verificador','fase13','config'],
  vendedor: ['dashboard','pos','facturas','clientes','miHistorial','taller','verificador'],
  almacen: ['dashboard','inventario','compras','verificador','fase13'],
  taller: ['dashboard','taller','vehiculos','evidencias','garantias'],
  pintor: ['dashboard','taller','evidencias','vehiculos'],
  cliente: []
};
const ROLE_TEXT_F15 = {
  admin: ['Acceso total','Ventas generales','Ganancias y costos','Usuarios y permisos','Reportes generales','Auditoría','Eliminar clientes','Cambiar precios y tasa BCV'],
  vendedor: ['Crear y editar datos básicos de clientes','Facturar y cobrar','Ver solo sus ventas e historial','Crear presupuesto/orden de trabajo','Consultar stock y precios','Imprimir factura cliente','No elimina clientes','No ve costos ni ganancias'],
  almacen: ['Ver inventario','Crear y editar productos','Entradas y salidas de mercancía','Transferencias de stock','Etiquetas y códigos','Compras y proveedores','No factura','No ve caja ni ganancias'],
  taller: ['Ver órdenes asignadas','Actualizar diagnóstico y estatus','Subir fotos y evidencias','Solicitar repuestos','Marcar listo para entrega','No factura','No ve caja ni ganancias'],
  pintor: ['Ver trabajos de pintura','Estados: preparación, lijado, fondo, pintura, pulido y terminado','Subir fotos antes/después','Agregar observaciones','No factura','No ve costos, caja ni ganancias'],
  cliente: ['Consulta por código','Ve avance del trabajo','Ve y descarga fotos','Ve factura/garantía permitida','No puede modificar nada']
};
function roleF15(){ return (currentUserF8?.role || $('roleSelect')?.value || 'admin'); }
function isAdminF15(){ return roleF15()==='admin'; }
function allowedPagesF15(){ return ROLE_PAGES_F15[roleF15()] || ROLE_PAGES_F15.vendedor; }
const oldApplyRoleF15 = typeof applyRole==='function' ? applyRole : null;
applyRole = function(r){
  document.querySelectorAll('.sidebar button[data-page]').forEach(btn=>{
    const page = btn.dataset.page;
    const ok = (ROLE_PAGES_F15[r]||[]).includes(page);
    btn.style.display = ok ? 'block' : 'none';
  });
  enforceRoleUIF15();
};
const oldShowPageF15 = typeof showPage==='function' ? showPage : null;
showPage = function(p){
  const role=roleF15();
  if(role!=='admin' && !(ROLE_PAGES_F15[role]||[]).includes(p)){
    alert('No tienes permiso para abrir este módulo.');
    p = (ROLE_PAGES_F15[role]||['dashboard'])[0] || 'dashboard';
  }
  oldShowPageF15(p);
  enforceRoleUIF15();
};
function renderRolePermissionsF15(){
  const box=$('rolePermissionsBox'); if(!box) return;
  box.innerHTML = Object.keys(ROLE_TEXT_F15).map(r=>`<div class="card role-card"><h3>${roleLabelF8?roleLabelF8(r):r}</h3><ul>${ROLE_TEXT_F15[r].map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('');
}
function enforceRoleUIF15(){
  const role=roleF15();
  renderRolePermissionsF15();
  // Solo admin puede eliminar clientes, usuarios, ver auditoría y ganancias/costos.
  document.querySelectorAll('button').forEach(btn=>{
    const t=(btn.textContent||'').toLowerCase();
    const dangerous = t.includes('eliminar cliente') || (t==='eliminar') || t.includes('bloquear') || t.includes('activar');
    if(role!=='admin' && dangerous){ btn.style.display='none'; }
  });
  // Bloquear campos administrativos para vendedor/taller/pintor.
  const adminOnlyIds=['companyName','companyRif','companyAddress','companyPhone','firebaseConfig','newUserName','newUserPass','newUserRole','bcvRate','taxRate','pricePercent'];
  adminOnlyIds.forEach(id=>{ const el=$(id); if(el) el.disabled = role!=='admin'; });
  // Ocultar columnas o textos privados si aparecen.
  if(role!=='admin'){
    document.querySelectorAll('.admin-only,.profit-box,.cost-box').forEach(el=>el.style.display='none');
  }
}
const oldDelClientF15 = typeof delClient==='function' ? delClient : null;
delClient = function(id){
  if(!isAdminF15()){ alert('Solo el Administrador puede eliminar clientes.'); return; }
  oldDelClientF15(id);
};
const oldDelProductF15 = typeof delProduct==='function' ? delProduct : null;
delProduct = function(id){
  if(!isAdminF15() && roleF15()!=='almacen'){ alert('No tienes permiso para eliminar productos.'); return; }
  if(roleF15()==='almacen'){ alert('Almacén puede registrar entradas/salidas, pero eliminar productos requiere autorización del Administrador.'); return; }
  oldDelProductF15(id);
};
const oldSaveRateF15 = typeof saveRate==='function' ? saveRate : null;
saveRate = function(){ if(!isAdminF15()){ alert('Solo Administrador puede cambiar tasa BCV.'); return; } oldSaveRateF15(); };
const oldMassPriceUpdateF15 = typeof massPriceUpdate==='function' ? massPriceUpdate : null;
massPriceUpdate = function(){ if(!isAdminF15()){ alert('Solo Administrador puede cambiar precios masivos.'); return; } oldMassPriceUpdateF15(); };
const oldSaveSystemUserF15 = typeof saveSystemUser==='function' ? saveSystemUser : null;
saveSystemUser = function(){ if(!isAdminF15()){ alert('Solo Administrador puede crear usuarios.'); return; } oldSaveSystemUserF15(); };
const oldRenderDashboardF15 = typeof renderDashboard==='function' ? renderDashboard : null;
renderDashboard = function(){ oldRenderDashboardF15(); enforceRoleUIF15(); };
const oldRenderAllF15 = typeof renderAll==='function' ? renderAll : null;
renderAll = function(){ oldRenderAllF15(); renderRolePermissionsF15(); enforceRoleUIF15(); };
document.addEventListener('DOMContentLoaded',()=>{ setTimeout(()=>{renderRolePermissionsF15(); enforceRoleUIF15();},300); });

/* ===== FASES 16, 17 y 18 PRO =====
   Fase 16: Compras avanzadas y cuentas por pagar
   Fase 17: Comisiones y metas por vendedor
   Fase 18: Notificaciones internas
*/
state.payables = state.payables || [];
state.commissionRules = state.commissionRules || [];
state.notifications = state.notifications || [];

function currentSellerF17(){
  try { return (currentUserF8?.user || $('userName')?.value || 'admin').trim().toLowerCase(); }
  catch(e){ return ($('userName')?.value || 'admin').trim().toLowerCase(); }
}
function currentRoleF18(){ return (typeof roleF15==='function' ? roleF15() : ($('roleSelect')?.value || 'admin')); }
function canSeeAllF18(){ return currentRoleF18()==='admin'; }

function savePayableF16(){
  if(currentRoleF18()!=='admin' && currentRoleF18()!=='almacen') return alert('Solo Administrador o Almacén pueden registrar cuentas por pagar.');
  const amount = Number($('apAmount').value||0), paid = Number($('apPaid').value||0);
  const item = {
    id: Date.now().toString(), supplier:$('apSupplier').value.trim(), invoice:$('apInvoice').value.trim(),
    amount, paid, balance: amount-paid, due:$('apDue').value, status:$('apStatus').value,
    notes:$('apNotes').value.trim(), created:new Date().toLocaleString(), user:currentSellerF17()
  };
  if(!item.supplier || !item.amount) return alert('Coloca proveedor y monto.');
  if(item.balance<=0) item.status='pagada'; else if(item.paid>0) item.status='parcial';
  state.payables.push(item);
  ['apSupplier','apInvoice','apAmount','apPaid','apDue','apNotes'].forEach(id=>{ if($(id)) $(id).value=''; });
  save(); renderPayablesF16(); alert('Cuenta por pagar guardada.');
}
function addPaymentToPayableF16(id){
  if(currentRoleF18()!=='admin') return alert('Solo Administrador puede abonar o cerrar cuentas por pagar.');
  const p = state.payables.find(x=>x.id===id); if(!p) return;
  const amount = Number(prompt('Monto del abono $', '0')||0); if(amount<=0) return;
  p.paid = Number(p.paid||0) + amount; p.balance = Number(p.amount||0) - p.paid;
  p.status = p.balance<=0 ? 'pagada' : 'parcial'; p.lastPayment = new Date().toLocaleString();
  save(); renderPayablesF16();
}
function renderPayablesF16(){
  const box=$('payablesList'); if(!box) return;
  const total=state.payables.reduce((s,x)=>s+Number(x.balance||0),0);
  box.innerHTML = `<div class="card"><h3>Saldo pendiente proveedores</h3><strong>${money(total)}</strong><span>${state.payables.length} registros</span></div>` +
  state.payables.slice().reverse().map(p=>`<div class="product-item"><b>${p.supplier}</b> · ${p.invoice||'Sin referencia'}<br>Total: ${money(p.amount)} · Abonado: ${money(p.paid)} · <b>Saldo: ${money(p.balance)}</b><br>Vence: ${p.due||'-'} · Estado: <span class="status">${p.status}</span><p>${p.notes||''}</p><small>Creado: ${p.created} · Usuario: ${p.user||'-'}</small><br>${currentRoleF18()==='admin'?`<button onclick="addPaymentToPayableF16('${p.id}')">Agregar abono</button>`:''}</div>`).join('');
}
function exportPayablesF16(){ exportCSV('cuentas_por_pagar_jimmore.csv', [['proveedor','factura','total','abonado','saldo','vence','estado'], ...state.payables.map(p=>[p.supplier,p.invoice,p.amount,p.paid,p.balance,p.due,p.status])]); }

function saveCommissionRuleF17(){
  if(currentRoleF18()!=='admin') return alert('Solo Administrador puede configurar comisiones.');
  const seller=$('commissionSeller').value.trim().toLowerCase(); if(!seller) return alert('Coloca el usuario vendedor.');
  const rule={seller, percent:Number($('commissionPercent').value||0), goal:Number($('commissionGoal').value||0)};
  state.commissionRules = state.commissionRules.filter(x=>x.seller!==seller); state.commissionRules.push(rule);
  save(); renderCommissionsF17();
}
function salesBySellerF17(seller){
  return state.invoices.filter(i=> (i.seller||i.user||'admin').toLowerCase()===seller.toLowerCase()).reduce((sum,i)=>sum+Number(i.total||0),0);
}
function renderCommissionsF17(){
  const box=$('commissionsBox'); if(!box) return;
  let sellers = canSeeAllF18() ? state.commissionRules.map(x=>x.seller) : [currentSellerF17()];
  if(!sellers.length) sellers = [currentSellerF17()];
  box.innerHTML = sellers.map(s=>{
    const rule = state.commissionRules.find(x=>x.seller===s) || {seller:s,percent:0,goal:0};
    const sales=salesBySellerF17(s); const commission=sales*(Number(rule.percent||0)/100); const progress=rule.goal?Math.min(100,(sales/rule.goal)*100):0;
    return `<div class="product-item"><b>Vendedor: ${s}</b><br>Ventas: ${money(sales)} · Comisión ${rule.percent||0}%: <b>${money(commission)}</b><br>Meta: ${money(rule.goal||0)} · Avance: ${progress.toFixed(0)}%<div class="progress"><span style="width:${progress}%"></span></div></div>`;
  }).join('');
}
function exportCommissionsF17(){
  const rows = state.commissionRules.map(r=>[r.seller, salesBySellerF17(r.seller), r.percent, salesBySellerF17(r.seller)*(r.percent/100), r.goal]);
  exportCSV('comisiones_jimmore.csv', [['vendedor','ventas','porcentaje','comision','meta'], ...rows]);
}

function saveNotificationF18(){
  const n={id:Date.now().toString(), type:$('notifType').value, to:$('notifTo').value.trim(), msg:$('notifMsg').value.trim(), date:new Date().toLocaleString(), status:'pendiente', user:currentSellerF17()};
  if(!n.msg) return alert('Escribe el mensaje.');
  state.notifications.push(n); $('notifTo').value=''; $('notifMsg').value=''; save(); renderNotificationsF18();
}
function markNotificationF18(id){ const n=state.notifications.find(x=>x.id===id); if(n){n.status='enviada/manual'; n.sent=new Date().toLocaleString(); save(); renderNotificationsF18();} }
function generateAutoNotificationsF18(){
  let created=0;
  state.products.filter(p=>Number(p.stock||0)<=Number(p.min||0)).forEach(p=>{ state.notifications.push({id:Date.now()+Math.random()+'', type:'stock', to:'Almacén', msg:`Stock bajo: ${p.name} (${p.stock} unidades).`, date:new Date().toLocaleString(), status:'pendiente', user:'sistema'}); created++; });
  state.payables.filter(p=>p.status!=='pagada').forEach(p=>{ state.notifications.push({id:Date.now()+Math.random()+'', type:'pagar', to:'Administrador', msg:`Cuenta por pagar pendiente con ${p.supplier}: saldo ${money(p.balance)}.`, date:new Date().toLocaleString(), status:'pendiente', user:'sistema'}); created++; });
  state.workOrders.filter(o=>(o.status||'').toLowerCase().includes('listo')).forEach(o=>{ state.notifications.push({id:Date.now()+Math.random()+'', type:'taller', to:o.phone||o.client, msg:`Hola ${o.client}, tu trabajo ${o.code} está listo para entrega.`, date:new Date().toLocaleString(), status:'pendiente', user:'sistema'}); created++; });
  save(); renderNotificationsF18(); alert(`Se generaron ${created} avisos.`);
}
function renderNotificationsF18(){
  const box=$('notificationsList'); if(!box) return;
  let list = state.notifications.slice().reverse();
  if(!canSeeAllF18()) list = list.filter(n=> n.user===currentSellerF17() || n.to===currentSellerF17() || currentRoleF18()==='almacen' && n.type==='stock' || ['taller','pintor'].includes(currentRoleF18()) && n.type==='taller');
  box.innerHTML = list.map(n=>`<div class="product-item"><b>${n.type.toUpperCase()}</b> para ${n.to||'-'}<p>${n.msg}</p><small>${n.date} · Estado: ${n.status}</small><br><button onclick="markNotificationF18('${n.id}')">Marcar como enviada</button></div>`).join('');
}
function exportNotificationsF18(){ exportCSV('notificaciones_jimmore.csv', [['tipo','para','mensaje','fecha','estado'], ...state.notifications.map(n=>[n.type,n.to,n.msg,n.date,n.status])]); }

// Agregar permisos de fases 16-18 al menú por rol.
if(typeof ROLE_PAGES_F15!=='undefined'){
  ROLE_PAGES_F15.admin = [...new Set([...ROLE_PAGES_F15.admin,'cuentasPagar','comisiones','notificaciones'])];
  ROLE_PAGES_F15.vendedor = [...new Set([...ROLE_PAGES_F15.vendedor,'comisiones','notificaciones'])];
  ROLE_PAGES_F15.almacen = [...new Set([...ROLE_PAGES_F15.almacen,'cuentasPagar','notificaciones'])];
  ROLE_PAGES_F15.taller = [...new Set([...ROLE_PAGES_F15.taller,'notificaciones'])];
  ROLE_PAGES_F15.pintor = [...new Set([...ROLE_PAGES_F15.pintor,'notificaciones'])];
  if(typeof ROLE_TEXT_F15!=='undefined'){
    ROLE_TEXT_F15.admin.push('Cuentas por pagar','Comisiones','Notificaciones automáticas');
    ROLE_TEXT_F15.vendedor.push('Ver sus comisiones y avisos');
    ROLE_TEXT_F15.almacen.push('Registrar cuentas por pagar de compras autorizadas','Recibir avisos de stock bajo');
    ROLE_TEXT_F15.taller.push('Recibir avisos de trabajos listos o pendientes');
    ROLE_TEXT_F15.pintor.push('Recibir avisos de pintura asignada');
  }
}
const oldRenderAllF16_18 = renderAll;
renderAll = function(){ oldRenderAllF16_18(); renderPayablesF16(); renderCommissionsF17(); renderNotificationsF18(); };

/* =========================
   FASE 18.2 PRO SENCILLA
   - Administrador con control total de permisos
   - Modo claro ordenado
   - BCV visible y protegido
   - Inventario con buscador
   ========================= */
(function(){
  const ALL_PAGES_182 = ['roles','dashboard','pos','facturas','miHistorial','inventario','taller','clientes','contabilidad','compras','cuentasPagar','comisiones','notificaciones','garantias','evidencias','caja','cobrar','vehiculos','reportes','verificador','fase13','config'];
  const PAGE_NAMES_182 = {
    roles:'Roles',dashboard:'Panel de control',pos:'Punto de venta',facturas:'Facturación',miHistorial:'Mi historial',inventario:'Inventario',taller:'Taller reparaciones',clientes:'Clientes / CRM',contabilidad:'Contabilidad',compras:'Compras / Proveedores',cuentasPagar:'Cuentas por pagar',comisiones:'Comisiones',notificaciones:'Notificaciones',garantias:'Garantías',evidencias:'Fotos / Evidencias',caja:'Cierre de caja',cobrar:'Cuentas por cobrar',vehiculos:'Vehículos / Placas',reportes:'Reportes',verificador:'Verificador precio',fase13:'Herramientas / Etiquetas',config:'Configuración'
  };
  const DEFAULT_ROLE_PAGES_182 = {
    admin: ALL_PAGES_182.slice(),
    vendedor: ['dashboard','pos','facturas','clientes','miHistorial','taller','verificador'],
    almacen: ['dashboard','inventario','compras','cuentasPagar','verificador','fase13'],
    taller: ['dashboard','taller','vehiculos','evidencias','garantias','notificaciones'],
    pintor: ['dashboard','taller','evidencias','vehiculos','notificaciones'],
    cliente: []
  };
  const DEFAULT_ROLE_TEXT_182 = {
    admin:['Acceso total al sistema','Crear usuarios y editar permisos','Cambiar tasa BCV y configuración','Ver costos, caja, reportes y auditoría','Modificar todos los módulos'],
    vendedor:['Vender, cobrar e imprimir factura','Crear clientes y consultar historial','Ver solo sus ventas cuando aplique','Consultar precios y stock','No cambia BCV ni configuración'],
    almacen:['Crear y editar productos','Manejar inventario, compras y proveedores','Generar etiquetas y consultar stock','No factura ni ve ganancias'],
    taller:['Crear y actualizar órdenes','Cambiar estatus de reparación','Subir fotos/evidencias','Ver vehículos y garantías','No ve caja ni contabilidad'],
    pintor:['Ver trabajos de pintura','Actualizar avance y observaciones','Subir fotos antes/después','No factura ni ve costos'],
    cliente:['Consulta por código desde portal cliente','Solo ve avance permitido','No modifica información']
  };
  function ensure182(){
    state.rolePages = state.rolePages || JSON.parse(JSON.stringify(DEFAULT_ROLE_PAGES_182));
    Object.keys(DEFAULT_ROLE_PAGES_182).forEach(r=>{ if(!state.rolePages[r]) state.rolePages[r]=DEFAULT_ROLE_PAGES_182[r].slice(); });
    state.rolePages.admin = ALL_PAGES_182.slice();
    state.version='18.2 PRO sencilla';
    state.config = state.config || {};
    state.config.companyName = state.config.companyName || 'Inversiones Jimmore 0331 C.A.';
  }
  window.pagesForRole182=function(role){ ensure182(); return state.rolePages[role] || DEFAULT_ROLE_PAGES_182.vendedor; };
  window.toggleRolePage182=function(role,page,checked){
    if(role==='admin'){ alert('El administrador siempre tiene acceso total.'); renderRoleEditor182(); return; }
    ensure182();
    let arr = new Set(state.rolePages[role] || []);
    checked ? arr.add(page) : arr.delete(page);
    state.rolePages[role] = Array.from(arr);
    localStorage.setItem('jimmoreDB',JSON.stringify(state));
    applyRole(roleF15 ? roleF15() : (currentUserF8?.role||'admin'));
    renderRoleEditor182();
  };
  window.resetRolePermissions182=function(){
    if(!confirm('¿Restaurar permisos recomendados de la fase 18.2?')) return;
    state.rolePages = JSON.parse(JSON.stringify(DEFAULT_ROLE_PAGES_182));
    localStorage.setItem('jimmoreDB',JSON.stringify(state));
    applyRole(roleF15 ? roleF15() : 'admin');
    renderRoleEditor182();
    alert('Permisos restaurados.');
  };
  window.renderRoleEditor182=function(){
    ensure182();
    const box=$('roleEditorBox');
    if(!box) return;
    const isAdmin=(currentUserF8?.role||$('roleSelect')?.value||'admin')==='admin';
    if(!isAdmin){ box.innerHTML='<div class="warn-note">Solo el Administrador puede editar permisos.</div>'; return; }
    const roles=['vendedor','almacen','taller','pintor'];
    box.innerHTML = `<div class="admin-toolbar-182"><button onclick="resetRolePermissions182()">Restaurar permisos recomendados</button><button class="outline" onclick="exportAll()">Respaldar sistema</button></div>` +
      roles.map(r=>`<div class="role-editor-card"><h4>${roleLabelF8?roleLabelF8(r):r}</h4>${ALL_PAGES_182.filter(p=>p!=='roles'&&p!=='config').map(p=>`<label class="module-chip"><input type="checkbox" ${pagesForRole182(r).includes(p)?'checked':''} onchange="toggleRolePage182('${r}','${p}',this.checked)">${PAGE_NAMES_182[p]||p}</label>`).join('')}</div>`).join('');
  };
  const prevApply = window.applyRole;
  window.applyRole = function(r){
    ensure182();
    const allowed = r==='admin' ? ALL_PAGES_182 : pagesForRole182(r);
    document.querySelectorAll('.sidebar button[data-page]').forEach(btn=>{ btn.style.display = allowed.includes(btn.dataset.page) ? 'block' : 'none'; });
    if(typeof enforceRoleUIF15==='function') enforceRoleUIF15();
    renderRoleEditor182();
  };
  const prevShow = window.showPage;
  window.showPage = function(p){
    ensure182();
    const role=(currentUserF8?.role||$('roleSelect')?.value||'admin');
    const allowed = role==='admin' ? ALL_PAGES_182 : pagesForRole182(role);
    if(!allowed.includes(p)){
      alert('Este rol no tiene permiso para abrir: '+(PAGE_NAMES_182[p]||p));
      p = allowed[0] || 'dashboard';
    }
    document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
    const page=$(p); if(page) page.classList.add('active');
    const title=$('pageTitle'); if(title) title.textContent = PAGE_NAMES_182[p] || document.querySelector(`[data-page="${p}"]`)?.textContent || 'Sistema';
    document.querySelectorAll('.sidebar button').forEach(b=>b.classList.remove('active'));
    document.querySelector(`[data-page="${p}"]`)?.classList.add('active');
    if(typeof renderAll==='function') renderAll();
    if(typeof enforceRoleUIF15==='function') enforceRoleUIF15();
    renderRoleEditor182();
  };
  const prevRenderPerms = window.renderRolePermissionsF15;
  window.renderRolePermissionsF15 = function(){
    const box=$('rolePermissionsBox'); if(!box) return;
    box.innerHTML = Object.keys(DEFAULT_ROLE_TEXT_182).map(r=>`<div class="card role-card"><h3>${roleLabelF8?roleLabelF8(r):r}</h3><ul>${DEFAULT_ROLE_TEXT_182[r].map(x=>`<li>${x}</li>`).join('')}</ul><small>Módulos activos: ${(r==='admin'?ALL_PAGES_182:pagesForRole182(r)).map(p=>PAGE_NAMES_182[p]||p).join(', ')}</small></div>`).join('');
  };
  const prevRenderProducts = window.renderProducts;
  window.renderProducts = function(){
    const box=$('productTable'); if(!box) return;
    let q=(window.__productSearch182||'').toLowerCase();
    let list=(state.products||[]).filter(p=>[p.name,p.code,p.category,p.brand,p.supplier,p.location].join(' ').toLowerCase().includes(q));
    let html='<input class="product-search-182" placeholder="Buscar por nombre, código, marca, categoría, proveedor o ubicación" oninput="window.__productSearch182=this.value; renderProducts()" value="'+(window.__productSearch182||'').replaceAll('"','&quot;')+'">';
    html+='<table class="table"><tr><th>Foto</th><th>Producto / Código</th><th>Marca / Categoría</th><th>Ubicación</th><th>Stock</th><th>Precio</th><th></th></tr>';
    list.forEach(p=>html+=`<tr><td>${p.img?`<img class="thumb" src="${p.img}">`:''}</td><td><b>${p.name||''}</b><br><small>Código: ${p.code||''}</small></td><td>${p.brand||''}<br><small>${p.category||''}</small></td><td>${p.location||''}</td><td><b class="${Number(p.stock||0)<=Number(p.min||0)?'status':''}">${p.stock||0}</b><br><small>Mín: ${p.min||0}</small></td><td>${money(p.price)}<br><small>${bs(Number(p.price||0)*Number(state.rate||0))}</small></td><td><button onclick="editProduct('${p.id}')">Editar</button><button class="danger" onclick="delProduct('${p.id}')">Eliminar</button></td></tr>`);
    box.innerHTML=html+'</table>';
  };
  const prevSaveProduct = window.saveProduct;
  window.saveProduct = function(){
    const id=$('prodId').value||Date.now().toString();
    const f=$('prodImg')?.files?.[0];
    const finish=(img)=>{
      let existing=(state.products||[]).find(x=>String(x.id)===String(id))||{};
      let p={...existing,id,name:$('prodName').value,code:$('prodCode').value||id,category:$('prodCategory').value,brand:$('prodBrand').value,supplier:$('prodSupplier').value,location:$('prodLocation').value,cost:Number($('prodCost').value||0),price:Number($('prodPrice').value||0),wholesale:Number($('prodWholesale')?.value||existing.wholesale||0),stock:Number($('prodStock').value||0),min:Number($('prodMin').value||0),img:img||existing.img||''};
      state.products=(state.products||[]).filter(x=>String(x.id)!==String(id)); state.products.push(p);
      if(typeof addAudit==='function') addAudit('Producto guardado',`${p.name} · Código ${p.code}`);
      clearProductForm(); save();
    };
    if(f){let reader=new FileReader(); reader.onload=e=>finish(e.target.result); reader.readAsDataURL(f);} else finish('');
  };
  const prevEditProduct = window.editProduct;
  window.editProduct = function(id){
    const p=(state.products||[]).find(x=>String(x.id)===String(id)); if(!p)return;
    ['Id','Name','Code','Category','Brand','Supplier','Location','Cost','Price','Stock','Min'].forEach(k=>{ const el=$('prod'+k); if(el) el.value=p[k.toLowerCase()]||''; });
    if($('prodWholesale')) $('prodWholesale').value=p.wholesale||'';
    showPage('inventario');
  };
  const prevRenderAll = window.renderAll;
  window.renderAll=function(){ ensure182(); if(prevRenderAll) prevRenderAll(); renderRoleEditor182(); };
  document.addEventListener('DOMContentLoaded',()=>{ ensure182(); localStorage.setItem('jimmoreDB',JSON.stringify(state)); renderRoleEditor182(); });
})();

/* =========================
   FASE 18.3 PRO SENCILLA
   - Administrador: editar + bloquear + eliminar
   - Eliminar exige clave del administrador
   - Fotos/evidencias vinculadas a órdenes/clientes/placas
   - Clientes buscables por nombre, placa o código
   ========================= */
(function(){
  function esc183(v){ try{return (typeof escapeHtml==='function'?escapeHtml(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])));}catch(e){return String(v??'');} }
  function norm183(v){ try{return (typeof normalizeText==='function'?normalizeText(v):String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''));}catch(e){return String(v||'').toLowerCase();} }
  function role183(){ return (currentUserF8?.role || window.currentUserRole || $('roleSelect')?.value || 'admin'); }
  function isAdmin183(){ return role183()==='admin'; }
  function adminPass183(){ const admin=(state.users||[]).find(u=>u.role==='admin' && u.active!==false) || (state.users||[]).find(u=>String(u.username).toLowerCase()==='admin'); return String(admin?.password || currentUserF8?.password || '1234'); }
  window.adminDeleteConfirm183=function(label){
    if(!isAdmin183()){ alert('Solo el Administrador puede eliminar.'); return false; }
    if(!confirm('¿Seguro que deseas eliminar '+label+'? Esta acción no se puede deshacer.')) return false;
    const pass=prompt('Para confirmar, escribe la clave del Administrador:','');
    if(String(pass)!==adminPass183()){ alert('Clave incorrecta. No se eliminó.'); return false; }
    return true;
  };
  function audit183(action,detail){ if(typeof addAudit==='function') addAudit(action,detail||''); }

  // USUARIOS: editar, bloquear, eliminar
  window.editSystemUser183=function(id){
    if(!isAdmin183()) return alert('Solo Administrador.');
    const u=(state.users||[]).find(x=>String(x.id)===String(id)); if(!u) return;
    if($('newUserName')) $('newUserName').value=u.username||'';
    if($('newUserPass')) $('newUserPass').value=u.password||'';
    if($('newUserRole')) $('newUserRole').value=u.role||'vendedor';
    showPage('config');
  };
  window.deleteSystemUser183=function(id){
    const u=(state.users||[]).find(x=>String(x.id)===String(id)); if(!u) return;
    if(String(u.username).toLowerCase()==='admin') return alert('El usuario admin principal no se elimina. Puedes cambiarle la clave si hace falta.');
    if(!adminDeleteConfirm183('el usuario '+(u.username||''))) return;
    state.users=(state.users||[]).filter(x=>String(x.id)!==String(id)); audit183('Usuario eliminado',u.username||id); save(); renderUsers();
  };
  const prevRenderUsers183=window.renderUsers;
  window.renderUsers=function(){
    const box=$('usersList'); if(!box) return; if(typeof ensureUsersF8==='function') ensureUsersF8();
    box.innerHTML=(state.users||[]).map(u=>`<div class="product-item"><b>${esc183(u.name||u.username)}</b><span class="role-badge">${typeof roleLabelF8==='function'?roleLabelF8(u.role):esc183(u.role)}</span><br>Usuario: ${esc183(u.username)}<br>Estado: ${u.active!==false?'Activo':'Bloqueado'}<br><button onclick="editSystemUser183('${u.id}')">Editar</button><button onclick="toggleUserActive('${u.id}')">${u.active!==false?'Bloquear':'Activar'}</button><button class="danger" onclick="deleteSystemUser183('${u.id}')">Eliminar</button></div>`).join('') || '<p>No hay usuarios.</p>';
  };

  // CUENTAS POR COBRAR: eliminar solo administrador
  window.deleteARF183=function(id){
    const ar=(state.accountsReceivable||[]).find(x=>String(x.id)===String(id)); if(!ar) return;
    if(!adminDeleteConfirm183('la cuenta por cobrar de '+(ar.client||''))) return;
    state.accountsReceivable=(state.accountsReceivable||[]).filter(x=>String(x.id)!==String(id)); audit183('Cuenta por cobrar eliminada',ar.client+' · '+(ar.invoiceId||'')); save(); renderAccountsReceivableF11();
  };
  window.renderAccountsReceivableF11=function(){
    const list=(state.accountsReceivable||[]); const pending=list.filter(a=>a.status!=='Pagado'); const total=pending.reduce((s,a)=>s+Number((a.balance ?? (a.amount-a.paid)) || 0),0); const paid=list.reduce((s,a)=>s+Number(a.paid||0),0);
    if($('arSummary')) $('arSummary').innerHTML=`<div class="card"><h3>Pendientes</h3><strong>${pending.length}</strong><span>Clientes/deudas</span></div><div class="card"><h3>Saldo por cobrar</h3><strong>${money(total)}</strong><span>${bs(total*state.rate)}</span></div><div class="card"><h3>Abonado</h3><strong>${money(paid)}</strong><span>Histórico</span></div>`;
    if($('arList')) $('arList').innerHTML=list.slice().reverse().map(a=>{ const bal=Number((a.balance ?? (a.amount-a.paid)) || 0); return `<div class="product-item"><b>${esc183(a.client)}</b> · Factura/Ref: ${esc183(a.invoiceId||'-')}<br>Total deuda: ${money(a.amount)} · Abonado: ${money(a.paid||0)} · <b>Saldo: ${money(bal)}</b><br>Estado: <span class="status">${esc183(a.status||'Pendiente')}</span><br><small>Creado: ${esc183(a.createdAt||'')} · Actualizado: ${esc183(a.updatedAt||'')}</small><h4>Abonos</h4>${(a.abonos||[]).map(b=>`<small>${esc183(b.date)} · ${money(b.amount)} · ${esc183(b.method||'')} ${b.ref?'· Ref: '+esc183(b.ref):''}</small><br>`).join('')||'<small>Sin abonos</small>'}<br><button onclick="addAbonoF11('${a.id}')">Agregar abono</button><button class="outline" onclick="editARF11('${a.id}')">Editar</button>${isAdmin183()?`<button class="danger" onclick="deleteARF183('${a.id}')">Eliminar</button>`:''}</div>`; }).join('') || '<p>No hay cuentas por cobrar.</p>';
  };

  // VEHICULOS: eliminar solo administrador
  window.deleteVehicleF183=function(id){
    const v=(state.vehicles||[]).find(x=>String(x.id)===String(id)); if(!v) return;
    if(!adminDeleteConfirm183('el vehículo/placa '+(v.plate||''))) return;
    state.vehicles=(state.vehicles||[]).filter(x=>String(x.id)!==String(id)); audit183('Vehículo eliminado',v.plate+' · '+(v.client||'')); save(); renderVehiclesF11();
  };
  window.renderVehiclesF11=function(){
    const q=norm183($('vehSearch')?.value||'');
    const list=(state.vehicles||[]).filter(v=>norm183((v.plate||'')+' '+(v.client||'')+' '+(v.brand||'')+' '+(v.model||'')).includes(q));
    if($('vehicleList')) $('vehicleList').innerHTML=list.map(v=>`<div class="product-item"><b>Placa: ${esc183(v.plate)}</b><br>Cliente: ${esc183(v.client||'-')}<br>${esc183([v.brand,v.model,v.year,v.color].filter(Boolean).join(' · '))}<p>${esc183(v.notes||'')}</p><button onclick="editVehicleF11('${v.id}')">Editar</button><button class="outline" onclick="showVehicleHistoryF11('${esc183(v.plate)}')">Ver historial</button>${isAdmin183()?`<button class="danger" onclick="deleteVehicleF183('${v.id}')">Eliminar</button>`:''}</div>`).join('') || '<p>No hay vehículos registrados.</p>';
  };

  // TALLER: eliminar orden/cliente del taller solo administrador
  window.deleteWorkOrder183=function(id){
    const o=(state.workOrders||[]).find(x=>String(x.id)===String(id)); if(!o) return;
    if(!adminDeleteConfirm183('la orden de taller '+(o.code||o.client||''))) return;
    state.workOrders=(state.workOrders||[]).filter(x=>String(x.id)!==String(id));
    audit183('Orden de taller eliminada',(o.code||'')+' · '+(o.client||'')); save(); renderWorkOrders();
  };
  window.renderWorkOrders=function(){
    if(!$('workOrders')) return;
    $('workOrders').innerHTML=(state.workOrders||[]).slice().reverse().map(o=>`<div class="product-item"><b>${esc183(o.client)}</b> · ${esc183(o.vehicle)}</br>Código cliente: <b>${esc183(o.code)}</b><br>Recibido: ${esc183(o.received||'-')} · Tipo: ${esc183(o.type)}<br>Estado actual: <span class="status">${esc183(o.status)}</span>${typeof renderStatusTimeline==='function'?renderStatusTimeline(o):''}<p>${esc183(o.notes||'')}</p><small>Actualizado: ${esc183(o.updated)}</small><br><button onclick="editWorkOrder('${o.id}')">Editar / actualizar estatus</button><button onclick="copyCode('${esc183(o.code)}')">Copiar código</button>${isAdmin183()?`<button class="danger" onclick="deleteWorkOrder183('${o.id}')">Eliminar</button>`:''}</div>`).join('') || '<p>No hay órdenes registradas.</p>';
  };

  // EVIDENCIAS: vínculo automático por orden/código/placa y eliminar foto solo administrador
  function workByCode183(code){ const c=norm183(code); return (state.workOrders||[]).find(o=>norm183(o.code||'')===c || norm183(o.vehicle||'').includes(c)); }
  window.fillEvidenceFromOrder183=function(){ const o=workByCode183($('evOrder')?.value||''); if(!o) return; if($('evClient')) $('evClient').value=o.client||''; if($('evVehicle')) $('evVehicle').value=o.vehicle||''; };
  const prevSaveEvidence183=window.saveEvidenceF12;
  window.saveEvidenceF12=function(){ fillEvidenceFromOrder183(); if(prevSaveEvidence183) prevSaveEvidence183(); };
  window.deleteEvidenceF183=function(id){
    const e=(state.evidences||[]).find(x=>String(x.id)===String(id)); if(!e) return;
    if(!adminDeleteConfirm183('esta foto/evidencia')) return;
    state.evidences=(state.evidences||[]).filter(x=>String(x.id)!==String(id)); audit183('Evidencia eliminada',(e.orderCode||'')+' · '+(e.client||'')); save(); renderEvidenceF12();
  };
  window.renderEvidenceF12=function(){
    const box=$('evidenceList'); if(!box) return; const q=norm183($('evSearch')?.value||'');
    const list=(state.evidences||[]).filter(e=>norm183([e.orderCode,e.client,e.vehicle,e.stage,e.notes].join(' ')).includes(q)).slice().reverse();
    box.innerHTML=list.map(e=>`<div class="product-item evidence-card">${e.img?`<img class="evidence-img evidence-click" src="${e.img}" onclick="${typeof openEvidenceFullF14==='function'?`openEvidenceFullF14('${e.id}')`:''}">`:''}<b>${esc183(e.stage)}</b> · Código: ${esc183(e.orderCode)}<br>Cliente: ${esc183(e.client||'-')} · Vehículo/placa: ${esc183(e.vehicle||'-')}<p>${esc183(e.notes||'')}</p><small>${esc183(e.date)} · ${esc183(e.createdBy)}</small><br>${e.img&&typeof openEvidenceFullF14==='function'?`<button onclick="openEvidenceFullF14('${e.id}')">Ver grande</button><a class="download-btn small-download" href="${e.img}" download="jimmore_${esc183(e.orderCode)}_${esc183(e.stage)}.jpg">Descargar</a>`:''}${isAdmin183()?`<button class="danger" onclick="deleteEvidenceF183('${e.id}')">Eliminar</button>`:''}</div>`).join('') || '<p>No hay evidencias registradas.</p>';
  };

  // CLIENTES: buscar por cliente, teléfono, placa o código de taller; editar y eliminar solo admin
  window.editClient183=function(id){ const c=(state.clients||[]).find(x=>String(x.id)===String(id)); if(!c) return; showPage('clientes'); if($('crmId')) $('crmId').value=c.id; if($('crmName')) $('crmName').value=c.name||''; if($('crmPhone')) $('crmPhone').value=c.phone||''; if($('crmDocument')) $('crmDocument').value=c.document||c.rif||''; if($('crmAddress')) $('crmAddress').value=c.address||''; if($('crmVehicle')) $('crmVehicle').value=c.vehicle||''; if($('crmNotes')) $('crmNotes').value=c.notes||''; if(typeof showClientHistory==='function') showClientHistory(c.id); };
  window.deleteClient183=function(id){ const c=(state.clients||[]).find(x=>String(x.id)===String(id)); if(!c) return; if(!adminDeleteConfirm183('el cliente '+(c.name||''))) return; state.clients=(state.clients||[]).filter(x=>String(x.id)!==String(id)); audit183('Cliente eliminado',c.name||id); save(); renderClients(); };
  window.renderClients=function(){
    const box=$('clientList'); if(!box) return; const q=norm183($('clientSearch')?.value||'');
    const list=(state.clients||[]).filter(c=>{
      const orders=(state.workOrders||[]).filter(o=>String(o.clientId||'')===String(c.id) || norm183(o.client||'')===norm183(c.name||''));
      const text=[c.name,c.phone,c.document,c.rif,c.address,c.vehicle,c.notes, ...orders.map(o=>(o.code||'')+' '+(o.vehicle||'')+' '+(o.type||''))].join(' ');
      return norm183(text).includes(q);
    });
    box.innerHTML=list.map(c=>{ const orders=(state.workOrders||[]).filter(o=>String(o.clientId||'')===String(c.id) || norm183(o.client||'')===norm183(c.name||'')); return `<div class="product-item"><b>${esc183(c.name)}</b><br>${esc183(c.phone||'-')} · ${esc183(c.vehicle||'Sin placa')}<p>${esc183(c.notes||'')}</p>${orders.length?`<small>Órdenes: ${orders.map(o=>esc183(o.code||o.id)+' / '+esc183(o.vehicle||'')).join(' · ')}</small><br>`:''}<button onclick="editClient183('${c.id}')">Editar</button>${isAdmin183()?`<button class="danger" onclick="deleteClient183('${c.id}')">Eliminar</button>`:''}</div>`; }).join('') || '<p>No hay clientes registrados.</p>';
  };

  // Mejoras visuales en el formulario de evidencias: datalist con códigos existentes
  function setup183(){
    if($('evOrder') && !$('evOrder').getAttribute('list')){
      let dl=document.createElement('datalist'); dl.id='workOrderDatalist183'; document.body.appendChild(dl); $('evOrder').setAttribute('list','workOrderDatalist183'); $('evOrder').setAttribute('oninput','fillEvidenceFromOrder183()');
    }
    const dl=$('workOrderDatalist183'); if(dl){ dl.innerHTML=(state.workOrders||[]).map(o=>`<option value="${esc183(o.code||'')}">${esc183((o.client||'')+' · '+(o.vehicle||'')+' · '+(o.type||''))}</option>`).join(''); }
    const note=$('evidencias')?.querySelector('.note'); if(note) note.textContent='Las fotos quedan unidas al código de orden, cliente y placa. Busca por código, cliente, placa, etapa o nota.';
  }
  const prevRenderAll183=window.renderAll;
  window.renderAll=function(){ if(prevRenderAll183) prevRenderAll183(); setup183(); renderUsers(); renderAccountsReceivableF11(); renderVehiclesF11(); renderWorkOrders(); renderEvidenceF12(); renderClients(); };
  document.addEventListener('DOMContentLoaded',()=>{ state.version='18.8 FIREBASE DATABASE'; localStorage.setItem('jimmoreDB',JSON.stringify(state)); setup183(); renderAll(); });
})();

/* ===================== FASE 18.5 JIMMORE MASTER ERP PRO ===================== */
function setMasterLoginRole(role){
  const select=$('roleSelect'); if(select){select.value=role;}
  document.querySelectorAll('[data-login-role]').forEach(b=>b.classList.toggle('active', b.dataset.loginRole===role));
  if(typeof selectAccessRoleFinal==='function') selectAccessRoleFinal();
}
const _selectAccessRoleFinal184 = selectAccessRoleFinal;
selectAccessRoleFinal=function(){
  if(typeof _selectAccessRoleFinal184==='function') _selectAccessRoleFinal184();
  const role=$('roleSelect')?.value||'admin';
  document.querySelectorAll('[data-login-role]').forEach(b=>b.classList.toggle('active', b.dataset.loginRole===role));
  updateLoginMasterInfo184();
}
function updateLoginMasterInfo184(){
  try{
    const now=new Date();
    if($('loginDateText')) $('loginDateText').textContent=now.toLocaleDateString();
    if($('loginTimeText')) $('loginTimeText').textContent=now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const rate=Number(state.rate||0);
    if($('loginRateText')) $('loginRateText').textContent=rate.toLocaleString('es-VE',{minimumFractionDigits:2,maximumFractionDigits:2})+' Bs / $';
    if($('loginProductsMetric')) $('loginProductsMetric').textContent=(state.products||[]).length;
    const inProcess=(state.workOrders||[]).filter(o=>!String(o.status||'').toLowerCase().includes('entregado')&&!String(o.status||'').toLowerCase().includes('finalizado')).length;
    if($('loginVehiclesMetric')) $('loginVehiclesMetric').textContent=inProcess;
    const today=new Date().toLocaleDateString();
    const sales=(state.invoices||[]).filter(i=>String(i.date||'').includes(today)).reduce((s,i)=>s+Number(i.total||0),0);
    if($('loginSalesMetric')) $('loginSalesMetric').textContent=money(sales);
    const ar=(state.accountsReceivable||[]).filter(a=>a.status!=='Pagado').length;
    if($('loginReceivableMetric')) $('loginReceivableMetric').textContent=ar;
    if($('loginClientsMetric')) $('loginClientsMetric').textContent=(state.clients||[]).length;
  }catch(e){}
}
const _renderDashboard184 = renderDashboard;
renderDashboard=function(){
  if(typeof _renderDashboard184==='function') _renderDashboard184();
  updateLoginMasterInfo184();
}
const _clientCheckFromLoginFinal184 = clientCheckFromLoginFinal;
clientCheckFromLoginFinal=function(){
  const value=($('loginClientCode')?.value||'').trim().toLowerCase();
  if(!value){alert('Coloca código, placa, cédula o teléfono.');return;}
  const type=$('loginClientSearchType')?.value||'codigo';
  let order=null;
  if(type==='codigo') order=(state.workOrders||[]).find(x=>String(x.code||'').toLowerCase()===value);
  if(type==='placa') order=(state.workOrders||[]).find(x=>String(x.vehicle||'').toLowerCase().includes(value) || String(x.plate||'').toLowerCase()===value);
  if(type==='telefono') order=(state.workOrders||[]).find(x=>String(x.phone||'').replace(/\D/g,'').includes(value.replace(/\D/g,'')));
  if(type==='cedula') order=(state.workOrders||[]).find(x=>String(x.cedula||x.document||x.clientId||'').replace(/\D/g,'')===value.replace(/\D/g,''));
  if(order){ openClientPortal(); if($('clientCodeInput')) $('clientCodeInput').value=order.code||value; clientCheck(); return; }
  openClientPortal();
  if($('clientResult')) $('clientResult').innerHTML='<div class="product-item"><b>No encontramos información con ese dato.</b><br>Verifica el código, placa, cédula o teléfono con el taller.</div>';
}
setInterval(updateLoginMasterInfo184,30000);
document.addEventListener('DOMContentLoaded',()=>{setMasterLoginRole($('roleSelect')?.value||'admin');updateLoginMasterInfo184();});


/* ===================== FASE 18.5 PRO: portada premium y BCV rápido ===================== */
function openBCVUpdate185(){
  const actual=Number(state.rate||0).toLocaleString('es-VE',{minimumFractionDigits:2,maximumFractionDigits:2});
  const value=prompt('Tasa BCV actual en Bs por dólar:', actual);
  if(value===null) return;
  const clean=String(value).replace(/\./g,'').replace(',', '.').replace(/[^0-9.]/g,'');
  const n=Number(clean);
  if(!n || n<=0){ alert('Tasa inválida.'); return; }
  state.rate=n;
  localStorage.setItem('jimmoreDB',JSON.stringify(state));
  if(typeof save==='function') save();
  if(typeof updateLoginMasterInfo184==='function') updateLoginMasterInfo184();
  alert('Tasa BCV actualizada a '+n.toLocaleString('es-VE',{minimumFractionDigits:2,maximumFractionDigits:2})+' Bs / $');
}
(function fase185(){
  function stamp185(){
    try{
      if($('loginDateText')) $('loginDateText').textContent=new Date().toLocaleDateString('es-VE');
      if($('loginTimeText')) $('loginTimeText').textContent=new Date().toLocaleTimeString('es-VE',{hour:'2-digit',minute:'2-digit'});
      if($('loginRateText')) $('loginRateText').textContent=Number(state.rate||0).toLocaleString('es-VE',{minimumFractionDigits:2,maximumFractionDigits:2})+' Bs / $';
    }catch(e){}
  }
  setInterval(stamp185,1000);
  document.addEventListener('DOMContentLoaded',()=>{ state.version='18.8 FIREBASE DATABASE'; localStorage.setItem('jimmoreDB',JSON.stringify(state)); stamp185(); });
})();


/* ===================== FASE 18.7 PRO SEGURIDAD Y RESPALDO - ajustes portada, conexión y producción ===================== */
(function fase186(){
  function setVersion186(){
    try{ state.version='18.8 FIREBASE DATABASE'; localStorage.setItem('jimmoreDB',JSON.stringify(state)); }catch(e){}
  }
  function firebaseLabel186(){
    try{
      const status=document.querySelector('.status-strip-login div:nth-child(4) strong');
      const small=document.querySelector('.status-strip-login div:nth-child(4) small');
      if(status){ status.textContent = (window.firebaseReady || firebaseReady) ? 'Firebase conectado' : 'Seguro y Confiable'; status.style.color=(window.firebaseReady || firebaseReady)?'#4dff65':''; }
      if(small){ small.textContent='Versión 18.8 DATABASE SEGURIDAD Y RESPALDO'; }
    }catch(e){}
  }
  function stamp186(){
    try{
      if($('loginDateText')) $('loginDateText').textContent=new Date().toLocaleDateString('es-VE');
      if($('loginTimeText')) $('loginTimeText').textContent=new Date().toLocaleTimeString('es-VE',{hour:'2-digit',minute:'2-digit'});
      if($('loginRateText')) $('loginRateText').textContent=Number(state.rate||0).toLocaleString('es-VE',{minimumFractionDigits:2,maximumFractionDigits:2})+' Bs / $';
      firebaseLabel186();
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    setVersion186();
    stamp186();
    const u=$('userName'); if(u && u.value==='admin') u.value='';
    const phase=document.querySelector('.phase-note'); if(phase) phase.remove();
    const summary=document.querySelector('.login-summary-row'); if(summary) summary.remove();
  });
  setInterval(stamp186,1000);
})();


/* ===================== FASE 18.7 PRO - SEGURIDAD, RESPALDO Y RESTAURACIÓN ===================== */
(function fase187(){
  const CLEAN_KEYS = [
    'invoices','workOrders','clients','accounting','accountsReceivable','payables','vehicles',
    'evidences','warranties','cashClosings','purchases','suppliers','appointments',
    'notifications','commissionRules','backups'
  ];
  const ARRAY_DEFAULTS = {
    invoices:[], workOrders:[], clients:[], accounting:[], accountsReceivable:[], payables:[], vehicles:[],
    evidences:[], warranties:[], cashClosings:[], purchases:[], suppliers:[], appointments:[],
    notifications:[], commissionRules:[], backups:[], products:[], cart:[], audit:[]
  };
  function admin187(){
    try{ return (currentUserF8?.role || window.currentUserRole || $('roleSelect')?.value || 'admin') === 'admin'; }
    catch(e){ return true; }
  }
  function adminPassword187(){
    const users = state.users || [];
    const admin = users.find(u => u.role==='admin' && u.active!==false) || users.find(u => String(u.username||'').toLowerCase()==='admin');
    return String(admin?.password || currentUserF8?.password || '1234');
  }
  function audit187(action, detail){
    state.audit = state.audit || [];
    state.audit.unshift({id:Date.now().toString(), date:new Date().toLocaleString(), user:currentUserF8?.username||$('userName')?.value||'admin', role:currentUserF8?.role||$('roleSelect')?.value||'admin', action, detail:detail||''});
  }
  function download187(filename, content, type){
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([content],{type:type||'application/json'}));
    a.download=filename;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1500);
  }
  window.createBackup187=function(silent){
    const backup={...state, cart:[], backupCreatedAt:new Date().toISOString(), version:'18.7 PRO SEGURIDAD Y RESPALDO'};
    const name='respaldo_jimmore_'+new Date().toISOString().slice(0,10)+'_'+Date.now()+'.json';
    if(!silent) download187(name, JSON.stringify(backup,null,2));
    state.backups = state.backups || [];
    state.backups.unshift({id:Date.now().toString(), date:new Date().toLocaleString(), file:name, user:currentUserF8?.username||'admin'});
    state.backups = state.backups.slice(0,20);
    audit187('Respaldo creado', name);
    localStorage.setItem('jimmoreDB',JSON.stringify(state));
    if($('backupStatus187')) $('backupStatus187').innerHTML='✅ Respaldo creado correctamente: <b>'+name+'</b>';
    return backup;
  };
  window.importBackup187=function(ev){
    if(!admin187()) return alert('Solo el administrador puede importar respaldos.');
    const f=ev?.target?.files?.[0];
    if(!f) return;
    const pass=prompt('Para importar un respaldo, coloca la clave del administrador:');
    if(pass===null) return;
    if(String(pass)!==adminPassword187()) return alert('Clave incorrecta.');
    const reader=new FileReader();
    reader.onload=e=>{
      try{
        const data=JSON.parse(e.target.result);
        if(!data || typeof data!=='object') throw new Error('Archivo inválido');
        const oldUsers=state.users||[];
        state={...data, cart:[]};
        if(!state.users || !state.users.length) state.users=oldUsers;
        state.version='18.8 FIREBASE DATABASE';
        audit187('Respaldo importado', f.name);
        localStorage.setItem('jimmoreDB',JSON.stringify(state));
        if(typeof renderAll==='function') renderAll();
        if($('backupStatus187')) $('backupStatus187').innerHTML='✅ Respaldo importado: <b>'+f.name+'</b>';
        alert('Respaldo importado correctamente.');
      }catch(err){ alert('No se pudo importar. Verifica que sea un respaldo JSON válido.'); }
      if(ev.target) ev.target.value='';
    };
    reader.readAsText(f);
  };
  window.restoreForDelivery187=function(){
    if(!admin187()) return alert('Solo el administrador puede restaurar el sistema.');
    const pass=prompt('Esta acción limpiará información del sistema. Coloca la clave del administrador:');
    if(pass===null) return;
    if(String(pass)!==adminPassword187()) return alert('Clave incorrecta.');
    const phrase=prompt('Para confirmar escribe exactamente: RESTAURAR');
    if(String(phrase||'').trim().toUpperCase()!=='RESTAURAR') return alert('Restauración cancelada.');
    createBackup187(false);
    const keepProducts = !!$('keepProducts187')?.checked;
    const keepConfig = !!$('keepConfig187')?.checked;
    const keepUsers = !!$('keepUsers187')?.checked;
    const preserved={
      rate: state.rate || 120,
      tax: state.tax || 0,
      config: keepConfig ? (state.config||{}) : {companyName:'Inversiones Jimmore 0331 C.A.'},
      users: keepUsers ? (state.users||[]) : (state.users||[]).filter(u=>u.role==='admin'),
      rolePages: keepUsers ? (state.rolePages||{}) : (state.rolePages||{}),
      products: keepProducts ? (state.products||[]) : []
    };
    const clean={...ARRAY_DEFAULTS, ...preserved, version:'18.7 PRO SEGURIDAD Y RESPALDO'};
    clean.audit=[{id:Date.now().toString(), date:new Date().toLocaleString(), user:currentUserF8?.username||'admin', role:'admin', action:'Restauración para entrega', detail:'Se limpió información operativa. Productos: '+(keepProducts?'mantener':'limpiar')+' · Config: '+(keepConfig?'mantener':'limpiar')+' · Usuarios: '+(keepUsers?'mantener':'solo admin')}];
    state=clean;
    localStorage.setItem('jimmoreDB',JSON.stringify(state));
    if(typeof renderAll==='function') renderAll();
    if(typeof updateLoginMasterInfo184==='function') updateLoginMasterInfo184();
    if($('backupStatus187')) $('backupStatus187').innerHTML='✅ Sistema restaurado para entrega. Se creó respaldo antes de limpiar.';
    alert('Sistema restaurado para entrega. Quedó limpio y listo.');
  };
  // Mejorar botón antiguo Exportar respaldo para que use respaldo completo 18.7
  window.exportAll=function(){ createBackup187(false); };
  document.addEventListener('DOMContentLoaded',()=>{
    try{
      state.version='18.8 FIREBASE DATABASE';
      localStorage.setItem('jimmoreDB',JSON.stringify(state));
      const small=document.querySelector('.status-strip-login div:nth-child(4) small'); if(small) small.textContent='Versión 18.8 DATABASE';
      if($('backupStatus187')) $('backupStatus187').innerHTML='Listo para respaldar o preparar el sistema para entrega.';
    }catch(e){}
  });
})();
