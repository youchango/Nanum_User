import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NoticeList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. 상태 관리
    const [inputValue, setInputValue] = useState(location.state?.searchTerm || ""); // 입력창 전용
    const [searchQuery, setSearchQuery] = useState(location.state?.searchTerm || ""); // 실제 API 요청용
    const [currentPage, setCurrentPage] = useState(location.state?.fromPage || 1);

    const [notices, setNotices] = useState([]); // 서버에서 받은 데이터 저장
    const [totalCount, setTotalCount] = useState(0); // 전체 게시글 수 (서버에서 받아옴)
    const [loading, setLoading] = useState(false);

    const postsPerPage = 5;

    // 2. 서버 데이터 페칭 함수 (API 호출 시뮬레이션)
    const fetchNoticesFromServer = useCallback(async () => {
        setLoading(true);

        // 실제 환경에서는 axios.get(`/api/notices?page=${currentPage}&search=${searchQuery}`)
        console.log(`서버 요청: 페이지 ${currentPage}, 검색어 "${searchQuery}"`);

        // API 응답 시뮬레이션
        setTimeout(() => {
            // 가짜 전체 데이터
            const mockAllData = [
                { id: 1, title: "[필독] 이용 약관 변경", date: "2026.02.01", category: "안내", isPinned: true },
                { id: 2, title: "[공지] 설 연휴 배송 안내", date: "2026.01.20", category: "배송", isPinned: true },
                { id: 3, title: "멤버십 혜택 안내", date: "2026.01.15", category: "이벤트", isPinned: false },
                { id: 4, title: "시스템 점검 안내", date: "2026.01.10", category: "안내", isPinned: false },
                { id: 5, title: "개인정보 처리방침", date: "2026.01.05", category: "안내", isPinned: false },
                { id: 6, title: "시즌 오프 세일", date: "2025.12.28", category: "이벤트", isPinned: false },
                { id: 7, title: "시즌 오프 세일", date: "2025.12.28", category: "이벤트", isPinned: false },
                { id: 8, title: "시즌 오프 세일", date: "2025.12.28", category: "이벤트", isPinned: false },
            ];

            // 서버 측 필터링 시뮬레이션
            const filtered = mockAllData.filter(n => n.title.includes(searchQuery));
            const pinned = filtered.filter(n => n.isPinned);
            const regular = filtered.filter(n => !n.isPinned);

            // 페이징 처리 시뮬레이션
            const slicedRegular = regular.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

            setNotices([...pinned, ...slicedRegular]);
            setTotalCount(filtered.length);
            setLoading(false);
        }, 300);
    }, [currentPage, searchQuery]);

    // 3. 페이지나 검색 쿼리가 변경될 때마다 데이터 재요청
    useEffect(() => {
        fetchNoticesFromServer();
    }, [fetchNoticesFromServer]);

    // 4. 검색 실행 함수 (엔터 또는 클릭 시)
    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setSearchQuery(inputValue); // 실제 쿼리 상태를 업데이트하여 useEffect 실행 유도
        setCurrentPage(1); // 검색 시 1페이지로 리셋
    };

    const totalPages = Math.ceil((totalCount - notices.filter(n => n.isPinned).length) / postsPerPage) || 1;

    return (
        <div className="w-full bg-white pb-20">
            {/* 상단 헤더 섹션 */}
            <section className="bg-[#f8f5f2] py-16 md:py-24 px-6">
                <div className="max-w-[1000px] mx-auto text-center">
                    <h2 className="text-[28px] md:text-[36px] font-medium text-[#333] mb-4 uppercase tracking-widest">Notice</h2>

                    {/* ⭐️ Form 태그를 사용하여 엔터키 지원 */}
                    <form onSubmit={handleSearch} className="mt-8 flex justify-center">
                        <div className="flex border-b border-[#333] bg-transparent max-w-[500px] w-full items-center">
                            <input
                                type="text"
                                placeholder="검색어를 입력하고 엔터를 누르세요"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="flex-1 px-2 py-3 text-[15px] outline-none bg-transparent placeholder:text-gray-400 font-light"
                            />
                            <button type="submit" className="px-4 py-2 text-gray-400 hover:text-[#333] transition-colors">
                                🔍
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* 목록 영역 */}
            <section className="max-w-[1000px] mx-auto px-6 py-12 md:py-20">
                <div className="flex justify-between items-center mb-6 text-[13px] text-gray-400">
                    <p>Total <span className="text-[#333] font-bold">{totalCount}</span></p>
                </div>

                <div className={`border-t-2 border-[#333] transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                    <ul className="divide-y divide-gray-100">
                        {notices.length > 0 ? (
                            notices.map((notice) => (
                                <li
                                    key={notice.id}
                                    onClick={() => navigate(`${notice.id}`, { state: { fromPage: currentPage, searchTerm: searchQuery } })}
                                    className={`group cursor-pointer flex items-center py-6 px-2 transition-all ${notice.isPinned ? 'bg-[#fcfaf8] border-l-2 border-[#968064]' : 'hover:bg-[#fafafa]'}`}
                                >
                                    <div className="hidden md:block w-20 text-center">
                                        {notice.isPinned ? (
                                            <span className="text-[10px] bg-[#333] text-white px-2 py-1 font-bold rounded-sm">NOTICE</span>
                                        ) : (
                                            <span className="text-[12px] text-[#968064] font-bold uppercase">{notice.category}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 px-2 md:px-6 font-light">
                                        <h3 className={`text-[15px] md:text-[16px] text-[#333] group-hover:underline line-clamp-1 ${notice.isPinned ? 'font-bold' : ''}`}>
                                            {notice.title}
                                        </h3>
                                    </div>
                                    <div className="text-[12px] md:text-[13px] text-gray-400 font-light italic">
                                        {notice.date}
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="py-20 text-center text-gray-400 font-light text-sm">등록된 공지사항이 없습니다.</li>
                        )}
                    </ul>
                </div>

                {/* 페이징 UI */}
                {!loading && totalCount > postsPerPage && (
                    <div className="mt-12 flex justify-center items-center gap-4">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="text-[12px] uppercase text-[#333] disabled:text-gray-200">PREV</button>
                        <div className="flex gap-4">
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`text-[14px] w-8 h-8 flex items-center justify-center ${currentPage === i + 1 ? 'bg-[#333] text-white rounded-full' : 'text-gray-400'}`}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="text-[12px] uppercase text-[#333] disabled:text-gray-200">NEXT</button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default NoticeList;