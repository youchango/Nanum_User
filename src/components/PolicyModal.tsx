import React from 'react';

const PolicyModal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-[500px] max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <button onClick={onClose} className="text-2xl text-gray-400 hover:text-black">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto text-sm leading-7 text-gray-600 whitespace-pre-line">
                    {content}
                </div>
                <div className="p-4 border-t border-gray-100 text-center">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-[#343434] text-white font-bold text-sm hover:bg-black transition-all"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PolicyModal;