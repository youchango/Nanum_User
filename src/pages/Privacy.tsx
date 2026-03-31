import React from 'react';
import { POLICY_DATA } from '../data/policyData';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[800px] mx-auto px-6 py-20 md:py-32">
                {/* 헤더 부분 */}
                <div className="border-b border-[#4D515A] pb-8 mb-12">
                    <h1 className="text-[32px] font-bold text-[#111] mb-4">{POLICY_DATA.privacy.title}</h1>
                    <p className="text-sm text-gray-400">{POLICY_DATA.privacy.date}</p>
                </div>

                {/* 본문 내용 */}
                <div className="text-[15px] leading-[1.8] text-[#444] whitespace-pre-line font-light">
                    {POLICY_DATA.privacy.content}
                </div>

                {/* 강조 박스 (개인정보 보호 의지 표현) */}
                <div className="mt-16 p-8 bg-[#f9f9f9] border-l-4 border-[#4D515A]">
                    <p className="text-[14px] text-[#333] font-medium mb-2">Nanum은 사용자의 개인정보를 최우선으로 보호합니다.</p>
                    <p className="text-[13px] text-[#666] leading-6">
                        우리는 투명한 정보 처리를 약속하며, 관련 법령을 준수하여 안전하게 데이터를 관리하고 있습니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;