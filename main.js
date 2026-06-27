const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    frame: true, // Standard window frame for reliable native dragging/resizing
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler: File writing for database
ipcMain.handle('save-database', async (event, data) => {
  try {
    const dbDir = path.join(__dirname, 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'db.json');
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Failed to save database:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler: File reading for database
ipcMain.handle('load-database', async () => {
  try {
    const dbPath = path.join(__dirname, 'database', 'db.json');
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return { success: true, data: JSON.parse(data) };
    }
    return { success: true, data: null }; // No database file yet
  } catch (error) {
    console.error('Failed to load database:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler: Export PDF
ipcMain.handle('export-pdf', async (event, htmlContent, filename) => {
  try {
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Let's create a temporary printing window
    let printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    
    const pdfData = await printWindow.webContents.printToPDF({
      printBackground: true,
      margins: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      },
      pageSize: 'A4',
      landscape: false
    });

    const targetPath = path.join(reportsDir, filename || `report_${Date.now()}.pdf`);
    fs.writeFileSync(targetPath, pdfData);
    
    printWindow.close();
    return { success: true, filePath: targetPath };
  } catch (error) {
    console.error('Failed to export PDF:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler: Export CSV/Excel
ipcMain.handle('export-csv', async (event, csvContent, filename) => {
  try {
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const targetPath = path.join(reportsDir, filename || `export_${Date.now()}.csv`);
    // Prepend UTF-8 BOM so Excel opens it with correct Khmer characters!
    fs.writeFileSync(targetPath, '\ufeff' + csvContent, 'utf8');
    return { success: true, filePath: targetPath };
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return { success: false, error: error.message };
  }
});

// IPC Handler: Save Certificate Image (or PDF)
ipcMain.handle('save-certificate', async (event, htmlContent, studentName) => {
  try {
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    let printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    
    const pdfData = await printWindow.webContents.printToPDF({
      printBackground: true,
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
      pageSize: 'A4',
      landscape: true
    });

    const safeName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
    const targetPath = path.join(reportsDir, `certificate_${safeName}_${Date.now()}.pdf`);
    fs.writeFileSync(targetPath, pdfData);
    
    printWindow.close();
    return { success: true, filePath: targetPath };
  } catch (error) {
    console.error('Failed to save certificate:', error);
    return { success: false, error: error.message };
  }
});
