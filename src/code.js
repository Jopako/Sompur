const { ipcRenderer, shell } = require("electron");

document.addEventListener("DOMContentLoaded", async function () {

  const PLACEHOLDER = {
    title: "",
    author: "",
    audio: "",
    image: "Assets/fundo.webp", 
    isPlaceholder: true,
  };

  let songs = [PLACEHOLDER];
  let currentIndex = 0;
  let capaAtualBase64 = null;
  let caminhoAtual = null;
  let movimentacaoHabilitada = true;

  const audio             = document.getElementById("audio");
  const stopStart         = document.getElementById("stopStart");
  const pausePlayImg      = document.getElementById("pause");
  const restart           = document.getElementById("restart");
  const next              = document.getElementById("next");
  const prev              = document.getElementById("prev");
  const titleEl           = document.getElementById("title");
  const authorEl          = document.getElementById("author");
  const byEl              = document.getElementById("by");
  const imageEl           = document.getElementById("image");
  const durationSlider    = document.getElementById("duration-slider");
  const currentTimeSpan   = document.getElementById("current-time");
  const totalDurationSpan = document.getElementById("total-duration");
  const volumeSlider      = document.getElementById("volume-slider");
  const card              = document.querySelector(".main");

  const menuBtn          = document.getElementById("menuBtn");
  const drawer           = document.getElementById("drawer");
  const drawerOverlay    = document.getElementById("drawerOverlay");
  const drawerClose      = document.getElementById("drawerClose");
  const btnAbrirModal    = document.getElementById("btnAbrirModal");
  const btnVerBiblioteca = document.getElementById("btnVerBiblioteca");
  const btnDesabilitarMov= document.getElementById("btnDesabilitarMov");
  const movTexto         = document.getElementById("movTexto");

  const modalOverlay    = document.getElementById("modalOverlay");
  const modalClose      = document.getElementById("modalClose");
  const btnCancelar     = document.getElementById("btnCancelar");
  const btnSalvar       = document.getElementById("btnSalvar");
  const importArea      = document.getElementById("importArea");
  const importText      = document.getElementById("importText");
  const importSub       = document.getElementById("importSub");
  const importIcon      = document.getElementById("importIcon");
  const badgeReading    = document.getElementById("badgeReading");
  const badgeAuto       = document.getElementById("badgeAuto");
  const coverPreview    = document.getElementById("coverPreview");
  const coverPlaceholder= document.getElementById("coverPlaceholder");
  const coverLabel      = document.getElementById("coverLabel");
  const coverSub        = document.getElementById("coverSub");
  const btnTrocarCapa   = document.getElementById("btnTrocarCapa");
  const fieldTitulo     = document.getElementById("fieldTitulo");
  const fieldAutor      = document.getElementById("fieldAutor");
  const fieldAlbum      = document.getElementById("fieldAlbum");
  const fieldAno        = document.getElementById("fieldAno");
  const fieldGenero     = document.getElementById("fieldGenero");

  const modalBiblioteca = document.getElementById("modalBiblioteca");
  const bibClose        = document.getElementById("bibClose");
  const listaMusicas    = document.getElementById("listaMusicas");

  const drawerP       = document.getElementById("drawer-p");
  const btnLogoDev    = document.getElementById("btnLogoDev");
  const modalDev      = document.getElementById("modalDev");
  const devClose      = document.getElementById("devClose");
  const devGithubLink = document.getElementById("devGithubLink");

  const modalEditar            = document.getElementById("modalEditar");
  const editarClose            = document.getElementById("editarClose");
  const editarCancelar         = document.getElementById("editarCancelar");
  const editarSalvar           = document.getElementById("editarSalvar");
  const editarBtnTrocarCapa    = document.getElementById("editarBtnTrocarCapa");
  const editarCoverPreview     = document.getElementById("editarCoverPreview");
  const editarCoverPlaceholder = document.getElementById("editarCoverPlaceholder");
  const editarCoverLabel       = document.getElementById("editarCoverLabel");
  const editarTitulo           = document.getElementById("editarTitulo");
  const editarAutor            = document.getElementById("editarAutor");
  const editarAlbum            = document.getElementById("editarAlbum");
  const editarAno              = document.getElementById("editarAno");
  const editarGenero           = document.getElementById("editarGenero");

  let editarIdAtual   = null;
  let editarCapaBase64= null;
  let editarCapaMudou = false;

//drawer

  function abrirDrawer() {
    drawer.classList.add("open");
    drawerOverlay.classList.add("open");
  }
  function fecharDrawer() {
    drawer.classList.remove("open");
    drawerOverlay.classList.remove("open");
  }

  menuBtn.addEventListener("click", abrirDrawer);
  drawerClose.addEventListener("click", fecharDrawer);
  drawerOverlay.addEventListener("click", fecharDrawer);

//modal d musica nova

  function abrirModal() {
    fecharDrawer();
    resetModal();
    modalOverlay.classList.add("open");
  }
  function fecharModal() {
    modalOverlay.classList.remove("open");
  }
  function resetModal() {
    capaAtualBase64 = null;
    caminhoAtual = null;
    fieldTitulo.value = "";
    fieldAutor.value  = "";
    fieldAlbum.value  = "";
    fieldAno.value    = "";
    fieldGenero.value = "";
    coverPreview.src = "";
    coverPreview.style.display    = "none";
    coverPlaceholder.style.display= "block";
    coverLabel.textContent = "Nenhuma capa";
    coverSub.textContent   = "Extraída do MP3 ou importada manualmente";
    importArea.classList.remove("has-file");
    importIcon.textContent = "↑";
    importText.textContent = "Clique para selecionar um MP3";
    importSub.textContent  = "ou arraste e solte aqui";
    badgeReading.style.display = "none";
    badgeAuto.style.display    = "none";
    btnSalvar.disabled = true;
    [fieldTitulo, fieldAutor, fieldAlbum, fieldAno, fieldGenero].forEach(
      (el) => el.classList.remove("auto-filled")
    );
  }

  btnAbrirModal.addEventListener("click", abrirModal);
  modalClose.addEventListener("click", fecharModal);
  btnCancelar.addEventListener("click", fecharModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) fecharModal();
  });

  importArea.addEventListener("click", async () => {
    badgeReading.style.display = "flex";
    badgeAuto.style.display    = "none";
    const meta = await ipcRenderer.invoke("importar-mp3");
    badgeReading.style.display = "none";
    if (!meta) return;

    caminhoAtual      = meta.caminho;
    fieldTitulo.value = meta.titulo || "";
    fieldAutor.value  = meta.autor  || "";
    fieldAlbum.value  = meta.album  || "";
    fieldAno.value    = meta.ano    || "";
    fieldGenero.value = meta.genero || "";

    if (meta.titulo || meta.autor || meta.album || meta.genero) {
      badgeAuto.style.display = "flex";
      [fieldTitulo, fieldAutor, fieldAlbum, fieldAno, fieldGenero].forEach(
        (el) => { if (el.value) el.classList.add("auto-filled"); }
      );
    }

    if (meta.capaBase64) {
      capaAtualBase64 = meta.capaBase64;
      setCapa(meta.capaBase64, "Capa extraída do MP3", "Via tags ID3");
    }

    const nomeArquivo = meta.caminho.split(/[\\/]/).pop();
    importArea.classList.add("has-file");
    importIcon.textContent = "♪";
    importText.innerHTML   = `<strong>${nomeArquivo}</strong>`;
    importSub.textContent  = "arquivo selecionado";
    btnSalvar.disabled = false;
  });

  btnTrocarCapa.addEventListener("click", async (e) => {
    e.stopPropagation();
    const base64 = await ipcRenderer.invoke("importar-capa");
    if (!base64) return;
    capaAtualBase64 = base64;
    setCapa(base64, "Capa personalizada", "Importada manualmente");
  });

  function setCapa(src, label, sub) {
    coverPreview.src           = src;
    coverPreview.style.display = "block";
    coverPlaceholder.style.display = "none";
    coverLabel.textContent = label;
    coverSub.textContent   = sub;
  }

  btnSalvar.addEventListener("click", async () => {
    if (!caminhoAtual) return;

    const dados = {
      titulo:     fieldTitulo.value.trim() || "Sem título",
      autor:      fieldAutor.value.trim(),
      album:      fieldAlbum.value.trim(),
      ano:        fieldAno.value.trim(),
      genero:     fieldGenero.value.trim(),
      caminho:    caminhoAtual,
      capaBase64: capaAtualBase64,
    };

    btnSalvar.textContent = "Salvando…";
    btnSalvar.disabled    = true;

    const result = await ipcRenderer.invoke("salvar-musica", dados);

    if (result && result.id) {
      songs = songs.filter((s) => !s.isPlaceholder);

      songs.push({
        title:  dados.titulo,
        author: dados.autor,
        audio:  result.caminho,
        image:  dados.capaBase64 || "",
        id:     result.id,
      });

      if (currentIndex >= songs.length) currentIndex = songs.length - 1;
      loadSong(currentIndex);

      btnSalvar.textContent = "✓ Salvo!";
      setTimeout(() => {
        fecharModal();
        btnSalvar.textContent = "Salvar música";
      }, 800);
    }
  });


