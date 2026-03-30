import api from './config';

const SITE_CD = import.meta.env.VITE_SITE_CD || 'NANUM';

const displayService = {
    getBanners: (type = 'MAIN_TOP') =>
        api.get('/banners', { params: { type, site_cd: SITE_CD } }),
    getPopups: () =>
        api.get('/popups', { params: { site_cd: SITE_CD } }),
};

export default displayService;
