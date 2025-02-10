/* eslint-disable import/no-unresolved */
import { initializers } from '@dropins/tools/initializer.js';
// import {
//   initialize,
// } from 'http://localhost:3002/api.js';
import {
    initialize,
  } from '../__dropins__/storefront-search/dist/api.js';
// eslint-disable-next-line import/no-cycle
import { initializeDropin } from './index.js';
import { getConfigValue } from '../configs.js';
import { fetchPlaceholders } from '../aem.js';

await initializeDropin(async () => {
  // should come from getConfigValue
  const labels = await fetchPlaceholders();

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  // details of the storefront including environment id's, keys, and headers
  const storefront = {
    type: 'eds',
    environmentId: await getConfigValue('commerce.headers.cs.Magento-Environment-Id'),
    environmentType: (async () => {
      const endpoint = await getConfigValue('commerce-endpoint');
      return (endpoint.includes('sandbox')) ? 'testing' : '';
    })(),
    apiKey: await getConfigValue('commerce.headers.cs.x-api-key'),
    apiUrl: await getConfigValue('commerce-endpoint'),
    websiteCode: await getConfigValue('commerce.headers.cs.Magento-Website-Code'),
    storeCode: await getConfigValue('commerce.headers.cs.Magento-Store-Code'),
    storeViewCode: await getConfigValue('commerce.headers.cs.Magento-Store-View-Code'),
    customerGroup: await getConfigValue('commerce.headers.cs.Magento-Customer-Group'),
    route: ({ sku, urlKey }) => `/products/${urlKey}/${sku}`,
    defaultHeaders: {
        'Magento-Environment-Id': await getConfigValue('commerce.headers.cs.Magento-Environment-Id'),
        'Magento-Website-Code': await getConfigValue('commerce.headers.cs.Magento-Website-Code'),
        'Magento-Store-Code': await getConfigValue('commerce.headers.cs.Magento-Store-Code'),
        'Magento-Store-View-Code': await getConfigValue('commerce.headers.cs.Magento-Store-View-Code'),
        'Content-Type': 'application/json',
        'X-Api-Key': 'search_gql',
      },
  };
  // configurations for search functionality
  const search = {
    pageSize: 8,
    perPageConfig: {
      pageSizeOptions: '12, 24, 36',
      defaultPageSizeOption: '12',
    },
    minQueryLength: '2',
    currencySymbol: '$',
    currencyRate: '1',
    displayOutOfStock: true,
    allowAllProducts: false,
    imageCarousel: false,
    optimizeImages: true,
    imageBaseWidth: 200,
    listview: true,
    displayMode: '', // "" for plp || "PAGE" for category/catalog
    addToCart: async (...args) => {
      const { addProductsToCart } = await import('../storefront-cart/api.js');
      await addProductsToCart([{
        sku: args[0],
        options: args[1],
        quantity: args[2],
      }]);
    },
    route: {
      route: '/search',
      query: 'q',
    },
  };

  return initializers.mountImmediately(initialize, {
    langDefinitions,
    storefront,
    search,
  });
})();