import api from './config';
import type { ApiResponse, PageResponse } from '../types/common';

const claimService = {
    createClaim: (data: any): Promise<ApiResponse<any>> => 
        api.post<ApiResponse<any>>('/claims', data).then(res => res.data),
    
    getMyClaims: (page: number = 1, size: number = 10): Promise<ApiResponse<PageResponse<any>>> => 
        api.get<ApiResponse<PageResponse<any>>>('/claims', { params: { page, size } }).then(res => res.data),
    
    getClaimDetail: (id: number | string): Promise<ApiResponse<any>> => 
        api.get<ApiResponse<any>>(`/claims/${id}`).then(res => res.data),
};

export default claimService;
