const waypoints = [
  {id:1,title:"Puerta del Alcázar y Muralla",lat:40.65573,lon:-4.69742,text:"Bienvenido a Ávila. Estás junto a la Puerta del Alcázar, uno de los accesos más monumentales de la muralla. La muralla de Ávila es una de las imágenes medievales más potentes de España: piedra dorada, torres repetidas y una ciudad que parece suspendida en el tiempo. Su trazado protege el casco antiguo y ayuda a entender por qué Ávila fue una ciudad estratégica. Antes de avanzar, mira las torres y la anchura de los muros. No son solo decorativos: eran defensa, vigilancia y símbolo de poder. Desde aquí comienza nuestra ruta a pie."},
  {id:2,title:"Paseo de la Muralla",lat:40.65647,lon:-4.69810,text:"Ahora estás en el entorno de la muralla. Si has subido al adarve, fíjate en la vista del casco histórico y en el paisaje abierto de Castilla. Si vas por la parte baja, observa cómo la muralla se adapta a la ciudad. Ávila no se entiende sin este cinturón de piedra. Durante siglos, marcó quién estaba dentro y quién quedaba fuera. Camina despacio: la gracia de este tramo no es llegar rápido, sino notar la escala. Cada torre repite una idea sencilla: proteger, vigilar y resistir."},
  {id:3,title:"Catedral de Ávila",lat:40.65626,lon:-4.69705,text:"Llegamos a la Catedral del Salvador. Es especial porque no es solo una iglesia: también forma parte del sistema defensivo de la ciudad. Su cabecera se integra en la muralla, como si el templo fuera también una fortaleza. Esta mezcla de espiritualidad y defensa resume muy bien la Ávila medieval. Mira los volúmenes exteriores y la piedra. No busques una catedral ligera y abierta, sino una presencia fuerte, casi militar. Después seguiremos hacia el corazón urbano: la Plaza del Mercado Chico."},
  {id:4,title:"Plaza del Mercado Chico",lat:40.65648,lon:-4.70006,text:"Estás en la Plaza del Mercado Chico, la plaza mayor de Ávila. Este ha sido durante siglos un espacio de encuentro, mercado y vida pública. Aquí la ciudad deja de hablar en tono defensivo y empieza a hablar en tono cotidiano: soportales, terrazas, Ayuntamiento y vecinos cruzando la plaza. Es un buen punto para detenerse un minuto y mirar alrededor. En una visita corta, esta plaza ayuda a entender que Ávila no es solo monumento: también es ciudad viva."},
  {id:5,title:"Basílica de San Vicente",lat:40.65745,lon:-4.69562,text:"La Basílica de San Vicente es uno de los grandes edificios románicos de Ávila. Su piedra clara y su silueta poderosa la convierten en una parada imprescindible. La tradición la vincula al martirio de Vicente, Sabina y Cristeta, tres hermanos cristianos. Fíjate en la portada y en el equilibrio del conjunto. Frente a la fuerza cerrada de la muralla, San Vicente ofrece otra lectura de la ciudad: la de la memoria religiosa, los relatos de santos y el arte románico castellano."},
  {id:6,title:"Convento de Santa Teresa",lat:40.65518,lon:-4.70226,text:"Llegamos al entorno de Santa Teresa de Jesús, una de las figuras más importantes de la espiritualidad española. Ávila está profundamente ligada a su vida y a su memoria. Por eso se suele decir que es ciudad de santos y de piedras. Aquí conviene bajar el ritmo. Más allá de la fachada, piensa en la Ávila del siglo dieciséis: calles estrechas, vida religiosa intensa y una mujer que acabó dejando una huella enorme en la literatura, la mística y la historia."},
  {id:7,title:"Camino al río Adaja",lat:40.65356,lon:-4.70470,text:"Salimos poco a poco del casco histórico para caminar hacia el mirador de los Cuatro Postes. Este tramo es importante porque te permite ver Ávila desde fuera. Muchas ciudades medievales se entienden mejor al alejarse unos minutos. Mientras caminas, observa cómo la muralla deja de ser una pared cercana y se convierte en una silueta completa. El camino es a pie y puede tener algo de desnivel, así que tómalo con calma."},
  {id:8,title:"Mirador de los Cuatro Postes",lat:40.65254,lon:-4.70740,text:"Este es el Mirador de los Cuatro Postes. Desde aquí tienes una de las vistas más famosas de Ávila: la ciudad amurallada completa, elevada sobre el paisaje. Es el lugar perfecto para cerrar la visita. Si vienes al atardecer, la piedra toma tonos cálidos y la muralla parece todavía más teatral. Haz una pausa, mira el conjunto y repasa mentalmente la ruta: puerta, muralla, catedral, plaza, basílica, Teresa de Jesús y ahora esta panorámica final."},
  {id:9,title:"Final y comida",lat:40.65620,lon:-4.69900,text:"Fin de la audioguía. Para comer por menos de veinticinco euros, busca menú del día o raciones compartidas. Los Candiles suele ser una buena opción para comida castellana y raciones. Soul Kitchen es más moderno y desenfadado. Bococo puede ser muy buena opción si encuentras menú o plato ajustado al presupuesto. Si quieres algo muy típico, prueba patatas revolconas, judías del Barco, carne de Ávila o yemas como dulce final."}
];

