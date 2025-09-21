// Persist and apply dark/light theme using localStorage
// Key used for persistence
const THEME_STORAGE_KEY = 'theme'; // 'dark' | 'light'

// Theme palettes
const lightTheme = {
  background: '#fafafa',
  text: '#111',
  title: '#111',
  hover: '#000',
  accent: '#ccc',
  icon: {
    normal: 'images/moon.svg',
    hover: 'images/moon-full.svg'
  }
};

const darkTheme = {
  background: '#111216',
  text: '#999',
  title: '#eee',
  hover: '#ddd',
  accent: '#222',
  icon: {
    normal: 'images/sun.svg',
    hover: 'images/sun-filled.svg'
  }
};

function applyTheme(themeName) {
  const t = themeName === 'dark' ? darkTheme : lightTheme;
  const root = document.documentElement;
  const icon = document.querySelector('#switch-container img');

  // Set CSS variables
  root.style.setProperty('--background-color', t.background);
  root.style.setProperty('--text-color', t.text);
  root.style.setProperty('--text-title-color', t.title);
  root.style.setProperty('--text-hover-color', t.hover);
  root.style.setProperty('--light-accent-color', t.accent);

  // Update icon and hover states
  if (icon) {
    icon.setAttribute('src', t.icon.normal);
    icon.onmouseover = () => icon.setAttribute('src', t.icon.hover);
    icon.onmouseout = () => icon.setAttribute('src', t.icon.normal);
  }

  // Persist
  try { localStorage.setItem(THEME_STORAGE_KEY, themeName); } catch (e) {}
}

function initThemeToggle() {
  const icon = document.querySelector('#switch-container img');
  if (!icon) return;

  // Determine initial theme: saved -> system preference -> light
  let saved = null;
  try { saved = localStorage.getItem(THEME_STORAGE_KEY); } catch (e) {}
  let initialTheme = saved;
  if (!initialTheme) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    initialTheme = prefersDark ? 'dark' : 'light';
  }
  applyTheme(initialTheme);

  // Toggle on click
  icon.onclick = () => {
    const current = (function() {
      try { return localStorage.getItem(THEME_STORAGE_KEY) || initialTheme; } catch (e) { return initialTheme; }
    })();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  };
}

// Initialize on load (script is at end of body)
initThemeToggle();
