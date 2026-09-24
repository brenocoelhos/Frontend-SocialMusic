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
            <div class="text-h4 text-white mb-2">{{ totalReports }}</div>
            <div class="text-subtitle-1 text-white">Denúncias pendentes</div>
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

    <v-row class="mt-6">
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5 d-flex justify-space-between align-center">
            <span>Denúncias pendentes</span>
            <v-chip :color="totalReports > 0 ? 'warning' : 'success'" size="small">
              {{ totalReports }} pendente{{ totalReports === 1 ? '' : 's' }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div v-if="pendingReports.length === 0" class="text-center py-8 text-grey">
              Nenhuma denúncia pendente.
            </div>

            <v-table v-else>
              <thead>
                <tr>
                  <th>Autor da avaliação</th>
                  <th>Música</th>
                  <th>Motivo</th>
                  <th>Denunciante</th>
                  <th>Comentário denunciado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="report in pendingReports" :key="report.id">
                  <td>
                    <div class="font-weight-medium">{{ report.autor_nome }}</div>
                    <div class="text-caption text-grey">Avaliação #{{ report.avaliacao_id }}</div>
                  </td>

                  <td>
                    <div>{{ report.musica_titulo }}</div>
                    <div class="text-caption text-grey">{{ report.musica_artista }}</div>
                  </td>

                  <td>
                    <v-chip color="warning" size="small">
                      {{ formatReportReason(report.motivo) }}
                    </v-chip>
                    <div v-if="report.descricao" class="text-caption mt-1" style="max-width: 220px; white-space: normal;">
                      {{ report.descricao }}
                    </div>
                  </td>

                  <td>
                    <div>{{ report.denunciante_nome }}</div>
                    <div class="text-caption text-grey">
                      {{ formatTimeAgo(report.data_criacao) }}
                    </div>
                  </td>

                  <td style="max-width: 320px; white-space: normal;">
                    <div v-if="report.avaliacao_titulo" class="font-weight-medium mb-1">
                      {{ report.avaliacao_titulo }}
                    </div>
                    <div>{{ report.comentario || 'Sem comentário.' }}</div>
                    <div v-if="report.total_denuncias_avaliacao > 1" class="text-caption text-warning mt-1">
                      Esta avaliação possui {{ report.total_denuncias_avaliacao }} denúncias pendentes.
                    </div>
                  </td>

                  <td style="white-space: nowrap;">
                    <v-btn
                      variant="text"
                      size="small"
                      color="grey-darken-1"
                      class="text-none mr-2"
                      :loading="reportActionLoadingId === report.id"
                      @click="ignoreReport(report)"
                    >
                      Ignorar
                    </v-btn>
                    <v-btn
                      variant="flat"
                      size="small"
                      color="error"
                      class="text-none"
                      :loading="reportActionLoadingId === report.id"
                      @click="deleteReportedReview(report)"
                    >
                      Excluir avaliação
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
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
import { API_URL } from '@/config/api';

// Dados
const totalUsers = ref(0);
const totalSongs = ref(0);
const totalReviews = ref(0);
const totalReports = ref(0);
const users = ref([]);
const recentActivities = ref([]); // Agora começa vazio e é preenchido pela API
const pendingReports = ref([]);
const reportActionLoadingId = ref(null);
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
  if (tipo === 'new_report') return 'warning';
  return 'grey';
}

function getActivityIcon(tipo) {
  if (tipo === 'new_user') return 'mdi-account-plus';
  if (tipo === 'new_review') return 'mdi-star';
  if (tipo === 'new_report') return 'mdi-flag';
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

function formatReportReason(motivo) {
  const motivos = {
    spam: 'Spam',
    ofensa: 'Ofensa ou assédio',
    odio: 'Discurso de ódio',
    ameaca: 'Ameaça ou violência',
    conteudo_ilegal: 'Conteúdo ilegal',
    outro: 'Outro'
  };

  return motivos[motivo] || motivo;
}

async function ignoreReport(report) {
  if (!confirm('Deseja ignorar esta denúncia e marcá-la como rejeitada?')) {
    return;
  }

  reportActionLoadingId.value = report.id;

  try {
    const res = await fetch(`${API_URL}/api/admin/denuncia_update.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        denuncia_id: report.id,
        status: 'rejeitada'
      })
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) {
      alert(data.mensagem || 'Erro ao atualizar a denúncia.');
      return;
    }

    await loadDashboard();
  } catch (error) {
    console.error('Erro ao ignorar denúncia:', error);
    alert('Erro ao atualizar a denúncia.');
  } finally {
    reportActionLoadingId.value = null;
  }
}

async function deleteReportedReview(report) {
  if (!confirm(`Tem certeza que deseja excluir a avaliação de ${report.autor_nome}?`)) {
    return;
  }

  reportActionLoadingId.value = report.id;

  try {
    const res = await fetch(`${API_URL}/api/admin/avaliacao_delete.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ avaliacao_id: report.avaliacao_id })
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) {
      alert(data.mensagem || 'Erro ao excluir a avaliação.');
      return;
    }

    await loadDashboard();
  } catch (error) {
    console.error('Erro ao excluir avaliação denunciada:', error);
    alert('Erro ao excluir a avaliação.');
  } finally {
    reportActionLoadingId.value = null;
  }
}

// Carregar dados do painel
async function loadDashboard() {
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
      totalReports.value = data.stats.totalReports || 0;
      users.value = data.users || [];
      recentActivities.value = data.activities || [];
      pendingReports.value = data.reports || [];
    }
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(loadDashboard);
</script>