// =============================================
// INISIALISASI VARIABEL GLOBAL
// =============================================

// Variabel untuk menyimpan instance Chart (agar bisa di-destroy dan di-update)
let labaPengeluaranChartInstance = null;
let penjualanChartInstance = null;

// Variabel untuk menyimpan instance Modal (untuk Hapus dan Edit)
let konfirmasiHapusModal = null;
let kasirModal = null;
let transaksiModal = null;
let hutangModal = null;
let masterDataModal = null;
// BARU: Menambah referensi Offcanvas riwayat hapus
let riwayatHapusModal = null;

// Variabel untuk menyimpan data sementara saat Hapus/Edit
let itemUntukDihapus = { type: null, id: null };

// Variabel untuk menyimpan state filter tanggal
let globalDateFilter = {
    tipe: 'bulanan', // default 'bulanan'
    startDate: new Date(),
    endDate: new Date()
};

// =============================================
// FUNGSI HELPER UTAMA
// =============================================

/**
 * BARU: Menyimpan semua data ke Local Storage
 */
function saveDataToLocalStorage() {
    try {
        localStorage.setItem('n2store_masterData', JSON.stringify(initialMasterData));
        localStorage.setItem('n2store_historyData', JSON.stringify(initialHistoryData));
        localStorage.setItem('n2store_deletionHistory', JSON.stringify(globalDeletionHistory));
        console.log('Data berhasil disimpan ke Local Storage.');
    } catch (e) {
        console.error('Gagal menyimpan data ke Local Storage:', e);
    }
}

/**
 * BARU: Memuat semua data dari Local Storage
 */
function loadDataFromLocalStorage() {
    try {
        const masterData = localStorage.getItem('n2store_masterData');
        const historyData = localStorage.getItem('n2store_historyData');
        const deletionHistory = localStorage.getItem('n2store_deletionHistory');

        if (masterData) {
            initialMasterData = JSON.parse(masterData);
            console.log('Master Data berhasil dimuat dari Local Storage.');
        }
        if (historyData) {
            initialHistoryData = JSON.parse(historyData);
            console.log('History Data berhasil dimuat dari Local Storage.');
        }
        if (deletionHistory) {
            globalDeletionHistory = JSON.parse(deletionHistory);
            console.log('Deletion History berhasil dimuat dari Local Storage.');
        }
    } catch (e) {
        console.error('Gagal memuat data dari Local Storage:', e);
    }
}

/**
 * Memformat angka menjadi string mata uang (Rp)
 * DIPERBAIKI: Menangani angka negatif dengan tanda minus di belakang (Rp 5.000-)
 */
function formatCurrency(number) {
    if (isNaN(number)) number = 0;
    
    const isNegative = number < 0;
    const absoluteNumber = Math.abs(number);
    
    let formattedNumber = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(absoluteNumber);
    
    // Tambahkan tanda minus di belakang jika negatif
    if (isNegative) {
        formattedNumber = formattedNumber.replace('Rp', 'Rp ') + '-';
    }
    
    return formattedNumber;
}

/**
 * Mendapatkan string tanggal hari ini (YYYY-MM-DD)
 */
function getTodayDateString() {
    // Menggunakan zona waktu lokal Indonesia
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60000));
    return localDate.toISOString().split('T')[0];
}

/**
 * Memformat string tanggal (YYYY-MM-DD) menjadi format Indonesia (mis: 10 November 2025)
 */
function formatFullDate(dateString) {
    if (!dateString) return "Tanggal Tidak Valid";
    // Asumsikan dateString adalah YYY-MM-DD
    const date = new Date(dateString + 'T12:00:00'); // Atur ke tengah hari untuk menghindari masalah zona waktu
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta' // Pastikan konsisten
    }).format(date);
}

/**
 * Mendapatkan string waktu saat ini (HH:MM)
 */
function getWaktuSekarang() {
    const now = new Date();
    // Menggunakan zona waktu Jakarta
    const options = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' };
    return new Intl.DateTimeFormat('id-ID', options).format(now);
}


/**
 * BARU: Mengatur filter tanggal global berdasarkan tipe ('harian', 'mingguan', 'bulanan', 'rentang')
 * Fungsi ini mengatur variabel globalDateFilter
 */
