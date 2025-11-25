    function switchPage(pageId) { 
            ['dashboard', 'transactions', 'pos', 'products', 'settings', 'debt', 'reports'].forEach(p => { 
                const el = document.getElementById(p + '-view'); 
                if(p === pageId) { 
                    if(el) { el.classList.remove('hidden'); setTimeout(()=>el.classList.remove('opacity-0'),10); } 
                } else { 
                    if(el) el.classList.add('hidden', 'opacity-0'); 
                } 
                const nav = document.getElementById('nav-' + p); 
                if(nav) p === pageId ? nav.classList.add('active') : nav.classList.remove('active'); 
                const mobId = (p=='transactions'?'trx':(p=='settings'?'settings':(p=='products'?'prod':(p=='dashboard'?'dash':(p=='debt'?'debt':(p=='reports'?'reports':'pos')))))); 
                const mobNav = document.getElementById('mob-nav-' + mobId); 
                if(mobNav) p === pageId ? mobNav.classList.replace('text-gray-400', 'text-purple-400') : mobNav.classList.replace('text-purple-400', 'text-gray-400'); 
            }); 

            // LOGIKA BARU: Kontrol visibilitas tombol keranjang berdasarkan halaman
            const fab = document.getElementById('fab-cart-trigger');
            if(fab) {
                if(pageId === 'pos') {
                    fab.classList.remove('hidden'); // Tampilkan jika di halaman POS (Kasir)
                } else {
                    fab.classList.add('hidden'); // Sembunyikan jika di halaman lain
                    // Opsional: Tutup drawer keranjang jika pindah halaman
                    const drawer = document.getElementById('cart-drawer');
                    if (drawer && !drawer.classList.contains('-translate-x-full')) toggleFloatingCart();
                }
            }

            if(pageId === 'debt') renderDebtList(); 
            if(pageId === 'reports') renderReport(); 
            // Pastikan widget piutang di-refresh saat kembali ke dashboard
            if(pageId === 'dashboard') {
                renderDashboardAnalysis(); 
                renderDashboardDebtWidget();
            }
        } 
