/* ANIMASI TEMA GELAP DAN TERANG (INTRO SCREEN) */
(function initIntro() {
    const savedTheme = localStorage.getItem('k7_theme');
    const intro = document.getElementById('introScreen');

    if (savedTheme === 'light') {
        intro.classList.add('intro-light');
    } else {
        intro.classList.add('intro-dark');
    }

    const container = document.getElementById('introParticles');
    for (let i = 0; i < 28; i++) {
        const dot = document.createElement('div');
        dot.className = 'intro-dot';
        dot.style.left            = Math.random() * 100 + '%';
        dot.style.top             = Math.random() * 100 + '%';
        dot.style.animationDelay    = Math.random() * 3 + 's';
        dot.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(dot);
    }
})();


/* TEMA GELAP & TERANG */
const theme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', theme);

let isDark = true;

function toggleTheme() {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.querySelector('.theme-toggle').textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('k7_theme', isDark ? 'dark' : 'light');
}

(function () {
    const saved = localStorage.getItem('k7_theme');
    if (saved === 'light') {
        isDark = false;
        document.documentElement.setAttribute('data-theme', 'light');
        document.querySelector('.theme-toggle').textContent = '☀️';
    }
})();


/* DATA SISWA — INPUT & GENERATE FIELDS */
const inputContainer = document.getElementById('nilaiInputs');
const jumlahInput    = document.getElementById('jumlahNilai');

function generateFields() {
    inputContainer.innerHTML = '';
    const count = Math.min(Math.max(parseInt(jumlahInput.value) || 1, 1), 25);
    for (let i = 0; i < count; i++) {
        const wrap = document.createElement('div');
        const lbl  = document.createElement('p');
        lbl.className   = 'label-sm';
        lbl.textContent = `Mata Pelajaran ${i + 1}`;
        const inp = document.createElement('input');
        inp.type        = 'number';
        inp.placeholder = '0 – 100';
        inp.className   = 'nilai-field';
        inp.id          = `n-${i}`;
        wrap.appendChild(lbl);
        wrap.appendChild(inp);
        inputContainer.appendChild(wrap);
    }
}

jumlahInput.addEventListener('input', generateFields);
window.addEventListener('load', generateFields);


/* TOAST NOTIFIKASI */
function showToast(msg, type = '') {
    const t = document.createElement('div');
    t.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 100);
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 500);
    }, 3200);
}

function showToastExtra(msg) {
    const t = document.createElement('div');
    t.className    = 'toast';
    t.innerText    = msg;
    t.style.bottom = '80px';
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 100);
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 500);
    }, 3200);
}


/* ANALISIS NILAI SISWA */
function processAnalysis() {
    const nama     = document.getElementById('nama').value.trim();
    const nisVal   = document.getElementById('nisManual').value.trim();
    const kelasVal = document.getElementById('kelasManual').value;
    const inputs   = document.querySelectorAll('.nilai-field');
    let total = 0, valid = true, count = 0;

    if (!nama) { showToast('⚠ Masukkan Nama Siswa Terlebih Dahulu!', 'error'); return; }

    inputs.forEach(inp => {
        const v = parseFloat(inp.value);
        if (isNaN(v) || v < 0 || v > 100) { valid = false; }
        else { total += v; count++; }
    });

    if (!valid || count === 0) { showToast('⚠ Semua Nilai harus antara 0 – 100!', 'error'); return; }

    const rata   = total / count;
    const grade  = hitungPredikat(rata);
    const status = rata >= 75 ? 'LULUS' : 'TIDAK LULUS';

    const resultDiv = document.getElementById('results');
    resultDiv.style.display = 'block';
    setTimeout(() => { document.getElementById('bar').style.width = rata + '%'; }, 100);

    const statusTag = document.getElementById('statusTag');
    statusTag.innerText           = `STATUS SISWA: ${status}`;
    statusTag.style.background    = status === 'LULUS' ? 'rgba(0,242,255,0.1)' : 'rgba(239,68,68,0.1)';
    statusTag.style.color         = status === 'LULUS' ? 'var(--accent)' : '#ff4444';
    statusTag.style.borderColor   = status === 'LULUS' ? 'var(--accent)' : '#ff4444';

    document.getElementById('resultContent').innerHTML = `
        <div class="result-box">
            <span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">NAMA SISWA</span>
            <span class="val" style="font-size:1.05rem;color:var(--accent)">${nama.toUpperCase()}</span>
        </div>
        ${nisVal
            ? `<div class="result-box">
                   <span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">NIS</span>
                   <span class="val" style="font-size:1.1rem;">${nisVal}</span>
               </div>`
            : ''}
        ${kelasVal
            ? `<div class="result-box">
                   <span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">KELAS</span>
                   <span class="val" style="font-size:1.1rem;">${kelasVal}</span>
               </div>`
            : ''}
        <div class="result-box">
            <span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">RATA-RATA</span>
            <span class="val">${rata.toFixed(1)}</span>
        </div>
        <div class="result-box">
            <span style="font-size:0.65rem;opacity:0.55;letter-spacing:2px;">PREDIKAT</span>
            <span class="val" style="color:var(--accent-purple)">${grade}</span>
        </div>
    `;

    if (status === 'LULUS') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#00f2ff', '#7000ff', '#ffffff'] });
    }
    resultDiv.scrollIntoView({ behavior: 'smooth' });
    _hookSimpanSiswa(nama, nisVal, kelasVal);
}


/* DATA PERSISTEN */
let daftarSiswa = JSON.parse(localStorage.getItem('k7_siswa') || '[]');
let daftarMapel = JSON.parse(localStorage.getItem('k7_mapel') || '[]');
let daftarNilai = JSON.parse(localStorage.getItem('k7_nilai') || '[]');

function simpanState() {
    localStorage.setItem('k7_siswa', JSON.stringify(daftarSiswa));
    localStorage.setItem('k7_mapel', JSON.stringify(daftarMapel));
    localStorage.setItem('k7_nilai', JSON.stringify(daftarNilai));
}


/* NAVIGASI TAB */
function switchTab(tabId) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));

    const panel = document.getElementById(tabId);
    if (panel) panel.classList.add('active');

    const btn = document.querySelector(`[data-tab="${tabId}"]`);
    if (btn) btn.classList.add('active');

    if (tabId === 'tab-siswa') renderSiswaTable();
    if (tabId === 'tab-nilai') {
        refreshSelectSiswa();
        refreshSelectMapel();
        renderNilaiTable();
    }
    if (tabId === 'tab-leger') renderLeger();
}


