import api from './config';
import type { ApiResponse, PageResponse } from '../types/common';

const SITE_CD = (import.meta.env.VITE_SITE_CD as string) || 'NANUM';

const couponService = {
    /** 내 쿠폰함 - 사용 가능한 쿠폰 조회 */
    getAvailable: (page: number = 1, size: number = 10): Promise<ApiResponse<any[]>> => 
        api.get<ApiResponse<any[]>>('/coupons', { params: { page, size, siteCd: SITE_CD } }).then(res => res.data),
    
    /** 내 쿠폰함 - 전체 쿠폰 조회 */
    getAll: (page: number = 1, size: number = 10): Promise<ApiResponse<PageResponse<any>>> => 
        api.get<ApiResponse<PageResponse<any>>>('/coupons/all', { params: { page, size, siteCd: SITE_CD } }).then(res => res.data),

    /** 다운로드 가능한 쿠폰 조회 */
    getDownloadable: (): Promise<ApiResponse<any[]>> =>
        api.get<ApiResponse<any[]>>('/coupons/downloadable', { params: { siteCd: SITE_CD } }).then(res => res.data),

    /** 쿠폰 다운로드 */
    downloadCoupon: (couponId: number | string): Promise<ApiResponse<void>> =>
        api.post<ApiResponse<void>>(`/coupons/${couponId}/download`, null, { params: { siteCd: SITE_CD } }).then(res => res.data),
};

export default couponService;
