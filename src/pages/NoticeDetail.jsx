import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const NoticeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // ⭐️ 이전 페이지 상태를 받기 위해 추가
    const [notice, setNotice] = useState(null);

    // 1. 임시 데이터 (List와 동일하게 유지)
    const notices = [
        { id: 1, title: "[공지] 설 연휴 배송 일정 안내", date: "2026.01.20", category: "배송", content: `안녕하세요, Nanum입니다.\n\n설 연휴 기간 동안의 배송 일정을 안내드립니다.\n연휴 전 마지막 배송은 1월 26일(월) 오전 10시 결제 건까지이며, 이후 주문 건은 2월 2일(월)부터 순차적으로 출고될 예정입니다.\n\n명절 물량 증가로 인해 평소보다 배송이 1~2일 지연될 수 있는 점 양해 부탁드립니다.\n\n풍성한 한가위 되시길 바랍니다. 감사합니다.` },
        { id: 2, title: "새로운 Nanum 멤버십 혜택 안내", date: "2026.01.15", category: "이벤트", content: "멤버십 혜택 내용입니다..." },
        { id: 3, title: "시스템 정기 점검 안내 (2월 10일)", date: "2026.01.10", category: "안내", content: "점검 내용입니다..." },
        { id: 4, title: "개인정보 처리방침 개정 안내", date: "2026.01.05", category: "안내", content: "개인정보 처리방침 개정 관련 상세 내용입니다..." },
        { id: 5, title: "겨울 시즌 오프 세일 공지", date: "2025.12.28", category: "이벤트", content: "시즌 오프 세일 상세 품목 안내입니다..." },
        { id: 6, title: "신규 결제 수단 추가 안내 (네이버페이)", date: "2025.12.20", category: "안내", content: "네이버페이 결제 도입 안내입니다..." },
        { id: 7, title: "신규 결제 수단 추가 안내 (네이버페이)", date: "2025.12.20", category: "안내", content: "네이버페이 결제 도입 안내입니다..." },
        { id: 8, title: "신규 결제 수단 추가 안내 (네이버페이)", date: "2025.12.20", category: "안내", content: "네이버페이 결제 도입 안내입니다..." },
    ];

    // 2. 현재 글 및 이전글/다음글 계산
    const currentIndex = notices.findIndex(n => n.id === parseInt(id));
    const prevNotice = currentIndex > 0 ? notices[currentIndex - 1] : null;
    const nextNotice = currentIndex < notices.length - 1 ? notices[currentIndex + 1] : null;

    useEffect(() => {
        const found = notices.find(n => n.id === parseInt(id));
        if (found) {
            setNotice(found);
            window.scrollTo(0, 0); // ⭐️ 상세 진입 시 스크롤 상단으로
        }
    }, [id]);

    // ⭐️ 목록으로 돌아갈 때 상태 전달 (중요)
    const handleGoBack = () => {
        navigate('/shop/notice', {
            state: {
                fromPage: location.state?.fromPage || 1,
                searchTerm: location.state?.searchTerm || ""
            }
        });
    };

    if (!notice) return <div className="py-40 text-center text-gray-400 font-light">글을 불러오는 중입니다...</div>;

    return (
        <div className="w-full bg-white pb-20">
            {/* 상단 헤더 */}
            <section className="bg-[#f8f5f2] py-12 md:py-16 px-6">
                <div className="max-w-[800px] mx-auto text-center">
                    <span className="text-[12px] text-[#968064] font-bold tracking-widest uppercase mb-2 block">{notice.category}</span>
                    <h2 className="text-[22px] md:text-[28px] font-medium text-[#333] leading-snug">{notice.title}</h2>
                    <p className="text-[#999] text-[13px] mt-4 font-light">{notice.date}</p>
                </div>
            </section>

            {/* 본문 영역 */}
            <section className="max-w-[800px] mx-auto px-6 py-12 md:py-20">
                <div className="min-h-[400px] text-[#555] text-[15px] md:text-[16px] leading-loose whitespace-pre-wrap border-b border-gray-100 pb-20 font-light">
                    {notice.content}
                </div>

                {/* 하단 네비게이션 */}
                <div className="mt-10 border-t border-b border-gray-100 divide-y divide-gray-100">
                    {prevNotice && (
                        <div
                            className="flex items-center py-5 px-2 hover:bg-[#fcfcfc] cursor-pointer group transition-all"
                            onClick={() => navigate(`/shop/notice/${prevNotice.id}`, { state: location.state })}
                        >
                            <span className="w-20 text-[11px] text-gray-400 uppercase tracking-widest">이전글</span>
                            <span className="flex-1 text-[14px] text-[#666] group-hover:text-[#333] truncate px-4 font-light">{prevNotice.title}</span>
                        </div>
                    )}
                    {nextNotice && (
                        <div
                            className="flex items-center py-5 px-2 hover:bg-[#fcfcfc] cursor-pointer group transition-all"
                            onClick={() => navigate(`/shop/notice/${nextNotice.id}`, { state: location.state })}
                        >
                            <span className="w-20 text-[11px] text-gray-400 uppercase tracking-widest">다음글</span>
                            <span className="flex-1 text-[14px] text-[#666] group-hover:text-[#333] truncate px-4 font-light">{nextNotice.title}</span>
                        </div>
                    )}
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