/* tts_player.py — contrat navigateur */
(function(g){class TtsPlayer{static _speed_factor(speed){return Math.max(0,Math.min(2,speed/100))}synthesize(text,lang,speed=100){throw Error('NotImplementedError')}}g.TtsPlayer=TtsPlayer})(globalThis);