function setGlobalFilter(tipe) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Atur ke awal hari

    let start = new Date(today);
    let end = new Date(today);
    end.setHours(23, 59, 59, 999); // Atur ke akhir hari

    switch (tipe) {
        case 'harian':
            // Sudah diatur (today)
            break;
        case 'mingguan':
            // Mundur ke hari Minggu (hari 0)
            start.setDate(start.getDate() - start.getDay());
            // Maju ke hari Sabtu (hari 6)
            end = new Date(start);
            end.setDate(end.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            break;
        case 'bulanan':
            // Mundur ke tanggal 1
            start.setDate(1);
            // Maju ke akhir bulan
            end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case 'rentang':
            const startDateEl = document.getElementById('filter-start-date');
            const endDateEl = document.getElementById('filter-end-date');
            if (startDateEl.value && endDateEl.value) {
                start = new Date(startDateEl.value + 'T00:00:00'); // Pastikan awal hari
                end = new Date(endDateEl.value + 'T23:59:59');     // Pastikan akhir hari
            } else {
                // DIUBAH: Hapus alert(), ganti dengan notifikasi non-blokir
                window.addAppNotification('Silakan pilih tanggal mulai dan selesai.', 'bi-exclamation-triangle-fill', 'text-danger');
                return false; // Batalkan perubahan
            }
            break;
        default:
            console.warn(`Tipe filter tidak dikenal: ${tipe}`);
            return false;
    }

    // Terapkan ke variabel global
    globalDateFilter.tipe = tipe;
    globalDateFilter.startDate = start;
    globalDateFilter.endDate = end;

    console.log(`Filter diatur ke: ${tipe} (${start.toISOString()} - ${end.toISOString()})`);
    
    // Perbarui UI Tombol
    document.querySelectorAll('#filter-tanggal-buttons .nav-link').forEach(btn => {
        if (btn.dataset.tipe === tipe) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Jika tipenya rentang, isi input tanggal (jika belum diisi)
    if (tipe !== 'rentang') {
         document.getElementById('filter-start-date').value = start.toISOString().split('T')[0];
         document.getElementById('filter-end-date').value = end.toISOString().split('T')[0];
    }
    
    return true; // Sukses
}

/**
 * BARU: Memfilter array data (transaksi/penjualan) berdasarkan globalDateFilter
 */
function filterDataByDate(dataArray) {
    if (!globalDateFilter.startDate || !globalDateFilter.endDate) {
        console.warn('Filter tanggal global belum diatur. Mengembalikan semua data.');
        return dataArray;
    }

    // Pastikan startDate dan endDate adalah objek Date
    const startFilter = (globalDateFilter.startDate instanceof Date) ? globalDateFilter.startDate : new Date(globalDateFilter.startDate);
    const endFilter = (globalDateFilter.endDate instanceof Date) ? globalDateFilter.endDate : new Date(globalDateFilter.endDate);
    
    return dataArray.filter(item => {
        if (!item.tanggal) {
            console.warn('Item tidak memiliki properti tanggal:', item);
            return false;
        }
        
        // Buat objek Date dari item.tanggal (YYYY-MM-DD)
        // Tambahkan 'T12:00:00' untuk menghindari masalah zona waktu (tengah hari)
        const itemDate = new Date(item.tanggal + 'T12:00:00'); 
        
        return itemDate >= startFilter && itemDate <= endFilter;
    });
}


/**
 * Fungsi helper untuk mengatur teks atau nilai elemen berdasarkan ID
 */
function setValueById(id, value) {
    const el = document.getElementById(id);
    if (el) {
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
            el.value = value;
        } else {
            el.textContent = value;
        }
    } else {
        console.warn(`Elemen dengan ID '${id}' tidak ditemukan.`);
    }
}

/**
 * Fungsi helper untuk mendapatkan nilai dari akun berdasarkan nama
 */
function getAkunSaldo(namaAkun, akunData) {
    const akun = akunData.find(a => a.nama.toLowerCase() === namaAkun.toLowerCase());
    return akun ? akun.saldo : 0;
}

/**
 * Menghitung total saldo dari semua akun (kecuali Hutang Piutang)
 */
function getTotalSaldoTunai(akunData) {
    return akunData
        .filter(a => a.nama.toLowerCase() !== 'hutang piutang')
        .reduce((acc, a) => acc + a.saldo, 0);
}


/**
 * BARU: Memuat ulang data di Halaman Laporan Laba Rugi
 */
function renderLaporanPage() {
    try {
        // 1. Dapatkan data yang sudah difilter
        const filteredSales = filterDataByDate(initialHistoryData.penjualan);
        const filteredTrx = filterDataByDate(initialHistoryData.transaksi);

        // 2. Hitung Pendapatan
        const labaProduk = filteredSales
            .filter(s => s.tipe === 'Produk')
            .reduce((acc, s) => acc + s.laba, 0);
        
        const labaJasa = filteredSales
            .filter(s => s.tipe === 'Jasa')
            .reduce((acc, s) => acc + s.laba, 0);

        const labaAplikasi = filteredSales
            .filter(s => s.tipe === 'Aplikasi')
            .reduce((acc, s) => acc + s.laba, 0);
        
        const labaTrx = filteredTrx
            .filter(t => t.tipe === 'TRX')
            .reduce((acc, t) => acc + t.fee, 0);
        
        const pendapatanLain = filteredTrx
            .filter(t => t.tipe === 'Pendapatan')
            .reduce((acc, t) => acc + t.total, 0);

        const totalPendapatan = labaProduk + labaJasa + labaAplikasi + labaTrx + pendapatanLain;

        // 3. Hitung Beban (Modal / COGS / Pengeluaran)
        const modalProduk = filteredSales
            .filter(s => s.tipe === 'Produk')
            .reduce((acc, s) => acc + (s.modal * s.kuantitas), 0);
        
        const modalJasa = filteredSales
            .filter(s => s.tipe === 'Jasa')
            .reduce((acc, s) => acc + s.modal, 0);

        const modalAplikasi = filteredSales
            .filter(s => s.tipe === 'Aplikasi')
            .reduce((acc, s) => acc + s.modal, 0);

        // 'total' di TRX adalah modal
        const modalTrx = filteredTrx
            .filter(t => t.tipe === 'TRX')
            .reduce((acc, t) => acc + t.total, 0);

        const pengeluaranRumah = filteredTrx
            .filter(t => t.kategori === 'Pengeluaran Rumah')
            .reduce((acc, t) => acc + t.total, 0);

        // Pengeluaran lain (selain Pengeluaran Rumah)
        const pengeluaranLain = filteredTrx
            .filter(t => t.tipe === 'Pengeluaran' && t.kategori !== 'Pengeluaran Rumah')
            .reduce((acc, t) => acc + t.total, 0);
        
        const totalBeban = modalProduk + modalJasa + modalAplikasi + modalTrx + pengeluaranRumah + pengeluaranLain;

        // 4. Hitung Laba Bersih
        const totalLabaBersih = totalPendapatan - totalBeban;

        // 5. Render ke DOM
        setValueById('laporan-laba-produk', formatCurrency(labaProduk));
        setValueById('laporan-laba-jasa', formatCurrency(labaJasa));
        setValueById('laporan-laba-aplikasi', formatCurrency(labaAplikasi));
        setValueById('laporan-laba-trx', formatCurrency(labaTrx));
        setValueById('laporan-pendapatan-lain', formatCurrency(pendapatanLain));
        setValueById('laporan-total-pendapatan', formatCurrency(totalPendapatan));

        setValueById('laporan-modal-produk', formatCurrency(modalProduk));
        setValueById('laporan-modal-jasa', formatCurrency(modalJasa));
        setValueById('laporan-modal-aplikasi', formatCurrency(modalAplikasi));
        setValueById('laporan-modal-trx', formatCurrency(modalTrx));
        setValueById('laporan-pengeluaran-rumah', formatCurrency(pengeluaranRumah));
        setValueById('laporan-pengeluaran-lain', formatCurrency(pengeluaranLain));
        setValueById('laporan-total-beban', formatCurrency(totalBeban));

        setValueById('laporan-total-laba-bersih', formatCurrency(totalLabaBersih));
        
        // Update rentang tanggal
        const startStr = globalDateFilter.startDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        const endStr = globalDateFilter.endDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        setValueById('laporan-rentang-tanggal', `Rentang: ${startStr} - ${endStr}`);

    } catch (error) {
        console.error("Error besar saat me-render Halaman Laporan:", error);
    }
}


/**
 * Render semua data Master Data ke halamannya masing-masing
 */
function renderAllMasterData() {
    try {
        renderProdukList(initialMasterData.produk);
        renderKategoriList(initialMasterData.kategori);
        renderAkunLists(initialMasterData.akun);
        renderJenisTransaksiList(initialMasterData.jenisTransaksi);
        renderPenggunaList(initialMasterData.pengguna);
    } catch (e) {
        console.error("Error saat renderAllMasterData:", e);
    }
}
        
/**
 * Render semua data Riwayat ke halamannya masing-masing
 */
function renderAllHistoryPages() {
    try {
        renderSalesHistory(initialHistoryData.penjualan);
        renderTransactionHistory(initialHistoryData.transaksi);
        renderDebtHistory(initialHistoryData.hutang);
    } catch (e) {
        console.error("Error saat renderAllHistoryPages:", e);
    }
}

/**
 * Render daftar di Halaman Produk
 */
function renderProdukList(produkData) {
    const tableContainer = document.getElementById('product-table-container');
    const totalAssetEl = document.getElementById('produk-total-asset');
    if (!tableContainer || !totalAssetEl) {
         console.error("Elemen 'product-table-container' atau 'produk-total-asset' tidak ditemukan.");
         return;
    }
    
    // Simpan header (jika ada) sebelum menghapus
    const header = tableContainer.querySelector('.product-table-header');
    tableContainer.innerHTML = ''; 
    if (header) {
        tableContainer.appendChild(header); 
    }
    
    let totalAsset = 0;
    
    // Perbarui dropdown di Modal Kasir
    const dropdown = document.getElementById('produkNama');
    if (dropdown) {
        // Simpan placeholder
        const placeholder = dropdown.querySelector('option[value=""]');
        dropdown.innerHTML = '';
        if(placeholder) dropdown.appendChild(placeholder);

        // Urutkan berdasarkan nama
        produkData.sort((a, b) => a.nama.localeCompare(b.nama)).forEach(item => {
            // DIUBAH: Menambahkan data-id untuk dropdown
            dropdown.innerHTML += `<option value="${item.nama}" data-id="${item.id}">${item.nama}</option>`;
        });
    } else {
        console.error("Elemen 'produkNama' (dropdown) tidak ditemukan.");
    }

    // Urutkan berdasarkan nama untuk tampilan daftar
    produkData.sort((a, b) => a.nama.localeCompare(b.nama)).forEach(item => {
        totalAsset += (item.modal * item.stok);
        tableContainer.innerHTML += `
            <div class="row product-table-row mx-0">
                <div class="col-md-3 fw-bold product-table-row-flex">${item.nama}</div>
                <div class="col-md-2 product-table-row-flex justify-content-end">${formatCurrency(item.modal)}</div>
                <div class="col-md-2 product-table-row-flex justify-content-end">${formatCurrency(item.jual)}</div>
                <div class="col-md-2 product-table-row-flex justify-content-end">${item.stok}</div>
                <div class="col-md-3 product-table-row-flex justify-content-center">
                    <button class="action-link-edit" 
                            data-bs-toggle="modal" 
                            data-bs-target="#masterDataModal"
                            data-type="produk"
                            data-action="edit"
                            data-id="${item.id}">Edit</button>
                    <button class="action-link-delete" 
                            onclick="showDeleteConfirmation('produk', ${item.id})">Hapus</button>
                </div>
            </div>
        `;
    });
    
    totalAssetEl.textContent = formatCurrency(totalAsset);
}

/**
 * Render daftar di Halaman Kategori
 */
function renderKategoriList(kategoriData) {
    const listContainer = document.getElementById('kategori-list-container');
    if (!listContainer) {
         console.error("Elemen 'kategori-list-container' tidak ditemukan.");
         return;
    }
    listContainer.innerHTML = '';
    
    const dropdowns = document.querySelectorAll('.kategori-dropdown');
    dropdowns.forEach(dropdown => {
        const placeholder = dropdown.querySelector('option[value=""]');
        dropdown.innerHTML = '';
        if(placeholder) dropdown.appendChild(placeholder);
    });

    // Urutkan berdasarkan nama
    kategoriData.sort().forEach((namaKategori, index) => {
        const itemId = index; // Gunakan index sebagai ID untuk array string
        
        listContainer.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${namaKategori}</span>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-2"
                            data-bs-toggle="modal" 
                            data-bs-target="#masterDataModal"
                            data-type="kategori"
                            data-action="edit"
                            data-id="${itemId}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="showDeleteConfirmation('kategori', ${itemId})">Hapus</button>
                </div>
            </li>
        `;
        
        dropdowns.forEach(dropdown => {
            dropdown.innerHTML += `<option value="${namaKategori}">${namaKategori}</option>`;
        });
    });
}

/**
 * Render daftar di Halaman Akun (dan Sidebar)
 */
function renderAkunLists(akunData) {
    const listContainerPage = document.getElementById('akun-list-container');
    const listContainerSidebar = document.getElementById('sidebar-akun-list-container');
    
    if (listContainerPage) listContainerPage.innerHTML = '';
    if (listContainerSidebar) listContainerSidebar.innerHTML = '';
    
    const dropdowns = document.querySelectorAll('.akun-dropdown');
    dropdowns.forEach(dropdown => {
        const placeholder = dropdown.querySelector('option[value=""]');
        dropdown.innerHTML = '';
        if(placeholder) dropdown.appendChild(placeholder);
    });

    akunData.sort((a, b) => a.nama.localeCompare(b.nama)).forEach(item => {
        const saldoColor = item.saldo >= 0 ? 'text-success' : 'text-danger';
        const saldoFormatted = formatCurrency(item.saldo);
        
        if (listContainerPage) {
            listContainerPage.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <span class="fw-bold d-block">${item.nama}</span>
                        <small class="${saldoColor} fw-bold">${saldoFormatted}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-2" 
                                data-bs-toggle="modal" 
                                data-bs-target="#masterDataModal"
                                data-type="akun"
                                data-action="edit"
                                data-id="${item.id}">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="showDeleteConfirmation('akun', ${item.id})">Hapus</button>
                    </div>
                </li>
            `;
        }
        
        if (listContainerSidebar) {
            listContainerSidebar.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${item.nama}</span>
                    <span class="fw-bold ${saldoColor}">${saldoFormatted}</span>
                </li>
            `;
        }
        
        dropdowns.forEach(dropdown => {
            dropdown.innerHTML += `<option value="${item.nama}">${item.nama}</option>`;
        });
    });
}

/**
 * Render daftar di Halaman Jenis Transaksi
 */
function renderJenisTransaksiList(jenisData) {
    const listContainer = document.getElementById('jenis-transaksi-list-container');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    jenisData.sort().forEach((namaJenis, index) => {
        const itemId = index; 
        listContainer.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${namaJenis}</span>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-2"
                            data-bs-toggle="modal" 
                            data-bs-target="#masterDataModal"
                            data-type="jenisTransaksi"
                            data-action="edit"
                            data-id="${itemId}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="showDeleteConfirmation('jenisTransaksi', ${itemId})">Hapus</button>
                </div>
            </li>
        `;
    });
}

/**
 * Render daftar di Halaman Pengguna
 */
function renderPenggunaList(penggunaData) {
    const listContainer = document.getElementById('pengguna-list-container');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    penggunaData.sort().forEach((namaPengguna, index) => {
        const itemId = index; 
        listContainer.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${namaPengguna}</span>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-2"
                            data-bs-toggle="modal" 
                            data-bs-target="#masterDataModal"
                            data-type="pengguna"
                            data-action="edit"
                            data-id="${itemId}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="showDeleteConfirmation('pengguna', ${itemId})">Hapus</button>
                </div>
            </li>
        `;
    });
}
        
/**
 * Render daftar di Halaman Kasir
 */
function renderSalesHistory(salesData) {
    const container = document.getElementById('sales-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Kelompokkan berdasarkan tanggal
    const salesByDate = salesData.reduce((acc, sale) => {
        (acc[sale.tanggal] = acc[sale.tanggal] || []).push(sale);
        return acc;
    }, {});
    
    // Urutkan tanggal (terbaru dulu)
    const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) {
        container.innerHTML = '<p class="text-center text-muted p-4">Belum ada riwayat penjualan.</p>';
        return;
    }

    sortedDates.forEach(date => {
        // Tambahkan separator tanggal
        container.innerHTML += `<h6 class="transaction-date-separator">${formatFullDate(date)}</h6>`;
        
        // Urutkan item di tanggal tsb (terbaru dulu)
        salesByDate[date].sort((a, b) => b.id - a.id).forEach(item => {
            let iconClass, iconBg;
            switch(item.tipe) {
                case 'Produk': iconClass = 'bi-box-seam'; iconBg = 'bg-primary-subtle text-primary'; break;
                case 'Jasa': iconClass = 'bi-tools'; iconBg = 'bg-success-subtle text-success'; break;
                case 'Aplikasi': iconClass = 'bi-grid'; iconBg = 'bg-warning-subtle text-warning'; break;
                default: iconClass = 'bi-question-circle'; iconBg = 'bg-secondary-subtle text-secondary';
            }
            
            container.innerHTML += `
                <div class="card shadow-sm mb-2 sales-history-row-card">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <!-- Kolom 1: Ikon & Nama -->
                            <div class="col-md-3 d-flex align-items-center">
                                <div class="sales-icon ${iconBg}">
                                    <i class="${iconClass}"></i>
                                </div>
                                <div class="sales-info">
                                    <span class="fw-bold d-block">${item.nama}</span>
                                    <span class="time">${item.waktu}</span>
                                </div>
                            </div>
                            <!-- Kolom 2: Rincian -->
                            <div class="col-md-3">
                                <div class="sales-details">
                                    <span class="fw-bold d-block">${item.kuantitas}x (${item.tipe})</span>
                                    <span class="sub-info">${formatCurrency(item.laba)} Laba</span>
                                </div>
                            </div>
                            <!-- Kolom 3: Harga Jual -->
                            <div class="col-md-2 text-md-end">
                                <span class="fw-bold">${formatCurrency(item.hargaJual)}</span>
                            </div>
                            <!-- Kolom 4: Total -->
                            <div class="col-md-2 text-md-end">
                                <span class="h6 mb-0 sales-total text-primary">${formatCurrency(item.total)}</span>
                            </div>
                            <!-- Kolom 5: Aksi -->
                            <div class="col-md-2 text-md-center mt-2 mt-md-0">
                                <button class="btn btn-sm btn-outline-primary"
                                        data-bs-toggle="modal" 
                                        data-bs-target="#kasirModal"
                                        data-action="edit"
                                        data-id="${item.id}">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger"
                                        onclick="showDeleteConfirmation('penjualan', ${item.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    });
}
        
/**
 * Render daftar di Halaman Transaksi
 */
function renderTransactionHistory(trxData) {
    const container = document.getElementById('transaction-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const trxByDate = trxData.reduce((acc, trx) => {
        (acc[trx.tanggal] = acc[trx.tanggal] || []).push(trx);
        return acc;
    }, {});
    
    const sortedDates = Object.keys(trxByDate).sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) {
        container.innerHTML = '<p class="text-center text-muted p-4">Belum ada riwayat transaksi.</p>';
        return;
    }

    sortedDates.forEach(date => {
        container.innerHTML += `<h6 class="transaction-date-separator">${formatFullDate(date)}</h6>`;
        
        trxByDate[date].sort((a, b) => b.id - a.id).forEach(item => {
            const isPendapatan = item.tipe === 'Pendapatan';
            const totalColor = isPendapatan ? 'text-success' : 'text-danger';
            // Untuk TRX, total yang ditampilkan adalah Laba (fee), bukan modal
            const totalAmount = item.tipe === 'TRX' ? item.fee : item.total;
            const iconBg = isPendapatan ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';
            
            let iconClass = item.icon || 'bi-question-circle';
            if(item.tipe === 'Transfer') iconClass = 'bi-arrow-left-right';
            else if(isPendapatan) iconClass = 'bi-arrow-down';
            else iconClass = 'bi-arrow-up';
            
            // Rincian Akun
            let rincianAkun = '';
            if (item.tipe === 'Transfer') rincianAkun = `${item.dariAkun} <i class="bi bi-arrow-right"></i> ${item.keAkun}`;
            else if (isPendapatan) rincianAkun = `Ke: ${item.keAkun}`;
            else rincianAkun = `Dari: ${item.dariAkun}`;

            container.innerHTML += `
                <div class="card shadow-sm mb-2 transaction-row-card">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <!-- Kolom 1: Ikon & Jenis -->
                            <div class="col-md-3 d-flex align-items-center">
                                <div class="transaction-icon ${iconBg}">
                                    <i class="${iconClass}"></i>
                                </div>
                                <div class="transaction-info">
                                    <span class="fw-bold d-block">${item.jenis}</span>
                                    <span class="time">${item.waktu}</span>
                                </div>
                            </div>
                            <!-- Kolom 2: Rincian -->
                            <div class="col-md-3">
                                <div class="transaction-details">
                                    <span class="fw-bold d-block">${rincianAkun}</span>
                                    <span class="catatan">${item.catatan}</span>
                                </div>
                            </div>
                            <!-- Kolom 3: Kategori -->
                            <div class="col-md-2 text-md-end">
                                <span class="badge bg-light text-dark">${item.kategori}</span>
                            </div>
                            <!-- Kolom 4: Total -->
                            <div class="col-md-2 text-md-end">
                                <span class="h6 mb-0 transaction-total ${totalColor}">${formatCurrency(totalAmount)}</span>
                            </div>
                            <!-- Kolom 5: Aksi -->
                            <div class="col-md-2 text-md-center mt-2 mt-md-0">
                                <button class="btn btn-sm btn-outline-primary"
                                        data-bs-toggle="modal" 
                                        data-bs-target="#transaksiModal"
                                        data-action="edit"
                                        data-id="${item.id}">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger"
                                        onclick="showDeleteConfirmation('transaksi', ${item.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    });
}
        
/**
 * Render daftar di Halaman Hutang
 */
function renderDebtHistory(debtData) {
    const container = document.getElementById('debt-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const debtByDate = debtData.reduce((acc, debt) => {
        (acc[debt.tanggal] = acc[debt.tanggal] || []).push(debt);
        return acc;
    }, {});
    
    const sortedDates = Object.keys(debtByDate).sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) {
        container.innerHTML = '<p class="text-center text-muted p-4">Belum ada riwayat hutang/piutang.</p>';
        return;
    }

    sortedDates.forEach(date => {
        container.innerHTML += `<h6 class="transaction-date-separator">${formatFullDate(date)}</h6>`;
        
        debtByDate[date].sort((a, b) => b.id - a.id).forEach(item => {
            const isPiutang = item.tipe === 'Piutang';
            const totalColor = isPiutang ? 'text-success' : 'text-danger';
            const iconBg = isPiutang ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';
            const iconClass = isPiutang ? 'bi-arrow-down' : 'bi-arrow-up';
            const lunasClass = item.lunas ? 'lunas' : '';
            const lunasBadge = item.lunas ? '<span class="badge bg-secondary lunas-badge ms-2">LUNAS</span>' : '';

            container.innerHTML += `
                <div class="card shadow-sm mb-2 debt-piutang-row-card ${lunasClass}">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <!-- Kolom 1: Ikon & Pihak -->
                            <div class="col-md-3 d-flex align-items-center">
                                <div class="debt-icon ${iconBg}">
                                    <i class="${iconClass}"></i>
                                </div>
                                <div class="person-info">
                                    <span class="fw-bold d-block">${item.pihak}${lunasBadge}</span>
                                    <span class="time">${item.waktu}</span>
                                </div>
                            </div>
                            <!-- Kolom 2: Rincian -->
                            <div class="col-md-3">
                                <div class="rincian-details">
                                    <span class="fw-bold d-block">${item.tipe}</span>
                                    <span class="total-sisa">Total: ${formatCurrency(item.total)} / Sisa: ${formatCurrency(item.sisa)}</span>
                                </div>
                            </div>
                            <!-- Kolom 3: Catatan -->
                            <div class="col-md-2 text-md-end">
                                <small class="text-muted">${item.catatan}</small>
                            </div>
                            <!-- Kolom 4: Jumlah -->
                            <div class="col-md-2 text-md-end">
                                <span class="h6 mb-0 jumlah-total ${totalColor}">${formatCurrency(item.jumlah)}</span>
                            </div>
                            <!-- Kolom 5: Aksi -->
                            <div class="col-md-2 text-md-center mt-2 mt-md-0">
                                <button class="btn btn-sm btn-outline-primary"
                                        data-bs-toggle="modal" 
                                        data-bs-target="#hutangModal"
                                        data-action="edit"
                                        data-id="${item.id}">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger"
                                        onclick="showDeleteConfirmation('hutang', ${item.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    });
}
        
/**
 * Inisialisasi semua grafik
 */
function initCharts() {
    try {
        // Grafik 1: Laba vs Pengeluaran (Doughnut)
        const ctxLaba = document.getElementById('labaPengeluaranChart');
        if (ctxLaba) {
            labaPengeluaranChartInstance = new Chart(ctxLaba, {
                type: 'doughnut',
                data: {
                    labels: ['Laba Bersih', 'Pengeluaran Rumah'],
                    datasets: [{
                        label: 'Jumlah',
                        data: [0, 0], // Diisi oleh renderDashboardAnalytics
                        backgroundColor: [
                            '#0d6efd', // Primary
                            '#198754'  // Success
                        ],
                        borderColor: '#ffffff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            display: false // Legenda kustom di HTML
                        }
                    }
                }
            });
        }

        // Grafik 2: Penjualan (Line)
        const ctxPenjualan = document.getElementById('penjualanChart');
        if (ctxPenjualan) {
            penjualanChartInstance = new Chart(ctxPenjualan, {
                type: 'line',
                data: {
                    labels: [], // Diisi oleh renderDashboardAnalytics
                    datasets: [{
                        label: 'Penjualan',
                        data: [], // Diisi oleh renderDashboardAnalytics
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: '#0d6efd',
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) { return 'Rp ' + (value / 1000) + 'k'; }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.error("Error saat inisialisasi grafik:", e);
    }
}


// =============================================
// BARU: FUNGSI HELPER UNTUK DASHBOARD
// =============================================

/**
 * BARU: Menghitung persentase perubahan
 */
function calculatePercentageChange(kemarin, sekarang) {
    if (kemarin === 0) {
        if (sekarang > 0) return { persen: "100.0", operator: "+", kelas: "text-success" };
        return { persen: "N/A", operator: "", kelas: "text-muted" };
    }
    const change = ((sekarang - kemarin) / Math.abs(kemarin)) * 100;
    const isNaik = change > 0;
    const isTurun = change < 0;

    return {
        persen: Math.abs(change).toFixed(1),
        operator: isNaik ? '+' : (isTurun ? '-' : ''),
        kelas: isNaik ? 'text-success' : (isTurun ? 'text-danger' : 'text-muted')
    };
}

/**
 * BARU: Menghitung data untuk grafik penjualan (garis)
 */
function getSalesChartData(filteredSales) {
    const salesByDate = {};
    
    // Inisialisasi rentang tanggal filter
    if (globalDateFilter.startDate && globalDateFilter.endDate) {
        let currentDate = new Date(globalDateFilter.startDate);
        const endDate = new Date(globalDateFilter.endDate);

        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            salesByDate[dateString] = 0;
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    // Isi data penjualan
    filteredSales.forEach(sale => {
        if (salesByDate.hasOwnProperty(sale.tanggal)) {
            salesByDate[sale.tanggal] += sale.total;
        }
    });
    
    // Sortir keys (tanggal)
    const sortedDates = Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
    
    // Format label (mis: 10/Nov)
    const labels = sortedDates.map(dateStr => {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    });
    
    const data = sortedDates.map(dateStr => salesByDate[dateStr]);

    return { labels, data };
}

/**
 * BARU: Menghitung Top 7 Produk
 */
function calculateTopProduk(filteredSales) {
    const produkStats = {};
    
    filteredSales.filter(s => s.tipe === 'Produk').forEach(sale => {
        if (!produkStats[sale.nama]) {
            produkStats[sale.nama] = { totalLaba: 0, totalTerjual: 0 };
        }
        produkStats[sale.nama].totalLaba += sale.laba;
        produkStats[sale.nama].totalTerjual += sale.kuantitas;
    });

    // Ubah ke array dan urutkan
    return Object.entries(produkStats)
        .map(([nama, stats]) => ({ nama, ...stats }))
        .sort((a, b) => b.totalLaba - a.totalLaba) // Urutkan berdasarkan laba
        .slice(0, 7); // Ambil 7 teratas
}


// =============================================
// FUNGSI RENDER DASHBOARD (DIPERBARUI)
// =============================================
/**
 * Render ulang semua kartu dan grafik di Halaman Dashboard
 * DIPERBARUI: Sekarang menggunakan data yang difilter
 */
function renderDashboardAnalytics() {
    try {
        // =============================================
        // 1. FILTER DATA
        // =============================================
        // Ambil data riwayat yang sudah difilter berdasarkan rentang tanggal
        const filteredSales = filterDataByDate(initialHistoryData.penjualan);
        const filteredTrx = filterDataByDate(initialHistoryData.transaksi);
        const filteredDebt = filterDataByDate(initialHistoryData.hutang);
        
        // Ambil data master (ini tidak difilter tanggal)
        const masterAkun = initialMasterData.akun;

        // =============================================
        // 2. ANALISA UMUM (KARTU ATAS)
        // =============================================

        // --- Kartu Total Saldo Tunai (Data Master - Tidak difilter) ---
        const totalSaldo = getTotalSaldoTunai(masterAkun);
        setValueById('dashboard-total-saldo', formatCurrency(totalSaldo));
        // (Logika persen kemarin diabaikan untuk saat ini)
        setValueById('dashboard-saldo-kemarin', 'vs Rp 0');
        setValueById('dashboard-saldo-persen', '+0.0%');

        // --- Kartu Total Gabungan (Data Master - Tidak difilter) ---
        const totalCash = getAkunSaldo("Cash", masterAkun);
        const totalTabungan = getAkunSaldo("Tabungan", masterAkun);
        const totalLaba = getAkunSaldo("Laba Bersih", masterAkun);
        const totalModal = getAkunSaldo("Modal", masterAkun);
        const totalGabungan = totalCash + totalTabungan + totalLaba + totalModal;
        setValueById('dashboard-total-cash', formatCurrency(totalGabungan));
        // (Logika persen kemarin diabaikan untuk saat ini)
        setValueById('dashboard-cash-kemarin', 'vs Rp 0');
        setValueById('dashboard-cash-persen', '+0.0%');

        // --- Kartu Total Piutang (Data Riwayat - DIFILTER) ---
        // DIUBAH: Menggunakan filteredDebt
        const totalPiutang = filteredDebt
            .filter(h => h.tipe === 'Piutang' && !h.lunas)
            .reduce((acc, h) => acc + h.sisa, 0);
        setValueById('dashboard-total-piutang', formatCurrency(totalPiutang));
        // (Logika persen kemarin diabaikan untuk saat ini)
        setValueById('dashboard-piutang-kemarin', 'vs Rp 0');
        setValueById('dashboard-piutang-persen', '+0.0%');

        // =============================================
        // 3. GRAFIK LABA & 4 KARTU KANAN
        // =============================================

        // --- Grafik Laba Bersih vs Pengeluaran Rumah (Data Riwayat - DIFILTER) ---
        // DIUBAH: Menggunakan filteredTrx
        const labaBersihTotal = filteredTrx
            .filter(t => t.kategori === 'Laba Bersih')
            .reduce((acc, t) => acc + t.total, 0);
        // DIUBAH: Menggunakan filteredTrx
        const pengeluaranRumahTotal = filteredTrx
            .filter(t => t.kategori === 'Pengeluaran Rumah')
            .reduce((acc, t) => acc + t.total, 0);

        setValueById('grafik-laba-nom', formatCurrency(labaBersihTotal));
        setValueById('grafik-pr-nom', formatCurrency(pengeluaranRumahTotal));
        // (Logika persen diabaikan)
        setValueById('grafik-naik-persen', 'N/A');

        if (labaPengeluaranChartInstance) {
            labaPengeluaranChartInstance.data.datasets[0].data = [labaBersihTotal, pengeluaranRumahTotal];
            labaPengeluaranChartInstance.update();
        }
        
        // --- 4 Kartu Kanan ---
        // Saldo Modal (Data Master - Tidak difilter)
        const saldoModal = getAkunSaldo("Modal", masterAkun);
        setValueById('dashboard-modal-total', formatCurrency(saldoModal));
        setValueById('dashboard-modal-persen', '+0.0%');
        
        // Total Laba Bersih (Data Riwayat - DIFILTER)
        // DIUBAH: Menggunakan labaBersihTotal yang sudah dihitung
        setValueById('dashboard-laba-total', formatCurrency(labaBersihTotal));
        setValueById('dashboard-laba-persen', '+0.0%');

        // Pengeluaran Rumah (Data Riwayat - DIFILTER)
        // DIUBAH: Menggunakan pengeluaranRumahTotal yang sudah dihitung
        setValueById('dashboard-pr-total', formatCurrency(pengeluaranRumahTotal));
        setValueById('dashboard-pr-persen', '+0.0%');
        
        // Cash (Data Master - Tidak difilter)
        const saldoCash = getAkunSaldo("Cash", masterAkun);
        setValueById('dashboard-tabungan-total', formatCurrency(saldoCash));
        setValueById('dashboard-tabungan-persen', '+0.0%');

        // =============================================
        // 4. ANALISA KHUSUS (Data Master - Tidak difilter)
        // =============================================
        const feeBrilink = getAkunSaldo("Fee BRI Link", masterAkun);
        setValueById('ak-fee-brilink-total', formatCurrency(feeBrilink));
        setValueById('ak-fee-brilink-persen', '+0.0%');

        const briNussa = getAkunSaldo("BRI Nussa", masterAkun);
        setValueById('ak-bri-nussa-total', formatCurrency(briNussa));
        setValueById('ak-bri-nussa-persen', '+0.0%');
        
        const tabungan = getAkunSaldo("Tabungan", masterAkun);
        setValueById('ak-tabungan-total', formatCurrency(tabungan));
        setValueById('ak-tabungan-persen', '+0.0%');
        
        // =============================================
        // 5. RIWAYAT & HUTANG (Data Riwayat - DIFILTER)
        // =============================================

        // --- Riwayat Transaksi Keuangan ---
        const transaksiContainer = document.getElementById('dashboard-transaksi-terbaru');
        transaksiContainer.innerHTML = '';
        // DIUBAH: Menggunakan filteredTrx
        const transaksiTerbaru = filteredTrx.slice(0, 5); // Ambil 5 terbaru dari data terfilter
        if (transaksiTerbaru.length === 0) {
            transaksiContainer.innerHTML = '<li class="list-group-item text-center text-muted p-4">Tidak ada transaksi.</li>';
        } else {
            transaksiTerbaru.forEach(item => {
                const totalColor = (item.tipe === 'Pendapatan' || item.fee > 0) ? 'text-success' : 'text-danger';
                const totalAmount = (item.tipe === 'TRX') ? item.fee : item.total;
                transaksiContainer.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <span class="fw-bold d-block">${item.jenis}</span>
                            <small class="text-muted">${item.catatan}</small>
                        </div>
                        <span class="fw-bold ${totalColor}">${formatCurrency(totalAmount)}</span>
                    </li>`;
            });
        }

        // --- Hutang Teratas ---
        const hutangContainer = document.getElementById('dashboard-hutang-teratas');
        hutangContainer.innerHTML = '';
        // DIUBAH: Menggunakan filteredDebt
        const hutangTeratas = filteredDebt
            .filter(h => !h.lunas)
            .sort((a, b) => b.sisa - a.sisa)
            .slice(0, 5);
            
        if (hutangTeratas.length === 0) {
            hutangContainer.innerHTML = '<li class="list-group-item text-center text-muted p-4">Tidak ada hutang.</li>';
        } else {
            hutangTeratas.forEach(item => {
                hutangContainer.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <span class="fw-bold d-block">${item.pihak}</span>
                            <small class="text-muted">${item.tipe}</small>
                        </div>
                        <span class="fw-bold text-${item.color}">${formatCurrency(item.sisa)}</span>
                    </li>`;
            });
        }
        
        // =============================================
        // 6. ANALISA PENJUALAN (Data Riwayat - DIFILTER)
        // =============================================
        
        // --- Grafik Penjualan (Garis) ---
        // DIUBAH: Menggunakan filteredSales
        const { labels, data } = getSalesChartData(filteredSales);
        if (penjualanChartInstance) {
            penjualanChartInstance.data.labels = labels;
            penjualanChartInstance.data.datasets[0].data = data;
            penjualanChartInstance.update();
        }

        // --- Laba Penjualan (Teks) ---
        // DIUBAH: Menggunakan filteredSales
        const totalLabaPenjualan = filteredSales.reduce((acc, s) => acc + s.laba, 0);
        setValueById('sales-laba', formatCurrency(totalLabaPenjualan));
        setValueById('sales-persen', 'N/A'); // Persen diabaikan

        // --- Info Penjualan (Grid 3x2) ---
        // DIUBAH: Menggunakan filteredSales
        const produkTerjual = filteredSales
            .filter(s => s.tipe === 'Produk')
            .reduce((acc, s) => acc + s.kuantitas, 0);
        const jasaTerjual = filteredSales
            .filter(s => s.tipe === 'Jasa')
            .reduce((acc, s) => acc + s.kuantitas, 0); // Kuantitas jasa diasumsikan 1
        
        const labaProduk = filteredSales
            .filter(s => s.tipe === 'Produk')
            .reduce((acc, s) => acc + s.laba, 0);
        const labaJasa = filteredSales
            .filter(s => s.tipe === 'Jasa')
            .reduce((acc, s) => acc + s.laba, 0);
        const labaAplikasi = filteredSales
            .filter(s => s.tipe === 'Aplikasi')
            .reduce((acc, s) => acc + s.laba, 0);
            
        // DIUBAH: Menggunakan filteredTrx
        const labaTrx = filteredTrx
            .filter(t => t.tipe === 'TRX')
            .reduce((acc, t) => acc + t.fee, 0);

        setValueById('sales-produk-qty', produkTerjual);
        setValueById('sales-jasa-qty', jasaTerjual);
        setValueById('sales-produk', formatCurrency(labaProduk));
        setValueById('sales-jasa', formatCurrency(labaJasa));
        setValueById('sales-aplikasi', formatCurrency(labaAplikasi));
        setValueById('sales-tf', formatCurrency(labaTrx)); // 'tf' sekarang adalah laba TRX

        // --- 4 Kartu Sub-Penjualan ---
        // DIUBAH: Menggunakan nilai yang sudah dihitung
        setValueById('sales-produk-h', formatCurrency(labaProduk));
        setValueById('sales-jasa-h', formatCurrency(labaJasa));
        setValueById('sales-apk-h', formatCurrency(labaAplikasi));
        setValueById('sales-trx-h', formatCurrency(labaTrx));

        // --- Top 7 Produk ---
        const topProdukContainer = document.getElementById('dashboard-top-produk');
        topProdukContainer.innerHTML = '';
        // DIUBAH: Menggunakan filteredSales
        const topProduk = calculateTopProduk(filteredSales);
        
        if (topProduk.length === 0) {
            topProdukContainer.innerHTML = '<li class="list-group-item text-center text-muted p-4">Tidak ada produk terjual.</li>';
        } else {
            topProduk.forEach((item, index) => {
                topProdukContainer.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <span class="rank-badge">${index + 1}</span>
                            <span class="product-name">${item.nama}</span>
                        </div>
                        <span class="product-sold">${item.totalTerjual}x Terjual</span>
                    </li>`;
            });
        }
        
        // --- Riwayat Penjualan ---
        const riwayatJualContainer = document.getElementById('dashboard-riwayat-penjualan');
        riwayatJualContainer.innerHTML = '';
        // DIUBAH: Menggunakan filteredSales
        const riwayatPenjualan = filteredSales.slice(0, 5); // Ambil 5 terbaru dari data terfilter
        
        if (riwayatPenjualan.length === 0) {
            riwayatJualContainer.innerHTML = '<li class="list-group-item text-center text-muted p-4">Tidak ada penjualan.</li>';
        } else {
            riwayatPenjualan.forEach(item => {
                riwayatJualContainer.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <span class="fw-bold d-block">${item.nama}</span>
                            <small class="text-muted">(${item.kuantitas}x) ${item.tipe}</small>
                        </div>
                        <span class="fw-bold text-success">+${formatCurrency(item.laba)}</span>
                    </li>`;
            });
        }

    } catch (error) {
        console.error("Error besar saat me-render Dashboard:", error);
    }
}


// =============================================
// FUNGSI MODAL DAN FORM HANDLING
// =============================================
        
/**
 * BARU: Mengatur tanggal di modal ke hari ini
 */
function setModalDates() {
    const today = getTodayDateString();
    document.getElementById('produkTanggal').value = today;
    document.getElementById('jasaTanggal').value = today;
    document.getElementById('aplikasiTanggal').value = today;
    document.getElementById('pendapatanTanggal').value = today;
    document.getElementById('pengeluaranTanggal').value = today;
    document.getElementById('transferTanggal').value = today;
    document.getElementById('trxTanggal').value = today;
    document.getElementById('piutangTanggal').value = today;
    document.getElementById('hutangTanggal').value = today;
}

/**
 * BARU: Mereset form di modal Kasir
 */
function resetKasirForm() {
    document.getElementById('form-produk').reset();
    document.getElementById('form-jasa').reset();
    document.getElementById('form-aplikasi').reset();
    document.getElementById('produk-id-edit').value = '';
    document.getElementById('jasa-id-edit').value = '';
    document.getElementById('aplikasi-id-edit').value = '';
    
    // Atur ulang tab ke 'Produk'
    const produkTab = document.getElementById('produk-tab');
    if (produkTab) bootstrap.Tab.getOrCreateInstance(produkTab).show();
    
    // Atur tanggal ke hari ini
    setModalDates();
}

/**
 * BARU: Mereset form di modal Transaksi
 */
function resetTransaksiForm() {
    document.getElementById('form-pendapatan').reset();
    document.getElementById('form-pengeluaran').reset();
    document.getElementById('form-transfer').reset();
    document.getElementById('form-trx').reset();
    document.getElementById('pendapatan-id-edit').value = '';
    document.getElementById('pengeluaran-id-edit').value = '';
    document.getElementById('transfer-id-edit').value = '';
    document.getElementById('trx-id-edit').value = '';
    
    // Atur ulang tab ke 'Pendapatan'
    const pendapatanTab = document.getElementById('pendapatan-tab');
    if(pendapatanTab) bootstrap.Tab.getOrCreateInstance(pendapatanTab).show();
    
    setModalDates();
}

/**
 * BARU: Mereset form di modal Hutang
 */
function resetHutangForm() {
    document.getElementById('form-piutang').reset();
    document.getElementById('form-hutang').reset();
    document.getElementById('piutang-id-edit').value = '';
    document.getElementById('hutang-id-edit').value = '';
    
    // Atur ulang tab ke 'Piutang'
    const piutangTab = document.getElementById('piutang-tab');
    if(piutangTab) bootstrap.Tab.getOrCreateInstance(piutangTab).show();
    
    setModalDates();
}

/**
 * BARU: Mereset form di modal Master Data
 */
function resetMasterDataForm() {
    document.getElementById('form-master-data').reset();
    document.getElementById('masterDataType').value = '';
    document.getElementById('masterDataId').value = '';
    
    // Sembunyikan semua field
    document.querySelectorAll('.master-data-field').forEach(f => f.style.display = 'none');
}

/**
 * BARU: Menampilkan modal konfirmasi hapus
 */
function showDeleteConfirmation(type, id) {
    if (!konfirmasiHapusModal) {
        konfirmasiHapusModal = new bootstrap.Modal(document.getElementById('konfirmasiHapusModal'));
    }
    
    itemUntukDihapus = { type, id };
    
    // Tampilkan pesan kustom (opsional)
    const modalBody = document.getElementById('konfirmasiHapusModalBody');
    modalBody.textContent = `Anda yakin ingin menghapus item '${type}' ini? Item akan dipindahkan ke Riwayat Hapus.`;
    
    konfirmasiHapusModal.show();
}

/**
 * BARU: Menghapus item dari data utama dan memindahkannya ke riwayat hapus
 */
function deleteItem(type, id) {
    let dataArray, itemIndex, itemData, itemName;
    const timestamp = new Date().toISOString();

    switch(type) {
        case 'produk':
            dataArray = initialMasterData.produk;
            itemIndex = dataArray.findIndex(i => i.id === id);
            if (itemIndex > -1) {
                itemData = dataArray[itemIndex];
                itemName = itemData.nama;
                dataArray.splice(itemIndex, 1);
            }
            break;
        case 'kategori':
            dataArray = initialMasterData.kategori;
            itemIndex = id; // Kategori menggunakan index sebagai ID
            if (itemIndex > -1 && itemIndex < dataArray.length) {
                itemData = dataArray[itemIndex];
                itemName = itemData; // itemData adalah string
                dataArray.splice(itemIndex, 1);
            }
            break;
        case 'akun':
            dataArray = initialMasterData.akun;
            itemIndex = dataArray.findIndex(i => i.id === id);
            if (itemIndex > -1) {
                itemData = dataArray[itemIndex];
                itemName = itemData.nama;
                dataArray.splice(itemIndex, 1);
            }
            break;
        case 'jenisTransaksi':
            dataArray = initialMasterData.jenisTransaksi;
            itemIndex = id; // Menggunakan index
            if (itemIndex > -1 && itemIndex < dataArray.length) {
                itemData = dataArray[itemIndex];
                itemName = itemData; // itemData adalah string
                dataArray.splice(itemIndex, 1);
            }
            break;
        case 'pengguna':
            dataArray = initialMasterData.pengguna;
            itemIndex = id; // Menggunakan index
            if (itemIndex > -1 && itemIndex < dataArray.length) {
                itemData = dataArray[itemIndex];
                itemName = itemData; // itemData adalah string
                dataArray.splice(itemIndex, 1);
            }
            break;
        case 'penjualan':
            dataArray = initialHistoryData.penjualan;
            itemIndex = dataArray.findIndex(i => i.id === id);
            if (itemIndex > -1) {
                itemData = dataArray[itemIndex];
                itemName = `${itemData.tipe} - ${itemData.nama}`;
                dataArray.splice(itemIndex, 1);
            }
            break;
        case 'transaksi':
            dataArray = initialHistoryData.transaksi;
            itemIndex = dataArray.findIndex(i => i.id === id);
            if (itemIndex > -1) {
                itemData = dataArray[itemIndex];
                itemName = `${itemData.tipe} - ${itemData.jenis}`;
                dataArray.splice(itemIndex, 1);
            }
            break;
        case 'hutang':
            dataArray = initialHistoryData.hutang;
            itemIndex = dataArray.findIndex(i => i.id === id);
            if (itemIndex > -1) {
                itemData = dataArray[itemIndex];
                itemName = `${itemData.tipe} - ${itemData.pihak}`;
                dataArray.splice(itemIndex, 1);
            }
            break;
        default:
            console.error(`Tipe data tidak dikenal untuk dihapus: ${type}`);
            return;
    }

    if (itemData) {
        // Tambahkan ke riwayat hapus
        globalDeletionHistory.unshift({
            type: type,
            name: itemName,
            timestamp: timestamp,
            data: itemData
        });
        
        console.log(`Item '${type}' dengan ID ${id} berhasil dihapus dan diarsipkan.`);
        
        // Render ulang
        renderAllMasterData();
        renderAllHistoryPages();
        renderDashboardAnalytics();
        renderLaporanPage();
        
        // Simpan perubahan
        saveDataToLocalStorage();
        
        // Tampilkan notifikasi
        if(window.addAppNotification) {
            window.addAppNotification(`Item '${itemName}' berhasil dihapus.`, 'bi-trash-fill', 'text-danger');
        }
    } else {
        console.warn(`Item '${type}' dengan ID ${id} tidak ditemukan untuk dihapus.`);
    }
}

/**
 * BARU: Merender daftar item yang dihapus di Offcanvas
 */
function renderDeletionHistory() {
    const container = document.getElementById('riwayat-hapus-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (globalDeletionHistory.length === 0) {
        container.innerHTML = '<li class="list-group-item text-center text-muted p-4">Riwayat hapus kosong.</li>';
        return;
    }
    
    globalDeletionHistory.forEach((item, index) => {
        const time = new Date(item.timestamp).toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        
        container.innerHTML += `
            <li class="list-group-item">
                <div class="deleted-item-info">
                    <span class="deleted-item-name">${item.name}</span>
                    <span class="deleted-item-type">${item.type}</span>
                    <span class="deleted-item-timestamp">${time}</span>
                </div>
                <button class="btn btn-sm btn-outline-success btn-restore" onclick="restoreItem(${index})">
                    <i class="bi bi-arrow-counterclockwise"></i> Pulihkan
                </button>
            </li>
        `;
    });
}

/**
 * BARU: Mengembalikan item dari riwayat hapus ke data utama
 */
function restoreItem(historyIndex) {
    if (historyIndex < 0 || historyIndex >= globalDeletionHistory.length) {
        console.error('Index riwayat hapus tidak valid.');
        return;
    }
    
    // Ambil item dari riwayat dan hapus
    const itemToRestore = globalDeletionHistory.splice(historyIndex, 1)[0];
    const { type, data, name } = itemToRestore;
    
    try {
        switch(type) {
            case 'produk': initialMasterData.produk.push(data); break;
            case 'kategori': initialMasterData.kategori.push(data); break;
            case 'akun': initialMasterData.akun.push(data); break;
            case 'jenisTransaksi': initialMasterData.jenisTransaksi.push(data); break;
            case 'pengguna': initialMasterData.pengguna.push(data); break;
            case 'penjualan': initialHistoryData.penjualan.push(data); break;
            case 'transaksi': initialHistoryData.transaksi.push(data); break;
            case 'hutang': initialHistoryData.hutang.push(data); break;
            default:
                console.error(`Tipe data tidak dikenal untuk dipulihkan: ${type}`);
                // Jika gagal, kembalikan ke riwayat
                globalDeletionHistory.splice(historyIndex, 0, itemToRestore);
                return;
        }
        
        console.log(`Item '${name}' (${type}) berhasil dipulihkan.`);
        
        // Render ulang seluruh aplikasi
        renderAllMasterData();
        renderAllHistoryPages();
        renderDashboardAnalytics();
        renderLaporanPage();
        
        // Render ulang modal riwayat hapus
        renderDeletionHistory();
        
        // Simpan perubahan
        saveDataToLocalStorage();
        
        if(window.addAppNotification) {
            window.addAppNotification(`Item '${name}' berhasil dipulihkan.`, 'bi-check-circle-fill', 'text-success');
        }
        
    } catch (e) {
        console.error('Gagal memulihkan item:', e);
        // Kembalikan ke riwayat jika terjadi error
        globalDeletionHistory.splice(historyIndex, 0, itemToRestore);
    }
}
        
        
// =============================================
// LOGIKA SIMPAN (Create / Update)
// =============================================

/**
 * BARU: Memproses penjualan 'Produk'
 */
function prosesPenjualanProduk(isEdit) {
    const idToEdit = parseInt(document.getElementById('produk-id-edit').value);
    const tanggal = document.getElementById('produkTanggal').value;
    const kuantitas = parseInt(document.getElementById('produkKuantitas').value) || 0;
    
    const produkDropdown = document.getElementById('produkNama');
    const selectedOption = produkDropdown.options[produkDropdown.selectedIndex];
    const produkId = parseInt(selectedOption.dataset.id);
    const namaProduk = selectedOption.value;

    if (!tanggal || !produkId || kuantitas <= 0) {
        window.addAppNotification('Data tidak lengkap. Pastikan tanggal, produk, dan kuantitas valid.', 'bi-exclamation-triangle-fill', 'text-warning');
        return false;
    }

    const produkMaster = initialMasterData.produk.find(p => p.id === produkId);
    if (!produkMaster) {
        window.addAppNotification('Data master produk tidak ditemukan.', 'bi-x-circle-fill', 'text-danger');
        return false;
    }
    
    if (!isEdit && kuantitas > produkMaster.stok) {
        window.addAppNotification(`Stok '${produkMaster.nama}' tidak mencukupi (sisa ${produkMaster.stok}).`, 'bi-exclamation-triangle-fill', 'text-warning');
        return false;
    }
    
    // Hitung
    const modal = produkMaster.modal;
    const hargaJual = produkMaster.jual;
    const total = hargaJual * kuantitas;
    const laba = (hargaJual - modal) * kuantitas;
    
    // Kurangi stok di master data
    if (!isEdit) {
        produkMaster.stok -= kuantitas;
    } else {
        // Logika edit stok (lebih rumit, harus membandingkan dengan nilai lama)
        // Untuk saat ini, kita asumsikan edit tidak mengubah stok
    }

    const newSale = {
        id: isEdit ? idToEdit : new Date().getTime(),
        tanggal: tanggal,
        waktu: getWaktuSekarang(),
        tipe: "Produk",
        nama: namaProduk,
        kuantitas: kuantitas,
        modal: modal,
        laba: laba,
        total: total,
        color: "primary", // Sesuai desain
        produkId: produkId,
        dariAkun: null,
        hargaJual: hargaJual
    };

    // Update atau Tambah data
    if (isEdit) {
        const index = initialHistoryData.penjualan.findIndex(s => s.id === idToEdit);
        if (index > -1) {
            initialHistoryData.penjualan[index] = newSale;
        }
    } else {
        initialHistoryData.penjualan.unshift(newSale);
    }
    
    return true; // Sukses
}

/**
 * BARU: Memproses penjualan 'Jasa'
 */
function prosesPenjualanJasa(isEdit) {
    const idToEdit = parseInt(document.getElementById('jasa-id-edit').value);
    const tanggal = document.getElementById('jasaTanggal').value;
    const nama = document.getElementById('jasaNama').value;
    const modal = parseFloat(document.getElementById('jasaModal').value) || 0;
    const jual = parseFloat(document.getElementById('jasaJual').value) || 0;
    
    if (!tanggal || !nama || jual <= 0) {
        window.addAppNotification('Data tidak lengkap. Pastikan tanggal, nama, dan harga jual valid.', 'bi-exclamation-triangle-fill', 'text-warning');
        return false;
    }

    const laba = jual - modal;
    
    const newSale = {
        id: isEdit ? idToEdit : new Date().getTime(),
        tanggal: tanggal,
        waktu: getWaktuSekarang(),
        tipe: "Jasa",
        nama: nama,
        kuantitas: 1, // Jasa selalu 1
        modal: modal,
        laba: laba,
        total: jual,
        color: "success",
        produkId: null,
        dariAkun: null,
        hargaJual: jual
    };

    if (isEdit) {
        const index = initialHistoryData.penjualan.findIndex(s => s.id === idToEdit);
        if (index > -1) initialHistoryData.penjualan[index] = newSale;
    } else {
        initialHistoryData.penjualan.unshift(newSale);
    }
    
    return true;
}

/**
 * BARU: Memproses penjualan 'Aplikasi'
 */
function prosesPenjualanAplikasi(isEdit) {
    const idToEdit = parseInt(document.getElementById('aplikasi-id-edit').value);
    const tanggal = document.getElementById('aplikasiTanggal').value;
    const sumberAkun = document.getElementById('aplikasiSumber').value;
    const modal = parseFloat(document.getElementById('aplikasiNominal').value) || 0;
    const jual = parseFloat(document.getElementById('aplikasiJual').value) || 0;
    
    if (!tanggal || !sumberAkun || jual <= 0) {
         window.addAppNotification('Data tidak lengkap. Pastikan tanggal, sumber akun, dan harga jual valid.', 'bi-exclamation-triangle-fill', 'text-warning');
        return false;
    }

    const laba = jual - modal;
    
    const newSale = {
        id: isEdit ? idToEdit : new Date().getTime(),
        tanggal: tanggal,
        waktu: getWaktuSekarang(),
        tipe: "Aplikasi",
        nama: sumberAkun, // Nama penjualan adalah nama akun sumber
        kuantitas: 1,
        modal: modal,
        laba: laba,
        total: jual,
        color: "warning",
        produkId: null,
        dariAkun: sumberAkun,
        hargaJual: jual
    };
    
    if (isEdit) {
        const index = initialHistoryData.penjualan.findIndex(s => s.id === idToEdit);
        if (index > -1) initialHistoryData.penjualan[index] = newSale;
    } else {
        initialHistoryData.penjualan.unshift(newSale);
    }
    
    return true;
}

/**
 * BARU: Menangani klik tombol Simpan di Modal Kasir
 */
function handleSimpanPenjualan() {
    const activeTab = document.querySelector('#salesTab .nav-link.active').id;
    let sukses = false;
    let isEdit = false;

    try {
        switch (activeTab) {
            case 'produk-tab':
                isEdit = !!document.getElementById('produk-id-edit').value;
                sukses = prosesPenjualanProduk(isEdit);
                break;
            case 'jasa-tab':
                isEdit = !!document.getElementById('jasa-id-edit').value;
                sukses = prosesPenjualanJasa(isEdit);
                break;
            case 'aplikasi-tab':
                isEdit = !!document.getElementById('aplikasi-id-edit').value;
                sukses = prosesPenjualanAplikasi(isEdit);
                break;
        }
        
        if (sukses) {
            renderSalesHistory(initialHistoryData.penjualan);
            renderDashboardAnalytics(); // Update dashboard
            renderLaporanPage(); // Update laporan
            if (kasirModal) kasirModal.hide();
            saveDataToLocalStorage(); // Simpan perubahan
            
            if(window.addAppNotification) {
                window.addAppNotification(`Penjualan ${isEdit ? 'diperbarui' : 'ditambahkan'}.`, 'bi-cart-check-fill', 'text-primary');
            }
        }
    } catch (e) {
        console.error('Gagal menyimpan penjualan:', e);
        if(window.addAppNotification) {
            window.addAppNotification(`Gagal menyimpan. ${e.message}`, 'bi-x-circle-fill', 'text-danger');
        }
    }
}


/**
 * BARU: Memproses 'Pendapatan'
 */
function prosesPendapatan(isEdit) {
    const idToEdit = parseInt(document.getElementById('pendapatan-id-edit').value);
    const tanggal = document.getElementById('pendapatanTanggal').value;
    const keAkun = document.getElementById('pendapatanKeAkun').value;
    const kategori = document.getElementById('pendapatanKategori').value;
    const nominal = parseFloat(document.getElementById('pendapatanNominal').value) || 0;
    const catatan = document.getElementById('pendapatanCatatan').value;
    
    if (!tanggal || !keAkun || !kategori || nominal <= 0) {
        window.addAppNotification('Data tidak lengkap. Pastikan tanggal, akun, kategori, dan nominal valid.', 'bi-exclamation-triangle-fill', 'text-warning');
        return false;
    }

    const newTrx = {
        id: isEdit ? idToEdit : new Date().getTime(),
        tanggal: tanggal,
        waktu: getWaktuSekarang(),
        tipe: "Pendapatan",
        jenis: kategori, // Jenis diambil dari Kategori
        icon: "bi-arrow-down", // Disesuaikan di render
        color: "success",
        rincian: `Masuk ke ${keAkun}`,
        catatan: catatan,
        kategori: kategori,
        dariAkun: null,
        keAkun: keAkun,
        fee: 0,
        total: nominal
    };
    
    if (isEdit) {
        // TODO: Logika membatalkan transaksi lama (mengembalikan saldo)
        const index = initialHistoryData.transaksi.findIndex(t => t.id === idToEdit);
        if (index > -1) initialHistoryData.transaksi[index] = newTrx;
    } else {
        initialHistoryData.transaksi.unshift(newTrx);
        // Tambah saldo ke akun
        const akun = initialMasterData.akun.find(a => a.nama === keAkun);
        if (akun) akun.saldo += nominal;
    }
    
    return true;
}

/**
 * BARU: Memproses 'Pengeluaran'
 */
function prosesPengeluaran(isEdit) {
    const idToEdit = parseInt(document.getElementById('pengeluaran-id-edit').value);
    const tanggal = document.getElementById('pengeluaranTanggal').value;
    const dariAkun = document.getElementById('pengeluaranDariAkun').value;
    const kategori = document.getElementById('pengeluaranKategori').value;
    const nominal = parseFloat(document.getElementById('pengeluaranNominal').value) || 0;
    const catatan = document.getElementById('pengeluaranCatatan').value;
    
    if (!tanggal || !dariAkun || !kategori || nominal <= 0) {
        window.addAppNotification('Data tidak lengkap. Pastikan tanggal, akun, kategori, dan nominal valid.', 'bi-exclamation-triangle-fill', 'text-warning');
        return false;
    }

    const newTrx = {
        id: isEdit ? idToEdit : new Date().getTime(),
        tanggal: tanggal,
        waktu: getWaktuSekarang(),
        tipe: "Pengeluaran",
        jenis: kategori,
        icon: "bi-arrow-up",
        color: "danger",
        rincian: `Keluar dari ${dariAkun}`,
        catatan: catatan,
        kategori: kategori,
        dariAkun: dariAkun,
        keAkun: null,
        fee: 0,
        total: nominal
    };
    
    if (isEdit) {
        // TODO: Logika membatalkan transaksi lama
        const index = initialHistoryData.transaksi.findIndex(t => t.id === idToEdit);
        if (index > -1) initialHistoryData.transaksi[index] = newTrx;
    } else {
        initialHistoryData.transaksi.unshift(newTrx);
        // Kurangi saldo dari akun
        const akun = initialMasterData.akun.find(a => a.nama === dariAkun);
        if (akun) akun.saldo -= nominal;
    }
    
    return true;
}

/**
 * BARU: Memproses 'Transfer'
 */
function prosesTransfer(isEdit) {
    const idToEdit = parseInt(document.getElementById('transfer-id-edit').value);
    const tanggal = document.getElementById('transferTanggal').value;
    const dariAkun = document.getElementById('transferDariAkun').value;
    const keAkun = document.getElementById('transferKeAkun').value;
    const kategori = document.getElementById('transferKategori').value;
    const nominal = parseFloat(document.getElementById('transferNominal').value) || 0;
    const catatan = document.getElementById('transferCatatan').value;
    
    if (!tanggal || !dariAkun || !keAkun || !kategori || nominal <= 0) {
        window.addAppNotification('Data tidak lengkap. Pastikan semua field valid.', 'bi-exclamation-triangle-fill', 'text-warning');
        return false;
    }
    if (dariAkun === keAkun) {
        window.addAppNotification('Akun sumber dan tujuan tidak boleh sama.', 'bi-exclamation-triangle-fill', 'text-warning');
        return false;
    }

    const newTrx = {
        id: isEdit ? idToEdit : new Date().getTime(),
        tanggal: tanggal,
        waktu: getWaktuSekarang(),
        tipe: "Transfer",
        jenis: kategori,
        icon: "bi-arrow-left-right",
        color: "info",
        rincian: `${dariAkun} -> ${keAkun}`,
        catatan: catatan,
        kategori: kategori,
        dariAkun: dariAkun,
        keAkun: keAkun,
        fee: 0,
        total: nominal
    };
    
    if (isEdit) {
        // TODO: Logika membatalkan transaksi lama
        const index = initialHistoryData.transaksi.findIndex(t => t.id === idToEdit);
        if (index > -1) initialHistoryData.transaksi[index] = newTrx;
    } else {
        initialHistoryData.transaksi.unshift(newTrx);
        // Kurangi saldo 'dariAkun', tambah saldo 'keAkun'
        const akunDari = initialMasterData.akun.find(a => a.nama === dariAkun);
        const akunKe = initialMasterData.akun.find(a => a.nama === keAkun);
        if (akunDari) akunDari.saldo -= nominal;
        if (akunKe) akunKe.saldo += nominal;
    }
    
    return true;
}

/**
 * BARU: Memproses 'TRX'
 */
function prosesTRX(isEdit) {
    const idToEdit = parseInt(document.getElementById('trx-id-edit').value);
    const tanggal = document.getElementById('trxTanggal').value;
    const dariAkun = document.getElementById('trxDariAkun').value; // Modal
    const keAkun = document.getElementById('trxKeAkun').value;   // Penjualan
    const kategori = document.getElementById('trxKategori').value;
    const nominal = parseFloat(document.getElementById('trxNominal').value) || 0; // Modal
    const fee = parseFloat(document.getElementById('trxFee').value) || 0;       // Laba
    const catatan = document.getElementById('trxCatatan').value;
    
    if (!tanggal || !dariAkun || !keAkun || !kategori || nominal <= 0) {
        window.addAppNotification('Data tidak lengkap. Pastikan semua field valid.', 'bi-exclamation-triangle-fill', 'text-warning');
        return false;
    }
    
    const newTrx = {
        id: isEdit ? idToEdit : new Date().getTime(),
        tanggal: tanggal,
        waktu: getWaktuSekarang(),
        tipe: "TRX",
        jenis: kategori,
        icon: "bi-bank", // Sesuai desain
        color: "primary",
        rincian: `TRX ${catatan}`,
        catatan: catatan,
        kategori: kategori,
        dariAkun: dariAkun,
        keAkun: keAkun,
        fee: fee,     // Laba
        total: nominal // Modal
    };
    
    if (isEdit) {
        // TODO: Logika membatalkan transaksi lama
        const index = initialHistoryData.transaksi.findIndex(t => t.id === idToEdit);
        if (index > -1) initialHistoryData.transaksi[index] = newTrx;
    } else {
        initialHistoryData.transaksi.unshift(newTrx);
        // Kurangi saldo 'dariAkun' (modal)
        const akunDari = initialMasterData.akun.find(a => a.nama === dariAkun);
        if (akunDari) akunDari.saldo -= nominal;
        // Tambah saldo 'keAkun' (total penjualan = modal + fee)
        const akunKe = initialMasterData.akun.find(a => a.nama === keAkun);
        if (akunKe) akunKe.saldo += (nominal + fee);
    }
    
    return true;
}

/**
 * BARU: Menangani klik tombol Simpan di Modal Transaksi
 */
function handleSimpanTransaksi() {
    const activeTab = document.querySelector('#trxTab .nav-link.active').id;
    let sukses = false;
    let isEdit = false;

    try {
        switch (activeTab) {
            case 'pendapatan-tab':
                isEdit = !!document.getElementById('pendapatan-id-edit').value;
                sukses = prosesPendapatan(isEdit);
                break;
            case 'pengeluaran-tab':
                isEdit = !!document.getElementById('pengeluaran-id-edit').value;
                sukses = prosesPengeluaran(isEdit);
                break;
            case 'transfer-tab':
                isEdit = !!document.getElementById('transfer-id-edit').value;
                sukses = prosesTransfer(isEdit);
                break;
            case 'trx-tab':
                isEdit = !!document.getElementById('trx-id-edit').value;
                sukses = prosesTRX(isEdit);
                break;
        }
        
        if (sukses) {
            renderTransactionHistory(initialHistoryData.transaksi);
            renderAkunLists(initialMasterData.akun); // Update saldo di sidebar/halaman
            renderDashboardAnalytics(); // Update dashboard
            renderLaporanPage(); // Update laporan
            if(transaksiModal) transaksiModal.hide();
            saveDataToLocalStorage(); // Simpan perubahan
            
            if(window.addAppNotification) {
                window.addAppNotification(`Transaksi ${isEdit ? 'diperbarui' : 'ditambahkan'}.`, 'bi-check-circle-fill', 'text-success');
            }
        }
    } catch (e) {
        console.error('Gagal menyimpan transaksi:', e);
        if(window.addAppNotification) {
            window.addAppNotification(`Gagal menyimpan. ${e.message}`, 'bi-x-circle-fill', 'text-danger');
        }
    }
}


/**
 * BARU: Memproses 'Piutang'
 */
function prosesPiutang(isEdit) {
    const idToEdit = parseInt(document.getElementById('piutang-id-edit').value);
    const tanggal = document.getElementById('piutangTanggal').value;
    const pihak = document.getElementById('piutangPihak').value;
    const nominal = parseFloat(document.getElementById('piutangNominal').value) || 0;
    const catatan = document.getElementById('piutangCatatan').value;
    
    if (!tanggal || !pihak || nominal <= 0) {
        window.addAppNotification('Data tidak lengkap. Pastikan tanggal, pihak, dan nominal valid.', 'bi-exclamation-triangle-fill', 'text-warning');
        return false;
    }

    const newDebt = {
        id: isEdit ? idToEdit : new Date().getTime(),
        tanggal: tanggal,
        waktu: getWaktuSekarang(),
        tipe: "Piutang",
        icon: "bi-arrow-down",
        color: "success",
        pihak: pihak,
        sisa: nominal,
        total: nominal,
        jumlah: nominal, // 'jumlah' adalah total asli
        catatan: catatan,
        lunas: false
    };

    if (isEdit) {
        const index = initialHistoryData.hutang.findIndex(h => h.id === idToEdit);
        if (index > -1) initialHistoryData.hutang[index] = newDebt;
    } else {
        initialHistoryData.hutang.unshift(newDebt);
    }
    
    return true;
}

/**
 * BARU: Memproses 'Hutang'
 */
function prosesHutang(isEdit) {
    const idToEdit = parseInt(document.getElementById('hutang-id-edit').value);
    const tanggal = document.getElementById('hutangTanggal').value;
    const pihak = document.getElementById('hutangPihak').value;
    const nominal = parseFloat(document.getElementById('hutangNominal').value) || 0;
    const catatan = document.getElementById('hutangCatatan').value;
    
    if (!tanggal || !pihak || nominal <= 0) {
        window.addAppNotification('Data tidak lengkap. Pastikan tanggal, pihak, dan nominal valid.', 'bi-exclamation-triangle-fill', 'text-warning');
        return false;
    }

    const newDebt = {
        id: isEdit ? idToEdit : new Date().getTime(),
        tanggal: tanggal,
        waktu: getWaktuSekarang(),
        tipe: "Hutang",
        icon: "bi-arrow-up",
        color: "danger",
        pihak: pihak,
        sisa: nominal,
        total: nominal,
        jumlah: nominal,
        catatan: catatan,
        lunas: false
    };

    if (isEdit) {
        const index = initialHistoryData.hutang.findIndex(h => h.id === idToEdit);
        if (index > -1) initialHistoryData.hutang[index] = newDebt;
    } else {
        initialHistoryData.hutang.unshift(newDebt);
    }
    
    return true;
}

/**
 * BARU: Menangani klik tombol Simpan di Modal Hutang
 */
function handleSimpanHutang() {
    const activeTab = document.querySelector('#hutangTab .nav-link.active').id;
    let sukses = false;
    let isEdit = false;

    try {
        switch (activeTab) {
            case 'piutang-tab':
                isEdit = !!document.getElementById('piutang-id-edit').value;
                sukses = prosesPiutang(isEdit);
                break;
            case 'hutang-tab':
                isEdit = !!document.getElementById('hutang-id-edit').value;
                sukses = prosesHutang(isEdit);
                break;
        }
        
        if (sukses) {
            renderDebtHistory(initialHistoryData.hutang);
            renderDashboardAnalytics(); // Update dashboard
            renderLaporanPage(); // Update laporan
            if(hutangModal) hutangModal.hide();
            saveDataToLocalStorage(); // Simpan perubahan
            
            if(window.addAppNotification) {
                window.addAppNotification(`${isEdit ? 'Perubahan' : 'Catatan baru'} disimpan.`, 'bi-check-circle-fill', 'text-success');
            }
        }
    } catch (e) {
        console.error('Gagal menyimpan hutang/piutang:', e);
         if(window.addAppNotification) {
            window.addAppNotification(`Gagal menyimpan. ${e.message}`, 'bi-x-circle-fill', 'text-danger');
        }
    }
}
        
/**
 * BARU: Menangani klik tombol Simpan di Modal Master Data
 */
function handleSimpanMasterData() {
    const type = document.getElementById('masterDataType').value;
    const id = parseInt(document.getElementById('masterDataId').value);
    const nama = document.getElementById('masterNama').value;
    const isEdit = !!id;
    
    try {
        switch(type) {
            case 'produk':
                const modal = parseFloat(document.getElementById('masterModal').value) || 0;
                const jual = parseFloat(document.getElementById('masterJual').value) || 0;
                const stok = parseInt(document.getElementById('masterStok').value) || 0;
                
                if (!nama || modal < 0 || jual < 0) {
                     window.addAppNotification('Data tidak lengkap.', 'bi-exclamation-triangle-fill', 'text-warning');
                    return;
                }
                
                if (isEdit) {
                    const index = initialMasterData.produk.findIndex(p => p.id === id);
                    if (index > -1) {
                        initialMasterData.produk[index] = { ...initialMasterData.produk[index], nama, modal, jual, stok };
                    }
                } else {
                    const newId = new Date().getTime();
                    initialMasterData.produk.push({ id: newId, nama, modal, jual, stok });
                }
                break;
                
            case 'akun':
                const saldo = parseFloat(document.getElementById('masterSaldo').value) || 0;
                if (!nama) {
                     window.addAppNotification('Nama akun tidak boleh kosong.', 'bi-exclamation-triangle-fill', 'text-warning');
                    return;
                }
                
                if (isEdit) {
                    const index = initialMasterData.akun.findIndex(a => a.id === id);
                    if (index > -1) {
                        initialMasterData.akun[index] = { ...initialMasterData.akun[index], nama, saldo };
                    }
                } else {
                    const newId = new Date().getTime();
                    initialMasterData.akun.push({ id: newId, nama, saldo });
                }
                break;
                
            case 'kategori':
            case 'jenisTransaksi':
            case 'pengguna':
                if (!nama) {
                     window.addAppNotification('Nama tidak boleh kosong.', 'bi-exclamation-triangle-fill', 'text-warning');
                    return;
                }
                const dataArray = initialMasterData[type];
                const itemIndex = id; // Array string menggunakan index sebagai ID
                
                if (isEdit && itemIndex > -1 && itemIndex < dataArray.length) {
                    dataArray[itemIndex] = nama;
                } else {
                    dataArray.push(nama);
                }
                break;
                
            default:
                console.error('Tipe master data tidak dikenal:', type);
                return;
        }
        
        renderAllMasterData(); // Render ulang semua
        if(masterDataModal) masterDataModal.hide();
        saveDataToLocalStorage();
        
        if(window.addAppNotification) {
            window.addAppNotification(`Master Data '${type}' ${isEdit ? 'diperbarui' : 'ditambahkan'}.`, 'bi-check-circle-fill', 'text-success');
        }
        
    } catch (e) {
        console.error('Gagal menyimpan master data:', e);
         if(window.addAppNotification) {
            window.addAppNotification(`Gagal menyimpan. ${e.message}`, 'bi-x-circle-fill', 'text-danger');
        }
    }
}


// =============================================
// LOGIKA IMPORT / EXPORT DATA
// =============================================
        
/**
 * BARU: Export data produk ke CSV
 */
function exportProdukToCSV() {
    try {
        const produk = initialMasterData.produk;
        if (produk.length === 0) {
            window.addAppNotification('Tidak ada data produk untuk diexport.', 'bi-info-circle-fill', 'text-info');
            return;
        }
        
        const headers = ["id", "nama", "modal", "jual", "stok"];
        const csvRows = [headers.join(",")]; // Header
        
        produk.forEach(p => {
            const values = [p.id, `"${p.nama}"`, p.modal, p.jual, p.stok];
            csvRows.push(values.join(","));
        });
        
        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", `export_produk_${getTodayDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.addAppNotification('Export CSV berhasil.', 'bi-check-circle-fill', 'text-success');
        
    } catch (e) {
        console.error('Gagal export CSV:', e);
        window.addAppNotification('Gagal export CSV.', 'bi-x-circle-fill', 'text-danger');
    }
}

/**
 * BARU: Import data produk dari CSV
 */
function importProdukFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const rows = text.split('\n').slice(1); // Hapus header
            let importedCount = 0;
            
            rows.forEach(row => {
                if (row.trim() === '') return;
                
                // Regex sederhana untuk menangani koma di dalam tanda kutip
                const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
                                .map(v => v.replace(/"/g, '')); // Hapus tanda kutip
                                
                if (values.length >= 5) {
                    const newProduk = {
                        id: parseInt(values[0]) || new Date().getTime(), // Gunakan ID lama atau buat baru
                        nama: values[1],
                        modal: parseFloat(values[2]) || 0,
                        jual: parseFloat(values[3]) || 0,
                        stok: parseInt(values[4]) || 0
                    };
                    
                    // Cek duplikat berdasarkan ID
                    const existingIndex = initialMasterData.produk.findIndex(p => p.id === newProduk.id);
                    if (existingIndex > -1) {
                        initialMasterData.produk[existingIndex] = newProduk; // Update
                    } else {
                        initialMasterData.produk.push(newProduk); // Tambah
                    }
                    importedCount++;
                }
            });
            
            renderProdukList(initialMasterData.produk);
            saveDataToLocalStorage();
            window.addAppNotification(`${importedCount} produk berhasil diimpor/diperbarui.`, 'bi-check-circle-fill', 'text-success');
            
        } catch (e) {
            console.error('Gagal import CSV:', e);
            window.addAppNotification('Gagal import CSV. Pastikan format file benar.', 'bi-x-circle-fill', 'text-danger');
        } finally {
            // Reset input file agar bisa import file yang sama lagi
            event.target.value = null;
        }
    };
    reader.readAsText(file);
}

/**
 * BARU: Export semua data ke JSON
 */
function exportDataToJSON() {
    try {
        const dataToExport = {
            masterData: initialMasterData,
            historyData: initialHistoryData,
            deletionHistory: globalDeletionHistory
        };
        
        const jsonContent = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", `n2store_backup_${getTodayDateString()}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.addAppNotification('Export JSON (Backup) berhasil.', 'bi-check-circle-fill', 'text-success');
        
    } catch (e) {
        console.error('Gagal export JSON:', e);
        window.addAppNotification('Gagal export JSON.', 'bi-x-circle-fill', 'text-danger');
    }
}

/**
 * BARU: Import semua data dari JSON
 */
function importDataFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const importedData = JSON.parse(text);
            
            if (importedData.masterData && importedData.historyData) {
                // Lakukan validasi dasar
                if (!Array.isArray(importedData.masterData.produk) || !Array.isArray(importedData.historyData.penjualan)) {
                    throw new Error('Format file JSON tidak valid.');
                }
                
                // Timpa data
                initialMasterData = importedData.masterData;
                initialHistoryData = importedData.historyData;
                globalDeletionHistory = importedData.deletionHistory || [];
                
                // Render ulang seluruh aplikasi
                renderAllMasterData();
                renderAllHistoryPages();
                renderDashboardAnalytics();
                renderLaporanPage();
                
                // Simpan data yang baru diimpor ke localStorage
                saveDataToLocalStorage();
                
                window.addAppNotification('Data berhasil diimpor dari JSON.', 'bi-check-circle-fill', 'text-success');
                
            } else {
                throw new Error('File JSON tidak berisi data yang diharapkan.');
            }
            
        } catch (e) {
            console.error('Gagal import JSON:', e);
            window.addAppNotification(`Gagal import JSON. ${e.message}`, 'bi-x-circle-fill', 'text-danger');
        } finally {
            event.target.value = null; // Reset input file
        }
    };
    reader.readAsText(file);
}


// =============================================
// EVENT LISTENER (NAVIGASI & MODAL)
// =============================================
        
document.addEventListener('DOMContentLoaded', function() {
            
    // BARU: Muat data dari localStorage
    loadDataFromLocalStorage();

    // Inisialisasi semua Modal Bootstrap
    try {
        const konfirmasiModalEl = document.getElementById('konfirmasiHapusModal');
        if (konfirmasiModalEl) konfirmasiHapusModal = new bootstrap.Modal(konfirmasiModalEl);
        
        const kasirModalEl = document.getElementById('kasirModal');
        if (kasirModalEl) kasirModal = new bootstrap.Modal(kasirModalEl);
        
        const trxModalEl = document.getElementById('transaksiModal');
        if (trxModalEl) transaksiModal = new bootstrap.Modal(trxModalEl);
        
        const hutangModalEl = document.getElementById('hutangModal');
        if (hutangModalEl) hutangModal = new bootstrap.Modal(hutangModalEl);
        
        const masterModalEl = document.getElementById('masterDataModal');
        if (masterModalEl) masterDataModal = new bootstrap.Modal(masterModalEl);
        
        const riwayatHapusEl = document.getElementById('riwayatHapusModal');
        if (riwayatHapusEl) riwayatHapusModal = new bootstrap.Offcanvas(riwayatHapusEl);
    } catch (e) {
        console.error("Gagal inisialisasi Modals:", e);
    }
            
    // Fungsi untuk menampilkan halaman
    function showPage(pageId, title) {
        // Sembunyikan semua halaman
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
        });
        
        // Tampilkan halaman yang dipilih
        const activePage = document.getElementById(pageId);
        if (activePage) {
            activePage.classList.add('active');
        }
        
        // Update judul header
        setValueById('page-title', title);
        
        // Update link navigasi aktif
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === `#${pageId}` || link.dataset.page === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Gulir ke atas
        window.scrollTo(0, 0);
    }

    // Logika untuk SEMUA link navigasi
    document.querySelectorAll('a[data-page], button[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.dataset.page;
            const title = this.dataset.title;
            
            showPage(pageId, title);
            
            // Tutup sidebar jika link ada di dalam sidebar
            const offcanvas = this.closest('.offcanvas');
            if (offcanvas) {
                bootstrap.Offcanvas.getInstance(offcanvas).hide();
            }
        });
    });
            
            
    // =============================================
    // TAMBAHKAN EVENT LISTENER FORM & MODAL
    // =============================================
            
    // Listener untuk tombol Hapus di Modal Konfirmasi
    const btnKonfirmasiHapus = document.getElementById('btn-konfirmasi-hapus');
    if (btnKonfirmasiHapus) {
        btnKonfirmasiHapus.addEventListener('click', function() {
            if (itemUntukDihapus.type && itemUntukDihapus.id !== null) {
                deleteItem(itemUntukDihapus.type, itemUntukDihapus.id);
            }
            if(konfirmasiHapusModal) konfirmasiHapusModal.hide();
            itemUntukDihapus = { type: null, id: null };
        });
    }
            
    // Listener 'submit' untuk semua form (mencegah submit tradisional)
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', e => e.preventDefault());
    });
    
    // Listener untuk tombol Simpan
    const simpanPenjualanBtn = document.getElementById('simpan-penjualan-btn');
    if (simpanPenjualanBtn) simpanPenjualanBtn.addEventListener('click', handleSimpanPenjualan);
    
    const simpanTransaksiBtn = document.getElementById('simpan-transaksi-btn');
    if (simpanTransaksiBtn) simpanTransaksiBtn.addEventListener('click', handleSimpanTransaksi);
    
    const simpanHutangBtn = document.getElementById('simpan-hutang-btn');
    if (simpanHutangBtn) simpanHutangBtn.addEventListener('click', handleSimpanHutang);
    
    const simpanMasterBtn = document.getElementById('simpan-master-data-btn');
    if (simpanMasterBtn) simpanMasterBtn.addEventListener('click', handleSimpanMasterData);

    // Listener untuk tombol Import / Export CSV
    const exportProdukBtn = document.getElementById('export-produk-btn');
    if (exportProdukBtn) exportProdukBtn.addEventListener('click', exportProdukToCSV);
    
    const importProdukBtn = document.getElementById('import-produk-btn');
    const importProdukInput = document.getElementById('import-produk-input');
    if (importProdukBtn && importProdukInput) {
        importProdukBtn.addEventListener('click', () => importProdukInput.click());
        importProdukInput.addEventListener('change', importProdukFromCSV);
    }

    // Listener untuk tombol Import / Export JSON
    const exportJsonBtn = document.getElementById('export-json-btn');
    if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportDataToJSON);
    
    const importJsonBtn = document.getElementById('import-json-btn');
    const importJsonInput = document.getElementById('import-json-input');
    if (importJsonBtn && importJsonInput) {
        importJsonBtn.addEventListener('click', () => importJsonInput.click());
        importJsonInput.addEventListener('change', importDataFromJSON);
    }

            
    // Listener untuk tombol Filter Tanggal
    const filterButtons = document.querySelectorAll('#filter-tanggal-buttons .nav-link');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah # di URL
            const tipe = button.dataset.tipe;
            if (setGlobalFilter(tipe)) {
                renderDashboardAnalytics();
                renderLaporanPage(); // Panggil render Laporan
            }
        });
    });
    const terapkanFilterBtn = document.getElementById('filter-terapkan-btn');
    if (terapkanFilterBtn) {
        terapkanFilterBtn.addEventListener('click', () => {
            const tipe = terapkanFilterBtn.dataset.tipe;
            if (setGlobalFilter(tipe)) {
                renderDashboardAnalytics();
                renderLaporanPage(); // Panggil render Laporan
            }
        });
    }


    // =============================================
    // INISIALISASI MODAL (Tugas dan Reset)
    // =============================================
            
    // Listener untuk kasirModalEl 'show.bs.modal'
    const kasirModalEl = document.getElementById('kasirModal');
    if (kasirModalEl) {
        kasirModalEl.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const action = button.dataset.action;
            const modalTitle = kasirModalEl.querySelector('.modal-title');
            
            resetKasirForm(); // Selalu reset
            
            if (action === 'edit') {
                modalTitle.textContent = 'Edit Penjualan';
                const id = parseInt(button.dataset.id);
                const item = initialHistoryData.penjualan.find(s => s.id === id);
                
                if (item) {
                    let tabId, formPrefix;
                    switch(item.tipe) {
                        case 'Produk': tabId = '#produk-tab'; formPrefix = 'produk'; break;
                        case 'Jasa': tabId = '#jasa-tab'; formPrefix = 'jasa'; break;
                        case 'Aplikasi': tabId = '#aplikasi-tab'; formPrefix = 'aplikasi'; break;
                    }
                    
                    // Pindah tab
                    const tab = document.querySelector(tabId);
                    if(tab) bootstrap.Tab.getOrCreateInstance(tab).show();
                    
                    // Isi form
                    setValueById(`${formPrefix}-id-edit`, item.id);
                    setValueById(`${formPrefix}Tanggal`, item.tanggal);
                    
                    if (item.tipe === 'Produk') {
                        setValueById('produkNama', item.nama);
                        setValueById('produkKuantitas', item.kuantitas);
                    } else if (item.tipe === 'Jasa') {
                        setValueById('jasaNama', item.nama);
                        setValueById('jasaModal', item.modal);
                        setValueById('jasaJual', item.hargaJual);
                    } else if (item.tipe === 'Aplikasi') {
                        setValueById('aplikasiSumber', item.dariAkun);
                        setValueById('aplikasiNominal', item.modal);
                        setValueById('aplikasiJual', item.hargaJual);
                    }
                }
            } else {
                modalTitle.textContent = 'Buat Penjualan Baru';
            }
        });
    }
            
    // Listener untuk transaksiModalEl 'show.bs.modal'
    const transaksiModalEl = document.getElementById('transaksiModal');
    if(transaksiModalEl) {
        transaksiModalEl.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const action = button.dataset.action;
            const modalTitle = transaksiModalEl.querySelector('.modal-title');
            
            resetTransaksiForm(); // Selalu reset
            
            if (action === 'edit') {
                modalTitle.textContent = 'Edit Transaksi';
                const id = parseInt(button.dataset.id);
                const item = initialHistoryData.transaksi.find(t => t.id === id);
                
                if (item) {
                    let tabId, formPrefix;
                    switch(item.tipe) {
                        case 'Pendapatan': tabId = '#pendapatan-tab'; formPrefix = 'pendapatan'; break;
                        case 'Pengeluaran': tabId = '#pengeluaran-tab'; formPrefix = 'pengeluaran'; break;
                        case 'Transfer': tabId = '#transfer-tab'; formPrefix = 'transfer'; break;
                        case 'TRX': tabId = '#trx-tab'; formPrefix = 'trx'; break;
                    }
                    
                    const tab = document.querySelector(tabId);
                    if(tab) bootstrap.Tab.getOrCreateInstance(tab).show();
                    
                    setValueById(`${formPrefix}-id-edit`, item.id);
                    setValueById(`${formPrefix}Tanggal`, item.tanggal);
                    setValueById(`${formPrefix}Kategori`, item.kategori);
                    setValueById(`${formPrefix}Catatan`, item.catatan);
                    
                    if (item.tipe === 'Pendapatan') {
                        setValueById('pendapatanKeAkun', item.keAkun);
                        setValueById('pendapatanNominal', item.total);
                    } else if (item.tipe === 'Pengeluaran') {
                        setValueById('pengeluaranDariAkun', item.dariAkun);
                        setValueById('pengeluaranNominal', item.total);
                    } else if (item.tipe === 'Transfer') {
                        setValueById('transferDariAkun', item.dariAkun);
                        setValueById('transferKeAkun', item.keAkun);
                        setValueById('transferNominal', item.total);
                    } else if (item.tipe === 'TRX') {
                        setValueById('trxDariAkun', item.dariAkun);
                        setValueById('trxKeAkun', item.keAkun);
                        setValueById('trxNominal', item.total); // Modal
                        setValueById('trxFee', item.fee); // Laba
                    }
                }
            } else {
                modalTitle.textContent = 'Buat Transaksi Keuangan Baru';
            }
        });
    }
            
    // Listener untuk hutangModalEl 'show.bs.modal'
    const hutangModalEl = document.getElementById('hutangModal');
    if(hutangModalEl) {
        hutangModalEl.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const action = button.dataset.action;
            const modalTitle = hutangModalEl.querySelector('.modal-title');
            
            resetHutangForm();
            
            if (action === 'edit') {
                modalTitle.textContent = 'Edit Hutang/Piutang';
                const id = parseInt(button.dataset.id);
                const item = initialHistoryData.hutang.find(h => h.id === id);
                
                if (item) {
                    let tabId, formPrefix;
                    if(item.tipe === 'Piutang') {
                        tabId = '#piutang-tab'; formPrefix = 'piutang';
                    } else {
                        tabId = '#hutang-tab'; formPrefix = 'hutang';
                    }
                    
                    const tab = document.querySelector(tabId);
                    if(tab) bootstrap.Tab.getOrCreateInstance(tab).show();
                    
                    setValueById(`${formPrefix}-id-edit`, item.id);
                    setValueById(`${formPrefix}Tanggal`, item.tanggal);
                    setValueById(`${formPrefix}Pihak`, item.pihak);
                    setValueById(`${formPrefix}Nominal`, item.jumlah); // Tampilkan total asli
                    setValueById(`${formPrefix}Catatan`, item.catatan);
                }
            } else {
                modalTitle.textContent = 'Tambah Hutang/Piutang Baru';
            }
        });
    }
            
    // Listener untuk masterDataModalEl 'show.bs.modal'
    const masterDataModalEl = document.getElementById('masterDataModal');
    if(masterDataModalEl) {
        masterDataModalEl.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const type = button.dataset.type;
            const action = button.dataset.action;
            const id = button.dataset.id;
            
            const modalTitle = masterDataModalEl.querySelector('.modal-title');
            
            resetMasterDataForm();
            setValueById('masterDataType', type);
            
            // Tampilkan field yang relevan
            if (type === 'produk') {
                document.getElementById('field-nama').style.display = 'block';
                document.getElementById('field-modal').style.display = 'block';
                document.getElementById('field-jual').style.display = 'block';
                document.getElementById('field-stok').style.display = 'block';
            } else if (type === 'akun') {
                document.getElementById('field-nama').style.display = 'block';
                document.getElementById('field-saldo').style.display = 'block';
            } else { // kategori, jenisTransaksi, pengguna
                document.getElementById('field-nama').style.display = 'block';
            }
            
            if (action === 'edit') {
                modalTitle.textContent = `Edit ${type}`;
                setValueById('masterDataId', id);
                
                let item;
                if (type === 'produk') item = initialMasterData.produk.find(i => i.id === parseInt(id));
                else if (type === 'akun') item = initialMasterData.akun.find(i => i.id === parseInt(id));
                else item = initialMasterData[type][parseInt(id)]; // Ambil by index
                
                if (item) {
                    if (type === 'produk') {
                        setValueById('masterNama', item.nama);
                        setValueById('masterModal', item.modal);
                        setValueById('masterJual', item.jual);
                        setValueById('masterStok', item.stok);
                    } else if (type === 'akun') {
                        setValueById('masterNama', item.nama);
                        setValueById('masterSaldo', item.saldo);
                    } else { // string array
                        setValueById('masterNama', item);
                    }
                }
                
            } else {
                modalTitle.textContent = `Tambah ${type} Baru`;
            }
        });
    }
            
    // Listener untuk riwayatHapusModalEl 'show.bs.offcanvas'
    const riwayatHapusModalEl = document.getElementById('riwayatHapusModal');
    if(riwayatHapusModalEl) {
        riwayatHapusModalEl.addEventListener('show.bs.offcanvas', function() {
            renderDeletionHistory();
        });
    }
            
    // =============================================
    // INISIALISASI APLIKASI SAAT DIMUAT
    // =============================================
    
    initCharts();
    setGlobalFilter('bulanan'); // Atur filter default
    renderAllMasterData();
    renderAllHistoryPages();
    renderDashboardAnalytics(); // Render dashboard dengan data & filter default
    renderLaporanPage(); // Render laporan dengan data & filter default

});
