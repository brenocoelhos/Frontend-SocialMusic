<template>
  <div class="musicas-page">
    <v-container class="py-16 mt-8">
      
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </div>

      <v-row v-else>
        <v-col cols="12" md="8" offset-md="2">
          <h2 class="text-h4 font-weight-bold my-8 text-grey-darken-3 text-center">
            Top Músicas da Comunidade
          </h2>
          
          <v-alert v-if="musicasMaisAvaliadas.length === 0" type="info" variant="tonal" class="mb-6">
            Ainda não há músicas avaliadas na plataforma. Seja o primeiro!
          </v-alert>

          <v-list bg-color="transparent">
            <v-list-item
              v-for="(musica, index) in musicasMaisAvaliadas"
              :key="musica.id"
              :to="getAvaliacaoUrl(musica)"
              class="mb-4 rounded-lg elevation-1 list-item-hover"
              style="background-color: #fff; padding: 16px;"
              lines="two"
            >
              <template v-slot:prepend>
                <div class="d-flex align-center mr-4">
                  <span class="text-h5 font-weight-bold text-grey-lighten-1 mr-4">#{{ index + 1 }}</span>
                  <v-avatar size="64" rounded="lg">
                    <v-img :src="musica.capa_url" :alt="musica.titulo" cover></v-img>
                  </v-avatar>
                </div>
              </template>

              <v-list-item-title class="text-h6 font-weight-bold text-grey-darken-3">
                {{ musica.titulo }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-1 text-grey-darken-1 mt-1">
                {{ musica.artista }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="d-flex flex-column align-end">
                  <div class="d-flex align-center mb-1">
                    <v-icon color="orange" size="28" class="mr-1">mdi-star</v-icon>
                    <span class="text-h5 font-weight-bold text-grey-darken-3">{{ musica.media_nota }}</span>
                    <span class="text-body-2 text-grey ml-1">/ 5</span>
                  </div>
                  </div>
              </template>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmusic.onrender.com';

const musicasMaisAvaliadas = ref([]);
const loading = ref(true);

// Função para gerar URL da página de avaliação
function getAvaliacaoUrl(musica) {
  const params = new URLSearchParams();
  
  params.append('id', musica.id); 
  params.append('name', musica.titulo);
  params.append('artist', musica.artista);
  params.append('image', musica.capa_url);
  params.append('spotify', musica.spotify_url);
  

  if(musica.duration_ms) params.append('duration_ms', musica.duration_ms);
  if(musica.release_date) params.append('release_date', musica.release_date);
  if(musica.popularity) params.append('popularity', musica.popularity);
  if(musica.explicit) params.append('explicit', musica.explicit);
  if(musica.album_name) params.append('album_name', musica.album_name);
  if(musica.album_type) params.append('album_type', musica.album_type);
  
  return `/avaliacao?${params.toString()}`;
}

onMounted(async () => {
  try {
   
    const res = await fetch(`${API_URL}/api/musicas_destaque.php?limit=20`);
    const data = await res.json();
    
    if (data.sucesso) {
      musicasMaisAvaliadas.value = data.musicas;
    }
  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.musicas-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.list-item-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.list-item-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}
</style>