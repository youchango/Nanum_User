import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductList = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // 1. 고정 데이터
    const fixedProducts = [
        { id: 1, name: "Nanum 쌀 (백미)", price: 45000, category: "쌀", subCategory: "백미", img: "/images/product1.jpg" },
        { id: 2, name: "따뜻한 베이지 머그", price: 18000, category: "키친", subCategory: "컵/잔", img: "/images/product2.jpg" },
        { id: 3, name: "내추럴 린넨 에이프런", price: 32000, category: "의류", subCategory: "린넨", img: "/images/product3.jpg" },
        { id: 4, name: "유기농 흑미 1kg", price: 24000, category: "쌀", subCategory: "흑미", img: "/images/product4.jpg" },
        { id: 5, name: "오가닉 코튼 수건 세트", price: 29000, category: "욕실", subCategory: "수건", img: "/images/product5.jpg" },
        { id: 6, name: "세라믹 화분 (S)", price: 15000, category: "리빙", subCategory: "인테리어", img: "/images/product6.jpg" },
        { id: 7, name: "빈티지 우드 트레이", price: 22000, category: "키친", subCategory: "조리도구", img: "/images/product7.jpg" },
        { id: 8, name: "핸드드립 세트", price: 58000, category: "키친", subCategory: "컵/잔", img: "/images/product8.jpg" },
        { id: 9, name: "천연 소이 캔들", price: 19000, category: "리빙", subCategory: "인테리어", img: "/images/product9.jpg" },
        { id: 10, name: "모던 세라믹 화병", price: 35000, category: "리빙", subCategory: "인테리어", img: "/images/product10.jpg" },
        { id: 11, name: "순면 발매트", price: 12000, category: "욕실", subCategory: "욕실소품", img: "/images/product11.jpg" },
        { id: 12, name: "리플 슬리퍼", price: 15000, category: "의류", subCategory: "홈웨어", img: "/images/product12.jpg" },
    ];

    // 2. 상태 관리
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCategoryId, setSelectedCategoryId] = useState({ main: null, sub: null });

    const observerRef = useRef();

    const categories = [
        { id: 100, name: "쌀", subs: [{ id: 101, name: "흑미" }, { id: 102, name: "백미" }, { id: 103, name: "보리" }] },
        { id: 200, name: "키친", subs: [{ id: 201, name: "식기" }, { id: 202, name: "조리도구" }, { id: 203, name: "컵/잔" }] },
        { id: 300, name: "욕실", subs: [{ id: 301, name: "수건" }, { id: 302, name: "욕실소품" }] },
        { id: 400, name: "의류", subs: [{ id: 401, name: "린넨" }, { id: 402, name: "홈웨어" }] },
        { id: 500, name: "리빙", subs: [{ id: 501, name: "가구" }, { id: 502, name: "인테리어" }] }
    ];

    // 3. 필터링 로직
    const getFilteredData = useCallback(() => {
        let data = [...fixedProducts];
        const mainCat = categories.find(c => c.id === selectedCategoryId.main);

        if (mainCat) {
            data = data.filter(p => p.category === mainCat.name);
            if (selectedCategoryId.sub) {
                const subCatName = mainCat.subs.find(s => s.id === selectedCategoryId.sub)?.name;
                data = data.filter(p => p.subCategory === subCatName);
            }
        }
        return data;
    }, [selectedCategoryId]);

    // 4. 데이터 페칭 함수
    const fetchProducts = useCallback((pageNum, isFirstLoad = false) => {
        const filtered = getFilteredData();
        const pageSize = 8;
        const start = isFirstLoad ? 0 : 12 + (pageNum - 2) * pageSize;
        const end = start + (isFirstLoad ? 12 : pageSize);
        const nextSlice = filtered.slice(start, end);

        if (isFirstLoad) {
            setProducts(nextSlice);
            setHasMore(nextSlice.length < filtered.length);
        } else {
            setLoading(true);
            setTimeout(() => {
                setProducts(prev => [...prev, ...nextSlice]);
                setLoading(false);
                if (end >= filtered.length) setHasMore(false);
            }, 300);
        }
    }, [getFilteredData]);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchProducts(1, true);
    }, [selectedCategoryId, activeTab, fetchProducts]);

    useEffect(() => {
        if (page > 1) fetchProducts(page, false);
    }, [page, fetchProducts]);

    const lastElementRef = useCallback((node) => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
        });
        if (node) observerRef.current.observe(node);
    }, [loading, hasMore]);

    return (
        <div className="w-full bg-white pb-20">
            <section className="bg-[#f8f5f2] py-16 px-6">
                <div className="max-w-[1290px] mx-auto">
                    <h2 className="text-[32px] md:text-[38px] font-medium text-[#333] mb-2 uppercase tracking-tight">SHOP</h2>
                </div>
            </section>

            {/* 필터 바 */}
            <section className="max-w-[1290px] mx-auto px-6 py-6 border-b border-gray-100 flex items-center gap-6 text-[13px] font-bold text-[#bbb]">
                <div className="flex gap-6 border-r pr-6 border-gray-200">
                    {['all', 'best', 'new'].map(tab => (
                        <button key={tab} onClick={() => { setActiveTab(tab); setSelectedCategoryId({ main: null, sub: null }); }}
                                className={`transition-all uppercase pb-1 ${activeTab === tab && !selectedCategoryId.main ? 'text-[#333] border-b-2 border-[#333]' : 'hover:text-[#333]'}`}>
                            {tab === 'all' ? '전체보기' : tab === 'best' ? '베스트' : '신상품'}
                        </button>
                    ))}
                </div>
                <div className="flex gap-8">
                    {categories.map((cat) => (
                        <div key={cat.id} className="relative group/cat py-1">
                            <button onClick={() => { setSelectedCategoryId({ main: cat.id, sub: null }); setActiveTab('all'); }}
                                    className={`transition-all pb-1 ${selectedCategoryId.main === cat.id ? 'text-[#968064] border-b-2 border-[#968064]' : 'hover:text-[#333]'}`}>{cat.name}</button>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all duration-300 z-[100]">
                                <ul className="bg-white border border-gray-100 shadow-xl py-3 min-w-[120px] text-center rounded-sm">
                                    <li className={`px-4 py-2 text-[12px] cursor-pointer hover:text-[#968064] ${selectedCategoryId.main === cat.id && !selectedCategoryId.sub ? 'text-[#968064] font-bold' : 'text-[#888]'}`}
                                        onClick={() => setSelectedCategoryId({ main: cat.id, sub: null })}>전체보기</li>
                                    {cat.subs.map(sub => (
                                        <li key={sub.id} className={`px-4 py-2 text-[12px] cursor-pointer hover:text-[#968064] ${selectedCategoryId.sub === sub.id ? 'text-[#968064] font-bold' : 'text-[#888]'}`}
                                            onClick={() => setSelectedCategoryId({ main: cat.id, sub: sub.id })}>{sub.name}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 상품 그리드 */}
            <section className="max-w-[1290px] mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                    {products.map((item, index) => (
                        <div key={item.id} ref={products.length === index + 1 ? lastElementRef : null}
                             className="group cursor-pointer flex flex-col"
                             onClick={() => navigate(`/shop/product/${item.id}`)}>

                            {/* ⭐️ 이미지 영역: overflow-hidden과 group-hover 설정 확인 */}
                            <div className="relative aspect-[3/4] bg-[#f9f9f9] mb-4 overflow-hidden shadow-sm">
                                <img src={item.img} alt={item.name}
                                     className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />

                                {/* ⭐️ 버튼 영역: translate-y 값을 확실히 주고, group-hover 시 0으로 복귀 */}
                                <button
                                    className="absolute bottom-0 left-0 w-full bg-[#333]/90 py-4 text-white text-[12px] font-bold
                                               translate-y-full transition-transform duration-300 ease-in-out
                                               group-hover:translate-y-0 z-20 hover:bg-black"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(item, 1);
                                    }}
                                >
                                    장바구니 담기
                                </button>
                            </div>

                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] text-[#968064] font-bold uppercase tracking-wider">{item.category}</p>
                                <h3 className="text-[14px] text-[#333] font-medium group-hover:underline truncate">{item.name}</h3>
                                <p className="text-[15px] font-bold text-[#333] mt-1">{item.price.toLocaleString()}원</p>
                            </div>
                        </div>
                    ))}
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-[#968064] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ProductList;