/* ================================================
   LIFE DASHBOARD — app.js
   ================================================ */

'use strict';

/* ------------------------------------------------
   1. CLOCK & GREETING
   ------------------------------------------------ */

const clockEl    = document.getElementById('clock');
const dateEl     = document.getElementById('date');
const greetingEl = document.getElementById('greeting');

/**
 * Returns a greeting string based on the current hour.
 * @param {number} hour - 0-23
 * @returns {string}
 */
function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good morning! ☀️';
  if (hour >= 12 && hour < 17) return 'Good afternoon! 🌤️';
  if (hour >= 17 && hour < 21) return 'Good evening! 🌆';
  return 'Good night! 🌙';
}

/**
 * Formats a Date object into a readable string.
 * e.g. "Saturday, July 18, 2026"
 * @param {Date} now
 * @returns {string}
 */
function formatDate(now) {
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

/**
 * Pads a number to 2 digits.
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

/** Updates the clock, date, and greeting every second. */
function updateClock() {
  const now = new Date();
  const h   = now.getHours();
  const m   = now.getMinutes();
  const s   = now.getSeconds();

  clockEl.textContent    = `${pad(h)}:${pad(m)}:${pad(s)}`;
  dateEl.textContent     = formatDate(now);
  greetingEl.textContent = getGreeting(h);
}

// Run immediately so there's no 1-second blank
updateClock();
setInterval(updateClock, 1000);


/* ------------------------------------------------
   2. LIGHT / DARK MODE
   ------------------------------------------------ */

const THEME_KEY      = 'dashboard_theme';
const htmlEl         = document.documentElement;
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIconEl    = document.getElementById('theme-icon');

/**
 * Applies a theme to the document and updates the toggle icon.
 * @param {'dark'|'light'} theme
 */
function applyTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  themeIconEl.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggleBtn.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );
}

/** Toggles between dark and light, persists to LocalStorage. */
function toggleTheme() {
  const current = htmlEl.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next    = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

// Load saved theme (default: dark)
applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
themeToggleBtn.addEventListener('click', toggleTheme);


/* ------------------------------------------------
   3. FOCUS TIMER
   ------------------------------------------------ */

const TIMER_DURATION_KEY  = 'dashboard_timer_duration';
const DEFAULT_MINUTES     = 25;

const timerDisplayEl      = document.getElementById('timer-display');
const timerLabelEl        = document.getElementById('timer-label');
const timerStartBtn       = document.getElementById('timer-start');
const timerStopBtn        = document.getElementById('timer-stop');
const timerResetBtn       = document.getElementById('timer-reset');
const timerDurationInput  = document.getElementById('timer-duration-input');
const timerDurationSetBtn = document.getElementById('timer-duration-set');

/**
 * Returns the saved duration in seconds, falling back to the default.
 * @returns {number}
 */
function getSavedDuration() {
  const saved = parseInt(localStorage.getItem(TIMER_DURATION_KEY), 10);
  return (!isNaN(saved) && saved >= 1 && saved <= 120) ? saved * 60 : DEFAULT_MINUTES * 60;
}

let timerDuration  = getSavedDuration();
let timerRemaining = timerDuration;
let timerInterval  = null;
let timerRunning   = false;

const TIMER_MESSAGES = {
  idle:     "Stay focused. You've got this.",
  running:  'Focus session in progress 🎯',
  paused:   'Timer paused. Resume when ready.',
  finished: 'Session complete! Great work 🎉',
};

/** Renders the timer display from the current remaining seconds. */
function renderTimer() {
  const mins = Math.floor(timerRemaining / 60);
  const secs = timerRemaining % 60;
  timerDisplayEl.textContent = `${pad(mins)}:${pad(secs)}`;
}

/** Applies visual state classes to the timer display. */
function setTimerState(state) {
  timerDisplayEl.classList.remove('running', 'finished');
  if (state === 'running')  timerDisplayEl.classList.add('running');
  if (state === 'finished') timerDisplayEl.classList.add('finished');
  timerLabelEl.textContent = TIMER_MESSAGES[state] || TIMER_MESSAGES.idle;
}

/** Starts the countdown. */
function startTimer() {
  if (timerRunning || timerRemaining <= 0) return;
  timerRunning = true;
  setTimerState('running');

  timerInterval = setInterval(() => {
    timerRemaining--;
    renderTimer();

    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning  = false;
      setTimerState('finished');
    }
  }, 1000);
}

/** Pauses the countdown. */
function stopTimer() {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning  = false;
  setTimerState('paused');
}

/** Resets the timer to the current duration setting. */
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval  = null;
  timerRunning   = false;
  timerRemaining = timerDuration;
  renderTimer();
  setTimerState('idle');
}

/**
 * Sets a new Pomodoro duration from the input field.
 * Validates range 1–120 min, saves to LocalStorage, resets the timer.
 */
