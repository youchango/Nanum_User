import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api/authService';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 상태 관리
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ⭐️ PrivateRoute나 ProductDetail에서 넘겨준 목적지와 상품 데이터를 추출합니다.
    const from = location.state?.from || '/shop/main';
    const directOrderData = location.state?.directOrderData;

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log('1. 로그인 시도 시작:', { loginId, password });

        setIsLoading(true);
        try {
            const response = await authService.login(loginId, password);
            console.log('2. 서버 응답 데이터:', response);

            const isSuccess =
                response.status === "SUCCESS" ||
                response.status === "200" ||
                response.message === "OK";

            if (isSuccess) {
                console.log('3. 로그인 검증 통과');

                const authData = response.data;

                if (authData.accessToken) {
                    localStorage.setItem('accessToken', authData.accessToken);
                }

                if (authData.memberInfo) {
                    localStorage.setItem('user', JSON.stringify(authData.memberInfo));
                }

                // ⭐️ 핵심 수정: 목적지로 이동할 때, 보관해둔 상품 데이터(directOrderData)를 다시 실어서 보냅니다.
                // 만약 directOrderData가 있다면 Checkout 페이지로 전달되고, 없으면 일반 리다이렉트가 됩니다.
                navigate(from, {
                    replace: true,
                    state: directOrderData ? { ...directOrderData } : null
                });

            } else {
                alert(response.message || '로그인 정보를 다시 확인해주세요.');
            }
        } catch (err) {
            console.error('❌ 4. 에러 발생:', err);
            const msg = err.message && !err.message.includes('?') ? err.message : '아이디 또는 비밀번호가 일치하지 않습니다.';
            alert(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#fcfcfc] px-6 py-20">
            <div className="max-w-[400px] w-full bg-white p-8 md:p-10 border border-gray-100 shadow-sm">

                <div className="text-center mb-10">
                    <h2 className="text-[24px] font-bold text-[#343434] tracking-tight mb-2">로그인</h2>
                    <p className="text-[13px] text-gray-400 font-light">Nanum에 오신 것을 환영합니다.</p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-[#666] ml-1">아이디</label>
                        <input
                            type="text"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9] focus:bg-white"
                            placeholder="아이디를 입력해주세요"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-[#666] ml-1">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9] focus:bg-white"
                            placeholder="비밀번호를 입력해주세요"
                            required
                        />
                    </div>

                    <div className="flex justify-between items-center mt-2 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="accent-[#333] w-4 h-4" />
                            <span className="text-[12px] text-[#888] group-hover:text-[#666]">로그인 유지</span>
                        </label>
                        <button type="button" onClick={() => navigate('/shop/find-password')} className="text-[12px] text-[#888] hover:underline">비밀번호 찾기</button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 bg-[#343434] text-white font-bold text-[15px] hover:bg-black transition-all active:scale-[0.98] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className="relative my-10 border-t border-gray-100">
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[11px] text-gray-300 uppercase tracking-widest">or</span>
                </div>

                <div className="flex flex-col gap-3">
                    <button className="w-full py-3.5 border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                        <span className="w-5 h-5 bg-[#FEE500] rounded-full flex items-center justify-center text-[10px]">K</span>
                        <span className="text-[13px] font-medium text-[#333]">카카오로 3초만에 시작하기</span>
                    </button>
                    <button className="w-full py-3.5 border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                        <span className="w-5 h-5 bg-[#03C75A] rounded-full flex items-center justify-center text-[10px] text-white">N</span>
                        <span className="text-[13px] font-medium text-[#333]">네이버로 로그인</span>
                    </button>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[13px] text-gray-400">
                        아직 회원이 아니신가요?
                        <button
                            onClick={() => navigate('/shop/signup')}
                            className="ml-2 text-[#968064] font-bold hover:underline"
                        >
                            회원가입
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;