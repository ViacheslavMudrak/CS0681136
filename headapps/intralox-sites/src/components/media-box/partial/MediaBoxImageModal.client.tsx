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

import type { MediaBoxFields } from '../MediaBox.type';
import { resolveMediaBoxImageModalAriaLabel } from '../mediaBoxUtils';

export type MediaBoxImageModalContextValue = {
  openImageModal: (image: ImageField) => void;
};

const MediaBoxImageModalContext = createContext<MediaBoxImageModalContextValue | null>(null);

export function useMediaBoxImageModal(): MediaBoxImageModalContextValue | null {
  return useContext(MediaBoxImageModalContext);
}

export interface MediaBoxImageModalProviderProps {
  fields: MediaBoxFields;
  isEditing: boolean;
  modalParamActive: boolean;
  children: ReactNode;
}

export function MediaBoxImageModalProvider({
  fields,
  isEditing,
  modalParamActive,
  children,
}: MediaBoxImageModalProviderProps): JSX.Element {
  const visitorModal = modalParamActive && !isEditing;
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

  const contextValue = useMemo<MediaBoxImageModalContextValue | null>(() => {
    if (!visitorModal) return null;
    return { openImageModal };
  }, [visitorModal, openImageModal]);

  const modalAriaLabel =
    activeImage != null ?
      resolveMediaBoxImageModalAriaLabel(fields, activeImage)
    : resolveMediaBoxImageModalAriaLabel(fields, undefined);

  return (
    <MediaBoxImageModalContext.Provider value={contextValue}>
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
    </MediaBoxImageModalContext.Provider>
  );
}

export interface MediaBoxImageModalTriggerProps {
  image: ImageField;
  ariaLabel: string;
  isEditing: boolean;
  enabled: boolean;
  children: ReactNode;
}

/**
 * Click/keyboard target for the rail image; opens the shared dialog from {@link MediaBoxImageModalProvider}.
 */
export function MediaBoxImageModalTrigger({
  image,
  ariaLabel,
  isEditing,
  enabled,
  children,
}: MediaBoxImageModalTriggerProps): JSX.Element {
  const ctx = useMediaBoxImageModal();

  const openModal = useCallback(() => {
    if (!enabled || isEditing || !ctx) return;
    ctx.openImageModal(image);
  }, [enabled, isEditing, ctx, image]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || isEditing || !ctx) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ctx.openImageModal(image);
      }
    },
    [enabled, isEditing, ctx, image],
  );

  if (!enabled || isEditing || !ctx) {
    return <>{children}</>;
  }

  return (
    <div
      aria-label={ariaLabel}
      className='block w-full max-w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2'
      onClick={openModal}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