function setTimerDuration() {
  const raw = parseInt(timerDurationInput.value, 10);

  if (isNaN(raw) || raw < 1 || raw > 120) {
    // Reset input to current valid value and bail
    timerDurationInput.value = timerDuration / 60;
    timerDurationInput.focus();
    timerDurationInput.select();
    return;
  }

  // Stop any running session before changing duration
  if (timerRunning) stopTimer();

  timerDuration  = raw * 60;
  timerRemaining = timerDuration;
  localStorage.setItem(TIMER_DURATION_KEY, String(raw));
  renderTimer();
  setTimerState('idle');
}

timerStartBtn.addEventListener('click', startTimer);
timerStopBtn.addEventListener('click',  stopTimer);
timerResetBtn.addEventListener('click', resetTimer);
timerDurationSetBtn.addEventListener('click', setTimerDuration);

// Also apply on Enter inside the duration input
timerDurationInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') setTimerDuration();
});

// Sync input field to saved value on load
timerDurationInput.value = timerDuration / 60;

// Initial render
renderTimer();


/* ------------------------------------------------
   4. TO-DO LIST
   ------------------------------------------------ */

const TODO_KEY      = 'dashboard_todos';
const TODO_SORT_KEY = 'dashboard_todo_sort';

const todoListEl  = document.getElementById('todo-list');
const todoInputEl = document.getElementById('todo-input');
const todoAddBtn  = document.getElementById('todo-add');
const todoEmptyEl = document.getElementById('todo-empty');
const sortSelect  = document.getElementById('sort-select');

/** @typedef {{ id: string, text: string, done: boolean }} TodoItem */

/**
 * Loads todos from LocalStorage.
 * @returns {TodoItem[]}
 */
function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Saves todos to LocalStorage.
 * @param {TodoItem[]} todos
 */
function saveTodos(todos) {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

/**
 * Generates a simple unique ID.
 * @returns {string}
 */
function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Returns a sorted copy of the todos array based on the current sort mode.
 * The original storage order is never mutated — sorting is display-only.
 * @param {TodoItem[]} todos
 * @param {string} mode
 * @returns {TodoItem[]}
 */
function sortTodos(todos, mode) {
  const copy = [...todos];
  switch (mode) {
    case 'az':
      return copy.sort((a, b) => a.text.localeCompare(b.text));
    case 'za':
      return copy.sort((a, b) => b.text.localeCompare(a.text));
    case 'undone':
      // Undone (false) before done (true) — false < true numerically
      return copy.sort((a, b) => Number(a.done) - Number(b.done));
    case 'done':
      return copy.sort((a, b) => Number(b.done) - Number(a.done));
    default:
      // 'default' — preserve insertion order
      return copy;
  }
}

/** Re-renders the full todo list from storage, applying current sort. */
function renderTodos() {
  const todos   = loadTodos();
  const mode    = sortSelect.value;
  const display = sortTodos(todos, mode);

  todoListEl.innerHTML = '';

  if (display.length === 0) {
    todoEmptyEl.style.display = 'block';
    return;
  }
  todoEmptyEl.style.display = 'none';

  display.forEach(todo => {
    const li = document.createElement('li');
    li.className  = `todo-item${todo.done ? ' done' : ''}`;
    li.dataset.id = todo.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.className = 'todo-check';
    checkbox.checked   = todo.done;
    checkbox.setAttribute('aria-label', `Mark "${todo.text}" as done`);
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    // Text
    const span = document.createElement('span');
    span.className   = 'todo-text';
    span.textContent = todo.text;

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-icon';
    editBtn.innerHTML = '✏️';
    editBtn.setAttribute('aria-label', `Edit task: ${todo.text}`);
    editBtn.addEventListener('click', () => openEditModal(todo.id, todo.text));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-danger';
    deleteBtn.innerHTML = '✕';
    deleteBtn.setAttribute('aria-label', `Delete task: ${todo.text}`);
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    actions.append(editBtn, deleteBtn);
    li.append(checkbox, span, actions);
    todoListEl.appendChild(li);
  });
}

/**
 * Adds a new todo item.
 * @param {string} text
 */
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const todos = loadTodos();
  todos.push({ id: genId(), text: trimmed, done: false });
  saveTodos(todos);
  renderTodos();
}

/**
 * Toggles the done state of a todo.
 * @param {string} id
 */
function toggleTodo(id) {
  const todos = loadTodos().map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  saveTodos(todos);
  renderTodos();
}

/**
 * Deletes a todo by id.
 * @param {string} id
 */
function deleteTodo(id) {
  const todos = loadTodos().filter(t => t.id !== id);
  saveTodos(todos);
  renderTodos();
}

/**
 * Updates the text of an existing todo.
 * @param {string} id
 * @param {string} newText
 */
function updateTodo(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return;

  const todos = loadTodos().map(t =>
    t.id === id ? { ...t, text: trimmed } : t
  );
  saveTodos(todos);
  renderTodos();
}

// Add task on button click
todoAddBtn.addEventListener('click', () => {
  addTodo(todoInputEl.value);
  todoInputEl.value = '';
  todoInputEl.focus();
});

// Add task on Enter key
todoInputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addTodo(todoInputEl.value);
    todoInputEl.value = '';
  }
});

