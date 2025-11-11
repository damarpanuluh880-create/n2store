// =============================================
// DEFINISI DATA APLIKASI
// =============================================

// BARU: Variabel global untuk menampung riwayat hapus
// (Dimuat dari localStorage oleh app.js)
let globalDeletionHistory = [];

// Data Master (Disimpan di localStorage)
// (Dimuat dari localStorage oleh app.js)
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
// (Dimuat dari localStorage oleh app.js)
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
