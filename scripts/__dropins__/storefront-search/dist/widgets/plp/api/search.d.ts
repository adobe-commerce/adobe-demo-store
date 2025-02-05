import { AttributeMetadataResponse, ClientProps, ProductSearchQuery, ProductSearchResponse, RefinedProduct, RefineProductQuery } from '../types';

declare const getProductSearch: ({ environmentId, websiteCode, storeCode, storeViewCode, apiKey, apiUrl, phrase, pageSize, displayOutOfStock, currentPage, xRequestId, filter, sort, context, categorySearch, headers, }: ProductSearchQuery & ClientProps) => Promise<ProductSearchResponse["data"]>;
declare const getAttributeMetadata: ({ environmentId, websiteCode, storeCode, storeViewCode, apiKey, apiUrl, xRequestId, }: ClientProps) => Promise<AttributeMetadataResponse["data"]>;
declare const refineProductSearch: ({ environmentId, websiteCode, storeCode, storeViewCode, apiKey, apiUrl, xRequestId, context, optionIds, sku, }: RefineProductQuery & ClientProps) => Promise<RefinedProduct>;
export { getAttributeMetadata, getProductSearch, refineProductSearch };
//# sourceMappingURL=search.d.ts.map