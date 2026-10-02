<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Play, Pause, RotateCcw, BellRing, Sparkles } from 'lucide-vue-next'
import { soundEngine } from '../audio/soundEngine'

const MODES = {
  focus: { label: '深度專注', duration: 25 * 60, color: 'text-sky-400', ringColor: '#38bdf8' },
  shortBreak: { label: '短暫休息', duration: 5 * 60, color: 'text-emerald-400', ringColor: '#34d399' },
  longBreak: { label: '深度放鬆', duration: 15 * 60, color: 'text-indigo-400', ringColor: '#818cf8' }
}

const currentMode = ref('focus')
const timeLeft = ref(MODES.focus.duration)
const isRunning = ref(false)
const pomodoroCount = ref(0)
let timerInterval = null
const originalTitle = typeof document !== 'undefined' ? document.title : 'FocusCabin'

// Restore completed count from localStorage
onMounted(() => {
  const savedCount = localStorage.getItem('focus_cabin_pomodoro_count')
  if (savedCount) pomodoroCount.value = parseInt(savedCount, 10) || 0

  // Keyboard shortcut: Space to toggle play/pause
  const handleKeydown = (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault()
      toggleTimer()
    }
  }
  window.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    if (timerInterval) clearInterval(timerInterval)
    document.title = originalTitle
  })
})

const minutes = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  return m < 10 ? `0${m}` : `${m}`
})

const seconds = computed(() => {
  const s = timeLeft.value % 60
  return s < 10 ? `0${s}` : `${s}`
})

const progress = computed(() => {
  const total = MODES[currentMode.value].duration
  return ((total - timeLeft.value) / total) * 100
})

const strokeDashoffset = computed(() => {
  const circumference = 2 * Math.PI * 110
  return circumference - (progress.value / 100) * circumference
})

watch(timeLeft, () => {
  document.title = `${minutes.value}:${seconds.value} - ${MODES[currentMode.value].label} | FocusCabin`
})

const setMode = (mode) => {
  if (isRunning.value) pauseTimer()
  currentMode.value = mode
  timeLeft.value = MODES[mode].duration
}

const startTimer = () => {
  // Request notification permission on explicit user click if supported and default
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }

  isRunning.value = true
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      finishTimer()
    }
  }, 1000)
}

const pauseTimer = () => {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const resetTimer = () => {
  pauseTimer()
  timeLeft.value = MODES[currentMode.value].duration
}

const finishTimer = () => {
  pauseTimer()
  soundEngine.playChime()

  if (currentMode.value === 'focus') {
    pomodoroCount.value++
    localStorage.setItem('focus_cabin_pomodoro_count', pomodoroCount.value.toString())
  }

  // Trigger web notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('FocusCabin 提示', {
      body: `${MODES[currentMode.value].label}時間已結束，給自己深呼吸一次吧！`
    })
  }

  // Auto transition to break or next focus
  if (currentMode.value === 'focus') {
    if (pomodoroCount.value % 4 === 0) {
      setMode('longBreak')
    } else {
      setMode('shortBreak')
    }
  } else {
    setMode('focus')
  }
}
</script>

<template>
  <div class="relative bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between shadow-2xl shadow-black/40">
    <!-- Mode Selector Pills -->
    <div class="flex items-center space-x-1.5 p-1 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl mb-6">
      <button
        v-for="(config, key) in MODES"
        :key="key"
        @click="setMode(key)"
        :class="[
          'px-4 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer',
          currentMode === key
            ? 'bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700/50'
            : 'text-zinc-400 hover:text-zinc-200'
        ]"
      >
        {{ config.label }}
      </button>
    </div>

    <!-- Timer Ring & Display -->
    <div class="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
      <!-- SVG Progress Ring -->
      <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 250 250">
        <!-- Background track -->
        <circle
          cx="125"
          cy="125"
          r="110"
          stroke="rgba(39, 39, 42, 0.6)"
          stroke-width="8"
          fill="none"
        />
        <!-- Progress track -->
        <circle
          cx="125"
          cy="125"
          r="110"
          :stroke="MODES[currentMode].ringColor"
          stroke-width="8"
          fill="none"
          stroke-linecap="round"
          :stroke-dasharray="2 * Math.PI * 110"
          :stroke-dashoffset="strokeDashoffset"
          class="transition-all duration-1000 ease-linear"
        />
      </svg>

      <!-- Center Time Display -->
      <div class="absolute flex flex-col items-center justify-center text-center">
        <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
          <Sparkles class="w-3.5 h-3.5 text-sky-400" />
          {{ MODES[currentMode].label }}
        </span>
        <div class="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-zinc-100 tabular-nums">
          {{ minutes }}<span class="animate-pulse">:</span>{{ seconds }}
        </div>
        <div class="mt-2 flex items-center space-x-1.5 text-xs text-zinc-400">
          <span>累積專注：</span>
          <span class="font-mono font-bold text-sky-400">{{ pomodoroCount }}</span>
          <span>次番茄</span>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center space-x-4 mt-6">
      <button
        @click="resetTimer"
        class="p-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer"
        title="重設計時器"
      >
        <RotateCcw class="w-5 h-5" />
      </button>

      <button
        @click="toggleTimer"
        :class="[
          'px-8 py-3.5 rounded-2xl flex items-center space-x-2.5 font-semibold text-sm transition-all duration-200 shadow-lg active:scale-95 cursor-pointer',
          isRunning
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 shadow-rose-500/10'
            : 'bg-sky-500 text-zinc-950 font-bold hover:bg-sky-400 shadow-sky-500/20'
        ]"
      >
        <Pause v-if="isRunning" class="w-5 h-5 fill-current" />
        <Play v-else class="w-5 h-5 fill-current" />
        <span>{{ isRunning ? '暫停計時' : '開始專注' }}</span>
      </button>

      <button
        @click="soundEngine.playChime()"
        class="p-3 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer"
        title="試聽結束提示音（頌缽清鳴）"
      >
        <BellRing class="w-5 h-5" />
      </button>
    </div>

    <p class="text-[11px] text-zinc-400 mt-4 tracking-wide">
      提示：按空白鍵（Space）可隨時開始／暫停
    </p>
  </div>
</template>
