    document.addEventListener('DOMContentLoaded', function () {
        // --- DATA MANAGEMENT ---
        let appData = {};
        let keranjang = [];
        let revenueChartInstance = null;
        let salesChartInstance = null;
        let dateFilter = { type: 'month' }; // 'all', 'today', 'month', 'year', 'custom'

        const initialData = {
            kategori: { title: "Kategori", items: ["Order Kuota", "Dana", "Go-Pay", "Shopee-Pay", "Kas / Cash", "Modal", "Laba Bersih", "Fee BRI Link", "I-Simple", "Digipos", "Hutang", "BNI", "BRI Nussa", "BRI Galih", "Pemasukan", "Pengeluaran", "Penyesuaian", "Penjualan ATK", "Service", "Tabungan", "Save Plus", "Pengeluaran Rumah", "Transfer", "Tarik Tunai", "Setor Tunai", "APK", "Kulak (SP/Voucher/dll)"] },
            akun: { 
                title: "Akun", 
                items: [ 
                    { name: "Cash", balance: 0 }, { name: "BRI Galih", balance: 0 }, { name: "BRI Nussa", balance: 0 },
                    { name: "BNI", balance: 0 }, { name: "Bank Jateng", balance: 0 }, { name: "Buku Warung", balance: 0 },
                    { name: "DANA Galih", balance: 0 }, { name: "DANA Nussa", balance: 0 }, { name: "Shopee Pay", balance: 0 },
                    { name: "Go-Pay", balance: 0 }, { name: "Order Kuota", balance: 0 }, { name: "Digipos", balance: 0 },
                    { name: "Save Plus", balance: 0 }, { name: "I-Simple", balance: 0 }, { name: "Tabungan", balance: 0 },
                    { name: "Laba Bersih", balance: 0 }, { name: "Fee BRI Link", balance: 0 }, { name: "Hutang", balance: 0 },
                    { name: "Modal", balance: 0 }
                ] 
            },
            aplikasi: { title: "Aplikasi", items: ["Dana", "Digipos", "I-Simple", "Gopay", "Save Plus", "Shopee Pay", "Buku Warung/Agen", "OVO", "Order Kuota"] },
            pengguna: { title: "Pengguna", items: ["Admin", "Kasir 1", "Kasir 2"] },
            produk: { title: "Produk", items: [] },
            transaksi: { title: "Transaksi", items: [] },
            hutang: { title: "Hutang", items: [] }
        };

        function saveData() {
            localStorage.setItem('appData', JSON.stringify(appData));
        }

        function loadData() {
            const savedData = localStorage.getItem('appData');
            if (savedData) {
                appData = JSON.parse(savedData);
                 if (!appData.produk) appData.produk = { title: "Produk", items: [] };
                if (!appData.transaksi) appData.transaksi = { title: "Transaksi", items: [] };
                if (!appData.hutang) appData.hutang = { title: "Hutang", items: [] };
            } else {
                 appData = JSON.parse(JSON.stringify(initialData));
            }
        }

        // --- UI RENDERING ---
        function renderAll() {
            renderAllLists();
            renderAccountSidebar();
            renderTransaksiList();
            renderProdukList();
            renderProdukSummary();
            renderKasirDropdowns();
            renderKeranjang();
            renderKasirRiwayat();
            renderHutangLists();
            renderDashboard();
            renderLaporanPage();
        }

        function renderAllLists() {
            document.querySelectorAll('.crud-page').forEach(page => {
                const type = page.dataset.type;
                if (appData[type]) {
                    renderList(type, page.querySelector('.list-container'));
                }
            });
        }
        
        function renderLaporanPage() {
            const allTransactions = appData.transaksi.items;
            const salesTransactions = allTransactions.filter(t => t.kategori === 'Penjualan');
            const financialTransactions = allTransactions.filter(t => t.kategori !== 'Penjualan');
            const allHutang = appData.hutang.items;

            // --- Calculations ---
            let produkTerjualCount = 0;
            let jasaTerjualCount = 0;
            let totalNilaiPenjualan = 0;
            let totalModalPenjualan = 0;
            let totalLabaProduk = 0;
            let totalLabaJasa = 0;
            let totalLabaAplikasi = 0;
            let totalPenjualanProduk = 0;
            let totalPenjualanJasa = 0;
            let totalPenjualanAplikasi = 0;

            salesTransactions.forEach(trx => {
                totalNilaiPenjualan += trx.jumlah;
                trx.items.forEach(item => {
                    const itemLaba = (item.harga * item.jumlah) - ((item.hargaModal || 0) * item.jumlah);
                    totalModalPenjualan += (item.hargaModal || 0) * item.jumlah;
                    const itemJual = item.harga * item.jumlah;

                    if (item.type === 'produk') {
                        produkTerjualCount += item.jumlah;
                        totalLabaProduk += itemLaba;
                        totalPenjualanProduk += itemJual;
                    } else if (item.type === 'jasa') {
                        jasaTerjualCount += item.jumlah;
                        totalLabaJasa += itemLaba;
                        totalPenjualanJasa += itemJual;
                    } else if (item.type === 'aplikasi') {
                        totalLabaAplikasi += itemLaba;
                        totalPenjualanAplikasi += itemJual;
                    }
                });
            });

            const totalPemasukanLainnya = financialTransactions
                .filter(t => t.jenis === 'pemasukan')
                .reduce((sum, t) => sum + t.jumlah, 0);

            const totalPengeluaran = financialTransactions
                .filter(t => t.jenis === 'pengeluaran')
                .reduce((sum, t) => sum + t.jumlah, 0);
                
            const hutangAktif = allHutang.filter(h => h.status === 'Belum Lunas');
            const totalHutangAktif = hutangAktif.reduce((sum, h) => sum + h.nominal, 0);
            const jumlahPenghutang = new Set(hutangAktif.map(h => h.nama.toLowerCase())).size;

            const totalPendapatan = totalNilaiPenjualan + totalPemasukanLainnya;
            const totalBeban = totalModalPenjualan + totalPengeluaran;
            const labaKotor = totalPendapatan - totalBeban;
            const totalLabaPenjualan = totalLabaProduk + totalLabaJasa + totalLabaAplikasi;

            // Laporan Transaksi Keuangan
            const totalTransaksiKeuangan = financialTransactions.length;
            const nominalLabaBersih = financialTransactions
                .filter(t => t.kategori === 'Laba Bersih' && t.jenis === 'pemasukan')
                .reduce((sum, t) => sum + t.jumlah, 0);
            const nominalPengeluaranRumah = financialTransactions
                .filter(t => t.kategori === 'Pengeluaran Rumah' && t.jenis === 'pengeluaran')
                .reduce((sum, t) => sum + t.jumlah, 0);


            // --- Update UI ---
            // Laba Rugi
            document.getElementById('report-total-penjualan').textContent = formatCurrency(totalNilaiPenjualan);
            document.getElementById('report-total-pemasukan').textContent = formatCurrency(totalPemasukanLainnya);
            document.getElementById('report-total-pendapatan').textContent = formatCurrency(totalPendapatan);
            document.getElementById('report-total-modal').textContent = formatCurrency(totalModalPenjualan);
            document.getElementById('report-total-pengeluaran').textContent = formatCurrency(totalPengeluaran);
            document.getElementById('report-total-beban').textContent = formatCurrency(totalBeban);
            document.getElementById('report-laba-kotor').textContent = formatCurrency(labaKotor);
            
            // Rincian Penjualan
            document.getElementById('report-produk-terjual').textContent = `${produkTerjualCount.toLocaleString('id-ID')} unit`;
            document.getElementById('report-jasa-terjual').textContent = `${jasaTerjualCount.toLocaleString('id-ID')} unit`;
            document.getElementById('report-penjualan-produk').textContent = formatCurrency(totalPenjualanProduk);
            document.getElementById('report-penjualan-jasa').textContent = formatCurrency(totalPenjualanJasa);
            document.getElementById('report-laba-produk').textContent = formatCurrency(totalLabaProduk);
            document.getElementById('report-laba-jasa').textContent = formatCurrency(totalLabaJasa);
            document.getElementById('report-penjualan-aplikasi').textContent = formatCurrency(totalPenjualanAplikasi);
            document.getElementById('report-laba-aplikasi').textContent = formatCurrency(totalLabaAplikasi);
            document.getElementById('report-total-laba-penjualan').textContent = formatCurrency(totalLabaPenjualan);

            // Rincian Hutang
            document.getElementById('report-total-hutang').textContent = formatCurrency(totalHutangAktif);
            document.getElementById('report-jumlah-penghutang').textContent = `${jumlahPenghutang.toLocaleString('id-ID')} orang`;
        
            // Laporan Transaksi Keuangan
            document.getElementById('report-total-transaksi-keuangan').textContent = `${totalTransaksiKeuangan.toLocaleString('id-ID')} transaksi`;
            document.getElementById('report-nominal-laba-bersih').textContent = formatCurrency(nominalLabaBersih);
            document.getElementById('report-nominal-pengeluaran-rumah').textContent = formatCurrency(nominalPengeluaranRumah);
        }
        
        const formatCurrency = (value) => {
            const val = parseFloat(value) || 0;
            const formatter = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            });
            if (val < 0) {
                return '-' + formatter.format(Math.abs(val));
            }
            return formatter.format(val);
        };

        function renderList(type, container) {
            container.innerHTML = '';

            if (type === 'akun') {
                 appData[type].items.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.className = 'py-3 flex justify-between items-center';
                    li.innerHTML = `
                        <div class="flex-1 flex items-center justify-between min-w-0 mr-4">
                            <p class="font-medium text-gray-800 truncate">${item.name}</p>
                            <p class="text-sm text-gray-500 ml-4 flex-shrink-0">${formatCurrency(item.balance)}</p>
                        </div>
                        <div class="flex items-center space-x-3 flex-shrink-0">
                            <button class="btn-saldo text-xs text-sky-600 font-semibold" data-index="${index}">Saldo</button>
                            <button class="btn-edit text-amber-500 hover:text-amber-600" data-index="${index}" title="Ubah">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                            </button>
                            <button class="btn-delete text-rose-500 hover:text-rose-600" data-index="${index}" title="Hapus">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>`;
                    container.appendChild(li);
                });
            } else {
                appData[type].items.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.className = 'py-3 flex justify-between items-center';
                    li.innerHTML = `<p class="font-medium text-gray-800">${item}</p>
                        <div class="flex space-x-3">
                            <button class="btn-edit text-amber-500 hover:text-amber-600" data-index="${index}" title="Ubah">
                                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                            </button>
                            <button class="btn-delete text-rose-500 hover:text-rose-600" data-index="${index}" title="Hapus">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>`;
                    container.appendChild(li);
                });
            }
        }

        function renderAccountSidebar() {
            const container = document.getElementById('account-sidebar-list');
            container.innerHTML = '';
            
            const feeBriLinkAkun = appData.akun.items.find(item => item.name === "Fee BRI Link");
            const feeBriLinkSaldo = feeBriLinkAkun ? feeBriLinkAkun.balance : 0;

            const accountsToDisplay = appData.akun.items.filter(item => item.name !== "Fee BRI Link");

            accountsToDisplay.forEach(item => {
                let displayBalance = item.balance;
                
                if (item.name === "BRI Nussa") {
                    displayBalance += feeBriLinkSaldo;
                }

                const itemDiv = document.createElement('div');
                itemDiv.className = 'flex justify-between items-center text-xs p-2 hover:bg-slate-700';
                itemDiv.innerHTML = `
                    <span class="font-medium text-gray-300 truncate">${item.name}</span>
                    <span class="text-gray-400 font-semibold">${formatCurrency(displayBalance)}</span>
                `;
                container.appendChild(itemDiv);
            });
        }
        
        function filterTransactionsByDate(transactions) {
            if (dateFilter.type === 'all') {
                return transactions;
            }
            return transactions.filter(t => {
                const trxDate = new Date(t.tanggal);
                return trxDate >= dateFilter.start && trxDate <= dateFilter.end;
            });
        }
        
        function renderDashboard() {
            const filteredTransactions = filterTransactionsByDate(appData.transaksi.items);

            const totalSaldoCard = document.getElementById('total-saldo-card');
            const totalCashCard = document.getElementById('total-cash-card');
            const modalSaldoCard = document.getElementById('modal-saldo-card');
            const totalLabaBersihCard = document.getElementById('total-laba-bersih-card');
            const pengeluaranCard = document.getElementById('pengeluaran-card');

            // Analisa Khusus cards
            const feeBriLinkCard = document.getElementById('fee-bri-link-card');
            const briNussaCard = document.getElementById('bri-nussa-card');
            const tabunganCard = document.getElementById('tabungan-card');
            const labaBersihCard = document.getElementById('laba-bersih-card');
            const pengeluaranRumahCard = document.getElementById('pengeluaran-rumah-card');
            const hutangCard = document.getElementById('hutang-card');

            // Analisa Penjualan cards
            const produkTerjualCard = document.getElementById('produk-terjual-card');
            const jasaTerjualCard = document.getElementById('jasa-terjual-card');
            const labaTransaksiCard = document.getElementById('laba-transaksi-card');
            const labaPenjualanFilterCard = document.getElementById('laba-penjualan-filter-card');
            const labaProdukCard = document.getElementById('laba-produk-card');
            const labaJasaCard = document.getElementById('laba-jasa-card');
            const labaAplikasiCard = document.getElementById('laba-aplikasi-card');

            if (!appData.akun || !appData.akun.items || !appData.transaksi) return;

            // --- Analisa Umum (Sebagian tidak difilter) ---
            const totalSaldo = appData.akun.items.reduce((sum, akun) => sum + akun.balance, 0);
            totalSaldoCard.innerHTML = `
            <div class="relative z-10 flex flex-col justify-start h-full">
                                    <!-- Top Row: Title & Badge -->
                                    <div class="flex justify-between items-center">
                                        <p class="text-xs sm:text-sm font-medium opacity-90">Total Saldo</p>
                                        <span class="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">+8%</span>
                                    </div>
                                    <!-- Bottom Row: Amount Only (Icon Removed) -->
                                    <div class="flex justify-between items-center">
                                        <p class="text-sm sm:text-base font-bold">${formatCurrency(totalSaldo)}</p>
                                    </div>
                                </div>
                                <!-- Chart Decoration: Mixed Bar & Line -->
                                <div class="absolute bottom-0 left-0 right-0 px-2 pb-2">
                                    <svg class="w-full h-16 opacity-50" viewBox="0 0 300 100" preserveAspectRatio="none">
                                        <!-- Bars Layer 1 -->
                                        <rect x="10" y="85" width="15" height="15" fill="currentColor" fill-opacity="0.4" />
                                        <rect x="50" y="80" width="15" height="20" fill="currentColor" fill-opacity="0.4" />
                                        <rect x="90" y="70" width="15" height="30" fill="currentColor" fill-opacity="0.4" />
                                        <rect x="130" y="55" width="15" height="45" fill="currentColor" fill-opacity="0.4" />
                                        <rect x="170" y="40" width="15" height="60" fill="currentColor" fill-opacity="0.4" />
                                        <rect x="210" y="25" width="15" height="75" fill="currentColor" fill-opacity="0.4" />
                                        <rect x="250" y="30" width="15" height="70" fill="currentColor" fill-opacity="0.4" />
                                        <!-- Bars Layer 2 -->
                                        <rect x="28" y="82" width="15" height="18" fill="currentColor" fill-opacity="0.7" />
                                        <rect x="68" y="75" width="15" height="25" fill="currentColor" fill-opacity="0.7" />
                                        <rect x="108" y="65" width="15" height="35" fill="currentColor" fill-opacity="0.7" />
                                        <rect x="148" y="50" width="15" height="50" fill="currentColor" fill-opacity="0.7" />
                                        <rect x="188" y="45" width="15" height="55" fill="currentColor" fill-opacity="0.7" />
                                        <rect x="228" y="15" width="15" height="85" fill="currentColor" fill-opacity="0.7" />
                                        <rect x="268" y="10" width="15" height="90" fill="currentColor" fill-opacity="0.7" />
                                        <!-- Line -->
                                        <polyline points="26,80 66,75 106,65 146,55 186,35 226,15 270,5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                                        <!-- Dots -->
                                        <circle cx="26" cy="80" r="4" fill="white" fill-opacity="1" />
                                        <circle cx="66" cy="75" r="4" fill="white" fill-opacity="1" />
                                        <circle cx="106" cy="65" r="4" fill="white" fill-opacity="1" />
                                        <circle cx="146" cy="55" r="4" fill="white" fill-opacity="1" />
                                        <circle cx="186" cy="35" r="4" fill="white" fill-opacity="1" />
                                        <circle cx="226" cy="15" r="4" fill="white" fill-opacity="1" />
                                        <circle cx="270" cy="5" r="4" fill="white" fill-opacity="1" />
                                    </svg>
                                </div>

            `;

            // 2. Total Cash (dihitung dari jumlah akun Cash, Laba Bersih, Modal dan tabungan)
            const cashAccounts = ["Cash", "Laba Bersih", "Tabungan", "Modal"];
            const totalCash = appData.akun.items
                .filter(akun => cashAccounts.includes(akun.name))
                .reduce((sum, akun) => sum + akun.balance, 0);
            totalCashCard.innerHTML = `
            <div class="relative z-10 flex flex-col justify-start h-full">
                                    <!-- Top Row: Title & Badge -->
                                    <div class="flex justify-between items-center">
                                        <p class="text-xs sm:text-sm font-medium opacity-90">Total Cash</p>
                                        <span class="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">+3%</span>
                                    </div>
                                    <!-- Bottom Row: Amount Only (Icon Removed) -->
                                    <div class="flex justify-between items-center">
                                        <p class="text-sm sm:text-base font-bold">${formatCurrency(totalCash)}</p>
                                    </div>
                                </div>
                                <!-- Chart Decoration: Smooth Wavy Area -->
                                <div class="absolute bottom-0 left-0 right-0">
                                    <svg class="w-full h-20 opacity-50" viewBox="0 0 300 100" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="cashGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stop-color="currentColor" stop-opacity="0.8" />
                                                <stop offset="100%" stop-color="currentColor" stop-opacity="0.1" />
                                            </linearGradient>
                                        </defs>
                                        <!-- Filled Area -->
                                        <path d="M0,80 C50,90 80,40 120,50 C160,60 180,80 220,60 C260,40 280,10 300,30 V100 H0 Z" fill="url(#cashGradient)" />
                                        <!-- Stroke Line -->
                                        <path d="M0,80 C50,90 80,40 120,50 C160,60 180,80 220,60 C260,40 280,10 300,30" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" />
                                        <!-- Peak Dot -->
                                        <circle cx="220" cy="60" r="4" fill="white" />
                                        <circle cx="300" cy="30" r="4" fill="white" />
                                    </svg>
                                </div>
            `;

            // 3. Saldo akun Modal
            const modalAkun = appData.akun.items.find(akun => akun.name === "Modal");
            const modalSaldo = modalAkun ? modalAkun.balance : 0;
            modalSaldoCard.innerHTML = `
            <div class="relative z-10 flex flex-col justify-start h-full">
                                    <!-- Top Row: Title & Badge -->
                                    <div class="flex justify-between items-center">
                                        <p class="text-xs sm:text-sm font-medium opacity-90">Saldo Modal</p>
                                        <span class="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">+15%</span>
                                    </div>
                                    <!-- Bottom Row: Amount Only (Icon Removed) -->
                                    <div class="flex justify-between items-center">
                                        <p class="text-sm sm:text-base font-bold">${formatCurrency(modalSaldo)}</p>
                                    </div>
                                </div>
                                <!-- Chart Decoration: Pure Bar Chart -->
                                <div class="absolute bottom-0 left-0 right-0 px-2 pb-0">
                                    <svg class="w-full h-16 opacity-50" viewBox="0 0 300 100" preserveAspectRatio="none">
                                        <!-- Distinct Bars -->
                                        <rect x="10" y="80" width="20" height="20" rx="2" fill="white" fill-opacity="0.4" />
                                        <rect x="40" y="60" width="20" height="40" rx="2" fill="white" fill-opacity="0.6" />
                                        <rect x="70" y="70" width="20" height="30" rx="2" fill="white" fill-opacity="0.5" />
                                        <rect x="100" y="40" width="20" height="60" rx="2" fill="white" fill-opacity="0.8" />
                                        <rect x="130" y="50" width="20" height="50" rx="2" fill="white" fill-opacity="0.6" />
                                        <rect x="160" y="30" width="20" height="70" rx="2" fill="white" fill-opacity="0.9" />
                                        <rect x="190" y="45" width="20" height="55" rx="2" fill="white" fill-opacity="0.7" />
                                        <rect x="220" y="20" width="20" height="80" rx="2" fill="white" fill-opacity="0.95" />
                                        <rect x="250" y="10" width="20" height="90" rx="2" fill="white" fill-opacity="1" />
                                    </svg>
                                </div>
            `;

            // --- Analisa Khusus (Sebagian tidak difilter) ---
            const feeBriLinkAkun = appData.akun.items.find(akun => akun.name === "Fee BRI Link");
            const feeBriLinkSaldo = feeBriLinkAkun ? feeBriLinkAkun.balance : 0;
            feeBriLinkCard.innerHTML = `
                                <div class="flex flex-col justify-between items-start h-full">
                                    <!-- Header: Icon & Title -->
                                    <div class="flex items-center gap-2">
                                        <div class="bg-white rounded-md h-7 w-7 flex items-center justify-center shrink-0 shadow-sm">
                                            <span class="text-blue-700 font-bold text-xs">BRI</span>
                                        </div>
                                        <p class="text-xs sm:text-sm font-medium text-blue-100">Fee BRILink</p>
                                    </div>
                                    <!-- Nominal -->
                                    <p class="text-lg sm:text-xl font-bold">${formatCurrency(feeBriLinkSaldo)}</p>
                                </div>
                            </div>

            `;

            const briNussaAkun = appData.akun.items.find(akun => akun.name === "BRI Nussa");
            const briNussaSaldo = briNussaAkun ? briNussaAkun.balance : 0;
            briNussaCard.innerHTML = `
            <div class="flex flex-col justify-between items-start h-full">
                                    <!-- Header: Icon & Title -->
                                    <div class="flex items-center gap-2">
                                        <div class="bg-white rounded-md h-7 w-7 flex items-center justify-center shrink-0 shadow-sm">
                                            <span class="text-blue-700 font-bold text-xs">BRI</span>
                                        </div>
                                        <p class="text-xs sm:text-sm font-medium text-blue-100">BRI Nussa</p>
                                    </div>
                                    <!-- Nominal -->
                                    <p class="text-lg sm:text-xl font-bold">${formatCurrency(briNussaSaldo)}</p>
                                </div>

            `;

            const tabunganAkun = appData.akun.items.find(akun => akun.name === "Tabungan");
            const tabunganSaldo = tabunganAkun ? tabunganAkun.balance : 0;
            tabunganCard.innerHTML = `
            <div class="flex flex-col justify-between items-start h-full">
                                    <!-- Header: Icon & Title -->
                                    <div class="flex items-center gap-2">
                                        <div class="bg-white rounded-md h-7 w-7 flex items-center justify-center shrink-0 shadow-sm">
                                            <!-- Ikon Dompet/Simpanan -->
                                            <svg class="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                                        </div>
                                        <p class="text-xs sm:text-sm font-medium text-orange-100">Tabungan</p>
                                    </div>
                                    <!-- Nominal -->
                                    <p class="text-lg sm:text-xl font-bold">${formatCurrency(tabunganSaldo)}</p>
                                </div>

            `;

            // --- Laba Bersih (Periode) Calculation ---
            let labaBersihPeriode = 0;
            // 1. Laba dari Penjualan (Produk, Jasa, Aplikasi)
            const salesTransactionsInPeriod = filteredTransactions.filter(t => t.kategori === 'Penjualan');
            salesTransactionsInPeriod.forEach(trx => {
                trx.items.forEach(item => {
                    const itemLaba = (item.harga * item.jumlah) - ((item.hargaModal || 0) * item.jumlah);
                    labaBersihPeriode += itemLaba;
                });
            });
            // 2. Laba dari Transaksi Keuangan (cth: Fee Dana)
            const labaTransaksiLainnya = filteredTransactions
                .filter(t => t.kategori === 'Laba Bersih' && t.jenis === 'pemasukan')
                .reduce((sum, t) => sum + t.jumlah, 0);
            labaBersihPeriode += labaTransaksiLainnya;
            // 3. Laba dari fee transaksi Dana
            const labaDana = filteredTransactions
                .filter(t => t.jenis === 'dana')
                .reduce((sum, t) => sum + (t.fee || 0), 0);
            labaBersihPeriode += labaDana;
            
            labaBersihCard.innerHTML = `
            
            <div class="flex justify-between items-center h-full">
                <div class="flex flex-col justify-center">
                    <p class="text-xs sm:text-sm font-medium opacity-90">Total Laba Bersih</p>
                    <p class="text-lg sm:text-xl font-bold">${formatCurrency(labaBersihPeriode)}</p>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <span class="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">+12%</span>
                    <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.64 1.87 1.93 0 2.38-1.04 2.38-1.57 0-.85-.38-1.63-2.64-2.17-2.47-.59-4.16-1.6-4.16-3.64 0-1.72 1.38-2.83 3.09-3.2V4h2.67v1.93c1.57.33 2.81 1.35 3.03 3.02h-1.95c-.15-.89-.94-1.52-2.41-1.52-1.48 0-2.37.76-2.37 1.53 0 .83.53 1.51 2.64 2.02 2.64.63 4.16 1.73 4.16 3.83 0 1.6-1.19 2.91-3.09 3.29z"/>
                    </svg>
                </div>
            </div>
            `;
            
            const hutangAkun = appData.akun.items.find(akun => akun.name === "Hutang");
            const hutangSaldo = hutangAkun ? hutangAkun.balance : 0;
            hutangCard.innerHTML = `
            <div class="relative z-10 flex flex-col h-full">
                                    <!-- Teks & Ikon (jika mau ditambahkan, tapi saat ini default) -->
                                    <p class="text-sm font-medium text-gray-500">Hutang</p>
                                    <p class="text-xl font-bold text-gray-800 mt-1">${formatCurrency(hutangSaldo)}</p>
                                </div>
                                <!-- Hiasan Mini Line Chart di Bawah -->
                                <div class="absolute bottom-0 left-0 right-0">
                                    <svg class="w-full h-24" viewBox="0 0 100 40" preserveAspectRatio="none">
                                        <!-- Area Chart dengan warna merah lembut -->
                                        <path d="M0 25 Q 25 5 50 25 T 100 15 V 40 H 0 Z" fill="#fee2e2" stroke="#ef4444" stroke-width="0.5" />
                                        <!-- Garis Line Chart di atasnya untuk penegasan -->
                                        <path d="M0 25 Q 25 5 50 25 T 100 15" fill="none" stroke="#ef4444" stroke-width="1.5" />
                                    </svg>
                                </div>
            `;

            // --- Hutang Aktif Card ---
            const hutangAktifCard = document.getElementById('hutang-aktif-card');
            const hutangBelumLunas = appData.hutang.items
                .filter(item => item.status === 'Belum Lunas')
                .sort((a, b) => b.id - a.id) // Urutkan dari yang terbaru
                .slice(0, 5);

            if (hutangAktifCard) {
                let contentHTML = '<h3 class="text-xs font-medium text-gray-500">5 Hutang Aktif Terakhir</h3>';
                if (hutangBelumLunas.length === 0) {
                    contentHTML += `
                        <div class="flex flex-col items-center justify-center h-full text-center text-gray-400 pt-4">
                            <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <p class="text-sm">Tidak ada hutang aktif.</p>
                        </div>`;
                } else {
                    contentHTML += '<ul class="divide-y divide-gray-100 mt-2">';
                    hutangBelumLunas.forEach(item => {
                        contentHTML += `
                            <li class="py-1.5 flex justify-between items-center text-sm">
                                <span class="font-semibold text-gray-700 truncate pr-2">${item.nama}</span>
                                <span class="font-bold text-red-600 ml-2 whitespace-nowrap">${formatCurrency(item.nominal)}</span>
                            </li>
                        `;
                    });
                    contentHTML += '</ul>';
                }
                hutangAktifCard.innerHTML = contentHTML;
            }


            // --- Metrik Berbasis Transaksi (DIFILTER) ---

            const totalPengeluaranRumah = filteredTransactions
                .filter(t => t.kategori === 'Pengeluaran Rumah')
                .reduce((sum, t) => sum + t.jumlah, 0);
            pengeluaranRumahCard.innerHTML = `
            <div class="flex justify-between items-center h-full">
                                    <!-- Teks -->
                                    <div class="flex flex-col justify-center">
                                        <p class="text-xs sm:text-sm font-medium opacity-90">Pengeluaran Rumah</p>
                                        <p class="text-lg sm:text-xl font-bold">${formatCurrency(totalPengeluaranRumah)}</p>
                                    </div>
                                    <!-- Ikon & Badge -->
                                    <div class="flex flex-col items-end gap-1">
                                        <span class="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">+5%</span>
                                        <!-- Ikon Rumah Solid Putih -->
                                        <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                                        </svg>
                                    </div>
                                </div>

            `;

            const salesTransactions = filteredTransactions.filter(t => t.kategori === 'Penjualan');
            
            let produkTerjualCount = 0;
            let jasaTerjualCount = 0;
            let labaProduk = 0;
            let labaJasa = 0;
            let labaAplikasi = 0;

            salesTransactions.forEach(trx => {
                trx.items.forEach(item => {
                    const itemLaba = (item.harga * item.jumlah) - ((item.hargaModal || 0) * item.jumlah);
                    if (item.type === 'produk') {
                        produkTerjualCount += item.jumlah;
                        labaProduk += itemLaba;
                    } else if (item.type === 'jasa') {
                        jasaTerjualCount += item.jumlah;
                        labaJasa += itemLaba;
                    } else if (item.type === 'aplikasi') {
                        labaAplikasi += itemLaba;
                    }
                });
            });

            produkTerjualCard.innerHTML = `
                <h3 class="text-xs font-medium text-gray-500">Produk Terjual</h3>
                <p class="text-l font-bold text-gray-900 mt-1">${produkTerjualCount}</p>
            `;
            
            jasaTerjualCard.innerHTML = `
                <h3 class="text-xs font-medium text-gray-500">Jasa Terjual</h3>
                <p class="text-l font-bold text-gray-900 mt-1">${jasaTerjualCount}</p>
            `;

            labaProdukCard.innerHTML = `
                <h3 class="text-xs font-medium text-gray-500">Laba Produk</h3>
                <p class="text-l font-bold text-green-600 mt-1">${formatCurrency(labaProduk)}</p>
            `;

            labaJasaCard.innerHTML = `
                <h3 class="text-xs font-medium text-gray-500">Laba Jasa</h3>
                <p class="text-l font-bold text-green-600 mt-1">${formatCurrency(labaJasa)}</p>
            `;

            labaAplikasiCard.innerHTML = `
                <h3 class="text-xs font-medium text-gray-500">Laba Aplikasi</h3>
                <p class="text-l font-bold text-green-600 mt-1">${formatCurrency(labaAplikasi)}</p>
            `;

            const labaDariKategoriBersih = filteredTransactions
                .filter(t => t.kategori === 'Laba Bersih')
                .reduce((sum, t) => sum + t.jumlah, 0);
            const labaDariFeeDana = filteredTransactions
                .filter(t => t.jenis === 'dana')
                .reduce((sum, t) => sum + (t.fee || 0), 0);
            const totalLabaTransaksi = labaDariKategoriBersih + labaDariFeeDana;
            labaTransaksiCard.innerHTML = `
                <h3 class="text-xs font-medium text-gray-500">Laba Transaksi</h3>
                <p class="text-l font-bold text-green-600 mt-1">${formatCurrency(totalLabaTransaksi)}</p>
            `;
            
            // --- Total Laba Penjualan (berdasarkan filter) ---
            const totalLabaPenjualanFilter = labaProduk + labaJasa + labaAplikasi + totalLabaTransaksi;
            labaPenjualanFilterCard.innerHTML = `
                <h3 class="text-xs font-medium text-gray-500">Total Laba Keseluruhan (Periode)</h3>
                <p class="text-xl font-bold text-green-600 mt-1">${formatCurrency(totalLabaPenjualanFilter)}</p>
            `;


            const totalPendapatan = filteredTransactions
                .filter(t => t.jenis === 'pemasukan')
                .reduce((sum, t) => sum + t.jumlah, 0);
            
            const labaBersihAkunDashboard = appData.akun.items.find(akun => akun.name === "Laba Bersih");
            const totalLabaBersih = labaBersihAkunDashboard ? labaBersihAkunDashboard.balance : 0;
            totalLabaBersihCard.innerHTML = `
            <div class="flex flex-col justify-center h-full">
                                    <!-- Top Row: Title & Badge -->
                                    <div class="flex justify-between items-center mb-1">
                                        <p class="text-xs sm:text-sm font-medium opacity-90">Total Laba Bersih</p>
                                        <span class="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">+12%</span>
                                    </div>
                                    <!-- Bottom Row: Amount & Icon -->
                                    <div class="flex justify-between items-center">
                                        <p class="text-s sm:text-s font-bold">${formatCurrency(totalLabaBersih)}</p>
                                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                    </div>
                                </div>

            `;

            // Mengambil total pengeluaran rumah dari seluruh transaksi, bukan yang difilter
            const totalPengeluaranRumahSeluruhnya = appData.transaksi.items
                .filter(t => t.kategori === 'Pengeluaran Rumah')
                .reduce((sum, t) => sum + t.jumlah, 0);
            pengeluaranCard.innerHTML = `
            <div class="flex flex-col justify-center h-full">
                                    <!-- Top Row: Title & Badge -->
                                    <div class="flex justify-between items-center mb-1">
                                        <p class="text-xs sm:text-sm font-medium opacity-90">Pengeluaran</p>
                                        <span class="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">-5%</span>
                                    </div>
                                    <!-- Bottom Row: Amount & Icon -->
                                    <div class="flex justify-between items-center">
                                        <p class="text-s sm:text-s font-bold">${formatCurrency(totalPengeluaranRumahSeluruhnya)}</p>
                                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                                    </div>
                                </div>

            `;

            // Grafik
            renderRevenueChart(totalLabaBersih, totalPengeluaranRumahSeluruhnya);
            renderSalesChart(filteredTransactions);
        }

        function renderRevenueChart(labaBersih, pengeluaranRumah) {
            const ctx = document.getElementById('revenue-chart').getContext('2d');
            if (revenueChartInstance) {
                revenueChartInstance.destroy();
            }
            revenueChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Total'],
                    datasets: [{
                        label: 'Total Laba Bersih',
                        data: [labaBersih],
                        backgroundColor: 'rgba(16, 185, 129, 0.5)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 1
                    }, {
                        label: 'Pengeluaran Rumah',
                        data: [pengeluaranRumah],
                        backgroundColor: 'rgba(239, 68, 68, 0.5)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Laba Bersih vs Pengeluaran Rumah'
                        }
                    }
                }
            });
        }

        function renderSalesChart(filteredTransactions) {
            const ctx = document.getElementById('sales-chart').getContext('2d');
            if (salesChartInstance) {
                salesChartInstance.destroy();
            }

            let totalProdukSales = 0;
            let totalJasaSales = 0;
            let totalAplikasiSales = 0;

            const salesTransactions = filteredTransactions.filter(t => t.kategori === 'Penjualan');

            salesTransactions.forEach(trx => {
                trx.items.forEach(item => {
                    const itemTotal = item.harga * item.jumlah;
                    if (item.type === 'produk') {
                        totalProdukSales += itemTotal;
                    } else if (item.type === 'jasa') {
                        totalJasaSales += itemTotal;
                    } else if (item.type === 'aplikasi') {
                        totalAplikasiSales += itemTotal;
                    }
                });
            });

            salesChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Produk', 'Jasa', 'Aplikasi'],
                    datasets: [{
                        label: 'Penjualan',
                        data: [totalProdukSales, totalJasaSales, totalAplikasiSales],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.7)',  // blue
                            'rgba(16, 185, 129, 0.7)', // emerald
                            'rgba(139, 92, 246, 0.7)'  // violet
                        ],
                        borderColor: [
                            'rgba(59, 130, 246, 1)',
                            'rgba(16, 185, 129, 1)',
                            'rgba(139, 92, 246, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Komposisi Penjualan'
                        }
                    }
                }
            });
        }


        function renderTransaksiList() {
            const container = document.getElementById('transaksi-list-container');
            container.innerHTML = '';

            const transactions = appData.transaksi.items.filter(t => t.kategori !== 'Penjualan');
            if (transactions.length === 0) {
                 container.innerHTML = `<div class="text-center py-16 px-4">
                    <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <p class="text-gray-500 mt-4">Tidak ada transaksi untuk ditampilkan.</p>
                    <p class="text-sm text-gray-400 mt-1">Transaksi penjualan hanya akan muncul di halaman Kasir.</p>
                </div>`;
                return;
            }

            const displayTransactions = transactions.sort((a, b) => b.id - a.id);

            container.innerHTML = `
                <div class="grid grid-cols-12 gap-4 p-3 bg-sky-100 border-b border-sky-200 font-semibold text-xs text-sky-800 uppercase sticky top-0 z-10">
                    <div class="col-span-2 text-right">Waktu</div>
                    <div class="col-span-4">Rincian</div>
                    <div class="col-span-2 text-right">Nominal</div>
                    <div class="col-span-2">Kategori</div>
                    <div class="col-span-2 text-right">Aksi</div>
                </div>
            `;
            
            let lastDate = null;
            displayTransactions.forEach((trx, index) => {
                const trxDate = new Date(trx.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'});
                
                if (trxDate !== lastDate) {
                    const dateHeader = document.createElement('div');
                    dateHeader.className = 'p-2 bg-yellow-50 text-xs font-bold text-yellow-800 text-center';
                    dateHeader.textContent = trxDate;
                    container.appendChild(dateHeader);
                    lastDate = trxDate;
                }

                const row = document.createElement('div');
                const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                row.className = `grid grid-cols-12 gap-4 p-3 border-b text-sm items-center ${rowBg}`;
                
                let nominalHTML, rincianHTML, typeLabel, typeColorClass, kategoriText;
                const time = new Date(trx.id).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                switch(trx.jenis) {
                    case 'pemasukan':
                        typeLabel = 'Pemasukan';
                        typeColorClass = 'text-green-700';
                        nominalHTML = `<span class="font-semibold text-green-600">+${formatCurrency(trx.jumlah)}</span>`;
                        kategoriText = trx.kategori;
                        rincianHTML = `
                            <p class="font-semibold text-gray-800 truncate">${trx.akun}</p>
                            <p class="text-xs text-gray-500">${trx.keterangan || trx.kategori}</p>
                        `;
                        break;
                    case 'pengeluaran':
                        typeLabel = 'Pengeluaran';
                        typeColorClass = 'text-red-700';
                        nominalHTML = `<span class="font-semibold text-red-600">-${formatCurrency(trx.jumlah)}</span>`;
                        kategoriText = trx.kategori;
                        rincianHTML = `
                            <p class="font-semibold text-gray-800 truncate">${trx.akun}</p>
                            <p class="text-xs text-gray-500">${trx.keterangan || trx.kategori}</p>
                        `;
                        break;
                    case 'transfer':
                        typeLabel = 'Transfer';
                        typeColorClass = 'text-sky-700';
                        nominalHTML = `<span>${formatCurrency(trx.jumlah)}</span>`;
                        kategoriText = 'Transfer';
                        rincianHTML = `<p class="font-semibold text-gray-800">${trx.akunDari} &rarr; ${trx.akunKe}</p>
                                     <p class="text-xs text-gray-500">${trx.keterangan || 'Transfer antar akun'}</p>`;
                        break;
                    case 'dana':
                        typeLabel = 'Trx. Penjualan';
                        typeColorClass = 'text-purple-700';
                        nominalHTML = `<p class="font-semibold text-green-600">${formatCurrency(trx.jumlah)}</p>
                                    <p class="font-normal text-blue-500">+${formatCurrency(trx.fee)}</p>`;
                        kategoriText = 'Trx. Penjualan';
                         rincianHTML = `
                            <p class="font-semibold text-gray-800">${trx.akunDari} &rarr; ${trx.akunKe}</p>
                            <p class="text-xs text-gray-500">${trx.opsiDana}</p>
                        `;
                        break;
                    default:
                        typeLabel = trx.jenis;
                        typeColorClass = 'text-gray-700';
                        nominalHTML = `<span>${formatCurrency(trx.jumlah)}</span>`;
                        kategoriText = trx.kategori || 'Lainnya';
                        rincianHTML = `<p class="font-semibold text-gray-800">${trx.keterangan || 'Detail tidak tersedia'}</p>`;
                }

                row.innerHTML = `
                    <div class="col-span-2 text-right text-xs">
                        <p class="font-bold ${typeColorClass}">${typeLabel}</p>
                        <p class="text-gray-500">${time}</p>
                    </div>
                    <div class="col-span-4 text-sm">${rincianHTML}</div>
                    <div class="col-span-2 text-right text-sm font-semibold">${nominalHTML}</div>
                    <div class="col-span-2 text-sm text-gray-700 truncate">${kategoriText}</div>
                    <div class="col-span-2 text-right flex justify-end items-center gap-2">
                         <button class="btn-edit-transaksi text-gray-400 hover:text-amber-500 p-1" data-id="${trx.id}" title="Ubah"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button>
                         <button class="btn-delete-transaksi text-gray-400 hover:text-rose-500 p-1" data-id="${trx.id}" title="Hapus"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                `;
                container.appendChild(row);
            });
        }
        
        // --- MODAL MANAGEMENT ---
        const formModal = document.getElementById('form-modal');
        const deleteModal = document.getElementById('delete-modal');
        const backupModal = document.getElementById('backup-modal');
        const aboutModal = document.getElementById('about-modal');
        const transaksiModal = document.getElementById('transaksi-modal');
        const produkModal = document.getElementById('produk-modal');
        const hutangModal = document.getElementById('hutang-modal');
        let currentModalCallback;

        function openModal(config) {
            const { title, label, value, inputType = 'text', callback } = config;
            formModal.querySelector('#modal-title').textContent = title;
            formModal.querySelector('#modal-label').textContent = label;
            const input = formModal.querySelector('#modal-input');
            input.value = value;
            input.type = inputType;
            input.placeholder = label;
            currentModalCallback = callback;
            formModal.classList.add('active');
            input.focus();
        }

        function openDeleteModal(itemName, callback) {
            deleteModal.querySelector('#delete-modal-text').textContent = `Tindakan ini akan menghapus "${itemName}" secara permanen.`;
            currentModalCallback = callback;
            deleteModal.classList.add('active');
        }

        function closeModal() {
            document.querySelectorAll('.modal-container').forEach(m => m.classList.remove('active'));
            currentModalCallback = null;
        }

        [formModal, deleteModal, backupModal, aboutModal, transaksiModal, produkModal, hutangModal].forEach(modal => {
            modal.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
            modal.querySelector('button[id$="-cancel"]')?.addEventListener('click', closeModal);
        });
        document.getElementById('about-modal-close').addEventListener('click', closeModal);


        formModal.querySelector('#modal-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const value = formModal.querySelector('#modal-input').value.trim();
            if (value && currentModalCallback) currentModalCallback(value);
            closeModal();
        });
        
        deleteModal.querySelector('#delete-confirm').addEventListener('click', () => {
            if (currentModalCallback) currentModalCallback();
            closeModal();
        });
        
        document.getElementById('about-button').addEventListener('click', () => {
            aboutModal.classList.add('active');
        });

        // --- CRUD & EVENT HANDLING ---
        document.getElementById('pengaturan').addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const crudPage = target.closest('.crud-page');
            if (!crudPage) return;

            const type = crudPage.dataset.type;
            const index = target.dataset.index;

            if (target.classList.contains('btn-add')) {
                 const isAkun = type === 'akun';
                 openModal({
                    title: `Tambah ${appData[type].title} Baru`,
                    label: `Nama ${appData[type].title}`,
                    value: '',
                    callback: (newValue) => {
                        if (isAkun) appData[type].items.push({ name: newValue, balance: 0 });
                        else appData[type].items.push(newValue);
                        saveData();
                        renderAll();
                    }
                });
            } else if (target.classList.contains('btn-edit')) {
                const isAkun = type === 'akun';
                const currentItem = appData[type].items[index];
                openModal({
                    title: `Ubah ${appData[type].title}`,
                    label: `Nama ${appData[type].title}`,
                    value: isAkun ? currentItem.name : currentItem,
                    callback: (newValue) => {
                        if (isAkun) appData[type].items[index].name = newValue;
                        else appData[type].items[index] = newValue;
                        saveData();
                        renderAll();
                    }
                });
            } else if (target.classList.contains('btn-delete')) {
                const isAkun = type === 'akun';
                const itemName = isAkun ? appData[type].items[index].name : appData[type].items[index];
                openDeleteModal(itemName, () => {
                    appData[type].items.splice(index, 1);
                    saveData();
                    renderAll();
                });
            } else if (target.classList.contains('btn-saldo') && type === 'akun') {
                const currentItem = appData[type].items[index];
                openModal({
                    title: `Penyesuaian Saldo`,
                    label: `Saldo untuk ${currentItem.name}`,
                    value: currentItem.balance,
                    inputType: 'number',
                    callback: (newValue) => {
                        appData[type].items[index].balance = parseFloat(newValue) || 0;
                        saveData();
                        renderAll();
                    }
                });
            }
        });
        
        // --- ALL DATA BACKUP/RESTORE ---
        const backupModalTitle = document.getElementById('backup-modal-title');
        const backupDataArea = document.getElementById('backup-data-area');
        const backupCopyBtn = document.getElementById('backup-modal-copy');
        const copyFeedback = document.getElementById('copy-feedback');
        const importJsonInput = document.getElementById('import-json-input');

        document.getElementById('export-all-data').addEventListener('click', async () => {
            const dataToShare = JSON.stringify(appData, null, 2);
            const date = new Date().toISOString().slice(0, 10);
            const fileName = `backup_keuangan_${date}.json`;
            const blob = new Blob([dataToShare], { type: 'application/json' });
            const file = new File([blob], fileName, { type: 'application/json' });

            // Helper function for direct download
            const triggerDownload = () => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            };

            // 1. Try modern Web Share API (ideal for mobile/tablet)
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Backup Data Aplikasi Keuangan',
                        text: `Backup data ${date}`,
                        files: [file],
                    });
                } catch (err) {
                    console.error('Share API gagal, mencoba download langsung:', err);
                    // If sharing is cancelled by user or fails, try direct download as a fallback
                    triggerDownload();
                }
            } else {
                // 2. Fallback to direct download (ideal for desktop)
                try {
                     triggerDownload();
                } catch (err) {
                    // 3. Last resort fallback: show copy-paste modal
                    console.error('Download langsung gagal, menampilkan modal fallback:', err);
                    backupDataArea.value = dataToShare;
                    backupModal.classList.add('active');
                }
            }
        });

        document.getElementById('import-all-data').addEventListener('click', () => {
            importJsonInput.click();
        });

        importJsonInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const dataToImport = e.target.result;
                 try {
                    const parsedData = JSON.parse(dataToImport);
                    openDeleteModal("Ini akan menimpa SEMUA data saat ini dengan data dari file backup. Anda yakin ingin melanjutkan?", () => {
                        appData = parsedData;
                        saveData();
                        loadData(); // Reload untuk memastikan integritas data
                        renderAll();
                    });
                } catch (error) {
                    alert('File backup tidak valid atau rusak. Pastikan file tersebut adalah file JSON yang benar.');
                    console.error("Import Error:", error);
                }
            };
            reader.readAsText(file);
            event.target.value = ''; // Reset input agar bisa memilih file yang sama lagi
        });

        backupCopyBtn.addEventListener('click', () => {
            backupDataArea.select();
            document.execCommand('copy');
            copyFeedback.textContent = 'Data berhasil disalin!';
            setTimeout(() => { copyFeedback.textContent = '' }, 2000);
        });
        
        // --- TRANSAKSI ---
        function updateTransaksiFormUI(jenis) {
            const isTransfer = jenis === 'Transfer';
            const isDana = jenis === 'Dana';
            const isPemasukanPengeluaran = jenis === 'Pemasukan' || jenis === 'Pengeluaran';

            document.getElementById('kategori-field').style.display = isPemasukanPengeluaran ? 'block' : 'none';
            document.getElementById('akun-field').style.display = isPemasukanPengeluaran ? 'block' : 'none';
            document.getElementById('transfer-fields').style.display = (isTransfer || isDana) ? 'block' : 'none';
            document.getElementById('fee-dana-field').style.display = isDana ? 'block' : 'none';
            document.getElementById('dana-opsi-field').style.display = isDana ? 'block' : 'none';
        }

        function openTransaksiModal(trxToEdit = null) {
            const form = document.getElementById('transaksi-form');
            form.reset();
            
            document.getElementById('transaksi-kategori').innerHTML = appData.kategori.items.map(k => `<option value="${k}">${k}</option>`).join('');
            const akunOptions = appData.akun.items.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
            document.getElementById('transaksi-akun').innerHTML = akunOptions;
            document.getElementById('transaksi-akun-dari').innerHTML = akunOptions;
            document.getElementById('transaksi-akun-ke').innerHTML = akunOptions;
            
            if (trxToEdit) {
                document.getElementById('transaksi-modal-title').textContent = 'Ubah Transaksi';
                document.getElementById('transaksi-edit-id').value = trxToEdit.id;
                document.getElementById('transaksi-jenis-select').value = trxToEdit.jenis.charAt(0).toUpperCase() + trxToEdit.jenis.slice(1);
                document.getElementById('transaksi-tanggal').value = trxToEdit.tanggal;
                document.getElementById('transaksi-jumlah').value = trxToEdit.jumlah;
                document.getElementById('transaksi-keterangan').value = trxToEdit.keterangan;
                if(trxToEdit.jenis === 'transfer' || trxToEdit.jenis === 'dana') {
                    document.getElementById('transaksi-akun-dari').value = trxToEdit.akunDari;
                    document.getElementById('transaksi-akun-ke').value = trxToEdit.akunKe;
                } else {
                    document.getElementById('transaksi-kategori').value = trxToEdit.kategori;
                    document.getElementById('transaksi-akun').value = trxToEdit.akun;
                }
                if(trxToEdit.jenis === 'dana') {
                    document.getElementById('transaksi-fee-dana').value = trxToEdit.fee;
                    form.querySelector(`input[name="transaksi-dana-opsi"][value="${trxToEdit.opsiDana}"]`).checked = true;
                }
            } else {
                document.getElementById('transaksi-modal-title').textContent = 'Tambah Transaksi';
                document.getElementById('transaksi-edit-id').value = '';
                document.getElementById('transaksi-tanggal').valueAsDate = new Date();
            }
            updateTransaksiFormUI(document.getElementById('transaksi-jenis-select').value);
            transaksiModal.classList.add('active');
        }

        document.getElementById('btn-add-transaksi').addEventListener('click', () => openTransaksiModal());
        document.getElementById('transaksi-jenis-select').addEventListener('change', (e) => updateTransaksiFormUI(e.target.value));
        
        function revertTransactionBalance(trx) {
            if (!trx) return;
            if (trx.jenis === 'transfer') {
                const akunDari = appData.akun.items.find(a => a.name === trx.akunDari);
                const akunKe = appData.akun.items.find(a => a.name === trx.akunKe);
                if (akunDari) akunDari.balance += trx.jumlah;
                if (akunKe) akunKe.balance -= trx.jumlah;
            } else if (trx.jenis === 'dana') {
                const akunDari = appData.akun.items.find(a => a.name === trx.akunDari);
                const akunKe = appData.akun.items.find(a => a.name === trx.akunKe);
                const labaBersih = appData.akun.items.find(a => a.name === "Laba Bersih");
                if (akunKe) akunKe.balance -= trx.jumlah;
                if (labaBersih) labaBersih.balance -= trx.fee;
                if (akunDari) {
                    if (trx.opsiDana === 'Admin Potong') {
                        akunDari.balance += (trx.jumlah - trx.fee);
                    } else { // Admin Bayar
                        akunDari.balance += trx.jumlah;
                    }
                }
            } else {
                const akun = appData.akun.items.find(a => a.name === trx.akun);
                if (akun) {
                    akun.balance -= (trx.jenis === 'pemasukan' ? trx.jumlah : -trx.jumlah);
                }
            }
        }
        
        document.getElementById('transaksi-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            const editId = parseInt(form.querySelector('#transaksi-edit-id').value);
            const jumlah = parseFloat(form.querySelector('#transaksi-jumlah').value) || 0;
            
            if (editId) {
                revertTransactionBalance(appData.transaksi.items.find(t => t.id === editId));
            }

            const transactionData = {
                id: editId || Date.now(),
                tanggal: form.querySelector('#transaksi-tanggal').value,
                jumlah: jumlah,
                keterangan: form.querySelector('#transaksi-keterangan').value,
                jenis: form.querySelector('#transaksi-jenis-select').value.toLowerCase(),
            };

            if (transactionData.jenis === 'transfer') {
                transactionData.akunDari = form.querySelector('#transaksi-akun-dari').value;
                transactionData.akunKe = form.querySelector('#transaksi-akun-ke').value;
                const akunDari = appData.akun.items.find(a => a.name === transactionData.akunDari);
                const akunKe = appData.akun.items.find(a => a.name === transactionData.akunKe);
                if (akunDari) akunDari.balance -= jumlah;
                if (akunKe) akunKe.balance += jumlah;
            } else if (transactionData.jenis === 'dana') {
                transactionData.akunDari = form.querySelector('#transaksi-akun-dari').value;
                transactionData.akunKe = form.querySelector('#transaksi-akun-ke').value;
                transactionData.fee = parseFloat(form.querySelector('#transaksi-fee-dana').value) || 0;
                transactionData.opsiDana = form.querySelector('input[name="transaksi-dana-opsi"]:checked').value;
                const akunDari = appData.akun.items.find(a => a.name === transactionData.akunDari);
                const akunKe = appData.akun.items.find(a => a.name === transactionData.akunKe);
                const labaBersih = appData.akun.items.find(a => a.name === "Laba Bersih");
                
                if(akunKe) akunKe.balance += jumlah;
                if(labaBersih) labaBersih.balance += transactionData.fee;
                if(akunDari){
                    if(transactionData.opsiDana === 'Admin Potong') {
                        akunDari.balance -= (jumlah - transactionData.fee);
                    } else { // Admin Bayar
                        akunDari.balance -= jumlah;
                    }
                }
            } else {
                transactionData.kategori = form.querySelector('#transaksi-kategori').value;
                transactionData.akun = form.querySelector('#transaksi-akun').value;
                const akun = appData.akun.items.find(a => a.name === transactionData.akun);
                if (akun) {
                    akun.balance += (transactionData.jenis === 'pemasukan' ? jumlah : -jumlah);
                }
            }
            
            if (editId) {
                const index = appData.transaksi.items.findIndex(t => t.id === editId);
                if (index > -1) appData.transaksi.items[index] = transactionData;
            } else {
                appData.transaksi.items.push(transactionData);
            }

            saveData();
            renderAll();
            closeModal();
        });
        
        document.getElementById('transaksi-list-container').addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-edit-transaksi');
            const deleteBtn = e.target.closest('.btn-delete-transaksi');

            if(editBtn) {
                const trxId = parseInt(editBtn.dataset.id);
                const trx = appData.transaksi.items.find(t => t.id === trxId);
                if (trx) openTransaksiModal(trx);
            }
            if(deleteBtn) {
                const trxId = parseInt(deleteBtn.dataset.id);
                 const trx = appData.transaksi.items.find(t => t.id === trxId);
                if(trx) {
                    let trxName = trx.keterangan || trx.kategori || `Transaksi ${trx.jenis}`;
                    openDeleteModal(`Transaksi "${trxName}"`, () => {
                        revertTransactionBalance(trx);
                        appData.transaksi.items = appData.transaksi.items.filter(t => t.id !== trxId);
                        saveData();
                        renderAll();
                    });
                }
            }
        });

        // --- PRODUK ---
        document.getElementById('btn-add-produk').addEventListener('click', () => openProdukModal());
        
        function openProdukModal(produkToEdit = null) {
            const form = document.getElementById('produk-form');
            form.reset();
            const modalTitle = document.getElementById('produk-modal-title');
            const editIdInput = document.getElementById('produk-edit-id');

            if (produkToEdit) {
                modalTitle.textContent = 'Ubah Produk';
                editIdInput.value = produkToEdit.id;
                form.querySelector('#produk-nama').value = produkToEdit.nama;
                form.querySelector('#produk-harga-modal').value = produkToEdit.hargaModal;
                form.querySelector('#produk-harga-jual').value = produkToEdit.hargaJual;
                form.querySelector('#produk-stok').value = produkToEdit.stok;
            } else {
                modalTitle.textContent = 'Tambah Produk';
                editIdInput.value = '';
            }
            produkModal.classList.add('active');
        }

        document.getElementById('produk-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            const editId = parseFloat(form.querySelector('#produk-edit-id').value);
            
            const produkData = {
                id: editId || (Date.now() + Math.random()),
                nama: form.querySelector('#produk-nama').value,
                hargaModal: parseFloat(form.querySelector('#produk-harga-modal').value) || 0,
                hargaJual: parseFloat(form.querySelector('#produk-harga-jual').value) || 0,
                stok: parseInt(form.querySelector('#produk-stok').value) || 0,
            };

            if (editId) {
                const index = appData.produk.items.findIndex(p => p.id === editId);
                if (index !== -1) {
                    appData.produk.items[index] = produkData;
                }
            } else {
                appData.produk.items.push(produkData);
            }

            saveData();
            renderAll();
            closeModal();
        });
        
        document.getElementById('produk-list-container').addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-edit-produk');
            const deleteBtn = e.target.closest('.btn-delete-produk');

            if (editBtn) {
                const produkId = parseFloat(editBtn.dataset.id);
                const produkToEdit = appData.produk.items.find(p => p.id === produkId);
                if (produkToEdit) {
                    openProdukModal(produkToEdit);
                }
            }

            if (deleteBtn) {
                const produkId = parseFloat(deleteBtn.dataset.id);
                const index = appData.produk.items.findIndex(p => p.id === produkId);
                if (index !== -1) {
                    openDeleteModal(`produk "${appData.produk.items[index].nama}"`, () => {
                        appData.produk.items.splice(index, 1);
                        saveData();
                        renderAll();
                    });
                }
            }
        });
        
        function renderProdukList() {
            const container = document.getElementById('produk-list-container');
            container.innerHTML = '';

            if (appData.produk.items.length === 0) {
                 container.innerHTML = `<div class="text-center py-10 px-4">
                    <p class="text-gray-500">Belum ada produk.</p>
                    <p class="text-sm text-gray-400 mt-1">Klik 'Tambah Produk' untuk memulai.</p>
                </div>`;
                return;
            }
            
            const table = document.createElement('table');
            table.className = 'w-full text-sm text-left';

            table.innerHTML = `
                <thead class="bg-gray-50 text-xs text-gray-600 uppercase sticky top-0">
                    <tr>
                        <th class="p-3">Nama Produk</th>
                        <th class="p-3">Harga</th>
                        <th class="p-3 text-center">Stok</th>
                        <th class="p-3 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${appData.produk.items.map(produk => `
                        <tr class="border-b">
                            <td class="p-3 font-semibold text-gray-800">${produk.nama}</td>
                            <td class="p-3 text-gray-600 whitespace-nowrap">
                                <span class="mr-3">Modal: <b class="text-gray-800">${formatCurrency(produk.hargaModal)}</b></span>
                                <span>Jual: <b class="text-gray-800">${formatCurrency(produk.hargaJual)}</b></span>
                            </td>
                            <td class="p-3 text-center font-semibold">${produk.stok}</td>
                            <td class="p-3">
                                <div class="flex items-center justify-end space-x-2">
                                    <button class="btn-edit-produk text-amber-500 hover:text-amber-600 p-1" data-id="${produk.id}" title="Ubah">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                    </button>
                                    <button class="btn-delete-produk text-rose-500 hover:text-rose-600 p-1" data-id="${produk.id}" title="Hapus">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            
            container.appendChild(table);
        }

        function renderProdukSummary() {
            const totalStokEl = document.getElementById('total-stok-produk');
            const totalAsetEl = document.getElementById('total-aset-produk');

            const totalStok = appData.produk.items.reduce((sum, produk) => sum + produk.stok, 0);
            const totalAset = appData.produk.items.reduce((sum, produk) => sum + (produk.hargaModal * produk.stok), 0);

            totalStokEl.textContent = totalStok.toLocaleString('id-ID');
            totalAsetEl.textContent = formatCurrency(totalAset);
        }
        
        // --- PRODUK CSV ---
        document.getElementById('export-produk-csv').addEventListener('click', () => {
            let csvContent = "data:text/csv;charset=utf-8,nama,harga_modal,harga_jual,stok\n";
            appData.produk.items.forEach(p => {
                const row = `"${p.nama.replace(/"/g, '""')}",${p.hargaModal},${p.hargaJual},${p.stok}\n`;
                csvContent += row;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            const date = new Date().toISOString().slice(0, 10);
            link.setAttribute("download", `backup_produk_${date}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        const produkFileInput = document.getElementById('produk-csv-file-input');
        document.getElementById('import-produk-csv').addEventListener('click', () => produkFileInput.click());
        produkFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const newProdukList = [];
                const rows = text.split('\n').slice(1);

                rows.forEach(row => {
                    if (!row.trim()) return;
                    const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                    const nama = (values[0] || '').trim().replace(/^"|"$/g, '');
                    const hargaModal = parseFloat(values[1]) || 0;
                    const hargaJual = parseFloat(values[2]) || 0;
                    const stok = parseInt(values[3]) || 0;
                    
                    if (nama) {
                        newProdukList.push({ id: Date.now() + Math.random(), nama, hargaModal, hargaJual, stok });
                    }
                });
                
                openDeleteModal("Mengimpor akan menimpa semua data produk saat ini. Lanjutkan?", () => {
                    appData.produk.items = newProdukList;
                    saveData();
                    renderAll();
                });
            };
            reader.readAsText(file);
            event.target.value = '';
        });

        // --- KASIR ---
        const kasirPage = document.getElementById('kasir');
        const tabBtns = kasirPage.querySelectorAll('.tab-btn');
        const tabPanels = kasirPage.querySelectorAll('.tab-panel');
        const kasirProdukSelect = document.getElementById('kasir-produk-select');
        const kasirAplikasiSelect = document.getElementById('kasir-aplikasi-select');
        const kasirJasaSumberAkunSelect = document.getElementById('kasir-jasa-sumber-akun');
        const kasirAplikasiSumberAkunSelect = document.getElementById('kasir-aplikasi-sumber-akun');
        const keranjangItemList = document.getElementById('keranjang-item-list');
        const keranjangTotalEl = document.getElementById('keranjang-total');

        function getKeranjangItemIcon(type) {
            switch (type) {
                case 'produk':
                    return `<div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                            </div>`;
                case 'jasa':
                    return `<div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-500 flex items-center justify-center mr-3 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>
                            </div>`;
                case 'aplikasi':
                    return `<div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center mr-3 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            </div>`;
                default:
                    return `<div class="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center mr-3 flex-shrink-0">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            </div>`;
            }
        }

        function renderKasirDropdowns() {
            // Populate produk
            kasirProdukSelect.innerHTML = appData.produk.items.map(p => `<option value="${p.id}">${p.nama} - ${formatCurrency(p.hargaJual)}</option>`).join('');
            // Populate aplikasi dropdowns
            if (kasirAplikasiSelect) { // Fallback for old structure
                kasirAplikasiSelect.innerHTML = appData.aplikasi.items.map(a => `<option value="${a}">${a}</option>`).join('');
            }
            if (kasirAplikasiSumberAkunSelect) {
                kasirAplikasiSumberAkunSelect.innerHTML = appData.akun.items.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
            }
            // Populate sumber akun for jasa
            if (kasirJasaSumberAkunSelect) {
                kasirJasaSumberAkunSelect.innerHTML = appData.akun.items.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
            }
        }

        function updateKeranjangTotal() {
            const total = keranjang.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
            keranjangTotalEl.textContent = formatCurrency(total);
        }

        function renderKeranjang() {
            if (keranjang.length === 0) {
                keranjangItemList.innerHTML = `<p class="text-center text-gray-500 text-sm py-8">Keranjang masih kosong.</p>`;
                updateKeranjangTotal();
                return;
            }

            keranjangItemList.innerHTML = keranjang.map((item, index) => `
                <div class="py-2 border-b border-gray-100 flex items-center">
                    ${getKeranjangItemIcon(item.type)}
                    <div class="flex-grow">
                        <div class="flex justify-between items-start">
                            <div class="flex-1 mr-2">
                                <p class="font-semibold text-xs">${item.nama}</p>
                                <p class="text-xs text-gray-500">${item.jumlah} x ${formatCurrency(item.harga)}</p>
                            </div>
                            <div class="flex items-center">
                                 <p class="font-semibold text-xs mr-2">${formatCurrency(item.jumlah * item.harga)}</p>
                                 <button class="btn-hapus-keranjang text-rose-500 hover:text-rose-600 p-1" data-index="${index}" title="Hapus">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            updateKeranjangTotal();
        }

        function addToKeranjang(item) {
            // Cek jika produk sudah ada, update jumlahnya
            const existingItem = keranjang.find(i => i.id === item.id && i.id !== undefined);
            if (existingItem) {
                existingItem.jumlah += item.jumlah;
            } else {
                keranjang.push(item);
            }
            renderKeranjang();
        }

        function renderKasirRiwayat() {
            const container = document.getElementById('kasir-riwayat-list');
            const salesTransactions = appData.transaksi.items
                .filter(t => t.kategori === 'Penjualan')
                .sort((a, b) => {
                    // Urutkan berdasarkan tanggal (terbaru dulu), lalu berdasarkan waktu (terbaru dulu)
                    const dateComparison = new Date(b.tanggal) - new Date(a.tanggal);
                    if (dateComparison !== 0) {
                        return dateComparison;
                    }
                    return b.id - a.id;
                });

            if (salesTransactions.length === 0) {
                container.innerHTML = `<div class="text-center py-10 px-4"><p class="text-gray-500">Belum ada penjualan.</p></div>`;
                return;
            }
            
            container.innerHTML = `<div class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase grid grid-cols-12 gap-x-2 px-3 py-2 border-b">
                <div class="col-span-2 text-right">Waktu</div>
                <div class="col-span-7">Rincian</div>
                <div class="col-span-2 text-right">Harga</div>
                <div class="col-span-1 text-right">Aksi</div>
            </div>`;

            let lastDate = null;
            salesTransactions.forEach((trx, index) => {
                const trxDate = new Date(trx.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'});
                
                if (trxDate !== lastDate) {
                    const dateHeader = document.createElement('div');
                    dateHeader.className = 'text-center text-xs font-bold text-gray-500 py-2 bg-gray-100 border-b';
                    dateHeader.textContent = trxDate;
                    container.appendChild(dateHeader);
                    lastDate = trxDate;
                }

                const row = document.createElement('div');
                row.className = `grid grid-cols-12 gap-x-2 px-3 py-2 border-b text-xs items-start`;
                
                const time = new Date(trx.id).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const item = trx.items[0];

                const totalModal = (item.hargaModal || 0) * item.jumlah;
                const totalLaba = trx.jumlah - totalModal;

                const saleType = item.type.charAt(0).toUpperCase() + item.type.slice(1);
                const typeColorClass = saleType === 'Produk' ? 'text-blue-600' : (saleType === 'Jasa' ? 'text-emerald-600' : 'text-indigo-600');

                row.innerHTML = `
                    <div class="col-span-2 text-right">
                        <p class="font-bold ${typeColorClass}">${saleType}</p>
                        <p class="text-gray-500">${time}</p>
                    </div>
                    <div class="col-span-7 min-w-0">
                        <p class="font-semibold text-gray-800 truncate">${item.nama}</p>
                        <p class="text-gray-500">${item.jumlah} x ${formatCurrency(item.harga)}</p>
                    </div>
                    <div class="col-span-2 text-right">
                        <p class="font-semibold text-gray-700">${formatCurrency(totalModal)}</p>
                        <p class="text-green-600">${formatCurrency(totalLaba)}</p>
                    </div>
                    <div class="col-span-1 text-right flex justify-end items-center h-full">
                         <button class="btn-delete-penjualan text-gray-400 hover:text-rose-500 p-1" data-id="${trx.id}" title="Hapus">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                `;
                container.appendChild(row);
            });
        }

        // Event Listeners for Kasir Page
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetPanelId = btn.dataset.target;

                // Reset all buttons to inactive state
                tabBtns.forEach(b => {
                    b.classList.remove('bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'text-white', 'font-bold', 'shadow-lg');
                    b.classList.add('bg-gray-200', 'text-gray-700', 'font-semibold');
                });

                // Set active state for the clicked button
                btn.classList.remove('bg-gray-200', 'text-gray-700', 'font-semibold');
                let activeClasses = [];
                switch (targetPanelId) {
                    case 'panel-produk':
                        activeClasses = ['bg-blue-500', 'text-white', 'font-bold', 'shadow-lg'];
                        break;
                    case 'panel-jasa':
                        activeClasses = ['bg-emerald-500', 'text-white', 'font-bold', 'shadow-lg'];
                        break;
                    case 'panel-aplikasi':
                        activeClasses = ['bg-indigo-500', 'text-white', 'font-bold', 'shadow-lg'];
                        break;
                }
                btn.classList.add(...activeClasses);


                // Show the correct panel
                tabPanels.forEach(p => p.classList.add('hidden'));
                document.getElementById(targetPanelId).classList.remove('hidden');
            });
        });

        document.getElementById('kasir-tambah-produk').addEventListener('click', () => {
            const produkId = parseFloat(kasirProdukSelect.value);
            const produk = appData.produk.items.find(p => p.id === produkId);
            if (!produk) return;

            const jumlah = parseInt(document.getElementById('kasir-produk-jumlah').value) || 1;
            const tanggal = document.getElementById('kasir-produk-tanggal').value;

            addToKeranjang({
                id: produk.id,
                nama: produk.nama,
                jumlah,
                harga: produk.hargaJual,
                hargaModal: produk.hargaModal,
                type: 'produk',
                tanggal: tanggal
            });
        });

        document.getElementById('kasir-tambah-jasa').addEventListener('click', () => {
            const nama = document.getElementById('kasir-jasa-nama').value.trim();
            const hargaModal = parseFloat(document.getElementById('kasir-jasa-harga-modal').value) || 0;
            const hargaJual = parseFloat(document.getElementById('kasir-jasa-harga-jual').value) || 0;
            const tanggal = document.getElementById('kasir-jasa-tanggal').value;
            if (!nama || hargaJual <= 0) return;

            addToKeranjang({
                id: `jasa-${Date.now()}`,
                nama,
                jumlah: 1,
                harga: hargaJual,
                hargaModal: hargaModal,
                type: 'jasa',
                tanggal: tanggal
            });
            document.getElementById('kasir-jasa-nama').value = '';
            document.getElementById('kasir-jasa-harga-modal').value = '';
            document.getElementById('kasir-jasa-harga-jual').value = '';
        });

        document.getElementById('kasir-tambah-aplikasi').addEventListener('click', () => {
            const sumberAkun = kasirAplikasiSumberAkunSelect.value;
            const hargaModal = parseFloat(document.getElementById('kasir-aplikasi-harga-modal').value) || 0;
            const hargaJual = parseFloat(document.getElementById('kasir-aplikasi-harga-jual').value) || 0;
            const tanggal = document.getElementById('kasir-aplikasi-tanggal').value;
            if (hargaJual <= 0 || !sumberAkun) return;
            
            addToKeranjang({
                id: `apk-${Date.now()}`,
                nama: `Aplikasi (${sumberAkun})`,
                jumlah: 1,
                harga: hargaJual,
                hargaModal: hargaModal,
                sumberAkun: sumberAkun,
                type: 'aplikasi',
                tanggal: tanggal
            });
             document.getElementById('kasir-aplikasi-harga-modal').value = '';
             document.getElementById('kasir-aplikasi-harga-jual').value = '';
        });

        keranjangItemList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-hapus-keranjang');
            if (deleteBtn) {
                const index = parseInt(deleteBtn.dataset.index);
                keranjang.splice(index, 1);
                renderKeranjang();
            }
        });

        document.getElementById('keranjang-bayar-btn').addEventListener('click', () => {
            if (keranjang.length === 0) return;

            const akunKas = appData.akun.items.find(a => a.name === 'Cash');
            const akunLaba = appData.akun.items.find(a => a.name === 'Laba Bersih');
            const akunModalProduk = appData.akun.items.find(a => a.name === 'Modal');

            // Proses setiap item di keranjang sebagai transaksi terpisah
            keranjang.forEach(item => {
                const itemJual = item.harga * item.jumlah;
                const itemModal = (item.hargaModal || 0) * item.jumlah;
                const itemLaba = itemJual - itemModal;

                // --- UPDATE SALDO ---
                // 1. Laba bersih selalu dicatat ke Laba Bersih
                if (akunLaba) {
                    akunLaba.balance += itemLaba;
                }
                
                // 2. Logika saldo berdasarkan tipe item
                if (item.type === 'produk' || item.type === 'jasa') {
                    // Nilai modal produk & jasa ditambahkan ke akun "Modal"
                    if (akunModalProduk) akunModalProduk.balance += itemModal;
                    
                    // Kurangi stok jika itu produk
                    if (item.type === 'produk') {
                        const produkDiData = appData.produk.items.find(p => p.id === item.id);
                        if (produkDiData) {
                            produkDiData.stok -= item.jumlah;
                        }
                    }
                } else if (item.type === 'aplikasi') {
                    const akunSumber = appData.akun.items.find(a => a.name === item.sumberAkun);
                    // Kurangi modal dari sumber akun
                    if (akunSumber) akunSumber.balance -= itemModal;
                    // Tambahkan modal ke cash
                    if (akunKas) akunKas.balance += itemModal;
                }
                
                // 3. Buat entri transaksi terpisah
                const transactionData = {
                    id: Date.now() + Math.random(), // Tambah Math.random() untuk handle transaksi cepat
                    tanggal: item.tanggal,
                    jumlah: itemJual,
                    items: [JSON.parse(JSON.stringify(item))], // Hanya item ini dalam transaksi
                    keterangan: `Penjualan: ${item.nama} (x${item.jumlah})`,
                    jenis: 'pemasukan',
                    kategori: 'Penjualan',
                    akun: 'Cash'
                };
                
                appData.transaksi.items.push(transactionData);
            });
            
            // Clear keranjang setelah semua item diproses
            keranjang = [];
            renderKeranjang();
            saveData();
            renderAll();
        });

        function revertSaleTransaction(trx) {
            if (!trx || trx.kategori !== 'Penjualan' || trx.items.length === 0) return;

            const item = trx.items[0];
            const totalJual = trx.jumlah;
            const itemModal = (item.hargaModal || 0) * item.jumlah;
            const itemLaba = totalJual - itemModal;

            const akunKas = appData.akun.items.find(a => a.name === 'Cash');
            const akunLaba = appData.akun.items.find(a => a.name === 'Laba Bersih');
            const akunModalProduk = appData.akun.items.find(a => a.name === 'Modal');
            
            // 1. Revert Laba for all types
            if (akunLaba) akunLaba.balance -= itemLaba;

            // 2. Revert modal, cash, and stock based on type
            if (item.type === 'produk' || item.type === 'jasa') {
                // Revert modal addition
                if (akunModalProduk) akunModalProduk.balance -= itemModal;
                
                // Add back stock if it's a product
                if (item.type === 'produk') {
                    const produkDiData = appData.produk.items.find(p => p.id === item.id);
                    if (produkDiData) {
                        produkDiData.stok += item.jumlah;
                    }
                }
            } else if (item.type === 'aplikasi') {
                // Revert modal reduction from source account
                const akunSumber = appData.akun.items.find(a => a.name === item.sumberAkun);
                if (akunSumber) akunSumber.balance += itemModal;
                 // Revert modal addition to cash
                if (akunKas) akunKas.balance -= itemModal;
            }
        }

        document.getElementById('kasir-riwayat-list').addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete-penjualan');
            
            if (deleteBtn) {
                const trxId = parseFloat(deleteBtn.dataset.id);
                const trx = appData.transaksi.items.find(t => t.id === trxId);
                if (trx) {
                    openDeleteModal(`Penjualan senilai ${formatCurrency(trx.jumlah)}`, () => {
                        revertSaleTransaction(trx);
                        appData.transaksi.items = appData.transaksi.items.filter(t => t.id !== trxId);
                        saveData();
                        renderAll();
                    });
                }
            }

        });

        // --- FILTER Minimalis ---
        const filterPresetContainer = document.getElementById('filter-presets');
        const filterStartDate = document.getElementById('filter-start-date');
        const filterEndDate = document.getElementById('filter-end-date');

        function applyFilter(type, start = null, end = null) {
            dateFilter = { type, start, end };
            renderDashboard();
            updateFilterUI();
        }

        function updateFilterUI() {
            // Reset all preset buttons to inactive state
            document.querySelectorAll('#filter-presets .filter-btn').forEach(btn => {
                btn.classList.remove('bg-sky-500', 'text-white', 'shadow');
                btn.classList.add('text-sky-700', 'hover:bg-sky-100');
            });

            // If a preset is active, highlight it
            if (dateFilter.type !== 'custom') {
                const activeButton = document.querySelector(`.filter-btn[data-filter="${dateFilter.type}"]`);
                if (activeButton) {
                    activeButton.classList.add('bg-sky-500', 'text-white', 'shadow');
                    activeButton.classList.remove('text-sky-700', 'hover:bg-sky-100');
                }
                // Clear date inputs when a preset is active
                filterStartDate.value = '';
                filterEndDate.value = '';
            }
        }

        function setInitialFilter() {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            applyFilter('month', startOfMonth, endOfMonth);
        }

        filterPresetContainer.addEventListener('click', (e) => {
            const filterBtn = e.target.closest('.filter-btn');
            if (!filterBtn) return;

            const selection = filterBtn.dataset.filter;
            let start, end;
            const now = new Date();

            switch(selection) {
                case 'today':
                    start = new Date(new Date().setHours(0, 0, 0, 0));
                    end = new Date(new Date().setHours(23, 59, 59, 999));
                    break;
                case 'month':
                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                    break;
                case 'year':
                    start = new Date(now.getFullYear(), 0, 1);
                    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                    break;
            }
            applyFilter(selection, start, end);
        });

        [filterStartDate, filterEndDate].forEach(input => {
            input.addEventListener('change', () => {
                const start = filterStartDate.value ? new Date(filterStartDate.value) : null;
                const end = filterEndDate.value ? new Date(filterEndDate.value) : null;
                
                if (start && end && start <= end) {
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    applyFilter('custom', start, end);
                }
            });
        });

        // --- HUTANG ---
        document.getElementById('btn-add-hutang').addEventListener('click', () => openHutangModal());

        function openHutangModal(hutangToEdit = null) {
            const form = document.getElementById('hutang-form');
            form.reset();
            const modalTitle = document.getElementById('hutang-modal-title');
            const editIdInput = document.getElementById('hutang-edit-id');

            if (hutangToEdit) {
                modalTitle.textContent = 'Ubah Hutang';
                editIdInput.value = hutangToEdit.id;
                form.querySelector('#hutang-tanggal').value = hutangToEdit.tanggal;
                form.querySelector('#hutang-nama').value = hutangToEdit.nama;
                form.querySelector('#hutang-nominal').value = hutangToEdit.nominal;
                form.querySelector('#hutang-catatan').value = hutangToEdit.catatan;
            } else {
                modalTitle.textContent = 'Tambah Hutang';
                editIdInput.value = '';
                form.querySelector('#hutang-tanggal').valueAsDate = new Date();
            }
            hutangModal.classList.add('active');
        }

        document.getElementById('hutang-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            const editId = parseFloat(form.querySelector('#hutang-edit-id').value);
            const catatan = form.querySelector('#hutang-catatan').value.trim();
            const nominal = parseFloat(form.querySelector('#hutang-nominal').value) || 0;
            
            if(!catatan){
                form.querySelector('#hutang-catatan').classList.add('ring-2', 'ring-red-500');
                return;
            } else {
                 form.querySelector('#hutang-catatan').classList.remove('ring-2', 'ring-red-500');
            }
            
            const akunKas = appData.akun.items.find(a => a.name === 'Cash');
            const akunHutang = appData.akun.items.find(a => a.name === 'Hutang');

            if (editId) {
                const index = appData.hutang.items.findIndex(p => p.id === editId);
                if (index !== -1) {
                    const oldHutang = appData.hutang.items[index];
                    const nominalDifference = nominal - oldHutang.nominal;

                    // Jika hutang belum lunas, sesuaikan Cash dan Hutang dengan selisih nominal
                    if (oldHutang.status === 'Belum Lunas') {
                        if (akunKas) akunKas.balance -= nominalDifference;
                        if (akunHutang) akunHutang.balance += nominalDifference;
                    }

                    // Perbarui data hutang
                    appData.hutang.items[index].tanggal = form.querySelector('#hutang-tanggal').value;
                    appData.hutang.items[index].nama = form.querySelector('#hutang-nama').value.trim();
                    appData.hutang.items[index].nominal = nominal;
                    appData.hutang.items[index].catatan = catatan;
                }
            } else {
                const hutangData = {
                    id: (Date.now() + Math.random()),
                    tanggal: form.querySelector('#hutang-tanggal').value,
                    nama: form.querySelector('#hutang-nama').value.trim(),
                    nominal: nominal,
                    catatan: catatan,
                    status: 'Belum Lunas'
                };
                // Saat hutang baru dibuat:
                // 1. Kurangi saldo Cash
                if (akunKas) {
                    akunKas.balance -= nominal;
                }
                // 2. Tambahkan ke akun Hutang
                if (akunHutang) {
                    akunHutang.balance += nominal;
                }
                appData.hutang.items.push(hutangData);
            }

            saveData();
            renderAll();
            closeModal();
        });

        function renderHutangLists() {
            const belumLunasContainer = document.getElementById('hutang-list-container');
            const lunasContainer = document.getElementById('hutang-lunas-list-container');
            belumLunasContainer.innerHTML = '';
            lunasContainer.innerHTML = '';

            const hutangBelumLunas = appData.hutang.items.filter(item => item.status === 'Belum Lunas');
            const hutangLunas = appData.hutang.items.filter(item => item.status === 'Lunas');

            if (hutangBelumLunas.length === 0) {
                 belumLunasContainer.innerHTML = `<div class="text-center py-10 px-4"><p class="text-gray-500">Tidak ada hutang aktif.</p></div>`;
            } else {
                const table = document.createElement('table');
                table.className = 'w-full text-sm text-left';
                table.innerHTML = `
                    <thead class="bg-gray-50 text-xs text-gray-600 uppercase sticky top-0">
                        <tr>
                            <th class="p-3">Tanggal</th>
                            <th class="p-3">Nama</th>
                            <th class="p-3">Catatan</th>
                            <th class="p-3 text-right">Nominal</th>
                            <th class="p-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hutangBelumLunas.map(item => `
                            <tr class="border-b">
                                <td class="p-3 whitespace-nowrap">${new Date(item.tanggal).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</td>
                                <td class="p-3 font-semibold text-gray-800">${item.nama}</td>
                                <td class="p-3 text-gray-600">${item.catatan}</td>
                                <td class="p-3 text-right font-semibold">${formatCurrency(item.nominal)}</td>
                                <td class="p-3">
                                    <div class="flex items-center justify-center space-x-1">
                                        <button class="btn-lunas bg-green-100 text-green-700 font-bold py-1 px-2 rounded-lg text-xs" data-id="${item.id}" title="Tandai Lunas">Lunas</button>
                                        <button class="btn-edit-hutang text-amber-500 hover:text-amber-600 p-1" data-id="${item.id}" title="Ubah"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button>
                                        <button class="btn-delete-hutang text-rose-500 hover:text-rose-600 p-1" data-id="${item.id}" title="Hapus"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>`;
                belumLunasContainer.appendChild(table);
            }
            
            if (hutangLunas.length === 0) {
                 lunasContainer.innerHTML = `<div class="text-center py-10 px-4"><p class="text-gray-500">Belum ada riwayat hutang lunas.</p></div>`;
            } else {
                 const table = document.createElement('table');
                table.className = 'w-full text-sm text-left';
                table.innerHTML = `
                    <thead class="bg-gray-50 text-xs text-gray-600 uppercase sticky top-0">
                        <tr>
                            <th class="p-3">Tanggal</th>
                            <th class="p-3">Nama</th>
                            <th class="p-3">Catatan</th>
                            <th class="p-3 text-right">Nominal</th>
                            <th class="p-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hutangLunas.map(item => `
                            <tr class="border-b bg-green-50/50">
                                <td class="p-3 whitespace-nowrap">${new Date(item.tanggal).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</td>
                                <td class="p-3 font-semibold text-gray-800">${item.nama}</td>
                                <td class="p-3 text-gray-600">${item.catatan}</td>
                                <td class="p-3 text-right font-semibold">${formatCurrency(item.nominal)}</td>
                                <td class="p-3 text-center">
                                     <button class="btn-batal-lunas text-gray-500 hover:text-gray-700 p-1" data-id="${item.id}" title="Batalkan Status Lunas">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3"></path></svg>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>`;
                lunasContainer.appendChild(table);
            }
        }

        document.getElementById('hutang').addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-edit-hutang');
            const deleteBtn = e.target.closest('.btn-delete-hutang');
            const lunasBtn = e.target.closest('.btn-lunas');
            const batalLunasBtn = e.target.closest('.btn-batal-lunas');

            const findHutang = (id) => appData.hutang.items.find(p => p.id === parseFloat(id));
            const akunKas = appData.akun.items.find(a => a.name === 'Cash');
            const akunHutang = appData.akun.items.find(a => a.name === 'Hutang');

            if (lunasBtn) {
                const hutang = findHutang(lunasBtn.dataset.id);
                if (hutang) {
                    hutang.status = 'Lunas';
                    // Saat hutang lunas:
                    // 1. Kurangi saldo Hutang
                    if (akunHutang) akunHutang.balance -= hutang.nominal;
                    // 2. Tambahkan ke akun Cash (uang kembali)
                    if (akunKas) akunKas.balance += hutang.nominal;
                    saveData();
                    renderAll();
                }
            }

            if(batalLunasBtn) {
                 const hutang = findHutang(batalLunasBtn.dataset.id);
                if (hutang) {
                    hutang.status = 'Belum Lunas';
                    // Saat pelunasan dibatalkan:
                    // 1. Tambahkan kembali ke saldo Hutang
                    if (akunHutang) akunHutang.balance += hutang.nominal;
                    // 2. Ambil kembali uang dari Cash
                    if (akunKas) akunKas.balance -= hutang.nominal;
                    saveData();
                    renderAll();
                }
            }

            if (editBtn) {
                const hutang = findHutang(editBtn.dataset.id);
                if (hutang) openHutangModal(hutang);
            }

            if (deleteBtn) {
                const hutangId = parseFloat(deleteBtn.dataset.id);
                const index = appData.hutang.items.findIndex(p => p.id === hutangId);
                if (index !== -1) {
                    const hutangToDelete = appData.hutang.items[index];
                    openDeleteModal(`data hutang untuk "${hutangToDelete.nama}"`, () => {
                        // Jika hutang yang dihapus belum lunas, kembalikan transaksi
                        if (hutangToDelete.status === 'Belum Lunas') {
                            // 1. Kembalikan nominal ke Cash
                            if (akunKas) akunKas.balance += hutangToDelete.nominal;
                            // 2. Kurangi nominal dari akun Hutang
                            if (akunHutang) akunHutang.balance -= hutangToDelete.nominal;
                        }
                        // Jika sudah lunas, tidak ada perubahan saldo saat dihapus
                        appData.hutang.items.splice(index, 1);
                        saveData();
                        renderAll();
                    });
                }
            }
        });

        const toggleLunasBtn = document.getElementById('toggle-lunas-history');
        const lunasWrapper = document.getElementById('hutang-lunas-wrapper');

        toggleLunasBtn.addEventListener('click', () => {
            lunasWrapper.classList.toggle('hidden');
            if (lunasWrapper.classList.contains('hidden')) {
                toggleLunasBtn.textContent = 'Tampilkan';
            } else {
                toggleLunasBtn.textContent = 'Sembunyikan';
            }
        });


        // --- NAVIGATION & INITIALIZATION ---
        const pages = document.querySelectorAll('.page');
        const headerTitle = document.getElementById('header-title');
        const headerIcon = document.getElementById('header-icon');
        const sidebar = document.getElementById('account-sidebar');
        const sidebarBackdrop = document.getElementById('account-sidebar-backdrop');
        const sidebarToggle = document.getElementById('account-sidebar-toggle');
        const subNavItems = document.querySelectorAll('.sub-nav-item');
        const subPages = document.querySelectorAll('.sub-page');

        function showPage(pageId) {
            const icons = {
                dasbor: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>`,
                kasir: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>`,
                transaksi: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
                laporan: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`,
                produk: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>`,
                hutang: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>`,
                pengaturan: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
            };

            pages.forEach(page => page.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

            const pageElement = document.getElementById(pageId);
            if (pageElement) pageElement.classList.add('active');
            
            document.querySelectorAll(`.nav-item[data-page="${pageId}"]`).forEach(item => {
                item.classList.add('active');
            });

            const bottomNavItem = document.querySelector(`nav .nav-item[data-page="${pageId}"] .nav-text`);
            if (bottomNavItem) {
                 headerTitle.textContent = bottomNavItem.textContent;
            } else {
                 headerTitle.textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
            }

            if (headerIcon) {
                headerIcon.innerHTML = icons[pageId] || '';
            }
        }

        document.body.addEventListener('click', e => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const pageId = navItem.dataset.page;
                showPage(pageId);
                if (pageId === 'pengaturan') showSubPage('pengaturan-main');
                 if (window.innerWidth < 1024) { // Selalu tutup sidebar di mode portrait/mobile
                    closeSidebar();
                }
            }
        });

        function openSidebar() { 
            sidebar.classList.remove('-translate-x-full'); 
            sidebarBackdrop.classList.remove('hidden'); 
        }
        function closeSidebar() { 
            sidebar.classList.add('-translate-x-full'); 
            sidebarBackdrop.classList.add('hidden'); 
        }
        function showSubPage(subPageId) {
            subPages.forEach(sp => sp.classList.remove('active'));
            document.getElementById(subPageId)?.classList.add('active');
        }

        sidebarToggle.addEventListener('click', openSidebar);
        sidebarBackdrop.addEventListener('click', closeSidebar);
        
        // --- Swipe Gesture for Sidebar ---
        let touchStartX = 0;
        let touchEndX = 0;

        function handleGesture() {
            if (touchEndX === 0) return; // Mencegah trigger saat tap
            const swipeDistance = touchEndX - touchStartX;
            const isSidebarOpen = !sidebar.classList.contains('-translate-x-full');

            // Geser Kanan untuk Buka (hanya jika dimulai dari tepi kiri)
            if (swipeDistance > 75 && !isSidebarOpen && touchStartX < 50) {
                openSidebar();
            }

            // Geser Kiri untuk Tutup
            if (swipeDistance < -75 && isSidebarOpen) {
                closeSidebar();
            }
            
            touchStartX = 0;
            touchEndX = 0;
        }

        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchmove', e => {
            touchEndX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', handleGesture);


        subNavItems.forEach(item => item.addEventListener('click', e => { e.preventDefault(); showSubPage(item.dataset.subpage); }));
        document.querySelectorAll('.back-to-settings').forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); showSubPage('pengaturan-main'); }));


        // Initialize app
        loadData();
        setInitialFilter();
        renderAll();
        showPage('dasbor');
        document.getElementById('kasir-produk-tanggal').valueAsDate = new Date();
        document.getElementById('kasir-jasa-tanggal').valueAsDate = new Date();
        document.getElementById('kasir-aplikasi-tanggal').valueAsDate = new Date();

        // --- Splash Screen Logic ---
        const splashScreen = document.getElementById('splash-screen');
        // Wait a bit to ensure everything is rendered, then start fade out
        setTimeout(() => {
            splashScreen.classList.add('opacity-0');
            // After fade out animation is complete, hide it completely so it's not interactable
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 500); // This duration must match the CSS transition duration (duration-500)
        }, 1500); // Show splash screen for 1.5 seconds
    });
