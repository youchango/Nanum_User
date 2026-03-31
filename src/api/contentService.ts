import api from './config';
import type { ApiResponse, PageResponse } from '../types/common';

const SITE_CD = import.meta.env.VITE_SITE_CD || 'NANUM';

const contentService = {
    /** 공지사항 목록 조회 */
    getNotices: (page: number = 1, size: number = 5): Promise<ApiResponse<PageResponse<any>>> =>
        api.get<ApiResponse<PageResponse<any>>>('/contents', { params: { type: 'NOTICE', site_cd: SITE_CD, page, size } }).then(res => res.data),

    /** 공지사항 상세 조회 */
    getNotice: (id: number | string): Promise<ApiResponse<any>> =>
        api.get<ApiResponse<any>>(`/contents/${id}`, { params: { site_cd: SITE_CD } }).then(res => res.data),

    /** FAQ 목록 조회 */
    getFaqs: (page: number = 1, size: number = 20): Promise<ApiResponse<PageResponse<any>>> =>
        api.get<ApiResponse<PageResponse<any>>>('/contents', { params: { type: 'FAQ', site_cd: SITE_CD, page, size } }).then(res => res.data),
};

export default contentService;
