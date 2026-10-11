/* AuditRGAA — fiches « Comment corriger » par règle axe-core.
   Gratuit, sans IA : du concret prêt à coller, rédigé une fois.
   Clé = identifiant de règle axe. { c: comment corriger, code: extrait }. */
window.__RGAA_FIX = {
  // --- Images (1.1 / 1.3) ---
  "image-alt": { c: "Ajoutez un attribut alt qui décrit la fonction de l'image. Si elle est purement décorative, mettez un alt vide (alt=\"\").",
    code: "<img src=\"robe.jpg\" alt=\"Robe rouge, vue de face\">\n<!-- décorative : --> <img src=\"deco.svg\" alt=\"\">" },
  "input-image-alt": { c: "Décrivez l'action du bouton image dans son alt.",
    code: "<input type=\"image\" src=\"loupe.png\" alt=\"Rechercher\">" },
  "role-img-alt": { c: "Donnez un nom à l'élément role=\"img\" avec aria-label.",
    code: "<span role=\"img\" aria-label=\"4 étoiles sur 5\">★★★★☆</span>" },
  "svg-img-alt": { c: "Ajoutez un <title> dans le SVG (et role=\"img\"), ou un aria-label.",
    code: "<svg role=\"img\" aria-label=\"Logo\"> … </svg>\n<!-- ou --> <svg role=\"img\"><title>Logo</title> … </svg>" },
  "area-alt": { c: "Chaque zone cliquable d'une image-map doit avoir un alt.",
    code: "<area shape=\"rect\" coords=\"…\" href=\"/paris\" alt=\"Paris\">" },
  "object-alt": { c: "Donnez une alternative textuelle à l'élément <object> (texte entre les balises ou aria-label).",
    code: "<object data=\"schema.svg\" type=\"image/svg+xml\" aria-label=\"Schéma du circuit\"></object>" },
  "image-redundant-alt": { c: "Si l'image ne fait que répéter un texte voisin, rendez-la décorative avec un alt vide (le texte suffit). Sinon, donnez une alternative qui apporte une info différente.",
    code: "<a href=\"/\"><img src=\"logo.svg\" alt=\"\"> Accueil</a>\n<!-- alt vide : le mot « Accueil » à côté suffit déjà -->" },

  // --- Cadres (2.1 / 2.2) ---
  "frame-title": { c: "Ajoutez un title descriptif à chaque iframe.",
    code: "<iframe src=\"…\" title=\"Carte de localisation\"></iframe>" },
  "frame-title-unique": { c: "Rendez chaque title d'iframe unique sur la page.",
    code: "<iframe title=\"Vidéo : présentation\"></iframe>\n<iframe title=\"Vidéo : tutoriel\"></iframe>" },

  // --- Couleurs (3.1 / 3.2) ---
  "color-contrast": { c: "Portez le contraste texte/fond à au moins 4,5:1 (3:1 pour le très grand texte). Assombrissez le texte ou éclaircissez le fond.",
    code: "/* 2,9:1 ✗ */ color:#9aa0a6; background:#fff;\n/* 4,6:1 ✓ */ color:#5f6368; background:#fff;" },
  "link-in-text-block": { c: "Un lien dans un paragraphe ne doit pas se distinguer que par la couleur : ajoutez un soulignement.",
    code: "p a { text-decoration: underline; }" },

  // --- Tableaux (5.7) ---
  "th-has-data-cells": { c: "Chaque cellule d'en-tête <th> doit être rattachée à des cellules de données. Utilisez scope=\"col\" ou scope=\"row\".",
    code: "<th scope=\"col\">Nom</th> … <td>Dupont</td>" },
  "td-headers-attr": { c: "Corrigez les attributs headers : chaque id cité doit exister sur un <th> de la même table.",
    code: "<th id=\"prix\">Prix</th> … <td headers=\"prix\">12 €</td>" },
  "scope-attr-valid": { c: "La valeur de scope doit être col, row, colgroup ou rowgroup.",
    code: "<th scope=\"col\">…</th>  <th scope=\"row\">…</th>" },
  "td-has-header": { c: "Dans un grand tableau, associez chaque donnée à ses en-têtes (scope ou headers/id).",
    code: "<th id=\"t\" scope=\"col\">Total</th> … <td headers=\"t\">…</td>" },

  // --- Liens (6.2) ---
  "link-name": { c: "Donnez un intitulé explicite au lien (le texte doit dire où il mène). Pour un lien-icône, utilisez aria-label.",
    code: "<a href=\"/panier\" aria-label=\"Voir mon panier\"><svg …></svg></a>" },

  // --- Scripts / ARIA (7.1) ---
  "aria-required-attr": { c: "Ajoutez les attributs ARIA obligatoires du rôle (ex. aria-checked sur role=\"checkbox\").",
    code: "<div role=\"checkbox\" aria-checked=\"false\" tabindex=\"0\">J'accepte</div>" },
  "aria-valid-attr-value": { c: "Corrigez la valeur de l'attribut ARIA : un aria-labelledby/-describedby doit pointer vers un id existant.",
    code: "<label id=\"lbl\">Nom</label> <input aria-labelledby=\"lbl\">" },
  "aria-allowed-attr": { c: "Retirez l'attribut ARIA non autorisé sur ce rôle/élément (vérifiez la spec du rôle).",
    code: "<!-- aria-checked n'est pas permis ici : le retirer -->" },
  "aria-hidden-focus": { c: "Un élément aria-hidden=\"true\" ne doit pas être focusable : retirez-le du parcours clavier (tabindex=\"-1\") ou enlevez l'aria-hidden.",
    code: "<a href=\"#\" aria-hidden=\"true\" tabindex=\"-1\">…</a>" },

  // --- Éléments obligatoires (8.x) ---
  "html-has-lang": { c: "Déclarez la langue principale de la page sur <html>.",
    code: "<html lang=\"fr\">" },
  "html-lang-valid": { c: "Utilisez un code langue valide (fr, en, es…).",
    code: "<html lang=\"fr\">" },
  "document-title": { c: "Donnez un <title> unique et descriptif à la page.",
    code: "<title>Panier — Boutique Dupont</title>" },

  // --- Structuration (9.x) ---
  "heading-order": { c: "Ne sautez pas de niveau de titre : après un h2, un h3 (pas un h4). Les titres suivent un plan logique.",
    code: "<h1>…</h1> <h2>…</h2> <h3>…</h3> <!-- pas h1 puis h4 -->" },
  "empty-heading": { c: "Un titre ne doit pas être vide : mettez-y du texte, ou utilisez une autre balise.",
    code: "<h2>Nos offres</h2>  <!-- et non <h2></h2> -->" },
  "landmark-one-main": { c: "Entourez le contenu principal d'une balise <main> (une seule par page).",
    code: "<main id=\"contenu\"> … </main>" },
  "list": { c: "Une liste doit être un <ul>/<ol> ne contenant que des <li> (pas d'autre balise directe).",
    code: "<ul><li>Un</li><li>Deux</li></ul>" },
  "listitem": { c: "Un <li> doit être enfant direct d'un <ul> ou <ol>.",
    code: "<ul><li>Élément</li></ul>" },

  // --- Présentation (10.x) ---
  "meta-viewport": { c: "Ne désactivez pas le zoom : retirez user-scalable=no et maximum-scale.",
    code: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" },
  "avoid-inline-spacing": { c: "N'imposez pas l'espacement du texte avec !important : laissez l'utilisateur l'ajuster.",
    code: "/* éviter */ letter-spacing:0 !important;\n/* préférer sans !important */" },

  // --- Formulaires (11.x) ---
  "label": { c: "Associez une étiquette <label for> à chaque champ (ou aria-label).",
    code: "<label for=\"email\">E-mail</label>\n<input id=\"email\" type=\"email\">" },
  "select-name": { c: "Étiquetez la liste déroulante avec un <label for> ou aria-label.",
    code: "<label for=\"pays\">Pays</label> <select id=\"pays\">…</select>" },
  "form-field-multiple-labels": { c: "Un champ ne doit avoir qu'une seule étiquette associée.",
    code: "<label for=\"nom\">Nom</label> <input id=\"nom\">" },
  "input-button-name": { c: "Donnez un intitulé au bouton (value ou aria-label).",
    code: "<input type=\"submit\" value=\"Envoyer\">" },
  "button-name": { c: "Un bouton doit avoir un intitulé. Pour un bouton-icône, ajoutez aria-label.",
    code: "<button aria-label=\"Fermer\"><svg …></svg></button>" },
  "autocomplete-valid": { c: "Utilisez une valeur autocomplete standard (name, email, tel…).",
    code: "<input name=\"email\" autocomplete=\"email\">" },

  // --- Navigation (12.7) ---
  "bypass": { c: "Ajoutez un lien d'évitement en tout début de page, menant au contenu principal.",
    code: "<a class=\"evitement\" href=\"#contenu\">Aller au contenu</a>\n… <main id=\"contenu\">" },
  "skip-link": { c: "Le lien d'évitement doit pointer vers un id existant du contenu principal.",
    code: "<a href=\"#contenu\">Aller au contenu</a> … <main id=\"contenu\">" },

  // --- Consultation (13.x) ---
  "meta-refresh": { c: "Supprimez le rechargement/redirection automatique (meta refresh).",
    code: "<!-- à retirer : <meta http-equiv=\"refresh\" content=\"5\"> -->" },
  "blink": { c: "Supprimez le clignotement (balise <blink> ou animation) : risque pour les personnes photosensibles.",
    code: "/* pas d'animation clignotante infinie */" },
  "marquee": { c: "Supprimez le texte défilant <marquee> (illisible et non maîtrisable).",
    code: "<!-- remplacer <marquee> par du texte statique -->" }
};
