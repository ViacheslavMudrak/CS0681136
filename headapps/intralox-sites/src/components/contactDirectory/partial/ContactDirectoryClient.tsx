"use client";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  IContactDirectoryFields,
  IContactDirectoryCountryFields,
  IIndustriesFields,
} from "../ContactDirectory.type";
import { IParams } from "src/utils/interface";
import { RichText } from "@sitecore-content-sdk/nextjs";
import { Button as ReactAriaButton } from "react-aria-components";

import {
  countryMatchesPathSlug,
  formatCountryLabelForDisplay,
  getPathSlugForCountry,
  getCountrySlugFromPathname,
  hrefForCountryName,
  stripWhiteSpace,
} from "../ContactDirectory.utils";
import DirectotyTable from "./DirectotyTable";
import { ChevronRight } from '@laitram-l-l-c/intralox-icon-library';
import { CHROME_ICON_BASE } from 'lib/chrome-icons';
import { cn } from 'lib/utils';

interface IContactDirectoryClientProps extends IParams {
  fields: IContactDirectoryFields;
  industries?: IIndustriesFields[];
  email?: string;
  fax?: string;
  internationalTollFreeTelephone?: string;
  tollFreeTelephone?: string;
  tollFreeFax?: string;
  telephone?: string;
  showWhatsApp?: boolean;
}

