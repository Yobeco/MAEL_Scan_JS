/* dico_url.js — Construction des URL audio (Google Drive via le Worker Cloudflare) */
(function (g) {

    // Adresse du Worker Cloudflare qui relaie les fichiers MP3 de Google Drive
    const WORKER_BASE = 'https://mael-gdrive-audio.mael-phrase.workers.dev';

    function build_url(item) {
        // Vérification du CloudItem reçu de qr_parse.js
        if (!item || typeof item.mode !== 'string' || typeof item.id !== 'string' || !item.id)
            throw Error('CloudItem invalide');

        // Fournisseurs prévus mais pas encore configurés
        if (item.mode === 'nc' || item.mode === 'ls')
            throw Error(`Le fournisseur ${item.mode} est réservé mais non configuré`);

        if (item.mode !== 'gd')
            throw Error(`Fournisseur cloud inconnu: ${item.mode}`);

        // Avant : https://drive.google.com/uc?export=download&id=<ID>
        // Maintenant : passage par le Worker (lecture en continu, compatible Safari)
        return WORKER_BASE + '/audio/' + encodeURIComponent(item.id);
    }

    // Mêmes noms globaux qu'avant : mael_scan.js et mp3_fetch.js restent inchangés
    g.build_url = build_url;
    g.construire_url = build_url;

})(globalThis);
