<template>
  <div style="min-height: 100vh;">
    <div style="background-color: white; height: 80px; position: fixed; top: 0; left: 0; right: 0; z-index: 1;"></div>

    <div style="background-color: #f8f9fa; min-height: 100vh; padding-top: 80px; position: relative; z-index: 0;">
      
      <v-container v-if="loading" class="py-8">
        <v-skeleton-loader type="article, actions"></v-skeleton-loader>
      </v-container>

      <v-container v-else-if="error" class="py-8 text-center">
        <v-alert type="error" border="start" prominent>
          {{ errorMessage }}
        </v-alert>
        <v-btn to="/" color="primary" class="mt-4">Voltar à Página Inicial</v-btn>
      </v-container>
      
      <v-container v-else class="py-8">
        <v-row>
          <v-col cols="12" md="7">
      
            <div class="d-flex justify-space-between align-center mb-6">
              <div>
                <h1 class="text-h4 font-weight-bold my-8 text-grey-darken-3 mb-1">
               {{ perfilUsuario.nome }}
                </h1>
                <p class="text-body-2 text-grey-darken-1">{{ perfilUsuario.username }}</p>
              </div>
              
              <v-btn 
                v-if="isSelf" 
                color="primary" 
                variant="flat" 
                rounded="lg" 
                size="default" 
                @click="openEditDialog">
                Editar Perfil
              </v-btn>

              <v-btn
                v-else
                :loading="followLoading"
                :variant="isFollowing ? 'outlined' : 'flat'"
                color="primary"
                rounded="lg" 
                size="default"
                @click="toggleFollow"
              >
                {{ isFollowing ? 'A Seguir' : 'Seguir' }}
              </v-btn>
            </div>

            <div>
              <h2 class="text-h6 font-weight-bold mb-4 text-grey-darken-4">
                {{ isSelf ? 'Minhas Avaliações' : `Avaliações de ${perfilUsuario.nome}` }}
              </h2>
              
              <v-alert v-if="avaliacoes.length === 0" type="info" variant="tonal">
                Este utilizador ainda não fez nenhuma avaliação.
              </v-alert>
              
              <div v-for="(avaliacao, i) in avaliacoes" :key="i" class="mb-4">
                <v-card rounded="lg" flat>
                  <v-card-text class="pa-5">
                    <div class="d-flex align-start mb-3">
                      <v-avatar size="70" rounded="lg" class="mr-4">
                        <v-img :src="avaliacao.musica.capa"></v-img>
                      </v-avatar>
                      <div>
                        <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">
                          {{ avaliacao.musica.titulo }}
                        </div>
                        <div class="text-body-2 text-grey">
                          {{ avaliacao.musica.artista }}
                        </div>
                      </div>
                    </div>
                    <h3 class="text-body-1 font-weight-bold mb-2 text-grey-darken-4">
                      {{ avaliacao.titulo }}
                    </h3>
                    <p class="text-body-2 text-grey-darken-1 mb-4" style="line-height: 1.5;">
                      {{ avaliacao.comentario }}
                    </p>
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-heart" size="20"></v-icon>
                      <span class="text-body-2 ml-2 text-grey-darken-3 font-weight-medium">{{ avaliacao.likes }}</span>
                    </div>
                  </v-card-text>
                </v-card>
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
                  Gêneros preferidos pop, eletrônico
                </p>
              </div>
            </v-card>
            </v-col>
        </v-row>
      </v-container>

      <v-dialog v-model="editDialog" max-width="500px" persistent>
         </v-dialog>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; 

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmusic.onrender.com';
const router = useRouter();
const route = useRoute();

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const perfilUsuario = ref({});
const avaliacoes = ref([]);
const isSelf = ref(false);
const isFollowing = ref(false);
const followLoading = ref(false);
const musicasRecentes = ref([]); // (Mockado)
const usuariosOnline = ref([]); // (Mockado)
const editDialog = ref(false);
const isSaving = ref(false);
const editForm = reactive({ nome: '' });

function openEditDialog() {
  editForm.nome = perfilUsuario.value.nome;
  editDialog.value = true;
}
function closeEditDialog() { 
  editDialog.value = false;
}
async function saveProfile() { 
  if (!editForm.nome.trim()) return; 
  isSaving.value = true;
  try {
    const res = await fetch(`${API_URL}/api/perfil_update.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: editForm.nome })
    });
    const data = await res.json();
    if (data.sucesso) {
      perfilUsuario.value.nome = data.nome_atualizado;
      const usuarioLocal = JSON.parse(localStorage.getItem('usuario'));
      if (usuarioLocal) {
        usuarioLocal.nome = data.nome_atualizado;
        localStorage.setItem('usuario', JSON.stringify(usuarioLocal));
      }
      closeEditDialog();
    } else {
      alert(`Erro: ${data.mensagem}`);
    }
  } catch (err) {
    console.error('Erro ao salvar perfil:', err);
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
      // (Atualização de contagem local omitida por brevidade)
    } else {
      alert(`Erro: ${data.mensagem}`);
    }
  } catch (err) {
    console.error(`Erro ao ${endpoint}:`, err);
  } finally {
    followLoading.value = false;
  }
}

async function carregarPerfil(id) {
  loading.value = true;
  error.value = false;
  const url = id ? `${API_URL}/api/perfil.php?id=${id}` : `${API_URL}/api/perfil.php`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include' 
    });
    if (!res.ok) {
      if (res.status === 401) {
        errorMessage.value = 'A sua sessão expirou. Por favor, faça login novamente.';
        router.push('/');
      } else if (res.status === 404) {
        errorMessage.value = 'Utilizador não encontrado.';
      } else {
        errorMessage.value = 'Não foi possível carregar o perfil.';
      }
      error.value = true;
      throw new Error('Falha ao buscar dados');
    }
    const data = await res.json();
    if (data.sucesso) {
      perfilUsuario.value = data.perfil;
      avaliacoes.value = data.avaliacoes;
      isSelf.value = data.is_self;
      isFollowing.value = data.is_following;
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
  const idDaUrl = route.params.id;
  carregarPerfil(idDaUrl);
});

watch(() => route.params.id, (novoId) => {
  if (route.path.startsWith('/perfil')) {
    carregarPerfil(novoId);
  }
});
</script>
