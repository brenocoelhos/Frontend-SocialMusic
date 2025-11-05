<template>
  <div style="
      background-color: #f8f9fa;
      min-height: 100vh;
      padding-top: 80px;
      position: relative;
      z-index: 0;
    ">
    <div v-if="isLoading" class="text-center pa-16">
      <v-progress-circular indeterminate color="#EEE8FF" size="64"></v-progress-circular>
    </div>

    <div v-else-if="!isLoading && error" class="pa-16">
      <v-card-text class="text-center text-grey">
        Erro ao carregar {{ error }}
      </v-card-text>
    </div>

    <div v-else-if="track">
      <!-- Seção de introdução -->
      <v-container class="py-8">
        <v-row justify="center" align="start">
          <!-- Música -->
          <v-col cols="12" md="4" lg="3">
            <v-img :src="track.image_url" alt="Capa da Música" aspect-ratio="1" rounded="lg" class="mb-4" cover>
              <template #placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="#EEE8FF" />
                </v-row>
              </template>
            </v-img>
            <div class="d-flex flex-column align-center">
              <h1 class="text-h4 font-weight-bold mb-2">{{ track.track_name }}</h1>
              <h2 class="text-h6 text-grey-darken-1 mb-4">{{ track.artist_name }}</h2>
              <v-btn prepend-icon="mdi-spotify" variant="flat" class="text-none" rounded="lg" color="#1DB954"
                size="large" block :href="track.spotify_url" target="_blank">
                Escutar no Spotify
              </v-btn>
            </div>
          </v-col>

          <!-- informações de avaliações da música -->
          <v-col cols="12" md="8" lg="6">
            <v-card rounded="xl" elevation="2" class="pa-6 mb-4">
              <v-row class="text-center">
                <v-col cols="4">
                  <div class="d-flex flex-column align-center">
                    <v-icon icon="mdi-comment-text" color="grey" size="32" class="mb-2" />
                    <h3 class="text-h5 font-weight-bold">{{ stats.total }}</h3>
                    <p class="text-grey text-body-2">Avaliações</p>
                  </div>
                </v-col>

                <v-col cols="4">
                  <div class="d-flex flex-column align-center">
                    <v-icon icon="mdi-star" color="orange" size="32" class="mb-2" />
                    <h3 class="text-h5 font-weight-bold">{{ stats.media > 0 ? stats.media.toFixed(1) : '--' }} / 5.0
                    </h3>
                    <p class="text-grey text-body-2">Média geral</p>
                  </div>
                </v-col>

                <v-col cols="4">
                  <div class="d-flex flex-column align-center">
                    <v-icon icon="mdi-star-outline" color="grey" size="32" class="mb-2" />
                    <h3 v-if="hasUserReview" class="text-h5 font-weight-bold">{{ userReview.nota }} / 5.0</h3>
                    <h3 v-else-if="isLoadingReview" class="text-h5 font-weight-bold">
                      <v-progress-circular indeterminate size="24" />
                    </h3>
                    <h3 v-else class="text-h5 font-weight-bold">--</h3>
                    <p class="text-grey text-body-2">Sua avaliação</p>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <div class="text-center">
                <v-btn v-if="hasUserReview" class="text-none" rounded="lg" size="large" color="#EEE8FF" variant="flat"
                  prepend-icon="mdi-pencil" @click="openEditComment">
                  Editar sua avaliação
                </v-btn>
                <v-btn v-else class="text-none" rounded="lg" size="large" color="#EEE8FF" variant="flat"
                  prepend-icon="mdi-pencil" @click="openComment" :disabled="isLoadingReview">
                  Escrever avaliação
                </v-btn>
              </div>
            </v-card>

            <!-- Detalhes música -->
            <v-card rounded="xl" elevation="2" class="pa-6">
              <h3 class="text-h6 font-weight-bold mb-4">Detalhes</h3>

              <v-row dense>
                <v-col cols="12" sm="6">
                  <div class="mb-3">
                    <p class="text-grey text-caption mb-1">Duração</p>
                    <p class="font-weight-medium">{{ track.duration }}</p>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="mb-3">
                    <p class="text-grey text-caption mb-1">Lançamento</p>
                    <p class="font-weight-medium">{{ track.release_date }}</p>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="mb-3">
                    <p class="text-grey text-caption mb-1">Popularidade do Spotify</p>
                    <p class="font-weight-medium">{{ track.popularity }} / 100</p>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="mb-3">
                    <p class="text-grey text-caption mb-1">Álbum</p>
                    <p class="font-weight-medium">{{ track.album_name }}</p>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div>
                    <p class="text-grey text-caption mb-1">Tipo de Lançamento</p>
                    <p class="font-weight-medium">{{ track.album_type }}</p>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div>
                    <p class="text-grey text-caption mb-1">Conteúdo Explícito</p>
                    <p v-if="track.explicit" class="font-weight-medium">Sim</p>
                    <p v-else class="font-weight-medium">Não</p>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- comentários/avaliações -->
      <v-container class="py-8">
        <v-row justify="center">
          <v-col cols="12" lg="9">
            <h2 class="text-h4 font-weight-bold mb-6">Avaliações</h2>

            <div v-if="isLoading" class="text-center pa-16">
              <v-progress-circular indeterminate color="#EEE8FF" size="48"></v-progress-circular>
              <p class="text-grey mt-4">Carregando avaliações...</p>
            </div>

            <div v-else-if="!isLoading && reviewsList.length === 0" class="text-center pa-16">
              <v-icon icon="mdi-comment-off-outline" size="48" color="grey-lighten-1"></v-icon>
              <p class="text-grey mt-4">Ninguém avaliou esta música ainda.</p>
              <p class="text-grey">Seja o primeiro a avaliar!</p>
            </div>

            <div v-else>
              <v-card v-for="review in reviewsList" :key="review.id" rounded="xl" elevation="2" class="mb-4">
                <v-card-text class="pa-6">
                  <div class="d-flex align-start">
                    <v-avatar size="56" class="mr-4">
                      <v-img v-if="review.usuario_avatar" :src="review.usuario_avatar" alt="Avatar do usuário" cover />
                      <v-icon v-else size="56" color="grey-lighten-1">mdi-account-circle</v-icon>
                    </v-avatar>

                    <div class="flex-grow-1">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <div>
                          <h3 class="text-h6 font-weight-bold">{{ review.usuario_nome }}</h3>
                          <p class="text-grey text-caption">{{ formatTimeAgo(review.data_criacao) }}</p>
                        </div>
                        <div>
                          <v-btn v-if="loggedInUserId && loggedInUserId !== review.usuario_id"
                            :loading="followLoadingId === review.id"
                            :variant="review.is_following ? 'outlined' : 'flat'" color="EEE8FF" class="text-none"
                            rounded="lg" @click="toggleFollow(review)">
                            {{ review.is_following ? 'A Seguir' : 'Seguir' }}
                          </v-btn>
                        </div>
                      </div>

                      <div class="mb-2">
                        <v-rating :model-value="parseFloat(review.nota)" color="amber" half-increments readonly
                          size="small" density="compact" />
                      </div>

                      <h4 v-if="review.titulo" class="text-body-1 font-weight-bold mb-1">{{ review.titulo }}</h4>

                      <div class="d-flex align-center justify-space-between mb-2">
                        <p class="text-body-1">{{ review.comentario }}</p>

                        <v-btn variant="text" size="small" class="text-none"
                          :color="review.usuario_curtiu ? 'red' : 'grey-darken-1'"
                          :loading="likeLoadingId === review.id" @click="toggleLike(review)"
                          :disabled="likeLoadingId === review.id">
                          <v-icon start>{{ review.usuario_curtiu ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                          {{ review.total_curtidas }}
                        </v-btn>
                      </div>

                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <div v-if="hasMoreReviews" class="text-center mt-6">
                <v-btn :loading="isLoadingMore" variant="outlined" class="text-none" rounded="lg" size="large"
                  @click="loadMoreReviews">
                  Carregar mais avaliações
                </v-btn>
              </div>
            </div>

          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Caixa de diálogo de avaliação -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card rounded="xl">
        <v-card-title class="pa-4">
          <span class="text-h5">Sua avaliação</span>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" @submit.prevent="submitReview">
            <p class="text-grey-darken-1 mb-2">Qual sua nota para esta música?</p>
            <v-rating v-model="reviewForm.nota" color="amber" density="comfortable" half-increments hover size="large"
              class="mb-4" :rules="[rules.required]" />

            <p class="text-grey-darken-1 mb-2">Dê um título para sua avaliação:</p>
            <v-text-field v-model="reviewForm.titulo" label="Título da avaliação" variant="outlined" maxlength="255"
              rounded="lg" class="mb-4" />

            <p class="text-grey-darken-1 mb-2">Escreva seu comentário:</p>
            <v-textarea v-model="reviewForm.comentario" label="Seu comentário" variant="outlined" rows="5" counter
              maxlength="1000" rounded="lg" />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeComment" class="text-none" rounded="lg" size="large">
            Cancelar
          </v-btn>
          <v-btn color="#EEE8FF" variant="flat" @click="submitReview" :loading="isSubmitting" class="text-none"
            rounded="lg" size="large">
            Postar Avaliação
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, watch, computed, inject } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const track = ref(null); // Armazena os detalhes da música
const isLoading = ref(false);
const error = ref(null);
const dialog = ref(false);
const form = ref(null);
const isSubmitting = ref(false);
const isLoadingReview = ref(true);
const userReview = ref(null); // Para guardar a avaliação existente
const hasUserReview = computed(() => userReview.value !== null);
const stats = ref({ total: 0, media: 0.0 });
const reviewsList = ref([]);
const loggedInUserId = ref(null); // ID do usuário logado
const followLoadingId = ref(null); // Para saber qual botão está carregando
const currentPage = ref(1); // Página atual para paginação
const reviewsPerPage = 3; // Número de avaliações por página igual ao limit do PHP
const isLoadingMore = ref(false); // Indica se está carregando mais avaliações
const likeLoadingId = ref(null); // Para saber qual avaliação está sendo curtida
const showAlert = inject("showAlert");// Função global para mostrar alertas
const hasMoreReviews = computed(() => {
  return reviewsList.value.length < stats.value.total;
});
const reviewForm = ref({
  nota: null,
  titulo: '',
  comentario: '',
});
const rules = {
  required: (v) => v > 0 || "A nota é obrigatória.",
};

// Função para formatar "tempo atrás"
function formatTimeAgo(dateString) {
  if (!dateString) return '--';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `Há ${Math.floor(interval)} anos`;
  interval = seconds / 2592000;
  if (interval > 1) return `Há ${Math.floor(interval)} meses`;
  interval = seconds / 86400;
  if (interval > 1) return `Há ${Math.floor(interval)} dias`;
  interval = seconds / 3600;
  if (interval > 1) return `Há ${Math.floor(interval)} horas`;
  interval = seconds / 60;
  if (interval > 1) return `Há ${Math.floor(interval)} minutos`;
  return "Agora mesmo";
}

// Função para formatar Duração
function formatDuration(ms) {
  if (!ms || isNaN(ms)) return '--';
  const secondsTotal = Math.floor(ms / 1000);
  const minutes = Math.floor(secondsTotal / 60);
  const seconds = secondsTotal % 60;
  return `${minutes} minutos, ${seconds} segundos`;
}

// Função para formatar Data
function formatDate(dateString) {
  if (!dateString) return '--';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(date);
  } catch (e) {
    return '--';
  }
}

