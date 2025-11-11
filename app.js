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
        
        // BARU: Variabel global untuk menampung riwayat hapus
        let globalDeletionHistory = [];
        
        // Variabel untuk menyimpan state filter tanggal
        let globalDateFilter = {
            tipe: 'bulanan', // default 'bulanan'
            startDate: null,
            endDate: null
        };
        
        // =============================================
        // DATABASE APLIKASI (Data Dummy)
        // =============================================
        
        // Data Master (Disimpan di localStorage)
        let initialMasterData = {
            produk: [
                { id: 1, nama: "Materai 10k", modal: 10000, jual: 11000, stok: 50 },
                { id: 2, nama: "Pulsa 10k", modal: 11000, jual: 11500, stok: 100 },
                { id: 3, nama: "Pulsa 5k", modal: 6000, jual: 6500, stok: 100 },
                { id: 4, nama: "Token 20k", modal: 20500, jual: 21000, stok: 50 },
                { id: 5, nama: "Pulsa Telkomsel 5k", modal: 5200, jual: 7000, stok: 50 },
                { id: 6, nama: "Pulsa Telkomsel 10k", modal: 10100, jual: 12000, stok: 45 },
                { id: 7, nama: "Token Listrik 20k", modal: 20000, jual: 22000, stok: 30 },
                { id: 8, nama: "Voucher Data Indosat 2GB", modal: 14000, jual: 17000, stok: 25 },
                { id: 9, nama: "Case HP iPhone", modal: 25000, jual: 45000, stok: 15 },
                { id: 10, nama: "Kabel Data Type-C", modal: 15000, jual: 25000, stok: 40 },
            ],
            kategori: [
                "Order Kuota", "Dana", "Go-Pay", "Shopee-Pay", "Cash", "Modal", 
                "Laba Bersih", "Fee BRI Link", "I-simple", "Digipos", "Hutang", 
                "BNI", "BRI Nussa", "BRI Galih", "Pemasukan", "Pengeluaran", 
                "Penyesuaian", "Penjualan ATK", "Service", "Tabungan", "Save Plus", 
                "Pengeluaran Rumah", "Transfer", "Tarik Tunai", "Setor Tunai", "APK", 
                "Kulak (SP/Voucher/HP/Sparepart/dll)", "Penjualan", "Penjualan Transaksi"
            ],
            akun: [
                { id: 1, nama: "Cash", saldo: 1500000 },
                { id: 2, nama: "BRI Galih", saldo: 10250000 },
                { id: 3, nama: "BRI Nussa", saldo: 8100000 },
                { id: 4, nama: "BNI", saldo: 3400000 },
                { id: 5, nama: "Bank Jateng", saldo: 0 },
                { id: 6, nama: "Buku Agen", saldo: 500000 },
                { id: 7, nama: "Dana Galih", saldo: 1200000 },
                { id: 8, nama: "Dana Nussa", saldo: 0 },
                { id: 9, nama: "Shopee Pay", saldo: 750000 },
                { id: 10, nama: "Go-Pay", saldo: 300000 },
                { id: 11, nama: "Order Kuota", saldo: 0 },
                { id: 12, nama: "Digipos", saldo: 1100000 },
                { id: 13, nama: "Save Plus", saldo: 5000000 },
                { id: 14, nama: "I-Simple", saldo: 0 },
                { id: 15, nama: "Tabungan", saldo: 0 },
                { id: 16, nama: "Laba Bersih", saldo: 750000 },
                { id: 17, nama: "Fee BRI Link", saldo: 250000 },
                { id: 18, nama: "Hutang Piutang", saldo: -1200000 },
                { id: 19, nama: "Modal", saldo: 450000 },
            ],
            jenisTransaksi: [
                "Pendapatan", "Pengeluaran", "Transfer", "BRI", "BNI", 
                "Dana", "Go-Pay", "Shopee Pay", "Digipos", "I-simple", "Saveplus"
            ],
            pengguna: [
                "Admin 1", "Admin 2"
            ]
        };
        
        // Data Riwayat (Disimpan di localStorage)
        let initialHistoryData = {
            penjualan: [
                {
                    id: 1, tanggal: "2025-10-20", waktu: "19:30", tipe: "Produk", nama: "Pulsa 10k", 
                    kuantitas: 1, modal: 11000, laba: 500, total: 11500, color: "primary", produkId: 2, 
                    dariAkun: null, hargaJual: 11500
                },
                {
                    id: 2, tanggal: "2025-10-20", waktu: "19:35", tipe: "Jasa", nama: "Jasa Transfer BRI", 
                    kuantitas: 1, modal: 0, laba: 2500, total: 2500, color: "success", produkId: null, 
                    dariAkun: null, hargaJual: 2500
                },
                {
                    id: 3, tanggal: "2025-10-19", waktu: "10:15", tipe: "Aplikasi", nama: "Digipos", 
                    kuantitas: 1, modal: 50000, laba: 2000, total: 52000, color: "warning", produkId: null, 
                    dariAkun: "Digipos", hargaJual: 52000
                },
            ],
            transaksi: [
                {
                    id: 1, tanggal: "2025-10-20", waktu: "19:30", tipe: "TRX", jenis: "BRI", icon: "bi-bank", color: "primary",
                    rincian: "TRX BRI", catatan: "Biaya admin", kategori: "Penjualan Transaksi", 
                    dariAkun: "BRI Galih", keAkun: "Cash", fee: 5000, total: 1000000 // 'total' di sini adalah nominal modal
                },
                {
                    id: 2, tanggal: "2025-10-20", waktu: "19:30", tipe: "Pendapatan", jenis: "SHOPEE PAY", icon: "bi-shop", color: "warning",
                    rincian: "Masuk ke Shopee Pay", catatan: "Isi Saldo", kategori: "Pemasukan", 
                    dariAkun: null, keAkun: "Shopee Pay", fee: 0, total: 1000000
                },
                {
                    id: 3, tanggal: "2025-10-20", waktu: "19:30", tipe: "Pengeluaran", jenis: "ORDER KUOTA", icon: "bi-phone", color: "secondary",
                    rincian: "Keluar dari Cash", catatan: "Beli kuota", kategori: "Kulak (SP/Voucher/HP/Sparepart/dll)", 
                    dariAkun: "Cash", keAkun: null, fee: 0, total: 500000
                },
                {
                    id: 4, tanggal: "2025-10-19", waktu: "19:30", tipe: "Transfer", jenis: "BNI", icon: "bi-arrow-left-right", color: "info",
                    rincian: "Cash -> BNI", catatan: "Setor tunai", kategori: "Setor Tunai", 
                    dariAkun: "Cash", keAkun: "BNI", fee: 0, total: 1000000
                },
            ],
            hutang: [
                {
                    id: 1, tanggal: "2025-11-06", waktu: "14:30", tipe: "Piutang", icon: "bi-arrow-down", color: "success",
                    pihak: "Pelanggan A", sisa: 50000, total: 50000, jumlah: 50000, catatan: "Projek ABC", lunas: false
                },
                {
                    id: 2, tanggal: "2025-11-06", waktu: "11:00", tipe: "Hutang", icon: "bi-arrow-up", color: "danger",
                    pihak: "Supplier Pulsa", sisa: 1500000, total: 1500000, jumlah: 1500000, catatan: "Kulak pulsa", lunas: false
                },
                {
                    id: 3, tanggal: "2025-11-05", waktu: "16:00", tipe: "Hutang", icon: "bi-arrow-up", color: "danger",
                    pihak: "Supplier ATK", sisa: 100000, total: 300000, jumlah: 300000, catatan: "Beli buku", lunas: false
                },
            ]
        };


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
            // Asumsikan dateString adalah YYYY-MM-DD
            const date = new Date(dateString + 'T00:00:00'); // Atur ke tengah hari untuk menghindari masalah zona waktu
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
         * Fungsi helper untuk mengatur teks atau nilai elemen berdasarkan ID
         */
        function setValueById(id, value, isInput = false) {
            const el = document.getElementById(id);
            if (el) {
                if (isInput) {
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
        function getAkunSaldo(namaAkun, data = initialMasterData.akun) {
            const akun = data.find(a => a.nama === namaAkun);
            return akun ? akun.saldo : 0;
        }
        
        /**
         * Menghitung total saldo dari semua akun (kecuali Hutang Piutang)
         */
        function getTotalSaldoTunai(akunData) {
            return akunData.reduce((acc, akun) => {
                if (akun.nama !== 'Hutang Piutang' && akun.saldo > 0) {
                    return acc + akun.saldo;
                }
                return acc;
            }, 0);
        }


        /**
         * Mengatur rentang tanggal global berdasarkan tipe (harian, mingguan, bulanan, rentang)
         */
        function setGlobalFilter(tipe) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Awal hari ini
            
            globalDateFilter.tipe = tipe;
            
            switch (tipe) {
                case 'harian':
                    globalDateFilter.startDate = today;
                    globalDateFilter.endDate = new Date(new Date(today).setHours(23, 59, 59, 999)); // Akhir hari ini
                    break;
                case 'mingguan':
                    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))); // Mulai Senin
                    globalDateFilter.startDate = new Date(firstDayOfWeek); // Pastikan copy
                    globalDateFilter.endDate = new Date(new Date(firstDayOfWeek).setDate(firstDayOfWeek.getDate() + 6));
                    globalDateFilter.endDate.setHours(23, 59, 59, 999); // Akhir hari Minggu
                    break;
                case 'bulanan':
                    globalDateFilter.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    globalDateFilter.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Hari terakhir bulan ini
                    globalDateFilter.endDate.setHours(23, 59, 59, 999);
                    break;
                case 'rentang':
                    const start = document.getElementById('filter-start-date').value;
                    const end = document.getElementById('filter-end-date').value;
                    if (!start || !end) {
                        alert("Silakan pilih tanggal mulai dan tanggal selesai.");
                        return false; // Hentikan jika rentang tidak valid
                    }
                    globalDateFilter.startDate = new Date(start + 'T00:00:00');
                    globalDateFilter.endDate = new Date(end + 'T23:59:59');
                    break;
            }

            // Update UI tombol filter
            document.querySelectorAll('#filter-tanggal-buttons .nav-link').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tipe === tipe);
            });
            
            // Set nilai input tanggal (jika bukan dari rentang)
            if (tipe !== 'rentang') {
                document.getElementById('filter-start-date').value = globalDateFilter.startDate.toISOString().split('T')[0];
                document.getElementById('filter-end-date').value = globalDateFilter.endDate.toISOString().split('T')[0];
            }
            
            return true; // Filter berhasil diterapkan
        }

        /**
         * Menyaring array data riwayat (penjualan, transaksi, hutang) berdasarkan filter global
         */
        function filterDataByDate(dataArray) {
            if (!globalDateFilter.startDate || !globalDateFilter.endDate) {
                console.warn("Filter tanggal belum diatur. Mengembalikan semua data.");
                return dataArray;
            }

            return dataArray.filter(item => {
                const itemDate = new Date(item.tanggal);
                return itemDate >= globalDateFilter.startDate && itemDate <= globalDateFilter.endDate;
            });
        }
        

        /**
         * Memuat ulang SEMUA data di Halaman Dashboard
         */
        function renderDashboardAnalytics() {
            try {
                // 1. Dapatkan data yang sudah difilter
                const filteredSales = filterDataByDate(initialHistoryData.penjualan);
                const filteredTrx = filterDataByDate(initialHistoryData.transaksi);
                const filteredDebt = filterDataByDate(initialHistoryData.hutang);
                
                // 2. Analisa Umum (Kartu Atas) - INI TIDAK DIFILTER (menampilkan total)
                const totalSaldo = getTotalSaldoTunai(initialMasterData.akun);
                const totalCash = getAkunSaldo("Cash", initialMasterData.akun);
                // DIPERBAIKI: Mengambil saldo mentah (termasuk negatif) dari akun Hutang Piutang
                const totalPiutang = getAkunSaldo("Hutang Piutang", initialMasterData.akun);

                setValueById('dashboard-total-saldo', formatCurrency(totalSaldo));
                setValueById('dashboard-total-cash', formatCurrency(totalCash));
                setValueById('dashboard-total-piutang', formatCurrency(totalPiutang));
                
                // 3. Grafik Laba vs PR (Data dari Transaksi Terfilter)
                const labaBersihTotal = filteredTrx
                    .filter(t => t.kategori === 'Laba Bersih')
                    .reduce((acc, t) => acc + t.total, 0);
                
                const prTotal = filteredTrx
                    .filter(t => t.kategori === 'Pengeluaran Rumah')
                    .reduce((acc, t) => acc + t.total, 0);

                setValueById('grafik-laba-nom', formatCurrency(labaBersihTotal));
                setValueById('grafik-pr-nom', formatCurrency(prTotal));
                
                // Update Grafik Laba (jika ada data)
                if (labaPengeluaranChartInstance) {
                    labaPengeluaranChartInstance.data.datasets[0].data = [labaBersihTotal, prTotal];
                    labaPengeluaranChartInstance.update();
                }

                // 4. Kartu Tumpukan Kanan (Data dari Akun - INI TIDAK DIFILTER)
                setValueById('dashboard-modal-total', formatCurrency(getAkunSaldo("Modal", initialMasterData.akun)));
                setValueById('dashboard-laba-total', formatCurrency(getAkunSaldo("Laba Bersih", initialMasterData.akun)));
                // (PR Total sudah dihitung di atas, kita gunakan data terfilter)
                setValueById('dashboard-pr-total', formatCurrency(prTotal)); 
                // (Kartu Tabungan diubah jadi Cash)
                setValueById('dashboard-tabungan-total', formatCurrency(getAkunSaldo("Cash", initialMasterData.akun)));

                // 5. Analisa Khusus (Data dari Akun - INI TIDAK DIFILTER)
                setValueById('ak-fee-brilink-total', formatCurrency(getAkunSaldo("Fee BRI Link", initialMasterData.akun)));
                setValueById('ak-bri-nussa-total', formatCurrency(getAkunSaldo("BRI Nussa", initialMasterData.akun)));
                setValueById('ak-tabungan-total', formatCurrency(getAkunSaldo("Tabungan", initialMasterData.akun)));

                // 6. Riwayat Transaksi & Hutang Teratas (Data Terfilter)
                const transaksiTerbaru = filteredTrx.slice(0, 6);
                const hutangTeratas = filteredDebt
                    .filter(h => h.tipe === 'Hutang' && !h.lunas)
                    .sort((a, b) => b.jumlah - a.jumlah)
                    .slice(0, 6);
                
                renderDashboardTransaksiTerbaru(transaksiTerbaru);
                renderDashboardHutangTeratas(hutangTeratas);

                // 7. Analisa Penjualan (Data Penjualan Terfilter)
                const totalLabaPenjualan = filteredSales.reduce((acc, s) => acc + s.laba, 0);
                const totalQty = filteredSales.reduce((acc, s) => acc + s.kuantitas, 0);
                
                // BARU: Menghitung Jasa Terjual (tipe Jasa)
                const totalJasaQty = filteredSales.filter(s => s.tipe === 'Jasa').reduce((acc, s) => acc + s.kuantitas, 0);
                
                const totalJualProduk = filteredSales
                    .filter(s => s.tipe === 'Produk')
                    .reduce((acc, s) => acc + s.total, 0);
                const totalJualAplikasi = filteredSales
                    .filter(s => s.tipe === 'Aplikasi')
                    .reduce((acc, s) => acc + s.total, 0);
                const totalJualJasa = filteredSales
                    .filter(s => s.tipe === 'Jasa')
                    .reduce((acc, s) => acc + s.total, 0);
                
                // DIPERBAIKI: Menghitung total fee/laba HANYA dari tipe 'TRX' di data Transaksi
                const totalTrxFee = filteredTrx
                    .filter(t => t.tipe === 'TRX')
                    .reduce((acc, t) => acc + t.fee, 0);

                // BARU: Menghitung total nominal (modal) HANYA dari tipe 'TRX'
                const totalTrxNominal = filteredTrx
                    .filter(t => t.tipe === 'TRX')
                    .reduce((acc, t) => acc + t.total, 0);

                setValueById('sales-laba', formatCurrency(totalLabaPenjualan));
                setValueById('sales-qty', totalQty);
                setValueById('sales-jasa-qty', totalJasaQty); // BARU
                setValueById('sales-produk', formatCurrency(totalJualProduk));
                setValueById('sales-aplikasi', formatCurrency(totalJualAplikasi));
                setValueById('sales-jasa', formatCurrency(totalJualJasa));
                // DIUBAH: Menampilkan total nominal (modal) TRX, bukan laba
                setValueById('sales-tf', formatCurrency(totalTrxNominal)); // Total TRX
                
                // 8. Kartu Sub-Penjualan (Data Penjualan Terfilter)
                setValueById('sales-produk-h', formatCurrency(totalJualProduk));
                setValueById('sales-jasa-h', formatCurrency(totalJualJasa));
                setValueById('sales-apk-h', formatCurrency(totalJualAplikasi));
                // DIUBAH: Menampilkan total nominal (modal) TRX, bukan laba
                setValueById('sales-trx-h', formatCurrency(totalTrxNominal)); // Total Transaksi
                
                // 9. Top Produk & Riwayat Penjualan (Data Penjualan Terfilter)
                const topProduk = filteredSales
                    .filter(s => s.tipe === 'Produk')
                    .reduce((acc, s) => {
                        const existing = acc.find(p => p.nama === s.nama);
                        if (existing) {
                            existing.terjual += s.kuantitas;
                        } else {
                            acc.push({ nama: s.nama, terjual: s.kuantitas });
                        }
                        return acc;
                    }, [])
                    .sort((a, b) => b.terjual - a.terjual)
                    .slice(0, 7);
                
                renderDashboardTopProduk(topProduk);
                renderDashboardRiwayatPenjualan(filteredSales.slice(0, 3));
                
                // 10. Update Grafik Penjualan (Data Penjualan Terfilter)
                if (penjualanChartInstance) {
                    // Logika agregasi data harian untuk grafik
                    const salesByDate = filteredSales.reduce((acc, sale) => {
                        const date = sale.tanggal; // YYYY-MM-DD
                        if (!acc[date]) {
                            acc[date] = 0;
                        }
                        acc[date] += sale.total;
                        return acc;
                    }, {});
                    const labels = Object.keys(salesByDate).sort();
                    const data = labels.map(label => salesByDate[label]);
                    
                    penjualanChartInstance.data.labels = labels.map(l => formatFullDate(l).split(' ')[0] + ' ' + formatFullDate(l).split(' ')[1]); // Format (mis: 10 Okt)
                    penjualanChartInstance.data.datasets[0].data = data;
                    penjualanChartInstance.update();
                }
                
            } catch (error) {
                console.error("Error besar saat me-render dashboard:", error);
            }
        }
        
        /**
         * Render 6 transaksi terbaru di Dashboard
         */
        function renderDashboardTransaksiTerbaru(transaksiTerbaru) {
            const listContainer = document.getElementById('dashboard-transaksi-terbaru');
            if (!listContainer) return;
            listContainer.innerHTML = '';

            if (transaksiTerbaru.length === 0) {
                listContainer.innerHTML = `<li class="list-group-item d-flex justify-content-center align-items-center p-4"><span class="text-muted">Tidak ada transaksi.</span></li>`;
                return;
            }

            transaksiTerbaru.forEach(item => {
                const amountColor = (item.tipe === 'Pendapatan' || (item.tipe === 'TRX' && item.fee > 0)) ? 'text-success' : 'text-danger';
                const amount = (item.tipe === 'TRX') ? item.fee : item.total; // Tampilkan fee jika TRX
                
                listContainer.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                        <div class="d-flex align-items-center">
                            <i class="bi ${item.icon} fs-3 ${item.color}-subtle text-${item.color} me-3"></i>
                            <div class="transaction-details">
                                <span class="fw-bold d-block">${item.jenis}</span>
                                <small>${item.catatan || item.rincian}</small>
                            </div>
                        </div>
                        <span class="transaction-amount ${amountColor}">${formatCurrency(amount)}</span>
                    </li>
                `;
            });
        }
        
        /**
         * Render 6 hutang teratas di Dashboard
         */
        function renderDashboardHutangTeratas(hutangTeratas) {
            const listContainer = document.getElementById('dashboard-hutang-teratas');
            if (!listContainer) return;
            listContainer.innerHTML = '';

            if (hutangTeratas.length === 0) {
                listContainer.innerHTML = `<li class="list-group-item d-flex justify-content-center align-items-center p-4"><span class="text-muted">Tidak ada hutang.</span></li>`;
                return;
            }

            hutangTeratas.forEach(item => {
                // Perkiraan sisa hari (dummy logic, ganti jika ada tgl jatuh tempo)
                const dateParts = item.tanggal.split('-');
                const itemDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                const diffTime = Math.abs(new Date() - itemDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                listContainer.innerHTML += `
                    <li class="list-group-item debt-list-item px-0">
                        <span class="debt-days">${diffDays}</span>
                        <div class="transaction-details flex-grow-1">
                            <span class="fw-bold d-block">${item.pihak}</span>
                            <small>${item.catatan || 'Tidak ada catatan'}</small>
                        </div>
                        <span class="transaction-amount text-danger">${formatCurrency(item.sisa)}</span>
                    </li>
                `;
            });
        }
        
        /**
         * Render Top 7 Produk di Dashboard
         */
        function renderDashboardTopProduk(topProduk) {
            const listContainer = document.getElementById('dashboard-top-produk');
            if (!listContainer) return;
            listContainer.innerHTML = '';

            if (topProduk.length === 0) {
                listContainer.innerHTML = `<li class="list-group-item d-flex justify-content-center align-items-center p-4"><span class="text-muted">Belum ada produk terjual.</span></li>`;
                return;
            }

            topProduk.forEach((item, index) => {
                listContainer.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                        <div class="d-flex align-items-center">
                            <span class="rank-badge">#${index + 1}</span>
                            <span class="product-name">${item.nama}</span>
                        </div>
                        <span class="product-sold">Terjual ${item.terjual}</span>
                    </li>
                `;
            });
        }

        /**
         * Render 3 Riwayat Penjualan Terbaru di Dashboard
         */
        function renderDashboardRiwayatPenjualan(riwayatPenjualan) {
            const listContainer = document.getElementById('dashboard-riwayat-penjualan');
            if (!listContainer) return;
            listContainer.innerHTML = '';

            if (riwayatPenjualan.length === 0) {
                listContainer.innerHTML = `<li class="list-group-item d-flex justify-content-center align-items-center p-4"><span class="text-muted">Belum ada penjualan.</span></li>`;
                return;
            }
            
            riwayatPenjualan.forEach(item => {
                listContainer.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                        <div class="d-flex align-items-center">
                            <div class="icon-wrapper">
                                <i class="bi bi-tag-fill text-primary"></i>
                            </div>
                            <div class="transaction-details">
                                <span class="fw-bold d-block">Penjualan ${item.tipe}</span>
                                <small>${item.nama}</small>
                            </div>
                        </div>
                        <span class="transaction-amount text-dark">${formatCurrency(item.total)}</span>
                    </li>
                `;
            });
        }


        /**
         * Render semua data Master Data ke halamannya masing-masing
         */
        function renderAllMasterData() {
            renderAkunLists(initialMasterData.akun);
            renderKategoriList(initialMasterData.kategori);
            renderProdukList(initialMasterData.produk);
            renderJenisTransaksiList(initialMasterData.jenisTransaksi);
            renderPenggunaList(initialMasterData.pengguna);
        }

        /**
         * Render semua data Riwayat ke halamannya masing-masing
         */
        function renderAllHistoryPages() {
            renderSalesHistory(initialHistoryData.penjualan);
            renderTransactionHistory(initialHistoryData.transaksi);
            renderDebtHistory(initialHistoryData.hutang);
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
            
            const header = tableContainer.querySelector('.product-table-header');
            tableContainer.innerHTML = ''; 
            if (header) {
                tableContainer.appendChild(header); 
            }
            
            let totalAsset = 0;
            
            const dropdown = document.getElementById('produkNama');
            if (dropdown) {
                // Simpan placeholder
                const placeholder = dropdown.querySelector('option[value=""]');
                dropdown.innerHTML = '';
                if(placeholder) dropdown.appendChild(placeholder);

                produkData.forEach(item => {
                    // DIUBAH: Menambahkan data-id untuk dropdown
                    dropdown.innerHTML += `<option value="${item.nama}" data-id="${item.id}">${item.nama}</option>`;
                });
            } else {
                console.error("Elemen 'produkNama' (dropdown) tidak ditemukan.");
            }

            produkData.forEach(item => {
                totalAsset += (item.modal * item.stok);
                tableContainer.innerHTML += `
                    <div class="row product-table-row mx-0">
                        <div class="col-md-3 fw-bold product-table-row-flex">${item.nama}</div>
                        <div class="col-md-2 product-table-row-flex justify-content-end">${formatCurrency(item.modal)}</div>
                        <div class="col-md-2 product-table-row-flex justify-content-end">${formatCurrency(item.jual)}</div>
                        <div class="col-md-2 product-table-row-flex justify-content-end">${item.stok}</div>
                        <div class="col-md-3 product-table-row-flex justify-content-center">
                            <!-- DIPERBAIKI: Menggunakan <button> dan data-id -->
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

            kategoriData.forEach((namaKategori, index) => {
                const itemId = index; 
                
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
            
            jenisData.forEach((namaJenis, index) => {
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
            
            penggunaData.forEach((namaPengguna, index) => {
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
        function renderSalesHistory(historyData) {
            const listContainer = document.getElementById('sales-list-container');
            if (!listContainer) return;
            
            listContainer.innerHTML = '';

            const groupedByDate = historyData.reduce((acc, item) => {
                const date = formatFullDate(item.tanggal);
                if (!acc[date]) acc[date] = [];
                acc[date].push(item);
                return acc;
            }, {});

            // Urutkan tanggal dari yang terbaru
            const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

            if(sortedDates.length === 0) {
                 listContainer.innerHTML = `<div class="text-center p-4 text-muted">Belum ada penjualan.</div>`;
                 return;
            }

            for (const date of sortedDates) {
                listContainer.innerHTML += `<h6 class="transaction-date-separator">${date}</h6>`;
                
                // Urutkan transaksi di dalam tanggal tersebut
                const sortedTransactions = groupedByDate[date].sort((a, b) => new Date(`${b.tanggal}T${b.waktu}`) - new Date(`${a.tanggal}T${a.waktu}`));

                sortedTransactions.forEach(item => {
                    let iconHtml = '';
                    if (item.tipe === 'Produk') {
                        iconHtml = `<div class="sales-icon bg-primary-subtle text-primary"><i class="bi bi-tag-fill"></i></div>`;
                    } else if (item.tipe === 'Jasa') {
                        iconHtml = `<div class="sales-icon bg-success-subtle text-success"><i class="bi bi-tools"></i></div>`;
                    } else { // Aplikasi
                        iconHtml = `<div class="sales-icon bg-warning-subtle text-warning"><i class="bi bi-grid-fill"></i></div>`;
                    }
                    
                    listContainer.innerHTML += `
                        <div class="card shadow-sm sales-history-row-card mb-2">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-3 d-flex align-items-center">
                                        ${iconHtml}
                                        <div class="sales-info">
                                            <span class="fw-bold d-block text-${item.color}">${item.tipe}</span>
                                            <span class="time">${item.waktu} WIB</span>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="sales-details">
                                            <span class="fw-bold d-block">${item.nama}</span>
                                            <span class="sub-info">Kuantitas: ${item.kuantitas}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="sales-details">
                                            <span class="d-block">Modal: ${formatCurrency(item.modal * item.kuantitas)}</span>
                                            <span class="sub-info">Laba: ${formatCurrency(item.laba)}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-2 text-end">
                                        <span class="sales-total text-dark">${formatCurrency(item.total)}</span>
                                    </div>
                                    <div class="col-md-2 text-center">
                                        <div>
                                            <!-- DIPERBAIKI: Menambahkan data-bs-toggle dkk. -->
                                            <button class="action-link-edit me-2" 
                                                    data-bs-toggle="modal" 
                                                    data-bs-target="#kasirModal"
                                                    data-action="edit"
                                                    data-id="${item.id}">Edit</button>
                                            <button class="action-link-delete" 
                                                    onclick="showDeleteConfirmation('penjualan', ${item.id})">Hapus</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
        }
        
        /**
         * Render daftar di Halaman Transaksi
         */
        function renderTransactionHistory(historyData) {
            const listContainer = document.getElementById('transaction-list-container');
            if (!listContainer) return;
            listContainer.innerHTML = '';
            
            const groupedByDate = historyData.reduce((acc, item) => {
                const date = formatFullDate(item.tanggal);
                if (!acc[date]) acc[date] = [];
                acc[date].push(item);
                return acc;
            }, {});

            const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));
            
            if(sortedDates.length === 0) {
                 listContainer.innerHTML = `<div class="text-center p-4 text-muted">Belum ada transaksi.</div>`;
                 return;
            }

            for (const date of sortedDates) {
                listContainer.innerHTML += `<h6 class="transaction-date-separator">${date}</h6>`;
                
                const sortedTransactions = groupedByDate[date].sort((a, b) => new Date(`${b.tanggal}T${b.waktu}`) - new Date(`${a.tanggal}T${a.waktu}`));

                sortedTransactions.forEach(item => {
                    const totalColor = (item.tipe === 'Pendapatan' || (item.tipe === 'TRX' && item.fee > 0)) ? 'text-success' : 'text-danger';
                    const totalAmount = (item.tipe === 'TRX') ? item.fee : item.total; // Tampilkan fee jika TRX
                    
                    listContainer.innerHTML += `
                        <div class="card shadow-sm transaction-row-card mb-2">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-3">
                                        <div class="d-flex align-items-center">
                                            <div class="transaction-icon bg-${item.color}-subtle text-${item.color}">
                                                <i class="bi ${item.icon}"></i>
                                            </div>
                                            <div class="transaction-info">
                                                <span class="fw-bold d-block">${item.jenis}</span>
                                                <span class="time">${item.waktu} WIB</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="transaction-details">
                                            <span class="fw-bold d-block">${item.rincian}</span>
                                            <span class="catatan">${item.catatan}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="transaction-details">
                                            <span class="d-block">${item.kategori}</span>
                                            ${item.tipe === 'TRX' ? `<span class="catatan">Modal: ${formatCurrency(item.total)}</span>` : ''}
                                        </div>
                                    </div>
                                    <div class="col-md-2 text-end">
                                        <span class="transaction-total ${totalColor}">${formatCurrency(totalAmount)}</span>
                                    </div>
                                    <div class="col-md-2 text-center">
                                        <div>
                                            <button class="action-link-edit me-2" 
                                                    data-bs-toggle="modal" 
                                                    data-bs-target="#transaksiModal"
                                                    data-action="edit"
                                                    data-id="${item.id}">Edit</button>
                                            <button class="action-link-delete" 
                                                    onclick="showDeleteConfirmation('transaksi', ${item.id})">Hapus</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
        }
        
        /**
         * Render daftar di Halaman Hutang
         */
        function renderDebtHistory(historyData) {
            const listContainer = document.getElementById('debt-list-container');
            if (!listContainer) return;
            
            listContainer.innerHTML = '';
            
            const groupedByDate = historyData.reduce((acc, item) => {
                const date = formatFullDate(item.tanggal);
                if (!acc[date]) acc[date] = [];
                acc[date].push(item);
                return acc;
            }, {});

            const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

            if(sortedDates.length === 0) {
                 listContainer.innerHTML = `<div class="text-center p-4 text-muted">Belum ada hutang/piutang.</div>`;
                 return;
            }
            
            for (const date of sortedDates) {
                listContainer.innerHTML += `<h6 class="transaction-date-separator">${date}</h6>`;
                
                const sortedTransactions = groupedByDate[date].sort((a, b) => new Date(`${b.tanggal}T${b.waktu}`) - new Date(`${a.tanggal}T${a.waktu}`));

                for(const item of sortedTransactions) {
                    const lunasClass = item.lunas ? 'lunas' : '';
                    const lunasBadge = item.lunas ? '<span class="badge bg-secondary lunas-badge ms-2">LUNAS</span>' : '';
                    
                    listContainer.innerHTML += `
                        <div class="card shadow-sm debt-piutang-row-card mb-2 ${lunasClass}">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-3">
                                        <div class="d-flex align-items-center">
                                            <div class="debt-icon bg-${item.color}-subtle text-${item.color}">
                                                <i class="bi ${item.icon}"></i>
                                            </div>
                                            <div class="person-info">
                                                <span class="fw-bold d-block">${item.pihak} ${lunasBadge}</span>
                                                <span class="time">${item.waktu}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="rincian-details">
                                            <span class="fw-bold d-block">Sisa: ${formatCurrency(item.sisa)}</span>
                                            <span class="total-sisa">dari total ${formatCurrency(item.total)}</span>
                                        </div>
                                    </div>
                                    <!-- DIPERBAIKI: Menampilkan Catatan -->
                                    <div class="col-md-2">
                                        <span class="d-block text-muted" style="font-size: 0.85rem;">${item.catatan || '-'}</span>
                                    </div>
                                    <div class="col-md-2 text-end">
                                        <span class="jumlah-total text-${item.color}">${formatCurrency(item.jumlah)}</span>
                                    </div>
                                    <div class="col-md-2 text-center">
                                        <div>
                                            <button class="action-link-edit me-2"
                                                    data-bs-toggle="modal" 
                                                    data-bs-target="#hutangModal"
                                                    data-action="edit"
                                                    data-id="${item.id}">Edit</button>
                                            <button class="action-link-delete" 
                                                    onclick="showDeleteConfirmation('hutang', ${item.id})">Hapus</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                };
            }
        }
        
        /**
         * Inisialisasi semua grafik
         */
        function initCharts() {
            // Grafik 1: Laba vs Pengeluaran
            const ctxLaba = document.getElementById('labaPengeluaranChart');
            if (ctxLaba) {
                labaPengeluaranChartInstance = new Chart(ctxLaba, {
                    type: 'bar',
                    data: {
                        labels: ['Laba Bersih', 'Pengeluaran Rumah'],
                        datasets: [{
                            label: 'Total',
                            data: [0, 0], // Akan diisi oleh renderDashboardAnalytics
                            backgroundColor: [
                                'rgba(13, 110, 253, 0.7)', // Primary blue
                                'rgba(25, 135, 84, 0.7)'  // Success green
                            ],
                            borderColor: [
                                'rgba(13, 110, 253, 1)',
                                'rgba(25, 135, 84, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
            
            // Grafik 2: Penjualan
            const ctxPenjualan = document.getElementById('penjualanChart');
            if (ctxPenjualan) {
                penjualanChartInstance = new Chart(ctxPenjualan, {
                    type: 'line',
                    data: {
                        labels: [], // Diisi oleh renderDashboardAnalytics
                        datasets: [{
                            label: 'Total Penjualan',
                            data: [], // Diisi oleh renderDashboardAnalytics
                            fill: true,
                            backgroundColor: 'rgba(13, 110, 253, 0.2)',
                            borderColor: 'rgba(13, 110, 253, 1)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
        }


        // =============================================
        // FUNGSI MODAL DAN FORM HANDLING
        // =============================================
        
        /**
         * Mengatur tanggal di modal menjadi hari ini
         */
        function setModalDates() {
            const today = getTodayDateString();
            document.querySelectorAll('input[type="date"]').forEach(input => {
                input.value = today;
            });
        }
        
        /**
         * Mereset formulir di Modal Kasir
         */
        function resetKasirForm() {
            document.getElementById('form-produk').reset();
            document.getElementById('form-jasa').reset();
            document.getElementById('form-aplikasi').reset();
            
            document.getElementById('produk-id-edit').value = '';
            document.getElementById('jasa-id-edit').value = '';
            document.getElementById('aplikasi-id-edit').value = '';

            document.getElementById('produkKuantitas').value = "1";
            
            setModalDates();

            // Selalu kembali ke tab pertama
            const produkTab = document.getElementById('produk-tab');
            if(produkTab) bootstrap.Tab.getOrCreateInstance(produkTab).show();
            
            // Mengatur ulang judul modal
            const modalTitle = document.getElementById('kasirModalLabel');
            const modalButton = document.getElementById('simpan-penjualan-btn');
            if(modalTitle) modalTitle.textContent = "Buat Penjualan Baru";
            if(modalButton) modalButton.textContent = "Simpan Penjualan";
        }
        
        /**
         * Mereset formulir di Modal Transaksi
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

            setModalDates();

            const pendapatanTab = document.getElementById('pendapatan-tab');
            if(pendapatanTab) bootstrap.Tab.getOrCreateInstance(pendapatanTab).show();
            
            const modalTitle = document.getElementById('transaksiModalLabel');
            const modalButton = document.getElementById('simpan-transaksi-btn');
            if(modalTitle) modalTitle.textContent = "Buat Transaksi Keuangan Baru";
            if(modalButton) modalButton.textContent = "Simpan Transaksi";
        }
        
        /**
         * Mereset formulir di Modal Hutang/Piutang
         */
        function resetHutangForm() {
            document.getElementById('form-piutang').reset();
            document.getElementById('form-hutang').reset();
            
            document.getElementById('piutang-id-edit').value = '';
            document.getElementById('hutang-id-edit').value = '';
            
            setModalDates();

            const piutangTab = document.getElementById('piutang-tab');
            if(piutangTab) bootstrap.Tab.getOrCreateInstance(piutangTab).show();
            
            const modalTitle = document.getElementById('hutangModalLabel');
            const modalButton = document.getElementById('simpan-hutang-btn');
            if(modalTitle) modalTitle.textContent = "Tambah Hutang/Piutang Baru";
            if(modalButton) modalButton.textContent = "Simpan";
        }
        
        /**
         * Mereset formulir di Modal Master Data
         */
        function resetMasterDataForm() {
            document.getElementById('form-master-data').reset();
            
            // Sembunyikan semua field
            document.querySelectorAll('.master-data-field').forEach(field => {
                field.style.display = 'none';
            });
            
            document.getElementById('masterDataType').value = '';
            document.getElementById('masterDataId').value = '';
        }

        /**
         * Menampilkan Modal Konfirmasi Hapus (BARU)
         */
        function showDeleteConfirmation(type, id) {
            itemUntukDihapus = { type, id };
            
            // Menyiapkan teks modal
            let itemText = `item #${id}`;
            let dataArray = (initialHistoryData.hasOwnProperty(type)) ? initialHistoryData[type] : initialMasterData[type];
            
            if (dataArray) {
                 if (type === 'produk' || type === 'akun' || type === 'penjualan' || type === 'transaksi' || type === 'hutang') {
                    const item = dataArray.find(i => i.id == id);
                    if (item) {
                        itemText = `"${item.nama || item.pihak || item.jenis || 'Item'}"`;
                    }
                } else { // Array sederhana (kategori, dll)
                    itemText = `"${dataArray[id]}"`;
                }
            }
            
            const modalBody = document.getElementById('konfirmasiHapusModalBody');
            if(modalBody) modalBody.textContent = `Anda yakin ingin menghapus ${itemText}? Tindakan ini tidak dapat dibatalkan.`;
            
            // Menampilkan modal
            if(konfirmasiHapusModal) konfirmasiHapusModal.show();
        }

        /**
         * Logika Hapus Item (DIPERBARUI)
         * Sekarang memindahkan item ke globalDeletionHistory
         */
        function deleteItem() {
            if (!itemUntukDihapus.type || itemUntukDihapus.id === null) return;

            const { type, id } = itemUntukDihapus;
            
            try {
                let dataArray, itemIndex;
                
                // Cek apakah data ada di riwayat atau master data
                if (initialHistoryData.hasOwnProperty(type)) {
                    dataArray = initialHistoryData[type];
                    itemIndex = dataArray.findIndex(item => item.id == id);
                } else if (initialMasterData.hasOwnProperty(type)) {
                    dataArray = initialMasterData[type];
                    if (type === 'produk' || type === 'akun') {
                        itemIndex = dataArray.findIndex(item => item.id == id);
                    } else {
                        itemIndex = id; // Untuk Kategori, Jenis, Pengguna (berbasis index)
                    }
                }

                if (itemIndex > -1) {
                    // DIPERBAIKI: Bukan menghapus, tapi memindahkan
                    const [deletedItem] = dataArray.splice(itemIndex, 1);
                    
                    if (deletedItem) {
                        // BARU: Buat entri riwayat hapus
                        const historyEntry = {
                            originalType: type,
                            deletedItem: deletedItem,
                            deletedTimestamp: new Date().toISOString()
                        };
                        // BARU: Tambahkan ke array riwayat hapus (di paling atas)
                        globalDeletionHistory.unshift(historyEntry);
                    }
                    
                    // Render ulang list yang relevan
                    switch (type) {
                        case 'produk':
                            renderProdukList(dataArray);
                            break;
                        case 'akun':
                            renderAkunLists(dataArray);
                            break;
                        case 'kategori':
                            renderKategoriList(dataArray);
                            break;
                        case 'jenisTransaksi':
                            renderJenisTransaksiList(dataArray);
                            break;
                        case 'pengguna':
                            renderPenggunaList(dataArray);
                            break;
                        case 'penjualan':
                            renderSalesHistory(dataArray);
                            break;
                        case 'transaksi':
                            renderTransactionHistory(dataArray);
                            break;
                        case 'hutang':
                            renderDebtHistory(dataArray);
                            break;
                    }
                    
                    // Jika yang dihapus adalah data riwayat, update juga dashboard
                    if (initialHistoryData.hasOwnProperty(type)) {
                         renderDashboardAnalytics();
                    }
                    // Jika yang dihapus adalah master data, update juga semua list master data
                    if (initialMasterData.hasOwnProperty(type)) {
                         renderAllMasterData();
                    }

                } else {
                    alert('Error: Item tidak ditemukan.');
                }
            } catch (error) {
                console.error(`Error saat menghapus item ${type}:`, error);
                alert('Terjadi kesalahan saat menghapus.');
            } finally {
                // Sembunyikan modal dan reset
                if(konfirmasiHapusModal) konfirmasiHapusModal.hide();
                itemUntukDihapus = { type: null, id: null };
            }
        }
        
        /**
         * BARU: Render daftar di Modal Riwayat Hapus
         */
        function renderDeletionHistory() {
            const listContainer = document.getElementById('riwayat-hapus-list-container');
            if (!listContainer) return;
            
            listContainer.innerHTML = '';

            if (globalDeletionHistory.length === 0) {
                listContainer.innerHTML = `
                    <li class="list-group-item d-flex justify-content-center p-4">
                        <span class="text-muted">Riwayat hapus kosong.</span>
                    </li>`;
                return;
            }

            globalDeletionHistory.forEach((entry, index) => {
                const { originalType, deletedItem, deletedTimestamp } = entry;
                
                // Mendapatkan nama item (bisa objek atau string)
                let itemName = '[Data Tidak Dikenali]';
                if (typeof deletedItem === 'object' && deletedItem !== null) {
                    itemName = deletedItem.nama || deletedItem.pihak || deletedItem.rincian || `Item Tipe ${originalType}`;
                } else if (typeof deletedItem === 'string') {
                    itemName = deletedItem;
                }
                
                // Format tanggal
                const deletedDate = new Date(deletedTimestamp).toLocaleString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric', 
                    hour: '2-digit', minute: '2-digit'
                });

                listContainer.innerHTML += `
                    <li class="list-group-item">
                        <div class="deleted-item-info">
                            <div>
                                <span class="deleted-item-name">${itemName}</span>
                                <span class="deleted-item-type">${originalType}</span>
                            </div>
                            <span class="deleted-item-timestamp">Dihapus: ${deletedDate}</span>
                        </div>
                        <button class="btn btn-sm btn-success btn-restore" onclick="restoreItem(${index})">
                            <i class="bi bi-arrow-counterclockwise me-1"></i> Pulihkan
                        </button>
                    </li>
                `;
            });
        }

        /**
         * BARU: Logika untuk memulihkan item
         */
        function restoreItem(historyIndex) {
            if (historyIndex < 0 || historyIndex >= globalDeletionHistory.length) {
                console.error('Index riwayat hapus tidak valid');
                return;
            }
            
            try {
                // 1. Ambil & hapus item dari riwayat hapus
                const [restoredEntry] = globalDeletionHistory.splice(historyIndex, 1);
                const { originalType, deletedItem } = restoredEntry;

                // 2. Tentukan array tujuan
                let targetArray;
                if (initialHistoryData.hasOwnProperty(originalType)) {
                    targetArray = initialHistoryData[originalType];
                } else if (initialMasterData.hasOwnProperty(originalType)) {
                    targetArray = initialMasterData[originalType];
                } else {
                    throw new Error(`Tipe data asli '${originalType}' tidak ditemukan.`);
                }
                
                // 3. Kembalikan item ke array aslinya
                if (Array.isArray(targetArray)) {
                    // Jika riwayat (transaksi, penjualan, hutang), tambahkan ke atas (unshift)
                    if (initialHistoryData.hasOwnProperty(originalType)) {
                        targetArray.unshift(deletedItem);
                    } else {
                        // Jika master data, tambahkan ke akhir (push)
                        targetArray.push(deletedItem);
                    }
                }

                // 4. Render ulang seluruh aplikasi
                renderAllMasterData();
                renderAllHistoryPages();
                renderDashboardAnalytics();
                
                // 5. Render ulang modal riwayat hapus
                renderDeletionHistory();
                
            } catch (error) {
                console.error('Gagal memulihkan item:', error);
                alert('Terjadi kesalahan saat memulihkan item.');
            }
        }
        
        
        // =============================================
        // LOGIKA SIMPAN (Create / Update)
        // =============================================

        function prosesPenjualanProduk() {
            try {
                const id = document.getElementById('produk-id-edit').value;
                const tanggal = document.getElementById('produkTanggal').value;
                const nama = document.getElementById('produkNama').value;
                const kuantitas = parseInt(document.getElementById('produkKuantitas').value) || 0;

                if (nama === "") {
                    alert('Silakan pilih produk terlebih dahulu.');
                    return false; 
                }
                if (kuantitas <= 0) {
                    alert('Kuantitas harus lebih dari 0.');
                    return false; 
                }

                const produkData = initialMasterData.produk.find(p => p.nama === nama);
                if (!produkData) {
                    alert('Data produk tidak ditemukan.');
                    return false; 
                }

                const modal = produkData.modal;
                const jual = produkData.jual;
                const laba = (jual - modal) * kuantitas;
                const total = jual * kuantitas;
                
                if (id) { // Mode Edit
                    const index = initialHistoryData.penjualan.findIndex(s => s.id == id);
                    if (index === -1) throw new Error("ID Penjualan tidak ditemukan");
                    
                    initialHistoryData.penjualan[index] = {
                        ...initialHistoryData.penjualan[index], // pertahankan waktu, tipe, color
                        tanggal: tanggal,
                        nama: nama,
                        kuantitas: kuantitas,
                        modal: modal, 
                        laba: laba, 
                        total: total, 
                        produkId: produkData.id, 
                        dariAkun: null, 
                        hargaJual: jual
                    };
                } else { // Mode Tambah
                    const newSale = {
                        id: (initialHistoryData.penjualan.length > 0) ? Math.max(...initialHistoryData.penjualan.map(i => i.id)) + 1 : 1,
                        tanggal: tanggal,
                        waktu: getWaktuSekarang(),
                        tipe: "Produk",
                        nama: nama,
                        kuantitas: kuantitas,
                        modal: modal, 
                        laba: laba, 
                        total: total, 
                        color: "primary",
                        produkId: produkData.id, 
                        dariAkun: null, 
                        hargaJual: jual
                    };
                    initialHistoryData.penjualan.unshift(newSale);
                }
                return true; 

            } catch (error) {
                console.error("Error di prosesPenjualanProduk:", error);
                alert("Terjadi kesalahan saat memproses penjualan produk.");
                return false;
            }
        }
        function prosesPenjualanJasa() {
             try {
                const id = document.getElementById('jasa-id-edit').value;
                const tanggal = document.getElementById('jasaTanggal').value;
                const nama = document.getElementById('jasaNama').value;
                const modal = parseInt(document.getElementById('jasaModal').value) || 0;
                const jual = parseInt(document.getElementById('jasaJual').value) || 0;

                if (!nama) {
                    alert('Nama jasa tidak boleh kosong.');
                    return false; 
                }

                const laba = jual - modal;
                const total = jual;

                if (id) { // Mode Edit
                    const index = initialHistoryData.penjualan.findIndex(s => s.id == id);
                    if (index === -1) throw new Error("ID Penjualan tidak ditemukan");
                    
                    initialHistoryData.penjualan[index] = {
                        ...initialHistoryData.penjualan[index],
                        tanggal: tanggal,
                        nama: nama,
                        kuantitas: 1,
                        modal: modal,
                        laba: laba,
                        total: total,
                        hargaJual: jual
                    };
                } else { // Mode Tambah
                    const newSale = {
                        id: (initialHistoryData.penjualan.length > 0) ? Math.max(...initialHistoryData.penjualan.map(i => i.id)) + 1 : 1,
                        tanggal: tanggal,
                        waktu: getWaktuSekarang(),
                        tipe: "Jasa",
                        nama: nama,
                        kuantitas: 1,
                        modal: modal,
                        laba: laba,
                        total: total,
                        color: "success",
                        produkId: null, 
                        dariAkun: null, 
                        hargaJual: jual
                    };
                    initialHistoryData.penjualan.unshift(newSale);
                }
                return true; 

            } catch (error) {
                console.error("Error di prosesPenjualanJasa:", error);
                alert("Terjadi kesalahan saat memproses penjualan jasa.");
                return false;
            }
        }
        function prosesPenjualanAplikasi() {
            try {
                const id = document.getElementById('aplikasi-id-edit').value;
                const tanggal = document.getElementById('aplikasiTanggal').value;
                const nama = document.getElementById('aplikasiSumber').value; // Ini adalah nama akun
                const modal = parseInt(document.getElementById('aplikasiNominal').value) || 0;
                const jual = parseInt(document.getElementById('aplikasiJual').value) || 0;

                if (nama === "") {
                    alert('Silakan pilih sumber akun terlebih dahulu.');
                    return false; 
                }

                const laba = jual - modal;
                const total = jual;

                if(id) { // Mode Edit
                    const index = initialHistoryData.penjualan.findIndex(s => s.id == id);
                    if (index === -1) throw new Error("ID Penjualan tidak ditemukan");
                    
                    initialHistoryData.penjualan[index] = {
                        ...initialHistoryData.penjualan[index],
                        tanggal: tanggal,
                        nama: nama,
                        kuantitas: 1,
                        modal: modal,
                        laba: laba,
                        total: total,
                        dariAkun: nama, 
                        hargaJual: jual
                    };
                } else { // Mode Tambah
                    const newSale = {
                        id: (initialHistoryData.penjualan.length > 0) ? Math.max(...initialHistoryData.penjualan.map(i => i.id)) + 1 : 1,
                        tanggal: tanggal,
                        waktu: getWaktuSekarang(),
                        tipe: "Aplikasi",
                        nama: nama,
                        kuantitas: 1,
                        modal: modal,
                        laba: laba,
                        total: total,
                        color: "warning",
                        produkId: null, 
                        dariAkun: nama, 
                        hargaJual: jual
                    };
                    initialHistoryData.penjualan.unshift(newSale);
                }
                return true; 

            } catch (error) {
                console.error("Error di prosesPenjualanAplikasi:", error);
                alert("Terjadi kesalahan saat memproses penjualan aplikasi.");
                return false;
            }
        }
        function handleSimpanPenjualan() {
            const activeTabEl = document.querySelector('#salesTab .nav-link.active');
            if (!activeTabEl) return; 
            
            const activeTab = activeTabEl.id;
            let sukses = false;
            
            try {
                switch (activeTab) {
                    case 'produk-tab':
                        sukses = prosesPenjualanProduk();
                        break;
                    case 'jasa-tab':
                        sukses = prosesPenjualanJasa();
                        break;
                    case 'aplikasi-tab':
                        sukses = prosesPenjualanAplikasi();
                        break;
                }
                
                if (sukses) {
                    renderSalesHistory(initialHistoryData.penjualan);
                    renderDashboardAnalytics(); // Update dashboard
                    if (kasirModal) kasirModal.hide();
                }
            } catch (error) {
                console.error("Error di handleSimpanPenjualan:", error);
                alert("Terjadi kesalahan.");
            }
        }

        function prosesPendapatan() {
             try {
                const id = document.getElementById('pendapatan-id-edit').value;
                const tanggal = document.getElementById('pendapatanTanggal').value;
                const keAkun = document.getElementById('pendapatanKeAkun').value;
                const kategori = document.getElementById('pendapatanKategori').value;
                const nominal = parseInt(document.getElementById('pendapatanNominal').value) || 0;
                const catatan = document.getElementById('pendapatanCatatan').value;

                if (keAkun === "" || kategori === "") {
                    alert('Akun dan Kategori harus dipilih.');
                    return false; 
                }
                if (nominal <= 0) {
                    alert('Nominal harus lebih dari 0.');
                    return false; 
                }
                
                if(id) { // Mode Edit
                    const index = initialHistoryData.transaksi.findIndex(t => t.id == id);
                    if (index === -1) throw new Error("ID Transaksi tidak ditemukan");
                    
                    initialHistoryData.transaksi[index] = {
                        ...initialHistoryData.transaksi[index],
                        tanggal: tanggal,
                        jenis: kategori, // Jenis diambil dari Kategori
                        rincian: `Masuk ke ${keAkun}`,
                        catatan: catatan,
                        kategori: kategori,
                        keAkun: keAkun,
                        total: nominal,
                        fee: 0,
                        dariAkun: null,
                        tipe: "Pendapatan",
                        icon: "bi-arrow-down-circle-fill",
                        color: "success"
                    };
                } else { // Mode Tambah
                    const newTransaction = {
                        id: (initialHistoryData.transaksi.length > 0) ? Math.max(...initialHistoryData.transaksi.map(i => i.id)) + 1 : 1,
                        tanggal: tanggal,
                        waktu: getWaktuSekarang(),
                        tipe: "Pendapatan", 
                        jenis: kategori, 
                        icon: "bi-arrow-down-circle-fill", 
                        color: "success", 
                        rincian: `Masuk ke ${keAkun}`,
                        catatan: catatan || "Pendapatan",
                        kategori: kategori,
                        dariAkun: null, 
                        keAkun: keAkun, 
                        fee: 0, 
                        total: nominal
                    };
                    initialHistoryData.transaksi.unshift(newTransaction);
                }
                return true; 

            } catch (error) {
                console.error("Error di prosesPendapatan:", error);
                alert("Terjadi kesalahan saat memproses pendapatan.");
                return false; 
            }
        }
        
        function prosesPengeluaran() {
             try {
                const id = document.getElementById('pengeluaran-id-edit').value;
                const tanggal = document.getElementById('pengeluaranTanggal').value;
                const dariAkun = document.getElementById('pengeluaranDariAkun').value;
                const kategori = document.getElementById('pengeluaranKategori').value;
                const nominal = parseInt(document.getElementById('pengeluaranNominal').value) || 0;
                const catatan = document.getElementById('pengeluaranCatatan').value;

                if (dariAkun === "" || kategori === "") {
                    alert('Akun dan Kategori harus dipilih.');
                    return false; 
                }
                if (nominal <= 0) {
                    alert('Nominal harus lebih dari 0.');
                    return false; 
                }
                
                if(id) { // Mode Edit
                    const index = initialHistoryData.transaksi.findIndex(t => t.id == id);
                    if (index === -1) throw new Error("ID Transaksi tidak ditemukan");
                    
                    initialHistoryData.transaksi[index] = {
                        ...initialHistoryData.transaksi[index],
                        tanggal: tanggal,
                        jenis: kategori,
                        rincian: `Keluar dari ${dariAkun}`,
                        catatan: catatan,
                        kategori: kategori,
                        dariAkun: dariAkun,
                        total: nominal,
                        fee: 0,
                        keAkun: null,
                        tipe: "Pengeluaran",
                        icon: "bi-arrow-up-circle-fill",
                        color: "danger"
                    };
                } else { // Mode Tambah
                    const newTransaction = {
                        id: (initialHistoryData.transaksi.length > 0) ? Math.max(...initialHistoryData.transaksi.map(i => i.id)) + 1 : 1,
                        tanggal: tanggal,
                        waktu: getWaktuSekarang(),
                        tipe: "Pengeluaran", 
                        jenis: kategori, 
                        icon: "bi-arrow-up-circle-fill", 
                        color: "danger", 
                        rincian: `Keluar dari ${dariAkun}`,
                        catatan: catatan || "Pengeluaran",
                        kategori: kategori,
                        dariAkun: dariAkun, 
                        keAkun: null, 
                        fee: 0, 
                        total: nominal
                    };
                    initialHistoryData.transaksi.unshift(newTransaction);
                }
                return true; 

            } catch (error) {
                console.error("Error di prosesPengeluaran:", error);
                alert("Terjadi kesalahan saat memproses pengeluaran.");
                return false; 
            }
        } 
        
        // DIPERBAIKI: Logika prosesTransfer
        function prosesTransfer() {
             try {
                const id = document.getElementById('transfer-id-edit').value;
                const tanggal = document.getElementById('transferTanggal').value;
                const dariAkun = document.getElementById('transferDariAkun').value;
                const keAkun = document.getElementById('transferKeAkun').value;
                const kategori = document.getElementById('transferKategori').value;
                const nominal = parseInt(document.getElementById('transferNominal').value) || 0;
                const catatan = document.getElementById('transferCatatan').value;

                if (dariAkun === "" || keAkun === "" || kategori === "") {
                    alert('Semua Akun dan Kategori harus dipilih.');
                    return false; 
                }
                 if (dariAkun === keAkun) {
                    alert('Akun Sumber dan Tujuan tidak boleh sama.');
                    return false;
                }
                if (nominal <= 0) {
                    alert('Nominal harus lebih dari 0.');
                    return false; 
                }
                
                if(id) { // Mode Edit
                    const index = initialHistoryData.transaksi.findIndex(t => t.id == id);
                    if (index === -1) throw new Error("ID Transaksi tidak ditemukan");
                    
                    initialHistoryData.transaksi[index] = {
                        ...initialHistoryData.transaksi[index],
                        tanggal: tanggal,
                        jenis: kategori,
                        rincian: `${dariAkun} -> ${keAkun}`,
                        catatan: catatan,
                        kategori: kategori,
                        dariAkun: dariAkun,
                        keAkun: keAkun,
                        total: nominal,
                        fee: 0,
                        tipe: "Transfer",
                        icon: "bi-arrow-left-right",
                        color: "info"
                    };
                } else { // Mode Tambah
                    const newTransaction = {
                        id: (initialHistoryData.transaksi.length > 0) ? Math.max(...initialHistoryData.transaksi.map(i => i.id)) + 1 : 1,
                        tanggal: tanggal,
                        waktu: getWaktuSekarang(),
                        tipe: "Transfer", 
                        jenis: kategori, 
                        icon: "bi-arrow-left-right", 
                        color: "info", 
                        rincian: `${dariAkun} -> ${keAkun}`,
                        catatan: catatan || "Transfer",
                        kategori: kategori,
                        dariAkun: dariAkun, 
                        keAkun: keAkun, 
                        fee: 0, 
                        total: nominal
                    };
                    initialHistoryData.transaksi.unshift(newTransaction);
                }
                return true; 

            } catch (error) {
                console.error("Error di prosesTransfer:", error);
                alert("Terjadi kesalahan saat memproses transfer.");
                return false; 
            }
        } 
        
        // DIPERBAIKI: Logika prosesTRX
        function prosesTRX() {
             try {
                const id = document.getElementById('trx-id-edit').value;
                const tanggal = document.getElementById('trxTanggal').value;
                const dariAkun = document.getElementById('trxDariAkun').value;
                const keAkun = document.getElementById('trxKeAkun').value;
                const kategori = document.getElementById('trxKategori').value;
                const nominal = parseInt(document.getElementById('trxNominal').value) || 0;
                const fee = parseInt(document.getElementById('trxFee').value) || 0;
                const catatan = document.getElementById('trxCatatan').value;

                if (dariAkun === "" || keAkun === "" || kategori === "") {
                    alert('Semua Akun dan Kategori harus dipilih.');
                    return false; 
                }
                if (nominal <= 0) {
                    alert('Nominal Modal harus lebih dari 0.');
                    return false; 
                }
                
                if(id) { // Mode Edit
                    const index = initialHistoryData.transaksi.findIndex(t => t.id == id);
                    if (index === -1) throw new Error("ID Transaksi tidak ditemukan");
                    
                    initialHistoryData.transaksi[index] = {
                        ...initialHistoryData.transaksi[index],
                        tanggal: tanggal,
                        jenis: kategori,
                        rincian: `Keluar dari ${dariAkun}`,
                        catatan: catatan,
                        kategori: kategori,
                        dariAkun: dariAkun,
                        keAkun: keAkun,
                        total: nominal,
                        fee: fee,
                        tipe: "TRX",
                        icon: "bi-receipt-cutoff",
                        color: "primary"
                    };
                } else { // Mode Tambah
                    const newTransaction = {
                        id: (initialHistoryData.transaksi.length > 0) ? Math.max(...initialHistoryData.transaksi.map(i => i.id)) + 1 : 1,
                        tanggal: tanggal,
                        waktu: getWaktuSekarang(),
                        tipe: "TRX", 
                        jenis: kategori, 
                        icon: "bi-receipt-cutoff", 
                        color: "primary", 
                        rincian: `Keluar dari ${dariAkun}`,
                        catatan: catatan || "Transaksi TRX",
                        kategori: kategori,
                        dariAkun: dariAkun, 
                        keAkun: keAkun, 
                        fee: fee, 
                        total: nominal
                    };
                    initialHistoryData.transaksi.unshift(newTransaction);
                }
                return true; 

            } catch (error) {
                console.error("Error di prosesTRX:", error);
                alert("Terjadi kesalahan saat memproses TRX.");
                return false; 
            }
        } 
        
        // DIPERBAIKI: Menghapus alert dan memanggil fungsi yang benar
        function handleSimpanTransaksi() {
            const activeTabEl = document.querySelector('#trxTab .nav-link.active');
            if (!activeTabEl) return; 

            const activeTab = activeTabEl.id;
            let sukses = false;
            
            try {
                switch (activeTab) {
                    case 'pendapatan-tab':
                        sukses = prosesPendapatan();
                        break;
                    case 'pengeluaran-tab':
                        sukses = prosesPengeluaran();
                        break;
                    case 'transfer-tab':
                        sukses = prosesTransfer();
                        break;
                    case 'trx-tab':
                        sukses = prosesTRX();
                        break;
                }
                
                if (sukses) {
                    renderTransactionHistory(initialHistoryData.transaksi);
                    renderDashboardAnalytics(); // Update dashboard
                    if(transaksiModal) transaksiModal.hide();
                }
            } catch (error) {
                console.error("Error di handleSimpanTransaksi:", error);
                alert("Terjadi kesalahan.");
            }
        }

        function prosesPiutang() {
            try {
                const id = document.getElementById('piutang-id-edit').value;
                const tanggal = document.getElementById('piutangTanggal').value;
                const pihak = document.getElementById('piutangPihak').value;
                const nominal = parseInt(document.getElementById('piutangNominal').value) || 0;
                // DIPERBAIKI: Mengambil catatan
                const catatan = document.getElementById('piutangCatatan').value;

                if (!pihak) {
                    alert('Nama Pihak (Pelanggan) tidak boleh kosong.');
                    return false;
                }
                if (nominal <= 0) {
                    alert('Nominal harus lebih dari 0.');
                    return false;
                }
                
                if (id) { // Mode Edit
                    const index = initialHistoryData.hutang.findIndex(h => h.id == id);
                    if (index === -1) throw new Error("ID Hutang/Piutang tidak ditemukan");
                    
                    const item = initialHistoryData.hutang[index];
                    item.tanggal = tanggal;
                    item.pihak = pihak;
                    item.jumlah = nominal;
                    item.total = nominal; // Asumsi edit total
                    item.sisa = nominal; // Asumsi edit sisa (logika pembayaran belum ada)
                    item.catatan = catatan; // Menyimpan catatan
                    item.lunas = false; // Asumsi
                    
                } else { // Mode Tambah
                    const newDebt = {
                        id: (initialHistoryData.hutang.length > 0) ? Math.max(...initialHistoryData.hutang.map(i => i.id)) + 1 : 1,
                        tanggal: tanggal,
                        waktu: getWaktuSekarang(),
                        tipe: "Piutang",
                        icon: "bi-arrow-down", 
                        color: "success",
                        pihak: pihak,
                        sisa: nominal, 
                        total: nominal,
                        jumlah: nominal,
                        catatan: catatan || "Piutang", // Menyimpan catatan
                        lunas: false
                    };
                    initialHistoryData.hutang.unshift(newDebt);
                }
                return true; 

            } catch (error) {
                console.error("Error di prosesPiutang:", error);
                alert("Terjadi kesalahan saat memproses piutang.");
                return false;
            }
        }
        function prosesHutang() {
            try {
                const id = document.getElementById('hutang-id-edit').value;
                const tanggal = document.getElementById('hutangTanggal').value;
                const pihak = document.getElementById('hutangPihak').value;
                const nominal = parseInt(document.getElementById('hutangNominal').value) || 0;
                // DIPERBAIKI: Mengambil catatan
                const catatan = document.getElementById('hutangCatatan').value;

                if (!pihak) {
                    alert('Nama Pihak (Supplier) tidak boleh kosong.');
                    return false;
                }
                if (nominal <= 0) {
                    alert('Nominal harus lebih dari 0.');
                    return false;
                }

                if(id) { // Mode Edit
                    const index = initialHistoryData.hutang.findIndex(h => h.id == id);
                    if (index === -1) throw new Error("ID Hutang/Piutang tidak ditemukan");
                    
                    const item = initialHistoryData.hutang[index];
                    item.tanggal = tanggal;
                    item.pihak = pihak;
                    item.jumlah = nominal;
                    item.total = nominal;
                    item.sisa = nominal;
                    item.catatan = catatan; // Menyimpan catatan
                    item.lunas = false;
                    
                } else { // Mode Tambah
                    const newDebt = {
                        id: (initialHistoryData.hutang.length > 0) ? Math.max(...initialHistoryData.hutang.map(i => i.id)) + 1 : 1,
                        tanggal: tanggal,
                        waktu: getWaktuSekarang(),
                        tipe: "Hutang",
                        icon: "bi-arrow-up", 
                        color: "danger",
                        pihak: pihak,
                        sisa: nominal, 
                        total: nominal,
                        jumlah: nominal,
                        catatan: catatan || "Hutang", // Menyimpan catatan
                        lunas: false
                    };
                    initialHistoryData.hutang.unshift(newDebt);
                }
                return true; 

            } catch (error) {
                console.error("Error di prosesHutang:", error);
                alert("Terjadi kesalahan saat memproses hutang.");
                return false;
            }
        }
        function handleSimpanHutang() {
            const activeTabEl = document.querySelector('#hutangTab .nav-link.active');
            if (!activeTabEl) return;
            
            const activeTab = activeTabEl.id;
            let sukses = false;
            
            try {
                switch (activeTab) {
                    case 'piutang-tab':
                        sukses = prosesPiutang();
                        break;
                    case 'hutang-tab':
                        sukses = prosesHutang();
                        break;
                }
                
                if (sukses) {
                    renderDebtHistory(initialHistoryData.hutang);
                    renderDashboardAnalytics(); // Update dashboard
                    if(hutangModal) hutangModal.hide();
                }
            } catch (error) {
                console.error("Error di handleSimpanHutang:", error);
                alert("Terjadi kesalahan.");
            }
        }
        
        function handleSimpanMasterData() {
            try {
                const dataType = document.getElementById('masterDataType').value;
                const id = document.getElementById('masterDataId').value;
                
                let dataArray = initialMasterData[dataType];
                let item;

                if (!dataType) {
                    alert('Error: Tipe data tidak diketahui.');
                    return;
                }

                const nama = document.getElementById('masterNama').value;
                const saldo = parseInt(document.getElementById('masterSaldo').value) || 0;
                const modal = parseInt(document.getElementById('masterModal').value) || 0;
                const jual = parseInt(document.getElementById('masterJual').value) || 0;
                const stok = parseInt(document.getElementById('masterStok').value) || 0;

                if (id) { // Mode Edit
                    if (dataType === 'produk' || dataType === 'akun') {
                        item = dataArray.find(i => i.id == id);
                    } else {
                        item = dataArray[id]; // Edit by index for simple arrays
                    }

                    if (!item) {
                        alert('Error: Item untuk diedit tidak ditemukan.');
                        return;
                    }

                    switch (dataType) {
                        case 'produk':
                            item.nama = nama;
                            item.modal = modal;
                            item.jual = jual;
                            item.stok = stok;
                            renderProdukList(dataArray);
                            break;
                        case 'akun':
                            item.nama = nama;
                            item.saldo = saldo;
                            renderAkunLists(dataArray);
                            break;
                        case 'kategori':
                        case 'jenisTransaksi':
                        case 'pengguna':
                            dataArray[id] = nama; 
                            if (dataType === 'kategori') renderKategoriList(dataArray);
                            if (dataType === 'jenisTransaksi') renderJenisTransaksiList(dataArray);
                            if (dataType === 'pengguna') renderPenggunaList(dataArray);
                            break;
                    }

                } else { // Mode Tambah
                    if (!nama) {
                        alert('Nama tidak boleh kosong.');
                        return;
                    }

                    switch (dataType) {
                        case 'produk':
                            const newIdProd = (dataArray.length > 0) ? Math.max(...dataArray.map(i => i.id)) + 1 : 1;
                            dataArray.push({ id: newIdProd, nama, modal, jual, stok });
                            renderProdukList(dataArray);
                            break;
                        case 'akun':
                            const newIdAkun = (dataArray.length > 0) ? Math.max(...dataArray.map(i => i.id)) + 1 : 1;
                            dataArray.push({ id: newIdAkun, nama, saldo });
                            renderAkunLists(dataArray);
                            break;
                        case 'kategori':
                        case 'jenisTransaksi':
                        case 'pengguna':
                            dataArray.push(nama);
                            if (dataType === 'kategori') renderKategoriList(dataArray);
                            if (dataType === 'jenisTransaksi') renderJenisTransaksiList(dataArray);
                            if (dataType === 'pengguna') renderPenggunaList(dataArray);
                            break;
                    }
                }
                
                // Update semua yang mungkin terpengaruh
                renderAllMasterData();
                renderDashboardAnalytics();
                
                if(masterDataModal) masterDataModal.hide();

            } catch (error) {
                console.error('Error di handleSimpanMasterData:', error);
                alert('Terjadi kesalahan saat menyimpan data.');
            }
        }


        // =============================================
        // LOGIKA IMPORT / EXPORT DATA
        // =============================================
        
        function exportProdukToCSV() {
            try {
                const data = initialMasterData.produk;
                if (!data || data.length === 0) {
                    alert('Tidak ada data produk untuk diexport.');
                    return;
                }

                // DIUBAH: Menghapus header ID
                const headers = "nama,modal,jual,stok";
                
                // DIUBAH: Menghapus kolom ID
                const rows = data.map(row => 
                    [JSON.stringify(row.nama), row.modal, row.jual, row.stok].join(',')
                );
                
                const csvContent = headers + '\n' + rows.join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                
                // Buat link download palsu
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'daftar_produk.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log("Export CSV berhasil.");

            } catch (error) {
                console.error("Error saat export CSV:", error);
                alert("Gagal meng-export data. Lihat konsol untuk detail.");
            }
        }
        
        function importProdukFromCSV(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            
            reader.onload = function(e) {
                const text = e.target.result;
                try {
                    const lines = text.split(/[\r\n]+/).filter(line => line.trim() !== ''); 
                    
                    if (lines.length <= 1) {
                        alert('File CSV kosong atau hanya berisi header.');
                        return;
                    }

                    const headers = lines.shift().split(',').map(h => h.trim());
                    // DIUBAH: Validasi header tanpa ID (nama,modal,jual,stok)
                    if (headers[0] !== 'nama' || headers[1] !== 'modal' || headers[2] !== 'jual' || headers[3] !== 'stok') {
                         alert('Format CSV tidak sesuai. Pastikan header adalah: nama,modal,jual,stok');
                         return;
                    }

                    let maxId = (initialMasterData.produk.length > 0) ? Math.max(...initialMasterData.produk.map(i => i.id)) : 0;
                    
                    const newProduk = lines.map((line, index) => {
                        const values = line.split(',');
                        
                        // ID baru (otomatis)
                        maxId++;
                        const id = maxId;

                        // Parsing data
                        const stok = parseInt(values.pop()) || 0;
                        const jual = parseInt(values.pop()) || 0;
                        const modal = parseInt(values.pop()) || 0;
                        
                        let nama = values.join(',');
                        
                        if (nama.startsWith('"') && nama.endsWith('"')) {
                            nama = nama.substring(1, nama.length - 1);
                        }

                        return { id, nama, modal, jual, stok };
                    });

                    if (!confirm(`Data CSV berhasil dibaca.\n\nAnda akan mengimpor ${newProduk.length} produk. Ini akan MENGGANTI semua data produk yang ada.\n\nLanjutkan?`)) {
                        return;
                    }

                    initialMasterData.produk = newProduk;
                    
                    renderProdukList(initialMasterData.produk); 
                    
                    alert(`Impor berhasil! ${newProduk.length} produk telah dimuat.`);

                } catch (error) {
                    console.error("Error saat import CSV:", error);
                    alert("Gagal mengimpor file. Pastikan format CSV sudah benar.");
                } finally {
                    event.target.value = null;
                }
            };

            reader.onerror = function() {
                alert('Gagal membaca file.');
            };

            reader.readAsText(file);
        }
        
        function exportDataToJSON() {
            try {
                const dataToSave = {
                    master: initialMasterData,
                    history: initialHistoryData,
                    // BARU: Menyimpan riwayat hapus
                    trash: globalDeletionHistory 
                };
                const jsonContent = JSON.stringify(dataToSave, null, 2);
                const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
                
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'backup_data_keuangan.json');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log("Export JSON berhasil.");
            } catch (error) {
                console.error("Error saat export JSON:", error);
                alert("Gagal meng-export data. Lihat konsol untuk detail.");
            }
        }
        
        function importDataFromJSON(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = function(e) {
                const text = e.target.result;
                try {
                    const parsedData = JSON.parse(text);

                    // DIPERBAIKI: Pengecekan menyertakan data opsional 'trash'
                    if (!parsedData.master || !parsedData.history) {
                        alert('Format file JSON tidak valid. Data "master" atau "history" tidak ditemukan.');
                        return;
                    }

                    if (!confirm('Data cadangan berhasil dibaca. Ini akan MENGGANTI SEMUA data saat ini. Lanjutkan?')) {
                        return;
                    }

                    // Muat data baru
                    initialMasterData = parsedData.master;
                    initialHistoryData = parsedData.history;
                    // BARU: Memuat riwayat hapus jika ada, atau reset
                    globalDeletionHistory = parsedData.trash || []; 

                    // Render ulang seluruh aplikasi
                    renderAllMasterData();
                    renderAllHistoryPages();
                    renderDashboardAnalytics();
                    
                    alert('Data berhasil dipulihkan!');

                } catch (error) {
                    console.error("Error saat import JSON:", error);
                    alert("Gagal mengimpor file. Pastikan file JSON tidak rusak.");
                } finally {
                    event.target.value = null;
                }
            };
            
            reader.onerror = function() {
                alert('Gagal membaca file.');
            };

            reader.readAsText(file);
        }


        // =============================================
        // EVENT LISTENER (NAVIGASI & MODAL)
        // =============================================
        
        // DIPERBAIKI: Pindahkan semua listener ke dalam DOMContentLoaded
        document.addEventListener('DOMContentLoaded', function() {
            
            // Inisialisasi semua Modal Bootstrap
            konfirmasiHapusModal = new bootstrap.Modal(document.getElementById('konfirmasiHapusModal'));
            kasirModal = new bootstrap.Modal(document.getElementById('kasirModal'));
            transaksiModal = new bootstrap.Modal(document.getElementById('transaksiModal'));
            hutangModal = new bootstrap.Modal(document.getElementById('hutangModal'));
            masterDataModal = new bootstrap.Modal(document.getElementById('masterDataModal'));
            // DIPERBAIKI: Inisialisasi Offcanvas riwayat hapus
            riwayatHapusModal = new bootstrap.Offcanvas(document.getElementById('riwayatHapusModal'));

            const pageTitle = document.getElementById('page-title');
            const pageContents = document.querySelectorAll('.page-content');
            // DIPERBAIKI: Selector nav bawah dibuat lebih spesifik
            const navLinks = document.querySelectorAll('nav.fixed-bottom .nav-link'); 
            
            // --- Fungsi untuk menampilkan halaman ---
            function showPage(targetPageId, targetTitle) {
                pageContents.forEach(page => {
                    page.classList.remove('active');
                });
                const targetPage = document.getElementById(targetPageId);
                if (targetPage) {
                    targetPage.classList.add('active');
                }
                if(pageTitle) {
                    pageTitle.textContent = targetTitle;
                }
                window.scrollTo(0, 0);
            }

            // --- Logika untuk SEMUA link navigasi (termasuk dropdown & daftar pengaturan) ---
            // DIPERBAIKI: Selector ini sekarang mengumpulkan *semua* tautan navigasi
            const allNavLinks = document.querySelectorAll('[data-page]');
            
            allNavLinks.forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault(); 
                    
                    const hrefAttr = this.getAttribute('href');
                    if (!hrefAttr || hrefAttr === '#') return;
                    
                    const targetPageId = hrefAttr.substring(1); 
                    const targetTitle = this.getAttribute('data-title'); 

                    showPage(targetPageId, targetTitle);

                    // Hanya atur 'active' state jika ini adalah link navigasi bawah
                    // DIPERBAIKI: Pengecekan selector nav bawah yang lebih spesifik
                    if (this.closest('nav.fixed-bottom')) {
                        navLinks.forEach(nav => {
                            nav.classList.remove('active');
                        });
                        this.classList.add('active');
                    } else {
                        // Jika ini link dari dropdown atau pengaturan, hapus 'active' dari nav bawah
                        navLinks.forEach(nav => {
                            nav.classList.remove('active');
                        });
                    }
                });
            });
            
            
            // =============================================
            // TAMBAHKAN EVENT LISTENER FORM & MODAL
            // =============================================
            
            const simpanTransaksiBtn = document.getElementById('simpan-transaksi-btn');
            if (simpanTransaksiBtn) {
                simpanTransaksiBtn.addEventListener('click', handleSimpanTransaksi);
            }
            
            const simpanPenjualanBtn = document.getElementById('simpan-penjualan-btn');
            if(simpanPenjualanBtn) {
                simpanPenjualanBtn.addEventListener('click', handleSimpanPenjualan);
            }

            const simpanHutangBtn = document.getElementById('simpan-hutang-btn');
            if(simpanHutangBtn) {
                simpanHutangBtn.addEventListener('click', handleSimpanHutang);
            }
            
            const simpanMasterDataBtn = document.getElementById('simpan-master-data-btn');
            if(simpanMasterDataBtn) {
                simpanMasterDataBtn.addEventListener('click', handleSimpanMasterData);
            }
            
            // Listener untuk tombol Hapus di Modal Konfirmasi
            const btnKonfirmasiHapus = document.getElementById('btn-konfirmasi-hapus');
            if (btnKonfirmasiHapus) {
                btnKonfirmasiHapus.addEventListener('click', deleteItem);
            }
            
            document.querySelectorAll('form').forEach(form => {
                form.addEventListener('submit', e => e.preventDefault());
            });


            // BARU: Listener untuk tombol Import / Export CSV
            const exportBtn = document.getElementById('export-produk-btn');
            if (exportBtn) {
                exportBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    exportProdukToCSV();
                });
            }
            const importBtn = document.getElementById('import-produk-btn');
            const importInput = document.getElementById('import-produk-input');
            if (importBtn && importInput) {
                importBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    importInput.click(); 
                });
                importInput.addEventListener('change', importProdukFromCSV);
            }

            // BARU: Listener untuk tombol Import / Export JSON
            const exportJsonBtn = document.getElementById('export-json-btn');
            if(exportJsonBtn) {
                exportJsonBtn.addEventListener('click', exportDataToJSON);
            }
            const importJsonBtn = document.getElementById('import-json-btn');
            const importJsonInput = document.getElementById('import-json-input');
            if (importJsonBtn && importJsonInput) {
                importJsonBtn.addEventListener('click', () => importJsonInput.click());
                importJsonInput.addEventListener('change', importDataFromJSON);
            }

            
            // BARU: Listener untuk tombol Filter Tanggal
            const filterButtons = document.querySelectorAll('#filter-tanggal-buttons .nav-link');
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tipe = button.dataset.tipe;
                    if (setGlobalFilter(tipe)) {
                        renderDashboardAnalytics();
                    }
                });
            });
            const terapkanFilterBtn = document.getElementById('filter-terapkan-btn');
            if (terapkanFilterBtn) {
                terapkanFilterBtn.addEventListener('click', () => {
                    const tipe = terapkanFilterBtn.dataset.tipe;
                    if (setGlobalFilter(tipe)) {
                        renderDashboardAnalytics();
                    }
                });
            }


            // =============================================
            // INISIALISASI MODAL (Tugas dan Reset)
            // =============================================
            
            const kasirModalEl = document.getElementById('kasirModal');
            if (kasirModalEl) {
                kasirModalEl.addEventListener('show.bs.modal', event => {
                    const button = event.relatedTarget;
                    const action = button.getAttribute('data-action');
                    const modalTitle = document.getElementById('kasirModalLabel');
                    const modalButton = document.getElementById('simpan-penjualan-btn');

                    if (action === 'edit') {
                        const id = button.getAttribute('data-id');
                        const item = initialHistoryData.penjualan.find(s => s.id == id);
                        if (!item) {
                            alert('Error: Data penjualan tidak ditemukan.');
                            event.preventDefault();
                            return;
                        }
                        
                        modalTitle.textContent = "Edit Penjualan";
                        modalButton.textContent = "Update Penjualan";
                        
                        // Tampilkan tab yang sesuai
                        let tabToActivate;
                        if (item.tipe === 'Produk') {
                            tabToActivate = document.getElementById('produk-tab');
                            setValueById('produk-id-edit', item.id, true);
                            setValueById('produkTanggal', item.tanggal, true);
                            setValueById('produkNama', item.nama, true);
                            setValueById('produkKuantitas', item.kuantitas, true);
                        } else if (item.tipe === 'Jasa') {
                            tabToActivate = document.getElementById('jasa-tab');
                            setValueById('jasa-id-edit', item.id, true);
                            setValueById('jasaTanggal', item.tanggal, true);
                            setValueById('jasaNama', item.nama, true);
                            setValueById('jasaModal', item.modal, true);
                            setValueById('jasaJual', item.hargaJual, true);
                        } else if (item.tipe === 'Aplikasi') {
                            tabToActivate = document.getElementById('aplikasi-tab');
                            setValueById('aplikasi-id-edit', item.id, true);
                            setValueById('aplikasiTanggal', item.tanggal, true);
                            setValueById('aplikasiSumber', item.dariAkun, true);
                            setValueById('aplikasiNominal', item.modal, true);
                            setValueById('aplikasiJual', item.hargaJual, true);
                        }
                        
                        if(tabToActivate) bootstrap.Tab.getOrCreateInstance(tabToActivate).show();

                    } else {
                        // Ini adalah 'tambah', reset form
                        resetKasirForm();
                    }
                });
                kasirModalEl.addEventListener('hidden.bs.modal', resetKasirForm);
            }

            const transaksiModalEl = document.getElementById('transaksiModal');
            if(transaksiModalEl) {
                transaksiModalEl.addEventListener('show.bs.modal', event => {
                    const button = event.relatedTarget;
                    const action = button.getAttribute('data-action');
                    const modalTitle = document.getElementById('transaksiModalLabel');
                    const modalButton = document.getElementById('simpan-transaksi-btn');

                    if (action === 'edit') {
                        const id = button.getAttribute('data-id');
                        const item = initialHistoryData.transaksi.find(t => t.id == id);
                        if (!item) {
                            alert('Error: Data transaksi tidak ditemukan.');
                            event.preventDefault();
                            return;
                        }

                        modalTitle.textContent = "Edit Transaksi";
                        modalButton.textContent = "Update Transaksi";

                        let tabToActivate;
                        if (item.tipe === 'Pendapatan') {
                            tabToActivate = document.getElementById('pendapatan-tab');
                            setValueById('pendapatan-id-edit', item.id, true);
                            setValueById('pendapatanTanggal', item.tanggal, true);
                            setValueById('pendapatanKeAkun', item.keAkun, true);
                            setValueById('pendapatanKategori', item.kategori, true);
                            setValueById('pendapatanNominal', item.total, true);
                            setValueById('pendapatanCatatan', item.catatan, true);
                        } else if (item.tipe === 'Pengeluaran') {
                            tabToActivate = document.getElementById('pengeluaran-tab');
                            setValueById('pengeluaran-id-edit', item.id, true);
                            setValueById('pengeluaranTanggal', item.tanggal, true);
                            setValueById('pengeluaranDariAkun', item.dariAkun, true);
                            setValueById('pengeluaranKategori', item.kategori, true);
                            setValueById('pengeluaranNominal', item.total, true);
                            setValueById('pengeluaranCatatan', item.catatan, true);
                        } else if (item.tipe === 'Transfer') {
                            tabToActivate = document.getElementById('transfer-tab');
                            setValueById('transfer-id-edit', item.id, true);
                            setValueById('transferTanggal', item.tanggal, true);
                            setValueById('transferDariAkun', item.dariAkun, true);
                            setValueById('transferKeAkun', item.keAkun, true);
                            setValueById('transferKategori', item.kategori, true);
                            setValueById('transferNominal', item.total, true);
                            setValueById('transferCatatan', item.catatan, true);
                        } else if (item.tipe === 'TRX') {
                            tabToActivate = document.getElementById('trx-tab');
                            setValueById('trx-id-edit', item.id, true);
                            setValueById('trxTanggal', item.tanggal, true);
                            setValueById('trxDariAkun', item.dariAkun, true);
                            setValueById('trxKeAkun', item.keAkun, true);
                            setValueById('trxKategori', item.kategori, true);
                            setValueById('trxNominal', item.total, true); // 'total' adalah modal
                            setValueById('trxFee', item.fee, true);
                            setValueById('trxCatatan', item.catatan, true);
                        }
                        
                        if(tabToActivate) bootstrap.Tab.getOrCreateInstance(tabToActivate).show();
                        
                    } else {
                        resetTransaksiForm();
                    }
                });
                transaksiModalEl.addEventListener('hidden.bs.modal', resetTransaksiForm);
            }

            const hutangModalEl = document.getElementById('hutangModal');
            if(hutangModalEl) {
                hutangModalEl.addEventListener('show.bs.modal', event => {
                    const button = event.relatedTarget;
                    const action = button.getAttribute('data-action');
                    const modalTitle = document.getElementById('hutangModalLabel');
                    const modalButton = document.getElementById('simpan-hutang-btn');

                    if (action === 'edit') {
                        const id = button.getAttribute('data-id');
                        const item = initialHistoryData.hutang.find(h => h.id == id);
                        if (!item) {
                            alert('Error: Data hutang/piutang tidak ditemukan.');
                            event.preventDefault();
                            return;
                        }

                        modalTitle.textContent = "Edit Hutang/Piutang";
                        modalButton.textContent = "Update Data";

                        let tabToActivate;
                        if (item.tipe === 'Piutang') {
                            tabToActivate = document.getElementById('piutang-tab');
                            setValueById('piutang-id-edit', item.id, true);
                            setValueById('piutangTanggal', item.tanggal, true);
                            setValueById('piutangPihak', item.pihak, true);
                            setValueById('piutangNominal', item.total, true); // Edit total, bukan sisa
                            setValueById('piutangCatatan', item.catatan, true);
                        } else if (item.tipe === 'Hutang') {
                            tabToActivate = document.getElementById('hutang-tab');
                            setValueById('hutang-id-edit', item.id, true);
                            setValueById('hutangTanggal', item.tanggal, true);
                            setValueById('hutangPihak', item.pihak, true);
                            setValueById('hutangNominal', item.total, true);
                            setValueById('hutangCatatan', item.catatan, true);
                        }
                        
                        if(tabToActivate) bootstrap.Tab.getOrCreateInstance(tabToActivate).show();
                        
                    } else {
                        resetHutangForm();
                    }
                });
                hutangModalEl.addEventListener('hidden.bs.modal', resetHutangForm);
            }

            const masterDataModalEl = document.getElementById('masterDataModal');
            if(masterDataModalEl) {
                masterDataModalEl.addEventListener('show.bs.modal', event => {
                    resetMasterDataForm(); 

                    const button = event.relatedTarget; 
                    const dataType = button.getAttribute('data-type');
                    const action = button.getAttribute('data-action');
                    const id = button.getAttribute('data-id');

                    const modalTitle = document.getElementById('masterDataModalLabel');
                    const formType = document.getElementById('masterDataType');
                    const formId = document.getElementById('masterDataId');
                    
                    formType.value = dataType;
                    formId.value = id || ''; 
                    
                    let item = null;
                    let title = (action === 'edit' ? 'Edit ' : 'Tambah ');
                    
                    switch (dataType) {
                        case 'produk':
                            title += 'Produk';
                            document.getElementById('field-nama').style.display = 'block';
                            document.getElementById('field-modal').style.display = 'block';
                            document.getElementById('field-jual').style.display = 'block';
                            document.getElementById('field-stok').style.display = 'block';
                            if (action === 'edit') {
                                item = initialMasterData.produk.find(i => i.id == id);
                                document.getElementById('masterNama').value = item.nama;
                                document.getElementById('masterModal').value = item.modal;
                                document.getElementById('masterJual').value = item.jual;
                                document.getElementById('masterStok').value = item.stok;
                            }
                            break;
                        case 'akun':
                            title += 'Akun';
                            document.getElementById('field-nama').style.display = 'block';
                            document.getElementById('field-saldo').style.display = 'block';
                            if (action === 'edit') {
                                item = initialMasterData.akun.find(i => i.id == id);
                                document.getElementById('masterNama').value = item.nama;
                                document.getElementById('masterSaldo').value = item.saldo;
                            }
                            break;
                        case 'kategori':
                            title += 'Kategori';
                            document.getElementById('field-nama').style.display = 'block';
                            if (action === 'edit') {
                                document.getElementById('masterNama').value = initialMasterData.kategori[id];
                            }
                            break;
                        case 'jenisTransaksi':
                            title += 'Jenis Transaksi';
                            document.getElementById('field-nama').style.display = 'block';
                            if (action === 'edit') {
                                document.getElementById('masterNama').value = initialMasterData.jenisTransaksi[id];
                            }
                            break;
                        case 'pengguna':
                            title += 'Pengguna';
                            document.getElementById('field-nama').style.display = 'block';
                            if (action === 'edit') {
                                document.getElementById('masterNama').value = initialMasterData.pengguna[id];
                            }
                            break;
                    }
                    modalTitle.textContent = title;
                });
                
                masterDataModalEl.addEventListener('hidden.bs.modal', resetMasterDataForm);
            }
            
            // DIPERBAIKI: Listener untuk Offcanvas riwayat hapus
            const riwayatHapusModalEl = document.getElementById('riwayatHapusModal');
            if (riwayatHapusModalEl) {
                // Saat Offcanvas akan ditampilkan, render daftarnya
                riwayatHapusModalEl.addEventListener('show.bs.offcanvas', renderDeletionHistory);
            }
            
            // =============================================
            // INISIALISASI APLIKASI SAAT DIMUAT
            // =============================================
            
            initCharts();
            setGlobalFilter('bulanan'); // Atur filter default
            renderAllMasterData();
            renderAllHistoryPages();
            renderDashboardAnalytics(); // Render dashboard dengan data & filter default

        });
