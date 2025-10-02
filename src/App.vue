<template>
  <v-app>

    <v-app-bar elevation="0" color=transparent dark>

      <v-app-bar-title class="font-weight-normal" style="color: white;">SocialMusic</v-app-bar-title>

      <v-spacer></v-spacer>

      <v-text-field label="Busque no SocialMusic" variant="solo" bg-color="#E6E0FF" rounded="pill" density="compact"
        hide-details append-inner-icon="mdi-magnify" class="mx-4" style="max-width: 450px;"></v-text-field>

      <v-spacer></v-spacer>

      <v-btn variant="text" class="text-capitalize" style="color: white;">Página Inicial</v-btn>
      <v-btn variant="text" class="text-capitalize" style="color: white;">Músicas</v-btn>
      
      <div v-if="!usuario">
        <v-dialog max-width="500" v-model="dialog" persistent>
          <template v-slot:activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" text="Entre ou Cadastre-se" variant="outlined" class="text-none ml-2" rounded="lg"
              style="border: 2px solid #EEE8FF; color: #EEE8FF;"></v-btn>
          </template>

          <v-form ref="form" @submit.prevent="submitForm">
            <v-card class="rounded-lg">
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
        <span class="text-subtitle-1 mr-4" style="color: #EEE8FF;">Olá, {{ usuario.nome }}!  </span>
        <v-btn @click="logout" text="Sair" variant="flat" color="red-lighten-1" class="text-none" rounded="lg"></v-btn>
      </div>
      
      </v-app-bar>

    <v-img :src="fundoUrl" cover height="85vh">
      <div class="fill-height" style="background-color: rgba(0, 0, 0, 0.5);">
        <v-container id="intro" class="fill-height">
          <v-row align-content="end" justify="start" class="fill-height">
            <v-col cols="12" md="8" lg="6">
              <h1 class="text-h2 font-weight-bold mb-4 text-white">
                Avalie músicas do momento!
              </h1>
              <p class="text-h6 mb-6 text-grey-lighten-2" style="max-width: 500px;">
                Entre com sua conta Spotify, avalie e comente músicas, visualize as avaliações de seus amigos.
              </p>
              <v-btn size="x-large" variant="outlined" rounded="lg" style="color: #EEE8FF;">Junte-se agora</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-img>

    <v-main>

      <div style="background-color: #f8f9fa;">
        <v-container>
          <h2 class="text-h4 font-weight-bold my-8 text-grey-darken-3">Populares essa semana - Spotify</h2>

          <v-sheet color="#EEE8FF" rounded="xl" class="pa-md-10 pa-5">
            <v-row>
              <v-col v-for="musica in musicasPopulares" :key="musica.titulo" cols="6" sm="4" md="2">
                <v-card hover color="transparent" flat>
                  <v-img :src="musica.capa" class="rounded-lg"></v-img>
                  <v-card-title class="text-subtitle-1 pa-1 mt-2">{{ musica.titulo }}</v-card-title>
                  <v-card-subtitle style="margin-top: -8px;" class="text-grey pa-1">{{ musica.artista
                  }}</v-card-subtitle>
                </v-card>
              </v-col>
            </v-row>
          </v-sheet>

          <h2 class="text-h4 font-weight-bold my-10 text-grey-darken-3">Principais Avaliações</h2>

          <v-row>
            <v-col v-for="(avaliacao, i) in avaliacoes" :key="i" cols="12" md="6" lg="4">
              <v-card rounded="lg" class="d-flex flex-column" height="300" >
                <v-card-text>
                  <div class="d-flex justify-space-between align-center">
                    <div class="d-flex align-center">
                      <v-avatar size="50" rounded="lg" class="mr-3">
                        <v-img :src="avaliacao.musica.capa"></v-img>
                      </v-avatar>
                      <div>
                        <div class="font-weight-bold">{{ avaliacao.musica.titulo }}</div>
                        <div class="text-caption text-grey">{{ avaliacao.musica.artista }}</div>
                      </div>
                    </div>
                    <v-rating :model-value="avaliacao.nota" color="orange" density="compact" half-increments
                      readonly></v-rating>
                  </div>
                </v-card-text>
                <v-divider class="mx-4"></v-divider>
                <v-card-title>{{ avaliacao.titulo }}</v-card-title>
                <v-card-text class="text-grey-darken-1">{{ avaliacao.comentario }}</v-card-text>
                <v-card-actions>
                  <v-avatar size="32" class="mr-2">
                    <v-img :src="avaliacao.usuario.avatar"></v-img>
                  </v-avatar>
                  <span class="text-subtitle-2">{{ avaliacao.usuario.nome }}</span>
                  <v-btn size="small" variant="outlined" rounded="lg" class="ml-2">Seguir</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn icon="mdi-heart-outline" variant="text" size="small"></v-btn>
                  <span class="text-body-2 text-grey">{{ avaliacao.likes }}</span>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>  
      </div>
      <div style="background-color: #f8f9fa;">
        <v-container>
          <v-row>
            <v-col cols="12" md="8">
              <h2 class="text-h5 font-weight-bold mb-4">Músicas em destaques</h2>

              <v-list lines="two" bg-color="transparent">
                <v-list-item v-for="musica in musicasAvaliadas" :key="musica.titulo" class="mb-2">
                  <template v-slot:prepend>
                    <v-avatar size="56" rounded="lg">
                      <v-img :src="musica.capa"></v-img>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-normal">{{ musica.titulo }}</v-list-item-title>
                  <v-list-item-subtitle>{{ musica.artista }}</v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="d-flex align-center">
                      <v-icon color="orange" icon="mdi-star" class="mr-1"></v-icon>
                      <span class="font-weight-normal">{{ musica.nota }}</span>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="4">
              <h2 class="text-h5 font-weight-bold mb-4">Minha última avaliação</h2>
              <v-sheet rounded="xl" class="pa-5" color="#EEE8FF">
                <div class="d-flex align-center mb-3">
                  <v-avatar class="mr-3">
                    <v-img :src="ultimaAvaliacao.usuario.avatar"></v-img>
                  </v-avatar>
                  <div>
                    <div class="font-weight-normal">{{ ultimaAvaliacao.usuario.nome }}</div>
                    <div class="text-grey text-caption">{{ ultimaAvaliacao.usuario.handle }}</div>
                  </div>
                </div>
                <p class="text-body-2 text-grey-darken-2">
                  {{ ultimaAvaliacao.texto }}
                </p>
              </v-sheet>

              <h2 class="text-h5 font-weight-bold mb-4 mt-8">Usuários recomendados</h2>
              <v-list bg-color="transparent">
                <v-list-item v-for="usuario in usuariosRecomendados" :key="usuario.handle" class="px-1">
                  <template v-slot:prepend>
                    <v-avatar class="mr-3">
                      <v-img :src="usuario.avatar"></v-img>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-normal">{{ usuario.nome }}</v-list-item-title>
                  <v-list-item-subtitle>{{ usuario.handle }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-main>
  </v-app>

</template>

<script setup>
// INÍCIO DAS MUDANÇAS NO SCRIPT
import { ref, reactive, onMounted } from 'vue';
// FIM DAS MUDANÇAS NO SCRIPT

import fundoUrl from '@/assets/fundoArrumado.png'

const musicasPopulares = ref([
  { titulo: 'Cardigan', artista: 'Taylor Swift', capa: 'https://akamai.sscdn.co/uploadfile/letras/albuns/6/f/6/e/971021601472784.jpg' },
  { titulo: 'Blinding Lights', artista: 'The Weeknd', capa: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' },
  { titulo: 'As It Was', artista: 'Harry Styles', capa: 'https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14' },
  { titulo: 'Levitating', artista: 'Dua Lipa', capa: 'https://images.genius.com/4136ca8f6c03bd2fbc30c8d75407de75.1000x1000x1.png' },
  { titulo: 'good 4 u', artista: 'Olivia Rodrigo', capa: 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a' },
  { titulo: 'MONTERO', artista: 'Lil Nas X', capa: 'https://cdn-images.dzcdn.net/images/cover/18e6daf0a1c70c1346c44670ff70645d/0x1900-000000-80-0-0.jpg' },
]);
const musicasAvaliadas = ref([
  { capa: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', titulo: 'White Ferrari', artista: 'Frank Ocean', nota: '4.5/5' },
  { capa: 'https://i.scdn.co/image/ab67616d0000b2739478c87599550dd73bfa7e02', titulo: 'White Iverson', artista: 'Post Malone', nota: '4.5/5' },
  { capa: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', titulo: 'White Tee (with NOI-NOAH)', artista: 'Summer Walk - NOI-NOAH', nota: '4.5/5' },
  { capa: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', titulo: 'White Teeth Teens', artista: 'Lorde', nota: '4.5/5' },
  { capa: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', titulo: 'White Horse', artista: 'Chris Stapleton', nota: '4.5/5' },
  { capa: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', titulo: 'White Rabbit', artista: 'Jefferson Airplane', nota: '4.5/5' },
]);

const ultimaAvaliacao = ref({
  usuario: {
    nome: 'Isabella',
    handle: '@white',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  texto: 'Produção visionária, linha de baixo icônica e performance magnética...',
});

const usuariosRecomendados = ref([
  { nome: 'White', handle: '@white', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { nome: 'White Mustang', handle: '@white_lana', avatar: 'https://randomuser.me/api/portraits/men/46.jpg' },
  { nome: 'White Orange', handle: '@orange_white', avatar: 'https://randomuser.me/api/portraits/men/47.jpg' },
]);

const avaliacoes = ref([
  {
    musica: { titulo: 'Billie Jean', artista: 'Michael Jackson', capa: 'https://cdn-images.dzcdn.net/images/cover/544862aa5be45bc82ad4ab1a14daf63a/1900x1900-000000-80-0-0.jpg' },
    nota: 5,
    titulo: 'A batida que mudou a história',
    comentario: 'Produção visionária, linha de baixo icônica e performance magnética. Um clássico atemporal.',
    usuario: { nome: 'IsaBarbosa', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    likes: 117
  },
  {
    musica: { titulo: 'Bohemian Rhapsody', artista: 'Queen', capa: 'https://upload.wikimedia.org/wikipedia/pt/9/9f/Bohemian_Rhapsody.png' },
    nota: 4.5,
    titulo: 'Uma ópera rock genial',
    comentario: 'Inovadora, complexa e emocionante. Uma obra-prima que desafia qualquer classificação.',
    usuario: { nome: 'CarlosF', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    likes: 204
  },
  {
    musica: { titulo: 'Smells Like Teen Spirit', artista: 'Nirvana', capa: 'https://cdn-images.dzcdn.net/images/cover/f0282817b697279e56df13909962a54a/1900x1900-000000-80-0-0.jpg' },
    nota: 4,
    titulo: 'O hino de uma geração',
    comentario: 'A energia crua e a letra apática capturaram perfeitamente o espírito dos anos 90. Essencial.',
    usuario: { nome: 'JulianaM', avatar: 'https://randomuser.me/api/portraits/women/55.jpg' },
    likes: 98
  }
]);

// INÍCIO DAS MUDANÇAS NO SCRIPT

// --- GERENCIAMENTO DE ESTADO E SESSÃO ---
const usuario = ref(null); // Armazena os dados do usuário logado. null = deslogado

// --- CONTROLE DO FORMULÁRIO ---
const dialog = ref(false)
const form = ref(null)
const loading = ref(false)
const view = ref('login')

const formData = reactive({
  nome: '', // Campo de nome para o cadastro
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

// --- VERIFICA SE JÁ EXISTE UMA SESSÃO AO CARREGAR A PÁGINA ---
onMounted(() => {
  const usuarioSalvo = localStorage.getItem('usuario');
  if (usuarioSalvo) {
    usuario.value = JSON.parse(usuarioSalvo);
  }
});

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

// --- LÓGICA DE SUBMISSÃO CORRIGIDA ---
async function submitForm() {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true

  try {
    // --- Lógica de CADASTRO ---
    if (view.value === 'register') {
      const res = await fetch("http://localhost/socialmusic_backend/api/cadastro.php", { // ATENÇÃO: Crie este arquivo no seu backend!
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.password,
          usuario: formData.email.split('@')[0]  // Gera um nome de usuário simples a partir do e-mail
        })
      });
      const data = await res.json();
      alert(data.mensagem); 

      if (data.sucesso) {
        changeView('login'); // Se o cadastro der certo, muda para a tela de login
      }
    
    // --- Lógica de LOGIN ---
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
// FIM DAS MUDANÇAS NO SCRIPT
</script>

<style scoped>
.v-main {
  padding-top: 0px !important;
}

#intro {
  margin-left: 0px;
}
.ajuste-botao {
  transform: translateY(-8px);
  opacity: 1 !important;
}

</style>