import React from 'react';

const AuthCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 pb-16">
      <div className="w-full max-w-4xl shadow-xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="hidden md:flex flex-col items-center justify-center bg-blue-800 text-white p-8 gap-4">
          <h1 className="text-3xl font-bold text-center">Sistema Clínico IPSCSF</h1>
          <p className="text-sm text-center opacity-80">Acceso solo para el personal autorizado</p>
        </div>
        <div className="bg-white p-8 md:p-12">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthCard;