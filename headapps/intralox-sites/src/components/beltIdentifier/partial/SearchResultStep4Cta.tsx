import { RichText } from "@sitecore-content-sdk/nextjs";

import LinkView from "components/callToAction/partial/LinkVIew";
import { I18N } from "lib/dictionary-keys";
import { useTranslations } from "next-intl";

interface SearchResultStep4CtaProps {
  step4MessageTemplate?: string;
  seriesCount: number;
  step4ItemLink: string;
  buttonText: string;
}

const SearchResultStep4Cta = ({
  step4MessageTemplate,
  seriesCount,
  step4ItemLink,
  buttonText,
}: SearchResultStep4CtaProps) => {
  const t = useTranslations();
  return (
    <>
      <RichText
        className="text-ink-primary prose"
        field={{
          value: (step4MessageTemplate || "").replaceAll(
            "{{SERIES_COUNT}}",
            String(seriesCount),
          ),
        }}
      />
      <LinkView
        className="mt-4"
        buttonType="pill"
        iconPosition="After Label"
        icon="fa-solid fa-chevron-right"
        iconClassName="size-4 text-sm !inline-flex items-center justify-center mt-[2px]"
        link={{
          value: {
            href: step4ItemLink,
          },
        }}
      >
        {buttonText.replace("{{SERIES_COUNT}}", String(seriesCount))}
      </LinkView>
    </>
  );
};

export default SearchResultStep4Cta;
