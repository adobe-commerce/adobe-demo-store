/*! Copyright 2025 Adobe
All Rights Reserved. */
import { Initializer } from "@dropins/tools/lib.js";
const initialize = new Initializer({
  init: async (config2) => {
    const defaultConfig = {};
    initialize.config.setConfig({
      ...defaultConfig,
      ...config2
    });
  },
  listeners: () => [
    // events.on('authenticated', (authenticated) => {
    //   console.log('authenticated', authenticated);
    // }),
  ]
});
const config = initialize.config;
export {
  config as c,
  initialize as i
};
//# sourceMappingURL=initialize.js.map
