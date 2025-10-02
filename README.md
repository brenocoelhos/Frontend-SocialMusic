# SocialMusic - Rede Social para Amantes de Música

## 📱 Sobre o Projeto
SocialMusic é uma plataforma social que permite aos usuários compartilhar, avaliar e descobrir músicas. Integrado com o Spotify, o aplicativo oferece uma experiência rica em interação social focada em música.

## 🔄 Fluxo da Aplicação

### 1. Autenticação
- **Login/Registro**
  - Usuário pode se registrar com email e senha
  - Login via credenciais locais
  - (Futuro) Integração com login do Spotify

### 2. Página Inicial (Home)
- **Header**
  - Barra de pesquisa global
  - Navegação principal
  - Botão de login/perfil do usuário
  
- **Hero Section**
  - Banner principal com chamada para ação
  - Botão "Junte-se agora" para novos usuários

- **Seções Principais**
  1. Músicas Populares da Semana
     - Grid de músicas populares do Spotify
     - Exibição de capa, título e artista
  
  2. Principais Avaliações
     - Cards com avaliações em destaque
     - Informações da música
     - Nota e comentário do usuário
     - Interações sociais (likes, seguir)

  3. Músicas em Destaque
     - Lista de músicas mais avaliadas
     - Exibição de nota média

  4. Painel Lateral
     - Última avaliação do usuário
     - Usuários recomendados para seguir

## 💿 Instalação

Set up your project using your preferred package manager. Use the corresponding command to install the dependencies:

| Package Manager                                                | Command        |
|---------------------------------------------------------------|----------------|
| [yarn](https://yarnpkg.com/getting-started)                   | `yarn install` |
| [npm](https://docs.npmjs.com/cli/v7/commands/npm-install)     | `npm install`  |
| [pnpm](https://pnpm.io/installation)                          | `pnpm install` |
| [bun](https://bun.sh/#getting-started)                        | `bun install`  |

After completing the installation, your environment is ready for Vuetify development.

## 🛠️ Stack Tecnológica

- **Frontend**
  - Vue.js 3
  - Vuetify 3
  - Vue Router
  - Vite

- **Backend** (Em desenvolvimento)
  - PHP
  - MySQL

## 💫 Recursos e Funcionalidades

### Implementados
- [x] Sistema de autenticação local
- [x] Interface responsiva
- [x] Listagem de músicas populares
- [x] Sistema de avaliações
- [x] Perfil de usuário básico

### Em Desenvolvimento
- [ ] Integração com API do Spotify
- [ ] Sistema de seguir usuários
- [ ] Feed personalizado
- [ ] Sistema de comentários
- [ ] Playlist colaborativas
- [ ] Recomendações personalizadas

These features are curated to provide a seamless development experience from setup to deployment, ensuring that your Vuetify application is both powerful and maintainable.

## � Como Executar o Projeto

1. Clone o repositório
```bash
git clone https://github.com/brenocoelhos/Frontend-SocialMusic.git
```

2. Instale as dependências
```bash
cd social-music
npm install
```

3. Execute o projeto
```bash
npm run dev
```

## 📦 Estrutura de Arquivos

```
social-music/
├── src/
│   ├── assets/         # Recursos estáticos
│   ├── components/     # Componentes Vue
│   ├── pages/         # Páginas da aplicação
│   ├── plugins/       # Plugins Vue (Vuetify)
│   ├── router/        # Configuração de rotas
│   ├── styles/        # Arquivos de estilo
│   ├── App.vue        # Componente raiz
│   └── main.js        # Ponto de entrada
└── public/            # Arquivos públicos
```

(Repeat for npm, pnpm, and bun with respective commands.)

Once the build process is completed, your application will be ready for deployment in a production environment.

## 🤝 Contribuição
Contribuições são sempre bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores
- [@brenocoelhos](https://github.com/brenocoelhos)

## 🎯 Status do Projeto
🚧 Em desenvolvimento 🚧
