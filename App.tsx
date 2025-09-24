// Fix: Implement the full App.tsx component to create a functional application.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// FIX: The User type is defined in `./types`, so it should be imported from there.
import { Cage, HarvestedCage, ReportType, Theme, Notification, User } from './types';
import { getAIReport } from './services/geminiService';
import { 
    onCagesUpdate, 
    onHarvestedCagesUpdate, 
    onNotificationsUpdate, 
    addCageToFirebase,
    updateCageInFirebase,
    deleteCageFromFirebase,
    addHarvestedCageToFirebase,
    addNotificationToFirebase,
    deleteNotificationsForCageInFirebase,
    markNotificationsAsReadInFirebase,
    onAuthStateChanged,
    signOutUser
} from './services/firebaseService';


import Header from './components/Header';
import ReportCenter from './components/ReportCenter';
import CageGrid from './components/CageGrid';
import BulkActionBar from './components/BulkActionBar';
import AIChatWidget from './components/AIChatWidget';
import DetailsModal from './components/modals/DetailsModal';
import UpdateModal from './components/modals/UpdateModal';
import HarvestModal from './components/modals/HarvestModal';
import ReportModal from './components/modals/ReportModal';
import FilterControls from './components/FilterControls';
import LandingPage from './components/LandingPage';
import CageStatusLegend from './components/CageStatusLegend';
import FinancialDashboard from './components/FinancialDashboard';
import AuthPage from './components/AuthPage';

