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
