import QrScanner from 'qr-scanner';

// --- Récupération des éléments du DOM ---
const resultEl = document.getElementById('result');
const scanBtn  = document.getElementById('scanBtn');
const overlay  = document.getElementById('scanner-overlay');
const closeBtn = document.getElementById('closeBtn');
const video    = document.getElementById('qr-video');

// --- Auto-dimensionnement du textarea ---
function autoResize(el) {
    el.style.height = 'auto';       // réinitialise pour pouvoir rétrécir
    el.style.height = el.scrollHeight + 'px'; // ajuste à la hauteur du contenu
}

// Ajuste dès le chargement (au cas où la valeur initiale serait longue)
autoResize(resultEl);

// --- Instanciation du scanner Nimiq ---
const qrScanner = new QrScanner(
    video,
    (result) => {
        resultEl.value = result.data;
        autoResize(resultEl);        // ⬅️ ajuste après la mise à jour
        stopScan();
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

// --- Démarrage du scan ---
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

// --- Arrêt du scan ---
function stopScan() {
    qrScanner.stop();
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
}

// --- Écouteurs d'événements ---
scanBtn.addEventListener('click', startScan);
closeBtn.addEventListener('click', stopScan);

// Recalcule la taille si l'utilisateur fait pivoter son téléphone
window.addEventListener('orientationchange', () => {
    setTimeout(() => autoResize(resultEl), 100);
});

// Nettoyage propre lors de la fermeture de la page (iOS apprécie)
window.addEventListener('pagehide', () => qrScanner.stop());
