// =================================================================================
// APLIKASI KASIR - app.js
// Berisi semua logika navigasi, sidebar, dan manajemen data (CRUD)
// =================================================================================

// ---------------------------------------------------------------------------------
// 1. STATE & DATA GLOBAL
// ---------------------------------------------------------------------------------

// Data Halaman untuk Judul Dinamis
const pageTitles = {
    'dashboard': 'Dashboard',
    'kasir': 'Kasir',
    'transaksi': 'Transaksi',
    'hutang': 'Hutang',
    'laporan': 'Laporan',
    'pengaturan': 'Pengaturan',
    'kelola-kategori': 'Kelola Kategori',
    'kelola-akun': 'Kelola Akun',
    'kelola-aplikasi': 'Kelola Aplikasi',
    'kelola-produk': 'Kelola Produk',
};

// Data Kategori (dipindah dari HTML)
// Kita tambahkan ID unik untuk mempermudah edit/hapus
let globalKategori = [
    { id: 'cat-1', nama: 'Order Kuota' },
    { id: 'cat-2', nama: 'Dana' },
    { id: 'cat-3', nama: 'Go-Pay' },
    { id: 'cat-4', nama: 'Shopee-Pay' },
    { id: 'cat-5', nama: 'Cash' },
    { id: 'cat-6', nama: 'Modal' },
    { id: 'cat-7', nama: 'Laba Bersih' },
    { id: 'cat-8', nama: 'Fee BRI Link' },
    { id: 'cat-9', nama: 'I-simple' },
    { id: 'cat-10', nama: 'Digipos' },
    { id: 'cat-11', nama: 'Hutang' },
    { id: 'cat-12', nama: 'BNI' },
    { id: 'cat-13', nama: 'BRI Nussa' },
    { id: 'cat-14', nama: 'BRI Galih' },
    { id: 'cat-15', nama: 'Pemasukan' },
    { id: 'cat-16', nama: 'Pengeluaran' },
    { id: 'cat-17', nama: 'Penyesuian' },
    { id: 'cat-18', nama: 'Penjualan ATK' },
    { id: 'cat-19', nama: 'Service' },
    { id: 'cat-20', nama: 'Tabungan' },
    { id: 'cat-21', nama: 'Save Plus' },
    { id: 'cat-22', nama: 'Pengeluaran Rumah' },
    { id: 'cat-23', nama: 'Transfer' },
    { id: 'cat-24', nama: 'Tarik Tunai' },
    { id: 'cat-25', nama: 'Setor Tunai' },
    { id: 'cat-26', nama: 'APK' },
    { id: 'cat-27', nama: 'Kulak (SP/Voucher/HP/Sparepart/dll)' },
    { id: 'cat-28', nama: 'Penjualan' },
    { id: 'cat-29', nama: 'Penjualan Transaksi' },
];

// Data Akun (dipindah dari HTML)
let globalAkun = [
    { id: 'akun-1', nama: 'Cash', saldo: 1500000 },
    { id: 'akun-2', nama: 'BRI Galih', saldo: 5000000 },
    { id: 'akun-3', nama: 'BRI Nussa', saldo: 0 },
    { id: 'akun-4', nama: 'BNI', saldo: 0 },
    { id: 'akun-5', nama: 'Bank Jateng', saldo: 0 },
    { id: 'akun-6', nama: 'Buku Agen', saldo: 0 },
    { id: 'akun-7', nama: 'Dana Galih', saldo: 0 },
    { id: 'akun-8', nama: 'Dana Nussa', saldo: 0 },
    { id: 'akun-9', nama: 'Shopee Pay', saldo: 0 },
    { id: 'akun-10', nama: 'Go-Pay', saldo: 0 },
    { id: 'akun-11', nama: 'Order Kuota', saldo: 0 },
    { id: 'akun-12', nama: 'Digipos', saldo: 0 },
    { id: 'akun-13', nama: 'Save Plus', saldo: 0 },
    { id: 'akun-14', nama: 'I-Simple', saldo: 0 },
    { id: 'akun-15', nama: 'Tabungan', saldo: 0 },
    { id: 'akun-16', nama: 'Laba Bersih', saldo: 0 },
    { id: 'akun-17', nama: 'Fee BRI Link', saldo: 0 },
    { id: 'akun-18', nama: 'Hutang Piutang', saldo: 0 },
    { id: 'akun-19', nama: 'Modal', saldo: 0 },
];

