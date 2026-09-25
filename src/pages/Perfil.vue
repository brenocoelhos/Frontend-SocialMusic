<template>
  <div style="min-height: 100vh;">
    <div style="background-color: white; height: 80px; position: fixed; top: 0; left: 0; right: 0; z-index: 1;"></div>

    <div style="background-color: #f8f9fa; min-height: 100vh; padding-top: 80px; position: relative; z-index: 0;">

      <v-container v-if="loading" class="py-8">
        <v-skeleton-loader type="article, actions"></v-skeleton-loader>
      </v-container>

      <v-container v-else-if="error" class="py-8 text-center">
        <v-alert type="error" border="start" prominent>{{ errorMessage }}</v-alert>
        <v-btn to="/" color="primary" class="mt-4">Voltar à Página Inicial</v-btn>
      </v-container>

      <v-container v-else class="py-8">
        <v-row>
          <v-col cols="12" md="7" order="2" order-md="1">

            <div class="d-flex justify-space-between align-center mb-6">
              <div>
                <h1 class="text-h4 font-weight-bold my-8 text-grey-darken-3 mb-1">{{ perfilUsuario.nome }}</h1>
                <p class="text-body-2 text-grey-darken-1">@{{ perfilUsuario.username }}</p>
              </div>
              <v-btn v-if="isSelf" color="primary" variant="flat" rounded="lg" size="default" @click="openEditDialog">
                Editar Perfil
              </v-btn>
              <v-btn v-else :loading="followLoading" :variant="isFollowing ? 'outlined' : 'flat'" color="primary"
                rounded="lg" size="default" @click="toggleFollow">
                {{ isFollowing ? 'Seguindo' : 'Seguir' }}
              </v-btn>
            </div>

            <!-- Descobertas personalizadas: exibidas somente no próprio perfil -->
            <v-card v-if="isSelf" rounded="xl" flat class="mb-7 discovery-card">
              <v-card-text class="pa-5">
                <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
                  <div>
                    <div class="d-flex align-center ga-2 mb-1">
                      <v-icon icon="mdi-compass-outline" color="primary" size="22" />
                      <h2 class="text-h6 font-weight-bold text-grey-darken-4">Descobertas para você</h2>
                      <v-chip v-if="recomendacoes.length" size="x-small" color="primary" variant="tonal">
                        {{ recomendacoes.length }} faixas
                      </v-chip>
                      <v-chip
                        v-if="recomendacoes.length && recomendacoesContexto.lastfm_usado"
                        size="x-small"
                        color="red-darken-1"
                        variant="tonal"
                        prepend-icon="mdi-music-circle-outline"
                      >
                        Last.fm
                      </v-chip>
                    </div>
                    <p class="text-body-2 text-grey-darken-1 mb-0">
                      Uma seleção feita a partir do seu gosto no SocialMusic.
                    </p>
                  </div>

                  <div class="d-flex flex-wrap align-center ga-2">
                    <v-btn
                      color="primary"
                      variant="tonal"
                      rounded="lg"
                      class="text-none"
                      :prepend-icon="recomendacoes.length ? 'mdi-refresh' : 'mdi-sparkles'"
                      :loading="recomendacoesLoading"
                      @click="gerarRecomendacoes(recomendacoes.length > 0)"
                    >
                      {{ recomendacoes.length ? 'Novas sugestões' : 'Descobrir músicas' }}
                    </v-btn>

                    <v-btn
                      v-if="recomendacoes.length && spotifyConectado && !spotifyPlaylistUrl"
                      color="#1DB954"
                      variant="flat"
                      rounded="lg"
                      class="text-none text-white"
                      prepend-icon="mdi-spotify"
                      :loading="spotifyPlaylistLoading"
                      @click="salvarPlaylistSpotify"
                    >
                      Salvar no Spotify
                    </v-btn>

                    <v-btn
                      v-else-if="recomendacoes.length && spotifyPlaylistUrl"
                      :href="spotifyPlaylistUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="#1DB954"
                      variant="outlined"
                      rounded="lg"
                      class="text-none"
                      prepend-icon="mdi-open-in-new"
                    >
                      Abrir no Spotify
                    </v-btn>
                  </div>
                </div>

                <div v-if="recomendacoesLoading && !recomendacoes.length" class="d-flex ga-4 overflow-hidden py-1">
                  <v-skeleton-loader
                    v-for="n in 3"
                    :key="n"
                    type="image, article"
                    width="180"
                    class="flex-shrink-0 rounded-lg"
                  />
                </div>

                <v-alert
                  v-else-if="recomendacoesMensagem && !recomendacoes.length"
                  type="info"
                  variant="tonal"
                  density="comfortable"
                  class="mb-0"
                >
                  {{ recomendacoesMensagem }}
                  <template #append>
                    <v-btn v-if="recomendacoesPrecisaContexto" variant="text" size="small" class="text-none" @click="openEditDialog">
                      Ajustar perfil
                    </v-btn>
                  </template>
                </v-alert>

                <v-slide-group v-else-if="recomendacoes.length" show-arrows class="discovery-slider">
                  <v-slide-group-item v-for="musica in recomendacoes" :key="musica.spotify_id">
                    <v-card
                      width="188"
                      rounded="lg"
                      flat
                      class="mr-4 discovery-track-card"
                      @click="abrirAvaliacaoRecomendada(musica)"
                    >
                      <div class="discovery-cover-wrap">
                        <v-img
                          :src="musica.image_url"
                          :alt="`Capa de ${musica.track_name}`"
                          width="188"
                          height="188"
                          cover
                          class="discovery-cover"
                        >
                          <template #placeholder>
                            <div class="fill-height d-flex align-center justify-center bg-grey-lighten-4">
                              <v-icon icon="mdi-music" color="grey-lighten-1" size="42" />
                            </div>
                          </template>
                        </v-img>

                        <v-btn
                          icon="mdi-play"
                          size="small"
                          color="white"
                          class="discovery-play-btn"
                          :loading="recomendacaoPlayLoadingId === musica.spotify_id"
                          @click.stop="ouvirRecomendacao(musica)"
                          aria-label="Ouvir no SocialMusic"
                        />
                      </div>

                      <div class="pa-3">
                        <div class="text-body-2 font-weight-bold text-grey-darken-4 text-truncate" :title="musica.track_name">
                          {{ musica.track_name }}
                        </div>
                        <div class="text-caption text-grey-darken-1 text-truncate mb-2" :title="musica.artist_name">
                          {{ musica.artist_name }}
                        </div>

                        <div class="discovery-reason text-caption mb-3">
                          <v-icon icon="mdi-sparkles" size="13" class="mr-1" />
                          <span>{{ musica.motivo }}</span>
                        </div>

                        <div class="d-flex align-center justify-space-between">
                          <v-btn
                            size="x-small"
                            variant="tonal"
                            color="primary"
                            class="text-none"
                            prepend-icon="mdi-star-outline"
                            :loading="recomendacaoAvaliacaoLoadingId === musica.spotify_id"
                            @click.stop="abrirAvaliacaoRecomendada(musica)"
                          >
                            Avaliar
                          </v-btn>

                          <v-btn
                            :href="musica.spotify_url"
                            target="_blank"
                            rel="noopener noreferrer"
                            icon="mdi-spotify"
                            color="#1DB954"
                            variant="text"
                            size="small"
                            @click.stop
                            aria-label="Abrir no Spotify"
                          />
                        </div>
                      </div>
                    </v-card>
                  </v-slide-group-item>
                </v-slide-group>
              </v-card-text>
            </v-card>

            <div>
              <h2 class="text-h6 font-weight-bold mb-4 text-grey-darken-4">
                {{ isSelf ? 'Minhas Avaliações' : `Avaliações de ${perfilUsuario.nome}` }}
                ({{ avaliacoes.length }})
              </h2>

              <v-alert v-if="avaliacoes.length === 0" type="info" variant="tonal">
                Este usuário ainda não fez nenhuma avaliação.
              </v-alert>

              <div v-for="(avaliacao, i) in reviewsVisiveis" :key="i" class="mb-4">
                <v-card rounded="lg" flat>
                  <v-card-text class="pa-5">
                    <v-list-item :to="getAvaliacaoUrl(avaliacao.musica)" class="pa-0 mb-3" lines="two">
                      <template v-slot:prepend>
                        <v-avatar size="70" rounded="lg" class="mr-4">
                          <v-img :src="avaliacao.musica.capa"></v-img>
                        </v-avatar>
                      </template>
                      <v-list-item-title class="text-subtitle-1 font-weight-bold text-grey-darken-4">{{
                        avaliacao.musica.titulo
                      }}</v-list-item-title>
                      <v-list-item-subtitle class="text-body-2 text-grey">{{ avaliacao.musica.artista
                      }}</v-list-item-subtitle>
                    </v-list-item> 
                    
                    <v-rating :model-value="avaliacao.nota" color="amber" density="compact"
                      half-increments readonly size="small" class="mb-2"></v-rating>
                    
                    <h3 class="text-body-1 font-weight-bold mb-2 text-grey-darken-4">{{ avaliacao.titulo }}</h3>
                    <p class="text-body-2 text-grey-darken-1 mb-4" style="line-height: 1.5;">{{ avaliacao.comentario }}
                    </p>
                    
                    <div class="d-flex align-center">
                      <v-btn :color="avaliacao.usuario_curtiu ? 'red' : 'grey-darken-1'" variant="text" size="small"
                        class="text-none ml-n2" :loading="likeLoadingId === avaliacao.id"
                        @click="toggleLike(avaliacao)">
                        <v-icon start>
                          {{ avaliacao.usuario_curtiu ? 'mdi-heart' : 'mdi-heart-outline' }}
                        </v-icon>
                        {{ avaliacao.likes }}
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <div v-if="reviewsVisiveis.length < avaliacoes.length" class="text-center mt-6">
                <v-btn :loading="isLoadingMoreReviews" variant="outlined" class="text-none" rounded="lg" size="large"
                  @click="carregarMaisAvaliacoes">
                  Carregar Mais Avaliações
                </v-btn>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="5" order="1" order-md="2">
            <v-card rounded="xl" class="mb-6 pa-8 text-center" color="white" flat elevation="0">

              <div class="d-flex flex-column align-center mb-6">
                <v-avatar size="160" class="mb-4 elevation-2">
                  <v-img v-if="perfilUsuario.foto_perfil" :src="perfilUsuario.foto_perfil" cover></v-img>
                  <div v-else class="d-flex align-center justify-center fill-height bg-grey-lighten-4" style="width: 100%; height: 100%;">
                    <v-icon size="80" color="grey-lighten-1">mdi-account</v-icon>
                  </div>
                </v-avatar>

                <div v-if="isSelf" class="d-flex align-center mt-2">
                  <v-btn
                    variant="tonal"
                    color="primary"
                    rounded="pill"
                    class="text-none mr-2"
                    prepend-icon="mdi-camera-outline"
                    @click="triggerUpload"
                    :loading="isUploading"
                    size="small"
                  >
                    Alterar foto
                  </v-btn>

                  <v-tooltip text="Remover foto atual" location="bottom">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-if="perfilUsuario.foto_perfil"
                        v-bind="props"
                        icon="mdi-delete-outline"
                        variant="text"
                        color="error"
                        size="small"
                        @click="confirmarRemocaoFoto"
                        :loading="isUploading"
                      ></v-btn>
                    </template>
                  </v-tooltip>
                </div>
              </div>

              <v-file-input ref="fileInput" v-show="false" accept="image/png, image/jpeg"
                @change="onFileChange"></v-file-input>
              
              <v-row class="mb-4">
                <v-col class="text-center clickable-stat" @click="abrirModalConexoes('seguidores')">
                  <div class="text-h5 font-weight-bold text-primary">{{ perfilUsuario.followers_count }}</div>
                  <div class="text-caption text-grey">Seguidores</div>
                </v-col>
                <v-col class="text-center clickable-stat" @click="abrirModalConexoes('seguindo')">
                  <div class="text-h5 font-weight-bold text-primary">{{ perfilUsuario.following_count }}</div>
                  <div class="text-caption text-grey">Seguindo</div>
                </v-col>
              </v-row>
              <div class="text-center">
                <p class="text-caption text-grey-darken-1">
                  {{ perfilUsuario.generos || 'Sem gêneros preferidos' }}
                </p>
              </div>

              <div v-if="isSelf" class="mt-6 pt-4">
                <v-divider class="mb-4"></v-divider>
                <v-btn
                  color="error"
                  variant="text"
                  size="small"
                  prepend-icon="mdi-delete-alert"
                  @click="confirmarExclusaoConta"
                  :loading="isDeleting"
                >
                  Excluir minha conta
                </v-btn>
              </div>
              </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-dialog v-model="editDialog" max-width="500px" persistent>
        <v-form ref="editFormRef" @submit.prevent="saveProfile">
          <v-card>
            <v-card-title>Editar Perfil</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="editForm.nome"
                label="Nome"
                variant="outlined"
                :rules="[v => !!v || 'Nome é obrigatório']"
                required
                class="mb-3"
              ></v-text-field>

              <v-autocomplete
                v-model="editForm.generos"
                :items="generosDisponiveis"
                label="Gêneros Preferidos"
                variant="outlined"
                multiple
                chips
                closable-chips
                placeholder="Selecione seus gêneros..."
              ></v-autocomplete>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="closeEditDialog" :disabled="isSaving">Cancelar</v-btn>
              <v-btn color="primary" type="submit" :loading="isSaving">Salvar</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <v-dialog v-model="conexoesDialog" max-width="400px" scrollable>
        <v-card rounded="xl">
          <v-card-title class="d-flex justify-space-between align-center pa-4">
            <span class="text-h6 font-weight-bold">{{ conexoesTitulo }}</span>
            <v-btn icon="mdi-close" variant="text" size="small" @click="conexoesDialog = false"></v-btn>
          </v-card-title>
          <v-divider></v-divider>
          
          <v-card-text class="pa-0" style="max-height: 400px;">
            <div v-if="conexoesLoading" class="text-center pa-4">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <div v-else-if="listaConexoes.length === 0" class="text-center pa-4 text-grey">
              Ninguém aqui ainda.
            </div>
            <v-list v-else>
              <v-list-item v-for="user in listaConexoes" :key="user.id" :to="`/perfil/${user.username}`" @click="conexoesDialog = false" class="py-2">
                <template v-slot:prepend>
                  <v-avatar size="40"><v-img :src="user.foto_perfil"></v-img></v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">{{ user.nome }}</v-list-item-title>
                <v-list-item-subtitle>@{{ user.username }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn v-if="isSelf && conexoesTipo === 'seguindo'" color="grey-lighten-1" variant="text" icon="mdi-account-remove-outline" size="small" @click.stop.prevent="removerConexao(user)" title="Deixar de seguir"></v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="confirmDialog" max-width="400px">
        <v-card rounded="xl">
          <v-card-title class="text-h6 font-weight-bold">Confirmação</v-card-title>
          <v-card-text>{{ confirmMessage }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey-darken-1" variant="text" @click="confirmDialog = false">Cancelar</v-btn>
            <v-btn color="error" variant="flat" @click="confirmAction">Confirmar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, watch, computed, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { API_URL } from '@/config/api';
import { authFetch } from '@/services/authFetch';
import { useGlobalPlayer } from '@/composables/useGlobalPlayer';
const router = useRouter();
const route = useRoute();

const openLoginDialog = inject('openLoginDialog');
const showAlert = inject('showAlert');

const { usuario, usuarioId, updateUsuario, clearUsuario } = useAuth();
const loggedInUserId = computed(() => usuarioId.value);
const likeLoadingId = ref(null);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const perfilUsuario = ref({});
const isSelf = ref(false);
const isFollowing = ref(false);
const followLoading = ref(false);
const editDialog = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false); // Novo estado
const editFormRef = ref(null);
const editForm = reactive({ nome: '', generos: '' });

// --- Descobertas personalizadas ---
const recomendacoes = ref([]);
const recomendacoesLoading = ref(false);
const recomendacoesMensagem = ref('');
const recomendacoesPrecisaContexto = ref(false);
const recomendacoesContexto = ref({});
const recomendacaoPlayLoadingId = ref(null);
const recomendacaoAvaliacaoLoadingId = ref(null);
const spotifyPlaylistLoading = ref(false);
const spotifyPlaylistUrl = ref('');
const spotifyConectado = computed(() => {
  const valor = usuario.value?.spotify_conectado;
  return valor === true || valor === 1 || valor === '1';
});
const { playTrack: playGlobalTrack } = useGlobalPlayer();

const conexoesDialog = ref(false);
const conexoesTitulo = ref('');
const conexoesLoading = ref(false);
const listaConexoes = ref([]);
const conexoesTipo = ref('');

const confirmDialog = ref(false);
const confirmMessage = ref('');
let onConfirmCallback = null;

function showConfirm(message, callback) {
  confirmMessage.value = message;
  onConfirmCallback = callback;
  confirmDialog.value = true;
}

function confirmAction() {
  if (onConfirmCallback) onConfirmCallback();
  confirmDialog.value = false;
}

// --- Funções de Exclusão de Conta ---
function confirmarExclusaoConta() {
  showConfirm(
    'Tem certeza absoluta? Sua conta e dados serão apagados permanentemente e não poderão ser recuperados.', 
    executarExclusaoConta
  );
}

async function executarExclusaoConta() {
  isDeleting.value = true;
  try {
    const res = await authFetch(`${API_URL}/api/users/excluir_conta.php`, {
      method: 'POST',
      credentials: 'include'
    });
    
    const data = await res.json();
    
    if (data.sucesso) {
      // Limpa a sessão reativa e volta para a Home sem recarregar a SPA.
      clearUsuario();
      showAlert('Sua conta foi excluída.', 'success');
      await router.push('/');
    } else {
      showAlert(data.mensagem || 'Erro ao excluir conta.', 'error');
    }
  } catch (err) {
    console.error('Erro ao excluir conta:', err);
    showAlert('Erro de conexão.', 'error');
  } finally {
    isDeleting.value = false;
  }
}
// ------------------------------------

async function abrirModalConexoes(tipo) {
  conexoesTipo.value = tipo;
  conexoesTitulo.value = tipo === 'seguindo' ? 'Seguindo' : 'Seguidores';
  conexoesDialog.value = true;
  conexoesLoading.value = true;
  listaConexoes.value = [];

  try {
    const perfilId = perfilUsuario.value.id; 
    const res = await authFetch(`${API_URL}/api/users/perfil_conexoes.php?id=${perfilId}&tipo=${tipo}`, {
      method: 'GET',
      credentials: 'include'
    });
    const data = await res.json();
    
    if (data.sucesso) {
      listaConexoes.value = data.usuarios;
    }
  } catch (err) {
    console.error("Erro ao carregar conexões", err);
  } finally {
    conexoesLoading.value = false;
  }
}

async function removerConexao(userToRemove) {
  showConfirm(`Deixar de seguir ${userToRemove.nome}?`, async () => {
    try {
      const res = await authFetch(`${API_URL}/api/users/deixar_de_seguir.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userToRemove.id })
      });

      const data = await res.json();
      if (data.sucesso) {
        listaConexoes.value = listaConexoes.value.filter(u => u.id !== userToRemove.id);
        perfilUsuario.value.following_count--;
        showAlert('Deixou de seguir com sucesso', 'success');
      } else {
        showAlert(data.mensagem, 'error');
      }
    } catch (err) {
      console.error("Erro ao deixar de seguir:", err);
      showAlert("Erro ao deixar de seguir.", 'error');
    }
  });
}

// --- Géneros e Upload ---
const generosDisponiveis = [
  'Afrobeat',
  'Afrobeats',
  'Amapiano',
  'Alternative',
  'Alternative Rock',
  'Ambient',
  'Americana',
  'Axé',
  'Bachata',
  'Baile Funk',
  'Black Metal',
  'Bluegrass',
  'Blues',
  'Bossa Nova',
  'Breakbeat',
  'Britpop',
  'Chillwave',
  'Clássica',
  'Cloud Rap',
  'Country',
  'Cumbia',
  'Dancehall',
  'Death Metal',
  'Deep House',
  'Disco',
  'Dream Pop',
  'Drum and Bass',
  'Dub',
  'Dubstep',
  'EDM',
  'Eletrônica',
  'Emo',
  'Experimental',
  'Folk',
  'Forró',
  'Funk',
  'Funk Carioca',
  'Future Bass',
  'Garage Rock',
  'Gospel',
  'Grime',
  'Grunge',
  'Hard Rock',
  'Hardcore',
  'Heavy Metal',
  'Hip Hop',
  'House',
  'Hyperpop',
  'Indie',
  'Indie Folk',
  'Indie Pop',
  'Indie Rock',
  'Industrial',
  'J-Pop',
  'J-Rock',
  'Jazz',
  'Jungle',
  'K-Pop',
  'K-R&B',
  'Latin Pop',
  'Latin Rock',
  'Lo-fi',
  'Math Rock',
  'Metal',
  'Metalcore',
  'Midwest Emo',
  'MPB',
  'Neo Soul',
  'New Wave',
  'Nu Metal',
  'Pagode',
  'Phonk',
  'Pop',
  'Pop Punk',
  'Post-Hardcore',
  'Post-Punk',
  'Post-Rock',
  'Progressive Metal',
  'Progressive Rock',
  'Psychedelic Rock',
  'Punk',
  'R&B',
  'Rap',
  'Reggae',
  'Reggaeton',
  'Rock',
  'Salsa',
  'Samba',
  'Sertanejo',
  'Shoegaze',
  'Ska',
  'Soul',
  'Synthpop',
  'Tech House',
  'Techno',
  'Trance',
  'Trap',
  'Trip Hop',
  'Vaporwave',
  'World Music'
];

const fileInput = ref(null);
const isUploading = ref(false);

function triggerUpload() {
  fileInput.value.click();
}

async function onFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  isUploading.value = true;
  const formData = new FormData();
  formData.append('foto', file);

  try {
    const res = await authFetch(`${API_URL}/api/users/perfil_foto_update.php`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data.sucesso) {
      perfilUsuario.value.avatar = data.nova_url;
      perfilUsuario.value.foto_perfil = data.nova_url;
      atualizarLocalStorageFoto(data.nova_url);
      showAlert('Foto de perfil atualizada!', 'success');
    } else {
      showAlert(data.mensagem || 'Erro ao enviar imagem.', 'error');
    }

  } catch (err) {
    console.error('Erro ao fazer upload do avatar:', err);
    showAlert('Erro de rede ao enviar a imagem.', 'error');
  } finally {
    isUploading.value = false;
  }
}

function confirmarRemocaoFoto() {
  showConfirm('Tem a certeza que quer remover a sua foto de perfil?', executarRemocaoFoto);
}

async function executarRemocaoFoto() {
  isUploading.value = true;
  try {
    const res = await authFetch(`${API_URL}/api/users/perfil_foto_remove.php`, {
      method: 'POST',
      credentials: 'include',
    });
    
    const data = await res.json();
    if (res.ok && data.sucesso) {
      perfilUsuario.value.avatar = data.nova_url;
      perfilUsuario.value.foto_perfil = null;
      atualizarLocalStorageFoto(null);
      showAlert('Foto de perfil removida.', 'success');
    } else {
      showAlert(data.mensagem || 'Erro ao remover foto.', 'error');
    }

  } catch (err) {
    console.error('Erro ao remover a foto:', err);
    showAlert('Erro de rede ao remover a foto.', 'error');
  } finally {
    isUploading.value = false;
  }
}

function atualizarLocalStorageFoto(novaUrl) {
  // Mantém a foto do cabeçalho e do perfil sincronizadas sem F5.
  updateUsuario({
    foto: novaUrl,
    foto_perfil: novaUrl,
  });
}

function openEditDialog() {
  editForm.nome = perfilUsuario.value.nome;
  const generosString = perfilUsuario.value.generos || '';
  if (generosString) {
    editForm.generos = generosString.split(',').map(g => g.trim());
  } else {
    editForm.generos = [];
  }
  editDialog.value = true;
}

function closeEditDialog() {
  editDialog.value = false;
}

async function saveProfile() {
  const { valid } = await editFormRef.value.validate();
  if (!valid) return;

  isSaving.value = true;
  try {
    const generosParaEnviar = Array.isArray(editForm.generos) 
      ? editForm.generos.join(', ') 
      : editForm.generos;

    const res = await authFetch(`${API_URL}/api/users/perfil_update.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: editForm.nome,
        generos: generosParaEnviar
      })
    });
    const data = await res.json();

    if (data.sucesso) {
      perfilUsuario.value.nome = data.dados_atualizados.nome;
      perfilUsuario.value.generos = data.dados_atualizados.generos;

      updateUsuario({
        nome: data.dados_atualizados.nome,
        generos: data.dados_atualizados.generos,
      });
      closeEditDialog();
      showAlert('Perfil atualizado com sucesso!', 'success');
    } else {
      showAlert(data.mensagem, 'error');
    }
  } catch (err) {
    console.error('Erro ao salvar perfil:', err);
    showAlert('Erro de rede ao tentar salvar.', 'error');
  } finally {
    isSaving.value = false;
  }
}

