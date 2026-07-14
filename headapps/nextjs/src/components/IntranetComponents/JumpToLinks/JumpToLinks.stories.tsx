import type { Meta, StoryObj } from '@storybook/react';
import { ReactElement, useEffect } from 'react';
import JumpToLinks from './JumpToLinks';
import { JumpToLinksProps } from './JumpToLinks.types';

const meta: Meta<typeof JumpToLinks> = {
  title: 'Components/Jump To Links',
  component: JumpToLinks,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<JumpToLinksProps>;

// ---------- MOCK DATA ----------
const mockJumpLinks = [
  { id: 'intro', icon: 'Home' },
  { id: 'services', icon: 'Build' },
  { id: 'team', icon: 'Groups' },
  { id: 'contact', icon: 'Email' },
  { id: 'intro', icon: 'Home' },
  { id: 'services', icon: 'Build' },
  { id: 'team', icon: 'Groups' },
  { id: 'contact', icon: 'Email' },
];

// ---------- DECORATORS ----------
/**
 * Decorator that adds mock jumplink elements to the DOM
 * This simulates components that have been enhanced with withJumplink()
 */
const withMockJumplinks = (jumplinks: typeof mockJumpLinks) => {
  const Decorator = (Story: () => ReactElement) => {
    // Add elements synchronously before component renders
    if (typeof document !== 'undefined') {
      // Clean up any existing mock elements first
      jumplinks.forEach((link) => {
        const existing = document.getElementById(link.id);
        if (existing && existing.getAttribute('data-jumplink') === 'true') {
          existing.remove();
        }
      });

      // Create mock section elements with data-jumplink attributes
      // These match the exact attributes from the withJumplink enhancer
      jumplinks.forEach((link) => {
        const section = document.createElement('section');
        section.id = link.id;
        section.className = 'overflow-hidden';
        section.setAttribute('data-jumplink', 'true');
        section.setAttribute('data-jump-icon', link.icon);
        section.style.minHeight = '400px';
        section.style.padding = '2rem';
        section.style.marginBottom = '2rem';
        section.style.backgroundColor = '#f5f5f5';
        section.style.border = '1px solid #ddd';
        section.style.borderRadius = '8px';
        section.innerHTML = `
        <h2 style="margin-top: 0;">Section: ${link.id}</h2>
        <p>This is a mock section with id="${link.id}" and icon="${link.icon}".</p>
        <p>Click the jumplink icon above to scroll to this section.</p>
      `;
        document.body.appendChild(section);
      });
    }

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (typeof document !== 'undefined') {
          jumplinks.forEach((link) => {
            const element = document.getElementById(link.id);
            if (element && element.getAttribute('data-jumplink') === 'true' && element.parentNode) {
              element.parentNode.removeChild(element);
            }
          });
        }
      };
    }, []);

    return (
      <div>
        <Story />
        {/* Add visual spacing and note */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
          }}
        >
          <p style={{ margin: 0, fontSize: '14px', color: '#1976d2' }}>
            <strong>Note:</strong> Mock jumplink sections are added below. Scroll down to see them,
            or click the icons above to jump to them.
          </p>
        </div>
      </div>
    );
  };
  Decorator.displayName = 'withMockJumplinks';
  return Decorator;
};

// ---------- STORIES ----------
export const Default: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'JumpToLinks',
      dataSource: 'mock-datasource',
      params: {
        RenderingIdentifier: 'jump-to-links-component',
      },
      placeholders: {},
      fields: {},
    },
    params: {},
    fields: {},
  } as unknown as JumpToLinksProps,
  decorators: [withMockJumplinks(mockJumpLinks)],
};

export const WithManyLinks: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'JumpToLinks',
      dataSource: 'mock-datasource',
      params: {
        RenderingIdentifier: 'jump-to-links-component-many',
      },
      placeholders: {},
      fields: {},
    },
    params: {},
    fields: {},
  } as unknown as JumpToLinksProps,
  decorators: [
    withMockJumplinks([
      { id: 'section-1', icon: 'Home' },
      { id: 'section-2', icon: 'Build' },
      { id: 'section-3', icon: 'Groups' },
      { id: 'section-4', icon: 'Email' },
      { id: 'section-5', icon: 'Info' },
      { id: 'section-6', icon: 'Settings' },
      { id: 'section-7', icon: 'Help' },
      { id: 'section-8', icon: 'Star' },
    ]),
  ],
};

export const NoJumplinks: Story = {
  args: {
    rendering: {
      uid: 'mock-uid',
      componentName: 'JumpToLinks',
      dataSource: 'mock-datasource',
      params: {
        RenderingIdentifier: 'jump-to-links-component-empty',
      },
      placeholders: {},
      fields: {},
    },
    params: {},
    fields: {},
  } as unknown as JumpToLinksProps,
  decorators: [withMockJumplinks([])],
};
