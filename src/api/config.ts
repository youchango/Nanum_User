import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL as string,
    timeout: 5000,
    withCredentials: true,
});

// [요청 인터셉터]
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error: AxiosError) => Promise.reject(error));

// Token refresh mutex
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

const addRefreshSubscriber = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

// [응답 인터셉터]
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // 백엔드 ApiResponse 구조 정규화
        const resData = response.data;
        if (resData && typeof resData === 'object' && 'status' in resData) {
            // SUCCESS 상태를 success: true 및 status: "200"으로 매핑
            if (resData.status === "SUCCESS") {
                resData.success = true;
                resData.status = "200";
            } else if (resData.status === "FAIL" || resData.status === "ERROR") {
                resData.success = false;
            }
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (!originalRequest) return Promise.reject(error);

        const isAuthRequest = originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // 이미 refresh 중이면 대기 후 새 토큰으로 재시도
                return new Promise((resolve) => {
                    addRefreshSubscriber((token: string) => {
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
