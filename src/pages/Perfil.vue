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
              <v-btn v-else :loading="followLoading" :variant="isFollowing ? 'outlined' : 'flat'" color="primary" rounded="lg" size="default" @click="toggleFollow">
                {{ isFollowing ? 'A Seguir' : 'Seguir' }}
              </v-btn>
            </div>

            <div>
              <h2 class="text-h6 font-weight-bold mb-4 text-grey-darken-4">
                {{ isSelf ? 'Minhas Avaliações' : `Avaliações de ${perfilUsuario.nome}` }}
              </h2>
              
              <v-alert v-if="avaliacoes.length === 0" type="info" variant="tonal">
                Este usuário ainda não fez nenhuma avaliação.
              </v-alert>
              
              <div v-for="(avaliacao, i) in avaliacoes" :key="i" class="mb-4">
                <v-card rounded="lg" flat>
                  <v-card-text class="pa-5">
                    <div class="d-flex align-start mb-3">
                      <v-avatar size="70" rounded="lg" class="mr-4">
                        <v-img :src="avaliacao.musica.capa"></v-img>
                      </v-avatar>
                      <div>
                        <div class="text-subtitle-1 font-weight-bold text-grey-darken-4">{{ avaliacao.musica.titulo }}</div>
                        <div class="text-body-2 text-grey">{{ avaliacao.musica.artista }}</div>
                      </div>
                    </div>
                    <v-rating :model-value="avaliacao.nota" color="amber" density="compact" half-increments readonly size="small" class="mb-2"></v-rating>
                    <h3 class="text-body-1 font-weight-bold mb-2 text-grey-darken-4">{{ avaliacao.titulo }}</h3>
                    <p class="text-body-2 text-grey-darken-1 mb-4" style="line-height: 1.5;">{{ avaliacao.comentario }}</p>
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
              
              <v-text-field
                v-model="editForm.generos"
                label="Gêneros Preferidos (ex: pop, rock, eletrônico)"
                variant="outlined"
                hint="Separados por vírgula"
              ></v-text-field>
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
import { ref, onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; 

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmusic.onrender.com';
const router = useRouter();
const route = useRoute();

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

const avaliacoes = ref([]); // O array que o v-for usa

function openEditDialog() { /* ... (código existente) ... */ }
function closeEditDialog() { /* ... (código existente) ... */ }
async function saveProfile() { /* ... (código existente) ... */ }
async function toggleFollow() { /* ... (código existente) ... */ }


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
  const idDaUrl = route.params.id;
  carregarPerfil(idDaUrl);
});

watch(() => route.params.id, (novoId) => {
  if (route.path.startsWith('/perfil')) {
    carregarPerfil(novoId);
  }
});
</script>