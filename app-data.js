 // Variabel global untuk menyimpan referensi ke modal
        let modalTambahAkun, modalHapusAkun, modalPenyesuaianSaldo;
        let modalTambahKategori, modalHapusKategori;
        let modalKonfirmasiImport, globalToast;
        let modalTransaksi, modalHapusTransaksi;
        let modalProduk, modalHapusProduk;
        let modalPenjualan, modalHapusPenjualan;
        let dataToImport = null;

        // State untuk filter transaksi
        let globalFilterState = {
            tanggal: 'semua', // 'semua', 'hariIni', 'kemarin', 'mingguIni', 'bulanIni'
            tipe: 'semua'     // 'semua', 'in', 'out', 'transfer', 'trx'
        };
        // State untuk filter penjualan
        let globalFilterPenjualanState = {
            tanggal: 'semua',
            tipe: 'semua'
        };


        // ===============================================
        // MASTER DATA & STATE APLIKASI
        // ===============================================

        // Master Data untuk Akun
        let globalAkunState = [
            { id: 1, nama: "Cash", saldo: 0 },
            { id: 2, nama: "BRI Galih", saldo: 0 },
            { id: 3, nama: "BRI Nussa", saldo: 0 },
            { id: 4, nama: "BNI", saldo: 0 },
            { id: 5, nama: "Bank Jateng", saldo: 0 },
            { id: 6, nama: "Buku Agen", saldo: 0 },
            { id: 7, nama: "Dana Galih", saldo: 0 },
            { id: 8, nama: "Dana Nussa", saldo: 0 },
            { id: 9, nama: "Shopee Pay", saldo: 0 },
            { id: 10, nama: "Go-Pay", saldo: 0 },
            { id: 11, nama: "Order Kuota", saldo: 0 },
            { id: 12, nama: "Digipos", saldo: 0 },
            { id: 13, nama: "Save Plus", saldo: 0 },
            { id: 14, nama: "I-Simple", saldo: 0 },
            { id: 15, nama: "Tabungan", saldo: 0 },
            { id: 16, nama: "Laba Bersih", saldo: 0 },
            { id: 17, nama: "Fee BRI Link", saldo: 0 },
            { id: 18, nama: "Hutang Piutang", saldo: 0 },
            { id: 19, nama: "Modal", saldo: 0 }
        ];

        // Master Data untuk Kategori
        let globalKategoriState = [
            { id: 1, nama: "Order Kuota", tipe: "Lainnya" },
            { id: 2, nama: "Dana", tipe: "Lainnya" },
            { id: 3, nama: "Go-Pay", tipe: "Lainnya" },
            { id: 4, nama: "Shopee-Pay", tipe: "Lainnya" },
            { id: 5, nama: "Cash", tipe: "Lainnya" },
            { id: 6, nama: "Modal", tipe: "Pemasukan" },
            { id: 7, nama: "Laba Bersih", tipe: "Pemasukan" },
            { id: 8, nama: "Fee BRI Link", tipe: "Pemasukan" },
            { id: 9, nama: "I-simple", tipe: "Lainnya" },
            { id: 10, nama: "Digipos", tipe: "Lainnya" },
            { id: 11, nama: "Hutang", tipe: "Pengeluaran" },
            { id: 12, nama: "BNI", tipe: "Lainnya" },
            { id: 13, nama: "BRI Nussa", tipe: "Lainnya" },
            { id: 14, nama: "BRI Galih", tipe: "Lainnya" },
            { id: 15, nama: "Pemasukan", tipe: "Pemasukan" },
            { id: 16, nama: "Pengeluaran", tipe: "Pengeluaran" },
            { id: 17, nama: "Penyesuaian", tipe: "Lainnya" },
            { id: 18, nama: "Penjualan ATK", tipe: "Pemasukan" },
            { id: 19, nama: "Service", tipe: "Pemasukan" },
            { id: 20, nama: "Tabungan", tipe: "Lainnya" },
            { id: 21, nama: "Save Plus", tipe: "Lainnya" },
            { id: 22, nama: "Pengeluaran Rumah", tipe: "Pengeluaran" },
            { id: 23, nama: "Transfer", tipe: "Transfer" },
            { id: 24, nama: "Tarik Tunai", tipe: "Transfer" },
            { id: 25, nama: "Setor Tunai", tipe: "Transfer" },
            { id: 26, nama: "APK", tipe: "Lainnya" },
            { id: 27, nama: "Kulak (SP/Voucher/HP/Sparepart/dll)", tipe: "Pengeluaran" },
            { id: 28, nama: "Penjualan", tipe: "Pemasukan" },
            { id: 29, nama: "Penjualan Transaksi", tipe: "Pemasukan" }
        ];

        // Master Data untuk Transaksi
        let globalTransaksiState = [
            // Data 20 Oktober 2025
            { id: 1, tanggal: "2025-10-20T19:30", waktu: "19.30 WIB", akun: "BRI Galih", akunTujuan: null, catatan: "Catatan transaksi 1", kategori: "Penjualan", fee: 5000, total: 1000000, tipe: "in" },
            { id: 2, tanggal: "2025-10-20T14:15", waktu: "14.15 WIB", akun: "Shopee Pay", akunTujuan: null, catatan: "Listrik", kategori: "Pengeluaran Rumah", fee: 0, total: 250000, tipe: "out" },
            { id: 3, tanggal: "2025-10-20T09:00", waktu: "09.00 WIB", akun: "Order Kuota", akunTujuan: null, catatan: "Axis 5GB", kategori: "Kulak (SP/Voucher/HP/Sparepart/dll)", fee: 0, total: 500000, tipe: "out" },
            // Data 19 Oktober 2025
            { id: 4, tanggal: "2025-10-19T16:45", waktu: "16.45 WIB", akun: "BNI", akunTujuan: null, catatan: "Dari Budi", kategori: "Pemasukan", fee: 0, total: 300000, tipe: "in" },
            { id: 5, tanggal: "2025-10-19T12:30", waktu: "12.30 WIB", akun: "Dana Galih", akunTujuan: null, catatan: "Warung Padang", kategori: "Pengeluaran", fee: 0, total: 25000, tipe: "out" },
            { id: 6, tanggal: "2025-10-19T11:00", waktu: "11.00 WIB", akun: "Go-Pay", akunTujuan: "Dana Galih", catatan: "-", kategori: "Transfer", fee: 1000, total: 101000, tipe: "transfer" },
            // Data 18 Oktober 2025
            { id: 7, tanggal: "2025-10-18T20:00", waktu: "20.00 WIB", akun: "BNI", akunTujuan: null, catatan: "Mingguan", kategori: "Fee BRI Link", fee: 0, total: 150000, tipe: "in" },
            { id: 8, tanggal: "2025-10-18T15:00", waktu: "15.00 WIB", akun: "Dana Galih", akunTujuan: "Shopee Pay", catatan: "Ke Shopee", kategori: "Transfer", fee: 0, total: 50000, tipe: "transfer" },
            { id: 9, tanggal: "2025-10-18T10:00", waktu: "10.00 WIB", akun: "Go-Pay", akunTujuan: null, catatan: "Ke kantor", kategori: "Pengeluaran", fee: 0, total: 15000, tipe: "out" },
            { id: 10, tanggal: "2025-10-18T08:00", waktu: "08.00 WIB", akun: "Digipos", akunTujuan: "Order Kuota", catatan: "Trx Harian", kategori: "Penjualan Transaksi", fee: 2500, total: 200000, tipe: "trx" },
        ];

        // Master Data untuk Produk
        let globalProdukState = [
            { id: 1, nama: "Pulpen Standard", hargaModal: 1500, hargaJual: 2500, stok: 50 },
            { id: 2, nama: "Buku Tulis Sidu 38", hargaModal: 3000, hargaJual: 4000, stok: 100 },
            { id: 3, nama: "Kabel Data Type-C", hargaModal: 10000, hargaJual: 15000, stok: 20 }
        ];

        // Master Data untuk Penjualan
        let globalPenjualanState = [
            { id: 1, tanggal: "2025-10-20T10:00", tipe: "Produk", produkId: 1, deskripsi: "Pulpen Standard", qty: 2, hargaModal: 1500, hargaJual: 2500, totalModal: 3000, totalJual: 5000, laba: 2000 },
            { id: 2, tanggal: "2025-10-19T11:00", tipe: "Jasa", deskripsi: "Ganti Baterai", hargaModal: 100000, hargaJual: 150000, totalModal: 100000, totalJual: 150000, laba: 50000 },
            { id: 3, tanggal: "2025-10-18T14:00", tipe: "Aplikasi", deskripsi: "Aktivasi Office", akunSumberModal: "BRI Galih", hargaModal: 25000, hargaJual: 50000, totalModal: 25000, totalJual: 50000, laba: 25000 }
        ];


        // ===============================================
        // FUNGSI UTAMA (Saat Halaman Dimuat)
        // ===============================================

        document.addEventListener('DOMContentLoaded', function () {
            // Inisialisasi semua referensi Modal
            modalTambahAkun = new bootstrap.Modal(document.getElementById('modalTambahAkun'));
            modalHapusAkun = new bootstrap.Modal(document.getElementById('modalHapusAkun'));
            modalPenyesuaianSaldo = new bootstrap.Modal(document.getElementById('modalPenyesuaianSaldo'));
            modalTambahKategori = new bootstrap.Modal(document.getElementById('modalTambahKategori'));
            modalHapusKategori = new bootstrap.Modal(document.getElementById('modalHapusKategori'));
            modalKonfirmasiImport = new bootstrap.Modal(document.getElementById('modalKonfirmasiImport'));
            globalToast = new bootstrap.Toast(document.getElementById('globalToast'), { autohide: true, delay: 3000 });

            modalTransaksi = new bootstrap.Modal(document.getElementById('modalTransaksi'));
            modalHapusTransaksi = new bootstrap.Modal(document.getElementById('modalHapusTransaksi'));

            modalProduk = new bootstrap.Modal(document.getElementById('modalProduk'));
            modalHapusProduk = new bootstrap.Modal(document.getElementById('modalHapusProduk'));

            modalPenjualan = new bootstrap.Modal(document.getElementById('modalPenjualan'));
            modalHapusPenjualan = new bootstrap.Modal(document.getElementById('modalHapusPenjualan'));

            // Render awal
            renderDaftarAkun();
            renderDaftarKategori();
            renderSidebarAkun();
            renderDaftarTransaksi();
            renderDaftarProduk();
            renderTotalAsetProduk();
            renderDaftarPenjualan();
            renderDashboardStats();
            populateSelectOptions();

            // Listener untuk file input import JSON
            document.getElementById('importFileInput').addEventListener('change', handleFileImport);
            // Listener untuk file input import CSV
            document.getElementById('importProdukCSVInput').addEventListener('change', handleProdukCSVImport);

            // Listener untuk filter transaksi
            document.getElementById('filterTglGroup').addEventListener('change', (e) => {
                globalFilterState.tanggal = e.target.value;
                renderDaftarTransaksi();
            });
            document.getElementById('filterTipe').addEventListener('change', (e) => {
                globalFilterState.tipe = e.target.value;
                renderDaftarTransaksi();
            });

             // Listener untuk filter penjualan
            document.getElementById('filterPenjualanTglGroup').addEventListener('change', (e) => {
                globalFilterPenjualanState.tanggal = e.target.value;
                renderDaftarPenjualan();
            });
            document.getElementById('filterPenjualanTipe').addEventListener('change', (e) => {
                globalFilterPenjualanState.tipe = e.target.value;
                renderDaftarPenjualan();
            });

            // Listener untuk Modal Transaksi
            document.getElementById('modalTrxTipe').addEventListener('change', toggleTransferFields);
            
            // Listener untuk Modal Penjualan
            document.getElementById('modalPenjualanTipe').addEventListener('change', updateModalPenjualanUI);
            document.getElementById('modalPenjualanProdukSelect').addEventListener('change', updateInfoProdukPenjualan);
            document.getElementById('modalPenjualanQty').addEventListener('input', updateInfoProdukPenjualan);
        });


        // ===============================================
        // FUNGSI NAVIGASI
        // ===============================================

        function navigateTo(viewId, el) {
            document.querySelectorAll('.main-view').forEach(view => {
                view.style.display = 'none';
            });
            const viewToShow = document.getElementById(viewId);
            if (viewToShow) {
                viewToShow.style.display = 'block';
            }
            document.querySelectorAll('#bottom-nav .nav-link').forEach(link => {
                link.classList.remove('active');
            });
            if (el) {
                el.classList.add('active');
            }

            // Tampilkan/Sembunyikan FAB yang sesuai
            const fabTrx = document.getElementById('fab-tambah-transaksi');
            const fabProduk = document.getElementById('fab-tambah-produk');
            const fabPenjualan = document.getElementById('fab-tambah-penjualan');

            fabTrx.style.display = (viewId === 'view-transaksi') ? 'block' : 'none';
            fabProduk.style.display = (viewId === 'view-produk') ? 'block' : 'none';
            fabPenjualan.style.display = (viewId === 'view-kasir') ? 'block' : 'none';
            
            // (BARU) Render ulang stats saat ke dashboard
            if (viewId === 'view-dashboard') {
                renderDashboardStats();
            }
        }

        function showSettingSubView(viewId) {
            document.getElementById('view-settings-main').style.display = 'none';
            document.getElementById('view-akun').style.display = 'none';
            document.getElementById('view-kategori').style.display = 'none';
            document.getElementById('view-info').style.display = 'none';

            const viewToShow = document.getElementById(viewId);
            if (viewToShow) {
                viewToShow.style.display = 'block';
                if (viewId === 'view-akun') {
                    renderDaftarAkun();
                } else if (viewId === 'view-kategori') {
                    renderDaftarKategori();
                }
            } else {
                document.getElementById('view-settings-main').style.display = 'block';
            }
        }


        // ===============================================
        // FUNGSI HELPER (Bantuan)
        // ===============================================

        function formatRupiah(number) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(number);
        }

        function showToast(message, type = 'success') {
            const toastEl = document.getElementById('globalToast');
            const titleEl = document.getElementById('globalToastTitle');
            const bodyEl = document.getElementById('globalToastBody');
            const iconEl = toastEl.querySelector('.toast-header i');

            if (type === 'danger') {
                toastEl.classList.remove('text-bg-success');
                toastEl.classList.add('text-bg-danger');
                titleEl.textContent = 'Error';
                iconEl.className = 'bi bi-exclamation-triangle-fill me-2';
            } else {
                toastEl.classList.remove('text-bg-danger');
                toastEl.classList.add('text-bg-success');
                titleEl.textContent = 'Sukses';
                iconEl.className = 'bi bi-check-circle-fill me-2';
            }
            bodyEl.textContent = message;
            globalToast.show();
        }

        function populateSelectOptions() {
            // Dropdown Akun (Transaksi)
            const akunSelect = document.getElementById('modalTrxAkun');
            const akunDariSelect = document.getElementById('modalTrxAkunDari');
            const akunKeSelect = document.getElementById('modalTrxAkunKe');
            // Dropdown Kategori (Transaksi)
            const kategoriSelect = document.getElementById('modalTrxKategori');

            // Dropdown Akun (Penjualan)
            const akunPenjualanSelect = document.getElementById('modalPenjualanAkunSumberModal');

            // Dropdown Produk (Penjualan)
            const produkSelect = document.getElementById('modalPenjualanProdukSelect');

            // --- Isi Akun ---
            const akunOptionsHtml = globalAkunState
                .map(akun => `<option value="${akun.nama}">${akun.nama}</option>`)
                .join('');
            
            akunSelect.innerHTML = `<option value="">-- Pilih Akun --</option>${akunOptionsHtml}`;
            akunDariSelect.innerHTML = `<option value="">-- Pilih Akun --</option>${akunOptionsHtml}`;
            akunKeSelect.innerHTML = `<option value="">-- Pilih Akun --</option>${akunOptionsHtml}`;
            akunPenjualanSelect.innerHTML = `<option value="">-- Pilih Akun --</option>${akunOptionsHtml}`;

            // --- Isi Kategori ---
            kategoriSelect.innerHTML = '<option value="">-- Pilih Kategori --</option>';
            globalKategoriState.forEach(kategori => {
                kategoriSelect.innerHTML += `<option value="${kategori.nama}">${kategori.nama}</option>`;
            });

            // --- Isi Produk ---
            produkSelect.innerHTML = '<option value="">-- Pilih Produk --</option>';
            globalProdukState.forEach(produk => {
                 produkSelect.innerHTML += `<option value="${produk.id}">${produk.nama} (Stok: ${produk.stok})</option>`;
            });
        }

        // (DIRUBAH)
        function toggleTransferFields(event) {
            const tipe = event.target.value;
            const singleAkunGroup = document.getElementById('form-group-akun-single');
            const transferAkunGroup = document.getElementById('form-group-akun-transfer');
            const akunSingle = document.getElementById('modalTrxAkun');
            const akunDari = document.getElementById('modalTrxAkunDari');
            const akunKe = document.getElementById('modalTrxAkunKe');

            // (BARU) Logika untuk Fee
            const formGroupFee = document.getElementById('form-group-trx-fee');
            const inputFee = document.getElementById('modalTrxFee');

            if (tipe === 'Transfer' || tipe === 'Trx') {
                singleAkunGroup.style.display = 'none';
                transferAkunGroup.style.display = 'block';
                akunSingle.required = false;
                akunDari.required = true;
                akunKe.required = true;
            } else {
                singleAkunGroup.style.display = 'block';
                transferAkunGroup.style.display = 'none';
                akunSingle.required = true;
                akunDari.required = false;
                akunKe.required = false;
            }

            // (BARU) Tampilkan/Sembunyikan Fee
            if (tipe === 'Trx') {
                formGroupFee.style.display = 'block';
            } else {
                formGroupFee.style.display = 'none';
                inputFee.value = ''; // Kosongkan nilai fee jika disembunyikan
            }
        }
        
        // Fungsi Helper Tanggal untuk Filter
        function getTodayDateString(now = new Date()) {
            return now.toISOString().split('T')[0];
        }

        function getYesterdayDateString(now = new Date()) {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            return yesterday.toISOString().split('T')[0];
        }

        function getStartOfWeekDateString(now = new Date()) {
            const startOfWeek = new Date(now);
            // Menggunakan 1 untuk Senin sebagai awal minggu (standar ISO/Indonesia)
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); // jika Minggu(0) -> mundur 6 hari, jika Senin(1) -> 0
            startOfWeek.setDate(diff);
            return startOfWeek.toISOString().split('T')[0];
        }

        function getStartOfMonthDateString(now = new Date()) {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return startOfMonth.toISOString().split('T')[0];
        }

        // ===============================================
        // FUNGSI RENDER (Menggambar Tampilan)
        // ===============================================

        // (DIRUBAH TOTAL)
        function renderDashboardStats() {
            // --- Cari Akun Penting ---
            const akunCash = globalAkunState.find(a => a.nama === "Cash");
            const akunModal = globalAkunState.find(a => a.nama === "Modal");
            const akunLaba = globalAkunState.find(a => a.nama === "Laba Bersih");
            const akunHutang = globalAkunState.find(a => a.nama === "Hutang Piutang");
            const akunTabungan = globalAkunState.find(a => a.nama === "Tabungan");

            // --- Kalkulasi Nilai ---
            
            // 1. Total Saldo (Uang Beredar - Kartu Biru)
            // Saldo semua akun KECUALI "Modal" dan "Laba Bersih"
            const totalSaldo = globalAkunState
                .filter(a => a.nama !== "Modal" && a.nama !== "Laba Bersih")
                .reduce((acc, a) => acc + a.saldo, 0);

            // 2. Total Cash (Kartu Hijau)
            const totalCash = akunCash ? akunCash.saldo : 0;
            
            // 3. Total Modal (Kartu Oranye)
            const totalModal = akunModal ? akunModal.saldo : 0;

            // 4. Laba Bersih (Grafik)
            const labaBersihGrafik = akunLaba ? akunLaba.saldo : 0;

            // 5. Pengeluaran Rumah (Grafik)
            const pengeluaranRumahGrafik = globalTransaksiState
                .filter(t => t.kategori === "Pengeluaran Rumah" && t.tipe === "out")
                .reduce((acc, t) => acc + t.total, 0);

            // 6. Total Saldo (Tanpa Hutang) (Kanan)
            // Saldo semua akun KECUALI "Modal", "Laba Bersih", dan "Hutang Piutang"
            const totalSaldoNoPiutang = globalAkunState
                .filter(a => a.nama !== "Modal" && a.nama !== "Laba Bersih" && a.nama !== "Hutang Piutang")
                .reduce((acc, a) => acc + a.saldo, 0);

            // 7. Total Hutang (Kanan)
            const totalHutang = akunHutang ? akunHutang.saldo : 0;

            // 8. Total Tabungan (Kanan)
            const totalTabungan = akunTabungan ? akunTabungan.saldo : 0;


            // --- Update UI ---
            // (Dashboard UI dikosongkan, jadi baris-baris ini dinonaktifkan untuk mencegah error)
            // document.getElementById('dashboard-saldo-total').textContent = formatRupiah(totalSaldo);
            // document.getElementById('dashboard-total-cash').textContent = formatRupiah(totalCash);
            // document.getElementById('dashboard-total-modal').textContent = formatRupiah(totalModal);
            
            // (BARU) Mengaktifkan kembali baris untuk kartu grafik
            const elGrafikLaba = document.getElementById('dashboard-grafik-laba');
            const elGrafikPengeluaran = document.getElementById('dashboard-grafik-pengeluaran');

            if (elGrafikLaba) elGrafikLaba.textContent = formatRupiah(labaBersihGrafik);
            if (elGrafikPengeluaran) elGrafikPengeluaran.textContent = formatRupiah(pengeluaranRumahGrafik);

            // document.getElementById('dashboard-total-saldo-no-piutang').textContent = formatRupiah(totalSaldoNoPiutang);
            // document.getElementById('dashboard-total-hutang').textContent = formatRupiah(totalHutang);
            // document.getElementById('dashboard-total-tabungan').textContent = formatRupiah(totalTabungan);
        }

        function renderDaftarAkun() {
            const listContainer = document.getElementById('daftar-akun-list');
            if (!listContainer) return;
            listContainer.innerHTML = '';
            if (globalAkunState.length === 0) {
                listContainer.innerHTML = '<li class="list-group-item text-center p-3 text-muted">Belum ada akun.</li>';
                return;
            }
            globalAkunState.forEach(akun => {
                const itemHtml = `
                    <li class="list-group-item d-flex justify-content-between align-items-center py-2 px-3">
                        <div class="d-flex align-items-center">
                            <div class="p-2 me-3 d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle" style="width: 36px; height: 36px;">
                                <i class="bi bi-wallet2 fs-6"></i>
                            </div>
                            <div class="me-auto">
                                <span class="fw-medium">${akun.nama}</span>
                                <div class="text-muted small">${formatRupiah(akun.saldo)}</div>
                            </div>
                        </div>
                        <div class="ms-2">
                            <div class="dropdown">
                                <button class="btn btn-link btn-sm text-muted p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Opsi untuk ${akun.nama}">
                                    <i class="bi bi-three-dots-vertical fs-5"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <a class="dropdown-item" href="#" onclick="event.preventDefault(); siapkanModalPenyesuaian(${akun.id}, '${akun.nama}', ${akun.saldo})">
                                            Penyesuaian Saldo
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" href="#" onclick="event.preventDefault(); siapkanModalEdit(${akun.id}, '${akun.nama}', ${akun.saldo})">
                                            Edit Akun
                                        </a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <a class="dropdown-item text-danger" href="#" onclick="event.preventDefault(); konfirmasiHapus(${akun.id}, '${akun.nama}')">
                                            Hapus Akun
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </li>
                `;
                listContainer.innerHTML += itemHtml;
            });
        }

        function renderDaftarKategori() {
            const listContainer = document.getElementById('daftar-kategori-list');
            if (!listContainer) return;
            listContainer.innerHTML = '';
            if (globalKategoriState.length === 0) {
                listContainer.innerHTML = '<li class="list-group-item text-center p-3 text-muted">Belum ada kategori.</li>';
                return;
            }
            globalKategoriState.forEach(kategori => {
                const itemHtml = `
                    <li class="list-group-item d-flex justify-content-between align-items-center py-1 px-3">
                        <div class="d-flex align-items-center">
                            <div class="p-2 me-3 d-inline-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style="width: 36px; height: 36px;">
                                <i class="bi bi-tag-fill fs-6"></i>
                            </div>
                            <div class="me-auto">
                                <span class="fw-medium">${kategori.nama}</span>
                            </div>
                        </div>
                        <div class="ms-2">
                            <div class="dropdown">
                                <button class="btn btn-link btn-sm text-muted p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Opsi untuk ${kategori.nama}">
                                    <i class="bi bi-three-dots-vertical fs-5"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <a class="dropdown-item" href="#" onclick="event.preventDefault(); siapkanModalEditKategori(${kategori.id}, '${kategori.nama}', '${kategori.tipe}')">
                                            Edit Kategori
                                        </a>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <a class="dropdown-item text-danger" href="#" onclick="event.preventDefault(); konfirmasiHapusKategori(${kategori.id}, '${kategori.nama}')">
                                            Hapus Kategori
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </li>
                `;
                listContainer.innerHTML += itemHtml;
            });
        }

        function renderSidebarAkun() {
            const container = document.getElementById('sidebar-akun-container');
            if (!container) return;

            let listHtml = '<ul class="sidebar-akun-list">';
            globalAkunState.forEach(akun => {
                listHtml += `
                    <li class="sidebar-akun-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="sidebar-akun-nama">${akun.nama}</span>
                            <span class="sidebar-akun-saldo">${formatRupiah(akun.saldo)}</span>
                        </div>
                    </li>
                `;
            });
            listHtml += '</ul>';
            container.innerHTML = listHtml;
        }

        function renderDaftarTransaksi() {
            const container = document.getElementById('transaksi-list-container');
            if (!container) return;

            // Logika Filter
            const now = new Date(); // Waktu saat ini
            const today = getTodayDateString(now);
            const yesterday = getYesterdayDateString(now);
            const startOfWeek = getStartOfWeekDateString(now);
            const startOfMonth = getStartOfMonthDateString(now);

            let filteredTrx = [...globalTransaksiState];

            // 1. Filter by Tipe
            if (globalFilterState.tipe !== 'semua') {
                filteredTrx = filteredTrx.filter(trx => trx.tipe === globalFilterState.tipe);
            }

            // 2. Filter by Tanggal
            switch (globalFilterState.tanggal) {
                case 'hariIni':
                    filteredTrx = filteredTrx.filter(trx => trx.tanggal.startsWith(today));
                    break;
                case 'kemarin':
                    filteredTrx = filteredTrx.filter(trx => trx.tanggal.startsWith(yesterday));
                    break;
                case 'mingguIni':
                    filteredTrx = filteredTrx.filter(trx => trx.tanggal.split('T')[0] >= startOfWeek);
                    break;
                case 'bulanIni':
                    filteredTrx = filteredTrx.filter(trx => trx.tanggal.split('T')[0] >= startOfMonth);
                    break;
                case 'semua':
                default:
                    break;
            }

            const sortedTrx = filteredTrx.sort((a, b) => b.tanggal.localeCompare(a.tanggal));

            const groupedTrx = sortedTrx.reduce((acc, trx) => {
                const date = trx.tanggal.split('T')[0];
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(trx);
                return acc;
            }, {});

            let html = '';
            const tglFormatter = new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            if (sortedTrx.length === 0) {
                 if (globalFilterState.tipe !== 'semua' || globalFilterState.tanggal !== 'semua') {
                    container.innerHTML = `<div class="card shadow-sm border-0"><div class="card-body text-center p-5 text-muted">Tidak ada transaksi yang sesuai dengan filter.</div></div>`;
                } else {
                    container.innerHTML = `<div class="card shadow-sm border-0"><div class="card-body text-center p-5 text-muted">Belum ada transaksi.</div></div>`;
                }
                return;
            }

            for (const tanggal in groupedTrx) {
                const tglObj = new Date(tanggal + "T00:00:00");
                html += `
                    <div class="date-separator">
                        <span class="date-separator-text">${tglFormatter.format(tglObj)}</span>
                    </div>
                `;

                groupedTrx[tanggal].forEach(trx => {
                    const totalClass = trx.tipe === 'in' ? 'text-pemasukan' : (trx.tipe === 'out' ? 'text-pengeluaran' : 'text-muted');
                    const totalSign = trx.tipe === 'in' ? '+' : '-';
                    const waktuDisplay = trx.waktu || trx.tanggal.split('T')[1].substring(0, 5);

                    let tipeDisplay = 'N/A';
                    let tipeClass = 'text-muted';
                    if (trx.tipe === 'in') {
                        tipeDisplay = 'Pemasukan';
                        tipeClass = 'text-success';
                    } else if (trx.tipe === 'out') {
                        tipeDisplay = 'Pengeluaran';
                        tipeClass = 'text-danger';
                    } else if (trx.tipe === 'transfer') {
                        tipeDisplay = 'Transfer';
                        tipeClass = 'text-primary';
                    } else if (trx.tipe === 'trx') {
                        tipeDisplay = 'Trx';
                        tipeClass = 'text-info';
                    }

                    const jenisHtml = `
                        <span class="fw-bold ${tipeClass}">${tipeDisplay}</span>
                        <div class="small text-muted">${waktuDisplay}</div>
                    `;

                    let rincianAkunHtml = '';
                    const akunClass = `text-akun-${trx.akun.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                    if (trx.tipe === 'transfer' || trx.tipe === 'trx') {
                        const akunKeClass = `text-akun-${(trx.akunTujuan || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                        rincianAkunHtml = `
                            <div class="col-jenis-transfer">
                                <span class="fw-bold ${akunClass}">${trx.akun}</span>
                                <i class="bi bi-arrow-right mx-1 small"></i>
                                <span class="fw-bold ${akunKeClass}">${trx.akunTujuan || '?'}</span>
                            </div>
                        `;
                    } else {
                        rincianAkunHtml = `<span class="fw-bold ${akunClass}">${trx.akun}</span>`;
                    }


                    html += `
                        <div class="card shadow-sm mb-2 border-0">
                            <div class="card-body p-3 p-md-2 transaksi-grid">
                                <div class="col-jenis text-end">
                                    <div>
                                        ${jenisHtml}
                                    </div>
                                </div>
                                <div class="col-rincian">
                                    ${rincianAkunHtml}
                                    <div class="small text-muted fst-italic">${trx.catatan || ''}</div>
                                </div>
                                <div class="col-kategori">
                                    <span class="fw-medium">${trx.kategori}</span>
                                    <div class="small text-muted">${trx.fee > 0 ? 'Fee: ' + formatRupiah(trx.fee) : ''}</div>
                                </div>
                                <div class="col-total text-end">
                                    <span class="fw-bold ${totalClass}">${(trx.tipe !== 'transfer' && trx.tipe !== 'trx') ? totalSign : ''} ${formatRupiah(trx.total)}</span>
                                </div>
                                <div class="col-aksi text-end">
                                    <div class="dropdown">
                                        <button class="btn btn-link btn-sm text-muted p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Opsi untuk ${trx.kategori}">
                                            <i class="bi bi-three-dots-vertical fs-5"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end">
                                            <li>
                                                <a class="dropdown-item" href="#" onclick="event.preventDefault(); siapkanModalEditTransaksi(${trx.id})">
                                                    Edit Transaksi
                                                </a>
                                            </li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li>
                                                <a class="dropdown-item text-danger" href="#" onclick="event.preventDefault(); konfirmasiHapusTransaksi(${trx.id}, '${trx.kategori.replace(/'/g, "\\'")}')">
                                                    Hapus Transaksi
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }

            container.innerHTML = html;
        }

        function renderDaftarProduk() {
            const listContainer = document.getElementById('produk-list-container');
            if (!listContainer) return;
            listContainer.innerHTML = '';
            if (globalProdukState.length === 0) {
                listContainer.innerHTML = '<li class="card shadow-sm border-0"><div class="card-body text-center p-5 text-muted">Belum ada produk.</div></li>';
                return;
            }

            let html = '';
            globalProdukState.forEach(produk => {
                html += `
                    <div class="card shadow-sm mb-2 border-0">
                        <div class="card-body p-3 p-md-2 produk-grid">
                            <!-- Kolom 1: Nama -->
                            <div class="col-nama">
                                <span class="fw-bold">${produk.nama}</span>
                            </div>
                            <!-- Kolom 2: Harga Modal -->
                            <div class="col-harga-modal text-end">
                                <span class="text-muted">${formatRupiah(produk.hargaModal)}</span>
                            </div>
                            <!-- Kolom 3: Harga Jual -->
                            <div class="col-harga-jual text-end">
                                <span class="fw-medium">${formatRupiah(produk.hargaJual)}</span>
                            </div>
                            <!-- Kolom 4: Stok -->
                            <div class="col-stok text-end">
                                <span>${produk.stok}</span>
                            </div>
                            <!-- Kolom 5: Aksi -->
                            <div class="col-aksi-produk text-end">
                                <div class="dropdown">
                                    <button class="btn btn-link btn-sm text-muted p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Opsi untuk ${produk.nama}">
                                        <i class="bi bi-three-dots-vertical fs-5"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        <li>
                                            <a class="dropdown-item" href="#" onclick="event.preventDefault(); siapkanModalEditProduk(${produk.id})">
                                                Edit Produk
                                            </a>
                                        </li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li>
                                            <a class="dropdown-item text-danger" href="#" onclick="event.preventDefault(); konfirmasiHapusProduk(${produk.id}, '${produk.nama.replace(/'/g, "\\'")}')">
                                                Hapus Produk
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            listContainer.innerHTML = html;
        }

        function renderTotalAsetProduk() {
            const totalAset = globalProdukState.reduce((total, produk) => {
                return total + (produk.hargaModal * produk.stok);
            }, 0);
            const formattedAset = formatRupiah(totalAset);
            
            // Update di halaman Produk
            const elProduk = document.getElementById('totalAsetProduk');
            if (elProduk) elProduk.textContent = formattedAset;
        }

        function renderDaftarPenjualan() {
            const container = document.getElementById('penjualan-list-container');
            if (!container) return;

             // Logika Filter
            const now = new Date();
            const today = getTodayDateString(now);
            const yesterday = getYesterdayDateString(now);
            const startOfWeek = getStartOfWeekDateString(now);
            const startOfMonth = getStartOfMonthDateString(now);

            let filteredPenjualan = [...globalPenjualanState];

            // 1. Filter by Tipe
            if (globalFilterPenjualanState.tipe !== 'semua') {
                filteredPenjualan = filteredPenjualan.filter(p => p.tipe === globalFilterPenjualanState.tipe);
            }

            // 2. Filter by Tanggal
            switch (globalFilterPenjualanState.tanggal) {
                case 'hariIni':
                    filteredPenjualan = filteredPenjualan.filter(p => p.tanggal.startsWith(today));
                    break;
                case 'kemarin':
                    filteredPenjualan = filteredPenjualan.filter(p => p.tanggal.startsWith(yesterday));
                    break;
                case 'mingguIni':
                    filteredPenjualan = filteredPenjualan.filter(p => p.tanggal.split('T')[0] >= startOfWeek);
                    break;
                case 'bulanIni':
                    filteredPenjualan = filteredPenjualan.filter(p => p.tanggal.split('T')[0] >= startOfMonth);
                    break;
                case 'semua':
                default:
                    break;
            }

            const sortedPenjualan = filteredPenjualan.sort((a, b) => b.tanggal.localeCompare(a.tanggal));

            const groupedPenjualan = sortedPenjualan.reduce((acc, p) => {
                const date = p.tanggal.split('T')[0];
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(p);
                return acc;
            }, {});

            let html = '';
            const tglFormatter = new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

             if (sortedPenjualan.length === 0) {
                 if (globalFilterPenjualanState.tipe !== 'semua' || globalFilterPenjualanState.tanggal !== 'semua') {
                    container.innerHTML = `<div class="card shadow-sm border-0"><div class="card-body text-center p-5 text-muted">Tidak ada penjualan yang sesuai dengan filter.</div></div>`;
                } else {
                    container.innerHTML = `<div class="card shadow-sm border-0"><div class="card-body text-center p-5 text-muted">Belum ada penjualan.</div></div>`;
                }
                return;
            }

            for (const tanggal in groupedPenjualan) {
                const tglObj = new Date(tanggal + "T00:00:00");
                html += `
                    <div class="date-separator">
                        <span class="date-separator-text">${tglFormatter.format(tglObj)}</span>
                    </div>
                `;

                groupedPenjualan[tanggal].forEach(p => {
                    const waktuDisplay = p.tanggal.split('T')[1].substring(0, 5);
                    const labaClass = p.laba >= 0 ? 'text-laba-positif' : 'text-laba-negatif';

                    let tipeDisplay = 'N/A';
                    let tipeClass = 'text-muted';
                    if (p.tipe === 'Produk') {
                        tipeDisplay = 'Produk';
                        tipeClass = 'text-info';
                    } else if (p.tipe === 'Jasa') {
                        tipeDisplay = 'Jasa';
                        tipeClass = 'text-success';
                    } else if (p.tipe === 'Aplikasi') {
                        tipeDisplay = 'Aplikasi';
                        tipeClass = 'text-primary';
                    }

                    // Tipe (Kolom 1)
                    const tipeHtml = `
                        <span class="fw-bold ${tipeClass}">${tipeDisplay}</span>
                        <div class="small text-muted">${waktuDisplay}</div>
                    `;

                    // Deskripsi (Kolom 2)
                    const deskripsiHtml = `
                        <span class="fw-medium">${p.deskripsi}</span>
                        ${p.tipe === 'Produk' ? `<div class="small text-muted">${p.qty} x ${formatRupiah(p.hargaJual)}</div>` : ''}
                    `;
                    
                    // Akun (Kolom 3)
                    let akunHtml = '';
                    if (p.tipe === 'Aplikasi') {
                        akunHtml = `
                            <span class="fw-medium">Dari: ${p.akunSumberModal || '?'}</span>
                            <div class="small text-muted">Modal -> Cash</div>
                        `;
                    } else {
                         akunHtml = `
                            <span class="fw-medium">Modal | Laba</span>
                            <div class="small text-muted">Auto-Balance</div>
                        `;
                    }

                    // Nominal (Kolom 4)
                    const nominalHtml = `
                        <span class="fw-bold">${formatRupiah(p.totalJual)}</span>
                        <div class="small text-muted">Modal: ${formatRupiah(p.totalModal)}</div>
                    `;


                    html += `
                        <div class="card shadow-sm mb-2 border-0">
                            <div class="card-body p-3 p-md-2 penjualan-grid">
                                <!-- Kolom 1: Tipe -->
                                <div class="col-penjualan-tipe text-end">
                                    ${tipeHtml}
                                </div>
                                <!-- Kolom 2: Deskripsi -->
                                <div class="col-penjualan-deskripsi">
                                    ${deskripsiHtml}
                                </div>
                                <!-- Kolom 3: Akun -->
                                <div class="col-penjualan-akun">
                                    ${akunHtml}
                                </div>
                                <!-- Kolom 4: Nominal -->
                                <div class="col-penjualan-nominal text-end">
                                    ${nominalHtml}
                                </div>
                                <!-- Kolom 5: Laba -->
                                <div class="col-penjualan-laba text-end">
                                    <span class="fw-bold ${labaClass}">${formatRupiah(p.laba)}</span>
                                </div>
                                <!-- Kolom 6: Aksi -->
                                <div class="col-penjualan-aksi text-end">
                                    <div class="dropdown">
                                        <button class="btn btn-link btn-sm text-muted p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Opsi untuk ${p.deskripsi}">
                                            <i class="bi bi-three-dots-vertical fs-5"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end">
                                            <li>
                                                <a class="dropdown-item" href="#" onclick="event.preventDefault(); siapkanModalEditPenjualan(${p.id})">
                                                    Edit Penjualan
                                                </a>
                                            </li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li>
                                                <a class="dropdown-item text-danger" href="#" onclick="event.preventDefault(); konfirmasiHapusPenjualan(${p.id}, '${p.deskripsi.replace(/'/g, "\\'")}')">
                                                    Hapus Penjualan
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            container.innerHTML = html;
        }


        // ===============================================
        // FUNGSI CRUD AKUN
        // ===============================================
        function siapkanModalTambah() {
            document.getElementById('formAkun').reset();
            document.getElementById('editAkunId').value = '';
            document.getElementById('modalAwal').disabled = false;
            document.getElementById('modalAwal').value = '';
            document.getElementById('modalTambahAkunLabel').textContent = 'Tambah Akun Baru';
            modalTambahAkun.show();
        }
        function siapkanModalEdit(id, nama, saldo) {
            document.getElementById('formAkun').reset();
            document.getElementById('editAkunId').value = id;
            document.getElementById('modalNamaAkun').value = nama;
            document.getElementById('modalAwal').value = saldo;
            document.getElementById('modalAwal').disabled = true;
            document.getElementById('modalTambahAkunLabel').textContent = 'Edit Nama Akun';
            modalTambahAkun.show();
        }
        function simpanAkun() {
            const idToUpdate = document.getElementById('editAkunId').value;
            const namaAkun = document.getElementById('modalNamaAkun').value.trim();
            const modalAwal = parseInt(document.getElementById('modalAwal').value) || 0;
            if (!namaAkun) { showToast("Nama akun tidak boleh kosong.", 'danger'); return; }
            if (idToUpdate) {
                globalAkunState = globalAkunState.map(akun => {
                    if (akun.id == idToUpdate) { return { ...akun, nama: namaAkun }; }
                    return akun;
                });
            } else {
                const idBaru = globalAkunState.length > 0 ? Math.max(...globalAkunState.map(a => a.id)) + 1 : 1;
                const akunBaru = { id: idBaru, nama: namaAkun, saldo: modalAwal };
                globalAkunState.push(akunBaru);
            }
            renderDaftarAkun();
            renderSidebarAkun();
            populateSelectOptions();
            renderDashboardStats();
            modalTambahAkun.hide();
        }
        function konfirmasiHapus(id, nama) {
            document.getElementById('hapusAkunId').value = id;
            document.getElementById('hapusNamaAkun').textContent = nama;
            modalHapusAkun.show();
        }
        function hapusAkun() {
            const idToDelete = document.getElementById('hapusAkunId').value;
            globalAkunState = globalAkunState.filter(akun => akun.id != idToDelete);
            renderDaftarAkun();
            renderSidebarAkun();
            populateSelectOptions();
            renderDashboardStats();
            modalHapusAkun.hide();
        }
        function siapkanModalPenyesuaian(id, nama, saldo) {
            document.getElementById('formPenyesuaian').reset();
            document.getElementById('penyesuaianAkunId').value = id;
            document.getElementById('penyesuaianNamaAkun').textContent = nama;
            document.getElementById('penyesuaianSaldoLama').textContent = formatRupiah(saldo);
            document.getElementById('saldoBaru').value = '';
            modalPenyesuaianSaldo.show();
        }
        function simpanSaldoBaru() {
            const idToUpdate = document.getElementById('penyesuaianAkunId').value;
            const saldoBaru = parseInt(document.getElementById('saldoBaru').value) || 0;
            globalAkunState = globalAkunState.map(akun => {
                if (akun.id == idToUpdate) { return { ...akun, saldo: saldoBaru }; }
                return akun;
            });
            renderDaftarAkun();
            renderSidebarAkun();
            renderDashboardStats();
            modalPenyesuaianSaldo.hide();
        }

        // ===================================================
        // FUNGSI CRUD KATEGORI
        // ===================================================
        function siapkanModalTambahKategori() {
            document.getElementById('formKategori').reset();
            document.getElementById('editKategoriId').value = '';
            document.getElementById('modalTambahKategoriLabel').textContent = 'Tambah Kategori Baru';
            modalTambahKategori.show();
        }
        function siapkanModalEditKategori(id, nama, tipe) {
            document.getElementById('formKategori').reset();
            document.getElementById('editKategoriId').value = id;
            document.getElementById('modalNamaKategori').value = nama;
            document.getElementById('modalTipeKategori').value = tipe;
            document.getElementById('modalTambahKategoriLabel').textContent = 'Edit Kategori';
            modalTambahKategori.show();
        }
        function simpanKategori() {
            const idToUpdate = document.getElementById('editKategoriId').value;
            const namaKategori = document.getElementById('modalNamaKategori').value.trim();
            const tipeKategori = document.getElementById('modalTipeKategori').value;
            if (!namaKategori) { showToast("Nama kategori tidak boleh kosong.", 'danger'); return; }
            if (idToUpdate) {
                globalKategoriState = globalKategoriState.map(kategori => {
                    if (kategori.id == idToUpdate) { return { ...kategori, nama: namaKategori, tipe: tipeKategori }; }
                    return kategori;
                });
            } else {
                const idBaru = globalKategoriState.length > 0 ? Math.max(...globalKategoriState.map(k => k.id)) + 1 : 1;
                const kategoriBaru = { id: idBaru, nama: namaKategori, tipe: tipeKategori };
                globalKategoriState.push(kategoriBaru);
            }
            renderDaftarKategori();
            populateSelectOptions();
            modalTambahKategori.hide();
        }
        function konfirmasiHapusKategori(id, nama) {
            document.getElementById('hapusKategoriId').value = id;
            document.getElementById('hapusNamaKategori').textContent = nama;
            modalHapusKategori.show();
        }
        function hapusKategori() {
            const idToDelete = document.getElementById('hapusKategoriId').value;
            globalKategoriState = globalKategoriState.filter(kategori => kategori.id != idToDelete);
            renderDaftarKategori();
            populateSelectOptions();
            modalHapusKategori.hide();
        }

        // ===================================================
        // FUNGSI CRUD TRANSAKSI
        // ===================================================

        function konfirmasiHapusTransaksi(id, namaTampil) {
            document.getElementById('hapusTransaksiId').value = id;
            document.getElementById('hapusRincianTransaksi').textContent = namaTampil;
            modalHapusTransaksi.show();
        }

        function hapusTransaksi() {
            const idToDelete = document.getElementById('hapusTransaksiId').value;
            const trx = globalTransaksiState.find(t => t.id == idToDelete);

            if (trx) {
                const akun = globalAkunState.find(a => a.nama === trx.akun);
                const akunLabaBersih = globalAkunState.find(a => a.nama === "Laba Bersih");
                
                // Kembalikan Saldo Total
                if (trx.tipe === 'in') {
                    if (akun) akun.saldo -= trx.total;
                } else if (trx.tipe === 'out') {
                    if (akun) akun.saldo += trx.total;
                } else if (trx.tipe === 'transfer' || trx.tipe === 'trx') {
                    if (akun) akun.saldo += trx.total;
                    const akunTujuan = globalAkunState.find(a => a.nama === trx.akunTujuan);
                    if (akunTujuan) akunTujuan.saldo -= trx.total;
                }

                // Kembalikan Saldo Fee
                if (akunLabaBersih && trx.tipe === 'trx' && trx.fee > 0) {
                    akunLabaBersih.saldo -= trx.fee;
                }
            }

            globalTransaksiState = globalTransaksiState.filter(t => t.id != idToDelete);

            renderDaftarTransaksi();
            renderSidebarAkun();
            renderDaftarAkun();
            renderDashboardStats();
            modalHapusTransaksi.hide();
            showToast('Transaksi berhasil dihapus.');
        }

        function siapkanModalTambahTransaksi() {
            document.getElementById('formTransaksi').reset();
            document.getElementById('editTransaksiId').value = '';
            document.getElementById('modalTransaksiLabel').textContent = 'Tambah Transaksi Baru';
            const now = new Date().toISOString().slice(0, 16);
            document.getElementById('modalTrxTanggal').value = now;
            toggleTransferFields({ target: document.getElementById('modalTrxTipe') });
            modalTransaksi.show();
        }

        function siapkanModalEditTransaksi(id) {
            const trx = globalTransaksiState.find(t => t.id == id);
            if (!trx) {
                showToast('Transaksi tidak ditemukan', 'danger');
                return;
            }

            document.getElementById('formTransaksi').reset();

            document.getElementById('editTransaksiId').value = trx.id;
            document.getElementById('editTransaksiOldTipe').value = trx.tipe;
            document.getElementById('editTransaksiOldAkun').value = trx.akun;
            document.getElementById('editTransaksiOldAkunTujuan').value = trx.akunTujuan || null;
            document.getElementById('editTransaksiOldTotal').value = trx.total;
            document.getElementById('editTransaksiOldFee').value = trx.fee || 0;

            let tipeForm;
            if (trx.tipe === 'in') tipeForm = 'Pemasukan';
            else if (trx.tipe === 'out') tipeForm = 'Pengeluaran';
            else if (trx.tipe === 'transfer') tipeForm = 'Transfer';
            else if (trx.tipe === 'trx') tipeForm = 'Trx';

            const tipeSelect = document.getElementById('modalTrxTipe');
            tipeSelect.value = tipeForm;
            toggleTransferFields({ target: tipeSelect }); // Panggil manual untuk tampilkan fee

            document.getElementById('modalTrxTanggal').value = trx.tanggal;
            document.getElementById('modalTrxKategori').value = trx.kategori;
            document.getElementById('modalTrxTotal').value = trx.total;
            document.getElementById('modalTrxFee').value = trx.fee || ''; // Isi nilai fee
            document.getElementById('modalTrxCatatan').value = trx.catatan || '';

            if (trx.tipe === 'transfer' || trx.tipe === 'trx') {
                document.getElementById('modalTrxAkunDari').value = trx.akun;
                document.getElementById('modalTrxAkunKe').value = trx.akunTujuan;
            } else {
                document.getElementById('modalTrxAkun').value = trx.akun;
            }

            document.getElementById('modalTransaksiLabel').textContent = 'Edit Transaksi';
            modalTransaksi.show();
        }

        function simpanTransaksi() {
            const idToUpdate = document.getElementById('editTransaksiId').value;
            const tipeBaruForm = document.getElementById('modalTrxTipe').value;
            const tanggalBaru = document.getElementById('modalTrxTanggal').value;
            const totalBaru = parseInt(document.getElementById('modalTrxTotal').value) || 0;
            const feeBaru = parseInt(document.getElementById('modalTrxFee').value) || 0;
            const catatanBaru = document.getElementById('modalTrxCatatan').value;
            const kategoriBaru = document.getElementById('modalTrxKategori').value;

            const tipeBaru = tipeBaruForm === 'Pemasukan' ? 'in' :
                (tipeBaruForm === 'Pengeluaran' ? 'out' :
                    (tipeBaruForm === 'Transfer' ? 'transfer' : 'trx'));

            let akunBaruNama, akunTujuanBaruNama;
            if (tipeBaru === 'transfer' || tipeBaru === 'trx') {
                akunBaruNama = document.getElementById('modalTrxAkunDari').value;
                akunTujuanBaruNama = document.getElementById('modalTrxAkunKe').value;
                if (akunBaruNama === akunTujuanBaruNama) {
                    showToast('Akun "Dari" dan "Ke" tidak boleh sama.', 'danger');
                    return;
                }
                if (!akunBaruNama || !akunTujuanBaruNama) {
                    showToast('Harap pilih akun "Dari" dan "Ke".', 'danger');
                    return;
                }
            } else {
                akunBaruNama = document.getElementById('modalTrxAkun').value;
                akunTujuanBaruNama = null;
                if (!akunBaruNama) {
                    showToast('Harap pilih Akun.', 'danger');
                    return;
                }
            }

            if (!tanggalBaru || !kategoriBaru || totalBaru <= 0) {
                showToast('Harap isi Tipe, Tanggal, Kategori, dan Total (lebih dari 0).', 'danger');
                return;
            }

            const akunLabaBersih = globalAkunState.find(a => a.nama === "Laba Bersih");
            if (!akunLabaBersih) {
                console.error("Akun 'Laba Bersih' tidak ditemukan!");
            }

            if (idToUpdate) {
                // --- MODE EDIT: Undo saldo & fee lama ---
                const tipeLama = document.getElementById('editTransaksiOldTipe').value;
                const akunLamaNama = document.getElementById('editTransaksiOldAkun').value;
                const akunTujuanLamaNama = document.getElementById('editTransaksiOldAkunTujuan').value;
                const totalLama = parseInt(document.getElementById('editTransaksiOldTotal').value) || 0;
                const feeLama = parseInt(document.getElementById('editTransaksiOldFee').value) || 0;

                const akunLama = globalAkunState.find(a => a.nama === akunLamaNama);
                
                // Undo Total
                if (tipeLama === 'in') {
                    if (akunLama) akunLama.saldo -= totalLama;
                } else if (tipeLama === 'out') {
                    if (akunLama) akunLama.saldo += totalLama;
                } else if (tipeLama === 'transfer' || tipeLama === 'trx') {
                    if (akunLama) akunLama.saldo += totalLama;
                    const akunTujuanLama = globalAkunState.find(a => a.nama === akunTujuanLamaNama);
                    if (akunTujuanLama) akunTujuanLama.saldo -= totalLama;
                }

                // Undo Fee
                if (akunLabaBersih && tipeLama === 'trx' && feeLama > 0) {
                    akunLabaBersih.saldo -= feeLama;
                }
            }

            // --- MODE EDIT & TAMBAH: Terapkan saldo & fee baru ---
            const akunBaru = globalAkunState.find(a => a.nama === akunBaruNama);
            
            // Apply Total
            if (tipeBaru === 'in') {
                if (akunBaru) akunBaru.saldo += totalBaru;
            } else if (tipeBaru === 'out') {
                if (akunBaru) akunBaru.saldo -= totalBaru;
            } else if (tipeBaru === 'transfer' || tipeBaru === 'trx') {
                if (akunBaru) akunBaru.saldo -= totalBaru;
                const akunTujuanBaru = globalAkunState.find(a => a.nama === akunTujuanBaruNama);
                if (akunTujuanBaru) akunTujuanBaru.saldo += totalBaru;
            }

            // Apply Fee
            if (akunLabaBersih && tipeBaru === 'trx' && feeBaru > 0) {
                akunLabaBersih.saldo += feeBaru;
            }

            if (idToUpdate) {
                globalTransaksiState = globalTransaksiState.map(trx => {
                    if (trx.id == idToUpdate) {
                        return {
                            id: parseInt(idToUpdate),
                            tanggal: tanggalBaru,
                            waktu: tanggalBaru.split('T')[1],
                            akun: akunBaruNama,
                            akunTujuan: akunTujuanBaruNama,
                            catatan: catatanBaru,
                            kategori: kategoriBaru,
                            fee: feeBaru,
                            total: totalBaru,
                            tipe: tipeBaru
                        };
                    }
                    return trx;
                });
                showToast('Transaksi berhasil diperbarui.');
            } else {
                const idBaru = globalTransaksiState.length > 0 ? Math.max(...globalTransaksiState.map(t => t.id)) + 1 : 1;
                const trxBaru = {
                    id: idBaru,
                    tanggal: tanggalBaru,
                    waktu: tanggalBaru.split('T')[1],
                    akun: akunBaruNama,
                    akunTujuan: akunTujuanBaruNama,
                    catatan: catatanBaru,
                    kategori: kategoriBaru,
                    fee: feeBaru,
                    total: totalBaru,
                    tipe: tipeBaru
                };
                globalTransaksiState.push(trxBaru);
                showToast('Transaksi baru berhasil disimpan.');
            }

            renderDaftarTransaksi();
            renderSidebarAkun();
            renderDaftarAkun();
            renderDashboardStats();
            modalTransaksi.hide();
        }

        // ===================================================
        // FUNGSI CRUD PRODUK
        // ===================================================
        function siapkanModalTambahProduk() {
            document.getElementById('formProduk').reset();
            document.getElementById('editProdukId').value = '';
            document.getElementById('modalStok').disabled = false;
            document.getElementById('modalProdukLabel').textContent = 'Tambah Produk Baru';
            modalProduk.show();
        }

        function siapkanModalEditProduk(id) {
            const produk = globalProdukState.find(p => p.id == id);
            if (!produk) {
                showToast('Produk tidak ditemukan', 'danger');
                return;
            }
            document.getElementById('formProduk').reset();
            document.getElementById('editProdukId').value = produk.id;
            document.getElementById('modalNamaProduk').value = produk.nama;
            document.getElementById('modalHargaModal').value = produk.hargaModal;
            document.getElementById('modalHargaJual').value = produk.hargaJual;
            document.getElementById('modalStok').value = produk.stok;
            document.getElementById('modalStok').disabled = true; // Stok di-edit via penyesuaian/penjualan
            document.getElementById('modalProdukLabel').textContent = 'Edit Produk';
            modalProduk.show();
        }

        function simpanProduk() {
            const idToUpdate = document.getElementById('editProdukId').value;
            const nama = document.getElementById('modalNamaProduk').value.trim();
            const hargaModal = parseInt(document.getElementById('modalHargaModal').value) || 0;
            const hargaJual = parseInt(document.getElementById('modalHargaJual').value) || 0;
            const stok = parseInt(document.getElementById('modalStok').value) || 0;

            if (!nama || hargaJual < 0 || hargaModal < 0) {
                showToast('Nama, Harga Modal, dan Harga Jual harus diisi (angka tidak boleh negatif).', 'danger');
                return;
            }

            if (idToUpdate) {
                globalProdukState = globalProdukState.map(p => {
                    if (p.id == idToUpdate) {
                        return { ...p, nama: nama, hargaModal: hargaModal, hargaJual: hargaJual };
                    }
                    return p;
                });
                showToast('Produk berhasil diperbarui.');
            } else {
                const idBaru = globalProdukState.length > 0 ? Math.max(...globalProdukState.map(p => p.id)) + 1 : 1;
                const produkBaru = { id: idBaru, nama: nama, hargaModal: hargaModal, hargaJual: hargaJual, stok: stok };
                globalProdukState.push(produkBaru);
                showToast('Produk baru berhasil disimpan.');
            }

            renderDaftarProduk();
            renderTotalAsetProduk();
            populateSelectOptions();
            modalProduk.hide();
        }

        function konfirmasiHapusProduk(id, nama) {
            document.getElementById('hapusProdukId').value = id;
            document.getElementById('hapusNamaProduk').textContent = nama;
            modalHapusProduk.show();
        }

        function hapusProduk() {
            const idToDelete = document.getElementById('hapusProdukId').value;
            globalProdukState = globalProdukState.filter(p => p.id != idToDelete);

            renderDaftarProduk();
            renderTotalAsetProduk();
            populateSelectOptions();
            modalHapusProduk.hide();
        }

        // ===================================================
        // FUNGSI CRUD PENJUALAN (KASIR)
        // ===================================================
        
        function siapkanModalTambahPenjualan() {
            document.getElementById('formPenjualan').reset();
            document.getElementById('editPenjualanId').value = '';
            document.getElementById('modalPenjualanLabel').textContent = 'Tambah Penjualan Baru';
            const now = new Date().toISOString().slice(0, 16);
            document.getElementById('modalPenjualanTanggal').value = now;
            updateModalPenjualanUI(); // Reset UI
            updateInfoProdukPenjualan(); // Reset Info
            modalPenjualan.show();
        }
        
        function siapkanModalEditPenjualan(id) {
            const p = globalPenjualanState.find(p => p.id == id);
            if (!p) {
                showToast('Data penjualan tidak ditemukan', 'danger');
                return;
            }

            document.getElementById('formPenjualan').reset();
            document.getElementById('editPenjualanId').value = p.id;
            document.getElementById('modalPenjualanLabel').textContent = 'Edit Penjualan';
            
            document.getElementById('modalPenjualanTipe').value = p.tipe;
            document.getElementById('modalPenjualanTanggal').value = p.tanggal;

            updateModalPenjualanUI(); // Tampilkan field yang sesuai

            if (p.tipe === 'Produk') {
                document.getElementById('modalPenjualanProdukSelect').value = p.produkId;
                document.getElementById('modalPenjualanQty').value = p.qty;
                updateInfoProdukPenjualan(); // Update info laba/stok
            } else if (p.tipe === 'Jasa') {
                document.getElementById('modalPenjualanDeskripsiJasa').value = p.deskripsi;
                document.getElementById('modalPenjualanHargaModalJasa').value = p.hargaModal;
                document.getElementById('modalPenjualanHargaJualJasa').value = p.hargaJual;
            } else if (p.tipe === 'Aplikasi') {
                document.getElementById('modalPenjualanDeskripsiAplikasi').value = p.deskripsi;
                document.getElementById('modalPenjualanAkunSumberModal').value = p.akunSumberModal;
                document.getElementById('modalPenjualanHargaModalAplikasi').value = p.hargaModal;
                document.getElementById('modalPenjualanHargaJualAplikasi').value = p.hargaJual;
            }

            modalPenjualan.show();
        }
        
        function updateModalPenjualanUI() {
            const tipe = document.getElementById('modalPenjualanTipe').value;

            // Sembunyikan semua grup spesifik
            document.querySelectorAll('.form-group-penjualan').forEach(g => g.style.display = 'none');
            // Sembunyikan semua input akun
            document.getElementById('form-group-akun-sumber-modal').style.display = 'none';

            // Reset required status
            document.getElementById('modalPenjualanProdukSelect').required = false;
            document.getElementById('modalPenjualanQty').required = false;
            document.getElementById('modalPenjualanDeskripsiJasa').required = false;
            document.getElementById('modalPenjualanHargaModalJasa').required = false;
            document.getElementById('modalPenjualanHargaJualJasa').required = false;
            document.getElementById('modalPenjualanDeskripsiAplikasi').required = false;
            document.getElementById('modalPenjualanAkunSumberModal').required = false;
            document.getElementById('modalPenjualanHargaModalAplikasi').required = false;
            document.getElementById('modalPenjualanHargaJualAplikasi').required = false;

            // Tampilkan grup yang relevan
            if (tipe === 'Produk') {
                document.getElementById('group-penjualan-produk').style.display = 'block';
                document.getElementById('modalPenjualanProdukSelect').required = true;
                document.getElementById('modalPenjualanQty').required = true;
            } else if (tipe === 'Jasa') {
                document.getElementById('group-penjualan-jasa').style.display = 'block';
                document.getElementById('modalPenjualanDeskripsiJasa').required = true;
                document.getElementById('modalPenjualanHargaModalJasa').required = true;
                document.getElementById('modalPenjualanHargaJualJasa').required = true;
            } else if (tipe === 'Aplikasi') {
                document.getElementById('group-penjualan-aplikasi').style.display = 'block';
                document.getElementById('form-group-akun-sumber-modal').style.display = 'block'; // Tampilkan input akun
                
                document.getElementById('modalPenjualanDeskripsiAplikasi').required = true;
                document.getElementById('modalPenjualanAkunSumberModal').required = true; // Wajibkan input akun
                document.getElementById('modalPenjualanHargaModalAplikasi').required = true;
                document.getElementById('modalPenjualanHargaJualAplikasi').required = true;
            }
            updateInfoProdukPenjualan();
        }

        function updateInfoProdukPenjualan() {
            const produkId = document.getElementById('modalPenjualanProdukSelect').value;
            const qty = parseInt(document.getElementById('modalPenjualanQty').value) || 0;
            const produk = globalProdukState.find(p => p.id == produkId);

            if (produk) {
                const labaPerItem = produk.hargaJual - produk.hargaModal;
                document.getElementById('infoHargaJualProduk').textContent = formatRupiah(produk.hargaJual);
                document.getElementById('infoStokProduk').textContent = produk.stok;
                document.getElementById('infoLabaProduk').textContent = formatRupiah(labaPerItem);
                document.getElementById('infoTotalLabaProduk').textContent = formatRupiah(labaPerItem * qty);
            } else {
                document.getElementById('infoHargaJualProduk').textContent = 'Rp 0';
                document.getElementById('infoStokProduk').textContent = '0';
                document.getElementById('infoLabaProduk').textContent = 'Rp 0';
                document.getElementById('infoTotalLabaProduk').textContent = 'Rp 0';
            }
        }

        function simpanPenjualan() {
            const idToUpdate = document.getElementById('editPenjualanId').value;
            
            // Data Umum
            const tipe = document.getElementById('modalPenjualanTipe').value;
            const tanggal = document.getElementById('modalPenjualanTanggal').value;
            
            let dataPenjualan = {
                tipe: tipe,
                tanggal: tanggal,
                deskripsi: '',
                produkId: null,
                qty: 1,
                akunSumberModal: null,
                hargaModal: 0,
                hargaJual: 0,
                totalModal: 0,
                totalJual: 0,
                laba: 0
            };

            try {
                if (!tipe || !tanggal) throw new Error('Tipe dan Tanggal harus diisi.');

                // Ambil data spesifik berdasarkan Tipe
                if (tipe === 'Produk') {
                    const produkId = document.getElementById('modalPenjualanProdukSelect').value;
                    const qty = parseInt(document.getElementById('modalPenjualanQty').value) || 0;
                    const produk = globalProdukState.find(p => p.id == produkId);

                    if (!produk) throw new Error('Produk harus dipilih.');
                    if (qty <= 0) throw new Error('Kuantitas (Qty) harus lebih dari 0.');
                    
                    // Cek stok HANYA jika ini penjualan BARU
                    if (!idToUpdate && qty > produk.stok) {
                         throw new Error(`Stok tidak mencukupi. Sisa stok: ${produk.stok}`);
                    }

                    dataPenjualan.produkId = parseInt(produkId);
                    dataPenjualan.deskripsi = produk.nama;
                    dataPenjualan.qty = qty;
                    dataPenjualan.hargaModal = produk.hargaModal;
                    dataPenjualan.hargaJual = produk.hargaJual;
                    dataPenjualan.totalModal = produk.hargaModal * qty;
                    dataPenjualan.totalJual = produk.hargaJual * qty;
                    dataPenjualan.laba = dataPenjualan.totalJual - dataPenjualan.totalModal;

                } else if (tipe === 'Jasa') {
                    const deskripsi = document.getElementById('modalPenjualanDeskripsiJasa').value.trim();
                    const hargaModal = parseInt(document.getElementById('modalPenjualanHargaModalJasa').value) || 0;
                    const hargaJual = parseInt(document.getElementById('modalPenjualanHargaJualJasa').value) || 0;

                    if (!deskripsi) throw new Error('Deskripsi Jasa tidak boleh kosong.');
                    if (hargaJual <= 0) throw new Error('Harga Jual Jasa harus lebih dari 0.');
                    if (hargaModal < 0) throw new Error('Harga Modal tidak boleh negatif.');

                    dataPenjualan.deskripsi = deskripsi;
                    dataPenjualan.hargaModal = hargaModal;
                    dataPenjualan.hargaJual = hargaJual;
                    dataPenjualan.totalModal = hargaModal; // Qty diasumsikan 1
                    dataPenjualan.totalJual = hargaJual; // Qty diasumsikan 1
                    dataPenjualan.laba = hargaJual - hargaModal; // Qty diasumsikan 1

                } else if (tipe === 'Aplikasi') {
                    const deskripsi = document.getElementById('modalPenjualanDeskripsiAplikasi').value.trim();
                    const akunSumberModal = document.getElementById('modalPenjualanAkunSumberModal').value;
                    const hargaModal = parseInt(document.getElementById('modalPenjualanHargaModalAplikasi').value) || 0;
                    const hargaJual = parseInt(document.getElementById('modalPenjualanHargaJualAplikasi').value) || 0;

                    if (!deskripsi) throw new Error('Deskripsi Aplikasi tidak boleh kosong.');
                    if (!akunSumberModal) throw new Error('Akun Sumber Modal harus dipilih.');
                    if (hargaJual <= 0) throw new Error('Harga Jual Aplikasi harus lebih dari 0.');
                    if (hargaModal < 0) throw new Error('Harga Modal tidak boleh negatif.');

                    dataPenjualan.deskripsi = deskripsi;
                    dataPenjualan.akunSumberModal = akunSumberModal;
                    dataPenjualan.hargaModal = hargaModal;
                    dataPenjualan.hargaJual = hargaJual;
                    dataPenjualan.totalModal = hargaModal; // Qty diasumsikan 1
                    dataPenjualan.totalJual = hargaJual; // Qty diasumsikan 1
                    dataPenjualan.laba = hargaJual - hargaModal; // Qty diasumsikan 1
                }
            } catch (error) {
                showToast(error.message, 'danger');
                return;
            }

            // Koreksi Saldo
            if (idToUpdate) {
                // Mode Edit: Undo saldo & stok lama
                const penjualanLama = globalPenjualanState.find(p => p.id == idToUpdate);
                if (penjualanLama) {
                    koreksiSaldoPenjualan(penjualanLama, true); // true = undo
                }
            }
            
            // Terapkan saldo & stok baru
            koreksiSaldoPenjualan(dataPenjualan, false); // false = apply

            // Simpan data ke state
            if (idToUpdate) {
                globalPenjualanState = globalPenjualanState.map(p => {
                    if (p.id == idToUpdate) {
                        return { ...dataPenjualan, id: parseInt(idToUpdate) };
                    }
                    return p;
                });
                showToast('Penjualan berhasil diperbarui.');
            } else {
                const idBaru = globalPenjualanState.length > 0 ? Math.max(...globalPenjualanState.map(p => p.id)) + 1 : 1;
                globalPenjualanState.push({ ...dataPenjualan, id: idBaru });
                showToast('Penjualan baru berhasil disimpan.');
            }

            // Render ulang
            renderDaftarPenjualan();
            renderDaftarAkun();
            renderSidebarAkun();
            renderDaftarProduk(); // Update stok
            renderTotalAsetProduk(); // Update aset
            renderDashboardStats();
            populateSelectOptions(); // Update stok di dropdown
            modalPenjualan.hide();
        }
        
        function konfirmasiHapusPenjualan(id, deskripsi) {
            document.getElementById('hapusPenjualanId').value = id;
            document.getElementById('hapusDeskripsiPenjualan').textContent = deskripsi;
            modalHapusPenjualan.show();
        }

        function hapusPenjualan() {
            const idToDelete = document.getElementById('hapusPenjualanId').value;
            const penjualan = globalPenjualanState.find(p => p.id == idToDelete);

            if (penjualan) {
                // Kembalikan saldo & stok
                koreksiSaldoPenjualan(penjualan, true); // true = undo
            }

            globalPenjualanState = globalPenjualanState.filter(p => p.id != idToDelete);

            renderDaftarPenjualan();
            renderDaftarAkun();
            renderSidebarAkun();
            renderDaftarProduk(); // Update stok
            renderTotalAsetProduk(); // Update aset
            renderDashboardStats();
            populateSelectOptions(); // Update stok di dropdown
            modalHapusPenjualan.hide();
            showToast('Penjualan berhasil dihapus.');
        }

        /**
         * Mengoreksi saldo akun dan stok produk berdasarkan data penjualan.
         * @param {object} penjualanObj Objek penjualan
         * @param {boolean} undo Jika true, membatalkan (mengembalikan) transaksi. Jika false, menerapkan transaksi.
         */
        function koreksiSaldoPenjualan(penjualanObj, undo = false) {
            const multiplier = undo ? -1 : 1; // Jika undo, semua operasi dibalik

            const akunLabaBersih = globalAkunState.find(a => a.nama === "Laba Bersih");
            
            if (penjualanObj.tipe === 'Produk' || penjualanObj.tipe === 'Jasa') {
                const akunModal = globalAkunState.find(a => a.nama === "Modal");

                // Laba -> Laba Bersih
                if (akunLabaBersih) {
                    akunLabaBersih.saldo += (penjualanObj.laba * multiplier);
                }
                // Modal -> Modal
                if (akunModal) {
                    akunModal.saldo += (penjualanObj.totalModal * multiplier);
                }
                
                // Koreksi Stok (hanya untuk Produk)
                if (penjualanObj.tipe === 'Produk') {
                    const produk = globalProdukState.find(p => p.id == penjualanObj.produkId);
                    if (produk) {
                        // Jika undo=true, stok ditambah kembali. Jika undo=false, stok dikurangi.
                        produk.stok += (penjualanObj.qty * multiplier * -1);
                    }
                }
                
            } else if (penjualanObj.tipe === 'Aplikasi') {
                const akunSumber = globalAkunState.find(a => a.nama === penjualanObj.akunSumberModal);
                const akunCash = globalAkunState.find(a => a.nama === "Cash");

                if (!akunCash) {
                    console.error("Akun 'Cash' tidak ditemukan! Koreksi saldo Aplikasi gagal.");
                    showToast("Akun 'Cash' tidak ditemukan. Saldo modal tidak terkoreksi.", "danger");
                    return;
                }

                // Laba -> Laba Bersih
                if (akunLabaBersih) {
                    akunLabaBersih.saldo += (penjualanObj.laba * multiplier);
                }
                // Modal (Pindah dari Akun Sumber ke Cash)
                if (akunSumber) {
                    akunSumber.saldo -= (penjualanObj.totalModal * multiplier);
                }
                if (akunCash) {
                    akunCash.saldo += (penjualanObj.totalModal * multiplier);
                }
            }
        }


        // ===================================================
        // FUNGSI IMPORT / EXPORT DATA
        // ===================================================
        
        // --- IMPORT/EXPORT JSON (SEMUA DATA) ---
        function exportData() {
            try {
                const dataToExport = {
                    akun: globalAkunState,
                    kategori: globalKategoriState,
                    transaksi: globalTransaksiState,
                    produk: globalProdukState,
                    penjualan: globalPenjualanState,
                    metadata: {
                        exportDate: new Date().toISOString(),
                        appName: "Aplikasi Keuangan Web"
                    }
                };
                const jsonString = JSON.stringify(dataToExport, null, 2);
                const blob = new Blob([jsonString], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const tanggal = new Date().toISOString().split('T')[0];
                link.href = url;
                link.download = `backup_keuangan_lengkap_${tanggal}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                showToast('Data JSON lengkap berhasil diekspor.');
            } catch (error) {
                console.error("Error saat export data JSON:", error);
                showToast(`Gagal mengekspor data JSON: ${error.message}`, 'danger');
            }
        }
        
        function triggerImport() {
            document.getElementById('importFileInput').value = null;
            document.getElementById('importFileInput').click();
        }
        
        function handleFileImport(event) {
            const file = event.target.files[0];
            if (!file) { return; }
            if (!file.type.match('application/json') && !file.name.endsWith('.json')) {
                showToast('File tidak valid. Harap pilih file .json', 'danger');
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const parsedData = JSON.parse(e.target.result);
                    if (!parsedData.akun || !parsedData.kategori || !parsedData.transaksi || !parsedData.produk || !parsedData.penjualan ||
                        !Array.isArray(parsedData.akun) || !Array.isArray(parsedData.kategori) || !Array.isArray(parsedData.transaksi) || !Array.isArray(parsedData.produk) || !Array.isArray(parsedData.penjualan)) {
                        throw new Error("Struktur file backup JSON tidak valid.");
                    }
                    dataToImport = parsedData;
                    modalKonfirmasiImport.show();
                } catch (error) {
                    console.error("Error parsing file import JSON:", error);
                    showToast(`Error: ${error.message}`, 'danger');
                    dataToImport = null;
                }
            };
            reader.onerror = function () { showToast('Gagal membaca file.', 'danger'); dataToImport = null; };
            reader.readAsText(file);
        }
        
        function konfirmasiImport() {
            if (!dataToImport) { showToast('Tidak ada data untuk diimpor.', 'danger'); return; }
            try {
                globalAkunState = dataToImport.akun || [];
                globalKategoriState = dataToImport.kategori || [];
                globalTransaksiState = dataToImport.transaksi || [];
                globalProdukState = dataToImport.produk || [];
                globalPenjualanState = dataToImport.penjualan || [];

                renderDaftarAkun();
                renderDaftarKategori();
                renderSidebarAkun();
                renderDaftarTransaksi();
                renderDaftarProduk();
                renderTotalAsetProduk();
                renderDaftarPenjualan();
                renderDashboardStats();
                populateSelectOptions();
                showToast('Data JSON berhasil diimpor dan dipulihkan.');
            } catch (error) {
                console.error("Error saat menerapkan data import JSON:", error);
                showToast(`Gagal menerapkan data: ${error.message}`, 'danger');
            } finally {
                dataToImport = null;
                modalKonfirmasiImport.hide();
            }
        }

        // --- IMPORT/EXPORT CSV (KHUSUS PRODUK) ---
        function exportProdukToCSV() {
            try {
                const headers = "id,nama,hargaModal,hargaJual,stok";
                const rows = globalProdukState.map(p => {
                    const nama = `"${p.nama.replace(/"/g, '""')}"`; // Handle tanda kutip di nama
                    return [p.id, nama, p.hargaModal, p.hargaJual, p.stok].join(',');
                });

                const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                const tanggal = new Date().toISOString().split('T')[0];
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `backup_produk_${tanggal}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast('Data Produk (CSV) berhasil diekspor.');
            } catch (error) {
                 console.error("Error saat export data CSV:", error);
                showToast(`Gagal mengekspor data CSV: ${error.message}`, 'danger');
            }
        }

        function triggerImportProdukCSV() {
            document.getElementById('importProdukCSVInput').value = null;
            document.getElementById('importProdukCSVInput').click();
        }

        function handleProdukCSVImport(event) {
            const file = event.target.files[0];
            if (!file) { return; }
            if (!file.type.match('text/csv') && !file.name.endsWith('.csv')) {
                showToast('File tidak valid. Harap pilih file .csv', 'danger');
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const csvText = e.target.result;
                    const lines = csvText.split('\n').filter(line => line.trim() !== '');
                    if (lines.length < 2) throw new Error("File CSV kosong atau tidak valid.");

                    const headerLine = lines.shift().trim().toLowerCase();
                    const headers = headerLine.split(',').map(h => h.replace(/"/g, ''));
                    
                    // Validasi header
                    if (headers[0] !== 'id' || headers[1] !== 'nama' || headers[2] !== 'hargamodal' || headers[3] !== 'hargajual' || headers[4] !== 'stok') {
                        throw new Error(`Header CSV tidak sesuai. Harusnya: id,nama,hargaModal,hargaJual,stok. Ditemukan: ${headerLine}`);
                    }

                    const newProdukState = [];
                    lines.forEach((line, index) => {
                        // Regex sederhana untuk parsing CSV (mengabaikan koma di dalam tanda kutip)
                        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
                        if (values.length < 5) {
                             console.warn(`Melewatkan baris ${index + 2}: data tidak lengkap.`, line);
                             return;
                        }
                        
                        const id = parseInt(values[0]);
                        const nama = values[1].replace(/"/g, ''); // Hapus tanda kutip
                        const hargaModal = parseInt(values[2]);
                        const hargaJual = parseInt(values[3]);
                        const stok = parseInt(values[4]);

                        if (isNaN(id) || isNaN(hargaModal) || isNaN(hargaJual) || isNaN(stok) || !nama) {
                            console.warn(`Melewatkan baris ${index + 2}: data tidak valid.`, line);
                            return;
                        }
                        newProdukState.push({ id, nama, hargaModal, hargaJual, stok });
                    });

                    if (newProdukState.length === 0) {
                         throw new Error("Tidak ada data produk valid yang ditemukan di file CSV.");
                    }

                    // TIMPA data lama
                    globalProdukState = newProdukState;

                    // Render ulang
                    renderDaftarProduk();
                    renderTotalAsetProduk();
                    populateSelectOptions();
                    showToast(`Berhasil mengimpor ${newProdukState.length} produk dari CSV.`);

                } catch (error) {
                    console.error("Error parsing file import CSV:", error);
                    showToast(`Error: ${error.message}`, 'danger');
                }
            };
            reader.onerror = function () { showToast('Gagal membaca file.', 'danger'); };
            reader.readAsText(file);
        }
