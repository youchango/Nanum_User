import api from './config';
import type { ApiResponse } from '../types/common';

const SITE_CD = import.meta.env.VITE_SITE_CD || 'NANUM';

const displayService = {
    getBanners: (type: string = 'MAIN_TOP'): Promise<ApiResponse<any[]>> =>
        api.get<ApiResponse<any[]>>('/banners', { params: { type, site_cd: SITE_CD } }).then(res => res.data),
    
    getPopups: (): Promise<ApiResponse<any[]>> =>
        api.get<ApiResponse<any[]>>('/popups', { params: { site_cd: SITE_CD } }).then(res => res.data),
};

export default displayService;
