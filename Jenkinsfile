pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = "nanum-user"
        VITE_API_BASE_URL = "https://nanum-server.ttcc.co.kr/api/v1"

        // [추가] 호스트 서버의 실제 이미지 저장 경로 (서버 환경에 맞춰 수정하세요)
        HOST_UPLOAD_PATH = "/home/ttcc/nanum/upload"
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
                    sh 'docker stop nanum-user || true'
                    sh 'docker rm nanum-user || true'

                    // [수정] -v 옵션을 통해 호스트의 저장소와 컨테이너 내부 업로드 폴더 연결
                    // 이제 컨테이너가 삭제되어도 HOST_UPLOAD_PATH에 있는 파일은 유지됩니다.
                    sh """
                        docker run -d \
                            --restart unless-stopped \
                            --name nanum-user \
                            -p 9023:80 \
                            -v ${HOST_UPLOAD_PATH}:/usr/share/nginx/html/uploads \
                            ${DOCKER_IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                sh "docker image prune -f"
            }
        }
    }

    post {
        success {
            echo "nanum-user 배포 성공 (포트: 9023, 볼륨: ${HOST_UPLOAD_PATH})"
        }
        failure {
            echo "nanum-user 빌드/배포 실패"
        }
    }
}