"use client";

import {
  stripWhiteSpace,
} from "../ContactDirectory.utils";
import WhatsAppButton from "./WhatsAppButton";
import { DirectoryTableLink, DirectoryTableRow } from "./DirectoryTablePartials";

interface IDirectotyTableProps {
  emailLabel?: string;
  emailAddress?: string;
  telephoneLabel?: string;
  telephone?: string;
  faxLabel?: string;
  fax?: string;
  internationalTollFreeTelephoneLabel?: string;
  internationalTollFreeTelephone?: string;
  tollFreeTelephoneLabel?: string;
  tollFreeTelephone?: string;
  tollFreeFaxLabel?: string;
  tollFreeFax?: string;
  whatsAppLabel?: string;
  showWhatsApp?:boolean;
}

const DirectotyTable = ({
  emailLabel,
  emailAddress,
  telephoneLabel,
  telephone,
  faxLabel,
  fax,
  internationalTollFreeTelephoneLabel,
  internationalTollFreeTelephone,
  tollFreeTelephoneLabel,
  tollFreeTelephone,
  tollFreeFaxLabel,
  tollFreeFax,
  whatsAppLabel,
  showWhatsApp,
}: IDirectotyTableProps) => {
  return (
    <div className="w-full text-sm">
      {internationalTollFreeTelephone && (
        <DirectoryTableRow label={internationalTollFreeTelephoneLabel}>
          <DirectoryTableLink href={`tel:${stripWhiteSpace(internationalTollFreeTelephone)}`}>
            {internationalTollFreeTelephone}
          </DirectoryTableLink>
        </DirectoryTableRow>
      )}

      {tollFreeTelephone && (
        <DirectoryTableRow label={tollFreeTelephoneLabel}>
          <DirectoryTableLink href={`tel:${stripWhiteSpace(tollFreeTelephone)}`}>
            {stripWhiteSpace(tollFreeTelephone)}
          </DirectoryTableLink>
        </DirectoryTableRow>
      )}

      {telephone && (
        <DirectoryTableRow label={telephoneLabel}>
          <DirectoryTableLink href={`tel:${stripWhiteSpace(telephone)}`}>
            {stripWhiteSpace(telephone)}
          </DirectoryTableLink>
        </DirectoryTableRow>
      )}

      {fax && (
        <DirectoryTableRow label={faxLabel}>
          {stripWhiteSpace(fax)}
        </DirectoryTableRow>
      )}

      {tollFreeFax && (
        <DirectoryTableRow label={tollFreeFaxLabel}>
          {stripWhiteSpace(tollFreeFax)}
        </DirectoryTableRow>
      )}

      {emailAddress && (
        <DirectoryTableRow label={emailLabel}>
          <DirectoryTableLink href={`mailto:${emailAddress}`}>
            {emailAddress}
          </DirectoryTableLink>
        </DirectoryTableRow>
      )}

      {showWhatsApp && (
        <DirectoryTableRow label={whatsAppLabel}>
          <WhatsAppButton />
        </DirectoryTableRow>
      )}
    </div>
  );
};

export default DirectotyTable;