import { reactive } from 'vue';

const STORAGE_KEY = 'socialmusic_global_player_v1';

const defaultState = () => ({
  visible: false,
  active: false,
  restored: false,
  youtubeId: '',
  trackName: '',
  artistName: '',
  imageUrl: '',
  spotifyUrl: '',
  currentTime: 0,
  playbackState: 'idle',
  playRequest: 0,
  compact: true,
});

const player = reactive(defaultState());
let initialized = false;
let lastPersistedSecond = -1;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function persist() {
  if (!canUseStorage()) return;

  if (!player.youtubeId || !player.visible) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  const payload = {
    youtubeId: player.youtubeId,
    trackName: player.trackName,
    artistName: player.artistName,
    imageUrl: player.imageUrl,
    spotifyUrl: player.spotifyUrl,
    currentTime: Math.max(0, Math.floor(Number(player.currentTime) || 0)),
    compact: player.compact,
  };

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function hydrateOnce() {
  if (initialized) return;
  initialized = true;
  if (!canUseStorage()) return;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const saved = JSON.parse(raw);
    if (!saved?.youtubeId) return;

    player.visible = true;
    player.active = false;
    player.restored = true;
    player.youtubeId = String(saved.youtubeId);
    player.trackName = saved.trackName || '';
    player.artistName = saved.artistName || '';
    player.imageUrl = saved.imageUrl || '';
    player.spotifyUrl = saved.spotifyUrl || '';
    player.currentTime = Math.max(0, Number(saved.currentTime) || 0);
    player.compact = saved.compact !== false;
    player.playbackState = 'paused';
  } catch (error) {
    console.warn('Não foi possível restaurar o player global:', error);
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
}

hydrateOnce();

function playTrack(track) {
  if (!track?.youtubeId) return;

  const newVideo = player.youtubeId !== String(track.youtubeId);

  player.youtubeId = String(track.youtubeId);
  player.trackName = track.trackName || '';
  player.artistName = track.artistName || '';
  player.imageUrl = track.imageUrl || '';
  player.spotifyUrl = track.spotifyUrl || '';
  player.visible = true;
  player.active = true;
  player.restored = false;
  player.playbackState = 'loading';

  if (newVideo) {
    player.currentTime = 0;
    lastPersistedSecond = -1;
  }

  player.playRequest += 1;
  persist();
}

function resumeRestoredPlayer() {
  if (!player.youtubeId) return;
  player.visible = true;
  player.active = true;
  player.restored = false;
  player.playbackState = 'loading';
  player.playRequest += 1;
  persist();
}

function requestPlay() {
  if (!player.youtubeId) return;
  player.visible = true;
  player.active = true;
  player.restored = false;
  player.playRequest += 1;
}

function closePlayer() {
  Object.assign(player, defaultState());
  lastPersistedSecond = -1;
  if (canUseStorage()) {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
}

function setPlaybackState(state) {
  player.playbackState = state;
}

function setCurrentTime(seconds, force = false) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  player.currentTime = safeSeconds;

  const wholeSecond = Math.floor(safeSeconds);
  if (force || lastPersistedSecond < 0 || Math.abs(wholeSecond - lastPersistedSecond) >= 5) {
    lastPersistedSecond = wholeSecond;
    persist();
  }
}

function toggleCompact() {
  player.compact = !player.compact;
  persist();
}

function expandPlayer() {
  player.compact = false;
  player.visible = true;
  persist();
}

export function useGlobalPlayer() {
  return {
    player,
    playTrack,
    resumeRestoredPlayer,
    requestPlay,
    closePlayer,
    setPlaybackState,
    setCurrentTime,
    toggleCompact,
    expandPlayer,
  };
}
