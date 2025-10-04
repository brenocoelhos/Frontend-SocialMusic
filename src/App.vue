<template>
  <v-app>
    <!-- APP BAR - Ficará em todas as páginas -->
    <v-app-bar elevation="0" :style="{ backgroundColor: appBarBackground }" :dark="!isScrolled" class="transition-background" app>
      <v-app-bar-title class="font-weight-normal" :style="{ color: textColor }">SocialMusic</v-app-bar-title>

      <v-spacer></v-spacer>

      <div class="d-flex align-center" style="max-width: 500px; width: 100%;">
        <v-text-field label="Busque no SocialMusic" variant="solo" bg-color="#E6E0FF" rounded="pill" density="compact"
        hide-details append-inner-icon="mdi-magnify" class="mx-4" style="max-width: 450px;"></v-text-field>
      </div>

      <v-spacer></v-spacer>

      <v-btn variant="text" class="text-capitalize" :style="{ color: textColor }" to="/">Página Inicial</v-btn>
      <v-btn variant="text" class="text-capitalize" :style="{ color: textColor }">Músicas</v-btn>
      
      <div v-if="!usuario">
        <v-dialog max-width="550" v-model="dialog" persistent>
          <template v-slot:activator=" { props: activatorProps }">
            <v-btn v-bind="activatorProps" text="Entre ou Cadastre-se" variant="outlined" class="text-none mr-8 ml-2" rounded="lg"
              :style="{ border: `2px solid ${isScrolled ? '#000000' : '#EEE8FF'}`, color: textColor }"></v-btn>
          </template>

          <v-form ref="form" @submit.prevent="submitForm">
            <v-card class="rounded-lg pa-8" >
              <v-fade-transition mode="out-in">
                <div v-if="view === 'register'">
                  <v-card-title class="text-h5 text-center font-weight-bold pt-5">Seja um membro SocialMusic</v-card-title>
                  <v-card-text>
                    <v-text-field v-model="formData.nome" :rules="rules.required" label="Nome Completo"
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
                    <v-btn block variant="plain" :ripple="false" class="mt-2 text-none ajuste-botao" @click="changeView('login')"
                      style="text-decoration: underline;">
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
                    <v-btn block variant="plain" :ripple="false" class="mt-2 text-none ajuste-botao" color="black" @click="changeView('register')"
                      style="text-decoration: underline;">
                      Cadastre-se
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

      <div v-else class="d-flex align-center ml-4">
        <span class="text-subtitle-1 mr-4" style="color: #EEE8FF;">Olá, {{ usuario.nome }}!</span>
        <v-btn v-if="usuario.perfil === 'admin'" to="/admin" text="Painel Admin" variant="flat" color="error" class="text-none mr-2" rounded="lg"></v-btn>
        <v-btn @click="logout" text="Sair" variant="flat" color="red-lighten-1" class="text-none mr-8 ml-2" rounded="lg"></v-btn>
      </div>
    </v-app-bar>

    <!-- CONTEÚDO DAS PÁGINAS - RouterView renderiza cada página aqui -->
    <v-main style="display: flex; flex-direction: column; min-height: calc(100vh - 64px);">
      <div style="flex: 1;">
        <router-view />
      </div>
    </v-main>

    <!-- FOOTER - Sem "app" para ficar no final da página -->
    <v-footer class="bg-white text-black">
      <v-container>
        <v-row>
          <!-- Coluna 1: Sobre -->
          <v-col cols="12" md="4">
            <h3 class="text-h6 mb-3">SocialMusic</h3>
            <p class="text-body-2 text-grey-darken-1">
              A plataforma para avaliar e descobrir músicas com seus amigos.
            </p>
          </v-col>

          <!-- Coluna 2: Links -->
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

          <!-- Coluna 3: Redes Sociais -->
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

        <!-- Copyright -->
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';

// Controle da AppBar
const appBarBackground = ref('transparent')
const isScrolled = ref(false)
const textColor = computed(() => isScrolled.value ? '#000000' : '#FFFFFF')

// Função para verificar o scroll
const handleScroll = () => {
  const scrollPosition = window.scrollY
  const popularesSection = document.getElementById('populares')
  
  if (popularesSection) {
    const sectionTop = popularesSection.offsetTop
    const threshold = sectionTop - 64

    if (scrollPosition >= threshold) {
      appBarBackground.value = '#FFFFFF'
      isScrolled.value = true
    } else {
      appBarBackground.value = 'transparent'
      isScrolled.value = false
    }
  }
}

// Inicializa e limpa os event listeners
onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll)
  
  // Verifica se já existe uma sessão
  const usuarioSalvo = localStorage.getItem('usuario');
  if (usuarioSalvo) {
    usuario.value = JSON.parse(usuarioSalvo);
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// --- GERENCIAMENTO DE ESTADO E SESSÃO ---
const usuario = ref(null);

// --- CONTROLE DO FORMULÁRIO ---
const dialog = ref(false)
const form = ref(null)
const loading = ref(false)
const view = ref('login')

const formData = reactive({
  nome: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  required: [
    v => !!v || 'Este campo é obrigatório.'
  ],
  email: [
    v => !!v || 'O e-mail é obrigatório.',
    v => /.+@.+\..+/.test(v) || 'O e-mail deve ser válido.',
  ],
  passwordMatch: [
    v => v === formData.password || 'As senhas não conferem.',
  ]
}

function changeView(newView) {
  view.value = newView
  form.value.resetValidation()
}

function closeDialog() {
  dialog.value = false
  setTimeout(() => {
    view.value = 'login'
    form.value.reset()
    form.value.resetValidation()
  }, 300)
}

// --- FUNÇÃO DE LOGOUT ---
async function logout() {
  loading.value = true;
  try {
    await fetch("http://localhost/socialmusic_backend/api/logout.php", { method: "POST" });
  } catch (err) {
    console.error("Erro ao fazer logout:", err);
  } finally {
    usuario.value = null;
    localStorage.removeItem('usuario');
    loading.value = false;
    alert("Você saiu com sucesso!");
  }
}

// --- LÓGICA DE SUBMISSÃO ---
async function submitForm() {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true

  try {
    if (view.value === 'register') {
      const res = await fetch("http://localhost/socialmusic_backend/api/cadastro.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.password,
          usuario: formData.email.split('@')[0]
        })
      });
      const data = await res.json();
      alert(data.mensagem); 

      if (data.sucesso) {
        changeView('login');
      }
    } else {
      const res = await fetch("http://localhost/socialmusic_backend/api/autentica.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          senha: formData.password 
        })
      });
      const data = await res.json();
      
      if (data.sucesso) {
        alert(data.mensagem);
        usuario.value = data.usuario;
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        closeDialog();
      } else {
        alert(data.mensagem);
      }
    }
  } catch (err) {
    console.error("Erro na comunicação com a API:", err);
    alert("Ocorreu um erro. Verifique o console para mais detalhes.");
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