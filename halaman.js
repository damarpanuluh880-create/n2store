        // --- Fungsionalitas Navigasi Halaman ---

        // Ambil semua elemen FAB (Floating Action Button)
        const fabTransaksi = document.getElementById('fab-tambah-transaksi');
        const fabProduk = document.getElementById('fab-tambah-produk');
        const fabPenjualan = document.getElementById('fab-tambah-penjualan');
        // Kumpulkan semua FAB dalam satu array untuk kemudahan pengelolaan
        const allFabs = [fabTransaksi, fabProduk, fabPenjualan];

        /**
         * Mengatur visibilitas FAB (tombol +) berdasarkan halaman yang aktif.
         * @param {string} activeViewId - ID dari view yang sedang aktif (cth: 'view-dashboard').
         */
        function updateFabVisibility(activeViewId) {
            // Sembunyikan semua FAB terlebih dahulu
            allFabs.forEach(fab => fab.style.display = 'none');

            // Tampilkan FAB yang sesuai berdasarkan halaman aktif
            switch (activeViewId) {
                case 'view-transaksi':
                    fabTransaksi.style.display = 'block'; // Tampilkan FAB Transaksi
                    break;
                case 'view-produk':
                    fabProduk.style.display = 'block'; // Tampilkan FAB Produk
                    break;
                case 'view-kasir':
                    fabPenjualan.style.display = 'block'; // Tampilkan FAB Penjualan
                    break;
                // 'view-dashboard', 'view-pengaturan', dll tidak menampilkan FAB
                default:
                    break;
            }
        }

        /**
         * Fungsi utama untuk navigasi antar halaman (main view).
         * Dipanggil oleh menu navigasi bawah.
         * @param {string} viewId - ID view yang akan ditampilkan (cth: 'view-dashboard').
         * @param {HTMLElement} clickedElement - Elemen <a> yang diklik di menu bawah.
         */
        function navigateTo(viewId, clickedElement) {
            // Sembunyikan semua elemen .main-view
            const mainViews = document.querySelectorAll('.main-view');
            mainViews.forEach(view => {
                view.classList.remove('active');
                view.style.display = 'none'; // Fallback jika CSS .active tidak terdefinisi
            });

            // Tampilkan view yang dituju
            const targetView = document.getElementById(viewId);
            if (targetView) {
                targetView.classList.add('active');
                targetView.style.display = 'block'; // Fallback
            }

            // Atur status 'active' pada link menu bawah
            const navLinks = document.querySelectorAll('#bottom-nav .nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            if (clickedElement) {
                clickedElement.classList.add('active');
            }

            // Perbarui visibilitas FAB (tombol +) sesuai halaman
            updateFabVisibility(viewId);
        }

        /**
         * Fungsi untuk navigasi sub-halaman di menu Pengaturan.
         * Dipanggil oleh link di dalam halaman 'view-pengaturan'.
         * @param {string} subViewId - ID sub-view yang akan ditampilkan (cth: 'view-akun').
         */
        function showSettingSubView(subViewId) {
            // Sembunyikan semua sub-view di dalam pengaturan
            // Ini untuk memastikan hanya satu sub-halaman pengaturan yang tampil
            document.getElementById('view-settings-main').style.display = 'none';
            document.getElementById('view-akun').style.display = 'none';
            document.getElementById('view-kategori').style.display = 'none';
            document.getElementById('view-info').style.display = 'none';

            // Tampilkan sub-view yang dituju
            const targetSubView = document.getElementById(subViewId);
            if (targetSubView) {
                targetSubView.style.display = 'block';
            }
        }

        // --- Inisialisasi Aplikasi ---
        // Menjalankan kode setelah semua elemen HTML dimuat
        document.addEventListener('DOMContentLoaded', () => {
            // Atur halaman default ke 'Dashboard' saat aplikasi pertama kali dibuka
            const defaultLink = document.querySelector('#bottom-nav a[href="#dashboard"]');
            navigateTo('view-dashboard', defaultLink);

            // Pastikan saat 'view-pengaturan' diakses, yang tampil adalah menu utamanya
            // Ini akan dipanggil saat navigasi, tapi bagus untuk inisialisasi
            showSettingSubView('view-settings-main');
        });
