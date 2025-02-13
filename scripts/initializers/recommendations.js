/* eslint-disable import/no-cycle */
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setEndpoint, setFetchGraphQlHeaders } from '@dropins/storefront-recommendations/api.js';
import {
  commerceEndpointWithQueryParams,
} from '../commerce.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../aem.js';
import { getHeaders } from '../configs.js';

await initializeDropin(async () => {
  setEndpoint(await commerceEndpointWithQueryParams());
  setFetchGraphQlHeaders({
    ...(await getHeaders('cs')),
    'Content-Type': 'application/json',
  });

  const labels = await fetchPlaceholders();
  const langDefinitions = {
    default: {
      ...labels,
    },
  };
  return initializers.mountImmediately(initialize, { langDefinitions });
})();
