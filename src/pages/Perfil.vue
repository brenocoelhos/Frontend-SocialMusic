<template>
  <div style="min-height: 100vh;">
    <div style="background-color: white; height: 80px; position: fixed; top: 0; left: 0; right: 0; z-index: 1;"></div>

    <div style="background-color: #f8f9fa; min-height: 100vh; padding-top: 80px; position: relative; z-index: 0;">
      
      <v-container v-if="loading" class="py-8">
        <v-skeleton-loader type="article, actions"></v-skeleton-loader>
        <v-skeleton-loader type="list-item-avatar-three-line@3"></v-skeleton-loader>
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
              <v-btn color="primary" variant="flat" rounded="lg" size="default" @click="openEditDialog">
                Editar Perfil
              </v-btn>
            </div>

            <div class="mb-8">
              <h2 class="text-h6 font-weight-bold mb-4 text-grey-darken-4">Músicas ouvidas recentemente</h2>
              <v-sheet color="white" rounded="lg" class="pa-0">
                <v-list bg-color="transparent" class="py-2">
                  <v-list-item v-for="(musica, index) in musicasRecentes" :key="index" class="px-4">
                    <template v-slot:prepend>
                      <v-avatar size="48" rounded="lg" class="mr-3">
                        <v-img :src="musica.capa"></v-img>
                      </v-avatar>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-regular text-grey-darken-3">
                      {{ musica.titulo }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption text-grey">
                      {{ musica.artista }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-sheet>
            </div>

            <div>
              <h2 class="text-h6 font-weight-bold mb-4 text-grey-darken-4">Minhas Avaliações</h2>
              
              <v-alert v-if="avaliacoes.length === 0" type="info" variant="tonal">
                Ainda não fez nenhuma avaliação.
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
              <div class="text-center">
                <p class="text-caption text-grey-darken-1">
                  Gêneros preferidos pop, eletrônico
                </p>
              </div>
            </v-card>

            <div>
              <h2 class="text-h6 font-weight-bold mb-4 text-grey-darken-4">Online Agora</h2>
              <v-sheet rounded="xl" color="#EEE8FF" class="pa-4">
                <div v-for="usuario in usuariosOnline" :key="usuario.handle" class="mb-3">
                  </div>
              </v-sheet>
            </div>
          </v-col>
        </v-row>
      </v-container> <v-dialog v-model="editDialog" max-width="500px" persistent>
        <v-form @submit.prevent="saveProfile">
          <v-card>
            <v-card-title>Editar Perfil</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="editForm.nome"
                label="Nome"
                variant="outlined"
                :rules="[v => !!v || 'Nome é obrigatório']"
                required
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
      </div> </div> </template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';

// Configuração da API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmusic.onrender.com';
const router = useRouter();

// --- ESTADO DA PÁGINA ---
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');

// --- DADOS DINÂMICOS (Vêm da API) ---
const perfilUsuario = ref({});
const avaliacoes = ref([]);

// --- DADOS ESTÁTICOS (Mockados) ---
const musicasRecentes = ref([
{ titulo: 'Venice Bitch - Lana Del Rey', artista: 'Lana Del Rey', capa: '...' },
{ titulo: 'Shapeshifter - Lorde', artista: 'Lorde', capa: '...' }
]);
const usuariosOnline = ref([
{ nome: 'White', handle: '@white', avatar: '...', ouvindo: '...' }
]);

// =======================================================
// VARIÁVEIS PARA EDIÇÃO DE PERFIL (JÁ EXISTIAM)
// =======================================================
const editDialog = ref(false);
const isSaving = ref(false);
const editForm = reactive({
  nome: ''
});

// Função para ABRIR o diálogo
function openEditDialog() {
  // Preenche o formulário com o nome atual
  editForm.nome = perfilUsuario.value.nome;
  editDialog.value = true;
}

// Função para FECHAR o diálogo
function closeEditDialog() {
  editDialog.value = false;
}

// Função para SALVAR o perfil
async function saveProfile() {
  if (!editForm.nome.trim()) return; // Validação simples

  isSaving.value = true;
  try {
    const res = await fetch(`${API_URL}/api/perfil_update.php`, {
      method: 'POST',
      credentials: 'include', // Envia o cookie de sessão
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: editForm.nome })
    });

    const data = await res.json();

    if (data.sucesso) {
      // 1. Atualiza o nome na página
      perfilUsuario.value.nome = data.nome_atualizado;
      
      // 2. (MUITO IMPORTANTE) Atualiza o localStorage
      // para que a barra de topo (App.vue) atualize no próximo refresh.
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
    alert('Erro de rede ao tentar salvar.');
  } finally {
    isSaving.value = false;
  }
}
// =======================================================
// FIM DAS VARIÁVEIS DE EDIÇÃO
// =======================================================


// --- LÓGICA AO CARREGAR A PÁGINA ---
onMounted(async () => {
  const usuarioLocal = localStorage.getItem('usuario');
  if (!usuarioLocal) {
    router.push('/');
    return;
  }

  try {
    loading.value = true;
    error.value = false;

    const res = await fetch(`${API_URL}/api/perfil.php`, {
      method: 'GET',
      credentials: 'include' 
    });

    if (!res.ok) {
      if (res.status === 401) {
        errorMessage.value = 'A sua sessão expirou. Por favor, faça login novamente.';
        router.push('/');
      } else {
        errorMessage.value = 'Não foi possível carregar o seu perfil.';
      }
      throw new Error('Falha ao buscar dados');
    }

    const data = await res.json();

    if (data.sucesso) {
      perfilUsuario.value = data.perfil;
      avaliacoes.value = data.avaliacoes;
    } else {
      errorMessage.value = data.mensagem;
      error.value = true;
    }

  } catch (err) {
    console.error('Erro em onMounted (Perfil.vue):', err);
    error.value = true;
    if (!errorMessage.value) {
      errorMessage.value = 'Erro de rede ao tentar carregar o perfil.';
    }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* (Os seus estilos <style scoped> podem ir aqui) */
</style>