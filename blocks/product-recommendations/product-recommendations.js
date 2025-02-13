/* eslint-disable no-underscore-dangle */
import { RecommendationList } from '@dropins/storefront-recommendations/containers/RecommendationList.js';
import { render as recsRenderer } from '@dropins/storefront-recommendations/render.js';

import { readBlockConfig } from '../../scripts/aem.js';
import { getConfigValue } from '../../scripts/configs.js';

// initialize dropins
import '../../scripts/initializers/cart.js';
import '../../scripts/initializers/recommendations.js';

const isMobile = window.matchMedia('only screen and (max-width: 900px)').matches;

let unitsPromise;

function renderPlaceholder(block) {
  block.innerHTML = `<h2></h2>
  <div class="scrollable">
    <div class="product-grid">
      ${[...Array(5)].map(() => `
        <div class="placeholder">
          <picture><img width="300" height="375" src="" /></picture>
        </div>
      `).join('')}
    </div>
  </div>`;
}

async function loadRecommendation(block, context, visibility, filters) {
  // Only load once the recommendation becomes visible
  if (!visibility) {
    return;
  }

  // Only proceed if all required data is available
  if (!context.pageType
    || (context.pageType === 'Product' && !context.currentSku)
    || (context.pageType === 'Category' && !context.category)
    || (context.pageType === 'Cart' && !context.cartSkus)) {
    return;
  }

  const storeViewCode = await getConfigValue('commerce.headers.cs.Magento-Store-View-Code');

  if (unitsPromise) {
    return;
  }

  unitsPromise = new Promise((resolve, reject) => {
    // Get product view history
    try {
      const viewHistory = window.localStorage.getItem(`${storeViewCode}:productViewHistory`) || '[]';
      context.userViewHistory = JSON.parse(viewHistory);
    } catch (e) {
      window.localStorage.removeItem('productViewHistory');
      console.error('Error parsing product view history', e);
    }

    // Get purchase history
    try {
      const purchaseHistory = window.localStorage.getItem(`${storeViewCode}:purchaseHistory`) || '[]';
      context.userPurchaseHistory = JSON.parse(purchaseHistory);
    } catch (e) {
      window.localStorage.removeItem('purchaseHistory');
      console.error('Error parsing purchase history', e);
    }
    resolve();
  });

  await unitsPromise;

  await recsRenderer.render(RecommendationList, {
    ...context,
    ...(filters?.typeId ? { config: { typeId: filters.typeId } } : {}),
    slots: {
      Actions: (ctx) => {
        ctx.appendButton((next, state) => {
          const adding = state.get('adding') ?? false;
          return {
            icon: 'Cart',
            text: 'Add to cart',
            disabled: adding,
            onClick: async (values) => {
              state.set('adding', true);
              const { addProductsToCart } = await import('@dropins/storefront-cart/api.js');
              await addProductsToCart([{ ...values }]);
              state.set('adding', false);
            },
          };
        });
      },
    },
  })(block);
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const filters = {};
  if (config.typeid) {
    filters.typeId = config.typeid;
  }
  renderPlaceholder(block);

  const context = {};
  let visibility = !isMobile;

  function handleProductChanges({ productContext }) {
    context.currentSku = productContext?.sku;
    loadRecommendation(block, context, visibility, filters);
  }

  function handleCategoryChanges({ categoryContext }) {
    context.category = categoryContext?.name;
    loadRecommendation(block, context, visibility, filters);
  }

  function handlePageTypeChanges({ pageContext }) {
    context.pageType = pageContext?.pageType;
    loadRecommendation(block, context, visibility, filters);
  }

  function handleCartChanges({ shoppingCartContext }) {
    context.cartSkus = shoppingCartContext?.totalQuantity === 0
      ? []
      : shoppingCartContext?.items?.map(({ product }) => product.sku);
    loadRecommendation(block, context, visibility, filters);
  }

  window.adobeDataLayer.push((dl) => {
    dl.addEventListener('adobeDataLayer:change', handlePageTypeChanges, { path: 'pageContext' });
    dl.addEventListener('adobeDataLayer:change', handleProductChanges, { path: 'productContext' });
    dl.addEventListener('adobeDataLayer:change', handleCategoryChanges, { path: 'categoryContext' });
    dl.addEventListener('adobeDataLayer:change', handleCartChanges, { path: 'shoppingCartContext' });
  });

  if (isMobile) {
    const section = block.closest('.section');
    const inViewObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibility = true;
          loadRecommendation(block, context, visibility, filters);
          inViewObserver.disconnect();
        }
      });
    });
    inViewObserver.observe(section);
  }
}
