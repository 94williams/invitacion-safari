"use strict";

const CONFIG = {
  nombre: "Aldo Aldair",
  edad: 2,
  fechaEvento: "2026-10-25T12:00:00-06:00",
  lugar: {
    nombre: "Parque de los coyotes Palapa 6",
    direccion: "Calzada De La Virgen, Rosa María Sequeira, Coapa, Ex-Ejido de San Pablo Tepetlapa, 04840 Ciudad de México, CDMX",
    maps: "https://maps.app.goo.gl/89LAJ5LPcYw8SaTS9"
  },
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycby2PxLlpUmjLW0lpsnsXYlMq-VefkgrbHGVqH6aRWV4CJQua2616a4tE1B4FQY6UpWm/exec",
  whatsappContacts: [
    { id: "edmundo", name: "Edmundo Bustos", phone: "525522995162" },
    { id: "ana-karen", name: "Ana Karen Muñoz", phone: "525537365974" }
  ]
};
const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const eventDate = new Date(CONFIG.fechaEvento);
let countdownTimer;

function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => $("toast").classList.remove("show"), 5000);
}

function updateCountdown() {
  const remaining = eventDate.getTime() - Date.now();
  const diff = Math.max(0, remaining);
  const units = [Math.floor(diff / 86400000), Math.floor(diff % 86400000 / 3600000), Math.floor(diff % 3600000 / 60000), Math.floor(diff % 60000 / 1000)];
  ["days", "hours", "minutes", "seconds"].forEach((id, index) => { $(id).textContent = String(units[index]).padStart(2, "0"); });
  $("countdown").hidden = remaining <= 0;
  $("countdownStatus").hidden = remaining > 0;
  if (remaining <= 0 && countdownTimer) clearInterval(countdownTimer);
}

