import api from './config';
import type { ApiResponse, PageResponse } from '../types/common';

const SITE_CD = import.meta.env.VITE_SITE_CD || 'NANUM';

const inquiryService = {
    getInquiries: (page: number = 1, size: number = 10): Promise<ApiResponse<PageResponse<any>>> => 
        api.get<ApiResponse<PageResponse<any>>>('/inquiries', { params: { page, size, siteCd: SITE_CD } }).then(res => res.data),
    
    getInquiry: (id: number | string): Promise<ApiResponse<any>> => 
        api.get<ApiResponse<any>>(`/inquiries/${id}`).then(res => res.data),
    
    createInquiry: (data: any): Promise<ApiResponse<any>> => 
        api.post<ApiResponse<any>>('/inquiries', { ...data, siteCd: SITE_CD }).then(res => res.data),
    
    getProductInquiries: (productId: string | number, page: number = 1, size: number = 10): Promise<ApiResponse<PageResponse<any>>> =>
        api.get<ApiResponse<PageResponse<any>>>(`/inquiries/product/${productId}`, { params: { page, size, siteCd: SITE_CD } }).then(res => res.data),
};

export default inquiryService;
