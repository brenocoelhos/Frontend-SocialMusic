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
                  Perfil de {{ perfilUsuario.nome }}
                </h1>
                <p class="text-body-2 text-grey-darken-1">{{ perfilUsuario.email }}</p>
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
// useRoute é necessário para ler o ID da URL
import { useRoute, useRouter } from 'vue-router'; 

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmusic.onrender.com';
const router = useRouter();
const route = useRoute(); // <-- NOVO: para ler a URL

// --- ESTADO DA PÁGINA ---
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');

// --- DADOS DINÂMICOS (Vêm da API) ---
const perfilUsuario = ref({});
const avaliacoes = ref([]);
const isSelf = ref(false); // <-- NOVO
const isFollowing = ref(false); // <-- NOVO
const followLoading = ref(false); // <-- NOVO

// (Dados estáticos mockados...)
const musicasRecentes = ref([]);
const usuariosOnline = ref([]);

// --- LÓGICA DE EDIÇÃO (que já tinha) ---
const editDialog = ref(false);
const isSaving = ref(false);
const editForm = reactive({ nome: '' });
function openEditDialog() {
  editForm.nome = perfilUsuario.value.nome;
  editDialog.value = true;
}
function closeEditDialog() { /* ... */ }
async function saveProfile() { /* ... */ }

// =======================================================
// NOVAS FUNÇÕES: SEGUIR / DEIXAR DE SEGUIR
// =======================================================
async function toggleFollow() {
  followLoading.value = true;
  
  const endpoint = isFollowing.value ? 'deixar_de_seguir.php' : 'seguir.php';
  
  try {
    const res = await fetch(`${API_URL}/api/${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: perfilUsuario.value.id }) // Envia o ID de quem queremos seguir/parar
    });

    const data = await res.json();
    
    if (data.sucesso) {
      // Inverte o estado local
      isFollowing.value = !isFollowing.value; 
    } else {
      alert(`Erro: ${data.mensagem}`);
    }

  } catch (err) {
    console.error(`Erro ao ${endpoint}:`, err);
  } finally {
    followLoading.value = false;
  }
}

// =======================================================
// ATUALIZAÇÃO: onMounted agora busca o perfil da URL
// =======================================================

// Criamos uma função separada para carregar o perfil
async function carregarPerfil(id) {
  loading.value = true;
  error.value = false;
  
  // Se o ID for nulo (ex: /perfil), a API vai buscar o nosso próprio perfil
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

// onMounted agora apenas chama a função de carregar
onMounted(() => {
  const idDaUrl = route.params.id;
  carregarPerfil(idDaUrl);
});

// NOVO: 'watch'
// Se o utilizador navegar de um perfil para outro (ex: /perfil/5 -> /perfil/8)
// o onMounted não é chamado de novo. O 'watch' deteta essa mudança e recarrega.
watch(() => route.params.id, (novoId) => {
  if (route.path.startsWith('/perfil')) {
    carregarPerfil(novoId);
  }
});
</script>

<style scoped>
/* (Os seus estilos) */
</style>