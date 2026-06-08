/**
 * Determines the device type from a user agent string
 * @param userAgent - The user agent string from navigator
 * @returns Device type: 'MOBILE', 'TABLET', or 'DESKTOP'
 */
export function getDeviceType(userAgent: string): "MOBILE" | "TABLET" | "DESKTOP" {
  const ua = userAgent.toLowerCase();

  // Check for mobile devices
  const mobileRegex = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i;
  if (mobileRegex.test(ua)) {
    // Check if it's a tablet (iPad, Android tablets)
    const tabletRegex = /ipad|android(?!.*mobile)|tablet/i;
    if (tabletRegex.test(ua)) {
      return "TABLET";
    }
    return "MOBILE";
  }

  // Check for tablets
  const tabletRegex = /ipad|android(?!.*mobile)|tablet/i;
  if (tabletRegex.test(ua)) {
    return "TABLET";
  }

  // Default to desktop
  return "DESKTOP";
}

function firstVersionMatch(ua: string, pattern: RegExp): string {
  const match = ua.match(pattern);
  return match?.[1] ?? "unknown";
}

function getIosSafariVersion(ua: string): string {
  const fromVersionToken = ua.match(/version\/(\d+(?:\.\d+)?)/i);
  if (fromVersionToken?.[1]) {
    return fromVersionToken[1];
  }

  const fromOsToken = ua.match(/os (\d+)[_.](\d+)/i);
  if (fromOsToken) {
    return fromOsToken[2] ? `${fromOsToken[1]}.${fromOsToken[2]}` : fromOsToken[1];
  }

  const fromSafariBuild = ua.match(/safari\/(\d+)/i);
  if (fromSafariBuild?.[1]) {
    return fromSafariBuild[1];
  }

  return "unknown";
}

function isIosWebKitBrowser(ua: string): boolean {
  return /iphone|ipod|ipad/i.test(ua) && /applewebkit/i.test(ua);
}

/**
 * Gets browser information from a user agent string.
 * Includes mobile tokens (CriOS, FxiOS, EdgiOS, Samsung Browser, etc.) that desktop parsers miss.
 *
 * @param userAgent - The user agent string from navigator.userAgent
 * @returns Object with browser name and version
 */
export function getBrowserInfo(userAgent: string): { name: string; version: string } {
  const ua = userAgent;

  // iOS / iPadOS Chrome (token is CriOS, not Chrome/)
  if (/crios/i.test(ua)) {
    return {
      name: "Chrome",
      version: firstVersionMatch(ua, /crios\/([\d.]+)/i),
    };
  }

  // iOS Firefox
  if (/fxios/i.test(ua)) {
    return {
      name: "Firefox",
      version: firstVersionMatch(ua, /fxios\/([\d.]+)/i),
    };
  }

  // iOS Edge
  if (/edgiOS/i.test(ua)) {
    return {
      name: "Edge",
      version: firstVersionMatch(ua, /edgiOS\/([\d.]+)/i),
    };
  }

  // iOS Opera
  if (/opios/i.test(ua)) {
    return {
      name: "Opera",
      version: firstVersionMatch(ua, /opios\/([\d.]+)/i),
    };
  }

  // Samsung Internet (Android)
  if (/samsungbrowser/i.test(ua)) {
    return {
      name: "Samsung Internet",
      version: firstVersionMatch(ua, /samsungbrowser\/([\d.]+)/i),
    };
  }

  // Android Edge (EdgA) — check before generic Edg
  if (/edga/i.test(ua)) {
    return {
      name: "Edge",
      version: firstVersionMatch(ua, /edga\/([\d.]+)/i),
    };
  }

  // Edge (must check before Chrome as Edge UA contains "chrome")
  if (/edg/i.test(ua)) {
    return {
      name: "Edge",
      version: firstVersionMatch(ua, /edg\/([\d.]+)/i),
    };
  }

  // Opera (must check before Chrome as Opera UA contains "chrome")
  if (/opr|opera/i.test(ua)) {
    return {
      name: "Opera",
      version: firstVersionMatch(ua, /(?:opr|opera)\/([\d.]+)/i),
    };
  }

  // Chrome (desktop + Android; Chrome UA contains "safari")
  if (/chrome|chromium/i.test(ua) && !/edg|opr|crios|fxios|edgiOS|opios/i.test(ua)) {
    return {
      name: "Chrome",
      version: firstVersionMatch(ua, /(?:chrome|chromium)\/([\d.]+)/i),
    };
  }

  // Firefox (desktop + Android)
  if (/firefox/i.test(ua)) {
    return {
      name: "Firefox",
      version: firstVersionMatch(ua, /firefox\/([\d.]+)/i),
    };
  }

  // Safari (must check after Chrome; includes iOS WebViews with no Version/ token)
  const isSafariLike =
    (/safari/i.test(ua) && !/chrome|chromium|crios|fxios|edgiOS|opios|opr|edg/i.test(ua)) ||
    (isIosWebKitBrowser(ua) &&
      !/crios|fxios|edgiOS|opios|chrome|chromium|opr|edg|fbav|instagram|gsa\//i.test(ua));

  if (isSafariLike) {
    return {
      name: "Safari",
      version: getIosSafariVersion(ua),
    };
  }

  // Internet Explorer
  if (/msie|trident/i.test(ua)) {
    return {
      name: "Internet Explorer",
      version: firstVersionMatch(ua, /(?:msie |rv:)([\d.]+)/i),
    };
  }

  // In-app browsers (Facebook, Instagram, LinkedIn, etc.)
  if (/fbav|fban|instagram|linkedinapp|twitter/i.test(ua)) {
    return {
      name: "In-App Browser",
      version: "unknown",
    };
  }

  return {
    name: "Unknown",
    version: "unknown",
  };
}
export const isIOSWebKit = (userAgent?: string): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }
  const ua = (userAgent ?? navigator.userAgent).toLowerCase();
  if (/iphone|ipod|ipad/i.test(ua)) {
    return true;
  }
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
};
