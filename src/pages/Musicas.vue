<template>
  <div class="musicas-page">
    <v-container class="py-16 mt-8">

      <v-row>
        <v-col cols="12" md="4" class="mb-8 mb-md-0">
          <div class="sticky-top">
            <h2 class="text-h5 font-weight-bold mb-6 text-grey darken-3 d-flex align-center">
              <v-icon icon="mdi-history" class="mr-2" color="primary"></v-icon>
              Músicas recentes
            </h2>

            <div v-if="loadingUltimas" class="py-4">
              <v-skeleton-loader type="list-item-avatar-two-line" v-for="n in 5" :key="n"
                class="mb-2 bg-transparent"></v-skeleton-loader>
            </div>

            <v-sheet v-else-if="!isLoggedIn" rounded="xl" class="pa-6 text-center border-dashed" color="white">
              <v-icon icon="mdi-account-circle-outline" size="48" color="grey" class="mb-3"></v-icon>
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Faça Login</h3>
              <p class="text-body-2 text-grey mb-4">Entre para ver seu histórico e avaliar músicas.</p>
              <v-btn color="primary" variant="flat" rounded="lg" @click="openLoginDialog" class="text-none">
                Entrar
              </v-btn>
            </v-sheet>

            <v-sheet v-else-if="usuario && !usuario.spotify_conectado" rounded="xl"
              class="pa-6 text-center border-dashed" color="white">
              <v-icon icon="mdi-spotify" size="48" color="#1DB954" class="mb-3"></v-icon>
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Vincule seu Spotify</h3>
              <p class="text-body-2 text-grey mb-4">
                Sua conta atual não está conectada ao Spotify. Conecte agora para ver seu histórico automaticamente.
              </p>
              <v-btn color="#1DB954" variant="flat" rounded="lg" class="text-none text-white" @click="connectSpotify">
                Conectar Spotify
              </v-btn>
            </v-sheet>

            <v-alert v-else-if="ultimasEscutadas.length === 0" type="info" variant="tonal" class="mb-4"
              density="compact">
              Não encontramos histórico recente. Ouça algo no Spotify e clique em atualizar!
            </v-alert>

            <v-list v-else bg-color="transparent" class="pa-0">
              <v-list-item v-for="musica in ultimasEscutadas" :key="musica.played_at" :to="getAvaliacaoUrl(musica)"
                class="mb-3 rounded-lg elevation-1 list-item-hover bg-white" lines="two">
                <template v-slot:prepend>
                  <v-avatar size="48" rounded="lg" class="mr-3">
                    <v-img :src="musica.capa" cover></v-img>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-subtitle-2 font-weight-bold text-truncate">
                  {{ musica.titulo }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption text-grey text-truncate">
                  {{ musica.artista }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-icon size="small" color="grey-lighten-1">mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-col>

        <v-col cols="12" md="8">
          <h2 class="text-h4 font-weight-bold mb-6 text-grey-darken-3 text-center text-md-left ml-md-2">
            Top Músicas da Comunidade
          </h2>

          <div v-if="loadingCommunity" class="text-center py-12">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          </div>

          <div v-else>
            <v-alert v-if="musicasMaisAvaliadas.length === 0" type="info" variant="tonal" class="mb-6">
              Ainda não há músicas avaliadas na plataforma. Seja o primeiro!
            </v-alert>

            <v-list bg-color="transparent" class="pa-0">
              <v-list-item v-for="(musica, index) in musicasMaisAvaliadas" :key="musica.id"
                :to="getAvaliacaoUrl(musica)" class="mb-4 rounded-lg elevation-1 list-item-hover bg-white pa-4"
                lines="two">
                <template v-slot:prepend>
                  <div class="d-flex align-center mr-4" style="min-width: 40px;">
                    <span class="text-h5 font-weight-bold text-grey-lighten-2">#{{ index + 1 }}</span>
                  </div>
                  <v-avatar size="64" rounded="lg" class="mr-4">
                    <v-img :src="musica.capa_url" :alt="musica.titulo" cover></v-img>
                  </v-avatar>
                </template>

                <v-list-item-title class="text-h6 font-weight-bold text-grey-darken-3">
                  {{ musica.titulo }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-1 text-grey-darken-1 mt-1">
                  {{ musica.artista }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <div class="d-flex flex-column align-end">
                    <div class="d-flex align-center mb-1 bg-amber-lighten-5 px-3 py-1 rounded-pill">
                      <v-icon color="orange" size="20" class="mr-1">mdi-star</v-icon>
                      <span class="text-h6 font-weight-bold text-grey-darken-3">{{ musica.media_nota }}</span>
                    </div>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmusic.onrender.com';

// Injeções globais 
const openLoginDialog = inject('openLoginDialog');

// Estados
const musicasMaisAvaliadas = ref([]);
const ultimasEscutadas = ref([]);
const loadingCommunity = ref(true);
const loadingUltimas = ref(false);
const isLoggedIn = ref(false);

// Verifica login
const usuario = ref(null);
const checkLogin = () => {
  const userStr = localStorage.getItem('usuario');
  if (userStr) {
    const user = JSON.parse(userStr);
    usuario.value = user;
    isLoggedIn.value = true;
    return true;
  }
  usuario.value = null;
  isLoggedIn.value = false;
  return false;
};

// Redireciona para conectar o Spotify caso o e-mail for o mesmo
function connectSpotify() {
  window.location.href = `${API_URL}/api/spotify/spotify_user_auth.php?action=authorize&mode=login`;
}

// Função para gerar URL da página de avaliação
function getAvaliacaoUrl(musica) {
  const params = new URLSearchParams();

  params.append('id', musica.id);
  params.append('name', musica.titulo);
  params.append('artist', musica.artista);
  const capa = musica.capa_url || musica.capa;
  params.append('image', capa);
  params.append('spotify', musica.spotify_url);


  if (musica.duration_ms) params.append('duration_ms', musica.duration_ms);
  if (musica.release_date) params.append('release_date', musica.release_date);
  if (musica.popularity) params.append('popularity', musica.popularity);
  if (musica.explicit) params.append('explicit', musica.explicit);
  if (musica.album_name) params.append('album_name', musica.album_name);
  if (musica.album_type) params.append('album_type', musica.album_type);

  return `/avaliacao?${params.toString()}`;
}

// Fetch Top Comunidade
async function fetchRanking() {
  loadingCommunity.value = true;
  try {
    const res = await fetch(`${API_URL}/api/spotify/musicas_destaque.php?limit=20`);
    const data = await res.json();

    if (data.sucesso) {
      musicasMaisAvaliadas.value = data.musicas;
    }
  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
  } finally {
    loadingCommunity.value = false;
  }
}

// Fetch Últimas Escutadas (User)
async function fetchUltimas() {
  if (!isLoggedIn.value) return;

  loadingUltimas.value = true;
  try {
    const res = await fetch(`${API_URL}/api/spotify/ultimas_escutadas.php?limit=10`, {
      credentials: 'include'
    });
    const data = await res.json();

    if (data.sucesso) {
      ultimasEscutadas.value = data.musicas;
    }
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
  } finally {
    loadingUltimas.value = false;
  }
}

onMounted(() => {
  checkLogin();
  fetchRanking();
  if (isLoggedIn.value) {
    fetchUltimas();
  }
});
</script>

<style scoped>
.musicas-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.list-item-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.list-item-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

/* Efeito Sticky para a coluna lateral ficar fixa ao rolar */
.sticky-top {
  position: sticky;
  top: 100px;
  /* Ajuste conforme a altura da sua Navbar */
}

/* Borda tracejada suave para o card de login */
.border-dashed {
  border: 2px dashed #e0e0e0 !important;
}
</style>