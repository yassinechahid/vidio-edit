import React, { useState, useEffect, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

interface SearchFieldProps {
  onSearch: (value: string) => void;
  searchValue: string;
  onSearchValueChange?: (value: string) => void;
}

const SearchField: React.FC<SearchFieldProps> = ({
  onSearch,
  searchValue,
  onSearchValueChange,
}) => {
  const { t } = useTranslation();
  const [localSearchValue, setLocalSearchValue] = useState<string>(
    searchValue || "",
  );

  useEffect(() => {
    setLocalSearchValue(searchValue || "");
  }, [searchValue]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (localSearchValue !== searchValue) {
        onSearchValueChange?.(localSearchValue);
        onSearch(localSearchValue);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [localSearchValue, searchValue, onSearch, onSearchValueChange]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalSearchValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchValueChange?.(localSearchValue);
      onSearch(localSearchValue);
    }
  };

  return (
    <div className="relative md:min-w-[720px]">
      <input
        type="text"
        value={localSearchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="h-[56px] w-full bg-light-surfaceContainerHigh focus:outline-0 pl-12 pr-6 rounded-3xl text-body-large text-light-onSurfaceVariant"
        placeholder={t("search.title")}
      />
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <Search className="w-5 h-5 text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant" />
      </div>
    </div>
  );
};

export default SearchField;
