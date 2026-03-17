import api from './config';

const cartService = {
    /** 장바구니 목록 조회 */
    getCartList: () => api.get('/cart'),

    /** 장바구니 추가 (forceUpdate: 중복 시 수량 합산 여부) */
    addToCart: (productId, quantity, optionId = null, forceUpdate = false) =>
        api.post('/cart', { productId, optionId, quantity, forceUpdate }),

    /** 수량 변경 */
    updateQuantity: (cartId, quantity) =>
        api.put(`/cart/${cartId}`, { quantity }),

    /** 단건 삭제 */
    deleteItem: (cartId) => api.delete(`/cart/${cartId}`),

    /** 다건 삭제 */
    deleteItems: (cartIds) => api.delete('/cart', { data: cartIds }),
};

export default cartService;
