
import React from 'react';

interface LandingPageProps {
    onEnter: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg text-center border border-white/20">
        <div className="flex justify-center items-center mb-4 h-16 w-16 mx-auto bg-primary-500/20 rounded-full">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-200">{description}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
    return (
        <div 
            className="min-h-screen bg-cover bg-center text-white flex flex-col" 
            style={{ backgroundImage: "url('https://picsum.photos/seed/crabfarm/1920/1080')" }}
        >
            <div className="min-h-screen bg-gray-900/60 backdrop-blur-sm flex flex-col justify-center items-center p-8">
                <header className="text-center mb-12 animate-fade-in-down">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Trang Trại Nuôi Cua Thịnh Ý</h1>
                    <p className="mt-4 text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto">
                        Quản lý trang trại cua thông minh hơn với sức mạnh của AI.
                    </p>
                </header>

                <main className="flex-grow flex flex-col justify-center items-center w-full">
                    <button 
                        onClick={onEnter}
                        className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-10 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl animate-fade-in-up"
                    >
                        Vào Bảng Điều Khiển
                    </button>

                    <div className="mt-20 w-full max-w-5xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard 
                                icon={<svg className="w-8 h-8 text-primary-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                                title="Theo dõi thời gian thực"
                                description="Giám sát trọng lượng, chi phí và sức khỏe của từng lồng cua một cách trực quan."
                            />
                            <FeatureCard 
                                icon={<svg className="w-8 h-8 text-primary-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                title="Cố Vấn AI Toàn Năng"
                                description="Chủ động đề xuất hành động, từ việc lên lịch thu hoạch đến cảnh báo các rủi ro tiềm ẩn, giúp bạn đưa ra quyết định nhanh chóng và chính xác."
                            />
                            <FeatureCard 
                                icon={<svg className="w-8 h-8 text-primary-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a3 3 0 00-3-3H4a2 2 0 00-2 2v2a2 2 0 002 2h2a3 3 0 003-3zm10 0v-2a3 3 0 00-3-3h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a3 3 0 003-3zM9 7V5a3 3 0 00-3-3H4a2 2 0 00-2 2v2a2 2 0 002 2h2a3 3 0 003-3zm10 0V5a3 3 0 00-3-3h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a3 3 0 003-3z" /></svg>}
                                title="Quản lý toàn diện"
                                description="Quản lý chi phí, thu hoạch và lợi nhuận một cách dễ dàng và hiệu quả."
                            />
                        </div>
                    </div>
                </main>
                
                <footer className="mt-12 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Trang Trại Nuôi Cua Thịnh Ý. All rights reserved.</p>
                </footer>
            </div>
            
            <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }

                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default LandingPage;
