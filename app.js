import QrScanner from 'qr-scanner';

// --- Récupération des éléments du DOM ---
const resultEl = document.getElementById('result');
const scanBtn  = document.getElementById('scanBtn');
const overlay  = document.getElementById('scanner-overlay');
const closeBtn = document.getElementById('closeBtn');
const video    = document.getElementById('qr-video');

// --- Auto-dimensionnement du textarea ---
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}
autoResize(resultEl);

// --- Synthèse vocale via Web Speech API ---
let speechUnlocked = false;

/**
 * Déverrouille speechSynthesis sur iOS.
 * À appeler impérativement pendant un geste utilisateur (clic).
 * Un utterance muet suffit à autoriser les lectures futures.
 */
function unlockSpeech() {
    if (speechUnlocked || !('speechSynthesis' in window)) return;
    const silent = new SpeechSynthesisUtterance(' ');
    silent.volume = 0;
    silent.rate = 10;
    window.speechSynthesis.speak(silent);
    speechUnlocked = true;
}

/**
 * Lit un texte à voix haute.
 * Sur iOS, ne fonctionne de façon fiable qu'après unlockSpeech().
 */
function speakText(text) {
    if (!('speechSynthesis' in window)) {
        console.warn("speechSynthesis non supporté.");
        return;
    }
    const clean = text.trim();
    if (!clean) return;

    // Stoppe toute lecture en cours avant d'en démarrer une nouvelle
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang   = 'fr-FR';
    utterance.rate   = 1;     // 0.1 – 10
    utterance.pitch  = 1;     // 0 – 2
    utterance.volume = 1;     // 0 – 1

    // On diffère très légèrement l'appel : iOS a parfois besoin que la
    // boucle d'événements se termine après stopScan() pour accepter le speak().
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 50);
}

// --- Instanciation du scanner Nimiq ---
const qrScanner = new QrScanner(
    video,
    (result) => {
        // 1. Affiche le contenu dans le textarea
        resultEl.value = result.data;
        autoResize(resultEl);

        // 2. Ferme l'overlay caméra (libère la ressource avant l'audio)
        stopScan();

        // 3. Lecture vocale automatique du contenu scanné
        speakText(result.data);
    },
    {
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
        workerPath: 'https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner-worker.min.js',
        maxScansPerSecond: 10,
    }
);

// --- Démarrage / arrêt du scan ---
async function startScan() {
    const hasCamera = await QrScanner.hasCamera();
    if (!hasCamera) {
        alert("Aucune caméra détectée sur cet appareil.");
        return;
    }

    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');

    try {
        await qrScanner.start();
    } catch (err) {
        console.error('Erreur caméra :', err);
        alert(
            "Impossible d'accéder à la caméra.\n" +
            "Vérifiez que la page est bien servie en HTTPS " +
            "et que l'autorisation caméra est accordée."
        );
        stopScan();
    }
}

function stopScan() {
    qrScanner.stop();
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
}

// --- Écouteurs d'événements ---
scanBtn.addEventListener('click', () => {
    // 🔑 Point clé : on déverrouille la synthèse vocale PENDANT
    // le clic (geste utilisateur requis par iOS).
    unlockSpeech();
    startScan();
});

closeBtn.addEventListener('click', stopScan);

window.addEventListener('orientationchange', () => {
    setTimeout(() => autoResize(resultEl), 100);
});

window.addEventListener('pagehide', () => {
    qrScanner.stop();
    window.speechSynthesis.cancel();
});
