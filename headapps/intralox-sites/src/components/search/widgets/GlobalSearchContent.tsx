import LinkView from "components/callToAction/partial/LinkVIew";
import { ISearchResultArticle } from "../SearchComponent.type";
import { RichText } from "@sitecore-content-sdk/nextjs";
import { Download } from "@laitram-l-l-c/intralox-icon-library";
import { ArticleType } from "src/utils/enum";

interface ISearchContentProps {
  articles: ISearchResultArticle[];
  onItemClick: (value?: any | undefined) => void;
  searchText?: string;
}

const DOCUMENT_TYPE = "application/pdf";
const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getSearchTokenPatterns = (token: string) => {
  const trimmedToken = token.trim();
  if (!trimmedToken) {
    return [];
  }

  const patterns = new Set<string>([`\\b${escapeRegex(trimmedToken)}\\b`]);

  // Match word-start prefixes like "Serie" -> "<strong>Serie</strong>s"
  if (trimmedToken.length >= 3) {
    patterns.add(`\\b${escapeRegex(trimmedToken)}`);
  }

  // Match Algolia-like prefix highlight: flexible -> <strong>flexibil</strong>ity
  if (trimmedToken.length >= 6 && /ble$/i.test(trimmedToken)) {
    patterns.add(`\\b${escapeRegex(trimmedToken.slice(0, -2))}`);
  }

  return [...patterns];
};

const highlightMatchedTerm = (value?: string, searchText?: string) => {
  if (!value) {
    return value;
  }

  const trimmedSearchText = searchText?.trim();
  if (!trimmedSearchText) {
    return value;
  }

  const searchTerms = [...new Set(trimmedSearchText.split(/\s+/).filter(Boolean))]
    .flatMap(getSearchTokenPatterns)
    .sort((firstTerm, secondTerm) => secondTerm.length - firstTerm.length);

  if (!searchTerms.length) {
    return value;
  }

  const matcher = new RegExp(`(${searchTerms.join("|")})`, "gi");
  return value.replace(matcher, "<strong>$1</strong>");
};

export const GlobalSearchContent = ({
  articles = [],
  onItemClick,
  searchText,
}: ISearchContentProps) => {
  return (
    <>
      <div className="w-full pb-8 [&_>_div+div]:mt-8">
        <hr className="my-8 border-gray-300"></hr>
        {articles.map((article: ISearchResultArticle, index: number) => (
          <div
            className="w-full"
            key={index}
            onClick={() => onItemClick(article)}
          >
            <div className="w-full">
              <LinkView
                className="focus:outline-none focus:ring-0 underline hover:no-underline visited:text-link"
                link={{
                  value: {
                    href: article.url,
                    target:
                      article.type === ArticleType.DOCUMENT
                        ? "_blank"
                        : "_self",
                  },
                }}
              >
                <RichText
                  className="text-lg leading-none"
                  field={{
                    value:
                      article.sub_headline || article.headline || article.name,
                  }}
                />
              </LinkView>
            </div>
            <LinkView
              className=" focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-black no-underline hover:no-underline mt-1 text-base !text-ink-tertiary hover:text-ink-tertiary visited:text-ink-tertiary active:text-ink-tertiary"
              link={{
                value: {
                  href: article.url,
                  target:
                    article.type === ArticleType.DOCUMENT ? "_blank" : "_self",
                },
              }}
            >
              {article.type === ArticleType.DOCUMENT ? (
                <>
                  <Download className="size-[14px] mr-1" aria-hidden="true" />
                  {DOCUMENT_TYPE}
                </>
              ) : (
                article.url
              )}
            </LinkView>
            <RichText
              className="text-ink-primary text-base m-0 mt-1"
              field={{
                value: highlightMatchedTerm(
                  article.summary ||
                    article?.description ||
                    article.sub_headline ||
                    article.headline ||
                    article.name,
                  searchText,
                ),
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};
