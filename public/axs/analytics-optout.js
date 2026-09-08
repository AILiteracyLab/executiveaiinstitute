/* Analytics opt-out control.
 *
 * WHY THIS EXISTS, and why it is not a cookie banner. Since 5 February 2026
 * the Data (Use and Access) Act 2025 exempts first-party analytics used only
 * to improve the service from PECR's consent requirement, on two conditions:
 * the visitor is told clearly what is happening, and is given a SIMPLE, FREE
 * WAY TO OBJECT. The privacy page does the telling. This does the objecting.
 *
 * The contract with the reader is that pressing "off" actually stops it, so:
 * the choice is written to a first-party cookie that the GTM loader in every
 * page's <head> reads BEFORE it injects the container, the Google cookies
 * already set are deleted, and the page is reloaded so the promise is true
 * immediately rather than from the next navigation onwards.
 *
 * The opt-out cookie itself needs no consent - it is strictly necessary for a
 * service the user has just asked for, namely not being counted.
 *
 * Placement: it appends itself to the accessibility widget's FAB stack when
 * there is one, which puts it directly under the accessibility button and,
 * because that stack sits at z-index 99999 and the accessibility panel at
 * 100000, makes it pass BEHIND the panel when the panel opens. Where there is
 * no accessibility widget (a page with no other JS) it builds its own stack at
 * a z-index below the panel's, so the same holds if the widget arrives later.
 */
