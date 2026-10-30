/* tts_setup.py — configuration de prononciation */
(function(g){
function _normalize_lang_key(raw){if(raw==null)return null;let x=raw.trim().replace(/^[<>"'«»]+|[<>"'«»]+$/g,'').trim();return x||null}
function _gtts_for_key(key){return g.lang_tts?.[key]?.[1]??null}function _reference_key(k){return k.slice(0,2).toLowerCase()}
function _get_epel_dict(lang){if(!lang)return null;let k=lang.slice(0,2).toLowerCase();return g[`epel_tts_${k}`]||null}
function _is_emoji_code_point(cp){return cp===0x200d||cp===0xfe0f||(cp>=0x1f3fb&&cp<=0x1f3ff)||(cp>=0x1f1e6&&cp<=0x1f1ff)||(cp>=0x1f300&&cp<=0x1faff)||(cp>=0x2600&&cp<=0x27bf)}
function _payload_has_emoji(s){return [...s].some(c=>_is_emoji_code_point(c.codePointAt(0)))}
function _spell(s,d){return [...s].map(c=>Object.hasOwn(d,c)?d[c]:c)}
class TtsSetupBuilder {
_fallback_setup(item,key){let il=_normalize_lang_key(item.lang),ml=il&&Object.hasOwn(g.lang_tts,il)&&g.has_message(key,il)?il:g.FALLBACK_LANG;return new g.TtsSetup(item,g.Mode.LIRE,_gtts_for_key(ml),[' '],g.get_mode_message(key,ml),[ ' ' ]);}
build(item){return this._dispatch(item,this._resolve_lang(_normalize_lang_key(item.lang)))}
_resolve_lang(key){if(key===null)return _gtts_for_key(g.FALLBACK_LANG);let exact=_gtts_for_key(key);if(exact!==null)return exact;let ref=_reference_key(key),fallback=_gtts_for_key(ref);return fallback??null}
_dispatch(item,lang){if(lang===null)return this._fallback_setup(item,g.MsgKey.LANGUE_INCONNUE);
if(item.mode===g.Mode.DICTER){if(_payload_has_emoji(item.text))return this._fallback_setup(item,g.MsgKey.MODE_EPELER_EMOJI);let d=_get_epel_dict(item.lang);if(!d)return this._fallback_setup(item,g.MsgKey.MODE_EPELER_NON_IMPLEMENTE);let groups=g.decouper_gds(item.text,item.lang||'fr'),spoken=groups.map(x=>{if(x==='...'&&Object.hasOwn(d,'…'))return d['…'];if(x&&[...x].every(c=>/^\p{P}$/u.test(c)))return d[x]??x;return x});return new g.TtsSetup(item,item.mode,lang,spoken,g.get_mode_message(g.MsgKey.MODE_DICTER,item.lang),groups)}
if(item.mode===g.Mode.EPELER){if(_payload_has_emoji(item.text))return this._fallback_setup(item,g.MsgKey.MODE_EPELER_EMOJI);let d=_get_epel_dict(item.lang);if(!d)return this._fallback_setup(item,g.MsgKey.MODE_EPELER_NON_IMPLEMENTE);return new g.TtsSetup(item,item.mode,lang,_spell(item.text,d),g.get_mode_message(g.MsgKey.MODE_EPELER,item.lang))}
if(item.mode===g.Mode.LIRE)return new g.TtsSetup(item,item.mode,lang,[item.text],item.text);
if(item.mode===g.Mode.CACHER)return new g.TtsSetup(item,item.mode,lang,[item.text],g.get_mode_message(g.MsgKey.MODE_CACHER,item.lang));return this._fallback_setup(item,g.MsgKey.MODE_INCONNU)} }
Object.assign(g,{_normalize_lang_key,_gtts_for_key,_reference_key,_get_epel_dict,_is_emoji_code_point,_payload_has_emoji,_spell,TtsSetupBuilder});})(globalThis);
