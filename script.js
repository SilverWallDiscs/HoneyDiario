const loading = document.getElementById("loading");
const grid = document.getElementById("messages-grid");
const emptyState = document.getElementById("empty-state");
const errorState = document.getElementById("error-state");
const latestSection = document.getElementById("latest-section");
const latestCard = document.getElementById("latest-card");

const isConfigured =
  typeof SUPABASE_URL === "string" &&
  typeof SUPABASE_ANON_KEY === "string" &&
  !SUPABASE_URL.includes("https://rnppkatenafgptskrqhs.supabase.co") &&
  !SUPABASE_ANON_KEY.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucHBrYXRlbmFmZ3B0c2tycWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MTk2OTMsImV4cCI6MjEwNDM5NTY5M30.44YRXWvPTgHe-8uDkCp9Zpheq7TqTxouP06GOmZYWwA");

let db = null;

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadMessages() {
  if (!isConfigured) {
    loading.hidden = true;
    errorState.hidden = false;
    return;
  }

  db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await db
    .from("messages")
    .select("id, day_number, title, message, created_at")
    .order("day_number", { ascending: false });

  loading.hidden = true;

  if (error) {
    console.error(error);
    errorState.hidden = false;
    return;
  }

  if (!data || data.length === 0) {
    emptyState.hidden = false;
    return;
  }

  const latest = data[0];
  latestCard.querySelector(".latest-card__day").textContent = `Día ${latest.day_number}`;
  latestCard.querySelector("h3").textContent = latest.title;
  latestCard.querySelector("p").textContent = latest.message;
  latestSection.hidden = false;

  grid.innerHTML = data
    .map(
      (item) => `
        <article class="day-card reveal">
          <span class="day-number">Día ${item.day_number}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.message)}</p>
        </article>
      `
    )
    .join("");

  observeRevealElements();
}

function observeRevealElements() {
  const items = document.querySelectorAll(".reveal:not(.visible)");

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

function createHeart() {
  const container = document.querySelector(".floating-hearts");
  const heart = document.createElement("span");
  heart.textContent = Math.random() > 0.5 ? "♡" : "♥";
  heart.style.left = `${Math.random() * 100}vw`;
  heart.style.fontSize = `${12 + Math.random() * 18}px`;
  heart.style.animationDuration = `${9 + Math.random() * 7}s`;
  container.appendChild(heart);
  setTimeout(() => heart.remove(), 17000);
}

observeRevealElements();
loadMessages();
setInterval(createHeart, 2200);
