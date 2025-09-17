/**
 * Error handling utilities for URL generation and sharing
 */

export interface ErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  suggestions: string[];
}

export class UrlError extends Error {
  public code: string;
  public userMessage: string;
  public suggestions: string[];

  constructor(code: string, message: string, userMessage: string, suggestions: string[] = []) {
    super(message);
    this.name = 'UrlError';
    this.code = code;
    this.userMessage = userMessage;
    this.suggestions = suggestions;
  }
}

export class ClipboardError extends Error {
  public code: string;
  public userMessage: string;
  public suggestions: string[];

  constructor(code: string, message: string, userMessage: string, suggestions: string[] = []) {
    super(message);
    this.name = 'ClipboardError';
    this.code = code;
    this.userMessage = userMessage;
    this.suggestions = suggestions;
  }
}

export class SocialShareError extends Error {
  public platform: string;
  public userMessage: string;
  public suggestions: string[];

  constructor(platform: string, message: string, userMessage: string, suggestions: string[] = []) {
    super(message);
    this.name = 'SocialShareError';
    this.platform = platform;
    this.userMessage = userMessage;
    this.suggestions = suggestions;
  }
}

/**
 * Handle URL generation errors with user-friendly messages
 */
export function handleUrlError(error: unknown): ErrorInfo {
  if (error instanceof UrlError) {
    return {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      suggestions: error.suggestions
    };
  }

  if (error instanceof Error) {
    // Handle specific error patterns
    if (error.message.includes('Invalid campaign ID')) {
      return {
        code: 'INVALID_CAMPAIGN_ID',
        message: error.message,
        userMessage: 'The campaign link cannot be generated due to an invalid campaign ID.',
        suggestions: [
          'Try refreshing the page',
          'Contact support if the issue persists'
        ]
      };
    }

    if (error.message.includes('base URL')) {
      return {
        code: 'INVALID_BASE_URL',
        message: error.message,
        userMessage: 'There is a configuration issue with the website URL.',
        suggestions: [
          'Try refreshing the page',
          'The link may still work when shared'
        ]
      };
    }
  }

  // Generic error handling
  return {
    code: 'UNKNOWN_URL_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error',
    userMessage: 'Unable to generate the campaign link.',
    suggestions: [
      'Try refreshing the page',
      'Check your internet connection',
      'Contact support if the problem continues'
    ]
  };
}

/**
 * Handle clipboard operation errors
 */
export function handleClipboardError(error: unknown): ErrorInfo {
  if (error instanceof ClipboardError) {
    return {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      suggestions: error.suggestions
    };
  }

  // Check for common clipboard error patterns
  if (error instanceof Error) {
    if (error.message.includes('permission') || error.message.includes('denied')) {
      return {
        code: 'CLIPBOARD_PERMISSION_DENIED',
        message: error.message,
        userMessage: 'Permission to access clipboard was denied.',
        suggestions: [
          'Allow clipboard access in your browser settings',
          'Select and copy the URL manually from the text field',
          'Use the social sharing buttons instead'
        ]
      };
    }

    if (error.message.includes('secure context') || error.message.includes('https')) {
      return {
        code: 'CLIPBOARD_SECURITY_ERROR',
        message: error.message,
        userMessage: 'Clipboard access requires a secure connection.',
        suggestions: [
          'Select and copy the URL manually from the text field',
          'Use the social sharing buttons instead'
        ]
      };
    }
  }

  return {
    code: 'CLIPBOARD_GENERIC_ERROR',
    message: error instanceof Error ? error.message : 'Unknown clipboard error',
    userMessage: 'Failed to copy to clipboard.',
    suggestions: [
      'Select and copy the URL manually from the text field',
      'Try using Ctrl+C (or Cmd+C on Mac) after selecting the text',
      'Use the social sharing buttons as an alternative'
    ]
  };
}

/**
 * Handle social sharing errors
 */
export function handleSocialShareError(platform: string, error: unknown): ErrorInfo {
  if (error instanceof SocialShareError) {
    return {
      code: error.platform,
      message: error.message,
      userMessage: error.userMessage,
      suggestions: error.suggestions
    };
  }

  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  return {
    code: `SOCIAL_SHARE_${platform.toUpperCase()}_ERROR`,
    message: error instanceof Error ? error.message : 'Unknown social share error',
    userMessage: `Failed to share on ${platformName}.`,
    suggestions: [
      'Check if popups are blocked in your browser',
      'Copy the link and share it manually',
      `Visit ${platformName} directly and paste the link`,
      'Try using a different browser'
    ]
  };
}

/**
 * Log errors with context for debugging
 */
export function logError(context: string, error: unknown, additionalInfo?: Record<string, any>): void {
  const errorInfo = {
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...additionalInfo
  };

  console.error(`❌ ${context}:`, errorInfo);

  // In production, you might want to send this to an error tracking service
  if (import.meta.env.PROD) {
    // Example: sendToErrorTracking(errorInfo);
  }
}