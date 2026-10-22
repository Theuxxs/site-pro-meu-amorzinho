(function(){
var $=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var M=[{n:"Repouso",t:62,c:0,e:.03,x:"Frequência estável. Bom momento para respirar fundo e hidratar."},
{n:"Caminhada",t:98,c:105,e:.2,x:"Ritmo leve. Use esses minutos para soltar as articulações."},
{n:"Aquecimento",t:126,c:130,e:.35,x:"Você entrou na zona 2. Mantenha por 5 minutos antes de subir."},
{n:"Corrida",t:158,c:165,e:.6,x:"Zona 4 sustentada. Respire pelo ritmo e mantenha os ombros soltos."},
{n:"Sprint",t:184,c:195,e:1,x:"Esforço máximo. Segure no máximo 30 segundos e depois desacelere."},
{n:"Recuperação",t:108,c:60,e:.12,x:"A frequência está caindo bem. Caminhe leve até ficar abaixo de 100 bpm."}];
var Z=[["Zona 1","Leve"],["Zona 2","Gordura"],["Zona 3","Aeróbica"],["Zona 4","Limiar"],["Zona 5","Máximo"]],ZC=["--z1","--z2","--z3","--z4","--z5"];
var SEQ=[[2,10],[3,12],[4,12],[3,8],[4,12],[5,12]];
var cur=0,bpm=62,age=28,tz=[0,0,0,0,0],kc=0,st=0,sec=0,sumA=0,lo=999,pk=0,z5=0,A=null,S=null,last=performance.now();
function mx(){return 220-age}
function zone(b){var p=b/mx();return p<.6?0:p<.7?1:p<.8?2:p<.9?3:4}
function fmt(s){return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0")}
function pad(n){return String(n).padStart(2,"0")}
function setMode(i){cur=i;$$(".modes button").forEach(function(b,j){b.setAttribute("aria-pressed",j==i)});$("#co").textContent=M[i].x}
var mb=$(".modes");M.forEach(function(m,i){var b=document.createElement("button");b.textContent=m.n;b.onclick=function(){if(A)endAuto(true);setMode(i)};mb.appendChild(b)});setMode(0);
$("#zb").innerHTML=Z.map(function(z,i){return '<div style="--c:var('+ZC[i]+')">'+z[0]+'<b>0:00</b></div>'}).join("");
$("#hm").innerHTML=Array.apply(null,Array(30)).map(function(_,i){return '<i class="'+["g","g","p","n","g"][(i*7+3)%5]+'"></i>'}).join("");
$("#bars").innerHTML=Array.apply(null,Array(34)).map(function(_,i){return '<i style="background:'+(i<9?"#e7e8ec":"hsl(217,85%,"+(88-(i-9)*1.45)+"%)")+'"></i>'}).join("");
$("#age").oninput=function(){age=+this.value;$("#ageV").textContent=age;$("#mx").textContent=mx();ranges()};
$$(".pn button").forEach(function(b){b.onclick=function(){$$(".pn button").forEach(function(x){x.classList.toggle("on",x==b)});$("#v1").hidden=b.dataset.v!="v1";$("#v2").hidden=b.dataset.v!="v2"}});
function g(x,c,w,a){return a*Math.exp(-Math.pow(x-c,2)/(2*w*w))}
function wave(p){return g(p,.16,.025,.13)+g(p,.27,.008,-.13)+g(p,.3,.01,1)+g(p,.335,.01,-.26)+g(p,.55,.04,.24)}
var cv=$("#ecg"),cx=cv.getContext("2d"),W=0,H=0,buf=[],ph=0,SP=110,acc=0;
function size(){var d=window.devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);buf=new Array(Math.ceil(W)).fill(0)}
size();window.addEventListener("resize",size);
function startAuto(){A={i:0,t:0};tz=[0,0,0,0,0];kc=0;st=0;S={n:0,s:0,pk:0};$("#sm").hidden=true;setMode(SEQ[0][0]);$("#auto").textContent="Parar treino"}
function endAuto(cancel){var s=S;A=null;$("#auto").textContent="Treino completo";if(cancel||!s.n)return;
var tot=tz.reduce(function(a,b){return a+b},0)||1,eff=Math.min(100,Math.round(tz.reduce(function(a,b,i){return a+b*(i+1)},0)/(tot*5)*125));
$("#sm").innerHTML='<h3>Resumo do treino</h3><div class="sg"><div><span>Duração</span><b>'+fmt(s.n)+'</b></div><div><span>Calorias</span><b>'+Math.round(kc)+' kcal</b></div><div><span>Pico</span><b>'+s.pk+' bpm</b></div><div><span>Média</span><b>'+Math.round(s.s/s.n)+' bpm</b></div><div><span>Esforço</span><b>'+eff+'/100</b></div></div><div class="zr">'+tz.map(function(v,i){return v?'<i style="--c:var('+ZC[i]+');flex:'+v+'" title="'+Z[i][0]+'"></i>':""}).join("")+'</div><p>'+(eff>70?"Treino pesado. Priorize sono e hidratação hoje.":"Boa carga. Você pode repetir amanhã com segurança.")+'</p>';
SCORE++;paintDots();$("#sm").hidden=false;$("#sm").scrollIntoView({behavior:"smooth",block:"nearest"});setMode(5)}
$("#auto").onclick=function(){A?endAuto(true):startAuto()};
function frame(now){var dt=Math.min(.1,(now-last)/1000);last=now;var m=M[cur];
var tgt=m.t+(mx()-192)*m.e*.9+Math.sin(now/1700)*2.2+Math.sin(now/530)*1.1;
bpm+=(tgt-bpm)*Math.min(1,dt*.35);
acc+=dt*SP;var n=Math.floor(acc);acc-=n;
for(var i=0;i<n;i++){ph+=bpm/60/SP;if(ph>=1)ph-=1;buf.shift();buf.push(wave(ph)+(Math.random()-.5)*.02)}
cx.clearRect(0,0,W,H);cx.beginPath();
for(var x=0;x<buf.length;x++){var y=H*.68-buf[x]*H*.55;x?cx.lineTo(x,y):cx.moveTo(x,y)}
cx.strokeStyle="#FF5B2E";cx.lineWidth=2.2;cx.lineJoin="round";cx.shadowColor="#FF5B2E";cx.shadowBlur=8;cx.stroke();cx.shadowBlur=0;
var b=Math.round(bpm);$("#bpm").textContent=b;$("#bBpm").textContent=b;$("#hpv").textContent=b;
$("#hp").style.left=Math.max(8,Math.min(92,(bpm-50)/150*100))+"%";
requestAnimationFrame(frame)}
requestAnimationFrame(frame);
setInterval(function(){sec++;var m=M[cur],z=zone(bpm),b=Math.round(bpm);tz[z]++;
kc+=Math.max(.9,(bpm-55)*.095)/60;st+=m.c/60;sumA+=bpm;lo=Math.min(lo,b);pk=Math.max(pk,b);
z5=z==4?z5+1:0;$("#al").hidden=z5<5;$("#band").classList.toggle("vib",z5>=5);
if(z5>=5)$("#al").textContent="Você está há "+z5+"s na zona 5. Desacelere para proteger o coração.";
$("#avg").textContent=Math.round(sumA/sec);$("#lo").textContent=lo;$("#pk").textContent=pk;
var hv=Math.max(18,92-(bpm-60)*.5+Math.sin(sec/3)*3),o2=98.4-(bpm>150?1.4:0)+Math.sin(sec/5)*.5,tp=33.8+(bpm-60)*.025;
$("#o2").textContent=Math.round(o2);$("#tp").textContent=tp.toFixed(1).replace(".",",");$("#hv").textContent=Math.round(hv);
$("#kc").textContent=Math.round(kc);$("#st2").textContent=Math.round(st).toLocaleString("pt-BR");$("#ds").textContent=(st*.00078).toFixed(2).replace(".",",");
$("#asp").textContent=Math.round(st).toLocaleString("pt-BR");$("#zn").textContent=Z[z][0]+" · "+Z[z][1];$("#zn").style.color="var("+ZC[z]+")";$("#bZone").textContent=Z[z][0];
$("#bHeart").style.animationDuration=(60/bpm).toFixed(2)+"s";
$$("#zb div").forEach(function(d,k){d.classList.toggle("on",k==z);d.querySelector("b").textContent=fmt(tz[k])});
$("#bClock").textContent=CFG.bandLabel;
if(A){S.n++;S.s+=b;S.pk=Math.max(S.pk,b);A.t++;if(A.t>=SEQ[A.i][1]){A.i++;A.t=0;if(A.i>=SEQ.length)endAuto(false);else setMode(SEQ[A.i][0])}}
},1000);
var CFG=window.FIXIA||{launchDate:"2026-10-29T00:00:00-03:00",launchLabel:"29 de outubro",bandLabel:"qui 29 out"};
var T=new Date(CFG.launchDate),SCORE=13;
function cd(){var d=Math.ceil((T-new Date())/864e5),t=d>1?"faltam "+d+" dias":d==1?"falta 1 dia":d==0?"é hoje":"já lançada";$$(".cdd").forEach(function(e){e.textContent=t});$$(".cdl").forEach(function(e){e.textContent=CFG.launchLabel})}
cd();setInterval(cd,60000);
function paintDots(){var o="";for(var i=0;i<84;i++){var r=6-Math.floor(i/12),c=i%12;o+="<i"+(r*12+c<SCORE?' class="l"':"")+"></i>"}$("#dg").innerHTML=o;$("#asn").textContent=SCORE}
paintDots();
function ranges(){$$(".rng").forEach(function(e){e.textContent=Math.round(mx()*e.dataset.a)+" a "+Math.round(mx()*e.dataset.b)+" bpm"})}
ranges();
$$(".mb").forEach(function(b){b.onclick=function(){var m=b.nextElementSibling;m.hidden=!m.hidden;b.setAttribute("aria-expanded",String(!m.hidden));b.textContent=m.hidden?"Saiba mais":"Mostrar menos"}});
if("IntersectionObserver" in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)$$(".dock nav a").forEach(function(a){a.classList.toggle("on",a.dataset.s==e.target.id)})})},{rootMargin:"-40% 0px -50% 0px"});["topo","demo","app","planos"].forEach(function(i){io.observe($("#"+i))})}
$("#go").onclick=function(){var e=$("#em").value.trim(),ok=/^\S+@\S+\.\S+$/.test(e);$("#ok").textContent=ok?"Pronto! Você está na lista da FIX.IA.":"Digite um e-mail válido para entrar na lista.";$("#ok").style.color=ok?"var(--z2)":"var(--z5)"};
})();
