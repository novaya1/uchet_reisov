const STORE='truck_trips_v2';
let trips=JSON.parse(localStorage.getItem(STORE)||'[]');
let currentId=null;
const $=id=>document.getElementById(id);
const fields=['name','status','from','to','dateOut','dateIn','rate','bonus','fuel','roads','parking','repair','other','notes'];
const money=n=>new Intl.NumberFormat('ru-RU').format(Number(n||0))+' ₽';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const n=id=>Number($(id).value||0);
function saveStore(){localStorage.setItem(STORE,JSON.stringify(trips));}
function calcFrom(t){const expenses=+t.fuel||0;return {expenses:(+t.fuel||0)+(+t.roads||0)+(+t.parking||0)+(+t.repair||0)+(+t.other||0),income:(+t.rate||0)+(+t.bonus||0)}}
function calcPreview(){const expenses=n('fuel')+n('roads')+n('parking')+n('repair')+n('other');const income=n('rate')+n('bonus');$('expensesPreview').textContent=money(expenses);$('incomePreview').textContent=money(income);$('netPreview').textContent=money(income-expenses);$('statusBadge').textContent=$('status').value;}
function render(){
  const q=$('searchInput').value.trim().toLowerCase();
  const list=trips.filter(t=>`${t.name} ${t.from} ${t.to}`.toLowerCase().includes(q));
  $('emptyState').classList.toggle('hidden',trips.length>0);
  $('tripList').innerHTML=list.map(t=>{const c=calcFrom(t),net=c.income-c.expenses;const title=t.name||`${t.from||'Откуда'} → ${t.to||'Куда'}`;return `<article class="trip-card" data-id="${t.id}"><div class="trip-top"><div><h3>${esc(title)}</h3><div class="route">${esc(t.from||'—')} → ${esc(t.to||'—')}</div></div><div class="trip-money"><strong>${money(net)}</strong><span>чистыми</span></div></div><div class="trip-bottom"><span>${esc(t.dateOut||'Без даты')} ${t.dateIn?'→ '+esc(t.dateIn):''}</span><span class="badge ${t.status==='Завершён'?'done':''}">${esc(t.status||'В рейсе')}</span></div></article>`}).join('');
  document.querySelectorAll('.trip-card').forEach(el=>el.addEventListener('click',()=>openTrip(el.dataset.id)));
  const totals=trips.reduce((a,t)=>{const c=calcFrom(t);a.income+=c.income;a.exp+=c.expenses;return a},{income:0,exp:0});
  $('sumTrips').textContent=trips.length;$('sumIncome').textContent=money(totals.income);$('sumExpenses').textContent=money(totals.exp);$('sumNet').textContent=money(totals.income-totals.exp);
}
function show(view){$('homeView').classList.toggle('active',view==='home');$('editView').classList.toggle('active',view==='edit');window.scrollTo({top:0,behavior:'smooth'});}
function newTrip(){currentId=null;fields.forEach(f=>$(f).value=f==='status'?'В рейсе':'');$('editorTitle').textContent='Новый рейс';$('deleteBtn').classList.add('hidden');calcPreview();show('edit');}
function openTrip(id){const t=trips.find(x=>x.id===id);if(!t)return;currentId=id;fields.forEach(f=>$(f).value=t[f]??(f==='status'?'В рейсе':''));$('editorTitle').textContent=t.name||'Рейс';$('deleteBtn').classList.remove('hidden');calcPreview();show('edit');}
$('tripForm').addEventListener('submit',e=>{e.preventDefault();const t={id:currentId||crypto.randomUUID()};fields.forEach(f=>t[f]=$(f).value);if(!t.name)t.name=`${t.from||'Рейс'}${t.to?' — '+t.to:''}`;if(currentId)trips=trips.map(x=>x.id===currentId?t:x);else trips.unshift(t);saveStore();render();show('home');});
$('deleteBtn').addEventListener('click',()=>{if(!currentId)return;if(confirm('Удалить этот рейс?')){trips=trips.filter(x=>x.id!==currentId);saveStore();render();show('home');}});
$('backBtn').addEventListener('click',()=>show('home'));$('addTripMain').addEventListener('click',newTrip);$('addTripTop').addEventListener('click',newTrip);$('searchInput').addEventListener('input',render);fields.filter(f=>['rate','bonus','fuel','roads','parking','repair','other','status'].includes(f)).forEach(f=>$(f).addEventListener('input',calcPreview));$('status').addEventListener('change',calcPreview);
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{});}render();
