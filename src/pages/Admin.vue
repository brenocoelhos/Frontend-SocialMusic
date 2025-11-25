<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" class="mb-6">
        <h1 class="text-h3 font-weight-bold mb-2">Painel Administrativo</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Gerencie usuários, músicas e conteúdo do site</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="3">
        <v-card class="mx-auto" color="primary">
          <v-card-text>
            <div class="text-h4 text-white mb-2">{{ totalUsers }}</div>
            <div class="text-subtitle-1 text-white">Usuários Registrados</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="mx-auto" color="success">
          <v-card-text>
            <div class="text-h4 text-white mb-2">{{ totalSongs }}</div>
            <div class="text-subtitle-1 text-white">Músicas Cadastradas</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="mx-auto" color="info">
          <v-card-text>
            <div class="text-h4 text-white mb-2">{{ totalReviews }}</div>
            <div class="text-subtitle-1 text-white">Avaliações</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="mx-auto" color="warning">
          <v-card-text>
            <div class="text-h4 text-white mb-2">{{ totalComments }}</div>
            <div class="text-subtitle-1 text-white">Comentários</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col cols="12" md="7">
        <v-card>
          <v-card-title class="text-h5 d-flex justify-space-between align-center">
            <span>Usuários Recentes</span>
            <v-text-field
              v-model="searchUsers"
              append-icon="mdi-magnify"
              label="Buscar"
              single-line
              hide-details
              density="compact"
              style="max-width: 200px;"
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>{{ user.nome }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <v-chip :color="user.ativo ? 'success' : 'error'" size="small">
                      {{ user.ativo ? 'Ativo' : 'Inativo' }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="editUser(user)"></v-btn>
                    <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="deleteUser(user)"></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card height="100%">
          <v-card-title class="text-h5">Atividade em Tempo Real</v-card-title>
          <v-card-text>
            
            <div v-if="recentActivities.length === 0" class="text-center py-4 text-grey">
              Nenhuma atividade recente.
            </div>

            <v-timeline v-else density="compact" side="end">
              <v-timeline-item
                v-for="(activity, index) in recentActivities"
                :key="index"
                :dot-color="getActivityColor(activity.tipo)"
                :icon="getActivityIcon(activity.tipo)"
                size="small"
              >
                <div class="d-flex justify-space-between align-start">
                  <div>
                    <div class="text-subtitle-2 font-weight-bold">{{ activity.titulo }}</div>
                    <div class="text-caption text-grey-darken-1">{{ activity.descricao }}</div>
                  </div>
                  <div class="text-caption text-grey ml-2" style="white-space: nowrap;">
                    {{ formatTimeAgo(activity.data) }}
                  </div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
      </v-row>

    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>Editar Usuário</v-card-title>
        <v-card-text>
          <v-form ref="editForm">
            <v-text-field v-model="editedUser.nome" label="Nome" required></v-text-field>
            <v-text-field v-model="editedUser.email" label="Email" required></v-text-field>
            <v-switch v-model="editedUser.ativo" label="Usuário Ativo" color="success"></v-switch>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="editDialog = false">Cancelar</v-btn>
          <v-btn color="primary" text @click="saveUser">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmusic.onrender.com';

// Dados
const totalUsers = ref(0);
const totalSongs = ref(0);
const totalReviews = ref(0);
const totalComments = ref(0);
const users = ref([]);
const recentActivities = ref([]); // Agora começa vazio e é preenchido pela API
const searchUsers = ref('');
const editDialog = ref(false);
const editedUser = ref({});
const loading = ref(true);

const filteredUsers = computed(() => {
  return users.value.filter(user =>
    user.nome.toLowerCase().includes(searchUsers.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUsers.value.toLowerCase())
  );
});

// Funções Auxiliares para as Atividades
function getActivityColor(tipo) {
  if (tipo === 'new_user') return 'primary';
  if (tipo === 'new_review') return 'success';
  return 'grey';
}

function getActivityIcon(tipo) {
  if (tipo === 'new_user') return 'mdi-account-plus';
  if (tipo === 'new_review') return 'mdi-star';
  return 'mdi-circle';
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'agora';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`;
  return `${Math.floor(diffInSeconds / 86400)} dias`;
}

// Funções de CRUD (Usuários)
function editUser(user) {
  editedUser.value = { ...user };
  editDialog.value = true;
}

async function deleteUser(user) {
  if (confirm(`Tem certeza que deseja excluir ${user.nome}?`)) {
    try {
      const res = await fetch(`${API_URL}/api/admin/usuario_delete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: user.id })
      });
      const data = await res.json();
      if (data.sucesso) {
        users.value = users.value.filter(u => u.id !== user.id);
        totalUsers.value--;
      } else {
        alert(`Erro: ${data.mensagem}`);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

async function saveUser() {
  try {
    const res = await fetch(`${API_URL}/api/admin/usuario_update.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(editedUser.value)
    });
    const data = await res.json();
    if (data.sucesso) {
      const index = users.value.findIndex(u => u.id === editedUser.value.id);
      if (index !== -1) users.value[index] = { ...editedUser.value };
      editDialog.value = false;
    } else {
       alert(`Erro: ${data.mensagem}`);
    }
  } catch (error) {
    console.error(error);
  }
}

// Carregar Dados
onMounted(async () => {
  loading.value = true;
  try {
    const res = await fetch(`${API_URL}/api/admin/dashboard.php`, {
      credentials: 'include'
    });

    if (!res.ok) {
       if (res.status === 403) console.error('Acesso negado.');
       throw new Error(`Erro HTTP: ${res.status}`);
    }

    const data = await res.json();

    if (data.sucesso) {
      totalUsers.value = data.stats.totalUsers;
      totalSongs.value = data.stats.totalSongs;
      totalReviews.value = data.stats.totalReviews;
      totalComments.value = data.stats.totalComments;
      users.value = data.users;
      
      // Preenche as atividades com os dados reais
      recentActivities.value = data.activities;
    }

  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  } finally {
    loading.value = false;
  }
});
</script>