//modal da biblioteca
  async function abrirBiblioteca() {
    fecharDrawer();
    const musicas = await ipcRenderer.invoke("listar-musicas");
    renderBiblioteca(musicas);
    modalBiblioteca.classList.add("open");
  }

  function renderBiblioteca(musicas) {
    if (!musicas || musicas.length === 0) {
      listaMusicas.innerHTML = '<p class="empty-state">Nenhuma música adicionada ainda.</p>';
      return;
    }

    listaMusicas.innerHTML = musicas.map((m) => `
      <div class="bib-item"
           data-id="${m.id}"
           data-caminho="${m.caminho}"
           data-titulo="${m.titulo}"
           data-autor="${m.autor || ""}"
           data-album="${m.album || ""}"
           data-ano="${m.ano || ""}"
           data-genero="${m.genero || ""}"
           data-capa='${m.capaBase64 || ""}'>
        <div class="bib-thumb">
          ${m.capaBase64 ? `<img src="${m.capaBase64}" alt="Capa">` : `<span>♪</span>`}
        </div>
        <div class="bib-info">
          <strong>${m.titulo}</strong>
          <small>${m.autor || "Artista desconhecido"}</small>
        </div>
        <button class="bib-play" title="Tocar agora"><span class="bib-play-icon"></span></button>
        <button class="bib-edit" title="Editar" data-id="${m.id}"><span class="bib-edit-icon"></span></button>
        <button class="bib-del"  title="Remover" data-id="${m.id}">✕</button>
      </div>
    `).join("");

    //tocar
    listaMusicas.querySelectorAll(".bib-play").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".bib-item");
        const idClicada = Number(item.dataset.id);
        songs = songs.filter((s) => !s.isPlaceholder && s.id !== idClicada);
        songs.unshift({
          title:  item.dataset.titulo,
          author: item.dataset.autor,
          audio:  item.dataset.caminho,
          image:  item.dataset.capa || "",
          id:     idClicada,
        });
        currentIndex = 0;
        loadSong(0);
        audio.play();
        modalBiblioteca.classList.remove("open");
      });
    });


    //editar
    listaMusicas.querySelectorAll(".bib-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".bib-item");
        abrirModalEditar({
          id:         Number(item.dataset.id),
          titulo:     item.dataset.titulo,
          autor:      item.dataset.autor,
          album:      item.dataset.album  || "",
          ano:        item.dataset.ano    || "",
          genero:     item.dataset.genero || "",
          capaBase64: item.dataset.capa   || null,
        });
      });
    });