// Função para formatar Tipo de Álbum
function formatAlbumType(type) {
  if (!type || type === 'N/A') return '--';
  if (type === 'single') return 'Single';
  if (type === 'album') return 'Álbum';
  if (type === 'compilation') return 'Coletânea';
  // Capitaliza a primeira letra
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// Função para checar se o usuário já avaliou esta música
async function checkExistingReview(spotifyId) {
  isLoadingReview.value = true;
  userReview.value = null;
  try {
    const response = await axios.get(
      `/api/verificar_avaliacao.php?spotify_id=${spotifyId}`,
      { withCredentials: true }
    );

    if (response.data.existe) {
      userReview.value = response.data.avaliacao;
    }
  } catch (err) {
    console.warn("Erro ao verificar avaliação (pode ser 401)", err);
    userReview.value = null;
  } finally {
    isLoadingReview.value = false;
  }
}

// Função para buscar as avaliações da página
async function fetchPageReviews(spotifyId, page = 1) {
  try {
    const response = await axios.get(
      `/api/buscar_avaliacoes.php?spotify_id=${spotifyId}&page=${page}&limit=${reviewsPerPage}`
    );
    stats.value = response.data.stats;

    if (page === 1) {
      // Primeira página, substitui a lista
      reviewsList.value = response.data.avaliacoes;
    } else {
      // Se for páginas subsequentes, adiciona no final da lista
      reviewsList.value.push(...response.data.avaliacoes);
    }
  } catch (err) {
    console.error("Erro ao buscar avaliações:", err);
    stats.value = { total: 0, media: 0.0 };
    reviewsList.value = [];
  }
}

// Função que lê os dados da URL e monta o objeto 'track'
async function loadTrackFromQuery(query) {
  const usuarioLocal = localStorage.getItem('usuario');
  if (usuarioLocal) {
    loggedInUserId.value = JSON.parse(usuarioLocal).id;
  }

  if (!query.id) {
    track.value = null;
    error.value = "Nenhum ID de música fornecido.";
    return;
  }

  isLoading.value = true;
  track.value = null;
  error.value = null;
  userReview.value = null;
  stats.value = { total: 0, media: 0.0 };
  reviewsList.value = [];
  currentPage.value = 1;

  try {
    track.value = {
      id: query.id,
      track_name: query.name,
      artist_name: query.artist,
      image_url: query.image,
      spotify_url: query.spotify,
      // Formata os dados que vieram da URL
      duration: formatDuration(query.duration_ms),
      release_date: formatDate(query.release_date),
      popularity: query.popularity,
      explicit: query.explicit === 'true',
      album_name: query.album_name,
      album_type: formatAlbumType(query.album_type)
    };

    await Promise.all([
      checkExistingReview(track.value.id),
      fetchPageReviews(track.value.id, 1)
    ]);

  } catch (err) {
    console.error("Erro ao processar dados da URL:", err);
    error.value = err.message || "Erro desconhecido";
  } finally {
    isLoading.value = false;
  }
}

//
async function loadMoreReviews() {
  isLoadingMore.value = true;
  currentPage.value++; // Incrementa a página
  try {
    // Busca a próxima página de avaliações
    await fetchPageReviews(track.value.id, currentPage.value);
  } catch (err) {
    console.error("Erro ao carregar mais avaliações:", err);
    currentPage.value--; // Reverte a página em caso de erro
  } finally {
    isLoadingMore.value = false;
  }
}

// Função para seguir/deixar de seguir o autor da avaliação
async function toggleFollow(review) {
  if (!loggedInUserId.value) {
    showAlert("Você precisa estar logado para seguir usuários.", 'warning');
    return;
  }

  followLoadingId.value = review.id;
  const endpoint = review.isFollowing ? 'deixar_de_seguir.php' : 'seguir.php';

  try {
    const response = await axios.post(
      `/api/${endpoint}`,
      { id: review.usuario_id }, // Envia o ID do *autor da avaliação*
      { withCredentials: true }
    );
    if (response.data.sucesso) {
      review.is_following = !review.is_following;
    } else {
      showAlert(response.data.mensagem, 'error');
    }
  } catch (err) {
    console.error(`Erro ao ${endpoint}:`, err);
    showAlert("Ocorreu um erro na solicitação.", 'error');
  } finally {
    followLoadingId.value = null; // Desativa o loading
  }
}

async function toggleLike(review) {
  if (!loggedInUserId.value) {
    showAlert("Você precisa estar logado para curtir avaliações.", 'warning');
    return;
  }

  likeLoadingId.value = review.id;

  try {
    const response = await axios.post(
      '/api/curtir_avaliacao.php',
      { avaliacao_id: review.id }, // Envia o ID da avaliação
      { withCredentials: true }
    );
    if (response.data.sucesso) {
      review.usuario_curtiu = response.data.curtido;
      review.total_curtidas = response.data.total_curtidas;
    } else {
      showAlert(response.data.mensagem, 'error');
    }
  } catch (err) {
    console.error("Erro ao curtir:", err);
    showAlert("Ocorreu um erro na solicitação de curtida.", 'error');
  } finally {
    likeLoadingId.value = null; // Desativa o loading
  }
}

// Função para fechar o diálogo de avaliação
function closeComment() {
  dialog.value = false;
  setTimeout(() => {
    reviewForm.value.nota = 0;
    reviewForm.value.titulo = '';
    reviewForm.value.comentario = '';
    if (form.value) {
      form.value.resetValidation();
    }
  }, 300);
}

// Função para abrir o diálogo de avaliação
function openComment() {
  // Reseta o formulário primeiro
  reviewForm.value.nota = null;
  reviewForm.value.titulo = '';
  reviewForm.value.comentario = '';
  if (form.value) {
    form.value.resetValidation();
  }
  dialog.value = true;
}

// Função para abrir o diálogo de edição de avaliação
function openEditComment() {
  if (!userReview.value) return;
  reviewForm.value.nota = parseFloat(userReview.value.nota);
  reviewForm.value.titulo = userReview.value.titulo;
  reviewForm.value.comentario = userReview.value.comentario;

  if (form.value) {
    form.value.resetValidation();
  }
  dialog.value = true;
}

// Função para enviar a avaliação 
async function submitReview() {
  if (!form.value) return;
  const { valid } = await form.value.validate();

  if (!valid) {
    return;
  }

  isSubmitting.value = true;
  try {
    // Monta o payload para enviar à API
    const payload = {
      // Dados da avaliação
      nota: reviewForm.value.nota,
      titulo: reviewForm.value.titulo,
      comentario: reviewForm.value.comentario,

      // Dados da música (para o "Get or Create" na API)
      spotify_id: track.value.id,
      track_name: track.value.track_name,
      artist_name: track.value.artist_name,
      image_url: track.value.image_url,
    };

    const response = await axios.post('/api/salvar_avaliacao.php', payload, {
      withCredentials: true, // Inclui cookies de sessão
    });

    // Após o envio bem-sucedido
    showAlert(response.data.mensagem, 'success');
    closeComment();

    await Promise.all([
      checkExistingReview(track.value.id),
      fetchPageReviews(track.value.id, 1)
    ]);

  } catch (err) {
    console.error("Erro ao salvar avaliação:", err);
    const mensagem = err.response?.data?.mensagem || "Erro ao conectar com o servidor.";
    showAlert(mensagem, 'error');
  } finally {
    isSubmitting.value = false;
  }
}
watch(
  () => route.query,
  (newQuery) => {
    loadTrackFromQuery(newQuery);
  },
  { immediate: true, deep: true },
);

</script>
