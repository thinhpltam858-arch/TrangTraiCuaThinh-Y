import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail } from '../services/firebaseService';

const AuthPage: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (isLoginView) {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
            // On successful login/signup, the onAuthStateChanged listener in App.tsx will handle the redirect.
        } catch (err: any) {
            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    setError('Email hoặc mật khẩu không chính xác.');
                    break;
                case 'auth/email-already-in-use':
                    setError('Email này đã được sử dụng.');
                    break;
                case 'auth/weak-password':
                    setError('Mật khẩu phải có ít nhất 6 ký tự.');
                    break;
                case 'auth/invalid-email':
                     setError('Vui lòng nhập một địa chỉ email hợp lệ.');
                     break;
                default:
                    setError('Đã xảy ra lỗi. Vui lòng thử lại.');
                    break;
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <h1 className="text-3xl font-bold text-center text-primary-600">Trang Trại Cua Thịnh Ý</h1>
                <p className="text-center text-gray-600 mt-2 mb-8">Chào mừng! Vui lòng đăng nhập để tiếp tục.</p>
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="flex border-b mb-6">
                        <button
                            onClick={() => setIsLoginView(true)}
                            className={`w-1/2 py-3 font-semibold text-center transition-colors ${isLoginView ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => setIsLoginView(false)}
                            className={`w-1/2 py-3 font-semibold text-center transition-colors ${!isLoginView ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
                        >
                            Đăng ký
                        </button>
                    </div>
                    <form onSubmit={handleAuthAction} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Địa chỉ Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
                            >
                                {isLoading ? 'Đang xử lý...' : (isLoginView ? 'Đăng nhập' : 'Tạo tài khoản')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
