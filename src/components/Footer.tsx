import React, { useState } from 'react';
import { NavLink } from 'react-router-dom'; // NavLink로 변경

const Footer = () => {
    const [isRelatedOpen, setIsRelatedOpen] = useState(false);

    // 공통 스타일: 기본은 흐리게, 클릭(활성화)되면 하얗고 굵게
    const navLinkStyle = ({ isActive }) =>
        isActive
            ? "text-white font-bold underline underline-offset-4 transition-all"
            : "text-white/50 hover:text-white/80 transition-all";

    const relatedSites = [
        { name: "ooo", url: "https://www.naver.com" },
        { name: "ooo", url: "https://www.naver.com" },
        { name: "ooo", url: "https://www.naver.com" },
    ];

    return (
        <footer className="w-full py-12 md:py-16 px-6 md:px-[13.54%] bg-[#4D515A] select-none text-white/70">
            <div className="max-w-[1290px] mx-auto flex flex-col gap-10 md:pb-0">

                {/* 상단: 로고와 주요 링크 */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-white/10 pb-10">
                    <div className="flex flex-col gap-6">
                        <NavLink to="/shop/main">
                            <img src="/images/shop/index/footer_logo.png" alt="Nanum" className="h-6 md:h-7 object-contain" />
                        </NavLink>

                        {/* 클릭 시 하얗게 강조되는 메뉴들 */}
                        <div className="flex gap-5 md:gap-8 text-[13px] md:text-[14px] font-medium">
                            <NavLink to="/shop/terms" className={navLinkStyle}>
                                이용약관
                            </NavLink>
                            <NavLink to="/shop/privacy" className={navLinkStyle}>
                                개인정보처리방침
                            </NavLink>
                            <NavLink to="/shop/location" className={navLinkStyle}>
                                찾아오시는 길
                            </NavLink>
                        </div>
                    </div>

                    {/* 관련사이트 셀렉트 박스 (동일) */}
                    <div className="relative w-full md:w-[220px]">
                        <button
                            onClick={() => setIsRelatedOpen(!isRelatedOpen)}
                            className="w-full flex justify-between items-center px-4 py-2.5 border border-white/30 text-[12px] text-white outline-none hover:border-white transition-all"
                        >
                            <span>FAMILY SITE</span>
                            <span className={`transition-transform duration-300 ${isRelatedOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        <ul className={`absolute bottom-full left-0 w-full bg-[#3D4148] border border-white/10 transition-all duration-300 overflow-hidden z-[100] ${
                            isRelatedOpen ? 'max-h-[200px] opacity-100 mb-1' : 'max-h-0 opacity-0'
                        }`}>
                            {relatedSites.map((site, index) => (
                                <li key={index}>
                                    <a href={site.url} target="_blank" rel="noreferrer" className="block px-4 py-3 text-[12px] text-white/80 hover:bg-white/10 border-b border-white/5 last:border-none">
                                        {site.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 하단 정보 영역 (동일) */}
                <div className="flex flex-col md:flex-row justify-between gap-10 text-[12px] md:text-[13px] font-light leading-relaxed">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <p className="text-white font-medium">Nanum</p>
                            <p>서울특별시 금천구 가산동 OOOO</p>
                        </div>
                        <p className="mt-6 opacity-40">Copyright © Nanum. All rights reserved.</p>
                    </div>

                    <div className="flex flex-col items-start md:items-end border-t md:border-none pt-8 md:pt-0 border-white/10">
                        <p className="text-[11px] uppercase tracking-[0.2em] mb-2 opacity-50 font-medium">CS CENTER</p>
                        <p className="text-[24px] md:text-[28px] font-light text-white tracking-tighter">070-0000-0000</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;