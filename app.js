const state = {
  page: document.body.dataset.page,
  user: JSON.parse(localStorage.getItem("tefa_user") || "null"),
  admin: JSON.parse(localStorage.getItem("tefa_admin") || "null"),
  view: location.hash.replace("#","") || "home",
  articles: JSON.parse(localStorage.getItem("tefa_articles") || "[]"),
  users: JSON.parse(localStorage.getItem("tefa_users") || "[]"),
  progress: JSON.parse(localStorage.getItem("tefa_progress") || "[]"),
  attendance: JSON.parse(localStorage.getItem("tefa_attendance") || "[]")
};

const demoArticles = [
  {id:1,title:"TEFA PPLG Angkatan 5 Memulai Periode Baru",author:"Sekretariat TEFA",date:"11 September 2026",image:"https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",body:"Periode kegiatan TEFA PPLG Angkatan 5 resmi berjalan. Seluruh anggota diharapkan aktif mencatat kehadiran, progres proyek, dan dokumentasi kegiatan secara tertib."},
  {id:2,title:"Kolaborasi Tim dalam Pengerjaan Proyek",author:"Divisi Dokumentasi",date:"9 September 2026",image:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",body:"Kolaborasi menjadi bagian penting dalam Teaching Factory. Setiap anggota memiliki tanggung jawab yang saling melengkapi untuk menyelesaikan target proyek."},
  {id:3,title:"Dokumentasi Kegiatan TEFA PPLG",author:"Admin TEFA",date:"7 September 2026",image:"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",body:"Dokumentasi kegiatan digunakan sebagai arsip sekaligus bahan evaluasi perkembangan TEFA PPLG SMK N 11 Semarang."}
];
if(!state.articles.length) state.articles=demoArticles;

const api = async (action, payload={}) => {
  if(CONFIG.DEMO_MODE || !CONFIG.API_URL || CONFIG.API_URL.includes("PASTE_")) return demoApi(action,payload);
  const r=await fetch(CONFIG.API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,...payload})});
  return r.json();
};

