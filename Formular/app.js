const FORMSPREE_ENDPOINT = "https://formspree.io/f/mqarvpve";

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function setMsg(text) {
  $("#clientMsg").textContent = text || "";
}

function disableAllSubforms() {
  $$(".subform").forEach(sf => {
    sf.hidden = true;
    sf.querySelectorAll("input, select, textarea").forEach(el => (el.disabled = true));
  });
}

function showSubform(key) {
  $$(".subform").forEach(sf => {
    const active = sf.getAttribute("data-form") === key;
    sf.hidden = !active;
    sf.querySelectorAll("input, select, textarea").forEach(el => (el.disabled = !active));
  });
  syncTaskFrequencies(); // po przełączeniu obiektu
}

/* CHECKBOX → włącz/wyłącz select częstotliwości obok */
function syncTaskFrequencies() {
  $$(".freq-select").forEach(sel => {
    const linkedName = sel.getAttribute("data-linked");
    const cb = linkedName ? document.querySelector(`input[type="checkbox"][name="${linkedName}"]`) : null;
    if (!cb) return;
    sel.disabled = !cb.checked || sel.closest(".subform")?.hidden === true;
  });
}

window.addEventListener("load", () => {
  // SPLASH – 4 Sekunden
  setTimeout(() => $("#splash")?.classList.add("is-hidden"), 4000);
  syncTaskFrequencies();
});

$("#objectCategory").addEventListener("change", (e) => {
  showSubform(e.target.value);
});

$("#resetBtn").addEventListener("click", () => {
  $("#clientForm").reset();
  setMsg("");
  disableAllSubforms();
  syncTaskFrequencies();
});

/* delegacja: jak zmienisz checkbox → od razu aktywuje select obok */
$("#clientForm").addEventListener("change", (e) => {
  if (e.target && e.target.matches('input[type="checkbox"]')) {
    syncTaskFrequencies();
  }
});

$("#clientForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("Senden…");

  const form = e.currentTarget;
  if (!form.checkValidity()) {
    setMsg("Bitte füllen Sie alle Pflichtfelder (*) korrekt aus.");
    form.reportValidity();
    return;
  }

  // zbieramy tylko aktywne (nieaktywne subformy są disabled)
  const fd = new FormData(form);
  const payload = {};
  for (const [k, v] of fd.entries()) payload[k] = v;

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      setMsg("Fehler beim Senden ❌ (Bitte später erneut versuchen)");
      return;
    }

    setMsg("Anfrage wurde gesendet ✅");
    form.reset();
    disableAllSubforms();
    syncTaskFrequencies();
  } catch {
    setMsg("Netzwerkfehler ❌ (Keine Verbindung)");
  }
});

disableAllSubforms();
