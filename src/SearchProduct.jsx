import React, { createContext, useState } from "react";

export const SearchContext = createContext();

const SearchProduct = ({ children }) => {
  const [searchKey, setSearchKey] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <SearchContext.Provider
      value={{
        searchKey,
        setSearchKey,
        searchResults,
        setSearchResults,
        showSuggestions,
        setShowSuggestions,
        isMobileSearchOpen,
        setIsMobileSearchOpen
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProduct;
