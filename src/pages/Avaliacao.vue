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

              <!-- O vídeo é localizado pelo backend, mas a reprodução acontece no player global.
                   Assim a música continua tocando ao navegar para outras páginas do site. -->
              <div class="youtube-player-container mb-4 pa-4">
                <div v-if="isLoadingYoutube" class="youtube-player-placeholder d-flex flex-column align-center justify-center">
                  <v-progress-circular indeterminate color="red" size="36" />
                  <span class="text-caption text-grey-darken-1 mt-3">Localizando música no YouTube...</span>
                </div>

                <div v-else-if="youtubeId" class="youtube-player-placeholder d-flex flex-column align-center justify-center text-center">
                  <v-icon icon="mdi-youtube" color="red" size="44" class="mb-2" />
                  <div class="text-body-2 font-weight-medium mb-1">Ouça sem sair do SocialMusic</div>
                  <div class="text-caption text-grey-darken-1 mb-3">
                    O player continuará ativo enquanto você navegar pelo site.
                  </div>
                  <v-btn
                    color="red"
                    variant="flat"
                    rounded="lg"
                    class="text-none"
                    prepend-icon="mdi-play-circle"
                    @click="playInGlobalPlayer"
                  >
                    {{ isCurrentGlobalTrack ? 'Continuar no player' : 'Ouvir no SocialMusic' }}
                  </v-btn>
                </div>

                <div v-else class="youtube-player-placeholder d-flex flex-column align-center justify-center text-center">
                  <v-icon icon="mdi-youtube" color="grey" size="36" class="mb-2" />
                  <span class="text-caption text-grey-darken-1">
                    {{ youtubeMessage || 'Player do YouTube indisponível para esta música.' }}
                  </span>
                </div>
              </div>

              <v-btn prepend-icon="mdi-spotify" variant="flat" class="text-none" rounded="lg" color="#1DB954"
                size="large" block :href="track.spotify_url" target="_blank">
                Escutar no Spotify
              </v-btn>
            </div>
          </v-col>

          <!-- informações de avaliações da música -->
          <v-col cols="12" md="8" lg="6">
            <div rounded="xl" elevation="2" class="pa-6 mb-4">
              <v-row class="text-center">
                <v-col cols="4">
                  <div class="d-flex flex-column align-center">
                    <div class="d-flex align-center gap-1 mb-2">
                      <v-icon icon="mdi-comment-text" color="grey" size="28" class="pr-3" />
                      <h3 class="text-h6 font-weight-bold">{{ stats.total }}</h3>
                    </div>
                    <p class="text-grey text-body-2">Avaliações</p>
                  </div>
                </v-col>

                <v-col cols="4">
                  <div class="d-flex flex-column align-center">
                    <div class="d-flex align-center gap-1 mb-2">
                      <v-icon icon="mdi-star" color="orange" size="28" class="pr-3" />
                      <h3 class="text-h6">
                        <span class="text-black font-weight-bold">{{ stats.media > 0 ? stats.media.toFixed(1) : '--' }}
                        </span>
                        <span class="text-grey font-weight-medium">/5.0</span>
                      </h3>
                    </div>
                    <p class="text-grey text-body-2">Média geral</p>
                  </div>
                </v-col>

                <v-col cols="4">
                  <div class="d-flex flex-column align-center">
                    <div class="d-flex align-center gap-1 mb-2">
                      <v-icon icon="mdi-star-outline" color="grey" size="28" class="pr-3" />
                      <h3 v-if="hasUserReview" class="text-h6">
                        <span class="text-black font-weight-bold">{{ userReview.nota }} </span>
                        <span class="text-grey font-weight-medium">/5.0 </span>
                      </h3>
                      <h3 v-else-if="isLoadingReview" class="text-h5 font-weight-bold">
                        <v-progress-circular indeterminate size="24" />
                      </h3>
                      <h3 v-else class="text-h5 font-weight-bold">--</h3>
                    </div>
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
                  prepend-icon="mdi-pencil" @click="handleWriteReviewClick" :disabled="isLoadingReview">
                  Escrever avaliação
                </v-btn>
              </div>
            </div>

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
              <v-card rounded="xl" elevation="2">
                <template v-for="(review, index) in reviewsList" :key="review.id">
                  <v-list-item class="pa-6" :ripple="false">
                    <template v-slot:prepend>
                      <v-btn :to="`/perfil/${review.usuario_id}`" variant="text" class="pa-0" style="min-width: unset;">
                        <v-avatar size="56" class="mr-4">
                          <v-img v-if="review.usuario_avatar" :src="review.usuario_avatar" alt="Avatar do usuário"
                            cover />
                          <v-icon v-else size="56" color="grey-lighten-1">mdi-account-circle</v-icon>
                        </v-avatar>
                      </v-btn>
                    </template>

                    <template v-slot:append>
                      <v-btn v-if="loggedInUserId !== review.usuario_id" :loading="followLoadingId === review.id"
                        :variant="review.is_following ? 'outlined' : 'flat'"
                        :color="review.is_following ? 'grey-darken-1' : '#EEE8FF'" class="text-none" rounded="lg"
                        @click.prevent="toggleFollow(review)">
                        {{ review.is_following ? 'Seguindo' : 'Seguir' }}
                      </v-btn>
                    </template>

                    <v-btn :to="`/perfil/${review.usuario_id}`" variant="text" class="text-none pa-0 justify-start"
                      style="min-width: unset; text-decoration: none; color: inherit;">
                      <v-list-item-title class="text-h6 font-weight-semibold">{{ review.usuario_nome
                      }}</v-list-item-title>
                    </v-btn>
                    <v-list-item-subtitle class="text-grey text-caption">{{ formatTimeAgo(review.data_criacao)
                    }}</v-list-item-subtitle>

                  </v-list-item>

                  <v-card-text class="pt-2 pl-21 ml-2">
                    <div class="mb-2">
                      <v-rating :model-value="parseFloat(review.nota)" color="amber" half-increments readonly
                        size="small" density="compact" />
                    </div>

                    <h4 v-if="review.titulo" class="text-body-1 font-weight-regular mb-1">{{ review.titulo }}</h4>
                    <p class="text-body-1 mb-2 text-grey">{{ review.comentario }}</p>

                    <div class="d-flex align-center justify-space-between">
                      <v-btn
                        v-if="Number(loggedInUserId) !== Number(review.usuario_id)"
                        variant="text"
                        size="small"
                        class="text-none"
                        :color="review.usuario_denunciou ? 'success' : 'grey-darken-1'"
                        :loading="reportLoadingId === review.id"
                        :disabled="review.usuario_denunciou || reportLoadingId === review.id"
                        @click.prevent="openReportDialog(review)"
                      >
                        <v-icon start>{{ review.usuario_denunciou ? 'mdi-check-circle-outline' : 'mdi-flag-outline' }}</v-icon>
                        {{ review.usuario_denunciou ? 'Denunciado' : 'Denunciar' }}
                      </v-btn>
                      <v-spacer v-else />

                      <v-btn variant="text" size="small" class="text-none"
                        :color="review.usuario_curtiu ? 'red' : 'grey-darken-1'" :loading="likeLoadingId === review.id"
                        @click.prevent="toggleLike(review)" :disabled="likeLoadingId === review.id">
                        <v-icon start>{{ review.usuario_curtiu ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                        {{ review.total_curtidas }}
                      </v-btn>
                    </div>
                  </v-card-text>

                  <v-divider v-if="index < reviewsList.length - 1" class="mx-4"></v-divider>
                </template>
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
              rounded="lg" class="mb-4" :rules="[rules.textoPermitido]" />

            <p class="text-grey-darken-1 mb-2">Escreva seu comentário:</p>
            <v-textarea v-model="reviewForm.comentario" label="Seu comentário" variant="outlined" rows="5" counter
              maxlength="1000" rounded="lg" :rules="[rules.textoPermitido]" />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-btn color="red" variant="text" @click="deleteReview" :loading="isDeleting" class="text-none" rounded="lg"
            size="large">
            Excluir
          </v-btn>
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

    <!-- Caixa de diálogo de denúncia -->
    <v-dialog v-model="reportDialog" persistent max-width="520px">
      <v-card rounded="xl">
        <v-card-title class="pa-4">
          <span class="text-h5">Denunciar avaliação</span>
        </v-card-title>

        <v-card-text class="pa-4">
          <p class="text-grey-darken-1 mb-4">
            Informe o motivo da denúncia. O administrador poderá analisar esta avaliação.
          </p>

          <v-select
            v-model="reportForm.motivo"
            :items="reportReasons"
            item-title="title"
            item-value="value"
            label="Motivo"
            variant="outlined"
            rounded="lg"
            class="mb-3"
          />

          <v-textarea
            v-model="reportForm.descricao"
            label="Detalhes adicionais (opcional)"
            variant="outlined"
            rows="4"
            counter
            maxlength="500"
            rounded="lg"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            rounded="lg"
            @click="closeReportDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="warning"
            variant="flat"
            class="text-none"
            rounded="lg"
            :loading="reportLoadingId !== null"
            @click="submitReport"
          >
            Enviar denúncia
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
import { useGlobalPlayer } from "@/composables/useGlobalPlayer";

// Configuração da API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/socialmusic_backend';

const route = useRoute();
const track = ref(null); // Armazena os detalhes da música
const isLoading = ref(false);
const error = ref(null);

// Player do YouTube. A chave da API nunca fica no frontend; este componente
// conversa apenas com o nosso endpoint PHP, que usa cache no MySQL.
const youtubeId = ref(null);
const isLoadingYoutube = ref(false);
const youtubeMessage = ref('');
const youtubeRequestId = ref(0);

// Estado do player persistente, mantido fora desta página.
const { player: globalPlayer, playTrack: playGlobalTrack, expandPlayer: expandGlobalPlayer } = useGlobalPlayer();
const isCurrentGlobalTrack = computed(() =>
  !!youtubeId.value &&
  globalPlayer.visible &&
  globalPlayer.youtubeId === String(youtubeId.value)
);

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
const reportDialog = ref(false);
const reportLoadingId = ref(null);
const selectedReportReview = ref(null);
const reportForm = ref({
  motivo: '',
  descricao: '',
});
const reportReasons = [
  { title: 'Spam', value: 'spam' },
  { title: 'Ofensa ou assédio', value: 'ofensa' },
  { title: 'Discurso de ódio', value: 'odio' },
  { title: 'Ameaça ou violência', value: 'ameaca' },
  { title: 'Conteúdo ilegal', value: 'conteudo_ilegal' },
  { title: 'Outro', value: 'outro' },
];
const showAlert = inject("showAlert");// Função global para mostrar alertas
const openLoginDialog = inject("openLoginDialog");// Função global para abrir o diálogo de login
const isDeleting = ref(false);
const hasMoreReviews = computed(() => {
  return reviewsList.value.length < stats.value.total;
});
const reviewForm = ref({
  nota: null,
  titulo: '',
  comentario: '',
});

// Palavras e expressões bloqueadas nos títulos e comentários.
// A lista fica somente neste arquivo para não alterar nenhuma outra parte do projeto.
const palavrasBloqueadas = [
  'porra',
  'caralho',
  'merda',
  'bosta',
  'puta',
  'puto',
  'foda',
  'foder',
  'fodase',
  'buceta',
  'cu',
  'arrombado',
  'arrombada',
  'desgracado',
  'desgracada',
  'imbecil',
  'idiota',
  'otario',
  'otaria',
  'vagabundo',
  'vagabunda'
];

// Expressões de ameaça/violência que não devem ser publicadas.
const expressoesBloqueadas = [
  'vou te matar',
  'vou matar voce',
  'vou te assassinar',
  'vou assassinar voce',
  'vou te estuprar',
  'vou estuprar voce',
  'vou te sequestrar',
  'vou sequestrar voce',
  'voce merece morrer',
  'tem que morrer',
  'mate ele',
  'mate ela',
  'matem ele',
  'matem ela'
];

// Normaliza o texto para dificultar tentativas simples de burlar o filtro,
// como p0rr4, P.O.R.R.A ou letras repetidas.
function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/@/g, 'a')
    .replace(/4/g, 'a')
    .replace(/3/g, 'e')
    .replace(/[1!]/g, 'i')
    .replace(/0/g, 'o')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/\$/g, 's')
    .replace(/(.)\1{1,}/g, '$1')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function contemConteudoBloqueado(texto) {
  const textoNormalizado = normalizarTexto(texto);

  if (!textoNormalizado) {
    return false;
  }

  const palavrasDoTexto = textoNormalizado.split(' ');

  const encontrouPalavra = palavrasBloqueadas.some((palavra) =>
    palavrasDoTexto.includes(normalizarTexto(palavra))
  );

  if (encontrouPalavra) {
    return true;
  }

  return expressoesBloqueadas.some((expressao) =>
    textoNormalizado.includes(normalizarTexto(expressao))
  );
}

