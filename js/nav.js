(() => {
  const DATA = window.DIRTT_DATA;

  const PATTERNS = {
    hover: {
      short: "A - Hover",
      name: "Hover – 1 column",
      desc: "Hover a top-level item to open a single-column menu; clicking the item goes to its page. Resources only opens on hover, and clicking it does nothing. On mobile, the menu drawer uses accordions.",
    },
    variable: {
      short: "B - Click",
      name: "Click – variable column + hover indicator",
      desc: "Click a top-level item to open a panel sized to its content. An underline grows on hover to show the item is clickable. On mobile, the menu drawer uses accordions, and each section starts with a View all link.",
    },
    full: {
      short: "C - Click",
      name: "Click – full width + hover indicator",
      desc: "Click a top-level item to open a full-width panel, with its link columns lined up under the nav. An underline grows on hover. On mobile, tapping an item slides in its submenu.",
    },
  };

  const mqDesktop = matchMedia("(min-width: 1024px)");
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const dur = (ms) => (mqReduce.matches ? 0 : ms);
  const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------------- Icons ---------------- */
  const ICON = {
    chevDown: `<svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`,
    chevRight: `<svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M3.5 1.5 7 5 3.5 8.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`,
    search: `<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m10.5 10.5 3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    menu: `<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 5h9M3.5 8h9M3.5 11h9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    close: `<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 4.5 7 7m0-7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    arrow: `<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9.5M9 4.5 12.5 8 9 11.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  /* ---------------- Rendering helpers ---------------- */
  const asLink = (l) => (typeof l === "string" ? { label: l } : l);

  function linkList(links, sub = false) {
    return `<ul class="link-list${sub ? " link-list--sub" : ""}">${links
      .map(asLink)
      .map(
        (l) =>
          `<li><a class="nav-link" href="#">${l.label}</a>${l.children ? linkList(l.children, true) : ""}</li>`
      )
      .join("")}</ul>`;
  }

  function groupHTML(g, i) {
    return `<div class="link-group${g.eyebrow ? " has-eyebrow" : ""} stagger" style="--i:${i}">
      ${g.eyebrow ? `<p class="eyebrow">${g.eyebrow}</p>` : ""}${linkList(g.links)}</div>`;
  }

  // Groups for list-style menus (hover dropdown, accordion, drill-down):
  // the feature card becomes a plain link where the wires show one.
  function listGroups(item) {
    const groups = item.groups.map((g) => ({ ...g, links: [...g.links] }));
    const f = item.feature;
    if (f?.inList === "own") groups.push({ links: [f.title] });
    if (f?.inList === "append") groups[groups.length - 1].links.push(f.title);
    return groups;
  }

  function featureCard(f, i) {
    if (!f) return "";
    // Stacked card (image, title, description) or grey tile with the title inside.
    const variant = f.style === "tile" ? "tile" : "stacked";
    return `<a class="feature-card feature-card--${variant} stagger" style="--i:${i}" href="#">
      <span class="feature-media" aria-hidden="true"></span>
      <span class="feature-title">${f.title}</span>
      ${f.desc ? `<span class="feature-desc">${f.desc}</span>` : ""}
    </a>`;
  }

  function panelHTML(item, pattern) {
    if (pattern === "hover") {
      return `<div class="panel panel--list" data-id="${item.id}" id="panel-${item.id}">
        <div class="panel-inner">${listGroups(item).map(groupHTML).join("")}</div></div>`;
    }
    const cols = item.groups.map((g, i) => `<div class="panel-col">${groupHTML(g, i + 1)}</div>`);
    return `<div class="panel panel--mega" data-id="${item.id}" id="panel-${item.id}">
      <div class="panel-inner">
        <div class="panel-title-col${item.all ? "" : " is-empty"}">
          ${item.all ? `<a class="panel-title stagger" style="--i:0" href="#">${item.all}</a>` : ""}
        </div>
        ${cols.join("")}
        ${featureCard(item.feature, cols.length + 1)}
        ${pattern === "full" ? featureCard(item.extraFeature, cols.length + 2) : ""}
      </div></div>`;
  }

  function triggerHTML(item, pattern) {
    const inner = `<span class="nav-label">${item.label}</span>${ICON.chevDown}`;
    const aria = `aria-expanded="false" aria-controls="panel-${item.id}" data-id="${item.id}"`;
    // Hover pattern: top-level items are links (except label-only Resources).
    if (pattern === "hover") {
      return item.labelOnly
        ? `<button type="button" class="nav-trigger nav-trigger--label" ${aria}>${inner}</button>`
        : `<a class="nav-trigger" href="${item.href}" data-navigate="${item.label}" ${aria}>${inner}</a>`;
    }
    return `<button type="button" class="nav-trigger" ${aria}>${inner}</button>`;
  }

  function headerHTML(pattern) {
    return `
    <header class="site-header" id="site-header">
      <div class="header-inner">
        <a class="logo" href="#">Logo</a>
        <nav class="primary-nav" aria-label="Main">
          <ul class="nav-list">${DATA.nav.map((it) => `<li>${triggerHTML(it, pattern)}</li>`).join("")}</ul>
        </nav>
        <div class="header-actions">
          <a class="btn btn-solid" href="#">${DATA.ctas.primary}</a>
          <a class="btn btn-outline" href="#">${DATA.ctas.secondary}</a>
          <button type="button" class="icon-btn search-btn" aria-label="Open search" aria-expanded="false" aria-controls="search-drawer"><span class="search-icon-open">${ICON.search}</span><span class="search-icon-close">${ICON.close}</span></button>
          <button type="button" class="icon-btn menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">${ICON.menu}</button>
        </div>
      </div>
      <div class="panel-shell" id="nav-panel" hidden>
        <div class="panel-stack">${DATA.nav.map((it) => panelHTML(it, pattern)).join("")}</div>
      </div>
      <div class="search-drawer" id="search-drawer" hidden>
        <form class="search-drawer-inner" role="search" onsubmit="return false">
          <label class="sr-only" for="desktop-search">Search</label>
          <input id="desktop-search" type="search" placeholder="Enter search term" autocomplete="off" />
          <button type="submit" class="search-drawer-go" aria-label="Search">${ICON.arrow}</button>
        </form>
      </div>
    </header>`;
  }

  /* ---- Mobile drawer ---- */
  function mobileMenuHTML(item, { withAll }) {
    const all = withAll && item.all ? `<a class="nav-link m-all stagger" style="--i:0" href="#">${item.all}</a>` : "";
    return `<div class="m-menu">${all}${listGroups(item)
      .map((g, i) => groupHTML(g, i + 1))
      .join("")}</div>`;
  }

  function drawerHTML(pattern) {
    // Mobile structure per pattern:
    //   A (hover)    accordion; the label goes to the page, the chevron expands
    //   B (variable) accordion; the whole row expands, and each section starts with View/All
    //   C (full)     drill-down into a level 2 panel
    const rowHTML = {
      hover: (it) => `<li class="acc-item" data-id="${it.id}">
                <div class="acc-head">
                  ${
                    it.labelOnly
                      ? `<span class="m-label acc-label acc-label--static">${it.label}</span>`
                      : `<a class="m-label acc-label" href="${it.href}" data-navigate="${it.label}">${it.label}</a>`
                  }
                  <button type="button" class="acc-trigger" aria-expanded="false" aria-controls="acc-${it.id}" aria-label="Show ${it.label} links">
                    <span class="chev-circle">${ICON.chevDown}</span>
                  </button>
                </div>
                <div class="collapse" id="acc-${it.id}"><div><div class="acc-content">${mobileMenuHTML(it, { withAll: false })}</div></div></div>
              </li>`,
      variable: (it) => `<li class="acc-item" data-id="${it.id}">
                <button type="button" class="m-row acc-trigger" aria-expanded="false" aria-controls="acc-${it.id}">
                  <span class="m-label">${it.label}</span>${ICON.chevDown}
                </button>
                <div class="collapse" id="acc-${it.id}"><div><div class="acc-content">${mobileMenuHTML(it, { withAll: true })}</div></div></div>
              </li>`,
      full: (it) => `<li><button type="button" class="m-row drill-trigger" data-id="${it.id}">
                <span class="m-label">${it.label}</span>${ICON.chevRight}</button></li>`,
    };
    const rows = DATA.nav.map(rowHTML[pattern]).join("");

    return `
    <div class="scrim" data-close></div>
    <aside class="drawer" id="drawer" aria-label="Menu" inert>
      <div class="drawer-track" data-level="0">
        <div class="pane pane--root">
          <div class="pane-bar">
            <a class="logo" href="#">Logo</a>
            <button type="button" class="icon-btn close-btn" data-close aria-label="Close menu">${ICON.close}</button>
          </div>
          <div class="pane-body">
            <div class="drawer-ctas">
              <a class="btn btn-solid" href="#">${DATA.ctas.primary}</a>
              <a class="btn btn-outline" href="#">${DATA.ctas.secondary}</a>
            </div>
            <ul class="drawer-list">${rows}</ul>
            <form class="drawer-search" role="search" onsubmit="return false">
              <label class="field">
                <span class="sr-only">Search</span>
                <input type="search" placeholder="Enter search term" />
                <button type="submit" class="field-go" aria-label="Search">${ICON.arrow}</button>
              </label>
            </form>
          </div>
        </div>
        ${
          pattern !== "full"
            ? ""
            : `<div class="pane pane--sub" inert>
                <div class="pane-bar">
                  <button type="button" class="back-btn">${ICON.chevDown}<span></span></button>
                  <button type="button" class="icon-btn close-btn" data-close aria-label="Close menu">${ICON.close}</button>
                </div>
                <div class="pane-body drill-body"></div>
              </div>`
        }
      </div>
    </aside>`;
  }

  function footerHTML() {
    const f = DATA.footer;
    return `
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-top">
          <p class="footer-headline">${f.headline}</p>
          <a class="btn btn-solid" href="#">${DATA.ctas.primary}</a>
        </div>
        <div class="footer-grid">
          ${f.columns
            .map(
              (c) => `<section class="footer-col">
                <h2 class="footer-heading">
                  <button type="button" class="footer-toggle" aria-expanded="false" aria-controls="foot-${c.id}">
                    ${c.title}<span class="plus" aria-hidden="true"></span>
                  </button>
                </h2>
                <div class="collapse" id="foot-${c.id}"><div>
                  <ul class="footer-links">${c.links.map((l) => `<li><a href="#">${l}</a></li>`).join("")}</ul>
                </div></div>
              </section>`
            )
            .join("")}
          <div class="footer-news">
            <p class="footer-news-title">${f.newsletter}</p>
            <form onsubmit="return false">
              <label class="field">
                <span class="sr-only">Email address</span>
                <input type="email" placeholder="Enter your email address" />
                <button type="submit" class="field-submit">Submit</button>
                <button type="submit" class="field-go" aria-label="Submit">${ICON.arrow}</button>
              </label>
            </form>
          </div>
        </div>
        <div class="footer-bottom">
          <p>${f.copyright}</p>
          <ul class="legal">${f.legal.map((l) => `<li><a href="#">${l}</a></li>`).join("")}</ul>
        </div>
      </div>
    </footer>`;
  }

  /* ---------------- Behaviour ---------------- */

  // Single-open accordion used by the mobile nav (hover pattern) and the mobile footer.
  function bindAccordion(root, itemSel, triggerSel, signal) {
    root.addEventListener(
      "click",
      (e) => {
        const t = e.target.closest(triggerSel);
        if (!t || !root.contains(t)) return;
        const item = t.closest(itemSel);
        const willOpen = !item.classList.contains("is-open");
        $$(`${itemSel}.is-open`, root).forEach((o) => {
          o.classList.remove("is-open");
          $(triggerSel, o).setAttribute("aria-expanded", "false");
        });
        if (willOpen) {
          item.classList.add("is-open");
          t.setAttribute("aria-expanded", "true");
        }
      },
      { signal }
    );
  }

  function restartEnter(el) {
    el.classList.remove("is-entering");
    void el.offsetWidth;
    el.classList.add("is-entering");
  }

  function createDesktopMenu(pattern, signal, { onOpen } = {}) {
    const header = $("#site-header");
    const inner = $(".header-inner", header);
    const shell = $("#nav-panel");
    const triggers = $$(".nav-trigger", header);
    const trig = (id) => $(`.nav-trigger[data-id="${id}"]`, header);
    const panel = (id) => $(`.panel[data-id="${id}"]`, shell);
    let openId = null;
    let shellAnim = null;

    // Align the panel under its trigger, clamped so it never overflows the bar.
    function place(id) {
      if (pattern === "full") return;
      shell.style.left = "0px";
      const hr = header.getBoundingClientRect();
      const ir = inner.getBoundingClientRect();
      const tr = trig(id).getBoundingClientRect();
      const maxLeft = ir.right - hr.left - shell.offsetWidth;
      shell.style.left = `${Math.max(0, Math.min(tr.left - hr.left, maxLeft))}px`;
    }

    function setExpanded(id) {
      triggers.forEach((t) => t.setAttribute("aria-expanded", String(t.dataset.id === id)));
    }

    function open(id) {
      if (openId === id) return;
      onOpen?.();
      const wasOpen = !!openId && !shell.hidden;
      const first = wasOpen ? shell.getBoundingClientRect() : null;
      shellAnim?.cancel();

      $$(".panel", shell).forEach((p) => p.classList.remove("is-leaving", "is-active", "is-entering"));
      if (wasOpen) panel(openId).classList.add("is-leaving");
      openId = id;
      setExpanded(id);

      const next = panel(id);
      shell.hidden = false;
      next.classList.add("is-active");
      restartEnter(next);
      place(id);
      const last = shell.getBoundingClientRect();

      if (first) {
        // Move/resize the shell from the previous panel to the new one.
        shellAnim = shell.animate(
          [
            { transform: `translateX(${first.left - last.left}px)`, width: `${first.width}px`, height: `${first.height}px` },
            { transform: "translateX(0)", width: `${last.width}px`, height: `${last.height}px` },
          ],
          { duration: dur(260), easing: EASE }
        );
        setTimeout(() => $$(".panel.is-leaving", shell).forEach((p) => p.classList.remove("is-leaving")), dur(200));
      } else {
        const full = pattern === "full";
        shellAnim = shell.animate(
          [
            { opacity: 0, transform: full ? "none" : "translateY(-8px)", clipPath: full ? "inset(0 0 100% 0)" : "inset(0 0 0 0)" },
            { opacity: 1, transform: "none", clipPath: "inset(0 0 0 0)" },
          ],
          { duration: dur(full ? 300 : 220), easing: EASE }
        );
      }
    }

    function close({ returnFocus = false } = {}) {
      if (!openId) return;
      const id = openId;
      openId = null;
      setExpanded(null);
      shellAnim?.cancel();
      shellAnim = shell.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: pattern === "full" ? "none" : "translateY(-6px)" },
        ],
        { duration: dur(160), easing: "ease-in" }
      );
      shellAnim.onfinish = () => {
        if (openId) return;
        shell.hidden = true;
        $$(".panel", shell).forEach((p) => p.classList.remove("is-active", "is-leaving", "is-entering"));
      };
      if (returnFocus) trig(id).focus();
    }

    if (pattern === "hover") {
      let tOpen, tClose;
      const cancel = () => (clearTimeout(tOpen), clearTimeout(tClose));
      const scheduleClose = () => (cancel(), (tClose = setTimeout(close, 150)));
      triggers.forEach((t) => {
        t.addEventListener(
          "mouseenter",
          () => {
            cancel();
            if (openId) open(t.dataset.id);
            else tOpen = setTimeout(() => open(t.dataset.id), 80);
          },
          { signal }
        );
        t.addEventListener("focus", () => open(t.dataset.id), { signal });
      });
      shell.addEventListener("mouseenter", cancel, { signal });
      header.addEventListener("mouseleave", scheduleClose, { signal });
      [$(".logo", header), $(".header-actions", header)].forEach((el) =>
        el.addEventListener("mouseenter", scheduleClose, { signal })
      );
    } else {
      triggers.forEach((t) =>
        t.addEventListener("click", () => (openId === t.dataset.id ? close() : open(t.dataset.id)), { signal })
      );
      document.addEventListener(
        "click",
        (e) => {
          if (openId && !e.target.closest(".nav-trigger, .panel-shell")) close();
        },
        { signal }
      );
    }

    // Keyboard: Tab from an open trigger goes into its panel; Tab off the end
    // of the panel continues to the next trigger. Focus leaving the header closes.
    triggers.forEach((t, i) =>
      t.addEventListener(
        "keydown",
        (e) => {
          if (e.key !== "Tab" || e.shiftKey || openId !== t.dataset.id) return;
          const firstLink = $("a", panel(openId));
          if (firstLink) (e.preventDefault(), firstLink.focus());
        },
        { signal }
      )
    );
    shell.addEventListener(
      "keydown",
      (e) => {
        if (e.key !== "Tab" || !openId) return;
        const links = $$("a", panel(openId));
        const idx = triggers.indexOf(trig(openId));
        if (!e.shiftKey && e.target === links[links.length - 1]) {
          e.preventDefault();
          const nextEl = triggers[idx + 1] || $(".header-actions a", header);
          close();
          nextEl.focus();
        } else if (e.shiftKey && e.target === links[0]) {
          e.preventDefault();
          trig(openId).focus();
        }
      },
      { signal }
    );
    header.addEventListener(
      "focusout",
      (e) => {
        if (openId && !header.contains(e.relatedTarget)) close();
      },
      { signal }
    );

    addEventListener("resize", () => openId && place(openId), { signal });
    return { close, isOpen: () => !!openId };
  }

  function createDrawer(pattern, signal) {
    const drawer = $("#drawer");
    const track = $(".drawer-track", drawer);
    const root = $(".pane--root", drawer);
    const sub = $(".pane--sub", drawer);
    const menuBtn = $(".menu-btn");
    let isOpen = false;

    function openDrawer() {
      isOpen = true;
      document.body.classList.add("drawer-open");
      drawer.inert = false;
      menuBtn.setAttribute("aria-expanded", "true");
      setTimeout(() => $(".close-btn", root).focus({ preventScroll: true }), dur(200));
    }

    function closeDrawer() {
      if (!isOpen) return;
      isOpen = false;
      document.body.classList.remove("drawer-open");
      drawer.inert = true;
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.focus({ preventScroll: true });
      setTimeout(() => {
        if (sub) hideSub(false);
        $$(".acc-item.is-open", drawer).forEach((i) => {
          i.classList.remove("is-open");
          $(".acc-trigger", i).setAttribute("aria-expanded", "false");
        });
      }, dur(260));
    }

    function showSub(id) {
      const item = DATA.nav.find((n) => n.id === id);
      $(".back-btn span", sub).textContent = item.label;
      $(".back-btn", sub).setAttribute("aria-label", `Back to menu from ${item.label}`);
      $(".drill-body", sub).innerHTML = mobileMenuHTML(item, { withAll: true });
      track.dataset.level = "1";
      track.dataset.current = id;
      root.inert = true;
      sub.inert = false;
      setTimeout(() => $(".back-btn", sub).focus({ preventScroll: true }), dur(650));
    }

    function hideSub(returnFocus = true) {
      const id = track.dataset.current;
      track.dataset.level = "0";
      root.inert = false;
      sub.inert = true;
      if (returnFocus && id) $(`.drill-trigger[data-id="${id}"]`, root).focus({ preventScroll: true });
    }

    menuBtn.addEventListener("click", openDrawer, { signal });
    document.addEventListener(
      "click",
      (e) => {
        if (e.target.closest("[data-close]")) closeDrawer();
        const d = e.target.closest(".drill-trigger");
        if (d) showSub(d.dataset.id);
        if (e.target.closest(".back-btn")) hideSub();
      },
      { signal }
    );
    if (pattern !== "full") bindAccordion(drawer, ".acc-item", ".acc-trigger", signal);

    return {
      close: closeDrawer,
      isOpen: () => isOpen,
      back: () => (sub && track.dataset.level === "1" ? (hideSub(), true) : false),
    };
  }

  // Desktop search: a full-width drawer under the bar; the whole drawer is the field.
  function createSearch(signal, { onOpen } = {}) {
    const btn = $(".search-btn");
    const drawer = $("#search-drawer");
    const input = $("input", drawer);
    let isOpen = false;
    let anim = null;

    function open() {
      if (isOpen) return;
      onOpen?.();
      isOpen = true;
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close search");
      anim?.cancel();
      drawer.hidden = false;
      anim = drawer.animate(
        [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }],
        { duration: dur(280), easing: EASE }
      );
      input.focus({ preventScroll: true });
    }

    function close({ returnFocus = false } = {}) {
      if (!isOpen) return;
      isOpen = false;
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open search");
      anim?.cancel();
      anim = drawer.animate(
        [{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }],
        { duration: dur(200), easing: "ease-in" }
      );
      anim.onfinish = () => {
        if (!isOpen) drawer.hidden = true;
      };
      if (returnFocus) btn.focus();
    }

    btn.addEventListener("click", () => (isOpen ? close() : open()), { signal });
    document.addEventListener(
      "click",
      (e) => {
        if (isOpen && !e.target.closest(".search-drawer, .search-btn")) close();
      },
      { signal }
    );
    return { open, close, isOpen: () => isOpen };
  }

  /* ---------------- Footer (rendered once) ---------------- */
  function initFooter() {
    $("#footer-mount").innerHTML = footerHTML();
    const footer = $(".site-footer");
    bindAccordion(footer, ".footer-col", ".footer-toggle");
    // Headings are only interactive on mobile.
    const sync = () =>
      $$(".footer-toggle", footer).forEach((b) => {
        if (mqDesktop.matches) b.setAttribute("tabindex", "-1");
        else b.removeAttribute("tabindex");
      });
    sync();
    mqDesktop.addEventListener("change", sync);
  }

  /* ---------------- Pattern switcher ---------------- */
  let ac;

  function getPattern() {
    const p = new URLSearchParams(location.search).get("pattern");
    return PATTERNS[p] ? p : "hover";
  }

  function render(pattern) {
    ac?.abort();
    ac = new AbortController();
    const { signal } = ac;
    document.body.classList.remove("drawer-open");
    document.body.dataset.pattern = pattern;

    $("#header-mount").innerHTML = headerHTML(pattern) + drawerHTML(pattern);
    const keys = Object.keys(PATTERNS);
    $("#pattern-kicker").textContent = `Pattern ${keys.indexOf(pattern) + 1} of ${keys.length}`;
    $("#pattern-name").textContent = PATTERNS[pattern].name;
    $("#pattern-desc").textContent = PATTERNS[pattern].desc;
    document.title = `${PATTERNS[pattern].short} · DIRTT nav prototype`;

    // In B and C, only one of the nav menu and the search drawer is open at a time.
    // In A, menus open on hover, so passing over the nav mustn't close an open search;
    // the hover menu just layers over the drawer.
    let search;
    const menu = createDesktopMenu(pattern, signal, {
      onOpen: pattern === "hover" ? null : () => search?.close(),
    });
    search = createSearch(signal, { onOpen: () => menu.close() });
    const drawer = createDrawer(pattern, signal);

    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key !== "Escape") return;
        if (drawer.isOpen()) drawer.back() || drawer.close();
        else if (menu.isOpen()) menu.close({ returnFocus: true });
        else search.close({ returnFocus: true });
      },
      { signal }
    );
    mqDesktop.addEventListener("change", () => (menu.close(), search.close(), drawer.close()), { signal });

    updateSwitcher(pattern);
  }

  function updateSwitcher(pattern) {
    const sw = $(".switcher");
    const thumb = $(".switcher-thumb", sw);
    $$("button", sw).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pattern === pattern)));
    const active = $(`button[data-pattern="${pattern}"]`, sw);
    thumb.style.width = `${active.offsetWidth}px`;
    thumb.style.transform = `translateX(${active.offsetLeft}px)`;
  }

  function initSwitcher() {
    const sw = $(".switcher");
    sw.innerHTML =
      `<span class="switcher-thumb" aria-hidden="true"></span>` +
      Object.entries(PATTERNS)
        .map(([key, p]) => `<button type="button" data-pattern="${key}" aria-pressed="false">${p.short}</button>`)
        .join("");
    sw.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-pattern]");
      if (!b || b.getAttribute("aria-pressed") === "true") return;
      const url = new URL(location.href);
      url.searchParams.set("pattern", b.dataset.pattern);
      history.replaceState(null, "", url);
      render(b.dataset.pattern);
    });
    addEventListener("resize", () => updateSwitcher(document.body.dataset.pattern));
  }

  // Lets iOS Safari apply :active (tapped) styles on mobile.
  document.addEventListener("touchstart", () => {}, { passive: true });

  /* ---------------- Toast (stands in for page navigation) ---------------- */
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove("is-visible");
    void toast.offsetWidth;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  // Every link in the prototype is a placeholder; level 1 page links show a toast instead.
  document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-navigate]");
    if (nav) showToast(`Navigates to ${nav.dataset.navigate}`);
    if (e.target.closest('a[href^="#"]')) e.preventDefault();
  });

  initSwitcher();
  initFooter();
  render(getPattern());
  document.fonts?.ready.then(() => updateSwitcher(document.body.dataset.pattern));
})();
