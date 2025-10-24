# 🌍 Configuração de Variáveis de Ambiente

## Estrutura de Arquivos

O projeto usa diferentes arquivos `.env` para cada ambiente:

- **`.env`** - Configuração padrão (não commitar)
- **`.env.development`** - Variáveis de desenvolvimento (não commitar)
- **`.env.production`** - Variáveis de produção (não commitar)
- **`.env.example`** - Exemplo de configuração (pode commitar)

## Variáveis Disponíveis

### `VITE_API_URL`

URL base da API do backend.

**Desenvolvimento:**
```
VITE_API_URL=http://localhost/socialmusic_backend
```

**Produção:**
```
VITE_API_URL=https://backend-socialmusic.onrender.com
```

## 📦 Configuração na Vercel

Para configurar as variáveis de ambiente na Vercel:

1. Acesse o dashboard do projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione a seguinte variável:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `VITE_API_URL` | `https://backend-socialmusic.onrender.com` | Production |
| `VITE_API_URL` | `http://localhost/socialmusic_backend` | Preview (opcional) |
| `VITE_API_URL` | `http://localhost/socialmusic_backend` | Development (opcional) |

### Como adicionar:

1. **Key/Name:** `VITE_API_URL`
2. **Value:** `https://backend-socialmusic.onrender.com`
3. **Environments:** Selecione `Production` (ou todos se preferir)
4. Clique em **Save**
5. Faça um novo deploy ou redeploy do projeto

## 🛠️ Desenvolvimento Local

Para desenvolvimento local:

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. Configure a URL do backend local:
   ```
   VITE_API_URL=http://localhost/socialmusic_backend
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🚀 Build para Produção

O Vite automaticamente usa o arquivo `.env.production` durante o build:

```bash
npm run build
```

## 📝 Endpoints da API

O backend expõe os seguintes endpoints:

- `/api/cadastro.php` - Cadastro de usuários
- `/api/autentica.php` - Autenticação de usuários
- `/api/logout.php` - Logout
- `/api/verifica_sessao.php` - Verificação de sessão
- `/api/status_sessao.php` - Status da sessão
- `/api/buscar_musicas.php` - Busca de músicas
- `/api/spotify_musicas.php` - Músicas do Spotify
- `/api/search.php` - Busca geral
- `/api/spotify_user_auth.php` - Autenticação com Spotify

## ⚠️ Importante

- **NUNCA** commite arquivos `.env` com dados sensíveis
- Os arquivos `.env` já estão no `.gitignore`
- Use `.env.example` como referência
- Na Vercel, configure as variáveis através do dashboard
