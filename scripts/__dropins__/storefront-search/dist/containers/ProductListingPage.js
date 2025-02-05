/*! Copyright 2025 Adobe
All Rights Reserved. */
import { t, u } from "../chunks/jsxRuntime.module.js";
import { createContext, Fragment } from "@dropins/tools/preact.js";
import { useState, useEffect, useContext, useMemo, useRef, useCallback } from "@dropins/tools/preact-hooks.js";
import { D as DEFAULT_PAGE_SIZE, v as v4, S as SEARCH_UNIT_ID, u as useStore, a as SEARCH_SORT_DEFAULT, b as DEFAULT_MIN_QUERY_LENGTH, c as useTranslation, d as DEFAULT_PAGE_SIZE_OPTIONS, C as CATEGORY_SORT_DEFAULT, e as useSensor, B as BOOLEAN_YES, f as BOOLEAN_NO, T as TranslationContext, R as Resize, g as Translation, h as StoreContextProvider } from "../chunks/tokens.js";
import * as React from "@dropins/tools/preact-compat.js";
import { createContext as createContext$1, useEffect as useEffect$1, useContext as useContext$1, useState as useState$1, useMemo as useMemo$1, useRef as useRef$1 } from "@dropins/tools/preact-compat.js";
import { g as getSymbolFromCurrency } from "../chunks/currency-symbol-map.js";
import { events } from "@dropins/tools/event-bus.js";
import { i as initialize } from "../chunks/initialize.js";
import "@dropins/tools/lib.js";
const moveToTop = () => {
  window.scrollTo({
    top: 0
  });
};
const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};
const getProductImageURLs = (images, amount = 3, topImageUrl) => {
  var _a;
  const imageUrlArray = [];
  const url = new URL(window.location.href);
  const protocol = url.protocol;
  for (const image of images) {
    const imageUrl = (_a = image.url) == null ? void 0 : _a.replace(/^https?:\/\//, "");
    if (imageUrl) {
      imageUrlArray.push(`${protocol}//${imageUrl}`);
    }
  }
  if (topImageUrl) {
    const topImageUrlFormatted = `${protocol}//${topImageUrl.replace(/^https?:\/\//, "")}`;
    const index = topImageUrlFormatted.indexOf(topImageUrlFormatted);
    if (index > -1) {
      imageUrlArray.splice(index, 1);
    }
    imageUrlArray.unshift(topImageUrlFormatted);
  }
  return imageUrlArray.slice(0, amount);
};
const resolveImageUrl = (url, opts) => {
  const [base, query] = url.split("?");
  const params = new URLSearchParams(query);
  Object.entries(opts).forEach(([key, value]) => {
    if (value !== void 0 && value !== null) {
      params.set(key, String(value));
    }
  });
  return `${base}?${params.toString()}`;
};
const generateOptimizedImages = (imageUrls, baseImageWidth) => {
  const baseOptions = {
    fit: "cover",
    crop: false,
    dpi: 1
  };
  const imageUrlArray = [];
  for (const imageUrl of imageUrls) {
    const src = resolveImageUrl(imageUrl, {
      ...baseOptions,
      width: baseImageWidth
    });
    const dpiSet = [1, 2, 3];
    const srcset = dpiSet.map((dpi) => {
      return `${resolveImageUrl(imageUrl, {
        ...baseOptions,
        auto: "webp",
        quality: 80,
        width: baseImageWidth * dpi
      })} ${dpi}x`;
    });
    imageUrlArray.push({
      src,
      srcset
    });
  }
  return imageUrlArray;
};
const getProductPrice = (product, currencySymbol, currencyRate, useMaximum = false, useFinal = false) => {
  var _a, _b;
  let priceType;
  let price;
  if ("productView" in product) {
    priceType = (_a = product.productView) == null ? void 0 : _a.price;
    price = priceType.regular;
    if (useFinal) price = priceType.final;
  }
  let currency = (price == null ? void 0 : price.amount.currency) ?? "USD";
  if (currencySymbol) {
    currency = currencySymbol;
  } else {
    currency = getSymbolFromCurrency(currency) ?? "$";
  }
  const convertedPrice = currencyRate ? ((_b = price == null ? void 0 : price.amount) == null ? void 0 : _b.value) ?? 0 * parseFloat(currencyRate) : price == null ? void 0 : price.amount.value;
  return convertedPrice ? `${currency}${convertedPrice.toFixed(2)}` : "";
};
const getUserViewHistory = () => {
  const userViewHistory = (localStorage == null ? void 0 : localStorage.getItem("ds-view-history-time-decay")) ? JSON.parse(localStorage.getItem("ds-view-history-time-decay")) : null;
  if (userViewHistory && Array.isArray(userViewHistory)) {
    return userViewHistory.slice(-200).map((v) => ({
      sku: v.sku,
      dateTime: v.date
    }));
  }
  return [];
};
const nonFilterKeys = {
  search: "q",
  search_query: "search_query",
  pagination: "p",
  sort: "product_list_order",
  page_size: "page_size"
};
const addUrlFilter = (filter) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.searchParams);
  const attribute = filter.attribute;
  if (filter.range) {
    const filt = filter.range;
    if (getValueFromUrl(attribute)) {
      params.delete(attribute);
      params.append(attribute, `${filt.from}--${filt.to}`);
    } else {
      params.append(attribute, `${filt.from}--${filt.to}`);
    }
  } else {
    const filt = filter.in || [];
    const filterParams = params.getAll(attribute);
    filt.map((f) => {
      if (!filterParams.includes(f)) {
        params.append(attribute, f);
      }
    });
  }
  setWindowHistory(url.pathname, params);
};
const removeUrlFilter = (name, option) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.searchParams);
  const allValues = url.searchParams.getAll(name);
  params.delete(name);
  if (option) {
    allValues.splice(allValues.indexOf(option), 1);
    allValues.forEach((val) => params.append(name, val));
  }
  setWindowHistory(url.pathname, params);
};
const removeAllUrlFilters = () => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.searchParams);
  for (const key of url.searchParams.keys()) {
    if (!Object.values(nonFilterKeys).includes(key)) {
      params.delete(key);
    }
  }
  setWindowHistory(url.pathname, params);
};
const handleUrlSort = (sortOption) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.searchParams);
  params.set("product_list_order", sortOption);
  setWindowHistory(url.pathname, params);
};
const handleViewType = (viewType) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.searchParams);
  params.set("view_type", viewType);
  setWindowHistory(url.pathname, params);
};
const handleUrlPageSize = (pageSizeOption) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.searchParams);
  if (pageSizeOption === DEFAULT_PAGE_SIZE) {
    params.delete("page_size");
  } else {
    params.set("page_size", pageSizeOption.toString());
  }
  setWindowHistory(url.pathname, params);
};
const handleUrlPagination = (pageNumber) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.searchParams);
  if (pageNumber === 1) {
    params.delete("p");
  } else {
    params.set("p", pageNumber.toString());
  }
  setWindowHistory(url.pathname, params);
};
const getFiltersFromUrl = (filterableAttributes) => {
  var _a;
  const params = getSearchParams();
  const filters = [];
  for (const [key, value] of params.entries()) {
    if (filterableAttributes.includes(key) && !Object.values(nonFilterKeys).includes(key)) {
      if (value.includes("--")) {
        const range = value.split("--");
        const filter = {
          attribute: key,
          range: {
            from: Number(range[0]),
            to: Number(range[1])
          }
        };
        filters.push(filter);
      } else {
        const attributeIndex = filters.findIndex((filter) => filter.attribute == key);
        if (attributeIndex !== -1) {
          (_a = filters[attributeIndex].in) == null ? void 0 : _a.push(value);
        } else {
          const filter = {
            attribute: key,
            in: [value]
          };
          filters.push(filter);
        }
      }
    }
  }
  return filters;
};
const getValueFromUrl = (param) => {
  const params = getSearchParams();
  const filter = params.get(param);
  if (filter) {
    return filter;
  }
  return "";
};
const getSearchParams = () => {
  const search = window.location.search;
  return new URLSearchParams(search);
};
const setWindowHistory = (pathname, params) => {
  if (params.toString() === "") {
    window.history.pushState({}, "", `${pathname}`);
  } else {
    window.history.pushState({}, "", `${pathname}?${params.toString()}`);
  }
};
const htmlStringDecode = (input) => {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
};
const defaultSortOptions = () => {
  return [{
    label: "Most Relevant",
    value: "relevance_DESC"
  }, {
    label: "Price: Low to High",
    value: "price_ASC"
  }, {
    label: "Price: High to Low",
    value: "price_DESC"
  }];
};
const getSortOptionsfromMetadata = (translation, sortMetadata, displayOutOfStock, categoryPath) => {
  const sortOptions = categoryPath ? [{
    label: translation.SortDropdown.positionLabel,
    value: "position_ASC"
  }] : [{
    label: translation.SortDropdown.relevanceLabel,
    value: "relevance_DESC"
  }];
  const displayInStockOnly = displayOutOfStock != "1";
  if (sortMetadata && sortMetadata.length > 0) {
    sortMetadata.forEach((e) => {
      if (!e.attribute.includes("relevance") && !(e.attribute.includes("inStock") && displayInStockOnly) && !e.attribute.includes("position")) {
        if (e.numeric && e.attribute.includes("price")) {
          sortOptions.push({
            label: `${e.label}: Low to High`,
            value: `${e.attribute}_ASC`
          });
          sortOptions.push({
            label: `${e.label}: High to Low`,
            value: `${e.attribute}_DESC`
          });
        } else {
          sortOptions.push({
            label: `${e.label}`,
            value: `${e.attribute}_DESC`
          });
        }
      }
    });
  }
  return sortOptions;
};
const generateGQLSortInput = (sortOption) => {
  if (!sortOption) {
    return void 0;
  }
  const index = sortOption.lastIndexOf("_");
  return [{
    attribute: sortOption.substring(0, index),
    direction: sortOption.substring(index + 1) === "ASC" ? "ASC" : "DESC"
  }];
};
const useIntersectionObserver = (ref, options) => {
  const {
    rootMargin
  } = options;
  const [observerEntry, setObserverEntry] = t(useState(null), "observerEntry");
  useEffect(() => {
    if (!(ref == null ? void 0 : ref.current)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setObserverEntry(entry);
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
      }
    }, {
      rootMargin
    });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin]);
  return observerEntry;
};
const validStoreDetailsKeys = ["environmentId", "environmentType", "websiteCode", "storeCode", "storeViewCode", "config", "context", "apiUrl", "apiKey", "route", "searchQuery", "customerGroup", "type"];
const sanitizeString = (value) => {
  if (value !== "apiUrl") return value;
  if (typeof value === "string") {
    value = value.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, "");
    return value.trim();
  }
  return value;
};
const validateStoreDetailsKeys = (storeDetails) => {
  Object.keys(storeDetails).forEach((key) => {
    if (!validStoreDetailsKeys.includes(key)) {
      console.error(`Invalid key ${key} in StoreDetailsProps`);
      delete storeDetails[key];
      return;
    }
    storeDetails[key] = sanitizeString(storeDetails[key]);
  });
  return storeDetails;
};
const Facet = `
    fragment Facet on Aggregation {
        title
        attribute
        buckets {
            title
            __typename
            ... on CategoryView {
                name
                count
                path
            }
            ... on ScalarBucket {
                count
            }
            ... on RangeBucket {
                from
                to
                count
            }
            ... on StatsBucket {
                min
                max
            }
        }
    }
`;
const ProductView = `
    fragment ProductView on ProductSearchItem {
        productView {
            __typename
            sku
            name
            inStock
            url
            urlKey
            images {
                label
                url
                roles
            }
            ... on ComplexProductView {
                priceRange {
                    maximum {
                        final {
                            amount {
                                value
                                currency
                            }
                        }
                        regular {
                            amount {
                                value
                                currency
                            }
                        }
                    }
                    minimum {
                        final {
                            amount {
                                value
                                currency
                            }
                        }
                        regular {
                            amount {
                                value
                                currency
                            }
                        }
                    }
                }
                options {
                    id
                    title
                    values {
                        title
                        ... on ProductViewOptionValueSwatch {
                            id
                            inStock
                            type
                            value
                        }
                    }
                }
            }
            ... on SimpleProductView {
                price {
                    final {
                        amount {
                            value
                            currency
                        }
                    }
                    regular {
                        amount {
                            value
                            currency
                        }
                    }
                }
            }
        }
        highlights {
            attribute
            value
            matched_words
        }
    }
`;
const Product = `
    fragment Product on ProductSearchItem {
        product {
            __typename
            sku
            description {
                html
            }
            short_description{
                html
            }
            name
            canonical_url
            small_image {
                url
            }
            image {
                url
            }
            thumbnail {
                url
            }
            price_range {
                minimum_price {
                    fixed_product_taxes {
                        amount {
                            value
                            currency
                        }
                        label
                    }
                    regular_price {
                        value
                        currency
                    }
                    final_price {
                        value
                        currency
                    }
                    discount {
                        percent_off
                        amount_off
                    }
                }
                maximum_price {
                    fixed_product_taxes {
                        amount {
                            value
                            currency
                        }
                        label
                    }
                    regular_price {
                        value
                        currency
                    }
                    final_price {
                        value
                        currency
                    }
                    discount {
                        percent_off
                        amount_off
                    }
                }
            }
        }
    }
`;
const ATTRIBUTE_METADATA_QUERY = `
    query attributeMetadata {
        attributeMetadata {
        sortable {
            label
            attribute
            numeric
        }
        filterableInSearch {
            label
            attribute
            numeric
        }
        }
    }
`;
const PRODUCT_SEARCH_QUERY = `
    query productSearch(
        $phrase: String!
        $pageSize: Int
        $currentPage: Int = 1
        $filter: [SearchClauseInput!]
        $sort: [ProductSearchSortInput!]
        $context: QueryContextInput
    ) {
        productSearch(
            phrase: $phrase
            page_size: $pageSize
            current_page: $currentPage
            filter: $filter
            sort: $sort
            context: $context
        ) {
            total_count
            items {
                ...Product
                ...ProductView
            }
            facets {
                ...Facet
            }
            page_info {
                current_page
                page_size
                total_pages
            }
        }
        attributeMetadata {
            sortable {
                label
                attribute
                numeric
            }
        }
    }
    ${Product}
    ${ProductView}
    ${Facet}
`;
const REFINE_PRODUCT_QUERY = `
    query refineProduct(
        $optionIds: [String!]!
        $sku: String!
    ) {
        refineProduct(
            optionIds: $optionIds
            sku: $sku
        ) {
            __typename
            id
            sku
            name
            inStock
            url
            urlKey
            images {
                label
                url
                roles
            }
            ... on SimpleProductView {
                price {
                    final {
                        amount {
                            value
                        }
                    }
                    regular {
                        amount {
                            value
                        }
                    }
                }
            }
            ... on ComplexProductView {
                options {
                    id
                    title
                    required
                    values {
                        id
                        title
                    }
                }
                priceRange {
                    maximum {
                        final {
                            amount {
                                value
                            }
                        }
                        regular {
                            amount {
                                value
                            }
                        }
                    }
                    minimum {
                        final {
                            amount {
                                value
                            }
                        }
                        regular {
                            amount {
                                value
                            }
                        }
                    }
                }
            }
        }
    }
`;
const GET_CUSTOMER_CART = `
    query customerCart {
        customerCart {
            id
            items {
            id
            product {
                name
                sku
            }
            quantity
            }
        }
    }
`;
function getMake() {
  const context = JSON.parse(window.localStorage.getItem("_demo:context"));
  const data = JSON.parse(window.localStorage.getItem("_demo:data"));
  const makeId = context == null ? void 0 : context.id;
  let make;
  for (const [key, value] of Object.entries(data)) {
    if ((value == null ? void 0 : value.id) === makeId) {
      make = key;
    }
  }
  return {
    make,
    makeId
  };
}
function getPriceBookHeader() {
  const priceBook = window.localStorage.getItem("_demo:price-book") || "Brand";
  if (priceBook === "Brand") {
    const context = JSON.parse(window.localStorage.getItem("_demo:context"));
    return context == null ? void 0 : context.value.toLowerCase();
  }
  return priceBook.toLowerCase();
}
const getHeaders = (headers) => {
  const model = window.localStorage.getItem("_demo:model");
  const {
    makeId
  } = getMake();
  const priceBook = getPriceBookHeader();
  const newHeaders = {
    "Content-Type": "application/json",
    // "Magento-Environment-Id": headers.environmentId,
    // "Magento-Website-Code": headers.websiteCode,
    // "Magento-Store-Code": headers.storeCode,
    // "Magento-Store-View-Code": headers.storeViewCode,
    // "X-Api-Key": headers.apiKey,
    "AC-Environment-Id": "c09ecfb1-333a-4db3-9669-ce07ec0e3a00",
    ...makeId ? {
      "AC-Channel-Id": makeId
    } : {},
    ...model ? {
      "AC-Policy-Model": model
    } : {},
    ...priceBook ? {
      "AC-Price-Book-Id": priceBook
    } : {},
    // "AC-Policy-Make": make,
    // THIS IS DIFFERENT THAN OUR DROPIN LOCALE WITH UNDERSCORES (e.g. en_US) EVEN THOUGH THE DOCUMENTATION HAS UNDERSCORES
    "AC-Scope-Locale": "en-US",
    // env.locale.replace("_", "-"),
    "X-Api-Key": "search_gql",
    "X-Request-Id": headers.xRequestId
    // "Magento-Customer-Group": headers.customerGroup,
  };
  console.log("Headers", JSON.stringify(newHeaders, null, 2));
  return newHeaders;
};
const getProductSearch = async ({
  environmentId,
  websiteCode,
  storeCode,
  storeViewCode,
  apiKey,
  apiUrl,
  phrase,
  pageSize = 24,
  displayOutOfStock,
  currentPage = 1,
  xRequestId = v4(),
  filter = [],
  sort = [],
  context,
  categorySearch = false,
  headers
}) => {
  var _a, _b;
  const variables = {
    phrase,
    pageSize,
    currentPage,
    filter,
    sort,
    context
  };
  let searchType = "Search";
  if (categorySearch) {
    searchType = "Catalog";
  }
  const defaultFilters = {
    attribute: "visibility",
    in: [searchType, "Catalog, Search"]
  };
  variables.filter.push(defaultFilters);
  const displayInStockOnly = displayOutOfStock != "1";
  const inStockFilter = {
    attribute: "inStock",
    eq: "true"
  };
  if (displayInStockOnly) {
    variables.filter.push(inStockFilter);
  }
  const searchRequestId = v4();
  updateSearchInputCtx(SEARCH_UNIT_ID, searchRequestId, phrase, filter, pageSize, currentPage, sort);
  const magentoStorefrontEvtPublish = (_a = window.magentoStorefrontEvents) == null ? void 0 : _a.publish;
  (magentoStorefrontEvtPublish == null ? void 0 : magentoStorefrontEvtPublish.searchRequestSent) && magentoStorefrontEvtPublish.searchRequestSent(SEARCH_UNIT_ID);
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: PRODUCT_SEARCH_QUERY,
      variables: {
        ...variables
      }
    })
  });
  const results = await response.json();
  updateSearchResultsCtx(SEARCH_UNIT_ID, searchRequestId, (_b = results == null ? void 0 : results.data) == null ? void 0 : _b.productSearch);
  (magentoStorefrontEvtPublish == null ? void 0 : magentoStorefrontEvtPublish.searchResponseReceived) && magentoStorefrontEvtPublish.searchResponseReceived(SEARCH_UNIT_ID);
  if (categorySearch) {
    (magentoStorefrontEvtPublish == null ? void 0 : magentoStorefrontEvtPublish.categoryResultsView) && magentoStorefrontEvtPublish.categoryResultsView(SEARCH_UNIT_ID);
  } else {
    (magentoStorefrontEvtPublish == null ? void 0 : magentoStorefrontEvtPublish.searchResultsView) && magentoStorefrontEvtPublish.searchResultsView(SEARCH_UNIT_ID);
  }
  return results == null ? void 0 : results.data;
};
const getAttributeMetadata = async ({
  environmentId,
  websiteCode,
  storeCode,
  storeViewCode,
  apiKey,
  apiUrl,
  xRequestId = v4()
}) => {
  const headers = getHeaders({
    environmentId,
    websiteCode,
    storeCode,
    storeViewCode,
    apiKey,
    xRequestId,
    customerGroup: ""
  });
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: ATTRIBUTE_METADATA_QUERY
    })
  });
  const results = await response.json();
  return results == null ? void 0 : results.data;
};
const refineProductSearch = async ({
  environmentId,
  websiteCode,
  storeCode,
  storeViewCode,
  apiKey,
  apiUrl,
  xRequestId = v4(),
  context,
  optionIds,
  sku
}) => {
  const variables = {
    optionIds,
    sku
  };
  const headers = getHeaders({
    environmentId,
    websiteCode,
    storeCode,
    storeViewCode,
    apiKey,
    xRequestId,
    customerGroup: (context == null ? void 0 : context.customerGroup) ?? ""
  });
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: REFINE_PRODUCT_QUERY,
      variables: {
        ...variables
      }
    })
  });
  const results = await response.json();
  return results == null ? void 0 : results.data;
};
var _jsxFileName$A = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/context/attributeMetadata.tsx";
const AttributeMetadataContext = createContext({
  sortable: [],
  filterableInSearch: []
});
const AttributeMetadataProvider = ({
  children
}) => {
  const [attributeMetadata, setAttributeMetadata] = t(useState({
    sortable: [],
    filterableInSearch: null
  }), "attributeMetadata");
  const storeCtx = useStore();
  useEffect(() => {
    const fetchData = async () => {
      const data = await getAttributeMetadata({
        ...storeCtx,
        apiUrl: storeCtx.apiUrl
      });
      if (data == null ? void 0 : data.attributeMetadata) {
        setAttributeMetadata({
          sortable: data.attributeMetadata.sortable,
          filterableInSearch: data.attributeMetadata.filterableInSearch.map((attribute) => attribute.attribute)
        });
      }
    };
    fetchData();
  }, []);
  const attributeMetadataContext = {
    ...attributeMetadata
  };
  return u(AttributeMetadataContext.Provider, {
    value: attributeMetadataContext,
    children
  }, void 0, false, {
    fileName: _jsxFileName$A,
    lineNumber: 64,
    columnNumber: 9
  }, void 0);
};
const useAttributeMetadata = () => {
  const attributeMetadataCtx = useContext(AttributeMetadataContext);
  return attributeMetadataCtx;
};
var _jsxFileName$z = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/context/search.tsx";
const SearchContext = createContext$1({});
const SearchProvider = ({
  children
}) => {
  const storeCtx = useStore();
  const phraseFromUrl = getValueFromUrl(storeCtx.searchQuery || "q");
  const sortFromUrl = getValueFromUrl("product_list_order");
  const graphQLSort = generateGQLSortInput(sortFromUrl);
  const sortDefault = graphQLSort ? graphQLSort : SEARCH_SORT_DEFAULT;
  const [phrase, setPhrase] = t(useState(phraseFromUrl), "phrase");
  const [categoryPath, setCategoryPath] = t(useState(""), "categoryPath");
  const [filters, setFilters] = t(useState([]), "filters");
  const [categoryNames, setCategoryNames] = t(useState([]), "categoryNames");
  const [sort, setSort] = t(useState(sortDefault), "sort");
  const [filterCount, setFilterCount] = t(useState(0), "filterCount");
  const createFilter = (filter) => {
    const newFilters = [...filters, filter];
    setFilters(newFilters);
    addUrlFilter(filter);
  };
  const updateFilter = (filter) => {
    const newFilters = [...filters];
    const index = newFilters.findIndex((e) => e.attribute === filter.attribute);
    newFilters[index] = filter;
    setFilters(newFilters);
    addUrlFilter(filter);
  };
  const removeFilter = (name, option) => {
    const newFilters = [...filters].filter((e) => {
      return e.attribute !== name;
    });
    setFilters(newFilters);
    removeUrlFilter(name, option);
  };
  const clearFilters = () => {
    removeAllUrlFilters();
    setFilters([]);
  };
  const updateFilterOptions = (facetFilter, option) => {
    var _a;
    const newFilters = [...filters].filter((e) => e.attribute !== facetFilter.attribute);
    const newOptions = (_a = facetFilter.in) == null ? void 0 : _a.filter((e) => e !== option);
    newFilters.push({
      attribute: facetFilter.attribute,
      in: newOptions
    });
    if (newOptions == null ? void 0 : newOptions.length) {
      setFilters(newFilters);
      removeUrlFilter(facetFilter.attribute, option);
    } else {
      removeFilter(facetFilter.attribute, option);
    }
  };
  const getFilterCount = (filters2) => {
    let count = 0;
    filters2.forEach((filter) => {
      if (filter.in) {
        count += filter.in.length;
      } else {
        count += 1;
      }
    });
    return count;
  };
  useEffect$1(() => {
    const count = getFilterCount(filters);
    setFilterCount(count);
  }, [filters]);
  const context = {
    phrase,
    categoryPath,
    filters,
    sort,
    categoryNames,
    filterCount,
    setPhrase,
    setCategoryPath,
    setFilters,
    setCategoryNames,
    setSort,
    createFilter,
    updateFilter,
    updateFilterOptions,
    removeFilter,
    clearFilters
  };
  return u(SearchContext.Provider, {
    value: context,
    children
  }, void 0, false, {
    fileName: _jsxFileName$z,
    lineNumber: 137,
    columnNumber: 12
  }, void 0);
};
const useSearch = () => {
  const searchCtx = useContext$1(SearchContext);
  return searchCtx;
};
var _jsxFileName$y = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/context/products.tsx";
const ProductsContext = createContext({
  variables: {
    phrase: "",
    headers: {}
  },
  loading: false,
  items: [],
  setItems: () => {
  },
  currentPage: 1,
  setCurrentPage: () => {
  },
  pageSize: DEFAULT_PAGE_SIZE,
  setPageSize: () => {
  },
  totalCount: 0,
  setTotalCount: () => {
  },
  totalPages: 0,
  setTotalPages: () => {
  },
  facets: [],
  setFacets: () => {
  },
  categoryName: "",
  setCategoryName: () => {
  },
  currencySymbol: "",
  setCurrencySymbol: () => {
  },
  currencyRate: "",
  setCurrencyRate: () => {
  },
  minQueryLength: DEFAULT_MIN_QUERY_LENGTH,
  minQueryLengthReached: false,
  setMinQueryLengthReached: () => {
  },
  pageSizeOptions: [],
  setRoute: void 0,
  refineProduct: () => {
  },
  pageLoading: false,
  setPageLoading: () => {
  },
  categoryPath: void 0,
  viewType: "",
  setViewType: () => {
  },
  listViewType: "",
  setListViewType: () => {
  },
  resolveCartId: () => Promise.resolve(""),
  refreshCart: () => {
  },
  addToCart: () => Promise.resolve(),
  searchHeaders: {},
  setSearchHeaders: () => {
  }
});
const ProductsContextProvider = ({
  children
}) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const urlValue = getValueFromUrl("p");
  const pageDefault = urlValue ? Number(urlValue) : 1;
  const searchCtx = useSearch();
  const storeCtx = useStore();
  const attributeMetadataCtx = useAttributeMetadata();
  const pageSizeValue = getValueFromUrl("page_size");
  const defaultPageSizeOption = Number((_b = (_a = storeCtx == null ? void 0 : storeCtx.config) == null ? void 0 : _a.perPageConfig) == null ? void 0 : _b.defaultPageSizeOption) || DEFAULT_PAGE_SIZE;
  const pageSizeDefault = pageSizeValue ? Number(pageSizeValue) : defaultPageSizeOption;
  const translation = useTranslation();
  const showAllLabel = translation.ProductContainers.showAll;
  const [searchHeaders, setSearchHeaders] = t(useState(((_c = storeCtx == null ? void 0 : storeCtx.config) == null ? void 0 : _c.searchHeaders) ? storeCtx.config.searchHeaders : {}), "searchHeaders");
  const [loading, setLoading] = t(useState(true), "loading");
  const [pageLoading, setPageLoading] = t(useState(true), "pageLoading");
  const [items, setItems] = t(useState([]), "items");
  const [currentPage, setCurrentPage] = t(useState(pageDefault), "currentPage");
  const [pageSize, setPageSize] = t(useState(pageSizeDefault), "pageSize");
  const [totalCount, setTotalCount] = t(useState(0), "totalCount");
  const [totalPages, setTotalPages] = t(useState(0), "totalPages");
  const [facets, setFacets] = t(useState([]), "facets");
  const [categoryName, setCategoryName] = t(useState(((_d = storeCtx == null ? void 0 : storeCtx.config) == null ? void 0 : _d.categoryName) ?? ""), "categoryName");
  const [pageSizeOptions, setPageSizeOptions] = t(useState([]), "pageSizeOptions");
  const [currencySymbol, setCurrencySymbol] = t(useState(((_e = storeCtx == null ? void 0 : storeCtx.config) == null ? void 0 : _e.currencySymbol) ?? ""), "currencySymbol");
  const [currencyRate, setCurrencyRate] = t(useState(((_f = storeCtx == null ? void 0 : storeCtx.config) == null ? void 0 : _f.currencyRate) ?? ""), "currencyRate");
  const [minQueryLengthReached, setMinQueryLengthReached] = t(useState(false), "minQueryLengthReached");
  const minQueryLength = t(useMemo(() => {
    var _a2;
    return ((_a2 = storeCtx == null ? void 0 : storeCtx.config) == null ? void 0 : _a2.minQueryLength) || DEFAULT_MIN_QUERY_LENGTH;
  }, [storeCtx == null ? void 0 : storeCtx.config.minQueryLength]), "minQueryLength");
  const categoryPath = (_g = storeCtx.config) == null ? void 0 : _g.currentCategoryUrlPath;
  const viewTypeFromUrl = getValueFromUrl("view_type");
  const [viewType, setViewType] = t(useState(viewTypeFromUrl ? viewTypeFromUrl : "gridView"), "viewType");
  const [listViewType, setListViewType] = t(useState("default"), "listViewType");
  const variables = t(useMemo(() => {
    return {
      phrase: searchCtx.phrase,
      filter: searchCtx.filters,
      sort: searchCtx.sort,
      context: storeCtx.context,
      pageSize,
      displayOutOfStock: storeCtx.config.displayOutOfStock,
      currentPage
    };
  }, [searchCtx.phrase, searchCtx.filters, searchCtx.sort, storeCtx.context, storeCtx.config.displayOutOfStock, pageSize, currentPage]), "variables");
  const handleRefineProductSearch = async (optionIds, sku) => {
    const data = await refineProductSearch({
      ...storeCtx,
      optionIds,
      sku
    });
    return data;
  };
  const context = {
    variables,
    loading,
    items,
    setItems,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalCount,
    setTotalCount,
    totalPages,
    setTotalPages,
    facets,
    setFacets,
    categoryName,
    setCategoryName,
    currencySymbol,
    setCurrencySymbol,
    currencyRate,
    setCurrencyRate,
    minQueryLength,
    minQueryLengthReached,
    setMinQueryLengthReached,
    pageSizeOptions,
    setRoute: storeCtx.route,
    refineProduct: handleRefineProductSearch,
    pageLoading,
    setPageLoading,
    categoryPath,
    viewType,
    setViewType,
    listViewType,
    setListViewType,
    cartId: storeCtx.config.resolveCartId,
    refreshCart: storeCtx.config.refreshCart,
    resolveCartId: storeCtx.config.resolveCartId,
    addToCart: storeCtx.config.addToCart,
    searchHeaders,
    setSearchHeaders
  };
  const searchProducts = async (_headers = {}) => {
    var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h, _i, _j;
    try {
      setLoading(true);
      moveToTop();
      if (checkMinQueryLength()) {
        const filters = [...variables.filter];
        handleCategorySearch(categoryPath, filters);
        const data = await getProductSearch({
          ...variables,
          ...storeCtx,
          apiUrl: storeCtx.apiUrl,
          filter: filters,
          categorySearch: !!categoryPath,
          headers: _headers
        });
        setItems(((_a2 = data == null ? void 0 : data.productSearch) == null ? void 0 : _a2.items) || []);
        setFacets(((_b2 = data == null ? void 0 : data.productSearch) == null ? void 0 : _b2.facets) || []);
        setTotalCount(((_c2 = data == null ? void 0 : data.productSearch) == null ? void 0 : _c2.total_count) || 0);
        setTotalPages(((_e2 = (_d2 = data == null ? void 0 : data.productSearch) == null ? void 0 : _d2.page_info) == null ? void 0 : _e2.total_pages) || 1);
        handleCategoryNames(((_f2 = data == null ? void 0 : data.productSearch) == null ? void 0 : _f2.facets) || []);
        getPageSizeOptions((_g2 = data == null ? void 0 : data.productSearch) == null ? void 0 : _g2.total_count);
        paginationCheck((_h = data == null ? void 0 : data.productSearch) == null ? void 0 : _h.total_count, (_j = (_i = data == null ? void 0 : data.productSearch) == null ? void 0 : _i.page_info) == null ? void 0 : _j.total_pages);
      }
      setLoading(false);
      setPageLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setPageLoading(false);
    }
  };
  const checkMinQueryLength = () => {
    var _a2;
    if (!((_a2 = storeCtx.config) == null ? void 0 : _a2.currentCategoryUrlPath) && searchCtx.phrase.trim().length < (Number(storeCtx.config.minQueryLength) || DEFAULT_MIN_QUERY_LENGTH)) {
      setItems([]);
      setFacets([]);
      setTotalCount(0);
      setTotalPages(1);
      setMinQueryLengthReached(false);
      return false;
    }
    setMinQueryLengthReached(true);
    return true;
  };
  const getPageSizeOptions = (totalCount2) => {
    var _a2, _b2, _c2;
    const optionsArray = [];
    const pageSizeString = ((_b2 = (_a2 = storeCtx == null ? void 0 : storeCtx.config) == null ? void 0 : _a2.perPageConfig) == null ? void 0 : _b2.pageSizeOptions) || DEFAULT_PAGE_SIZE_OPTIONS;
    const pageSizeArray = pageSizeString.split(",");
    pageSizeArray.forEach((option) => {
      optionsArray.push({
        label: option,
        value: parseInt(option, 10)
      });
    });
    if (((_c2 = storeCtx == null ? void 0 : storeCtx.config) == null ? void 0 : _c2.allowAllProducts) == "1") {
      optionsArray.push({
        label: showAllLabel,
        value: totalCount2 !== null ? totalCount2 > 500 ? 500 : totalCount2 : 0
      });
    }
    setPageSizeOptions(optionsArray);
  };
  const paginationCheck = (totalCount2, totalPages2) => {
    if (totalCount2 && totalCount2 > 0 && totalPages2 === 1) {
      setCurrentPage(1);
      handleUrlPagination(1);
    }
  };
  const handleCategorySearch = (categoryPath2, filters) => {
    if (categoryPath2) {
      const categoryFilter = {
        attribute: "categoryPath",
        eq: categoryPath2
      };
      filters.push(categoryFilter);
      if (variables.sort.length < 1 || variables.sort === SEARCH_SORT_DEFAULT) {
        variables.sort = CATEGORY_SORT_DEFAULT;
      }
    }
  };
  const handleCategoryNames = (facets2) => {
    facets2.map((facet) => {
      var _a2;
      const bucketType = (_a2 = facet == null ? void 0 : facet.buckets[0]) == null ? void 0 : _a2.__typename;
      if (bucketType === "CategoryView") {
        const names = facet.buckets.map((bucket) => {
          if (bucket.__typename === "CategoryView") return {
            name: bucket.name,
            value: bucket.title,
            attribute: facet.attribute
          };
        });
        searchCtx.setCategoryNames(names);
      }
    });
  };
  useEffect(() => {
    if (attributeMetadataCtx.filterableInSearch) {
      searchProducts({
        ...storeCtx.config.defaultHeaders,
        ...searchHeaders
      });
    }
  }, [searchCtx.filters]);
  useEffect(() => {
    if (attributeMetadataCtx.filterableInSearch) {
      const filtersFromUrl = getFiltersFromUrl(attributeMetadataCtx.filterableInSearch);
      searchCtx.setFilters(filtersFromUrl);
    }
  }, [attributeMetadataCtx.filterableInSearch]);
  useEffect(() => {
    if (!loading) {
      searchProducts({
        ...storeCtx.config.defaultHeaders,
        ...searchHeaders
      });
    }
  }, [searchCtx.phrase, searchCtx.sort, currentPage, pageSize, searchHeaders]);
  return u(ProductsContext.Provider, {
    value: context,
    children
  }, void 0, false, {
    fileName: _jsxFileName$y,
    lineNumber: 357,
    columnNumber: 12
  }, void 0);
};
const useProducts = () => {
  const productsCtx = useContext(ProductsContext);
  return productsCtx;
};
const updateSearchInputCtx = (searchUnitId, searchRequestId, phrase, filters, pageSize, currentPage, sort) => {
  const mse = window.magentoStorefrontEvents;
  if (!mse) {
    return;
  }
  const searchInputCtx = mse.context.getSearchInput() ?? {
    units: []
  };
  const searchInputUnit = {
    searchUnitId,
    searchRequestId,
    queryTypes: ["products", "suggestions"],
    phrase,
    pageSize,
    currentPage,
    filter: filters,
    sort
  };
  const searchInputUnitIndex = searchInputCtx.units.findIndex((unit) => unit.searchUnitId === searchUnitId);
  if (searchInputUnitIndex < 0) {
    searchInputCtx.units.push(searchInputUnit);
  } else {
    searchInputCtx.units[searchInputUnitIndex] = searchInputUnit;
  }
  mse.context.setSearchInput(searchInputCtx);
};
const updateSearchResultsCtx = (searchUnitId, searchRequestId, results) => {
  var _a, _b;
  const mse = window.magentoStorefrontEvents;
  if (!mse) {
    return;
  }
  const searchResultsCtx = mse.context.getSearchResults() ?? {
    units: []
  };
  const searchResultUnitIndex = searchResultsCtx.units.findIndex((unit) => unit.searchUnitId === searchUnitId);
  const searchResultUnit = {
    searchUnitId,
    searchRequestId,
    products: createProducts(results.items),
    categories: [],
    suggestions: createSuggestions(results.suggestions),
    page: ((_a = results == null ? void 0 : results.page_info) == null ? void 0 : _a.current_page) || 1,
    perPage: ((_b = results == null ? void 0 : results.page_info) == null ? void 0 : _b.page_size) || 20,
    facets: createFacets(results.facets)
  };
  if (searchResultUnitIndex < 0) {
    searchResultsCtx.units.push(searchResultUnit);
  } else {
    searchResultsCtx.units[searchResultUnitIndex] = searchResultUnit;
  }
  mse.context.setSearchResults(searchResultsCtx);
};
const createProducts = (items) => {
  if (!items) {
    return [];
  }
  const products = items.map((item, index) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    return {
      name: (_a = item == null ? void 0 : item.product) == null ? void 0 : _a.name,
      sku: (_b = item == null ? void 0 : item.product) == null ? void 0 : _b.sku,
      url: ((_c = item == null ? void 0 : item.product) == null ? void 0 : _c.canonical_url) ?? "",
      imageUrl: ((_e = (_d = item == null ? void 0 : item.productView) == null ? void 0 : _d.images) == null ? void 0 : _e.length) ? ((_f = item == null ? void 0 : item.productView) == null ? void 0 : _f.images[0].url) ?? "" : "",
      // price:
      //     item?.productView?.price?.final?.amount?.value ??
      //     item?.product?.price_range?.minimum_price?.final_price?.value,
      price: (_j = (_i = (_h = (_g = item.productView) == null ? void 0 : _g.price) == null ? void 0 : _h.final) == null ? void 0 : _i.amount) == null ? void 0 : _j.value,
      rank: index
    };
  });
  return products;
};
const createSuggestions = (items) => {
  if (!items) {
    return [];
  }
  const suggestions = items.map((suggestion, index) => ({
    suggestion,
    rank: index
  }));
  return suggestions;
};
const createFacets = (items) => {
  if (!items) {
    return [];
  }
  const facets = items.map((item) => ({
    attribute: item == null ? void 0 : item.attribute,
    title: item == null ? void 0 : item.title,
    type: (item == null ? void 0 : item.type) || "PINNED",
    buckets: item == null ? void 0 : item.buckets.map((bucket) => bucket)
  }));
  return facets;
};
async function getGraphQL(query = "", variables = {}, store = "", baseUrl = "") {
  const graphqlEndpoint = baseUrl ? `${baseUrl}/graphql` : `${window.origin}/graphql`;
  const response = await fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Store: store
    },
    body: JSON.stringify({
      query,
      variables
    })
  }).then((res) => res.json());
  return response;
}
const ADD_TO_CART = `
  mutation addProductsToCart(
    $cartId: String!
    $cartItems: [CartItemInput!]!
  ) {
      addProductsToCart(
        cartId: $cartId
        cartItems: $cartItems
      ) {
          cart {
            items {
              product {
                name
                sku
              }
              quantity
            }
          }
          user_errors {
            code
            message
          }
      }
  }
`;
var _jsxFileName$x = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/context/cart.tsx";
const CartContext = createContext({});
const useCart = () => {
  return useContext(CartContext);
};
const CartProvider = ({
  children
}) => {
  const [cart, setCart] = t(useState({
    cartId: ""
  }), "cart");
  const {
    refreshCart,
    resolveCartId
  } = useProducts();
  const {
    storeViewCode,
    config
  } = useStore();
  const initializeCustomerCart = async () => {
    var _a;
    let cartId = "";
    if (!resolveCartId) {
      const customerResponse = await getGraphQL(GET_CUSTOMER_CART, {}, storeViewCode, config == null ? void 0 : config.baseUrl);
      cartId = ((_a = customerResponse == null ? void 0 : customerResponse.data.customerCart) == null ? void 0 : _a.id) ?? "";
    } else {
      cartId = await resolveCartId() ?? "";
    }
    setCart({
      ...cart,
      cartId
    });
    return cartId;
  };
  const addToCartGraphQL = async (sku) => {
    let cartId = cart.cartId;
    if (!cartId) {
      cartId = await initializeCustomerCart();
    }
    const cartItems = [{
      quantity: 1,
      sku
    }];
    const variables = {
      cartId,
      cartItems
    };
    const response = await getGraphQL(ADD_TO_CART, variables, storeViewCode, config == null ? void 0 : config.baseUrl);
    return response;
  };
  const cartContext = {
    cart,
    initializeCustomerCart,
    addToCartGraphQL,
    refreshCart
  };
  return u(CartContext.Provider, {
    value: cartContext,
    children
  }, void 0, false, {
    fileName: _jsxFileName$x,
    lineNumber: 82,
    columnNumber: 12
  }, void 0);
};
const SvgAdjustments = (props) => /* @__PURE__ */ React.createElement("svg", { className: "w-6 h-6 mr-1", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "black", ...props }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" }));
const SvgCart = (props) => /* @__PURE__ */ React.createElement("svg", { width: 23, height: 22, viewBox: "0 0 23 22", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M17.9002 18.2899H18.6502V16.7899H17.9002V18.2899ZM6.13016 17.5399L5.38475 17.6228C5.42698 18.0026 5.74801 18.2899 6.13016 18.2899V17.5399ZM4.34016 1.43994L5.08556 1.35707C5.04334 0.977265 4.7223 0.689941 4.34016 0.689941V1.43994ZM1.66016 0.689941H0.910156V2.18994H1.66016V0.689941ZM21.3402 6.80996L22.0856 6.89324C22.1077 6.69506 22.05 6.49622 21.9253 6.34067C21.8005 6.18512 21.6189 6.08566 21.4206 6.06428L21.3402 6.80996ZM20.5402 13.97V14.72C20.9222 14.72 21.2432 14.4329 21.2856 14.0532L20.5402 13.97ZM6.30029 19.0499C6.30029 19.4641 5.96451 19.7999 5.55029 19.7999V21.2999C6.79293 21.2999 7.80029 20.2926 7.80029 19.0499H6.30029ZM5.55029 19.7999C5.13608 19.7999 4.80029 19.4641 4.80029 19.0499H3.30029C3.30029 20.2926 4.30765 21.2999 5.55029 21.2999V19.7999ZM4.80029 19.0499C4.80029 18.6357 5.13608 18.2999 5.55029 18.2999V16.7999C4.30765 16.7999 3.30029 17.8073 3.30029 19.0499H4.80029ZM5.55029 18.2999C5.96451 18.2999 6.30029 18.6357 6.30029 19.0499H7.80029C7.80029 17.8073 6.79293 16.7999 5.55029 16.7999V18.2999ZM19.3003 19.0499C19.3003 19.4641 18.9645 19.7999 18.5503 19.7999V21.2999C19.7929 21.2999 20.8003 20.2926 20.8003 19.0499H19.3003ZM18.5503 19.7999C18.1361 19.7999 17.8003 19.4641 17.8003 19.0499H16.3003C16.3003 20.2926 17.3077 21.2999 18.5503 21.2999V19.7999ZM17.8003 19.0499C17.8003 18.6357 18.1361 18.2999 18.5503 18.2999V16.7999C17.3077 16.7999 16.3003 17.8073 16.3003 19.0499H17.8003ZM18.5503 18.2999C18.9645 18.2999 19.3003 18.6357 19.3003 19.0499H20.8003C20.8003 17.8073 19.7929 16.7999 18.5503 16.7999V18.2999ZM17.9002 16.7899H6.13016V18.2899H17.9002V16.7899ZM6.87556 17.4571L5.08556 1.35707L3.59475 1.52282L5.38475 17.6228L6.87556 17.4571ZM4.34016 0.689941H1.66016V2.18994H4.34016V0.689941ZM4.65983 5.76564L21.2598 7.55564L21.4206 6.06428L4.82064 4.27428L4.65983 5.76564ZM20.5949 6.72668L19.7949 13.8867L21.2856 14.0532L22.0856 6.89324L20.5949 6.72668ZM20.5402 13.22H5.74023V14.72H20.5402V13.22Z", fill: "white" }));
const SvgCheckmark = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "currentColor", className: "bi bi-check-circle-fill", viewBox: "0 0 16 16", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" }));
const SvgChevron = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 8.122 5.121", stroke: "currentColor", ...props }, /* @__PURE__ */ React.createElement("path", { id: "chevron", d: "M199.75,367.5l3,3,3-3", transform: "translate(-198.689 -366.435)", fill: "none" }));
const SvgError = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "currentColor", className: "bi bi-exclamation-circle-fill", viewBox: "0 0 16 16", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" }));
const SvgGridView = (props) => /* @__PURE__ */ React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 18 18", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M3.75 1.25H2.25C1.69772 1.25 1.25 1.69772 1.25 2.25V3.75C1.25 4.30228 1.69772 4.75 2.25 4.75H3.75C4.30228 4.75 4.75 4.30228 4.75 3.75V2.25C4.75 1.69772 4.30228 1.25 3.75 1.25Z", fill: "#222222" }), /* @__PURE__ */ React.createElement("path", { d: "M9.75 1.25H8.25C7.69772 1.25 7.25 1.69772 7.25 2.25V3.75C7.25 4.30228 7.69772 4.75 8.25 4.75H9.75C10.3023 4.75 10.75 4.30228 10.75 3.75V2.25C10.75 1.69772 10.3023 1.25 9.75 1.25Z", fill: "#222222" }), /* @__PURE__ */ React.createElement("path", { d: "M15.75 1.25H14.25C13.6977 1.25 13.25 1.69772 13.25 2.25V3.75C13.25 4.30228 13.6977 4.75 14.25 4.75H15.75C16.3023 4.75 16.75 4.30228 16.75 3.75V2.25C16.75 1.69772 16.3023 1.25 15.75 1.25Z", fill: "#222222" }), /* @__PURE__ */ React.createElement("path", { d: "M3.75 7.25H2.25C1.69772 7.25 1.25 7.69772 1.25 8.25V9.75C1.25 10.3023 1.69772 10.75 2.25 10.75H3.75C4.30228 10.75 4.75 10.3023 4.75 9.75V8.25C4.75 7.69772 4.30228 7.25 3.75 7.25Z", fill: "#222222" }), /* @__PURE__ */ React.createElement("path", { d: "M9.75 7.25H8.25C7.69772 7.25 7.25 7.69772 7.25 8.25V9.75C7.25 10.3023 7.69772 10.75 8.25 10.75H9.75C10.3023 10.75 10.75 10.3023 10.75 9.75V8.25C10.75 7.69772 10.3023 7.25 9.75 7.25Z", fill: "#222222" }), /* @__PURE__ */ React.createElement("path", { d: "M15.75 7.25H14.25C13.6977 7.25 13.25 7.69772 13.25 8.25V9.75C13.25 10.3023 13.6977 10.75 14.25 10.75H15.75C16.3023 10.75 16.75 10.3023 16.75 9.75V8.25C16.75 7.69772 16.3023 7.25 15.75 7.25Z", fill: "#222222" }), /* @__PURE__ */ React.createElement("path", { d: "M3.75 13.25H2.25C1.69772 13.25 1.25 13.6977 1.25 14.25V15.75C1.25 16.3023 1.69772 16.75 2.25 16.75H3.75C4.30228 16.75 4.75 16.3023 4.75 15.75V14.25C4.75 13.6977 4.30228 13.25 3.75 13.25Z", fill: "#222222" }), /* @__PURE__ */ React.createElement("path", { d: "M9.75 13.25H8.25C7.69772 13.25 7.25 13.6977 7.25 14.25V15.75C7.25 16.3023 7.69772 16.75 8.25 16.75H9.75C10.3023 16.75 10.75 16.3023 10.75 15.75V14.25C10.75 13.6977 10.3023 13.25 9.75 13.25Z", fill: "#222222" }), /* @__PURE__ */ React.createElement("path", { d: "M15.75 13.25H14.25C13.6977 13.25 13.25 13.6977 13.25 14.25V15.75C13.25 16.3023 13.6977 16.75 14.25 16.75H15.75C16.3023 16.75 16.75 16.3023 16.75 15.75V14.25C16.75 13.6977 16.3023 13.25 15.75 13.25Z", fill: "#222222" }));
const SvgInfo = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "currentColor", className: "bi bi-info-circle-fill", viewBox: "0 0 16 16", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" }));
const SvgListView = (props) => /* @__PURE__ */ React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 18 18", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M14.5 4H3.5C3.22386 4 3 4.22386 3 4.5V5.5C3 5.77614 3.22386 6 3.5 6H14.5C14.7761 6 15 5.77614 15 5.5V4.5C15 4.22386 14.7761 4 14.5 4Z", fill: "#222222" }), /* @__PURE__ */ React.createElement("path", { d: "M14.5 8H3.5C3.22386 8 3 8.22386 3 8.5V9.5C3 9.77614 3.22386 10 3.5 10H14.5C14.7761 10 15 9.77614 15 9.5V8.5C15 8.22386 14.7761 8 14.5 8Z", fill: "#222222" }), /* @__PURE__ */ React.createElement("path", { d: "M14.5 12H3.5C3.22386 12 3 12.2239 3 12.5V13.5C3 13.7761 3.22386 14 3.5 14H14.5C14.7761 14 15 13.7761 15 13.5V12.5C15 12.2239 14.7761 12 14.5 12Z", fill: "#222222" }));
const SvgLoading = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", ...props }, /* @__PURE__ */ React.createElement("circle", { className: "opacity-50", cx: 12, cy: 12, r: 10, fill: "white", stroke: "white", strokeWidth: 4 }), /* @__PURE__ */ React.createElement("path", { d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" }));
const SvgNoImage = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 60 74", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M26,85H70a8.009,8.009,0,0,0,8-8V29.941a7.947,7.947,0,0,0-2.343-5.657L64.716,13.343A7.946,7.946,0,0,0,59.059,11H26a8.009,8.009,0,0,0-8,8V77a8.009,8.009,0,0,0,8,8ZM20,19a6.007,6.007,0,0,1,6-6H59.059A5.96,5.96,0,0,1,63.3,14.757L74.242,25.7A5.96,5.96,0,0,1,76,29.941V77a6.007,6.007,0,0,1-6,6H26a6.007,6.007,0,0,1-6-6Zm6.614,51.06h0L68,69.98a.75.75,0,0,0,.545-1.263L57.67,57.129a1.99,1.99,0,0,0-2.808-.028L51.6,60.467l-.024.026-7.087-7.543a1.73,1.73,0,0,0-1.229-.535,1.765,1.765,0,0,0-1.249.5L26.084,68.778a.75.75,0,0,0,.529,1.281Zm26.061-8.548,3.252-3.354a.333.333,0,0,1,.332-.123.463.463,0,0,1,.324.126L66.27,68.484l-7.177.014-6.5-6.916a.735.735,0,0,0,.078-.071Zm-9.611-7.526a.235.235,0,0,1,.168-.069.212.212,0,0,1,.168.068L57.039,68.5l-28.606.055Zm20.05-.43h.079a5.087,5.087,0,0,0,3.583-1.47,5.146,5.146,0,1,0-7.279-.109,5.089,5.089,0,0,0,3.617,1.579Zm-2.456-7.839a3.6,3.6,0,0,1,2.534-1.042h.056a3.7,3.7,0,0,1,2.478,6.34,3.51,3.51,0,0,1-2.589,1.041,3.6,3.6,0,0,1-2.557-1.118,3.715,3.715,0,0,1,.079-5.221Z", transform: "translate(-18 -11)", fill: "#8e8e8e" }));
const SvgPlus = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", ...props }, /* @__PURE__ */ React.createElement("path", { fillRule: "evenodd", d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z", clipRule: "evenodd" }));
const SvgSort = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16.158 16", stroke: "currentColor", ...props }, /* @__PURE__ */ React.createElement("g", { id: "icon-mini-sort", transform: "translate(-4 -8)" }, /* @__PURE__ */ React.createElement("rect", { id: "Placement_area", "data-name": "Placement area", width: 16, height: 16, transform: "translate(4 8)", opacity: 4e-3 }), /* @__PURE__ */ React.createElement("g", { id: "icon", transform: "translate(-290.537 -358.082)" }, /* @__PURE__ */ React.createElement("path", { id: "Path_38562", "data-name": "Path 38562", d: "M309.634,376.594l-1.5,1.5-1.5-1.5", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 }), /* @__PURE__ */ React.createElement("line", { id: "Line_510", "data-name": "Line 510", x2: 6.833, transform: "translate(295.537 373.59)", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 }), /* @__PURE__ */ React.createElement("line", { id: "Line_511", "data-name": "Line 511", x2: 8.121, transform: "translate(295.537 369.726)", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 }), /* @__PURE__ */ React.createElement("line", { id: "Line_511-2", "data-name": "Line 511", y2: 9.017, transform: "translate(308.13 369.082)", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 }), /* @__PURE__ */ React.createElement("line", { id: "Line_512", "data-name": "Line 512", x2: 5.545, transform: "translate(295.537 377.455)", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 }))));
const SvgWarning = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "currentColor", className: "bi bi-exclamation-triangle-fill", viewBox: "0 0 16 16", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" }));
const SvgX = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "currentColor", className: "bi bi-x", viewBox: "0 0 16 16", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" }));
var _jsxFileName$w = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/FilterButton/FilterButton.tsx";
const FilterButton = ({
  displayFilter,
  type,
  title
}) => {
  const translation = useTranslation();
  return type == "mobile" ? u("div", {
    className: "ds-sdk-filter-button",
    children: u("button", {
      className: "flex items-center bg-gray-100 ring-black ring-opacity-5 rounded-md p-sm  outline outline-gray-200 hover:outline-gray-800 h-[32px]",
      onClick: displayFilter,
      children: [u(SvgAdjustments, {
        className: "w-md"
      }, void 0, false, {
        fileName: _jsxFileName$w,
        lineNumber: 34,
        columnNumber: 17
      }, void 0), translation.Filter.title]
    }, void 0, true, {
      fileName: _jsxFileName$w,
      lineNumber: 30,
      columnNumber: 13
    }, void 0)
  }, void 0, false, {
    fileName: _jsxFileName$w,
    lineNumber: 29,
    columnNumber: 9
  }, void 0) : u("div", {
    className: "ds-sdk-filter-button-desktop",
    children: u("button", {
      className: "flex items-center bg-gray-100 ring-black ring-opacity-5 rounded-md p-sm text-sm h-[32px]",
      onClick: displayFilter,
      children: title
    }, void 0, false, {
      fileName: _jsxFileName$w,
      lineNumber: 40,
      columnNumber: 13
    }, void 0)
  }, void 0, false, {
    fileName: _jsxFileName$w,
    lineNumber: 39,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$v = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/Loading/Loading.tsx";
const Loading = ({
  label
}) => {
  const isMobile = window.matchMedia("only screen and (max-width: 768px)").matches;
  return u("div", {
    className: `ds-sdk-loading flex h-screen justify-center items-center ${isMobile ? "loading-spinner-on-mobile" : ""}`,
    children: u("div", {
      className: "ds-sdk-loading__spinner bg-gray-100 rounded-full p-xs flex w-fit my-lg outline-gray-200",
      children: [u(SvgLoading, {
        className: "inline-block mr-xs ml-xs w-md animate-spin fill-primary"
      }, void 0, false, {
        fileName: _jsxFileName$v,
        lineNumber: 27,
        columnNumber: 17
      }, void 0), u("span", {
        className: "ds-sdk-loading__spinner-label p-xs",
        children: label
      }, void 0, false, {
        fileName: _jsxFileName$v,
        lineNumber: 28,
        columnNumber: 17
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$v,
      lineNumber: 26,
      columnNumber: 13
    }, void 0)
  }, void 0, false, {
    fileName: _jsxFileName$v,
    lineNumber: 21,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$u = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/ButtonShimmer/ButtonShimmer.tsx";
const ButtonShimmer = () => {
  return u(Fragment, {
    children: u("div", {
      className: "ds-plp-facets ds-plp-facets--loading",
      children: u("div", {
        className: "ds-plp-facets__button shimmer-animation-button"
      }, void 0, false, {
        fileName: _jsxFileName$u,
        lineNumber: 18,
        columnNumber: 17
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$u,
      lineNumber: 17,
      columnNumber: 13
    }, void 0)
  }, void 0);
};
var _jsxFileName$t = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/FacetsShimmer/FacetsShimmer.tsx";
const FacetsShimmer = () => {
  return u(Fragment, {
    children: [u("div", {
      className: "ds-sdk-input ds-sdk-input--loading",
      children: u("div", {
        className: "ds-sdk-input__content",
        children: [u("div", {
          className: "ds-sdk-input__header",
          children: u("div", {
            className: "ds-sdk-input__title shimmer-animation-facet"
          }, void 0, false, {
            fileName: _jsxFileName$t,
            lineNumber: 20,
            columnNumber: 25
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$t,
          lineNumber: 19,
          columnNumber: 21
        }, void 0), u("div", {
          className: "ds-sdk-input__list",
          children: [u("div", {
            className: "ds-sdk-input__item shimmer-animation-facet"
          }, void 0, false, {
            fileName: _jsxFileName$t,
            lineNumber: 23,
            columnNumber: 25
          }, void 0), u("div", {
            className: "ds-sdk-input__item shimmer-animation-facet"
          }, void 0, false, {
            fileName: _jsxFileName$t,
            lineNumber: 24,
            columnNumber: 25
          }, void 0), u("div", {
            className: "ds-sdk-input__item shimmer-animation-facet"
          }, void 0, false, {
            fileName: _jsxFileName$t,
            lineNumber: 25,
            columnNumber: 25
          }, void 0), u("div", {
            className: "ds-sdk-input__item shimmer-animation-facet"
          }, void 0, false, {
            fileName: _jsxFileName$t,
            lineNumber: 26,
            columnNumber: 25
          }, void 0)]
        }, void 0, true, {
          fileName: _jsxFileName$t,
          lineNumber: 22,
          columnNumber: 21
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$t,
        lineNumber: 18,
        columnNumber: 17
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$t,
      lineNumber: 17,
      columnNumber: 13
    }, void 0), u("div", {
      className: "ds-sdk-input__border border-t mt-md border-gray-200"
    }, void 0, false, {
      fileName: _jsxFileName$t,
      lineNumber: 30,
      columnNumber: 13
    }, void 0)]
  }, void 0);
};
var _jsxFileName$s = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/ProductCardShimmer/ProductCardShimmer.tsx";
const ProductCardShimmer = () => {
  return u("div", {
    className: "ds-sdk-product-item ds-sdk-product-item--shimmer",
    children: [u("div", {
      className: "ds-sdk-product-item__banner shimmer-animation-card"
    }, void 0, false, {
      fileName: _jsxFileName$s,
      lineNumber: 17,
      columnNumber: 13
    }, void 0), u("div", {
      className: "ds-sdk-product-item__content",
      children: [u("div", {
        className: "ds-sdk-product-item__header",
        children: u("div", {
          className: "ds-sdk-product-item__title shimmer-animation-card"
        }, void 0, false, {
          fileName: _jsxFileName$s,
          lineNumber: 20,
          columnNumber: 21
        }, void 0)
      }, void 0, false, {
        fileName: _jsxFileName$s,
        lineNumber: 19,
        columnNumber: 17
      }, void 0), u("div", {
        className: "ds-sdk-product-item__list shimmer-animation-card"
      }, void 0, false, {
        fileName: _jsxFileName$s,
        lineNumber: 22,
        columnNumber: 17
      }, void 0), u("div", {
        className: "ds-sdk-product-item__info shimmer-animation-card"
      }, void 0, false, {
        fileName: _jsxFileName$s,
        lineNumber: 23,
        columnNumber: 17
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$s,
      lineNumber: 18,
      columnNumber: 13
    }, void 0)]
  }, void 0, true, {
    fileName: _jsxFileName$s,
    lineNumber: 16,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$r = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/Shimmer/Shimmer.tsx";
const Shimmer = () => {
  const productCardArray = Array.from({
    length: 8
  });
  const facetsArray = Array.from({
    length: 4
  });
  const {
    screenSize
  } = useSensor();
  const numberOfColumns = screenSize.columns;
  return u("div", {
    className: "ds-widgets bg-body py-2",
    children: u("div", {
      className: "flex",
      children: [u("div", {
        className: "sm:flex ds-widgets-_actions relative max-w-[21rem] w-full h-full px-2 flex-col overflow-y-auto",
        children: [u("div", {
          className: "ds-widgets_actions_header flex justify-between items-center mb-md"
        }, void 0, false, {
          fileName: _jsxFileName$r,
          lineNumber: 28,
          columnNumber: 21
        }, void 0), u("div", {
          className: "flex pb-4 w-full h-full",
          children: u("div", {
            className: "ds-sdk-filter-button-desktop",
            children: u("button", {
              className: "flex items-center bg-gray-100 ring-black ring-opacity-5 rounded-md p-sm text-sm h-[32px]",
              children: u(ButtonShimmer, {}, void 0, false, {
                fileName: _jsxFileName$r,
                lineNumber: 32,
                columnNumber: 33
              }, void 0)
            }, void 0, false, {
              fileName: _jsxFileName$r,
              lineNumber: 31,
              columnNumber: 29
            }, void 0)
          }, void 0, false, {
            fileName: _jsxFileName$r,
            lineNumber: 30,
            columnNumber: 25
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$r,
          lineNumber: 29,
          columnNumber: 21
        }, void 0), u("div", {
          className: "ds-plp-facets flex flex-col",
          children: u("form", {
            className: "ds-plp-facets__list border-t border-gray-200",
            children: facetsArray.map((_, index) => u(FacetsShimmer, {}, index, false, {
              fileName: _jsxFileName$r,
              lineNumber: 39,
              columnNumber: 33
            }, void 0))
          }, void 0, false, {
            fileName: _jsxFileName$r,
            lineNumber: 37,
            columnNumber: 25
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$r,
          lineNumber: 36,
          columnNumber: 21
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$r,
        lineNumber: 27,
        columnNumber: 17
      }, void 0), u("div", {
        className: "ds-widgets_results flex flex-col items-center pt-16 w-full h-full",
        children: [u("div", {
          className: "flex flex-col max-w-5xl lg:max-w-7xl ml-auto w-full h-full",
          children: u("div", {
            className: "flex justify-end mb-[1px]",
            children: u(ButtonShimmer, {}, void 0, false, {
              fileName: _jsxFileName$r,
              lineNumber: 47,
              columnNumber: 29
            }, void 0)
          }, void 0, false, {
            fileName: _jsxFileName$r,
            lineNumber: 46,
            columnNumber: 25
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$r,
          lineNumber: 45,
          columnNumber: 21
        }, void 0), u("div", {
          className: "ds-sdk-product-list__grid mt-md grid-cols-1 gap-y-8 gap-x-md sm:grid-cols-2 md:grid-cols-3 xl:gap-x-4 pl-8",
          style: {
            display: "grid",
            gridTemplateColumns: ` repeat(${numberOfColumns}, minmax(0, 1fr))`
          },
          children: productCardArray.map((_, index) => u(ProductCardShimmer, {}, index, false, {
            fileName: _jsxFileName$r,
            lineNumber: 58,
            columnNumber: 29
          }, void 0))
        }, void 0, false, {
          fileName: _jsxFileName$r,
          lineNumber: 50,
          columnNumber: 21
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$r,
        lineNumber: 44,
        columnNumber: 17
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$r,
      lineNumber: 26,
      columnNumber: 13
    }, void 0)
  }, void 0, false, {
    fileName: _jsxFileName$r,
    lineNumber: 25,
    columnNumber: 9
  }, void 0);
};
const useSliderFacet = ({
  attribute
}) => {
  const searchCtx = useSearch();
  const onChange = (from, to) => {
    var _a;
    const filter = (_a = searchCtx == null ? void 0 : searchCtx.filters) == null ? void 0 : _a.find((e) => e.attribute === attribute);
    if (!filter) {
      const newFilter2 = {
        attribute,
        range: {
          from,
          to
        }
      };
      searchCtx.createFilter(newFilter2);
      return;
    }
    const newFilter = {
      ...filter,
      range: {
        from,
        to
      }
    };
    searchCtx.updateFilter(newFilter);
  };
  return {
    onChange
  };
};
var _jsxFileName$q = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/SliderDoubleControl/SliderDoubleControl.tsx";
const SliderDoubleControl = ({
  filterData
}) => {
  var _a, _b, _c, _d, _e, _f;
  const productsCtx = useProducts();
  const searchCtx = useSearch();
  const min = filterData.buckets[0].from;
  const max = filterData.buckets[filterData.buckets.length - 1].to;
  const preSelectedToPrice = (_c = (_b = (_a = productsCtx.variables.filter) == null ? void 0 : _a.find((obj) => obj.attribute === "price")) == null ? void 0 : _b.range) == null ? void 0 : _c.to;
  const preSelectedFromPrice = (_f = (_e = (_d = productsCtx.variables.filter) == null ? void 0 : _d.find((obj) => obj.attribute === "price")) == null ? void 0 : _e.range) == null ? void 0 : _f.from;
  const [minVal, setMinVal] = t(useState$1(preSelectedFromPrice ? preSelectedFromPrice : min), "minVal");
  const [maxVal, setMaxVal] = t(useState$1(preSelectedToPrice ? preSelectedToPrice : max), "maxVal");
  const {
    onChange
  } = useSliderFacet(filterData);
  const fromSliderId = `fromSlider_${filterData.attribute}`;
  const toSliderId = `toSlider_${filterData.attribute}`;
  const fromInputId = `fromInput_${filterData.attribute}`;
  const toInputId = `toInput_${filterData.attribute}`;
  useEffect$1(() => {
    var _a2, _b2;
    if (((_a2 = searchCtx == null ? void 0 : searchCtx.filters) == null ? void 0 : _a2.length) === 0 || !((_b2 = searchCtx == null ? void 0 : searchCtx.filters) == null ? void 0 : _b2.find((obj) => obj.attribute === filterData.attribute))) {
      setMinVal(min);
      setMaxVal(max);
    }
  }, [searchCtx]);
  useEffect$1(() => {
    const controlFromInput = (fromSlider2, fromInput2, toInput2, controlSlider) => {
      const [from, to] = getParsed(fromInput2, toInput2);
      fillSlider(fromInput2, toInput2, "#C6C6C6", "#383838", controlSlider);
      if (from > to) {
        fromSlider2.value = to;
        fromInput2.value = to;
      } else {
        fromSlider2.value = from;
      }
    };
    const controlToInput = (toSlider2, fromInput2, toInput2, controlSlider) => {
      const [from, to] = getParsed(fromInput2, toInput2);
      fillSlider(fromInput2, toInput2, "#C6C6C6", "#383838", controlSlider);
      if (from <= to) {
        toSlider2.value = to;
        toInput2.value = to;
      } else {
        toInput2.value = from;
      }
    };
    const controlFromSlider = (fromSlider2, toSlider2, fromInput2) => {
      const [from, to] = getParsed(fromSlider2, toSlider2);
      fillSlider(fromSlider2, toSlider2, "#C6C6C6", "#383838", toSlider2);
      if (from > to) {
        setMinVal(to);
        fromSlider2.value = to;
        fromInput2.value = to;
      } else {
        fromInput2.value = from;
      }
    };
    const controlToSlider = (fromSlider2, toSlider2, toInput2) => {
      const [from, to] = getParsed(fromSlider2, toSlider2);
      fillSlider(fromSlider2, toSlider2, "#C6C6C6", "#383838", toSlider2);
      if (from <= to) {
        toSlider2.value = to;
        toInput2.value = to;
      } else {
        setMaxVal(from);
        toInput2.value = from;
        toSlider2.value = from;
      }
    };
    const getParsed = (currentFrom, currentTo) => {
      const from = parseInt(currentFrom.value, 10);
      const to = parseInt(currentTo.value, 10);
      return [from, to];
    };
    const fillSlider = (from, to, sliderColor, rangeColor, controlSlider) => {
      const rangeDistance = to.max - to.min;
      const fromPosition = from.value - to.min;
      const toPosition = to.value - to.min;
      controlSlider.style.background = `linear-gradient(
        to right,
        ${sliderColor} 0%,
        ${sliderColor} ${fromPosition / rangeDistance * 100}%,
        ${rangeColor} ${fromPosition / rangeDistance * 100}%,
        ${rangeColor} ${toPosition / rangeDistance * 100}%,
        ${sliderColor} ${toPosition / rangeDistance * 100}%,
        ${sliderColor} 100%)`;
    };
    const fromSlider = document.querySelector(`#${fromSliderId}`);
    const toSlider = document.querySelector(`#${toSliderId}`);
    const fromInput = document.querySelector(`#${fromInputId}`);
    const toInput = document.querySelector(`#${toInputId}`);
    fillSlider(fromSlider, toSlider, "#C6C6C6", "#383838", toSlider);
    fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromInput);
    toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toInput);
    fromInput.oninput = () => controlFromInput(fromSlider, fromInput, toInput, toSlider);
    toInput.oninput = () => controlToInput(toSlider, fromInput, toInput, toSlider);
  }, [minVal, maxVal]);
  const formatLabel = (price) => {
    const currencyRate = productsCtx.currencyRate ? productsCtx.currencyRate : "1";
    const currencySymbol = productsCtx.currencySymbol ? productsCtx.currencySymbol : "$";
    const label = `${currencySymbol}${price && parseFloat(currencyRate) * parseInt(price.toFixed(0), 10) ? (parseFloat(currencyRate) * parseInt(price.toFixed(0), 10)).toFixed(2) : 0}`;
    return label;
  };
  return u("div", {
    className: "ds-sdk-input pt-md",
    children: [u("label", {
      className: "ds-sdk-input__label text-base font-normal text-gray-900",
      children: filterData.title
    }, void 0, false, {
      fileName: _jsxFileName$q,
      lineNumber: 156,
      columnNumber: 13
    }, void 0), u("div", {
      class: "ds-sdk-slider range_container",
      children: [u("div", {
        class: "sliders_control",
        children: [u("input", {
          className: "ds-sdk-slider__from fromSlider",
          id: fromSliderId,
          type: "range",
          value: minVal,
          min,
          max,
          onInput: ({
            target
          }) => {
            if (target instanceof HTMLInputElement) {
              setMinVal(Math.round(Number(target.value)));
            }
          },
          onMouseUp: () => {
            onChange(minVal, maxVal);
          },
          onTouchEnd: () => {
            onChange(minVal, maxVal);
          },
          onKeyUp: () => {
            onChange(minVal, maxVal);
          }
        }, void 0, false, {
          fileName: _jsxFileName$q,
          lineNumber: 160,
          columnNumber: 21
        }, void 0), u("input", {
          className: "ds-sdk-slider__to toSlider",
          id: toSliderId,
          type: "range",
          value: maxVal,
          min,
          max,
          onInput: ({
            target
          }) => {
            if (target instanceof HTMLInputElement) {
              setMaxVal(Math.round(Number(target.value)));
            }
          },
          onMouseUp: () => {
            onChange(minVal, maxVal);
          },
          onTouchEnd: () => {
            onChange(minVal, maxVal);
          },
          onKeyUp: () => {
            onChange(minVal, maxVal);
          }
        }, void 0, false, {
          fileName: _jsxFileName$q,
          lineNumber: 182,
          columnNumber: 21
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$q,
        lineNumber: 159,
        columnNumber: 17
      }, void 0), u("div", {
        class: "form_control",
        children: [u("div", {
          class: "form_control_container",
          children: [u("div", {
            class: "form_control_container__time",
            children: "Min"
          }, void 0, false, {
            fileName: _jsxFileName$q,
            lineNumber: 207,
            columnNumber: 25
          }, void 0), u("input", {
            class: "form_control_container__time__input",
            type: "number",
            id: fromInputId,
            value: minVal,
            min,
            max,
            onInput: ({
              target
            }) => {
              if (target instanceof HTMLInputElement) {
                setMinVal(Math.round(Number(target.value)));
              }
            },
            onMouseUp: () => {
              onChange(minVal, maxVal);
            },
            onTouchEnd: () => {
              onChange(minVal, maxVal);
            },
            onKeyUp: () => {
              onChange(minVal, maxVal);
            }
          }, void 0, false, {
            fileName: _jsxFileName$q,
            lineNumber: 208,
            columnNumber: 25
          }, void 0)]
        }, void 0, true, {
          fileName: _jsxFileName$q,
          lineNumber: 206,
          columnNumber: 21
        }, void 0), u("div", {
          class: "form_control_container",
          children: [u("div", {
            class: "form_control_container__time",
            children: "Max"
          }, void 0, false, {
            fileName: _jsxFileName$q,
            lineNumber: 232,
            columnNumber: 25
          }, void 0), u("input", {
            class: "form_control_container__time__input",
            type: "number",
            id: toInputId,
            value: maxVal,
            min,
            max,
            onInput: ({
              target
            }) => {
              if (target instanceof HTMLInputElement) {
                setMaxVal(Math.round(Number(target.value)));
              }
            },
            onMouseUp: () => {
              onChange(minVal, maxVal);
            },
            onTouchEnd: () => {
              onChange(minVal, maxVal);
            },
            onKeyUp: () => {
              onChange(minVal, maxVal);
            }
          }, void 0, false, {
            fileName: _jsxFileName$q,
            lineNumber: 233,
            columnNumber: 25
          }, void 0)]
        }, void 0, true, {
          fileName: _jsxFileName$q,
          lineNumber: 231,
          columnNumber: 21
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$q,
        lineNumber: 205,
        columnNumber: 17
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$q,
      lineNumber: 158,
      columnNumber: 13
    }, void 0), u("div", {
      className: `price-range-display__${filterData.attribute} pb-3`,
      children: u("span", {
        className: "ml-sm block-display text-sm font-light text-gray-700",
        children: ["Between ", u("span", {
          className: "min-price text-gray-900 font-semibold",
          children: formatLabel(minVal)
        }, void 0, false, {
          fileName: _jsxFileName$q,
          lineNumber: 261,
          columnNumber: 29
        }, void 0), " and", " ", u("span", {
          className: "max-price text-gray-900 font-semibold",
          children: formatLabel(maxVal)
        }, void 0, false, {
          fileName: _jsxFileName$q,
          lineNumber: 262,
          columnNumber: 21
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$q,
        lineNumber: 260,
        columnNumber: 17
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$q,
      lineNumber: 259,
      columnNumber: 13
    }, void 0), u("div", {
      className: "ds-sdk-input__border border-t mt-md border-gray-200"
    }, void 0, false, {
      fileName: _jsxFileName$q,
      lineNumber: 265,
      columnNumber: 13
    }, void 0)]
  }, void 0, true, {
    fileName: _jsxFileName$q,
    lineNumber: 155,
    columnNumber: 9
  }, void 0);
};
const useRangeFacet = ({
  attribute,
  buckets
}) => {
  var _a;
  const processedBuckets = {};
  buckets.forEach((bucket) => processedBuckets[bucket.title] = {
    from: bucket.from,
    to: bucket.to
  });
  const searchCtx = useSearch();
  const filter = (_a = searchCtx == null ? void 0 : searchCtx.filters) == null ? void 0 : _a.find((e) => e.attribute === attribute);
  const isSelected = (title) => {
    var _a2, _b;
    const selected = filter ? processedBuckets[title].from === ((_a2 = filter.range) == null ? void 0 : _a2.from) && processedBuckets[title].to === ((_b = filter.range) == null ? void 0 : _b.to) : false;
    return selected;
  };
  const onChange = (value) => {
    if (!filter) {
      const newFilter2 = {
        attribute,
        range: {
          from: processedBuckets[value].from,
          to: processedBuckets[value].to
        }
      };
      searchCtx.createFilter(newFilter2);
      return;
    }
    const newFilter = {
      ...filter,
      range: {
        from: processedBuckets[value].from,
        to: processedBuckets[value].to
      }
    };
    searchCtx.updateFilter(newFilter);
  };
  return {
    isSelected,
    onChange
  };
};
var _jsxFileName$p = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/LabelledInput/LabelledInput.tsx";
const LabelledInput = ({
  type,
  checked,
  onChange,
  name,
  label,
  attribute,
  value,
  count
}) => {
  return u("div", {
    className: "ds-sdk-labelled-input flex items-center",
    children: [u("input", {
      id: name,
      name: type === "checkbox" ? `checkbox-group-${attribute}` : `radio-group-${attribute}`,
      type,
      className: "ds-sdk-labelled-input__input focus:ring-0 h-md w-md border-0 cursor-pointer accent-gray-600 min-w-[16px]",
      checked,
      "aria-checked": checked,
      onInput: onChange,
      value
    }, void 0, false, {
      fileName: _jsxFileName$p,
      lineNumber: 37,
      columnNumber: 13
    }, void 0), u("label", {
      htmlFor: name,
      className: "ds-sdk-labelled-input__label ml-sm block-display text-sm font-light text-gray-700 cursor-pointer",
      children: [label, count && u("span", {
        className: "text-[12px] font-light text-gray-700 ml-1",
        children: `(${count})`
      }, void 0, false, {
        fileName: _jsxFileName$p,
        lineNumber: 52,
        columnNumber: 27
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$p,
      lineNumber: 47,
      columnNumber: 13
    }, void 0)]
  }, void 0, true, {
    fileName: _jsxFileName$p,
    lineNumber: 36,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$o = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/InputButtonGroup/InputButtonGroup.tsx";
const numberOfOptionsShown = 5;
const InputButtonGroup = ({
  title,
  attribute,
  buckets,
  isSelected,
  onChange,
  type,
  inputGroupTitleSlot
}) => {
  const translation = useTranslation();
  const productsCtx = useProducts();
  const [showMore, setShowMore] = t(useState$1(buckets.length < numberOfOptionsShown), "showMore");
  const numberOfOptions = showMore ? buckets.length : numberOfOptionsShown;
  const onInputChange = (title2, e) => {
    var _a;
    onChange({
      value: title2,
      selected: (_a = e == null ? void 0 : e.target) == null ? void 0 : _a.checked
    });
  };
  const formatLabel = (title2, bucket) => {
    if (bucket.__typename === "RangeBucket") {
      const currencyRate = productsCtx.currencyRate ? productsCtx.currencyRate : "1";
      const currencySymbol = productsCtx.currencySymbol ? productsCtx.currencySymbol : "$";
      const label = `${currencySymbol}${(bucket == null ? void 0 : bucket.from) && parseFloat(currencyRate) * parseInt(bucket.from.toFixed(0), 10) ? (parseFloat(currencyRate) * parseInt(bucket.from.toFixed(0), 10)).toFixed(2) : 0}${(bucket == null ? void 0 : bucket.to) && parseFloat(currencyRate) * parseInt(bucket.to.toFixed(0), 10) ? ` - ${currencySymbol}${(parseFloat(currencyRate) * parseInt(bucket.to.toFixed(0), 10)).toFixed(2)}` : translation.InputButtonGroup.priceRange}`;
      return label;
    } else if (bucket.__typename === "CategoryView") {
      return productsCtx.categoryPath ? bucket.name ?? bucket.title : bucket.title;
    } else if (bucket.title === BOOLEAN_YES) {
      return title2;
    } else if (bucket.title === BOOLEAN_NO) {
      const excludedMessageTranslation = translation.InputButtonGroup.priceExcludedMessage;
      const excludedMessage = excludedMessageTranslation.replace("{title}", `${title2}`);
      return excludedMessage;
    }
    return bucket.title;
  };
  return u("div", {
    className: "ds-sdk-input pt-md",
    children: [inputGroupTitleSlot ? inputGroupTitleSlot(title) : u("label", {
      className: "ds-sdk-input__label text-base font-normal text-gray-900",
      children: title
    }, void 0, false, {
      fileName: _jsxFileName$o,
      lineNumber: 102,
      columnNumber: 17
    }, void 0), u("fieldset", {
      className: "ds-sdk-input__options mt-md",
      children: u("div", {
        className: "space-y-4",
        children: [buckets.slice(0, numberOfOptions).map((option) => {
          if (!option.title) {
            return null;
          }
          const checked = isSelected(option.title);
          const noShowPriceBucketCount = option.__typename === "RangeBucket";
          return u(LabelledInput, {
            name: `${option.title}-${attribute}`,
            attribute,
            label: formatLabel(title, option),
            checked: !!checked,
            value: option.title,
            count: noShowPriceBucketCount ? null : option.count,
            onChange: (e) => onInputChange(option.title, e),
            type
          }, formatLabel(title, option), false, {
            fileName: _jsxFileName$o,
            lineNumber: 113,
            columnNumber: 29
          }, void 0);
        }), !showMore && buckets.length > numberOfOptionsShown && u("div", {
          className: "ds-sdk-input__fieldset__show-more flex items-center text-gray-700 cursor-pointer",
          onClick: () => setShowMore(true),
          children: [u(SvgPlus, {
            className: "h-md w-md fill-gray-500"
          }, void 0, false, {
            fileName: _jsxFileName$o,
            lineNumber: 131,
            columnNumber: 29
          }, void 0), u("button", {
            type: "button",
            className: "ml-sm font-light cursor-pointer border-none bg-transparent hover:border-none	hover:bg-transparent focus:border-none focus:bg-transparent active:border-none active:bg-transparent active:shadow-none text-sm",
            children: translation.InputButtonGroup.showmore
          }, void 0, false, {
            fileName: _jsxFileName$o,
            lineNumber: 132,
            columnNumber: 29
          }, void 0)]
        }, void 0, true, {
          fileName: _jsxFileName$o,
          lineNumber: 127,
          columnNumber: 25
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$o,
        lineNumber: 105,
        columnNumber: 17
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$o,
      lineNumber: 104,
      columnNumber: 13
    }, void 0), u("div", {
      className: "ds-sdk-input__border border-t mt-md border-gray-200"
    }, void 0, false, {
      fileName: _jsxFileName$o,
      lineNumber: 142,
      columnNumber: 13
    }, void 0)]
  }, void 0, true, {
    fileName: _jsxFileName$o,
    lineNumber: 98,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$n = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/Facets/Range/RangeFacet.tsx";
const RangeFacet = ({
  filterData
}) => {
  const {
    isSelected,
    onChange
  } = useRangeFacet(filterData);
  return u(InputButtonGroup, {
    title: filterData.title,
    attribute: filterData.attribute,
    buckets: filterData.buckets,
    type: "radio",
    isSelected,
    onChange: (e) => {
      onChange(e.value);
    }
  }, void 0, false, {
    fileName: _jsxFileName$n,
    lineNumber: 24,
    columnNumber: 9
  }, void 0);
};
const useScalarFacet = (facet) => {
  var _a;
  const searchCtx = useSearch();
  const filter = (_a = searchCtx == null ? void 0 : searchCtx.filters) == null ? void 0 : _a.find((e) => e.attribute === facet.attribute);
  const isSelected = (attribute) => {
    var _a2;
    const selected = filter ? (_a2 = filter.in) == null ? void 0 : _a2.includes(attribute) : false;
    return selected;
  };
  const onChange = (value, selected) => {
    var _a2, _b, _c, _d;
    if (!filter) {
      const newFilter2 = {
        attribute: facet.attribute,
        in: [value]
      };
      searchCtx.createFilter(newFilter2);
      return;
    }
    const newFilter = {
      ...filter
    };
    const currentFilterIn = filter.in ? filter.in : [];
    newFilter.in = selected ? [...currentFilterIn, value] : (_a2 = filter.in) == null ? void 0 : _a2.filter((e) => e !== value);
    const filterUnselected = (_b = filter.in) == null ? void 0 : _b.filter((x) => {
      var _a3;
      return !((_a3 = newFilter.in) == null ? void 0 : _a3.includes(x));
    });
    if ((_c = newFilter.in) == null ? void 0 : _c.length) {
      if (filterUnselected == null ? void 0 : filterUnselected.length) {
        searchCtx.removeFilter(facet.attribute, filterUnselected[0]);
      }
      searchCtx.updateFilter(newFilter);
      return;
    }
    if (!((_d = newFilter.in) == null ? void 0 : _d.length)) {
      searchCtx.removeFilter(facet.attribute);
      return;
    }
  };
  return {
    isSelected,
    onChange
  };
};
var _jsxFileName$m = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/Facets/Scalar/ScalarFacet.tsx";
const ScalarFacet = ({
  filterData
}) => {
  const {
    isSelected,
    onChange
  } = useScalarFacet(filterData);
  return u(InputButtonGroup, {
    title: filterData.title,
    attribute: filterData.attribute,
    buckets: filterData.buckets,
    type: "checkbox",
    isSelected,
    onChange: (args) => onChange(args.value, args.selected)
  }, void 0, false, {
    fileName: _jsxFileName$m,
    lineNumber: 24,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$l = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/Facets/Facets.tsx";
const Facets = ({
  searchFacets
}) => {
  const {
    config: {
      priceSlider
    }
  } = useStore();
  return u("div", {
    className: "ds-plp-facets flex flex-col",
    children: u("form", {
      className: "ds-plp-facets__list border-t border-gray-200",
      children: searchFacets == null ? void 0 : searchFacets.map((facet) => {
        var _a;
        const bucketType = (_a = facet == null ? void 0 : facet.buckets[0]) == null ? void 0 : _a.__typename;
        switch (bucketType) {
          case "ScalarBucket":
            return u(ScalarFacet, {
              filterData: facet
            }, facet.attribute, false, {
              fileName: _jsxFileName$l,
              lineNumber: 33,
              columnNumber: 36
            }, void 0);
          case "RangeBucket":
            return priceSlider ? u(SliderDoubleControl, {
              filterData: facet
            }, void 0, false, {
              fileName: _jsxFileName$l,
              lineNumber: 36,
              columnNumber: 33
            }, void 0) : u(RangeFacet, {
              filterData: facet
            }, facet.attribute, false, {
              fileName: _jsxFileName$l,
              lineNumber: 38,
              columnNumber: 33
            }, void 0);
          case "CategoryView":
            return u(ScalarFacet, {
              filterData: facet
            }, facet.attribute, false, {
              fileName: _jsxFileName$l,
              lineNumber: 41,
              columnNumber: 36
            }, void 0);
          default:
            return null;
        }
      })
    }, void 0, false, {
      fileName: _jsxFileName$l,
      lineNumber: 28,
      columnNumber: 13
    }, void 0)
  }, void 0, false, {
    fileName: _jsxFileName$l,
    lineNumber: 27,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$k = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/Pill/Pill.tsx";
const defaultIcon = u(SvgPlus, {
  className: "h-[12px] w-[12px] rotate-45 inline-block ml-sm cursor-pointer  fill-gray-700"
}, void 0, false, {
  fileName: _jsxFileName$k,
  lineNumber: 22,
  columnNumber: 5
}, void 0);
const Pill = ({
  label,
  onClick,
  CTA = defaultIcon,
  type
}) => {
  return type === "transparent" ? u("div", {
    className: "ds-sdk-pill inline-flex justify-content items-center rounded-full w-fit min-h-[32px] px-4 py-1",
    children: [u("span", {
      className: "ds-sdk-pill__label font-normal text-sm",
      children: label
    }, void 0, false, {
      fileName: _jsxFileName$k,
      lineNumber: 32,
      columnNumber: 13
    }, void 0), u("span", {
      className: "ds-sdk-pill__cta",
      onClick,
      children: CTA
    }, void 0, false, {
      fileName: _jsxFileName$k,
      lineNumber: 33,
      columnNumber: 13
    }, void 0)]
  }, label, true, {
    fileName: _jsxFileName$k,
    lineNumber: 28,
    columnNumber: 9
  }, void 0) : u("div", {
    className: "ds-sdk-pill inline-flex justify-content items-center bg-gray-100 rounded-full w-fit outline outline-gray-200 min-h-[32px] px-4 py-1",
    children: [u("span", {
      className: "ds-sdk-pill__label font-normal text-sm",
      children: label
    }, void 0, false, {
      fileName: _jsxFileName$k,
      lineNumber: 42,
      columnNumber: 13
    }, void 0), u("span", {
      className: "ds-sdk-pill__cta",
      onClick,
      children: CTA
    }, void 0, false, {
      fileName: _jsxFileName$k,
      lineNumber: 43,
      columnNumber: 13
    }, void 0)]
  }, label, true, {
    fileName: _jsxFileName$k,
    lineNumber: 38,
    columnNumber: 9
  }, void 0);
};
const formatRangeLabel = (filter, currencyRate, currencySymbol) => {
  var _a, _b;
  const range = filter.range;
  const rate = currencyRate ? currencyRate : "1";
  const symbol = currencySymbol ? currencySymbol : "$";
  const label = `${symbol}${(range == null ? void 0 : range.from) && parseFloat(rate) * parseInt(range.from.toFixed(0), 10) ? (_b = parseFloat(rate) * parseInt((_a = range.from) == null ? void 0 : _a.toFixed(0), 10)) == null ? void 0 : _b.toFixed(2) : 0}${(range == null ? void 0 : range.to) && parseFloat(rate) * parseInt(range.to.toFixed(0), 10) ? ` - ${symbol}${(parseFloat(rate) * parseInt(range.to.toFixed(0), 10)).toFixed(2)}` : " and above"}`;
  return label;
};
const formatBinaryLabel = (filter, option, categoryNames, categoryPath) => {
  var _a;
  if (categoryPath && categoryNames) {
    const category = categoryNames.find((facet) => facet.attribute === filter.attribute && facet.value === option);
    if (category == null ? void 0 : category.name) {
      return category.name;
    }
  }
  const title = (_a = filter.attribute) == null ? void 0 : _a.split("_");
  if (option === "yes") {
    return title.join(" ");
  } else if (option === "no") {
    return `not ${title.join(" ")}`;
  }
  return option;
};
var _jsxFileName$j = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/Facets/SelectedFilters.tsx";
const SelectedFilters = ({}) => {
  var _a;
  const searchCtx = useSearch();
  const productsCtx = useProducts();
  const translation = useTranslation();
  return u("div", {
    className: "w-full h-full",
    children: ((_a = searchCtx.filters) == null ? void 0 : _a.length) > 0 && u("div", {
      className: "ds-plp-facets__pills pb-6 sm:pb-6 flex flex-wrap mt-8 justify-start",
      children: [searchCtx.filters.map((filter) => {
        var _a2;
        return u("div", {
          children: [(_a2 = filter.in) == null ? void 0 : _a2.map((option) => u(Pill, {
            label: formatBinaryLabel(filter, option, searchCtx.categoryNames, productsCtx.categoryPath),
            type: "transparent",
            onClick: () => searchCtx.updateFilterOptions(filter, option)
          }, formatBinaryLabel(filter, option, searchCtx.categoryNames, productsCtx.categoryPath), false, {
            fileName: _jsxFileName$j,
            lineNumber: 28,
            columnNumber: 33
          }, void 0)), filter.range && u(Pill, {
            label: formatRangeLabel(filter, productsCtx.currencyRate, productsCtx.currencySymbol),
            type: "transparent",
            onClick: () => {
              searchCtx.removeFilter(filter.attribute);
            }
          }, void 0, false, {
            fileName: _jsxFileName$j,
            lineNumber: 46,
            columnNumber: 33
          }, void 0)]
        }, filter.attribute, true, {
          fileName: _jsxFileName$j,
          lineNumber: 26,
          columnNumber: 25
        }, void 0);
      }), u("div", {
        className: "py-1",
        children: u("button", {
          className: "ds-plp-facets__header__clear-all border-none bg-transparent hover:border-none	hover:bg-transparent focus:border-none focus:bg-transparent active:border-none active:bg-transparent active:shadow-none text-sm px-4",
          onClick: () => searchCtx.clearFilters(),
          children: translation.Filter.clearAll
        }, void 0, false, {
          fileName: _jsxFileName$j,
          lineNumber: 61,
          columnNumber: 25
        }, void 0)
      }, void 0, false, {
        fileName: _jsxFileName$j,
        lineNumber: 60,
        columnNumber: 21
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$j,
      lineNumber: 24,
      columnNumber: 17
    }, void 0)
  }, void 0, false, {
    fileName: _jsxFileName$j,
    lineNumber: 22,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$i = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/CategoryFilters/CategoryFilters.tsx";
const CategoryFilters = ({
  loading,
  pageLoading,
  totalCount,
  facets,
  categoryName,
  phrase,
  setShowFilters,
  filterCount
}) => {
  const translation = useTranslation();
  let title = categoryName || "";
  if (phrase) {
    const text = translation.CategoryFilters.results;
    title = text.replace("{phrase}", `"${phrase}"`);
  }
  const resultsTranslation = translation.CategoryFilters.products;
  const results = resultsTranslation.replace("{totalCount}", `${totalCount}`);
  return u("div", {
    class: "sm:flex ds-widgets-_actions relative max-w-[21rem] w-full h-full px-2 flex-col overflow-y-auto",
    children: [u("div", {
      className: "ds-widgets_actions_header flex justify-between items-center mb-md",
      children: [title && u("span", {
        children: [" ", title]
      }, void 0, true, {
        fileName: _jsxFileName$i,
        lineNumber: 51,
        columnNumber: 27
      }, void 0), !loading && u("span", {
        className: "text-primary text-sm",
        children: results
      }, void 0, false, {
        fileName: _jsxFileName$i,
        lineNumber: 52,
        columnNumber: 30
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$i,
      lineNumber: 50,
      columnNumber: 13
    }, void 0), !pageLoading && facets.length > 0 && u(Fragment, {
      children: [u("div", {
        className: "flex pb-4 w-full h-full",
        children: u(FilterButton, {
          displayFilter: () => setShowFilters(false),
          type: "desktop",
          title: `${translation.Filter.hideTitle}${filterCount > 0 ? ` (${filterCount})` : ""}`
        }, void 0, false, {
          fileName: _jsxFileName$i,
          lineNumber: 58,
          columnNumber: 25
        }, void 0)
      }, void 0, false, {
        fileName: _jsxFileName$i,
        lineNumber: 57,
        columnNumber: 21
      }, void 0), u(Facets, {
        searchFacets: facets
      }, void 0, false, {
        fileName: _jsxFileName$i,
        lineNumber: 64,
        columnNumber: 21
      }, void 0)]
    }, void 0, true)]
  }, void 0, true, {
    fileName: _jsxFileName$i,
    lineNumber: 49,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$h = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/Alert/Alert.tsx";
const Alert = ({
  title,
  type,
  description,
  url,
  onClick
}) => {
  return u("div", {
    className: "mx-auto max-w-8xl",
    children: (() => {
      switch (type) {
        case "error":
          return u("div", {
            className: "rounded-md bg-red-50 p-4",
            children: u("div", {
              className: "flex items-center",
              children: [u("div", {
                className: "flex-shrink-0 p-1",
                children: u(SvgError, {
                  className: "h-5 w-5 text-red-400",
                  "aria-hidden": "true"
                }, void 0, false, {
                  fileName: _jsxFileName$h,
                  lineNumber: 33,
                  columnNumber: 41
                }, void 0)
              }, void 0, false, {
                fileName: _jsxFileName$h,
                lineNumber: 32,
                columnNumber: 37
              }, void 0), u("div", {
                className: "ml-3",
                children: [u("h3", {
                  className: "text-sm font-medium text-red-800",
                  children: title
                }, void 0, false, {
                  fileName: _jsxFileName$h,
                  lineNumber: 36,
                  columnNumber: 41
                }, void 0), description.length > 0 && u("div", {
                  className: "mt-2 text-sm text-red-700",
                  children: u("p", {
                    children: description
                  }, void 0, false, {
                    fileName: _jsxFileName$h,
                    lineNumber: 39,
                    columnNumber: 49
                  }, void 0)
                }, void 0, false, {
                  fileName: _jsxFileName$h,
                  lineNumber: 38,
                  columnNumber: 45
                }, void 0)]
              }, void 0, true, {
                fileName: _jsxFileName$h,
                lineNumber: 35,
                columnNumber: 37
              }, void 0)]
            }, void 0, true, {
              fileName: _jsxFileName$h,
              lineNumber: 31,
              columnNumber: 33
            }, void 0)
          }, void 0, false, {
            fileName: _jsxFileName$h,
            lineNumber: 30,
            columnNumber: 29
          }, void 0);
        case "warning":
          return u("div", {
            className: "rounded-md bg-yellow-50 p-4",
            children: u("div", {
              className: "flex items-center",
              children: [u("div", {
                className: "flex-shrink-0 p-1",
                children: u(SvgWarning, {
                  className: "h-5 w-5 text-yellow-400",
                  "aria-hidden": "true"
                }, void 0, false, {
                  fileName: _jsxFileName$h,
                  lineNumber: 51,
                  columnNumber: 41
                }, void 0)
              }, void 0, false, {
                fileName: _jsxFileName$h,
                lineNumber: 50,
                columnNumber: 37
              }, void 0), u("div", {
                className: "ml-3",
                children: [u("h3", {
                  className: "text-sm font-medium text-yellow-800",
                  children: title
                }, void 0, false, {
                  fileName: _jsxFileName$h,
                  lineNumber: 54,
                  columnNumber: 41
                }, void 0), description.length > 0 && u("div", {
                  className: "mt-2 text-sm text-yellow-700",
                  children: u("p", {
                    children: description
                  }, void 0, false, {
                    fileName: _jsxFileName$h,
                    lineNumber: 57,
                    columnNumber: 49
                  }, void 0)
                }, void 0, false, {
                  fileName: _jsxFileName$h,
                  lineNumber: 56,
                  columnNumber: 45
                }, void 0)]
              }, void 0, true, {
                fileName: _jsxFileName$h,
                lineNumber: 53,
                columnNumber: 37
              }, void 0)]
            }, void 0, true, {
              fileName: _jsxFileName$h,
              lineNumber: 49,
              columnNumber: 33
            }, void 0)
          }, void 0, false, {
            fileName: _jsxFileName$h,
            lineNumber: 48,
            columnNumber: 29
          }, void 0);
        case "info":
          return u("div", {
            className: "rounded-md bg-blue-50 p-4",
            children: u("div", {
              className: "flex items-center",
              children: [u("div", {
                className: "flex-shrink-0 p-1",
                children: u(SvgInfo, {
                  className: "h-5 w-5 text-blue-400",
                  "aria-hidden": "true"
                }, void 0, false, {
                  fileName: _jsxFileName$h,
                  lineNumber: 69,
                  columnNumber: 41
                }, void 0)
              }, void 0, false, {
                fileName: _jsxFileName$h,
                lineNumber: 68,
                columnNumber: 37
              }, void 0), u("div", {
                className: "ml-3 flex-1 md:flex md:justify-between",
                children: [u("div", {
                  children: [u("h3", {
                    className: "text-sm font-medium text-blue-800",
                    children: title
                  }, void 0, false, {
                    fileName: _jsxFileName$h,
                    lineNumber: 73,
                    columnNumber: 45
                  }, void 0), description.length > 0 && u("div", {
                    className: "mt-2 text-sm text-blue-700",
                    children: u("p", {
                      children: description
                    }, void 0, false, {
                      fileName: _jsxFileName$h,
                      lineNumber: 76,
                      columnNumber: 53
                    }, void 0)
                  }, void 0, false, {
                    fileName: _jsxFileName$h,
                    lineNumber: 75,
                    columnNumber: 49
                  }, void 0)]
                }, void 0, true, {
                  fileName: _jsxFileName$h,
                  lineNumber: 72,
                  columnNumber: 41
                }, void 0), u("div", {
                  className: "mt-4 text-sm md:ml-6",
                  children: u("a", {
                    href: url,
                    className: "whitespace-nowrap font-medium text-blue-700 hover:text-blue-600",
                    children: ["Details", u("span", {
                      "aria-hidden": "true",
                      children: "→"
                    }, void 0, false, {
                      fileName: _jsxFileName$h,
                      lineNumber: 86,
                      columnNumber: 49
                    }, void 0)]
                  }, void 0, true, {
                    fileName: _jsxFileName$h,
                    lineNumber: 81,
                    columnNumber: 45
                  }, void 0)
                }, void 0, false, {
                  fileName: _jsxFileName$h,
                  lineNumber: 80,
                  columnNumber: 41
                }, void 0)]
              }, void 0, true, {
                fileName: _jsxFileName$h,
                lineNumber: 71,
                columnNumber: 37
              }, void 0)]
            }, void 0, true, {
              fileName: _jsxFileName$h,
              lineNumber: 67,
              columnNumber: 33
            }, void 0)
          }, void 0, false, {
            fileName: _jsxFileName$h,
            lineNumber: 66,
            columnNumber: 29
          }, void 0);
        case "success":
          return u("div", {
            className: "rounded-md bg-green-50 p-4",
            children: u("div", {
              className: "flex items-center",
              children: [u("div", {
                className: "flex-shrink-0 p-1",
                children: u(SvgCheckmark, {
                  className: "h-5 w-5 text-green-400",
                  "aria-hidden": "true"
                }, void 0, false, {
                  fileName: _jsxFileName$h,
                  lineNumber: 98,
                  columnNumber: 41
                }, void 0)
              }, void 0, false, {
                fileName: _jsxFileName$h,
                lineNumber: 97,
                columnNumber: 37
              }, void 0), u("div", {
                className: "ml-3",
                children: [u("h3", {
                  className: "text-sm font-medium text-green-800",
                  children: title
                }, void 0, false, {
                  fileName: _jsxFileName$h,
                  lineNumber: 101,
                  columnNumber: 41
                }, void 0), description.length > 0 && u("div", {
                  className: "mt-2 text-sm text-green-700",
                  children: u("p", {
                    children: description
                  }, void 0, false, {
                    fileName: _jsxFileName$h,
                    lineNumber: 104,
                    columnNumber: 49
                  }, void 0)
                }, void 0, false, {
                  fileName: _jsxFileName$h,
                  lineNumber: 103,
                  columnNumber: 45
                }, void 0)]
              }, void 0, true, {
                fileName: _jsxFileName$h,
                lineNumber: 100,
                columnNumber: 37
              }, void 0), u("div", {
                className: "ml-auto",
                children: u("div", {
                  className: "md:ml-6",
                  children: u("button", {
                    type: "button",
                    className: "inline-flex rounded-md bg-green-50 p-1.5 text-green-500 ring-off hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50",
                    children: [u("span", {
                      className: "sr-only",
                      children: "Dismiss"
                    }, void 0, false, {
                      fileName: _jsxFileName$h,
                      lineNumber: 114,
                      columnNumber: 49
                    }, void 0), u(SvgX, {
                      className: "h-5 w-5",
                      "aria-hidden": "true",
                      onClick
                    }, void 0, false, {
                      fileName: _jsxFileName$h,
                      lineNumber: 115,
                      columnNumber: 49
                    }, void 0)]
                  }, void 0, true, {
                    fileName: _jsxFileName$h,
                    lineNumber: 110,
                    columnNumber: 45
                  }, void 0)
                }, void 0, false, {
                  fileName: _jsxFileName$h,
                  lineNumber: 109,
                  columnNumber: 41
                }, void 0)
              }, void 0, false, {
                fileName: _jsxFileName$h,
                lineNumber: 108,
                columnNumber: 37
              }, void 0)]
            }, void 0, true, {
              fileName: _jsxFileName$h,
              lineNumber: 96,
              columnNumber: 33
            }, void 0)
          }, void 0, false, {
            fileName: _jsxFileName$h,
            lineNumber: 95,
            columnNumber: 29
          }, void 0);
      }
    })()
  }, void 0, false, {
    fileName: _jsxFileName$h,
    lineNumber: 25,
    columnNumber: 9
  }, void 0);
};
const ELLIPSIS = "...";
const getRange = (start, end) => {
  const length = end - start + 1;
  return Array.from({
    length
  }, (_, index) => start + index);
};
const usePagination = ({
  currentPage,
  totalPages,
  siblingCount = 1
}) => {
  const paginationRange = t(useMemo$1(() => {
    const firstPageIndex = 1;
    const lastPageIndex = totalPages;
    const totalPagePills = siblingCount + 5;
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 2;
    if (totalPages <= totalPagePills) {
      return getRange(1, totalPages);
    }
    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = getRange(1, leftItemCount);
      return [...leftRange, ELLIPSIS, totalPages];
    }
    if (showLeftDots && !showRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = getRange(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, ELLIPSIS, ...rightRange];
    }
    if (showLeftDots && showRightDots) {
      const middleRange = getRange(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, ELLIPSIS, ...middleRange, ELLIPSIS, lastPageIndex];
    }
  }, [currentPage, totalPages, siblingCount]), "paginationRange: (string | number)[] | undefined");
  return paginationRange;
};
var _jsxFileName$g = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/Pagination/Pagination.tsx";
const Pagination = ({
  onPageChange,
  totalPages,
  currentPage
}) => {
  const productsCtx = useProducts();
  const paginationRange = usePagination({
    currentPage,
    totalPages
  });
  useEffect(() => {
    const {
      currentPage: currentPage2,
      totalPages: totalPages2
    } = productsCtx;
    if (currentPage2 > totalPages2) {
      onPageChange(totalPages2);
    }
    return () => {
    };
  }, [productsCtx, onPageChange]);
  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  const onNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  return u("ul", {
    className: "ds-plp-pagination flex justify-center items-center mt-2 mb-6 list-none",
    children: [u(SvgChevron, {
      className: `h-sm w-sm transform rotate-90 ${currentPage === 1 ? "stroke-gray-400 cursor-not-allowed" : "stroke-gray-600 cursor-pointer"}`,
      onClick: onPrevious
    }, void 0, false, {
      fileName: _jsxFileName$g,
      lineNumber: 53,
      columnNumber: 13
    }, void 0), paginationRange == null ? void 0 : paginationRange.map((page) => {
      if (page === ELLIPSIS) {
        return u("li", {
          className: "ds-plp-pagination__dots text-gray-500 mx-sm my-auto",
          children: "..."
        }, page, false, {
          fileName: _jsxFileName$g,
          lineNumber: 63,
          columnNumber: 25
        }, void 0);
      }
      return u("li", {
        className: `ds-plp-pagination__item flex items-center cursor-pointer text-center text-gray-500 my-auto mx-sm ${currentPage === page ? "ds-plp-pagination__item--current text-black font-medium underline underline-offset-4 decoration-black" : ""}`,
        onClick: () => onPageChange(page),
        children: page
      }, page, false, {
        fileName: _jsxFileName$g,
        lineNumber: 70,
        columnNumber: 21
      }, void 0);
    }), u(SvgChevron, {
      className: `h-sm w-sm transform -rotate-90 ${currentPage === totalPages ? "stroke-gray-400 cursor-not-allowed" : "stroke-gray-600 cursor-pointer"}`,
      onClick: onNext
    }, void 0, false, {
      fileName: _jsxFileName$g,
      lineNumber: 84,
      columnNumber: 13
    }, void 0)]
  }, void 0, true, {
    fileName: _jsxFileName$g,
    lineNumber: 52,
    columnNumber: 9
  }, void 0);
};
const registerOpenDropdownHandlers = ({
  options,
  activeIndex,
  setActiveIndex,
  select
}) => {
  const optionsLength = options.length;
  const keyDownCallback = (e) => {
    e.preventDefault();
    switch (e.key) {
      case "Up":
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex(activeIndex <= 0 ? optionsLength - 1 : activeIndex - 1);
        return;
      case "Down":
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex(activeIndex + 1 === optionsLength ? 0 : activeIndex + 1);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        select(options[activeIndex].value);
        return;
      case "Esc":
      case "Escape":
        e.preventDefault();
        select(null);
        return;
      case "PageUp":
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        return;
      case "PageDown":
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        return;
    }
  };
  document.addEventListener("keydown", keyDownCallback);
  return () => {
    document.removeEventListener("keydown", keyDownCallback);
  };
};
const registerClosedDropdownHandlers = ({
  setIsDropdownOpen
}) => {
  const keyDownCallback = (e) => {
    switch (e.key) {
      case "Up":
      case "ArrowUp":
      case "Down":
      case "ArrowDown":
      case " ":
      case "Enter":
        e.preventDefault();
        setIsDropdownOpen(true);
    }
  };
  document.addEventListener("keydown", keyDownCallback);
  return () => {
    document.removeEventListener("keydown", keyDownCallback);
  };
};
const isSafari = () => {
  const chromeInAgent = navigator.userAgent.indexOf("Chrome") > -1;
  const safariInAgent = navigator.userAgent.indexOf("Safari") > -1;
  return safariInAgent && !chromeInAgent;
};
const useAccessibleDropdown = ({
  options,
  value,
  onChange
}) => {
  const [isDropdownOpen, setIsDropdownOpenInternal] = t(useState(false), "isDropdownOpen");
  const listRef = t(useRef(null), "listRef");
  const [activeIndex, setActiveIndex] = t(useState(0), "activeIndex");
  const [isFocus, setIsFocus] = t(useState(false), "isFocus");
  const select = (value2) => {
    if (value2) {
      onChange && onChange(value2);
    }
    setIsDropdownOpen(false);
    setIsFocus(false);
  };
  const setIsDropdownOpen = (v) => {
    if (v) {
      const selected = options == null ? void 0 : options.findIndex((o) => o.value === value);
      setActiveIndex(selected < 0 ? 0 : selected);
      if (listRef.current && isSafari()) {
        requestAnimationFrame(() => {
          var _a;
          (_a = listRef == null ? void 0 : listRef.current) == null ? void 0 : _a.focus();
        });
      }
    } else if (listRef.current && isSafari()) {
      requestAnimationFrame(() => {
        var _a, _b;
        (_b = (_a = listRef == null ? void 0 : listRef.current) == null ? void 0 : _a.previousSibling) == null ? void 0 : _b.focus();
      });
    }
    setIsDropdownOpenInternal(v);
  };
  useEffect(() => {
    if (isDropdownOpen) {
      return registerOpenDropdownHandlers({
        activeIndex,
        setActiveIndex,
        options,
        select
      });
    }
    if (isFocus) {
      return registerClosedDropdownHandlers({
        setIsDropdownOpen
      });
    }
  }, [isDropdownOpen, activeIndex, isFocus]);
  return {
    isDropdownOpen,
    setIsDropdownOpen,
    activeIndex,
    setActiveIndex,
    select,
    setIsFocus,
    listRef
  };
};
var _jsxFileName$f = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/PerPagePicker/PerPagePicker.tsx";
const PerPagePicker = ({
  value,
  pageSizeOptions,
  onChange
}) => {
  const pageSizeButton = t(useRef(null), "pageSizeButton");
  const pageSizeMenu = t(useRef(null), "pageSizeMenu");
  const selectedOption = pageSizeOptions.find((e) => e.value === value);
  const {
    isDropdownOpen,
    setIsDropdownOpen,
    activeIndex,
    setActiveIndex,
    select,
    setIsFocus,
    listRef
  } = useAccessibleDropdown({
    options: pageSizeOptions,
    value,
    onChange
  });
  useEffect(() => {
    const menuRef = pageSizeMenu.current;
    const handleBlur = () => {
      setIsFocus(false);
      setIsDropdownOpen(false);
    };
    const handleFocus = () => {
      var _a;
      if (((_a = menuRef == null ? void 0 : menuRef.parentElement) == null ? void 0 : _a.querySelector(":hover")) !== menuRef) {
        setIsFocus(false);
        setIsDropdownOpen(false);
      }
    };
    menuRef == null ? void 0 : menuRef.addEventListener("blur", handleBlur);
    menuRef == null ? void 0 : menuRef.addEventListener("focusin", handleFocus);
    menuRef == null ? void 0 : menuRef.addEventListener("focusout", handleFocus);
    return () => {
      menuRef == null ? void 0 : menuRef.removeEventListener("blur", handleBlur);
      menuRef == null ? void 0 : menuRef.removeEventListener("focusin", handleFocus);
      menuRef == null ? void 0 : menuRef.removeEventListener("focusout", handleFocus);
    };
  }, [pageSizeMenu]);
  return u(Fragment, {
    children: u("div", {
      ref: pageSizeMenu,
      className: "ds-sdk-per-page-picker ml-2 mr-2 relative inline-block text-left bg-gray-100 rounded-md outline outline-1 outline-gray-200 hover:outline-gray-600 h-[32px]",
      children: [u("button", {
        className: "group flex justify-center items-center font-normal text-sm text-gray-700 rounded-md hover:cursor-pointer border-none bg-transparent hover:border-none hover:bg-transparent focus:border-none focus:bg-transparent active:border-none active:bg-transparent active:shadow-none h-full w-full px-sm",
        ref: pageSizeButton,
        onClick: () => setIsDropdownOpen(!isDropdownOpen),
        onFocus: () => setIsFocus(false),
        onBlur: () => setIsFocus(false),
        children: [selectedOption ? `${selectedOption.label}` : "24", u(SvgChevron, {
          className: `flex-shrink-0 m-auto ml-sm h-md w-md stroke-1 stroke-gray-600 ${isDropdownOpen ? "" : "rotate-180"}`
        }, void 0, false, {
          fileName: _jsxFileName$f,
          lineNumber: 80,
          columnNumber: 21
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$f,
        lineNumber: 72,
        columnNumber: 17
      }, void 0), isDropdownOpen && u("ul", {
        ref: listRef,
        className: "ds-sdk-per-page-picker__items origin-top-right absolute hover:cursor-pointer right-0 w-full rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none mt-2 z-20",
        children: pageSizeOptions.map((option, i) => u("li", {
          "aria-selected": option.value === (selectedOption == null ? void 0 : selectedOption.value),
          onMouseOver: () => setActiveIndex(i),
          className: `py-xs hover:bg-gray-100 hover:text-gray-900 ${i === activeIndex ? "bg-gray-100 text-gray-900" : ""}}`,
          children: u("a", {
            className: `ds-sdk-per-page-picker__items--item block-display px-md py-sm text-sm mb-0
              no-underline active:no-underline focus:no-underline hover:no-underline
              hover:text-gray-900 ${option.value === (selectedOption == null ? void 0 : selectedOption.value) ? "ds-sdk-per-page-picker__items--item-selected font-semibold text-gray-900" : "font-normal text-gray-800"}`,
            onClick: () => select(option.value),
            children: option.label
          }, void 0, false, {
            fileName: _jsxFileName$f,
            lineNumber: 100,
            columnNumber: 33
          }, void 0)
        }, i, false, {
          fileName: _jsxFileName$f,
          lineNumber: 92,
          columnNumber: 29
        }, void 0))
      }, void 0, false, {
        fileName: _jsxFileName$f,
        lineNumber: 87,
        columnNumber: 21
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$f,
      lineNumber: 68,
      columnNumber: 13
    }, void 0)
  }, void 0);
};
var _jsxFileName$e = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/AddToCartButton/AddToCartButton.tsx";
const AddToCartButton = ({
  onClick
}) => {
  return u("div", {
    className: "ds-sdk-add-to-cart-button",
    children: u("button", {
      className: "flex items-center justify-center text-white text-sm rounded-full h-[32px] w-full p-sm",
      style: {
        "background-color": `#464646`
      },
      onClick,
      children: [u(SvgCart, {
        className: "w-[24px] pr-4"
      }, void 0, false, {
        fileName: _jsxFileName$e,
        lineNumber: 27,
        columnNumber: 17
      }, void 0), "Add To Cart"]
    }, void 0, true, {
      fileName: _jsxFileName$e,
      lineNumber: 20,
      columnNumber: 13
    }, void 0)
  }, void 0, false, {
    fileName: _jsxFileName$e,
    lineNumber: 19,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$d = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/ImageCarousel/Image.tsx";
const Image = ({
  image,
  alt,
  carouselIndex,
  index
}) => {
  const imageRef = t(useRef$1(null), "imageRef");
  const [imageUrl, setImageUrl] = t(useState$1(""), "imageUrl");
  const [isVisible, setIsVisible] = t(useState$1(false), "isVisible");
  const entry = useIntersectionObserver(imageRef, {
    rootMargin: "200px"
  });
  useEffect$1(() => {
    var _a;
    if (!entry) return;
    if ((entry == null ? void 0 : entry.isIntersecting) && index === carouselIndex) {
      setIsVisible(true);
      setImageUrl(((_a = entry == null ? void 0 : entry.target) == null ? void 0 : _a.dataset.src) || "");
    }
  }, [entry, carouselIndex, index, image]);
  return u("img", {
    className: `aspect-auto w-100 h-auto ${isVisible ? "visible" : "invisible"}`,
    ref: imageRef,
    src: imageUrl,
    "data-src": typeof image === "object" ? image.src : image,
    srcset: typeof image === "object" ? image.srcset : null,
    alt
  }, void 0, false, {
    fileName: _jsxFileName$d,
    lineNumber: 32,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$c = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/ImageCarousel/ImageCarousel.tsx";
const ImageCarousel = ({
  images,
  productName,
  carouselIndex,
  setCarouselIndex
}) => {
  const [swipeIndex, setSwipeIndex] = t(useState$1(0), "swipeIndex");
  const cirHandler = (index) => {
    setCarouselIndex(index);
  };
  const prevHandler = () => {
    if (carouselIndex === 0) {
      setCarouselIndex(0);
    } else {
      setCarouselIndex((prev) => prev - 1);
    }
  };
  const nextHandler = () => {
    if (carouselIndex === images.length - 1) {
      setCarouselIndex(0);
    } else {
      setCarouselIndex((prev) => prev + 1);
    }
  };
  return u(Fragment, {
    children: u("div", {
      class: "ds-sdk-product-image-carousel max-h-[250px] max-w-2xl m-auto",
      children: [u("div", {
        className: "flex flex-nowrap overflow-hidden relative rounded-lg w-full h-full",
        onTouchStart: (e) => setSwipeIndex(e.touches[0].clientX),
        onTouchEnd: (e) => {
          const endIndex = e.changedTouches[0].clientX;
          if (swipeIndex > endIndex) {
            nextHandler();
          } else if (swipeIndex < endIndex) {
            prevHandler();
          }
        },
        children: u("div", {
          className: "overflow-hidden relative max-w-[200px]",
          children: u("div", {
            className: `flex transition ease-out duration-40`,
            style: {
              transform: `translateX(-${carouselIndex * 100}%)`
            },
            children: images.map((item, index) => {
              return u(Image, {
                image: item,
                carouselIndex,
                index,
                alt: productName
              }, index, false, {
                fileName: _jsxFileName$c,
                lineNumber: 72,
                columnNumber: 37
              }, void 0);
            })
          }, void 0, false, {
            fileName: _jsxFileName$c,
            lineNumber: 64,
            columnNumber: 25
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$c,
          lineNumber: 63,
          columnNumber: 21
        }, void 0)
      }, void 0, false, {
        fileName: _jsxFileName$c,
        lineNumber: 51,
        columnNumber: 17
      }, void 0), images.length > 1 && u("div", {
        className: "absolute z-1 flex space-x-3 -translate-x-1/2 bottom-0 left-1/2 pb-2 ",
        children: images.map((_item, index) => {
          return u("span", {
            style: carouselIndex === index ? {
              width: `12px`,
              height: `12px`,
              "border-radius": `50%`,
              border: `1px solid black`,
              cursor: `pointer`,
              "background-color": `#252525`
            } : {
              width: `12px`,
              height: `12px`,
              "border-radius": `50%`,
              border: `1px solid silver`,
              cursor: `pointer`,
              "background-color": `silver`
            },
            onClick: (e) => {
              e.preventDefault();
              cirHandler(index);
            }
          }, index, false, {
            fileName: _jsxFileName$c,
            lineNumber: 88,
            columnNumber: 33
          }, void 0);
        })
      }, void 0, false, {
        fileName: _jsxFileName$c,
        lineNumber: 85,
        columnNumber: 21
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$c,
      lineNumber: 50,
      columnNumber: 13
    }, void 0)
  }, void 0);
};
var _jsxFileName$b = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/SwatchButton/SwatchButton.tsx";
const SwatchButton = ({
  id,
  value,
  type,
  checked,
  onClick
}) => {
  const outlineColor = checked ? "border-black" : type === "COLOR_HEX" ? "border-transparent" : "border-gray";
  if (type === "COLOR_HEX") {
    const color = value.toLowerCase();
    const className2 = `min-w-[32px] rounded-full p-sm border border-[1.5px] ${outlineColor} h-[32px] outline-transparent`;
    const isWhite = color === "#ffffff" || color === "#fff";
    return u("div", {
      className: `ds-sdk-swatch-button_${id}`,
      children: u("button", {
        className: className2,
        style: {
          backgroundColor: color,
          border: !checked && isWhite ? "1px solid #ccc" : void 0
        },
        onClick,
        checked
      }, id, false, {
        fileName: _jsxFileName$b,
        lineNumber: 34,
        columnNumber: 17
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$b,
      lineNumber: 33,
      columnNumber: 13
    }, void 0);
  }
  if (type === "IMAGE" && value) {
    const className2 = `object-cover object-center min-w-[32px] rounded-full p-sm border border-[1.5px] ${outlineColor} h-[32px] outline-transparent`;
    const style = `background: url(${value}) no-repeat center; background-size: initial`;
    return u("div", {
      className: `ds-sdk-swatch-button_${value}`,
      children: u("button", {
        className: className2,
        style,
        onClick,
        checked
      }, id, false, {
        fileName: _jsxFileName$b,
        lineNumber: 53,
        columnNumber: 17
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$b,
      lineNumber: 52,
      columnNumber: 13
    }, void 0);
  }
  const className = `flex items-center bg-white rounded-full p-sm border border-[1.5px]h-[32px] ${outlineColor} outline-transparent`;
  return u("div", {
    className: `ds-sdk-swatch-button_${value}`,
    children: u("button", {
      className,
      onClick,
      checked,
      children: value
    }, id, false, {
      fileName: _jsxFileName$b,
      lineNumber: 62,
      columnNumber: 13
    }, void 0)
  }, void 0, false, {
    fileName: _jsxFileName$b,
    lineNumber: 61,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$a = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/SwatchButtonGroup/SwatchButtonGroup.tsx";
const MAX_SWATCHES = 5;
const SwatchButtonGroup = ({
  isSelected,
  swatches,
  showMore,
  productUrl,
  onClick,
  sku
}) => {
  const moreSwatches = swatches.length > MAX_SWATCHES;
  const numberOfOptions = moreSwatches ? MAX_SWATCHES - 1 : swatches.length;
  return u("div", {
    className: "ds-sdk-product-item__product-swatch-group flex column items-center space-x-2",
    children: moreSwatches ? u("div", {
      className: "flex",
      children: [swatches.slice(0, numberOfOptions).map((swatch) => {
        const checked = isSelected(swatch.id);
        return swatch && swatch.type == "COLOR_HEX" && u("div", {
          className: "ds-sdk-product-item__product-swatch-item mr-2 text-sm text-primary",
          children: u(SwatchButton, {
            id: swatch.id,
            value: swatch.value,
            type: swatch.type,
            checked: !!checked,
            onClick: () => onClick([swatch.id], sku)
          }, void 0, false, {
            fileName: _jsxFileName$a,
            lineNumber: 46,
            columnNumber: 37
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$a,
          lineNumber: 45,
          columnNumber: 33
        }, void 0);
      }), u("a", {
        href: productUrl,
        className: "hover:no-underline",
        children: u("div", {
          className: "ds-sdk-product-item__product-swatch-item text-sm text-primary",
          children: u(SwatchButton, {
            id: "show-more",
            value: `+${swatches.length - numberOfOptions}`,
            type: "TEXT",
            checked: false,
            onClick: showMore
          }, void 0, false, {
            fileName: _jsxFileName$a,
            lineNumber: 59,
            columnNumber: 29
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$a,
          lineNumber: 58,
          columnNumber: 25
        }, void 0)
      }, void 0, false, {
        fileName: _jsxFileName$a,
        lineNumber: 57,
        columnNumber: 21
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$a,
      lineNumber: 39,
      columnNumber: 17
    }, void 0) : swatches.slice(0, numberOfOptions).map((swatch) => {
      const checked = isSelected(swatch.id);
      return swatch && swatch.type == "COLOR_HEX" && u("div", {
        className: "ds-sdk-product-item__product-swatch-item text-sm text-primary",
        children: u(SwatchButton, {
          id: swatch.id,
          value: swatch.value,
          type: swatch.type,
          checked: !!checked,
          onClick: () => onClick([swatch.id], sku)
        }, void 0, false, {
          fileName: _jsxFileName$a,
          lineNumber: 76,
          columnNumber: 33
        }, void 0)
      }, void 0, false, {
        fileName: _jsxFileName$a,
        lineNumber: 75,
        columnNumber: 29
      }, void 0);
    })
  }, void 0, false, {
    fileName: _jsxFileName$a,
    lineNumber: 37,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$9 = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/ProductItem/ProductPrice.tsx";
const ProductPrice = ({
  isComplexProductView,
  item,
  isBundle,
  isGrouped,
  isGiftCard,
  isConfigurable,
  discount,
  currencySymbol,
  currencyRate
}) => {
  var _a, _b, _c;
  const translation = useContext(TranslationContext);
  let price;
  if ("product" in item) {
    price = (_c = (_b = (_a = item.productView) == null ? void 0 : _a.price) == null ? void 0 : _b.final) == null ? void 0 : _c.amount;
  }
  const getBundledPrice = (item2, currencySymbol2, currencyRate2) => {
    const bundlePriceTranslationOrder = translation.ProductCard.bundlePrice.split(" ");
    return bundlePriceTranslationOrder.map((word, index) => word === "{fromBundlePrice}" ? `${getProductPrice(item2, currencySymbol2, currencyRate2, false, true)} ` : word === "{toBundlePrice}" ? getProductPrice(item2, currencySymbol2, currencyRate2, true, true) : u("span", {
      className: "text-gray-500 text-xs font-normal mr-xs",
      children: word
    }, index, false, {
      fileName: _jsxFileName$9,
      lineNumber: 66,
      columnNumber: 17
    }, void 0));
  };
  const getPriceFormat = (item2, currencySymbol2, currencyRate2, isGiftCard2) => {
    const priceTranslation = isGiftCard2 ? translation.ProductCard.from : translation.ProductCard.startingAt;
    const startingAtTranslationOrder = priceTranslation.split("{productPrice}");
    return startingAtTranslationOrder.map((word, index) => word === "" ? getProductPrice(item2, currencySymbol2, currencyRate2, false, true) : u("span", {
      className: "text-gray-500 text-xs font-normal mr-xs",
      children: word
    }, index, false, {
      fileName: _jsxFileName$9,
      lineNumber: 85,
      columnNumber: 17
    }, void 0));
  };
  const getDiscountedPrice = (discount2) => {
    const discountPrice = discount2 ? u(Fragment, {
      children: [u("span", {
        className: "line-through pr-2",
        children: getProductPrice(item, currencySymbol, currencyRate, false, false)
      }, void 0, false, {
        fileName: _jsxFileName$9,
        lineNumber: 95,
        columnNumber: 17
      }, void 0), u("span", {
        className: "text-secondary",
        children: getProductPrice(item, currencySymbol, currencyRate, false, true)
      }, void 0, false, {
        fileName: _jsxFileName$9,
        lineNumber: 98,
        columnNumber: 17
      }, void 0)]
    }, void 0) : getProductPrice(item, currencySymbol, currencyRate, false, true);
    const discountedPriceTranslation = translation.ProductCard.asLowAs;
    const discountedPriceTranslationOrder = discountedPriceTranslation.split("{discountPrice}");
    return discountedPriceTranslationOrder.map((word, index) => word === "" ? discountPrice : u("span", {
      className: "text-gray-500 text-xs font-normal mr-xs",
      children: word
    }, index, false, {
      fileName: _jsxFileName$9,
      lineNumber: 111,
      columnNumber: 17
    }, void 0));
  };
  return u(Fragment, {
    children: price && u("div", {
      className: "ds-sdk-product-price",
      children: [!isBundle && !isGrouped && !isConfigurable && !isComplexProductView && discount && u("p", {
        className: "ds-sdk-product-price--discount mt-xs text-sm font-medium text-gray-900 my-auto",
        children: [u("span", {
          className: "line-through pr-2",
          children: getProductPrice(item, currencySymbol, currencyRate, false, false)
        }, void 0, false, {
          fileName: _jsxFileName$9,
          lineNumber: 124,
          columnNumber: 29
        }, void 0), u("span", {
          className: "text-secondary",
          children: getProductPrice(item, currencySymbol, currencyRate, false, true)
        }, void 0, false, {
          fileName: _jsxFileName$9,
          lineNumber: 127,
          columnNumber: 29
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$9,
        lineNumber: 123,
        columnNumber: 25
      }, void 0), !isBundle && !isGrouped && !isGiftCard && !isConfigurable && !isComplexProductView && !discount && u("p", {
        className: "ds-sdk-product-price--no-discount mt-xs text-sm font-medium text-gray-900 my-auto",
        children: getProductPrice(item, currencySymbol, currencyRate, false, true)
      }, void 0, false, {
        fileName: _jsxFileName$9,
        lineNumber: 139,
        columnNumber: 29
      }, void 0), isBundle && u("div", {
        className: "ds-sdk-product-price--bundle",
        children: u("p", {
          className: "mt-xs text-sm font-medium text-gray-900 my-auto",
          children: getBundledPrice(item, currencySymbol, currencyRate)
        }, void 0, false, {
          fileName: _jsxFileName$9,
          lineNumber: 146,
          columnNumber: 29
        }, void 0)
      }, void 0, false, {
        fileName: _jsxFileName$9,
        lineNumber: 145,
        columnNumber: 25
      }, void 0), isGrouped && u("p", {
        className: "ds-sdk-product-price--grouped mt-xs text-sm font-medium text-gray-900 my-auto",
        children: getPriceFormat(item, currencySymbol, currencyRate, false)
      }, void 0, false, {
        fileName: _jsxFileName$9,
        lineNumber: 153,
        columnNumber: 25
      }, void 0), isGiftCard && u("p", {
        className: "ds-sdk-product-price--gift-card mt-xs text-sm font-medium text-gray-900 my-auto",
        children: getPriceFormat(item, currencySymbol, currencyRate, true)
      }, void 0, false, {
        fileName: _jsxFileName$9,
        lineNumber: 159,
        columnNumber: 25
      }, void 0), !isGrouped && !isBundle && (isConfigurable || isComplexProductView) && u("p", {
        className: "ds-sdk-product-price--configurable mt-xs text-sm font-medium text-gray-900 my-auto",
        children: getDiscountedPrice(discount)
      }, void 0, false, {
        fileName: _jsxFileName$9,
        lineNumber: 165,
        columnNumber: 25
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$9,
      lineNumber: 121,
      columnNumber: 17
    }, void 0)
  }, void 0);
};
var _jsxFileName$8 = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/ProductItem/ProductItem.tsx";
const ProductItem = ({
  item,
  currencySymbol,
  currencyRate,
  setRoute,
  refineProduct,
  setCartUpdated,
  setItemAdded,
  setError,
  addToCart
}) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A;
  const {
    product,
    productView
  } = item;
  const [carouselIndex, setCarouselIndex] = t(useState(0), "carouselIndex");
  const [selectedSwatch, setSelectedSwatch] = t(useState(""), "selectedSwatch");
  const [imagesFromRefinedProduct, setImagesFromRefinedProduct] = t(useState(), "imagesFromRefinedProduct");
  const [refinedProduct, setRefinedProduct] = t(useState(), "refinedProduct");
  const [isHovering, setIsHovering] = t(useState(false), "isHovering");
  const {
    addToCartGraphQL,
    refreshCart
  } = useCart();
  const {
    viewType
  } = useProducts();
  const {
    config: {
      optimizeImages,
      imageBaseWidth,
      imageCarousel,
      listview
    }
  } = useStore();
  const {
    screenSize
  } = useSensor();
  const handleMouseOver = () => {
    setIsHovering(true);
  };
  const handleMouseOut = () => {
    setIsHovering(false);
  };
  const handleSelection = async (optionIds, sku) => {
    const data = await refineProduct(optionIds, sku);
    setSelectedSwatch(optionIds[0]);
    setImagesFromRefinedProduct(data.refineProduct.images);
    setRefinedProduct(data);
    setCarouselIndex(0);
  };
  const isSelected = (id) => {
    const selected = selectedSwatch ? selectedSwatch === id : false;
    return selected;
  };
  const productImageArray = imagesFromRefinedProduct ? getProductImageURLs(imagesFromRefinedProduct ?? [], imageCarousel ? 3 : 1) : getProductImageURLs(
    productView.images ?? [],
    imageCarousel ? 3 : 1,
    // number of images to display in carousel
    ((_a = product == null ? void 0 : product.image) == null ? void 0 : _a.url) ?? void 0
  );
  let optimizedImageArray = [];
  if (optimizeImages) {
    optimizedImageArray = generateOptimizedImages(productImageArray, imageBaseWidth ?? 200);
  }
  const discount = refinedProduct ? ((_f = (_e = (_d = (_c = (_b = refinedProduct.refineProduct) == null ? void 0 : _b.priceRange) == null ? void 0 : _c.minimum) == null ? void 0 : _d.regular) == null ? void 0 : _e.amount) == null ? void 0 : _f.value) > ((_k = (_j = (_i = (_h = (_g = refinedProduct.refineProduct) == null ? void 0 : _g.priceRange) == null ? void 0 : _h.minimum) == null ? void 0 : _i.final) == null ? void 0 : _j.amount) == null ? void 0 : _k.value) : ((_n = (_m = (_l = product == null ? void 0 : product.price_range) == null ? void 0 : _l.minimum_price) == null ? void 0 : _m.regular_price) == null ? void 0 : _n.value) > ((_q = (_p = (_o = product == null ? void 0 : product.price_range) == null ? void 0 : _o.minimum_price) == null ? void 0 : _p.final_price) == null ? void 0 : _q.value) || ((_t = (_s = (_r = productView == null ? void 0 : productView.price) == null ? void 0 : _r.regular) == null ? void 0 : _s.amount) == null ? void 0 : _t.value) > ((_w = (_v = (_u = productView == null ? void 0 : productView.price) == null ? void 0 : _u.final) == null ? void 0 : _v.amount) == null ? void 0 : _w.value);
  const isSimple = (product == null ? void 0 : product.__typename) === "SimpleProduct";
  const isComplexProductView = (productView == null ? void 0 : productView.__typename) === "ComplexProductView";
  const isBundle = (product == null ? void 0 : product.__typename) === "BundleProduct";
  const isGrouped = (product == null ? void 0 : product.__typename) === "GroupedProduct";
  const isGiftCard = (product == null ? void 0 : product.__typename) === "GiftCardProduct";
  const isConfigurable = (product == null ? void 0 : product.__typename) === "ConfigurableProduct";
  const onProductClick = () => {
    var _a2;
    (_a2 = window.magentoStorefrontEvents) == null ? void 0 : _a2.publish.searchProductClick(SEARCH_UNIT_ID, product == null ? void 0 : product.sku);
  };
  const productUrl = setRoute ? setRoute({
    sku: productView == null ? void 0 : productView.sku,
    urlKey: productView == null ? void 0 : productView.urlKey
  }) : product == null ? void 0 : product.canonical_url;
  const handleAddToCart = async () => {
    var _a2, _b2;
    setError(false);
    if (isSimple) {
      if (addToCart) {
        await addToCart(productView.sku, [], 1);
      } else {
        const response = await addToCartGraphQL(productView.sku);
        if ((response == null ? void 0 : response.errors) || ((_b2 = (_a2 = response == null ? void 0 : response.data) == null ? void 0 : _a2.addProductsToCart) == null ? void 0 : _b2.user_errors.length) > 0) {
          setError(true);
          return;
        }
        setItemAdded(productView == null ? void 0 : productView.name);
        refreshCart == null ? void 0 : refreshCart();
        setCartUpdated(true);
      }
    } else if (productUrl) {
      window.open(productUrl, "_self");
    }
  };
  if (listview && viewType === "listview") {
    return u(Fragment, {
      children: u("div", {
        className: "grid-container",
        children: [u("div", {
          className: `product-image ds-sdk-product-item__image relative rounded-md overflow-hidden}`,
          children: u("a", {
            href: productUrl,
            onClick: onProductClick,
            className: "!text-primary hover:no-underline hover:text-primary",
            children: productImageArray.length ? u(ImageCarousel, {
              images: optimizedImageArray.length ? optimizedImageArray : productImageArray,
              productName: productView.name,
              carouselIndex,
              setCarouselIndex
            }, void 0, false, {
              fileName: _jsxFileName$8,
              lineNumber: 155,
              columnNumber: 33
            }, void 0) : u(SvgNoImage, {
              className: `max-h-[250px] max-w-[200px] pr-5 m-auto object-cover object-center lg:w-full`
            }, void 0, false, {
              fileName: _jsxFileName$8,
              lineNumber: 162,
              columnNumber: 33
            }, void 0)
          }, void 0, false, {
            fileName: _jsxFileName$8,
            lineNumber: 148,
            columnNumber: 25
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$8,
          lineNumber: 147,
          columnNumber: 21
        }, void 0), u("div", {
          className: "product-details",
          children: u("div", {
            className: "flex flex-col w-1/3",
            children: [u("a", {
              href: productUrl,
              onClick: onProductClick,
              className: "!text-primary hover:no-underline hover:text-primary",
              children: [u("div", {
                className: "ds-sdk-product-item__product-name mt-xs text-sm text-primary",
                children: (productView == null ? void 0 : productView.name) !== null && htmlStringDecode(productView == null ? void 0 : productView.name)
              }, void 0, false, {
                fileName: _jsxFileName$8,
                lineNumber: 176,
                columnNumber: 33
              }, void 0), u("div", {
                className: "ds-sdk-product-item__product-sku mt-xs text-sm text-primary",
                children: ["SKU:", (productView == null ? void 0 : productView.sku) !== null && htmlStringDecode(productView == null ? void 0 : productView.sku)]
              }, void 0, true, {
                fileName: _jsxFileName$8,
                lineNumber: 179,
                columnNumber: 33
              }, void 0)]
            }, void 0, true, {
              fileName: _jsxFileName$8,
              lineNumber: 171,
              columnNumber: 29
            }, void 0), u("div", {
              className: "ds-sdk-product-item__product-swatch flex flex-row mt-sm text-sm text-primary pb-6",
              children: (_x = productView == null ? void 0 : productView.options) == null ? void 0 : _x.map((swatches) => swatches.id === "color" && u(SwatchButtonGroup, {
                isSelected,
                swatches: swatches.values ?? [],
                showMore: onProductClick,
                productUrl,
                onClick: handleSelection,
                sku: productView == null ? void 0 : productView.sku
              }, productView == null ? void 0 : productView.sku, false, {
                fileName: _jsxFileName$8,
                lineNumber: 190,
                columnNumber: 45
              }, void 0))
            }, void 0, false, {
              fileName: _jsxFileName$8,
              lineNumber: 186,
              columnNumber: 29
            }, void 0)]
          }, void 0, true, {
            fileName: _jsxFileName$8,
            lineNumber: 169,
            columnNumber: 25
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$8,
          lineNumber: 168,
          columnNumber: 21
        }, void 0), u("div", {
          className: "product-price",
          children: u("a", {
            href: productUrl,
            onClick: onProductClick,
            className: "!text-primary hover:no-underline hover:text-primary",
            children: u(ProductPrice, {
              item: refinedProduct ?? item,
              isBundle,
              isGrouped,
              isGiftCard,
              isConfigurable,
              isComplexProductView,
              discount,
              currencySymbol,
              currencyRate
            }, void 0, false, {
              fileName: _jsxFileName$8,
              lineNumber: 210,
              columnNumber: 29
            }, void 0)
          }, void 0, false, {
            fileName: _jsxFileName$8,
            lineNumber: 205,
            columnNumber: 25
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$8,
          lineNumber: 204,
          columnNumber: 21
        }, void 0), u("div", {
          className: "product-description text-sm text-primary mt-xs",
          children: u("a", {
            href: productUrl,
            onClick: onProductClick,
            className: "!text-primary hover:no-underline hover:text-primary",
            children: ((_y = productView == null ? void 0 : productView.short_description) == null ? void 0 : _y.html) ? u(Fragment, {
              children: u("span", {
                dangerouslySetInnerHTML: {
                  __html: productView == null ? void 0 : productView.short_description.html
                }
              }, void 0, false, {
                fileName: _jsxFileName$8,
                lineNumber: 231,
                columnNumber: 37
              }, void 0)
            }, void 0, false) : u("span", {}, void 0, false, {
              fileName: _jsxFileName$8,
              lineNumber: 238,
              columnNumber: 33
            }, void 0)
          }, void 0, false, {
            fileName: _jsxFileName$8,
            lineNumber: 224,
            columnNumber: 25
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$8,
          lineNumber: 223,
          columnNumber: 21
        }, void 0), u("div", {
          className: "product-ratings"
        }, void 0, false, {
          fileName: _jsxFileName$8,
          lineNumber: 244,
          columnNumber: 21
        }, void 0), u("div", {
          className: "product-add-to-cart",
          children: u("div", {
            className: "pb-4 h-[38px] w-96",
            children: u(AddToCartButton, {
              onClick: handleAddToCart
            }, void 0, false, {
              fileName: _jsxFileName$8,
              lineNumber: 247,
              columnNumber: 29
            }, void 0)
          }, void 0, false, {
            fileName: _jsxFileName$8,
            lineNumber: 246,
            columnNumber: 25
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$8,
          lineNumber: 245,
          columnNumber: 21
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$8,
        lineNumber: 146,
        columnNumber: 17
      }, void 0)
    }, void 0);
  }
  return u("div", {
    className: "ds-sdk-product-item group relative flex flex-col max-w-sm justify-between h-full hover:border-[1.5px] border-solid hover:shadow-lg border-offset-2 p-2",
    style: {
      "border-color": "#D5D5D5"
    },
    onMouseEnter: handleMouseOver,
    onMouseLeave: handleMouseOut,
    children: [u("a", {
      href: productUrl,
      onClick: onProductClick,
      className: "!text-primary hover:no-underline hover:text-primary",
      children: u("div", {
        className: "ds-sdk-product-item__main relative flex flex-col justify-between h-full",
        children: [u("div", {
          className: "ds-sdk-product-item__image relative w-full h-full rounded-md overflow-hidden",
          children: productImageArray.length ? u(ImageCarousel, {
            images: optimizedImageArray.length ? optimizedImageArray : productImageArray,
            productName: productView == null ? void 0 : productView.name,
            carouselIndex,
            setCarouselIndex
          }, void 0, false, {
            fileName: _jsxFileName$8,
            lineNumber: 272,
            columnNumber: 29
          }, void 0) : u(SvgNoImage, {
            className: `max-h-[45rem] w-full object-cover object-center lg:w-full`
          }, void 0, false, {
            fileName: _jsxFileName$8,
            lineNumber: 279,
            columnNumber: 29
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$8,
          lineNumber: 270,
          columnNumber: 21
        }, void 0), u("div", {
          className: "flex flex-row",
          children: u("div", {
            className: "flex flex-col",
            children: [u("div", {
              className: "ds-sdk-product-item__product-name mt-md text-sm text-primary",
              children: (productView == null ? void 0 : productView.name) !== null && htmlStringDecode(productView == null ? void 0 : productView.name)
            }, void 0, false, {
              fileName: _jsxFileName$8,
              lineNumber: 284,
              columnNumber: 29
            }, void 0), u(ProductPrice, {
              item: refinedProduct ?? item,
              isBundle,
              isGrouped,
              isGiftCard,
              isConfigurable,
              isComplexProductView,
              discount,
              currencySymbol,
              currencyRate
            }, void 0, false, {
              fileName: _jsxFileName$8,
              lineNumber: 287,
              columnNumber: 29
            }, void 0)]
          }, void 0, true, {
            fileName: _jsxFileName$8,
            lineNumber: 283,
            columnNumber: 25
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$8,
          lineNumber: 282,
          columnNumber: 21
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$8,
        lineNumber: 269,
        columnNumber: 17
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$8,
      lineNumber: 264,
      columnNumber: 13
    }, void 0), (productView == null ? void 0 : productView.options) && ((_z = productView.options) == null ? void 0 : _z.length) > 0 && u("div", {
      className: "ds-sdk-product-item__product-swatch flex flex-row mt-sm text-sm text-primary",
      children: (_A = productView == null ? void 0 : productView.options) == null ? void 0 : _A.map((swatches) => swatches.id == "color" && u(SwatchButtonGroup, {
        isSelected,
        swatches: swatches.values ?? [],
        showMore: onProductClick,
        productUrl,
        onClick: handleSelection,
        sku: productView == null ? void 0 : productView.sku
      }, productView == null ? void 0 : productView.sku, false, {
        fileName: _jsxFileName$8,
        lineNumber: 320,
        columnNumber: 33
      }, void 0))
    }, void 0, false, {
      fileName: _jsxFileName$8,
      lineNumber: 316,
      columnNumber: 17
    }, void 0), u("div", {
      className: "pb-4 mt-sm",
      children: [screenSize.mobile && u(AddToCartButton, {
        onClick: handleAddToCart
      }, void 0, false, {
        fileName: _jsxFileName$8,
        lineNumber: 334,
        columnNumber: 39
      }, void 0), isHovering && screenSize.desktop && u(AddToCartButton, {
        onClick: handleAddToCart
      }, void 0, false, {
        fileName: _jsxFileName$8,
        lineNumber: 335,
        columnNumber: 54
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$8,
      lineNumber: 333,
      columnNumber: 13
    }, void 0)]
  }, void 0, true, {
    fileName: _jsxFileName$8,
    lineNumber: 256,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$7 = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/ProductList/ProductList.tsx";
const ProductList = ({
  products,
  numberOfColumns,
  showFilters
}) => {
  const productsCtx = useProducts();
  const {
    currencySymbol,
    currencyRate,
    setRoute,
    refineProduct,
    refreshCart,
    addToCart
  } = productsCtx;
  const [cartUpdated, setCartUpdated] = t(useState(false), "cartUpdated");
  const [itemAdded, setItemAdded] = t(useState(""), "itemAdded");
  const {
    viewType
  } = useProducts();
  const [error, setError] = t(useState(false), "error");
  const {
    config: {
      listview
    }
  } = useStore();
  const className = showFilters ? "ds-sdk-product-list bg-body max-w-full pl-3 pb-2xl sm:pb-24" : "ds-sdk-product-list bg-body w-full mx-auto pb-2xl sm:pb-24";
  useEffect(() => {
    refreshCart && refreshCart();
  }, [itemAdded]);
  return u("div", {
    className: classNames("ds-sdk-product-list bg-body pb-2xl sm:pb-24", className),
    children: [cartUpdated && u("div", {
      className: "mt-8",
      children: u(Alert, {
        title: `You added ${itemAdded} to your shopping cart.`,
        type: "success",
        description: "",
        onClick: () => setCartUpdated(false)
      }, void 0, false, {
        fileName: _jsxFileName$7,
        lineNumber: 51,
        columnNumber: 21
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$7,
      lineNumber: 50,
      columnNumber: 17
    }, void 0), error && u("div", {
      className: "mt-8",
      children: u(Alert, {
        title: `Something went wrong trying to add an item to your cart.`,
        type: "error",
        description: "",
        onClick: () => setError(false)
      }, void 0, false, {
        fileName: _jsxFileName$7,
        lineNumber: 61,
        columnNumber: 21
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$7,
      lineNumber: 60,
      columnNumber: 17
    }, void 0), listview && viewType === "listview" ? u("div", {
      className: "w-full",
      children: u("div", {
        className: "ds-sdk-product-list__list-view-default mt-md grid grid-cols-none pt-[15px] w-full gap-[10px]",
        children: products == null ? void 0 : products.map((product) => {
          var _a;
          return u(ProductItem, {
            item: product,
            setError,
            currencySymbol,
            currencyRate,
            setRoute,
            refineProduct,
            setCartUpdated,
            setItemAdded,
            addToCart
          }, (_a = product == null ? void 0 : product.productView) == null ? void 0 : _a.id, false, {
            fileName: _jsxFileName$7,
            lineNumber: 74,
            columnNumber: 29
          }, void 0);
        })
      }, void 0, false, {
        fileName: _jsxFileName$7,
        lineNumber: 72,
        columnNumber: 21
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$7,
      lineNumber: 71,
      columnNumber: 17
    }, void 0) : u("div", {
      style: {
        gridTemplateColumns: `repeat(${numberOfColumns}, minmax(0, 1fr))`
      },
      className: "ds-sdk-product-list__grid mt-md grid gap-y-8 gap-x-2xl xl:gap-x-8",
      children: products == null ? void 0 : products.map((product) => {
        var _a;
        return u(ProductItem, {
          item: product,
          setError,
          currencySymbol,
          currencyRate,
          setRoute,
          refineProduct,
          setCartUpdated,
          setItemAdded,
          addToCart
        }, (_a = product == null ? void 0 : product.productView) == null ? void 0 : _a.id, false, {
          fileName: _jsxFileName$7,
          lineNumber: 97,
          columnNumber: 25
        }, void 0);
      })
    }, void 0, false, {
      fileName: _jsxFileName$7,
      lineNumber: 90,
      columnNumber: 17
    }, void 0)]
  }, void 0, true, {
    fileName: _jsxFileName$7,
    lineNumber: 48,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$6 = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/containers/ProductsContainer.tsx";
const ProductsContainer = ({
  showFilters
}) => {
  const productsCtx = useProducts();
  const {
    screenSize
  } = useSensor();
  const {
    variables,
    items,
    setCurrentPage,
    currentPage,
    setPageSize,
    pageSize,
    totalPages,
    totalCount,
    minQueryLength,
    minQueryLengthReached,
    pageSizeOptions,
    loading
  } = productsCtx;
  useEffect(() => {
    if (currentPage < 1) {
      goToPage(1);
    }
  }, []);
  const productCardArray = Array.from({
    length: 8
  });
  const goToPage = (page) => {
    if (typeof page === "number") {
      setCurrentPage(page);
      handleUrlPagination(page);
    }
  };
  const onPageSizeChange = (pageSizeOption) => {
    setPageSize(pageSizeOption);
    handleUrlPageSize(pageSizeOption);
  };
  const translation = useTranslation();
  const getPageSizeTranslation = (pageSize2, pageSizeOptions2, PerPagePicker2) => {
    const pageSizeTranslation = translation.ProductContainers.pagePicker;
    const pageSizeTranslationOrder = pageSizeTranslation.split(" ");
    return pageSizeTranslationOrder.map((word, index) => word === "{pageSize}" ? u(PerPagePicker2, {
      pageSizeOptions: pageSizeOptions2,
      value: pageSize2,
      onChange: onPageSizeChange
    }, index, false, {
      fileName: _jsxFileName$6,
      lineNumber: 76,
      columnNumber: 17
    }, void 0) : `${word} `);
  };
  if (!minQueryLengthReached) {
    const templateMinQueryText = translation.ProductContainers.minquery;
    const title = templateMinQueryText.replace("{variables.phrase}", variables.phrase).replace("{minQueryLength}", minQueryLength);
    return u("div", {
      className: "ds-sdk-min-query__page mx-auto max-w-8xl py-12 px-4 sm:px-6 lg:px-8",
      children: u(Alert, {
        title,
        type: "warning",
        description: ""
      }, void 0, false, {
        fileName: _jsxFileName$6,
        lineNumber: 95,
        columnNumber: 17
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$6,
      lineNumber: 94,
      columnNumber: 13
    }, void 0);
  }
  if (!totalCount) {
    return u("div", {
      className: "ds-sdk-no-results__page mx-auto max-w-8xl py-12 px-4 sm:px-6 lg:px-8",
      children: u(Alert, {
        title: translation.ProductContainers.noresults,
        type: "warning",
        description: ""
      }, void 0, false, {
        fileName: _jsxFileName$6,
        lineNumber: 103,
        columnNumber: 17
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$6,
      lineNumber: 102,
      columnNumber: 13
    }, void 0);
  }
  return u(Fragment, {
    children: [loading ? u("div", {
      style: {
        gridTemplateColumns: `repeat(${screenSize.columns}, minmax(0, 1fr))`
      },
      className: "ds-sdk-product-list__grid mt-md grid grid-cols-1 gap-y-8 gap-x-md sm:grid-cols-2 md:grid-cols-3 xl:gap-x-4 pl-8",
      children: [" ", productCardArray.map((_, index) => u(ProductCardShimmer, {}, index, false, {
        fileName: _jsxFileName$6,
        lineNumber: 119,
        columnNumber: 25
      }, void 0))]
    }, void 0, true, {
      fileName: _jsxFileName$6,
      lineNumber: 111,
      columnNumber: 17
    }, void 0) : u(ProductList, {
      products: items,
      numberOfColumns: screenSize.columns,
      showFilters
    }, void 0, false, {
      fileName: _jsxFileName$6,
      lineNumber: 123,
      columnNumber: 17
    }, void 0), u("div", {
      className: `flex flex-row justify-between max-w-full ${showFilters ? "mx-auto" : "mr-auto"} w-full h-full`,
      children: [u("div", {
        children: getPageSizeTranslation(pageSize, pageSizeOptions, PerPagePicker)
      }, void 0, false, {
        fileName: _jsxFileName$6,
        lineNumber: 130,
        columnNumber: 17
      }, void 0), totalPages > 1 && u(Pagination, {
        currentPage,
        totalPages,
        onPageChange: goToPage
      }, void 0, false, {
        fileName: _jsxFileName$6,
        lineNumber: 132,
        columnNumber: 21
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$6,
      lineNumber: 125,
      columnNumber: 13
    }, void 0)]
  }, void 0);
};
var _jsxFileName$5 = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/SearchBar/SearchBar.tsx";
const SearchBar = ({
  phrase,
  onKeyPress,
  placeholder
}) => {
  return u("div", {
    className: "relative ds-sdk-search-bar",
    children: u("input", {
      id: "search",
      type: "text",
      value: phrase,
      onKeyPress,
      className: "border border-gray-300 text-gray-800 text-sm block-display p-xs pr-lg ds-sdk-search-bar__input",
      placeholder,
      autocomplete: "off"
    }, void 0, false, {
      fileName: _jsxFileName$5,
      lineNumber: 23,
      columnNumber: 13
    }, void 0)
  }, void 0, false, {
    fileName: _jsxFileName$5,
    lineNumber: 22,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$4 = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/SortDropdown/SortDropdown.tsx";
const SortDropdown = ({
  value,
  sortOptions,
  onChange
}) => {
  const sortOptionButton = t(useRef(null), "sortOptionButton");
  const sortOptionMenu = t(useRef(null), "sortOptionMenu");
  const selectedOption = sortOptions.find((e) => e.value === value);
  const translation = useTranslation();
  const sortOptionTranslation = translation.SortDropdown.option;
  const sortOption = sortOptionTranslation.replace("{selectedOption}", `${selectedOption == null ? void 0 : selectedOption.label}`);
  const {
    isDropdownOpen,
    setIsDropdownOpen,
    activeIndex,
    setActiveIndex,
    select,
    setIsFocus,
    listRef
  } = useAccessibleDropdown({
    options: sortOptions,
    value,
    onChange
  });
  useEffect(() => {
    const menuRef = sortOptionMenu.current;
    const handleBlur = () => {
      setIsFocus(false);
      setIsDropdownOpen(false);
    };
    const handleFocus = () => {
      var _a;
      if (((_a = menuRef == null ? void 0 : menuRef.parentElement) == null ? void 0 : _a.querySelector(":hover")) !== menuRef) {
        setIsFocus(false);
        setIsDropdownOpen(false);
      }
    };
    menuRef == null ? void 0 : menuRef.addEventListener("blur", handleBlur);
    menuRef == null ? void 0 : menuRef.addEventListener("focusin", handleFocus);
    menuRef == null ? void 0 : menuRef.addEventListener("focusout", handleFocus);
    return () => {
      menuRef == null ? void 0 : menuRef.removeEventListener("blur", handleBlur);
      menuRef == null ? void 0 : menuRef.removeEventListener("focusin", handleFocus);
      menuRef == null ? void 0 : menuRef.removeEventListener("focusout", handleFocus);
    };
  }, [sortOptionMenu]);
  return u(Fragment, {
    children: u("div", {
      ref: sortOptionMenu,
      class: "ds-sdk-sort-dropdown relative inline-block text-left bg-gray-100 rounded-md outline outline-1 outline-gray-200 hover:outline-gray-600 h-[32px] z-9",
      children: [u("button", {
        className: "group flex justify-center items-center font-normal text-sm text-gray-700 rounded-md hover:cursor-pointer border-none bg-transparent hover:border-none hover:bg-transparent focus:border-none focus:bg-transparent active:border-none active:bg-transparent active:shadow-none h-full w-full px-sm",
        ref: sortOptionButton,
        onClick: () => setIsDropdownOpen(!isDropdownOpen),
        onFocus: () => setIsFocus(false),
        onBlur: () => setIsFocus(false),
        children: [u(SvgSort, {
          className: "h-md w-md mr-sm stroke-gray-600 m-auto"
        }, void 0, false, {
          fileName: _jsxFileName$4,
          lineNumber: 84,
          columnNumber: 21
        }, void 0), selectedOption ? sortOption : translation.SortDropdown.title, u(SvgChevron, {
          className: `flex-shrink-0 m-auto ml-sm h-md w-md stroke-1 stroke-gray-600 ${isDropdownOpen ? "" : "rotate-180"}`
        }, void 0, false, {
          fileName: _jsxFileName$4,
          lineNumber: 86,
          columnNumber: 21
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$4,
        lineNumber: 77,
        columnNumber: 17
      }, void 0), isDropdownOpen && u("ul", {
        ref: listRef,
        tabIndex: -1,
        className: "ds-sdk-sort-dropdown__items origin-top-right absolute hover:cursor-pointer right-0 w-full rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none mt-2 z-20",
        children: sortOptions.map((option, i) => u("li", {
          "aria-selected": option.value === (selectedOption == null ? void 0 : selectedOption.value),
          onMouseOver: () => setActiveIndex(i),
          className: `py-xs hover:bg-gray-100 hover:text-gray-900 ${i === activeIndex ? "bg-gray-100 text-gray-900" : ""}}`,
          children: u("a", {
            className: `ds-sdk-sort-dropdown__items--item block-display px-md py-sm text-sm mb-0
              no-underline active:no-underline focus:no-underline hover:no-underline
              hover:text-gray-900 ${option.value === (selectedOption == null ? void 0 : selectedOption.value) ? "ds-sdk-sort-dropdown__items--item-selected font-semibold text-gray-900" : "font-normal text-gray-800"}`,
            onClick: () => select(option.value),
            children: option.label
          }, void 0, false, {
            fileName: _jsxFileName$4,
            lineNumber: 107,
            columnNumber: 33
          }, void 0)
        }, i, false, {
          fileName: _jsxFileName$4,
          lineNumber: 99,
          columnNumber: 29
        }, void 0))
      }, void 0, false, {
        fileName: _jsxFileName$4,
        lineNumber: 93,
        columnNumber: 21
      }, void 0)]
    }, void 0, true, {
      fileName: _jsxFileName$4,
      lineNumber: 73,
      columnNumber: 13
    }, void 0)
  }, void 0);
};
var _jsxFileName$3 = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/components/ViewSwitcher/ViewSwitcher.tsx";
const ViewSwitcher = () => {
  const {
    viewType,
    setViewType
  } = useProducts();
  const handleClick = (viewType2) => {
    handleViewType(viewType2);
    setViewType(viewType2);
  };
  return u("div", {
    className: "flex justify-between",
    children: [u("button", {
      className: `flex items-center ${viewType === "gridview" ? "bg-gray-100" : ""} ring-black ring-opacity-5  p-sm text-sm h-[32px] border border-gray-300`,
      onClick: () => handleClick("gridview"),
      children: u(SvgGridView, {
        className: "h-[20px] w-[20px]"
      }, void 0, false, {
        fileName: _jsxFileName$3,
        lineNumber: 31,
        columnNumber: 17
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$3,
      lineNumber: 25,
      columnNumber: 13
    }, void 0), u("button", {
      className: `flex items-center ${viewType === "listview" ? "bg-gray-100" : ""} ring-black ring-opacity-5 p-sm text-sm h-[32px] border border-gray-300`,
      onClick: () => handleClick("listview"),
      children: u(SvgListView, {
        className: "h-[20px] w-[20px]"
      }, void 0, false, {
        fileName: _jsxFileName$3,
        lineNumber: 39,
        columnNumber: 17
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$3,
      lineNumber: 33,
      columnNumber: 13
    }, void 0)]
  }, void 0, true, {
    fileName: _jsxFileName$3,
    lineNumber: 24,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$2 = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/containers/ProductsHeader.tsx";
const ProductsHeader = ({
  facets,
  totalCount,
  screenSize
}) => {
  var _a, _b, _c;
  const searchCtx = useSearch();
  const storeCtx = useStore();
  const attributeMetadata = useAttributeMetadata();
  const productsCtx = useProducts();
  const translation = useTranslation();
  const [showMobileFacet, setShowMobileFacet] = t(useState(!!((_a = productsCtx.variables.filter) == null ? void 0 : _a.length)), "showMobileFacet");
  const [sortOptions, setSortOptions] = t(useState(defaultSortOptions()), "sortOptions");
  const getSortOptions = useCallback(() => {
    var _a2, _b2;
    setSortOptions(getSortOptionsfromMetadata(translation, attributeMetadata == null ? void 0 : attributeMetadata.sortable, (_a2 = storeCtx == null ? void 0 : storeCtx.config) == null ? void 0 : _a2.displayOutOfStock, (_b2 = storeCtx == null ? void 0 : storeCtx.config) == null ? void 0 : _b2.currentCategoryUrlPath));
  }, [storeCtx, translation, attributeMetadata]);
  useEffect(() => {
    getSortOptions();
  }, [getSortOptions]);
  const defaultSortOption = ((_b = storeCtx.config) == null ? void 0 : _b.currentCategoryUrlPath) ? "position_ASC" : "relevance_DESC";
  const sortFromUrl = getValueFromUrl("product_list_order");
  const sortByDefault = sortFromUrl ? sortFromUrl : defaultSortOption;
  const [sortBy, setSortBy] = t(useState(sortByDefault), "sortBy");
  const onSortChange = (sortOption) => {
    setSortBy(sortOption);
    searchCtx.setSort(generateGQLSortInput(sortOption));
    handleUrlSort(sortOption);
  };
  return u("div", {
    className: "flex flex-col max-w-5xl lg:max-w-full ml-auto w-full h-full",
    children: [u("div", {
      className: `flex gap-x-2.5 mb-[1px] ${screenSize.mobile ? "justify-between" : "justify-end"}`,
      children: [u("div", {
        children: screenSize.mobile ? totalCount > 0 && u("div", {
          className: "pb-4",
          children: u(FilterButton, {
            displayFilter: () => setShowMobileFacet(!showMobileFacet),
            type: "mobile"
          }, void 0, false, {
            fileName: _jsxFileName$2,
            lineNumber: 75,
            columnNumber: 35
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$2,
          lineNumber: 74,
          columnNumber: 31
        }, void 0) : storeCtx.config.displaySearchBox && u(SearchBar, {
          phrase: searchCtx.phrase,
          onKeyPress: (e) => {
            var _a2;
            if (e.key === "Enter") {
              searchCtx.setPhrase((_a2 = e == null ? void 0 : e.target) == null ? void 0 : _a2.value);
            }
          },
          onClear: () => searchCtx.setPhrase(""),
          placeholder: translation.SearchBar.placeholder
        }, void 0, false, {
          fileName: _jsxFileName$2,
          lineNumber: 82,
          columnNumber: 31
        }, void 0)
      }, void 0, false, {
        fileName: _jsxFileName$2,
        lineNumber: 71,
        columnNumber: 17
      }, void 0), totalCount > 0 && u(Fragment, {
        children: [((_c = storeCtx == null ? void 0 : storeCtx.config) == null ? void 0 : _c.listview) && u(ViewSwitcher, {}, void 0, false, {
          fileName: _jsxFileName$2,
          lineNumber: 96,
          columnNumber: 56
        }, void 0), u(SortDropdown, {
          sortOptions,
          value: sortBy,
          onChange: onSortChange
        }, void 0, false, {
          fileName: _jsxFileName$2,
          lineNumber: 98,
          columnNumber: 25
        }, void 0)]
      }, void 0, true)]
    }, void 0, true, {
      fileName: _jsxFileName$2,
      lineNumber: 70,
      columnNumber: 13
    }, void 0), screenSize.mobile && showMobileFacet && u(Facets, {
      searchFacets: facets
    }, void 0, false, {
      fileName: _jsxFileName$2,
      lineNumber: 102,
      columnNumber: 54
    }, void 0)]
  }, void 0, true, {
    fileName: _jsxFileName$2,
    lineNumber: 69,
    columnNumber: 9
  }, void 0);
};
var _jsxFileName$1 = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/widgets/plp/containers/App.tsx";
const App = () => {
  const searchCtx = useSearch();
  const productsCtx = useProducts();
  const {
    screenSize
  } = useSensor();
  const translation = useTranslation();
  const {
    displayMode
  } = useStore().config;
  const [showFilters, setShowFilters] = t(useState(true), "showFilters");
  const loadingLabel = translation.Loading.title;
  let title = productsCtx.categoryName || "";
  if (productsCtx.variables.phrase) {
    const text = translation.CategoryFilters.results;
    title = text.replace("{phrase}", `"${productsCtx.variables.phrase ?? ""}"`);
  }
  const getResults = (totalCount) => {
    const resultsTranslation = translation.CategoryFilters.products;
    const results = resultsTranslation.replace("{totalCount}", `${totalCount}`);
    return results;
  };
  useEffect(() => {
    const unsubscribeSearch = events.on("search/event", (payload) => {
      productsCtx.setSearchHeaders(payload);
    });
    return () => {
      unsubscribeSearch == null ? void 0 : unsubscribeSearch.off();
    };
  });
  return u(Fragment, {
    children: !(displayMode === "PAGE") && (!screenSize.mobile && showFilters && productsCtx.facets.length > 0 ? u("div", {
      className: "ds-widgets bg-body py-2",
      children: u("div", {
        className: "flex",
        children: [u(CategoryFilters, {
          loading: productsCtx.loading,
          pageLoading: productsCtx.pageLoading,
          facets: productsCtx.facets,
          totalCount: productsCtx.totalCount,
          categoryName: productsCtx.categoryName ?? "",
          phrase: productsCtx.variables.phrase ?? "",
          showFilters,
          setShowFilters,
          filterCount: searchCtx.filterCount
        }, void 0, false, {
          fileName: _jsxFileName$1,
          lineNumber: 60,
          columnNumber: 29
        }, void 0), u("div", {
          className: `ds-widgets_results flex flex-col items-center ${productsCtx.categoryName ? "pt-16" : "pt-28"} w-full h-full`,
          children: [u(ProductsHeader, {
            facets: productsCtx.facets,
            totalCount: productsCtx.totalCount,
            screenSize
          }, void 0, false, {
            fileName: _jsxFileName$1,
            lineNumber: 76,
            columnNumber: 33
          }, void 0), u(SelectedFilters, {}, void 0, false, {
            fileName: _jsxFileName$1,
            lineNumber: 81,
            columnNumber: 33
          }, void 0), u(ProductsContainer, {
            showFilters
          }, void 0, false, {
            fileName: _jsxFileName$1,
            lineNumber: 83,
            columnNumber: 33
          }, void 0)]
        }, void 0, true, {
          fileName: _jsxFileName$1,
          lineNumber: 71,
          columnNumber: 29
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$1,
        lineNumber: 59,
        columnNumber: 25
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$1,
      lineNumber: 58,
      columnNumber: 21
    }, void 0) : u("div", {
      className: "ds-widgets bg-body py-2",
      children: u("div", {
        className: "flex flex-col",
        children: [u("div", {
          className: "flex flex-col items-center w-full h-full",
          children: u("div", {
            className: "justify-start w-full h-full",
            children: u("div", {
              class: "hidden sm:flex ds-widgets-_actions relative max-w-[21rem] w-full h-full px-2 flex-col overflow-y-auto",
              children: u("div", {
                className: "ds-widgets_actions_header flex justify-between items-center mb-md",
                children: [title && u("span", {
                  children: [" ", title]
                }, void 0, true, {
                  fileName: _jsxFileName$1,
                  lineNumber: 94,
                  columnNumber: 55
                }, void 0), !productsCtx.loading && u("span", {
                  className: "text-primary text-sm",
                  children: getResults(productsCtx.totalCount)
                }, void 0, false, {
                  fileName: _jsxFileName$1,
                  lineNumber: 96,
                  columnNumber: 49
                }, void 0)]
              }, void 0, true, {
                fileName: _jsxFileName$1,
                lineNumber: 93,
                columnNumber: 41
              }, void 0)
            }, void 0, false, {
              fileName: _jsxFileName$1,
              lineNumber: 92,
              columnNumber: 37
            }, void 0)
          }, void 0, false, {
            fileName: _jsxFileName$1,
            lineNumber: 91,
            columnNumber: 33
          }, void 0)
        }, void 0, false, {
          fileName: _jsxFileName$1,
          lineNumber: 90,
          columnNumber: 29
        }, void 0), u("div", {
          className: "ds-widgets_results flex flex-col items-center w-full h-full",
          children: [u("div", {
            className: "flex w-full h-full",
            children: !screenSize.mobile && !productsCtx.loading && productsCtx.facets.length > 0 && u("div", {
              className: "flex w-full h-full",
              children: u(FilterButton, {
                displayFilter: () => setShowFilters(true),
                type: "desktop",
                title: `${translation.Filter.showTitle}${searchCtx.filterCount > 0 ? ` (${searchCtx.filterCount})` : ""}`
              }, void 0, false, {
                fileName: _jsxFileName$1,
                lineNumber: 108,
                columnNumber: 45
              }, void 0)
            }, void 0, false, {
              fileName: _jsxFileName$1,
              lineNumber: 107,
              columnNumber: 41
            }, void 0)
          }, void 0, false, {
            fileName: _jsxFileName$1,
            lineNumber: 105,
            columnNumber: 33
          }, void 0), productsCtx.loading ? screenSize.mobile ? u(Loading, {
            label: loadingLabel
          }, void 0, false, {
            fileName: _jsxFileName$1,
            lineNumber: 120,
            columnNumber: 41
          }, void 0) : u(Shimmer, {}, void 0, false, {
            fileName: _jsxFileName$1,
            lineNumber: 122,
            columnNumber: 41
          }, void 0) : u(Fragment, {
            children: [u("div", {
              className: "flex w-full h-full",
              children: u(ProductsHeader, {
                facets: productsCtx.facets,
                totalCount: productsCtx.totalCount,
                screenSize
              }, void 0, false, {
                fileName: _jsxFileName$1,
                lineNumber: 127,
                columnNumber: 45
              }, void 0)
            }, void 0, false, {
              fileName: _jsxFileName$1,
              lineNumber: 126,
              columnNumber: 41
            }, void 0), u(SelectedFilters, {}, void 0, false, {
              fileName: _jsxFileName$1,
              lineNumber: 133,
              columnNumber: 41
            }, void 0), u(ProductsContainer, {
              showFilters: showFilters && productsCtx.facets.length > 0
            }, void 0, false, {
              fileName: _jsxFileName$1,
              lineNumber: 134,
              columnNumber: 41
            }, void 0)]
          }, void 0, true)]
        }, void 0, true, {
          fileName: _jsxFileName$1,
          lineNumber: 104,
          columnNumber: 29
        }, void 0)]
      }, void 0, true, {
        fileName: _jsxFileName$1,
        lineNumber: 89,
        columnNumber: 25
      }, void 0)
    }, void 0, false, {
      fileName: _jsxFileName$1,
      lineNumber: 88,
      columnNumber: 21
    }, void 0))
  }, void 0);
};
var _jsxFileName = "/Users/bkalk/git-repos/adobe-commerce/storefront-search-dropin/src/containers/ProductListingPage/ProductListingPage.tsx";
function ProductListingPage() {
  const storefront = initialize.config.getConfig().storefront;
  const search = initialize.config.getConfig().search;
  const userViewHistory = getUserViewHistory();
  const updatedStoreDetails = validateStoreDetailsKeys({
    ...storefront,
    config: search,
    context: {
      ...storefront.customerGroup,
      userViewHistory
    }
  });
  return u(StoreContextProvider, {
    ...validateStoreDetailsKeys(updatedStoreDetails),
    children: u(AttributeMetadataProvider, {
      children: u(SearchProvider, {
        children: u(Resize, {
          children: u(Translation, {
            children: u(ProductsContextProvider, {
              children: u(CartProvider, {
                children: u(App, {}, void 0, false, {
                  fileName: _jsxFileName,
                  lineNumber: 40,
                  columnNumber: 37
                }, this)
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 39,
                columnNumber: 33
              }, this)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 38,
              columnNumber: 29
            }, this)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 37,
            columnNumber: 25
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 36,
          columnNumber: 21
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 35,
        columnNumber: 17
      }, this)
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 34,
      columnNumber: 13
    }, this)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 33,
    columnNumber: 9
  }, this);
}
export {
  ProductListingPage,
  ProductListingPage as default
};
//# sourceMappingURL=ProductListingPage.js.map
