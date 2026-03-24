import React, { useState, useEffect } from 'react';
import contentService from '../api/contentService';

const FaqList = () => {
    const [faqs, setFaqs] = useState([]);
    const [openId, setOpenId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await contentService.getFaqs();
                const data = res.data?.data;
                setFaqs(data?.content || data?.contentList || (Array.isArray(data) ? data : []));
            } catch (e) {
                console.error('FAQ 로드 실패:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const toggle = (id) => setOpenId(openId === id ? null : id);

    if (loading) return <div className="py-40 text-center text-gray-400">로딩 중...</div>;

    return (
        <div className="w-full bg-white min-h-[calc(100vh-200px)]">
            <div className="max-w-[800px] mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-[28px] md:text-[36px] font-bold text-[#333] tracking-tight">FAQ</h1>
                    <p className="text-[14px] text-gray-400 mt-2 font-light">자주 묻는 질문을 확인해보세요.</p>
                </div>

                {faqs.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 border border-dashed border-gray-200 rounded">
                        등록된 FAQ가 없습니다.
                    </div>
                ) : (
                    <div className="border-t border-gray-200">
                        {faqs.map((faq) => (
                            <div key={faq.id} className="border-b border-gray-100">
                                <button
                                    onClick={() => toggle(faq.id)}
                                    className="w-full flex items-center justify-between py-5 px-2 text-left hover:bg-[#fafafa] transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[#968064] font-bold text-[14px]">Q</span>
                                        <span className="text-[15px] text-[#333] font-medium">{faq.subject}</span>
                                    </div>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openId === faq.id && (
                                    <div className="px-2 pb-6 pl-9">
                                        <div className="flex gap-3">
                                            <span className="text-[#968064] font-bold text-[14px] shrink-0">A</span>
                                            <div className="text-[14px] text-[#666] leading-[1.8] font-light"
                                                dangerouslySetInnerHTML={{ __html: faq.contentBody || faq.content || '' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaqList;
