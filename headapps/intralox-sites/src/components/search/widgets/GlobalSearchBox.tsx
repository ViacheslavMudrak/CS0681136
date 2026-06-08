"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Form, Input } from "react-aria-components";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { I18N } from "lib/dictionary-keys";
import { useTranslations } from "next-intl";

interface IGlobalSearchBoxProps {
  placeholder?: string;
}
const GlobalSearchBox = ({ placeholder }: IGlobalSearchBoxProps) => {
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInputValue, setSearchInputValue] = useState(
    searchParams.get("q") || "",
  );

  useEffect(() => {
    setSearchInputValue(searchParams.get("q") || "");
  }, [searchParams]);

  const updateSearchQuery = (nextValue: string): void => {
    const existingParams = new URLSearchParams(searchParams.toString());
    existingParams.delete("q");
    existingParams.delete("page");

    const trimmedValue = nextValue.trim();
    if (trimmedValue) {
      existingParams.set("q", trimmedValue);
    }

    const nextQuery = existingParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  const handleSearchInputChange = (value: string): void => {
    setSearchInputValue(value);
    updateSearchQuery(value);
  };

  const handleClearSearch = (): void => {
    setSearchInputValue("");
    updateSearchQuery("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    updateSearchQuery(searchInputValue);
    inputRef.current?.blur();
  };

  return (
    <div className="w-full">
      <label className="mb-2 inline-block font-bold text-ink-primary">
        {t(I18N.SEARCH)}
      </label>
      <Form className="flex relative w-full" onSubmit={handleSubmit}>
        <button
          title="Submit the search query"
          className="absolute inline-flex items-center justify-center left-0 ml-3.5 my-2 top-0 bottom-0 bg-transparent border-0"
        >
          <FontAwesomeIcon
            icon={faSearch}
            className="text-[10px] text-surface-search-box"
          />
        </button>
        <Input
          ref={inputRef}
          name="search"
          value={searchInputValue}
          onChange={(e) => handleSearchInputChange(e.target.value || "")}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className="bg-gray-100 text-ink-primary border border-gray-300 py-2 px-8 w-full pr-10 rounded grow appearance-none [&::-webkit-search-decoration]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden [&::-ms-clear]:hidden [&::-ms-clear]:w-0 [&::-ms-clear]:h-0 [&::-ms-reveal]:hidden [&::-ms-reveal]:w-0 [&::-ms-reveal]:h-0"
        />
        {searchInputValue && (
          <button
            title="Clear the search query"
            type="button"
            onClick={handleClearSearch}
            className="absolute inline-flex items-center justify-center right-0 mr-4 my-2 top-0 bottom-0 bg-transparent border-0 border-l border-gray-300 px-2"
          >
            <FontAwesomeIcon
              icon={faClose}
              className="text-sm text-surface-search-box"
            />
          </button>
        )}
      </Form>
    </div>
  );
};

export default GlobalSearchBox;
