import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000,
    // ⭐️ 핵심: 모든 요청에 쿠키를 포함함
    withCredentials: true,
});

// [요청 인터셉터]
api.interceptors.request.use((config) => {
    // 만약 accessToken도 쿠키로 관리한다면 여기서 헤더 설정을 아예 지워도 됩니다.
    // 하지만 보통 백엔드에서 헤더의 Bearer 토큰을 요구하므로 일단 유지합니다.
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// [응답 인터셉터]
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 로그인/리프레시 요청 자체에서 에러가 나면 재시도 금지 (무한 루프 방지)
        const isAuthRequest = originalRequest.url.includes('/auth/login') ||
            originalRequest.url.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            try {
                // 💡 쿠키 방식의 핵심: 바디에 토큰을 실어 보내지 않음
                // 브라우저가 Set-Cookie로 저장된 리프레시 토큰을 자동으로 서버에 보냅니다.
                const res = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
                    {}, // 빈 바디
                    { withCredentials: true }
                );

                if (res.data.status === "200" || res.status === 200) {
                    const { accessToken } = res.data.data;

                    // 새로운 AccessToken만 업데이트 (메모리나 스토리지)
                    localStorage.setItem('accessToken', accessToken);

                    // 원래 요청 재시도
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                // 쿠키 자체가 만료되었거나 유효하지 않은 경우
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