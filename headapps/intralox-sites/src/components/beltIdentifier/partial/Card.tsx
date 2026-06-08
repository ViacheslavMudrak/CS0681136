import { Field, ImageField, RichText } from "@sitecore-content-sdk/nextjs";
import { ImageView } from "components/shared/ImageView/ImageView";

interface CardProps {
  image: ImageField;
  title: Field<string>;
  description: Field<string>;
  hideDescription?: boolean;
}

const Card = ({
  image,
  title,
  description,
  hideDescription = false,
}: CardProps) => {
  return (
    <div className="cursor-pointer">
      <ImageView
        image={{
          value: {
            src: image.value?.src,
            alt: image.value?.alt,
            width: 372,
            height: 195,
          },
        }}
      />
      <div className="px-4 pb-6 pt-4">
        <RichText
          className="text-gray-900 group-hover:text-gray-700 text-lg font-bold leading-snug duration-150 transition-colors"
          field={title}
        />
        {!hideDescription && (
          <RichText
            className="text-gray-700 text-sm leading-snug"
            field={description}
          />
        )}
      </div>
    </div>
  );
};

export default Card;
