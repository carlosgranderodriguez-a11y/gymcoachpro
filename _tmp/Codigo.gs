// ═══════════════════════════════════════════════════════════
// GYMCOACH PRO — Apps Script Backend v4
// Cambios respecto a v3:
//   - Sección RESISTENCIA reescrita para trabajar POR NOMBRE DE COLUMNA.
//   - 8 columnas nuevas para datos reales de pulsómetro (zonas, TSS, etc).
//   - Las columnas nuevas se crean solas al ejecutar; NO se pierden datos.
//   - Nuevo: syncGarminNow — botón "Sincronizar ahora" del atleta dispara
//     el sync de Garmin bajo demanda, sin esperar al cron diario.
// El resto del fichero es idéntico a la v3.
// ═══════════════════════════════════════════════════════════
var SHEET_ID  = '1Q42xlb2BJZl4y5dPVFJ293zuUlHyFBpt51j9LN4dT_s';
var FOLDER_ID = '114LDPl10mlzycb6AhZo3CYcjFiQvT6FT';

// ── FUNCIÓN DE PRUEBA — ejecútala manualmente para forzar permisos
function probarDrive() {
var folder = DriveApp.getFolderById(FOLDER_ID);
Logger.log('Carpeta de Drive: ' + folder.getName());
var blob = Utilities.newBlob('test', 'text/plain', 'test_permisos.txt');
var file = folder.createFile(blob);
Logger.log('Archivo creado: ' + file.getName() + ' (ID: ' + file.getId() + ')');
file.setTrashed(true);
Logger.log('✅ Drive funciona correctamente');
}

