/* Bascule de thème clair / sombre — AuditRGAA.
   Par défaut le site suit le réglage système (via @media prefers-color-scheme).
   Ce bouton permet de forcer un thème ; le choix est mémorisé.
   L'application au chargement se fait via un petit script en <head> (avant le
   rendu) pour éviter tout clignotement ; ici on ne fait qu'ajouter le bouton. */
(function () {
  "use strict";
  var root = document.documentElement;

  function systeme() {
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark" : "light";
  }
  function actuel() {
    return root.getAttribute("data-theme") || systeme();
  }

  var btn;
  function majBouton() {
    if (!btn) return;
    var sombre = actuel() === "dark";
    btn.textContent = sombre ? "☀" : "☾"; // ☀ / ☾
    btn.setAttribute("aria-label", sombre ? "Passer en thème clair" : "Passer en thème sombre");
    btn.setAttribute("title", btn.getAttribute("aria-label"));
  }
  function basculer() {
    var vers = actuel() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", vers);
    try { localStorage.setItem("theme", vers); } catch (e) {}
    majBouton();
  }
  function init() {
    var nav = document.querySelector(".entete nav");
    if (!nav) return;
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bascule-theme";
    btn.addEventListener("click", basculer);
    nav.appendChild(btn);
    majBouton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
