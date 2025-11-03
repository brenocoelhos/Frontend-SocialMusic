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
              <v-btn color="primary" variant="flat" rounded="lg" size="default">
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
      </v-container>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Configuração da API URL (como nos outros ficheiros)
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmusic.onrender.com';
const router = useRouter();

// --- ESTADO DA PÁGINA ---
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');

// --- DADOS DINÂMICOS (Vêm da API) ---
const perfilUsuario = ref({});
const avaliacoes = ref([]);

// --- DADOS ESTÁTICOS (Mockados - Spotify API, etc.) ---
// (Estes NÃO vêm da nossa BD, por isso mantemo-los mockados por agora)
const musicasRecentes = ref([
  {
    titulo: 'Venice Bitch - Lana Del Rey',
    artista: 'Lana Del Rey',
    capa: 'https://cdn-images.dzcdn.net/images/cover/c0f4f022fa51f13e877aae2e758e241d/1900x1900-000000-80-0-0.jpg'
  },
  {
    titulo: 'Shapeshifter - Lorde',
    artista: 'Lorde',
    capa: 'https://cdn-images.dzcdn.net/images/cover/c3a274f07eeeba58aa3cc00e83d55c81a/0x1900-000000-80-0-0.jpg'
  }
]);
const usuariosOnline = ref([
  {
    nome: 'White',
    handle: '@white',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    ouvindo: 'ouvindo FOOD FOOD - IRMAS DE PAU'
  }
]);


// --- LÓGICA AO CARREGAR A PÁGINA ---
onMounted(async () => {
  // 1. Verificar se o utilizador está "logado" no localStorage.
  // Se não estiver, não podemos carregar um perfil.
  const usuarioLocal = localStorage.getItem('usuario');
  if (!usuarioLocal) {
    // Redireciona para a página inicial se não estiver logado
    router.push('/');
    return;
  }

  // 2. Se estiver logado, buscar os dados completos da API
  try {
    loading.value = true;
    error.value = false;

    const res = await fetch(`${API_URL}/api/perfil.php`, {
      method: 'GET',
      credentials: 'include' // ESSENCIAL para enviar o cookie de sessão PHPSESSID
    });

    if (!res.ok) {
      if (res.status === 401) {
        // A sessão expirou ou é inválida
        errorMessage.value = 'A sua sessão expirou. Por favor, faça login novamente.';
        // (O seu index.js e App.vue já devem ter tratado de limpar o localStorage)
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