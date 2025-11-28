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
import { ref, onMounted, reactive, watch, computed, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmusic.onrender.com';
const router = useRouter();
const route = useRoute();

const openLoginDialog = inject('openLoginDialog');
const showAlert = inject('showAlert');

const loggedInUserId = ref(null);
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
const editFormRef = ref(null);
const editForm = reactive({ nome: '', generos: '' });

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

async function abrirModalConexoes(tipo) {
  conexoesTipo.value = tipo;
  conexoesTitulo.value = tipo === 'seguindo' ? 'Seguindo' : 'Seguidores';
  conexoesDialog.value = true;
  conexoesLoading.value = true;
  listaConexoes.value = [];

  try {
    const perfilId = perfilUsuario.value.id; 
    const res = await fetch(`${API_URL}/api/users/perfil_conexoes.php?id=${perfilId}&tipo=${tipo}`, {
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
      const res = await fetch(`${API_URL}/api/users/deixar_de_seguir.php`, {
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
  'Pop', 'Rock', 'Hip Hop', 'Rap', 'R&B', 'Country', 'Eletrônica', 
  'Jazz', 'Clássica', 'Funk', 'Sertanejo', 'Pagode', 'Samba', 
  'Indie', 'Metal', 'Reggae', 'Soul', 'Blues', 'K-Pop', 'MPB'
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
    const res = await fetch(`${API_URL}/api/users/perfil_foto_update.php`, {
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
      setTimeout(() => { window.location.reload(); }, 1000);
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
    const res = await fetch(`${API_URL}/api/users/perfil_foto_remove.php`, {
      method: 'POST',
      credentials: 'include',
    });
    
    const data = await res.json();
    if (res.ok && data.sucesso) {
      perfilUsuario.value.avatar = data.nova_url;
      perfilUsuario.value.foto_perfil = null;
      atualizarLocalStorageFoto(null);
      showAlert('Foto de perfil removida.', 'success');
      setTimeout(() => { window.location.reload(); }, 1000);
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
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
  if (usuarioLocal) {
    usuarioLocal.foto_perfil = novaUrl;
    localStorage.setItem('usuario', JSON.stringify(usuarioLocal));
  }
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

    const res = await fetch(`${API_URL}/api/users/perfil_update.php`, {
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

      const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
      if (usuarioLocal) {
        usuarioLocal.nome = data.dados_atualizados.nome;
        localStorage.setItem('usuario', JSON.stringify(usuarioLocal));
      }
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
    const res = await fetch(`${API_URL}/api/reviews/curtir_avaliacao.php`, {
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
    const res = await fetch(`${API_URL}/api/users/${endpoint}`, {
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

// ATUALIZADO: Recebe username, não mais ID
async function carregarPerfil(username) {
  loading.value = true;
  error.value = false;
  reviewsVisiveisCount.value = 3;

  // ATUALIZADO: Muda o parâmetro da URL de ?id= para ?username=
  const url = username ? `${API_URL}/api/users/perfil.php?username=${username}` : `${API_URL}/api/users/perfil.php`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) {
      if (res.status === 401) router.push('/');
      else errorMessage.value = 'Não foi possível carregar o perfil.';
      error.value = true;
      throw new Error('Falha ao buscar dados');
    }

    const data = await res.json();
    if (data.sucesso) {
      perfilUsuario.value = data.perfil;
      isSelf.value = data.is_self;
      isFollowing.value = data.is_following;

      
      if (route.params.username && route.params.username != data.perfil.username) {
        // router.replace substitui a URL atual sem criar uma nova entrada no histórico
        // Assim, o botão "Voltar" do navegador funciona corretamente
        router.replace({ name: 'Perfil', params: { username: data.perfil.username } });
      }
     

      avaliacoes.value = data.avaliacoes;
    } else {
      errorMessage.value = data.mensagem;
      error.value = true;
    }
  } catch (err) {
    console.error('Erro em onMounted (Perfil.vue):', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const usuarioSalvo = localStorage.getItem('usuario');
  if (usuarioSalvo) {
    loggedInUserId.value = JSON.parse(usuarioSalvo).id;
  }

  
  const usernameDaUrl = route.params.username;
  carregarPerfil(usernameDaUrl);
});

watch(() => route.params.username, (novoUsername) => {
  if (route.path.startsWith('/perfil')) {
    carregarPerfil(novoUsername);
  }
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
</style>