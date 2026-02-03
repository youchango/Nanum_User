import React from 'react';
import { POLICY_DATA } from '../data/policyData';

const Terms = () => {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[800px] mx-auto px-6 py-20 md:py-32">
                {/* 헤더 부분 */}
                <div className="border-b border-gray-900 pb-8 mb-12">
                    <h1 className="text-[32px] font-bold text-[#111] mb-4">{POLICY_DATA.terms.title}</h1>
                    <p className="text-sm text-gray-400">{POLICY_DATA.terms.date}</p>
                </div>

                {/* 본문 내용 */}
                <div className="text-[15px] leading-[1.8] text-[#444] whitespace-pre-line font-light">
                    {POLICY_DATA.terms.content}
                </div>

                {/* 하단 안내 */}
                <div className="mt-20 pt-10 border-t border-gray-100 text-[13px] text-gray-400">
                    <p>본 약관에 대해 궁금하신 점은 고객센터(070-0000-0000)로 문의해 주시기 바랍니다.</p>
                </div>
            </div>
        </div>
    );
};

export default Terms;