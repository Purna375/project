"use client";

import { useState, useEffect } from "react";

export default function Terms({ onAccept, loading }) {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    // Reset errors when inputs change
    if (signature.trim().length > 0) {
      setErrors(prev => ({ ...prev, signature: null }));
    }
    if (agreed) {
      setErrors(prev => ({ ...prev, agreed: null }));
    }
  }, [signature, agreed]);

  const canSubmit = agreed && signature.trim().length > 0 && !loading;
  
  const handleAccept = () => {
    const newErrors = {};
    
    if (!signature.trim()) {
      newErrors.signature = "Signature is required";
    }
    
    if (!agreed) {
      newErrors.agreed = "You must agree to the terms";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onAccept();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-900 rounded-md transition-colors duration-300">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Terms & Conditions
      </h2>
      
      <div className="h-40 overflow-y-auto p-3 border border-gray-300 dark:border-gray-700 rounded mb-4">
        <p className="text-gray-700 dark:text-gray-200">
          <strong>1. Project Timeline:</strong> Complete the project within the specified timeline. Extensions must be requested in writing at least 48 hours before the deadline.<br /><br />
          
          <strong>2. Intellectual Property:</strong> No plagiarism allowed. All submitted work must be original or properly credited with appropriate licenses.<br /><br />
          
          <strong>3. Documentation:</strong> Final project must include comprehensive documentation including setup instructions, architecture overview, and usage guidelines.<br /><br />
          
          <strong>4. Guidelines:</strong> Follow all provided guidelines for development standards, naming conventions, and project structure.<br /><br />
          
          <strong>5. Scope Changes:</strong> Any changes to project scope must be approved in writing before implementation.
        </p>
      </div>

      {/* Signature */}
      <div className="mt-4 mb-4">
        <label htmlFor="signature" className="block text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Student Signature
        </label>
        <input
          id="signature"
          type="text"
          placeholder="Type your signature..."
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          className={`text-3xl font-[cursive] border-b-2 ${errors.signature ? 'border-red-500' : 'border-black dark:border-white'} bg-gray-100 dark:bg-gray-800 text-black dark:text-white w-full p-2 mb-1`}
          disabled={loading}
        />
        {errors.signature && (
          <p className="text-red-500 text-sm">{errors.signature}</p>
        )}
      </div>

      {/* Agreement Checkbox */}
      <div className="flex items-start mb-4">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className={`w-5 h-5 ${errors.agreed ? 'border-red-500' : ''} accent-blue-600 dark:accent-blue-400`}
            disabled={loading}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="agree" className="text-gray-700 dark:text-gray-200">
            I have read and agree to the Terms and Conditions
          </label>
          {errors.agreed && (
            <p className="text-red-500 text-sm">{errors.agreed}</p>
          )}
        </div>
      </div>

      {/* Accept & Submit Button */}
      <button
        type="button"
        onClick={handleAccept}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md flex justify-center items-center transition-colors ${
          canSubmit
            ? "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white"
            : "bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
        }`}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="spinner mr-2"></div>
            <span>Processing...</span>
          </div>
        ) : (
          "Accept & Submit"
        )}
      </button>

      {/* Spinner style */}
      <style jsx>{`
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}