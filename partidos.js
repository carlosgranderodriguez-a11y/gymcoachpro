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
        }}
    ]
  }
};
