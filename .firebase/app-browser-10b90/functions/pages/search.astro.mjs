import { c as createComponent$1, r as renderTemplate, a as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_BPTSoEb2.mjs';
import { g as getCollection } from '../chunks/_astro_content_DuTYth8C.mjs';
import { $ as $$PageLayout } from '../chunks/PageLayout_Be2zWfzu.mjs';
import { $ as $$TopLayout } from '../chunks/TopLayout_BimL7V3q.mjs';
import { $ as $$BottomLayout } from '../chunks/BottomLayout_DcReYWMS.mjs';
import { ssr, ssrHydrationKey, ssrAttribute, escape, createComponent } from 'solid-js/web';
import { createSignal, createEffect } from 'solid-js';
import Fuse from 'fuse.js';
import { A as ArrowCard } from '../chunks/ArrowCard_DTGIlLJ6.mjs';
import { S as SEARCH } from '../chunks/consts_CNykIgmw.mjs';
export { renderers } from '../renderers.mjs';

var _tmpl$ = ["<div", ' class="flex flex-col"><div class="relative"><input name="search" type="text"', ' autocomplete="off" spellcheck="false" placeholder="What are you looking for?" class="w-full px-2.5 py-1.5 pl-10 rounded outline-none text-black dark:text-white bg-black/5 dark:bg-white/15 border border-black/10 dark:border-white/20 focus:border-black focus:dark:border-white"><svg class="absolute size-6 left-1.5 top-1/2 -translate-y-1/2 stroke-current"><use href="', '"></use></svg></div><!--$-->', "<!--/--></div>"], _tmpl$2 = ["<div", ' class="mt-12"><div class="text-sm uppercase mb-2">Found <!--$-->', "<!--/--> results for <!--$-->", '<!--/--></div><ul class="flex flex-col gap-3">', "</ul></div>"], _tmpl$3 = ["<li", ">", "</li>"];
function Search({
  data
}) {
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal([]);
  const fuse = new Fuse(data, {
    keys: ["slug", "data.title", "data.summary", "data.tags"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.4
  });
  createEffect(() => {
    if (query().length < 2) {
      setResults([]);
    } else {
      setResults(fuse.search(query()).map((result) => result.item));
    }
  });
  return ssr(_tmpl$, ssrHydrationKey(), ssrAttribute("value", escape(query(), true), false), `/ui.svg#search`, query().length >= 2 && results().length >= 1 && ssr(_tmpl$2, ssrHydrationKey(), escape(results().length), `'${escape(query())}'`, escape(results().map((result) => ssr(_tmpl$3, ssrHydrationKey(), escape(createComponent(ArrowCard, {
    entry: result,
    pill: true
  })))))));
}

const $$Index = createComponent$1(async ($$result, $$props, $$slots) => {
  const posts = (await getCollection("blog")).filter((post) => !post.data.draft);
  const projects = (await getCollection("projects")).filter((post) => !post.data.draft);
  const data = [...posts, ...projects];
  return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, { "title": SEARCH.TITLE, "description": SEARCH.DESCRIPTION }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TopLayout", $$TopLayout, {}, { "default": ($$result3) => renderTemplate` ${maybeRenderHead()}<div class="animate page-heading"> ${SEARCH.TITLE} </div> ` })} ${renderComponent($$result2, "BottomLayout", $$BottomLayout, {}, { "default": ($$result3) => renderTemplate` <div class="animate"> ${renderComponent($$result3, "Search", Search, { "client:load": true, "data": data, "client:component-hydration": "load", "client:component-path": "@components/Search", "client:component-export": "default" })} </div> ` })} ` })}`;
}, "/Users/bobstoute/Git/@bsmp/bsmp-website/src/pages/search/index.astro", void 0);

const $$file = "/Users/bobstoute/Git/@bsmp/bsmp-website/src/pages/search/index.astro";
const $$url = "/search";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
