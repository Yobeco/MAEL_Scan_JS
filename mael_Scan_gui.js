/* mael_Scan_gui.py — contrôleur DOM sur le HTML fourni */
(function (g) {
    class MaelController {
        constructor(scan_service) {
            this.scan_service = scan_service;
            this.last_setup = null;
        }
        get can_repeat() { return this.last_setup !== null; }
        on_scan() {
            this.scan_service.scan();
            this.last_setup = this.scan_service.last_tts_setup;
            return this.last_setup?.to_show || 'Aucun texte à lire pour ce scan.';
        }
        on_repeat(slow = false) {
            if (this.last_setup) this.scan_service.repeat(slow);
        }
    }

    class MaelGui {
        constructor(controller) {
            this.controller = controller;
            this.result = document.getElementById('result');
            this.scan_service = controller.scan_service;
            this.scan_service.on_audio_status = (status) => {
                if (status.to_show) { this.result.value = status.to_show; this.autoResize(); }
            };
            this.scan_service.scanner.onResult = (raws) => {
                try {
                    this.scan_service.handleRaw(raws);
                    this.result.value = this.scan_service.last_tts_setup?.to_show || '';
                } catch (error) {
                    this.result.value = `⚠ ${error?.message || 'Erreur lors de la lecture du code QR.'}`;
                }
                this.autoResize();
                this.stopScan();
            };

            document.getElementById('scanBtn').addEventListener('click', () => this._start_scan());
            document.getElementById('RepetBtn').addEventListener('click', () => this._start_repeat(false));
            document.getElementById('SlowBtn').addEventListener('click', () => this._start_repeat(true));
            document.getElementById('closeBtn').addEventListener('click', () => this.stopScan());
            window.addEventListener('pagehide', () => this.scan_service.stop());
            window.addEventListener('orientationchange', () => setTimeout(() => this.autoResize(), 100));
            this.autoResize();
        }

        autoResize() {
            this.result.style.height = 'auto';
            this.result.style.height = this.result.scrollHeight + 'px';
        }

        async _start_scan() {
            // Déverrouiller le lecteur MP3 immédiatement dans le geste de clic.
            try { this.scan_service.reader.unlock(); } catch (error) { console.warn('Déverrouillage audio indisponible :', error); }
            try {
                this.scan_service.speech.unlock();
            } catch (error) {
                console.warn('Déverrouillage vocal indisponible :', error);
            }

            // Comme dans l'original : vérifier la caméra, rendre la vidéo visible,
            // puis attendre explicitement la promesse de démarrage du scanner.
            try {
                if (!(await g.BrowserQrScanner.hasCamera())) {
                    alert('Aucune caméra détectée sur cet appareil.');
                    return;
                }

                const overlay = document.getElementById('scanner-overlay');
                overlay.classList.remove('hidden');
                overlay.setAttribute('aria-hidden', 'false');
                await this.scan_service.scanner.start();
            } catch (error) {
                console.error('Erreur caméra : échec du démarrage de qr-scanner.', error);
                alert(
                    "Impossible d'accéder à la caméra.\n" +
                    "Vérifiez que la page est bien servie en HTTPS et que l'autorisation caméra est accordée."
                );
                this.stopScan();
            }
        }

        stopScan() {
            this.scan_service.scanner.stop();
            const overlay = document.getElementById('scanner-overlay');
            overlay.classList.add('hidden');
            overlay.setAttribute('aria-hidden', 'true');
        }

        _start_repeat(slow) {
            this.scan_service.speech.unlock();
            if (!this.result.value.trim()) {
                alert('Aucun texte à relire.');
                return;
            }
            this.scan_service.repeat(slow);
        }
    }

    g.MaelController = MaelController;
    g.MaelGui = MaelGui;
})(globalThis);
