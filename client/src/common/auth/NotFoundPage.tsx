import React from 'react';
import { Link } from 'react-router-dom';
import { useI18nContext } from '../../hooks/useI18nContext';

const NotFoundPage = () => {
  const language = useI18nContext();
  const lang = language.of("ErrorSection");
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">
          {lang("page-not-found")}
        </h2>
        <p className="text-gray-500 mb-8">
          {lang("page-not-found-desc")}
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {lang("back-home")}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
