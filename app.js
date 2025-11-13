        document.addEventListener("DOMContentLoaded", () => {
            const allPages = document.querySelectorAll(".page-content");
            const navLinks = document.querySelectorAll(".nav-link");
            const subNavLinks = document.querySelectorAll(".sub-nav-link");
            const backButtons = document.querySelectorAll(".back-to-pengaturan-button");
            
            // Elemen baru untuk judul header dinamis
            const pageTitleElement = document.getElementById('page-title');
            
            // Sidebar Elements
            const sidebarButton = document.getElementById("hamburger-button");
            const sidebarMenu = document.getElementById("sidebar-menu");
            const sidebarBackdrop = document.getElementById("sidebar-backdrop");
            const sidebarCloseButton = document.getElementById("sidebar-close-button");

            // BARU: Peta untuk judul halaman
            const PAGE_TITLES = {
                'dashboard': 'Dashboard',
                'kasir': 'Kasir',
                'transaksi': 'Riwayat Transaksi',
                'hutang': 'Riwayat Piutang',
                'laporan': 'Laporan',
                'pengaturan': 'Pengaturan',
                'kelola-kategori': 'Kelola Kategori',
                'kelola-akun': 'Kelola Akun',
                'kelola-aplikasi': 'Kelola Aplikasi',
                'kelola-produk': 'Kelola Produk'
            };

            // Fungsi untuk menampilkan halaman utama
            function showPage(pageId) {
                // Sembunyikan semua halaman
                allPages.forEach(page => {
                    page.classList.add('hidden');
                });

                // Tampilkan halaman yang diminta
                const activePage = document.getElementById(`page-${pageId}`);
                if (activePage) {
                    activePage.classList.remove('hidden');
                }

                // BARU: Perbarui judul header
                if (pageTitleElement && PAGE_TITLES[pageId]) {
                    pageTitleElement.textContent = PAGE_TITLES[pageId];
                }

                // Perbarui status 'active' di navigasi bawah
                navLinks.forEach(link => {
                    if (link.dataset.page === pageId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }

            // Fungsi untuk menampilkan sub-halaman (di dalam Pengaturan)
            function showSubPage(subPageId, mainPageId) {
                // Sembunyikan semua halaman
                allPages.forEach(page => {
                    page.classList.add('hidden');
                });
                
                // Tampilkan sub-halaman yang diminta
                const activeSubPage = document.getElementById(`page-${subPageId}`);
                if (activeSubPage) {
                    activeSubPage.classList.remove('hidden');
                }

                // BARU: Perbarui judul header
                if (pageTitleElement && PAGE_TITLES[subPageId]) {
                    pageTitleElement.textContent = PAGE_TITLES[subPageId];
                }

                // Pastikan halaman utama (Pengaturan) disembunyikan
                const mainPage = document.getElementById(`page-${mainPageId}`);
                if (mainPage) {
                    mainPage.classList.add('hidden'); 
                }
            }

            // Event listener untuk navigasi bawah
            navLinks.forEach(link => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const pageId = link.dataset.page;
                    showPage(pageId);
                });
            });

            // Event listener untuk navigasi sub-halaman (di Pengaturan)
            subNavLinks.forEach(link => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const subPageId = link.dataset.page;
                    showSubPage(subPageId, 'pengaturan'); // 'pengaturan' adalah ID halaman utamanya
                });
            });

            // Event listener untuk tombol "Kembali"
            backButtons.forEach(button => {
                button.addEventListener("click", (e) => {
                    e.preventDefault();
                    showPage('pengaturan'); // Selalu kembali ke halaman pengaturan
                });
            });

            // --- Logic Sidebar ---
            function openSidebar() {
                if (sidebarMenu) sidebarMenu.classList.add("open");
            }
            function closeSidebar() {
                if (sidebarMenu) sidebarMenu.classList.remove("open");
            }

            if (sidebarButton) {
                sidebarButton.addEventListener("click", openSidebar);
            }
            if (sidebarBackdrop) {
                sidebarBackdrop.addEventListener("click", closeSidebar);
            }
            if (sidebarCloseButton) {
                sidebarCloseButton.addEventListener("click", closeSidebar);
            }

            // Tampilkan halaman default (Dashboard) saat aplikasi dimuat
            showPage("dashboard");
        });
