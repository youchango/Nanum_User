import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, loading, updateQuantity, removeItem, removeItems, selectedIds, setSelectedIds } = useCart();

    const toggleSelect = (cartId) => {
        setSelectedIds(prev =>
            prev.includes(cartId) ? prev.filter(id => id !== cartId) : [...prev, cartId]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === cartItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(cartItems.map(item => item.cartId));
        }
    };

    const selectedItems = cartItems.filter(item => selectedIds.includes(item.cartId));
    const subtotal = selectedItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const shippingPrice = subtotal >= 50000 || subtotal === 0 ? 0 : 3000;
    const totalPrice = subtotal + shippingPrice;

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (window.confirm('선택한 상품을 삭제하시겠습니까?')) {
            await removeItems(selectedIds);
        }
    };

    const handleCheckout = () => {
        if (selectedIds.length === 0) return;
        navigate('/shop/checkout', {
            state: {
                orderItems: selectedItems.map(item => ({
                    cartId: item.cartId,
                    id: item.productId,
                    name: item.productName,
                    price: item.unitPrice,
                    image: item.thumbnailUrl,
                    quantity: item.quantity,
                    optionId: item.optionId,
                    optionName: item.optionName,
                }))
            }
        });
    };

    if (loading) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-20 min-h-screen font-sans text-[#333]">
                <h2 className="text-[24px] md:text-[28px] font-bold mb-10 pb-4 border-b uppercase tracking-tight text-[#333]">장바구니</h2>
                <div className="py-32 text-center text-gray-400">불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-32 md:pb-20 min-h-screen font-sans text-[#333]">
            <h2 className="text-[24px] md:text-[28px] font-bold mb-10 pb-4 border-b uppercase tracking-tight text-[#333]">장바구니</h2>

            {cartItems && cartItems.length > 0 ? (
                <>
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        {/* [왼쪽] 장바구니 리스트 */}
                        <div className="flex-grow">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                                        onChange={toggleAll}
                                        className="w-5 h-5 accent-[#333]"
                                    />
                                    <span className="text-[15px] font-bold">전체 선택 ({selectedIds.length}/{cartItems.length})</span>
                                </label>
                                <button
                                    onClick={handleDeleteSelected}
                                    className="text-[13px] text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    선택 삭제
                                </button>
                            </div>

                            <div className="flex flex-col divide-y divide-gray-100">
                                {cartItems.map((item) => (
                                    <div key={item.cartId} className="py-6 flex flex-col md:flex-row md:items-center gap-4 relative">
                                        <div className="flex gap-4 flex-grow">
                                            <div className="pt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item.cartId)}
                                                    onChange={() => toggleSelect(item.cartId)}
                                                    className="w-5 h-5 accent-[#333] cursor-pointer"
                                                />
                                            </div>
                                            <Link to={`/shop/product/${item.productId}`} className="w-20 h-24 md:w-24 md:h-28 bg-[#f9f9f9] border border-gray-100 overflow-hidden flex-shrink-0">
                                                <img src={item.thumbnailUrl || '/images/no-image.jpg'} alt={item.productName} className="w-full h-full object-cover" />
                                            </Link>
                                            <div className="flex flex-col justify-between flex-grow pr-8 md:pr-0">
                                                <div>
                                                    <Link to={`/shop/product/${item.productId}`} className="text-[15px] font-bold hover:text-[#968064] line-clamp-1 mb-1">
                                                        {item.productName}
                                                    </Link>
                                                    {item.optionName && (
                                                        <p className="text-[12px] text-gray-400 mb-0.5">{item.optionName}</p>
                                                    )}
                                                    <p className="text-[13px] text-gray-400 whitespace-nowrap">{item.unitPrice.toLocaleString()}원</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4 md:hidden">
                                                    <div className="flex items-center border border-gray-200 bg-white h-8">
                                                        <button onClick={() => updateQuantity(item.cartId, -1)} className="px-3 text-gray-400">-</button>
                                                        <span className="w-8 text-center text-[13px] font-bold">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.cartId, 1)} className="px-3 text-gray-400">+</button>
                                                    </div>
                                                    <span className="text-[15px] font-bold ml-auto whitespace-nowrap text-right">
                                                        {item.totalPrice.toLocaleString()}원
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden md:flex items-center gap-12">
                                            <div className="flex items-center border border-gray-200 bg-white h-10">
                                                <button onClick={() => updateQuantity(item.cartId, -1)} className="px-3 text-gray-400 hover:text-black">-</button>
                                                <span className="w-10 text-center text-[14px] font-bold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.cartId, 1)} className="px-3 text-gray-400 hover:text-black">+</button>
                                            </div>
                                            <div className="w-[120px] text-right font-bold text-[16px] whitespace-nowrap">
                                                {item.totalPrice.toLocaleString()}원
                                            </div>
                                        </div>
                                        <button onClick={() => removeItem(item.cartId)} className="absolute top-6 right-0 text-gray-300 hover:text-red-500 p-1">&#10005;</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* [오른쪽] 주문 요약 (PC 버전) */}
                        <div className="w-full lg:w-[380px] shrink-0">
                            <div className="bg-white border border-gray-100 p-6 md:p-8 sticky top-28 shadow-sm rounded-sm">
                                <h3 className="text-[18px] font-bold mb-8 pb-4 border-b uppercase">주문 요약</h3>
                                <div className="flex flex-col gap-5 mb-8 text-[14px] text-[#666]">
                                    <div className="flex justify-between items-center">
                                        <span>선택 상품수</span>
                                        <span>{selectedIds.length}개</span>
                                    </div>
                                    <div className="flex justify-between items-center text-black font-medium border-t pt-5">
                                        <span>결제 예정 금액</span>
                                        <span className="text-[22px] font-bold text-[#968064] whitespace-nowrap">{totalPrice.toLocaleString()}원</span>
                                    </div>
                                </div>
                                <button
                                    className="hidden lg:block w-full py-4 bg-[#333] text-white font-bold text-[16px] hover:bg-black transition-all disabled:bg-gray-300"
                                    disabled={selectedIds.length === 0}
                                    onClick={handleCheckout}
                                >
                                    {selectedIds.length}건 구매하기
                                </button>
                                <Link to="/shop/products" className="block w-full py-4 border border-gray-200 text-[#666] font-bold text-center text-[13px] hover:bg-gray-50 transition-all mt-3">
                                    쇼핑 계속하기
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 모바일 전용 하단 고정 결제 바 */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-4 pb-6 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex flex-col">
                                <span className="text-[12px] text-gray-400">선택 상품 {selectedIds.length}개</span>
                                <span className="text-[14px] text-[#333] font-medium">배송비 {shippingPrice > 0 ? `${shippingPrice.toLocaleString()}원` : '무료'}</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-[11px] text-gray-400">총 결제 금액</span>
                                <span className="text-[20px] font-black text-[#968064] whitespace-nowrap">{totalPrice.toLocaleString()}원</span>
                            </div>
                        </div>
                        <button
                            className="w-full py-4 bg-[#333] text-white font-bold text-[16px] active:scale-[0.98] transition-all disabled:bg-gray-200"
                            disabled={selectedIds.length === 0}
                            onClick={handleCheckout}
                        >
                            {selectedIds.length}건 구매하기
                        </button>
                    </div>
                </>
            ) : (
                <div className="py-32 md:py-40 text-center bg-[#fcfcfc] border border-dashed border-gray-200 rounded-sm">
                    <p className="text-gray-400 mb-10 font-medium text-[15px]">장바구니에 담긴 상품이 없습니다.</p>
                    <Link to="/shop/products" className="px-14 py-4 bg-[#333] text-white font-bold hover:bg-black transition-all inline-block rounded-sm">
                        상품 보러가기
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Cart;
