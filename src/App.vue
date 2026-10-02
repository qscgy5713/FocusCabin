<script setup>
import { ref } from 'vue'
import AmbientBackdrop from './components/AmbientBackdrop.vue'
import HeaderBar from './components/HeaderBar.vue'
import PomodoroTimer from './components/PomodoroTimer.vue'
import SoundMixer from './components/SoundMixer.vue'
import DailyWins from './components/DailyWins.vue'

const activeSoundCount = ref(0)
const mixerRef = ref(null)

const handleActiveCountUpdate = (count) => {
  activeSoundCount.value = count
}

const handleStopAll = () => {
  if (mixerRef.value) {
    mixerRef.value.stopAll()
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col text-zinc-100 relative selection:bg-sky-500/20 selection:text-sky-300">
    <!-- Dynamic Ambient Backdrop Particle Canvas -->
    <AmbientBackdrop />

    <!-- Top Navigation -->
    <HeaderBar
      :active-sound-count="activeSoundCount"
      @stop-all="handleStopAll"
    />

    <!-- Main Workspace -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left Column: Pomodoro Timer & Daily 3 Wins -->
        <div class="lg:col-span-5 flex flex-col gap-6">
          <PomodoroTimer />
          <DailyWins />
        </div>

        <!-- Right Column: Multi-track Ambient Sound Mixer -->
        <div class="lg:col-span-7 flex flex-col gap-6">
          <SoundMixer
            ref="mixerRef"
            @update-active-count="handleActiveCountUpdate"
          />
        </div>
      </div>
    </main>

    <!-- Footer Status Bar -->
    <footer class="py-4 px-6 text-center text-xs text-zinc-400 border-t border-zinc-900/60 bg-zinc-950/40 backdrop-blur-sm">
      <p>
        FocusCabin · 100% 本機端 Web Audio 音訊合成 · 零外部網路依賴 · 深度專注工作空間
      </p>
    </footer>
  </div>
</template>
