<template>
  <div style="min-height: 100vh;">
    <!-- Área branca para a navbar -->
    <div style="background-color: white; height: 80px; position: fixed; top: 0; left: 0; right: 0; z-index: 1;"></div>
    
    <!-- Conteúdo da página -->
    <div style="background-color: #f8f9fa; min-height: 100vh; padding-top: 80px; position: relative; z-index: 0;">
      <v-container class="py-8">
        <v-row>
          <!-- COLUNA ESQUERDA -->
          <v-col cols="12" md="7">
            <!-- CABEÇALHO DO PERFIL -->
            <div class="d-flex justify-space-between align-center mb-6">
              <div>
                <h1 class="text-h4 font-weight-bold my-8 text-grey-darken-3 mb-1">Perfil de Isabella</h1>
                <p class="text-body-2 text-grey-darken-1">@isa.s</p>
              </div>
              <v-btn color="#EEE8FF" rounded="lg" size="default">Seguir</v-btn>
            </div>

            <!-- ÁLBUNS MAIS OUVIDOS -->
            <div class="mb-8">
              <h2 class="text-h6 font-weight-bold mb-4 text-grey-darken-4">Álbuns mais ouvidos</h2>
              <v-row>
                <v-col v-for="album in albumsOuvidos" :key="album.titulo" cols="4">
                  <v-card hover color="white" rounded="lg" flat class="pa-0">
                    <v-img :src="album.capa" aspect-ratio="1" cover></v-img>
                    <v-card-text class="pa-2">
                      <div class="text-caption text-grey-darken-2">
                        {{ album.titulo }} · {{ album.artista }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- MÚSICAS OUVIDAS RECENTEMENTE -->
            <div class="mb-8">
              <h2 class="text-h6 font-weight-bold mb-4 text-grey-darken-4">Músicas ouvidas recentemente</h2>
              <v-sheet color="white" rounded="lg" class="pa-0">
                <v-list bg-color="transparent" class="py-2">
                  <v-list-item 
                    v-for="(musica, index) in musicasRecentes" 
                    :key="musica.titulo"
                    class="px-4"
                    :class="{ 'mb-0': index < musicasRecentes.length - 1 }"
                  >
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

            <!-- AVALIAÇÕES -->
            <div>
              <h2 class="text-h6 font-weight-bold mb-4 text-grey-darken-4">Avaliações</h2>
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

          <!-- COLUNA DIREITA -->
          <v-col cols="12" md="5">
            <!-- AVATAR E GÊNEROS -->
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

            <!-- ONLINE AGORA -->
            <div>
              <h2 class="text-h6 font-weight-bold mb-4 text-grey-darken-4">Online Agora</h2>
              <v-sheet rounded="xl" color="#EEE8FF" class="pa-4">
                <div v-for="usuario in usuariosOnline" :key="usuario.handle" class="mb-3">
                  <div class="d-flex align-center pa-2">
                    <v-avatar size="48" class="mr-3">
                      <v-img :src="usuario.avatar"></v-img>
                    </v-avatar>
                    
                    <div class="flex-grow-1">
                      <div class="text-body-2 font-weight-bold text-grey-darken-4">
                        {{ usuario.nome }}
                      </div>
                      <div class="text-caption text-grey-darken-1">
                        {{ usuario.handle }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="d-flex align-center ml-2 mt-1">
                    <v-icon icon="mdi-music-note" size="16" class="mr-2 text-grey-darken-2"></v-icon>
                    <div class="text-caption text-grey-darken-2">
                      {{ usuario.ouvindo }}
                    </div>
                  </div>
                </div>

                <div class="text-center mt-4 pt-2">
                  <a href="#" class="text-caption text-grey-darken-2 text-decoration-underline">
                    Adicionar novos Membros
                  </a>
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
import { ref } from 'vue';

const perfilUsuario = ref({
  nome: 'Isabella',
  handle: '@isa.s',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  generosPreferidos: 'pop, eletrônico'
});

const albumsOuvidos = ref([
  { 
    titulo: 'Sabrina Carpenter', 
    artista: 'Short n\' Sweet', 
    capa: 'https://i.scdn.co/image/ab67616d0000b273fd8d7a8d96871e791cb1f626' 
  },
  { 
    titulo: 'Lorde', 
    artista: 'Virgin', 
    capa: 'https://cdn-images.dzcdn.net/images/cover/c3a27407eeeba58aa3cc00e83d55c81a/0x1900-000000-80-0-0.jpg' 
  }
]);

const musicasRecentes = ref([
  { 
    titulo: 'Venice Bitch - Lana Del Rey', 
    artista: 'Lana Del Rey',
    capa: 'https://cdn-images.dzcdn.net/images/cover/c0f4f022fa51f13e877aae2e758e241d/1900x1900-000000-80-0-0.jpg' 
  },
  { 
    titulo: 'Shapeshifter - Lorde', 
    artista: 'Lorde',
    capa: 'https://cdn-images.dzcdn.net/images/cover/c3a27407eeeba58aa3cc00e83d55c81a/0x1900-000000-80-0-0.jpg' 
  },
  { 
    titulo: 'New Romantics - Taylor Swift', 
    artista: 'Taylor Swift',
    capa: 'https://cdn-images.dzcdn.net/images/cover/8c39b232a5edecdf5fffc14f551fa42b/0x1900-000000-80-0-0.jpg' 
  }
]);

const avaliacoes = ref([
  {
    musica: { 
      titulo: 'Billie Jean', 
      artista: 'Michael Jackson', 
      capa: 'https://cdn-images.dzcdn.net/images/cover/544862aa5be45bc82ad4ab1a14daf63a/1900x1900-000000-80-0-0.jpg' 
    },
    titulo: 'A batida que mudou a história do pop',
    comentario: 'Produção visionária, linha de baixo icônica e performance magnética. Se há uma crítica possível, é que a narrativa lírica...',
    likes: 117
  },
  {
    musica: { 
      titulo: 'Billie Jean', 
      artista: 'Michael Jackson', 
      capa: 'https://cdn-images.dzcdn.net/images/cover/544862aa5be45bc82ad4ab1a14daf63a/1900x1900-000000-80-0-0.jpg' 
    },
    titulo: 'A batida que mudou a história do pop',
    comentario: 'Produção visionária, linha de baixo icônica e performance magnética. Se há uma crítica possível, é que a narrativa lírica...',
    likes: 117
  }
]);

const usuariosOnline = ref([
  { 
    nome: 'White', 
    handle: '@white', 
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    ouvindo: 'ouvindo FOOD FOOD - IRMAS DE PAU'
  },
  { 
    nome: 'White', 
    handle: '@white', 
    avatar: 'https://randomuser.me/api/portraits/women/46.jpg',
    ouvindo: 'ouvindo FOOD FOOD - IRMAS DE PAU'
  },
  { 
    nome: 'White', 
    handle: '@white', 
    avatar: 'https://randomuser.me/api/portraits/men/47.jpg',
    ouvindo: 'ouvindo FOOD FOOD - IRMAS DE PAU'
  },
  { 
    nome: 'White', 
    handle: '@white', 
    avatar: 'https://randomuser.me/api/portraits/women/48.jpg',
    ouvindo: 'ouvindo FOOD FOOD - IRMAS DE PAU'
  }
]);
</script>

<style scoped>
</style>