let watchId = null;
let played = new Set(JSON.parse(localStorage.getItem("playedWaypoints") || "[]"));
let currentSpeaking = false;
let audioCtx, ambientNodes = [];
let deferredPrompt = null;

const $ = (id) => document.getElementById(id);
const list = $("waypointList");
const manual = $("manualButtons");

function initUI(){
  waypoints.forEach(w => {
    const li = document.createElement("li");
    li.id = "wp-" + w.id;
    li.innerHTML = `<strong>${w.title}</strong><br><small>${w.lat.toFixed(5)}, ${w.lon.toFixed(5)}</small>`;
    list.appendChild(li);

    const b = document.createElement("button");
    b.textContent = `${w.id}. ${w.title}`;
    b.onclick = () => playGuide(w);
    manual.appendChild(b);
  });

  $("radius").oninput = e => $("radiusValue").textContent = e.target.value;
  $("musicVol").oninput = e => $("musicValue").textContent = e.target.value;
  $("voiceVol").oninput = e => $("voiceValue").textContent = e.target.value;

  $("startBtn").onclick = startGPS;
  $("stopBtn").onclick = stopGPS;
  $("testAmbient").onclick = () => { startAmbient(); setTimeout(stopAmbient, 6000); };
  $("stopAudio").onclick = stopAllAudio;
  $("resetPlayed").onclick = () => { played = new Set(); localStorage.removeItem("playedWaypoints"); renderPlayed(); };

  $("installBtn").onclick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $("installBtn").hidden = true;
  };
  renderPlayed();
}

function renderPlayed(activeId=null){
  waypoints.forEach(w => {
    const li = $("wp-" + w.id);
    li.classList.toggle("done", played.has(w.id));
    li.classList.toggle("active", activeId === w.id);
  });
}

function distMeters(lat1, lon1, lat2, lon2){
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function startGPS(){
  if (!navigator.geolocation) {
    $("gpsStatus").textContent = "Este navegador no soporta GPS";
    return;
  }
  $("gpsStatus").textContent = "Solicitando permiso GPS...";
  watchId = navigator.geolocation.watchPosition(onPosition, onGeoError, {
    enableHighAccuracy: true,
    maximumAge: 5000,
    timeout: 15000
  });
}

function stopGPS(){
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
  $("gpsStatus").textContent = "GPS parado";
  renderPlayed();
}

function onGeoError(err){
  $("gpsStatus").textContent = "Error GPS: " + err.message;
}

function onPosition(pos){
  const {latitude, longitude, accuracy} = pos.coords;
  $("gpsStatus").textContent = `GPS activo · precisión ${Math.round(accuracy)} m`;

  let nearest = null, min = Infinity;
  waypoints.forEach(w => {
    const d = distMeters(latitude, longitude, w.lat, w.lon);
    if (d < min) { min = d; nearest = w; }
  });

  $("nearestStatus").textContent = `Más cercano: ${nearest.title} · ${Math.round(min)} m`;
  renderPlayed(nearest.id);

  const radius = Number($("radius").value);
  if (nearest && min <= radius && !played.has(nearest.id) && !currentSpeaking) {
    playGuide(nearest);
  }
}

function getSpanishVoice(){
  const voices = speechSynthesis.getVoices();
  return voices.find(v => v.lang === "es-ES") || voices.find(v => v.lang.startsWith("es")) || null;
}

function speak(text){
  return new Promise(resolve => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = getSpanishVoice();
    if (voice) u.voice = voice;
    u.lang = "es-ES";
    u.rate = 0.92;
    u.pitch = 1.0;
    u.volume = Number($("voiceVol").value) / 100;
    u.onend = resolve;
    u.onerror = resolve;
    speechSynthesis.speak(u);
  });
}

async function playGuide(w){
  currentSpeaking = true;
  renderPlayed(w.id);
  startAmbient();
  await speak(w.text);
  stopAmbient();
  played.add(w.id);
  localStorage.setItem("playedWaypoints", JSON.stringify([...played]));
  currentSpeaking = false;
  renderPlayed();
}

function startAmbient(){
  stopAmbient();
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioCtx = new AudioContext();

  const master = audioCtx.createGain();
  master.gain.value = Number($("musicVol").value) / 100;
  master.connect(audioCtx.destination);

  const notes = [196, 246.94, 293.66, 392];
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.045 / (i+1);
    osc.connect(gain).connect(master);
    osc.start();
    ambientNodes.push(osc, gain);
  });

  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.015;
  lfo.connect(lfoGain).connect(master.gain);
  lfo.start();
  ambientNodes.push(lfo, lfoGain, master);
}

function stopAmbient(){
  ambientNodes.forEach(n => {
    try { if (n.stop) n.stop(); } catch(e){}
    try { if (n.disconnect) n.disconnect(); } catch(e){}
  });
  ambientNodes = [];
  if (audioCtx) { try { audioCtx.close(); } catch(e){} }
  audioCtx = null;
}

function stopAllAudio(){
  speechSynthesis.cancel();
  stopAmbient();
  currentSpeaking = false;
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  $("installBtn").hidden = false;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

speechSynthesis.onvoiceschanged = () => {};
initUI();
