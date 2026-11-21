const ENQUIRY_EMAIL = "southgujratindore@hotmail.com";

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.textContent = open ? "Close" : "Menu";
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.textContent = "Menu";
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.textContent = "Menu";
      navToggle.focus();
    }
  });
}

const quoteForm = document.querySelector("#quote");
const formResult = document.querySelector("#form-result");

if (quoteForm && formResult) {
  const submitButton = quoteForm.querySelector("[type='submit']");

  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (quoteForm.querySelector("[name='_honey']").value) return;

    const data = new FormData(quoteForm);
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    formResult.hidden = true;
    formResult.classList.remove("is-error");

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(ENQUIRY_EMAIL)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          from: data.get("from"),
          to: data.get("to"),
          goods: data.get("goods"),
          truck: data.get("truck"),
          message: data.get("message") || "",
          _subject: "Transport enquiry for SGFC India",
          _template: "table",
          _captcha: "false",
          _replyto: data.get("email")
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false || payload.success === "false") {
        throw new Error(payload.message || "The enquiry was not accepted.");
      }
      quoteForm.reset();
      formResult.hidden = false;
      formResult.textContent = "Your enquiry has been sent to southgujratindore@hotmail.com.";
    } catch (error) {
      formResult.hidden = false;
      formResult.classList.add("is-error");
      formResult.textContent = "The enquiry could not be sent. Call 9300799999 or email southgujratindore@hotmail.com.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send enquiry";
    }
  });
}

const networkMap = document.querySelector("[data-network]");

function drawNetwork() {
  if (!networkMap) return;
  const svg = networkMap.querySelector(".network-lines");
  const width = networkMap.clientWidth;
  const height = networkMap.clientHeight;
  if (!svg || width < 20 || height < 20) return;

  const mapBox = networkMap.getBoundingClientRect();
  const hubBox = networkMap.querySelector(".net-hub").getBoundingClientRect();
  const hx = hubBox.left + hubBox.width / 2 - mapBox.left;
  const hy = hubBox.top + hubBox.height / 2 - mapBox.top;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.replaceChildren();

  networkMap.querySelectorAll(".net-node").forEach((node) => {
    const box = node.getBoundingClientRect();
    const nx = box.left + box.width / 2 - mapBox.left;
    const ny = box.top + box.height / 2 - mapBox.top;
    const dx = nx - hx;
    const dy = ny - hy;
    const length = Math.hypot(dx, dy) || 1;
    const ux = Math.abs(dx / length);
    const uy = Math.abs(dy / length);
    const alongHub = Math.min(ux === 0 ? Infinity : (hubBox.width / 2) / ux, uy === 0 ? Infinity : (hubBox.height / 2) / uy);
    const alongNode = Math.min(ux === 0 ? Infinity : (box.width / 2) / ux, uy === 0 ? Infinity : (box.height / 2) / uy);
    const truck = networkMap.querySelector(`.net-truck[data-lane="${node.dataset.lane}"]`);
    const truckLen = truck ? truck.offsetWidth : 40;
    const free = length - alongHub - alongNode;
    const pad = 4;
    const showTruck = free > truckLen + pad * 2;
    let start = alongHub + (showTruck ? truckLen / 2 + pad : 8);
    let end = alongNode + (showTruck ? truckLen / 2 + pad : 8);
    if (!showTruck && start + end > length - 4) {
      const fit = Math.max(length - 4, 12) / (start + end);
      start *= fit;
      end *= fit;
    }
    const x1 = hx + (dx / length) * start;
    const y1 = hy + (dy / length) * start;
    const x2 = nx - (dx / length) * end;
    const y2 = ny - (dy / length) * end;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1.toFixed(1));
    line.setAttribute("y1", y1.toFixed(1));
    line.setAttribute("x2", x2.toFixed(1));
    line.setAttribute("y2", y2.toFixed(1));
    svg.appendChild(line);

    if (truck) {
      truck.style.visibility = showTruck ? "visible" : "hidden";
      truck.style.offsetPath = `path("M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}")`;
    }
  });

  networkMap.classList.add("is-ready");
}

if (networkMap) {
  drawNetwork();
  window.addEventListener("resize", drawNetwork);
  if ("ResizeObserver" in window) {
    new ResizeObserver(drawNetwork).observe(networkMap);
  }
}

const revealSelectors = [
  ".hero-copy > *",
  ".page-banner .wrap > *",
  ".intro-band .wrap",
  "main .section .wrap > *"
];

function revealDelay(el, opening) {
  const group = [...el.parentElement.children];
  const index = Math.max(0, group.indexOf(el));
  if (!opening) return `${50 + Math.min(index, 6) * 90}ms`;
  if (el.closest(".hero, .page-banner")) return `${240 + index * 130}ms`;
  if (el.closest(".intro-band")) return "700ms";
  return `${860 + Math.min(index, 5) * 110}ms`;
}

function showReveal(el, opening) {
  el.style.setProperty("--reveal-delay", revealDelay(el, opening));
  el.classList.add("is-shown");
}

function initReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const seen = new Set();
  const items = [];
  revealSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      items.push(el);
    });
  });

  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => showReveal(el, true));
    return;
  }

  const started = performance.now();
  const observer = new IntersectionObserver((entries) => {
    const duringOpen = performance.now() - started < 500;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      showReveal(entry.target, duringOpen);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });

  items.forEach((el) => observer.observe(el));
}

initReveal();
