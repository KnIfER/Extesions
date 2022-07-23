/* global config */
'use strict';

// test
document.getElementById('test').addEventListener('click', () => chrome.tabs.create({
  url: 'https://webbrowsertools.com/test-download-with/'
}));

function restore() {
  const mimes = (localStorage.getItem('mimes') || '').split('|');
  document.getElementById('mimes').value = mimes.join(', ');

  const whitelist = (localStorage.getItem('whitelist') || '').split('|');
  document.getElementById('whitelist').value = whitelist.join(', ');

  document.getElementById('delay').value = Number(config.delay || localStorage.getItem('delay') || '1000');
  document.getElementById('batch').checked = config.mode.method === 'batch';
  if (config.mode.support === false) {
    document.getElementById('batch').closest('tr').style = 'opacity: 0.5; pointer-events: none;';
  }

  if (config.remote) {
    document.getElementById('remote').value = config.remote;
    document.getElementById('remote').closest('tr').classList.remove('hidden');
  }

  chrome.storage.local.get(Object.assign(config.command.guess, {
    'context.open-link': true,
    'context.open-video': true,
    'context.grab': true,
    'context.extract': true
  }), prefs => {
    document.getElementById('executable').value = prefs.executable;
    document.getElementById('args').value = prefs.args;
    document.getElementById('context.open-link').checked = prefs['context.open-link'];
    document.getElementById('context.open-video').checked = prefs['context.open-video'];
    document.getElementById('context.grab').checked = prefs['context.grab'];
    document.getElementById('context.extract').checked = prefs['context.extract'];
  });
}

function save() {
  const executable = document.getElementById('executable').value;
  const args = document.getElementById('args').value;
  const mimes = document.getElementById('mimes').value
    .split(/\s*,\s*/).filter((s, i, l) => s && l.indexOf(s) === i && s.indexOf('/') !== -1);
  localStorage.setItem('mimes', mimes.join('|'));
  const whitelist = document.getElementById('whitelist').value
    .split(/\s*,\s*/).filter((s, i, l) => s && l.indexOf(s) === i);
  localStorage.setItem('whitelist', whitelist.join('|'));
  localStorage.setItem('delay', Math.max(50, document.getElementById('delay').value));
  localStorage.setItem('mode', document.getElementById('batch').checked ? 'batch' : 'parallel');
  localStorage.setItem('remote', document.getElementById('remote').value);
  chrome.storage.local.set({
    executable,
    args,
    'context.open-link': document.getElementById('context.open-link').checked,
    'context.open-video': document.getElementById('context.open-video').checked,
    'context.grab': document.getElementById('context.grab').checked,
    'context.extract': document.getElementById('context.extract').checked
  }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(() => status.textContent = '', 750);
    restore();
  });
}

document.addEventListener('DOMContentLoaded', restore);
document.getElementById('save').addEventListener('click', save);

// reset
document.getElementById('reset').addEventListener('click', e => {
  if (e.detail === 1) {
    const status = document.getElementById('status');
    window.setTimeout(() => status.textContent = '', 750);
    status.textContent = 'Double-click to reset!';
  }
  else {
    localStorage.clear();
    chrome.storage.local.clear(() => {
      chrome.runtime.reload();
      window.close();
    });
  }
});

// support
document.getElementById('support').addEventListener('click', () => chrome.tabs.create({
  url: chrome.runtime.getManifest().homepage_url + '&rd=donate'
}));
