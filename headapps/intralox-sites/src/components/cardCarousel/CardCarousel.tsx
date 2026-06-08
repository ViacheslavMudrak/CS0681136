import { JSX } from "react";
import { IParams } from "src/utils/interface";
import { ICardCarouselFields } from "./CardCarousel.type";
import { Section } from "components/shared/section/Section";
import { CardCarouselClient } from "./partial/CardCarouselClient";

interface ICardCarouselProps extends IParams {
  fields: ICardCarouselFields;
}

const DefaultBase = ({ fields, params }: ICardCarouselProps): JSX.Element => {
  return (
    <Section
      className="card-carousel mt-12"
      removeBottomPadding
      removeTopPadding
    >
      <CardCarouselClient fields={fields} />
    </Section>
  );
};

export const Default = DefaultBase;
