const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sompur", {
  importarMP3: () => ipcRenderer.invoke("importar-mp3"),
  importarCapa: () => ipcRenderer.invoke("importar-capa"),

  salvarMusica: (dados) =>
    ipcRenderer.invoke("salvar-musica", dados),

  listarMusicas: () =>
    ipcRenderer.invoke("listar-musicas"),

  deletarMusica: (id) =>
    ipcRenderer.invoke("deletar-musica", id),

  atualizarMusica: (dados) =>
    ipcRenderer.invoke("atualizar-musica", dados),
});