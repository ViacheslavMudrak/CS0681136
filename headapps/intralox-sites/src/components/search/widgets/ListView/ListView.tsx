import { RichText } from "@sitecore-content-sdk/nextjs";
import LinkView from "components/callToAction/partial/LinkVIew";
import { ISearchResultArticle } from "components/search/SearchComponent.type";
import { ImageView } from "components/shared/ImageView/ImageView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

const ListView = ({ articles }: { articles: ISearchResultArticle[] }) => {
  return (
    <>
      {articles.map((article) => {
        return (
          <LinkView
            key={article.id}
            link={{ value: { href: article.product_url } }}
            className="group border items-start border-gray-300 hover:no-underline overflow-hidden focus:outline-none focus:ring bg-white transition-shadow duration-150 shadow-md hover:shadow-lg text-left flex flex-wrap sm:flex-nowrap rounded-lg w-full mb-6"
          >
            <div className="relative sm:w-56 w-full self-stretch sm:shrink-0">
              <ImageView
                className="w-full !h-full relative"
                image={{
                  value: {
                    src: article.image_url,
                    alt: article.name,
                    width: 1200,
                    height: 630,
                  },
                }}
              />
            </div>
            <div className="space-y-1 p-4 pb-5 sm:p-6">
              <div className="heading">
                <RichText
                  className="text-gray-900 inline group-hover:text-gray-700 text-sm sm:text-lg font-bold leading-snug duration-150 transition-colors"
                  tag="h3"
                  field={{ value: article.name }}
                />
                {article?.product_url && (
                  <span className="text-ink-primary inline-flex h-[14px] group-hover:text-ink-secondary">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-[10px] md:text-sm relative top-[1px]"
                    />
                  </span>
                )}
              </div>
              <div className="flex flex-auto flex-col justify-end">
                <RichText
                  className="text-gray-700 font-bold text-xs uppercase leading-tight "
                  field={{ value: article.belt_series?.[0] }}
                />
              </div>
            </div>
          </LinkView>
        );
      })}
    </>
  );
};

export default ListView;
