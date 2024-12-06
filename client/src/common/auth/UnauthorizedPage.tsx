import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSecurity } from 'react-icons/md';
import { AiOutlineHome } from 'react-icons/ai';
import { IoArrowBack } from 'react-icons/io5';
import { useI18nContext } from '../../hooks/useI18nContext';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const language = useI18nContext();
  const lang = language.of("ErrorSection");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <MdSecurity className="w-16 h-16 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {lang("access-denied")}
        </h1>

        <p className="text-gray-600 mb-8">
          {lang("access-denied-desc")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <AiOutlineHome className="w-4 h-4" />
            {lang("home")}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <IoArrowBack className="w-4 h-4" />
            {lang("back")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
