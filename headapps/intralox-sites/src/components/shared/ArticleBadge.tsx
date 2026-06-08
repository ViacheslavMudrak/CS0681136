"use client";
import { cn } from "lib/utils";
import { ArticleType } from "src/utils/enum";

interface IArticleBadgeProps {
  articleType: string;
}
export const ArticleBadge = ({ articleType }: IArticleBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-block border border-solid text-ink-primary rounded pt-0.5 pb-0.75 px-2 leading-tight ",
        {
          "bg-orange-medium border-orange": articleType === ArticleType.NEWS,
          "border-cyan bg-cyan-medium ": articleType === ArticleType.INSIGHT,
          "bg-surface-muted border-stroke-default": articleType === ArticleType.SPOTLIGHT,
        },
      )}
    >
      {articleType}
    </span>
  );
};
