/* Application MAEL : démarre après chargement du DOM et du module qr-scanner. */
(function (g) {
    function bootstrap() {
        const speech = new g.SpeechController({ lang: 'fr-FR' });
        const scanner = new g.BrowserQrScanner({
            videoEl: document.getElementById('qr-video'),
            onResult: () => {},
        });
        const service = new g.MaelScan({ speech, scanner });
        const controller = new g.MaelController(service);
        new g.MaelGui(controller);
    }

    // Le module est importé depuis un module inline (après le parse HTML).
    // Ne pas dépendre uniquement de DOMContentLoaded, déjà susceptible d'être passé.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
    } else {
        bootstrap();
    }
})(globalThis);
