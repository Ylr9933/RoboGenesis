/* 滚动揭示 + Hero 数字动画 (轻量, 无依赖) */
(function () {
  const ready = (fn) =>
    document.readyState !== "loading"
      ? fn()
      : document.addEventListener("DOMContentLoaded", fn);

  ready(() => {
    // ---- 0. 主页标记: 含 .rg-hero 时给 body 加 rg-landing ----
    if (document.querySelector(".rg-hero")) {
      document.body.classList.add("rg-landing");
    }
    // ---- 1. 滚动揭示 ----
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("rg-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".rg-reveal").forEach((el) => io.observe(el));

    // ---- 2. 数字滚动 ----
    const animateCount = (el) => {
      const target = parseFloat(el.dataset.count || "0");
      const suffix = el.dataset.suffix || "";
      const dur = 1200;
      const t0 = performance.now();
      const isInt = !el.dataset.float;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const v = target * eased;
        el.textContent = (isInt ? Math.round(v) : v.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const numIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            numIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll("[data-count]").forEach((el) => numIO.observe(el));

    // ---- 3. 左侧栏：点击当前页标题，折叠/展开页内 TOC ----
    // toc.integrate 会把当前页的 h2/h3 渲染成 .md-nav--secondary 子菜单
    // 这里给「当前页链接」绑定 click → 切换 collapsed 类
    const setupTocToggle = () => {
      const activeLinks = document.querySelectorAll(
        ".md-nav__link--active, .md-nav__link[aria-current='page']"
      );
      activeLinks.forEach((link) => {
        if (link.dataset.tocToggleBound === "1") return;
        // 只处理那种带兄弟 .md-nav--secondary 的活动链接
        const sub = link.parentElement && link.parentElement.querySelector(
          ":scope > nav.md-nav, :scope > .md-nav"
        );
        if (!sub) return;
        link.dataset.tocToggleBound = "1";
        link.style.cursor = "pointer";
        link.setAttribute("aria-expanded", "true");
        link.addEventListener("click", (ev) => {
          // 仅当点击的是当前页（href 等于当前 URL 或 # 锚）
          const href = link.getAttribute("href") || "";
          const isSelf =
            href === "" ||
            href === "#" ||
            link.classList.contains("md-nav__link--active") ||
            link.getAttribute("aria-current") === "page";
          if (!isSelf) return;
          ev.preventDefault();
          const collapsed = sub.classList.toggle("rg-toc-collapsed");
          link.setAttribute("aria-expanded", collapsed ? "false" : "true");
        });
      });
    };
    setupTocToggle();
    // 即时模式 / 路由切换后重新绑定
    document.addEventListener("DOMContentLoaded", setupTocToggle);
    if (window.document$) {
      try { window.document$.subscribe(() => setupTocToggle()); } catch (_) {}
    }
  });
})();