// ── ROUTER GET ───────────────────────────────────────────────
function doGet(e) {
var action = e.parameter.action;
var params = e.parameter;
var result;
try {
var rej = acc_puerta_(action, params, false);
if (rej) result = rej;
else {
if      (action === 'login')          result = login(params.nombre, params.pin);
else if (action === 'loginAtleta')    result = loginAtleta(params.email, params.pin);
else if (action === 'getAtletas')     result = getAtletas();
else if (action === 'getAtletasFull') result = getAtletasFull();
else if (action === 'getEjercicios')  result = getEjercicios();
else if (action === 'getSesiones')    result = getSesiones(params.atleta);
else if (action === 'getAllSesiones') result = getAllSesiones();
else if (action === 'getHistorial')   result = getHistorial(params.atleta);
else if (action === 'getTemplates')   result = getTemplates();
else if (action === 'getConfig')      result = getConfig();
else if (action === 'getResistencia') result = getResistencia();
else if (action === 'getImageBase64') result = getImageBase64(params.fileId);
else if (action === 'getEquipos')     result = getEquipos();
else if (action === 'getWellness')    result = getWellness(params.atleta);
else if (action === 'getPlanExterno') result = getPlanExterno(params.atleta);
else if (action === 'getTemporada')   result = getTemporada(params.atleta);
else if (action === 'syncGarminNow')  result = syncGarminNow(params.atleta);
else if (action === 'getPrograms')    result = getPrograms();
else if (action === 'whoami')           result = whoami_(params);
else if (action === 'getEntrenadores')  result = getEntrenadores_();
else if (action === 'getCompaneros')    result = getCompaneros_();
else result = { ok: false, error: 'Accion no reconocida: ' + action };

result = acc_filtra_(action, result, params);
}
  } catch(err) {
result = { ok: false, error: err.message };
  }
return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

// ── ROUTER POST ──────────────────────────────────────────────
function doPost(e) {
var body, action, result;
try {
body = JSON.parse(e.postData.contents);
action = body.action;
var rej = acc_puerta_(action, body, true);
if (rej) result = rej;
else {
if      (action === 'guardarRegistro') result = guardarRegistro(body);
else if (action === 'addAtleta')       result = addAtleta(body);
else if (action === 'updateAtleta')    result = updateAtleta(body);
else if (action === 'deleteAtleta')    result = deleteAtleta(body);
else if (action === 'addSesion')       result = addSesion(body);
else if (action === 'updateSesion')    result = updateSesion(body);
else if (action === 'deleteSesion')    result = deleteSesion(body);
else if (action === 'addEjercicio')    result = addEjercicio(body);
else if (action === 'updateEjercicio') result = updateEjercicio(body);
else if (action === 'clasificarEjercicios') result = clasificarEjercicios(body);
// ── Generador asistido (definido en IA.gs) ──
else if (action === 'getEstadoAtleta')     result = getEstadoAtleta(body.atleta);
else if (action === 'generarBloqueFuerza') result = generarBloqueFuerzaMotor(body);
else if (action === 'deleteEjercicio') result = deleteEjercicio(body);
else if (action === 'uploadImage')     result = uploadImage(body);
else if (action === 'uploadVideo')     result = uploadVideo(body);
else if (action === 'saveTemplate')    result = saveTemplate(body);
else if (action === 'saveConfig')      result = saveConfig(body);
else if (action === 'addResistencia')  result = addResistencia(body);
else if (action === 'updateResistencia')result = updateResistencia(body);
else if (action === 'deleteResistencia')result = deleteResistencia(body);
else if (action === 'addEquipo')        result = addEquipo(body);
else if (action === 'updateEquipo')     result = updateEquipo(body);
else if (action === 'deleteEquipo')     result = deleteEquipo(body);
else if (action === 'saveWellness')     result = saveWellness(body);
else if (action === 'savePlanExterno')  result = savePlanExterno(body);
else if (action === 'deletePlanExterno')result = deletePlanExterno(body);
else if (action === 'uploadPdf')        result = uploadPdf(body);
else if (action === 'saveSemanaTemporada') result = saveSemanaTemporada(body);
else if (action === 'generarTemporada')    result = generarTemporada(body);
else if (action === 'syncGarminNow')    result = syncGarminNow(body.atleta);
else if (action === 'saveProgram')      result = saveProgram(body);
else if (action === 'deleteProgram')    result = deleteProgram(body);
else if (action === 'cambiarPin')       result = cambiarPin(body);
else if (action === 'saveEntrenador')   result = saveEntrenador_(body);
else if (action === 'loginEntrenador')  result = loginEntrenador_(body);
else if (action === 'cambiarClave')     result = cambiarClave_(body);
else if (action === 'deleteEntrenador') result = deleteEntrenador_(body);
else if (action === 'compartirAtleta')  result = compartirAtleta_(body);
else result = { ok: false, error: 'Accion POST no reconocida: ' + action };

result = acc_despues_(action, body, result);
}
  } catch(err) {
result = { ok: false, error: err.message };
  }
return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

// ── SYNC GARMIN BAJO DEMANDA ──────────────────────────────────
// Dispara el workflow_dispatch de GitHub Actions (repo wearables-hub) para
// sincronizar a un atleta concreto al momento, en vez de esperar al cron
// diario (06:00 UTC). El token nunca llega al navegador del atleta: vive
// solo aquí, en las Propiedades del script.
//
// CONFIGURA UNA VEZ: Editor → ⚙️ Configuración del proyecto → Propiedades
// del script → añade GITHUB_PAT = <fine-grained PAT, repo wearables-hub,
// permiso "Actions: Read and write">.
//
// IMPORTANTE: el valor de "atleta" tiene que coincidir EXACTAMENTE con el
// nombre del GitHub Environment creado en wearables-hub para ese atleta
// (Settings → Environments). Aquí "atleta" es el nombre tal cual está en
// la hoja Atletas (ej. "Carlos Grande"), así que el Environment debe
// llamarse igual.
function syncGarminNow(atletaKey) {
if (!atletaKey) return { ok: false, error: 'Falta el atleta' };

var token = PropertiesService.getScriptProperties().getProperty('GITHUB_PAT');
if (!token) {
return { ok: false, error: 'Falta configurar GITHUB_PAT en las propiedades del script.' };
  }

var url = 'https://api.github.com/repos/carlosgranderodriguez-a11y/wearables-hub/actions/workflows/garmin-sync.yml/dispatches';
var payload = {
ref: 'main',
inputs: { atleta: atletaKey }
  };

var resp = UrlFetchApp.fetch(url, {
method: 'post',
contentType: 'application/json',
headers: {
'Authorization': 'Bearer ' + token,
'Accept': 'application/vnd.github+json'
    },
payload: JSON.stringify(payload),
muteHttpExceptions: true
  });

var code = resp.getResponseCode();
if (code === 204) {
// GitHub tarda ~10-30s en arrancar el job y unos segundos más en que
// Garmin devuelva la actividad — no está sincronizado al instante.
return { ok: true };
  }
return { ok: false, error: 'GitHub respondió ' + code + ': ' + resp.getContentText() };
}

// ── DESCARGAR IMAGEN DE DRIVE EN BASE64 (evita el bloqueo CORS del navegador) ──
function getImageBase64(fileId) {
if (!fileId) return { ok: false, error: 'fileId requerido' };
try {
var file = DriveApp.getFileById(fileId);
var blob = file.getBlob();
var base64 = Utilities.base64Encode(blob.getBytes());
return { ok: true, base64: base64, mimeType: blob.getContentType() };
  } catch (err) {
return { ok: false, error: err.message };
  }
}

// ── SUBIDA DE VÍDEO A DRIVE ──
function uploadVideo(body) {
if (!body || !body.base64) {
return { ok: false, error: 'base64 requerido' };
  }
var folder = DriveApp.getFolderById(FOLDER_ID);
var decoded = Utilities.base64Decode(body.base64);
var blob = Utilities.newBlob(decoded, body.mimeType || 'video/mp4', body.fileName || ('video_' + Date.now()));
var file = folder.createFile(blob);
file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
var fileId = file.getId();
var url = 'https://drive.google.com/file/d/' + fileId + '/preview';
return { ok: true, url: url, fileId: fileId };
}

// ── SUBIDA DE IMAGEN A DRIVE ─────────────────────────────────
function uploadImage(body) {
if (!body || !body.base64) {
return { ok: false, error: 'base64 requerido' };
  }
var folder = DriveApp.getFolderById(FOLDER_ID);
var decoded = Utilities.base64Decode(body.base64);
var blob = Utilities.newBlob(decoded, body.mimeType || 'image/png', body.fileName || ('img_' + Date.now()));
var file = folder.createFile(blob);
file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
var fileId = file.getId();
var url = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w800';
return { ok: true, url: url, fileId: fileId };
}

// ── WELLNESS ─────────────────────────────────────────────────
function ensureWellnessSheet() {
var ss = SpreadsheetApp.openById(SHEET_ID);
var sh = ss.getSheetByName('Wellness');
if (!sh) {
sh = ss.insertSheet('Wellness');
sh.appendRow(['id','atleta','fecha','sueno','fatiga','dolor','estres','animo','notas']);
  }
return sh;
}

function getWellness(atleta) {
var sh = ensureWellnessSheet();
var data = sh.getDataRange().getValues();
var items = [];
for (var i = 1; i < data.length; i++) {
if (!data[i][0]) continue;
if (atleta && data[i][1] !== atleta) continue;
items.push({
id:     data[i][0],
atleta: data[i][1],
fecha:  data[i][2] ? Utilities.formatDate(new Date(data[i][2]), 'Europe/Madrid', 'yyyy-MM-dd') : '',
sueno:  data[i][3],
fatiga: data[i][4],
dolor:  data[i][5],
estres: data[i][6],
animo:  data[i][7],
notas:  data[i][8] || ''
    });
  }
return { ok: true, items: items };
}

function saveWellness(body) {
var sh = ensureWellnessSheet();
var data = sh.getDataRange().getValues();
for (var i = 1; i < data.length; i++) {
var filaFecha = data[i][2] ? Utilities.formatDate(new Date(data[i][2]), 'Europe/Madrid', 'yyyy-MM-dd') : '';
if (data[i][1] === body.atleta && filaFecha === String(body.fecha).slice(0,10)) {
sh.getRange(i + 1, 1, 1, 9).setValues([[
data[i][0], body.atleta, body.fecha, body.sueno, body.fatiga, body.dolor, body.estres, body.animo, body.notas || ''
      ]]);
return { ok: true, id: data[i][0] };
    }
  }
var id = 'well_' + Date.now();
sh.appendRow([id, body.atleta, body.fecha, body.sueno, body.fatiga, body.dolor, body.estres, body.animo, body.notas || '']);
return { ok: true, id: id };
}

// ── EQUIPOS ──────────────────────────────────────────────────
function ensureEquiposSheet() {
var ss = SpreadsheetApp.openById(SHEET_ID);
var sh = ss.getSheetByName('Equipos');
if (!sh) {
sh = ss.insertSheet('Equipos');
sh.appendRow(['id','nombre','categoria','jugadores_json','notas']);
  }
return sh;
}

function getEquipos() {
var sh = ensureEquiposSheet();
var data = sh.getDataRange().getValues();
var equipos = [];
for (var i = 1; i < data.length; i++) {
if (!data[i][0]) continue;
equipos.push({
id:        data[i][0],
nombre:    data[i][1],
categoria: data[i][2],
jugadores: JSON.parse(data[i][3] || '[]'),
notas:     data[i][4] || '',
propietario: String(data[i][5] || '').trim().toLowerCase()
    });
  }
return { ok: true, equipos: equipos };
}

function addEquipo(body) {
var sh = ensureEquiposSheet();
var id = 'eq_' + Date.now();
sh.appendRow([id, body.nombre || '', body.categoria || '', JSON.stringify(body.jugadores || []), body.notas || '']);
return { ok: true, id: id };
}

function updateEquipo(body) {
var sh = ensureEquiposSheet();
var data = sh.getDataRange().getValues();
for (var i = 1; i < data.length; i++) {
if (data[i][0] === body.id) {
sh.getRange(i + 1, 1, 1, 5).setValues([[
body.id, body.nombre || '', body.categoria || '', JSON.stringify(body.jugadores || []), body.notas || ''
      ]]);
return { ok: true };
    }
  }
return { ok: false, error: 'Equipo no encontrado' };
}

function deleteEquipo(body) {
var sh = ensureEquiposSheet();
var data = sh.getDataRange().getValues();
for (var i = data.length - 1; i >= 1; i--) {
if (data[i][0] === body.id) {
sh.deleteRow(i + 1);
return { ok: true };
    }
  }
return { ok: false, error: 'Equipo no encontrado' };
}

// ── LOGIN ATLETA (por email + PIN — usado por atleta.html) ──
function loginAtleta(email, pin) {
if (!email || !pin) return { ok: false, error: 'Email y PIN requeridos' };
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Atletas');
var data = sh.getDataRange().getValues();
var emailNorm = String(email).trim().toLowerCase();
for (var i = 1; i < data.length; i++) {
var filaEmail = String(data[i][4] || '').trim().toLowerCase();
if (filaEmail === emailNorm && String(data[i][1]) === String(pin) && data[i][2] === true) {
// .trim() evita que un espacio invisible en el Sheet rompa el filtrado
// de sesiones en la app del atleta.
return { ok: true, nombre: String(data[i][0]).trim() };
    }
  }
return { ok: false, error: 'Email o PIN incorrecto' };
}

// ── CAMBIAR PIN (lo usa el propio atleta desde atleta.html) ──
// Requiere nombre + PIN actual correcto + PIN nuevo de 4 a 6 cifras.
function cambiarPin(body) {
var nombre = String(body.nombre || '').trim();
var pinActual = String(body.pinActual || '');
var pinNuevo = String(body.pinNuevo || '').trim();
if (!nombre || !pinActual) return { ok: false, error: 'Faltan datos' };
if (!/^\d{4,6}$/.test(pinNuevo)) return { ok: false, error: 'El PIN nuevo debe tener de 4 a 6 cifras' };
if (pinNuevo === pinActual) return { ok: false, error: 'El PIN nuevo es igual al actual' };
var lock = LockService.getScriptLock();
lock.waitLock(10000);
try {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Atletas');
var data = sh.getDataRange().getValues();
for (var i = 1; i < data.length; i++) {
if (String(data[i][0]).trim() === nombre) {
if (data[i][2] !== true) return { ok: false, error: 'Atleta inactivo' };
if (String(data[i][1]) !== pinActual) return { ok: false, error: 'PIN actual incorrecto' };
// formato texto para conservar ceros a la izquierda (p. ej. 0567)
var cell = sh.getRange(i + 1, 2);
cell.setNumberFormat('@');
cell.setValue(pinNuevo);
return { ok: true };
      }
    }
return { ok: false, error: 'Atleta no encontrado' };
  } finally {
lock.releaseLock();
  }
}

// ── LOGIN ────────────────────────────────────────────────────
function login(nombre, pin) {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Atletas');
var data = sh.getDataRange().getValues();
for (var i = 1; i < data.length; i++) {
if (data[i][0] === nombre && String(data[i][1]) === String(pin) && data[i][2] === true) {
return { ok: true, atleta: { nombre: data[i][0], notas: data[i][3] } };
    }
  }
return { ok: false, error: 'Nombre o PIN incorrecto' };
}

// ── ATLETAS ──────────────────────────────────────────────────
function getAtletas() {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Atletas');
var data = sh.getDataRange().getValues();
var atletas = [];
for (var i = 1; i < data.length; i++) {
if (data[i][2] === true) atletas.push(data[i][0]);
  }
return { ok: true, atletas: atletas };
}

// Soft-migración: si la hoja Atletas no tiene aún columnas F/G (deporte, estado),
// las añade sin tocar las filas ya existentes.
function ensureAtletasCols_() {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Atletas');
var header = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0];
if (header.length < 6 || !header[5]) sh.getRange(1, 6).setValue('deporte');
if (header.length < 7 || !header[6]) sh.getRange(1, 7).setValue('estado');
if (header.length < 8 || !header[7]) sh.getRange(1, 8).setValue('propietario');
if (header.length < 9 || !header[8]) sh.getRange(1, 9).setValue('compartido_con');
return sh;
}

function addAtleta(body) {
var sh = ensureAtletasCols_();
sh.appendRow([body.nombre, body.pin, true, body.notas || '', body.email || '', body.deporte || 'otro', body.estado || 'disponible']);
return { ok: true };
}

function getAtletasFull() {
var sh = ensureAtletasCols_();
var data = sh.getDataRange().getValues();
var atletas = [];
for (var i = 1; i < data.length; i++) {
if (!data[i][0]) continue;
atletas.push({
nombre:   data[i][0],
pin:      data[i][1],
activo:   data[i][2] === true,
notas:    data[i][3] || '',
email:    data[i][4] || '',
deporte:  data[i][5] || 'otro',
estado:   data[i][6] || 'disponible',
propietario:    String(data[i][7] || '').trim().toLowerCase(),
compartido_con: String(data[i][8] || '').split(',').map(function(x){return x.trim().toLowerCase();}).filter(Boolean)
    });
  }
return { ok: true, atletas: atletas };
}

function updateAtleta(body) {
var sh = ensureAtletasCols_();
var data = sh.getDataRange().getValues();
for (var i = 1; i < data.length; i++) {
if (data[i][0] === body.nombreOriginal) {
sh.getRange(i + 1, 1, 1, 7).setValues([[
body.nombre,
body.pin,
body.activo !== false,
body.notas || '',
body.email || '',
body.deporte || 'otro',
body.estado || 'disponible'
      ]]);
return { ok: true };
    }
  }
return { ok: false, error: 'Atleta no encontrado' };
}

function deleteAtleta(body) {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Atletas');
var data = sh.getDataRange().getValues();
for (var i = data.length - 1; i >= 1; i--) {
if (data[i][0] === body.nombre) {
sh.deleteRow(i + 1);
return { ok: true };
    }
  }
return { ok: false, error: 'Atleta no encontrado' };
}

// ── HELPERS EJERCICIOS ───────────────────────────────────────
function splitMulti(v) {
return (v||'').toString().split(',').map(function(s){return s.trim();}).filter(Boolean);
}

function joinMulti(v) {
return Array.isArray(v) ? v.join(', ') : (v || '');
}

// Esquema de Ejercicios por NOMBRE de columna (igual criterio que Resistencia).
// Los 4 últimos campos son la clasificación que permite al generador componer
// sesiones equilibradas sin inventarse ejercicios.
var EJERCICIOS_COLS = [
  { col: 'id',                field: 'id' },
  { col: 'nombre',            field: 'nombre' },
  { col: 'categoria',         field: 'categoria' },
  { col: 'musculos',          field: 'musculos' },
  { col: 'descripcion',       field: 'descripcion' },
  { col: 'video',             field: 'video' },
  { col: 'imagen',            field: 'imagen' },
  { col: 'tipo_contraccion',  field: 'tipo_contraccion', multi: true },
  { col: 'material',          field: 'material',         multi: true },
  { col: 'grupos_musculares', field: 'grupos_musculares',multi: true },
// ── Clasificación para el generador ──
// patron: RD (rodilla dominante) | CD (cadera dominante) | EH/EV (empuje
//         horizontal/vertical) | TH/TV (tracción horizontal/vertical) |
//         CAE/CAR (core anti-extensión/anti-rotación) | AIS | MOV
  { col: 'patron',            field: 'patron' },
// rol: Principal | Secundario | Accesorio — determina orden y carga
  { col: 'rol',               field: 'rol' },
  { col: 'unilateral',        field: 'unilateral' },   // 'sí' / ''
// combinado: ejercicios que encadenan dos patrones. Cuentan volumen a dos
// grupos, así que nunca deben ser el eje de una sesión de hipertrofia.
  { col: 'combinado',         field: 'combinado' },    // 'sí' / ''
// autor: email del entrenador que creó el ejercicio (vacío = común/antiguo, solo admin)
  { col: 'autor',             field: 'autor' }
];

function ensureEjerciciosSheet() {
var ss = SpreadsheetApp.openById(SHEET_ID);
var sh = ss.getSheetByName('Ejercicios');
var headers = EJERCICIOS_COLS.map(function (c) { return c.col; });

if (!sh) {
sh = ss.insertSheet('Ejercicios');
sh.appendRow(headers);
return sh;
  }
// Añadir solo las columnas que falten, al final. No se reordena nada.
var lastCol = Math.max(sh.getLastColumn(), 1);
var actuales = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
return String(h || '').trim();
  });
