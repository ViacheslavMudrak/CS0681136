import React from "react";

import { TEST_CASE_DATA_IDS } from "src/helpers/enums";
import { IParams } from "src/helpers/interface";
import type {
  IFeaturedContentFields,
  IFeaturedContentLobbyExperienceFields,
} from "./FeaturedContent.type";
import { FeaturedContentDefaultVariant } from "./variants/FeaturedContentDefault.variant";
import { FeaturedContentLobbyExperienceVariant } from "./variants/FeaturedContentLobbyExperience.variant";
import { FeaturedContentNoCardVariant } from "./variants/FeaturedContentNoCard.variant";

interface IFeaturedContentProps extends IParams {
  fields: IFeaturedContentFields;
  params: IParams;
}

interface IFeaturedContentLobbyExperienceFieldsProps extends IParams {
  fields: IFeaturedContentLobbyExperienceFields;
  params: IParams;
}
const DefaultBase = ({ fields, params }: IFeaturedContentProps): React.ReactElement => {
  return (
    <FeaturedContentDefaultVariant
      testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT}
      fields={fields}
      params={params}
    />
  );
};

const Default = React.memo(DefaultBase);
export default Default;

const NoCardBase = ({ fields, params }: IFeaturedContentProps): React.ReactElement => {
  return (
    <FeaturedContentNoCardVariant
      testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT}
      fields={fields}
      params={params}
    />
  );
};

const NoCard = React.memo(NoCardBase);
export { NoCard };

const LobbyExperienceBase = ({
  fields,
  params,
}: IFeaturedContentLobbyExperienceFieldsProps): React.ReactElement => {
  return (
    <FeaturedContentLobbyExperienceVariant
      testId={TEST_CASE_DATA_IDS.FEATURED_CONTENT}
      fields={fields}
      params={params}
    />
  );
};

const LobbyExperience = React.memo(LobbyExperienceBase);
export { LobbyExperience };