// Variabel untuk menyimpan ID item yang akan diedit/dihapus
let currentEditId = null;
let currentDeleteId = null;
let currentDeleteType = ''; // 'kategori' atau 'akun'

// ---------------------------------------------------------------------------------
// 2. FUNGSI UTAMA (RENDER, NAVIGASI, MODAL)
// ---------------------------------------------------------------------------------

/**
 * Menampilkan halaman yang dipilih dan menyembunyikan yang lain.
 * Memperbarui judul header dan me-render data jika diperlukan.
 * @param {string} pageId - ID dari elemen section halaman yang akan ditampilkan.
 */
function showPage(pageId) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });

    // Tampilkan halaman yang dipilih
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.remove('hidden');
        
        // Perbarui judul header
        const pageTitleElement = document.getElementById('page-title');
        if (pageTitleElement) {
            pageTitleElement.textContent = pageTitles[pageId] || 'KasirApp';
        }
        
        // Nonaktifkan semua link navigasi bawah
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Aktifkan link navigasi bawah yang sesuai
        const activeNavLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }
        
        // Render data dinamis jika halaman yang dibuka memerlukannya
        if (pageId === 'kelola-kategori') {
            renderKategoriList();
        } else if (pageId === 'kelola-akun') {
            renderAkunList();
        }
        
    } else {
        // Fallback jika ID halaman tidak ditemukan, tampilkan dashboard
        document.getElementById('page-dashboard').classList.remove('hidden');
        document.getElementById('page-title').textContent = 'Dashboard';
        document.querySelector('.nav-link[data-page="dashboard"]').classList.add('active');
    }
}

/**
 * Membuka modal (pop-up) berdasarkan ID-nya.
 * @param {string} modalId - ID dari elemen modal.
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

/**
 * Menutup modal (pop-up) berdasarkan ID-nya.
 * @param {string} modalId - ID dari elemen modal.
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
    
    // Reset form di dalam modal (jika ada)
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
    
    // Saat menutup modal edit akun, aktifkan kembali input saldo
    document.getElementById('saldo-awal').disabled = false;
    
    // Reset ID yang sedang diedit/dihapus
    currentEditId = null;
    currentDeleteId = null;
    currentDeleteType = '';
}

// ---------------------------------------------------------------------------------
// 3. FUNGSI RENDER DATA (UNTUK KATEGORI & AKUN)
// ---------------------------------------------------------------------------------

/**
 * Menggambar daftar kategori ke dalam HTML dari array globalKategori.
 */
function renderKategoriList() {
    const container = document.getElementById('kategori-list-container');
    if (!container) return;
    
    container.innerHTML = ''; // Kosongkan daftar sebelum menggambar ulang
    
    if (globalKategori.length === 0) {
        container.innerHTML = '<li class="p-4 text-center text-gray-500">Belum ada kategori.</li>';
        return;
    }
    
    globalKategori.forEach(kategori => {
        const itemHtml = `
            <li class="p-4 flex justify-between items-center">
                <p class="text-base font-medium text-slate-900">${kategori.nama}</p>
                <div class="flex-shrink-0 flex items-center gap-2">
                    <button class="btn-edit-kategori px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-200" data-id="${kategori.id}">Edit</button>
                    <button class="btn-hapus-kategori px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md hover:bg-red-200" data-id="${kategori.id}">Hapus</button>
                </div>
            </li>
        `;
        container.innerHTML += itemHtml;
    });
}

/**
 * Menggambar daftar akun ke dalam HTML dari array globalAkun.
 */
function renderAkunList() {
    const container = document.getElementById('akun-list-container');
    if (!container) return;
    
    container.innerHTML = ''; // Kosongkan daftar
    
    if (globalAkun.length === 0) {
        container.innerHTML = '<li class="p-4 text-center text-gray-500">Belum ada akun.</li>';
        return;
    }
    
    // Helper untuk format Rupiah
    const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    
    globalAkun.forEach(akun => {
        const itemHtml = `
            <li class="p-4 flex flex-col md:flex-row justify-between md:items-center">
                <div class="mb-2 md:mb-0">
                    <p class="text-base font-semibold text-slate-900">${akun.nama}</p>
                    <p class="text-sm text-gray-500">Saldo Saat Ini: <span class="font-medium text-slate-700">${formatRp(akun.saldo)}</span></p>
                </div>
                <div class="flex-shrink-0 flex items-center gap-2">
                    <button class="btn-sesuaikan-saldo px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md hover:bg-green-200" data-id="${akun.id}">Sesuaikan Saldo</button>
                    <button class="btn-edit-akun px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-200" data-id="${akun.id}">Edit</button>
                    <button class="btn-hapus-akun px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md hover:bg-red-200" data-id="${akun.id}">Hapus</button>
                </div>
            </li>
        `;
        container.innerHTML += itemHtml;
    });
}

