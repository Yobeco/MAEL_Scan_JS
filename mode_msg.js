/* mode_msg.py — accès aux tables traductions */
(function(g){
const MsgKey=Object.freeze({MODE_CACHER:'Mode cacher',MODE_DICTER:'Mode dicter',MODE_EPELER:'Mode Epeler',MODE_EPELER_NON_IMPLEMENTE:'Mode epeler non implemente',MODE_EPELER_EMOJI:'Mode epeler emoji',MODE_MP3_TELECHARGEMENT:'Mode mp3 telechargement ',MODE_MP3_ERREUR:'Mode mp3 erreur ',LANGUE_INCONNUE:'Langue inconnue',MODE_INCONNU:'Mode non géré'});
function short(l){return l?(l.length>=2?l.slice(0,2).toLowerCase():l.toLowerCase()):'fr'}
function has_message(key,lang){key=key instanceof String?String(key):key;return !!lang&&Object.hasOwn(g.traductions?.[short(lang)]||{},key)}
function get_mode_message(key,lang){key=String(key);let l=short(lang),table=g.traductions?.[l]||g.traductions?.fr||{};return table[key]??g.traductions?.fr?.[key]??key}
g.MsgKey=MsgKey;g.has_message=has_message;g.get_mode_message=get_mode_message;})(globalThis);
