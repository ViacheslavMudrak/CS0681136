import { ComponentRendering, Field, Page } from "@sitecore-content-sdk/nextjs";
import { IFields } from "components/linkCards/LinkCards.type";

export interface IContactDirectoryPageFields {
  page: Page;
  rendering: ComponentRendering;
}

export interface IContactDirectoryFields {
  data: IContactDirectoryDataFields;
}

export interface IContactDirectoryDataFields {
  ContactDirectoryData: {
    Countries: {
      data: IContactDirectoryCountryFields[];
    };
    EnquiryHeading: Field<string>;
    EmailLabel?: Field<string>;
    FaxLabel?: Field<string>;
    InternationalTollFreeTelephoneLabel?: Field<string>;
    TelephoneLabel?: Field<string>;
    TollFreeFaxLabel?: Field<string>;
    TollFreeTelephoneLabel?: Field<string>;
    WhatsApp?: Field<string>;
  };
}

export interface IContactDirectoryCountryFields {
  Country: {
    data: {
      Code: Field<string>;
      Name: string;
    };
  };
  CountryLink: {
    path: string;
  };
}

export interface IIndustriesFields {
  fields: {
    Telephone: Field<string>;
    Email: Field<string>;
    Fax: Field<string>;
    InternationalTollFreeTelephone: Field<string>;
    TollFreeFax: Field<string>;
    TollFreeTelephone: Field<string>;
    Industry: IIndustryFields;
  };
}

export interface IIndustryFields {
  fields: {
    Name?: Field<string>;
  };
}

export interface IRouteDirectoryFields {
  ContainerWidth: IFields;
  Industries: IIndustriesFields[];
  Email?: Field<string>;
  Fax?: Field<string>;
  InternationalTollFreeTelephone?: Field<string>;
  Telephone?: Field<string>;
  TollFreeFax?: Field<string>;
  TollFreeTelephone?: Field<string>;
  ShowWhatsApp?:Field<boolean>;
}
