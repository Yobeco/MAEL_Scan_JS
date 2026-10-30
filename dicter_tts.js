/* dicter_tts.py — tokenisation et groupes de souffle */
(function(g){
const COMPOSES_PAR_LANGUE={fr:['au fur et à mesure','à moins que','à cause de','au-dessus de','en face de','tout de suite','ainsi que','alors que','après que','attendu que','aussitôt que','autant que','avant que','bien que','cependant que','dès que','de même que','de sorte que','depuis que','grâce à','parce que',"parce qu'il'","parce qu'ils'","parce qu'elle","parce qu'elles'","parce qu'on'",'pendant que','pourvu que','selon que','si bien que','tant que','tandis que','vu que','en effet','peu à peu','de temps en temps']};
const WORD="[\\p{L}\\p{N}_\\p{M}]+(?:['’ʼ][\\p{L}\\p{N}_\\p{M}]+)*(?:[-‐‑][\\p{L}\\p{N}_\\p{M}]+(?:['’ʼ][\\p{L}\\p{N}_\\p{M}]+)*)*";
function _tokens(t){return t.match(new RegExp(`${WORD}|…|\\.{3,}|[^\\p{L}\\p{N}_\\p{M}\\s]`,'gu'))||[]}
function decouper_gds(texte,langue='fr'){if(!texte)return[];const ref=(langue||'fr').slice(0,2).toLowerCase(),comp=COMPOSES_PAR_LANGUE[ref]||[];if(!comp.length)return _tokens(texte);
const escaped=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\\ /g,'\\s+');const re=new RegExp(`(?<![\\p{L}\\p{N}_])(?:${[...comp].sort((a,b)=>b.length-a.length).map(escaped).join('|')})(?![\\p{L}\\p{N}_])`,'giu');let result=[],start=0,m;while((m=re.exec(texte))){result.push(..._tokens(texte.slice(start,m.index)),m[0]);start=m.index+m[0].length;}result.push(..._tokens(texte.slice(start)));return result;}
g.COMPOSES_PAR_LANGUE=COMPOSES_PAR_LANGUE;g._tokens=_tokens;g.decouper_gds=decouper_gds;g.split_gds=decouper_gds;})(globalThis);