(function () {
  "use strict";

  var COOKIE = "analytics_optout";
  var STACK_SELECTOR = "#axs-widget-root .axs-fab-stack";
  var PRIVACY_URL = (window.ANALYTICS_OPTOUT_PRIVACY_URL || "/privacy");
  var MOUNT_TIMEOUT_MS = 8000;

  function isOptedOut() {
    return document.cookie.indexOf(COOKIE + "=1") > -1;
  }

  function setOptOut(on) {
    var base = "; path=/; SameSite=Lax";
    if (location.protocol === "https:") base += "; Secure";
    if (on) {
      // two years, the longest a preference like this is worth asserting
      document.cookie = COOKIE + "=1; max-age=63072000" + base;
      disableGoogleAnalytics();
      clearGoogleCookies();
    } else {
      document.cookie = COOKIE + "=; max-age=0" + base;
    }
  }

  /* Stop gtag.js BEFORE deleting, or it puts one of them straight back.
   * _ga is the two-year client cookie, written once at init; _ga_<ID> is the
   * SESSION cookie, rewritten on activity - so a purge with the tag still
   * running removed _ga and left _ga_<ID>, which is exactly what the privacy
   * page promises does not happen. window['ga-disable-<ID>'] is Google's own
   * documented kill switch and is read on every write. The ID is derived from
   * the cookie name rather than hardcoded, so changing the GA property does
   * not silently break this. */
  function disableGoogleAnalytics() {
    var parts = document.cookie.split(";");
    for (var i = 0; i < parts.length; i++) {
      var name = parts[i].split("=")[0].trim();
      var m = /^_ga_(.+)$/.exec(name);
      if (m) window["ga-disable-G-" + m[1]] = true;
    }
    if (window.GA_MEASUREMENT_ID) window["ga-disable-" + window.GA_MEASUREMENT_ID] = true;
  }

  /* Delete what has already been set. Cookies can only be cleared on the
   * domain and path that set them, so try the registrable domain too - GA
   * writes _ga on ".example.com", which a host-only delete does not reach. */
  function clearGoogleCookies() {
    var parts = document.cookie.split(";");
    var host = location.hostname.split(".");
    var domains = [null, location.hostname];
    if (host.length > 2) domains.push("." + host.slice(-2).join("."));
    else if (host.length === 2) domains.push("." + location.hostname);

    for (var i = 0; i < parts.length; i++) {
      var name = parts[i].split("=")[0].trim();
      if (!/^(_ga|_gid|_gat|_gcl)/.test(name)) continue;
      for (var d = 0; d < domains.length; d++) {
        document.cookie = name + "=; max-age=0; path=/" +
          (domains[d] ? "; domain=" + domains[d] : "");
      }
    }
  }

  var ICON =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10"/>' +
    '<path d="M12 2a10 10 0 0 1 10 10"/><circle cx="9" cy="9" r="1.2" ' +
    'fill="currentColor" stroke="none"/><circle cx="14.5" cy="13" r="1.2" ' +
    'fill="currentColor" stroke="none"/><circle cx="8.5" cy="15" r="1.2" ' +
    'fill="currentColor" stroke="none"/></svg>';

  var STYLE = [
    '.aoo-fab{width:52px;height:52px;border-radius:16px;border:none;',
    'display:flex;align-items:center;justify-content:center;cursor:pointer;',
    'background:#1f2933;color:#fff;position:relative;line-height:1;',
    'box-shadow:0 4px 16px rgba(31,41,51,.35),inset 0 0 0 1px rgba(255,255,255,.1);',
    'transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s}',
    '.aoo-fab:hover{transform:translateY(-2px)}',
    // the shared FAB stack draws a hover tooltip from data-tip; while our
    // panel is open it sits on top of the panel text
    '.aoo-fab[aria-expanded="true"]::after,.aoo-fab[aria-expanded="true"]::before'+'{display:none!important}',
    '.aoo-fab:focus-visible{outline:3px solid #fff;outline-offset:2px}',
    '.aoo-stack{position:fixed;bottom:24px;right:20px;display:flex;',
    'flex-direction:column;gap:12px;z-index:99990}',
    '.aoo-panel{position:fixed;bottom:24px;right:84px;width:300px;',
    'max-width:calc(100vw - 40px);background:#fff;color:#1f2933;',
    'border-radius:14px;padding:18px;z-index:99991;',
    'box-shadow:0 12px 40px rgba(0,0,0,.28);font-size:15px;line-height:1.5;',
    'font-family:inherit}',
    '.aoo-panel[hidden]{display:none}',
    '.aoo-panel h2{font-size:16px;margin:0 0 8px;font-weight:700}',
    '.aoo-panel p{margin:0 0 14px}',
    '.aoo-actions{display:flex;gap:8px;flex-wrap:wrap}',
    '.aoo-btn{flex:1 1 auto;min-height:44px;padding:10px 14px;border-radius:8px;',
    'border:1px solid #1f2933;background:#fff;color:#1f2933;cursor:pointer;',
    'font:inherit;font-weight:600}',
    '.aoo-btn[aria-pressed="true"]{background:#1f2933;color:#fff}',
    '.aoo-btn:focus-visible{outline:3px solid #1f2933;outline-offset:2px}',
    '.aoo-note{margin:12px 0 0;font-size:13px;opacity:.75}',
    '.aoo-note a{color:inherit}',
    '@media (max-width:600px){.aoo-fab{width:48px;height:48px;border-radius:14px}',
    '.aoo-stack{bottom:16px;right:16px}',
    '.aoo-panel{right:16px;bottom:80px;width:auto;left:16px}}'
  ].join("");

  function build() {
    var style = document.createElement("style");
    style.textContent = STYLE;
    document.head.appendChild(style);

    var fab = document.createElement("button");
    fab.type = "button";
    fab.className = "aoo-fab axs-fab";  // axs-fab so a themed stack styles it
    fab.id = "analytics-optout-button";
    fab.setAttribute("aria-expanded", "false");
    fab.setAttribute("aria-controls", "analytics-optout-panel");
    fab.setAttribute("aria-label", "Cookies and visit counting");
    fab.setAttribute("data-tip", "Cookies");
    fab.innerHTML = ICON;

    var panel = document.createElement("div");
    panel.className = "aoo-panel";
    panel.id = "analytics-optout-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Cookies and visit counting");

    function render() {
      var off = isOptedOut();
      panel.innerHTML =
        '<h2>Counting visits</h2>' +
        '<p>We count visits to our public pages so we can see which pages ' +
        'people actually read. No advertising, and nothing that tries to work ' +
        'out who you are.</p>' +
        '<div class="aoo-actions">' +
        '<button type="button" class="aoo-btn" data-choice="on" aria-pressed="' +
        (!off) + '">Count my visits</button>' +
        '<button type="button" class="aoo-btn" data-choice="off" aria-pressed="' +
        off + '">Do not count me</button>' +
        '</div>' +
        '<p class="aoo-note">Your choice is kept on this device. ' +
        '<a href="' + PRIVACY_URL + '">How we handle your data</a></p>';

      var btns = panel.querySelectorAll(".aoo-btn");
      for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function () {
          var wantOff = this.getAttribute("data-choice") === "off";
          if (wantOff === isOptedOut()) { close(); return; }
          setOptOut(wantOff);
          // Sweep once more on the next tick before reloading: anything the
          // tag wrote between the kill switch and now goes too, so the page
          // is never left carrying a counting cookie the reader turned off.
          if (wantOff) {
            setTimeout(function () { clearGoogleCookies(); location.reload(); }, 50);
          } else {
            location.reload();
          }
        });
      }
    }

    function open() {
      render();
      panel.hidden = false;
      fab.setAttribute("aria-expanded", "true");
      var first = panel.querySelector(".aoo-btn");
      if (first) first.focus();
      document.addEventListener("keydown", onKey, true);
      setTimeout(function () {
        document.addEventListener("click", onOutside, true);
      }, 0);
    }

    function close(refocus) {
      panel.hidden = true;
      fab.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("click", onOutside, true);
      if (refocus) fab.focus();
    }

    function onKey(e) { if (e.key === "Escape") { e.stopPropagation(); close(true); } }
    function onOutside(e) {
      if (!panel.contains(e.target) && e.target !== fab && !fab.contains(e.target)) close();
    }

    fab.addEventListener("click", function () {
      if (panel.hidden) open(); else close(true);
    });

    document.body.appendChild(panel);
    return fab;
  }

  /* Join the accessibility stack if it turns up; the widget script is
   * deferred, so it usually has not built its DOM when this runs. Give up
   * after a bounded wait and stand alone rather than never appearing. */
  function mount(fab) {
    var stack = document.querySelector(STACK_SELECTOR);
    if (stack) { stack.appendChild(fab); return; }

    var deadline = Date.now() + MOUNT_TIMEOUT_MS;
    var timer = setInterval(function () {
      var s = document.querySelector(STACK_SELECTOR);
      if (s) { clearInterval(timer); s.appendChild(fab); return; }
      if (Date.now() > deadline) {
        clearInterval(timer);
        var own = document.createElement("div");
        own.className = "aoo-stack";
        own.appendChild(fab);
        document.body.appendChild(own);
      }
    }, 200);
  }

  /* Anything else fixed in this corner - Avery Hill and Distributed Republic
   * each have a day/night toggle - was positioned with a constant tuned to the
   * stack's height AT THE TIME. Adding a button to a bottom-anchored stack
   * grows it upwards, straight into them. Publish the measured height so that
   * relationship is expressed in CSS instead of guessed, and keep it current:
   * the accessibility widget can hide its own stack, and a viewport change
   * swaps the button size. */
  function publishStackHeight(fab) {
    var stack = fab.parentElement;
    if (!stack) return;
    var write = function () {
      var h = stack.getBoundingClientRect().height;
      if (h > 0) document.documentElement.style.setProperty("--axs-stack-h", h + "px");
    };
    write();
    if (window.ResizeObserver) new ResizeObserver(write).observe(stack);
    window.addEventListener("resize", write);
  }

  function start() {
    var fab = build();
    mount(fab);
    // mount() may append asynchronously once the widget's stack appears
    var t = setInterval(function () {
      if (fab.parentElement) { clearInterval(t); publishStackHeight(fab); }
    }, 100);
    setTimeout(function () { clearInterval(t); }, MOUNT_TIMEOUT_MS + 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
