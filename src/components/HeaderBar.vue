<script setup>
import { ref } from 'vue'
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Compass,
  Square
} from 'lucide-vue-next'
import { soundEngine } from '../audio/soundEngine'

const props = defineProps({
  activeSoundCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['stop-all'])

const isMuted = ref(false)
const masterVol = ref(80)
const isFullscreen = ref(false)

const handleVolumeChange = (e) => {
  const val = Number(e.target.value) / 100
  masterVol.value = Number(e.target.value)
  soundEngine.setMasterVolume(val)
  if (isMuted.value) {
    isMuted.value = false
  }
}

const toggleMute = () => {
  isMuted.value = soundEngine.toggleMasterMute()
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true
    }).catch(() => {})
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    }).catch(() => {})
  }
}
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-40">
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
        <Compass class="w-5 h-5" />
      </div>
      <div>
        <div class="flex items-center space-x-2">
          <h1 class="text-lg font-bold tracking-tight text-zinc-100">FocusCabin</h1>
          <span class="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
            v1.0
          </span>
        </div>
        <p class="text-xs text-zinc-400">專注微空間 · 獨立自用工作台</p>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center space-x-4">
      <!-- Active Sounds Indicator & Stop All -->
      <div v-if="activeSoundCount > 0" class="flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-full">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-xs text-zinc-300">{{ activeSoundCount }} 個音效運作中</span>
        <button
          @click="emit('stop-all')"
          class="ml-1 text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          title="停止所有音效"
        >
          <Square class="w-3 h-3 fill-current" />
          <span>靜止</span>
        </button>
      </div>

      <!-- Master Volume -->
      <div class="hidden sm:flex items-center space-x-2 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-xl">
        <button
          @click="toggleMute"
          class="text-zinc-400 hover:text-zinc-200 transition-colors"
          :title="isMuted ? '取消靜音' : '靜音'"
        >
          <VolumeX v-if="isMuted || masterVol === 0" class="w-4 h-4 text-rose-400" />
          <Volume2 v-else class="w-4 h-4 text-sky-400" />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          :value="isMuted ? 0 : masterVol"
          @input="handleVolumeChange"
          class="w-20 sm:w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          title="總主音量"
        />
      </div>

      <!-- Fullscreen Toggle -->
      <button
        @click="toggleFullscreen"
        class="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all"
        :title="isFullscreen ? '退出全螢幕' : '進入全螢幕沉浸模式'"
      >
        <Minimize2 v-if="isFullscreen" class="w-4 h-4" />
        <Maximize2 v-else class="w-4 h-4" />
      </button>
    </div>
  </header>
</template>
