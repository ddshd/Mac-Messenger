const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('messengerShell', {
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  getAlwaysOnTop: () => ipcRenderer.invoke('get-always-on-top'),
  onAlwaysOnTopChanged: (callback) => ipcRenderer.on('always-on-top-changed', (_event, value) => callback(value)),
  onToggleSidebar: (callback) => ipcRenderer.on('toggle-sidebar', callback)
});

function injectToolbar() {
  const style = document.createElement('style');
  style.textContent = `
    #messenger-topcall-toolbar {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 2147483647;
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 999px;
      background: rgba(20, 20, 20, 0.86);
      color: white;
      font: 500 13px -apple-system, BlinkMacSystemFont, sans-serif;
      box-shadow: 0 10px 30px rgba(0,0,0,0.22);
      backdrop-filter: blur(12px);
    }
    #messenger-topcall-toolbar button {
      border: 0;
      border-radius: 999px;
      padding: 8px 12px;
      cursor: pointer;
      font: inherit;
    }
    #messenger-topcall-pin {
      background: white;
      color: #111;
    }
    #messenger-topcall-hide {
      background: rgba(255,255,255,0.16);
      color: white;
    }
    #messenger-topcall-toolbar[data-pinned="true"] #messenger-topcall-pin {
      background: #7dd3fc;
    }
    #messenger-topcall-status {
      opacity: 0.9;
      user-select: none;
    }
  `;
  document.documentElement.appendChild(style);

  const bar = document.createElement('div');
  bar.id = 'messenger-topcall-toolbar';
  bar.innerHTML = `
    <span id="messenger-topcall-status">Window</span>
    <button id="messenger-topcall-pin" type="button">Pin on Top</button>
    <button id="messenger-topcall-hide" type="button">Hide</button>
  `;

  const pinButton = bar.querySelector('#messenger-topcall-pin');
  const status = bar.querySelector('#messenger-topcall-status');
  const hideButton = bar.querySelector('#messenger-topcall-hide');

  async function syncPinnedState(forcedValue) {
    const isPinned = typeof forcedValue === 'boolean' ? forcedValue : await window.messengerShell.getAlwaysOnTop();
    bar.dataset.pinned = String(isPinned);
    pinButton.textContent = isPinned ? 'Unpin' : 'Pin on Top';
    status.textContent = isPinned ? 'Pinned above all windows' : 'Window';
  }

  pinButton.addEventListener('click', async () => {
    const value = await window.messengerShell.toggleAlwaysOnTop();
    syncPinnedState(value);
  });

  hideButton.addEventListener('click', () => {
    bar.style.display = 'none';
  });

  window.messengerShell.onAlwaysOnTopChanged((value) => syncPinnedState(value));
  window.messengerShell.onToggleSidebar(() => {
    bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
  });

  syncPinnedState();
  document.body.appendChild(bar);
}

window.addEventListener('DOMContentLoaded', () => {
  const ready = () => {
    if (!document.getElementById('messenger-topcall-toolbar')) {
      injectToolbar();
    }
  };

  if (document.body) {
    ready();
  } else {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        ready();
      }
    });
  }
});
