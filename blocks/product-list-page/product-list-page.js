
/* eslint-disable import/no-unresolved */
// uncomment this line if you are using the local version
// import { ProductListingPage } from 'http://localhost:3002/containers/ProductListingPage.js';
// import { render as provider } from 'http://localhost:3002/render.js';
import { ProductListingPage } from '/scripts/__dropins__/storefront-search/dist/containers/ProductListingPage.js';
import { render as provider } from '/scripts/__dropins__/storefront-search/dist/render.js';
import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const { category, urlpath, type } = readBlockConfig(block);

  block.textContent = '';

  const storeDetails = {};

  // for non search pages
  if (type !== 'search') {
    // TODO: set this with initializer
    storeDetails.config.categoryName = document.querySelector('.default-content-wrapper > h1')?.innerText;
    storeDetails.config.currentCategoryId = category;
    storeDetails.config.currentCategoryUrlPath = urlpath;

    // Enable enrichment
    block.dataset.category = category;
  }

  const widget = document.createElement('div');
  block.appendChild(widget);

  provider.render(ProductListingPage)(widget);
}
