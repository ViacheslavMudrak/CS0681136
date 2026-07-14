import { ComponentWithContextProps } from 'lib/component-props';
import { ImageReferenceItem } from 'ts/image-reference';

type DetailHeroFields = {
  backgroundImage: ImageReferenceItem;
};

export type DetailHeroProps = ComponentWithContextProps & {
  fields: DetailHeroFields;
};
