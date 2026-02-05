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

    // 임시 상품 데이터 (나중에 API로 받아올 데이터 구조)
    const products = [
        { id: 1, name: "Nanum 쌀", price: 45000, category: "쌀", img: "/images/product1.jpg" },
        { id: 2, name: "따뜻한 베이지 머그", price: 18000, category: "키친", img: "/images/product2.jpg" },
        { id: 3, name: "내추럴 린넨 에이프런", price: 32000, category: "의류", img: "/images/product3.jpg" },
        { id: 4, name: "핸드메이드 인센스 홀더", price: 24000, category: "쌀", img: "/images/product4.jpg" },
        { id: 5, name: "오가닉 코튼 수건 세트", price: 29000, category: "욕실", img: "/images/product5.jpg" },
        { id: 6, name: "세라믹 화분 (S)", price: 15000, category: "가드닝", img: "/images/product6.jpg" },
    ];

    useEffect(() => {
        const foundProduct = products.find(p => p.id === parseInt(id));
        if (foundProduct) {
            setProduct(foundProduct);
        }
    }, [id]);

    const handleQuantity = (type) => {
        if (type === 'plus') setQuantity(quantity + 1);
        else if (type === 'minus' && quantity > 1) setQuantity(quantity - 1);
    };

    // ⭐️ 바로 구매 로직 추가
    const handleDirectOrder = () => {
        const user = localStorage.getItem('user');
        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/shop/login');
            return;
        }

        // 장바구니 Context는 건드리지 않고, state에 상품 정보를 실어 보냄
        navigate('/shop/checkout', {
            state: {
                isDirect: true,
                orderItems: [{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.img,
                    quantity: quantity
                }]
            }
        });
    };

    const tabs = ['상세정보', '구매후기(0)', 'Q&A(0)', '배송/교환안내'];

    if (!product) return <div className="py-40 text-center text-gray-400">상품 정보를 불러오는 중...</div>;

    return (
        <div className="w-full bg-white pb-24 md:pb-20">
            <div className="max-w-[1290px] mx-auto px-6 py-10 md:py-20">
                <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
                    {/* 이미지 영역 생략 (기존과 동일) */}
                    <div className="flex-1">
                        <div className="group aspect-[1/1] bg-[#f9f9f9] overflow-hidden relative cursor-zoom-in flex items-center justify-center">
                            <div className="text-gray-300 text-lg uppercase tracking-widest font-bold text-center px-4">
                                {product.name} IMAGE
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-6">
                        <div className="border-b border-gray-100 pb-6">
                            <span className="text-[#968064] text-sm font-bold tracking-widest uppercase mb-2 block">{product.category} Collection</span>
                            <h2 className="text-[28px] md:text-[34px] font-medium text-[#333] mb-4">{product.name}</h2>
                            <p className="text-[24px] font-bold text-[#343434]">{product.price.toLocaleString()}원</p>
                        </div>

                        <div className="bg-[#fcfcfc] p-6 flex flex-col gap-4 border border-gray-50">
                            <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-[#333]">구매 수량</span>
                                <div className="flex items-center border border-gray-200 bg-white shadow-sm">
                                    <button onClick={() => handleQuantity('minus')} className="px-4 py-2 hover:bg-gray-100 transition-colors border-r border-gray-200">-</button>
                                    <input type="text" value={quantity} readOnly className="w-12 text-center outline-none text-[14px] font-bold" />
                                    <button onClick={() => handleQuantity('plus')} className="px-4 py-2 hover:bg-gray-100 transition-colors border-l border-gray-200">+</button>
                                </div>
                            </div>
                            <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                                <span className="text-sm font-bold text-gray-400">총 상품금액</span>
                                <span className="text-2xl font-extrabold text-[#E23600]">{(product.price * quantity).toLocaleString()}원</span>
                            </div>
                        </div>

                        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 flex gap-2 z-[100] md:relative md:bg-transparent md:border-none md:p-0 md:mt-4 md:z-auto">

                            {/* 찜하기 버튼: 모바일에서도 작게 유지 */}
                            <button className="group w-12 h-12 md:w-14 md:h-14 border border-gray-200 flex items-center justify-center hover:border-red-400 bg-white transition-colors shrink-0">
                                <span className="text-xl text-gray-400 group-hover:text-red-500">♥</span>
                            </button>

                            {/* 장바구니 버튼 */}
                            <button
                                onClick={() => addToCart(product, quantity)}
                                className="flex-1 h-12 md:h-14 border border-[#343434] text-[#343434] font-medium text-[13px] md:text-[15px] hover:bg-gray-50 transition-all bg-white"
                            >
                                장바구니
                            </button>

                            {/* 바로 구매하기 버튼 */}
                            <button
                                onClick={handleDirectOrder}
                                className="flex-[2] h-12 md:h-14 bg-[#343434] text-white font-bold text-[13px] md:text-[15px] hover:bg-black active:scale-[0.95] transition-all shadow-lg"
                            >
                                바로 구매하기
                            </button>
                        </div>
                    </div>
                </div>

                {/* 하단 탭 영역 */}
                <div className="mt-24 border-t border-gray-100">
                    <div className="flex justify-center gap-4 md:gap-12 relative">
                        {tabs.map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`relative py-8 text-[14px] md:text-[16px] transition-all duration-300 ${activeTab === idx ? 'text-[#343434] font-bold' : 'text-[#bbb] hover:text-[#888]'}`}
                            >
                                {tab}
                                {activeTab === idx && <span className="absolute top-0 left-0 w-full h-[3px] bg-[#343434]" />}
                            </button>
                        ))}
                    </div>
                    <div className="py-32 flex flex-col items-center justify-center bg-[#fcfcfc] border border-dashed border-gray-200">
                        <p className="text-gray-400 font-light tracking-widest uppercase">Content for {tabs[activeTab]}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;