var faltan = [];
for (var i = 0; i < headers.length; i++) {
if (actuales.indexOf(headers[i]) === -1) faltan.push(headers[i]);
  }
if (faltan.length) {
sh.getRange(1, lastCol + 1, 1, faltan.length).setValues([faltan]);
  }
return sh;
}

function ejerciciosHeaderMap(sh) {
var lastCol = sh.getLastColumn();
var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
var map = {};
for (var i = 0; i < headers.length; i++) {
var h = String(headers[i] || '').trim();
if (h) map[h] = i;
  }
return map;
}

// Se mantiene por compatibilidad con llamadas antiguas
function ensureEjerciciosHeaders(sh) {
return ensureEjerciciosSheet();
}

// ── EJERCICIOS ───────────────────────────────────────────────
function getEjercicios() {
var sh = ensureEjerciciosSheet();
var map = ejerciciosHeaderMap(sh);
var data = sh.getDataRange().getValues();
var idIdx = map['id'];
var ejercicios = {};

for (var i = 1; i < data.length; i++) {
var row = data[i];
if (idIdx === undefined || !row[idIdx]) continue;
var ej = {};
for (var c = 0; c < EJERCICIOS_COLS.length; c++) {
var def = EJERCICIOS_COLS[c];
var idx = map[def.col];
var val = (idx === undefined) ? '' : row[idx];
ej[def.field] = def.multi ? splitMulti(val) : ((val === null || val === undefined) ? '' : val);
    }
ejercicios[row[idIdx]] = ej;
  }
return { ok: true, ejercicios: ejercicios };
}

