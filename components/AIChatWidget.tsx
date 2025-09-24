
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAIStreamedResponse } from '../services/geminiService';
import { Cage, HarvestedCage, ChatMessage } from '../types';

interface AIChatWidgetProps {
    allCages: Cage[];
    harvestedCages: HarvestedCage[];
}

const suggestedPrompts = [
    "Top 3 lồng phát triển tốt nhất?",
    "Liệt kê các lồng sắp thu hoạch.",
    "Phân tích chi phí và lợi nhuận.",
    "Lồng nào có cảnh báo AI?",
    "Thời gian nuôi trung bình là bao lâu?",
];

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ allCages, harvestedCages }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleToggleChat = (openState: boolean) => {
        setIsOpen(openState);
        if (openState && messages.length === 0) {
            setMessages([{ sender: 'ai', text: 'Xin chào! Tôi là Cố vấn AI của bạn. Hãy hỏi tôi bất cứ điều gì về trang trại hoặc chọn một gợi ý bên dưới.' }]);
        }
    };
    
    const sendQuery = async (query: string) => {
        if (!query || isLoading) return;

        const newUserMessage: ChatMessage = { sender: 'user', text: query };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        const aiResponse: ChatMessage = { sender: 'ai', text: '' };
        setMessages(prev => [...prev, aiResponse]);

        try {
            const stream = getAIStreamedResponse(query, allCages, harvestedCages);
            for await (const chunk of stream) {
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.sender === 'ai') {
                       const updatedMessages = [...prev.slice(0, -1), { ...lastMessage, text: lastMessage.text + chunk }];
                       return updatedMessages;
                    }
                    return prev;
                });
            }
        } catch (error) {
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.sender === 'ai') {
                    return [...prev.slice(0, -1), { ...lastMessage, text: "Đã có lỗi xảy ra. Vui lòng thử lại." }];
                }
                return prev;
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        sendQuery(userInput.trim());
    };

    const handleSuggestionClick = (prompt: string) => {
        sendQuery(prompt);
    }
    
    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className={`ai-chat-widget bg-white rounded-lg shadow-2xl w-80 sm:w-96 transform origin-bottom-right ${isOpen ? 'scale-100' : 'scale-0'}`}>
                <div className="bg-primary-500 text-white p-3 rounded-t-lg flex justify-between items-center">
                    <h3 className="font-semibold">Cố Vấn AI Thịnh Ý</h3>
                    <button onClick={() => handleToggleChat(false)} className="text-white text-2xl leading-none">&times;</button>
                </div>
                <div ref={chatBoxRef} className="p-3 h-80 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`ai-chat-bubble rounded-lg px-3 py-2 max-w-xs sm:max-w-sm ${msg.sender === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                {msg.sender === 'ai' ? (
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    msg.text
                                )}
                                {isLoading && msg.sender === 'ai' && index === messages.length -1 && <span className="inline-block w-2 h-2 ml-1 bg-gray-500 rounded-full animate-pulse"></span>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-2 border-t">
                     <div className="px-1 pb-2 flex flex-wrap gap-2">
                        {suggestedPrompts.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => handleSuggestionClick(prompt)}
                                disabled={isLoading}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleSubmit} className="flex items-center">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={isLoading ? "AI đang trả lời..." : "Hỏi Cố vấn AI..."}
                            disabled={isLoading}
                            className="w-full border-gray-300 rounded-md p-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button type="submit" className="ml-2 text-primary-500 disabled:text-gray-400" disabled={isLoading || !userInput}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                        </button>
                    </form>
                </div>
            </div>
            <button
                onClick={() => handleToggleChat(true)}
                className={`bg-primary-500 text-white rounded-full p-4 shadow-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
            </button>
        </div>
    );
};

export default AIChatWidget;
