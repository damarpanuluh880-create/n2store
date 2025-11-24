        // FUNGSI BARU: Render Grafik Analisa Penjualan Modern
        function renderSalesChart(data) {
            const ctx = document.getElementById('salesChart');
            if (!ctx) return;

            // Hancurkan chart lama jika ada agar animasi refresh berjalan
            if (salesChartInstance) {
                salesChartInstance.destroy();
            }

            // Data untuk Chart
            const profitData = [
                data.prodProfit, 
                data.svcProfit, 
                data.appProfit, 
                data.trxFeeTotal
            ];

            // Konfigurasi Chart Modern (Line Mode)
            salesChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Laba Produk', 'Laba Jasa', 'Laba Aplikasi', 'Total Fee'],
                    datasets: [{
                        label: 'Nominal Laba',
                        data: profitData,
                        borderColor: '#818cf8', // Indigo-400
                        backgroundColor: (context) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                            gradient.addColorStop(0, 'rgba(129, 140, 248, 0.4)');
                            gradient.addColorStop(1, 'rgba(129, 140, 248, 0.0)');
                            return gradient;
                        },
                        borderWidth: 3,
                        tension: 0.4, // Garis lengkung (smooth)
                        fill: true, // Area chart effect
                        pointBackgroundColor: '#0f172a', // Background gelap
                        pointBorderColor: '#c084fc', // Border ungu
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: '#c084fc',
                        pointHoverBorderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false 
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleColor: '#f8fafc',
                            bodyColor: '#cbd5e1',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1,
                            padding: 10,
                            titleFont: { family: "'Outfit', sans-serif", size: 13 },
                            bodyFont: { family: "'Outfit', sans-serif", size: 12 },
                            callbacks: {
                                label: function(context) {
                                    return ' ' + formatRupiah(context.raw);
                                }
                            },
                            displayColors: false // Hilangkan kotak warna di tooltip
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                borderDash: [5, 5]
                            },
                            ticks: {
                                color: '#94a3b8',
                                font: { family: "'Outfit', sans-serif", size: 10 },
                                callback: function(value) {
                                    return formatRupiahSimple(value);
                                }
                            },
                            border: { display: false }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                color: '#cbd5e1',
                                font: { family: "'Outfit', sans-serif", size: 11, weight: '500' }
                            },
                            border: { display: false }
                        }
                    },
                    animation: {
                        duration: 1500,
                        easing: 'easeOutQuart'
                    }
                }
            });
        }

// FUNGSI BARU: Mengaktifkan Drag-to-Scroll (Klik & Geser) untuk Slider di Desktop Chrome
        function initSliderDrag() {
            const slider = document.getElementById('dashboard-accounts-slider');
            let isDown = false;
            let startX;
            let scrollLeft;

            if(!slider) return;

            slider.addEventListener('mousedown', (e) => {
                isDown = true;
                slider.classList.add('cursor-grabbing');
                slider.classList.remove('cursor-grab');
                // startX = posisi mouse saat diklik dikurangi offset kiri slider
                startX = e.pageX - slider.offsetLeft;
                scrollLeft = slider.scrollLeft;
            });

            slider.addEventListener('mouseleave', () => {
                isDown = false;
                slider.classList.remove('cursor-grabbing');
                slider.classList.add('cursor-grab');
            });

            slider.addEventListener('mouseup', () => {
                isDown = false;
                slider.classList.remove('cursor-grabbing');
                slider.classList.add('cursor-grab');
            });

            slider.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault(); // Mencegah seleksi teks saat drag
                const x = e.pageX - slider.offsetLeft;
                const walk = (x - startX) * 2; // Kecepatan scroll (dikali 2 agar lebih responsif)
                slider.scrollLeft = scrollLeft - walk;
            });
        }
// --- NEW FUNCTION: Render Expense Chart Dynamically ---
        function renderExpenseChart() {
            // 1. Ambil Data Laba Bersih
            const accLaba = dbAccounts.find(a => a.name === 'Laba Bersih');
            const totalLaba = accLaba ? parseInt(accLaba.balance) : 0;

            // 2. Ambil Data Pengeluaran Rumah (Real-time dari transaksi)
            const totalHomeExpense = dbTransactions
                .filter(t => t.category === 'Pengeluaran Rumah')
                .reduce((acc, curr) => acc + (curr.amount || 0), 0);

            // 3. Render Chart
            const chartEl = document.getElementById('expenseChart');
            if(!chartEl) return;
            
            const ctx = chartEl.getContext('2d');

            // Hancurkan chart lama jika ada agar tidak menumpuk
            if (expenseChartInstance) {
                expenseChartInstance.destroy();
            }

            expenseChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Laba Bersih', 'Pengeluaran Rumah'],
                    datasets: [{
                        data: [totalLaba, totalHomeExpense],
                        backgroundColor: ['#10b981', '#f43f5e'], // Emerald (Laba), Rose (Expense)
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#94a3b8', font: { size: 10, family: "'Outfit', sans-serif" }, padding: 15 }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            titleFont: { family: "'Outfit', sans-serif" },
                            bodyFont: { family: "'Outfit', sans-serif" },
                            callbacks: {
                                label: function(context) {
                                    return ' ' + context.label + ': ' + formatRupiahSimple(context.raw);
                                }
                            }
                        }
                    }
                }
            });
        }

// --- EXPORT IMPORT FUNCTIONALITY ---
        function exportData() {
            const data = {
                accounts: dbAccounts,
                transactions: dbTransactions,
                products: dbProducts,
                debtors: dbDebtors,
                trxCategories: dbTrxCategories,
                productCategories: dbProductCategories,
                timestamp: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `nexfin_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function handleFileSelect(input) {
            const file = input.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    if (!importedData.accounts || !importedData.transactions) {
                        throw new Error("Format file tidak valid");
                    }

                    if (confirm("Apakah Anda yakin ingin mengembalikan data ini? Data saat ini akan ditimpa.")) {
                        // Restore data
                        dbAccounts = importedData.accounts;
                        dbTransactions = importedData.transactions;
                        dbProducts = importedData.products || [];
                        dbDebtors = importedData.debtors || [];
                        if(importedData.trxCategories) dbTrxCategories = importedData.trxCategories;
                        if(importedData.productCategories) dbProductCategories = importedData.productCategories;

                        // Re-render everything
                        renderDashboardAccounts(); 
                        renderDropdowns(); 
                        renderSettingsLists(); 
                        renderPOSCategories(); 
                        renderPOSCatalog(); 
                        renderManagementTable(); 
                        renderTransactionHistory();
                        renderDebtList();
                        renderReport();
                        renderDashboardAnalysis();
                        renderAccountsDrawer();
                        renderExpenseChart();
                        renderDashboardDebtWidget();
                        
                        alert("Data berhasil dipulihkan!");
                    }
                } catch (error) {
                    alert("Gagal membaca file backup: " + error.message);
                }
                // Reset input so same file can be selected again if needed
                input.value = '';
            };
            reader.readAsText(file);
        }
