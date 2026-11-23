import{mkdirSync as M,readFileSync as R,readdirSync as D,writeFileSync as W}from'node:fs';
import{join as J}from'node:path';
let A=process.env.MAKEFUN_INPUT_DIR??'/input',B=process.env.MAKEFUN_OUTPUT_DIR??'/output';
function run(p,q){
let s=new Int32Array(256),m=new Int32Array(256),c=new Int32Array(64),o=Buffer.alloc(65536),n=p.length,x=0,r=0,P=0,t=0,d=0,l=0;
try{for(;;){
if(++t>1e6)throw 10;
if(P<0||P>=n)throw 9;
let v=p[P];
if(v>15&&v<31||v>31&&v<35){
if(v==23||v==27){if(x<1)throw 2;s[x-1]=v==23?-s[x-1]:~s[x-1];P++;continue}
if(x<2)throw 2;
let a=s[x-2],b=s[x-1],z;
switch(v){
case 16:z=a+b|0;break;
case 17:z=a-b|0;break;
case 18:z=Math.imul(a,b);break;
case 19:if(!b)throw 4;z=~~(a/b);break;
case 20:if(!b)throw 4;z=a%b;break;
case 21:if(!b)throw 4;z=~~((a>>>0)/(b>>>0));break;
case 22:if(!b)throw 4;z=(a>>>0)%(b>>>0)|0;break;
case 24:z=a&b;break;
case 25:z=a|b;break;
case 26:z=a^b;break;
case 28:z=a<<(b&31);break;
case 29:z=a>>(b&31);break;
case 30:z=a>>>(b&31)|0;break;
case 32:z=a==b?1:0;break;
case 33:z=a<b?1:0;break;
default:z=(a>>>0)<(b>>>0)?1:0}
s[x-2]=z;x--;P++;continue}
switch(v){
case 0:throw 0;
case 1:if(P+1>=n)throw 9;if(x>255)throw 3;let b=p[P+1];s[x++]=b<128?b:b-256;P+=2;break;
case 2:if(P+4>=n)throw 9;if(x>255)throw 3;s[x++]=p[P+1]|p[P+2]<<8|p[P+3]<<16|p[P+4]<<24;P+=5;break;
case 3:if(x<1)throw 2;x--;P++;break;
case 4:case 6:{let k=v==4?1:2;if(x<k)throw 2;if(x>255)throw 3;s[x]=s[x-k];x++;P++;break}
case 5:if(x<2)throw 2;let w=s[x-1];s[x-1]=s[x-2];s[x-2]=w;P++;break;
case 7:if(x<3)throw 2;let u=s[x-3];s[x-3]=s[x-2];s[x-2]=s[x-1];s[x-1]=u;P++;break;
case 48:case 49:case 50:{if(P+2>=n)throw 9;let g=v==48;if(!g){if(x<1)throw 2;let w=s[--x];g=v==49?w==0:w!=0}let f=p[P+1]|p[P+2]<<8;if(f>32767)f-=65536;P+=3+(g?f:0);break}
case 51:if(P+2>=n)throw 9;if(r>63)throw 7;c[r++]=P+3;P=p[P+1]|p[P+2]<<8;break;
case 52:if(r<1)throw 8;P=c[--r];break;
case 64:case 65:{if(x<(v==64?1:2))throw 2;let a=s[x-1];if(a<0||a>255)throw 6;if(v==64){s[x-1]=m[a];P++}else{m[a]=s[x-2];x-=2;P++}break}
case 80:{if(x<1)throw 2;let w=String(s[--x]);if(l+w.length>65536)throw 11;for(let i=0;i<w.length;i++)o[l++]=w.charCodeAt(i);P++;break}
case 81:if(x<1)throw 2;if(l>65535)throw 11;o[l++]=s[--x]&255;P++;break;
case 82:if(x>255)throw 3;s[x++]=d<q.length?q[d++]:-1;P++;break;
case 83:if(x<1)throw 2;throw s[--x]&255;
default:throw 5}
}}catch(e){if(typeof e!='number')throw e;return[o.subarray(0,l),e]}}
for(let id of D(A).sort()){let p=R(J(A,id,'program.bin')),q=Buffer.alloc(0);try{q=R(J(A,id,'input.bin'))}catch{}let[y,z]=run(p,q);M(J(B,id),{recursive:true});W(J(B,id,'stdout.bin'),y);W(J(B,id,'exit.txt'),z+'\n')}
