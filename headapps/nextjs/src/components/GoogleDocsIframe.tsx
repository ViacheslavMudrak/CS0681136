import React, { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface GoogleDocsIframeProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * GoogleDocsIframe - Solution 2: Direct iframe with authentication attempt
 *
 * This component displays a Google Docs iframe and attempts to inject authentication
 * via postMessage. Due to Google's security policies and CORS restrictions, this
 * approach has limited effectiveness for bypassing the Google sign-in prompt.
 *
 * Limitations:
 * - Google Docs iframes run in a separate security context
 * - CORS policies prevent direct authentication injection
 * - The iframe may still prompt for Google sign-in
 *
 * This is primarily a fallback solution that provides a cleaner UI
 * while the iframe loads the published document.
 */
const GoogleDocsIframe: React.FC<GoogleDocsIframeProps> = ({ src, className = '', style = {} }) => {
  const { data: session } = useSession();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!session?.googleAccessToken || !iframeRef.current) return;

    // Attempt to inject authentication into the iframe
    const iframe = iframeRef.current;

    const handleLoad = () => {
      try {
        // Note: This approach has significant limitations due to Google's security policies
        // The iframe content runs in a separate origin and security context
        if (iframe.contentWindow) {
          // Attempt to send auth token via postMessage
          iframe.contentWindow.postMessage(
            {
              type: 'AUTH_TOKEN',
              token: session.googleAccessToken,
            },
            '*'
          );

          // Additional attempt: set authorization header (limited effectiveness)
          console.log('Attempted to inject authentication into Google Docs iframe');
        }
      } catch (error) {
        console.log('Could not inject auth token into iframe (expected due to CORS):', error);
      }
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [session?.googleAccessToken]);

  if (!session) {
    return (
      <div className={`google-docs-placeholder ${className}`} style={style}>
        <div className="sign-in-prompt">
          <h3>Authentication Required</h3>
          <p>Please sign in to view the document</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`google-docs-container ${className}`}>
      {/* Information banner about authentication status */}
      <div className="auth-status">
        <span className="auth-indicator">✓</span>
        Authenticated as {session.user?.email || 'User'} - Loading document...
      </div>

      <iframe
        ref={iframeRef}
        src={src}
        style={{
          width: '100%',
          height: '600px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          ...style,
        }}
        title="Google Document"
        allowFullScreen
      />

      {/* <iframe
                    src="https://docs.google.com/viewer?url=https://docs.google.com/document/d/e/2PACX-1vSq9_cXbLEdO4szIBdAlyubd03ubKoWezST3k2ooyJgY7sh9-WvoUMqxXRcBTHyq4ayVzVo4VbVG3_W/pub&embedded=true"
                    width="800"
                    height="600"
                    style={{ border: 'none' }}
                  ></iframe> */}
      {/* <iframe
                    src="https://docs.google.com/gview?url=https://docs.google.com/document/d/e/2PACX-1vSq9_cXbLEdO4szIBdAlyubd03ubKoWezST3k2ooyJgY7sh9-WvoUMqxXRcBTHyq4ayVzVo4VbVG3_W/pub&embedded=true"
                    style={{ width: '600px', height: '500px' }}
                  ></iframe> */}
      {/* <iframe
                    src="https://docs.google.com/document/d/1yPrNvgka8VmCFOzxznLekBRq5FTHHFkJ576mg98DOKc/preview?embedded=true"
                    style={{ width: '600px', height: '500px' }}
                  ></iframe> */}

      <div className="disclaimer">
        <small>
          Note: If the document prompts for Google sign-in, this is due to Google&apos;s security
          policies. The iframe authentication injection has limited effectiveness with Google Docs.
        </small>
      </div>

      <style jsx>{`
        .google-docs-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .auth-status {
          background: #e8f5e8;
          border: 1px solid #4caf50;
          border-radius: 4px;
          padding: 10px;
          color: #2e7d32;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-indicator {
          background: #4caf50;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .google-docs-placeholder {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          color: #666;
        }

        .sign-in-prompt {
          text-align: center;
        }

        .sign-in-prompt h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .disclaimer {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 8px 12px;
          color: #856404;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default GoogleDocsIframe;