function ejercicioBuildRow(body, map, ancho) {
var row = [];
for (var k = 0; k < ancho; k++) row.push('');
for (var c = 0; c < EJERCICIOS_COLS.length; c++) {
var def = EJERCICIOS_COLS[c];
var idx = map[def.col];
if (idx === undefined) continue;
var val = body[def.field];
if (def.multi) val = joinMulti(val);
row[idx] = (val === undefined || val === null) ? '' : val;
  }
return row;
}

function addEjercicio(body) {
var sh = ensureEjerciciosSheet();
var map = ejerciciosHeaderMap(sh);
sh.appendRow(ejercicioBuildRow(body, map, sh.getLastColumn()));
return { ok: true };
}

function updateEjercicio(body) {
var sh = ensureEjerciciosSheet();
var map = ejerciciosHeaderMap(sh);
var data = sh.getDataRange().getValues();
var idIdx = map['id'];
if (idIdx === undefined) return { ok: false, error: 'Falta la columna id' };

for (var i = 1; i < data.length; i++) {
if (data[i][idIdx] === body.id) {
var ancho = sh.getLastColumn();
sh.getRange(i + 1, 1, 1, ancho).setValues([ejercicioBuildRow(body, map, ancho)]);
return { ok: true };
    }
  }
return { ok: false, error: 'Ejercicio no encontrado' };
}

// Actualiza SOLO los campos de clasificación, sin tocar el resto de la ficha.
// Pensado para el etiquetado masivo: evita que un fallo en el envío borre
// descripciones, imágenes o vídeos ya cargados.
function clasificarEjercicios(body) {
var sh = ensureEjerciciosSheet();
var map = ejerciciosHeaderMap(sh);
var data = sh.getDataRange().getValues();
var idIdx = map['id'];
if (idIdx === undefined) return { ok: false, error: 'Falta la columna id' };

var campos = ['patron', 'rol', 'unilateral', 'combinado'];
var items = body.items || [];
var indice = {};
for (var i = 1; i < data.length; i++) {
if (data[i][idIdx]) indice[String(data[i][idIdx])] = i + 1; // fila real
  }

var actualizados = 0, noEncontrados = [];
for (var k = 0; k < items.length; k++) {
var it = items[k];
var fila = indice[String(it.id)];
if (!fila) { noEncontrados.push(it.id); continue; }
for (var c = 0; c < campos.length; c++) {
var idx = map[campos[c]];
if (idx === undefined) continue;
var val = it[campos[c]];
if (val === undefined) continue;
sh.getRange(fila, idx + 1).setValue(val === null ? '' : val);
    }
actualizados++;
  }
return { ok: true, actualizados: actualizados, noEncontrados: noEncontrados };
}

function deleteEjercicio(body) {
var sh = ensureEjerciciosSheet();
var map = ejerciciosHeaderMap(sh);
var data = sh.getDataRange().getValues();
var idIdx = map['id'];
if (idIdx === undefined) return { ok: false, error: 'Falta la columna id' };
for (var i = data.length - 1; i >= 1; i--) {
if (data[i][idIdx] === body.id) {
sh.deleteRow(i + 1);
return { ok: true };
    }
  }
return { ok: false, error: 'Ejercicio no encontrado' };
}

