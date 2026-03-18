import api from './config';

const SITE_CD = 'NANUM';

const displayService = {
    getBanners: (type = 'MAIN_TOP') =>
        api.get('/banners', { params: { type, site_cd: SITE_CD } }),
    getPopups: () =>
        api.get('/popups'),
};

export default displayService;
