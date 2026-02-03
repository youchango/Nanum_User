/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-red': '#B22222', // 이미지의 포인트 컬러 미리 등록
            },
        },
    },
    plugins: [],
}