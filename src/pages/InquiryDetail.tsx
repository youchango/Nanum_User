import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import inquiryService from '../api/inquiryService';
import { formatDateTime } from '../utils/dateFormat';
import MyPageLayout from '../components/MyPageLayout';

const STATUS_STYLE = {
    WAIT: 'bg-gray-100 text-gray-500',
    PROCESS: 'bg-blue-50 text-blue-500',
    COMPLETE: 'bg-green-50 text-green-600',
};

const InquiryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchInquiry = async () => {
            setLoading(true);
            setError(false);
            try {
                const res = await inquiryService.getInquiry(id);
                const data = res.data;
                if (!data) throw new Error('문의 데이터가 없습니다.');
                setInquiry(data);
            } catch (err) {
                console.error('문의 상세 조회 실패:', err);
                setInquiry(null);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchInquiry();
        window.scrollTo(0, 0);
    }, [id]);

    const goBackToList = () => {
        navigate('/shop/mypage/inquiries');
    };

    if (loading) return (
        <MyPageLayout>
            <div className="py-40 text-center text-gray-400 uppercase tracking-widest text-sm">
                Loading Inquiry...
            </div>
        </MyPageLayout>
    );

    if (error || !inquiry) return (
        <MyPageLayout>
            <div className="py-20 text-center">
                <p className="text-gray-400 mb-6">문의 정보를 불러올 수 없습니다.</p>
                <button onClick={goBackToList} className="px-8 py-3 bg-[#333] text-white text-[13px] font-bold hover:bg-black">
                    목록으로 돌아가기
                </button>
            </div>
        </MyPageLayout>
    );

    return (
        <MyPageLayout>

                {/* 상단 헤더 */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-8 gap-4">
                    <div>
                        <h2 className="text-[26px] md:text-[32px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">Inquiry Detail</h2>
                        <p className="text-gray-400 text-[13px] font-light leading-relaxed">
                            등록일시: <span className="text-[#333] font-medium">{formatDateTime(inquiry.createdAt)}</span>
                        </p>
                    </div>
                    <button
                        onClick={goBackToList}
                        className="w-fit text-[12px] text-gray-400 hover:text-black underline underline-offset-4 font-bold transition-colors uppercase tracking-widest"
                    >
                        &larr; Back to List
                    </button>
                </header>

                <div className="flex flex-col gap-8 md:gap-12">

                    {/* 문의 상태 & 유형 */}
                    <section className="bg-white border border-gray-100 p-6 md:p-8 flex justify-between items-center shadow-sm rounded-sm">
                        <div>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-1 block">Type</span>
                            <span className="inline-block px-2.5 py-1 rounded-sm text-[11px] font-bold bg-gray-100 text-gray-500">
                                {inquiry.typeDesc}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-1 block">Status</span>
                            <span className={`inline-block px-2.5 py-1 rounded-sm text-[11px] font-bold ${STATUS_STYLE[inquiry.status] || 'bg-gray-100 text-gray-500'}`}>
                                {inquiry.statusDesc}
                            </span>
                        </div>
                    </section>

                    {/* 문의 내용 */}
                    <section>
                        <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] mb-5 border-l-2 border-[#333] pl-3">Question</h3>
                        <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-sm rounded-sm">
                            <h4 className="text-[16px] md:text-[18px] font-bold mb-4 leading-snug">{inquiry.title}</h4>
                            <p className="text-[13px] md:text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">{inquiry.content}</p>
                        </div>
                    </section>

                    {/* 답변 */}
                    <section>
                        <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] mb-5 border-l-2 border-[#968064] pl-3">Answer</h3>
                        {inquiry.answer ? (
                            <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-sm rounded-sm">
                                <p className="text-[13px] md:text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">{inquiry.answer}</p>
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <p className="text-[11px] text-gray-400 font-light">
                                        답변일시: <span className="font-medium">{formatDateTime(inquiry.answeredAt)}</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-dashed border-gray-200 p-8 md:p-12 text-center rounded-sm">
                                <p className="text-gray-300 italic text-[13px]">답변 대기 중입니다.</p>
                            </div>
                        )}
                    </section>

                    {/* 목록으로 */}
                    <div className="mt-4">
                        <button
                            onClick={goBackToList}
                            className="w-full py-4 md:py-5 border border-gray-200 text-[#333] font-bold text-[12px] md:text-[13px] uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-[0.98]"
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                </div>
        </MyPageLayout>
    );
};

export default InquiryDetail;
