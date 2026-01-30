import React from 'react';
import { Construction } from 'lucide-react';

export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
        <Construction className="h-12 w-12 text-blue-600 dark:text-blue-400" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">
        Este módulo está sendo implementado. Em breve você poderá gerenciar {title.toLowerCase()} aqui.
      </p>
    </div>
  );
}