/* INISIALISASI SAAT DOM SIAP */
window.addEventListener('DOMContentLoaded', () => {
    renderSiswaTable();
    renderMapelList();
    renderNilaiTable();
    renderLeger();

    ['nilaiTugas', 'nilaiUTS', 'nilaiUAS'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', previewNilai);
    });
    document.getElementById('nilaiMapelSelect')?.addEventListener('change', previewNilai);
});


/* SIMPAN SISWA DARI INPUT DATA */
function _hookSimpanSiswa(nama, nisVal, kelasVal) {
    if (!nama) return;
    const sudahAda = daftarSiswa.find(s => s.nama.toLowerCase() === nama.toLowerCase());
    if (!sudahAda) {
        const nis   = nisVal  || 'S' + Date.now().toString().slice(-6);
        const kelas = kelasVal || '—';
        daftarSiswa.push({ id: nis, nis, nama: nama.toUpperCase(), kelas });
        simpanState();
        renderSiswaTable();
        showToastExtra(`✓ Siswa "${nama.toUpperCase()}" ditambahkan`);
    }
}


/* TABEL DAFTAR SISWA */
function renderSiswaTable() {
    const tbody = document.getElementById('siswaTableBody');
    if (!tbody) return;

    if (daftarSiswa.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="5">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <img src="https://cdn-icons-png.flaticon.com/128/16769/16769643.png" width="50px"/>
                    </div>
                    <div class="empty-state-text">Belum ada data siswa</div>
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = daftarSiswa.map((s, i) => `
        <tr>
            <td style="color:var(--text-muted);font-size:0.78rem;">${i + 1}</td>
            <td style="font-family:'Space Grotesk',sans-serif;color:var(--text-muted);font-size:0.82rem;">${s.nis}</td>
            <td style="font-weight:600;">${s.nama}</td>
            <td style="color:var(--text-muted);font-size:0.82rem;">${s.kelas || '—'}</td>
            <td><button class="btn-action" onclick="hapusSiswa('${s.id}')">Hapus</button></td>
        </tr>
    `).join('');
}


/* MATA PELAJARAN & GURU */
function tambahMapel() {
    const nama  = document.getElementById('namaMapel').value.trim();
    const guru  = document.getElementById('namaGuru').value.trim();
    const kelas = document.getElementById('kelasMapel').value;
    const kkm   = parseInt(document.getElementById('kkm').value) || 75;

    if (!nama) { showToastExtra('⚠ Nama Mata Pelajaran wajib diisi!'); return; }
    if (!guru) { showToastExtra('⚠ Nama Guru wajib diisi!'); return; }

    const sudahAda = daftarMapel.find(
        m => m.nama.toLowerCase() === nama.toLowerCase() && m.kelas === kelas
    );
    if (sudahAda) { showToastExtra('⚠ Mata Pelajaran ini sudah ada untuk kelas tersebut!'); return; }

    daftarMapel.push({ id: 'MP' + Date.now(), nama, guru, kelas, kkm });
    simpanState();
    renderMapelList();
    document.getElementById('namaMapel').value = '';
    document.getElementById('namaGuru').value  = '';
    showToastExtra(`✓ Mapel "${nama}" berhasil disimpan!`);
}

function hapusMapel(id) {
    daftarMapel = daftarMapel.filter(m => m.id !== id);
    simpanState();
    renderMapelList();
}

function renderMapelList() {
    const el = document.getElementById('mapelList');
    if (!el) return;

    if (daftarMapel.length === 0) {
        el.innerHTML = `
            <div class="empty-state" style="padding:30px;">
                <div class="empty-state-icon">
                    <img src="https://cdn-icons-png.flaticon.com/128/9585/9585435.png" width="50px"/>
                </div>
                <div class="empty-state-text">Belum ada mata pelajaran</div>
            </div>`;
        return;
    }

    el.innerHTML = daftarMapel.map((m, i) => `
        <div class="mapel-card">
            <div class="mapel-num">${String(i + 1).padStart(2, '0')}</div>
            <div class="mapel-info">
                <div class="mapel-nama">${m.nama}</div>
                <div class="mapel-detail">
                    <span>${m.kelas || '—'}</span>
                    <span class="mapel-detail-sep">•</span>
                    <span>${m.guru}</span>
                    <span class="mapel-detail-sep">•</span>
                    <span class="mapel-kkm">KKM ${m.kkm}</span>
                </div>
            </div>
            <button class="btn-action" onclick="hapusMapel('${m.id}')" title="Hapus">✕</button>
        </div>
    `).join('');
}


/* INPUT NILAI */
function refreshSelectSiswa() {
    const sel = document.getElementById('nilaiSiswaSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Pilih Siswa —</option>' +
        daftarSiswa.map(s =>
            `<option value="${s.id}">${s.nama} (${s.nis}) — ${s.kelas || '—'}</option>`
        ).join('');
}

function refreshSelectMapel() {
    const sel = document.getElementById('nilaiMapelSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Pilih Mata Pelajaran —</option>' +
        daftarMapel.map(m =>
            `<option value="${m.id}">${m.nama}${m.kelas ? ' · ' + m.kelas : ''}</option>`
        ).join('');
}

function previewNilai() {
    const t = parseFloat(document.getElementById('nilaiTugas')?.value);
    const u = parseFloat(document.getElementById('nilaiUTS')?.value);
    const a = parseFloat(document.getElementById('nilaiUAS')?.value);
    const preview = document.getElementById('previewNilaiAkhir');

    if (isNaN(t) && isNaN(u) && isNaN(a)) {
        if (preview) preview.style.display = 'none';
        return;
    }
    if (preview) preview.style.display = 'block';

    const akhir    = ((isNaN(t) ? 0 : t) * 0.3) + ((isNaN(u) ? 0 : u) * 0.3) + ((isNaN(a) ? 0 : a) * 0.4);
    const predikat = hitungPredikat(akhir);
    const mapelId  = document.getElementById('nilaiMapelSelect')?.value;
    const mapel    = daftarMapel.find(m => m.id === mapelId);
    const kkm      = mapel ? mapel.kkm : 75;
    const lulus    = akhir >= kkm;

    const el = document.getElementById('prevNilaiAkhir');
    const ep = document.getElementById('prevPredikat');
    const ek = document.getElementById('prevKKM');

    if (el) { el.textContent = akhir.toFixed(1); el.style.color = lulus ? 'var(--accent)' : '#f87171'; }
    if (ep) ep.textContent = predikat;
    if (ek) { ek.textContent = lulus ? '✓ LULUS KKM' : '✗ BELUM KKM'; ek.style.color = lulus ? '#4ade80' : '#f87171'; }
}

function hitungPredikat(nilai) {
    if (nilai >= 90) return 'A';
    if (nilai >= 80) return 'B';
    if (nilai >= 70) return 'C';
    if (nilai >= 60) return 'D';
    if (nilai >= 50) return 'E';
    return 'F';
}

function simpanNilai() {
    const siswaId = document.getElementById('nilaiSiswaSelect')?.value;
    const mapelId = document.getElementById('nilaiMapelSelect')?.value;
    const t = parseFloat(document.getElementById('nilaiTugas')?.value);
    const u = parseFloat(document.getElementById('nilaiUTS')?.value);
    const a = parseFloat(document.getElementById('nilaiUAS')?.value);

    if (!siswaId) { showToastExtra('⚠ Pilih Siswa terlebih dahulu!'); return; }
    if (!mapelId) { showToastExtra('⚠ Pilih Mata Pelajaran terlebih dahulu!'); return; }
    if (isNaN(t) || t < 0 || t > 100) { showToastExtra('⚠ Nilai Tugas tidak valid (0 – 100)'); return; }
    if (isNaN(u) || u < 0 || u > 100) { showToastExtra('⚠ Nilai UTS tidak valid (0 – 100)'); return; }
    if (isNaN(a) || a < 0 || a > 100) { showToastExtra('⚠ Nilai UAS tidak valid (0 – 100)'); return; }

    const akhir    = (t * 0.3) + (u * 0.3) + (a * 0.4);
    const predikat = hitungPredikat(akhir);

    daftarNilai = daftarNilai.filter(n => !(n.siswaId === siswaId && n.mapelId === mapelId));
    daftarNilai.push({
        id: 'N' + Date.now(),
        siswaId,
        mapelId,
        tugas: t,
        uts: u,
        uas: a,
        akhir: parseFloat(akhir.toFixed(2)),
        predikat
    });

    simpanState();
    renderNilaiTable();

    document.getElementById('nilaiTugas').value  = '';
    document.getElementById('nilaiUTS').value    = '';
    document.getElementById('nilaiUAS').value    = '';
    document.getElementById('previewNilaiAkhir').style.display = 'none';

    showToastExtra(`✓ Nilai disimpan! Akhir: ${akhir.toFixed(1)} (${predikat})`);
    if (predikat === 'A') {
        confetti({ particleCount: 80, spread: 55, origin: { y: 0.6 }, colors: ['#00f2ff', '#7000ff', '#fff'] });
    }
}

function hapusNilai(id) {
    daftarNilai = daftarNilai.filter(n => n.id !== id);
    simpanState();
    renderNilaiTable();
}

function renderNilaiTable() {
    const tbody = document.getElementById('nilaiTableBody');
    if (!tbody) return;

    if (daftarNilai.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="8">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <img src="https://cdn-icons-png.flaticon.com/128/10786/10786354.png" width="50px"/>
                    </div>
                    <div class="empty-state-text">Belum ada nilai tersimpan</div>
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = daftarNilai.map(n => {
        const siswa = daftarSiswa.find(s => s.id === n.siswaId);
        const mapel = daftarMapel.find(m => m.id === n.mapelId);
        return `<tr>
            <td>${siswa ? siswa.nama : n.siswaId}</td>
            <td>${mapel ? mapel.nama : n.mapelId}</td>
            <td style="text-align:center">${n.tugas}</td>
            <td style="text-align:center">${n.uts}</td>
            <td style="text-align:center">${n.uas}</td>
            <td style="text-align:center;font-weight:700;color:var(--accent)">${n.akhir.toFixed(1)}</td>
            <td style="text-align:center"><span class="badge-predikat badge-${n.predikat}">${n.predikat}</span></td>
            <td><button class="btn-action" onclick="hapusNilai('${n.id}')">Hapus</button></td>
        </tr>`;
    }).join('');
}


/* DAFTAR NILAI SISWA */
function renderLeger() {
    const body = document.getElementById('legerBody');
    if (!body) return;

    if (daftarSiswa.length === 0) {
        body.innerHTML = `
            <tr><td colspan="7">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <img src="https://cdn-icons-png.flaticon.com/128/16312/16312812.png" width="50px"/>
                    </div>
                    <div class="empty-state-text">Belum ada data siswa & nilai</div>
                </div>
            </td></tr>`;
        updateStatLeger([]);
        return;
    }

    const rows = daftarSiswa.map(s => {
        const ns      = daftarNilai.filter(n => n.siswaId === s.id);
        const rataAll = ns.length > 0 ? ns.reduce((sum, n) => sum + n.akhir, 0) / ns.length : null;
        const predikat = rataAll !== null ? hitungPredikat(rataAll) : '—';
        return { ...s, rataAll, predikat, jumlahMapel: ns.length };
    });

    rows.sort((a, b) => (b.rataAll || 0) - (a.rataAll || 0));

    body.innerHTML = rows.map((s, i) => `
        <tr>
            <td style="color:var(--text-muted);font-size:0.78rem;">${i + 1}</td>
            <td style="font-family:'Space Grotesk',sans-serif;color:var(--text-muted);font-size:0.8rem;">${s.nis}</td>
            <td style="font-weight:600;">${s.nama}</td>
            <td style="color:var(--text-muted);font-size:0.8rem;">${s.kelas || '—'}</td>
            <td style="text-align:center;font-weight:700;color:${s.rataAll !== null ? 'var(--accent)' : 'var(--text-muted)'}">
                ${s.rataAll !== null ? s.rataAll.toFixed(1) : '—'}
                <span style="font-size:0.62rem;opacity:0.4;margin-left:3px;">
                    ${s.jumlahMapel > 0 ? s.jumlahMapel + ' mapel' : ''}
                </span>
            </td>
            <td style="text-align:center">
                ${s.rataAll !== null
                    ? `<span class="badge-predikat badge-${s.predikat}">${s.predikat}</span>`
                    : '<span style="opacity:0.3;font-size:0.76rem;">—</span>'}
            </td>
            <td style="display:flex;gap:6px;flex-wrap:wrap;">
                <button class="btn-action btn-edit" onclick="lihatRapor('${s.id}')">Rapor</button>
                <button class="btn-action" onclick="hapusSiswa('${s.id}')">Hapus</button>
            </td>
        </tr>
    `).join('');

    updateStatLeger(rows);
}

function updateStatLeger(rows) {
    const dN        = rows.filter(r => r.rataAll !== null);
    const rataKelas = dN.length > 0 ? dN.reduce((s, r) => s + r.rataAll, 0) / dN.length : null;
    const tertinggi = dN.length > 0 ? Math.max(...dN.map(r => r.rataAll)) : null;
    const lulusCount = dN.filter(r => r.rataAll >= 75).length;

    document.getElementById('statTotalSiswa').textContent = rows.length;
    document.getElementById('statRataKelas').textContent  = rataKelas !== null ? rataKelas.toFixed(1) : '—';
    document.getElementById('statTertinggi').textContent  = tertinggi !== null ? tertinggi.toFixed(1) : '—';
    document.getElementById('statLulus').textContent      = dN.length > 0 ? `${lulusCount}/${dN.length}` : '—';
}

function hapusSiswa(id) {
    if (!confirm('Hapus Siswa Ini Beserta Seluruh Nilainya?')) return;
    daftarSiswa = daftarSiswa.filter(s => s.id !== id);
    daftarNilai = daftarNilai.filter(n => n.siswaId !== id);
    simpanState();
    renderLeger();
    renderSiswaTable();
    showToastExtra('✓ Data siswa dihapus.');
}


/* LIHAT RAPOR SISWA */
function lihatRapor(siswaId) {
    const siswa = daftarSiswa.find(s => s.id === siswaId);
    if (!siswa) return;

    const ns       = daftarNilai.filter(n => n.siswaId === siswaId);
    const rataAll  = ns.length > 0 ? ns.reduce((s, n) => s + n.akhir, 0) / ns.length : null;
    const predikat = rataAll !== null ? hitungPredikat(rataAll) : '—';
    const tanggal  = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    const nilaiRows = ns.map(n => {
        const mapel = daftarMapel.find(m => m.id === n.mapelId);
        const kkm   = mapel ? mapel.kkm : 75;
        const lulus = n.akhir >= kkm;
        return `<tr>
            <td style="text-align:left">${mapel ? mapel.nama : '—'}</td>
            <td>${mapel ? mapel.guru : '—'}</td>
            <td>${n.tugas}</td>
            <td>${n.uts}</td>
            <td>${n.uas}</td>
            <td style="font-weight:700;color:${lulus ? 'var(--accent)' : '#e53e3e'}">${n.akhir.toFixed(1)}</td>
            <td><span class="badge-predikat badge-${n.predikat}">${n.predikat}</span></td>
        </tr>`;
    }).join('');

    const emptyNilai = ns.length === 0
        ? `<tr><td colspan="7" style="text-align:center;opacity:0.4;padding:20px;">Belum ada nilai</td></tr>`
        : '';

    document.getElementById('modalRaporContent').innerHTML = `
        <div class="rapor-header">
            <div class="rapor-logo">RAPOR NILAI SISWA</div>
            <div class="rapor-sub">PENGOLAHAN NILAI SISWA</div>
        </div>
        <div class="rapor-divider"></div>
        <div class="rapor-siswa-info">
            <div class="rapor-info-item">
                <div class="rapor-info-label">Nama Siswa</div>
                <div class="rapor-info-val">${siswa.nama}</div>
            </div>
            <div class="rapor-info-item">
                <div class="rapor-info-label">NIS</div>
                <div class="rapor-info-val">${siswa.nis}</div>
            </div>
            <div class="rapor-info-item">
                <div class="rapor-info-label">Kelas</div>
                <div class="rapor-info-val">${siswa.kelas || '—'}</div>
            </div>
            <div class="rapor-info-item">
                <div class="rapor-info-label">Tanggal Cetak</div>
                <div class="rapor-info-val">${tanggal}</div>
            </div>
        </div>
        <div class="rapor-divider"></div>
        <p style="font-size:0.65rem;letter-spacing:2px;color:rgba(255,255,255,0.3);margin-bottom:10px;">
            RINCIAN NILAI PER MATA PELAJARAN
        </p>
        <div class="data-table-wrap" style="margin-bottom:0">
            <table class="rapor-nilai-table">
                <thead>
                    <tr>
                        <th style="text-align:left">Mata Pelajaran</th>
                        <th>Guru</th>
                        <th>Tugas</th>
                        <th>UTS</th>
                        <th>UAS</th>
                        <th>Akhir</th>
                        <th>Predikat</th>
                    </tr>
                </thead>
                <tbody>${nilaiRows}${emptyNilai}</tbody>
            </table>
        </div>
        <div class="rapor-summary">
            <div class="rapor-sum-box">
                <div class="rapor-sum-label">Rata-rata</div>
                <div class="rapor-sum-val" style="color:var(--accent)">
                    ${rataAll !== null ? rataAll.toFixed(1) : '—'}
                </div>
            </div>
            <div class="rapor-sum-box">
                <div class="rapor-sum-label">Predikat Akhir</div>
                <div class="rapor-sum-val" style="color:var(--accent-purple)">${predikat}</div>
            </div>
            <div class="rapor-sum-box">
                <div class="rapor-sum-label">Total Mapel</div>
                <div class="rapor-sum-val" style="color:var(--text)">${ns.length}</div>
            </div>
        </div>
    `;

    document.getElementById('modalRapor').classList.add('open');
}

function tutupRapor() {
    document.getElementById('modalRapor').classList.remove('open');
}


/* ─────────────────────────────────────────────────────────────────
   HELPER: blok footer rapor (keterangan predikat + ttd + garis bawah)
───────────────────────────────────────────────────────────────── */
function _raporFooterHTML(namaFile, tanggal) {
    const predList = [
        ['A', '100 – 90', 'Sangat Baik',  '#0891b2'],
        ['B', '89 – 80',  'Baik',          '#7c3aed'],
        ['C', '79 – 70',  'Cukup',         '#d97706'],
        ['D', '69 – 60',  'Kurang',        '#dc2626'],
        ['E', '59 – 50',  'Sangat Kurang', '#6b7280']
    ];

    return `
        <div style="margin-top:20px;page-break-inside:avoid;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div>
                    <div style="font-size:0.6rem;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;margin-bottom:12px;">Keterangan Predikat</div>
                    <div style="display:flex;flex-direction:column;gap:5px;">
                        ${predList.map(([p, r, k, c]) => `
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span style="background:${c}22;color:${c};border:1px solid ${c}44;padding:2px 10px;border-radius:100px;font-weight:800;font-size:0.7rem;min-width:32px;text-align:center;">${p}</span>
                                <span style="font-size:0.78rem;color:#555;">${r} — <em>${k}</em></span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:center;text-align:center;">
                    <div style="font-size:0.6rem;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;margin-bottom:50px;">Tanda Tangan Wali Kelas</div>
                    <div style="border-bottom:2px solid #1e1e4a;width:200px;margin-bottom:8px;"></div>
                    <div style="font-size:0.78rem;color:#333;font-weight:600;text-align:center;">(_____________________________)</div>
                </div>
            </div>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e8eef8;display:flex;justify-content:space-between;align-items:center;font-size:0.7rem;color:#bbb;">
                <span>${namaFile}</span>
                <span>Dicetak: ${tanggal}</span>
            </div>
        </div>`;
}


/* CETAK RAPOR PDF (satu siswa) */
function printRapor() {
    const content = document.getElementById('modalRaporContent');
    const nm      = content.querySelector('.rapor-info-val')?.textContent;
    const siswaId = daftarSiswa.find(s => s.nama === nm)?.id;
    const siswa   = siswaId ? daftarSiswa.find(s => s.id === siswaId) : null;

    const ns       = siswaId ? daftarNilai.filter(n => n.siswaId === siswaId) : [];
    const rataAll  = ns.length > 0 ? ns.reduce((s, n) => s + n.akhir, 0) / ns.length : null;
    const predikat = rataAll !== null ? hitungPredikat(rataAll) : '—';
    const tanggal  = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    function warnaPred(p) {
        return p === 'A' ? '#0891b2' : p === 'B' ? '#7c3aed' : p === 'C' ? '#d97706' : p === 'D' ? '#dc2626' : '#6b7280';
    }
    function bgPred(p) {
        return p === 'A' ? '#e0fffe' : p === 'B' ? '#f3e8ff' : p === 'C' ? '#fffbeb' : p === 'D' ? '#fef2f2' : '#f9fafb';
    }

    const predColor = warnaPred(predikat);

    const nilaiRows = ns.map((n, i) => {
        const mapel = daftarMapel.find(m => m.id === n.mapelId);
        const kkm   = mapel ? mapel.kkm : 75;
        const lulus = n.akhir >= kkm;
        const pred  = n.predikat;
        return `
        <tr style="background:${i % 2 === 0 ? '#fff' : '#f8faff'}">
            <td style="padding:10px 14px;border-bottom:1px solid #e8eef8;text-align:left;font-weight:600;color:#1e1e4a;">${mapel ? mapel.nama : '—'}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e8eef8;text-align:center;color:#555;">${mapel ? mapel.guru : '—'}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e8eef8;text-align:center;">${Number(n.tugas).toFixed(1)}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e8eef8;text-align:center;">${Number(n.uts).toFixed(1)}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e8eef8;text-align:center;">${Number(n.uas).toFixed(1)}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e8eef8;text-align:center;font-weight:800;font-size:1.05rem;color:${lulus ? '#0891b2' : '#dc2626'}">${n.akhir.toFixed(1)}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e8eef8;text-align:center;">
                <span style="background:${bgPred(pred)};color:${warnaPred(pred)};padding:3px 12px;border-radius:100px;font-size:0.75rem;font-weight:800;border:1px solid ${warnaPred(pred)}22;">${pred}</span>
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e8eef8;text-align:center;font-size:0.78rem;font-weight:700;color:${lulus ? '#059669' : '#dc2626'}">${lulus ? '✓ Lulus' : '✗ Remedial'}</td>
        </tr>`;
    }).join('');

    const kosong = ns.length === 0
        ? `<tr><td colspan="8" style="text-align:center;padding:30px;color:#aaa;">Belum ada data nilai</td></tr>`
        : '';

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Rapor — ${siswa ? siswa.nama : 'Siswa'}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    .num { font-variant-numeric:tabular-nums; font-feature-settings:'tnum'; }
    body { font-family:'Plus Jakarta Sans',sans-serif; background:#f0f4ff; color:#12123a; padding:20px 16px; }
    .rapor-wrapper { max-width:800px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 8px 60px rgba(0,0,100,0.12); }
    @media print {
        @page { size: A4 portrait; margin: 10mm 8mm; }
        *, *::before, *::after { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        html, body { background:#fff !important; padding:0 !important; margin:0 !important; width:100%; }
        .rapor-wrapper { max-width:100% !important; width:100% !important; border-radius:0 !important; box-shadow:none !important; margin:0 !important; }
        table { page-break-inside:auto; border-collapse:collapse; }
        tr    { page-break-inside:avoid; break-inside:avoid; page-break-after:auto; }
        thead { display:table-header-group; }
        tfoot { display:table-footer-group; }
    }
</style>
</head>
<body>
<div class="rapor-wrapper">
    <div style="background:linear-gradient(135deg,#0a0a2e 0%,#1a0050 40%,#003040 100%);padding:36px 44px 30px;position:relative;overflow:hidden;">
        <div style="position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(0,242,255,0.06);top:-100px;right:-80px;"></div>
        <div style="position:absolute;width:200px;height:200px;border-radius:50%;background:rgba(112,0,255,0.08);bottom:-80px;left:40px;"></div>
        <div style="position:relative;z-index:1;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px;">
                <div>
                    <div style="font-size:0.6rem;letter-spacing:4px;color:rgba(0,242,255,0.7);text-transform:uppercase;margin-bottom:8px;">Dokumen Resmi Akademik</div>
                    <div style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:#fff;letter-spacing:-1px;line-height:1;">RAPOR NILAI SISWA</div>
                    <div style="font-size:0.72rem;letter-spacing:3px;color:rgba(255,255,255,0.4);margin-top:6px;text-transform:uppercase;">Kelompok 7 · Sistem Pengelolaan Nilai</div>
                </div>
                <div style="text-align:center;">
                    <div style="background:rgba(0,242,255,0.12);border:1px solid rgba(0,242,255,0.3);border-radius:12px;padding:14px 24px;display:inline-block;">
                        <div style="font-size:0.6rem;letter-spacing:2px;color:rgba(0,242,255,0.7);text-transform:uppercase;margin-bottom:4px;white-space:nowrap;text-align:center;">Predikat Akhir</div>
                        <div class="num" style="font-family:'Syne',sans-serif;font-size:3rem;font-weight:800;color:#00f2ff;line-height:1;text-align:center;">${predikat}</div>
                    </div>
                </div>
            </div>
            <div style="height:1px;background:linear-gradient(to right,transparent,rgba(0,242,255,0.4),transparent);margin-bottom:22px;"></div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
                <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;">
                    <div style="font-size:0.6rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:5px;">Nama Siswa</div>
                    <div style="font-weight:700;color:#fff;font-size:0.88rem;">${siswa ? siswa.nama : '—'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;">
                    <div style="font-size:0.6rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:5px;">NIS</div>
                    <div style="font-weight:700;color:#00f2ff;font-size:0.88rem;">${siswa ? siswa.nis : '—'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;">
                    <div style="font-size:0.6rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:5px;">Kelas</div>
                    <div style="font-weight:700;color:#a78bfa;font-size:0.88rem;">${siswa ? siswa.kelas || '—' : '—'}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;">
                    <div style="font-size:0.6rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:5px;">Tanggal Cetak</div>
                    <div style="font-weight:600;color:rgba(255,255,255,0.8);font-size:0.82rem;">${tanggal}</div>
                </div>
            </div>
        </div>
    </div>
    <div style="background:#f8faff;padding:20px 44px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;border-bottom:1px solid #e8eef8;">
        <div style="background:#fff;border:1px solid #e8eef8;border-radius:16px;padding:16px;display:flex;flex-direction:column;min-height:90px;">
            <div style="height:24px;display:flex;align-items:center;justify-content:center;"><span style="font-size:0.6rem;letter-spacing:2px;color:#888;text-transform:uppercase;white-space:nowrap;">Rata-rata Nilai</span></div>
            <div style="flex:1;display:flex;align-items:center;justify-content:center;"><span class="num" style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:#0891b2;">${rataAll !== null ? rataAll.toFixed(1) : '—'}</span></div>
        </div>
        <div style="background:#fff;border:1px solid #e8eef8;border-radius:16px;padding:16px;display:flex;flex-direction:column;min-height:90px;">
            <div style="height:24px;display:flex;align-items:center;justify-content:center;"><span style="font-size:0.6rem;letter-spacing:2px;color:#888;text-transform:uppercase;white-space:nowrap;">Predikat Akhir</span></div>
            <div style="flex:1;display:flex;align-items:center;justify-content:center;"><span style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:${predColor};">${predikat}</span></div>
        </div>
        <div style="background:#fff;border:1px solid #e8eef8;border-radius:16px;padding:16px;display:flex;flex-direction:column;min-height:90px;">
            <div style="height:24px;display:flex;align-items:center;justify-content:center;"><span style="font-size:0.6rem;letter-spacing:2px;color:#888;text-transform:uppercase;white-space:nowrap;">Total Mata Pelajaran</span></div>
            <div style="flex:1;display:flex;align-items:center;justify-content:center;"><span class="num" style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:#1e1e4a;">${ns.length}</span></div>
        </div>
    </div>
    <div style="padding:24px 44px 36px;">
        <div style="font-size:0.65rem;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;margin-bottom:14px;font-weight:700;">Rincian Nilai Per Mata Pelajaran</div>
        <div style="border-radius:16px;overflow:hidden;border:1px solid #e8eef8;box-shadow:0 4px 20px rgba(0,0,100,0.06);">
            <table style="width:100%;border-collapse:collapse;font-size:0.82rem;table-layout:fixed;">
                <colgroup>
                    <col style="width:21%"><col style="width:15%"><col style="width:8%">
                    <col style="width:8%"><col style="width:8%"><col style="width:10%">
                    <col style="width:10%"><col style="width:20%">
                </colgroup>
                <thead>
                    <tr style="background:linear-gradient(135deg,#0a0a2e,#1a0050);">
                        ${['Mata Pelajaran','Guru','Tugas','UTS','UAS','Nilai Akhir','Predikat','Keterangan'].map((h,i) =>
                            `<th style="padding:12px ${i===0?'14px':'8px'};text-align:${i===0?'left':'center'};color:#00f2ff;font-size:0.6rem;letter-spacing:2px;text-transform:uppercase;font-weight:700;white-space:nowrap;">${h}</th>`
                        ).join('')}
                    </tr>
                </thead>
                <tbody>${nilaiRows}${kosong}</tbody>
            </table>
        </div>
        ${_raporFooterHTML('Rapor Nilai Siswa', tanggal)}
    </div>
</div>
<script>document.fonts.ready.then(function() { window.print(); });<\/script>
</body>
</html>`);
    win.document.close();
}


/* CETAK RAPOR SEMUA SISWA */
function cetakRaporSemua() {
    if (daftarSiswa.length === 0) {
        showToastExtra('⚠ Tidak Ada Data Siswa!');
        return;
    }

    const tanggal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    function warnaPred(p) {
        return p === 'A' ? '#0891b2' : p === 'B' ? '#7c3aed' : p === 'C' ? '#d97706' : p === 'D' ? '#dc2626' : '#6b7280';
    }
    function bgPred(p) {
        return p === 'A' ? '#e0fffe' : p === 'B' ? '#f3e8ff' : p === 'C' ? '#fffbeb' : p === 'D' ? '#fef2f2' : '#f9fafb';
    }

    const sorted = [...daftarSiswa].sort((a, b) => {
        const nsA = daftarNilai.filter(n => n.siswaId === a.id);
        const nsB = daftarNilai.filter(n => n.siswaId === b.id);
        const rA  = nsA.length > 0 ? nsA.reduce((s, n) => s + n.akhir, 0) / nsA.length : 0;
        const rB  = nsB.length > 0 ? nsB.reduce((s, n) => s + n.akhir, 0) / nsB.length : 0;
        return rB - rA;
    });

    const semuaRapor = sorted.map((siswa) => {
        const ns        = daftarNilai.filter(n => n.siswaId === siswa.id);
        const rataAll   = ns.length > 0 ? ns.reduce((s, n) => s + n.akhir, 0) / ns.length : null;
        const predikat  = rataAll !== null ? hitungPredikat(rataAll) : '—';
        const predColor = warnaPred(predikat);

        const nilaiRows = ns.map((n, i) => {
            const mapel = daftarMapel.find(m => m.id === n.mapelId);
            const kkm   = mapel ? mapel.kkm : 75;
            const lulus = n.akhir >= kkm;
            const pred  = n.predikat;
            return `
            <tr style="background:${i % 2 === 0 ? '#fff' : '#f8faff'}">
                <td style="padding:9px 14px;border-bottom:1px solid #e8eef8;text-align:left;font-weight:600;color:#1e1e4a;">${mapel ? mapel.nama : '—'}</td>
                <td style="padding:9px 14px;border-bottom:1px solid #e8eef8;text-align:center;color:#555;">${mapel ? mapel.guru : '—'}</td>
                <td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;">${Number(n.tugas).toFixed(1)}</td>
                <td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;">${Number(n.uts).toFixed(1)}</td>
                <td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;">${Number(n.uas).toFixed(1)}</td>
                <td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;font-weight:800;font-size:1rem;color:${lulus ? '#0891b2' : '#dc2626'}">${n.akhir.toFixed(1)}</td>
                <td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;">
                    <span style="background:${bgPred(pred)};color:${warnaPred(pred)};padding:2px 10px;border-radius:100px;font-size:0.72rem;font-weight:800;border:1px solid ${warnaPred(pred)}22;">${pred}</span>
                </td>
                <td style="padding:9px 8px;border-bottom:1px solid #e8eef8;text-align:center;font-size:0.76rem;font-weight:700;color:${lulus ? '#059669' : '#dc2626'}">${lulus ? '✓ Lulus' : '✗ Remedial'}</td>
            </tr>`;
        }).join('');

        const kosong = ns.length === 0
            ? `<tr><td colspan="8" style="text-align:center;padding:20px;color:#aaa;">Belum ada data nilai</td></tr>`
            : '';

        return `
        <div class="rapor-page">
            <div class="rapor-wrapper">
                <div style="background:linear-gradient(135deg,#0a0a2e 0%,#1a0050 40%,#003040 100%);padding:30px 40px 24px;position:relative;overflow:hidden;">
                    <div style="position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(0,242,255,0.06);top:-100px;right:-80px;"></div>
                    <div style="position:absolute;width:200px;height:200px;border-radius:50%;background:rgba(112,0,255,0.08);bottom:-80px;left:40px;"></div>
                    <div style="position:relative;z-index:1;">
                        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:20px;">
                            <div>
                                <div style="font-size:0.58rem;letter-spacing:4px;color:rgba(0,242,255,0.7);text-transform:uppercase;margin-bottom:6px;">Dokumen Resmi Akademik</div>
                                <div style="font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;color:#fff;letter-spacing:-1px;line-height:1;">RAPOR NILAI SISWA</div>
                                <div style="font-size:0.68rem;letter-spacing:3px;color:rgba(255,255,255,0.4);margin-top:5px;text-transform:uppercase;">Kelompok 7 · Sistem Pengelolaan Nilai</div>
                            </div>
                            <div>
                                <div style="background:rgba(0,242,255,0.12);border:1px solid rgba(0,242,255,0.3);border-radius:12px;padding:12px 20px;display:inline-block;text-align:center;">
                                    <div style="font-size:0.58rem;letter-spacing:2px;color:rgba(0,242,255,0.7);text-transform:uppercase;margin-bottom:4px;white-space:nowrap;">Predikat Akhir</div>
                                    <div style="font-family:'Syne',sans-serif;font-size:2.6rem;font-weight:800;color:#00f2ff;line-height:1;">${predikat}</div>
                                </div>
                            </div>
                        </div>
                        <div style="height:1px;background:linear-gradient(to right,transparent,rgba(0,242,255,0.4),transparent);margin-bottom:18px;"></div>
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
                            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;">
                                <div style="font-size:0.58rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:4px;">Nama Siswa</div>
                                <div style="font-weight:700;color:#fff;font-size:0.84rem;">${siswa.nama}</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;">
                                <div style="font-size:0.58rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:4px;">NIS</div>
                                <div style="font-weight:700;color:#00f2ff;font-size:0.84rem;">${siswa.nis}</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;">
                                <div style="font-size:0.58rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:4px;">Kelas</div>
                                <div style="font-weight:700;color:#a78bfa;font-size:0.84rem;">${siswa.kelas || '—'}</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px;">
                                <div style="font-size:0.58rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase;margin-bottom:4px;">Tanggal Cetak</div>
                                <div style="font-weight:600;color:rgba(255,255,255,0.8);font-size:0.78rem;">${tanggal}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="background:#f8faff;padding:16px 40px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;border-bottom:1px solid #e8eef8;">
                    <div style="background:#fff;border:1px solid #e8eef8;border-radius:14px;padding:14px;display:flex;flex-direction:column;min-height:80px;">
                        <div style="display:flex;align-items:center;justify-content:center;margin-bottom:6px;"><span style="font-size:0.58rem;letter-spacing:2px;color:#888;text-transform:uppercase;white-space:nowrap;">Rata-rata Nilai</span></div>
                        <div style="flex:1;display:flex;align-items:center;justify-content:center;"><span style="font-family:'Syne',sans-serif;font-size:1.9rem;font-weight:800;color:#0891b2;">${rataAll !== null ? rataAll.toFixed(1) : '—'}</span></div>
                    </div>
                    <div style="background:#fff;border:1px solid #e8eef8;border-radius:14px;padding:14px;display:flex;flex-direction:column;min-height:80px;">
                        <div style="display:flex;align-items:center;justify-content:center;margin-bottom:6px;"><span style="font-size:0.58rem;letter-spacing:2px;color:#888;text-transform:uppercase;white-space:nowrap;">Predikat Akhir</span></div>
                        <div style="flex:1;display:flex;align-items:center;justify-content:center;"><span style="font-family:'Syne',sans-serif;font-size:1.9rem;font-weight:800;color:${predColor};">${predikat}</span></div>
                    </div>
                    <div style="background:#fff;border:1px solid #e8eef8;border-radius:14px;padding:14px;display:flex;flex-direction:column;min-height:80px;">
                        <div style="display:flex;align-items:center;justify-content:center;margin-bottom:6px;"><span style="font-size:0.58rem;letter-spacing:2px;color:#888;text-transform:uppercase;white-space:nowrap;">Total Mata Pelajaran</span></div>
                        <div style="flex:1;display:flex;align-items:center;justify-content:center;"><span style="font-family:'Syne',sans-serif;font-size:1.9rem;font-weight:800;color:#1e1e4a;">${ns.length}</span></div>
                    </div>
                </div>
                <div style="padding:20px 40px 28px;">
                    <div style="font-size:0.62rem;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;margin-bottom:12px;font-weight:700;">Rincian Nilai Per Mata Pelajaran</div>
                    <div style="border-radius:14px;overflow:hidden;border:1px solid #e8eef8;">
                        <table style="width:100%;border-collapse:collapse;font-size:0.8rem;table-layout:fixed;">
                            <colgroup>
                                <col style="width:21%"><col style="width:15%"><col style="width:8%">
                                <col style="width:8%"><col style="width:8%"><col style="width:10%">
                                <col style="width:10%"><col style="width:20%">
                            </colgroup>
                            <thead>
                                <tr style="background:linear-gradient(135deg,#0a0a2e,#1a0050);">
                                    ${['Mata Pelajaran','Guru','Tugas','UTS','UAS','Nilai Akhir','Predikat','Keterangan'].map((h,i) =>
                                        `<th style="padding:11px ${i===0?'14px':'8px'};text-align:${i===0?'left':'center'};color:#00f2ff;font-size:0.58rem;letter-spacing:2px;text-transform:uppercase;font-weight:700;white-space:nowrap;">${h}</th>`
                                    ).join('')}
                                </tr>
                            </thead>
                            <tbody>${nilaiRows}${kosong}</tbody>
                        </table>
                    </div>
                    <div style="margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                        <div>
                            <div style="font-size:0.58rem;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;margin-bottom:8px;">Keterangan Predikat</div>
                            <div style="display:flex;flex-direction:column;gap:4px;">
                                ${[['A','100 – 90','Sangat Baik','#0891b2'],['B','89 – 80','Baik','#7c3aed'],['C','79 – 70','Cukup','#d97706'],['D','69 – 60','Kurang','#dc2626'],['E','59 – 50','Sangat Kurang','#6b7280']].map(([p,r,k,c]) => `
                                    <div style="display:flex;align-items:center;gap:7px;">
                                        <span style="background:${c}22;color:${c};border:1px solid ${c}44;padding:2px 9px;border-radius:100px;font-weight:800;font-size:0.68rem;min-width:28px;text-align:center;">${p}</span>
                                        <span style="font-size:0.74rem;color:#555;">${r} — <em>${k}</em></span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;">
                            <div style="font-size:0.58rem;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;margin-bottom:36px;">Tanda Tangan Wali Kelas</div>
                            <div style="border-bottom:2px solid #1e1e4a;width:180px;margin-bottom:7px;"></div>
                            <div style="font-size:0.76rem;color:#333;font-weight:600;">(_____________________________)</div>
                        </div>
                    </div>
                    <div style="margin-top:14px;padding-top:14px;border-top:1px solid #e8eef8;display:flex;justify-content:space-between;align-items:center;font-size:0.68rem;color:#bbb;">
                        <span>Rapor Nilai Siswa — ${siswa.nama}</span>
                        <span>Dicetak: ${tanggal}</span>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Rapor Semua Siswa — ${tanggal}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Plus Jakarta Sans',sans-serif; background:#f0f4ff; color:#12123a; }
    .rapor-page { width:210mm; min-height:297mm; max-height:297mm; margin:0 auto; display:flex; align-items:flex-start; justify-content:center; padding:8mm; overflow:hidden; }
    .rapor-wrapper { width:100%; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 30px rgba(0,0,100,0.10); }
    @media screen { body { padding:20px 0; background:#e8edf8; } .rapor-page { margin-bottom:20px; } }
    @media print {
        @page { size: A4 portrait; margin: 0; }
        *, *::before, *::after { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
        html, body { background:#fff !important; margin:0 !important; padding:0 !important; }
        .rapor-page { width:210mm !important; min-height:297mm !important; max-height:297mm !important; page-break-before:always !important; break-before:page !important; page-break-after:always !important; break-after:page !important; page-break-inside:avoid !important; break-inside:avoid !important; overflow:hidden !important; padding:8mm !important; margin:0 !important; display:flex !important; align-items:flex-start !important; }
        .rapor-page:first-child { page-break-before:auto !important; break-before:auto !important; }
        .rapor-wrapper { border-radius:0 !important; box-shadow:none !important; width:100% !important; }
        table { border-collapse:collapse !important; }
        tr    { page-break-inside:avoid; break-inside:avoid; }
        thead { display:table-header-group; }
    }
</style>
</head>
<body>
${semuaRapor}
<script>document.fonts.ready.then(function() { window.print(); });<\/script>
</body>
</html>`);
    win.document.close();
    showToastExtra('🖨 Membuka rapor ' + sorted.length + ' siswa...');
}


/* EXPORT KE CSV */
function exportLegerCSV() {
    if (daftarSiswa.length === 0) {
        showToastExtra('⚠ Tidak Ada Data untuk Diekspor!');
        return;
    }

    const BOM     = '\uFEFF';
    const sep     = ',';
    const tanggal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    let rows = [];
    rows.push(['REKAP DATA SEMUA SISWA']);
    rows.push([`Dicetak: ${tanggal}`]);
    rows.push([]);
    rows.push(['No', 'NIS', 'Nama Siswa', 'Kelas',
        ...daftarMapel.flatMap(m => [`${m.nama} (Tugas)`, `${m.nama} (UTS)`, `${m.nama} (UAS)`, `${m.nama} (Akhir)`]),
        'Rata-rata', 'Predikat', 'Keterangan'
    ]);

    daftarSiswa.forEach((s, i) => {
        const ns  = daftarNilai.filter(n => n.siswaId === s.id);
        let row   = [`${i + 1}`, s.nis, s.nama, s.kelas || '-'];
        daftarMapel.forEach(m => {
            const n = ns.find(x => x.mapelId === m.id);
            row.push(...(n ? [Number(n.tugas).toFixed(1), Number(n.uts).toFixed(1), Number(n.uas).toFixed(1), Number(n.akhir).toFixed(1)] : ['-', '-', '-', '-']));
        });
        const rataRaw = ns.length > 0 ? ns.reduce((s, n) => s + n.akhir, 0) / ns.length : null;
        const rataAll = rataRaw !== null ? rataRaw.toFixed(1) : '-';
        const pred    = rataRaw !== null ? hitungPredikat(rataRaw) : '-';
        const ket     = rataRaw !== null ? (rataRaw >= 75 ? 'Lulus' : 'Belum Lulus') : '-';
        row.push(rataAll, pred, ket);
        rows.push(row);
    });

    rows.push([]);
    rows.push(['Keterangan Predikat:', 'A = 100-90 (Sangat Baik)', 'B = 89-80 (Baik)', 'C = 79-70 (Cukup)', 'D = 69-60 (Kurang)', 'E = 59-50 (Sangat Kurang)', 'F < 50 (Tidak Lulus)']);

    const csv  = BOM + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(sep)).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `REKAP_DATA_SEMUA_SISWA_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToastExtra('✓ Berhasil diekspor ke CSV!');
}


/* MODAL RAPOR */
document.getElementById('modalRapor')?.addEventListener('click', function (e) {
    if (e.target === this) tutupRapor();
});