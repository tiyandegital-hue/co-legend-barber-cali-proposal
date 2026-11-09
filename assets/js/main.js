/* Legend Barber — interacciones: menú móvil, banner de cookies,
   filtros de galería, bot de reservas por WhatsApp (flujo de 5 pasos),
   formulario de contacto. Sin dependencias. */
(function () {
  "use strict";

  /* ---------- Menú móvil ---------- */
  var botonMenu = document.querySelector(".menu-boton");
  var menu = document.getElementById("menu-principal");
  if (botonMenu && menu) {
    botonMenu.addEventListener("click", function () {
      var abierto = menu.classList.toggle("abierto");
      botonMenu.setAttribute("aria-expanded", abierto ? "true" : "false");
      botonMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("abierto");
        botonMenu.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Banner de cookies ---------- */
  var banner = document.getElementById("cookies");
  var btnCookies = document.getElementById("cookies-aceptar");
  if (banner && btnCookies) {
    try {
      if (!localStorage.getItem("lb-cookies")) banner.hidden = false;
    } catch (e) { banner.hidden = false; }
    btnCookies.addEventListener("click", function () {
      try { localStorage.setItem("lb-cookies", "1"); } catch (e) {}
      banner.hidden = true;
    });
  }

  /* ---------- Filtros de galería ---------- */
  var filtros = document.querySelectorAll(".filtro");
  var tiles = document.querySelectorAll(".tile");
  if (filtros.length && tiles.length) {
    filtros.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filtros.forEach(function (b) {
          b.classList.remove("activo");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("activo");
        btn.setAttribute("aria-pressed", "true");
        var f = btn.getAttribute("data-filtro");
        var visibles = 0;
        tiles.forEach(function (t) {
          var mostrar = f === "todos" || t.getAttribute("data-categoria") === f;
          t.classList.toggle("oculto", !mostrar);
          if (mostrar) visibles++;
        });
        var total = document.querySelector('.filtro[data-filtro="todos"]');
        if (total) total.textContent = "Todos [" + String(visibles).padStart(2, "0") + "]";
      });
    });
    /* Toque en móvil: primer toque expande la ficha, segundo no hace nada extra */
    tiles.forEach(function (t) {
      t.addEventListener("click", function () {
        if (window.matchMedia("(hover: none)").matches) {
          tiles.forEach(function (o) { o.classList.remove("expandido"); });
          t.classList.add("expandido");
        }
      });
    });
  }

  /* ---------- Bot de reservas (flujo de 5 pasos) ---------- */
  var chat = document.getElementById("chat");
  var opciones = document.getElementById("chat-opciones");
  if (chat && opciones) {
    var WA_NUMERO = "573128234254";
    var estado = { servicio: null, barbero: null, dia: null, hora: null };

    function horaAhora() {
      var d = new Date();
      var h = d.getHours(), m = d.getMinutes();
      var ampm = h >= 12 ? "p. m." : "a. m.";
      var hh = h % 12; if (hh === 0) hh = 12;
      return hh + ":" + (m < 10 ? "0" + m : m) + " " + ampm;
    }
    function burbuja(texto, quien) {
      var div = document.createElement("div");
      div.className = "burbuja " + (quien === "yo" ? "burbuja-yo" : "burbuja-bot");
      var span = document.createElement("span");
      span.textContent = texto;
      div.appendChild(span);
      var small = document.createElement("small");
      small.textContent = horaAhora() + (quien === "yo" ? " ✓✓" : "");
      div.appendChild(small);
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }
    function limpiarOpciones() { opciones.innerHTML = ""; }
    function boton(texto, alClick) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn btn-linea";
      b.textContent = texto;
      b.addEventListener("click", alClick);
      opciones.appendChild(b);
      return b;
    }
    function enlace(texto, href) {
      var a = document.createElement("a");
      a.className = "enlace-opcion";
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = texto;
      opciones.appendChild(a);
      return a;
    }

    function paso1() {
      limpiarOpciones();
      burbuja("¡Hola! Soy el asistente de Legend Barber 💈 ¿Qué te hacemos hoy?", "bot");
      ["Corte Estándar", "Corte con Barba", "Corte con Cejas"].forEach(function (s) {
        boton(s, function () {
          estado.servicio = s;
          burbuja(s, "yo");
          paso2();
        });
      });
    }
    function paso2() {
      limpiarOpciones();
      burbuja("Perfecto. ¿Con qué barbero?", "bot");
      boton("El que esté disponible", function () {
        estado.barbero = "El que esté disponible";
        burbuja("El que esté disponible", "yo");
        paso3();
      });
      boton("Elegir barbero", function () {
        burbuja("Elegir barbero", "yo");
        limpiarOpciones();
        burbuja("Puedes ver a los barberos en la página de Barberos. ¿Seguimos con el que esté disponible?", "bot");
        enlace("Ver barberos →", "barberos.html");
        boton("Sí, el que esté disponible", function () {
          estado.barbero = "El que esté disponible";
          burbuja("El que esté disponible", "yo");
          paso3();
        });
      });
    }
    function paso3() {
      limpiarOpciones();
      burbuja("¿Qué día te viene bien?", "bot");
      ["Hoy", "Mañana", "Esta semana"].forEach(function (d) {
        boton(d, function () {
          estado.dia = d;
          burbuja(d, "yo");
          paso4();
        });
      });
    }
    function paso4() {
      limpiarOpciones();
      burbuja("¿A qué hora?", "bot");
      ["Mañana", "Tarde", "Noche"].forEach(function (h) {
        boton(h, function () {
          estado.hora = h;
          burbuja(h, "yo");
          paso5();
        });
      });
    }
    function paso5() {
      limpiarOpciones();
      burbuja(
        "Listo ✅ " + estado.servicio + " — " + estado.dia + ", " + estado.hora +
        ". Te esperamos en Calle 27 #40-40, Cali. ¿Confirmamos por WhatsApp?",
        "bot"
      );
      var texto = "Hola Legend Barber, quiero confirmar mi reserva: " +
        estado.servicio + " — " + estado.dia + ", " + estado.hora +
        " (" + estado.barbero + ").";
      var a = document.createElement("a");
      a.className = "btn btn-ambar";
      a.href = "https://wa.me/" + WA_NUMERO + "?text=" + encodeURIComponent(texto);
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Confirmar por WhatsApp";
      opciones.appendChild(a);
      var reinicio = document.createElement("button");
      reinicio.type = "button";
      reinicio.className = "btn btn-linea";
      reinicio.textContent = "Empezar de nuevo";
      reinicio.addEventListener("click", function () {
        estado = { servicio: null, barbero: null, dia: null, hora: null };
        chat.innerHTML = "";
        paso1();
      });
      opciones.appendChild(reinicio);
    }

    paso1();
  }

  /* ---------- Formulario de contacto ---------- */
  var form = document.getElementById("form-contacto");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var nombre = document.getElementById("f-nombre");
      var telefono = document.getElementById("f-telefono");
      var consent = document.getElementById("f-consentimiento");
      function marcar(campo, errId, valido) {
        var err = document.getElementById(errId);
        campo.setAttribute("aria-invalid", valido ? "false" : "true");
        if (err) err.hidden = valido;
        if (!valido) ok = false;
      }
      marcar(nombre, "err-nombre", nombre.value.trim().length >= 2);
      marcar(telefono, "err-telefono", telefono.value.trim().length >= 7);
      var errC = document.getElementById("err-consentimiento");
      if (errC) errC.hidden = consent.checked;
      if (!consent.checked) ok = false;
      if (!ok) {
        var primerError = form.querySelector('[aria-invalid="true"]') || consent;
        if (primerError) primerError.focus();
        return;
      }
      var servicio = document.getElementById("f-servicio").value;
      var mensaje = document.getElementById("f-mensaje").value.trim();
      var texto = "Hola Legend Barber, soy " + nombre.value.trim() +
        ". Me interesa: " + servicio + "." +
        (mensaje ? " " + mensaje : "") +
        " Mi WhatsApp: " + telefono.value.trim() + ".";
      var exito = document.getElementById("form-exito");
      var enlaceWa = document.getElementById("form-exito-wa");
      if (enlaceWa) enlaceWa.href = "https://wa.me/573128234254?text=" + encodeURIComponent(texto);
      form.hidden = true;
      if (exito) {
        exito.hidden = false;
        exito.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
})();
