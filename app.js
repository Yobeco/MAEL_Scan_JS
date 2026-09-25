import QrScanner from 'qr-scanner';

// --- Récupération des éléments du DOM ---
const resultEl = document.getElementById('result');
const scanBtn  = document.getElementById('scanBtn');
const overlay  = document.getElementById('scanner-overlay');
const closeBtn = document.getElementById('closeBtn');
const video    = document.getElementById('qr-video');

// --- Instanciation du scanner Nimiq ---
const qrScanner = new QrScanner(
    video,
    (result) => {
        // result = { data: string, cornerPoints: [...] } depuis v1.4.0
        resultEl.value = result.data;
        stopScan();
    },
    {
        // Utilise la caméra arrière en priorité
        preferredCamera: 'environment',
        // Affiche un cadre autour de la zone de scan
        highlightScanRegion: true,
        highlightCodeOutline: true,
        // Renvoie un objet {data, cornerPoints} au lieu d'une string
        returnDetailedScanResult: true,
        // Chemin explicite vers le Web Worker (accélère le décodage)
        workerPath: 'https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner-worker.min.js',
        // Limite raisonnable pour économiser la batterie
        maxScansPerSecond: 10,
    }
);

// --- Démarrage du scan ---
async function startScan() {
    // Vérifie qu'une caméra est disponible
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

// Nettoyage propre lors de la fermeture de la page (iOS apprécie)
window.addEventListener('pagehide', () => qrScanner.stop());
