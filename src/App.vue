<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item class="pa-4">
          <v-list-item-title class="text-h6 font-weight-bold">SocialMusic</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <div class="pa-4">
        <form @submit.prevent="goToBusca(); drawer = false" autocomplete="off">
          <v-text-field v-model="searchQuery" placeholder="Busque no SocialMusic" variant="outlined" density="compact"
            hide-details append-inner-icon="mdi-magnify" autocomplete="off"
            @click:append-inner="goToBusca(); drawer = false">
          </v-text-field>
        </form>
      </div>

      <v-divider></v-divider>

      <v-list nav>
        <v-list-item prepend-icon="mdi-home" title="Página Inicial" value="home" to="/" @click="drawer = false">
        </v-list-item>
        <v-list-item prepend-icon="mdi-music" title="Músicas" value="musicas" to="/musicas" @click="drawer = false">
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <div v-if="!usuario">
            <v-btn block variant="outlined" class="mb-2" @click="openLoginDialog(); drawer = false">
              Entre ou Cadastre-se
            </v-btn>
          </div>
          <div v-else>
            <div class="d-flex align-center mb-3">
              <v-avatar size="40" class="mr-2">
                <v-img v-if="usuario.foto_perfil" :src="usuario.foto_perfil" alt="Foto do usuário" cover></v-img>
                <v-icon v-else size="40" color="grey">mdi-account-circle</v-icon>
              </v-avatar>
              <div class="text-subtitle-1 font-weight-medium">{{ usuario.nome }}</div>
            </div>
            <v-list nav density="compact" class="mb-3">
              <v-list-item prepend-icon="mdi-account" to="/perfil" class="mb-2" @click="drawer = false">
                <v-list-item-title class="text-body-2">Perfil</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="usuario.perfil === 'admin'" prepend-icon="mdi-shield-account" to="/admin" class="mb-2" @click="drawer = false">
                <v-list-item-title class="text-body-2">Painel Admin</v-list-item-title>
              </v-list-item>
            </v-list>
            <v-btn block variant="flat" color="red-lighten-1" @click="logout(); drawer = false">
              Sair
            </v-btn>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar elevation="0" :style="{ backgroundColor: appBarBackground }" :dark="!isScrolled"
      class="transition-background" app>
      <v-app-bar-nav-icon class="d-md-none" :style="{ color: textColor }"
        @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title class="font-weight-normal" :style="{ color: textColor, cursor: 'pointer' }"
        @click="router.push('/')">
        SocialMusic
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <div class="d-none d-md-flex align-center" style="max-width: 500px; width: 100%;">
        <form @submit.prevent="goToBusca" style="width: 100%;" autocomplete="off"><v-text-field v-model="searchQuery"
            placeholder="Busque no SocialMusic" variant="solo-filled" bg-color="#E6E0FF" rounded="pill"
            density="compact" hide-details append-inner-icon="mdi-magnify" autocomplete="off"
            @click:append-inner="goToBusca" class="mx-4" style="max-width: 450px;"></v-text-field></form>
      </div>

      <v-spacer></v-spacer>

      <div class="d-none d-md-flex">
        <v-btn variant="text" class="text-capitalize" :style="{ color: textColor }" to="/">Página Inicial</v-btn>
        <v-btn variant="text" class="text-capitalize" :style="{ color: textColor }" to="/musicas">Músicas</v-btn>
      </div>

      <div v-if="!usuario" class="d-none d-md-block">
        <v-dialog max-width="550" v-model="dialog" persistent>
          <template v-slot:activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" text="Entre ou Cadastre-se" variant="outlined" class="text-none mr-8 ml-2"
              rounded="lg"
              :style="{ border: `2px solid ${isScrolled ? '#000000' : '#EEE8FF'}`, color: textColor }"></v-btn>
          </template>

          <v-form ref="form" @submit.prevent="submitForm">
            <v-card class="rounded-lg pa-8">
              <v-fade-transition mode="out-in">
                <div v-if="view === 'register'">
                  <v-card-title class="text-h5 text-center font-weight-bold pt-5">Seja um membro
                    SocialMusic</v-card-title>
                  <v-card-text>
                    <v-text-field v-model="formData.nome" :rules="rules.required" label="Nome Completo"
                      variant="outlined" density="compact" class="mb-2"></v-text-field>
                    <v-text-field v-model="formData.username" :rules="rules.username" label="Nome de Usuário"
                      variant="outlined" density="compact" class="mb-2"></v-text-field>
                    <v-text-field v-model="formData.email" :rules="rules.email" label="E-mail" variant="outlined"
                      density="compact" class="mb-2"></v-text-field>
                    <v-text-field v-model="formData.password" :rules="rules.required" label="Senha" variant="outlined"
                      density="compact" type="password" class="mb-2"></v-text-field>
                    <v-text-field v-model="formData.confirmPassword" :rules="[...rules.required, rules.passwordMatch]"
                      label="Confirmar Senha" variant="outlined" density="compact" type="password"></v-text-field>
                    <v-btn type="submit" :loading="loading" block size="large" variant="flat" class="mt-6 text-none"
                      style="background-color: #B39DDB; color: white;">
                      Criar conta
                    </v-btn>

                    <v-divider class="my-4">
                      <span class="text-caption text-grey">ou</span>
                    </v-divider>

                    <v-btn @click="startSpotifyRegister" block size="large" variant="outlined" class="text-none mb-4"
                      style="border-color: #1DB954; color: #1DB954;" prepend-icon="mdi-spotify">
                      Cadastrar com Spotify
                    </v-btn>

                    <v-btn block variant="plain" :ripple="false" class="mt-2 text-none ajuste-botao"
                      @click="changeView('login')" style="text-decoration: underline;">
                      Já possuo uma conta
                    </v-btn>
                  </v-card-text>
                </div>

                <div v-if="view === 'login'">
                  <v-card-title class="text-h5 text-center font-weight-bold pt-5">Login na sua Conta</v-card-title>
                  <v-card-text>
                    <v-text-field v-model="formData.email" :rules="rules.email" label="E-mail" variant="outlined"
                      density="compact" class="mb-2"></v-text-field>
                    <v-text-field v-model="formData.password" :rules="rules.required" label="Senha" variant="outlined"
                      density="compact" type="password"></v-text-field>
                    <v-btn type="submit" :loading="loading" block size="large" variant="flat" class="mt-6 text-none"
                      style="background-color: #B39DDB; color: white;">
                      Entrar
                    </v-btn>

                    <v-divider class="my-4">
                      <span class="text-caption text-grey">ou</span>
                    </v-divider>

                    <v-btn @click="loginWithSpotify" block size="large" variant="outlined" class="text-none mb-4"
                      style="border-color: #1DB954; color: #1DB954;" prepend-icon="mdi-spotify">
                      Entrar com Spotify
                    </v-btn>

                    <v-btn block variant="plain" :ripple="false" class="mt-2 text-none ajuste-botao" color="black"
                      @click="changeView('register')" style="text-decoration: underline;">
                      Cadastre-se
                    </v-btn>
                  </v-card-text>
                </div>

                <div v-if="view === 'spotify-register'">
                  <v-card-title class="text-h5 text-center font-weight-bold pt-5">Complete seu Cadastro</v-card-title>
                  <v-card-subtitle class="text-center mb-4 text-success">
                    <v-icon color="success" class="mr-1">mdi-spotify</v-icon>
                    Conectado com Spotify!
                  </v-card-subtitle>
                  <v-card-text>
                    <v-text-field v-model="formData.nome" :rules="rules.required" label="Nome Completo"
                      variant="outlined" density="compact" class="mb-2"></v-text-field>
                    <v-text-field v-model="formData.username" :rules="rules.username" label="Nome de Usuário"
                      variant="outlined" density="compact" class="mb-4"></v-text-field>

                    <v-btn type="submit" :loading="loading" block size="large" variant="flat" class="mt-4 text-none"
                      style="background-color: #B39DDB; color: white;">
                      Finalizar Cadastro
                    </v-btn>

                    <v-btn block variant="plain" :ripple="false" class="mt-2 text-none ajuste-botao"
                      @click="changeView('login')" style="text-decoration: underline;">
                      Voltar ao Login
                    </v-btn>
                  </v-card-text>
                </div>
              </v-fade-transition>

              <v-card-actions class="px-5 pb-4">
                <v-spacer></v-spacer>
                <v-btn text="Fechar" @click="closeDialog"></v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
      </div>

      <div v-else class="d-none d-md-flex align-center ml-4">
        <v-menu offset-y min-width="200">
          <template v-slot:activator="{ props }">
            <div class="d-flex align-center mr-8" style="cursor: pointer;" v-bind="props">
              <v-avatar size="32">
                <v-img v-if="usuario.foto_perfil" :src="usuario.foto_perfil" alt="Foto do usuário" cover></v-img>
                <v-icon v-else :color="textColor" size="32">mdi-account-circle</v-icon>
              </v-avatar>
              <span class="text-subtitle-2 ml-2" :style="{ color: textColor }">{{ usuario.nome }}</span>
            </div>
          </template>
          <v-list class="py-2">
            <v-list-item class="px-4 pb-2">
              <template v-slot:prepend>
                <v-avatar size="48" class="mr-3">
                  <v-img v-if="usuario.foto_perfil" :src="usuario.foto_perfil" alt="Foto do usuário" cover></v-img>
                  <v-icon v-else size="48" color="grey">mdi-account-circle</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="text-subtitle-2 font-weight-bold">{{ usuario.nome }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ usuario.email }}</v-list-item-subtitle>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item prepend-icon="mdi-account" to="/perfil" class="px-4">
              <v-list-item-title class="text-body-2">Perfil</v-list-item-title>
            </v-list-item>

            <v-list-item v-if="usuario.perfil === 'admin'" prepend-icon="mdi-shield-account" to="/admin" class="px-4">
              <v-list-item-title class="text-body-2">Painel Admin</v-list-item-title>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item prepend-icon="mdi-logout" @click="logout" class="px-4">
              <v-list-item-title class="text-body-2">Sair</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-alert v-model="alertVisible" :type="alertType" closable class="ma-4"
      style="position: fixed; top:78px ;left: 50%; transform: translate(-50%, -50%); z-index: 9999; max-width: 400px;"
      elevation="4" rounded="lg">
      <template v-slot:prepend>
        <v-icon :icon="alertType === 'success' ? 'mdi-check-circle' :
          alertType === 'error' ? 'mdi-alert-circle' :
            alertType === 'warning' ? 'mdi-alert' : 'mdi-information'"></v-icon>
      </template>
      {{ alertMessage }}
    </v-alert>

    <v-main style="display: flex; flex-direction: column; min-height: calc(100vh - 64px);">
      <div style="flex: 1;">
        <router-view />
      </div>
    </v-main>

    <v-footer class="bg-white text-black">
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
            <h3 class="text-h6 mb-3">SocialMusic</h3>
            <p class="text-body-2 text-grey-darken-1">
              A plataforma para avaliar e descobrir músicas com seus amigos.
            </p>
          </v-col>

          <v-col cols="12" md="4">
            <h3 class="text-h6 mb-3">Links Rápidos</h3>
            <v-list bg-color="transparent" density="compact">
              <v-list-item to="/" class="text-grey-darken-1">
                Página Inicial
              </v-list-item>
              <v-list-item to="/musicas" class="text-grey-darken-1">
                Músicas
              </v-list-item>
              <v-list-item to="/sobre" class="text-grey-darken-1">
                Sobre Nós
              </v-list-item>
            </v-list>
          </v-col>

          <v-col cols="12" md="4">
            <h3 class="text-h6 mb-3">Siga-nos</h3>
            <div class="d-flex gap-2">
              <v-btn icon="mdi-instagram" variant="text" color="black"></v-btn>
              <v-btn icon="mdi-twitter" variant="text" color="black"></v-btn>
              <v-btn icon="mdi-facebook" variant="text" color="black"></v-btn>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row>
          <v-col cols="12" class="text-center">
            <p class="text-body-2 text-grey-darken-1">
              © {{ new Date().getFullYear() }} SocialMusic - Todos os direitos reservados
            </p>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Configuração da API URL
