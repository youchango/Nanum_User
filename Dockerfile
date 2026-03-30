# 1단계: Build stage
FROM node:20-alpine AS build-stage
WORKDIR /app

# 빌드 인자(API URL) 주입
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: Production stage (Nginx)
FROM nginx:stable-alpine

# 빌드된 정적 파일 복사
COPY --from=build-stage /app/dist /usr/share/nginx/html

# [중요] 사용자가 업로드한 파일을 서빙하기 위한 nginx 설정 복사
# 프로젝트 루트에 nginx.conf 파일을 미리 만들어두어야 합니다.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 업로드된 이미지가 저장될 내부 디렉토리 생성
RUN mkdir -p /usr/share/nginx/html/uploads

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]