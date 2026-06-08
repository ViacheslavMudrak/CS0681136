import LinkView from "components/callToAction/partial/LinkVIew";
import { ISearchResultArticle } from "../SearchComponent.type";
import { ImageView } from "components/shared/ImageView/ImageView";
import { RichText } from "@sitecore-content-sdk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Video from "components/shared/video/Video";
import { SearchCardType } from "src/utils/enum";
import { ArticleBadge } from "components/shared/ArticleBadge";
import { formatPostDateLongUtc } from "components/articleBanner/ArticleBanner.utils";
import ListView from "./ListView/ListView";

interface ISearchContentProps {
  articles: ISearchResultArticle[];
  onItemClick: (value?: any | undefined) => void;
  defaultImage?: string;
  cardType?: string;
  isDropdownFacets?: boolean;
  gridType?: string;
}

export const SearchContent = ({
  articles = [],
  onItemClick,
  defaultImage,
  cardType,
  isDropdownFacets = false,
  gridType = "grid",
}: ISearchContentProps) => {
  const featuredArticles = articles.find(
    (article: ISearchResultArticle) => article.is_featured === true,
  );
  const nonFeaturedArticles = articles.filter(
    (article: ISearchResultArticle) =>
      isDropdownFacets ? article.id !== featuredArticles?.id : true,
  );

  if (cardType === SearchCardType.BELT_SERIES_PAGE) {
    return (
      <div
        className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 mt-6"
        aria-label="Product results"
      >
        {articles.map((article) => {
          const title = article.headline?.trim() || article.name?.trim() || "";
          const series =
            article.series?.trim() || article.company?.trim() || "";
          const imageSrc =
            article.image_url?.trim() || defaultImage?.trim() || "";
          const itemKey = article.id || article.url || title;

          return (
            <div
              key={itemKey}
              className="flex items-stretch"
              onClick={() => onItemClick(article)}
            >
              <LinkView
                link={{ value: { href: article.url } }}
                isTile={true}
                className="group flex w-full flex-col overflow-hidden rounded-lg border border-border-gray bg-bg-basic-color text-left shadow-md transition-shadow duration-150 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-border-basic-color"
              >
                <figure className="block min-h-px w-full">
                  {imageSrc ? (
                    <ImageView
                      image={{
                        value: {
                          src: imageSrc,
                          alt: title || series,
                          width: 568,
                          height: 298,
                        },
                      }}
                    />
                  ) : null}
                </figure>
                <div className="flex flex-auto flex-col space-y-1 px-4 pb-6 pt-4">
                  <div className="heading flex items-start gap-1">
                    <RichText
                      className="inline text-lg font-bold leading-snug text-text-heading-color transition-colors duration-150 group-hover:text-text-basic"
                      tag="h3"
                      field={{ value: title }}
                    />
                    {article.url ? (
                      <span className="inline-flex h-[14px] text-text-heading-color group-hover:text-text-basic">
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className="text-[10px] md:text-sm"
                          aria-hidden
                        />
                      </span>
                    ) : null}
                  </div>
                  {series ? (
                    <div className="flex flex-auto flex-col justify-end">
                      <RichText
                        className="text-xs font-bold uppercase leading-tight text-text-basic"
                        tag="p"
                        field={{ value: series }}
                      />
                    </div>
                  ) : null}
                </div>
              </LinkView>
            </div>
          );
        })}
      </div>
    );
  }

  if (cardType === SearchCardType.STANDALONE) {
    return (
      <>
        {nonFeaturedArticles.length > 0 &&
          nonFeaturedArticles.map(
            (article: ISearchResultArticle, index: number) => (
              <div
                className="border-0 border-t border-solid border-stroke-default py-8"
                key={index}
              >
                {article.headline}
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-2/3 lg:pr-[5px]">
                    <LinkView
                      link={{ value: { href: article.url } }}
                      className="block text-inherit group hover:no-underline 
                      focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-black"
                    >
                      <RichText
                        tag="h2"
                        className="text-ink-primary group-hover:text-ink-subtle my-0 text-lg font-bold leading-snug transition-colors lg:w-3/4"
                        field={{ value: article.name }}
                      />
                      <RichText
                        className="leading-normal mt-2 text-ink-primary"
                        field={{ value: article.summary }}
                      />
                      <div className="mt-4 text-sm text-ink-subtle flex items-center gap-4">
                        <ArticleBadge
                          articleType={article.article_type || ""}
                        />
                        <span>{formatPostDateLongUtc(article.post_date)}</span>
                      </div>
                    </LinkView>
                  </div>
                  <div className="lg:pl-[19px] mt-6 lg:mt-0 w-full lg:w-1/3">
                    <LinkView
                      link={{ value: { href: article.url } }}
                      className="block text-inherit group hover:no-underline 
                      focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-black"
                    >
                      <ImageView
                        className="border"
                        image={{
                          value: {
                            src: article.image_url || defaultImage,
                            alt: article.headline,
                            width: 468,
                            height: 246,
                          },
                        }}
                      />
                    </LinkView>
                  </div>
                </div>
              </div>
            ),
          )}
      </>
    );
  }
  if (gridType === SearchCardType.LIST_VIEW) {
    return <ListView articles={articles} />;
  }

  return (
    <>
      {featuredArticles && isDropdownFacets && (
        <div className="flex flex-col -mx-4 sm:mx-0">
          <div
            key={featuredArticles.id}
            className="flex w-full flex-wrap sm:flex-nowrap rounded-xl  mt-8 flex-col-reverse overflow-visible sm:overflow-hidden md:flex-row"
          >
            <div className="pt-4 pb-6 md:pt-12 md:pb-12 px-4 lg:px-8 bg-cyan overflow-hidden w-full md:w-60 lg:w-72 shrink-0">
              <div className="uppercase tracking-wide font-bold block text-cyan-light text-xs/tight mb-[0.5em]">
                Featured
              </div>
              <RichText
                className="font-bold text-ink-inverse md:w-full text-2xl leading-tight"
                tag="h3"
                field={{ value: featuredArticles.sub_headline }}
              />
              <RichText
                className="mt-4 text-ink-inverse md:w-full text-base leading-snug"
                field={{ value: featuredArticles.summary }}
              />
              <LinkView
                link={{ value: { href: featuredArticles.url } }}
                className="mt-4 inline-flex items-center !text-ink-inverse visited:text-ink-inverse hover:text-ink-inverse hover:no-underline"
              >
                <span>View Case Study</span>
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </LinkView>
            </div>
            <div className="relative w-full overflow-hidden">
              {featuredArticles.image_url && (
                <ImageView
                  image={{
                    value: {
                      src: featuredArticles.image_url,
                      alt: featuredArticles.headline,
                      width: 1600,
                      height: 900,
                    },
                  }}
                  className="!h-full"
                />
              )}
              {featuredArticles.brightcove_id && (
                <Video
                  videoId={featuredArticles.brightcove_id}
                  cover={true}
                  coverImageCropWidth={1600}
                  className="w-full h-full"
                  suppressCaption={true}
                  autoplay={true}
                  loop={true}
                  muted={true}
                  coverImage={{
                    value: {
                      src: featuredArticles.cover_image,
                      alt: featuredArticles.headline,
                      width: 1600,
                      height: 900,
                    },
                  }}
                  playInModal={true}
                />
              )}
              {!featuredArticles.image_url &&
                !featuredArticles.brightcove_id && (
                  <ImageView
                    image={{
                      value: {
                        src: defaultImage,
                        alt: featuredArticles.headline,
                        width: 1600,
                        height: 900,
                      },
                    }}
                    className="!h-full"
                  />
                )}
            </div>
          </div>
        </div>
      )}
      <div
        className={` ${isDropdownFacets ? "sm:-ml-4 mt-4 flex flex-wrap md:-ml-6" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}`}
      >
        {nonFeaturedArticles.map(
          (article: ISearchResultArticle, index: number) => (
            <>
              <div
                className={`${isDropdownFacets ? "mt-4 flex w-full items-stretch sm:pl-4 sm:w-1/2 md:mt-6 md:pl-6 lg:w-1/3" : ""}`}
                key={index}
                onClick={() => onItemClick(article)}
              >
                <LinkView
                  link={{ value: { href: article.url } }}
                  isTile={true}
                  className="group [&_>_div]:p-0 h-full border border-stroke-default overflow-hidden focus:outline-none focus:ring bg-surface flex flex-col transition-shadow duration-150 text-left rounded-lg shadow-md hover:shadow-lg w-full"
                >
                  <ImageView
                    image={{
                      value: {
                        src: article.image_url
                          ? article.image_url
                          : defaultImage,
                        alt: article.headline,
                        width: 372,
                        height: 195,
                      },
                    }}
                  />
                  <div className="space-y-1 flex flex-col flex-auto px-4 pb-6 pt-4">
                    <div className="heading">
                      <RichText
                        className=" inline text-ink-primary group-hover:text-ink-secondary text-lg font-bold leading-snug duration-150 transition-colors"
                        tag="h3"
                        field={{
                          value: isDropdownFacets
                            ? article.sub_headline || article.headline
                            : article.name,
                        }}
                      />
                      {article?.url &&
                        (isDropdownFacets
                          ? article.sub_headline || article.headline
                          : article.name) && (
                          <span className="text-ink-primary inline-flex h-[14px] group-hover:text-ink-secondary">
                            <FontAwesomeIcon
                              icon={faChevronRight}
                              className="text-[10px] md:text-sm"
                            />
                          </span>
                        )}
                    </div>
                    <RichText
                      className="text-ink-secondary text-sm leading-snug"
                      field={{ value: article.summary }}
                    />
                    <div className="flex flex-auto flex-col justify-end pt-4">
                      <RichText
                        className="text-ink-secondary font-bold text-xs uppercase leading-tight"
                        field={{ value: article.company }}
                      />
                    </div>
                  </div>
                </LinkView>
              </div>
            </>
          ),
        )}
      </div>
    </>
  );
};
