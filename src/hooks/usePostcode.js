import { useState, useEffect } from 'react';

const usePostcode = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // 이미 스크립트가 로드되어 있는지 확인
        if (window.daum && window.daum.Postcode) {
            setIsLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        script.onload = () => setIsLoaded(true);
        document.body.appendChild(script);
    }, []);

    // 주소창을 여는 함수 (콜백을 인자로 받음)
    const openPostcode = (onComplete) => {
        if (!isLoaded) {
            alert("주소 서비스 로딩 중입니다. 잠시만 기다려주세요.");
            return;
        }

        new window.daum.Postcode({
            oncomplete: (data) => {
                // 부모 컴포넌트에서 필요한 데이터만 추출해서 전달
                const fullAddress = data.address;
                const zonecode = data.zonecode;
                onComplete({ zonecode, address: fullAddress });
            }
        }).open();
    };

    return { openPostcode, isPostcodeLoaded: isLoaded };
};

export default usePostcode;