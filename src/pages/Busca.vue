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

          <div v-if="isLoading" class="text-center">
            <v-progress-circular indeterminate color="#EEE8FF" size="64"></v-progress-circular>
          </div>

          <div v-else-if="!isLoading && searched && firstTrack === null">
            <v-card-text class="text-center text-grey">
              Nenhuma música encontrada.
            </v-card-text>
          </div>

          <div v-else>
            <v-card v-if="firstTrack" class="mb-6 pa-4 d-flex align-center" variant="flat" color="#EEE8FF" rounded="lg"
              :href="firstTrack.spotify_url" target="_blank">
              <v-img :src="firstTrack.image_url" min-width="130" max-width="170" min-height="170" max-height="120" cover
                class="rounded-lg mr-4"></v-img>

              <div class="d-flex flex-column flex-grow-1">
                <v-card-title class="pa-0 text-h6 font-weight-bold">{{
                  firstTrack.track_name
                }}</v-card-title>
                <v-card-subtitle class="pa-0 text-body-2">{{
                  firstTrack.artist_name
                }}</v-card-subtitle>
              </div>

              <div class="d-flex ml-4">
                <span class="text-body-1 font-weight-medium mr-1">4/5</span>
                <v-icon color="yellow-darken-2">mdi-star</v-icon>
              </div>
            </v-card>

            <v-card v-for="track in otherTracks" :key="track.spotify_url" class="mb-4" :href="track.spotify_url"
              target="_blank">
              <div class="d-flex">
                <div>
                  <v-img :src="track.image_url" :width="80" :height="80" cover class="ma-2 rounded"></v-img>
                </div>
                <div class="d-flex flex-column justify-center">
                  <v-card-title class="pa-0 text-body-1 font-weight-bold">{{
                    track.track_name
                  }}</v-card-title>
                  <v-card-subtitle class="pa-0">{{
                    track.artist_name
                  }}</v-card-subtitle>
                </div>
              </div>
            </v-card>
          </div>
        </v-col>

        <v-col cols="12" md="4">
          <h2 class="text-h6 mb-4">Membros</h2>

          <v-card rounded="lg">
            <v-card-text class="text-center text-grey">
              <v-list-item prepend-avatar="https://randomuser.me/api/portraits/men/1.jpg" title="Nome do Membro"
                subtitle="username" class="mb-2"></v-list-item>
              <v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/2.jpg" title="Outro Membro"
                subtitle="outro_user"></v-list-item>

              <p class="mt-4">em construção</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue"; // Adicione 'computed' aqui
import { useRoute } from "vue-router";
import axios from "axios";

// Configuração da API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/socialmusic_backend';

const route = useRoute();
const searchTerm = ref(route.query?.q || "");
const results = ref([]); // Todos os resultados brutos da API
const isLoading = ref(false);
const searched = ref(false);

// Computed para o primeiro track (destaque)
const firstTrack = computed(() => {
  return results.value.length > 0 ? results.value[0] : null;
});

// Computed para os outros tracks (a partir do segundo)
const otherTracks = computed(() => {
  return results.value.slice(1);
});

async function fetchResults(query) {
  if (!query) {
    results.value = [];
    searched.value = false;
    return;
  }
  isLoading.value = true;
  searched.value = true;
  results.value = []; // Limpa antes de uma nova busca

  const apiUrl = `${API_URL}/api/search.php?q=${encodeURIComponent(query)}`;
  try {
    const response = await axios.get(apiUrl);
    results.value = response.data; // Armazena todos os resultados
  } catch (err) {
    console.error("Erro ao buscar dados:", err);
  } finally {
    isLoading.value = false;
  }
}

watch(
  () => route.query?.q,
  (newQuery) => {
    searchTerm.value = newQuery || "";
    fetchResults(newQuery);
  },
  { immediate: true },
);
</script>
