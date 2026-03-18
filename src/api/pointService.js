import api from './config';

const pointService = {
    getBalance: () => api.get('/points/balance'),
    getHistory: (page = 0, size = 20) => api.get('/points/history', { params: { page, size } }),
};

export default pointService;