// (Mantive vazia conforme sua configuração de proxy Vercel)
const API_URL = '';

const route = useRoute(); 
const router = useRouter(); 
const searchQuery = ref('');

function goToBusca() {
  if (!searchQuery.value.trim())
    return;

  router.push({
    name: 'Busca',
    query: { q: searchQuery.value },
  });
}

const isHomePage = computed(() => route.path === '/');

const appBarBackground = computed(() => {
  if (!isHomePage.value) {
    return '#FFFFFF';
  }
  return isScrolled.value ? '#FFFFFF' : 'transparent';
});

const isScrolled = ref(false);
const textColor = computed(() => {
  if (!isHomePage.value) {
    return '#000000';
  }
  return isScrolled.value ? '#000000' : '#FFFFFF';
});


const handleScroll = () => {
  if (!isHomePage.value) {
    isScrolled.value = true;
    return;
  }

  const scrollPosition = window.scrollY;
  if (scrollPosition < 50) {
    isScrolled.value = false;
    return;
  }

  const popularesSection = document.getElementById('populares');

  if (popularesSection) {
    const sectionTop = popularesSection.offsetTop;
    const threshold = sectionTop - 64;

    isScrolled.value = scrollPosition >= threshold;
  }
};

watch(isHomePage, (newVal) => {
  if (newVal) {
    isScrolled.value = false;
    setTimeout(() => handleScroll(), 0);
  } else {
    isScrolled.value = true;
  }
});

