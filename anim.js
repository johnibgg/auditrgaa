/* Révélation au défilement — AuditRGAA.
   Sécurité (comme le reste du site) :
   - rien n'est masqué tant que ce script n'a pas confirmé tourner
     (il ajoute `js-anim` sur <html>, et le CSS ne parque à opacity:0
     que sous cette classe) ;
   - si la personne a demandé « mouvement réduit », on ne fait rien du tout. */
(function () {
  "use strict";
  try {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var root = document.documentElement;

    function demarrer() {
      root.classList.add("js-anim");
      var els = [].slice.call(document.querySelectorAll("main .carte, main .section h2"));
      els.forEach(function (el) { el.classList.add("a-reveal"); });

      if (!("IntersectionObserver" in window)) {
        els.forEach(function (el) { el.classList.add("vu"); });
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("vu"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      els.forEach(function (el) { io.observe(el); });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", demarrer);
    } else {
      demarrer();
    }
  } catch (e) { /* en cas de pépin, la page reste simplement visible */ }
})();