const rules = {
  required: (v) => v > 0 || "A nota é obrigatória.",
  textoPermitido: (v) =>
    !contemConteudoBloqueado(v) ||
    "O texto contém palavras ou expressões não permitidas.",
};

// Função para lidar com o clique no botão de escrever avaliação
function handleWriteReviewClick() {
  if (loggedInUserId.value) {
    openComment(); // Abre o diálogo de avaliação se estiver logado
  } else {
    openLoginDialog(); // Abre o diálogo de login se não estiver logado
  }
}

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
      `/api/reviews/verificar_avaliacao.php?spotify_id=${spotifyId}`,
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
      `/api/reviews/buscar_avaliacoes.php?spotify_id=${spotifyId}&page=${page}&limit=${reviewsPerPage}`
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

// Envia a música atual para o player persistente do App.vue.
// O iframe fica fora do router-view, por isso não é destruído ao trocar de rota.
function playInGlobalPlayer() {
  if (!youtubeId.value || !track.value) return;

  const sameTrackAlreadyOpen =
    globalPlayer.visible &&
    globalPlayer.youtubeId === String(youtubeId.value);

  playGlobalTrack({
    youtubeId: youtubeId.value,
    trackName: track.value.track_name,
    artistName: track.value.artist_name,
    imageUrl: track.value.image_url,
    spotifyUrl: track.value.spotify_url,
  });

  // Se já era a mesma música, também amplia o player para dar feedback visual
  // de onde a reprodução está acontecendo.
  if (sameTrackAlreadyOpen) {
    expandGlobalPlayer();
  }
}