// ── CONFIG ───────────────────────────────────────────────────
function getConfig() {
var ss = SpreadsheetApp.openById(SHEET_ID);
var sh = ss.getSheetByName('Config');
if (!sh) {
sh = ss.insertSheet('Config');
sh.appendRow(['clave','valor_json']);
sh.appendRow(['tipos_contraccion', JSON.stringify(['Isométrico','Concéntrico','Excéntrico','Continuo/Cíclico','Pliométrico','Iso-inercial'])]);
sh.appendRow(['materiales',        JSON.stringify(['Peso corporal','Mancuerna','Barra','Landmine','Banda elástica','Miniband','TRX/Suspensión','Fitball','Bosu','Balón medicinal','Caja pliométrica','Máquina específica','Trineo','Vallas','Iso-inercial'])]);
sh.appendRow(['categorias',        JSON.stringify(['Fuerza','Potencia','Pliometría','Activación','Cardio','Movilidad','Core','Técnica','Vuelta a la calma'])]);
sh.appendRow(['grupos_musculares', JSON.stringify(['Cuádriceps','Isquiotibiales','Glúteos','Aductores','Abductores','Gemelos/Sóleo','Tibial anterior','Recto abdominal','Oblicuos','Transverso','Lumbar/Erectores','Cuadrado lumbar','Suelo pélvico','Pectoral','Dorsal','Trapecio','Romboides','Deltoides','Bíceps','Tríceps','Antebrazos','Cuello','Cadena posterior','Cadena anterior','Core anti-extensión','Core anti-rotación','Estabilizadores de cadera'])]);
sh.appendRow(['disciplinas_resistencia', JSON.stringify(['Natación','Ciclismo ruta','Ciclismo rodillo','MTB','Carrera','Remo','Fútbol','Esgrima','Trail','Aguas abiertas'])]);
sh.appendRow(['parametros_ejercicio', JSON.stringify([
      {id:'series', label:'Series',   type:'number'},
      {id:'reps',   label:'Reps',     type:'text'},
      {id:'kg',     label:'kg',       type:'text'},
      {id:'pct_rm', label:'% RM',     type:'number'},
      {id:'rir',    label:'RIR',      type:'number'},
      {id:'rpe',    label:'RPE',      type:'number'},
      {id:'vel',    label:'Vel m/s',  type:'number'},
      {id:'banda',  label:'Banda',    type:'select', options:['Amarilla','Roja','Verde','Azul','Negra']},
      {id:'miniband',label:'Miniband',type:'select', options:['Ligero','Medio','Fuerte','Muy fuerte']},
      {id:'descanso',label:'Descanso',type:'text'},
      {id:'duracion',label:'Duración(s)',type:'number'},
      {id:'notas',  label:'Notas',    type:'text'}
    ])]);
sh.appendRow(['bloques_ejercicio', JSON.stringify([
      {id:'activacion',    name:'Activación',          color:'#60a5fa'},
      {id:'fuerza',        name:'Fuerza',              color:'#ccff66'},
      {id:'potencia',      name:'Potencia',            color:'#fb923c'},
      {id:'pliometria',    name:'Pliometría',          color:'#f472b6'},
      {id:'pot-resistida', name:'Potencia Resistida',  color:'#a78bfa'},
      {id:'resistencia',   name:'Resistencia',         color:'#06b6d4'},
      {id:'vuelta-calma',  name:'Vuelta a la Calma',   color:'#4ade80'}
    ])]);
  }
var data = sh.getDataRange().getValues();
var config = {};
for (var i = 1; i < data.length; i++) {
if (data[i][0]) config[data[i][0]] = JSON.parse(data[i][1] || '[]');
  }
return { ok: true, config: config };
}

function saveConfig(body) {
var ss = SpreadsheetApp.openById(SHEET_ID);
var sh = ss.getSheetByName('Config');
if (!sh) {
sh = ss.insertSheet('Config');
sh.appendRow(['clave','valor_json']);
  }
var data = sh.getDataRange().getValues();
for (var i = 1; i < data.length; i++) {
if (data[i][0] === body.key) {
sh.getRange(i+1, 2).setValue(JSON.stringify(body.value));
return { ok: true };
    }
  }
sh.appendRow([body.key, JSON.stringify(body.value)]);
return { ok: true };
}

// ── SESIONES ─────────────────────────────────────────────────
function getSesiones(atleta) {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sesiones');
var data = sh.getDataRange().getValues();
var sesiones = [];
for (var i = 1; i < data.length; i++) {
if (data[i][1] === atleta) {
sesiones.push({
id:         data[i][0],
atleta:     data[i][1],
fecha:      Utilities.formatDate(new Date(data[i][2]), 'Europe/Madrid', 'yyyy-MM-dd'),
nombre:     data[i][3],
ejercicios: JSON.parse(data[i][4] || '[]')
      });
    }
  }
return { ok: true, sesiones: sesiones };
}

function getAllSesiones() {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sesiones');
var data = sh.getDataRange().getValues();
var sesiones = [];
for (var i = 1; i < data.length; i++) {
if (!data[i][0]) continue;
sesiones.push({
id:         data[i][0],
// .trim() evita que espacios invisibles rompan el filtrado por atleta
atleta:     String(data[i][1] || '').trim(),
fecha:      Utilities.formatDate(new Date(data[i][2]), 'Europe/Madrid', 'yyyy-MM-dd'),
nombre:     data[i][3],
ejercicios: JSON.parse(data[i][4] || '[]')
    });
  }
return { ok: true, sesiones: sesiones };
}

function addSesion(body) {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sesiones');
var id = 'ses_' + Date.now();
sh.appendRow([
id,
body.atleta,
body.fecha,
body.nombre,
JSON.stringify(body.ejercicios)
  ]);
return { ok: true, id: id };
}

function updateSesion(body) {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sesiones');
var data = sh.getDataRange().getValues();
for (var i = 1; i < data.length; i++) {
if (data[i][0] === body.id) {
sh.getRange(i + 1, 1, 1, 5).setValues([[
body.id,
body.atleta,
body.fecha,
body.nombre,
JSON.stringify(body.ejercicios)
      ]]);
return { ok: true };
    }
  }
return { ok: false, error: 'Sesión no encontrada' };
}

function deleteSesion(body) {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sesiones');
var data = sh.getDataRange().getValues();
for (var i = data.length - 1; i >= 1; i--) {
if (data[i][0] === body.id) {
sh.deleteRow(i + 1);
return { ok: true };
    }
  }
return { ok: false, error: 'Sesión no encontrada' };
}

// ── REGISTROS ────────────────────────────────────────────────
function getHistorial(atleta) {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Registros');
var data = sh.getDataRange().getValues();
var registros = [];
for (var i = 1; i < data.length; i++) {
if (data[i][1] === atleta) {
registros.push({
id:         data[i][0],
atleta:     data[i][1],
fecha:      Utilities.formatDate(new Date(data[i][2]), 'Europe/Madrid', 'yyyy-MM-dd'),
sesion_id:  data[i][3],
datos:      JSON.parse(data[i][4] || '{}'),
completada: data[i][5],
timestamp:  data[i][6]
      });
    }
  }
return { ok: true, registros: registros };
}

function guardarRegistro(body) {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Registros');
var id = 'reg_' + Date.now();
sh.appendRow([
id,
body.atleta,
body.fecha,
body.sesion_id,
JSON.stringify(body.datos),
body.completada ? true : false,
new Date().toISOString()
  ]);
return { ok: true, id: id };
}

