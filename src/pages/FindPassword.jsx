import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import memberService from '../api/memberService';

const FindPassword = () => {
    const navigate = useNavigate();

    const [memberId, setMemberId] = useState('');
    const [memberName, setMemberName] = useState('');
    const [mobilePhone, setMobilePhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tempPassword, setTempPassword] = useState(null);

    const formatPhone = (value) => {
        const numbers = value.replace(/[^0-9]/g, '').slice(0, 11);
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    };

    const handlePhoneChange = (e) => {
        setMobilePhone(formatPhone(e.target.value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await memberService.resetPassword({
                memberId,
                memberName,
                mobilePhone: mobilePhone.replace(/-/g, ''),
            });

            const isSuccess =
                response.status === "SUCCESS" ||
                response.status === "200" ||
                response.message === "OK";

            if (isSuccess) {
                setTempPassword(response.data?.tempPassword || response.data);
            } else {
                alert(response.message || '입력하신 정보와 일치하는 회원을 찾을 수 없습니다.');
            }
        } catch (err) {
            const msg = err.message && !err.message.includes('?')
                ? err.message
                : '입력하신 정보와 일치하는 회원을 찾을 수 없습니다.';
            alert(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // 임시 비밀번호 발급 완료 화면
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
                        <h2 className="text-[24px] font-bold text-[#343434] tracking-tight mb-2">
                            임시 비밀번호 발급 완료
                        </h2>
                        <p className="text-[13px] text-gray-400 font-light">
                            임시 비밀번호가 발급되었습니다.
                        </p>
                    </div>

                    <div className="bg-[#f9f6f2] border border-[#e8e0d6] p-5 text-center mb-6">
                        <p className="text-[12px] text-[#888] mb-2">임시 비밀번호</p>
                        <p className="text-[20px] font-bold text-[#343434] tracking-wider font-mono select-all">
                            {tempPassword}
                        </p>
                    </div>

                    <p className="text-[13px] text-[#c0392b] text-center mb-8 font-medium">
                        로그인 후 반드시 비밀번호를 변경해주세요.
                    </p>

                    <button
                        onClick={() => navigate('/shop/login')}
                        className="w-full py-4 bg-[#343434] text-white font-bold text-[15px] hover:bg-black transition-all active:scale-[0.98]"
                    >
                        로그인하기
                    </button>
                </div>
            </div>
        );
    }

    // 비밀번호 찾기 폼
    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#fcfcfc] px-6 py-20">
            <div className="max-w-[400px] w-full bg-white p-8 md:p-10 border border-gray-100 shadow-sm">

                <div className="text-center mb-10">
                    <h2 className="text-[24px] font-bold text-[#343434] tracking-tight mb-2">비밀번호 찾기</h2>
                    <p className="text-[13px] text-gray-400 font-light">
                        가입 시 등록한 정보를 입력해주세요.
                    </p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-[#666] ml-1">아이디</label>
                        <input
                            type="text"
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9] focus:bg-white"
                            placeholder="아이디를 입력해주세요"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-[#666] ml-1">이름</label>
                        <input
                            type="text"
                            value={memberName}
                            onChange={(e) => setMemberName(e.target.value)}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9] focus:bg-white"
                            placeholder="이름을 입력해주세요"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-[#666] ml-1">휴대폰 번호</label>
                        <input
                            type="tel"
                            value={mobilePhone}
                            onChange={handlePhoneChange}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-[#333] outline-none transition-all bg-[#f9f9f9] focus:bg-white"
                            placeholder="010-0000-0000"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 mt-4 bg-[#343434] text-white font-bold text-[15px] hover:bg-black transition-all active:scale-[0.98] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? '처리 중...' : '임시 비밀번호 발급'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/shop/login')}
                        className="text-[13px] text-[#968064] font-bold hover:underline"
                    >
                        로그인으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FindPassword;
