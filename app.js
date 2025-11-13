    // Skrip sederhana untuk navigasi antar halaman (tanpa reload)
        document.addEventListener('DOMContentLoaded', () => {
            const navLinks = document.querySelectorAll('.nav-link');
            const pageContents = document.querySelectorAll('.page-content');
            
            // Mengatur halaman default (Dashboard) saat pertama kali dimuat
            const initialPage = 'dashboard';
            document.getElementById(`page-${initialPage}`).classList.remove('hidden');
            document.querySelector(`.nav-link[data-page="${initialPage}"]`).classList.add('active');

            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pageId = link.dataset.page;

                    // 1. Sembunyikan semua halaman
                    pageContents.forEach(page => {
                        page.classList.add('hidden');
                    });

                    // 2. Tampilkan halaman yang dituju
                    const targetPage = document.getElementById(`page-${pageId}`);
                    if (targetPage) {
                        targetPage.classList.remove('hidden');
                    }

                    // 3. Perbarui style 'active' pada navigasi
                    navLinks.forEach(nav => nav.classList.remove('active'));
                    link.classList.add('active');
                });
            });

            // --- BARU: Skrip untuk Sidebar KIRI ---
            const hamburgerButton = document.getElementById('hamburger-button');
            const sidebarMenu = document.getElementById('sidebar-menu');
            const sidebarBackdrop = document.getElementById('sidebar-backdrop');
            const sidebarCloseButton = document.getElementById('sidebar-close-button');

            // Fungsi untuk membuka sidebar
            const openSidebar = () => {
                sidebarMenu.classList.add('open');
            };
            // Fungsi untuk menutup sidebar
            const closeSidebar = () => {
                sidebarMenu.classList.remove('open');
            };
            // Tambahkan event listener
            hamburgerButton.addEventListener('click', openSidebar);
            sidebarCloseButton.addEventListener('click', closeSidebar);
            sidebarBackdrop.addEventListener('click', closeSidebar);
            // --- AKHIR Skrip Sidebar KIRI ---
            

            // --- BARU: Skrip untuk Tab Halaman Transaksi ---
            const transaksiTabs = document.querySelectorAll('.transaksi-tab');
            const jurnalContent = document.getElementById('tab-content-jurnal');
            const penjualanContent = document.getElementById('tab-content-penjualan');

            transaksiTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Hapus 'active' dari semua tab
                    transaksiTabs.forEach(t => {
                        t.classList.remove('active');
                        t.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
                    });
                    // Tambah 'active' ke tab yang diklik
                    tab.classList.add('active');
                    tab.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');

                    // Tampilkan konten yang sesuai
                    if (tab.dataset.tab === 'jurnal') {
                        jurnalContent.classList.remove('hidden');
                        penjualanContent.classList.add('hidden');
                    } else if (tab.dataset.tab === 'penjualan') {
                        jurnalContent.classList.add('hidden');
                        penjualanContent.classList.remove('hidden');
                    }
                });
            });
            // --- AKHIR Skrip Tab Transaksi ---

            // ======================================================
            // BARU: Skrip untuk Sub-Navigasi Halaman Pengaturan
            // ======================================================
            const subNavLinks = document.querySelectorAll('.sub-nav-link');
            const backToPengaturanButtons = document.querySelectorAll('.back-to-pengaturan-button');
            const pagePengaturan = document.getElementById('page-pengaturan');

            // Listener untuk Master Data links (e.g., "Kelola Kategori")
            subNavLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pageId = link.dataset.page;
                    const targetPage = document.getElementById(`page-${pageId}`);
                    
                    if (targetPage) {
                        // Sembunyikan semua halaman
                        pageContents.forEach(page => page.classList.add('hidden'));
                        // Tampilkan halaman sub-navigasi
                        targetPage.classList.remove('hidden');
                    }
                });
            });

            // Listener for "Kembali" buttons
            backToPengaturanButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Sembunyikan semua halaman
                    pageContents.forEach(page => page.classList.add('hidden'));
                    // Tampilkan halaman pengaturan utama
                    pagePengaturan.classList.remove('hidden');
                });
            });
            // --- AKHIR Skrip Sub-Navigasi ---

        });