// Busca o vídeo correspondente à música. O backend primeiro consulta o cache
// e só usa a YouTube Data API quando ainda não existe um resultado recente.
async function loadYoutubePlayer(currentTrack) {
  if (!currentTrack?.id || !currentTrack?.track_name || !currentTrack?.artist_name) {
    youtubeId.value = null;
    youtubeMessage.value = 'Não foi possível identificar esta música para o player.';
    return;
  }

  const requestId = ++youtubeRequestId.value;
  isLoadingYoutube.value = true;
  youtubeId.value = null;
  youtubeMessage.value = '';

  try {
    const response = await axios.get('/api/youtube/buscar_video.php', {
      params: {
        spotify_id: currentTrack.id,
        track_name: currentTrack.track_name,
        artist_name: currentTrack.artist_name,
        duration_ms: currentTrack.duration_ms_raw || undefined,
      },
    });

    // Evita que uma resposta de uma música anterior sobrescreva a música atual
    // quando o usuário navega rapidamente entre páginas.
    if (requestId !== youtubeRequestId.value) return;

    if (response.data?.sucesso && response.data?.encontrado && response.data?.youtube_id) {
      youtubeId.value = response.data.youtube_id;
      youtubeMessage.value = '';
    } else {
      youtubeId.value = null;
      youtubeMessage.value = response.data?.mensagem || 'Player do YouTube indisponível para esta música.';
    }
  } catch (err) {
    if (requestId !== youtubeRequestId.value) return;

    console.warn('Não foi possível carregar o player do YouTube:', err);
    youtubeId.value = null;
    youtubeMessage.value = 'Player do YouTube indisponível no momento.';
  } finally {
    if (requestId === youtubeRequestId.value) {
      isLoadingYoutube.value = false;
    }
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
  youtubeRequestId.value++;
  youtubeId.value = null;
  youtubeMessage.value = '';
  isLoadingYoutube.value = false;

  try {
    track.value = {
      id: query.id,
      track_name: query.name,
      artist_name: query.artist,
      image_url: query.image,
      // Formata os dados que vieram da URL
      duration: formatDuration(query.duration_ms),
      duration_ms_raw: query.duration_ms ? Number(query.duration_ms) : null,
      release_date: formatDate(query.release_date),
      popularity: query.popularity,
      explicit: query.explicit === 'true',
      album_name: query.album_name,
      album_type: formatAlbumType(query.album_type),
      spotify_url: query.spotify
    };

    const promises = [
      checkExistingReview(track.value.id),
      fetchPageReviews(track.value.id, 1),
      loadYoutubePlayer(track.value)
    ];

    await Promise.all(promises);

  } catch (err) {
    console.error("Erro ao processar dados da URL:", err);
    error.value = err.message || "Erro desconhecido";
  } finally {
    isLoading.value = false;
  }
}

// Função para carregar mais avaliações 
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
  if (!loggedInUserId.value) return openLoginDialog();

  followLoadingId.value = review.id;
  const actionEndpoint = review.is_following ? 'deixar_de_seguir.php' : 'seguir.php';

  try {
    const response = await axios.post(`${API_URL}/api/users/${actionEndpoint}`, {
      id: review.usuario_id 
    }, {
      withCredentials: true
    });

    if (response.data.sucesso) {
      review.is_following = !review.is_following;
    } else {
      showAlert(response.data.mensagem, 'error');
    }
  } catch (error) {
    console.error('Erro ao seguir/deixar de seguir:', error);
    const msg = error.response?.data?.mensagem || 'Erro ao processar solicitação.';
    showAlert(msg, 'error');
  } finally {
    followLoadingId.value = null;
  }
}

