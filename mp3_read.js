/* mp3_read.py — lecteur MP3 navigateur via un unique HTMLAudioElement */
(function(g){
    const PLAY_ERROR = 'Lecture MP3 impossible : vérifiez que le fichier Google Drive est partagé publiquement, que son identifiant est valide et que le fichier n’est pas trop volumineux. Drive peut aussi avoir renvoyé une page HTML au lieu du MP3.';

    class Mp3Reader {
        constructor(){
            this.audio = new g.Audio();
            this.is_playing = false;
            this._settle = null;
            this.audio.preload = 'none';
        }

        // À appeler directement dans le geste utilisateur (clic), avant les awaits.
        unlock(){
            this.audio.muted = true;
            let attempt;
            try { attempt = this.audio.play(); } catch (_) { /* navigateur sans lecture automatique */ }
            this.audio.pause();
            try { this.audio.currentTime = 0; } catch (_) {}
            this.audio.muted = false;
            if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
        }

        play(url){
            if(typeof url !== 'string' || !url.trim()) return Promise.reject(new Error('URL MP3 invalide.'));
            this.stop();
            this.audio.pause();
            this.audio.src = url;
            this.audio.currentTime = 0;
            this.is_playing = true;
            return new Promise((resolve,reject)=>{
                let settled = false;
                const cleanup = () => {
                    this.audio.removeEventListener('ended', onEnded);
                    this.audio.removeEventListener('error', onError);
                    if(this._settle === settle) this._settle = null;
                    this.is_playing = false;
                };
                const settle = (fn,value) => {
                    if(settled) return;
                    settled = true;
                    cleanup();
                    fn(value);
                };
                const onEnded = () => settle(resolve, 'ended');
                const onError = () => settle(reject, new Error(PLAY_ERROR));
                this._settle = (reason) => settle(reject, new Error(reason || 'Lecture MP3 interrompue.'));
                this.audio.addEventListener('ended', onEnded, {once:true});
                this.audio.addEventListener('error', onError, {once:true});
                try {
                    const started = this.audio.play();
                    if(started && typeof started.catch === 'function') started.catch(onError);
                } catch (_) { onError(); }
            });
        }

        stop(){
            if(this._settle) this._settle('Lecture MP3 arrêtée.');
            this.audio.pause();
            try { this.audio.currentTime = 0; } catch (_) {}
            this.is_playing = false;
        }

        wait(){ return Promise.resolve(true); }
    }

    function create_mp3_reader(){ return new Mp3Reader(); }
    g.Mp3Reader=Mp3Reader;
    g.create_mp3_reader=create_mp3_reader;
})(globalThis);
