import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState(0);
    const [product, setProduct] = useState(null);

    // 1. 고정 데이터 (ProductList와 데이터 정합성 유지)
    const products = [
        { id: 1, name: "Nanum 쌀 (백미)", price: 36000, originalPrice: 45000, category: "쌀", img: "/images/product1.jpg" },
        { id: 2, name: "따뜻한 베이지 머그", price: 18000, originalPrice: null, category: "키친", img: "/images/product2.jpg" },
        { id: 3, name: "내추럴 린넨 에이프런", price: 28800, originalPrice: 32000, category: "의류", img: "/images/product3.jpg" },
        { id: 4, name: "유기농 흑미 1kg", price: 24000, originalPrice: null, category: "쌀", img: "/images/product4.jpg" },
        { id: 5, name: "오가닉 코튼 수건 세트", price: 23200, originalPrice: 29000, category: "욕실", img: "/images/product5.jpg" },
        { id: 6, name: "세라믹 화분 (S)", price: 15000, originalPrice: null, category: "리빙", img: "/images/product6.jpg" },
        { id: 7, name: "빈티지 우드 트레이", price: 19800, originalPrice: 22000, category: "키친", img: "/images/product7.jpg" },
        { id: 8, name: "핸드드립 세트", price: 52200, originalPrice: 58000, category: "키친", img: "/images/product8.jpg" },
        { id: 11, name: "순면 발매트", price: 9600, originalPrice: 12000, category: "욕실", img: "/images/product11.jpg" },
    ];

    useEffect(() => {
        const foundProduct = products.find(p => String(p.id) === String(id));
        if (foundProduct) {
            setProduct(foundProduct);
            window.scrollTo(0, 0); // 페이지 진입 시 최상단으로 스크롤
        }
    }, [id]);

    // 할인율 계산
    const discountRate = product?.originalPrice
        ? Math.floor(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : null;

    const handleQuantity = (type) => {
        if (type === 'plus') setQuantity(quantity + 1);
        else if (type === 'minus' && quantity > 1) setQuantity(quantity - 1);
    };

    const handleDirectOrder = () => {
        const user = localStorage.getItem('user');

        // ⭐️ 데이터 규격 정의
        const orderData = {
            isDirect: true,
            orderItems: [{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.img,
                quantity: quantity
            }]
        };

        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            // ⭐️ 로그인 페이지로 보낼 때, 로그인 후 돌아올 '목적지'와 '상품 데이터'를 함께 보냅니다.
            navigate('/shop/login', {
                state: {
                    from: '/shop/checkout',
                    directOrderData: orderData // 상품 정보 전달
                }
            });
            return;
        }

        // 로그인 되어 있으면 바로 체크아웃으로 이동
        navigate('/shop/checkout', { state: orderData });
    };

    const tabs = ['상세정보', '구매후기(0)', 'Q&A(0)', '배송/교환안내'];

    if (!product) return <div className="py-40 text-center text-gray-400 font-light">상품 정보를 불러오는 중...</div>;

    return (
        <div className="w-full bg-white pb-24 md:pb-20 font-sans">
            <div className="max-w-[1290px] mx-auto px-6 py-10 md:py-20">
                <div className="flex flex-col md:flex-row gap-12 lg:gap-20">

                    {/* [좌측] 이미지 영역 */}
                    <div className="flex-1">
                        <div className="relative aspect-square bg-[#f9f9f9] overflow-hidden flex items-center justify-center border border-gray-50 group">
                            {/* 할인 뱃지 */}
                            {discountRate && (
                                <div className="absolute top-0 left-0 bg-[#E23600] text-white text-[14px] font-bold px-5 py-2.5 z-10">
                                    {discountRate}% OFF
                                </div>
                            )}
                            {product.img ? (
                                <img
                                    src={product.img}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="text-gray-300 text-lg uppercase tracking-widest font-bold px-4 text-center">
                                    {product.name} IMAGE
                                </div>
                            )}
                        </div>
                    </div>

                    {/* [우측] 상품 정보 영역 */}
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="border-b border-gray-100 pb-8">
                            <span className="text-[#968064] text-[13px] font-bold tracking-[0.2em] uppercase mb-3 block">
                                {product.category} Collection
                            </span>
                            <h2 className="text-[28px] md:text-[36px] font-medium text-[#333] mb-4 tracking-tight leading-tight">
                                {product.name}
                            </h2>

                            {/* 가격 표기 */}
                            <div className="flex items-center gap-4">
                                {discountRate && (
                                    <span className="text-[26px] md:text-[32px] font-bold text-[#E23600]">
                                        {discountRate}%
                                    </span>
                                )}
                                <span className="text-[26px] md:text-[32px] font-bold text-[#333]">
                                    {product.price.toLocaleString()}원
                                </span>
                                {product.originalPrice && (
                                    <span className="text-[16px] md:text-[18px] text-gray-400 line-through font-light mt-1.5">
                                        {product.originalPrice.toLocaleString()}원
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 수량 선택 및 총 금액 계산기 */}
                        <div className="bg-[#fcfcfc] p-7 flex flex-col gap-5 border border-gray-50 rounded-sm">
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="text-[#555]">구매 수량</span>
                                <div className="flex items-center border border-gray-200 bg-white shadow-sm overflow-hidden rounded-sm">
                                    <button
                                        onClick={() => handleQuantity('minus')}
                                        className="px-4 py-2 hover:bg-gray-100 transition-colors border-r border-gray-200 text-lg"
                                    >-</button>
                                    <input
                                        type="text"
                                        value={quantity}
                                        readOnly
                                        className="w-12 text-center outline-none text-[15px] font-bold text-[#333]"
                                    />
                                    <button
                                        onClick={() => handleQuantity('plus')}
                                        className="px-4 py-2 hover:bg-gray-100 transition-colors border-l border-gray-200 text-lg"
                                    >+</button>
                                </div>
                            </div>
                            <div className="flex justify-between items-end pt-5 border-t border-gray-100">
                                <span className="text-[14px] font-bold text-gray-400 uppercase tracking-wider">총 상품금액</span>
                                <span className="text-[28px] font-black text-[#333]">
                                    {(product.price * quantity).toLocaleString()}원
                                </span>
                            </div>
                        </div>

                        {/* 구매 액션 버튼 (모바일 Sticky 대응) */}
                        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 flex gap-2 z-[100] md:relative md:bg-transparent md:border-none md:p-0 md:mt-4 md:z-auto">
                            <button className="group w-14 h-14 border border-gray-200 flex items-center justify-center hover:border-red-400 bg-white transition-all shrink-0 rounded-sm active:scale-95">
                                <span className="text-2xl text-gray-300 group-hover:text-red-500 transition-colors">♥</span>
                            </button>

                            <button
                                onClick={() => addToCart(product, quantity)}
                                className="flex-1 h-14 border border-[#343434] text-[#343434] font-medium text-[14px] md:text-[15px] hover:bg-gray-50 transition-all bg-white rounded-sm active:bg-gray-100"
                            >
                                장바구니
                            </button>

                            <button
                                onClick={handleDirectOrder}
                                className="flex-[2.5] h-14 bg-[#343434] text-white font-bold text-[14px] md:text-[15px] hover:bg-black active:scale-[0.97] transition-all shadow-md rounded-sm"
                            >
                                바로 구매하기
                            </button>
                        </div>
                    </div>
                </div>

                {/* 하단 상세 탭 영역 */}
                <div className="mt-28 border-t border-gray-100">
                    <div className="flex justify-center gap-6 md:gap-16 relative">
                        {tabs.map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`relative py-10 text-[14px] md:text-[16px] transition-all duration-300 tracking-tight ${
                                    activeTab === idx ? 'text-[#333] font-bold' : 'text-gray-300 hover:text-gray-500'
                                }`}
                            >
                                {tab}
                                {activeTab === idx && (
                                    <span className="absolute top-0 left-0 w-full h-[3px] bg-[#333] transition-all" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* 탭 콘텐츠 영역 */}
                    <div className="py-40 flex flex-col items-center justify-center bg-[#fcfcfc] border border-dashed border-gray-200 rounded-sm">
                        <div className="w-12 h-12 border-2 border-gray-100 rounded-full mb-6 flex items-center justify-center text-gray-200">
                            !
                        </div>
                        <p className="text-gray-400 font-light tracking-[0.2em] uppercase text-sm">
                            Preparing Content for {tabs[activeTab]}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;