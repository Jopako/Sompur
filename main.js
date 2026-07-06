const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

const Database = require("better-sqlite3");

const DB_PATH = path.join(app.getPath("userData"), "sompur.db");
let db;

function initDB() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
     console.log(app.getPath("userData"))
  }

  db = new Database(DB_PATH);
  console.log("Database criado em:", DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS musicas (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo   TEXT    NOT NULL,
      autor    TEXT,
      album    TEXT,
      ano      TEXT,
      genero   TEXT,
      caminho  TEXT    NOT NULL,
      capa     BLOB
    )
  `);
}

ipcMain.handle("importar-mp3", async () => {
  const { parseFile } = await import("music-metadata");

  const { filePaths } = await dialog.showOpenDialog({
    title: "Selecionar MP3",
    filters: [{ name: "Áudio", extensions: ["mp3"] }],
    properties: ["openFile"],
  });

  if (!filePaths || !filePaths.length) return null;

  const caminho = filePaths[0];

  try {
    const meta = await parseFile(caminho, { duration: false });
    const { title, artist, album, year, genre } = meta.common;

    let capaBase64 = null;

    if (meta.common.picture && meta.common.picture.length > 0) {
      const pic = meta.common.picture[0];
      capaBase64 = `data:${pic.format};base64,${pic.data.toString("base64")}`;
    }

    return {
      titulo: title || path.basename(caminho, ".mp3"),
      autor: artist || "",
      album: album || "",
      ano: year ? String(year) : "",
      genero: genre ? genre[0] : "",
      caminho,
      capaBase64,
    };
  } catch (err) {
    console.error("Erro ao ler metadados:", err);

    return {
      titulo: path.basename(caminho, ".mp3"),
      autor: "",
      album: "",
      ano: "",
      genero: "",
      caminho,
      capaBase64: null,
    };
  }
});

ipcMain.handle("importar-capa", async () => {
  const { filePaths } = await dialog.showOpenDialog({
    title: "Selecionar capa",
    filters: [{ name: "Imagem", extensions: ["jpg", "jpeg", "png", "webp"] }],
    properties: ["openFile"],
  });

  if (!filePaths || !filePaths.length) return null;

  const buf = fs.readFileSync(filePaths[0]);
  const ext = path.extname(filePaths[0]).slice(1).replace("jpg", "jpeg");
  return `data:image/${ext};base64,${buf.toString("base64")}`;
});

ipcMain.handle("salvar-musica", (_, dados) => {
  const musicasDir = path.join(app.getPath("userData"), "musicas");
  if (!fs.existsSync(musicasDir)) {
    fs.mkdirSync(musicasDir, { recursive: true });
  }

  const nomeArquivo = path.basename(dados.caminho);
  const caminhoDestino = path.join(musicasDir, nomeArquivo);

  if (!fs.existsSync(caminhoDestino)) {
    fs.copyFileSync(dados.caminho, caminhoDestino);
  }

  let capaBlob = null;
  if (dados.capaBase64) {
    const base64Data = dados.capaBase64.split(",")[1];
    capaBlob = Buffer.from(base64Data, "base64");
  }

  const stmt = db.prepare(`
    INSERT INTO musicas (titulo, autor, album, ano, genero, caminho, capa)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    dados.titulo,
    dados.autor,
    dados.album,
    dados.ano,
    dados.genero,
    caminhoDestino, 
    capaBlob,
  );
  return { id: info.lastInsertRowid, caminho: caminhoDestino};
});
ipcMain.handle("listar-musicas", () => {
  const rows = db.prepare("SELECT * FROM musicas ORDER BY id DESC").all();

  return rows.map((row) => ({
    ...row,
    capaBase64: row.capa
      ? `data:image/jpeg;base64,${Buffer.from(row.capa).toString("base64")}`
      : null,
  }));
});

ipcMain.handle("deletar-musica", (_, id) => {
  db.prepare("DELETE FROM musicas WHERE id = ?").run(id);
  return true;
});

ipcMain.handle("atualizar-musica", (_, dados) => {
  if (!db) return false;

  if (dados.capaBase64) {
    const base64Data = dados.capaBase64.split(",")[1];
    const capaBlob = Buffer.from(base64Data, "base64");
    db.prepare(`
      UPDATE musicas SET titulo=?, autor=?, album=?, ano=?, genero=?, capa=?
      WHERE id=?
    `).run(dados.titulo, dados.autor, dados.album, dados.ano, dados.genero, capaBlob, Number(dados.id));
  } else {
    db.prepare(`
      UPDATE musicas SET titulo=?, autor=?, album=?, ano=?, genero=?
      WHERE id=?
    `).run(dados.titulo, dados.autor, dados.album, dados.ano, dados.genero, Number(dados.id));
  }

  return true;
});

if (!app.isPackaged) {
  try {
    require("electron-reload")(__dirname);
  } catch (_) {}
}

app.setName("Sompur");
app.setAppUserModelId("com.spotiby.app");
app.disableHardwareAcceleration();

function createWindow() {
  const win = new BrowserWindow({
    width: 490,
    height: 760,
    resizable: false,
    center: true,
    autoHideMenuBar: true,
    title: "Sompur",
    icon: path.join(__dirname, "src", "Assets", "logo.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, "src", "index.html"));
}

app.whenReady().then(() => {
  initDB();
   console.log(app.getPath("userData"))
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});