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

        function toggleTrxMenu(event, id) {
            event.stopPropagation();
            closeAllMenus();
            const menu = document.getElementById(`trx-menu-${id}`);
            if(menu) menu.classList.add('show');
        }

        function closeAllMenus(event) {
            document.querySelectorAll('.action-menu').forEach(m => m.classList.remove('show'));
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
        renderExpenseChart(); // Initial Render
        renderDashboardDebtWidget(); // Initial Render Widget
        initSliderDrag(); // Aktifkan Drag Logic
