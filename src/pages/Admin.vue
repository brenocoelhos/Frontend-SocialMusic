<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" class="mb-6">
        <h1 class="text-h3 font-weight-bold mb-2">Painel Administrativo</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Gerencie usuários, músicas e conteúdo do site</p>
      </v-col>
    </v-row>

    <v-row>
      <!-- Cards de Estatísticas -->
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
      <!-- Lista de Usuários -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="text-h5">
            Usuários Recentes
            <v-spacer></v-spacer>
            <v-text-field
              v-model="searchUsers"
              append-icon="mdi-magnify"
              label="Buscar usuários"
              single-line
              hide-details
              density="compact"
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
                    <v-chip
                      :color="user.ativo ? 'success' : 'error'"
                      size="small"
                    >
                      {{ user.ativo ? 'Ativo' : 'Inativo' }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn
                      icon="mdi-pencil"
                      variant="text"
                      size="small"
                      color="primary"
                      @click="editUser(user)"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      size="small"
                      color="error"
                      @click="deleteUser(user)"
                    ></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Últimas Atividades -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="text-h5">Últimas Atividades</v-card-title>
          <v-card-text>
            <v-timeline density="compact">
              <v-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :dot-color="activity.color"
                size="small"
              >
                <div class="d-flex justify-space-between">
                  <div>
                    <div class="text-subtitle-2">{{ activity.title }}</div>
                    <div class="text-caption">{{ activity.description }}</div>
                  </div>
                  <div class="text-caption">{{ activity.time }}</div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal de Edição de Usuário -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>Editar Usuário</v-card-title>
        <v-card-text>
          <v-form ref="editForm">
            <v-text-field
              v-model="editedUser.nome"
              label="Nome"
              required
            ></v-text-field>
            <v-text-field
              v-model="editedUser.email"
              label="Email"
              required
            ></v-text-field>
            <v-switch
              v-model="editedUser.ativo"
              label="Usuário Ativo"
            ></v-switch>
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/socialmusic_backend';

// Estatísticas
const totalUsers = ref(0); // Começa em 0
const totalSongs = ref(432); // Mockado
const totalReviews = ref(1287); // Mockado
const totalComments = ref(3456); // Mockado

// Controle de usuários
const users = ref([]); // Começa vazio
const searchUsers = ref('');
const editDialog = ref(false);
const editedUser = ref({});
const loading = ref(true); // Estado de carregamento

const filteredUsers = computed(() => {
  return users.value.filter(user =>
    user.nome.toLowerCase().includes(searchUsers.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUsers.value.toLowerCase())
  );
});

// Atividades recentes (continua mockado por enquanto)
const recentActivities = ref([
  { id: 1, title: 'Novo usuário registrado', description: 'João Silva criou uma conta', time: '5 minutos atrás', color: 'primary' },
  { id: 2, title: 'Nova avaliação', description: 'Maria avaliou "Bohemian Rhapsody"', time: '10 minutos atrás', color: 'success' },
  { id: 3, title: 'Comentário reportado', description: 'Comentário marcado como inadequado', time: '30 minutos atrás', color: 'error' }
]);

// Funções
function editUser(user) {
  editedUser.value = { ...user };
  editDialog.value = true;
}

async function deleteUser(user) {
  if (confirm(`Tem certeza que deseja excluir o usuário ${user.nome}?`)) {
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
      console.error('Erro ao excluir usuário:', error);
      alert('Não foi possível conectar à API.');
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
      if (index !== -1) {
        users.value[index] = { ...editedUser.value };
      }
      editDialog.value = false;
    } else {
       alert(`Erro: ${data.mensagem}`);
    }
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    alert('Não foi possível conectar à API.');
  }
}

// Carregar dados iniciais
onMounted(async () => {
  loading.value = true;
  try {
    const res = await fetch(`${API_URL}/api/admin/dashboard.php`, {
      credentials: 'include' // Essencial para enviar o cookie de sessão
    });

    if (!res.ok) {
       if (res.status === 403) {
         console.error('Acesso negado. A sessão pode ter expirado.');
         // O router.beforeEach (index.js) já deve ter tratado o redirecionamento
       }
       throw new Error(`Erro HTTP: ${res.status}`);
    }

    const data = await res.json();

    if (data.sucesso) {
      // Atualiza todos os refs com os dados REAIS da API
      totalUsers.value = data.stats.totalUsers;
      totalSongs.value = data.stats.totalSongs;
      totalReviews.value = data.stats.totalReviews;
      totalComments.value = data.stats.totalComments;

      users.value = data.users;
    }

  } catch (error) {
    console.error('Erro ao carregar dados do painel:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.v-table {
  max-height: 400px;
  overflow-y: auto;
}
</style>
