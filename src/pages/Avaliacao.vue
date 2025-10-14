<template>
  <div style="min-height: 100vh">
    <!-- Para o conteúdo ficar em baixo da navbar -->

    <v-main class="bg-grey-lighten-4">
      <!-- Cor de fundo da página -->

      <!-- Seção de introdução -->
      <v-container class="py-8">
        <v-row justify="center" align="start">
          <!-- Música -->
          <v-col cols="12" md="4" lg="3">
            <v-img
              src="https://i.scdn.co/image/ab67616d00001e028863bc11d2aa12b54f5aeb36"
              alt="Capa do Música After Hours"
              aspect-ratio="1"
              rounded="lg"
              class="mb-4"
              cover
            >
              <template #placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="primary" />
                </v-row>
              </template>
            </v-img>
            <div class="d-flex flex-column align-center">
              <h1 class="text-h4 font-weight-bold mb-2">After Hours</h1>
              <h2 class="text-h6 text-grey-darken-1 mb-4">The Weeknd</h2>
              <v-btn
                prepend-icon="mdi-spotify"
                variant="flat"
                class="text-none"
                rounded="lg"
                color="#1DB954"
                size="large"
                block
              >
                Escutar no Spotify
              </v-btn>
            </div>
          </v-col>

          <!-- informações de avaliações da música -->
          <v-col cols="12" md="8" lg="6">
            <v-card rounded="xl" elevation="2" class="pa-6 mb-4">
              <v-row class="text-center">
                <v-col cols="4">
                  <div class="d-flex flex-column align-center">
                    <v-icon
                      icon="mdi-comment-text"
                      color="grey"
                      size="32"
                      class="mb-2"
                    />
                    <h3 class="text-h5 font-weight-bold">2,923</h3>
                    <p class="text-grey text-body-2">Avaliações</p>
                  </div>
                </v-col>

                <v-col cols="4">
                  <div class="d-flex flex-column align-center">
                    <v-icon
                      icon="mdi-star"
                      color="orange"
                      size="32"
                      class="mb-2"
                    />
                    <h3 class="text-h5 font-weight-bold">4.5/5</h3>
                    <p class="text-grey text-body-2">Média geral</p>
                  </div>
                </v-col>

                <v-col cols="4">
                  <div class="d-flex flex-column align-center">
                    <v-icon
                      icon="mdi-star-outline"
                      color="grey"
                      size="32"
                      class="mb-2"
                    />
                    <h3 class="text-h5 font-weight-bold">--</h3>
                    <p class="text-grey text-body-2">Sua avaliação</p>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <div class="text-center">
                <v-btn
                  class="text-none"
                  rounded="lg"
                  size="large"
                  color="#EEE8FF"
                  variant="flat"
                  prepend-icon="mdi-pencil"
                >
                  Escrever avaliação
                </v-btn>
              </div>
            </v-card>

            <!-- Detalhes música -->
            <v-card rounded="xl" elevation="2" class="pa-6">
              <h3 class="text-h6 font-weight-bold mb-4">Detalhes</h3>

              <v-row dense>
                <v-col cols="12" sm="6">
                  <div class="mb-3">
                    <p class="text-grey text-caption mb-1">Duração</p>
                    <p class="font-weight-medium">6 minutos, 2 segundos</p>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="mb-3">
                    <p class="text-grey text-caption mb-1">Lançamento</p>
                    <p class="font-weight-medium">20 de Março, 2020</p>
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="mb-3">
                    <p class="text-grey text-caption mb-1">Idioma</p>
                    <p class="font-weight-medium">Inglês</p>
                  </div>
                </v-col>

                <v-col cols="12">
                  <div>
                    <p class="text-grey text-caption mb-1">Compositores</p>
                    <p class="font-weight-medium">
                      Jason "DaHeala" Quenneville, Mario Winans, Abel "The
                      Weeknd" Tesfaye, Ahmad Balshe, Carlo "Illangelo"
                      Montagnese
                    </p>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- comentários/avaliações -->
      <v-container class="py-8">
        <v-row justify="center">
          <v-col cols="12" lg="9">
            <h2 class="text-h4 font-weight-bold mb-6">Avaliações</h2>

            <v-card rounded="xl" elevation="2" class="mb-4">
              <v-card-text class="pa-6">
                <div class="d-flex align-start">
                  <v-avatar size="56" class="mr-4">
                    <v-img
                      src="https://randomuser.me/api/portraits/men/1.jpg"
                      alt="Avatar do usuário"
                    />
                  </v-avatar>

                  <div class="flex-grow-1">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <div>
                        <h3 class="text-h6 font-weight-bold">João Silva</h3>
                        <p class="text-grey text-caption">Há 2 dias</p>
                      </div>
                      <v-btn
                        variant="outlined"
                        color="EEE8FF"
                        class="text-none"
                        rounded="lg"
                      >
                        Seguir
                      </v-btn>
                    </div>

                    <div class="mb-2">
                      <v-rating
                        :model-value="4.5"
                        color="amber"
                        half-increments
                        readonly
                        size="small"
                      />
                    </div>

                    <p class="text-body-1">
                      Uma obra-prima do The Weeknd! A produção é impecável e as
                      letras são profundas. Definitivamente um dos melhores
                      álbuns dos últimos anos. Altamente recomendado para quem
                      aprecia música de qualidade.
                    </p>

                    <div class="d-flex gap-2 mt-3">
                      <v-btn variant="text" size="small" class="text-none">
                        <v-icon start>mdi-heart-outline</v-icon>
                        Curtir (200)
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-card rounded="xl" elevation="2" class="mb-4">
              <v-card-text class="pa-6">
                <div class="d-flex align-start">
                  <v-avatar size="56" class="mr-4">
                    <v-img
                      src="https://randomuser.me/api/portraits/women/2.jpg"
                      alt="Avatar do usuário"
                    />
                  </v-avatar>

                  <div class="flex-grow-1">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <div>
                        <h3 class="text-h6 font-weight-bold">Maria Santos</h3>
                        <p class="text-grey text-caption">Há 5 dias</p>
                      </div>
                      <v-btn
                        variant="outlined"
                        color="EEE8FF"
                        class="text-none"
                        rounded="lg"
                      >
                        Seguir
                      </v-btn>
                    </div>

                    <div class="mb-2">
                      <v-rating
                        :model-value="5"
                        color="amber"
                        readonly
                        size="small"
                      />
                    </div>

                    <p class="text-body-1">
                      Simplesmente perfeito! Cada faixa é única e mostra a
                      evolução artística do The Weeknd. A atmosfera sombria
                      combinada com melodias cativantes cria uma experiência
                      auditiva inesquecível.
                    </p>

                    <div class="d-flex gap-2 mt-3">
                      <v-btn variant="text" size="small" class="text-none">
                        <v-icon start>mdi-heart-outline</v-icon>
                        Curtir (200)
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <div class="text-center mt-6">
              <v-btn
                variant="outlined"
                class="text-none"
                rounded="lg"
                size="large"
              >
                Carregar mais avaliações
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script setup></script>

<style scoped></style>
