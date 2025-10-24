# ✅ Checklist de Deploy - Frontend SocialMusic

## 🔧 Arquivos Criados/Modificados

- [x] `.env.development` - Configuração de desenvolvimento
- [x] `.env.production` - Configuração de produção  
- [x] `.env.example` - Exemplo para documentação
- [x] `ENVIRONMENT_VARIABLES.md` - Documentação completa
- [x] `.gitignore` - Atualizado para não commitar .env
- [x] `src/App.vue` - Atualizado para usar variáveis de ambiente
- [x] `src/pages/index.vue` - Atualizado para usar variáveis de ambiente
- [x] `src/pages/Busca.vue` - Atualizado para usar variáveis de ambiente
- [x] `src/router/index.js` - Já estava configurado corretamente

## 📋 Tarefas para Deploy na Vercel

### 1. Configurar Variável de Ambiente na Vercel

Acesse: **Settings** → **Environment Variables**

Adicione:
- **Name:** `VITE_API_URL`
- **Value:** `https://backend-socialmusic.onrender.com`
- **Environment:** `Production` (marque esta opção)

### 2. Verificar Build Settings

Em **Settings** → **Build & Development Settings**:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3. Fazer Deploy

Opção 1 - Através do Git:
```bash
git add .
git commit -m "feat: configure environment variables for production"
git push origin main
```

Opção 2 - Redeploy manual na Vercel:
- Vá em **Deployments**
- Clique nos três pontos do último deployment
- Selecione **Redeploy**

### 4. Verificar Funcionamento

Após o deploy, teste:
- ✅ Login/Cadastro de usuários
- ✅ Busca de músicas
- ✅ Carregamento de músicas populares
- ✅ Login com Spotify (se configurado)

## 🚨 Problemas Comuns

### CORS Error
Se aparecer erro de CORS, configure no backend (Render):
```php
header('Access-Control-Allow-Origin: https://seu-dominio.vercel.app');
```

### API não responde
- Verifique se a variável `VITE_API_URL` foi salva corretamente na Vercel
- Confirme que o backend no Render está rodando
- Teste a URL do backend diretamente no navegador

### Variável não funciona
- Lembre-se: variáveis de ambiente no Vite devem começar com `VITE_`
- Após alterar variáveis na Vercel, é necessário fazer redeploy
- Limpe o cache do build se necessário

## 📱 Teste Local antes do Deploy

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em modo desenvolvimento
npm run dev

# 3. Testar build de produção localmente
npm run build
npm run preview
```

## 🔍 URLs Importantes

- **Frontend (Vercel):** [Sua URL da Vercel]
- **Backend (Render):** https://backend-socialmusic.onrender.com
- **Backend Local:** http://localhost/socialmusic_backend

## ✨ Próximos Passos

1. [ ] Fazer push das alterações para o Git
2. [ ] Configurar variável na Vercel
3. [ ] Aguardar deploy automático
4. [ ] Testar todas as funcionalidades
5. [ ] Configurar domínio customizado (opcional)
6. [ ] Configurar HTTPS no backend (já feito no Render)
7. [ ] Adicionar analytics (opcional)

---

**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Desenvolvedor:** SocialMusic Team
