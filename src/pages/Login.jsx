import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

const Login = () => {
    const navigate = useNavigate();

    // 상태 관리 (명세서 규격 loginId 확인 완료)
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log('1. 로그인 시도 시작:', { loginId, password });

        setIsLoading(true);
        try {
            const response = await authService.login(loginId, password);
            console.log('2. 서버 응답 데이터:', response);

            // 💡 수정된 조건: status가 "SUCCESS"이거나 "200" 또는 "OK"인 경우 모두 허용
            const isSuccess =
                response.status === "SUCCESS" ||
                response.status === "200" ||
                response.message === "OK";

            if (isSuccess) {
                console.log('3. 로그인 검증 통과');

                // 데이터 구조가 response.data.data 형태인지 확인 필요
                const authData = response.data;

                // 토큰 저장 (accessToken만 저장하고 refreshToken은 쿠키가 알아서 하게 둡니다)
                if (authData.accessToken) {
                    localStorage.setItem('accessToken', authData.accessToken);
                }

                // 사용자 정보 저장
                if (authData.memberInfo) {
                    localStorage.setItem('user', JSON.stringify(authData.memberInfo));
                }

                // alert(`${authData.memberInfo?.memberName || '회원'}님, 환영합니다!`);
                navigate('/shop/main');
            } else {
                // SUCCESS가 아닌 다른 응답이 왔을 때 (예: ERROR)
                alert(response.message || '로그인 정보를 다시 확인해주세요.');
            }
        } catch (err) {
            console.error('❌ 4. 에러 발생:', err);
            // 에러 메시지가 깨진다면 기본 메시지 출력
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
                            onChange={(e) => setLoginId(e.target.value)} // 수정된 부분
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
                        <button type="button" className="text-[12px] text-[#888] hover:underline">비밀번호 찾기</button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 bg-[#343434] text-white font-bold text-[15px] hover:bg-black transition-all active:scale-[0.98] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                {/* 하단 생략 (기존과 동일) */}
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