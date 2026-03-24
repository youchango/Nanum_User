import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import memberService from '../api/memberService';

const FindPassword = () => {
    const navigate = useNavigate();

    const [memberId, setMemberId] = useState('');
    const [memberName, setMemberName] = useState('');
    const [email, setEmail] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tempPassword, setTempPassword] = useState(null);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const formatTime = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

    const handleSendCode = async () => {
        if (!memberId.trim()) { alert('아이디를 입력해주세요.'); return; }
        if (!memberName.trim()) { alert('이름을 입력해주세요.'); return; }
        if (!email.trim() || !email.includes('@')) { alert('올바른 이메일을 입력해주세요.'); return; }
        try {
            const res = await memberService.sendEmailCode({ memberId, memberName, email, purpose: 'RESET_PASSWORD' });
            const result = res.data;
            if (result.status === 'SUCCESS') {
                setIsCodeSent(true);
                setIsVerified(false);
                setVerifyCode('');
                setCountdown(180);
                alert('인증번호가 발송되었습니다.' + (result.data?.devCode ? ` (개발모드: ${result.data.devCode})` : ''));
            } else {
                alert(result.message);
            }
        } catch (err) {
            alert(err.response?.data?.message || '인증번호 발송에 실패했습니다.');
        }
    };

    const handleVerifyCode = async () => {
        if (!verifyCode || verifyCode.length !== 6) { alert('인증번호 6자리를 입력해주세요.'); return; }
        try {
            const res = await memberService.verifyEmailCode({ email, purpose: 'RESET_PASSWORD', code: verifyCode });
            const result = res.data;
            if (result.status === 'SUCCESS') {
                setIsVerified(true);
                setCountdown(0);
            } else {
                alert(result.message);
            }
        } catch (err) {
            alert(err.response?.data?.message || '인증번호 확인에 실패했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isVerified) { alert('이메일 인증을 먼저 완료해주세요.'); return; }
        setIsLoading(true);
        try {
            const res = await memberService.resetPassword({ memberId, memberName, email });
            const result = res.data;
            if (result.status === 'SUCCESS') {
                setTempPassword(result.data?.tempPassword);
            } else {
                alert(result.message || '임시 비밀번호 발급에 실패했습니다.');
            }
        } catch (err) {
            alert(err.response?.data?.message || '임시 비밀번호 발급에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (tempPassword) {
        return (
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#fcfcfc] px-6 py-20">
                <div className="max-w-[400px] w-full bg-white p-8 md:p-10 border border-gray-100 shadow-sm">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 mx-auto mb-5 bg-[#f5f0eb] rounded-full flex items-center justify-center">
                            <svg className="w-7 h-7 text-[#968064]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-[24px] font-bold text-[#343434] tracking-tight mb-2">임시 비밀번호 발급 완료</h2>
                        <p className="text-[13px] text-gray-400 font-light">로그인 후 반드시 비밀번호를 변경해주세요.</p>
                    </div>
                    <div className="bg-[#f9f6f2] border border-[#e8e0d6] p-5 text-center mb-6">
                        <p className="text-[12px] text-[#888] mb-2">임시 비밀번호</p>
                        <p className="text-[20px] font-bold text-[#343434] tracking-wider font-mono select-all">{tempPassword}</p>
                    </div>
                    <button onClick={() => navigate('/shop/login')}
                        className="w-full py-4 bg-[#343434] text-white font-bold text-[15px] hover:bg-black transition-all active:scale-[0.98]">
                        로그인하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#fcfcfc] px-6 py-20">
            <div className="max-w-[400px] w-full bg-white p-8 md:p-10 border border-gray-100 shadow-sm">
                <div className="text-center mb-10">
                    <h2 className="text-[24px] font-bold text-[#343434] tracking-tight mb-2">비밀번호 찾기</h2>
                    <p className="text-[13px] text-gray-400 font-light">가입 시 등록한 정보를 입력해주세요.</p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-[#666] ml-1">아이디</label>
                        <input type="text" value={memberId} onChange={(e) => setMemberId(e.target.value)}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9] focus:bg-white"
                            placeholder="아이디를 입력해주세요" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-[#666] ml-1">이름</label>
                        <input type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9] focus:bg-white"
                            placeholder="이름을 입력해주세요" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-[#666] ml-1">이메일</label>
                        <div className="flex gap-2">
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9] focus:bg-white"
                                placeholder="가입 시 등록한 이메일" required disabled={isVerified} />
                            <button type="button" onClick={handleSendCode}
                                disabled={isVerified || countdown > 0}
                                className={`shrink-0 px-4 py-3.5 text-[13px] font-bold transition-all ${
                                    isVerified ? 'bg-green-50 text-green-600 border border-green-200' :
                                    countdown > 0 ? 'bg-gray-100 text-gray-400 border border-gray-200' :
                                    'bg-[#343434] text-white hover:bg-black'
                                }`}>
                                {isVerified ? '인증완료' : countdown > 0 ? formatTime(countdown) : isCodeSent ? '재발송' : '인증요청'}
                            </button>
                        </div>
                    </div>

                    {isCodeSent && !isVerified && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] font-bold text-[#666] ml-1">인증번호</label>
                            <div className="flex gap-2">
                                <input type="text" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="flex-1 border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9] focus:bg-white tracking-[0.3em] text-center font-mono"
                                    placeholder="6자리 입력" maxLength={6} />
                                <button type="button" onClick={handleVerifyCode}
                                    className="shrink-0 px-4 py-3.5 text-[13px] font-bold bg-[#968064] text-white hover:bg-[#7a6850] transition-all">
                                    확인
                                </button>
                            </div>
                            {countdown > 0 && <p className="text-[11px] text-[#c0392b] ml-1">남은 시간: {formatTime(countdown)}</p>}
                        </div>
                    )}

                    <button type="submit" disabled={isLoading || !isVerified}
                        className={`w-full py-4 mt-4 font-bold text-[15px] transition-all active:scale-[0.98] ${
                            isVerified ? 'bg-[#343434] text-white hover:bg-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}>
                        {isLoading ? '처리 중...' : '임시 비밀번호 발급'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button onClick={() => navigate('/shop/login')}
                        className="text-[13px] text-[#968064] font-bold hover:underline">
                        로그인으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FindPassword;
