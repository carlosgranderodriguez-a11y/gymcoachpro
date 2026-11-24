/* ============================================================
   CARGA · kg de trabajo a partir de reps + RIR y del máximo del atleta
   Lo usan index.html (planificador, editor de sesiones) y atleta.html.

   % del máximo (1RM) = tabla RTS (RPE = 10 − RIR): con N reps y R repeticiones
   en reserva se usa la fila de N+R reps al fallo.
   Máximo: el vigente de la pestaña Máximos (config «rm::Nombre»); si no hay,
   se estima con las series registradas (Epley, series de 1 a 12 reps).
   ============================================================ */
(function(root){
  //            reps al fallo:  1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19   20
  var PCT=[null,100,95.5,92.2,89.2,86.3,83.7,81.1,78.6,76.2,73.9,70.7,68.0,65.3,62.6,59.9,57.4,55.0,52.7,50.6,48.6];
  function norm(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}
  // «8» · «6-8» (se toma el alto: más reps → menos kg) · «8 c/lado» · «2,5»
  function numReps(v){var m=String(v==null?'':v).replace(',','.').match(/\d+(\.\d+)?/g);if(!m)return null;return Math.max.apply(null,m.map(Number));}
  // RIR «2» · «2-3» (se toma la media)
  function numRir(v){var m=String(v==null?'':v).replace(',','.').match(/\d+(\.\d+)?/g);if(!m)return null;var a=m.map(Number);return a.reduce(function(x,y){return x+y;},0)/a.length;}
  function serie(v,i){var a=String(v==null?'':v).split('/').map(function(x){return x.trim();}).filter(function(x){return x!=='';});if(!a.length)return '';return a[Math.min(i,a.length-1)];}
  function pv(ex,id){var p=((ex&&ex.params)||[]).find(function(q){return q.id===id;});return p?String(p.val==null?'':p.val):'';}

  function pct(reps,rir){
    var r=numReps(reps),q=numRir(rir);
    if(!(r>0)||q==null||q<0)return null;
    var t=r+q;if(t<1||t>20)return null;
    var lo=Math.floor(t),hi=Math.ceil(t),p=lo===hi?PCT[lo]:PCT[lo]+(PCT[hi]-PCT[lo])*(t-lo);
    return Math.round(p*10)/10;
  }
  function redondea(kg){return Math.round(kg*2)/2;} // al medio kilo
  function epley(kg,reps){return (kg>0&&reps>0&&reps<=12)?kg*(1+reps/30):0;}

  // máximo del atleta en el ejercicio → {kg, estimado, origen}
  function rm(ctx,exId){
    var cfg=ctx.config||{},nombre=norm(ctx.nombre),fecha=ctx.fecha||'9999-12-31';
    var key=Object.keys(cfg).find(function(k){return k.indexOf('rm::')===0&&norm(k.slice(4))===nombre;});
    var h=((key&&cfg[key]&&cfg[key][exId])||[]).filter(function(x){return x&&x.kg>0;}).slice().sort(function(a,b){return String(a.f).localeCompare(String(b.f));});
    if(h.length){
      var v=null;h.forEach(function(x){if(!x.f||x.f<=fecha)v=x;});if(!v)v=h[h.length-1];
      return {kg:Number(v.kg),estimado:v.t==='est',origen:'maximo',fecha:v.f};
    }
    // estimación con las últimas sesiones registradas de ese ejercicio
    var regs=(ctx.registros||[]).filter(function(r){return r&&r.datos&&r.datos.ejercicios&&(!r.fecha||r.fecha<=fecha);})
      .sort(function(a,b){return String(b.fecha||'').localeCompare(String(a.fecha||''));});
    var best=0,usadas=0,fEst='';
    for(var i=0;i<regs.length&&usadas<3;i++){
      var hay=false;
      regs[i].datos.ejercicios.forEach(function(er){
        if(!er||er.id!==exId)return;
        (er.sets||[]).forEach(function(st){var e=epley(parseFloat(String(st.load||'').replace(',','.'))||0,parseInt(st.reps,10)||0);if(e>0){hay=true;if(e>best){best=e;fEst=regs[i].fecha;}}});
      });
      if(hay)usadas++;
    }
    return best>0?{kg:Math.round(best*10)/10,estimado:true,origen:'series',fecha:fEst}:null;
  }

  // ejercicio → una fila por serie con %, kg y RIR (solo si tiene RIR; los kg puestos a mano mandan)
  function calc(ex,ctx){
    var rirV=pv(ex,'rir');if(String(rirV).trim()==='')return null;
    var repsV=pv(ex,'reps')||(ex&&ex.reps)||'',n=parseInt(pv(ex,'series')||(ex&&ex.sets),10)||Math.max(1,String(repsV).split('/').length);
    n=Math.min(n,20);
    var m=ctx&&ctx.nombre?rm(ctx,ex.id):null,kgMano=pv(ex,'kg'),series=[];
    for(var i=0;i<n;i++){
      var p=pct(serie(repsV,i),serie(rirV,i)),km=serie(kgMano,i);
      series.push({reps:serie(repsV,i),rir:serie(rirV,i),pct:p,kg:(m&&p!=null)?redondea(m.kg*p/100):null,kgMano:km});
    }
    return {rm:m,series:series};
  }
  // «62,5» o «60/62,5/65» (mismo formato que el resto de parámetros por serie)
  function juntar(arr){var a=arr.map(function(x){return x==null?'':String(x).replace('.',',');});if(a.every(function(x){return x===a[0];}))return a[0]||'';return a.join('/');}

  root.CARGA={pct:pct,rm:rm,calc:calc,juntar:juntar,numReps:numReps,numRir:numRir};
  if(typeof module!=='undefined')module.exports=root.CARGA;
})(typeof window!=='undefined'?window:this);