// ---------------------------------------------------------------------------------
// 4. EVENT LISTENERS (NAVIGASI, SIDEBAR, MODAL, FORM)
// SEMUA KODE INI BERJALAN SETELAH DOM SIAP KARENA SCRIPT 'defer'
// ---------------------------------------------------------------------------------
    
// === Navigasi Halaman Utama (Bottom Nav) ===
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        showPage(pageId);
    });
});

// === Navigasi Sub-Halaman (di dalam Pengaturan) ===
document.querySelectorAll('.sub-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        showPage(pageId);
    });
});

// === Tombol Kembali (di Sub-Halaman) ===
document.querySelectorAll('.back-to-pengaturan-button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('pengaturan'); // Selalu kembali ke halaman pengaturan utama
    });
});

// === Sidebar Logic ===
const sidebarMenu = document.getElementById('sidebar-menu');
const hamburgerButton = document.getElementById('hamburger-button');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const sidebarCloseButton = document.getElementById('sidebar-close-button');

if (hamburgerButton) {
    hamburgerButton.addEventListener('click', () => {
        sidebarMenu.classList.add('open');
    });
}
if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => {
        sidebarMenu.classList.remove('open');
    });
}
if (sidebarCloseButton) {
    sidebarCloseButton.addEventListener('click', () => {
        sidebarMenu.classList.remove('open');
    });
}

// === Tombol Buka Modal (Tambah Item) ===
document.getElementById('btn-tambah-kategori').addEventListener('click', () => {
    document.getElementById('modal-kategori-title').textContent = 'Tambah Kategori Baru';
    document.getElementById('form-kategori').reset();
    currentEditId = null; // Pastikan ini mode tambah, bukan edit
    openModal('modal-kategori');
});

document.getElementById('btn-tambah-akun').addEventListener('click', () => {
    document.getElementById('modal-akun-title').textContent = 'Tambah Akun Baru';
    document.getElementById('form-akun').reset();
    document.getElementById('saldo-awal').disabled = false; // Pastikan aktif saat tambah
    currentEditId = null; // Pastikan ini mode tambah, bukan edit
    openModal('modal-akun');
});

// === Tombol Tutup Modal (Semua tombol 'Batal' atau 'X') ===
document.querySelectorAll('.btn-modal-close').forEach(button => {
    button.addEventListener('click', () => {
        // Temukan modal terdekat dan tutup
        const modal = button.closest('.modal-container');
        if (modal) {
            closeModal(modal.id);
        }
    });
});

// === Logika Form Submit (Kategori) ===
document.getElementById('form-kategori').addEventListener('submit', (e) => {
    e.preventDefault();
    const namaKategori = document.getElementById('nama-kategori').value.trim();
    
    if (namaKategori === '') {
        alert('Nama kategori tidak boleh kosong.'); // Ganti dengan UI yang lebih baik nanti
        return;
    }

    if (currentEditId) {
        // Mode Edit
        const index = globalKategori.findIndex(k => k.id === currentEditId);
        if (index !== -1) {
            globalKategori[index].nama = namaKategori;
        }
    } else {
        // Mode Tambah
        const newKategori = {
            id: 'cat-' + Date.now(), // ID unik sederhana
            nama: namaKategori
        };
        globalKategori.push(newKategori);
    }
    
    renderKategoriList(); // Gambar ulang daftar
    closeModal('modal-kategori'); // Tutup modal
});

// === Logika Form Submit (Akun) ===
document.getElementById('form-akun').addEventListener('submit', (e) => {
    e.preventDefault();
    const namaAkun = document.getElementById('nama-akun').value.trim();
    const saldoAwal = document.getElementById('saldo-awal').value;
    
    if (namaAkun === '') {
        alert('Nama akun tidak boleh kosong.'); // Ganti dengan UI yang lebih baik nanti
        return;
    }
    
    const saldo = parseFloat(saldoAwal) || 0;

    if (currentEditId) {
        // Mode Edit
        const index = globalAkun.findIndex(a => a.id === currentEditId);
        if (index !== -1) {
            globalAkun[index].nama = namaAkun;
            // Saldo tidak diubah saat edit nama
        }
    } else {
        // Mode Tambah
        const newAkun = {
            id: 'akun-' + Date.now(),
            nama: namaAkun,
            saldo: saldo
        };
        globalAkun.push(newAkun);
    }
    
    renderAkunList();
    closeModal('modal-akun');
});

