import QrScanner from 'qr-scanner';

/* ============================================================
 * SpeechController — Gère la synthèse vocale (Web Speech API)
 * ============================================================ */
class SpeechController {
    #unlocked = false;

    constructor({ lang = 'fr-FR' } = {}) {
        this.lang = lang;
    }

    get isSupported() {
        return 'speechSynthesis' in window;
    }

    /**
     * Déverrouille l'API sur iOS. À appeler pendant un geste utilisateur
     * (clic), sinon les lectures suivantes seront bloquées.
     */
    unlock() {
        if (this.#unlocked || !this.isSupported) return;
        const silent = new SpeechSynthesisUtterance(' ');
        silent.volume = 0;
        silent.rate = 10;
        window.speechSynthesis.speak(silent);
        this.#unlocked = true;
    }

    cancel() {
        if (this.isSupported) window.speechSynthesis.cancel();
    }

    /**
     * Lit un texte à voix haute.
     * @param {string} text  Texte à prononcer
     * @param {number} rate  Vitesse (1 = normal, 0.8 = 80 %)
     */
    speak(text, rate = 1) {
        if (!this.isSupported) return;
        const clean = String(text ?? '').trim();
        if (!clean) return;

        this.cancel();

        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = this.lang;
        utterance.rate = rate;
        utterance.pitch = 1;
        utterance.volume = 1;

        // iOS a parfois besoin que la boucle d'événements se termine
        // après la fermeture de la caméra avant d'accepter le speak().
        setTimeout(() => window.speechSynthesis.speak(utterance), 50);
    }
}

/* ============================================================
 * QrScannerController — Encapsule Nimiq qr-scanner
 * ============================================================ */
class QrScannerController {
    constructor({ videoEl, onResult }) {
        this.scanner = new QrScanner(videoEl, onResult, {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
            workerPath: 'https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner-worker.min.js',
            maxScansPerSecond: 10,
        });
    }

    static hasCamera() {
        return QrScanner.hasCamera();
    }

    start() {
        return this.scanner.start();
    }

    stop() {
        this.scanner.stop();
    }
}

/* ============================================================
 * ScanApp — Orchestre le DOM, le scanner et la synthèse vocale
 * ============================================================ */
class ScanApp {
    /**
     * @param {object} cfg
     * @param {HTMLTextAreaElement} cfg.resultEl
     * @param {HTMLElement}         cfg.overlayEl
     * @param {HTMLVideoElement}    cfg.videoEl
     * @param {HTMLButtonElement}   cfg.closeBtn
     * @param {Array<{el: HTMLButtonElement, rate: number}>} cfg.scanButtons
     */
    constructor({ resultEl, overlayEl, videoEl, closeBtn, scanButtons }) {
        this.resultEl = resultEl;
        this.overlayEl = overlayEl;

        this.speech = new SpeechController({ lang: 'fr-FR' });

        this.scanner = new QrScannerController({
            videoEl,
            onResult: (result) => this.handleResult(result),
        });

        /** Vitesse de lecture à utiliser pour le prochain résultat scanné. */
        this.pendingRate = 1;

        // Câble chaque bouton de scan avec sa vitesse associée
        for (const { el, rate } of scanButtons) {
            el.addEventListener('click', () => this.startScan(rate));
        }

        closeBtn.addEventListener('click', () => this.stopScan());

        // Recalcule la hauteur du textarea après rotation d'écran (iOS)
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.autoResize(), 100);
        });

        // Nettoyage propre lors de la fermeture de la page
        window.addEventListener('pagehide', () => {
            this.scanner.stop();
            this.speech.cancel();
        });

        // Ajustement initial
        this.autoResize();
    }

    /* ---------- Textarea ---------- */
    autoResize() {
        const el = this.resultEl;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }

    /* ---------- Scan ---------- */
    async startScan(rate) {
        // 🔑 Déverrouille la synthèse vocale PENDANT le geste utilisateur
        this.speech.unlock();

        // Mémorise la vitesse à appliquer au résultat qui arrivera
        this.pendingRate = rate;

        if (!(await QrScannerController.hasCamera())) {
            alert("Aucune caméra détectée sur cet appareil.");
            return;
        }

        this.overlayEl.classList.remove('hidden');
        this.overlayEl.setAttribute('aria-hidden', 'false');

        try {
            await this.scanner.start();
        } catch (err) {
            console.error('Erreur caméra :', err);
            alert(
                "Impossible d'accéder à la caméra.\n" +
                "Vérifiez que la page est bien servie en HTTPS " +
                "et que l'autorisation caméra est accordée."
            );
            this.stopScan();
        }
    }

    stopScan() {
        this.scanner.stop();
        this.overlayEl.classList.add('hidden');
        this.overlayEl.setAttribute('aria-hidden', 'true');
    }

    /* ---------- Résultat d'un scan ---------- */
    handleResult(result) {
        this.resultEl.value = result.data;
        this.autoResize();
        this.stopScan();
        this.speech.speak(result.data, this.pendingRate);
    }
     }

     /* ============================================================
      * Bootstrap
      * ============================================================ */
     document.addEventListener('DOMContentLoaded', () => {
         new ScanApp({
             resultEl:  document.getElementById('result'),
                     overlayEl: document.getElementById('scanner-overlay'),
                     videoEl:   document.getElementById('qr-video'),
                     closeBtn:  document.getElementById('closeBtn'),
                     scanButtons: [
                         { el: document.getElementById('scanBtn'),     rate: 1   },
                     { el: document.getElementById('scanSlowBtn'), rate: 0.8 },
                     ],
         });
     });