// Helper function to get days for sorting
const getFarmingDays = (startDateString: string): number => {
    const start = new Date(startDateString);
    return Math.max(1, Math.floor((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
};


interface MainAppProps {
    user: User;
}

const MainApp: React.FC<MainAppProps> = ({ user }) => {
    const [cages, setCages] = useState<Cage[]>([]);
    const [harvestedCages, setHarvestedCages] = useState<HarvestedCage[]>([]);
    const [theme, setTheme] = useState<Theme>('blue');
    const [appEntered, setAppEntered] = useState(false);
    const [currentView, setCurrentView] = useState<'cages' | 'dashboard'>('cages');
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal states
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [selectedCage, setSelectedCage] = useState<Cage | null>(null);
    const [selectedCages, setSelectedCages] = useState<Set<string>>(new Set());
    
    // Report states
    const [reportData, setReportData] = useState<{title: string, content: string} | null>(null);
    const [isReportLoading, setIsReportLoading] = useState(false);
    
    // Filter & Sort states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('id');
    
    // Notification state
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load theme from localStorage on initial render
    useEffect(() => {
        try {
            const storedTheme = localStorage.getItem('crab-farm-theme');
            if (storedTheme && ['blue', 'green', 'orange'].includes(storedTheme)) {
                setTheme(storedTheme as Theme);
            }
        } catch (error) {
            console.error("Failed to load theme from localStorage", error);
        }
    }, []);

    // Firebase Listeners
     useEffect(() => {
        const unsubscribeCages = onCagesUpdate(setCages, () => setIsLoading(false));
        const unsubscribeHarvested = onHarvestedCagesUpdate(setHarvestedCages);
        const unsubscribeNotifications = onNotificationsUpdate(setNotifications);

        return () => {
            unsubscribeCages();
            unsubscribeHarvested();
            unsubscribeNotifications();
        };
    }, []);

    // Save theme to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('crab-farm-theme', theme);
        } catch (error) {
            console.error("Failed to save theme to localStorage", error);
        }
    }, [theme]);
    
    // Generate notifications based on cage status
    useEffect(() => {
        const existingNotificationCageIds = new Set(notifications.map(n => n.cageId + n.type));
        const now = new Date().toISOString();

        for (const cage of cages) {
            // Check for AI Alerts
            if (cage.aiAlert && !existingNotificationCageIds.has(cage.id + 'alert')) {
                const newNotification: Notification = {
                    id: `alert-${cage.id}-${Date.now()}`,
                    type: 'alert',
                    message: `Lồng ${cage.id} có cảnh báo AI. Cần kiểm tra ngay!`,
                    cageId: cage.id,
                    timestamp: now,
                    read: false
                };
                addNotificationToFirebase(newNotification);
            }

            // Check for Harvest Readiness
            if (cage.progress >= 95 && !existingNotificationCageIds.has(cage.id + 'harvest')) {
                 const newNotification: Notification = {
                    id: `harvest-${cage.id}-${Date.now()}`,
                    type: 'harvest',
                    message: `Lồng ${cage.id} đã sẵn sàng để thu hoạch.`,
                    cageId: cage.id,
                    timestamp: now,
                    read: false
                };
                addNotificationToFirebase(newNotification);
            }
        }
    }, [cages, notifications]);


    // Apply theme colors as CSS variables
    useEffect(() => {
        const root = document.documentElement;
        const colors = {
            blue: { 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB', 800: '#1E40AF' },
            green: { 100: '#D1FAE5', 500: '#10B981', 600: '#059669', 800: '#065F46' },
            orange: { 100: '#FFEDD5', 500: '#F97316', 600: '#EA580C', 800: '#9A3412' }
        };
        const selectedTheme = colors[theme];
        root.style.setProperty('--color-primary-100', selectedTheme[100]);
        root.style.setProperty('--color-primary-500', selectedTheme[500]);
        root.style.setProperty('--color-primary-600', selectedTheme[600]);
        root.style.setProperty('--color-primary-800', selectedTheme[800]);
    }, [theme]);

    const handleOpenModal = (modalName: string, cage?: Cage) => {
        setSelectedCage(cage || null);
        setActiveModal(modalName);
    };
    
    const handleCloseModals = useCallback(() => {
        setActiveModal(null);
        setSelectedCage(null);
    }, []);
    
    const handleAddCage = (newCage: Cage) => {
        const cageWithLog: Cage = {
            ...newCage,
            log: [{
                date: newCage.startDate,
                type: 'creation',
                details: `Bắt đầu nuôi với trọng lượng ${newCage.initialWeight}g.`,
                meta: { weight: newCage.initialWeight, cost: newCage.costs.seed, user: user.email }
            }]
        };
        addCageToFirebase(cageWithLog);
        handleCloseModals();
    };

    const handleUpdateCage = (updatedCage: Cage) => {
        const latestLogEntry = updatedCage.log[updatedCage.log.length - 1];
        if (latestLogEntry && !latestLogEntry.meta?.user) {
            latestLogEntry.meta = { ...latestLogEntry.meta, user: user.email };
        }
        updateCageInFirebase(updatedCage.id, updatedCage);
        handleCloseModals();
    };
    
    const handleHarvest = (finalWeight: number, pricePerKg: number) => {
        if (!selectedCage) return;
        const cageToHarvest = selectedCage;
        const totalCost = cageToHarvest.costs.seed + cageToHarvest.costs.feed + cageToHarvest.costs.medicine;
        const revenue = (finalWeight / 1000) * pricePerKg;
        const profit = revenue - totalCost;
        
        const newHarvestedCage: HarvestedCage = {
            id: cageToHarvest.id,
            harvestDate: new Date().toISOString(),
            finalWeight,
            revenue,
            profit,
            totalCost,
            costs: cageToHarvest.costs,
        };
        
        addHarvestedCageToFirebase(newHarvestedCage);
        deleteCageFromFirebase(cageToHarvest.id);
        deleteNotificationsForCageInFirebase(cageToHarvest.id);
        
        handleCloseModals();
    };

    const handleDeleteCage = (id: string) => {
        deleteCageFromFirebase(id);
        deleteNotificationsForCageInFirebase(id);
        handleCloseModals();
    };

    const handleSelectChange = (id: string, isSelected: boolean) => {
        setSelectedCages(prev => {
            const newSet = new Set(prev);
            if (isSelected) newSet.add(id);
            else newSet.delete(id);
            return newSet;
        });
    };

    const handleBulkFeed = () => {
        const now = new Date().toISOString();
        const feedCost = 15000; // Example cost
        
        selectedCages.forEach(cageId => {
            const cage = cages.find(c => c.id === cageId);
            if (cage) {
                 const newFeedEntry = {
                    date: now,
                    feedType: 'Thức ăn tổng hợp (hàng loạt)',
                    weight: 100, // Example weight
                    cost: feedCost
                };
                const updatedCage = {
                    ...cage,
                    costs: { ...cage.costs, feed: cage.costs.feed + feedCost },
                    log: [...cage.log, { date: now, type: 'feeding' as const, details: `Đã cho ăn hàng loạt. Chi phí ${feedCost.toLocaleString('vi-VN')} VND.`, meta: { cost: feedCost, weight: 100, user: user.email } }],
                    feedHistory: [...cage.feedHistory, newFeedEntry]
                };
                updateCageInFirebase(cageId, updatedCage);
            }
        });

        setSelectedCages(new Set());
    };

    const handleGenerateReport = async (reportType: ReportType) => {
        setIsReportLoading(true);
        setActiveModal('report');
        const result = await getAIReport(reportType, cages, harvestedCages);
        setReportData(result);
        setIsReportLoading(false);
    };

    const handleMarkNotificationsAsRead = useCallback(() => {
        markNotificationsAsReadInFirebase();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOutUser();
            // App component will handle rerendering to AuthPage
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    
    const filteredAndSortedCages = useMemo(() => {
        let processedCages = [...cages];
        if (searchTerm) {
            processedCages = processedCages.filter(c => c.id.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        switch(sortKey) {
            case 'progress_desc': processedCages.sort((a, b) => b.progress - a.progress); break;
            case 'progress_asc': processedCages.sort((a, b) => a.progress - b.progress); break;
            case 'days_desc': processedCages.sort((a, b) => getFarmingDays(b.startDate) - getFarmingDays(a.startDate)); break;
            case 'days_asc': processedCages.sort((a, b) => getFarmingDays(a.startDate) - getFarmingDays(b.startDate)); break;
            case 'id': default: processedCages.sort((a, b) => a.id.localeCompare(b.id)); break;
        }
        return processedCages;
    }, [cages, searchTerm, sortKey]);

    if (!appEntered) {
        return <LandingPage onEnter={() => setAppEntered(true)} />;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu trang trại...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto p-4 sm:p-6">
                <Header 
                    onAddCage={() => setActiveModal('add')} 
                    theme={theme} 
                    setTheme={setTheme} 
                    notifications={notifications}
                    onMarkAsRead={handleMarkNotificationsAsRead}
                    currentView={currentView}
                    onNavigate={setCurrentView}
                    user={user}
                    onSignOut={handleSignOut}
                />
                
                {currentView === 'cages' && (
                    <>
                        <ReportCenter onGenerateReport={handleGenerateReport} />
                        <FilterControls 
                            onSearch={setSearchTerm}
                            onSortChange={setSortKey}
                            searchTerm={searchTerm}
                            sortKey={sortKey}
                        />
                        <CageStatusLegend />
                        <CageGrid 
                            cages={filteredAndSortedCages}
                            onCardClick={(cage) => handleOpenModal('details', cage)}
                            onSelectChange={handleSelectChange}
                            selectedCages={selectedCages}
                        />
                    </>
                )}
                
                {currentView === 'dashboard' && (
                    <FinancialDashboard cages={cages} harvestedCages={harvestedCages} />
                )}

            </div>
            {currentView === 'cages' && <BulkActionBar selectedCount={selectedCages.size} onFeed={handleBulkFeed} />}
            <AIChatWidget allCages={cages} harvestedCages={harvestedCages} />

            {/* Modals */}
            {activeModal === 'add' && <AddCageModal onClose={handleCloseModals} onSave={handleAddCage} existingIds={cages.map(c => c.id)}/>}
            {activeModal === 'details' && selectedCage && (
                <DetailsModal 
                    cage={selectedCage} 
                    onClose={handleCloseModals}
                    onUpdate={() => handleOpenModal('update', selectedCage)}
                    onHarvest={() => handleOpenModal('harvest', selectedCage)}
                    onDelete={handleDeleteCage}
                    targetWeight={500}
                />
            )}
            {activeModal === 'update' && selectedCage && (
                <UpdateModal cage={selectedCage} onClose={handleCloseModals} onSave={handleUpdateCage} />
            )}
            {activeModal === 'harvest' && selectedCage && (
                <HarvestModal cage={selectedCage} onClose={handleCloseModals} onHarvest={handleHarvest} />
            )}
            {activeModal === 'report' && reportData && (
                <ReportModal
                    title={reportData.title}
                    content={reportData.content}
                    isLoading={isReportLoading}
                    onClose={() => setActiveModal(null)}
                />
            )}
        </div>
    );
};

const AddCageModal: React.FC<{onClose: () => void; onSave: (cage: Cage) => void; existingIds: string[]}> = ({onClose, onSave, existingIds}) => {
    const [id, setId] = useState('');
    const [weight, setWeight] = useState('');
    const [cost, setCost] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (existingIds.includes(id.toUpperCase())) {
            setError(`ID "${id.toUpperCase()}" đã tồn tại.`);
            return;
        }
        if (!id.trim() || !weight || !cost) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        const newCage: Cage = {
            id: id.toUpperCase(),
            startDate: new Date().toISOString(),
            initialWeight: parseInt(weight),
            currentWeight: parseInt(weight),
            deadCrabCount: 0,
            costs: { seed: parseInt(cost), feed: 0, medicine: 0 },
            growthHistory: [parseInt(weight)],
            aiAlert: false,
            progress: Math.min(100, Math.round((parseInt(weight) / 500) * 100)),
            log: [], // The log is now added in App.tsx's handleAddCage
            feedHistory: [],
        };
        onSave(newCage);
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Thêm Lồng Mới</h2>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">ID Lồng (ví dụ: A01)</label>
                        <input type="text" value={id} onChange={e => { setId(e.target.value); setError(''); }} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Trọng lượng ban đầu (gam)</label>
                        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Chi phí giống (VND)</label>
                        <input type="number" value={cost} onChange={e => setCost(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" required />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg">Hủy</button>
                        <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    )
};


function App() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (authLoading) {
         return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
                    <p className="mt-4 text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
                </div>
            </div>
        );
    }
    
    if (!user) {
        return <AuthPage />;
    }

    return <MainApp user={user} />;
}

export default App;