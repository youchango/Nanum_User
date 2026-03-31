import api from './config';
import type { ApiResponse, SearchDTO } from '../types/common';
import type { Product, ProductPage, ReviewPage } from '../types/product';

const SITE_CD = (import.meta.env.VITE_SITE_CD as string) || 'NANUM';

const productService = {
    /** 상품 목록 조회 */
    getProducts: (params: SearchDTO = {}): Promise<ApiResponse<ProductPage>> =>
        api.get<ApiResponse<ProductPage>>('/products', { params: { siteCd: SITE_CD, ...params } }).then(res => res.data),

    /** 메인 상품 목록 조회 */
    getMainProducts: (params: SearchDTO = {}): Promise<ApiResponse<ProductPage>> =>
        api.get<ApiResponse<ProductPage>>('/products/main', { params: { siteCd: SITE_CD, ...params } }).then(res => res.data),

    /** 상품 상세 조회 */
    getProduct: (id: string | number): Promise<ApiResponse<Product>> =>
        api.get<ApiResponse<Product>>(`/products/${id}`, { params: { siteCd: SITE_CD } }).then(res => res.data),

    /** 리뷰 목록 조회 */
    getReviews: (productId: string | number, page: number = 1, size: number = 10): Promise<ApiResponse<ReviewPage>> =>
        api.get<ApiResponse<ReviewPage>>(`/products/${productId}/reviews`, { params: { page, size } }).then(res => res.data),

    /** 리뷰 작성 */
    createReview: (productId: string | number, data: any): Promise<ApiResponse<any>> =>
        api.post<ApiResponse<any>>(`/products/${productId}/reviews`, data).then(res => res.data),

    /** 리뷰 좋아요 토글 */
    toggleReviewLike: (productId: string | number, reviewId: number): Promise<ApiResponse<any>> =>
        api.post<ApiResponse<any>>(`/products/${productId}/reviews/${reviewId}/like`).then(res => res.data),

    /** 리뷰 좋아요 취소 */
    removeReviewLike: (productId: string | number, reviewId: number): Promise<ApiResponse<any>> =>
        api.delete<ApiResponse<any>>(`/products/${productId}/reviews/${reviewId}/like`).then(res => res.data),
};

export default productService;
