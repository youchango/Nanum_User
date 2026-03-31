import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import inquiryService from '../api/inquiryService';
import MyPageLayout from '../components/MyPageLayout';

const INQUIRY_TYPES = [
    { value: 'PRODUCT', label: '상품문의' },
    { value: 'DELIVERY', label: '배송문의' },
    { value: 'ORDER', label: '주문/결제' },
    { value: 'ETC', label: '기타' },
];

const InquiryCreate = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderNo } = location.state || {};

    const [type, setType] = useState(orderNo ? 'ORDER' : '');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!type) {
            alert('문의 유형을 선택해주세요.');
            return;
        }
        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        if (content.trim().length < 10) {
            alert('내용을 10자 이상 입력해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            await inquiryService.createInquiry({ type, title: title.trim(), content: content.trim(), orderNo: orderNo || null });
            alert('문의가 등록되었습니다.');
            navigate('/shop/mypage/inquiries');
        } catch (err) {
            const msg = err.response?.data?.message || '문의 등록에 실패했습니다.';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MyPageLayout>
                <header className="mb-8 md:mb-10">
                    <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">New Inquiry</h2>
                    <p className="text-gray-400 text-[12px] md:text-[13px] font-light italic">
                        궁금하신 점을 남겨주세요.
                        {orderNo && <span className="ml-2 text-[#968064] font-medium not-italic">주문번호: {orderNo}</span>}
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-sm p-6 md:p-10 rounded-sm">
                    <div className="flex flex-col gap-6 md:gap-8">

                        {/* 문의 유형 */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">문의 유형</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full border border-gray-200 px-4 py-3 text-[13px] outline-none bg-[#f9f9f9] focus:bg-white focus:border-[#333] transition-colors appearance-none"
                            >
                                <option value="">선택해주세요</option>
                                {INQUIRY_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* 제목 */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">제목</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="제목을 입력해주세요"
                                maxLength={100}
                                className="w-full border border-gray-200 px-4 py-3 text-[13px] outline-none bg-[#f9f9f9] focus:bg-white focus:border-[#333] transition-colors"
                            />
                        </div>

                        {/* 내용 */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">내용</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="내용을 입력해주세요 (최소 10자)"
                                rows={8}
                                className="w-full border border-gray-200 px-4 py-3 text-[13px] outline-none bg-[#f9f9f9] focus:bg-white focus:border-[#333] transition-colors resize-none leading-relaxed"
                            />
                            <p className="text-[11px] text-gray-300 mt-1 text-right">{content.length}자</p>
                        </div>

                        {/* 버튼 */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/shop/mypage/inquiries')}
                                className="flex-1 py-4 border border-gray-200 text-[#333] text-[12px] font-bold hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-widest"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`flex-1 py-4 text-white text-[12px] font-bold transition-all active:scale-95 uppercase tracking-widest ${
                                    submitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#333] hover:bg-black'
                                }`}
                            >
                                {submitting ? '등록 중...' : '등록'}
                            </button>
                        </div>
                    </div>
                </form>
        </MyPageLayout>
    );
};

export default InquiryCreate;
