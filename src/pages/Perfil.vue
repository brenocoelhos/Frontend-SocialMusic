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
                {{ isFollowing ? 'A Seguir' : 'Seguir' }}
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
                    <div class="d-flex align-start mb-3">
                      <v-avatar size="70" rounded="lg" class="mr-4">
                        <v-img :src="avaliacao.musica.capa"></v-img>
                      </v-avatar>
                      <div>
                        <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">{{ avaliacao.musica.titulo }}
                        </div>
                        <div class="text-body-2 text-grey">{{ avaliacao.musica.artista }}</div>
                      </div>
                    </div>
                    <v-rating :model-value="avaliacao.nota" color="amber" density="compact" half-increments readonly
                      size="small" class="mb-2"></v-rating>
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
                <v-avatar size="160">
                  <v-img :src="perfilUsuario.avatar"></v-img>
                </v-avatar>
              </div>
              <v-row class="mb-4">
                <v-col class="text-center">
                  <div class="text-h5 font-weight-bold">{{ perfilUsuario.followers_count }}</div>
                  <div class="text-caption text-grey">Seguidores</div>
                </v-col>
                <v-col class="text-center">
                  <div class="text-h5 font-weight-bold">{{ perfilUsuario.following_count }}</div>
                  <div class="text-caption text-grey">A Seguir</div>
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

// Injetar funções do app.vue
const openLoginDialog = inject('openLoginDialog');
const showAlert = inject('showAlert');

// Estado de login e curtida
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

function openEditDialog() {
  editForm.nome = perfilUsuario.value.nome;
  editForm.generos = perfilUsuario.value.generos || '';
  editDialog.value = true;
}
function closeEditDialog() {
  editDialog.value = false;
}

// Lógica de curtida
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
      // Atualiza os dados na página (localmente)
      perfilUsuario.value.nome = data.dados_atualizados.nome;
      perfilUsuario.value.generos = data.dados_atualizados.generos;

      // Atualiza o localStorage (para o App.vue)
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

async function toggleFollow() {
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

// Função que o botão chama
function carregarMaisAvaliacoes() {
  isLoadingMoreReviews.value = true;
  setTimeout(() => {
    reviewsVisiveisCount.value += 3; // Mostra mais 3
    isLoadingMoreReviews.value = false;
  }, 300); // 300ms de delay
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
      avaliacoes.value = data.avaliacoes; // Carrega todas as 10 avaliações aqui
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