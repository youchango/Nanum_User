import api from './config';

const SITE_CD = import.meta.env.VITE_SITE_CD || 'NANUM';

const productService = {
    /** 상품 목록 조회 */
    getProducts: (params = {}) =>
        api.get('/products', { params: { siteCd: SITE_CD, ...params } }),

    /** 메인 상품 목록 조회 */
    getMainProducts: (params = {}) =>
        api.get('/products/main', { params: { siteCd: SITE_CD, ...params } }),

    /** 상품 상세 조회 */
    getProduct: (id) =>
        api.get(`/products/${id}`, { params: { siteCd: SITE_CD } }),

    /** 리뷰 목록 조회 */
    getReviews: (productId, page = 0, size = 10) =>
        api.get(`/products/${productId}/reviews`, { params: { page, size } }),

    /** 리뷰 작성 */
    createReview: (productId, data) =>
        api.post(`/products/${productId}/reviews`, data),

    /** 리뷰 좋아요 토글 */
    toggleReviewLike: (productId, reviewId) =>
        api.post(`/products/${productId}/reviews/${reviewId}/like`),

    /** 리뷰 좋아요 취소 */
    removeReviewLike: (productId, reviewId) =>
        api.delete(`/products/${productId}/reviews/${reviewId}/like`),
};

export default productService;
