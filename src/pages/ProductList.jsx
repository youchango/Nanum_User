import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
    const navigate = useNavigate();

    // 테스트용 가짜 상품 데이터 (나중에 API 연동)
    const [products] = useState([
        { id: 1, name: "Nanum 쌀", price: "45,000", category: "리빙", img: "/images/product1.jpg" },
        { id: 2, name: "따뜻한 베이지 머그", price: "18,000", category: "키친", img: "/images/product2.jpg" },
        { id: 3, name: "내추럴 린넨 에이프런", price: "32,000", category: "의류", img: "/images/product3.jpg" },
        { id: 4, name: "핸드메이드 인센스 홀더", price: "24,000", category: "리빙", img: "/images/product4.jpg" },
        { id: 5, name: "오가닉 코튼 수건 세트", price: "29,000", category: "욕실", img: "/images/product5.jpg" },
        { id: 6, name: "세라믹 화분 (S)", price: "15,000", category: "가드닝", img: "/images/product6.jpg" },
    ]);

    return (
        <div className="w-full bg-white pb-20">
            {/* 1. 페이지 상단 헤더 (배경색 적용) */}
            <section className="bg-[#ece0d1]/50 py-16 md:py-24 px-6">
                <div className="max-w-[1290px] mx-auto text-center md:text-left">
                    <h2 className="text-[32px] md:text-[42px] font-medium text-[#343434] mb-4 uppercase tracking-tight">전체 상품</h2>
                    <p className="text-[#888] text-[14px] md:text-[16px] font-light">Nanum이 선별한 소중한 가치를 만나보세요.</p>
                </div>
            </section>

            {/* 2. 필터 및 정렬 바 */}
            <section className="max-w-[1290px] mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center border-b border-gray-100 gap-4">
                <div className="flex gap-6 text-[13px] text-[#888] font-medium">
                    <button className="text-[#343434] border-b border-[#343434]">전체보기</button>
                    <button className="hover:text-[#343434] transition-colors">베스트</button>
                    <button className="hover:text-[#343434] transition-colors">신상품</button>
                </div>

                <div className="flex items-center gap-2 text-[13px] text-[#666]">
                    <select className="bg-transparent outline-none cursor-pointer">
                        <option>신상품순</option>
                        <option>인기상품순</option>
                        <option>낮은가격순</option>
                        <option>높은가격순</option>
                    </select>
                </div>
            </section>

            {/* 3. 상품 그리드 영역 */}
            <section className="max-w-[1290px] mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {products.map((item) => (
                        <div
                            key={item.id}
                            className="group cursor-pointer"
                            onClick={() => navigate(`/shop/product/${item.id}`)} // 클릭 시 해당 ID 상세페이지로 이동
                        >
                            {/* 상품 이미지 박스 */}
                            <div className="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9] mb-4">
                                {/* 실제 이미지 사용 시 img 태그로 교체 */}
                                <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:scale-110 transition-transform duration-500">
                                    <span className="text-xs">IMAGE</span>
                                </div>
                                {/* 퀵뷰 혹은 장바구니 버튼 (Hover 시 노출) */}
                                <div className="absolute bottom-0 left-0 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-[#343434]/90 py-3 text-center">
                                    <span className="text-white text-[12px] font-medium">장바구니 담기</span>
                                </div>
                            </div>

                            {/* 상품 정보 */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-[#968064] font-bold uppercase tracking-wider">{item.category}</span>
                                <h3 className="text-[14px] md:text-[15px] text-[#343434] font-medium group-hover:underline truncate">{item.name}</h3>
                                <p className="text-[14px] text-[#343434] font-bold mt-1">{item.price}원</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProductList;