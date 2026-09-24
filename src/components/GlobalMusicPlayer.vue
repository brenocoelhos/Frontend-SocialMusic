<template>
  <transition name="global-player">
    <aside
      v-if="player.visible && player.youtubeId"
      class="global-player-shell"
      :class="{ 'global-player-shell--expanded': !player.compact }"
      aria-label="Player de música do SocialMusic"
    >
      <v-card class="global-player-card" elevation="12" rounded="xl">
        <div class="global-player-header pa-3">
          <div class="d-flex align-center min-width-0">
            <v-avatar rounded="lg" size="46" class="mr-3 flex-shrink-0">
              <v-img v-if="player.imageUrl" :src="player.imageUrl" :alt="player.trackName" cover />
              <v-icon v-else icon="mdi-music" size="28" color="grey" />
            </v-avatar>

            <div class="min-width-0">
              <div class="text-body-2 font-weight-bold text-truncate">
                {{ player.trackName || 'Reprodução atual' }}
              </div>
              <div class="text-caption text-grey-darken-1 text-truncate">
                {{ player.artistName }}
              </div>
            </div>
          </div>

          <div class="d-flex align-center ml-2 flex-shrink-0">
            <v-btn
              :icon="player.compact ? 'mdi-arrow-expand' : 'mdi-arrow-collapse'"
              variant="text"
              size="small"
              :aria-label="player.compact ? 'Ampliar player' : 'Recolher player'"
              @click="toggleCompact"
            />
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              aria-label="Fechar player"
              @click="handleClose"
            />
          </div>
        </div>

        <div v-if="player.restored && !player.active" class="resume-panel pa-4 text-center">
          <v-icon icon="mdi-youtube" color="red" size="42" class="mb-2" />
          <div class="text-body-2 font-weight-medium mb-1">Continuar ouvindo?</div>
          <div class="text-caption text-grey-darken-1 mb-3">
            A música anterior foi restaurada. A reprodução só continua após seu clique.
          </div>
          <v-btn
            color="red"
            variant="flat"
            rounded="lg"
            class="text-none"
            prepend-icon="mdi-play"
            @click="resumeRestoredPlayer"
          >
            Continuar reprodução
          </v-btn>
        </div>

        <div v-show="player.active" class="youtube-stage">
          <iframe
            v-if="iframeSrc"
            ref="iframeRef"
            class="youtube-iframe"
            :src="iframeSrc"
            :title="`Reproduzindo ${player.trackName} de ${player.artistName} no YouTube`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>

        <div class="global-player-footer px-3 py-2 d-flex align-center justify-space-between">
          <div class="d-flex align-center text-caption text-grey-darken-1">
            <v-icon icon="mdi-youtube" color="red" size="18" class="mr-1" />
            Player do YouTube
          </div>

          <v-btn
            v-if="player.spotifyUrl"
            :href="player.spotifyUrl"
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            size="small"
            class="text-none"
            prepend-icon="mdi-spotify"
            color="#1DB954"
          >
            Spotify
          </v-btn>
        </div>
      </v-card>
    </aside>
  </transition>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useGlobalPlayer } from '@/composables/useGlobalPlayer';

const {
  player,
  closePlayer,
  resumeRestoredPlayer,
  setPlaybackState,
  setCurrentTime,
  toggleCompact,
} = useGlobalPlayer();

const iframeRef = ref(null);
const iframeSrc = ref('');
let ytPlayer = null;
let controlledVideoId = '';
let progressTimer = null;
let attaching = false;

function buildEmbedUrl(videoId, startSeconds = 0) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams({
    enablejsapi: '1',
    autoplay: '1',
    playsinline: '1',
    rel: '0',
    origin,
  });

  const start = Math.max(0, Math.floor(Number(startSeconds) || 0));
  if (start > 0) params.set('start', String(start));

  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
}

function loadYouTubeIframeApi() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Janela indisponível.'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (window.__socialMusicYouTubeApiPromise) return window.__socialMusicYouTubeApiPromise;

  window.__socialMusicYouTubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === 'function') previousReady();
      resolve(window.YT);
    };

    let script = document.querySelector('script[data-socialmusic-youtube-api="true"]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.socialmusicYoutubeApi = 'true';
      script.onerror = () => reject(new Error('Falha ao carregar a API do YouTube.'));
      document.head.appendChild(script);
    }
  });

  return window.__socialMusicYouTubeApiPromise;
}

function clearProgressTimer() {
  if (progressTimer) {
    window.clearInterval(progressTimer);
    progressTimer = null;
  }
}

function persistCurrentTime(force = false) {
  if (!ytPlayer?.getCurrentTime) return;
  try {
    const seconds = ytPlayer.getCurrentTime();
    if (Number.isFinite(seconds)) setCurrentTime(seconds, force);
  } catch (_) {
    // O player pode estar sendo destruído durante uma troca de rota/fechamento.
  }
}

