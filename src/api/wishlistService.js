import api from './config';

const wishlistService = {
    /** 찜 목록 조회 (페이지네이션) */
    getWishlist: (page = 0, size = 10) =>
        api.get('/wishlist', { params: { page, size } }),

    /** 찜 토글 (추가/제거) */
    toggleWishlist: (productId) =>
        api.post('/wishlist', { productId }),

    /** 찜 삭제 */
    deleteWishlist: (productId) =>
        api.delete(`/wishlist/${productId}`),
};

export default wishlistService;