// === Logika Form Submit (Sesuaikan Saldo) ===
document.getElementById('form-sesuaikan-saldo').addEventListener('submit', (e) => {
    e.preventDefault();
    const saldoBaru = document.getElementById('saldo-baru').value;
    
    if (currentEditId) {
         const index = globalAkun.findIndex(a => a.id === currentEditId);
         if (index !== -1) {
            globalAkun[index].saldo = parseFloat(saldoBaru) || globalAkun[index].saldo;
         }
    }
    
    renderAkunList();
    closeModal('modal-sesuaikan-saldo');
});

// === Event Delegation untuk Tombol Edit/Hapus/Sesuaikan (Kategori) ===
document.getElementById('kategori-list-container').addEventListener('click', (e) => {
    const editButton = e.target.closest('.btn-edit-kategori');
    const deleteButton = e.target.closest('.btn-hapus-kategori');

    if (editButton) {
        e.preventDefault();
        currentEditId = editButton.getAttribute('data-id');
        const kategori = globalKategori.find(k => k.id === currentEditId);
        
        if (kategori) {
            document.getElementById('modal-kategori-title').textContent = 'Edit Kategori';
            document.getElementById('nama-kategori').value = kategori.nama;
            openModal('modal-kategori');
        }
    }
    
    if (deleteButton) {
        e.preventDefault();
        currentDeleteId = deleteButton.getAttribute('data-id');
        currentDeleteType = 'kategori';
        const kategori = globalKategori.find(k => k.id === currentDeleteId);
        // Tampilkan nama di modal konfirmasi
        document.getElementById('delete-item-name').textContent = kategori.nama;
        openModal('modal-konfirmasi-hapus');
    }
});

// === Event Delegation untuk Tombol Edit/Hapus/Sesuaikan (Akun) ===
document.getElementById('akun-list-container').addEventListener('click', (e) => {
    const editButton = e.target.closest('.btn-edit-akun');
    const deleteButton = e.target.closest('.btn-hapus-akun');
    const sesuaikanButton = e.target.closest('.btn-sesuaikan-saldo'); // Perbaiki selector

    if (editButton) {
        e.preventDefault();
        currentEditId = editButton.getAttribute('data-id');
        const akun = globalAkun.find(a => a.id === currentEditId);
        
        if (akun) {
            document.getElementById('modal-akun-title').textContent = 'Edit Akun';
            document.getElementById('nama-akun').value = akun.nama;
            // Saat edit, saldo awal mungkin di-disable atau di-set ke nilai saat ini
            document.getElementById('saldo-awal').value = akun.saldo;
            document.getElementById('saldo-awal').disabled = true; // Nonaktifkan edit saldo awal di form ini
            openModal('modal-akun');
        }
    }
    
    if (deleteButton) {
        e.preventDefault();
        currentDeleteId = deleteButton.getAttribute('data-id');
        currentDeleteType = 'akun';
        const akun = globalAkun.find(a => a.id === currentDeleteId);
        document.getElementById('delete-item-name').textContent = akun.nama;
        openModal('modal-konfirmasi-hapus');
    }
    
    if (sesuaikanButton) {
        e.preventDefault();
        currentEditId = sesuaikanButton.getAttribute('data-id'); // Gunakan currentEditId untuk ini
        const akun = globalAkun.find(a => a.id === currentEditId);
        
        if (akun) {
            document.getElementById('sesuaikan-akun-nama').textContent = akun.nama;
            document.getElementById('saldo-baru').value = akun.saldo;
            openModal('modal-sesuaikan-saldo');
        }
    }
});

// === Logika Tombol Konfirmasi Hapus ===
document.getElementById('btn-konfirmasi-hapus').addEventListener('click', () => {
    if (currentDeleteType === 'kategori' && currentDeleteId) {
        globalKategori = globalKategori.filter(k => k.id !== currentDeleteId);
        renderKategoriList(); // Gambar ulang
    }
    
    if (currentDeleteType === 'akun' && currentDeleteId) {
        globalAkun = globalAkun.filter(a => a.id !== currentDeleteId);
        renderAkunList(); // Gambar ulang
    }
    
    closeModal('modal-konfirmasi-hapus');
});


// === Inisialisasi Aplikasi ===
// Tampilkan halaman dashboard saat pertama kali dimuat
showPage('dashboard');