watch(() => route.path, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Função para lidar com a mudança de storage
function handleStorageChange(event) {
  if (event.key === 'usuario' && event.newValue === null) {
    usuario.value = null;
    showAlert("A sua sessão expirou.", "warning");
  }
}

// Função para atualizar usuário sem reload
function updateUserState() {
  const usuarioSalvo = localStorage.getItem('usuario');
  if (usuarioSalvo) {
    usuario.value = JSON.parse(usuarioSalvo);
  } else {
    usuario.value = null;
  }
}

onMounted(() => {
  handleScroll();
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('storage', handleStorageChange);
  
  // Ouvir evento de atualização do usuário (Vindo do Perfil.vue)
  window.addEventListener('user-updated', updateUserState);
  
  capturarDadosSpotify();
  updateUserState(); // Carga inicial
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('storage', handleStorageChange);
  window.removeEventListener('user-updated', updateUserState);
});

const usuario = ref(null);
const dialog = ref(false);
const form = ref(null);
const loading = ref(false);
const view = ref('login');
const spotifyEmail = ref(''); 
const spotifyData = ref({}); 
const drawer = ref(false);
const alertVisible = ref(false);
const alertType = ref('success');
const alertMessage = ref('');

const formData = reactive({
  nome: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const rules = {
  required: [
    v => !!v || 'Este campo é obrigatório.'
  ],
  username: [
    v => !!v || 'O nome de usuário é obrigatório.',
    v => v.length >= 4 || 'O nome de usuário deve ter pelo menos 4 caracteres.',
    v => v.length <= 15 || 'O nome de usuário deve ter no máximo 15 caracteres.',
    v => /^[a-z]+$/.test(v) || 'O nome de usuário pode conter apenas letras minúsculas.',
  ],
  email: [
    v => !!v || 'O e-mail é obrigatório.',
    v => /.+@.+\..+/.test(v) || 'O e-mail deve ser válido.',
  ],
  passwordMatch: [
    v => v === formData.password || 'As senhas não conferem.',
  ]
};

function changeView(newView) {
  view.value = newView;
  form.value.resetValidation();
}

function closeDialog() {
  dialog.value = false;
  setTimeout(() => {
    view.value = 'login';
    form.value.reset();
    form.value.resetValidation();
  }, 300);
}

function openLoginDialog() {
  if (form.value) {
    form.value.reset();
    form.value.resetValidation();
  }
  view.value = 'login';
  dialog.value = true;
}

provide('openLoginDialog', openLoginDialog);
provide('showAlert', showAlert);

function showAlert(message, type = 'success') {
  alertMessage.value = message;
  alertType.value = type;
  alertVisible.value = true;
  
  setTimeout(() => {
    alertVisible.value = false;
  }, 5000);
}

async function logout() {
  loading.value = true;
  try {
    const res = await fetch(`${API_URL}/api/logout.php`, { 
      method: "POST", 
      credentials: 'include' 
    });
    await res.json();
  } catch (err) {
    console.error("Erro ao fazer logout:", err);
  } finally {
    usuario.value = null;
    localStorage.removeItem('usuario');
    searchQuery.value = ''; 
    loading.value = false;
    router.push('/');
  }
}

function loginWithSpotify() {
  window.location.href = 'https://backend-socialmusic.onrender.com/api/spotify_user_auth.php?action=authorize&mode=login';
}

function startSpotifyRegister() {
  window.location.href = 'https://backend-socialmusic.onrender.com/api/spotify_user_auth.php?action=authorize&mode=register';
}

const capturarDadosSpotify = () => {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('spotify_login') === 'success') {
    const userData = {
      id: urlParams.get('id'),
      nome: urlParams.get('nome'),
      email: urlParams.get('email'),
      perfil: urlParams.get('perfil'),
      
      foto_perfil: urlParams.get('foto') 
    };

    localStorage.setItem('usuario', JSON.stringify(userData));
    usuario.value = userData;

    showAlert(`Bem-vindo de volta, ${userData.nome}!`, 'success');
    window.history.replaceState({}, document.title, window.location.pathname);
    
    location.reload();
  }
  else if (urlParams.get('success') === '1') {
    spotifyData.value = {
      email: urlParams.get('email'),
      nome: urlParams.get('nome'),
      spotify_id: urlParams.get('spotify_id'),
      imagem: urlParams.get('imagem')
    };

    spotifyEmail.value = spotifyData.value.email;
    formData.nome = spotifyData.value.nome;
    formData.email = spotifyData.value.email;
    formData.username = '';

    view.value = 'spotify-register';
    dialog.value = true;
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  else if (urlParams.get('error')) {
    showAlert('Erro na autenticação Spotify: ' + urlParams.get('error'), 'error');
  }
};

async function submitForm() {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;

  try {
    if (view.value === 'register' || view.value === 'spotify-register') {
      const payload = {
        nome: formData.nome,
        username: formData.username,
        email: formData.email
      };

      if (view.value === 'spotify-register') {
        payload.origem = 'spotify';
        payload.spotifyId = spotifyData.value.spotify_id;
      } else {
        payload.senha = formData.password;
      }

      const res = await fetch(`${API_URL}/api/cadastro.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.sucesso) {
        if (view.value === 'spotify-register') {
          showAlert("Cadastro com Spotify realizado com sucesso!", "success");
        } else {
          showAlert(data.mensagem, "success");
        }
        changeView('login');
      } else {
        showAlert(data.mensagem, "error");
      }
    } else {
      const res = await fetch(`${API_URL}/api/autentica.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          senha: formData.password
        })
      });
      const data = await res.json();

      if (data.sucesso) {
        showAlert(data.mensagem, "success");
        usuario.value = data.usuario;
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        closeDialog();
        // Reload no login para garantir sessão limpa
        location.reload();
      } else {
        showAlert(data.mensagem, "error");
      }
    }
  } catch (err) {
    console.error("Erro na comunicação com a API:", err);
    showAlert("Ocorreu um erro. Verifique sua conexão e tente novamente.", "error");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.v-main {
  padding-top: 0px !important;
}

.ajuste-botao {
  transform: translateY(-8px);
  opacity: 1 !important;
}

.transition-background {
  transition: background-color 0.3s ease !important;
}

::-webkit-scrollbar {
  width: 10px;
  background-color: transparent;
}

::-webkit-scrollbar-track {
  background-color: rgba(179, 157, 219, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background-color: #B39DDB;
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #9575CD;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #B39DDB rgba(179, 157, 219, 0.1);
}
</style>