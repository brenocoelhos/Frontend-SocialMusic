<template>
  <div>
    <v-img :src="fundoUrl" cover height="85vh" class="hero-banner">
      <div class="fill-height hero-overlay">
        <v-container id="intro" class="fill-height">
          <v-row align-content="end" justify="start" class="fill-height">
            <v-col cols="12" md="8" lg="6">
              <h1 class="text-h2 font-weight-bold mb-4 text-white">
                Avalie músicas do momento!
              </h1>
              <p class="text-h6 mb-6 text-grey-lighten-2" style="max-width: 500px;">
                Entre com sua conta Spotify, avalie e comente músicas, visualize as avaliações de seus amigos.
              </p>
              <v-btn v-if="!usuario" size="x-large" variant="outlined" rounded="lg" style="color: #EEE8FF;"
                @click="openLoginDialog">Junte-se agora</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-img>


    <div id="populares" style="background-color: #f8f9fa;">
      <v-container>
        <h2 class="text-h4 font-weight-bold my-8 text-grey-darken-3">Populares essa semana</h2>

        <v-sheet color="#EEE8FF" rounded="xl" class="pa-md-10 pa-5">
          <!-- Loading Skeleton -->
          <v-row v-if="loadingPopulares">
            <v-col v-for="n in 6" :key="n" cols="6" sm="4" md="2">
              <v-skeleton-loader type="image, article" color="transparent"></v-skeleton-loader>
            </v-col>
          </v-row>

          <!-- Conteúdo Real com Transição -->
          <v-fade-transition>
            <v-row v-if="!loadingPopulares">
              <v-col v-for="musica in musicasPopulares" :key="musica.titulo" cols="6" sm="4" md="2">
                <v-card hover color="transparent" flat>
                  <v-img :src="musica.capa" class="rounded-lg"></v-img>
                  <v-card-title class="text-subtitle-1 pa-1 mt-2">{{ musica.titulo }}</v-card-title>
                  <v-card-subtitle style="margin-top: -8px;" class="text-grey pa-1">{{ musica.artista
                  }}</v-card-subtitle>
                </v-card>
              </v-col>
            </v-row>
          </v-fade-transition>
        </v-sheet>

        <!--Principais Avaliações-->
        <h2 class="text-h4 font-weight-bold my-10 text-grey-darken-3">Principais Avaliações</h2>

        <v-row v-if="loadingAvaliacoes">
          <v-col v-for="n in 3" :key="n" cols="12" md="6" lg="4">
            <v-skeleton-loader type="list-item-avatar-two-line, article, actions"></v-skeleton-loader>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col v-for="avaliacao in avaliacoes" :key="avaliacao.id" cols="12" md="6" lg="4">
            <v-card rounded="lg" class="d-flex flex-column" height="300">
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
                  <v-img v-if="review.usuario_avatar" :src="review.usuario_avatar" alt="Avatar do usuário" cover />
                  <v-icon v-else size="56" color="grey-lighten-1">mdi-account-circle</v-icon>
                </v-avatar>
                <span class="text-subtitle-2">{{ avaliacao.usuario.nome }}</span>

                <v-btn v-if="loggedInUserId !== avaliacao.usuario.id" size="small"
                  :variant="avaliacao.is_following ? 'outlined' : 'flat'" color="#EEE8FF" rounded="lg" class="ml-2"
                  :loading="followLoadingId === avaliacao.id" @click="toggleFollow(avaliacao)">
                  {{ avaliacao.is_following ? 'A Seguir' : 'Seguir' }}
                </v-btn>

                <v-spacer></v-spacer>

                <v-btn :icon="avaliacao.usuario_curtiu ? 'mdi-heart' : 'mdi-heart-outline'"
                  :color="avaliacao.usuario_curtiu ? 'red' : 'grey-darken-1'" variant="text" size="small"
                  :loading="likeLoadingId === avaliacao.id" @click="toggleLike(avaliacao)"></v-btn>
                <span class="text-body-2 text-grey">{{ avaliacao.likes }}</span>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- SEÇÃO DE MÚSICAS EM DESTAQUE -->
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
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue';
import fundoUrl from '@/assets/fundoArrumado.png'