function startProgressTimer() {
  clearProgressTimer();
  progressTimer = window.setInterval(() => persistCurrentTime(false), 5000);
}

function onPlayerStateChange(event) {
  const state = window.YT?.PlayerState;
  if (!state) return;

  if (event.data === state.PLAYING) {
    setPlaybackState('playing');
    startProgressTimer();
  } else if (event.data === state.PAUSED) {
    setPlaybackState('paused');
    clearProgressTimer();
    persistCurrentTime(true);
  } else if (event.data === state.BUFFERING) {
    setPlaybackState('buffering');
  } else if (event.data === state.ENDED) {
    setPlaybackState('ended');
    clearProgressTimer();
    setCurrentTime(0, true);
  }
}

async function attachApiToIframe() {
  if (!player.active || !player.youtubeId || !iframeRef.value || attaching) return;
  attaching = true;

  try {
    await loadYouTubeIframeApi();
    await nextTick();
    if (!player.active || !iframeRef.value) return;

    if (ytPlayer) {
      try {
        ytPlayer.destroy();
      } catch (_) {}
      ytPlayer = null;
    }

    controlledVideoId = player.youtubeId;
    ytPlayer = new window.YT.Player(iframeRef.value, {
      events: {
        onReady: () => {
          setPlaybackState('ready');
        },
        onStateChange: onPlayerStateChange,
        onAutoplayBlocked: () => {
          setPlaybackState('blocked');
        },
        onError: () => {
          setPlaybackState('error');
        },
      },
    });
  } catch (error) {
    console.warn('Não foi possível inicializar o player global do YouTube:', error);
    setPlaybackState('error');
  } finally {
    attaching = false;
  }
}

async function createOrLoadPlayer() {
  if (!player.active || !player.youtubeId) return;

  if (!ytPlayer || !iframeRef.value) {
    iframeSrc.value = buildEmbedUrl(player.youtubeId, player.currentTime);
    controlledVideoId = player.youtubeId;
    await nextTick();
    await attachApiToIframe();
    return;
  }

  try {
    if (controlledVideoId !== player.youtubeId) {
      controlledVideoId = player.youtubeId;
      setCurrentTime(0, true);
      ytPlayer.loadVideoById({ videoId: player.youtubeId, startSeconds: 0 });
    } else {
      ytPlayer.playVideo();
    }
  } catch (error) {
    console.warn('Falha ao trocar/reproduzir vídeo no player global:', error);
    iframeSrc.value = buildEmbedUrl(player.youtubeId, player.currentTime);
    await nextTick();
    await attachApiToIframe();
  }
}

function handleClose() {
  persistCurrentTime(true);
  clearProgressTimer();

  if (ytPlayer) {
    try {
      ytPlayer.destroy();
    } catch (_) {}
  }

  ytPlayer = null;
  controlledVideoId = '';
  iframeSrc.value = '';
  closePlayer();
}

function handleBeforeUnload() {
  persistCurrentTime(true);
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

watch(
  () => [player.playRequest, player.active, player.youtubeId],
  async ([request, active, videoId], oldValue = []) => {
    const [oldRequest, oldActive, oldVideoId] = oldValue;
    if (!active || !videoId) {
      clearProgressTimer();
      return;
    }

    if (
      request !== oldRequest ||
      !oldActive ||
      videoId !== oldVideoId ||
      (!ytPlayer && !iframeSrc.value)
    ) {
      await createOrLoadPlayer();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  persistCurrentTime(true);
  clearProgressTimer();
  if (ytPlayer) {
    try {
      ytPlayer.destroy();
    } catch (_) {}
  }
  ytPlayer = null;
});
</script>

<style scoped>
.global-player-shell {
  position: fixed;
  right: 18px;
  bottom: 18px;
  width: min(360px, calc(100vw - 24px));
  z-index: 1900;
}

.global-player-shell--expanded {
  width: min(480px, calc(100vw - 24px));
}

.global-player-card {
  overflow: hidden;
  background: #ffffff;
}

.global-player-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.min-width-0 {
  min-width: 0;
}

.youtube-stage {
  width: 100%;
  height: 203px;
  background: #000;
}

.global-player-shell--expanded .youtube-stage {
  height: 270px;
}

.youtube-iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.resume-panel {
  min-height: 203px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
}

.global-player-footer {
  min-height: 42px;
}

.global-player-enter-active,
.global-player-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.global-player-enter-from,
.global-player-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

@media (max-width: 600px) {
  .global-player-shell,
  .global-player-shell--expanded {
    left: 12px;
    right: 12px;
    bottom: 12px;
    width: auto;
  }

  .youtube-stage,
  .global-player-shell--expanded .youtube-stage,
  .resume-panel {
    height: 210px;
    min-height: 210px;
  }
}
</style>
