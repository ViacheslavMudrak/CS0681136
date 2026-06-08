import { Field, ImageField, RichText } from "@sitecore-content-sdk/nextjs";

import Card from "./Card";
import type { IRenderableCard } from "./BeltIdentifierSearchResult.types";

interface FacetCardGridProps {
  cards: IRenderableCard[];
  selectedValueId: string;
  onSelect: (valueId: string) => void;
  message?: string;
  showMessage: boolean;
  requireImage?: boolean;
  dimUnselectedWhenSelected?: boolean;
  hideDescription?: boolean;
}

const FacetCardGrid = ({
  cards,
  selectedValueId,
  onSelect,
  message,
  showMessage,
  requireImage = false,
  dimUnselectedWhenSelected = false,
  hideDescription = false,
}: FacetCardGridProps) => (
  <>
    {cards.length > 0 ? (
      <div className="flex flex-wrap -ml-4 -mt-4 md:-ml-6 md:-mt-6">
        {cards.map((card) => {
          if (requireImage && !card.Image?.value?.src) {
            return null;
          }

          const isSelected = selectedValueId === card.valueId;
          const shouldDimCard =
            dimUnselectedWhenSelected &&
            Boolean(selectedValueId) &&
            !isSelected;

          return (
            <div
              key={card.id}
              className="w-full flex items-stretch md:w-1/3 pl-4 md:pl-6 mt-4 md:mt-6"
            >
              <button
                type="button"
                className={`w-full h-full group hover:no-underline border border-gray-300 
                  overflow-hidden focus:outline-none focus-visible:ring bg-white flex flex-col 
                  transition-shadow duration-150 text-left rounded-lg shadow-md 
                  hover:shadow-lg shrink-0 text-wrap ${isSelected ? `border-stroke-input-focus border-2 shadow-none hover:shadow-none` : ""}
                  ${shouldDimCard ? "opacity-50 hover:opacity-100" : ""}`}
                onClick={() => onSelect(card.valueId)}
              >
                <Card
                  image={card.Image as ImageField}
                  title={card.Title as Field<string>}
                  description={card.Description as Field<string>}
                  hideDescription={hideDescription}
                />
              </button>
            </div>
          );
        })}
      </div>
    ) : null}
    {showMessage && (
      <RichText
        className="mt-4 text-sm text-ink-primary prose"
        field={{ value: message || "" }}
      />
    )}
  </>
);

export default FacetCardGrid;
