import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import wishlistService from '../api/wishlistService';
import MyPageLayout from '../components/MyPageLayout';

const Wishlist = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const PAGE_SIZE = 10;

    const fetchWishlist = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            const res = await wishlistService.getWishlist(page, PAGE_SIZE);
            const data = res.data?.data;
            setWishlistItems(data?.content || []);
            setTotalPages(data?.totalPages || 0);
            setCurrentPage(data?.number || 0);
        } catch (err) {
            console.error('위시리스트 조회 실패:', err);
            setWishlistItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlist(0);
    }, [fetchWishlist]);

    const handleRemove = async (productId) => {
        if (window.confirm('위시리스트에서 삭제하시겠습니까?')) {
            try {
                await wishlistService.deleteWishlist(productId);
                await fetchWishlist(currentPage);
            } catch (err) {
                console.error('위시리스트 삭제 실패:', err);
            }
        }
    };

    const handleMoveToCart = (item) => {
        addToCart({
            id: item.productId,
            name: item.productName,
            price: item.unitPrice,
            image: item.thumbnailUrl,
        }, 1);
    };

    const handleRemoveAll = async () => {
        if (wishlistItems.length === 0) return;

        if (window.confirm('위시리스트의 모든 상품을 삭제하시겠습니까?')) {
            try {
                await Promise.all(
                    wishlistItems.map(item => wishlistService.deleteWishlist(item.productId))
                );
                await fetchWishlist(0);
            } catch (err) {
                console.error('위시리스트 전체 삭제 실패:', err);
            }
        }
    };

    if (loading) {
        return (
            <MyPageLayout>
                    <header className="text-center mb-16">
                        <h2 className="text-[32px] font-bold tracking-tight mb-2 uppercase">Wishlist</h2>
                        <p className="text-gray-400 text-sm font-light">관심 있는 상품을 보관하고 나중에 구매하세요.</p>
                    </header>
                    <div className="py-32 text-center text-gray-400">불러오는 중...</div>
            </MyPageLayout>
        );
    }

    return (
        <MyPageLayout>
                <header className="text-center mb-16">
                    <h2 className="text-[32px] font-bold tracking-tight mb-2 uppercase">Wishlist</h2>
                    <p className="text-gray-400 text-sm font-light">관심 있는 상품을 보관하고 나중에 구매하세요.</p>
                </header>

                {wishlistItems.length > 0 ? (
                    <div className="border-t border-gray-100">
                        {/* PC 헤더 (Hidden on Mobile) */}
                        <div className="hidden md:flex py-6 border-b border-gray-50 text-[12px] font-bold text-gray-400 uppercase tracking-widest px-4">
                            <div className="flex-[2]">Product Details</div>
                            <div className="flex-1 text-center">Price</div>
                            <div className="flex-1 text-center">Action</div>
                        </div>

                        {/* 상품 리스트 */}
                        {wishlistItems.map((item) => (
                            <div key={item.wishlistId} className="flex flex-col md:flex-row items-center py-8 border-b border-gray-50 px-4 group">

                                {/* 상품 정보 (이미지 + 이름) */}
                                <div className="flex-[2] flex items-center gap-6 w-full">
                                    <div className="w-24 h-32 bg-[#f9f9f9] overflow-hidden shrink-0">
                                        <img src={item.thumbnailUrl || '/images/no-image.jpg'} alt={item.productName} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Link to={`/shop/product/${item.productId}`} className="text-[16px] font-medium hover:underline">{item.productName}</Link>
                                        <button
                                            onClick={() => handleRemove(item.productId)}
                                            className="text-[12px] text-gray-300 hover:text-red-400 underline underline-offset-4 mt-2 w-fit"
                                        >
                                            삭제하기
                                        </button>
                                    </div>
                                </div>

                                {/* 가격 */}
                                <div className="flex-1 text-center my-4 md:my-0">
                                    <span className="text-[17px] font-bold">{item.unitPrice.toLocaleString()}원</span>
                                </div>

                                {/* 액션 버튼 */}
                                <div className="flex-1 flex justify-center w-full">
                                    <button
                                        onClick={() => handleMoveToCart(item)}
                                        className="w-full md:w-auto px-10 py-3.5 bg-[#333] text-white text-[13px] font-bold hover:bg-black transition-all active:scale-95 shadow-sm"
                                    >
                                        장바구니 담기
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-10">
                                <button
                                    onClick={() => fetchWishlist(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="px-3 py-2 text-[13px] text-gray-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    ← 이전
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => fetchWishlist(i)}
                                        className={`w-9 h-9 text-[13px] font-bold transition-colors ${
                                            i === currentPage
                                                ? 'bg-[#333] text-white'
                                                : 'text-gray-400 hover:text-black hover:bg-gray-100'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => fetchWishlist(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-3 py-2 text-[13px] text-gray-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    다음 →
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 빈 상태 UI */
                    <div className="py-40 text-center border-t border-b border-dashed border-gray-200">
                        <p className="text-gray-300 font-light mb-8">위시리스트가 비어 있습니다.</p>
                        <Link to="/shop/products" className="px-10 py-4 border border-[#333] text-[13px] font-bold hover:bg-[#333] hover:text-white transition-all">
                            쇼핑하러 가기
                        </Link>
                    </div>
                )}

                {/* 하단 안내 */}
                <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <button
                        onClick={() => navigate('/shop/products')}
                        className="text-[13px] text-gray-400 hover:text-black transition-colors"
                    >
                        ← 계속 쇼핑하기
                    </button>
                    {wishlistItems.length > 0 && (
                        <div className="flex gap-4">
                            <button
                                onClick={handleRemoveAll}
                                className="text-[13px] text-gray-300 hover:text-red-400 transition-colors"
                            >
                                전체 삭제
                            </button>
                        </div>
                    )}
                </div>
        </MyPageLayout>
    );
};

export default Wishlist;
