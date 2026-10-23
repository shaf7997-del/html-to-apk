const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
  checkJava: () => ipcRenderer.invoke('check-java'),
  checkAndroidSdk: () => ipcRenderer.invoke('check-android-sdk'),
  buildApk: (data) => ipcRenderer.invoke('build-apk', data),
  createProjectZip: (data) => ipcRenderer.invoke('create-project-zip', data),
  openFolder: (path) => ipcRenderer.invoke('open-folder', path),
  installJava: () => ipcRenderer.invoke('install-java'),
});
