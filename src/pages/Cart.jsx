import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const navigate = useNavigate();
    // ⭐️ selectedIds, setSelectedIds를 컨텍스트에서 가져옴
    const { cartItems, updateQuantity, removeItem, selectedIds, setSelectedIds } = useCart();

    // [로직] 개별 체크박스 토글
    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
        );
    };

    // [로직] 전체 선택/해제 토글
    const toggleAll = () => {
        if (selectedIds.length === cartItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(cartItems.map(item => item.id));
        }
    };

    const selectedItems = cartItems.filter(item => selectedIds.includes(item.id));

    // [계산] 선택된 상품들의 총 합계 (순수 상품 금액)
    const subtotal = selectedItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

    // ⭐️ [계산] 배송비 정책 (결제 페이지와 동일하게 적용)
    // 선택된 상품이 없으면 0원, 5만원 이상이면 0원, 그 외에는 3000원
    const shippingPrice = subtotal >= 50000 || subtotal === 0 ? 0 : 3000;

    // [계산] 최종 합계 (상품금액 + 배송비)
    const totalPrice = subtotal + shippingPrice;


    return (
        <div className="max-w-[1200px] mx-auto px-6 py-20 min-h-screen">
            <h2 className="text-[28px] font-bold text-[#333] mb-10 pb-4 border-b">SHOPPING CART</h2>

            {cartItems && cartItems.length > 0 ? (
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-grow">
                        <table className="w-full text-left">
                            <thead className="text-[12px] text-gray-400 border-b uppercase tracking-wider">
                            <tr>
                                <th className="pb-4 w-10">
                                    {/* ⭐️ 전체 선택 체크박스 */}
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                                        onChange={toggleAll}
                                        className="w-4 h-4 accent-[#333] cursor-pointer"
                                    />
                                </th>
                                <th className="pb-4 font-medium">상품 정보</th>
                                <th className="pb-4 font-medium text-center">수량</th>
                                <th className="pb-4 font-medium text-right">금액</th>
                                <th className="pb-4"></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {cartItems.map((item) => (
                                <tr key={item.id} className="group">
                                    <td className="py-6">
                                        {/* ⭐️ 개별 선택 체크박스 */}
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => toggleSelect(item.id)}
                                            className="w-4 h-4 accent-[#333] cursor-pointer"
                                        />
                                    </td>
                                    <td className="py-6 flex items-center gap-4">
                                        <Link to={`/shop/product/${item.id}`} className="w-20 h-24 bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity">
                                            <img src={item.image || item.img || '/images/no-image.jpg'} alt={item.name} className="w-full h-full object-cover" />
                                        </Link>
                                        <div>
                                            <Link to={`/shop/product/${item.id}`} className="text-[15px] font-medium text-[#333] hover:text-[#968064] transition-colors line-clamp-1">
                                                {item.name}
                                            </Link>
                                            <p className="text-[13px] text-gray-400 mt-1">{Number(item.price).toLocaleString()}원</p>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex items-center justify-center gap-3 border w-24 mx-auto py-1 bg-white">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="px-2 text-gray-400 hover:text-black">-</button>
                                            <span className="text-[14px] font-bold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="px-2 text-gray-400 hover:text-black">+</button>
                                        </div>
                                    </td>
                                    <td className="py-6 text-right font-medium text-[15px]">
                                        {(Number(item.price) * item.quantity).toLocaleString()}원
                                    </td>
                                    <td className="py-6 text-right">
                                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">✕</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="w-full lg:w-[350px] bg-[#f9f9f9] p-8 h-fit sticky top-24 border border-gray-100">
                        <h3 className="text-[18px] font-bold mb-6">주문 요약</h3>
                        <div className="flex justify-between mb-4 text-[14px] text-[#666]">
                            <span>선택 상품수</span>
                            <span>{selectedIds.length}개</span>
                        </div>
                        <div className="flex justify-between mb-4 text-[14px] text-[#666]">
                            <span>상품 합계</span>
                            <span>{totalPrice.toLocaleString()}원</span>
                        </div>
                        {/* ⭐️ 배송비 동적 표시 */}
                        <div className="flex justify-between mb-6 text-[14px] text-[#666]">
                            <span>배송비</span>
                            <span>
                                {shippingPrice > 0 ? `+ ${shippingPrice.toLocaleString()}원` : '무료'}
                            </span>
                        </div>
                        {/* 5만원 미만일 때 안내 문구 추가 (옵션 - UX 개선) */}
                        {shippingPrice > 0 && (
                            <p className="text-[11px] text-[#968064] mb-4 -mt-4">
                                {(50000 - subtotal).toLocaleString()}원 추가 구매 시 <strong>무료배송</strong>
                            </p>
                        )}
                        <div className="border-t pt-6 flex justify-between items-end mb-10">
                            <span className="font-bold">총 합계</span>
                            <span className="text-[22px] font-bold text-[#968064]">{totalPrice.toLocaleString()}원</span>
                        </div>

                        <button
                            className="w-full py-4 bg-[#333] text-white font-bold hover:bg-black transition-all mb-3 active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed"
                            disabled={selectedIds.length === 0} // 선택된 게 없으면 비활성화
                            onClick={() => {
                                if(!localStorage.getItem('user')) {
                                    alert('로그인이 필요한 서비스입니다.');
                                    navigate('/shop/login');
                                } else {
                                    // ⭐️ 선택된 상품 데이터만 들고 이동
                                    navigate('/shop/checkout', {
                                        state: { orderItems: selectedItems }
                                    });
                                }
                            }}
                        >
                            {selectedIds.length}건 구매하기
                        </button>

                        <Link to="/shop/products" className="block w-full py-4 border border-gray-200 text-[#666] font-medium hover:bg-white transition-all text-center text-[14px]">
                            쇼핑 계속하기
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="py-40 text-center bg-[#fcfcfc] border border-dashed border-gray-200">
                    <p className="text-gray-400 mb-8 font-medium">장바구니에 담긴 상품이 없습니다.</p>
                    <Link to="/shop/products" className="px-12 py-4 bg-[#333] text-white font-bold hover:bg-black transition-all inline-block">
                        상품 보러가기
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Cart;