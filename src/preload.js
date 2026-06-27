const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  
  // Database IPC
  loadDatabase: () => ipcRenderer.invoke('load-database'),
  saveDatabase: (data) => ipcRenderer.invoke('save-database', data),
  
  // Exporters IPC
  exportPDF: (htmlContent, filename) => ipcRenderer.invoke('export-pdf', htmlContent, filename),
  exportCSV: (csvContent, filename) => ipcRenderer.invoke('export-csv', csvContent, filename),
  saveCertificate: (htmlContent, studentName) => ipcRenderer.invoke('save-certificate', htmlContent, studentName)
});
