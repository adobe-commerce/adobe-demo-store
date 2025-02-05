/*! Copyright 2025 Adobe
All Rights Reserved. */
import { options, Fragment, Component } from "@dropins/tools/preact.js";
var i;
function t(o, e) {
  return options.__a && options.__a(e), o;
}
null != (i = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : void 0) && i.__PREACT_DEVTOOLS__ && i.__PREACT_DEVTOOLS__.attachPreact("10.24.3", options, { Fragment, Component });
var f = 0;
function u(e, t2, n, o, i2, u2) {
  t2 || (t2 = {});
  var a, c, l = t2;
  "ref" in t2 && (a = t2.ref, delete t2.ref);
  var p = { type: e, props: l, key: n, ref: a, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: --f, __i: -1, __u: 0, __source: i2, __self: u2 };
  if ("function" == typeof e && (a = e.defaultProps)) for (c in a) void 0 === l[c] && (l[c] = a[c]);
  return options.vnode && options.vnode(p), p;
}
export {
  t,
  u
};
//# sourceMappingURL=jsxRuntime.module.js.map
