pipeline {
    agent any

    environment {
        // 이미지명: nanum-user (유지)
        DOCKER_IMAGE_NAME = "nanum-user"

        // [변경] API URL: 실제 배포 도메인으로 설정
        // nanum-server.ttcc.co.kr: Nanum Backend API 서버
        VITE_API_BASE_URL = "https://nanum-server.ttcc.co.kr/api/v1"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Nanum User Frontend Checkout Complete'
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    // VITE_API_BASE_URL을 빌드 인자로 주입하여 이미지 생성
                    sh """
                        docker build \
                            --build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL} \
                            -t ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER} \
                            -t ${DOCKER_IMAGE_NAME}:latest \
                            .
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // 기존 컨테이너 중지 및 제거
                    sh 'docker stop nanum-user || true'
                    sh 'docker rm nanum-user || true'

                    // 신규 컨테이너 실행
                    // 포트: 9023:80 (호스트:컨테이너)
                    // NPM Proxy Manager: nanum.ttcc.co.kr -> localhost:9023
                    sh """
                        docker run -d \
                            --restart unless-stopped \
                            --name nanum-user \
                            -p 9023:80 \
                            ${DOCKER_IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                // 미사용 이미지 정리 (디스크 절약)
                sh "docker image prune -f"
            }
        }
    }

    post {
        success {
            echo "nanum-user 배포 성공 (포트: 9023, API: ${VITE_API_BASE_URL})"
        }
        failure {
            echo "nanum-user 빌드/배포 실패"
        }
    }
}
