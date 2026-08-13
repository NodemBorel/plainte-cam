/* ============================================================
   DICTÉE ET ENREGISTREMENT DE L'AUDITION

   Le compte rendu d'entretien décrit une audition prise à la main, puis
   ressaisie : double travail, et une déposition qui s'éloigne des mots du
   comparant. On propose donc de dicter la déposition — la voix est
   transcrite au fil de l'eau — et d'en conserver l'enregistrement sonore
   comme pièce du dossier.

   Deux API du navigateur, deux disponibilités distinctes :
     — SpeechRecognition transcrit, mais n'existe que sur les navigateurs
       à moteur Chromium (Chrome, Edge) ; Firefox ne l'implémente pas.
     — MediaRecorder capte le son, et suppose l'accès au micro.
   Les deux exigent un contexte sécurisé : une page ouverte en file://
   n'y a pas droit. Rien n'est donc promis sans avoir été vérifié, et la
   saisie au clavier reste possible en toutes circonstances.
   ============================================================ */

var Dictee = (function () {
  var Reco = (typeof window !== 'undefined')
    ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

  var reco = null;          /* instance de reconnaissance en cours   */
  var enregistreur = null;  /* MediaRecorder                         */
  var morceaux = [];        /* fragments audio captés                */
  var flux = null;          /* MediaStream, à refermer après usage   */
  var actif = false;

  /* ── Ce que le navigateur permet vraiment ───────────────── */

  function contexteSecurise() {
    if (typeof window === 'undefined') return false;
    /* isSecureContext est absent des très vieux navigateurs : on retombe
       alors sur le protocole, seul indice disponible. */
    if (typeof window.isSecureContext === 'boolean') return window.isSecureContext;
    var p = (window.location && window.location.protocol) || '';
    return p === 'https:' || (window.location && window.location.hostname === 'localhost');
  }

  function transcriptionPossible() { return !!Reco && contexteSecurise(); }

  function captureSonPossible() {
    return typeof navigator !== 'undefined' &&
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
      typeof MediaRecorder !== 'undefined' &&
      contexteSecurise();
  }

  /* Pourquoi la dictée n'est pas disponible : l'agent doit savoir s'il
     doit changer de navigateur ou servir la page autrement. */
  function empechement() {
    if (!Reco) return 'Ce navigateur ne sait pas transcrire la parole. Chrome ou Edge le permettent ; ailleurs, saisissez la déposition au clavier.';
    if (!contexteSecurise()) return 'La dictée exige une page servie en HTTPS ou depuis localhost. Ouverte en fichier local, elle n\'a pas accès au micro.';
    return '';
  }

  /* ── Dictée ─────────────────────────────────────────────── */

  /* opts : { surTexte(acquis, encours), surErreur(msg), surFin() } */
  function demarrer(opts) {
    opts = opts || {};
    if (!transcriptionPossible()) {
      if (opts.surErreur) opts.surErreur(empechement());
      return false;
    }
    if (actif) return false;

    reco = new Reco();
    reco.lang = 'fr-FR';
    reco.continuous = true;      /* une déposition dure : on ne s'arrête
                                    pas au premier silence */
    reco.interimResults = true;  /* le texte s'affiche pendant qu'on parle,
                                    faute de quoi l'agent croit à une panne */

    reco.onresult = function (ev) {
      var acquis = '', encours = '';
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        var bout = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) acquis += bout; else encours += bout;
      }
      if (opts.surTexte) opts.surTexte(acquis, encours);
    };

    reco.onerror = function (ev) {
      var m = {
        'no-speech':      'Aucune parole détectée.',
        'audio-capture':  'Micro introuvable.',
        'not-allowed':    'Accès au micro refusé.',
        'network':        'La transcription nécessite une connexion.'
      }[ev.error] || ('Erreur de transcription : ' + ev.error);
      if (opts.surErreur) opts.surErreur(m);
    };

    reco.onend = function () {
      actif = false;
      if (opts.surFin) opts.surFin();
    };

    try { reco.start(); } catch (e) {
      if (opts.surErreur) opts.surErreur('La dictée n\'a pas pu démarrer.');
      return false;
    }
    actif = true;
    return true;
  }

  function arreter() {
    if (reco && actif) { try { reco.stop(); } catch (e) { /* déjà arrêtée */ } }
    actif = false;
  }

  function enCours() { return actif; }

  /* ── Enregistrement sonore ──────────────────────────────── */

  /* Rend une promesse : le micro se demande, l'utilisateur accepte ou non. */
  function capturerSon() {
    if (!captureSonPossible()) return Promise.reject(new Error(empechement()));
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
      flux = s;
      morceaux = [];
      enregistreur = new MediaRecorder(s);
      enregistreur.ondataavailable = function (ev) {
        if (ev.data && ev.data.size) morceaux.push(ev.data);
      };
      enregistreur.start();
      return true;
    });
  }

  /* Rend { url, taille } ou null : de quoi joindre le son au dossier. */
  function arreterCapture() {
    return new Promise(function (resoudre) {
      if (!enregistreur || enregistreur.state === 'inactive') { resoudre(null); return; }
      enregistreur.onstop = function () {
        /* Le micro reste allumé tant qu'on ne coupe pas les pistes : le
           voyant du navigateur resterait au rouge après l'audition. */
        if (flux) { flux.getTracks().forEach(function (t) { t.stop(); }); flux = null; }
        if (!morceaux.length) { resoudre(null); return; }
        var bloc = new Blob(morceaux, { type: enregistreur.mimeType || 'audio/webm' });
        morceaux = [];
        resoudre({ url: URL.createObjectURL(bloc), octets: bloc.size });
      };
      try { enregistreur.stop(); } catch (e) { resoudre(null); }
    });
  }

  return {
    transcriptionPossible: transcriptionPossible,
    captureSonPossible: captureSonPossible,
    empechement: empechement,
    demarrer: demarrer,
    arreter: arreter,
    enCours: enCours,
    capturerSon: capturerSon,
    arreterCapture: arreterCapture
  };
})();
