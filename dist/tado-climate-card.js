/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var _a;
const t$2 = globalThis, e$2 = t$2.ShadowRoot && (void 0 === t$2.ShadyCSS || t$2.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, s$2 = Symbol(), o$4 = /* @__PURE__ */ new WeakMap();
let n$3 = class n {
  constructor(t2, e2, o2) {
    if (this._$cssResult$ = true, o2 !== s$2) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t2, this.t = e2;
  }
  get styleSheet() {
    let t2 = this.o;
    const s2 = this.t;
    if (e$2 && void 0 === t2) {
      const e2 = void 0 !== s2 && 1 === s2.length;
      e2 && (t2 = o$4.get(s2)), void 0 === t2 && ((this.o = t2 = new CSSStyleSheet()).replaceSync(this.cssText), e2 && o$4.set(s2, t2));
    }
    return t2;
  }
  toString() {
    return this.cssText;
  }
};
const r$4 = (t2) => new n$3("string" == typeof t2 ? t2 : t2 + "", void 0, s$2), i$3 = (t2, ...e2) => {
  const o2 = 1 === t2.length ? t2[0] : e2.reduce((e3, s2, o3) => e3 + ((t3) => {
    if (true === t3._$cssResult$) return t3.cssText;
    if ("number" == typeof t3) return t3;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t3 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s2) + t2[o3 + 1], t2[0]);
  return new n$3(o2, t2, s$2);
}, S$1 = (s2, o2) => {
  if (e$2) s2.adoptedStyleSheets = o2.map((t2) => t2 instanceof CSSStyleSheet ? t2 : t2.styleSheet);
  else for (const e2 of o2) {
    const o3 = document.createElement("style"), n3 = t$2.litNonce;
    void 0 !== n3 && o3.setAttribute("nonce", n3), o3.textContent = e2.cssText, s2.appendChild(o3);
  }
}, c$2 = e$2 ? (t2) => t2 : (t2) => t2 instanceof CSSStyleSheet ? ((t3) => {
  let e2 = "";
  for (const s2 of t3.cssRules) e2 += s2.cssText;
  return r$4(e2);
})(t2) : t2;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: i$2, defineProperty: e$1, getOwnPropertyDescriptor: h$1, getOwnPropertyNames: r$3, getOwnPropertySymbols: o$3, getPrototypeOf: n$2 } = Object, a$1 = globalThis, c$1 = a$1.trustedTypes, l$1 = c$1 ? c$1.emptyScript : "", p$1 = a$1.reactiveElementPolyfillSupport, d$1 = (t2, s2) => t2, u$1 = { toAttribute(t2, s2) {
  switch (s2) {
    case Boolean:
      t2 = t2 ? l$1 : null;
      break;
    case Object:
    case Array:
      t2 = null == t2 ? t2 : JSON.stringify(t2);
  }
  return t2;
}, fromAttribute(t2, s2) {
  let i2 = t2;
  switch (s2) {
    case Boolean:
      i2 = null !== t2;
      break;
    case Number:
      i2 = null === t2 ? null : Number(t2);
      break;
    case Object:
    case Array:
      try {
        i2 = JSON.parse(t2);
      } catch (t3) {
        i2 = null;
      }
  }
  return i2;
} }, f$1 = (t2, s2) => !i$2(t2, s2), b$1 = { attribute: true, type: String, converter: u$1, reflect: false, useDefault: false, hasChanged: f$1 };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), a$1.litPropertyMetadata ?? (a$1.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let y$1 = class y extends HTMLElement {
  static addInitializer(t2) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t2);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t2, s2 = b$1) {
    if (s2.state && (s2.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t2) && ((s2 = Object.create(s2)).wrapped = true), this.elementProperties.set(t2, s2), !s2.noAccessor) {
      const i2 = Symbol(), h2 = this.getPropertyDescriptor(t2, i2, s2);
      void 0 !== h2 && e$1(this.prototype, t2, h2);
    }
  }
  static getPropertyDescriptor(t2, s2, i2) {
    const { get: e2, set: r2 } = h$1(this.prototype, t2) ?? { get() {
      return this[s2];
    }, set(t3) {
      this[s2] = t3;
    } };
    return { get: e2, set(s3) {
      const h2 = e2 == null ? void 0 : e2.call(this);
      r2 == null ? void 0 : r2.call(this, s3), this.requestUpdate(t2, h2, i2);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t2) {
    return this.elementProperties.get(t2) ?? b$1;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d$1("elementProperties"))) return;
    const t2 = n$2(this);
    t2.finalize(), void 0 !== t2.l && (this.l = [...t2.l]), this.elementProperties = new Map(t2.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d$1("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d$1("properties"))) {
      const t3 = this.properties, s2 = [...r$3(t3), ...o$3(t3)];
      for (const i2 of s2) this.createProperty(i2, t3[i2]);
    }
    const t2 = this[Symbol.metadata];
    if (null !== t2) {
      const s2 = litPropertyMetadata.get(t2);
      if (void 0 !== s2) for (const [t3, i2] of s2) this.elementProperties.set(t3, i2);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t3, s2] of this.elementProperties) {
      const i2 = this._$Eu(t3, s2);
      void 0 !== i2 && this._$Eh.set(i2, t3);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s2) {
    const i2 = [];
    if (Array.isArray(s2)) {
      const e2 = new Set(s2.flat(1 / 0).reverse());
      for (const s3 of e2) i2.unshift(c$2(s3));
    } else void 0 !== s2 && i2.push(c$2(s2));
    return i2;
  }
  static _$Eu(t2, s2) {
    const i2 = s2.attribute;
    return false === i2 ? void 0 : "string" == typeof i2 ? i2 : "string" == typeof t2 ? t2.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var _a2;
    this._$ES = new Promise((t2) => this.enableUpdating = t2), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (_a2 = this.constructor.l) == null ? void 0 : _a2.forEach((t2) => t2(this));
  }
  addController(t2) {
    var _a2;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t2), void 0 !== this.renderRoot && this.isConnected && ((_a2 = t2.hostConnected) == null ? void 0 : _a2.call(t2));
  }
  removeController(t2) {
    var _a2;
    (_a2 = this._$EO) == null ? void 0 : _a2.delete(t2);
  }
  _$E_() {
    const t2 = /* @__PURE__ */ new Map(), s2 = this.constructor.elementProperties;
    for (const i2 of s2.keys()) this.hasOwnProperty(i2) && (t2.set(i2, this[i2]), delete this[i2]);
    t2.size > 0 && (this._$Ep = t2);
  }
  createRenderRoot() {
    const t2 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S$1(t2, this.constructor.elementStyles), t2;
  }
  connectedCallback() {
    var _a2;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), (_a2 = this._$EO) == null ? void 0 : _a2.forEach((t2) => {
      var _a3;
      return (_a3 = t2.hostConnected) == null ? void 0 : _a3.call(t2);
    });
  }
  enableUpdating(t2) {
  }
  disconnectedCallback() {
    var _a2;
    (_a2 = this._$EO) == null ? void 0 : _a2.forEach((t2) => {
      var _a3;
      return (_a3 = t2.hostDisconnected) == null ? void 0 : _a3.call(t2);
    });
  }
  attributeChangedCallback(t2, s2, i2) {
    this._$AK(t2, i2);
  }
  _$ET(t2, s2) {
    var _a2;
    const i2 = this.constructor.elementProperties.get(t2), e2 = this.constructor._$Eu(t2, i2);
    if (void 0 !== e2 && true === i2.reflect) {
      const h2 = (void 0 !== ((_a2 = i2.converter) == null ? void 0 : _a2.toAttribute) ? i2.converter : u$1).toAttribute(s2, i2.type);
      this._$Em = t2, null == h2 ? this.removeAttribute(e2) : this.setAttribute(e2, h2), this._$Em = null;
    }
  }
  _$AK(t2, s2) {
    var _a2, _b;
    const i2 = this.constructor, e2 = i2._$Eh.get(t2);
    if (void 0 !== e2 && this._$Em !== e2) {
      const t3 = i2.getPropertyOptions(e2), h2 = "function" == typeof t3.converter ? { fromAttribute: t3.converter } : void 0 !== ((_a2 = t3.converter) == null ? void 0 : _a2.fromAttribute) ? t3.converter : u$1;
      this._$Em = e2;
      const r2 = h2.fromAttribute(s2, t3.type);
      this[e2] = r2 ?? ((_b = this._$Ej) == null ? void 0 : _b.get(e2)) ?? r2, this._$Em = null;
    }
  }
  requestUpdate(t2, s2, i2, e2 = false, h2) {
    var _a2;
    if (void 0 !== t2) {
      const r2 = this.constructor;
      if (false === e2 && (h2 = this[t2]), i2 ?? (i2 = r2.getPropertyOptions(t2)), !((i2.hasChanged ?? f$1)(h2, s2) || i2.useDefault && i2.reflect && h2 === ((_a2 = this._$Ej) == null ? void 0 : _a2.get(t2)) && !this.hasAttribute(r2._$Eu(t2, i2)))) return;
      this.C(t2, s2, i2);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t2, s2, { useDefault: i2, reflect: e2, wrapped: h2 }, r2) {
    i2 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t2) && (this._$Ej.set(t2, r2 ?? s2 ?? this[t2]), true !== h2 || void 0 !== r2) || (this._$AL.has(t2) || (this.hasUpdated || i2 || (s2 = void 0), this._$AL.set(t2, s2)), true === e2 && this._$Em !== t2 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t2));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t3) {
      Promise.reject(t3);
    }
    const t2 = this.scheduleUpdate();
    return null != t2 && await t2, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var _a2;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t4, s3] of this._$Ep) this[t4] = s3;
        this._$Ep = void 0;
      }
      const t3 = this.constructor.elementProperties;
      if (t3.size > 0) for (const [s3, i2] of t3) {
        const { wrapped: t4 } = i2, e2 = this[s3];
        true !== t4 || this._$AL.has(s3) || void 0 === e2 || this.C(s3, void 0, i2, e2);
      }
    }
    let t2 = false;
    const s2 = this._$AL;
    try {
      t2 = this.shouldUpdate(s2), t2 ? (this.willUpdate(s2), (_a2 = this._$EO) == null ? void 0 : _a2.forEach((t3) => {
        var _a3;
        return (_a3 = t3.hostUpdate) == null ? void 0 : _a3.call(t3);
      }), this.update(s2)) : this._$EM();
    } catch (s3) {
      throw t2 = false, this._$EM(), s3;
    }
    t2 && this._$AE(s2);
  }
  willUpdate(t2) {
  }
  _$AE(t2) {
    var _a2;
    (_a2 = this._$EO) == null ? void 0 : _a2.forEach((t3) => {
      var _a3;
      return (_a3 = t3.hostUpdated) == null ? void 0 : _a3.call(t3);
    }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t2)), this.updated(t2);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t2) {
    return true;
  }
  update(t2) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t3) => this._$ET(t3, this[t3]))), this._$EM();
  }
  updated(t2) {
  }
  firstUpdated(t2) {
  }
};
y$1.elementStyles = [], y$1.shadowRootOptions = { mode: "open" }, y$1[d$1("elementProperties")] = /* @__PURE__ */ new Map(), y$1[d$1("finalized")] = /* @__PURE__ */ new Map(), p$1 == null ? void 0 : p$1({ ReactiveElement: y$1 }), (a$1.reactiveElementVersions ?? (a$1.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1 = globalThis, i$1 = (t2) => t2, s$1 = t$1.trustedTypes, e = s$1 ? s$1.createPolicy("lit-html", { createHTML: (t2) => t2 }) : void 0, h = "$lit$", o$2 = `lit$${Math.random().toFixed(9).slice(2)}$`, n$1 = "?" + o$2, r$2 = `<${n$1}>`, l = document, c = () => l.createComment(""), a = (t2) => null === t2 || "object" != typeof t2 && "function" != typeof t2, u = Array.isArray, d = (t2) => u(t2) || "function" == typeof (t2 == null ? void 0 : t2[Symbol.iterator]), f = "[ 	\n\f\r]", v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _ = /-->/g, m = />/g, p = RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), g = /'/g, $ = /"/g, y2 = /^(?:script|style|textarea|title)$/i, x = (t2) => (i2, ...s2) => ({ _$litType$: t2, strings: i2, values: s2 }), b = x(1), E = Symbol.for("lit-noChange"), A = Symbol.for("lit-nothing"), C$1 = /* @__PURE__ */ new WeakMap(), P = l.createTreeWalker(l, 129);
function V(t2, i2) {
  if (!u(t2) || !t2.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e ? e.createHTML(i2) : i2;
}
const N = (t2, i2) => {
  const s2 = t2.length - 1, e2 = [];
  let n3, l2 = 2 === i2 ? "<svg>" : 3 === i2 ? "<math>" : "", c2 = v;
  for (let i3 = 0; i3 < s2; i3++) {
    const s3 = t2[i3];
    let a2, u2, d2 = -1, f2 = 0;
    for (; f2 < s3.length && (c2.lastIndex = f2, u2 = c2.exec(s3), null !== u2); ) f2 = c2.lastIndex, c2 === v ? "!--" === u2[1] ? c2 = _ : void 0 !== u2[1] ? c2 = m : void 0 !== u2[2] ? (y2.test(u2[2]) && (n3 = RegExp("</" + u2[2], "g")), c2 = p) : void 0 !== u2[3] && (c2 = p) : c2 === p ? ">" === u2[0] ? (c2 = n3 ?? v, d2 = -1) : void 0 === u2[1] ? d2 = -2 : (d2 = c2.lastIndex - u2[2].length, a2 = u2[1], c2 = void 0 === u2[3] ? p : '"' === u2[3] ? $ : g) : c2 === $ || c2 === g ? c2 = p : c2 === _ || c2 === m ? c2 = v : (c2 = p, n3 = void 0);
    const x2 = c2 === p && t2[i3 + 1].startsWith("/>") ? " " : "";
    l2 += c2 === v ? s3 + r$2 : d2 >= 0 ? (e2.push(a2), s3.slice(0, d2) + h + s3.slice(d2) + o$2 + x2) : s3 + o$2 + (-2 === d2 ? i3 : x2);
  }
  return [V(t2, l2 + (t2[s2] || "<?>") + (2 === i2 ? "</svg>" : 3 === i2 ? "</math>" : "")), e2];
};
class S {
  constructor({ strings: t2, _$litType$: i2 }, e2) {
    let r2;
    this.parts = [];
    let l2 = 0, a2 = 0;
    const u2 = t2.length - 1, d2 = this.parts, [f2, v2] = N(t2, i2);
    if (this.el = S.createElement(f2, e2), P.currentNode = this.el.content, 2 === i2 || 3 === i2) {
      const t3 = this.el.content.firstChild;
      t3.replaceWith(...t3.childNodes);
    }
    for (; null !== (r2 = P.nextNode()) && d2.length < u2; ) {
      if (1 === r2.nodeType) {
        if (r2.hasAttributes()) for (const t3 of r2.getAttributeNames()) if (t3.endsWith(h)) {
          const i3 = v2[a2++], s2 = r2.getAttribute(t3).split(o$2), e3 = /([.?@])?(.*)/.exec(i3);
          d2.push({ type: 1, index: l2, name: e3[2], strings: s2, ctor: "." === e3[1] ? I : "?" === e3[1] ? L : "@" === e3[1] ? z : H }), r2.removeAttribute(t3);
        } else t3.startsWith(o$2) && (d2.push({ type: 6, index: l2 }), r2.removeAttribute(t3));
        if (y2.test(r2.tagName)) {
          const t3 = r2.textContent.split(o$2), i3 = t3.length - 1;
          if (i3 > 0) {
            r2.textContent = s$1 ? s$1.emptyScript : "";
            for (let s2 = 0; s2 < i3; s2++) r2.append(t3[s2], c()), P.nextNode(), d2.push({ type: 2, index: ++l2 });
            r2.append(t3[i3], c());
          }
        }
      } else if (8 === r2.nodeType) if (r2.data === n$1) d2.push({ type: 2, index: l2 });
      else {
        let t3 = -1;
        for (; -1 !== (t3 = r2.data.indexOf(o$2, t3 + 1)); ) d2.push({ type: 7, index: l2 }), t3 += o$2.length - 1;
      }
      l2++;
    }
  }
  static createElement(t2, i2) {
    const s2 = l.createElement("template");
    return s2.innerHTML = t2, s2;
  }
}
function M(t2, i2, s2 = t2, e2) {
  var _a2, _b;
  if (i2 === E) return i2;
  let h2 = void 0 !== e2 ? (_a2 = s2._$Co) == null ? void 0 : _a2[e2] : s2._$Cl;
  const o2 = a(i2) ? void 0 : i2._$litDirective$;
  return (h2 == null ? void 0 : h2.constructor) !== o2 && ((_b = h2 == null ? void 0 : h2._$AO) == null ? void 0 : _b.call(h2, false), void 0 === o2 ? h2 = void 0 : (h2 = new o2(t2), h2._$AT(t2, s2, e2)), void 0 !== e2 ? (s2._$Co ?? (s2._$Co = []))[e2] = h2 : s2._$Cl = h2), void 0 !== h2 && (i2 = M(t2, h2._$AS(t2, i2.values), h2, e2)), i2;
}
class R {
  constructor(t2, i2) {
    this._$AV = [], this._$AN = void 0, this._$AD = t2, this._$AM = i2;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t2) {
    const { el: { content: i2 }, parts: s2 } = this._$AD, e2 = ((t2 == null ? void 0 : t2.creationScope) ?? l).importNode(i2, true);
    P.currentNode = e2;
    let h2 = P.nextNode(), o2 = 0, n3 = 0, r2 = s2[0];
    for (; void 0 !== r2; ) {
      if (o2 === r2.index) {
        let i3;
        2 === r2.type ? i3 = new k(h2, h2.nextSibling, this, t2) : 1 === r2.type ? i3 = new r2.ctor(h2, r2.name, r2.strings, this, t2) : 6 === r2.type && (i3 = new Z(h2, this, t2)), this._$AV.push(i3), r2 = s2[++n3];
      }
      o2 !== (r2 == null ? void 0 : r2.index) && (h2 = P.nextNode(), o2++);
    }
    return P.currentNode = l, e2;
  }
  p(t2) {
    let i2 = 0;
    for (const s2 of this._$AV) void 0 !== s2 && (void 0 !== s2.strings ? (s2._$AI(t2, s2, i2), i2 += s2.strings.length - 2) : s2._$AI(t2[i2])), i2++;
  }
}
class k {
  get _$AU() {
    var _a2;
    return ((_a2 = this._$AM) == null ? void 0 : _a2._$AU) ?? this._$Cv;
  }
  constructor(t2, i2, s2, e2) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t2, this._$AB = i2, this._$AM = s2, this.options = e2, this._$Cv = (e2 == null ? void 0 : e2.isConnected) ?? true;
  }
  get parentNode() {
    let t2 = this._$AA.parentNode;
    const i2 = this._$AM;
    return void 0 !== i2 && 11 === (t2 == null ? void 0 : t2.nodeType) && (t2 = i2.parentNode), t2;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t2, i2 = this) {
    t2 = M(this, t2, i2), a(t2) ? t2 === A || null == t2 || "" === t2 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t2 !== this._$AH && t2 !== E && this._(t2) : void 0 !== t2._$litType$ ? this.$(t2) : void 0 !== t2.nodeType ? this.T(t2) : d(t2) ? this.k(t2) : this._(t2);
  }
  O(t2) {
    return this._$AA.parentNode.insertBefore(t2, this._$AB);
  }
  T(t2) {
    this._$AH !== t2 && (this._$AR(), this._$AH = this.O(t2));
  }
  _(t2) {
    this._$AH !== A && a(this._$AH) ? this._$AA.nextSibling.data = t2 : this.T(l.createTextNode(t2)), this._$AH = t2;
  }
  $(t2) {
    var _a2;
    const { values: i2, _$litType$: s2 } = t2, e2 = "number" == typeof s2 ? this._$AC(t2) : (void 0 === s2.el && (s2.el = S.createElement(V(s2.h, s2.h[0]), this.options)), s2);
    if (((_a2 = this._$AH) == null ? void 0 : _a2._$AD) === e2) this._$AH.p(i2);
    else {
      const t3 = new R(e2, this), s3 = t3.u(this.options);
      t3.p(i2), this.T(s3), this._$AH = t3;
    }
  }
  _$AC(t2) {
    let i2 = C$1.get(t2.strings);
    return void 0 === i2 && C$1.set(t2.strings, i2 = new S(t2)), i2;
  }
  k(t2) {
    u(this._$AH) || (this._$AH = [], this._$AR());
    const i2 = this._$AH;
    let s2, e2 = 0;
    for (const h2 of t2) e2 === i2.length ? i2.push(s2 = new k(this.O(c()), this.O(c()), this, this.options)) : s2 = i2[e2], s2._$AI(h2), e2++;
    e2 < i2.length && (this._$AR(s2 && s2._$AB.nextSibling, e2), i2.length = e2);
  }
  _$AR(t2 = this._$AA.nextSibling, s2) {
    var _a2;
    for ((_a2 = this._$AP) == null ? void 0 : _a2.call(this, false, true, s2); t2 !== this._$AB; ) {
      const s3 = i$1(t2).nextSibling;
      i$1(t2).remove(), t2 = s3;
    }
  }
  setConnected(t2) {
    var _a2;
    void 0 === this._$AM && (this._$Cv = t2, (_a2 = this._$AP) == null ? void 0 : _a2.call(this, t2));
  }
}
class H {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t2, i2, s2, e2, h2) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t2, this.name = i2, this._$AM = e2, this.options = h2, s2.length > 2 || "" !== s2[0] || "" !== s2[1] ? (this._$AH = Array(s2.length - 1).fill(new String()), this.strings = s2) : this._$AH = A;
  }
  _$AI(t2, i2 = this, s2, e2) {
    const h2 = this.strings;
    let o2 = false;
    if (void 0 === h2) t2 = M(this, t2, i2, 0), o2 = !a(t2) || t2 !== this._$AH && t2 !== E, o2 && (this._$AH = t2);
    else {
      const e3 = t2;
      let n3, r2;
      for (t2 = h2[0], n3 = 0; n3 < h2.length - 1; n3++) r2 = M(this, e3[s2 + n3], i2, n3), r2 === E && (r2 = this._$AH[n3]), o2 || (o2 = !a(r2) || r2 !== this._$AH[n3]), r2 === A ? t2 = A : t2 !== A && (t2 += (r2 ?? "") + h2[n3 + 1]), this._$AH[n3] = r2;
    }
    o2 && !e2 && this.j(t2);
  }
  j(t2) {
    t2 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t2 ?? "");
  }
}
class I extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t2) {
    this.element[this.name] = t2 === A ? void 0 : t2;
  }
}
class L extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t2) {
    this.element.toggleAttribute(this.name, !!t2 && t2 !== A);
  }
}
class z extends H {
  constructor(t2, i2, s2, e2, h2) {
    super(t2, i2, s2, e2, h2), this.type = 5;
  }
  _$AI(t2, i2 = this) {
    if ((t2 = M(this, t2, i2, 0) ?? A) === E) return;
    const s2 = this._$AH, e2 = t2 === A && s2 !== A || t2.capture !== s2.capture || t2.once !== s2.once || t2.passive !== s2.passive, h2 = t2 !== A && (s2 === A || e2);
    e2 && this.element.removeEventListener(this.name, this, s2), h2 && this.element.addEventListener(this.name, this, t2), this._$AH = t2;
  }
  handleEvent(t2) {
    var _a2;
    "function" == typeof this._$AH ? this._$AH.call(((_a2 = this.options) == null ? void 0 : _a2.host) ?? this.element, t2) : this._$AH.handleEvent(t2);
  }
}
class Z {
  constructor(t2, i2, s2) {
    this.element = t2, this.type = 6, this._$AN = void 0, this._$AM = i2, this.options = s2;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t2) {
    M(this, t2);
  }
}
const B = t$1.litHtmlPolyfillSupport;
B == null ? void 0 : B(S, k), (t$1.litHtmlVersions ?? (t$1.litHtmlVersions = [])).push("3.3.2");
const D = (t2, i2, s2) => {
  const e2 = (s2 == null ? void 0 : s2.renderBefore) ?? i2;
  let h2 = e2._$litPart$;
  if (void 0 === h2) {
    const t3 = (s2 == null ? void 0 : s2.renderBefore) ?? null;
    e2._$litPart$ = h2 = new k(i2.insertBefore(c(), t3), t3, void 0, s2 ?? {});
  }
  return h2._$AI(t2), h2;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const s = globalThis;
class i extends y$1 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a2;
    const t2 = super.createRenderRoot();
    return (_a2 = this.renderOptions).renderBefore ?? (_a2.renderBefore = t2.firstChild), t2;
  }
  update(t2) {
    const r2 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t2), this._$Do = D(r2, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var _a2;
    super.connectedCallback(), (_a2 = this._$Do) == null ? void 0 : _a2.setConnected(true);
  }
  disconnectedCallback() {
    var _a2;
    super.disconnectedCallback(), (_a2 = this._$Do) == null ? void 0 : _a2.setConnected(false);
  }
  render() {
    return E;
  }
}
i._$litElement$ = true, i["finalized"] = true, (_a = s.litElementHydrateSupport) == null ? void 0 : _a.call(s, { LitElement: i });
const o$1 = s.litElementPolyfillSupport;
o$1 == null ? void 0 : o$1({ LitElement: i });
(s.litElementVersions ?? (s.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t = (t2) => (e2, o2) => {
  void 0 !== o2 ? o2.addInitializer(() => {
    customElements.define(t2, e2);
  }) : customElements.define(t2, e2);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o = { attribute: true, type: String, converter: u$1, reflect: false, hasChanged: f$1 }, r$1 = (t2 = o, e2, r2) => {
  const { kind: n3, metadata: i2 } = r2;
  let s2 = globalThis.litPropertyMetadata.get(i2);
  if (void 0 === s2 && globalThis.litPropertyMetadata.set(i2, s2 = /* @__PURE__ */ new Map()), "setter" === n3 && ((t2 = Object.create(t2)).wrapped = true), s2.set(r2.name, t2), "accessor" === n3) {
    const { name: o2 } = r2;
    return { set(r3) {
      const n4 = e2.get.call(this);
      e2.set.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    }, init(e3) {
      return void 0 !== e3 && this.C(o2, void 0, t2, e3), e3;
    } };
  }
  if ("setter" === n3) {
    const { name: o2 } = r2;
    return function(r3) {
      const n4 = this[o2];
      e2.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    };
  }
  throw Error("Unsupported decorator location: " + n3);
};
function n2(t2) {
  return (e2, o2) => "object" == typeof o2 ? r$1(t2, e2, o2) : ((t3, e3, o3) => {
    const r2 = e3.hasOwnProperty(o3);
    return e3.constructor.createProperty(o3, t3), r2 ? Object.getOwnPropertyDescriptor(e3, o3) : void 0;
  })(t2, e2, o2);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function r(r2) {
  return n2({ ...r2, state: true, attribute: false });
}
const C = {
  grey: [158, 158, 158],
  teal: [0, 150, 136],
  green: [76, 175, 80],
  yellow: [255, 235, 59],
  deepOrange: [255, 87, 34]
};
function clamp(v2, lo, hi) {
  return Math.max(lo, Math.min(hi, v2));
}
function lerp(a2, b2, t2) {
  return Math.round(a2 + (b2 - a2) * clamp(t2, 0, 1));
}
function rgb(c2) {
  return `rgb(${c2[0]}, ${c2[1]}, ${c2[2]})`;
}
function lerpRgb(c1, c2, t2) {
  return `rgb(${lerp(c1[0], c2[0], t2)}, ${lerp(c1[1], c2[1], t2)}, ${lerp(c1[2], c2[2], t2)})`;
}
function temperatureColor(value) {
  if (value < 5) return rgb(C.grey);
  if (value <= 18.5) return lerpRgb(C.teal, C.green, (value - 5) / (18.5 - 5));
  if (value < 18.75) return rgb(C.green);
  if (value < 19) return rgb(C.yellow);
  return lerpRgb(C.yellow, C.deepOrange, (value - 19) / (25 - 19));
}
function lerpHex(a2, b2, t2) {
  const parse = (h2) => [
    parseInt(h2.slice(1, 3), 16),
    parseInt(h2.slice(3, 5), 16),
    parseInt(h2.slice(5, 7), 16)
  ];
  const [ar, ag, ab] = parse(a2);
  const [br, bg, bb] = parse(b2);
  const r2 = Math.round(ar + (br - ar) * t2);
  const g2 = Math.round(ag + (bg - ag) * t2);
  const bv = Math.round(ab + (bb - ab) * t2);
  return `#${r2.toString(16).padStart(2, "0")}${g2.toString(16).padStart(2, "0")}${bv.toString(16).padStart(2, "0")}`;
}
const YELLOW = "#fdd835";
const AMBER = "#ffa000";
const DEEP_ORANGE = "#f4511e";
const GRAY = "#9da0a2";
function heatingPct(hass, entity) {
  const sensorId = entity.entity_id.replace("climate.", "sensor.") + "_heating";
  const sensor = hass.states[sensorId];
  if (!sensor || sensor.state === "unavailable" || sensor.state === "unknown") return null;
  const v2 = parseFloat(sensor.state);
  return isNaN(v2) ? null : v2;
}
function radiatorIconProps(hass, entity) {
  if (entity.state === "off") {
    return { icon: "mdi:radiator-disabled", color: GRAY };
  }
  const pct = heatingPct(hass, entity);
  let color;
  if (pct !== null) {
    const t2 = Math.max(0, Math.min(100, pct)) / 100;
    color = t2 <= 0.5 ? lerpHex(YELLOW, AMBER, t2 * 2) : lerpHex(AMBER, DEEP_ORANGE, (t2 - 0.5) * 2);
  } else {
    color = entity.attributes.hvac_action === "heating" ? AMBER : YELLOW;
  }
  return { icon: "mdi:radiator", color };
}
const STORAGE_KEY = "tado_card";
let _cache = null;
let _loadPromise = null;
async function load(hass) {
  if (_cache) return _cache;
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    try {
      const result = await hass.connection.sendMessagePromise({
        type: "frontend/get_user_data",
        key: STORAGE_KEY
      });
      _cache = (result == null ? void 0 : result.value) ?? {};
    } catch (e2) {
      console.warn("[tado-card] failed to load user prefs:", e2);
      _cache = {};
    }
    return _cache;
  })();
  return _loadPromise;
}
async function save(hass) {
  if (!_cache) return;
  try {
    await hass.connection.sendMessagePromise({
      type: "frontend/set_user_data",
      key: STORAGE_KEY,
      value: _cache
    });
  } catch (e2) {
    console.warn("[tado-card] failed to save user prefs:", e2);
  }
}
async function getDurationPref(hass, entityId) {
  var _a2;
  const blob = await load(hass);
  return ((_a2 = blob.durations) == null ? void 0 : _a2[entityId]) ?? null;
}
async function setDurationPref(hass, entityId, key) {
  const blob = await load(hass);
  blob.durations = { ...blob.durations ?? {}, [entityId]: key };
  await save(hass);
}
async function getAppliedOverlay(hass, entityId) {
  var _a2;
  const blob = await load(hass);
  return ((_a2 = blob.appliedOverlays) == null ? void 0 : _a2[entityId]) ?? null;
}
async function setAppliedOverlay(hass, entityId, marker) {
  const blob = await load(hass);
  blob.appliedOverlays = { ...blob.appliedOverlays ?? {}, [entityId]: marker };
  await save(hass);
}
function effectiveTermination(rawType, rawTimestamp, marker) {
  if (rawType === "TIMER" && marker && marker.type === "NEXT_TIME_BLOCK" && marker.terminationTimestamp === (rawTimestamp ?? null)) {
    return "NEXT_TIME_BLOCK";
  }
  return rawType;
}
function remainingLabel(type, timestamp) {
  switch (type) {
    case "TIMER": {
      if (!timestamp) return "Timed override";
      const ms = new Date(timestamp).getTime() - Date.now();
      if (ms <= 0) return "Expiring";
      const mins = Math.round(ms / 6e4);
      if (mins < 60) return `${mins}m remaining`;
      const h2 = Math.floor(mins / 60);
      const m2 = mins % 60;
      return m2 > 0 ? `${h2}h ${m2}m remaining` : `${h2}h remaining`;
    }
    case "NEXT_TIME_BLOCK":
      return "Until next time block";
    case "MANUAL":
      return "Until you resume schedule";
    case "TADO_MODE":
      return "Zone default";
    default:
      return "";
  }
}
var __defProp$2 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __decorateClass$2 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$2(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$2(target, key, result);
  return result;
};
let TadoOverlayStrip = class extends i {
  constructor() {
    super(...arguments);
    this._marker = null;
    this._lastEntityId = null;
  }
  updated(changed) {
    var _a2;
    if (changed.has("entity") && ((_a2 = this.entity) == null ? void 0 : _a2.entity_id) !== this._lastEntityId) {
      this._lastEntityId = this.entity.entity_id;
      this._marker = null;
      const entityId = this.entity.entity_id;
      getAppliedOverlay(this.hass, entityId).then((m2) => {
        if (this._lastEntityId === entityId) this._marker = m2;
      });
    }
  }
  get _terminationType() {
    const raw = this.entity.attributes.HA_TERMINATION_TYPE;
    const ts = this.entity.attributes.HA_TERMINATION_TIMESTAMP;
    return effectiveTermination(raw, ts, this._marker);
  }
  get _isOverrideActive() {
    const t2 = this._terminationType;
    return t2 === "MANUAL" || t2 === "TIMER" || t2 === "NEXT_TIME_BLOCK";
  }
  // Stop click from bubbling to the card (which would open the popup)
  // so that Resume Schedule is a direct action.
  //
  // We call `climate.set_hvac_mode: auto` rather than a Tado-specific
  // service: the stock Tado integration maps HVACMode.AUTO to its internal
  // SMART_SCHEDULE, which resets the zone overlay. This keeps the card
  // functional on a vanilla HA install with no integration patching.
  _resume(e2) {
    e2.stopPropagation();
    this.hass.callService("climate", "set_hvac_mode", { hvac_mode: "auto" }, {
      entity_id: this.entity.entity_id
    });
  }
  render() {
    if (!this._isOverrideActive) return A;
    const type = this._terminationType;
    const timestamp = this.entity.attributes.HA_TERMINATION_TIMESTAMP;
    const label = remainingLabel(type, timestamp);
    return b`
      <div class="strip">
        <div class="summary-row">
          <span class="remaining">
            <span class="dot"></span>
            <span>${label}</span>
          </span>
          <button class="resume-btn" @click=${this._resume}>
            <ha-icon .icon=${"mdi:restore"}></ha-icon>
            Resume schedule
          </button>
        </div>
      </div>
    `;
  }
};
TadoOverlayStrip.styles = i$3`
    :host { display: block; }

    .strip {
      padding-top: 12px;
      border-top: 1px solid var(--divider-color);
      margin-top: 12px;
    }

    .summary-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--warning-color, #f4b400);
      flex-shrink: 0;
    }

    .remaining {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.84em;
      color: var(--secondary-text-color);
    }

    .resume-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border: none;
      border-radius: 16px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      font-size: 0.82em;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      margin-left: auto;
    }

    .resume-btn:hover { filter: brightness(1.1); }

    .resume-btn ha-icon {
      --mdc-icon-size: 15px;
      color: inherit;
    }
  `;
__decorateClass$2([
  n2({ attribute: false })
], TadoOverlayStrip.prototype, "hass", 2);
__decorateClass$2([
  n2({ attribute: false })
], TadoOverlayStrip.prototype, "entity", 2);
__decorateClass$2([
  r()
], TadoOverlayStrip.prototype, "_marker", 2);
TadoOverlayStrip = __decorateClass$2([
  t("tado-overlay-strip")
], TadoOverlayStrip);
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp$1(target, key, result);
  return result;
};
const STEP$1 = 0.5;
const SLIDER_MIN$1 = 0;
const MIN_TEMP$1 = 5;
const MAX_TEMP$1 = 25;
let TadoClimateCard = class extends i {
  constructor() {
    super(...arguments);
    this._liveValue = null;
    this._pendingMark = false;
    this._marker = null;
    this._lastEntityId = null;
  }
  setConfig(config) {
    if (!config.entity) throw new Error("entity is required");
    this._config = config;
  }
  getCardSize() {
    return 3;
  }
  /**
   * Called by the Lovelace card picker. Returns a sensible default config
   * pre-filled with the first Tado climate entity we can find, plus the
   * `name` field exposed (set to its friendly_name) so users can see it
   * exists and easily override it.
   */
  static getStubConfig(hass) {
    const tadoEntity = Object.values((hass == null ? void 0 : hass.states) ?? {}).find(
      (s2) => s2.entity_id.startsWith("climate.") && ("HA_TERMINATION_TYPE" in s2.attributes || "HA_DEFAULT_OVERLAY_TYPE" in s2.attributes)
    );
    return {
      entity: (tadoEntity == null ? void 0 : tadoEntity.entity_id) ?? "climate.YOUR_TADO_ZONE",
      name: (tadoEntity == null ? void 0 : tadoEntity.attributes.friendly_name) ?? "Living room"
    };
  }
  get _entity() {
    var _a2, _b;
    return (_b = this.hass) == null ? void 0 : _b.states[(_a2 = this._config) == null ? void 0 : _a2.entity];
  }
  _handleCardClick() {
    if (!this._entity) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId: this._entity.entity_id }
    }));
  }
  _onSliderMoved(e2) {
    if (e2.detail.value !== void 0) this._liveValue = e2.detail.value;
  }
  _applySliderValue(raw) {
    const entity = this._entity;
    if (raw === 0) {
      this.hass.callService("climate", "set_hvac_mode", { hvac_mode: "off" }, { entity_id: entity.entity_id });
    } else {
      const temp = Math.round(Math.min(MAX_TEMP$1, Math.max(MIN_TEMP$1, raw)) / STEP$1) * STEP$1;
      this.hass.callService("tado", "set_climate_timer", {
        requested_overlay: "NEXT_TIME_BLOCK",
        temperature: temp
      }, { entity_id: entity.entity_id });
      this._pendingMark = true;
      this._preApplyTimestamp = entity.attributes.HA_TERMINATION_TIMESTAMP;
    }
  }
  _onSliderChanged(e2) {
    const raw = e2.detail.value;
    const snapped = raw === 0 ? 0 : Math.round(Math.min(MAX_TEMP$1, Math.max(MIN_TEMP$1, raw)) / STEP$1) * STEP$1;
    this._liveValue = snapped;
    this._applySliderValue(raw);
  }
  updated(_changed) {
    const entity = this._entity;
    if (!entity) return;
    if (entity.entity_id !== this._lastEntityId) {
      this._lastEntityId = entity.entity_id;
      this._marker = null;
      const id = entity.entity_id;
      getAppliedOverlay(this.hass, id).then((m2) => {
        if (this._lastEntityId === id) this._marker = m2;
      });
    }
    if (this._pendingMark) {
      const newTs = entity.attributes.HA_TERMINATION_TIMESTAMP;
      const rawType = entity.attributes.HA_TERMINATION_TYPE;
      if (rawType === "TIMER" && newTs && newTs !== this._preApplyTimestamp) {
        setAppliedOverlay(this.hass, entity.entity_id, {
          type: "NEXT_TIME_BLOCK",
          terminationTimestamp: newTs
        });
        this._pendingMark = false;
        this._preApplyTimestamp = void 0;
      }
    }
    if (this._liveValue === null) return;
    const entityVal = entity.state === "off" ? 0 : entity.attributes.temperature ?? 20;
    if (Math.abs(entityVal - this._liveValue) < 0.01) {
      this._liveValue = null;
    }
  }
  render() {
    var _a2, _b;
    const entity = this._entity;
    if (!entity) {
      const isPlaceholder = ((_a2 = this._config) == null ? void 0 : _a2.entity) === "climate.YOUR_TADO_ZONE";
      const message = isPlaceholder ? "Set the entity field to one of your Tado climate zones." : `Entity not found: ${(_b = this._config) == null ? void 0 : _b.entity}`;
      return b`
        <ha-card>
          <div style="padding:16px;color:var(--secondary-text-color);font-size:0.9em">
            <div style="font-weight:500;color:var(--primary-text-color);margin-bottom:4px">
              Tado Climate Card
            </div>
            ${message}
          </div>
        </ha-card>
      `;
    }
    const name = this._config.name ?? entity.attributes.friendly_name;
    const currentTemp = entity.attributes.current_temperature;
    const isOff = entity.state === "off";
    const targetTemp = entity.attributes.temperature ?? 20;
    const entityValue = isOff ? 0 : targetTemp;
    const sliderValue = this._liveValue ?? entityValue;
    const colorValue = sliderValue;
    const { icon, color: iconColor } = radiatorIconProps(this.hass, entity);
    const hasExtras2 = "HA_TERMINATION_TYPE" in entity.attributes;
    if (this._config.variant === "compact") {
      return this._renderCompact(entity, name, currentTemp, sliderValue, icon, iconColor, hasExtras2);
    }
    return b`
      <ha-card @click=${this._handleCardClick}>
        <div class="header">
          <ha-icon
            .icon=${icon}
            style="color:${iconColor}"
          ></ha-icon>
          <span class="name">${name}</span>
        </div>

        <div class="temp-info">
          <span class="inside-now">Inside now ${(currentTemp == null ? void 0 : currentTemp.toFixed(1)) ?? "--"}°</span>
          <span class="target-temp-label">${sliderValue < 5 ? "Off" : `${sliderValue.toFixed(1)}°`}</span>
        </div>

        <div class="slider-row" @click=${(e2) => e2.stopPropagation()}>
          <ha-control-slider
            .value=${sliderValue}
            .min=${SLIDER_MIN$1}
            .max=${MAX_TEMP$1}
            .step=${STEP$1}
            mode="start"
            .showHandle=${true}
            tooltipMode="never"
            label="Target temperature"
            style="--control-slider-color:${temperatureColor(colorValue)};--control-slider-background:${temperatureColor(colorValue)}"
            @slider-moved=${this._onSliderMoved}
            @value-changed=${this._onSliderChanged}
          ></ha-control-slider>
        </div>

        ${hasExtras2 ? b`<tado-overlay-strip
              .hass=${this.hass}
              .entity=${entity}
            ></tado-overlay-strip>` : b`<div class="extras-required" @click=${(e2) => e2.stopPropagation()}>
              <strong>Tado Integration Extras required</strong> for override
              status and the Resume button.
              <a
                href="/hacs/repository?owner=simonwheatley&repository=tado-integration-extras&category=integration"
                target="_top"
                rel="noopener"
              >Open in HACS</a>.
            </div>`}
      </ha-card>
    `;
  }
  /**
   * Compact variant: name + radiator icon, current/target temperature, and
   * a single termination line ("Until you resume schedule" / timer / "Scheduled").
   * No slider, no overlay strip — tap-to-popup opens full controls.
   *
   * Designed to fit two-up in a mobile dashboard grid; layout uses min-width: 0
   * everywhere so flex/grid containers won't overflow.
   */
  _renderCompact(entity, name, currentTemp, sliderValue, icon, _iconColor, hasExtras2) {
    const rawType = entity.attributes.HA_TERMINATION_TYPE;
    const ts = entity.attributes.HA_TERMINATION_TIMESTAMP;
    const effective = effectiveTermination(rawType, ts, this._marker);
    let terminationText = null;
    if (hasExtras2) {
      terminationText = effective === "TADO_MODE" || !effective ? "Scheduled" : remainingLabel(effective, ts);
    }
    const bgColor = temperatureColor(sliderValue);
    const tinted = `color-mix(in srgb, ${bgColor} 75%, white)`;
    const cardStyle = `--ha-card-background: ${tinted}; background: ${tinted}; color: white;`;
    const compactIconColor = entity.attributes.hvac_action === "heating" ? "white" : "#3a3a3a";
    return b`
      <ha-card class="compact" @click=${this._handleCardClick} style=${cardStyle}>
        <div class="compact-header">
          <ha-icon .icon=${icon} style="color:${compactIconColor}"></ha-icon>
          <span class="compact-name">${name}</span>
        </div>
        <div class="compact-inside">
          Inside now ${(currentTemp == null ? void 0 : currentTemp.toFixed(1)) ?? "--"}°
        </div>
        <div class="compact-target">
          ${sliderValue < 5 ? "Off" : `${sliderValue.toFixed(1)}°`}
        </div>
        ${terminationText ? b`<div class="compact-termination">${terminationText}</div>` : b`<div class="compact-termination compact-termination--blank">&nbsp;</div>`}
      </ha-card>
    `;
  }
};
TadoClimateCard.styles = i$3`
    :host {
      display: block;
    }

    ha-card {
      padding: 16px;
      cursor: pointer;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    ha-icon {
      --mdc-icon-size: 22px;
      flex-shrink: 0;
    }

    .name {
      font-size: 1em;
      font-weight: 500;
      color: var(--primary-text-color);
      flex: 1;
    }

    .temp-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 14px;
      padding-left: 32px;
    }

    .inside-now {
      font-size: 0.82em;
      color: var(--secondary-text-color);
    }

    .target-temp-label {
      font-size: 1.6em;
      font-weight: 300;
      color: var(--primary-text-color);
      line-height: 1.1;
    }

    .slider-row {
      padding: 8px 0;
    }

    ha-control-slider {
      display: block;
      width: 100%;
      --control-slider-thickness: 42px;
      --control-slider-background-opacity: 0.15;
    }

    /* ── Compact variant ───────────────────────────────────── */

    ha-card.compact {
      padding: 12px 14px;
      min-width: 0;
    }

    .compact-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      min-width: 0;
    }

    .compact-header ha-icon {
      --mdc-icon-size: 20px;
      flex-shrink: 0;
    }

    .compact-name {
      /* Option 4: small all-caps label-style for the name */
      font-size: 0.78em;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: inherit;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .compact-inside {
      font-size: 0.78em;
      font-weight: 500;
      color: inherit;
      opacity: 0.85;
      padding-left: 28px;
    }

    .compact-target {
      /* Option 1: bigger jump from light-300 to medium-500 */
      font-size: 1.7em;
      font-weight: 500;
      letter-spacing: -0.02em;
      color: inherit;
      line-height: 1.1;
      padding-left: 28px;
      margin-top: 2px;
    }

    .compact-termination {
      font-size: 0.78em;
      font-weight: 500;
      color: inherit;
      opacity: 0.85;
      padding-left: 28px;
      margin-top: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .compact-termination--blank {
      visibility: hidden;
    }

    .extras-required {
      margin-top: 12px;
      padding: 10px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: color-mix(in srgb, var(--warning-color, #f4b400) 10%, transparent);
      font-size: 0.84em;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }

    .extras-required strong {
      color: var(--primary-text-color);
      font-weight: 500;
    }

    .extras-required a {
      color: var(--primary-color);
      text-decoration: none;
    }

    .extras-required a:hover {
      text-decoration: underline;
    }
  `;
