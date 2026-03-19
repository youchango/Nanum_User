import api from './config';

const SITE_CD = import.meta.env.VITE_SITE_CD || 'NANUM';

const contentService = {
    /** 공지사항 목록 조회 */
    getNotices: (page = 0, size = 5) => api.get('/contents', { params: { type: 'NOTICE', site_cd: SITE_CD, page, size } }),

    /** 공지사항 상세 조회 */
    getNotice: (id) => api.get(`/contents/${id}`, { params: { site_cd: SITE_CD } }),

    /** FAQ 목록 조회 */
    getFaqs: () => api.get('/contents', { params: { type: 'FAQ', site_cd: SITE_CD } }),
};

export default contentService;