// Configuração da API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/socialmusic_backend';

// Injeta a função para abrir o diálogo de login e mostrar alertas
const openLoginDialog = inject('openLoginDialog');
const showAlert = inject('showAlert');

// estado do usuário
const usuario = ref(null);
const loggedInUserId = ref(null);

// estado das musicas populares
const musicasPopulares = ref([]);
const loadingPopulares = ref(true);

// estado das avaliações principais 
const avaliacoes = ref([]);
const loadingAvaliacoes = ref(true);
const followLoadingId = ref(null);
const likeLoadingId = ref(null);

onMounted(async () => {
  // Verifica se o usuário está logado
  const usuarioSalvo = localStorage.getItem('usuario');
  if (usuarioSalvo) {
    const user = JSON.parse(usuarioSalvo);
    usuario.value = user;
    loggedInUserId.value = user.id
  }
  fetchMusicasPopulares();
  fetchPrincipaisAvaliacoes();
});

// Funções para buscar dados da API
async function fetchMusicasPopulares() {
  loadingPopulares.value = true;
  try {
    const resPopulares = await fetch(
      `${API_URL}/api/spotify_musicas.php?tipo=populares&limit=6`
    );
    const dataPopulares = await resPopulares.json();
    if (dataPopulares.sucesso) {
      musicasPopulares.value = dataPopulares.musicas;
    }
  } catch (error) {
    console.error('Erro ao carregar músicas do Spotify:', error);
  } finally {
    loadingPopulares.value = false;
  }
}

// Função para buscar as principais avaliações
async function fetchPrincipaisAvaliacoes() {
  loadingAvaliacoes.value = true;
  try {
    const res = await fetch(
      `${API_URL}/api/principais_avaliacoes.php?limit=3`, {
      credentials: 'include'
    });
    const data = await res.json();
    if (data.sucesso) {
      avaliacoes.value = data.avaliacoes;
    }
  } catch (error) {
    console.error('Erro ao carregar principais avaliações:', error);
  } finally {
    loadingAvaliacoes.value = false;
  }
}

// Função para seguir/deixar de seguir o autor da avaliação
async function toggleFollow(review) {
  if (!loggedInUserId.value) return openLoginDialog();

  followLoadingId.value = review.id;
  const endpoint = review.is_following ? 'deixar_de_seguir.php' : 'seguir.php';

  try {
    const res = await fetch(`${API_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: review.usuario.id }),
    });
    const data = await res.json();
    if (data.sucesso) {
      review.is_following = !review.is_following;
    } else {
      showAlert(data.mensagem, 'error');
    }
  } catch (error) {
    console.error('Erro ao seguir/deixar de seguir:', error);
    showAlert('Erro ao seguir/deixar de seguir.', 'error');
  } finally {
    followLoadingId.value = null;
  }
}

async function toggleLike(review) {
  if (!loggedInUserId.value) return openLoginDialog();

  likeLoadingId.value = review.id;
  try {
    const res = await fetch(`${API_URL}/api/curtir_avaliacao.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ avaliacao_id: review.id }),
    });
    const data = await res.json();
    if (data.sucesso) {
      review.usuario_curtiu = data.curtido;
      review.likes = data.total_curtidas;
    } else {
      showAlert(data.mensagem, 'error');
    }
  } catch (error) {
    console.error('Erro ao curtir avaliação:', error);
    showAlert('Erro ao curtir avaliação.', 'error');
  } finally {
    likeLoadingId.value = null;
  }
}

// Dados estáticos 

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

</script>

<style scoped>
#intro {
  margin-left: 0px;
}

/* Mobile: Esconder imagem e mostrar cor sólida */
@media (max-width: 959px) {
  .hero-banner :deep(.v-img__img) {
    display: none !important;
  }

  .hero-overlay {
    background-color: #3e281b !important;
    /* 👈 COR SÓLIDA AQUI - Azul acinzentado escuro */
  }
}

/* Desktop: Manter overlay semi-transparente */
@media (min-width: 960px) {
  .hero-overlay {
    background-color: rgba(0, 0, 0, 0.5);
  }
}
</style>