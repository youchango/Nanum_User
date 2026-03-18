import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import contentService from '../api/contentService';
import { formatDate } from '../utils/dateFormat';

const NoticeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotice = async () => {
            setLoading(true);
            try {
                const res = await contentService.getNotice(id);
                setNotice(res.data?.data);
            } catch (e) {
                console.error('공지사항 조회 실패:', e);
                setNotice(null);
            } finally {
                setLoading(false);
            }
        };
        fetchNotice();
    }, [id]);

    const handleGoBack = () => {
        navigate('/shop/notice', {
            state: {
                fromPage: location.state?.fromPage || 1,
                searchTerm: location.state?.searchTerm || ""
            }
        });
    };

    if (loading) return <div className="py-40 text-center text-gray-400 font-light">글을 불러오는 중입니다...</div>;
    if (!notice) return (
        <div className="py-40 text-center">
            <p className="text-gray-400 mb-6">공지사항을 찾을 수 없습니다.</p>
            <button onClick={handleGoBack} className="px-8 py-3 bg-[#333] text-white text-[13px] font-bold hover:bg-black">목록으로</button>
        </div>
    );

    return (
        <div className="w-full bg-white pb-20">
            {/* 상단 헤더 */}
            <section className="bg-[#f8f5f2] py-12 md:py-16 px-6">
                <div className="max-w-[800px] mx-auto text-center">
                    <span className="text-[12px] text-[#968064] font-bold tracking-widest uppercase mb-2 block">{notice.typeDesc}</span>
                    <h2 className="text-[22px] md:text-[28px] font-medium text-[#333] leading-snug">{notice.subject}</h2>
                    <p className="text-[#999] text-[13px] mt-4 font-light">{formatDate(notice.createdAt)}</p>
                </div>
            </section>

            {/* 본문 영역 */}
            <section className="max-w-[800px] mx-auto px-6 py-12 md:py-20">
                <div className="min-h-[400px] text-[#555] text-[15px] md:text-[16px] leading-loose whitespace-pre-wrap border-b border-gray-100 pb-20 font-light">
                    {notice.contentBody}
                </div>

                {/* 목록 버튼 */}
                <div className="mt-12 flex justify-center">
                    <button
                        onClick={handleGoBack}
                        className="px-14 py-4 border border-[#333] text-[#333] text-[13px] font-bold hover:bg-[#333] hover:text-white transition-all active:scale-[0.98]"
                    >
                        목록으로
                    </button>
                </div>
            </section>
        </div>
    );
};

export default NoticeDetail;
