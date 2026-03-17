import api from './config';

const SITE_CD = 'NANUM';

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
};

export default productService;
