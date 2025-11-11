<template>
  <div style="
      background-color: #f8f9fa;
      min-height: 100vh;
      padding-top: 80px;
      position: relative;
      z-index: 0;
    ">
    <v-container>
      <v-row>
        <v-col>
          <h1 v-if="searchTerm" class="text-h5">
            Resultados para: "{{ searchTerm }}"
          </h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <h2 class="text-h6 mb-4">Músicas</h2>

          <div v-if="isLoadingTracks" class="text-center">
            <v-progress-circular indeterminate color="#EEE8FF" size="64"></v-progress-circular>
          </div>

          <div v-else-if="!isLoadingTracks && searched && firstTrack === null">
            <v-card-text class="text-center text-grey">
              Nenhuma música encontrada.
            </v-card-text>
          </div>

          <div v-else>
            <v-card v-if="firstTrack" class="mb-6 pa-4 d-flex align-center" variant="flat" color="#EEE8FF" rounded="lg"
              :to="getAvaliacaoUrl(firstTrack)">
              <v-img :src="firstTrack.image_url" min-width="130" max-width="170" min-height="170" max-height="120" cover
                class="rounded-lg mr-4"></v-img>

              <div class="d-flex flex-column flex-grow-1">
                <v-card-title class="pa-0 text-h6 font-weight-bold">{{ firstTrack.track_name }}</v-card-title>
                <v-card-subtitle class="pa-0 text-body-2">{{ firstTrack.artist_name }}</v-card-subtitle>
              </div>

            </v-card>

            <v-card v-for="track in otherTracks" :key="track.spotify_url" class="mb-4" :to="getAvaliacaoUrl(track)">
              <div class="d-flex">
                <div>
                  <v-img :src="track.image_url" :width="80" :height="80" cover class="ma-2 rounded"></v-img>
                </div>
                <div class="d-flex flex-column justify-center">
                  <v-card-title class="pa-0 text-body-1 font-weight-bold">{{ track.track_name }}</v-card-title>
                  <v-card-subtitle class="pa-0">{{ track.artist_name }}</v-card-subtitle>
                </div>
              </div>
            </v-card>
          </div>
        </v-col>

        <v-col cols="12" md="4">
          <h2 class="text-h6 mb-4">Membros</h2>

          <v-card rounded="lg">
            <div v-if="isLoadingMembers">
              <v-skeleton-loader v-for="n in 10" :key="n" type="list-item-avatar" class="mb-2"></v-skeleton-loader>
            </div>

            <v-list v-else bg-color="transparent">

              <v-list-item v-if="membersResults.length === 0 && searched" class="text-center  text-grey">
                <v-list-item-title>Nenhum membro encontrado</v-list-item-title>
              </v-list-item>

              <v-list-item v-for="membro in membersResults" :key="membro.id" :to="`/perfil/${membro.id}`" rounded="lg"
                class="mb-2">
                <template v-slot:prepend>
                  <v-avatar>
                    <v-img v-if="membro.avatar" :src="membro.avatar" :alt="membro.nome" cover />
                    <v-icon v-else size="40" color="grey-lighten-1">mdi-account-circle</v-icon> </v-avatar>
                </template>

                <v-list-item-title>{{ membro.nome }}</v-list-item-title>
                <v-list-item-subtitle>@{{ membro.username }}</v-list-item-subtitle>
              </v-list-item>

            </v-list>
          </v-card>

        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

// Configuração da API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmusic.onrender.com';

const route = useRoute();
const searchTerm = ref(route.query?.q || "");
const searched = ref(false);

// Estado das músicas
const trackResults = ref([]);
const isLoadingTracks = ref(false);

// Estado dos membros
const membersResults = ref([]);
const isLoadingMembers = ref(false);

// Computed para o primeiro track (destaque)
const firstTrack = computed(() => {
  return trackResults.value.length > 0 ? trackResults.value[0] : null;
});

// Computed para os outros tracks (a partir do segundo)
const otherTracks = computed(() => {
  return trackResults.value.slice(1);
});

// URL para a página de avaliação com todos os dados
function getAvaliacaoUrl(track) {
  if (!track) return "/";

  const params = new URLSearchParams();
  params.append('id', track.id);
  params.append('name', track.track_name);
  params.append('artist', track.artist_name);
  params.append('image', track.image_url);
  params.append('spotify', track.spotify_url);
  params.append('duration_ms', track.duration_ms);
  params.append('release_date', track.release_date);
  params.append('popularity', track.popularity);
  params.append('explicit', track.explicit);
  params.append('album_name', track.album_name);
  params.append('album_type', track.album_type);
  return `/avaliacao?${params.toString()}`;
}

async function fetchTracks(query) {
  isLoadingTracks.value = true;
  trackResults.value = [];
  const apiUrl = `${API_URL}/api/search.php?q=${encodeURIComponent(query)}`;
  try {
    const response = await axios.get(apiUrl);
    trackResults.value = response.data;
  } catch (err) {
    console.error("Erro ao buscar músicas:", err);
  } finally {
    isLoadingTracks.value = false;
  }
}

async function fetchMembers(query) {
  isLoadingMembers.value = true;
  membersResults.value = [];
  const apiUrl = `${API_URL}/api/buscar_membros.php?q=${encodeURIComponent(query)}`;
  try {
    const response = await axios.get(apiUrl);
    if (response.data.sucesso) {
      membersResults.value = response.data.usuarios;
    }
  } catch (err) {
    console.error("Erro ao buscar membros:", err);
  } finally {
    isLoadingMembers.value = false;
  }
}

watch(
  () => route.query?.q,
  (newQuery) => {
    searchTerm.value = newQuery || "";
    if (newQuery && newQuery.trim() !== "") {
      searched.value = true;
      // Chama as duas buscas em paralelo
      fetchTracks(newQuery);
      fetchMembers(newQuery);
    } else {
      // Limpa tudo se a busca for vazia
      searched.value = false;
      trackResults.value = [];
      membersResults.value = [];
    }
  },
  { immediate: true },
);
</script>
