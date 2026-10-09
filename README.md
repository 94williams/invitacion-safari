# Mi pequeño safari · Aldo Aldair

Invitación digital para los 2 años de Aldo Aldair. Copia independiente de `94williams/invitacion-aldo-aldair`, con el historial original y un diseño safari nuevo.

**Fecha:** domingo 25 de octubre de 2026, 12:00 p. m. (Ciudad de México, UTC−06:00). **Sede:** Parque de los Coyotes, Palapa 6. Contactos y enlaces conservados del original.

## Diseño

Acabados: textura de papel muy suave, luz cálida en la portada, separadores botánicos dorados, sello de la expedición y destellos breves en los botones. Al abrir una fotografía aparece un marco de álbum con leyenda manuscrita en Caveat, alojada localmente. Las hojas de acacia y palmera se balancean solo cuando están a la vista; se respeta la preferencia de reducir movimiento.

Ilustración original en acuarela de la sabana africana, fotografías de elefantes, jirafas y un león; marfil, verde bosque, oliva y oro mate. Cormorant Garamond y DM Sans, alojadas localmente. Sin iconos SVG ni dependencias de JavaScript. Los animales son propios de la temática de sabana africana; no se presentan como especies endémicas de México.

Cuenta regresiva con zona horaria explícita; descarga de calendario `.ics`; ubicación en Google Maps; galería ampliable con teclado y Escape; compartir; confirmación por WhatsApp con ambos anfitriones; animaciones que respetan movimiento reducido. La invitación permanece legible sin JavaScript. Los efectos de apertura, personajes y música de la temática anterior se retiraron del diseño nuevo.

## Uso y personalización

Sitio estático: no requiere instalación ni compilación. Abre `index.html` o sirve la carpeta con un servidor HTTP. Para publicarlo en GitHub Pages, usa la rama `main` y la carpeta `/ (root)`.

La lógica está en `script.js`, el contenido visible en `index.html` y el diseño en `styles.css`. Para otro festejo, actualiza `CONFIG` y las menciones visibles en HTML (nombre, edad, fecha, horarios, sede y contactos), además de los metadatos de compartir. La fecha ISO incluye `-06:00` para que el calendario y la cuenta regresiva coincidan en cualquier país.

Los archivos de imagen y de fuentes se encuentran dentro del repositorio. `assets/safari/SOURCES.md` documenta créditos, licencias y generación de la ilustración.

## Confirmaciones

Se conservó el endpoint de Apps Script del original porque la copia usa por ahora el mismo festejo. **Ambas invitaciones comparten el registro de asistencia.** No se creó otra hoja de cálculo. Se incluye `GoogleAppsScript.gs` como código de referencia; no se modificó la implementación remota.

El formulario abre WhatsApp durante el clic y guarda el registro adicional de forma asíncrona. Nunca afirma que el mensaje fue enviado: el invitado debe enviarlo en WhatsApp. Si el registro adicional falla, el mensaje preparado sigue disponible. No se enviaron mensajes ni confirmaciones reales durante las pruebas.

Para un festejo nuevo, implementa `GoogleAppsScript.gs` en una hoja distinta y sustituye `CONFIG.rsvpEndpoint`, o déjalo vacío para usar solamente WhatsApp. El origen permitido por el backend es `https://94williams.github.io`.

## Créditos

Fotografías de animales obtenidas de Unsplash bajo su licencia. Fuentes de Google Fonts bajo SIL Open Font License, con copias de las licencias incluidas. Ilustración creada con la herramienta integrada ImageGen para este proyecto.
