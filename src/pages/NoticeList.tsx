import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import contentService from '../api/contentService';
import { formatDate } from '../utils/dateFormat';

const NoticeList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [inputValue, setInputValue] = useState(location.state?.searchTerm || "");
    const [searchQuery, setSearchQuery] = useState(location.state?.searchTerm || "");
    const [currentPage, setCurrentPage] = useState(location.state?.fromPage || 1);

    const [notices, setNotices] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const postsPerPage = 5;

    const fetchNotices = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await contentService.getNotices(page, postsPerPage);
            const pageData = res.data;
            setNotices(pageData?.content || []);
            setTotalPages(pageData?.totalPages || 0);
            setTotalCount(pageData?.totalElements || 0);
            setCurrentPage(pageData?.number || 1);
        } catch (e) {
            console.error('공지사항 조회 실패:', e);
            setNotices([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotices(location.state?.fromPage || 1);
    }, [fetchNotices, location.state?.fromPage]);

    // 클라이언트 검색 필터링 (서버 페이징 위에 클라이언트 필터)
    const filtered = searchQuery
        ? notices.filter(n => n.subject.toLowerCase().includes(searchQuery.toLowerCase()))
        : notices;

    const handleSearch = (e: React.FormEvent) => {
        if (e) e.preventDefault();
        setSearchQuery(inputValue);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            fetchNotices(page);
        }
    };

    return (
        <div className="w-full bg-white pb-20">
            {/* 상단 헤더 섹션 */}
            <section className="bg-[#f8f5f2] py-16 md:py-24 px-6">
                <div className="max-w-[1000px] mx-auto text-center">
                    <h2 className="text-[28px] md:text-[36px] font-medium text-[#333] mb-4 uppercase tracking-widest">Notice</h2>

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
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
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
                        {filtered.length > 0 ? (
                            filtered.map((notice) => (
                                <li
                                    key={notice.id}
                                    onClick={() => navigate(`${notice.id}`, { state: { fromPage: currentPage, searchTerm: searchQuery } })}
                                    className="group cursor-pointer flex items-center py-6 px-2 transition-all hover:bg-[#fafafa]"
                                >
                                    <div className="hidden md:block w-20 text-center">
                                        <span className="text-[12px] text-[#968064] font-bold uppercase">{notice.typeDesc}</span>
                                    </div>
                                    <div className="flex-1 px-2 md:px-6 font-light">
                                        <h3 className="text-[15px] md:text-[16px] text-[#333] group-hover:underline line-clamp-1">
                                            {notice.subject}
                                        </h3>
                                    </div>
                                    <div className="text-[12px] md:text-[13px] text-gray-400 font-light italic">
                                        {formatDate(notice.createdAt)}
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="py-20 text-center text-gray-400 font-light text-sm">
                                {loading ? '불러오는 중...' : '등록된 공지사항이 없습니다.'}
                            </li>
                        )}
                    </ul>
                </div>

                {/* 페이징 UI */}
                {!loading && totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-4">
                        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="text-[12px] uppercase text-[#333] disabled:text-gray-200">PREV</button>
                        <div className="flex gap-4">
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`text-[14px] w-8 h-8 flex items-center justify-center ${currentPage === i + 1 ? 'bg-[#333] text-white rounded-full' : 'text-gray-400'}`}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="text-[12px] uppercase text-[#333] disabled:text-gray-200">NEXT</button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default NoticeList;
