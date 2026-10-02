(() => {
  'use strict';

  const address = document.querySelector('#address');
  const error = document.querySelector('#address-error');
  const viewport = document.querySelector('#viewport');
  const start = document.querySelector('#start');
  const status = document.querySelector('#status');
  const external = document.querySelector('#external');
  const back = document.querySelector('#back');
  const forward = document.querySelector('#forward');
  const reload = document.querySelector('#reload');
  const entries = [null];
  let position = 0;
  let frame = null;
  let loadTimer;

  function normalizeAddress(value) {
    const input = value.trim();
    if (!input) throw new Error('Enter a website address.');
    const url = new URL(input.startsWith('/') ? input : /^[a-z][a-z\d+.-]*:/i.test(input) && !/^[^/\s:]+:\d+(?:\/|$)/.test(input) ? input : `https://${input}`, window.location.origin);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Use an http:// or https:// website address.');
    if (url.username || url.password) throw new Error('Enter an address without a username or password.');
    if (url.origin === window.location.origin && /^\/browser(?:\/|$)/.test(url.pathname)) throw new Error('Choose another page to avoid opening the mini browser inside itself.');
    if (window.location.protocol === 'https:' && url.protocol === 'http:') throw new Error('Use https://. This website cannot embed an insecure HTTP page.');
    return url.href;
  }

  function render() {
    clearTimeout(loadTimer);
    frame?.remove();
    frame = null;
    error.hidden = true;
    address.removeAttribute('aria-invalid');
    const url = entries[position];
    address.value = url || '';
    back.disabled = position === 0;
    forward.disabled = position === entries.length - 1;
    reload.disabled = !url;
    external.hidden = !url;
    start.hidden = !!url;
    const pageUrl = new URL(window.location.href);
    if (url) pageUrl.searchParams.set('url', url);
    else pageUrl.searchParams.delete('url');
    window.history.replaceState(null, '', pageUrl);

    if (!url) {
      external.removeAttribute('href');
      status.textContent = 'Ready to browse';
      return;
    }
    external.href = url;
    status.textContent = 'Opening entered address…';
    frame = document.createElement('iframe');
    frame.title = `Website: ${new URL(url).hostname}`;
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads');
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.addEventListener('load', () => {
      clearTimeout(loadTimer);
      status.textContent = 'Address opened. If the page is blocked, open it in a new tab.';
    });
    frame.src = url;
    viewport.append(frame);
    loadTimer = setTimeout(() => {
      status.textContent = 'Still waiting? Try opening this address in a new tab.';
    }, 12000);
  }

  function navigate(value) {
    try {
      const url = normalizeAddress(value);
      if (entries[position] !== url) {
        entries.splice(position + 1);
        entries.push(url);
        position = entries.length - 1;
      }
      render();
    } catch (problem) {
      error.textContent = problem instanceof TypeError ? 'Enter a valid website address, such as https://example.com.' : problem.message;
      error.hidden = false;
      address.setAttribute('aria-invalid', 'true');
      address.focus();
    }
  }

  document.querySelector('#address-form').addEventListener('submit', event => {
    event.preventDefault();
    navigate(address.value);
  });
  back.addEventListener('click', () => { if (position > 0) { position--; render(); } });
  forward.addEventListener('click', () => { if (position < entries.length - 1) { position++; render(); } });
  reload.addEventListener('click', render);
  document.querySelector('#home').addEventListener('click', () => {
    if (entries[position] !== null) {
      entries.splice(position + 1);
      entries.push(null);
      position = entries.length - 1;
    }
    render();
  });
  document.querySelectorAll('[data-url]').forEach(button => {
    button.addEventListener('click', () => navigate(button.dataset.url));
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      address.focus();
      address.select();
    }
  });
  const initialUrl = new URLSearchParams(window.location.search).get('url');
  if (initialUrl) navigate(initialUrl);
  else render();
})();