__decorateClass$1([
  n2({ attribute: false })
], TadoClimateCard.prototype, "hass", 2);
__decorateClass$1([
  r()
], TadoClimateCard.prototype, "_config", 2);
__decorateClass$1([
  r()
], TadoClimateCard.prototype, "_liveValue", 2);
__decorateClass$1([
  r()
], TadoClimateCard.prototype, "_marker", 2);
TadoClimateCard = __decorateClass$1([
  t("tado-climate-card")
], TadoClimateCard);
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
const STEP = 0.5;
const SLIDER_MIN = 0;
const MIN_TEMP = 5;
const MAX_TEMP = 25;
const DURATIONS = [
  { key: "TIMER_30", label: "30m", summary: "For 30 minutes", minutes: 30 },
  { key: "TIMER_60", label: "1h", summary: "For 1 hour", minutes: 60 },
  { key: "TIMER_120", label: "2h", summary: "For 2 hours", minutes: 120 },
  { key: "NEXT_TIME_BLOCK", label: "Next time block", summary: "Until next time block", overlay: "NEXT_TIME_BLOCK" },
  { key: "MANUAL", label: "∞", summary: "Until you resume schedule", overlay: "MANUAL" }
];
const DEFAULT_DURATION = "NEXT_TIME_BLOCK";
function isDurationKey(s2) {
  return s2 === "TIMER_30" || s2 === "TIMER_60" || s2 === "TIMER_120" || s2 === "NEXT_TIME_BLOCK" || s2 === "MANUAL";
}
function terminationToKey(type, prefKey) {
  if (type === "NEXT_TIME_BLOCK") return "NEXT_TIME_BLOCK";
  if (type === "MANUAL") return "MANUAL";
  if (type === "TIMER") {
    if (prefKey === "TIMER_30" || prefKey === "TIMER_60" || prefKey === "TIMER_120") return prefKey;
    return "TIMER_60";
  }
  return null;
}
function isTadoEntity(entity) {
  return "default_overlay_type" in entity.attributes || "HA_DEFAULT_OVERLAY_TYPE" in entity.attributes || "HA_TERMINATION_TYPE" in entity.attributes;
}
function hasExtras(entity) {
  return "HA_TERMINATION_TYPE" in entity.attributes;
}
function displayValue(value) {
  return value < MIN_TEMP ? "Off" : `${value.toFixed(1)}°`;
}
let TadoMoreInfoClimate = class extends i {
  constructor() {
    super(...arguments);
    this._pendingValue = null;
    this._selectedDuration = null;
    this._editingDuration = false;
    this._prefDuration = null;
    this._marker = null;
    this._lastEntityId = null;
    this._pendingMarkType = null;
  }
  /** Apply marker substitution: if a NEXT_TIME_BLOCK marker matches the
   *  entity's current timestamp, treat the overlay as NEXT_TIME_BLOCK. */
  _effectiveType() {
    const raw = this.stateObj.attributes.HA_TERMINATION_TYPE;
    const ts = this.stateObj.attributes.HA_TERMINATION_TIMESTAMP;
    return effectiveTermination(raw, ts, this._marker);
  }
  /** Recompute `_selectedDuration` from current entity state + loaded prefs. */
  _resyncSelectedDuration() {
    const type = this._effectiveType();
    if (type && type !== "TADO_MODE") {
      this._selectedDuration = terminationToKey(type, this._prefDuration);
    } else {
      this._selectedDuration = null;
    }
  }
  // Re-initialise state whenever a different entity opens in the popup
  updated(changed) {
    if (changed.has("stateObj") && this.stateObj) {
      if (this._pendingMarkType) {
        const newTs = this.stateObj.attributes.HA_TERMINATION_TIMESTAMP;
        const rawType = this.stateObj.attributes.HA_TERMINATION_TYPE;
        const looksApplied = this._pendingMarkType === "NEXT_TIME_BLOCK" && rawType === "TIMER" || this._pendingMarkType === "MANUAL" && rawType === "MANUAL";
        if (looksApplied && newTs !== this._preApplyTimestamp) {
          const marker = {
            type: this._pendingMarkType,
            terminationTimestamp: newTs ?? null
          };
          this._marker = marker;
          setAppliedOverlay(this.hass, this.stateObj.entity_id, marker);
          this._pendingMarkType = null;
          this._preApplyTimestamp = void 0;
          this._resyncSelectedDuration();
        }
      }
      if (this.stateObj.entity_id !== this._lastEntityId) {
        this._lastEntityId = this.stateObj.entity_id;
        this._pendingValue = null;
        this._editingDuration = false;
        this._prefDuration = null;
        this._marker = null;
        const entityId = this.stateObj.entity_id;
        Promise.all([
          getDurationPref(this.hass, entityId),
          getAppliedOverlay(this.hass, entityId)
        ]).then(([storedPref, storedMarker]) => {
          if (this._lastEntityId !== entityId) return;
          this._prefDuration = isDurationKey(storedPref) ? storedPref : null;
          this._marker = storedMarker;
          this._resyncSelectedDuration();
        });
        this._resyncSelectedDuration();
      }
    }
  }
  /** Chip to highlight: active termination wins; else stored pref; else default. */
  get _highlightedDuration() {
    return this._selectedDuration ?? this._prefDuration ?? DEFAULT_DURATION;
  }
  // ── Helpers ───────────────────────────────────────────────
  _applyDuration(option, temp) {
    if (option.minutes !== void 0) {
      const h2 = Math.floor(option.minutes / 60);
      const m2 = option.minutes % 60;
      this.hass.callService("tado", "set_climate_timer", {
        time_period: `${String(h2).padStart(2, "0")}:${String(m2).padStart(2, "0")}:00`,
        temperature: temp
      }, { entity_id: this.stateObj.entity_id });
    } else {
      this.hass.callService("tado", "set_climate_timer", {
        requested_overlay: option.overlay,
        temperature: temp
      }, { entity_id: this.stateObj.entity_id });
      if (option.overlay) {
        this._pendingMarkType = option.overlay;
        this._preApplyTimestamp = this.stateObj.attributes.HA_TERMINATION_TIMESTAMP;
      }
    }
  }
  // ── Event handlers ────────────────────────────────────────
  _onSliderMoved(e2) {
    if (e2.detail.value !== void 0) this._pendingValue = e2.detail.value;
  }
  _onSliderChanged(e2) {
    const value = e2.detail.value;
    this._pendingValue = value;
    if (value === 0) {
      this.hass.callService("climate", "set_hvac_mode", { hvac_mode: "off" }, {
        entity_id: this.stateObj.entity_id
      });
      this._selectedDuration = null;
      this._editingDuration = true;
    } else {
      const snap = Math.round(Math.min(MAX_TEMP, Math.max(MIN_TEMP, value)) / STEP) * STEP;
      this._pendingValue = snap;
      const durationKey = this._prefDuration ?? DEFAULT_DURATION;
      const opt = DURATIONS.find((d2) => d2.key === durationKey);
      this._applyDuration(opt, snap);
      this._selectedDuration = durationKey;
      this._editingDuration = true;
      if (this.stateObj.state === "off") {
        this.hass.callService("climate", "set_hvac_mode", { hvac_mode: "heat" }, {
          entity_id: this.stateObj.entity_id
        });
      }
    }
  }
  _selectDuration(option) {
    this._prefDuration = option.key;
    setDurationPref(this.hass, this.stateObj.entity_id, option.key);
    this._selectedDuration = option.key;
    this._editingDuration = false;
    const temp = Math.round(
      Math.min(MAX_TEMP, Math.max(
        MIN_TEMP,
        this._pendingValue ?? this.stateObj.attributes.temperature ?? 20
      )) / STEP
    ) * STEP;
    this._applyDuration(option, temp);
  }
  _resume() {
    this.hass.callService("climate", "set_hvac_mode", { hvac_mode: "auto" }, {
      entity_id: this.stateObj.entity_id
    });
    this._selectedDuration = null;
    this._editingDuration = false;
    this._pendingValue = null;
  }
  // ── Duration section renderer ─────────────────────────────
  _renderDurationSection() {
    if (this._editingDuration) {
      return b`
        <div class="duration-section">
          <div class="change-until-header">
            <span class="change-until-label">Change until</span>
            <button class="close-btn" title="Close"
              @click=${() => {
        this._editingDuration = false;
      }}>
              <ha-icon .icon=${"mdi:close"}></ha-icon>
            </button>
          </div>
          <div class="chips">
            ${DURATIONS.map((opt) => b`
              <button
                class="chip ${opt.key === this._highlightedDuration ? "default" : ""}"
                @click=${() => this._selectDuration(opt)}
              >
                ${opt.label}
              </button>
            `)}
          </div>
        </div>
      `;
    }
    if (this._selectedDuration) {
      const selected = DURATIONS.find((d2) => d2.key === this._selectedDuration);
      return b`
        <div class="duration-section">
          <div class="duration-committed-row">
            <button class="duration-edit-btn" title="Edit duration"
              @click=${() => {
        this._editingDuration = true;
      }}>
              <span class="dot"></span>
              <span>${selected.summary}</span>
              <ha-icon .icon=${"mdi:pencil"}></ha-icon>
            </button>
            <button class="resume-btn" @click=${this._resume}>
              <ha-icon .icon=${"mdi:restore"}></ha-icon>
              Resume schedule
            </button>
          </div>
        </div>
      `;
    }
    return A;
  }
  // ── Render ────────────────────────────────────────────────
  render() {
    const entity = this.stateObj;
    if (!entity || !isTadoEntity(entity)) return A;
    const currentTemp = entity.attributes.current_temperature;
    const isOff = entity.state === "off";
    const targetTemp = entity.attributes.temperature ?? 20;
    const liveValue = this._pendingValue ?? (isOff ? 0 : targetTemp);
    const { icon, color: iconColor } = radiatorIconProps(this.hass, entity);
    return b`
      <div class="header">
        <ha-icon
          .icon=${icon}
          style="color:${iconColor}"
        ></ha-icon>
        <span class="name">${entity.attributes.friendly_name}</span>
      </div>

      <div class="temp-info">
        <span class="inside-now">Inside now ${(currentTemp == null ? void 0 : currentTemp.toFixed(1)) ?? "--"}°</span>
        <span class="target-temp-label">${displayValue(liveValue)}</span>
      </div>

      <div class="slider-wrap">
        <ha-control-slider
          .value=${liveValue}
          .min=${SLIDER_MIN}
          .max=${MAX_TEMP}
          .step=${STEP}
          .vertical=${true}
          mode="start"
          .showHandle=${true}
          tooltipMode="never"
          label="Target temperature"
          style="--control-slider-color:${temperatureColor(liveValue)};--control-slider-background:${temperatureColor(liveValue)}"
          @slider-moved=${this._onSliderMoved}
          @value-changed=${this._onSliderChanged}
        ></ha-control-slider>
      </div>

      ${hasExtras(entity) ? this._renderDurationSection() : b`<div class="extras-required">
            <strong>Tado Integration Extras required</strong> for override
            status, end-times, and the Resume button.
            <a
              href="/hacs/repository?owner=simonwheatley&repository=tado-integration-extras&category=integration"
              target="_top"
              rel="noopener"
            >Open in HACS</a>.
          </div>`}
    `;
  }
};
TadoMoreInfoClimate.styles = i$3`
    :host {
      display: block;
      padding: 0 24px 24px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    ha-icon {
      --mdc-icon-size: 24px;
      flex-shrink: 0;
    }

    .name {
      font-size: 1em;
      font-weight: 500;
      color: var(--primary-text-color);
    }

    .temp-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 20px;
      padding-left: 34px;
    }

    .inside-now {
      font-size: 0.82em;
      color: var(--secondary-text-color);
    }

    .target-temp-label {
      font-size: 2.2em;
      font-weight: 300;
      color: var(--primary-text-color);
      line-height: 1.1;
    }

    .slider-wrap {
      display: flex;
      justify-content: center;
      padding: 8px 0 16px;
    }

    ha-control-slider {
      height: 220px;
      --control-slider-thickness: 60px;
      --control-slider-background-opacity: 0.15;
    }

    /* ── Duration section ─────────────────────────────────── */

    .duration-section {
      padding-top: 14px;
      border-top: 1px solid var(--divider-color);
    }

    .extras-required {
      margin-top: 14px;
      padding: 12px 14px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: color-mix(in srgb, var(--warning-color, #f4b400) 10%, transparent);
      font-size: 0.9em;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }

    .extras-required strong {
      color: var(--primary-text-color);
      font-weight: 500;
    }

    .extras-required a {
      color: var(--primary-color);
      text-decoration: none;
    }

    .extras-required a:hover {
      text-decoration: underline;
    }

    .change-until-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .change-until-label {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }

    .close-btn {
      background: none;
      border: none;
      padding: 2px 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      color: var(--secondary-text-color);
      border-radius: 4px;
    }

    .close-btn:hover {
      color: var(--primary-text-color);
      background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    }

    .close-btn ha-icon {
      --mdc-icon-size: 18px;
      color: inherit;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .chip {
      padding: 5px 14px;
      border: 1px solid var(--divider-color);
      border-radius: 16px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 0.82em;
      cursor: pointer;
      white-space: nowrap;
      transition: border-color 0.15s, background 0.15s;
    }

    .chip:hover {
      border-color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
    }

    .chip.default {
      border-color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 14%, transparent);
      color: var(--primary-color);
      font-weight: 500;
    }

    /* ── Committed row (timer + pencil + resume in one line) ─ */

    .duration-committed-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--warning-color, #f4b400);
      flex-shrink: 0;
    }

    .duration-edit-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      font-size: 0.85em;
      font-weight: 500;
      color: var(--primary-text-color);
      font-family: inherit;
    }

    .duration-edit-btn ha-icon {
      --mdc-icon-size: 16px;
      color: var(--secondary-text-color);
      pointer-events: none;
      padding: 4px;
      border-radius: 50%;
      box-sizing: content-box;
      transition: background 0.15s, color 0.15s;
    }

    .duration-edit-btn:hover ha-icon {
      color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 18%, transparent);
    }

    .resume-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      border: none;
      border-radius: 16px;
      background: var(--primary-color);
      color: var(--text-primary-color);
      font-size: 0.82em;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      margin-left: auto;
    }

    .resume-btn:hover {
      filter: brightness(1.1);
    }

    .resume-btn ha-icon {
      --mdc-icon-size: 15px;
      color: inherit;
    }
  `;