function downloadICS() {
  const end = new Date(eventDate.getTime() + 4 * 3600000);
  const format = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escape = (value) => String(value).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mi Pequeno Safari//Invitacion ES//", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${eventDate.getTime()}@invitacion-safari`, `DTSTAMP:${format(new Date())}`, `DTSTART:${format(eventDate)}`, `DTEND:${format(end)}`, `SUMMARY:${escape(`${CONFIG.edad} años de ${CONFIG.nombre}`)}`, `DESCRIPTION:${escape(`El safari de ${CONFIG.nombre}. ¡Te esperamos!`)}`, `LOCATION:${escape(`${CONFIG.lugar.nombre} - ${CONFIG.lugar.direccion}`)}`, "END:VEVENT", "END:VCALENDAR"];
  // RFC 5545: fold long content lines at 75 UTF-8 octets, without splitting a code point.
  const fold = (line) => {
    const encoder = new TextEncoder();
    let output = "", length = 0;
    for (const char of line) {
      const size = encoder.encode(char).length;
      if (length + size > 75) { output += "\r\n "; length = 1; }
      output += char; length += size;
    }
    return output;
  };
  const url = URL.createObjectURL(new Blob([lines.map(fold).join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "Safari-Aldo-Aldair.ics";
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Fecha descargada. Abre el archivo con tu calendario.");
}

function createWhatsAppUrl(phone, message) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) digits = "52" + digits;
  if (!/^52\d{10}$/.test(digits)) return "";
  return `https://api.whatsapp.com/send?phone=${digits}&text=${encodeURIComponent(message)}`;
}

function saveRsvp(name, count, website) {
  return new Promise((resolve, reject) => {
    const requestId = `rsvp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const frame = document.createElement("iframe"), form = document.createElement("form");
    frame.name = requestId; frame.hidden = true;
    form.hidden = true; form.method = "post"; form.action = CONFIG.rsvpEndpoint; form.target = requestId;
    for (const [key, value] of Object.entries({ requestId, name, count: String(count), website })) {
      const input = document.createElement("input");
      input.type = "hidden"; input.name = key; input.value = value; form.appendChild(input);
    }
    const cleanup = () => { window.removeEventListener("message", onMessage); clearTimeout(timeout); frame.remove(); form.remove(); };
    const onMessage = (event) => {
      if (event.source !== frame.contentWindow || event.data?.type !== "rsvp-result" || event.data.requestId !== requestId) return;
      cleanup();
      if (event.data.ok) resolve(); else reject(new Error("No se pudo guardar el registro."));
    };
    const timeout = setTimeout(() => { cleanup(); reject(new Error("No recibimos respuesta del registro.")); }, 20000);
    window.addEventListener("message", onMessage); document.body.append(frame, form); form.submit();
  });
}

async function rsvpSubmit(event) {
  event.preventDefault();
  const name = $("guestName").value.trim();
  const count = Number($("guestCount").value);
  const website = $("guestWebsite").value.trim();
  if (website) return;
  if (!name || name.length > 80) { $("guestName").focus(); showToast("Escribe tu nombre para confirmar."); return; }
  if (!Number.isInteger(count) || count < 1 || count > 6) { showToast("Elige entre 1 y 6 personas."); return; }
  const contact = CONFIG.whatsappContacts.find((item) => item.id === event.submitter?.dataset.contact);
  if (!contact) { showToast("Elige con quién deseas confirmar."); return; }
  const message = `¡Hola! Soy ${name}. Confirmo nuestra asistencia al safari de ${CONFIG.nombre} por sus ${CONFIG.edad} años. Asistiremos ${count} ${count === 1 ? "persona" : "personas"}. ¡Nos vemos en la aventura!`;
  const url = createWhatsAppUrl(contact.phone, message);
  if (!url) { showToast("El número de WhatsApp no es válido."); return; }
  // Open during the user's click; asynchronous saving must not trigger popup blocking.
  const whatsappWindow = window.open(url, "_blank");
  if (!whatsappWindow) { showToast("Permite abrir WhatsApp en tu navegador y vuelve a intentarlo."); return; }
  whatsappWindow.opener = null;
  $("rsvpStatus").textContent = `WhatsApp abierto. Envía tu mensaje a ${contact.name} para completar la confirmación.`;
  if (!CONFIG.rsvpEndpoint) return;
  const buttons = [...$("rsvpForm").querySelectorAll("button[type=submit]")];
  buttons.forEach((button) => { button.disabled = true; });
  try {
    await saveRsvp(name, count, website);
    $("rsvpStatus").textContent = `Registro guardado. Recuerda enviar el mensaje de WhatsApp a ${contact.name}.`;
  } catch (_) {
    $("rsvpStatus").textContent = "WhatsApp se abrió, pero no se guardó el registro adicional. Envía tu mensaje para confirmar directamente con el anfitrión.";
  } finally { buttons.forEach((button) => { button.disabled = false; }); }
}

async function shareInvitation() {
  const data = { title: `El safari de ${CONFIG.nombre}`, text: `¡Acompáñame a celebrar mis ${CONFIG.edad} años!`, url: window.location.href };
  try {
    if (navigator.share) await navigator.share(data);
    else if (navigator.clipboard) { await navigator.clipboard.writeText(data.url); showToast("Enlace copiado. ¡Comparte la aventura!"); }
    else showToast("Copia el enlace del navegador para compartir esta invitación.");
  } catch (error) { if (error.name !== "AbortError") showToast("Copia el enlace del navegador para compartir la invitación."); }
}

function observeReveal() {
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
  }), { threshold: 0.08, rootMargin: "0px 0px -35px 0px" });
  document.querySelectorAll(".reveal").forEach((element) => {
    const siblings = [...element.parentElement.children].filter((child) => child.classList.contains("reveal"));
    element.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(element), 3) * 90}ms`);
    observer.observe(element);
  });
  document.body.classList.add("js-motion");
  document.addEventListener("focusin", (event) => {
    const element = event.target.closest(".reveal");
    if (element) { element.classList.add("visible"); observer.unobserve(element); }
  });
  const foliageObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    entry.target.classList.toggle("in-view", entry.isIntersecting);
  }));
  document.querySelectorAll(".safari-foliage, .cover-sun").forEach((element) => foliageObserver.observe(element));
}

function updateScroll() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  $("progressBar").style.width = `${total > 0 ? window.scrollY / total * 100 : 0}%`;
  const pastCover = document.querySelector(".cover").getBoundingClientRect().bottom < 80;
  const nearRsvp = $("rsvp").getBoundingClientRect().top < window.innerHeight * 0.95;
  $("stickyRsvp").hidden = !pastCover || nearRsvp;
}
let scrollPending = false;
window.addEventListener("scroll", () => {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => { updateScroll(); scrollPending = false; });
}, { passive: true });
window.addEventListener("resize", updateScroll);

const dialog = $("photoDialog");
document.querySelectorAll(".memory").forEach((button) => {
  button.addEventListener("click", () => {
    const photo = button.querySelector("img");
    $("photoLarge").src = photo.src; $("photoLarge").alt = photo.alt;
    $("photoCaption").textContent = button.dataset.caption;
    $("photoStory").textContent = button.dataset.story || "";
    dialog.showModal(); document.body.classList.add("modal-open");
  });
});
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener("close", () => document.body.classList.remove("modal-open"));
$("openBtn").addEventListener("click", () => $("mainContent").focus({ preventScroll: true }));
$("mapsBtn").href = CONFIG.lugar.maps;
$("calendarBtn").addEventListener("click", downloadICS);
$("rsvpForm").addEventListener("submit", rsvpSubmit);
$("shareBtn").addEventListener("click", shareInvitation);
updateCountdown();
if (eventDate.getTime() > Date.now()) countdownTimer = setInterval(updateCountdown, 1000);
observeReveal(); updateScroll();
