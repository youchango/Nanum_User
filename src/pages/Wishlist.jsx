import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // 1. 초기 가짜 데이터 (찜한 상품 목록)
    const [wishlistItems, setWishlistItems] = useState([
        { id: 1, name: "Nanum 쌀 (백미)", price: 36000, img: "/images/product1.jpg", category: "쌀" },
        { id: 3, name: "내추럴 린넨 에이프런", price: 28800, img: "/images/product3.jpg", category: "의류" },
        { id: 5, name: "오가닉 코튼 수건 세트", price: 23200, img: "/images/product5.jpg", category: "욕실" },
    ]);

    // 찜 삭제 로직
    const handleRemove = (id) => {
        if (window.confirm('위시리스트에서 삭제하시겠습니까?')) {
            setWishlistItems(prev => prev.filter(item => item.id !== id));
        }
    };

    // 장바구니 담기 후 이동 확인
    const handleMoveToCart = (item) => {
        addToCart(item, 1);
    };

    const handleRemoveAll = () => {
        if (wishlistItems.length === 0) return; // 이미 비어있으면 실행 안 함

        if (window.confirm('위시리스트의 모든 상품을 삭제하시겠습니까?')) {
            setWishlistItems([]);
            // 선택 사항: 삭제 완료 후 알림
            // alert('위시리스트가 모두 비워졌습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-white py-20 px-6 font-sans text-[#333]">
            <div className="max-w-[1100px] mx-auto">

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
                            <div key={item.id} className="flex flex-col md:flex-row items-center py-8 border-b border-gray-50 px-4 group">

                                {/* 상품 정보 (이미지 + 이름) */}
                                <div className="flex-[2] flex items-center gap-6 w-full">
                                    <div className="w-24 h-32 bg-[#f9f9f9] overflow-hidden shrink-0">
                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-[#968064] font-bold uppercase">{item.category}</span>
                                        <Link to={`/shop/product/${item.id}`} className="text-[16px] font-medium hover:underline">{item.name}</Link>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="text-[12px] text-gray-300 hover:text-red-400 underline underline-offset-4 mt-2 w-fit"
                                        >
                                            삭제하기
                                        </button>
                                    </div>
                                </div>

                                {/* 가격 (Mobile 에서는 숨기거나 조정 가능) */}
                                <div className="flex-1 text-center my-4 md:my-0">
                                    <span className="text-[17px] font-bold">{item.price.toLocaleString()}원</span>
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
                                onClick={handleRemoveAll} // 수정된 함수 연결
                                className="text-[13px] text-gray-300 hover:text-red-400 transition-colors"
                            >
                                전체 삭제
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;