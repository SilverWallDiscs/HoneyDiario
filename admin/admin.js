const isConfigured =
  typeof SUPABASE_URL === "string" &&
  typeof SUPABASE_ANON_KEY === "string" &&
  !SUPABASE_URL.includes("TU-PROYECTO") &&
  !SUPABASE_ANON_KEY.includes("TU-ANON-KEY");

const warning = document.getElementById("config-warning");
const loginPanel = document.getElementById("login-panel");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const messageForm = document.getElementById("message-form");
const saveMessage = document.getElementById("save-message");
const messagesList = document.getElementById("messages-list");
const listEmpty = document.getElementById("list-empty");

const idInput = document.getElementById("message-id");
const dayInput = document.getElementById("day-number");
const titleInput = document.getElementById("title");
const messageInput = document.getElementById("message");
const previewDay = document.getElementById("preview-day");
const previewTitle = document.getElementById("preview-title");
const previewMessage = document.getElementById("preview-message");
const modeLabel = document.getElementById("mode-label");
const formTitle = document.getElementById("form-title");
const saveBtn = document.getElementById("save-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

let db = null;
let currentMessages = [];

if (!isConfigured) {
  warning.hidden = false;
  loginPanel.hidden = true;
} else {
  db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  init();
}

async function init() {
  const { data } = await db.auth.getSession();
  updateAuthUI(data.session);
}

async function updateAuthUI(session) {
  const loggedIn = Boolean(session);
  loginPanel.hidden = loggedIn;
  dashboard.hidden = !loggedIn;

  if (loggedIn) {
    await loadMessages();
    setSuggestedDay();
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const submit = loginForm.querySelector("button[type='submit']");
  submit.disabled = true;

  const { data, error } = await db.auth.signInWithPassword({ email, password });
  submit.disabled = false;

  if (error) {
    loginError.textContent = "No pude iniciar sesión. Revisa el email y la contraseña.";
    return;
  }

  updateAuthUI(data.session);
});

logoutBtn.addEventListener("click", async () => {
  await db.auth.signOut();
  dashboard.hidden = true;
  loginPanel.hidden = false;
});

async function loadMessages() {
  const { data, error } = await db
    .from("messages")
    .select("id, day_number, title, message, created_at")
    .order("day_number", { ascending: false });

  if (error) {
    messagesList.innerHTML = `<p class="form-message error">No pude cargar los mensajes.</p>`;
    return;
  }

  currentMessages = data || [];
  renderMessages();
}

function renderMessages() {
  listEmpty.hidden = currentMessages.length !== 0;

  messagesList.innerHTML = currentMessages
    .map(
      (item) => `
        <article class="message-row" data-id="${item.id}">
          <div class="message-row__day">Día ${item.day_number}</div>
          <div>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.message)}</p>
          </div>
          <div class="row-actions">
            <button type="button" class="secondary-btn edit-btn" data-id="${item.id}">Editar</button>
            <button type="button" class="delete-btn" data-id="${item.id}">Borrar</button>
          </div>
        </article>
      `
    )
    .join("");
}

messagesList.addEventListener("click", async (event) => {
  const id = Number(event.target.dataset.id);
  if (!id) return;

  if (event.target.classList.contains("edit-btn")) {
    const item = currentMessages.find((m) => m.id === id);
    if (item) startEdit(item);
  }

  if (event.target.classList.contains("delete-btn")) {
    const item = currentMessages.find((m) => m.id === id);
    if (!item) return;

    const ok = confirm(`¿Borrar el Día ${item.day_number}: "${item.title}"?`);
    if (!ok) return;

    event.target.disabled = true;
    const { error } = await db.from("messages").delete().eq("id", id);

    if (error) {
      alert("No pude borrar el mensaje.");
      event.target.disabled = false;
      return;
    }

    if (Number(idInput.value) === id) resetForm();
    await loadMessages();
    setSuggestedDay();
  }
});

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  saveMessage.textContent = "";

  const payload = {
    day_number: Number(dayInput.value),
    title: titleInput.value.trim(),
    message: messageInput.value.trim(),
  };

  if (!payload.day_number || !payload.title || !payload.message) return;

  saveBtn.disabled = true;

  let result;
  if (idInput.value) {
    result = await db
      .from("messages")
      .update(payload)
      .eq("id", Number(idInput.value));
  } else {
    result = await db.from("messages").insert(payload);
  }

  saveBtn.disabled = false;

  if (result.error) {
    if (result.error.code === "23505") {
      saveMessage.textContent = `Ya existe un mensaje para el Día ${payload.day_number}. Puedes editarlo desde la lista.`;
      saveMessage.classList.add("error");
    } else {
      console.error(result.error);
      saveMessage.textContent = "No pude guardar el mensaje. Revisa la configuración y las políticas de Supabase.";
      saveMessage.classList.add("error");
    }
    return;
  }

  saveMessage.classList.remove("error");
  saveMessage.textContent = idInput.value ? "Mensaje actualizado ♡" : "Mensaje publicado ♡";

  resetForm(false);
  await loadMessages();
  setSuggestedDay();

  setTimeout(() => {
    saveMessage.textContent = "";
  }, 2500);
});

cancelEditBtn.addEventListener("click", () => {
  resetForm();
  setSuggestedDay();
});

function startEdit(item) {
  idInput.value = item.id;
  dayInput.value = item.day_number;
  titleInput.value = item.title;
  messageInput.value = item.message;

  modeLabel.textContent = "Editando mensaje";
  formTitle.textContent = `Editar Día ${item.day_number}`;
  saveBtn.textContent = "Guardar cambios";
  cancelEditBtn.hidden = false;

  updatePreview();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm(clearDay = true) {
  idInput.value = "";
  if (clearDay) dayInput.value = "";
  titleInput.value = "";
  messageInput.value = "";
  modeLabel.textContent = "Nuevo mensaje";
  formTitle.textContent = "Agregar un día";
  saveBtn.textContent = "Publicar mensaje";
  cancelEditBtn.hidden = true;
  updatePreview();
}

function setSuggestedDay() {
  if (idInput.value || dayInput.value) return;
  const maxDay = currentMessages.reduce((max, item) => Math.max(max, item.day_number), 0);
  dayInput.value = maxDay + 1;
  updatePreview();
}

function updatePreview() {
  previewDay.textContent = `Día ${dayInput.value || 1}`;
  previewTitle.textContent = titleInput.value.trim() || "Tu título aparecerá aquí";
  previewMessage.textContent =
    messageInput.value.trim() || "Tu mensaje aparecerá aquí mientras escribes.";
}

[dayInput, titleInput, messageInput].forEach((input) =>
  input.addEventListener("input", updatePreview)
);

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
