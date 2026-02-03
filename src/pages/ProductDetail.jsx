import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductDetail = () => {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    const handleQuantity = (type) => {
        if (type === 'plus') setQuantity(quantity + 1);
        else if (type === 'minus' && quantity > 1) setQuantity(quantity - 1);
    };

    const tabs = ['상세정보', '구매후기(0)', 'Q&A(0)', '배송/교환안내'];

    return (
        /* 모바일 바 높이만큼 하단 여백 추가 (pb-24), PC에서는 제거 (md:pb-20) */
        <div className="w-full bg-white pb-24 md:pb-20">
            <div className="max-w-[1290px] mx-auto px-6 py-10 md:py-20">
                <div className="flex flex-col md:flex-row gap-12 lg:gap-20">

                    {/* 왼쪽: 상품 이미지 영역 */}
                    <div className="flex-1">
                        <div className="group aspect-[1/1] bg-[#f9f9f9] overflow-hidden relative cursor-zoom-in">
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg group-hover:scale-110 transition-transform duration-500">
                                PRODUCT IMAGE
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4 overflow-x-auto">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="min-w-[80px] h-20 bg-[#f9f9f9] cursor-pointer border border-transparent hover:border-[#968064] transition-all duration-300 opacity-70 hover:opacity-100" />
                            ))}
                        </div>
                    </div>

                    {/* 오른쪽: 정보 영역 */}
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="border-b border-gray-100 pb-6">
                            <span className="text-[#968064] text-sm font-bold tracking-widest uppercase mb-2 block">Premium Collection</span>
                            <h2 className="text-[28px] md:text-[34px] font-medium text-[#333] mb-4">Nanum 쌀</h2>
                            <p className="text-[24px] font-bold text-[#343434]">45,000원</p>
                        </div>

                        <div className="text-[15px] text-[#777] leading-relaxed">
                            <p>자연의 정직함을 담은 Nanum 쌀입니다. 엄격한 품질 관리를 통해 선별된 최상의 곡물로 일상의 식탁에 건강함을 더해드립니다.</p>
                        </div>

                        {/* 수량 선택 박스 (모바일에서도 가독성 있게 조정) */}
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
                                <span className="text-2xl font-extrabold text-[#E23600]">{(45000 * quantity).toLocaleString()}원</span>
                            </div>
                        </div>

                        {/* [통합 버튼 바] 모바일: 하단 고정 | PC: 일반 배치 */}
                        <div className="
                            flex gap-3 z-[1000] transition-all duration-300
                            fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]
                            md:relative md:bottom-auto md:left-auto md:w-full md:bg-transparent md:border-none md:px-0 md:py-0 md:shadow-none md:mt-4
                        ">
                            <button className="group w-12 h-12 md:w-14 md:h-14 border border-gray-200 flex items-center justify-center hover:border-red-400 bg-white transition-colors">
                                <span className="text-xl text-gray-400 group-hover:text-red-500">♥</span>
                            </button>
                            <button className="flex-1 h-12 md:h-14 border border-[#343434] text-[#343434] font-medium text-sm md:text-[15px] hover:bg-gray-50 transition-all bg-white">
                                장바구니
                            </button>

                            {/* 이 버튼을 수정했습니다 */}
                            <button
                                onClick={() => navigate('/shop/checkout')}
                                className="flex-[2] h-12 md:h-14 bg-[#343434] text-white font-bold text-sm md:text-[15px] hover:bg-black active:scale-[0.98] transition-all shadow-lg"
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