async function toggleLike(review) {
  if (!loggedInUserId.value) return openLoginDialog();

  likeLoadingId.value = review.id;
  try {
    const res = await authFetch(`${API_URL}/api/reviews/curtir_avaliacao.php`, {
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

async function toggleFollow() {
  if (!loggedInUserId.value) return openLoginDialog();

  followLoading.value = true;
  const endpoint = isFollowing.value ? 'deixar_de_seguir.php' : 'seguir.php';
  try {
    const res = await authFetch(`${API_URL}/api/users/${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: perfilUsuario.value.id })
    });
    const data = await res.json();
    if (data.sucesso) {
      isFollowing.value = !isFollowing.value;
      if (isFollowing.value) {
        perfilUsuario.value.followers_count++;
      } else {
        perfilUsuario.value.followers_count--;
      }
    } else {
      showAlert(data.mensagem, 'error');
    }
  } catch (err) {
    console.error(`Erro ao ${endpoint}:`, err);
    showAlert('Erro na solicitação.', 'error');
  } finally {
    followLoading.value = false;
  }
}

async function carregarRecomendacoesCache() {
  if (!isSelf.value) {
    recomendacoes.value = [];
    recomendacoesMensagem.value = '';
    recomendacoesPrecisaContexto.value = false;
    recomendacoesContexto.value = {};
    return;
  }

  try {
    const res = await authFetch(`${API_URL}/api/recommendations/descobertas.php`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (res.ok && data.sucesso && data.tem_playlist && Array.isArray(data.playlist)) {
      recomendacoes.value = data.playlist;
      recomendacoesContexto.value = data.contexto || {};
      spotifyPlaylistUrl.value = data.spotify_export?.url || '';

      // Se o usuário acabou de autorizar a permissão de playlist no Spotify,
      // concluímos automaticamente a ação que ele iniciou antes do redirect.
      const pendente = sessionStorage.getItem('socialmusic_playlist_spotify_pendente') === '1';
      if (pendente && !spotifyPlaylistUrl.value && spotifyConectado.value) {
        sessionStorage.removeItem('socialmusic_playlist_spotify_pendente');
        await salvarPlaylistSpotify();
      }
    }
  } catch (err) {
    console.warn('Não foi possível carregar o cache de recomendações:', err);
  }
}

async function gerarRecomendacoes(forcar = false) {
  if (!loggedInUserId.value) return openLoginDialog();
  if (!isSelf.value || recomendacoesLoading.value) return;

  recomendacoesLoading.value = true;
  recomendacoesMensagem.value = '';
  recomendacoesPrecisaContexto.value = false;

  try {
    const res = await authFetch(`${API_URL}/api/recommendations/descobertas.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forcar }),
    });
    const data = await res.json();

    if (!res.ok || !data.sucesso) {
      throw new Error(data.mensagem || 'Não foi possível gerar as recomendações.');
    }

    if (data.tem_playlist && Array.isArray(data.playlist)) {
      recomendacoes.value = data.playlist;
      recomendacoesContexto.value = data.contexto || {};
      recomendacoesMensagem.value = '';
      spotifyPlaylistUrl.value = data.spotify_export?.url || '';
      if (data.cooldown && data.mensagem) showAlert(data.mensagem, 'info');
    } else {
      recomendacoes.value = [];
      recomendacoesContexto.value = data.contexto || {};
      spotifyPlaylistUrl.value = '';
      recomendacoesMensagem.value = data.mensagem || 'Ainda não há dados suficientes para montar sua seleção.';
      recomendacoesPrecisaContexto.value = !!data.precisa_contexto;
    }
  } catch (err) {
    console.error('Erro ao gerar recomendações:', err);
    recomendacoesMensagem.value = err.message || 'Não foi possível gerar suas descobertas agora.';
    if (showAlert) showAlert(recomendacoesMensagem.value, 'error');
  } finally {
    recomendacoesLoading.value = false;
  }
}

async function salvarPlaylistSpotify() {
  if (!isSelf.value || !recomendacoes.value.length || spotifyPlaylistLoading.value) return;

  if (!spotifyConectado.value) {
    showAlert('Conecte sua conta Spotify para salvar esta seleção.', 'info');
    return;
  }

  spotifyPlaylistLoading.value = true;
  try {
    const res = await authFetch(`${API_URL}/api/recommendations/criar_playlist_spotify.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json();

    if (data.necessita_autorizacao) {
      // Usuários que vincularam o Spotify antes desta funcionalidade ainda não
      // concederam playlist-modify-private. Guardamos a intenção, autorizamos e
      // voltamos ao perfil para concluir automaticamente.
      sessionStorage.setItem('socialmusic_playlist_spotify_pendente', '1');
      const returnTo = route.fullPath || `/perfil/${perfilUsuario.value.username || ''}`;
      const authUrl = `${API_URL}/api/spotify/spotify_user_auth.php?action=authorize&mode=login&return_to=${encodeURIComponent(returnTo)}`;
      window.location.href = authUrl;
      return;
    }

    if (!res.ok || !data.sucesso) {
      throw new Error(data.mensagem || 'Não foi possível criar a playlist no Spotify.');
    }

    spotifyPlaylistUrl.value = data.playlist_url || '';
    showAlert(data.ja_criada ? 'Esta seleção já está salva no Spotify.' : 'Playlist criada no Spotify!', 'success');
  } catch (err) {
    console.error('Erro ao criar playlist no Spotify:', err);
    showAlert(err.message || 'Não foi possível criar a playlist no Spotify.', 'error');
  } finally {
    spotifyPlaylistLoading.value = false;
  }
}

async function ouvirRecomendacao(musica) {
  if (!musica?.spotify_id || recomendacaoPlayLoadingId.value) return;
  recomendacaoPlayLoadingId.value = musica.spotify_id;

  try {
    const params = new URLSearchParams({
      spotify_id: musica.spotify_id,
      track_name: musica.track_name || '',
      artist_name: musica.artist_name || '',
    });
    if (musica.duration_ms) params.set('duration_ms', String(musica.duration_ms));

    const res = await authFetch(`${API_URL}/api/youtube/buscar_video.php?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();

    if (!res.ok || !data.sucesso || !data.encontrado || !data.youtube_id) {
      throw new Error(data.mensagem || 'Player indisponível para esta música.');
    }

    playGlobalTrack({
      youtubeId: data.youtube_id,
      trackName: musica.track_name,
      artistName: musica.artist_name,
      imageUrl: musica.image_url,
      spotifyUrl: musica.spotify_url,
    });
  } catch (err) {
    console.error('Erro ao abrir recomendação no player:', err);
    showAlert(err.message || 'Não foi possível reproduzir esta música.', 'error');
  } finally {
    recomendacaoPlayLoadingId.value = null;
  }
}

function recomendacaoParaMusica(musica) {
  return {
    id: musica.spotify_id,
    titulo: musica.track_name,
    artista: musica.artist_name,
    capa: musica.image_url,
    spotify_url: musica.spotify_url,
    duration_ms: musica.duration_ms,
    release_date: musica.release_date,
    popularity: musica.popularity,
    explicit: musica.explicit,
    album_name: musica.album_name,
    album_type: musica.album_type,
  };
}

async function abrirAvaliacaoRecomendada(musica) {
  if (!musica?.spotify_id || recomendacaoAvaliacaoLoadingId.value) return;
  recomendacaoAvaliacaoLoadingId.value = musica.spotify_id;

  try {
    let completa = { ...musica };

    // Recomendações vindas apenas do banco social podem não ter duração/álbum.
    // Enriquecemos somente quando o usuário realmente decide abrir a avaliação.
    if (!completa.duration_ms || !completa.album_name) {
      const artistaPrincipal = (completa.artist_name || '').split(',')[0].trim();
      const busca = `track:"${completa.track_name}" artist:"${artistaPrincipal}"`;
      const res = await authFetch(`${API_URL}/api/spotify/search.php?q=${encodeURIComponent(busca)}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const resultados = await res.json();
        if (Array.isArray(resultados)) {
          const exata = resultados.find(item => item.id === completa.spotify_id) || resultados[0];
          if (exata) {
            completa = {
              ...completa,
              track_name: exata.track_name || completa.track_name,
              artist_name: exata.artist_name || completa.artist_name,
              image_url: exata.image_url || completa.image_url,
              spotify_url: exata.spotify_url || completa.spotify_url,
              duration_ms: exata.duration_ms ?? completa.duration_ms,
              release_date: exata.release_date ?? completa.release_date,
              popularity: exata.popularity ?? completa.popularity,
              explicit: exata.explicit ?? completa.explicit,
              album_name: exata.album_name ?? completa.album_name,
              album_type: exata.album_type ?? completa.album_type,
            };
          }
        }
      }
    }

    await router.push(getAvaliacaoUrl(recomendacaoParaMusica(completa)));
  } catch (err) {
    console.error('Erro ao abrir avaliação recomendada:', err);
    showAlert('Não foi possível abrir esta música agora.', 'error');
  } finally {
    recomendacaoAvaliacaoLoadingId.value = null;
  }
}

const avaliacoes = ref([]);
const reviewsVisiveisCount = ref(3);
const isLoadingMoreReviews = ref(false);

const reviewsVisiveis = computed(() => {
  return avaliacoes.value.slice(0, reviewsVisiveisCount.value);
});

function carregarMaisAvaliacoes() {
  isLoadingMoreReviews.value = true;
  setTimeout(() => {
    reviewsVisiveisCount.value += 3;
    isLoadingMoreReviews.value = false;
  }, 300);
}

function getAvaliacaoUrl(musica) {
  if (!musica) return '/';
  const params = new URLSearchParams();
  params.append('id', musica.id);
  params.append('name', musica.titulo);
  params.append('artist', musica.artista);
  params.append('image', musica.capa);
  params.append('spotify', musica.spotify_url);
  params.append('duration_ms', musica.duration_ms);
  params.append('release_date', musica.release_date);
  params.append('popularity', musica.popularity);
  params.append('explicit', musica.explicit);
  params.append('album_name', musica.album_name);
  params.append('album_type', musica.album_type);
  return `/avaliacao?${params.toString()}`;
}


let perfilController = null;

async function carregarPerfil(username) {
  perfilController?.abort();
  const controller = new AbortController();
  perfilController = controller;
  loading.value = true;
  error.value = false;
  reviewsVisiveisCount.value = 3;


  const url = username ? `${API_URL}/api/users/perfil.php?username=${username}` : `${API_URL}/api/users/perfil.php`;

  try {
    const res = await authFetch(url, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
    });
    if (!res.ok) {
      if (res.status === 401) router.push('/');
      else errorMessage.value = 'Não foi possível carregar o perfil.';
      error.value = true;
      throw new Error('Falha ao buscar dados');
    }

    const data = await res.json();
    if (perfilController !== controller) return;

    if (data.sucesso) {
      perfilUsuario.value = data.perfil;
      isSelf.value = data.is_self;
      isFollowing.value = data.is_following;

   

      if (data.perfil.username && route.params.username !== data.perfil.username) {
        router.replace({ name: 'Perfil', params: { username: data.perfil.username } });
      }
      // --------------------------

      avaliacoes.value = data.avaliacoes;

      if (isSelf.value) {
        await carregarRecomendacoesCache();
      } else {
        recomendacoes.value = [];
        spotifyPlaylistUrl.value = '';
        recomendacoesMensagem.value = '';
        recomendacoesPrecisaContexto.value = false;
      }
    } else {
      errorMessage.value = data.mensagem;
      error.value = true;
    }
  } catch (err) {
    if (err.name === 'AbortError') return;
    console.error('Erro ao carregar perfil:', err);
    error.value = true;
  } finally {
    if (perfilController === controller) {
      loading.value = false;
    }
  }
}

onMounted(() => {
  const usernameDaUrl = route.params.username;
  carregarPerfil(usernameDaUrl);
});

watch(() => route.params.username, (novoUsername) => {
  if (route.path.startsWith('/perfil')) {
    carregarPerfil(novoUsername);
  }
});

// Recalcula permissões/seguimento quando a sessão muda sem recarregar a página.
watch(usuarioId, (novoId, idAnterior) => {
  if (isDeleting.value || novoId === idAnterior || !route.path.startsWith('/perfil')) return;
  carregarPerfil(route.params.username);
});

onBeforeUnmount(() => {
  perfilController?.abort();
});
</script>

<style scoped>
.clickable-stat {
  cursor: pointer;
  transition: opacity 0.2s;
}
.clickable-stat:hover {
  opacity: 0.7;
}

.discovery-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.045);
}

.discovery-slider {
  margin-inline: -4px;
}

.discovery-track-card {
  border: 1px solid rgba(0, 0, 0, 0.055);
  background: #fff;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  overflow: hidden;
}

.discovery-track-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-primary), 0.22);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.07);
}

.discovery-cover-wrap {
  position: relative;
  overflow: hidden;
}

.discovery-cover {
  transition: transform 0.25s ease;
}

.discovery-track-card:hover .discovery-cover {
  transform: scale(1.015);
}

.discovery-play-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
  color: #212121 !important;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.18);
}

.discovery-reason {
  min-height: 34px;
  display: flex;
  align-items: flex-start;
  color: #757575;
  line-height: 1.3;
}

@media (max-width: 600px) {
  .discovery-track-card {
    width: 172px !important;
  }

  .discovery-cover,
  .discovery-cover-wrap {
    width: 172px !important;
  }
}
</style>