//deletar
    listaMusicas.querySelectorAll(".bib-del").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.id);
        await ipcRenderer.invoke("deletar-musica", id);

        const idxNaSongs = songs.findIndex((s) => s.id === id);
        if (idxNaSongs !== -1) {
          songs.splice(idxNaSongs, 1);

          if (songs.length === 0) {
            songs = [PLACEHOLDER];
            currentIndex = 0;
          } else {
            if (currentIndex >= songs.length) currentIndex = songs.length - 1;
            else if (idxNaSongs < currentIndex) currentIndex--;
          }
          loadSong(currentIndex);
        }

        btn.closest(".bib-item").remove();
        if (!listaMusicas.querySelector(".bib-item")) {
          listaMusicas.innerHTML = '<p class="empty-state">Nenhuma música adicionada ainda.</p>';
        }
      });
    });
  }

  btnVerBiblioteca.addEventListener("click", abrirBiblioteca);
  bibClose.addEventListener("click", () => modalBiblioteca.classList.remove("open"));
  modalBiblioteca.addEventListener("click", (e) => {
    if (e.target === modalBiblioteca) modalBiblioteca.classList.remove("open");
  });

//modal sobre o desenvolvedor
  drawerP.addEventListener("click", () => {
    fecharDrawer();
    modalDev.classList.add("open");
  });
  btnLogoDev.addEventListener("click", () => {
    fecharDrawer();
    modalDev.classList.add("open");
  });
  devClose.addEventListener("click", () => modalDev.classList.remove("open"));
  modalDev.addEventListener("click", (e) => {
    if (e.target === modalDev) modalDev.classList.remove("open");
  });
  devGithubLink.addEventListener("click", (e) => {
    e.preventDefault();
    shell.openExternal("https://github.com/Jopako/Sompur");
  });

 

  function abrirModalEditar(musica) {
    editarIdAtual   = musica.id;
    editarCapaBase64= null;
    editarCapaMudou = false;

    editarTitulo.value = musica.titulo || "";
    editarAutor.value  = musica.autor  || "";
    editarAlbum.value  = musica.album  || "";
    editarAno.value    = musica.ano    || "";
    editarGenero.value = musica.genero || "";

    if (musica.capaBase64) {
      editarCoverPreview.src           = musica.capaBase64;
      editarCoverPreview.style.display = "block";
      editarCoverPlaceholder.style.display = "none";
      editarCoverLabel.textContent = "Capa atual";
    } else {
      editarCoverPreview.style.display     = "none";
      editarCoverPlaceholder.style.display = "block";
      editarCoverLabel.textContent = "Sem capa";
    }

    editarSalvar.textContent = "Salvar alterações";
    editarSalvar.disabled    = false;
    modalEditar.classList.add("open");
  }

  function fecharModalEditar() {
    modalEditar.classList.remove("open");
  }

  editarClose.addEventListener("click", fecharModalEditar);
  editarCancelar.addEventListener("click", fecharModalEditar);
  modalEditar.addEventListener("click", (e) => {
    if (e.target === modalEditar) fecharModalEditar();
  });

  editarBtnTrocarCapa.addEventListener("click", async () => {
    const base64 = await ipcRenderer.invoke("importar-capa");
    if (!base64) return;
    editarCapaBase64 = base64;
    editarCapaMudou  = true;
    editarCoverPreview.src           = base64;
    editarCoverPreview.style.display = "block";
    editarCoverPlaceholder.style.display = "none";
    editarCoverLabel.textContent = "Nova capa selecionada";
  });

  editarSalvar.addEventListener("click", async () => {
    if (!editarIdAtual) return;

    editarSalvar.textContent = "Salvando…";
    editarSalvar.disabled    = true;

    const dados = {
      id:         editarIdAtual,
      titulo:     editarTitulo.value.trim() || "Sem título",
      autor:      editarAutor.value.trim(),
      album:      editarAlbum.value.trim(),
      ano:        editarAno.value.trim(),
      genero:     editarGenero.value.trim(),
      capaBase64: editarCapaMudou ? editarCapaBase64 : null,
    };

    try {
      await ipcRenderer.invoke("atualizar-musica", dados);


      const item = listaMusicas.querySelector(`.bib-item[data-id="${editarIdAtual}"]`);
      if (item) {
        item.dataset.titulo = dados.titulo;
        item.dataset.autor  = dados.autor;
        item.dataset.album  = dados.album;
        item.dataset.ano    = dados.ano;
        item.dataset.genero = dados.genero;
        item.querySelector(".bib-info strong").textContent = dados.titulo;
        item.querySelector(".bib-info small").textContent  = dados.autor || "Artista desconhecido";
        if (editarCapaMudou && editarCapaBase64) {
          item.dataset.capa = editarCapaBase64;
          item.querySelector(".bib-thumb").innerHTML = `<img src="${editarCapaBase64}" alt="Capa">`;
        }
      }


      const idx = songs.findIndex((s) => s.id === editarIdAtual);
      if (idx !== -1) {
        songs[idx].title  = dados.titulo;
        songs[idx].author = dados.autor;
        if (editarCapaMudou && editarCapaBase64) songs[idx].image = editarCapaBase64;
        if (idx === currentIndex) {
          titleEl.textContent  = dados.titulo;
          authorEl.textContent = dados.autor;
          if (editarCapaMudou && editarCapaBase64) imageEl.src = editarCapaBase64;
        }
      }

      editarSalvar.textContent = "✓ Salvo!";
      setTimeout(fecharModalEditar, 700);
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      editarSalvar.textContent = "Erro ao salvar";
      editarSalvar.disabled    = false;
    }
  });


  
  async function abrirConfigMov() {
    fecharDrawer();
    movimentacaoHabilitada = !movimentacaoHabilitada;
    movTexto.textContent = movimentacaoHabilitada ? "Desabilitar Movimentação" : "Habilitar Movimentação";
    if (!movimentacaoHabilitada) {
      card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)";
    }
  }

  btnDesabilitarMov.addEventListener("click", abrirConfigMov);


  try {
    const musicasSalvas = await ipcRenderer.invoke("listar-musicas");
    if (musicasSalvas && musicasSalvas.length > 0) {
      songs = musicasSalvas.map((m) => ({
        title:  m.titulo,
        author: m.autor || "",
        audio:  m.caminho,
        image:  m.capaBase64 || "",
        id:     m.id,
      }));
    }
  } catch (_) {}


  function loadSong(index) {
    const song = songs[index];
    titleEl.textContent  = song.title;
    authorEl.textContent = song.author;
    imageEl.src          = song.image || "";

    const isPlaceholder = !!song.isPlaceholder;
    audio.src = isPlaceholder ? "" : song.audio;

    byEl.style.display = isPlaceholder ? "none" : "flex";

    stopStart.disabled      = isPlaceholder;
    restart.disabled        = isPlaceholder;
    next.disabled           = isPlaceholder;
    prev.disabled           = isPlaceholder;
    stopStart.style.opacity = isPlaceholder ? "0.35" : "1";
    restart.style.opacity   = isPlaceholder ? "0.35" : "1";
    next.style.opacity      = isPlaceholder ? "0.35" : "1";
    prev.style.opacity      = isPlaceholder ? "0.35" : "1";
  }

  loadSong(currentIndex);

  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs    = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  function updateSlider() {
    durationSlider.max   = audio.duration || 0;
    durationSlider.value = audio.currentTime;
    currentTimeSpan.textContent   = formatTime(audio.currentTime);
    totalDurationSpan.textContent = formatTime(audio.duration);
  }

  function updateVolume() {
    audio.volume = Number(volumeSlider.value) / 100;
  }

  function updatePausePlayIcon() {
    pausePlayImg.src = audio.paused ? "Assets/play.png" : "Assets/pause.png";
  }

  durationSlider.addEventListener("input", () => {
    audio.currentTime = (durationSlider.value / durationSlider.max) * audio.duration;
  });

  volumeSlider.addEventListener("input", updateVolume);

  stopStart.addEventListener("click", () => {
    if (audio.paused) audio.play();
    else audio.pause();
  });

  restart.addEventListener("click", () => {
    audio.currentTime = 0;
    audio.play();
  });

  next.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % songs.length;
    loadSong(currentIndex);
    audio.play();
  });

  prev.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong(currentIndex);
    audio.play();
  });

  audio.addEventListener("ended", () => {
    currentIndex = (currentIndex + 1) % songs.length;
    loadSong(currentIndex);
    audio.play();
  });

  audio.addEventListener("play",            updatePausePlayIcon);
  audio.addEventListener("pause",           updatePausePlayIcon);
  audio.addEventListener("timeupdate",      updateSlider);
  audio.addEventListener("loadedmetadata",  updateSlider);
  updatePausePlayIcon();
  updateSlider();
  updateVolume();

  card.addEventListener("mousemove", (e) => {
    if (!movimentacaoHabilitada) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)";
  });
});