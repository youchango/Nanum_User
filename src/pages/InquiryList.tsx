import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import inquiryService from '../api/inquiryService';
import { formatDate } from '../utils/dateFormat';
import MyPageLayout from '../components/MyPageLayout';

const STATUS_STYLE: Record<string, string> = {
    WAIT: 'bg-gray-100 text-gray-500',
    PROCESS: 'bg-blue-50 text-blue-500',
    COMPLETE: 'bg-green-50 text-green-600',
};

const InquiryList = () => {
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchInquiries = async (page = 1) => {
        setLoading(true);
        try {
            const res = await inquiryService.getInquiries(page, 10);
            const pageData = res.data;
            setInquiries(pageData?.content || []);
            setTotalPages(pageData?.totalPages || 0);
            setCurrentPage(pageData?.number || 1);
        } catch (err) {
            console.error('문의 목록 조회 실패:', err);
            setInquiries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries(1);
    }, []);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            fetchInquiries(page);
        }
    };

    if (loading && inquiries.length === 0) {
        return (
            <MyPageLayout>
                <div className="py-40 text-center text-gray-400 uppercase tracking-widest text-sm">
                    Loading Inquiries...
                </div>
            </MyPageLayout>
        );
    }

    return (
        <MyPageLayout>
                <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight mb-2 uppercase tracking-widest text-[#343434]">My Inquiries</h2>
                        <p className="text-gray-400 text-[12px] md:text-[13px] font-light italic">1:1 문의 내역을 확인하세요.</p>
                    </div>
                    <button
                        onClick={() => navigate('/shop/mypage/inquiry/new')}
                        className="w-fit px-6 py-3 bg-[#333] text-white text-[12px] font-bold hover:bg-black transition-all active:scale-95 uppercase tracking-widest"
                    >
                        문의하기
                    </button>
                </header>

                {inquiries.length > 0 ? (
                    <div className="flex flex-col gap-4 md:gap-5">
                        {inquiries.map((inquiry) => (
                            <div
                                key={inquiry.id}
                                onClick={() => navigate(`/shop/mypage/inquiry/${inquiry.id}`)}
                                className="bg-white border border-gray-100 shadow-sm p-5 md:p-6 cursor-pointer hover:border-gray-200 transition-all rounded-sm group"
                            >
                                <div className="flex items-start md:items-center justify-between gap-3">
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
                                                {inquiry.typeDesc}
                                            </span>
                                            <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[inquiry.status] || 'bg-gray-100 text-gray-500'}`}>
                                                {inquiry.statusDesc}
                                            </span>
                                        </div>
                                        <h3 className="text-[14px] md:text-[15px] font-bold truncate group-hover:text-[#968064] transition-colors">
                                            {inquiry.title}
                                        </h3>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[11px] md:text-[12px] text-gray-400 font-light">{formatDate(inquiry.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 md:py-40 text-center border-t border-b border-dashed border-gray-200 bg-white text-gray-300 italic text-[13px]">
                        문의 내역이 없습니다.
                    </div>
                )}

                {/* 페이징 UI */}
                {totalPages > 1 && (
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
        </MyPageLayout>
    );
};

export default InquiryList;
