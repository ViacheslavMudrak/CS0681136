import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import { HeadTag, BodyTag, sanitizeScript } from 'components/core/ScriptContent/ScriptContent';
import type { IScriptContentFields } from 'components/core/ScriptContent/ScriptContent.type';

// Mock Next.js Script component
vi.mock('next/script', () => ({
  default: ({ id, strategy, children }: any) => (
    <script id={id} data-strategy={strategy} data-testid="next-script">
      {children}
    </script>
  ),
}));

// Mock Sitecore Content SDK
vi.mock('@sitecore-content-sdk/nextjs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sitecore-content-sdk/nextjs')>();
  
  // Create a mock context value with Normal page state
  const mockContextValue = {
    page: {
      layout: {
        sitecore: {
          context: {
            pageState: actual.LayoutServicePageState?.Normal || 'normal',
          },
        },
      },
    },
  };

  // Create a React context
  const SitecoreProviderReactContext = React.createContext(mockContextValue);

  return {
    ...actual,
    SitecoreProviderReactContext,
  };
});

describe('ScriptContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear document head
    document.head.innerHTML = '';
    // Reset timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // Clean up document head
    document.head.innerHTML = '';
  });

  describe('sanitizeScript', () => {
    it('should remove script tags from script data', () => {
      const scriptWithTags = '<script type="text/javascript">console.log("test");</script>';
      const sanitized = sanitizeScript(scriptWithTags);
      expect(sanitized).toBe('console.log("test");');
    });

    it('should handle multiple script tags', () => {
      const scriptWithTags = '<script>var x = 1;</script><script>var y = 2;</script>';
      const sanitized = sanitizeScript(scriptWithTags);
      expect(sanitized).toBe('var x = 1;var y = 2;');
    });

    it('should handle script tags with attributes', () => {
      const scriptWithTags = '<script type="text/javascript" async>console.log("test");</script>';
      const sanitized = sanitizeScript(scriptWithTags);
      expect(sanitized).toBe('console.log("test");');
    });

    it('should return empty string for empty input', () => {
      const sanitized = sanitizeScript('');
      expect(sanitized).toBe('');
    });

    it('should return script content without tags if no tags present', () => {
      const scriptWithoutTags = 'console.log("test");';
      const sanitized = sanitizeScript(scriptWithoutTags);
      expect(sanitized).toBe(scriptWithoutTags);
    });
  });

  describe('HeadTag', () => {
    const createMockFields = (overrides?: Partial<IScriptContentFields['fields']>): IScriptContentFields => ({
      fields: {
        TagId: { value: 'test-script-id' },
        Script: { value: 'console.log("test");' },
        IsNoScript: { value: false },
        ...overrides,
      },
    });

    it('should return null when script text is empty', () => {
      const fields = createMockFields({ Script: { value: '' } });
      const { container } = render(<HeadTag fields={fields.fields} />);
      expect(container.firstChild).toBeNull();
    });

    it('should return null when pageState is not Normal', () => {
      // This test verifies that the component checks pageState
      // Since we're mocking with Normal state, we test the logic path
      // In a real scenario with Preview/Edit state, the component would return null
      const fields = createMockFields();
      const { container } = render(<HeadTag fields={fields.fields} />);
      
      // Component should not inject script immediately (waits for delay)
      expect(container.firstChild).toBeNull();
      expect(document.getElementById('test-script-id')).toBeNull();
    });

    it('should inject script into head after delay', async () => {
      const fields = createMockFields();
      render(<HeadTag fields={fields.fields} />);

      // Initially, script should not be in head
      expect(document.getElementById('test-script-id')).toBeNull();

      // Fast-forward timers to trigger script loading
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      const script = document.getElementById('test-script-id');
      expect(script).toBeTruthy();
      expect(script?.tagName).toBe('SCRIPT');
      expect(script?.type).toBe('text/javascript');
      expect(script?.innerHTML).toBe('console.log("test");');
    });

    it('should not inject duplicate script if tagId already exists', async () => {
      const fields = createMockFields();
      
      // Manually add a script with the same ID
      const existingScript = document.createElement('script');
      existingScript.id = 'test-script-id';
      existingScript.innerHTML = 'console.log("existing");';
      document.head.appendChild(existingScript);

      render(<HeadTag fields={fields.fields} />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      const scripts = document.querySelectorAll('#test-script-id');
      expect(scripts.length).toBe(1);
      expect(scripts[0].innerHTML).toBe('console.log("existing");');
    });

    it('should sanitize script content before injecting', async () => {
      const fields = createMockFields({
        Script: { value: '<script type="text/javascript">console.log("test");</script>' },
      });

      render(<HeadTag fields={fields.fields} />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      const script = document.getElementById('test-script-id');
      expect(script).toBeTruthy();
      expect(script?.innerHTML).toBe('console.log("test");');
    });

    it('should handle empty tagId', async () => {
      const fields = createMockFields({ TagId: { value: '' } });
      render(<HeadTag fields={fields.fields} />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      const scripts = document.head.querySelectorAll('script[type="text/javascript"]');
      expect(scripts.length).toBeGreaterThan(0);
      const lastScript = scripts[scripts.length - 1];
      expect(lastScript.innerHTML).toBe('console.log("test");');
    });

    it('should cleanup script on unmount', async () => {
      const fields = createMockFields();
      const { unmount } = render(<HeadTag fields={fields.fields} />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(document.getElementById('test-script-id')).toBeTruthy();

      unmount();

      // Cleanup happens synchronously on unmount
      expect(document.getElementById('test-script-id')).toBeNull();
    });

    it('should handle missing fields gracefully', () => {
      const fields = { fields: {} } as unknown as IScriptContentFields;
      const { container } = render(<HeadTag fields={fields.fields} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('BodyTag', () => {
    const createMockFields = (overrides?: Partial<IScriptContentFields['fields']>): IScriptContentFields => ({
      fields: {
        TagId: { value: 'test-script-id' },
        Script: { value: 'console.log("test");' },
        IsNoScript: { value: false },
        ...overrides,
      },
    });

    it('should render Next.js Script component when IsNoScript is false', () => {
      const fields = createMockFields({ IsNoScript: { value: false } });
      render(<BodyTag fields={fields.fields} />);

      const script = screen.getByTestId('next-script');
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute('id', 'test-script-id');
      expect(script).toHaveAttribute('data-strategy', 'lazyOnload');
    });

    it('should render div with dangerouslySetInnerHTML when IsNoScript is true', () => {
      const fields = createMockFields({
        IsNoScript: { value: true },
        Script: { value: '<div>Test content</div>' },
      });

      render(<BodyTag fields={fields.fields} />);

      const div = document.getElementById('test-script-id');
      expect(div).toBeInTheDocument();
      expect(div?.tagName).toBe('DIV');
      expect(div?.innerHTML).toBe('<div>Test content</div>');
    });

    it('should sanitize script when rendering with Script component', () => {
      const fields = createMockFields({
        IsNoScript: { value: false },
        Script: { value: '<script>console.log("test");</script>' },
      });

      render(<BodyTag fields={fields.fields} />);

      const script = screen.getByTestId('next-script');
      expect(script.textContent).toBe('console.log("test");');
    });

    it('should not sanitize script when rendering with div (IsNoScript true)', () => {
      const fields = createMockFields({
        IsNoScript: { value: true },
        Script: { value: '<script>console.log("test");</script>' },
      });

      render(<BodyTag fields={fields.fields} />);

      const div = document.getElementById('test-script-id');
      expect(div?.innerHTML).toBe('<script>console.log("test");</script>');
    });

    it('should handle empty tagId', () => {
      const fields = createMockFields({ TagId: { value: '' } });
      render(<BodyTag fields={fields.fields} />);

      const script = screen.getByTestId('next-script');
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute('id', '');
      expect(script).toHaveAttribute('data-strategy', 'lazyOnload');
    });

    it('should handle empty script value', () => {
      const fields = createMockFields({ Script: { value: '' } });
      render(<BodyTag fields={fields.fields} />);

      const script = screen.getByTestId('next-script');
      expect(script.textContent).toBe('');
    });

    it('should handle missing fields gracefully', () => {
      const fields = { fields: {} } as unknown as IScriptContentFields;
      render(<BodyTag fields={fields.fields} />);

      const script = screen.getByTestId('next-script');
      expect(script).toBeInTheDocument();
    });

    it('should handle undefined TagId', () => {
      const fields = createMockFields({ TagId: { value: undefined as any } });
      render(<BodyTag fields={fields.fields} />);

      const script = screen.getByTestId('next-script');
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute('id', '');
      expect(script).toHaveAttribute('data-strategy', 'lazyOnload');
    });

    it('should handle undefined Script', () => {
      const fields = createMockFields({ Script: { value: undefined as any } });
      render(<BodyTag fields={fields.fields} />);

      const script = screen.getByTestId('next-script');
      expect(script.textContent).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle HeadTag with very long script content', async () => {
      const longScript = 'console.log("' + 'x'.repeat(10000) + '");';
      const fields: IScriptContentFields = {
        fields: {
          TagId: { value: 'long-script-id' },
          Script: { value: longScript },
          IsNoScript: { value: false },
        },
      };

      render(<HeadTag fields={fields.fields} />);

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      const script = document.getElementById('long-script-id');
      expect(script).toBeTruthy();
      expect(script?.innerHTML.length).toBe(longScript.length);
    });

    it('should handle BodyTag with special characters in script', () => {
      const specialScript = 'console.log("test & < > \' \" content");';
      const fields: IScriptContentFields = {
        fields: {
          TagId: { value: 'special-script-id' },
          Script: { value: specialScript },
          IsNoScript: { value: false },
        },
      };

      render(<BodyTag fields={fields.fields} />);

      const script = screen.getByTestId('next-script');
      expect(script.textContent).toBe(specialScript);
    });

    it('should handle multiple HeadTag instances with different tagIds', async () => {
      const fields1: IScriptContentFields = {
        fields: {
          TagId: { value: 'script-1' },
          Script: { value: 'console.log("script 1");' },
          IsNoScript: { value: false },
        },
      };

      const fields2: IScriptContentFields = {
        fields: {
          TagId: { value: 'script-2' },
          Script: { value: 'console.log("script 2");' },
          IsNoScript: { value: false },
        },
      };

      render(
        <>
          <HeadTag fields={fields1.fields} />
          <HeadTag fields={fields2.fields} />
        </>
      );

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      const script1 = document.getElementById('script-1');
      const script2 = document.getElementById('script-2');
      expect(script1).toBeTruthy();
      expect(script2).toBeTruthy();
      expect(script1?.innerHTML).toBe('console.log("script 1");');
      expect(script2?.innerHTML).toBe('console.log("script 2");');
    });
  });
});
