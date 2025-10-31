avaliação.vue

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
                    <h3 class="text-h5 font-weight-bold">2,923</h3>
                    <p class="text-grey text-body-2">Avaliações</p>
                  </div>
                </v-col>

                <v-col cols="4">
                  <div class="d-flex flex-column align-center">
                    <v-icon icon="mdi-star" color="orange" size="32" class="mb-2" />
                    <h3 class="text-h5 font-weight-bold">4.5/5</h3>
                    <p class="text-grey text-body-2">Média geral</p>
                  </div>
                </v-col>

                <v-col cols="4">
                  <div class="d-flex flex-column align-center">
                    <v-icon icon="mdi-star-outline" color="grey" size="32" class="mb-2" />
                    <h3 class="text-h5 font-weight-bold">--</h3>
                    <p class="text-grey text-body-2">Sua avaliação</p>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <div class="text-center">
                <v-btn class="text-none" rounded="lg" size="large" color="#EEE8FF" variant="flat"
                  prepend-icon="mdi-pencil" @click="openComment">
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

            <v-card rounded="xl" elevation="2" class="mb-4">
              <v-card-text class="pa-6">
                <div class="d-flex align-start">
                  <v-avatar size="56" class="mr-4">
                    <v-img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Avatar do usuário" />
                  </v-avatar>

                  <div class="flex-grow-1">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <div>
                        <h3 class="text-h6 font-weight-bold">João Silva</h3>
                        <p class="text-grey text-caption">Há 2 dias</p>
                      </div>
                      <v-btn variant="outlined" color="EEE8FF" class="text-none" rounded="lg">
                        Seguir
                      </v-btn>
                    </div>

                    <div class="mb-2">
                      <v-rating :model-value="4.5" color="amber" half-increments readonly size="small" />
                    </div>

                    <p class="text-body-1">
                      Uma obra-prima do The Weeknd! A produção é impecável e as
                      letras são profundas. Definitivamente um dos melhores
                      álbuns dos últimos anos. Altamente recomendado para quem
                      aprecia música de qualidade.
                    </p>

                    <div class="d-flex gap-2 mt-3">
                      <v-btn variant="text" size="small" class="text-none">
                        <v-icon start>mdi-heart-outline</v-icon>
                        Curtir (200)
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-card rounded="xl" elevation="2" class="mb-4">
              <v-card-text class="pa-6">
                <div class="d-flex align-start">
                  <v-avatar size="56" class="mr-4">
                    <v-img src="https://randomuser.me/api/portraits/women/2.jpg" alt="Avatar do usuário" />
                  </v-avatar>

                  <div class="flex-grow-1">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <div>
                        <h3 class="text-h6 font-weight-bold">Maria Santos</h3>
                        <p class="text-grey text-caption">Há 5 dias</p>
                      </div>
                      <v-btn variant="outlined" color="EEE8FF" class="text-none" rounded="lg">
                        Seguir
                      </v-btn>
                    </div>

                    <div class="mb-2">
                      <v-rating :model-value="5" color="amber" readonly size="small" />
                    </div>

                    <p class="text-body-1">
                      Simplesmente perfeito! Cada faixa é única e mostra a
                      evolução artística do The Weeknd. A atmosfera sombria
                      combinada com melodias cativantes cria uma experiência
                      auditiva inesquecível.
                    </p>

                    <div class="d-flex gap-2 mt-3">
                      <v-btn variant="text" size="small" class="text-none">
                        <v-icon start>mdi-heart-outline</v-icon>
                        Curtir (200)
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <div class="text-center mt-6">
              <v-btn variant="outlined" class="text-none" rounded="lg" size="large">
                Carregar mais avaliações
              </v-btn>
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
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { ar } from "vuetify/locale";

const route = useRoute();
const track = ref(null); // Armazena os detalhes da música
const isLoading = ref(false);
const error = ref(null);
const dialog = ref(false);
const form = ref(null);
const isSubmitting = ref(false);
const reviewForm = ref({
  nota: null,
  titulo: '',
  comentario: '',
});
const rules = {
  required: (v) => v > 0 || "A nota é obrigatória.",
};

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

// Função que lê os dados da URL e monta o objeto 'track'
async function loadTrackFromQuery(query) {
  if (!query.id) {
    track.value = null;
    error.value = "Nenhum ID de música fornecido.";
    return;
  }

  isLoading.value = true;
  track.value = null;
  error.value = null;

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
  } catch (err) {
    console.error("Erro ao processar dados da URL:", err);
    error.value = err.message || "Erro desconhecido";
  } finally {
    isLoading.value = false;
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
  reviewForm.value.nota = 0;
  reviewForm.value.titulo = '';
  reviewForm.value.comentario = '';
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
    alert(response.data.mensagem);
    closeComment();
    // TODO: Atualizar a lista de avaliações na tela
  } catch (err) {
    console.error("Erro ao salvar avaliação:", err);
    const mensagem = err.response?.data?.mensagem || "Erro ao conectar com o servidor.";
    alert(`Erro: ${mensagem}`);
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
