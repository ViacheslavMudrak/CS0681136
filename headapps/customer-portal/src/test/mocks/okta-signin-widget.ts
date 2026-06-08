/**
 * Mock for @okta/okta-signin-widget
 */

export class MockOktaSignIn {
  private el: HTMLElement | null = null;
  private successCallback: ((res: any) => void) | null = null;
  private errorCallback: ((err: Error) => void) | null = null;

  constructor(config: any) {
    // Store config for testing
    this.config = config;
  }

  config: any;

  renderEl(options: { el: HTMLElement }, success?: (res: any) => void, error?: (err: Error) => void) {
    this.el = options.el;
    this.successCallback = success || null;
    this.errorCallback = error || null;
    
    // Simulate widget rendering
    if (this.el) {
      this.el.innerHTML = '<div class="okta-widget-mock">Okta Widget Mock</div>';
    }
    
    return Promise.resolve();
  }

  showSignUp() {
    // Mock implementation
  }

  showForgotPassword() {
    // Mock implementation
  }

  remove() {
    if (this.el) {
      this.el.innerHTML = '';
    }
    this.el = null;
    this.successCallback = null;
    this.errorCallback = null;
  }

  // Test helpers
  triggerSuccess(response: any = { status: 'SUCCESS' }) {
    if (this.successCallback) {
      this.successCallback(response);
    }
  }

  triggerError(error: Error) {
    if (this.errorCallback) {
      this.errorCallback(error);
    }
  }
}

export default MockOktaSignIn;

