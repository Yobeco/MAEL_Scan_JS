/* mael_scan.py — orchestrateur scan / actions séquentielles navigateur */
(function(g){
class MaelScan{
    constructor({speech=new g.SpeechController(),scanner=null,reader=null,on_audio_status=null}={}){
        Object.assign(this,{speech,scanner:scanner||g.create_scanner('web',{videoEl:document.getElementById('qr-video'),onResult:raws=>this.handleRaw(raws)}),reader:reader||g.create_mp3_reader(),on_audio_status,tts_setup_builder:new g.TtsSetupBuilder(),last_tts_item:null,last_tts_setup:null});
        this.onItems=null;
    }
    scan(source=null){return this.scanner.scan(source)}
    handleRaw(raws){
        let items=g.parse_all(raws);
        for(const item of items){
            if(item instanceof g.TtsItem){
                this.last_tts_item=item;
                this.last_tts_setup=this.tts_setup_builder.build(item);
                this.on_audio_status?.(this.last_tts_setup);
                this.speech.speakSegments(this.last_tts_setup.to_pronounce,g.TtsPlayer._speed_factor(100),this.last_tts_setup.lang||'fr-FR');
            }else if(item instanceof g.WifiItem){
                this.last_tts_setup=new g.TtsSetup(item,'lire','fr',['Code QR Wifi'],'Code QR Wifi',['Code QR Wifi']);
                new g.WifiSetup().apply(item);
                this.speech.speak('Code QR Wifi',1,'fr-FR');
                this.on_audio_status?.(this.last_tts_setup);
            }else if(item instanceof g.CloudItem){
                this.speech.cancel();
                if(g.speechSynthesis) g.speechSynthesis.cancel();
                this.last_tts_setup=new g.TtsSetup(item,'lire','fr',[],item.text);
                this.on_audio_status?.(this.last_tts_setup);
                try {
                    const url=g.build_url(item);
                    this.reader.play(url).catch(error=>{
                        if(error?.message==='Lecture MP3 arrêtée.') return;
                        this.last_tts_setup.to_show=`⚠ ${error?.message||'Erreur de lecture MP3.'}`;
                        this.on_audio_status?.(this.last_tts_setup);
                    });
                } catch(error) {
                    this.last_tts_setup.to_show=`⚠ ${error?.message||'Erreur de lecture MP3.'}`;
                    this.on_audio_status?.(this.last_tts_setup);
                }
            }
        }
        this.onItems?.(items);
        return items;
    }
    stop(){this.scanner.stop();this.speech.cancel();this.reader.stop()}
    repeat(slow=false){if(!this.last_tts_setup)return;this.speech.speakSegments(this.last_tts_setup.to_pronounce,slow?0.8:1,this.last_tts_setup.lang||'fr-FR')}
    repeat_slow(){this.repeat(true)}
}
g.MaelScan=MaelScan;
})(globalThis);
