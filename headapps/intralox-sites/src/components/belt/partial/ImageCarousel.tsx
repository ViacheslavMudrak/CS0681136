"use client";
import { ImageProps } from "../Belt.type";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Thumbs } from "swiper/modules";
import { ImageView } from "components/shared/ImageView/ImageView";
import "swiper/swiper-bundle.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { ICON_ZOOM_IN } from "lib/chrome-icons";
import Modal from "components/shared/Modal";
import { ImageField, NextImage } from "@sitecore-content-sdk/nextjs";
import { cn } from "lib/utils";

interface ImageCarouselProps {
  imagesList: ImageProps[];
  defaultImage?: ImageField;
}

const ImageCarousel = ({ imagesList, defaultImage }: ImageCarouselProps) => {
  const [pageThumbsSwiper, setPageThumbsSwiper] = useState<SwiperType | null>(
    null,
  );
  const [modalThumbsSwiper, setModalThumbsSwiper] = useState<SwiperType | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageActiveSlide, setPageActiveSlide] = useState(0);
  const [modalStartSlide, setModalStartSlide] = useState(0);
  useState(true);
  const modalMainSwiperRef = useRef<SwiperType | null>(null);

  const setModalSlidePosition = (swiper: SwiperType, slideIndex: number) => {
    if (imagesList.length <= 1) {
      swiper.slideTo(0, 0);
      return;
    }

    if (swiper.params.loop) {
      swiper.slideToLoop(slideIndex, 0);
      return;
    }

    swiper.slideTo(slideIndex, 0);
  };

  useEffect(() => {
    if (!isModalOpen || !modalMainSwiperRef.current) return;
    setModalSlidePosition(modalMainSwiperRef.current, modalStartSlide);
  }, [isModalOpen, modalStartSlide, imagesList.length]);

  const handleOpenModal = () => {
    setModalStartSlide(pageActiveSlide);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalThumbsSwiper(null);
    modalMainSwiperRef.current = null;
  };

  const pageMainSlides = useMemo(
    () =>
      imagesList.map((image, index) => (
        <SwiperSlide key={`page-main-${index}`} className="!h-auto">
          {image?.fields?.Image?.value?.filetype === "svg" ? (
            <div className="w-fuul !h-full aspect-[3/2] bg-surface">
              <img
                src={image.fields.Image?.value?.src}
                className="w-full h-full"
              />
            </div>
          ) : (
            <ImageView
              image={
                image.fields.Image?.value?.src
                  ? image.fields.Image
                  : (defaultImage as ImageField)
              }
              className="!h-full aspect-[3/2]"
              imageClass={`relative ${imagesList.length > 1 ? "" : "!object-contain"}`}
              objectFit="cover"
            />
          )}
        </SwiperSlide>
      )),
    [imagesList, defaultImage],
  );

  const pageThumbSlides = useMemo(
    () =>
      imagesList.map((image, index) => (
        <SwiperSlide
          key={`page-thumb-${index}`}
          className=" rounded-xl !w-30 overflow-hidden cursor-pointer border"
        >
          <div className="w-full aspect-3/2 overflow-hidden relative">
            {image?.fields?.Image?.value?.filetype === "svg" ? (
              <div className="hover:scale-110 transition-all h-full">
                <img
                  src={image.fields.Image?.value?.src}
                  className="w-full h-full relative object-cover"
                />
              </div>
            ) : (
              <ImageView
                image={
                  image.fields.Image?.value?.src
                    ? image.fields.Image
                    : (defaultImage as ImageField)
                }
                objectFit="cover"
                imageClass="relative"
                className="hover:scale-110 transition-all h-full"
              />
            )}
          </div>
        </SwiperSlide>
      )),
    [imagesList, defaultImage],
  );

  return (
    <>
      <div className="w-full h-full relative bg-surface-muted">
        {imagesList.length > 0 && (
          <button
            type="button"
            className="flex justify-center items-center absolute z-10 bg-bg-basic-color left-2 w-8 h-8 transition-all hover:bg-bg-light-gray-active border border-stroke-default rounded-full cursor-pointer bottom-2"
            onClick={handleOpenModal}
            aria-label="Open image gallery"
          >
            <span className="text-ink-primary inline-flex">{ICON_ZOOM_IN}</span>
          </button>
        )}
        <Swiper
          slidesPerView={1}
          thumbs={{ swiper: pageThumbsSwiper }}
          modules={[EffectFade, Thumbs]}
          loop={true}
          grabCursor={true}
          className={cn(
            "w-full h-full",
            imagesList.length > 1 ? "hover:cursor-grab" : "",
          )}
          effect="fade"
          onSlideChange={(swiper) => setPageActiveSlide(swiper.realIndex)}
        >
          {pageMainSlides}
        </Swiper>
      </div>
      {imagesList.length > 1 && (
        <div className="mt-4">
          <Swiper
            onSwiper={setPageThumbsSwiper}
            slidesPerView="auto"
            spaceBetween={16}
            modules={[Thumbs]}
            loop={false}
            watchSlidesProgress={true}
            className="!p-[2px] [&_.swiper-slide-thumb-active]:outline-2 [&_.swiper-slide-thumb-active]:outline-action-focus"
          >
            {pageThumbSlides}
          </Swiper>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        modalSize="xl"
        autoFocusCloseButton={false}
      >
        <div className="">
          <div className="w-full h-full relative bg-surface-muted">
            <Swiper
              slidesPerView={1}
              onSwiper={(swiper) => {
                modalMainSwiperRef.current = swiper;
                setModalSlidePosition(swiper, modalStartSlide);
              }}
              thumbs={{
                swiper:
                  modalThumbsSwiper && !modalThumbsSwiper.destroyed
                    ? modalThumbsSwiper
                    : null,
              }}
              modules={[EffectFade, Thumbs]}
              loop={true}
              grabCursor={true}
              className={cn(
                "w-full h-full",
                imagesList.length > 1 ? "hover:cursor-grab" : "",
              )}
              effect="fade"
            >
              {pageMainSlides}
            </Swiper>
          </div>
          {imagesList.length > 1 && (
            <div className="mt-4">
              <Swiper
                onSwiper={setModalThumbsSwiper}
                slidesPerView="auto"
                spaceBetween={16}
                modules={[Thumbs]}
                loop={false}
                slideToClickedSlide={true}
                watchSlidesProgress={true}
                className="!p-[2px] [&_.swiper-slide-thumb-active]:outline-2 [&_.swiper-slide-thumb-active]:outline-action-focus"
              >
                {pageThumbSlides}
              </Swiper>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ImageCarousel;