// ── PLANTILLAS ───────────────────────────────────────────────
function getTemplates() {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Plantillas');
if (!sh) return { ok: true, templates: [] };
var data = sh.getDataRange().getValues();
var templates = [];
for (var i = 1; i < data.length; i++) {
if (!data[i][0]) continue;
templates.push({
id:      data[i][0],
name:    data[i][1],
bloques: JSON.parse(data[i][2] || '{}'),
autor:   String(data[i][3] || '').trim().toLowerCase()
    });
  }
return { ok: true, templates: templates };
}

function saveTemplate(body) {
var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Plantillas');
if (!sh) {
sh = SpreadsheetApp.openById(SHEET_ID).insertSheet('Plantillas');
sh.appendRow(['id', 'nombre', 'bloques_json']);
  }
var data = sh.getDataRange().getValues();
for (var i = 1; i < data.length; i++) {
if (data[i][0] === body.template.id) {
sh.getRange(i + 1, 1, 1, 3).setValues([[
body.template.id,
body.template.name,
JSON.stringify(body.template.bloques)
      ]]);
return { ok: true };
    }
  }
sh.appendRow([
body.template.id,
body.template.name,
JSON.stringify(body.template.bloques)
  ]);
return { ok: true };
}

// ═══════════════════════════════════════════════════════════
// ── RESISTENCIA (v4 — por nombre de columna) ─────────────────
// ═══════════════════════════════════════════════════════════
// Ahora se trabaja POR NOMBRE DE COLUMNA en lugar de por posición fija.
//   - Añadir un campo nuevo = añadir una línea en RESISTENCIA_COLS.
//   - Las columnas que falten se crean solas AL FINAL de la hoja, sin
//     tocar ni reordenar las existentes: no se pierde ningún dato.

var RESISTENCIA_COLS = [
// {col: nombre de columna en el Sheet, field: nombre del campo en la app}
  { col: 'id',              field: 'id' },
  { col: 'tipo',            field: 'tipo' },
  { col: 'atleta',          field: 'atleta' },
  { col: 'fecha',           field: 'fecha',       date: true },
  { col: 'disciplina',      field: 'disciplina' },
  { col: 'nombre',          field: 'nombre' },
  { col: 'duracion_min',    field: 'duracion_min' },
  { col: 'distancia_km',    field: 'distancia_km' },
  { col: 'rpe_objetivo',    field: 'rpe_objetivo' },
  { col: 'tss',             field: 'tss' },
  { col: 'zonas_json',      field: 'zonas',       json: true },  // zonas OBJETIVO (las marca el entrenador)
  { col: 'estructura_json', field: 'estructura',  json: true },
  { col: 'descripcion',     field: 'descripcion' },
  { col: 'fc_media',        field: 'fc_media' },
  { col: 'fc_max',          field: 'fc_max' },
  { col: 'duracion_real',   field: 'duracion_real' },
  { col: 'distancia_real',  field: 'distancia_real' },
  { col: 'rpe_real',        field: 'rpe_real' },
  { col: 'notas_atleta',    field: 'notas_atleta' },
// ── Campos nuevos: datos REALES del pulsómetro ──
  { col: 'zonas_real_json', field: 'zonas_real',  json: true },  // tiempo real en cada zona de FC
  { col: 'tss_real',        field: 'tss_real' },                 // hrTSS calculado desde FC
  { col: 'foster_real',     field: 'foster_real' },              // carga Foster, misma escala (AU) que fuerza
  { col: 'rpe_estimado',    field: 'rpe_estimado' },             // 'sí' = lo estimó el sistema, no el atleta
  { col: 'desnivel_m',      field: 'desnivel_m' },
  { col: 'ritmo_medio',     field: 'ritmo_medio' },
  { col: 'cadencia',        field: 'cadencia' },
  { col: 'fuente_datos',    field: 'fuente_datos' },             // 'Garmin', 'Polar', vacío si es manual
  { col: 'origen_id',       field: 'origen_id' }                 // clave única en la plataforma de origen (ej. garmin_12345)
];

function ensureResistenciaSheet() {
var ss = SpreadsheetApp.openById(SHEET_ID);
var sh = ss.getSheetByName('Resistencia');
var headers = RESISTENCIA_COLS.map(function (c) { return c.col; });

if (!sh) {
sh = ss.insertSheet('Resistencia');
sh.appendRow(headers);
return sh;
  }

var lastCol = Math.max(sh.getLastColumn(), 1);
var actuales = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
return String(h || '').trim();
  });
var faltan = [];
for (var i = 0; i < headers.length; i++) {
if (actuales.indexOf(headers[i]) === -1) faltan.push(headers[i]);
  }
if (faltan.length) {
sh.getRange(1, lastCol + 1, 1, faltan.length).setValues([faltan]);
  }
return sh;
}

function resistenciaHeaderMap(sh) {
var lastCol = sh.getLastColumn();
var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
var map = {};
for (var i = 0; i < headers.length; i++) {
var h = String(headers[i] || '').trim();
if (h) map[h] = i;
  }
return map;
}

// Acepta string JSON, array/objeto ya parseado, o vacío
function resParseJson(val) {
if (val === '' || val === null || val === undefined) return [];
if (typeof val === 'object') return val;
try {
return JSON.parse(val);
  } catch (err) {
return [];
  }
}

function getResistencia() {
var sh = ensureResistenciaSheet();
var map = resistenciaHeaderMap(sh);
var data = sh.getDataRange().getValues();
var idIdx = map['id'];
var items = [];

for (var i = 1; i < data.length; i++) {
var row = data[i];
if (idIdx === undefined || !row[idIdx]) continue;
var item = {};
for (var c = 0; c < RESISTENCIA_COLS.length; c++) {
var def = RESISTENCIA_COLS[c];
var idx = map[def.col];
var val = (idx === undefined) ? '' : row[idx];
if (def.json) {
item[def.field] = resParseJson(val);
      } else if (def.date) {
item[def.field] = val ? Utilities.formatDate(new Date(val), 'Europe/Madrid', 'yyyy-MM-dd') : '';
      } else if (def.field === 'atleta') {
// .trim() evita que espacios invisibles rompan el filtrado por atleta
item[def.field] = String(val || '').trim();
      } else {
item[def.field] = (val === null || val === undefined) ? '' : val;
      }
    }
items.push(item);
  }
return { ok: true, items: items };
}

// Construye la fila respetando el orden REAL de columnas del Sheet
function resistenciaBuildRow(body, map, ancho, id) {
var row = [];
for (var k = 0; k < ancho; k++) row.push('');

for (var c = 0; c < RESISTENCIA_COLS.length; c++) {
var def = RESISTENCIA_COLS[c];
var idx = map[def.col];
if (idx === undefined) continue;

var val;
if (def.field === 'id') val = id;
else if (def.field === 'tipo') val = body.tipo || 'sesion';
else val = body[def.field];

if (def.json) {
val = JSON.stringify(resParseJson(val));
    }
row[idx] = (val === undefined || val === null) ? '' : val;
  }
return row;
}