// Sort on dropdown change — save preference
sortSelect.addEventListener('change', () => {
  localStorage.setItem(TODO_SORT_KEY, sortSelect.value);
  renderTodos();
});

// Restore saved sort preference
sortSelect.value = localStorage.getItem(TODO_SORT_KEY) || 'default';

// Initial render
renderTodos();


/* ------------------------------------------------
   5. EDIT MODAL
   ------------------------------------------------ */

const modalOverlay   = document.getElementById('modal-overlay');
const modalInput     = document.getElementById('modal-input');
const modalSaveBtn   = document.getElementById('modal-save');
const modalCancelBtn = document.getElementById('modal-cancel');

let editingId = null;

/**
 * Opens the edit modal for a given todo.
 * @param {string} id
 * @param {string} currentText
 */
function openEditModal(id, currentText) {
  editingId        = id;
  modalInput.value = currentText;
  modalOverlay.classList.add('active');
  modalInput.focus();
  modalInput.select();
}

/** Closes the edit modal and clears state. */
function closeEditModal() {
  modalOverlay.classList.remove('active');
  editingId        = null;
  modalInput.value = '';
}

modalSaveBtn.addEventListener('click', () => {
  if (editingId) {
    updateTodo(editingId, modalInput.value);
    closeEditModal();
  }
});

modalCancelBtn.addEventListener('click', closeEditModal);

// Save on Enter, close on Escape
modalInput.addEventListener('keydown', e => {
  if (e.key === 'Enter')  modalSaveBtn.click();
  if (e.key === 'Escape') closeEditModal();
});

// Close when clicking the dark backdrop
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeEditModal();
});


/* ------------------------------------------------
   6. QUICK LINKS
   ------------------------------------------------ */

const LINKS_KEY = 'dashboard_links';

const linksGridEl   = document.getElementById('links-grid');
const linksEmptyEl  = document.getElementById('links-empty');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput  = document.getElementById('link-url');
const linkAddBtn    = document.getElementById('link-add');

/** @typedef {{ id: string, name: string, url: string }} LinkItem */

/**
 * Loads links from LocalStorage.
 * @returns {LinkItem[]}
 */
function loadLinks() {
  try {
    return JSON.parse(localStorage.getItem(LINKS_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Saves links to LocalStorage.
 * @param {LinkItem[]} links
 */
function saveLinks(links) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

/**
 * Ensures a URL has a protocol prefix.
 * @param {string} url
 * @returns {string}
 */
function normalizeUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Returns a favicon URL for a given link URL.
 * @param {string} url
 * @returns {string}
 */
function getFavicon(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?sz=16&domain_url=${origin}`;
  } catch {
    return '';
  }
}

/** Re-renders the links grid from storage. */
function renderLinks() {
  const links = loadLinks();
  linksGridEl.innerHTML = '';

  if (links.length === 0) {
    linksEmptyEl.style.display = 'block';
    return;
  }
  linksEmptyEl.style.display = 'none';

  links.forEach(link => {
    const chip = document.createElement('a');
    chip.className  = 'link-chip';
    chip.href       = link.url;
    chip.target     = '_blank';
    chip.rel        = 'noopener noreferrer';
    chip.dataset.id = link.id;

    // Favicon image
    const faviconSrc = getFavicon(link.url);
    if (faviconSrc) {
      const img = document.createElement('img');
      img.src    = faviconSrc;
      img.width  = 14;
      img.height = 14;
      img.alt    = '';
      img.style.borderRadius = '2px';
      img.onerror = () => img.remove();
      chip.appendChild(img);
    }

    // Label
    const label = document.createElement('span');
    label.textContent = link.name;
    chip.appendChild(label);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'link-chip-delete';
    delBtn.innerHTML = '✕';
    delBtn.setAttribute('aria-label', `Remove link: ${link.name}`);
    delBtn.addEventListener('click', e => {
      e.preventDefault();
      deleteLink(link.id);
    });
    chip.appendChild(delBtn);

    linksGridEl.appendChild(chip);
  });
}

/**
 * Adds a new quick link.
 * @param {string} name
 * @param {string} url
 */
function addLink(name, url) {
  const trimmedName   = name.trim();
  const normalizedUrl = normalizeUrl(url);

  if (!trimmedName || !normalizedUrl) {
    if (!trimmedName) linkNameInput.focus();
    else linkUrlInput.focus();
    return;
  }

  const links = loadLinks();
  links.push({ id: genId(), name: trimmedName, url: normalizedUrl });
  saveLinks(links);
  renderLinks();
}

/**
 * Deletes a link by id.
 * @param {string} id
 */
function deleteLink(id) {
  const links = loadLinks().filter(l => l.id !== id);
  saveLinks(links);
  renderLinks();
}

// Add link on button click
linkAddBtn.addEventListener('click', () => {
  addLink(linkNameInput.value, linkUrlInput.value);
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  linkNameInput.focus();
});

// Enter in URL field triggers add
linkUrlInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') linkAddBtn.click();
});

// Enter in name field moves focus to URL field
linkNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') linkUrlInput.focus();
});

// Initial render
renderLinks();
