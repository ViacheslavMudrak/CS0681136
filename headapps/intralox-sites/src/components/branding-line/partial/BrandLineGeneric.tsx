import { NextImage } from "@sitecore-content-sdk/nextjs";
import { IBrandLineFields } from "../BrandingLine.type";
import type { IParams } from "src/utils/interface";
import { renderingAnchorIdProps } from "src/utils/renderingAnchorProps";
import { cn } from "lib/utils";

interface BrandingLineGenericProps extends IParams {
  fields: IBrandLineFields;
  isSlant?: boolean;
}
const BrandingLineGenericBase = ({
  fields,
  params,
  isSlant = false,
}: BrandingLineGenericProps) => {
  const imageValue = fields.BrandingLineImage?.value;
  const src = imageValue?.src;
  const isSvg = src ? /\.svg($|\?)/i.test(src) : false;
  const width = Number(imageValue?.width) || 1200;
  const aspectRatio = isSlant ? 0.078 : 0.1;
  const height =
    Number(imageValue?.height) || Math.max(1, Math.round(width * aspectRatio));

  return (
    <div
      className="w-full max-w-full"
      {...renderingAnchorIdProps(params?.RenderingIdentifier)}
    >
      <NextImage
        field={fields.BrandingLineImage}
        width={width}
        height={height}
        sizes="100vw"
        unoptimized={isSvg}
        className={cn(
          "w-full h-auto",
          isSlant ? "aspect-[1/0.095]" : "aspect-[1/0.1]",
        )}
      />
    </div>
  );
};

export const BrandingLineGeneric = BrandingLineGenericBase;
