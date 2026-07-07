
<div align="center">
  
  ![Sompur](src/Assets/sompur.png)

 
<p> Sompur é um aplicativo desktop para reprodução de arquivos MP3. Adicione suas músicas do jeito que preferir, personalize a capa, o nome e o autor. Criei este projeto para ouvir as músicas que amo com a identidade que eu queria. Baixe manualmente o MP3 e a capa e adicione tudo ao Sompur. Parece retrógrado? Talvez. Mas esse pequeno processo faz com que cada música receba mais atenção e tenha um significado especial. Espero que você aproveite essa experiência tanto quanto eu. </p>

</div>



<img width="400" height="600" alt="image" src="https://github.com/user-attachments/assets/c6647776-0dd5-424e-ba28-06419097a577" />
<img width="400" height="600" alt="image" src="https://github.com/user-attachments/assets/aecfd7d3-78c9-4021-a558-6baa7ec1c997" />

---

  # Frontend:         [![My Skills](https://skillicons.dev/icons?i=js,html,css)](https://skillicons.dev)
  # Backend:          [![My Skills](https://skillicons.dev/icons?i=nodejs,electron)](https://skillicons.dev) 
  # Banco de Dados:   [![My Skills](https://skillicons.dev/icons?i=sqlite)](https://skillicons.dev) 

  
**Metadados:** Biblioteca `music-metadata` para extrair informações de tags ID3

---


# Funcionalidades Atuais

### Reprodução de Áudio

- Reprodução de arquivos MP3 locais com controles básicos
- Botão play/pause com ícone dinâmico
- Navegação com próxima/anterior (com loop cíclico)
- Reinício da música
- Autoplay — passa para próxima música automaticamente ao final

### Gerenciamento de Biblioteca

- Importar músicas MP3 com extração automática de metadados (título, artista, álbum, ano, gênero)
- Banco de dados SQLite para persistência de informações
- Visualizar biblioteca completa de músicas importadas
- Importar/alterar capas de álbum
- Edição manual de metadados antes de salvar
- Exclusão de músicas da biblioteca

### Controles e Interface

- Slider de progresso — clique ou arraste para pular para qualquer ponto da música
- Mostrador de tempo em formato MM:SS (tempo atual / duração total)
- Controle de volume com slider
- Menu lateral (drawer) com acesso a todas as funcionalidades
- Efeito de movimentação 3D no card principal (hover effect com perspectiva)
- Opção para ativar/desativar o efeito de movimentação conforme preferência do usuário

### Armazenamento de Dados

- Banco de dados SQLite criado automaticamente em `~/.config/meu-app/sompur.db`
- Todas as músicas, capas e metadados são persistidos localmente

---

### Adicionando Músicas



**Importar via Interface**

1. Clique no menu (hambúrguer) no topo
2. Selecione "Adicionar música"
3. Escolha um arquivo MP3
4. Os metadados serão extraídos automaticamente (Ou quase isso)
5. Edite se necessário e salve (Provavelmente necessário)


---

## Considerações de Produção

- Banco de dados é criado no diretório de dados do usuário (`app.getPath("userData")`)
- Compatível com Windows, macOS e Linux

---

## Próximos Passos Potenciais

- Mudança do design da Biblioteca.

- Add Auto-Update (electron-builder suporta auto-update)



---

# Sprites feitos no Aseprite <img width="32" height="32" alt="ase" src="https://github.com/user-attachments/assets/11fff839-b259-4f3b-8454-330237611ae2" />


### Bola do Slider <img width="32" height="32" alt="ball" src="https://github.com/user-attachments/assets/2262c5ed-8934-4e44-99c0-e8b8fb8609d7" />
### Pause <img width="32" height="32" alt="pause" src="https://github.com/user-attachments/assets/7c788e81-cbd8-4ece-8c0e-d58b7be73348" />
### Volume <img width="32" height="32" alt="som" src="https://github.com/user-attachments/assets/0feccec3-0514-4711-91a9-e1d69a573d62" />
### Replay <img width="32" height="32" alt="replay" src="https://github.com/user-attachments/assets/bc5d0cc4-0dda-4eac-8996-ba0291303d4c" />
### Play <img width="32" height="32" alt="play" src="https://github.com/user-attachments/assets/016995da-11af-4ff8-89c3-8945394e11f3" />
### Avançar  <img width="32" height="32" alt="play aseprite" src="https://github.com/user-attachments/assets/a2b4f22f-45eb-4a24-be88-19b227fb7662" />
### Retroceder <img width="32" height="32" alt="playLeft aseprite" src="https://github.com/user-attachments/assets/77d61b48-3c9a-4f88-922b-065e3cb67b94" />
### Editar <img width="32" height="32" alt="pen" src="https://github.com/user-attachments/assets/f0178cc6-a1be-42ff-8452-345ec8847b1b" />



---

## Autor


*João Paulo Kowalski*

<div align="center">
  <img width="42" height="42" alt="logo" src="https://github.com/user-attachments/assets/47756f78-1955-4056-bde4-bc6ed674a306" />

</div>


