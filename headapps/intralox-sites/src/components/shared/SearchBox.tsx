"use client";
import { Button, Input } from "@laitram-l-l-c/intralox-ui-components";
import { Form } from "react-aria-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
interface ISearchBoxProps {
  isSearchPageSearchBox?: boolean;
  placeholder?: string;
}

const SearchBox = ({
  isSearchPageSearchBox = true,
  placeholder,
}: ISearchBoxProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInputValue, setSearchInputValue] = useState(
    searchParams.get("q") || "",
  );

  useEffect(() => {
    setSearchInputValue(searchParams.get("q") || "");
  }, [searchParams]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search");
    const search = typeof searchValue === "string" ? searchValue.trim() : "";

    if (isSearchPageSearchBox) {
      const existingParams = new URLSearchParams(searchParams.toString());
      existingParams.delete("q");

      const orderedParams = new URLSearchParams();
      if (search) {
        orderedParams.set("q", search);
      }

      existingParams.forEach((value, key) => {
        orderedParams.append(key, value);
      });

      const nextQuery = orderedParams.toString();
      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    } else {
      const normalizedPath =
        pathname.endsWith("/") && pathname !== "/"
          ? pathname.slice(0, -1)
          : pathname;
      const targetPath = normalizedPath.endsWith("/search")
        ? normalizedPath
        : `${normalizedPath}/search`;
      if (search) {
        router.push(`${targetPath}?q=${encodeURIComponent(search)}`);
      } else {
        router.push(targetPath);
      }
    }
  };
  return (
    <div className="border border-gray-300 rounded-xl shadow-md p-4">
      <Form className="flex" onSubmit={handleSubmit}>
        <Input
          name="search"
          value={searchInputValue}
          onChange={(e) => setSearchInputValue?.(e.target.value || "")}
          className="w-full px-3 py-2 border rounded-xs bg-white placeholder:text-gray-500 text-gray-900 text-base leading-tight focus:ring disabled:bg-gray-100 disabled:text-gray-700 border-gray-300 border-r-0 rounded-r-none sm:border-r sm:rounded-r-xs"
          placeholder={
            placeholder || "Search by series, belt style, material, and more"
          }
        />
        <Button
          className="text-sm leading-tight px-3 py-3 transition-colors duration-150 flex flex-row justify-center items-center gap-1 hover:cursor-pointer focus:outline-hidden focus-visible:ring disabled:pointer-events-none bg-action text-white hover:bg-action-link active:bg-action-active disabled:bg-action-disabled disabled:text-gray-300 border border-transparent sm:ml-2 min-w-16 sm:min-w-28 rounded-xs rounded-l-none sm:rounded-full"
          type="submit"
        >
          <span className="hidden md:block">Search</span>
          <FontAwesomeIcon icon={faSearch} className="md:!hidden" />
        </Button>
      </Form>
    </div>
  );
};

export default SearchBox;
