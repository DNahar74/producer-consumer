import React, { useState, useEffect } from 'react';
import { checkBrowserSupport, getBrowserInfo, checkDeviceCapabilities } from '../utils/browserSupport';

export const BrowserCompatibilityWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [browserSupport, setBrowserSupport] = useState(checkBrowserSupport());
  const [browserInfo, setBrowserInfo] = useState(getBrowserInfo());
  const [deviceCapabilities, setDeviceCapabilities] = useState(checkDeviceCapabilities());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed warnings
    const dismissedWarnings = localStorage.getItem('dismissedCompatibilityWarnings');
    if (dismissedWarnings) {
      setDismissed(true);
      return;
    }

    // Show warning if browser is not supported or has significant issues
    const shouldShowWarning = 
      !browserSupport.isSupported || 
      !browserInfo.isSupported || 
      browserSupport.missingFeatures.length > 0 ||
      !deviceCapabilities.hasEnoughMemory;

    setShowWarning(shouldShowWarning);
  }, [browserSupport, browserInfo, deviceCapabilities]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowWarning(false);
    // Remember user's choice
    localStorage.setItem('dismissedCompatibilityWarnings', 'true');
  };

  const handleShowDetails = () => {
    // Refresh the checks
    setBrowserSupport(checkBrowserSupport());
    setBrowserInfo(getBrowserInfo());
    setDeviceCapabilities(checkDeviceCapabilities());
  };

  if (!showWarning || dismissed) {
    return null;
  }

  const hasErrors = !browserSupport.isSupported || !browserInfo.isSupported;
  const allWarnings = [
    ...browserSupport.warnings,
    ...deviceCapabilities.warnings
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className={`h-6 w-6 ${hasErrors ? 'text-red-500' : 'text-yellow-500'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${hasErrors ? 'text-red-800' : 'text-yellow-800'}`}>
              {hasErrors ? 'Browser Compatibility Issues Detected' : 'Browser Compatibility Warnings'}
            </h3>
            
            <div className={`mt-2 text-sm ${hasErrors ? 'text-red-700' : 'text-yellow-700'}`}>
              <p className="mb-2">
                <strong>Browser:</strong> {browserInfo.name} {browserInfo.version}
                {!browserInfo.isSupported && (
                  <span className="ml-2 text-red-600 font-medium">(Not Supported)</span>
                )}
              </p>

              {browserSupport.missingFeatures.length > 0 && (
                <div className="mb-2">
                  <strong>Missing Features:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {browserSupport.missingFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {allWarnings.length > 0 && (
                <div className="mb-2">
                  <strong>Warnings:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {allWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3">
                <strong>Recommended Browsers:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Chrome 90+ (Recommended)</li>
                  <li>Firefox 88+</li>
                  <li>Safari 14+</li>
                  <li>Edge 90+</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="ml-4 flex-shrink-0 flex space-x-2">
            <button
              onClick={handleShowDetails}
              className="text-sm text-yellow-800 hover:text-yellow-900 underline focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Refresh Check
            </button>
            <button
              onClick={handleDismiss}
              className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Dismiss
            </button>
          </div>
        </div>

        {hasErrors && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              <strong>Important:</strong> Your browser may not support all features of this application. 
              For the best experience, please update your browser or switch to a supported browser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};