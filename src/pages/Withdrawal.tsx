import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import memberService from '../api/memberService';
import MyPageLayout from '../components/MyPageLayout';

const Withdrawal = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [isAgreed, setIsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleWithdrawal = async (e) => {
        e.preventDefault();
        if (!password.trim()) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
        if (confirmText !== '탈퇴확인') {
            alert("'탈퇴확인' 문구를 정확히 입력해주세요.");
            return;
        }
        if (!window.confirm('정말로 탈퇴하시겠습니까? 모든 구매 내역과 포인트가 삭제되며 복구할 수 없습니다.')) {
            return;
        }

        setIsSubmitting(true);
        try {
            await memberService.withdraw(password);
            alert('회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.');
            localStorage.clear();
            navigate('/shop/main');
        } catch (e) {
            const msg = e.response?.data?.message || '탈퇴 처리에 실패했습니다.';
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MyPageLayout>
            <div className="bg-white border border-gray-100 p-8 md:p-12 shadow-sm max-w-[500px]">
                <header className="text-center mb-10">
                    <h2 className="text-[24px] font-bold tracking-tight mb-2 uppercase text-red-500">Member Withdrawal</h2>
                    <p className="text-gray-400 text-sm font-light">회원 탈퇴 전 아래 내용을 반드시 확인해 주세요.</p>
                </header>

                <div className="bg-red-50 p-6 rounded-sm mb-8 text-[13px] leading-relaxed text-red-700">
                    <p className="font-bold mb-2">탈퇴 시 유의사항:</p>
                    <ul className="list-disc ml-4 space-y-1 opacity-80">
                        <li>탈퇴 시 회원님의 개인정보 및 이용 기록은 모두 삭제됩니다.</li>
                        <li>보유하신 포인트 및 쿠폰은 자동 소멸되며 복구되지 않습니다.</li>
                        <li>전자상거래법에 의해 보존이 필요한 주문 내역은 일정 기간 보관됩니다.</li>
                        <li>탈퇴 후 동일한 아이디로 재가입이 불가능할 수 있습니다.</li>
                    </ul>
                </div>

                <form onSubmit={handleWithdrawal} className="flex flex-col gap-6">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isAgreed}
                            onChange={(e) => setIsAgreed(e.target.checked)}
                            className="w-4 h-4 accent-red-500"
                        />
                        <span className="text-[14px] font-medium text-gray-600">안내 사항을 모두 확인하였으며 이에 동의합니다.</span>
                    </label>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Password</label>
                        <input
                            type="password"
                            placeholder="현재 비밀번호를 입력해 주세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={!isAgreed}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-red-500 outline-none transition-all disabled:bg-gray-50"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-gray-400 ml-1 uppercase">Confirmation Text</label>
                        <input
                            type="text"
                            placeholder="'탈퇴확인'을 입력해 주세요"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            disabled={!isAgreed}
                            className="w-full border border-gray-200 px-4 py-3.5 text-sm focus:border-red-500 outline-none transition-all disabled:bg-gray-50"
                        />
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-4 border border-gray-200 text-gray-400 font-bold text-[14px] hover:bg-gray-50"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={!isAgreed || confirmText !== '탈퇴확인' || !password || isSubmitting}
                            className="flex-[2] py-4 bg-red-500 text-white font-bold text-[14px] hover:bg-red-600 transition-all shadow-md disabled:bg-gray-300 disabled:shadow-none"
                        >
                            {isSubmitting ? '처리 중...' : '탈퇴하기'}
                        </button>
                    </div>
                </form>
            </div>
        </MyPageLayout>
    );
};

export default Withdrawal;