__decorateClass([
  n2({ attribute: false })
], TadoMoreInfoClimate.prototype, "hass", 2);
__decorateClass([
  n2({ attribute: false })
], TadoMoreInfoClimate.prototype, "stateObj", 2);
__decorateClass([
  r()
], TadoMoreInfoClimate.prototype, "_pendingValue", 2);
__decorateClass([
  r()
], TadoMoreInfoClimate.prototype, "_selectedDuration", 2);
__decorateClass([
  r()
], TadoMoreInfoClimate.prototype, "_editingDuration", 2);
__decorateClass([
  r()
], TadoMoreInfoClimate.prototype, "_prefDuration", 2);
__decorateClass([
  r()
], TadoMoreInfoClimate.prototype, "_marker", 2);
TadoMoreInfoClimate = __decorateClass([
  t("tado-more-info-climate")
], TadoMoreInfoClimate);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "tado-climate-card",
  name: "Tado Climate Card",
  description: "Climate card for Tado zones with schedule override controls",
  preview: true,
  documentationURL: "https://github.com/simonwheatley/HA-Tado"
});
function isTadoStateObj(stateObj) {
  if (!(stateObj == null ? void 0 : stateObj.attributes)) return false;
  const a2 = stateObj.attributes;
  return "HA_DEFAULT_OVERLAY_TYPE" in a2 || "HA_TERMINATION_TYPE" in a2 || "default_overlay_type" in a2;
}
function patchClass(ctor) {
  if (!(ctor == null ? void 0 : ctor.prototype)) return;
  if (ctor._tadoPatched) return;
  ctor._tadoPatched = true;
  console.info("[tado-card] patching more-info-climate ✓");
  const proto = ctor.prototype;
  const origRender = proto.render;
  proto.render = function() {
    if (isTadoStateObj(this.stateObj)) {
      return b`
        <tado-more-info-climate
          .hass=${this.hass}
          .stateObj=${this.stateObj}
        ></tado-more-info-climate>
      `;
    }
    return origRender.call(this);
  };
}
try {
  const _origDefine = customElements.define.bind(customElements);
  Object.defineProperty(customElements, "define", {
    configurable: true,
    writable: true,
    value: function(name, ctor, opts) {
      if (name === "more-info-climate") patchClass(ctor);
      return _origDefine(name, ctor, opts);
    }
  });
} catch (e2) {
  console.warn("[tado-card] could not override customElements.define:", e2);
}
customElements.whenDefined("more-info-climate").then(() => {
  patchClass(customElements.get("more-info-climate"));
});
window.addEventListener("hass-more-info", () => {
  requestAnimationFrame(() => {
    const ctor = customElements.get("more-info-climate");
    if (ctor && !ctor._tadoPatched) patchClass(ctor);
    const walk = (root) => {
      for (const el2 of Array.from(root.querySelectorAll("*"))) {
        if (el2.tagName.toLowerCase() === "more-info-climate") return el2;
        if (el2.shadowRoot) {
          const found = walk(el2.shadowRoot);
          if (found) return found;
        }
      }
      return null;
    };
    const el = walk(document);
    if (el == null ? void 0 : el.requestUpdate) el.requestUpdate();
  });
});
