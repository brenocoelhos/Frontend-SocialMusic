<template>
  <div class="musicas-page">
    <v-container class="py-16 mt-8">
      <v-row>
        <!-- Coluna Esquerda: Músicas mais bem avaliadas -->
        <v-col cols="12" md="6">
          <h2 class="text-h4 font-weight-bold my-8 text-grey-darken-3">Músicas mais bem avaliadas</h2>
          
          <v-list bg-color="transparent">
            <v-list-item
              v-for="(musica, index) in musicasMaisAvaliadas"
              :key="index"
              class="mb-3 rounded-lg"
              style="background-color: #F5F5F5;"
            >
              <template v-slot:prepend>
                <v-avatar size="60" rounded="lg">
                  <v-img :src="musica.capa" :alt="musica.titulo"></v-img>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium mb-1">
                {{ musica.titulo }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-grey-darken-1">
                {{ musica.artista }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="d-flex align-center">
                  <v-icon color="yellow-darken-2" size="20">mdi-star</v-icon>
                  <span class="ml-1 font-weight-bold">{{ musica.nota }}</span>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Coluna Direita: Ouvidas recentemente -->
        <v-col cols="12" md="6">
          <h2 class="text-h4 font-weight-bold my-8 text-grey-darken-3">Ouvidas recentemente</h2>
          
          <v-list bg-color="transparent">
            <v-list-item
              v-for="(item, index) in ouvidasRecentemente"
              :key="index"
              class="mb-3 rounded-lg"
              style="background-color: #E6E0FF;"
            >
              <template v-slot:prepend>
                <v-avatar size="50">
                  <v-img :src="item.usuarioFoto" :alt="item.usuarioNome"></v-img>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium mb-1">
                {{ item.usuarioNome }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-grey-darken-1 mb-2">
                {{ item.usuarioHandle }}
              </v-list-item-subtitle>
              
              <div class="d-flex align-center mt-1">
                <v-icon size="18" class="mr-1">mdi-music-note</v-icon>
                <span class="text-body-2 text-grey-darken-1">
                  ouvindo {{ item.musica }} - {{ item.artista }}
                </span>
              </div>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Dados mockados para músicas mais bem avaliadas
const musicasMaisAvaliadas = ref([
  {
    titulo: 'White Ferrari',
    artista: 'Frank Ocean',
    nota: '4.5/5',
    capa: 'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526'
  },
  {
    titulo: 'White Inverson',
    artista: 'Post Malone',
    nota: '4.5/5',
    capa: 'https://cdn-images.dzcdn.net/images/cover/0772ed28d5e7d486dd97d7ae4086844e/1900x1900-000000-80-0-0.jpg'
  },
  {
    titulo: 'White Tee (with NO1-NOAH)',
    artista: 'Summer Walk - NO1-NOAH',
    nota: '4.5/5',
    capa: 'https://i1.sndcdn.com/artworks-KxIpfLVbuEg5-0-t500x500.jpg'
  },
  {
    titulo: 'White Teeth Teens',
    artista: 'Lorde',
    nota: '4.5/5',
    capa: 'https://cdn-images.dzcdn.net/images/cover/7bb0b356418fbb275c0c3db7259128d7/1900x1900-000000-80-0-0.jpg'
  },
  {
    titulo: 'White Horse',
    artista: 'Chris Stapleton',
    nota: '4.5/5',
    capa: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6C-h8YmCRO8MUEI6DYhSU3BtQg2RqStGv8A&s'
  },
  {
    titulo: 'White Rabbit',
    artista: 'Jefferson Airplane',
    nota: '4.5/5',
    capa: 'https://cdn-images.dzcdn.net/images/cover/5c17dddbe91f7a40d661a1b8c44527f5/500x500.jpg'
  }
]);

// Dados mockados para ouvidas recentemente
const ouvidasRecentemente = ref([
  {
    usuarioNome: 'Isabella',
    usuarioHandle: '@white',
    usuarioFoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    musica: 'FOOD FOOD',
    artista: 'IRMAS DE PAU'
  },
  {
    usuarioNome: 'White',
    usuarioHandle: '@white',
    usuarioFoto: 'https://i.pravatar.cc/150?img=2',
    musica: 'FOOD FOOD',
    artista: 'IRMAS DE PAU'
  },
  {
    usuarioNome: 'White',
    usuarioHandle: '@white',
    usuarioFoto: 'https://i.pravatar.cc/150?img=3',
    musica: 'FOOD FOOD',
    artista: 'IRMAS DE PAU'
  },
  {
    usuarioNome: 'White',
    usuarioHandle: '@white',
    usuarioFoto: 'https://i.pravatar.cc/150?img=4',
    musica: 'FOOD FOOD',
    artista: 'IRMAS DE PAU'
  }
]);
</script>

<style scoped>
.musicas-page {
  min-height: 100vh;
  background-color: #FFFFFF;
}

.v-list-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.v-list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>