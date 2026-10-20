const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const Database = require("better-sqlite3");

const DB_PATH = path.join(app.getPath("userData"), "sompur.db");
let db;

function initDB() {
  const dataDir = path.dirname(DB_PATH);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
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

  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: "Selecionar MP3",
    filters: [{ name: "Áudio", extensions: ["mp3"] }],
    properties: ["openFile"],
  });

  if (canceled || !filePaths?.length) return null;

  const caminho = filePaths[0];

  try {
    const meta = await parseFile(caminho, { duration: false });
    const { title, artist, album, year, genre } = meta.common;

    let capaBase64 = null;

    if (meta.common.picture?.length > 0) {
      const pic = meta.common.picture[0];
      capaBase64 = `data:${pic.format};base64,${pic.data.toString("base64")}`;
    }

    return {
      titulo: title || path.basename(caminho, path.extname(caminho)),
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
      titulo: path.basename(caminho, path.extname(caminho)),
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
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: "Selecionar capa",
    filters: [{ name: "Imagem", extensions: ["jpg", "jpeg", "png", "webp"] }],
    properties: ["openFile"],
  });

  if (canceled || !filePaths?.length) return null;

  const arquivo = filePaths[0];
  const buf = fs.readFileSync(arquivo);
  const ext = path.extname(arquivo).slice(1).toLowerCase();
  const mime = ext === "jpg" ? "jpeg" : ext;

  return `data:image/${mime};base64,${buf.toString("base64")}`;
});

ipcMain.handle("salvar-musica", (_event, dados) => {
  if (!db) throw new Error("Banco de dados ainda não foi inicializado.");
  if (!dados || typeof dados !== "object") {
    throw new TypeError("Dados da música inválidos.");
  }
  if (typeof dados.caminho !== "string" || !dados.caminho.trim()) {
    throw new TypeError("Caminho da música inválido.");
  }
  if (!fs.existsSync(dados.caminho) || !fs.statSync(dados.caminho).isFile()) {
    throw new Error("O arquivo de música selecionado não existe.");
  }

  const musicasDir = path.join(app.getPath("userData"), "musicas");
  fs.mkdirSync(musicasDir, { recursive: true });

  const nomeArquivo = path.basename(dados.caminho);
  const caminhoDestino = path.join(musicasDir, nomeArquivo);

  if (!fs.existsSync(caminhoDestino)) {
    fs.copyFileSync(dados.caminho, caminhoDestino);
  }

  let capaBlob = null;
  if (typeof dados.capaBase64 === "string" && dados.capaBase64.includes(",")) {
    const base64Data = dados.capaBase64.split(",")[1];
    capaBlob = Buffer.from(base64Data, "base64");
  }

  const stmt = db.prepare(`
    INSERT INTO musicas (titulo, autor, album, ano, genero, caminho, capa)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    String(dados.titulo || "Sem título").slice(0, 500),
    String(dados.autor || "").slice(0, 500),
    String(dados.album || "").slice(0, 500),
    String(dados.ano || "").slice(0, 20),
    String(dados.genero || "").slice(0, 200),
    caminhoDestino,
    capaBlob,
  );

  return { id: info.lastInsertRowid, caminho: caminhoDestino };
});

ipcMain.handle("listar-musicas", () => {
  if (!db) throw new Error("Banco de dados ainda não foi inicializado.");

  const rows = db.prepare("SELECT * FROM musicas ORDER BY id DESC").all();

  return rows.map((row) => ({
    ...row,
    capaBase64: row.capa
      ? `data:image/jpeg;base64,${Buffer.from(row.capa).toString("base64")}`
      : null,
  }));
});

ipcMain.handle("deletar-musica", (_event, id) => {
  if (!db) throw new Error("Banco de dados ainda não foi inicializado.");
  const musicId = Number(id);
  if (!Number.isSafeInteger(musicId) || musicId <= 0) {
    throw new TypeError("ID da música inválido.");
  }

  db.prepare("DELETE FROM musicas WHERE id = ?").run(musicId);
  return true;
});

ipcMain.handle("atualizar-musica", (_event, dados) => {
  if (!db) throw new Error("Banco de dados ainda não foi inicializado.");
  if (!dados || typeof dados !== "object") {
    throw new TypeError("Dados da música inválidos.");
  }

  const musicId = Number(dados.id);
  if (!Number.isSafeInteger(musicId) || musicId <= 0) {
    throw new TypeError("ID da música inválido.");
  }

  const titulo = String(dados.titulo || "Sem título").slice(0, 500);
  const autor = String(dados.autor || "").slice(0, 500);
  const album = String(dados.album || "").slice(0, 500);
  const ano = String(dados.ano || "").slice(0, 20);
  const genero = String(dados.genero || "").slice(0, 200);

  if (typeof dados.capaBase64 === "string" && dados.capaBase64.includes(",")) {
    const base64Data = dados.capaBase64.split(",")[1];
    const capaBlob = Buffer.from(base64Data, "base64");

    db.prepare(`
      UPDATE musicas SET titulo=?, autor=?, album=?, ano=?, genero=?, capa=?
      WHERE id=?
    `).run(titulo, autor, album, ano, genero, capaBlob, musicId);
  } else {
    db.prepare(`
      UPDATE musicas SET titulo=?, autor=?, album=?, ano=?, genero=?
      WHERE id=?
    `).run(titulo, autor, album, ano, genero, musicId);
  }

  return true;
});

ipcMain.handle("abrir-repositorio", async () => {
  await shell.openExternal("https://github.com/Jopako/Sompur");
  return true;
});


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
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  win.loadFile(path.join(__dirname, "src", "index.html"));
}

app.whenReady().then(() => {
  initDB();
  console.log("Diretório de dados do Sompur:", app.getPath("userData"));
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});