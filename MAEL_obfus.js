/* MAEL_obfus.py — transformation Unicode réversible */
(function(g){
const allowed=/[\p{L}\p{M}\p{N}\p{P}\p{S}\p{Zs}]/u;
function safe(cp){if(cp<0||cp>0x10ffff||(cp>=0xd800&&cp<=0xdfff))return false;return allowed.test(String.fromCodePoint(cp));}
function category(cp){let c=String.fromCodePoint(cp);for(const [p,n] of [[/\p{L}/u,'L'],[/\p{M}/u,'M'],[/\p{N}/u,'N'],[/\p{P}/u,'P'],[/\p{S}/u,'S'],[/\p{Zs}/u,'Zs'],[/\p{Cc}/u,'Cc'],[/\p{Cf}/u,'Cf'],[/\p{Zl}/u,'Zl'],[/\p{Zp}/u,'Zp']])if(p.test(c))return n;return 'Cn'}
function next(cp){while(cp<=0x10ffff&&!safe(cp))cp++;if(cp>0x10ffff)throw Error('No safe Unicode code point');return cp}
function prev(cp){while(cp>=0&&!safe(cp))cp--;if(cp<0)throw Error('No safe Unicode code point');return cp}
class Obfus {static enobfus_excl_dict={}; _check_input(word){let i=0;for(const ch of word){const cp=ch.codePointAt(0);if(!safe(cp))throw Error(`Caractère interdit à la position ${i} (${category(cp)})`);i++;}}
codepoint_shifter(word,shift){if(shift!==1&&shift!==-1)throw Error('shift_value doit être +1 ou -1');return [...word].map(c=>String.fromCodePoint(shift===1?next(c.codePointAt(0)+1):prev(c.codePointAt(0)-1))).join('');}
shuffler(s){let a=[...s],o=[];for(let i=1;i<a.length;i+=2)o.push(a[i]);for(let i=0;i<a.length;i+=2)o.push(a[i]);return o.reverse().join('');}
unshuffler(s){let a=[...s],out=[],h=Math.floor(a.length/2);if(a.length%2===0){for(let i=h-1;i>=0;i--)out.push(a[i],a[i+h]);}else{for(let i=h;i>=0;i--){out.push(a[i]);if(i>0)out.push(a[h+i]);}}return out.join('');}
enobfus(word){this._check_input(word);return this.shuffler(this.codepoint_shifter(word,1));}
deobfus(word){this._check_input(word);return this.unshuffler(this.codepoint_shifter(word,-1));}}
g.Obfus=Obfus;})(globalThis);
