import api from './config';
import type { ApiResponse, PageResponse } from '../types/common';

const taxBillService = {
    /** 세금계산서 정보 목록 */
    getInfoList: (): Promise<ApiResponse<any[]>> => 
        api.get<ApiResponse<any[]>>('/tax-bill/info').then(res => res.data),

    /** 세금계산서 정보 등록 */
    createInfo: (data: any): Promise<ApiResponse<any>> => 
        api.post<ApiResponse<any>>('/tax-bill/info', data).then(res => res.data),

    /** 세금계산서 정보 수정 */
    updateInfo: (id: number | string, data: any): Promise<ApiResponse<any>> => 
        api.put<ApiResponse<any>>(`/tax-bill/info/${id}`, data).then(res => res.data),

    /** 세금계산서 정보 삭제 */
    deleteInfo: (id: number | string): Promise<ApiResponse<any>> => 
        api.delete<ApiResponse<any>>(`/tax-bill/info/${id}`).then(res => res.data),

    /** 발행 신청 */
    applyTaxBill: (data: any): Promise<ApiResponse<any>> => 
        api.post<ApiResponse<any>>('/tax-bill/apply', data).then(res => res.data),

    /** 신청 목록 */
    getApplyList: (page: number = 1, size: number = 10): Promise<ApiResponse<PageResponse<any>>> => 
        api.get<ApiResponse<PageResponse<any>>>('/tax-bill/apply', { params: { page, size } }).then(res => res.data),

    /** 신청 상세 */
    getApplyDetail: (id: number | string): Promise<ApiResponse<any>> => 
        api.get<ApiResponse<any>>(`/tax-bill/apply/${id}`).then(res => res.data),
};

export default taxBillService;
