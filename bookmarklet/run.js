/* AuditRGAA — Test express (bookmarklet).
   Charge axe-core + la table RGAA (servis depuis auditrgaa.com), lance
   l'analyse sur LA PAGE AFFICHÉE (y compris préprod / derrière un login, là
   où un scanner « colle ton URL » ne peut pas aller), puis traduit les règles
   axe en critères RGAA 4.1 et affiche le résultat dans un panneau isolé.
   Honnêteté volontaire : l'automatique ne couvre qu'une partie des 106
   critères — affiché, jamais caché. */
(function () {
  "use strict";
  // Déduit l'adresse de base de ce script (robuste : marche depuis n'importe
  // quel domaine, et permet de tester en local).
  var BASE = (function () {
    var sc = document.getElementsByTagName("script");
    for (var i = sc.length - 1; i >= 0; i--) {
      var src = sc[i].src || "", p = src.indexOf("/bookmarklet/run.js");
      if (p !== -1) return src.slice(0, p + "/bookmarklet/".length);
    }
    return "https://auditrgaa.com/bookmarklet/";
  })();
  var PANEL_ID = "auditrgaa-panneau";

  var IMPACTS = {
    critical: { fr: "critique", c: "#b91c1c", bg: "#fef2f2", r: 4 },
    serious:  { fr: "sérieux",  c: "#c2410c", bg: "#fff7ed", r: 3 },
    moderate: { fr: "moyen",    c: "#a16207", bg: "#fefce8", r: 2 },
    minor:    { fr: "mineur",   c: "#475569", bg: "#f8fafc", r: 1 }
  };

  function charger(src, cb, onErr) {
    var s = document.createElement("script");
    s.src = src; s.async = true;
    s.onload = cb;
    s.onerror = function () { onErr && onErr(src); };
    (document.head || document.documentElement).appendChild(s);
  }

  function demarrer() {
    if (window.__RGAA && window.axe) return lancer();
    var apresData = function () {
      if (window.axe) return lancer();
      charger(BASE + "axe.min.js", lancer, echecChargement);
    };
    if (window.__RGAA) apresData();
    else charger(BASE + "rgaa-data.js", apresData, echecChargement);
  }

  function echecChargement() {
    alert("AuditRGAA — Test express\n\nImpossible de charger l'outil sur cette page.\n"
      + "C'est souvent dû à une politique de sécurité (CSP) stricte du site.\n"
      + "Réessayez sur une autre page, ou demandez le rapport complet sur auditrgaa.com.");
  }

  function lancer() {
    panneau(loader());
    try {
      window.axe.run(document, {
        resultTypes: ["violations"],
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] }
      }).then(rendre).catch(function (e) {
        panneau(message("Erreur pendant l'analyse", String(e && e.message || e)));
      });
    } catch (e) {
      panneau(message("Erreur", String(e)));
    }
  }

  function rendre(res) {
    var D = window.__RGAA, violations = (res && res.violations) || [];
    var defauts = [], critsEnEchec = {}, nbCritiques = 0;

    violations.forEach(function (v) {
      var info = D.map[v.id];
      var nb = (v.nodes && v.nodes.length) || 1;
      var imp = IMPACTS[v.impact] || IMPACTS.minor;
      if (v.impact === "critical") nbCritiques += nb;
      var crit = info ? info.c : [];
      // Un critère testable tombe « en échec » s'il porte un défaut qui compte.
      if (info && info.n) crit.forEach(function (c) {
        if (D.testables.indexOf(c) !== -1) critsEnEchec[c] = true;
      });
      defauts.push({
        titre: info ? info.t : (v.help || v.id),
        pourquoi: info ? info.p : (v.description || ""),
        crit: crit, nb: nb, imp: imp,
        ik: IMPACTS[v.impact] ? v.impact : "minor",
        exemple: (v.nodes && v.nodes[0] && v.nodes[0].target && v.nodes[0].target.join(" ")) || ""
      });
    });

    defauts.sort(function (a, b) { return b.imp.r - a.imp.r; });
    var enEchec = Object.keys(critsEnEchec).length;
    var total = D.testables.length;            // 24
    var ok = total - enEchec;
    var couleur = enEchec === 0 ? "#15803d" : (enEchec <= 3 ? "#a16207" : "#b91c1c");

    // Historique local (avant/après) : on lit le précédent, on enregistre l'actuel.
    var cle = location.origin + location.pathname;
    var H = histLire(), liste = H[cle] || [], prec = liste.length ? liste[liste.length - 1] : null;
    var scanActuel = { d: Date.now(), ok: ok, tot: total, nd: defauts.length, nc: nbCritiques, cr: Object.keys(critsEnEchec) };
    liste.push(scanActuel);
    if (liste.length > 24) liste = liste.slice(-24);
    H[cle] = liste; histEcrire(H);

    var h = [];
    h.push(entete());
    h.push('<div class="corps">');

    // Score
    h.push('<div class="score">'
      + '<div class="cercle" style="color:' + couleur + '"><b>' + ok + '</b><span>/ ' + total + '</span></div>'
      + '<div class="score-txt"><strong>' + ok + ' critère' + (ok > 1 ? "s" : "") + ' sans défaut détecté</strong>'
      + '<p>sur <b>' + total + '</b> critères RGAA testables automatiquement.</p></div></div>');

    // Résumé
    h.push('<p class="resume">' + defauts.length + ' type' + (defauts.length > 1 ? "s" : "")
      + ' de défaut détecté' + (defauts.length > 1 ? "s" : "")
      + (nbCritiques ? ' — dont <b style="color:#b91c1c">' + nbCritiques + ' critique' + (nbCritiques > 1 ? "s" : "") + '</b>' : "")
      + '.</p>');

    // Avant / après (feature C)
    h.push(blocEvolution(prec, scanActuel, liste));

    // Note d'honnêteté — l'argument anti-overlay
    h.push('<p class="note">L\'analyse automatique couvre ~<b>' + total + ' des 106 critères</b> du RGAA 4.1. '
      + 'Un audit conforme exige un contrôle humain : ce test est un <b>point de départ</b>, pas une déclaration de conformité.</p>');

    // Liste des défauts
    if (defauts.length) {
      h.push('<div class="liste">');
      defauts.forEach(function (d) {
        var badges = d.crit.map(function (c) { return '<span class="rgaa">RGAA ' + echap(c) + '</span>'; }).join(" ");
        if (!badges) badges = '<span class="rgaa hors">hors périmètre auto</span>';
        h.push('<div class="def" style="border-left-color:' + d.imp.c + '">'
          + '<div class="def-haut"><span class="imp" style="color:' + d.imp.c + ';background:' + d.imp.bg + '">' + d.imp.fr + '</span>'
          + '<span class="nb">' + d.nb + ' élément' + (d.nb > 1 ? "s" : "") + '</span></div>'
          + '<p class="def-titre">' + echap(d.titre) + '</p>'
          + '<p class="def-pourquoi">' + echap(d.pourquoi) + '</p>'
          + '<div class="def-bas">' + badges + (d.exemple ? '<code>' + echap(d.exemple.slice(0, 60)) + '</code>' : "") + '</div>'
          + '</div>');
      });
      h.push('</div>');
    } else {
      h.push('<p class="aucun">Aucun défaut détecté par l\'automatique sur cette page. '
        + 'Cela ne vaut pas conformité : la majorité des critères demandent une vérification humaine.</p>');
    }

    // Données pour l'export en marque blanche (rapport.html les relit).
    var dExport = {
      u: location.href, t: Date.now(), ok: ok, tot: total, nc: nbCritiques,
      ev: prec ? { d: prec.d, ok: prec.ok, tot: prec.tot } : null,
      d: defauts.map(function (x) { return { t: x.titre, p: x.pourquoi, c: x.crit, n: x.nb, i: x.ik }; })
    };
    h.push('<button type="button" class="cta2 exporter">Exporter le rapport (marque blanche) →</button>');

    // Appel à l'action
    var url = encodeURIComponent(location.href);
    h.push('<a class="cta" href="mailto:contact@auditrgaa.com?subject=Rapport%20complet%20AuditRGAA&body=Bonjour%2C%0A%0AJe%20souhaite%20le%20rapport%20complet%20comment%C3%A9%20pour%20cette%20page%20%3A%20' + url + '%0A%0AMerci.">Obtenir le rapport complet commenté →</a>');
    h.push('<p class="pied">Chaque défaut localisé, avec son code corrigé et un brouillon de déclaration. '
      + '<a href="https://auditrgaa.com" target="_blank" rel="noopener">auditrgaa.com</a></p>');

    h.push('</div>');
    panneau(h.join(""));

    var host = document.getElementById(PANEL_ID);
    var exp = host && host.shadowRoot.querySelector(".exporter");
    if (exp) exp.onclick = function () {
      var ROOT = BASE.replace(/bookmarklet\/?$/, "");
      window.open(ROOT + "rapport.html#" + encodeURIComponent(JSON.stringify(dExport)), "_blank");
    };
  }

  // ---- UI ----
  function entete() {
    return '<div class="tete">'
      + '<span class="logo"><svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">'
      + '<rect x="4" y="4" width="56" height="56" rx="16" fill="#1d4ed8"/>'
      + '<path d="M22 33 L29 40 L43 24.5" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg> Test express <b>RGAA</b></span>'
      + '<button type="button" class="fermer" aria-label="Fermer">✕</button></div>';
  }
  function loader() { return entete() + '<div class="corps"><p class="charge">Analyse de la page en cours…</p></div>'; }
  function message(t, d) { return entete() + '<div class="corps"><p class="def-titre">' + echap(t) + '</p><p class="def-pourquoi">' + echap(d) + '</p></div>'; }

  function panneau(html) {
    var hote = document.getElementById(PANEL_ID);
    if (!hote) {
      hote = document.createElement("div");
      hote.id = PANEL_ID;
      hote.style.cssText = "all:initial;position:fixed;top:0;right:0;z-index:2147483647;";
      (document.body || document.documentElement).appendChild(hote);
      hote.attachShadow({ mode: "open" });
    }
    hote.shadowRoot.innerHTML = STYLE + '<div class="panneau">' + html + "</div>";
    var f = hote.shadowRoot.querySelector(".fermer");
    if (f) f.onclick = function () { hote.remove(); };
  }

  function echap(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ---- Historique local (avant/après) ----
  // Stocké dans le localStorage de la page auditée : le même navigateur, en
  // revenant sur la même page après correction, voit l'évolution. Rien n'est
  // envoyé ; si le stockage est indisponible, l'outil marche sans historique.
  function histLire() {
    try { return JSON.parse(localStorage.getItem("auditrgaa_historique")) || {}; }
    catch (e) { return {}; }
  }
  function histEcrire(h) {
    try { localStorage.setItem("auditrgaa_historique", JSON.stringify(h)); } catch (e) {}
  }
  function blocEvolution(prec, now, liste) {
    if (!prec) {
      return '<p class="evo neutre">Premier scan de cette page enregistré. '
        + 'Relancez le test après correction pour mesurer l\'évolution.</p>';
    }
    var delta = now.ok - prec.ok;
    var dd = new Date(prec.d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    var nb = "scans";
    var compte = liste.length >= 2 ? ' <span class="hist">' + liste.length + ' ' + nb + ' enregistrés</span>' : "";
    if (delta > 0) {
      return '<p class="evo mieux">↗ <b>+' + delta + ' critère' + (delta > 1 ? "s" : "")
        + '</b> depuis le ' + dd + ' (' + prec.ok + ' → ' + now.ok + ')' + compte + '</p>';
    }
    if (delta < 0) {
      return '<p class="evo pire">↘ <b>' + delta + ' critère' + (delta < -1 ? "s" : "")
        + '</b> depuis le ' + dd + ' — attention, régression (' + prec.ok + ' → ' + now.ok + ')' + compte + '</p>';
    }
    return '<p class="evo neutre">→ Stable depuis le ' + dd + ' (' + now.ok + '/' + now.tot + ')' + compte + '</p>';
  }

  var STYLE = '<style>'
    + ':host{all:initial}'
    + '*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}'
    + '.panneau{width:420px;max-width:96vw;height:100vh;display:flex;flex-direction:column;background:#fff;color:#0f172a;box-shadow:-12px 0 40px rgba(2,6,23,.28);font-size:14px;line-height:1.5}'
    + '.tete{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #e2e8f0;flex:none}'
    + '.logo{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600}.logo svg{vertical-align:middle}.logo b{color:#1d4ed8}'
    + '.fermer{border:0;background:transparent;font-size:16px;cursor:pointer;color:#475569;width:30px;height:30px;border-radius:999px}.fermer:hover{background:#f1f5f9}'
    + '.corps{padding:18px;overflow-y:auto}'
    + '.charge{color:#475569}'
    + '.score{display:flex;align-items:center;gap:16px;margin-bottom:14px}'
    + '.cercle{width:80px;height:80px;border-radius:50%;border:6px solid currentColor;display:flex;flex-direction:column;align-items:center;justify-content:center;flex:none}'
    + '.cercle b{font-size:26px;line-height:1}.cercle span{font-size:11px;color:#64748b;font-weight:600}'
    + '.score-txt strong{font-size:15px}.score-txt p{color:#475569;font-size:13px;margin-top:2px}'
    + '.resume{font-size:14px;margin:4px 0 12px}'
    + '.note{background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;border-radius:10px;padding:10px 12px;font-size:12.5px;margin-bottom:16px}'
    + '.evo{font-size:13px;font-weight:500;padding:9px 12px;border-radius:10px;margin:0 0 14px}'
    + '.evo.mieux{background:#f0fdf4;color:#15803d}.evo.pire{background:#fef2f2;color:#b91c1c}.evo.neutre{background:#f1f5f9;color:#475569}'
    + '.evo .hist{font-weight:400;opacity:.75}'
    + '.liste{display:flex;flex-direction:column;gap:10px}'
    + '.def{border:1px solid #e2e8f0;border-left:4px solid;border-radius:10px;padding:11px 13px;background:#fff}'
    + '.def-haut{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}'
    + '.imp{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:2px 8px;border-radius:999px}'
    + '.nb{font-size:12px;color:#64748b}'
    + '.def-titre{font-weight:600;font-size:14px;margin-bottom:3px}'
    + '.def-pourquoi{color:#475569;font-size:12.5px;margin-bottom:8px}'
    + '.def-bas{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'
    + '.rgaa{background:#eff6ff;color:#1e40af;font-size:11.5px;font-weight:600;padding:2px 7px;border-radius:5px}.rgaa.hors{background:#f1f5f9;color:#64748b}'
    + 'code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;background:#f1f5f9;color:#334155;padding:2px 5px;border-radius:4px;overflow-wrap:anywhere}'
    + '.aucun{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;border-radius:10px;padding:12px}'
    + '.cta{display:block;text-align:center;background:#1d4ed8;color:#fff;text-decoration:none;font-weight:600;padding:12px;border-radius:999px;margin:18px 0 10px}.cta:hover{background:#1e40af}'
    + '.cta2{display:block;width:100%;text-align:center;background:transparent;color:#1d4ed8;border:1.5px solid #1d4ed8;font-weight:600;padding:11px;border-radius:999px;margin:16px 0 0;cursor:pointer;font-size:14px;font-family:inherit}.cta2:hover{background:#eff6ff}'
    + '.pied{font-size:12px;color:#64748b;text-align:center}.pied a{color:#1d4ed8}'
    + '@media(prefers-color-scheme:dark){.panneau{background:#0b1120;color:#e6ebf4}.tete{border-color:#243049}.fermer{color:#b4c0d6}.fermer:hover{background:#1b2740}'
    + '.score-txt p,.resume,.def-pourquoi,.nb,.pied{color:#b4c0d6}.def{background:#111a2e;border-color:#243049}'
    + '.note{background:#15233f;color:#bfdbfe;border-color:#1e3a8a}.rgaa{background:#15233f;color:#93c5fd}.rgaa.hors{background:#1b2740;color:#94a3b8}'
    + 'code{background:#1b2740;color:#cbd5e1}.aucun{background:#0f2417;color:#86efac;border-color:#166534}'
    + '.cta2{color:#93c5fd;border-color:#93c5fd}.cta2:hover{background:#15233f}'
    + '.evo.mieux{background:#0f2417;color:#86efac}.evo.pire{background:#2a1414;color:#fca5a5}.evo.neutre{background:#1b2740;color:#b4c0d6}}'
    + '</style>';

  demarrer();
})();
