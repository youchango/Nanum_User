import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { categoryService } from '../api/categoryService';

const ProductList = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCategoryId, setSelectedCategoryId] = useState({ main: null, sub: null });
    const [searchQuery, setSearchQuery] = useState("");

    const observerRef = useRef();

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await categoryService.getCategoryTree();
            setCategories(data);
        };
        fetchCategories();
    }, []);

    const fixedProducts = [
        { id: 1, name: "Nanum 쌀 (백미)", price: 36000, originalPrice: 45000, category: "쌀", subCategory: "백미", img: "/images/product1.jpg" },
        { id: 2, name: "따뜻한 베이지 머그", price: 18000, originalPrice: null, category: "키친", subCategory: "컵/잔", img: "/images/product2.jpg" },
        { id: 3, name: "내추럴 린넨 에이프런", price: 28800, originalPrice: 32000, category: "의류", subCategory: "린넨", img: "/images/product3.jpg" },
        { id: 4, name: "유기농 흑미 1kg", price: 24000, originalPrice: null, category: "쌀", subCategory: "흑미", img: "/images/product4.jpg" },
        { id: 5, name: "오가닉 코튼 수건 세트", price: 23200, originalPrice: 29000, category: "욕실", subCategory: "수건", img: "/images/product5.jpg" },
        { id: 6, name: "세라믹 화분 (S)", price: 15000, originalPrice: null, category: "리빙", subCategory: "인테리어", img: "/images/product6.jpg" },
        { id: 7, name: "빈티지 우드 트레이", price: 19800, originalPrice: 22000, category: "키친", subCategory: "조리도구", img: "/images/product7.jpg" },
        { id: 8, name: "핸드드립 세트", price: 52200, originalPrice: 58000, category: "키친", subCategory: "컵/잔", img: "/images/product8.jpg" },
        { id: 10, name: "모던 세라믹 화병", price: 31500, originalPrice: 35000, category: "리빙", subCategory: "인테리어", img: "/images/product10.jpg" },
        { id: 11, name: "순면 발매트", price: 9600, originalPrice: 12000, category: "욕실", subCategory: "욕실소품", img: "/images/product11.jpg" },
        { id: 12, name: "리플 슬리퍼", price: 15000, originalPrice: null, category: "의류", subCategory: "홈웨어", img: "/images/product12.jpg" },
    ];

    const getDiscountRate = (price, originalPrice) => {
        if (!originalPrice) return null;
        return Math.floor(((originalPrice - price) / originalPrice) * 100);
    };

    const getFilteredData = useCallback(() => {
        let data = [...fixedProducts];
        if (searchQuery.trim()) {
            data = data.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        const mainCat = categories.find(c => c.id === selectedCategoryId.main);
        if (mainCat) {
            data = data.filter(p => p.category === mainCat.name);
            if (selectedCategoryId.sub) {
                const subCat = mainCat.subs.find(s => s.id === selectedCategoryId.sub);
                if (subCat) data = data.filter(p => p.subCategory === subCat.name);
            }
        }
        return data;
    }, [selectedCategoryId, categories, searchQuery]);

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
        setPage(1); setHasMore(true); fetchProducts(1, true);
    }, [selectedCategoryId, activeTab, fetchProducts, searchQuery]);

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
        /* ⭐️ pb-[500px] 처럼 아주 넉넉한 하단 여백을 주어 sticky가 풀리지 않게 함 */
        <div className="w-full bg-white pb-[300px] relative">

            {/* ⭐️ sticky 바: z-index를 헤더(9999) 바로 아래급인 500으로 상향
                모바일에서 주소창 변화에 대응하기 위해 bg-white와 shadow를 더 명확히 함 */}
            <div className="sticky top-[60px] md:top-[76px] z-[500] bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-[1290px] mx-auto px-6 py-4 flex flex-col gap-4 bg-white">

                    {/* (1) 검색창 */}
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="찾으시는 상품명을 입력해주세요."
                            className="w-full h-11 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-full text-[14px] outline-none focus:border-[#968064] focus:bg-white transition-all"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* (2) 카테고리 바 */}
                    <div className="flex items-center gap-6 text-[13px] font-bold text-[#bbb] overflow-x-auto no-scrollbar py-1">
                        <div className="flex gap-5 border-r pr-5 border-gray-200 shrink-0">
                            {['all', 'best', 'new'].map(tab => (
                                <button key={tab} onClick={() => { setActiveTab(tab); setSelectedCategoryId({ main: null, sub: null }); }}
                                        className={`transition-all uppercase pb-1 whitespace-nowrap ${activeTab === tab && !selectedCategoryId.main ? 'text-[#333] border-b-2 border-[#333]' : 'hover:text-[#333]'}`}>
                                    {tab === 'all' ? '전체' : tab === 'best' ? '베스트' : '신상품'}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-7 shrink-0">
                            {categories.map((cat) => (
                                <div key={cat.id} className="relative group/cat">
                                    <button onClick={() => { setSelectedCategoryId({ main: cat.id, sub: null }); setActiveTab('all'); }}
                                            className={`transition-all pb-1 whitespace-nowrap ${selectedCategoryId.main === cat.id ? 'text-[#968064] border-b-2 border-[#968064]' : 'hover:text-[#333]'}`}>{cat.name}</button>

                                    {cat.subs && cat.subs.length > 0 && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all duration-300 z-[1000]">
                                            <ul className="bg-white border border-gray-100 shadow-2xl py-2 min-w-[110px] text-center rounded-sm">
                                                <li className="px-4 py-2 text-[12px] text-[#888] cursor-pointer hover:text-[#968064]" onClick={() => setSelectedCategoryId({ main: cat.id, sub: null })}>전체보기</li>
                                                {cat.subs.map(sub => (
                                                    <li key={sub.id} className={`px-4 py-2 text-[12px] cursor-pointer hover:text-[#968064] ${selectedCategoryId.sub === sub.id ? 'text-[#968064] font-bold' : 'text-[#888]'}`}
                                                        onClick={() => setSelectedCategoryId({ main: cat.id, sub: sub.id })}>{sub.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <section className="max-w-[1290px] mx-auto px-6 py-12">
                {/* 상품 그리드 로직 생략 (기존과 동일) */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                        {products.map((item, index) => {
                            const discountRate = getDiscountRate(item.price, item.originalPrice);
                            return (
                                <div key={item.id} ref={products.length === index + 1 ? lastElementRef : null}
                                     className="group cursor-pointer flex flex-col"
                                     onClick={() => navigate(`/shop/product/${item.id}`)}>
                                    <div className="relative aspect-[3/4] bg-[#f9f9f9] mb-4 overflow-hidden shadow-sm">
                                        {discountRate && <div className="absolute top-0 right-0 bg-[#E23600] text-white text-[11px] font-bold px-3 py-1.5 z-10 shadow-sm">{discountRate}% OFF</div>}
                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <button className="absolute bottom-0 left-0 w-full bg-[#333]/90 py-4 text-white text-[12px] font-bold translate-y-full group-hover:translate-y-0 transition-transform" onClick={(e) => { e.stopPropagation(); addToCart(item, 1); }}>장바구니 담기</button>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] text-[#968064] font-bold uppercase">{item.category}</p>
                                        <h3 className="text-[14px] text-[#333] font-medium truncate">{item.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[15px] font-bold text-[#333]">{item.price.toLocaleString()}원</p>
                                            {item.originalPrice && <p className="text-[12px] text-gray-400 line-through font-light">{item.originalPrice.toLocaleString()}원</p>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-40 text-center flex flex-col items-center">
                        <p className="text-gray-400 font-medium">검색 결과가 없습니다.</p>
                    </div>
                )}
                {loading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#968064] border-t-transparent rounded-full animate-spin"></div></div>}
            </section>
        </div>
    );
};

export default ProductList;