import { Field, ImageField, LinkField } from "@sitecore-content-sdk/nextjs";
import { IFields } from "src/utils/interface";

export interface IBeltFields {
  BeltComponents: { value: IBeltCommonFields[] };
  BeltTools: { value: IBeltCommonFields[] };
  Downloads: { value: IDownloadFields[] };
  ViewAllAccessoriesLink: Field<string>;
  ViewAllSprocketsLink: Field<string>;
  ViewAllToolsLink: Field<string>;
}

export interface IBeltCommonFields {
  ImageUrl?: string;
  Component?: string;
  Link?: string;
  Series?: string;
  Title?: string;
}
export interface IDownloadFields {
  DocumentName?: string;
  DocumentType?: string;
  FileSize?: string;
  FileType?: string;
  Link?: string;
}
export interface IBeltPageFields {
  ContainerWidth: IFields;
  Title: Field<string>;
  Images: ImageProps[];
  ModularPlasticBeltSpecifications: IModularPlasticBeltSpecificationsFields;
  BeltData: IBeltDataFields;
  QuickLinkItem: IQuickLinkItemFields;
  ProductSpecificationMarkup: Field<string>;
  DefaultImage?: ImageField;
  Files: IFileFields[];
  Content: Field<string>;
}
export interface IFileFields {
  id?: string;
  fields: {
    File: LinkField;
    FileType: IFields;
  };
}
export interface IBeltDataFields {
  fields: {
    BeltDataMarkup: Field<string>;
    Footnotes: Field<string>;
  };
}

export interface ImageProps {
  fields: {
    Image: ImageField;
  };
}
export interface IQuickLinkItemFields {
  fields: {
    CloseButtonText: Field<string>;
    CopyButtonText: Field<string>;
    ModalTitle: Field<string>;
    RequestQuoteLink: LinkField;
    ShareLink: LinkField;
  };
}
export interface IModularPlasticBeltSpecificationsFields {
  fields: {
    DriveToothPitchInches: Field<string>;
    DriveToothPitchMM: Field<string>;
    ExternalReference: Field<string>;
    FootNotes: Field<string>;
    HingeStyle: Field<string>;
    LastUpdated: Field<string>;
    MaximumOpeningSizeIN: Field<string>;
    MaximumOpeningSizeMM: Field<string>;
    MinimumOpeningSizeIN: Field<string>;
    MinimumOpeningSizeMM: Field<string>;
    MinimumOpenArea: Field<string>;
    MinimumWidthIN: Field<string>;
    MinimumWidthMM: Field<string>;
    OpenArea: Field<string>;
    OpeningSizeIN: Field<string>;
    OpeningSizeMM: Field<string>;
    PitchIN: Field<string>;
    PitchMM: Field<string>;
    Profile: Field<string>;
    ProfileName: Field<string>;
    ProductContactArea: Field<string>;
    ProductNotes: Field<string>;
    ProductSpecificationsMarkup: Field<string>;
    Publication: Field<string>;
    RodRetentionRodType: Field<string>;
    RollerDiameterIN: Field<string>;
    RollerDiameterMM: Field<string>;
    RollerLengthIN: Field<string>;
    RollerLengthMM: Field<string>;
    RowtoRowAngle: Field<string>;
    SlotSizeLinearMM: Field<string>;
    SlotSizeLlinearIN: Field<string>;
    SlotSizeTransverseIN: Field<string>;
    SlotSizeTransverseMM: Field<string>;
    WidthIncrementsIN: Field<string>;
    WidthIncrementsMM: Field<string>;
  };
}
