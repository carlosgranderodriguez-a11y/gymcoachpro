/* ============================================================
   MC LAB · lectura del «Informe general» de partido (PDF imagen)
   mclabParse(words, W, H, nombreAtleta) recibe las palabras que da el
   OCR ({text, x0, y0, x1, y1} en píxeles de una imagen de W×H) y
   devuelve los datos del jugador para la pestaña Partidos:
   {jornada, fechaISO, min, m:{dt,hsr,sprint,esf28,v28,acc,dec,vmax}, avisos:[]}
   Lo usan index.html (botón «Subir informe PDF») y las pruebas.
   ============================================================ */
(function(root){
  var MESES={enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,setiembre:8,octubre:9,noviembre:10,diciembre:11};
  function norm(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();}
  function limpia(s){return norm(s).replace(/[^a-z0-9>.,*]/g,'');}
  // número con formato español: 10.884 · 30,6 · 254
  function num(t){
    var s=String(t||'').replace(/[Oo]/g,'0').replace(/[^0-9.,]/g,'');
    if(!s||!/\d/.test(s))return null;
    if(/^\d{1,3}(\.\d{3})+$/.test(s))return {v:Number(s.replace(/\./g,'')),dec:false};
    if(/^\d+,\d+$/.test(s))return {v:Number(s.replace(',','.')),dec:true};
    if(/^\d+\.\d$/.test(s))return {v:Number(s),dec:true};
    if(/^\d+$/.test(s))return {v:Number(s),dec:false};
    return null;
  }
  function cx(w){return (w.x0+w.x1)/2;}
  function cy(w){return (w.y0+w.y1)/2;}

  function mclabParse(words,W,H,nombre){
    var avisos=[];
    var ws=words.filter(function(w){return w.text&&String(w.text).trim();}).map(function(w){
      return {t:String(w.text).trim(),n:limpia(w.text),x0:w.x0,y0:w.y0,x1:w.x1,y1:w.y1};
    });
    var toks=norm(nombre).split(/\s+/).filter(Boolean);
    var nom=toks[0]||'',ape=toks[1]||'';
    var out={jornada:'',fechaISO:'',min:null,m:{},avisos:avisos};

    // ── cabecera: «J12 · Partido · Partido · viernes, 13 de noviembre de 2026»
    var cab=ws.filter(function(w){return w.y0<H*0.06;}).sort(function(a,b){return Math.abs(cy(a)-cy(b))<H*0.003?a.x0-b.x0:cy(a)-cy(b);});
    for(var i=0;i<cab.length;i++){
      if(!out.jornada&&/^j[0-9o]{1,2}$/.test(cab[i].n))out.jornada='J'+String(+cab[i].n.slice(1).replace(/o/g,'0')).padStart(2,'0');
      var mes=MESES[cab[i].n.replace(/[^a-z]/g,'')];
      if(mes!=null){
        var dia=null,anio=null;
        for(var k=i-1;k>=Math.max(0,i-3);k--){var d=num(cab[k].t);if(d&&!d.dec&&d.v>=1&&d.v<=31){dia=d.v;break;}}
        for(var k2=i+1;k2<=Math.min(cab.length-1,i+3);k2++){var y=num(cab[k2].t);if(y&&y.v>2000&&y.v<2100){anio=y.v;break;}}
        // la fecha del partido va precedida del día de la semana (la de arriba a la derecha es la del informe)
        var prev=cab.slice(Math.max(0,i-4),i).map(function(x){return x.n;}).join(' ');
        var conDia=/lunes|martes|miercoles|jueves|viernes|sabado|domingo/.test(prev);
        if(dia&&anio&&(conDia||!out.fechaISO))out.fechaISO=anio+'-'+String(mes+1).padStart(2,'0')+'-'+String(dia).padStart(2,'0');
      }
    }

    // ── tarjeta del jugador (parte de arriba): Duración · Distancia total · Alta intensidad · Vel. máxima
    var nomW=ws.filter(function(w){return w.n.replace(/[^a-z]/g,'')===nom&&w.y0<H*0.4;});
    var tarjeta=null;
    nomW.forEach(function(w){
      if(tarjeta)return;
      var a=ws.find(function(x){return x.n.replace(/[^a-z]/g,'')===ape&&Math.abs(x.y0-w.y0)<H*0.006&&x.x0>w.x0&&x.x0-w.x1<W*0.03;});
      if(a)tarjeta=w;
    });
    var card={},cardBoxes={};
    if(tarjeta){
      var X0=tarjeta.x0-W*0.04,X1=tarjeta.x0+W*0.075,Y0=tarjeta.y0,Y1=tarjeta.y0+H*0.05;
      var zona=ws.filter(function(w){return w.x0>=X0&&w.x1<=X1&&w.y0>=Y0&&w.y1<=Y1;});
      var etiquetas={min:/^duraci/,dt:/^total$/,hsr:/^intensidad$/,vmax:/^maxima$/};
      Object.keys(etiquetas).forEach(function(k){
        var et=zona.find(function(w){return etiquetas[k].test(w.n.replace(/[^a-z]/g,''));});
        if(!et)return;
        var hh=et.y1-et.y0;cardBoxes[k]={x0:et.x1+2,x1:X1,y0:et.y0-hh*0.6,y1:et.y1+hh*0.6};
        var cand=zona.filter(function(w){return w.x0>et.x1&&Math.abs(cy(w)-cy(et))<H*0.0025&&num(w.t);}).sort(function(a,b){return a.x0-b.x0;});
        if(cand.length){var v=num(cand[0].t);if(v)card[k]=v.v;}
      });
    }else avisos.push('No encuentro la tarjeta de '+nombre+' en el informe');

    // ── gráficas: columna rotulada «Diego A.» (una por gráfica)
    var etq=[];
    ws.forEach(function(w){
      if(w.n.replace(/[^a-z]/g,'')!==nom||w.y0<H*0.2)return;
      var s=ws.find(function(x){return Math.abs(cy(x)-cy(w))<H*0.003&&x.x0>w.x1&&x.x0-w.x1<W*0.02&&(new RegExp('^'+ape.charAt(0)+'\\.?\\*?$').test(x.n)||x.n.replace(/[^a-z]/g,'')===ape);});
      if(s)etq.push({x:(w.x0+s.x1)/2,y:Math.min(w.y0,s.y0),yb:Math.max(w.y1,s.y1)});
    });
    etq.sort(function(a,b){return a.y-b.y;});
    function tituloY(re1,re2,desde){
      var t=ws.filter(function(w){return re1.test(w.n)&&w.y0>desde;}).filter(function(w){
        if(!re2)return true;return ws.some(function(x){return re2.test(x.n)&&Math.abs(cy(x)-cy(w))<H*0.003&&x.x0>w.x0&&x.x0-w.x1<W*0.12;});
      }).sort(function(a,b){return a.y0-b.y0;});
      return t.length?t[0].y0:null;
    }
    var orden=['dt','hsr','sprint','v28','acc'];
    // filas de etiquetas de las gráficas: muchas palabras tipo «A.» / «D.*» a la misma altura
    var ini=ws.filter(function(w){return w.y0>H*0.2&&/^[a-z]\.\*?$/.test(w.n);}),filas=[];
    ini.forEach(function(w){var f=filas.find(function(x){return Math.abs(x.y-cy(w))<H*0.004;});if(f){f.n++;f.ys.push(w.y0);}else filas.push({y:cy(w),n:1,ys:[w.y0]});});
    filas=filas.filter(function(f){return f.n>=4;}).sort(function(a,b){return a.y-b.y;}).slice(0,5);
    var xs=etq.map(function(e){return e.x;}).sort(function(a,b){return a-b;}),xJug=xs.length?xs[Math.floor(xs.length/2)]:null;
    var cols=[];
    if(xJug!=null&&filas.length===5){
      filas.forEach(function(f,idx){
        var yEt=Math.min.apply(null,f.ys),arriba=idx?filas[idx-1].y+H*0.004:yEt-H*0.16;
        var tit=tituloY(/^(distancia|sprint|super|aceleraciones)$/,null,arriba);
        var techo=(tit!=null&&tit<yEt?tit:arriba+H*0.012)+H*0.013;
        cols.push({g:orden[idx],x:xJug,y0:techo,y1:yEt});
      });
    }else{
      etq.slice(0,5).forEach(function(e,idx){
        var arriba=idx?etq[idx-1].yb:e.y-H*0.16;
        var tit=tituloY(/^(distancia|sprint|super|aceleraciones)$/,null,arriba);
        var techo=(tit!=null&&tit<e.y?tit:arriba+H*0.012)+H*0.013;
        cols.push({g:orden[idx],x:e.x,y0:techo,y1:e.y});
      });
      if(etq.length<5)avisos.push('Solo encuentro '+etq.length+' de 5 gráficas con «'+(toks[0]||'')+' '+(ape.charAt(0)||'').toUpperCase()+'.»');
    }
    out.cols=cols;out.card=card;out.cardBoxes=cardBoxes;out.colAncho=W*0.06;out.tolY=H*0.004;
    return out;
  }

  // Segunda fase: con los números leídos en cada columna ({t, y} en coordenadas de la página) rellena las métricas
  function mclabRellena(loc,colWords,cardWords){
    var out={jornada:loc.jornada,fechaISO:loc.fechaISO,min:null,m:{},avisos:loc.avisos.slice()},card=Object.assign({},loc.card||{});
    // lecturas extra de los números de la tarjeta (recortes ampliados): gana el valor más repetido
    Object.keys(cardWords||{}).forEach(function(k){
      var cnt={},val={};(cardWords[k]||[]).forEach(function(t){var v=num(t);if(!v)return;var key=String(v.v);cnt[key]=(cnt[key]||0)+1;val[key]=v.v;});
      if(card[k]!=null){var k0=String(card[k]);cnt[k0]=(cnt[k0]||0)+1;val[k0]=card[k];}
      var best=Object.keys(cnt).sort(function(a,b){return (cnt[b]-cnt[a])||(b.length-a.length);})[0];
      if(best!=null)card[k]=val[best];
    });
    loc.cols.forEach(function(c){
      // varias lecturas (máscaras y escalas): se agrupan por altura y gana la más repetida (empate: la más larga)
      var lect=(colWords[c.g]||[]).map(function(w){var v=num(w.t);return v?{v:v.v,dec:v.dec,y:w.y,k:String(v.v)+(v.dec?'d':'')}:null;}).filter(Boolean).sort(function(a,b){return a.y-b.y;});
      var grupos=[];
      lect.forEach(function(l){var g=grupos.find(function(x){return Math.abs(x.y-l.y)<(loc.tolY||8);});if(g){g.l.push(l);g.y=(g.y*(g.l.length-1)+l.y)/g.l.length;}else grupos.push({y:l.y,l:[l]});});
      var col=grupos.map(function(g){
        var cnt={};g.l.forEach(function(l){cnt[l.k]=(cnt[l.k]||0)+1;});
        var best=g.l.slice().sort(function(a,b){return (cnt[b.k]-cnt[a.k])||(b.k.length-a.k.length);})[0];
        return {v:best.v,dec:best.dec,y:g.y};
      }).sort(function(a,b){return a.y-b.y;});
      var ent=col.filter(function(x){return !x.dec;}),dec=col.filter(function(x){return x.dec;});
      var g=c.g;
      if(g==='dt'){var big=ent.filter(function(x){return x.v>=500;});if(big.length)out.m.dt=big[big.length-1].v;}
      else if(g==='hsr'){if(ent.length){out.m.hsr=ent[0].v;if(ent.length>=3)out.m.sprint=ent[1].v;}}
      else if(g==='sprint'){if(ent.length){out.m.sprint=ent[ent.length-1].v;if(ent.length>=2)out.m.esf28=ent[ent.length-2].v;}}
      else if(g==='v28'){if(dec.length)out.m.vmax=dec[0].v;if(ent.length)out.m.v28=ent[ent.length-1].v;}
      else if(g==='acc'){if(ent.length>=2){out.m.acc=ent[0].v;out.m.dec=ent[ent.length-1].v;}else if(ent.length===1)out.m.acc=ent[0].v;}
    });
    var RANGO={dt:[1000,16000],hsr:[0,2500],sprint:[0,1500],esf28:[0,80],v28:[0,800],acc:[0,150],dec:[0,150],vmax:[15,40]};
    Object.keys(RANGO).forEach(function(k){var v=out.m[k];if(v!=null&&(v<RANGO[k][0]||v>RANGO[k][1])){out.avisos.push('Valor raro en '+k+' ('+v+'), revísalo');delete out.m[k];}});
    if(out.m.sprint!=null&&out.m.hsr!=null&&out.m.sprint>out.m.hsr)out.avisos.push('Sprint mayor que alta intensidad: revísalo');
    // la tarjeta manda para minutos, distancia, alta intensidad y velocidad máxima; las gráficas lo confirman
    if(card.min!=null)out.min=card.min;
    [['dt','dt'],['hsr','hsr'],['vmax','vmax']].forEach(function(p){
      var c=card[p[0]],g=out.m[p[1]];
      if(c!=null&&g!=null&&Math.abs(c-g)>(p[0]==='vmax'?0.25:Math.max(3,c*0.02)))out.avisos.push('Revisa '+p[1]+': tarjeta '+c+' · gráfica '+g);
      if(c!=null)out.m[p[1]]=c;
    });
    ['dt','hsr','sprint','esf28','v28','acc','dec','vmax'].forEach(function(k){if(out.m[k]==null)out.avisos.push('Falta '+k);});
    if(!out.fechaISO)out.avisos.push('No leo la fecha del partido');
    return out;
  }
  root.mclabParse=mclabParse;root.mclabRellena=mclabRellena;root.mclabNum=num;
  if(typeof module!=='undefined')module.exports={mclabParse:mclabParse,mclabRellena:mclabRellena};
})(typeof window!=='undefined'?window:this);
