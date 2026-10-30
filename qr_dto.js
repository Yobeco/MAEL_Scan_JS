/* qr_dto.py — objets de transport immuables */
(function(g){
class RawQr { constructor(text,position=null,format='QRCode',ec_level=null){Object.assign(this,{text,position,format,ec_level});}
 get center_y(){return this.position?.top_left ? (this.position.top_left.y+this.position.bottom_left.y)/2 : (this.position?.center_y ?? 0)}
 get height(){return this.position?.top_left ? Math.abs(this.position.bottom_left.y-this.position.top_left.y) : (this.position?.height ?? 0)}
 get left_x(){return this.position?.top_left?.x ?? this.position?.left_x ?? 0} }
class TtsItem {constructor(raw,original,text,lang,mode){Object.assign(this,{raw,original,text,lang,mode});}}
class CloudItem {constructor(raw,mode,id,text){Object.assign(this,{raw,mode,id,text});}}
class WifiItem {constructor(raw,mode,type,ssid,password='',hide=false,text='Wifi'){Object.assign(this,{raw,mode,type,ssid,password,hide,text});}}
class TtsSetup {constructor(item,mode,lang,to_pronounce=[],to_show='',list_gds=[]){Object.assign(this,{item,mode,lang,to_pronounce,list_gds,to_show});} get ok(){return this.lang!==null&&this.lang!==undefined} to_dict(){return {settings:{lang:this.lang},to_pronounce:[...this.to_pronounce],to_show:this.to_show}}}
Object.assign(g,{RawQr,TtsItem,CloudItem,WifiItem,TtsSetup});})(globalThis);
