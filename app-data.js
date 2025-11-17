    // --- 6.1. AKUN ---

    /**
     * Menyiapkan modal untuk menambah akun baru
     */
    window.siapkanModalTambahAkun = () => {
        formAkun.reset();
        editAkunId.value = '';
        modalAwal.disabled = false;
        document.getElementById('modalTambahAkunLabel').textContent = 'Tambah Akun Baru';
        modalTambahAkun.show();
    }

    /**
     * Menyiapkan modal untuk mengedit akun
     */
    window.siapkanModalEditAkun = async (id) => {
        try {
            const akun = await dbGet('akun', id);
            if (!akun) throw new Error('Akun tidak ditemukan');

            editAkunId.value = akun.id;
            modalNamaAkun.value = akun.nama;
            modalAwal.value = ''; // Saldo awal tidak bisa diubah, hanya disesuaikan
            modalAwal.disabled = true;
            document.getElementById('modalTambahAkunLabel').textContent = 'Edit Nama Akun';
            modalTambahAkun.show();
        } catch (error) {
            tampilkanToast('Error', `Gagal memuat akun: ${error.message}`, 'danger');
        }
    }

    /**
     * Menyiapkan modal untuk menghapus akun
     */
    window.siapkanModalHapusAkun = async (id) => {
        try {
            const akun = await dbGet('akun', id);
            if (!akun) throw new Error('Akun tidak ditemukan');
            
            // Cek apakah akun ini terkait dengan transaksi
            const transaksi = await dbGetAll('transaksi');
            const terkait = transaksi.some(t => 
                t.akun === id || 
                t.akunDari === id || 
                t.akunKe === id
            );
            
            if (terkait) {
                 tampilkanToast('Gagal', 'Akun ini tidak dapat dihapus karena terkait dengan riwayat transaksi.', 'danger');
                 return;
            }

            hapusAkunId.value = id;
            hapusNamaAkun.textContent = akun.nama;
            modalHapusAkun.show();
        } catch (error) {
             tampilkanToast('Error', `Gagal memuat data: ${error.message}`, 'danger');
        }
    }

    /**
     * Menyiapkan modal untuk penyesuaian saldo
     */
    window.siapkanModalPenyesuaianSaldo = async (id) => {
        try {
            const akun = await dbGet('akun', id);
            if (!akun) throw new Error('Akun tidak ditemukan');

            penyesuaianAkunId.value = id;
            penyesuaianNamaAkun.textContent = akun.nama;
            penyesuaianSaldoLama.textContent = formatRupiah(akun.saldo);
            saldoBaru.value = '';
            modalPenyesuaianSaldo.show();
        } catch (error) {
            tampilkanToast('Error', `Gagal memuat akun: ${error.message}`, 'danger');
        }
    }

    /**
     * Menyimpan (tambah/edit) akun ke database
     */
    window.simpanAkun = async () => {
        const id = editAkunId.value;
        const nama = modalNamaAkun.value.trim();
        const saldoAwal = parseFloat(modalAwal.value) || 0;

        if (!nama) {
            tampilkanToast('Error', 'Nama akun tidak boleh kosong!', 'danger');
            return;
        }

        try {
            if (id) {
                // Mode Edit (hanya update nama)
                const akun = await dbGet('akun', id);
                akun.nama = nama;
                await dbUpdate('akun', akun);
                tampilkanToast('Sukses', `Akun "${nama}" berhasil diperbarui.`);
            } else {
                // Mode Tambah Baru
                const newAkun = {
                    id: generateId(),
                    nama: nama,
                    saldo: saldoAwal
                };
                await dbAdd('akun', newAkun);
                tampilkanToast('Sukses', `Akun "${nama}" berhasil ditambahkan.`);
            }
            
            modalTambahAkun.hide();
            await renderDaftarAkun(); // Muat ulang daftar akun
            await loadSemuaData(); // Muat ulang data global (termasuk untuk sidebar dan dashboard)
        } catch (error) {
            tampilkanToast('Error', `Gagal menyimpan akun: ${error.message}`, 'danger');
        }
    }

    /**
     * Menghapus akun dari database
     */
    window.hapusAkun = async () => {
        const id = hapusAkunId.value;
        try {
            const akun = await dbGet('akun', id); // Ambil nama untuk pesan
            await dbDelete('akun', id);
            tampilkanToast('Sukses', `Akun "${akun.nama}" berhasil dihapus.`);
            modalHapusAkun.hide();
            await renderDaftarAkun();
            await loadSemuaData();
        } catch (error) {
            tampilkanToast('Error', `Gagal menghapus akun: ${error.message}`, 'danger');
        }
    }

    /**
     * Menyimpan saldo baru (Penyesuaian Saldo)
     */
    window.simpanSaldoBaru = async () => {
        const id = penyesuaianAkunId.value;
        const saldoBaruVal = parseFloat(saldoBaru.value);

        if (isNaN(saldoBaruVal)) {
            tampilkanToast('Error', 'Saldo baru harus berupa angka.', 'danger');
            return;
        }

        try {
            const akun = await dbGet('akun', id);
            const saldoLama = akun.saldo;
            const selisih = saldoBaruVal - saldoLama;
            
            // Update saldo akun
            akun.saldo = saldoBaruVal;
            await dbUpdate('akun', akun);

            // Buat transaksi penyesuaian (opsional, tapi bagus untuk pelacakan)
            const trxPenyesuaian = {
                id: generateId(),
                tipe: selisih > 0 ? 'Pemasukan' : 'Pengeluaran',
                tanggal: new Date().toISOString(),
                akun: id,
                kategori: 'Penyesuaian Saldo', // Kategori khusus
                total: Math.abs(selisih),
                catatan: `Penyesuaian saldo dari ${formatRupiah(saldoLama)} ke ${formatRupiah(saldoBaruVal)}`
            };
            await dbAdd('transaksi', trxPenyesuaian);
            
            tampilkanToast('Sukses', `Saldo "${akun.nama}" berhasil disesuaikan.`);
            modalPenyesuaianSaldo.hide();
            await renderDaftarAkun();
            await loadSemuaData();
        } catch (error) {
            tampilkanToast('Error', `Gagal menyesuaikan saldo: ${error.message}`, 'danger');
        }
    }

    /**
     * Merender daftar akun di halaman Pengaturan
     */
    window.renderDaftarAkun = async () => {
        const listContainer = document.getElementById('daftar-akun-list');
        listContainer.innerHTML = '<li class="list-group-item text-center p-3"><div class="spinner-border spinner-border-sm" role="status"></div></li>';
        
        try {
            const semuaAkun = await dbGetAll('akun');
            
            if (semuaAkun.length === 0) {
                listContainer.innerHTML = '<li class="list-group-item text-center text-muted p-3">Belum ada akun.</li>';
                return;
            }

            listContainer.innerHTML = ''; // Kosongkan list
            semuaAkun.forEach(akun => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center py-3';
                li.innerHTML = `
                    <div>
                        <span class="fw-bold d-block">${akun.nama}</span>
                        <span class="text-muted small">${formatRupiah(akun.saldo)}</span>
                    </div>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="#" onclick="event.preventDefault(); siapkanModalPenyesuaianSaldo('${akun.id}')"><i class="bi bi-arrow-left-right me-2"></i>Sesuaikan Saldo</a></li>
                            <li><a class="dropdown-item" href="#" onclick="event.preventDefault(); siapkanModalEditAkun('${akun.id}')"><i class="bi bi-pencil-fill me-2"></i>Edit Nama</a></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="event.preventDefault(); siapkanModalHapusAkun('${akun.id}')"><i class="bi bi-trash-fill me-2"></i>Hapus</a></li>
                        </ul>
                    </div>
                `;
                listContainer.appendChild(li);
            });

        } catch (error) {
            listContainer.innerHTML = `<li class="list-group-item text-center text-danger p-3">Gagal memuat akun: ${error.message}</li>`;
        }
    }

    // --- 6.2. KATEGORI ---

    window.siapkanModalTambahKategori = () => {
        formKategori.reset();
        editKategoriId.value = '';
        document.getElementById('modalTambahKategoriLabel').textContent = 'Tambah Kategori Baru';
        modalTambahKategori.show();
    }

    window.siapkanModalEditKategori = async (id) => {
        try {
            const kategori = await dbGet('kategori', id);
            editKategoriId.value = id;
            modalNamaKategori.value = kategori.nama;
            modalTipeKategori.value = kategori.tipe;
            document.getElementById('modalTambahKategoriLabel').textContent = 'Edit Kategori';
            modalTambahKategori.show();
        } catch (error) {
            tampilkanToast('Error', `Gagal memuat kategori: ${error.message}`, 'danger');
        }
    }

    window.siapkanModalHapusKategori = async (id) => {
         try {
            const kategori = await dbGet('kategori', id);
            // Cek keterkaitan
            const transaksi = await dbGetAll('transaksi');
            const terkait = transaksi.some(t => t.kategori === id || t.kategori === kategori.nama);
            
            if (terkait) {
                 tampilkanToast('Gagal', 'Kategori ini tidak dapat dihapus karena terkait dengan riwayat transaksi.', 'danger');
                 return;
            }

            hapusKategoriId.value = id;
            hapusNamaKategori.textContent = kategori.nama;
            modalHapusKategori.show();
        } catch (error) {
             tampilkanToast('Error', `Gagal memuat data: ${error.message}`, 'danger');
        }
    }

    window.simpanKategori = async () => {
        const id = editKategoriId.value;
        const nama = modalNamaKategori.value.trim();
        const tipe = modalTipeKategori.value;

        if (!nama) {
            tampilkanToast('Error', 'Nama kategori tidak boleh kosong!', 'danger');
            return;
        }

        try {
            const data = { id: id || generateId(), nama, tipe };
            
            if (id) {
                await dbUpdate('kategori', data);
                tampilkanToast('Sukses', `Kategori "${nama}" berhasil diperbarui.`);
            } else {
                await dbAdd('kategori', data);
                tampilkanToast('Sukses', `Kategori "${nama}" berhasil ditambahkan.`);
            }
            
            modalTambahKategori.hide();
            await renderDaftarKategori();
            await loadSemuaData(); // Untuk update dropdown di modal
        } catch (error) {
            tampilkanToast('Error', `Gagal menyimpan kategori: ${error.message}`, 'danger');
        }
    }

    window.hapusKategori = async () => {
        const id = hapusKategoriId.value;
        try {
            const kategori = await dbGet('kategori', id);
            await dbDelete('kategori', id);
            tampilkanToast('Sukses', `Kategori "${kategori.nama}" berhasil dihapus.`);
            modalHapusKategori.hide();
            await renderDaftarKategori();
            await loadSemuaData();
        } catch (error) {
            tampilkanToast('Error', `Gagal menghapus kategori: ${error.message}`, 'danger');
        }
    }

    window.renderDaftarKategori = async () => {
        const listContainer = document.getElementById('daftar-kategori-list');
        listContainer.innerHTML = '<li class="list-group-item text-center p-3"><div class="spinner-border spinner-border-sm" role="status"></div></li>';
        
        try {
            const semuaKategori = await dbGetAll('kategori');
            
            if (semuaKategori.length === 0) {
                listContainer.innerHTML = '<li class="list-group-item text-center text-muted p-3">Belum ada kategori.</li>';
                return;
            }

            listContainer.innerHTML = '';
            // Sortir atau kelompokkan berdasarkan tipe
            const terkelompok = semuaKategori.reduce((acc, kat) => {
                if (!acc[kat.tipe]) acc[kat.tipe] = [];
                acc[kat.tipe].push(kat);
                return acc;
            }, {});

            ['Pemasukan', 'Pengeluaran', 'Transfer', 'Lainnya'].forEach(tipe => {
                if (terkelompok[tipe]) {
                    const header = document.createElement('li');
                    header.className = 'list-group-item list-group-item-secondary fw-bold';
                    header.textContent = tipe;
                    listContainer.appendChild(header);

                    terkelompok[tipe].forEach(kategori => {
                        const li = document.createElement('li');
                        li.className = 'list-group-item d-flex justify-content-between align-items-center';
                        li.innerHTML = `
                            <span>${kategori.nama}</span>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><a class="dropdown-item" href="#" onclick="event.preventDefault(); siapkanModalEditKategori('${kategori.id}')"><i class="bi bi-pencil-fill me-2"></i>Edit</a></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="event.preventDefault(); siapkanModalHapusKategori('${kategori.id}')"><i class="bi bi-trash-fill me-2"></i>Hapus</a></li>
                                </ul>
                            </div>
                        `;
                        listContainer.appendChild(li);
                    });
                }
            });

        } catch (error) {
            listContainer.innerHTML = `<li class="list-group-item text-center text-danger p-3">Gagal memuat kategori: ${error.message}</li>`;
        }
    }
