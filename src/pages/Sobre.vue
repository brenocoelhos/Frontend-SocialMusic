<template>
  <div class="sobre-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <v-container>
        <div class="text-center py-16">
          <h1 class="text-h2 font-weight-bold mb-6 text-primary"style= "padding-top: 50px;" >Sobre o SocialMusic</h1>
          <p class="text-h5 mb-8 text-grey-darken-1 mx-auto" style="max-width: 800px;">
            Uma plataforma criada por estudantes de Ciência da Computação com o sonho de revolucionar 
            a forma como compartilhamos e descobrimos música.
          </p>
        </div>
      </v-container>
    </section>

     <section class="fundadores-section py-16">
      <v-container>
        <div class="text-center mb-12">
          <h2 class="text-h3 font-weight-bold mb-4 text-primary">Quem são os fundadores</h2>
          <p class="text-h6 text-grey-darken-1">
            Estudantes apaixonados por tecnologia e música
          </p>
        </div>

        <!-- Fundadores Section -->

        <v-row justify="center">
          <v-col cols="12" sm="6" md="4" lg="3" v-for="fundador in fundadores" :key="fundador.nome">
            <v-card class="fundador-card mx-auto" max-width="280" elevation="8" rounded="xl">
              <div class="pa-6 text-center">
                <v-avatar size="120" class="mb-4" style="border: 4px solid #B39DDB;">
                  <v-img :src="fundador.foto" :alt="`Foto de ${fundador.nome}`" cover></v-img>
                </v-avatar>
                
                <h3 class="text-h5 font-weight-bold mb-2 text-primary">{{ fundador.nome }}</h3>
                <p class="text-body-2 text-grey-darken-1 mb-4">{{ fundador.cargo }}</p>
                
                <div class="social-links">
                  <v-btn 
                    v-for="social in fundador.socials" 
                    :key="social.tipo"
                    :icon="social.icon" 
                    :href="social.url"
                    target="_blank"
                    variant="flat"
                    :color="social.color"
                    size="small"
                    class="ma-1"
                  ></v-btn>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Missão Section -->
    <section class="missao-section py-16" style="background-color: #f8f9fa;">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6">
            <h2 class="text-h3 font-weight-bold mb-6 text-primary">Nossa Missão</h2>
            <p class="text-h6 mb-4 text-grey-darken-2">
              Criar uma <strong>comunidade vibrante</strong> onde amigos podem compartilhar suas opiniões 
              sobre músicas, descobrir novos artistas e conectar-se através da paixão musical.
            </p>
            <p class="text-body-1 text-grey-darken-1">
              Acreditamos que a música é uma linguagem universal que nos une. No SocialMusic, 
              você pode avaliar suas faixas favoritas, ler resenhas de amigos e descobrir 
              gems musicais que talvez nunca encontraria sozinho.
            </p>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-center">
              <v-icon size="200" color="primary" class="mb-4">mdi-music-circle</v-icon>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>
   
    <!-- Call to Action -->
    <section class="cta-section py-16 text-center" style="background: linear-gradient(135deg, #B39DDB 0%, #9575CD 100%);">
      <v-container>
        <h2 class="text-h3 font-weight-bold mb-4 text-white">Faça Parte da Nossa Comunidade</h2>
        <p class="text-h6 mb-8 text-white opacity-90">
          Junte-se a milhares de usuários que já compartilham sua paixão musical conosco
        </p>
        <v-btn 
          size="x-large" 
          variant="flat" 
          color="white" 
          class="text-primary font-weight-bold"
          @click="goHome"
          rounded="lg"
        >
          Começar Agora
          <v-icon right class="ml-2">mdi-arrow-right</v-icon>
        </v-btn>
      </v-container>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import brenoImg from '@/assets/team/brenocoelho.png';

const router = useRouter();

const fundadores = ref([
  {
    nome: 'Breno Coelho',
    cargo: 'Backend Developer',
    foto: brenoImg,
    socials: [
      { tipo: 'linkedin', icon: 'mdi-linkedin', url: '#', color: '#0077B5' },
      { tipo: 'github', icon: 'mdi-github', url: '#', color: '#333' }
    ]
  },
  {
    nome: 'Isabella Barbosa',
    cargo: 'Backend Developer',
    foto: 'https://i.pravatar.cc/300?img=8',
    socials: [
      { tipo: 'linkedin', icon: 'mdi-linkedin', url: '#', color: '#0077B5' },
      { tipo: 'github', icon: 'mdi-github', url: '#', color: '#333' }
    ]
  },
  {
    nome: 'Pedro Maciel',
    cargo: 'Backend Developer',
    foto: 'https://i.pravatar.cc/300?img=8',
    socials: [
      { tipo: 'linkedin', icon: 'mdi-linkedin', url: '#', color: '#0077B5' },
      { tipo: 'github', icon: 'mdi-github', url: '#', color: '#333' }
    ]
  }

]);


function goHome() {
  router.push('/');
}
</script>

<style scoped>
.sobre-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #EEE8FF 0%, #E1D8FF 100%);
}

.fundador-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.fundador-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.tech-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tech-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.social-links .v-btn {
  transition: transform 0.2s ease;
}

.social-links .v-btn:hover {
  transform: scale(1.1);
}

/* Animações suaves */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fundador-card {
  animation: fadeInUp 0.6s ease forwards;
}

.fundador-card:nth-child(1) { animation-delay: 0.1s; }
.fundador-card:nth-child(2) { animation-delay: 0.2s; }
.fundador-card:nth-child(3) { animation-delay: 0.3s; }
.fundador-card:nth-child(4) { animation-delay: 0.4s; }

/* Responsividade */
@media (max-width: 960px) {
  .text-h2 {
    font-size: 2.5rem !important;
  }
  
  .text-h3 {
    font-size: 2rem !important;
  }
  
  .py-16 {
    padding-top: 4rem !important;
    padding-bottom: 4rem !important;
  }
}

@media (max-width: 600px) {
  .text-h2 {
    font-size: 2rem !important;
  }
  
  .text-h3 {
    font-size: 1.5rem !important;
  }
  
  .text-h5 {
    font-size: 1.25rem !important;
  }
}
</style>