// Google Sheets interpreta valores como "6:28" (ritmo por km) como una HORA
// y los convierte en un objeto fecha (base 30/12/1899). Forzar el formato a
// texto plano ('@') en esas columnas evita la conversión.
var RESISTENCIA_COLS_TEXTO = ['ritmo_medio', 'rpe_objetivo', 'origen_id'];

function forzarTextoResistencia(sh, fila, map) {
for (var i = 0; i < RESISTENCIA_COLS_TEXTO.length; i++) {
var idx = map[RESISTENCIA_COLS_TEXTO[i]];
if (idx !== undefined) {
sh.getRange(fila, idx + 1).setNumberFormat('@');
    }
  }
}

function addResistencia(body) {
var sh = ensureResistenciaSheet();
var map = resistenciaHeaderMap(sh);
var ancho = sh.getLastColumn();

// Si la actividad trae un origen_id (viene de un reloj), se comprueba si
// ya está registrada: en ese caso se ACTUALIZA la fila existente en lugar
// de crear una nueva. Así, relanzar el sync no genera duplicados.
var origenId = body.origen_id;
if (origenId) {
var origenIdx = map['origen_id'];
var idIdx = map['id'];
if (origenIdx !== undefined && idIdx !== undefined) {
var data = sh.getDataRange().getValues();
for (var i = 1; i < data.length; i++) {
if (data[i][origenIdx] && String(data[i][origenIdx]) === String(origenId)) {
var idExistente = data[i][idIdx];
var filaAct = resistenciaBuildRow(body, map, ancho, idExistente);
forzarTextoResistencia(sh, i + 1, map);
sh.getRange(i + 1, 1, 1, ancho).setValues([filaAct]);
return { ok: true, id: idExistente, actualizado: true };
        }
      }
    }
  }

var id = 'res_' + Date.now();
var row = resistenciaBuildRow(body, map, ancho, id);
sh.appendRow(row);
forzarTextoResistencia(sh, sh.getLastRow(), map);
// Reescribir la fila después de fijar el formato, para que los valores
// de texto no queden ya convertidos a fecha por Sheets.
sh.getRange(sh.getLastRow(), 1, 1, ancho).setValues([row]);
return { ok: true, id: id };
}

function updateResistencia(body) {
var sh = ensureResistenciaSheet();
var map = resistenciaHeaderMap(sh);
var data = sh.getDataRange().getValues();
var idIdx = map['id'];
if (idIdx === undefined) return { ok: false, error: 'Falta la columna id' };

for (var i = 1; i < data.length; i++) {
if (data[i][idIdx] === body.id) {
var ancho = sh.getLastColumn();
var row = resistenciaBuildRow(body, map, ancho, body.id);
forzarTextoResistencia(sh, i + 1, map);
sh.getRange(i + 1, 1, 1, ancho).setValues([row]);
return { ok: true };
    }
  }
return { ok: false, error: 'Resistencia no encontrada' };
}

function deleteResistencia(body) {
var sh = ensureResistenciaSheet();
var map = resistenciaHeaderMap(sh);
var data = sh.getDataRange().getValues();
var idIdx = map['id'];
if (idIdx === undefined) return { ok: false, error: 'Falta la columna id' };

for (var i = data.length - 1; i >= 1; i--) {
if (data[i][idIdx] === body.id) {
sh.deleteRow(i + 1);
return { ok: true };
    }
  }
return { ok: false, error: 'Resistencia no encontrada' };
}

// ── PLAN EXTERNO ─────────────────────────────────────────────
// Planificación semanal que el propio deportista manda (club/federación,
// colegio, otro entrenador...) fuera de las sesiones que tú le asignas.
// Un registro por atleta+día: guardar sobre un día existente lo actualiza.
function ensurePlanExternoSheet() {
var ss = SpreadsheetApp.openById(SHEET_ID);
var sh = ss.getSheetByName('PlanExterno');
if (!sh) {
sh = ss.insertSheet('PlanExterno');
sh.appendRow(['id', 'atleta', 'fecha', 'disciplina', 'texto', 'notas', 'pdf_url', 'pdf_nombre']);
return sh;
  }
// Migración suave: si la hoja es de antes de añadir el PDF, se completan las columnas que falten.
var headers = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(function (h) { return String(h || '').trim(); });
var faltan = ['pdf_url', 'pdf_nombre'].filter(function (h) { return headers.indexOf(h) === -1; });
if (faltan.length) sh.getRange(1, headers.length + 1, 1, faltan.length).setValues([faltan]);
return sh;
}

function getPlanExterno(atleta) {
var sh = ensurePlanExternoSheet();
var data = sh.getDataRange().getValues();
var items = [];
for (var i = 1; i < data.length; i++) {
if (!data[i][0]) continue;
var nombreAtleta = String(data[i][1] || '').trim();
if (atleta && nombreAtleta !== atleta) continue;
items.push({
id:         data[i][0],
atleta:     nombreAtleta,
fecha:      data[i][2] ? Utilities.formatDate(new Date(data[i][2]), 'Europe/Madrid', 'yyyy-MM-dd') : '',
disciplina: data[i][3] || '',
texto:      data[i][4] || '',
notas:      data[i][5] || '',
pdf_url:    data[i][6] || '',
pdf_nombre: data[i][7] || ''
    });
  }
return { ok: true, items: items };
}

function savePlanExterno(body) {
var sh = ensurePlanExternoSheet();
var data = sh.getDataRange().getValues();
var fechaBody = String(body.fecha).slice(0, 10);
for (var i = 1; i < data.length; i++) {
var filaFecha = data[i][2] ? Utilities.formatDate(new Date(data[i][2]), 'Europe/Madrid', 'yyyy-MM-dd') : '';
if (String(data[i][1] || '').trim() === body.atleta && filaFecha === fechaBody) {
// Si no llega un pdf nuevo en este guardado, se conserva el que ya hubiera.
var pdfUrl = (body.pdf_url !== undefined) ? body.pdf_url : data[i][6];
var pdfNombre = (body.pdf_nombre !== undefined) ? body.pdf_nombre : data[i][7];
sh.getRange(i + 1, 1, 1, 8).setValues([[
data[i][0], body.atleta, body.fecha, body.disciplina || '', body.texto || '', body.notas || '', pdfUrl || '', pdfNombre || ''
      ]]);
return { ok: true, id: data[i][0] };
    }
  }
var id = 'plex_' + Date.now();
sh.appendRow([id, body.atleta, body.fecha, body.disciplina || '', body.texto || '', body.notas || '', body.pdf_url || '', body.pdf_nombre || '']);
return { ok: true, id: id };
}

// ── SUBIDA DE PDF A DRIVE (planificación externa) ─────────────
function uploadPdf(body) {
if (!body || !body.base64) {
return { ok: false, error: 'base64 requerido' };
  }
var folder = DriveApp.getFolderById(FOLDER_ID);
var decoded = Utilities.base64Decode(body.base64);
var blob = Utilities.newBlob(decoded, body.mimeType || 'application/pdf', body.fileName || ('plan_' + Date.now() + '.pdf'));
var file = folder.createFile(blob);
file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
var fileId = file.getId();
var url = 'https://drive.google.com/file/d/' + fileId + '/preview';
return { ok: true, url: url, fileId: fileId, fileName: file.getName() };
}

