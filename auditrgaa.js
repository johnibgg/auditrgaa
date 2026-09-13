/* Le seul script de la vitrine. Il ajoute une ombre à l'en-tête dès qu'on
   quitte le haut de page — repère de profondeur, rien de plus.

   Tout le reste du mouvement est en CSS : une page dont la lisibilité
   dépendrait de l'exécution d'un script serait un mauvais site, et sur
   celui-ci, une contradiction. */
(function () {
  "use strict";
  var entete = document.querySelector(".entete");
  if (!entete) { return; }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { return; }

  var enAttente = false;
  function regarder() {
    entete.classList.toggle("defilee", window.scrollY > 8);
    enAttente = false;
  }
  window.addEventListener("scroll", function () {
    if (!enAttente) { enAttente = true; window.requestAnimationFrame(regarder); }
  }, { passive: true });
  regarder();
})();
