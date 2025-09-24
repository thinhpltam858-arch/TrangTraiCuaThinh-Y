import React from 'react';

const FirebaseSetup: React.FC = () => {
    const exampleConfig = `
const firebaseConfig = {
  apiKey: "AIzaSyB...xxxxxxxxxxxx",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:xxxxxxxxxxxx"
};
    `;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg text-center">
                <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <h1 className="text-2xl font-bold text-gray-800 mt-4">Cần Cấu hình Firebase</h1>
                <p className="text-gray-600 mt-2">
                    Ứng dụng cần được kết nối với cơ sở dữ liệu Firebase để lưu trữ dữ liệu an toàn trên đám mây.
                </p>
                <div className="text-left bg-gray-50 p-4 rounded-lg mt-6">
                    <p className="text-sm text-gray-700 font-medium mb-2">Hành động cần thiết:</p>
                    <p className="text-sm text-gray-600">
                        Vui lòng cung cấp đối tượng `firebaseConfig` bạn nhận được từ Bảng điều khiển Firebase cho tôi (AI). Tôi sẽ tích hợp nó vào file `services/firebaseService.ts` để kích hoạt ứng dụng.
                    </p>
                    <p className="text-sm text-gray-700 font-medium mb-2 mt-4">Dữ liệu cần tìm trông giống như sau:</p>
                    <pre className="bg-gray-800 text-white p-3 rounded-md text-xs overflow-x-auto">
                        <code>
                            {exampleConfig.trim()}
                        </code>
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default FirebaseSetup;
