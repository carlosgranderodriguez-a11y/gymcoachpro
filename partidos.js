/* ============================================================
   PARTIDOS · histórico de datos de partido por atleta (MC LAB)
   Lo leen atleta.html (pestaña "Partidos") e index.html (tarjeta).

   Para añadir un partido nuevo: copia el último bloque de "partidos"
   del atleta, pégalo DESPUÉS (el más reciente va al final) y cambia
   los valores. Cada métrica: {v: valor, p: % respecto al POC, st: ok|warn|bad}
   (p y st son opcionales: si el informe no los trae, se omiten; las métricas que falten se pueden omitir)
   Claves: dt distancia total · hsr alta intensidad · v28 distancia >28 km/h
           acc aceleraciones · sprint · esf28 esfuerzos >28
           dec deceleraciones · vmax velocidad máx. (km/h) · hmld HMLD

   CALENDARIO: cada partido aparece solo en su día (fecha) con el rival.
   Sesiones de fuerza: añade en "fuerza" {fecha:'lunes 19 oct 2026', sesion:'Fuerza tren inferior', nota:'opcional'}
   (misma forma de fecha que los partidos: 'día-semana d mes aaaa')
   ============================================================ */
window.PARTIDOS={
  'diego-aguado':{
    // Minutos de partidos anteriores al histórico (solo se conocen los minutos)
    minutosPrevios:[65,102,99,82],
    fuerza:[
      // Formato: {fecha, sesion, nota, fatigaPre, fatigaPost, bloques:[{n:'Bloque', series:3, ej:[{n:'Ejercicio', r:'6-8'}]}]}
      {fecha:'miércoles 21 oct 2026', sesion:'Fuerza', nota:'Fatiga 3-4 → 5-6', fatigaPre:'3-4', fatigaPost:'5-6',
        bloques:[
          {n:'Movilidad', ej:[{n:'90/90'},{n:'Dorsiflexión de tobillo en posición de caballero'},{n:'Rotaciones torácicas en posición de caballero lateral'}]},
          {n:'Activación', series:2, ej:[{n:'Dead bug'},{n:'Puente unilateral'}]},
          {n:'Fuerza 1', series:3, ej:[{n:'Abductor en fitball',r:'8-10'},{n:'Triple extensión desde zancada',r:'6-8'}]},
          {n:'Fuerza 2', series:3, ej:[{n:'Zancada estática a bloque de yoga (7,5 kg/lado)',r:'6-8'},{n:'Lanzamiento de balón medicinal en semi split con rotación hacia pie adelantado',r:'6-8'},{n:'Pallof press',r:'6-8'}]},
          {n:'Jumps and drops', series:2, ej:[{n:'Salto horizontal + salto lateral con estabilización unilateral',r:'4-6'},{n:'Drop de pie unilateral',r:'4-6'}]}
        ]},
    ],
    partidos:[
      {id:'j07',jornada:'J07',partido:'UD Ibiza – RM Castilla',fecha:'viernes 9 oct 2026',min:96,carga:'Alta',
        m:{
          dt:{v:10891,p:101,st:'ok'},
          hsr:{v:598,p:81,st:'bad'},
          v28:{v:59,p:56,st:'bad'},
          acc:{v:35,p:117,st:'ok'},
          sprint:{v:234,p:63,st:'bad'},
          esf28:{v:5,p:71,st:'bad'},
          dec:{v:59,p:109,st:'ok'},
          vmax:{v:31.4,p:95,st:'warn'},
          hmld:{v:3288,p:96,st:'ok'}
        }},
      // J08: Informe general + sprint, esfuerzos, acel. y decel. dados por Carlos. Faltan v28, HMLD y los % POC: completar con el Match Day Report
      {id:'j08',jornada:'J08',partido:'RM Castilla vs Antequera',fecha:'domingo 18 oct 2026',min:99,carga:'',
        m:{
          dt:{v:10621},
          hsr:{v:661},
          sprint:{v:273},
          esf28:{v:19},
          acc:{v:30},
          dec:{v:54},
          vmax:{v:31.2}
        }},
      // J09: Informe general MC LAB (26 oct 2026). Rival Algeciras, derrota 2-0. Faltan HMLD y los % POC: completar con el Match Day Report
      // esf28 = esfuerzos >24 km/h según el informe (28). v28 = distancia >28 km/h (80 m)
      {id:'j09',jornada:'J09',partido:'RM Castilla vs Algeciras · Derrota 2-0',rival:'Algeciras',resultado:'Derrota 2-0',fecha:'sábado 24 oct 2026',min:96,carga:'',
        m:{
          dt:{v:10473},
          hsr:{v:922},
          v28:{v:80},
          sprint:{v:482},
          esf28:{v:28},
          acc:{v:24},
          dec:{v:45},
          vmax:{v:32.1}
        }},
      // J10-J12: Informe general MC LAB. J10 Castilla 2-0 Cartagena (31 oct, Di Stéfano) · J11 Castilla 2-2 Hércules (8 nov, Di Stéfano) · J12 Gimnàstic 0-1 Castilla (13 nov, Tarragona). Faltan HMLD y % POC
      // sprint = distancia >24 km/h · esf28 = esfuerzos >24 km/h · v28 = super sprint >28 km/h · acc/dec >3 m/s²
      {id:'j10',jornada:'J10',partido:'RM Castilla vs Cartagena · Victoria 2-0',rival:'Cartagena',resultado:'Victoria 2-0',fecha:'sábado 31 oct 2026',min:101,carga:'',
        m:{
          dt:{v:11135},
          hsr:{v:650},
          v28:{v:46},
          sprint:{v:287},
          esf28:{v:21},
          acc:{v:20},
          dec:{v:34},
          vmax:{v:30.3}
        }},
      {id:'j11',jornada:'J11',partido:'RM Castilla vs Hércules · Empate 2-2',rival:'Hércules',resultado:'Empate 2-2 · gol de Diego (59\')',fecha:'domingo 8 nov 2026',min:102,carga:'',
        m:{
          dt:{v:11305},
          hsr:{v:704},
          v28:{v:27},
          sprint:{v:246},
          esf28:{v:21},
          acc:{v:39},
          dec:{v:48},
          vmax:{v:30.7}
        }},
      {id:'j12',jornada:'J12',partido:'Gimnàstic – RM Castilla · Victoria 0-1',rival:'Gimnàstic de Tarragona',resultado:'Victoria 0-1',fecha:'viernes 13 nov 2026',min:99,carga:'',
        m:{
          dt:{v:10884},
          hsr:{v:645},
          v28:{v:26},
          sprint:{v:254},
          esf28:{v:20},
          acc:{v:24},
          dec:{v:42},
          vmax:{v:30.6}
        }}
    ]
  }
};
