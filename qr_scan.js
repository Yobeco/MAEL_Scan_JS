/* qr_scan.py — contrat scanner et caméra DOM via Nimiq qr-scanner */
(function (g) {
    class ScanError extends Error {}

    class QrScannerContract {
        constructor() {
            if (new.target === QrScannerContract) {
                throw new Error('QrScanner est un contrat abstrait');
            }
        }

        scan(source) {
            throw new Error('NotImplementedError: scan');
        }
    }

    class BrowserQrScanner extends QrScannerContract {
        constructor({ videoEl, onResult } = {}) {
            super();
            this.onResult = onResult;
            this.scanner = new g.QrScanner(videoEl, (result) => {
                const points = result.cornerPoints || [];
                const xs = points.map((point) => point.x);
                const ys = points.map((point) => point.y);
                const position = points.length ? {
                    top_left: { x: Math.min(...xs), y: Math.min(...ys) },
                    top_right: { x: Math.max(...xs), y: Math.min(...ys) },
                    bottom_right: { x: Math.max(...xs), y: Math.max(...ys) },
                    bottom_left: { x: Math.min(...xs), y: Math.max(...ys) },
                } : null;

                // L'adaptateur conserve la sortie RawQr attendue par MaelScan.
                this.onResult?.([new g.RawQr(result.data, position, result.data)]);
            }, {
                preferredCamera: 'environment',
                highlightScanRegion: true,
                highlightCodeOutline: true,
                returnDetailedScanResult: true,
                workerPath: 'https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner-worker.min.js',
                maxScansPerSecond: 10,
            });
        }

        static hasCamera() {
            return g.QrScanner.hasCamera();
        }

        scan(source) {
            if (source !== undefined && source !== null) {
                throw new ScanError('Le scanner caméra ne prend pas de source externe');
            }
            return this.start();
        }

        start() {
            // Retourner la promesse telle quelle permet à l'interface d'attendre
            // getUserMedia()/la lecture vidéo et de traiter proprement les erreurs.
            return this.scanner.start();
        }

        stop() {
            this.scanner.stop();
        }
    }

    g.ScanError = ScanError;
    g.QrScannerContract = QrScannerContract;
    g.BrowserQrScanner = BrowserQrScanner;
})(globalThis);
