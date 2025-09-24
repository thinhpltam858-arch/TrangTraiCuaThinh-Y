
import React, { useState, useEffect, useCallback } from 'react';
import { Cage, HarvestedCage, ReportType, Theme } from './types';
import Header from './components/Header';
import ReportCenter from './components/ReportCenter';
import CageGrid from './components/CageGrid';
import BulkActionBar from './components/BulkActionBar';
import AIChatWidget from './components/AIChatWidget';
import DetailsModal from './components/modals/DetailsModal';
import UpdateModal from './components/modals/UpdateModal';
import HarvestModal from './components/modals/HarvestModal';
import ReportModal from './components/modals/ReportModal';
import LandingPage from './components/LandingPage';
import { getAIReport } from './services/geminiService';

const TARGET_WEIGHT = 500;
const THEME_STORAGE_KEY = 'thinh-y-crab-farm-theme';

const App: React.FC = () => {
    const [showDashboard, setShowDashboard] = useState(false);
    const [cageData, setCageData] = useState<Cage[]>([]);
    const [harvestedData, setHarvestedData] = useState<HarvestedCage[]>([]);
    const [selectedCages, setSelectedCages] = useState<Set<string>>(new Set());
    
    const [activeCage, setActiveCage] = useState<Cage | null>(null);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [isHarvestModalOpen, setHarvestModalOpen] = useState(false);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [reportContent, setReportContent] = useState({ title: '', content: '' });
    const [isReportLoading, setReportLoading] = useState(false);
    const [theme, setTheme] = useState<Theme>('blue');

    const generateInitialData = () => {
        const initialCages = Array.from({ length: 50 }, (_, i) => {
            const farmingDays = Math.floor(Math.random() * 40);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - farmingDays);
            const initialWeight = Math.floor(Math.random() * 51) + 50;
            const growthRatePerDay = Math.random() * 3 + 2;
            const currentWeight = Math.round(initialWeight + (farmingDays * growthRatePerDay));
            const seedCost = Math.floor(Math.random() * 10000) + 10000;
            const feedCost = Math.floor(currentWeight * 150);
            const medicineCost = Math.random() > 0.8 ? Math.floor(Math.random() * 5000) + 2000 : 0;
            const hasAIAlert = Math.random() > 0.9;

            return {
                id: (i + 1).toString().padStart(3, '0'),
                startDate: startDate.toISOString(),
                initialWeight,
                currentWeight,
                progress: Math.min(100, Math.round((currentWeight / TARGET_WEIGHT) * 100)),
                costs: { seed: seedCost, feed: feedCost, medicine: medicineCost },
                growthHistory: Array.from({ length: 10 }, (_, j) => Math.floor(initialWeight + j * (farmingDays / 10) * growthRatePerDay + Math.random() * 20)),
                log: [{ date: startDate.toISOString(), message: `Thả giống với trọng lượng ${initialWeight}g.` }],
                aiAlert: hasAIAlert,
                deadCrabCount: Math.random() > 0.95 ? 1 : 0
            };
        });
        setCageData(initialCages);
    };

    useEffect(() => {
        generateInitialData();
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        if (savedTheme && ['blue', 'green', 'orange'].includes(savedTheme)) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('theme-blue', 'theme-green', 'theme-orange');
        root.classList.add(`theme-${theme}`);
        localStorage.setItem(THEME_STORAGE_KEY, theme);

        const themeColorMeta = document.getElementById('theme-color-meta');
        if (themeColorMeta) {
            const newColor = getComputedStyle(root).getPropertyValue('--theme-color-hex').trim();
            if (newColor) {
                themeColorMeta.setAttribute('content', newColor);
            }
        }
    }, [theme]);

    const handleAddCage = () => {
        const lastId = cageData.length > 0 ? Math.max(...cageData.map(c => parseInt(c.id))) : 0;
        const newId = (lastId + 1).toString().padStart(3, '0');
        const initialWeight = Math.floor(Math.random() * 51) + 50;
        const newCage: Cage = {
            id: newId,
            startDate: new Date().toISOString(),
            initialWeight,
            currentWeight: initialWeight,
            progress: Math.min(100, Math.round((initialWeight / TARGET_WEIGHT) * 100)),
            costs: { seed: Math.floor(Math.random() * 10000) + 10000, feed: 0, medicine: 0 },
            growthHistory: [initialWeight],
            log: [{ date: new Date().toISOString(), message: `Thả giống với trọng lượng ${initialWeight}g.` }],
            aiAlert: false,
            deadCrabCount: 0
        };
        setCageData(prev => [...prev, newCage]);
    };
    
    const handleSelectCage = (id: string, isSelected: boolean) => {
        const newSelection = new Set(selectedCages);
        if (isSelected) {
            newSelection.add(id);
        } else {
            newSelection.delete(id);
        }
        setSelectedCages(newSelection);
    };

    const handleBulkFeed = () => {
        setCageData(prevData =>
            prevData.map(cage => {
                if (selectedCages.has(cage.id)) {
                    return {
                        ...cage,
                        log: [...cage.log, { date: new Date().toISOString(), message: "Đánh dấu đã cho ăn (hàng loạt)." }]
                    };
                }
                return cage;
            })
        );
        alert(`${selectedCages.size} lồng đã được đánh dấu cho ăn.`);
        setSelectedCages(new Set());
    };
    
    const handleOpenDetails = (cage: Cage) => setActiveCage(cage);
    const handleCloseDetails = () => setActiveCage(null);
    
    const handleOpenUpdateModal = () => {
        setUpdateModalOpen(true);
        handleCloseDetails();
    };

    const handleUpdateCage = (updatedCage: Cage) => {
        setCageData(cages => cages.map(c => c.id === updatedCage.id ? updatedCage : c));
        setUpdateModalOpen(false);
    };
    
    const handleOpenHarvestModal = () => {
        setHarvestModalOpen(true);
        handleCloseDetails();
    };

    const handleHarvestCage = (finalWeight: number, pricePerKg: number) => {
        if (!activeCage) return;
        
        const totalCost = activeCage.costs.seed + activeCage.costs.feed + activeCage.costs.medicine;
        const revenue = (finalWeight / 1000) * pricePerKg;
        const profit = revenue - totalCost;

        const newHarvestedCage: HarvestedCage = {
            ...activeCage,
            finalWeight,
            pricePerKg,
            revenue,
            profit,
            harvestDate: new Date().toISOString()
        };
        
        setHarvestedData(prev => [...prev, newHarvestedCage]);
        setCageData(prev => prev.filter(c => c.id !== activeCage.id));
        setHarvestModalOpen(false);
        setActiveCage(null);
    };

    const handleDeleteCage = (id: string) => {
        setCageData(prev => prev.filter(c => c.id !== id));
        handleCloseDetails();
    };

    const handleGenerateReport = useCallback(async (reportType: ReportType) => {
        setReportLoading(true);
        setReportModalOpen(true);
        const report = await getAIReport(reportType, cageData, harvestedData);
        setReportContent(report);
        setReportLoading(false);
    }, [cageData, harvestedData]);

    if (!showDashboard) {
        return <LandingPage onEnter={() => setShowDashboard(true)} />;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Header onAddCage={handleAddCage} theme={theme} setTheme={setTheme} />
            <ReportCenter onGenerateReport={handleGenerateReport} />
            <CageGrid cages={cageData} onCardClick={handleOpenDetails} onSelectChange={handleSelectCage} selectedCages={selectedCages} />
            
            <BulkActionBar selectedCount={selectedCages.size} onFeed={handleBulkFeed} />
            <AIChatWidget allCages={cageData} harvestedCages={harvestedData} />
            
            {activeCage && (
                <DetailsModal 
                    cage={activeCage} 
                    onClose={handleCloseDetails} 
                    onUpdate={handleOpenUpdateModal}
                    onHarvest={handleOpenHarvestModal}
                    onDelete={handleDeleteCage}
                    targetWeight={TARGET_WEIGHT}
                />
            )}
            
            {isUpdateModalOpen && activeCage && (
                <UpdateModal 
                    cage={activeCage} 
                    onClose={() => setUpdateModalOpen(false)} 
                    onSave={handleUpdateCage} 
                />
            )}

            {isHarvestModalOpen && activeCage && (
                <HarvestModal 
                    cage={activeCage} 
                    onClose={() => setHarvestModalOpen(false)} 
                    onHarvest={handleHarvestCage} 
                />
            )}

            {isReportModalOpen && (
                <ReportModal
                    title={reportContent.title}
                    content={reportContent.content}
                    isLoading={isReportLoading}
                    onClose={() => setReportModalOpen(false)}
                />
            )}

        </div>
    );
};

export default App;