const ContactDirectoryClientBase = ({
  fields,
  industries = [],
  email,
  fax,
  internationalTollFreeTelephone,
  tollFreeTelephone,
  tollFreeFax,
  telephone,
  showWhatsApp,
}: IContactDirectoryClientProps): JSX.Element => {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>(
    {},
  );
  const [selectCountryLinkPathOverride, setSelectCountryLinkPathOverride] =
    useState<string | null>(null);

  const emailLabel = fields?.data?.ContactDirectoryData?.EmailLabel?.value;
  const telephoneLabel =
    fields?.data?.ContactDirectoryData?.TelephoneLabel?.value;
  const faxLabel = fields?.data?.ContactDirectoryData?.FaxLabel?.value;
  const internationalTollFreeTelephoneLabel =
    fields?.data?.ContactDirectoryData?.InternationalTollFreeTelephoneLabel
      ?.value;
  const tollFreeTelephoneLabel =
    fields?.data?.ContactDirectoryData?.TollFreeTelephoneLabel?.value;
  const tollFreeFaxLabel =
    fields?.data?.ContactDirectoryData?.TollFreeFaxLabel?.value;
  const whatsAppLabel = fields?.data?.ContactDirectoryData?.WhatsApp?.value;
  const handleAccordionItemPress = (id: string) => {
    setAccordionState((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };
  const countries = fields?.data?.ContactDirectoryData?.Countries?.data;
  const industriesWithData = useMemo(
    () => industries.filter((entry) => entry?.fields),
    [industries],
  );

  const selectedCountryLinkFromPathName = useMemo(() => {
    const slug = getCountrySlugFromPathname(pathname);
    if (slug) {
      for (const c of countries) {
        if (countryMatchesPathSlug(c, slug)) {
          return c.CountryLink.path;
        }
      }
    }
    return "";
  }, [pathname, countries]);
  const selectedCountryLinkPath =
    selectCountryLinkPathOverride ?? selectedCountryLinkFromPathName;
  useEffect(() => {
    setSelectCountryLinkPathOverride(null);
  }, []);
  const displayCountryName = useMemo(() => {
    const slug = getCountrySlugFromPathname(pathname);
    if (!slug) {
      return null;
    }
    for (const c of countries) {
      if (countryMatchesPathSlug(c, slug)) {
        return formatCountryLabelForDisplay(c?.Country?.data?.Name ?? "");
      }
    }
    const fallback = countries[0]?.Country?.data?.Name ?? "";
    return formatCountryLabelForDisplay(fallback);
  }, [pathname, countries]);

  const handleCountryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const linkPath = event.target.value;
      if (!linkPath) {
        setSelectCountryLinkPathOverride("");
        return;
      }
      const country = countries.find((c) => c.CountryLink.path === linkPath) as
        | IContactDirectoryCountryFields
        | undefined;
      if (!country) {
        return;
      }
      const segment = getPathSlugForCountry(country);
      router.push(hrefForCountryName(segment), { scroll: false });
    },
    [countries, router],
  );
  return (
    <div className="flex flex-wrap prose">
      <div className="w-full lg:w-1/2 lg:pr-10">
        <div className="form-inline">
          <select
            className="w-full md:w-auto form-select p-1.5 border border-stroke-default
            rounded-sm focus:border-stroke-input-focus focus:outline-none
            "
            value={selectedCountryLinkPath}
            onChange={handleCountryChange}
          >
            <option value="">Select your country or region</option>
            {fields?.data?.ContactDirectoryData?.Countries?.data?.map(
              (country, index) => (
                <option key={index} value={country.CountryLink.path}>
                  {formatCountryLabelForDisplay(
                    country.Country?.data?.Name ?? "",
                  )}
                </option>
              ),
            )}
          </select>
        </div>
      </div>
      <div className="mt-4 lg:mt-0 w-full lg:w-1/2 space-y-4 lg:pl-10">
        <h2 className="text-2xl font-bold">{displayCountryName}</h2>
        <div id="accordion-group" className="text-sm">
          {industriesWithData.length > 0 &&
            industriesWithData.map((item, index) => (
              <>
                <div
                  id={`contact-directory-industry-${index}`}
                  className={cn(
                    'flex justify-between py-2 pr-1',
                    index % 2 === 0 ? 'bg-surface-muted' : 'bg-surface',
                  )}
                >
                  <h3 className="font-bold leading-tight">
                    <ReactAriaButton
                      aria-expanded={
                        accordionState[`contact-directory-industry-${index}`]
                      }
                      className="relative pl-4 text-left"
                      onPress={() =>
                        handleAccordionItemPress(
                          `contact-directory-industry-${index}`,
                        )
                      }
                      aria-controls={`accordion-panel-contact-directory-industry-${index}`}
                    >
                      <ChevronRight
                        className={cn(
                          CHROME_ICON_BASE,
                          'absolute h-[11px] left-0 top-0 transform transition-all duration-150 text-font-small mt-[3px]',
                          accordionState[`contact-directory-industry-${index}`]
                            ? 'rotate-90'
                            : 'rotate-0',
                        )}
                        aria-hidden="true"
                      />
                      <span>{item.fields?.Industry?.fields?.Name?.value}</span>
                    </ReactAriaButton>
                  </h3>

                  <span className="whitespace-nowrap">
                    <a
                      href={`tel:${stripWhiteSpace(item.fields.Telephone.value)}`}
                    >
                      {stripWhiteSpace(item.fields.Telephone.value)}
                    </a>
                  </span>
                </div>
                <div
                  className={cn(
                    'bg-surface-muted border-b border-t border-stroke-default',
                    !accordionState[`contact-directory-industry-${index}`] && 'hidden',
                  )}
                  id={`accordion-panel-contact-directory-industry-${index}`}
                >
                  <div className="w-full overflow-x-auto md:overflow-visible md:w-auto pl-4 pr-1 py-4">
                    <DirectotyTable
                      emailLabel={emailLabel}
                      emailAddress={item.fields.Email?.value}
                      faxLabel={faxLabel}
                      fax={item.fields.Fax?.value}
                      internationalTollFreeTelephoneLabel={
                        internationalTollFreeTelephoneLabel
                      }
                      internationalTollFreeTelephone={
                        item.fields?.InternationalTollFreeTelephone?.value
                      }
                      tollFreeTelephoneLabel={tollFreeTelephoneLabel}
                      tollFreeTelephone={item.fields?.TollFreeTelephone?.value}
                      tollFreeFaxLabel={tollFreeFaxLabel}
                      tollFreeFax={item.fields?.TollFreeFax?.value}
                    />
                  </div>
                </div>
              </>
            ))}
        </div>
        <hr />
        <RichText field={fields?.data?.ContactDirectoryData?.EnquiryHeading} />
        <DirectotyTable
          emailLabel={emailLabel}
          emailAddress={email}
          telephoneLabel={telephoneLabel}
          telephone={telephone}
          faxLabel={faxLabel}
          fax={fax}
          internationalTollFreeTelephoneLabel={
            fields?.data?.ContactDirectoryData
              ?.InternationalTollFreeTelephoneLabel?.value
          }
          internationalTollFreeTelephone={internationalTollFreeTelephone}
          tollFreeTelephoneLabel={tollFreeTelephoneLabel}
          tollFreeTelephone={tollFreeTelephone}
          tollFreeFax={tollFreeFax}
          tollFreeFaxLabel={tollFreeFaxLabel}
          whatsAppLabel={whatsAppLabel}
          showWhatsApp={showWhatsApp}
        />
      </div>
    </div>
  );
};

export const ContactDirectoryClient = ContactDirectoryClientBase;
