"use client";
import {
  ChevronLeft,
  ChevronRight,
} from "@laitram-l-l-c/intralox-icon-library";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSearchResultsActions } from "@sitecore-search/react";
import { Pagination } from "@sitecore-search/ui";
import { PaginationButton, SearchCardType } from "src/utils/enum";
import { CHROME_ICON_BASE } from "lib/chrome-icons";
import { cn } from "lib/utils";

const SearchPagination = ({
  currentPage,
  totalPages,
  cardType,
  gridType,
}: {
  currentPage: number;
  totalPages: number;
  cardType: string;
  gridType: string;
}) => {
  const { onPageNumberChange } = useSearchResultsActions();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const updatePageInUrl = (page: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(page));
    }

    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  return (
    <Pagination.Root
      currentPage={currentPage}
      defaultCurrentPage={1}
      totalPages={totalPages}
      onPageChange={(v) => {
        onPageNumberChange({
          page: v,
        });
        updatePageInUrl(v);
        scrollToTop();
      }}
      className={cn(
        "pagination flex justify-center items-center w-full",
        cardType === SearchCardType.STANDALONE ||
          gridType === SearchCardType.LIST_VIEW
          ? "justify-between"
          : "",
      )}
    >
      <Pagination.PrevPage
        onClick={(e) => e.preventDefault()}
        className={cn(
          cardType === SearchCardType.STANDALONE ||
            (gridType === SearchCardType.LIST_VIEW &&
              "inline-flex text-ink-inverse rounded-[999px] min-w-[112px] p-3 bg-link-strong items-center data-[current=true]:bg-pagination-bg-disabled justify-center gap-2 hover:bg-link-hover focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-link-strong"),
          "cursor-pointer my-0 data-[current=true]:pointer-events-none data-[current=true]:text-stroke-default",
          cardType !== SearchCardType.STANDALONE &&
            gridType !== SearchCardType.LIST_VIEW &&
            "data-[current=true]:text-ink-tertiary",
        )}
      >
        {cardType === SearchCardType.STANDALONE ||
        gridType === SearchCardType.LIST_VIEW ? (
          <span className="inline-flex items-center justify-center text-sm">
            <ChevronLeft
              className={`${CHROME_ICON_BASE} size-5 mr-1`}
              aria-hidden="true"
            />
            {cardType === SearchCardType.STANDALONE
              ? PaginationButton.NEWER
              : PaginationButton.PREVIOUS}
          </span>
        ) : (
          <ChevronLeft className="size-[14px]" aria-hidden="true" />
        )}
      </Pagination.PrevPage>
      {cardType === SearchCardType.STANDALONE ||
      gridType === SearchCardType.LIST_VIEW ? (
        ""
      ) : (
        <Pagination.Pages>
          {(pagination) =>
            Pagination.paginationLayout(pagination, {
              boundaryCount: 1,
              siblingCount: 1,
            }).map(({ page, type }) =>
              type === "page" ? (
                <Pagination.Page
                  key={page}
                  aria-label={`Page ${page}`}
                  page={page || 1}
                  onClick={(e) => {
                    e.preventDefault();
                    if ((page || 1) === currentPage) {
                      updatePageInUrl(currentPage);
                      scrollToTop();
                    }
                  }}
                  className="cursor-pointer my-0 mx-2 data-[current=true]:text-ink-tertiary data-[current=true]:no-underline hover:text-ink-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-stroke-default"
                >
                  {page}
                </Pagination.Page>
              ) : (
                <span key={type}>...</span>
              ),
            )
          }
        </Pagination.Pages>
      )}

      <Pagination.NextPage
        onClick={(e) => e.preventDefault()}
        className={cn(
          cardType === SearchCardType.STANDALONE ||
            (gridType === SearchCardType.LIST_VIEW &&
              "inline-flex text-ink-inverse rounded-[999px] min-w-[112px] p-3 bg-link-strong items-center data-[current=true]:bg-pagination-bg-disabled justify-center gap-2 hover:bg-link-hover focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-link-strong"),
          "cursor-pointer my-0 data-[current=true]:pointer-events-none data-[current=true]:text-stroke-default",
          cardType !== SearchCardType.STANDALONE &&
            gridType !== SearchCardType.LIST_VIEW &&
            "data-[current=true]:text-ink-tertiary",
        )}
      >
        {cardType === SearchCardType.STANDALONE ||
        gridType === SearchCardType.LIST_VIEW ? (
          <span className="inline-flex items-center justify-center text-sm">
            {cardType === SearchCardType.STANDALONE
              ? PaginationButton.OLDER
              : PaginationButton.NEXT}
            <ChevronRight
              className={`${CHROME_ICON_BASE} size-5 ml-1`}
              aria-hidden="true"
            />
          </span>
        ) : (
          <ChevronRight className="size-[14px]" aria-hidden="true" />
        )}
      </Pagination.NextPage>
    </Pagination.Root>
  );
};

export default SearchPagination;
