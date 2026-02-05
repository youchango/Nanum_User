import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // 1. 로컬스토리지를 읽어오는 공통 함수
    const loadCart = () => {
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);

        if (!isInitialized && savedCart.length > 0) {
            setSelectedIds(savedCart.map(item => item.id));
            setIsInitialized(true);
        }
    };

    // 2. 초기 로드 및 실시간 스토리지 감지
    useEffect(() => {
        loadCart();
        const handleStorageChange = () => loadCart();

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('cartUpdate', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('cartUpdate', handleStorageChange);
        };
    }, [isInitialized]);

    // 3. 상태 업데이트 및 스토리지 저장 통합 함수
    const saveCart = (newItems) => {
        const newItemIds = newItems.map(item => item.id);
        setSelectedIds(prev => prev.filter(id => newItemIds.includes(id)));

        setCartItems(newItems);
        localStorage.setItem('cart', JSON.stringify(newItems));
        window.dispatchEvent(new Event('cartUpdate'));
    };

    // [로직] 장바구니 추가
    const addToCart = (product, quantity = 1) => {
        const user = localStorage.getItem('user');

        // ⭐️ [수정] 로그인 체크 및 알림 추가
        if (!user) {
            alert('로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.');

            // 현재 페이지의 경로를 세션 스토리지 등에 임시 저장하거나,
            // 쿼리 파라미터를 통해 전달할 수 있습니다.
            // 여기서는 가장 직관적인 알림 후 이동 방식을 사용합니다.
            const currentPath = window.location.pathname;
            window.location.href = `/shop/login?redirect=${currentPath}`;
            return;
        }

        const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
        let newCart;

        if (existingItemIndex > -1) {
            newCart = [...cartItems];
            newCart[existingItemIndex].quantity += quantity;
        } else {
            newCart = [...cartItems, {
                id: product.id,
                name: product.name,
                price: typeof product.price === 'string' ? parseInt(product.price.replace(/,/g, '')) : product.price,
                image: product.image || product.img,
                quantity: quantity
            }];
            setSelectedIds(prev => [...prev, product.id]);
        }

        saveCart(newCart);

        if (window.confirm('장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?')) {
            window.location.href = '/shop/cart';
        }
    };

    // [로직] 수량 조절
    const updateQuantity = (id, delta) => {
        const newCart = cartItems.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        );
        saveCart(newCart);
    };

    // [로직] 상품 삭제
    const removeItem = (id) => {
        if (window.confirm('장바구니에서 삭제하시겠습니까?')) {
            const newCart = cartItems.filter(item => item.id !== id);
            saveCart(newCart);
        }
    };

    const cartCount = cartItems.length;

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            addToCart,
            updateQuantity,
            removeItem,
            selectedIds,
            setSelectedIds
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);