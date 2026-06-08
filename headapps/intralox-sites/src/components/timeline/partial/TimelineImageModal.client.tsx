'use client';

import type { JSX, KeyboardEvent, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NextImage, type ImageField } from '@sitecore-content-sdk/nextjs';

import Modal from 'components/shared/Modal';

import { TIMELINE_LABELS } from '../timelineUtils';

export type TimelineImageModalContextValue = {
  openImageModal: (image: ImageField) => void;
};

const TimelineImageModalContext = createContext<TimelineImageModalContextValue | null>(null);

function useTimelineImageModal(): TimelineImageModalContextValue | null {
  return useContext(TimelineImageModalContext);
}

/**
 * Resolves an accessible name for the enlarged-image dialog from the image field or a fixed fallback.
 *
 * @param image - Active Sitecore image field shown in the modal.
 * @returns Short label suitable for `aria-label` on the modal.
 */
function resolveTimelineImageModalAriaLabel(image: ImageField | null): string {
  const alt = typeof image?.value?.alt === 'string' ? image.value.alt.trim() : '';
  if (alt) return alt;
  return TIMELINE_LABELS.imageModalAriaFallback;
}

export interface TimelineImageModalProviderProps {
  /** When true, visitors cannot open the modal (inline editing must stay clickable). */
  isEditing: boolean;
  children: ReactNode;
}

/**
 * Provides a single media-style modal for timeline event images when not in editing mode.
 *
 * @param props - Editing flag and subtree to wrap.
 * @returns Context provider plus optional modal shell.
 */
export function TimelineImageModalProvider({
  isEditing,
  children,
}: TimelineImageModalProviderProps): JSX.Element {
  const visitorModal = !isEditing;
  const [showModal, setShowModal] = useState(false);
  const [activeImage, setActiveImage] = useState<ImageField | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openImageModal = useCallback(
    (image: ImageField) => {
      if (!visitorModal) return;
      setActiveImage(image);
      setShowModal(true);
    },
    [visitorModal],
  );

  const handleModalChange = useCallback((open: boolean) => {
    setShowModal(open);
    if (!open) {
      setActiveImage(null);
    }
  }, []);

  const contextValue = useMemo<TimelineImageModalContextValue | null>(() => {
    if (!visitorModal) return null;
    return { openImageModal };
  }, [visitorModal, openImageModal]);

  const modalAriaLabel = resolveTimelineImageModalAriaLabel(activeImage);

  return (
    <TimelineImageModalContext.Provider value={contextValue}>
      {children}
      {visitorModal ?
        <Modal
          ariaLabel={modalAriaLabel}
          isOpen={showModal}
          modalSize="lg"
          onChange={handleModalChange}
          variant="media"
        >
          {mounted && showModal && activeImage != null ?
            <>
              <div className='relative box-border mx-auto h-[min(52vh,calc(100dvh-10rem))] max-h-[min(52vh,calc(100dvh-10rem))] w-full min-w-0 max-w-full overflow-hidden px-5 sm:px-8 md:hidden'>
                <NextImage
                  className="absolute inset-0 box-border m-0 block h-full w-full max-h-full max-w-full min-h-0 overflow-x-clip overflow-y-clip object-contain object-center p-0 align-middle [overflow-clip-margin:content-box]"
                  field={activeImage}
                  fill
                  sizes="(max-width: 767px) 92vw, 736px"
                />
              </div>
              <div className="box-border hidden min-w-0 w-full max-w-full md:block md:p-1">
                <div className='relative mx-auto box-border hidden h-[396px] w-[736px] max-w-full shrink-0 overflow-hidden md:block'>
                  <NextImage
                    className="absolute inset-0 box-border m-0 block h-full w-full max-h-full max-w-full min-h-0 overflow-x-clip overflow-y-clip object-contain object-center p-0 align-middle [overflow-clip-margin:content-box]"
                    field={activeImage}
                    fill
                    sizes="(max-width: 767px) 92vw, 736px"
                  />
                </div>
              </div>
            </>
          : null}
        </Modal>
      : null}
    </TimelineImageModalContext.Provider>
  );
}

export interface TimelineImageModalTriggerProps {
  image: ImageField;
  ariaLabel: string;
  isEditing: boolean;
  children: ReactNode;
  /** Optional classes merged onto the trigger root. */
  className?: string;
}

/**
 * Clickable / keyboard-activatable wrapper that opens the shared timeline image modal.
 *
 * @param props - Image field, accessible name, editing mode, optional trigger layout classes, and visual subtree.
 * @returns Trigger wrapper or inert children when editing or modal is disabled.
 */
export function TimelineImageModalTrigger({
  image,
  ariaLabel,
  isEditing,
  children,
  className,
}: TimelineImageModalTriggerProps): JSX.Element {
  const ctx = useTimelineImageModal();

  const openModal = useCallback(() => {
    if (isEditing || !ctx) return;
    ctx.openImageModal(image);
  }, [isEditing, ctx, image]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isEditing || !ctx) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ctx.openImageModal(image);
      }
    },
    [isEditing, ctx, image],
  );

  if (isEditing || !ctx) {
    return <>{children}</>;
  }

  return (
    <div
      aria-label={ariaLabel}
      className={['block w-full max-w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2', className].filter(Boolean).join(' ')}
      onClick={openModal}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
