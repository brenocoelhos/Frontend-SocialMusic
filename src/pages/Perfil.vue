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
          <v-col cols="12" md="7">

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
                    </v-list-item> <v-rating :model-value="avaliacao.nota" color="amber" density="compact"
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

          <v-col cols="12" md="5">
            <v-card rounded="xl" class="mb-6 pa-8 text-center" color="white" flat elevation="0">

              <div class="d-flex justify-center mb-4">
                <v-avatar size="160" style="position: relative;">
                  <v-img v-if="perfilUsuario.foto_perfil" :src="perfilUsuario.foto_perfil"></v-img>
                  <v-icon v-else size="160" color="grey-lighten-1">mdi-account-circle</v-icon>

                  <v-btn v-if="isSelf" icon="mdi-pencil" size="small" color="primary"
                    style="position: absolute; bottom: 8px; right: 8px;" @click="triggerUpload"
                    :loading="isUploading"></v-btn>

                  <v-btn v-if="isSelf && perfilUsuario.foto_perfil" icon="mdi-delete" size="small" color="error"
                    style="position: absolute; top: 8px; right: 8px;" @click="removePhoto"
                    :loading="isUploading"></v-btn>
                </v-avatar>
              </div>

              <v-file-input ref="fileInput" v-show="false" accept="image/png, image/jpeg"
                @change="onFileChange"></v-file-input>
              <v-row class="mb-4">
                <v-col class="text-center">
                  <div class="text-h5 font-weight-bold">{{ perfilUsuario.followers_count }}</div>
                  <div class="text-caption text-grey">Seguidores</div>
                </v-col>
                <v-col class="text-center">
                  <div class="text-h5 font-weight-bold">{{ perfilUsuario.following_count }}</div>
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
              <v-text-field v-model="editForm.nome" label="Nome" variant="outlined"
                :rules="[v => !!v || 'Nome é obrigatório']" required class="mb-3"></v-text-field>

              <v-text-field v-model="editForm.generos" label="Gêneros Preferidos (ex: pop, rock, eletrônico)"
                variant="outlined" hint="Separados por vírgula"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="closeEditDialog" :disabled="isSaving">Cancelar</v-btn>
              <v-btn color="primary" type="submit" :loading="isSaving">Salvar</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
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
const musicasRecentes = ref([]);
const usuariosOnline = ref([]);
const editDialog = ref(false);
const isSaving = ref(false);
const editFormRef = ref(null);
const editForm = reactive({ nome: '', generos: '' });

const fileInput = ref(null); // Ref para o v-file-input
const isUploading = ref(false); // Loading para os botões do avatar

// 1. Função para "clicar" no input escondido
function triggerUpload() {
  fileInput.value.click();
}

// 2. Função chamada quando o utilizador seleciona um ficheiro
async function onFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  isUploading.value = true;
  const formData = new FormData();
  formData.append('foto', file); // 'foto' deve corresponder ao $_FILES['foto'] no PHP

  try {
    const res = await fetch(`${API_URL}/api/perfil_foto_update.php`, {
      method: 'POST',
      credentials: 'include', // Envia o cookie de sessão
      body: formData, // Envia como FormData (NÃO JSON)
    });

    const data = await res.json();
    if (res.ok && data.sucesso) {
      // Atualiza o avatar na página
      perfilUsuario.value.avatar = data.nova_url;
      // Atualiza o 'foto_perfil' (para o botão 'remover' aparecer)
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

// 3. Função para REMOVER a foto
async function removePhoto() {
  if (!confirm('Tem a certeza que quer remover a sua foto de perfil?')) {
    return;
  }

  isUploading.value = true;
  try {
    const res = await fetch(`${API_URL}/api/perfil_foto_remove.php`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await res.json();
    if (res.ok && data.sucesso) {
      // Atualiza o avatar para o padrão
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

// 4. Função auxiliar para atualizar o localStorage
function atualizarLocalStorageFoto(novaUrl) {
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
  if (usuarioLocal) {
    // Adiciona/atualiza a foto no objeto do localStorage
    usuarioLocal.foto_perfil = novaUrl;
    localStorage.setItem('usuario', JSON.stringify(usuarioLocal));
  }
}

// Funções para abrir e fechar o dialogo de login
function openEditDialog() {
  editForm.nome = perfilUsuario.value.nome;
  editForm.generos = perfilUsuario.value.generos || '';
  editDialog.value = true;
}
function closeEditDialog() {
  editDialog.value = false;
}

// Função de curtir a avaliação
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

async function saveProfile() {

  const { valid } = await editFormRef.value.validate();
  if (!valid) return;

  isSaving.value = true;
  try {
    const res = await fetch(`${API_URL}/api/perfil_update.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: editForm.nome,
        generos: editForm.generos
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
    } else {
      alert(`Erro: ${data.mensagem}`);
    }
  } catch (err) {
    console.error('Erro ao salvar perfil:', err);
    alert('Erro de rede ao tentar salvar.');
  } finally {
    isSaving.value = false;
  }
}

// Função de seguir o usuário
async function toggleFollow() {
  if (!loggedInUserId.value) return openLoginDialog();

  followLoading.value = true;
  const endpoint = isFollowing.value ? 'deixar_de_seguir.php' : 'seguir.php';
  try {
    const res = await fetch(`${API_URL}/api/${endpoint}`, {
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
      alert(`Erro: ${data.mensagem}`);
    }
  } catch (err) {
    console.error(`Erro ao ${endpoint}:`, err);
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

// Função para direcionar para a página de avaliação
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



async function carregarPerfil(id) {
  loading.value = true;
  error.value = false;


  reviewsVisiveisCount.value = 3;

  const url = id ? `${API_URL}/api/perfil.php?id=${id}` : `${API_URL}/api/perfil.php`;

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

  const idDaUrl = route.params.id;
  carregarPerfil(idDaUrl);
});

watch(() => route.params.id, (novoId) => {
  if (route.path.startsWith('/perfil')) {
    carregarPerfil(novoId);
  }
});
</script>