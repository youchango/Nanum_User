import api from './config';
import type { ApiResponse, PageResponse } from '../types/common';

export interface PointHistory {
    pointId: number;
    pointUse: number;
    pointGubun: string;
    pointBigo: string;
    createdAt: string;
    orderNo?: string;
}

const pointService = {
    getBalance: (): Promise<ApiResponse<number>> => 
        api.get<ApiResponse<number>>('/points/balance').then(res => res.data),
    
    getHistory: (page: number = 1, size: number = 20): Promise<ApiResponse<PageResponse<PointHistory>>> => 
        api.get<ApiResponse<PageResponse<PointHistory>>>('/points/history', { params: { page, size } }).then(res => res.data),
};

export default pointService;