function deletePlanExterno(body) {
var sh = ensurePlanExternoSheet();
var data = sh.getDataRange().getValues();
for (var i = data.length - 1; i >= 1; i--) {
if (data[i][0] === body.id) {
sh.deleteRow(i + 1);
return { ok: true };
    }
  }
return { ok: false, error: 'Plan externo no encontrado' };
}

// ── TEMPORADA ────────────────────────────────────────────────
// Periodización semanal por atleta, portada del sistema de ESGRIMA-26:
// 52 semanas con fase (A/A+/A++/I/T/R/C/RC/D) y RPE planificado (1-5),
// para comparar luego contra la carga real y la fatiga reportada (Wellness).
var TEMPORADA_HEADERS = ['id', 'atleta', 'semana_num', 'fecha_inicio', 'fase', 'rpe_planificado', 'notas'];
function ensureTemporadaSheet() {
var ss = SpreadsheetApp.openById(SHEET_ID);
var sh = ss.getSheetByName('Temporada');
if (!sh) {
sh = ss.insertSheet('Temporada');
sh.appendRow(TEMPORADA_HEADERS);
  }
return sh;
}

function getTemporada(atleta) {
var sh = ensureTemporadaSheet();
var data = sh.getDataRange().getValues();
var items = [];
for (var i = 1; i < data.length; i++) {
if (!data[i][0]) continue;
var nombreAtleta = String(data[i][1] || '').trim();
if (atleta && nombreAtleta !== atleta) continue;
items.push({
id:              data[i][0],
atleta:          nombreAtleta,
semana_num:      Number(data[i][2]) || 0,
fecha_inicio:    data[i][3] ? Utilities.formatDate(new Date(data[i][3]), 'Europe/Madrid', 'yyyy-MM-dd') : '',
fase:            data[i][4] || '',
rpe_planificado: (data[i][5] === '' || data[i][5] === null || data[i][5] === undefined) ? null : Number(data[i][5]),
notas:           data[i][6] || ''
    });
  }
items.sort(function (a, b) { return a.semana_num - b.semana_num; });
return { ok: true, items: items };
}

function saveSemanaTemporada(body) {
var sh = ensureTemporadaSheet();
var data = sh.getDataRange().getValues();
var rpe = (body.rpe_planificado === '' || body.rpe_planificado === null || body.rpe_planificado === undefined) ? '' : body.rpe_planificado;
for (var i = 1; i < data.length; i++) {
if (String(data[i][1] || '').trim() === body.atleta && Number(data[i][2]) === Number(body.semana_num)) {
sh.getRange(i + 1, 1, 1, 7).setValues([[
data[i][0], body.atleta, body.semana_num, body.fecha_inicio || data[i][3], body.fase || '', rpe, body.notas || ''
      ]]);
return { ok: true, id: data[i][0] };
    }
  }
var id = 'temp_' + Date.now() + '_' + body.semana_num;
sh.appendRow([id, body.atleta, body.semana_num, body.fecha_inicio || '', body.fase || '', rpe, body.notas || '']);
return { ok: true, id: id };
}

// Crea las 52 semanas en blanco para un atleta a partir de un lunes dado,
// sin tocar las que ya existan (para poder llamarlo de forma segura al abrir la temporada).
function generarTemporada(body) {
var sh = ensureTemporadaSheet();
var data = sh.getDataRange().getValues();
var existentes = {};
for (var i = 1; i < data.length; i++) {
if (String(data[i][1] || '').trim() === body.atleta) existentes[Number(data[i][2])] = true;
  }
var inicio = new Date(body.fecha_inicio + 'T00:00:00');
var filas = [];
for (var n = 1; n <= 52; n++) {
if (existentes[n]) continue;
var fecha = new Date(inicio);
fecha.setDate(fecha.getDate() + (n - 1) * 7);
var fechaStr = Utilities.formatDate(fecha, 'Europe/Madrid', 'yyyy-MM-dd');
filas.push(['temp_' + Date.now() + '_' + n, body.atleta, n, fechaStr, '', '', '']);
  }
if (filas.length) {
sh.getRange(sh.getLastRow() + 1, 1, filas.length, 7).setValues(filas);
  }
return { ok: true, creadas: filas.length };
}

// ═══════════════════════════════════════════════════════════
// PROGRAMAS — sincronización con el backend (hoja "Programas")
// Añadido para que la pestaña "Programas" deje de depender solo de
// localStorage y sincronice de verdad entre dispositivos/navegadores.
// ═══════════════════════════════════════════════════════════

function ensureProgramasSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName('Programas');
  if (!sh) {
    sh = ss.insertSheet('Programas');
    sh.appendRow(['id', 'nombre', 'programa_json']);
  }
  return sh;
}

function getPrograms() {
  var sh = ensureProgramasSheet();
  var data = sh.getDataRange().getValues();
  var programas = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    try {
      // El JSON puede venir partido en varias columnas (C, D, E...) porque una celda
      // admite como máximo 50.000 caracteres. Se concatenan todas desde la columna C.
      var json = '';
      for (var c = 2; c < data[i].length; c++) json += String(data[i][c] == null ? '' : data[i][c]);
      programas.push(JSON.parse(json || '{}'));
    } catch (e) {
      // fila corrupta — se ignora en vez de romper la carga de todos los programas
    }
  }
  return { ok: true, programas: programas };
}

function saveProgram(body) {
  var program = body.program;
  if (!program || !program.id) return { ok: false, error: 'Programa sin id' };
  var sh = ensureProgramasSheet();
  var data = sh.getDataRange().getValues();
  var json = JSON.stringify(program);
  // Partir el JSON en trozos de 45.000 caracteres (límite de celda: 50.000)
  var CHUNK = 45000, parts = [];
  for (var p = 0; p < json.length; p += CHUNK) parts.push(json.substring(p, p + CHUNK));
  if (!parts.length) parts.push('{}');
  var needCols = 2 + parts.length;
  if (sh.getMaxColumns() < needCols) sh.insertColumnsAfter(sh.getMaxColumns(), needCols - sh.getMaxColumns());
  var row = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === program.id) { row = i + 1; break; }
  }
  if (row === -1) { sh.appendRow([program.id, program.name || '']); row = sh.getLastRow(); }
  // limpiar columnas de datos antiguas y escribir los trozos como texto (evita que Sheets los interprete)
  sh.getRange(row, 3, 1, sh.getMaxColumns() - 2).clearContent();
  sh.getRange(row, 1, 1, 2).setValues([[program.id, program.name || '']]);
  var rng = sh.getRange(row, 3, 1, parts.length);
  rng.setNumberFormat('@');
  rng.setValues([parts]);
  return { ok: true };
}

function deleteProgram(body) {
  var sh = ensureProgramasSheet();
  var data = sh.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === body.id) {
      sh.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { ok: false, error: 'Programa no encontrado' };
}