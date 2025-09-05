// src/components/candidate/LinkDeactivated.jsx
import React from "react";
import { AlertCircle } from "lucide-react";

const LinkDeactivated = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 text-center">
    <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={32} className="text-gray-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Test Link Deactivated</h1>
      <p className="text-gray-600">
        This interview link was deactivated due to a security violation (tab switch).  
        You can no longer access this assessment.
      </p>
    </div>
  </div>
);

export default LinkDeactivated;