function demoApi(action,payload){
  if(action==="register"){ if(state.users.some(u=>u.username===payload.username)) return {ok:false,message:"Username sudah digunakan."}; const u={...payload,id:Date.now(),role:"user"};state.users.push(u);save();return{ok:true,user:u};}
  if(action==="login"){const u=state.users.find(x=>x.username===payload.username&&x.password===payload.password);if(u)return{ok:true,user:u};return{ok:false,message:"Username atau password salah."}}
  if(action==="saveArticle"){state.articles.unshift({...payload,id:Date.now(),date:new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})});save();return{ok:true}}
  if(action==="saveProgress"){state.progress.unshift({...payload,id:Date.now(),status:"Menunggu"});save();return{ok:true}}
  if(action==="saveAttendance"){state.attendance=state.attendance.filter(a=>a.date!==payload.date);state.attendance.push(payload);save();return{ok:true}}
  if(action==="deleteUser"){state.users=state.users.filter(u=>u.id!==payload.id);save();return{ok:true}}
  return {ok:true,articles:state.articles,users:state.users,progress:state.progress,attendance:state.attendance};
}
function save(){localStorage.setItem("tefa_users",JSON.stringify(state.users));localStorage.setItem("tefa_articles",JSON.stringify(state.articles));localStorage.setItem("tefa_progress",JSON.stringify(state.progress));localStorage.setItem("tefa_attendance",JSON.stringify(state.attendance))}
function toast(t){const x=document.createElement("div");x.className="toast";x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),2300)}
function imgFallback(e){e.target.src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"}

function layout(content,active){
 const person=state.page==="admin"?state.admin:state.user;
 return `<div class="shell"><header class="topbar"><div class="topbar-inner"><div class="brand"><div class="brand-mark">T</div><div>TEFA PPLG<small>SMK N 11 SEMARANG · ANGKATAN 5</small></div></div>${person?`<button class="btn small" onclick="go('#profile')"><img class="avatar" src="${person.photo||'https://i.pravatar.cc/80?img=12'}" alt=""> ${person.name||person.nama||"Profil"}</button>`:""}</div></header><main class="container">${content}</main>${person?bottomnav(active):""}</div>`
}
function bottomnav(active){
 const items=state.page==="admin"?[
  ["home","⌂","Beranda"],["news","▤","Berita"],["users","♙","User"],["progress","✓","Progres"],["profile","◎","Profil"]
 ]:[
  ["home","⌂","Home"],["journal","▦","Jurnal"],["progress","✓","Progres"],["news","▤","Berita"],["profile","◎","Profil"]
 ];
 return `<nav class="bottomnav">${items.map(i=>`<button class="navitem ${active===i[0]?'active':''}" onclick="go('#${i[0]}')"><span class="navicon">${i[1]}</span>${i[2]}</button>`).join("")}</nav>`
}

function authUser(){
 if(state.user){go("#home");return}
 document.getElementById("app").innerHTML=`<div class="form-page"><div class="auth"><div class="brand"><div class="brand-mark">T</div><div>TEFA PPLG<small>SMK N 11 SEMARANG</small></div></div><div class="auth-card"><h1>Buat akun TEFA</h1><p>Daftarkan identitas untuk menggunakan jurnal, progres proyek, dan berita.</p><form id="register"><div class="field"><label>Nama lengkap</label><input name="name" required placeholder="Nama lengkap"></div><div class="field"><label>Kelas</label><input name="className" required placeholder="Contoh: XI PPLG 1"></div><div class="field"><label>Jabatan</label><input name="position" required placeholder="Contoh: Anggota"></div><div class="field"><label>Username</label><input name="username" required minlength="4"></div><div class="field"><label>Password</label><input name="password" type="password" required minlength="4"></div><button class="btn primary full">Buat akun & lanjut</button></form><p style="margin:18px 0 0">Sudah punya akun? <button class="linkbtn" onclick="authLogin()">Masuk</button></p></div></div></div>`;
 document.getElementById("register").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const r=await api("register",Object.fromEntries(f));if(r.ok){state.user=r.user;localStorage.setItem("tefa_user",JSON.stringify(r.user));toast("Akun berhasil dibuat");go("#home")}else toast(r.message)}
}
function authLogin(){
 document.getElementById("app").innerHTML=`<div class="form-page"><div class="auth"><div class="brand"><div class="brand-mark">T</div><div>TEFA PPLG<small>SMK N 11 SEMARANG</small></div></div><div class="auth-card"><h1>Masuk</h1><p>Masukkan username dan password TEFA PPLG.</p><form id="login"><div class="field"><label>Username</label><input name="username" required></div><div class="field"><label>Password</label><input name="password" type="password" required></div><button class="btn primary full">Masuk</button></form><p style="margin:18px 0 0">Belum punya akun? <button class="linkbtn" onclick="authUser()">Buat akun</button></p></div></div></div>`;
 document.getElementById("login").onsubmit=async e=>{e.preventDefault();const r=await api("login",Object.fromEntries(new FormData(e.target)));if(r.ok){state.user=r.user;localStorage.setItem("tefa_user",JSON.stringify(r.user));go("#home")}else toast(r.message)}
}
function render(){
 if(state.page==="user"&&!state.user){authUser();return}
 if(state.page==="admin"&&!state.admin){adminLogin();return}
 const v=state.view;
 if(v==="home"||!v) home();
 else if(v==="news") news();
 else if(v==="progress") progress();
 else if(v==="journal") journal();
 else if(v==="users") users();
 else if(v==="profile") profile();
 else home();
}
function home(){
 const person=state.page==="admin"?state.admin:state.user;
 const cards=state.articles.slice(0,3).map(a=>`<article class="card article-card" onclick="openArticle(${a.id})"><img src="${a.image}" onerror="imgFallback(event)"><div class="article-body"><h3>${a.title}</h3><p>${a.body.slice(0,90)}…</p><div class="meta">By ${a.author} · ${a.date}</div></div></article>`).join("");
 const slides=state.articles.slice(0,3).map((a,i)=>`<div class="slide ${i===0?'active':''}" data-slide="${i}" onclick="openArticle(${a.id})"><img src="${a.image}" onerror="imgFallback(event)"><div class="slide-content"><span class="eyebrow">Berita terbaru</span><h2>${a.title}</h2><p>By ${a.author} · ${a.date}</p></div></div>`).join("");
 document.getElementById("app").innerHTML=layout(`<section class="hero"><div class="eyebrow">${state.page==="admin"?"Dashboard Admin":"Teaching Factory PPLG"}</div><h1>Hai, ${person.name||person.nama}!<br>Selamat datang di ${state.page==="admin"?"dashboard admin ":""}TEFA PPLG SMK N 11 SEMARANG.</h1><p>Kelola aktivitas, kehadiran, progres proyek, dan informasi TEFA PPLG Angkatan 5 dalam satu tempat.</p></section><div class="section-head"><h2>Informasi terbaru</h2><button class="btn small" onclick="go('#news')">Lihat semua</button></div><div class="carousel">${slides}<div class="dots">${state.articles.slice(0,3).map((_,i)=>`<span class="dot ${i===0?'active':''}" data-dot="${i}"></span>`).join("")}</div></div><div class="section-head"><h2>Ringkasan</h2></div><div class="grid grid-3"><div class="card"><div class="label">Berita</div><div class="stat">${state.articles.length}</div><div class="muted">artikel tersimpan</div></div><div class="card"><div class="label">Progres</div><div class="stat">${state.progress.length}</div><div class="muted">laporan masuk</div></div><div class="card"><div class="label">Kehadiran</div><div class="stat">${state.attendance.length}</div><div class="muted">jurnal tersimpan</div></div></div><div class="section-head"><h2>Artikel pilihan</h2></div><div class="grid grid-3">${cards}</div><div class="footer">TEFA PPLG · SMK N 11 Semarang · Angkatan 5</div>`, "home");startCarousel()}
function startCarousel(){clearInterval(window.slider);let n=0;window.slider=setInterval(()=>{const s=[...document.querySelectorAll(".slide")];if(!s.length)return;n=(n+1)%s.length;s.forEach((x,i)=>x.classList.toggle("active",i===n));document.querySelectorAll(".dot").forEach((x,i)=>x.classList.toggle("active",i===n))},7000)}
function news(){
 document.getElementById("app").innerHTML=layout(`<div class="section-head"><h2>Semua berita</h2><span class="muted">${state.articles.length} artikel</span></div><div class="grid grid-3">${state.articles.map(a=>`<article class="card article-card" onclick="openArticle(${a.id})"><img src="${a.image}" onerror="imgFallback(event)"><div class="article-body"><h3>${a.title}</h3><p>${a.body.slice(0,120)}…</p><div class="meta">By ${a.author} · ${a.date}</div></div></article>`).join("")}</div>`,"news")
}
function openArticle(id){const a=state.articles.find(x=>x.id==id);if(!a)return;const m=document.createElement("div");m.className="modal show";m.innerHTML=`<div class="modal-box article-full"><button class="btn small" onclick="this.closest('.modal').remove()">← Kembali</button><img src="${a.image}" onerror="imgFallback(event)" style="margin-top:15px"><h1>${a.title}</h1><div class="byline">By ${a.author} · ${a.date}</div><p>${a.body.replace(/\n/g,"<br>")}</p></div>`;document.body.appendChild(m)}
function progress(){
 const isAdmin=state.page==="admin";
 document.getElementById("app").innerHTML=layout(`<div class="section-head"><h2>${isAdmin?"Laporan progres yang masuk":"Laporan progres proyek"}</h2></div>${isAdmin?`<div class="grid">${state.progress.length?state.progress.map(p=>`<div class="card"><div class="label">${p.date||"Tanggal tidak tersedia"}</div><h3 style="margin:7px 0">${p.name} · ${p.position}</h3><p><b>Pengerjaan:</b> ${p.work}</p><p class="muted"><b>Catatan:</b> ${p.note||"-"}</p><div class="actions"><span class="status pending">${p.status}</span>${p.evidence?`<a class="btn small" target="_blank" href="${p.evidence}">Buka bukti</a>`:""}</div></div>`).join(""):`<div class="card notice">Belum ada laporan progres.</div>`}</div>`:`<div class="card"><form id="progressForm"><div class="grid grid-2"><div class="field"><label>Nama</label><input name="name" value="${state.user.name}" required></div><div class="field"><label>Jabatan</label><input name="position" value="${state.user.position||""}" required></div></div><div class="field"><label>Pengerjaan</label><input name="work" required placeholder="Contoh: Membuat halaman dashboard"></div><div class="field"><label>Catatan</label><textarea name="note" placeholder="Keterangan progres, kendala, hasil..."></textarea></div><div class="field"><label>Bukti dokumentasi</label><input id="evidenceFile" type="file" accept="image/jpeg,image/png,image/webp"></div><div class="notice">Untuk GitHub Pages + Apps Script, file bukti idealnya dikirim ke Google Drive melalui backend Apps Script. Demo ini menyimpan link/data secara lokal.</div><br><button class="btn primary">Kirim laporan</button></form></div>`,"progress");
 if(!isAdmin)document.getElementById("progressForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const file=document.getElementById("evidenceFile").files[0];const p=Object.fromEntries(f);p.date=new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});p.user=state.user.username;if(file){p.evidence="";toast("Demo: bukti file belum diunggah ke Drive. Backend Apps Script akan menangani ini.");}const r=await api("saveProgress",p);if(r.ok){toast("Laporan progres terkirim");e.target.reset();setTimeout(()=>go("#home"),500)}}
}
function journal(){
 if(state.page==="admin"){return}
 if(state.user.position?.toLowerCase().includes("sekretaris")||sessionStorage.getItem("secretaryAuth")==="yes"){journalPage();return}
 document.getElementById("app").innerHTML=layout(`<div class="card" style="max-width:520px;margin:40px auto"><h2>Jurnal kehadiran sekretaris</h2><p class="muted">Fitur ini membutuhkan sign in ulang khusus sekretaris.</p><form id="sec"><div class="field"><label>Username</label><input name="username" required></div><div class="field"><label>Password</label><input name="password" type="password" required></div><button class="btn primary full">Sign in sekretaris</button></form></div>`,"journal");
 document.getElementById("sec").onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));if(f.username===state.user.username&&f.password===state.user.password&&state.user.position.toLowerCase().includes("sekretaris")){sessionStorage.setItem("secretaryAuth","yes");journalPage()}else toast("Akses hanya untuk akun dengan jabatan Sekretaris.")}
}
function journalPage(){
 const today=new Date().toISOString().slice(0,10);
 document.getElementById("app").innerHTML=layout(`<div class="section-head"><h2>Jurnal kehadiran</h2><button class="btn primary" onclick="exportPDF()">Ekspor ke PDF</button></div><div class="grid grid-2"><div class="card"><div class="field"><label>Pilih tanggal</label><input id="attDate" type="date" value="${today}"></div><div class="notice">Pilih tanggal untuk membuka absensi hari tersebut. Data akan menjadi bagian jurnal PDF.</div></div><div class="card"><div class="label">Rekap tersimpan</div><div class="stat">${state.attendance.length}</div><div class="muted">tanggal jurnal</div></div></div><div class="card" style="margin-top:18px"><div class="section-head" style="margin-top:0"><h2>Absensi</h2><button class="btn accent" onclick="saveJournal()">Simpan jurnal</button></div><div class="table-wrap"><table class="table"><thead><tr><th>Nama</th><th>Kelas</th><th>Status</th><th>Catatan</th></tr></thead><tbody>${state.users.map(u=>`<tr><td>${u.name}</td><td>${u.className||"-"}</td><td><select data-att="${u.username}"><option>Hadir</option><option>Izin</option><option>Sakit</option><option>Alpa</option></select></td><td><input data-note="${u.username}" placeholder="Opsional"></td></tr>`).join("")}</tbody></table></div></div>`,"journal")
}
async function saveJournal(){const date=document.getElementById("attDate").value;const records=state.users.map(u=>({name:u.name,className:u.className,status:document.querySelector(`[data-att="${u.username}"]`).value,note:document.querySelector(`[data-note="${u.username}"]`).value}));const r=await api("saveAttendance",{date,records,createdBy:state.user.username});if(r.ok){toast("Jurnal tersimpan");journalPage()}}
function exportPDF(){const d=document.getElementById("attDate").value;const a=state.attendance.find(x=>x.date===d);if(!a){toast("Simpan jurnal tanggal tersebut terlebih dahulu.");return}const w=window.open("","_blank");w.document.write(`<html><head><title>Jurnal Kehadiran ${d}</title><style>body{font-family:Arial;padding:35px}h1{text-align:center}p{text-align:center;color:#555}table{width:100%;border-collapse:collapse;margin-top:25px}th,td{border:1px solid #bbb;padding:9px;text-align:left}th{background:#eee}</style></head><body><h1>JURNAL KEHADIRAN TEFA PPLG</h1><p>SMK N 11 SEMARANG · Angkatan 5<br>Tanggal: ${d}</p><table><tr><th>No</th><th>Nama</th><th>Kelas</th><th>Status</th><th>Catatan</th></tr>${a.records.map((r,i)=>`<tr><td>${i+1}</td><td>${r.name}</td><td>${r.className}</td><td>${r.status}</td><td>${r.note||"-"}</td></tr>`).join("")}</table><p style="margin-top:40px">Sekretaris TEFA PPLG</p><script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close()}
function users(){
 document.getElementById("app").innerHTML=layout(`<div class="section-head"><h2>Data pengguna</h2><span class="muted">${state.users.length} pengguna</span></div><div class="card table-wrap"><table class="table"><thead><tr><th>Nama</th><th>Username</th><th>Kelas</th><th>Jabatan</th><th>Aksi</th></tr></thead><tbody>${state.users.map(u=>`<tr><td>${u.name}</td><td>${u.username}</td><td>${u.className||"-"}</td><td>${u.position||"Anggota"}</td><td><button class="btn small" onclick="editUser(${u.id})">Ubah</button> <button class="btn danger small" onclick="removeUser(${u.id})">Hapus</button></td></tr>`).join("")}</tbody></table></div>`,"users")
}
function editUser(id){const u=state.users.find(x=>x.id==id);const m=document.createElement("div");m.className="modal show";m.innerHTML=`<div class="modal-box"><button class="btn small" onclick="this.closest('.modal').remove()">Tutup</button><h2>Ubah pengguna</h2><form id="edit"><div class="field"><label>Nama</label><input name="name" value="${u.name}"></div><div class="field"><label>Kelas</label><input name="className" value="${u.className||""}"></div><div class="field"><label>Jabatan</label><input name="position" value="${u.position||""}"></div><div class="field"><label>Password</label><input name="password" value="${u.password}"></div><button class="btn primary">Simpan</button></form></div>`;document.body.appendChild(m);m.querySelector("form").onsubmit=e=>{e.preventDefault();Object.assign(u,Object.fromEntries(new FormData(e.target)));save();m.remove();users();toast("Data pengguna diubah")}}
function removeUser(id){if(confirm("Hapus pengguna ini?")){state.users=state.users.filter(u=>u.id!==id);save();users()}}
function profile(){
 const p=state.page==="admin"?state.admin:state.user;
 document.getElementById("app").innerHTML=layout(`<div class="card"><div class="profile"><img class="profile-big" src="${p.photo||'https://i.pravatar.cc/180?img=12'}"><div><h2>${p.name||p.nama}</h2><div class="muted">${p.position||"Admin"} · ${p.className||"TEFA PPLG"}</div></div></div><hr style="border:0;border-top:1px solid #edf0ec;margin:24px 0"><form id="profileForm"><div class="grid grid-2"><div class="field"><label>Nama</label><input name="name" value="${p.name||p.nama||""}"></div><div class="field"><label>Username</label><input value="${p.username||""}" disabled></div><div class="field"><label>Kelas</label><input name="className" value="${p.className||""}"></div><div class="field"><label>Jabatan</label><input name="position" value="${p.position||""}"></div><div class="field"><label>Password</label><input name="password" value="${p.password||""}" type="password"></div></div><div class="field"><label>Foto profil (URL)</label><input name="photo" value="${p.photo||""}" placeholder="https://..."></div><button class="btn primary">Simpan perubahan</button> <button type="button" class="btn danger" onclick="logout()">Keluar</button></form></div>`,"profile");
 document.getElementById("profileForm").onsubmit=e=>{e.preventDefault();Object.assign(p,Object.fromEntries(new FormData(e.target)));if(state.page==="admin"){state.admin=p;localStorage.setItem("tefa_admin",JSON.stringify(p))}else{state.user=p;localStorage.setItem("tefa_user",JSON.stringify(p))}save();toast("Profil diperbarui");profile()}
}
function logout(){if(state.page==="admin"){localStorage.removeItem("tefa_admin");state.admin=null}else{localStorage.removeItem("tefa_user");state.user=null}location.reload()}
function adminLogin(){
 document.getElementById("app").innerHTML=`<div class="form-page"><div class="auth"><div class="brand"><div class="brand-mark">T</div><div>TEFA PPLG<small>ADMINISTRATOR</small></div></div><div class="auth-card"><h1>Dashboard Admin</h1><p>Masuk untuk mengelola berita, pengguna, dan laporan progres.</p><form id="adminLogin"><div class="field"><label>Nama</label><input name="name" required></div><div class="field"><label>Username</label><input name="username" required></div><div class="field"><label>Password</label><input name="password" type="password" required></div><button class="btn primary full">Masuk dashboard</button></form></div></div></div>`;
 document.getElementById("adminLogin").onsubmit=e=>{e.preventDefault();const p=Object.fromEntries(new FormData(e.target));state.admin=p;localStorage.setItem("tefa_admin",JSON.stringify(p));go("#home")}
}
function adminAddNews(){
 const m=document.createElement("div");m.className="modal show";m.innerHTML=`<div class="modal-box"><button class="btn small" onclick="this.closest('.modal').remove()">Tutup</button><h2>Upload berita</h2><form id="newsForm"><div class="field"><label>Judul</label><input name="title" required></div><div class="field"><label>Penulis</label><input name="author" value="${state.admin.name||"Admin"}" required></div><div class="field"><label>URL foto</label><input name="image" placeholder="https://..." required></div><div class="field"><label>Isi berita</label><textarea name="body" required></textarea></div><button class="btn primary">Publikasikan</button></form></div>`;document.body.appendChild(m);m.querySelector("form").onsubmit=async e=>{e.preventDefault();const r=await api("saveArticle",Object.fromEntries(new FormData(e.target)));if(r.ok){m.remove();toast("Berita dipublikasikan");home()}}}
function adminHome(){
 const person=state.admin;
 document.getElementById("app").innerHTML=layout(`<section class="hero"><div class="eyebrow">Administrator</div><h1>Hai, ${person.name||person.nama}!<br>Selamat datang di dashboard admin TEFA PPLG SMK N 11 SEMARANG!</h1><p>Panel pengelolaan konten, pengguna, progres proyek, dan arsip kegiatan.</p></section><div class="section-head"><h2>Kelola cepat</h2></div><div class="grid grid-3"><div class="card"><div class="label">Berita</div><div class="stat">${state.articles.length}</div><button class="btn primary" onclick="adminAddNews()">+ Upload berita</button></div><div class="card"><div class="label">Pengguna</div><div class="stat">${state.users.length}</div><button class="btn" onclick="go('#users')">Kelola user</button></div><div class="card"><div class="label">Progres</div><div class="stat">${state.progress.length}</div><button class="btn" onclick="go('#progress')">Lihat laporan</button></div></div><div class="section-head"><h2>Berita terbaru</h2></div><div class="grid grid-3">${state.articles.slice(0,3).map(a=>`<article class="card article-card" onclick="openArticle(${a.id})"><img src="${a.image}" onerror="imgFallback(event)"><div class="article-body"><h3>${a.title}</h3><div class="meta">By ${a.author} · ${a.date}</div></div></article>`).join("")}</div>`,"home")
}
function go(hash){location.hash=hash.replace("#","");state.view=location.hash.replace("#","")||"home";if(state.page==="admin"&&state.view==="home")adminHome();else render()}
window.addEventListener("hashchange",()=>{state.view=location.hash.replace("#","")||"home";if(state.page==="admin"&&state.view==="home")adminHome();else render()});
if(state.page==="admin"&&state.admin)adminHome();else render();
