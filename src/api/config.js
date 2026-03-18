import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000,
    withCredentials: true,
});

// [요청 인터셉터]
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Token refresh mutex
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
    refreshSubscribers.push(cb);
};

// [응답 인터셉터]
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthRequest = originalRequest.url.includes('/auth/login') ||
            originalRequest.url.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // 이미 refresh 중이면 대기 후 새 토큰으로 재시도
                return new Promise((resolve) => {
                    addRefreshSubscriber((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(axios(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                if (res.data.status === "200" || res.status === 200) {
                    const { accessToken } = res.data.data;
                    localStorage.setItem('accessToken', accessToken);

                    isRefreshing = false;
                    onRefreshed(accessToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = [];
                console.error("세션이 만료되었습니다.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/shop/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