// Função para curtir/ descurtir avaliações
async function toggleLike(review) {
  if (!loggedInUserId.value) {
    openLoginDialog();
    return;
  }

  likeLoadingId.value = review.id;

  try {
    const response = await axios.post(
      '/api/reviews/curtir_avaliacao.php',
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

// Funções de denúncia de avaliações
function openReportDialog(review) {
  if (!loggedInUserId.value) {
    openLoginDialog();
    return;
  }

  if (Number(loggedInUserId.value) === Number(review.usuario_id)) {
    showAlert('Você não pode denunciar a própria avaliação.', 'error');
    return;
  }

  if (review.usuario_denunciou) {
    showAlert('Você já denunciou esta avaliação.', 'error');
    return;
  }

  selectedReportReview.value = review;
  reportForm.value.motivo = '';
  reportForm.value.descricao = '';
  reportDialog.value = true;
}

function closeReportDialog() {
  reportDialog.value = false;
  selectedReportReview.value = null;
  reportForm.value.motivo = '';
  reportForm.value.descricao = '';
}

async function submitReport() {
  if (!selectedReportReview.value) {
    return;
  }

  if (!reportForm.value.motivo) {
    showAlert('Selecione o motivo da denúncia.', 'error');
    return;
  }

  const review = selectedReportReview.value;
  reportLoadingId.value = review.id;

  try {
    const response = await axios.post(
      '/api/reviews/denunciar_avaliacao.php',
      {
        avaliacao_id: review.id,
        motivo: reportForm.value.motivo,
        descricao: reportForm.value.descricao.trim(),
      },
      { withCredentials: true }
    );

    review.usuario_denunciou = true;
    showAlert(response.data.mensagem || 'Denúncia enviada com sucesso.', 'success');
    closeReportDialog();
  } catch (err) {
    console.error('Erro ao denunciar avaliação:', err);

    const mensagem =
      err.response?.data?.mensagem ||
      'Erro ao enviar a denúncia.';

    showAlert(mensagem, 'error');
  } finally {
    reportLoadingId.value = null;
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

  if (
    contemConteudoBloqueado(reviewForm.value.titulo) ||
    contemConteudoBloqueado(reviewForm.value.comentario)
  ) {
    showAlert('Sua avaliação contém palavras ou expressões não permitidas.', 'error');
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

    const response = await axios.post('/api/reviews/salvar_avaliacao.php', payload, {
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

async function deleteReview() {
  // Pede confirmação
  if (!window.confirm("Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.")) {
    return;
  }

  isDeleting.value = true;
  try {
    // userReview.value.id foi obtido do 'verificar_avaliacao.php'
    const response = await axios.post(
      '/api/reviews/delete_avaliacao.php',
      { avaliacao_id: userReview.value.id },
      { withCredentials: true }
    );

    if (response.data.sucesso) {
      showAlert('Avaliação excluída com sucesso.', 'success');
      closeComment();

      // Força a atualização da página para mostrar que a avaliação sumiu
      await Promise.all([
        checkExistingReview(track.value.id),
        fetchPageReviews(track.value.id, 1)
      ]);

      // Define userReview como null para o botão "Editar" sumir
      userReview.value = null;
    } else {
      showAlert(response.data.mensagem, 'error');
    }
  } catch (err) {
    const msg = err.response?.data?.mensagem || "Erro ao excluir avaliação.";
    showAlert(msg, 'error');
  } finally {
    isDeleting.value = false;
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

<style scoped>
.v-list-item {
  background-color: transparent !important;
}

.pl-21 {
  padding-left: 84px !important;
}

.v-list-item:hover {
  background-color: transparent !important;
}

.youtube-player-container {
  width: 100%;
  min-height: 190px;
  border-radius: 12px;
  background: #f1f1f1;
  border: 1px solid #e5e5e5;
}

.youtube-player-placeholder {
  width: 100%;
  min-height: 158px;
}
</style>