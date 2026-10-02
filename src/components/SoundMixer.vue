<script setup>
import { ref, onMounted } from 'vue'
import {
  CloudRain,
  Flame,
  Wind,
  Coffee,
  Radio,
  Sparkles,
  Waves,
  MoonStar,
  CloudLightning,
  Droplets,
  Keyboard,
  TrainFront,
  Mountain,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Wand2,
  Check,
  Play,
  Pause
} from 'lucide-vue-next'
import { SOUND_PRESETS } from '../audio/sounds'
import { soundEngine } from '../audio/soundEngine'

const emit = defineEmits(['update-active-count'])

const iconMap = {
  CloudRain,
  Flame,
  Wind,
  Coffee,
  Radio,
  Sparkles,
  Waves,
  MoonStar,
  CloudLightning,
  Droplets,
  Keyboard,
  TrainFront,
  Mountain
}

// Channel States: { id: { active: boolean, volume: number } }
const channels = ref({})
const activeSceneName = ref('')

// Expanded Rich Quick Atmospheres with Crisp Lucide Icons
const MIX_SCENES = [
  {
    name: '溫暖營火',
    desc: '壁爐柴火 0.8 + 夏夜蟲鳴 0.35 + 林間清風 0.25',
    icon: 'Flame',
    iconColor: 'text-amber-400',
    setup: { campfire: 0.8, night: 0.35, wind: 0.25 }
  },
  {
    name: '暴雨木屋',
    desc: '雨聲 0.7 + 柴火 0.45 + 遠雷 0.55',
    icon: 'CloudLightning',
    iconColor: 'text-blue-400',
    setup: { rain: 0.7, campfire: 0.45, thunder: 0.55 }
  },
  {
    name: '深夜編程',
    desc: '機械鍵盤 0.55 + 褐噪 0.65 + 頌缽 0.3',
    icon: 'Keyboard',
    iconColor: 'text-emerald-400',
    setup: { keyboard: 0.55, brown: 0.65, zen: 0.3 }
  },
  {
    name: '海邊晨曦',
    desc: '深海浪潮 0.6 + 清風 0.35 + 頌缽 0.25',
    icon: 'Waves',
    iconColor: 'text-cyan-400',
    setup: { waves: 0.6, wind: 0.35, zen: 0.25 }
  },
  {
    name: '夏夜星空',
    desc: '夏夜蟲鳴 0.5 + 清風 0.3 + 柴火 0.35',
    icon: 'MoonStar',
    iconColor: 'text-indigo-400',
    setup: { night: 0.5, wind: 0.3, campfire: 0.35 }
  },
  {
    name: '高山幽谷',
    desc: '山澗溪流 0.6 + 細雨 0.35 + 清風 0.3',
    icon: 'Mountain',
    iconColor: 'text-teal-400',
    setup: { stream: 0.6, rain: 0.35, wind: 0.3 }
  },
  {
    name: '街角咖啡',
    desc: '街角咖啡 0.6 + 細雨 0.4 + 鍵盤 0.35',
    icon: 'Coffee',
    iconColor: 'text-amber-300',
    setup: { coffee: 0.6, rain: 0.4, keyboard: 0.35 }
  },
  {
    name: '夜行列車',
    desc: '鐵軌律動 0.65 + 褐噪 0.5',
    icon: 'TrainFront',
    iconColor: 'text-zinc-300',
    setup: { train: 0.65, brown: 0.5 }
  },
  {
    name: '深層冥想',
    desc: '頌缽共振 0.55 + 褐噪 0.45 + 山澗 0.25',
    icon: 'Sparkles',
    iconColor: 'text-rose-400',
    setup: { zen: 0.55, brown: 0.45, stream: 0.25 }
  }
]

onMounted(() => {
  const initial = {}
  SOUND_PRESETS.forEach(preset => {
    initial[preset.id] = {
      active: false,
      volume: preset.defaultVol || 0.5
    }
  })

  // Try loading saved mix from LocalStorage
  try {
    const saved = localStorage.getItem('focus_cabin_sound_mix')
    if (saved) {
      const parsed = JSON.parse(saved)
      Object.keys(parsed).forEach(id => {
        if (initial[id]) {
          initial[id].volume = parsed[id].volume
        }
      })
    }
  } catch (_) {}

  channels.value = initial
  emitActiveCount()
})

const emitActiveCount = () => {
  const count = Object.values(channels.value).filter(c => c.active).length
  emit('update-active-count', count)
}

const toggleSound = (soundId) => {
  const ch = channels.value[soundId]
  if (!ch) return
  ch.active = !ch.active
  soundEngine.setChannel(soundId, ch.volume, ch.active)
  activeSceneName.value = ''
  emitActiveCount()
  saveMixState()
}

const updateVolume = (soundId, e) => {
  const vol = Number(e.target.value) / 100
  const ch = channels.value[soundId]
  if (!ch) return
  ch.volume = vol

  if (ch.active) {
    soundEngine.setChannel(soundId, vol, true)
  }
  saveMixState()
}

const applyScene = (scene) => {
  activeSceneName.value = scene.name
  Object.keys(channels.value).forEach(id => {
    const targetVol = scene.setup[id] || 0
    const ch = channels.value[id]
    if (targetVol > 0) {
      ch.volume = targetVol
      ch.active = true
      soundEngine.setChannel(id, targetVol, true)
    } else {
      ch.active = false
      soundEngine.setChannel(id, ch.volume, false)
    }
  })
  emitActiveCount()
  saveMixState()
}

const stopAll = () => {
  activeSceneName.value = ''
  Object.keys(channels.value).forEach(id => {
    const ch = channels.value[id]
    ch.active = false
    soundEngine.setChannel(id, ch.volume, false)
  })
  emitActiveCount()
}

defineExpose({
  stopAll
})

const saveMixState = () => {
  try {
    localStorage.setItem('focus_cabin_sound_mix', JSON.stringify(channels.value))
  } catch (_) {}
}
</script>

<template>
  <div class="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">
    <!-- Header with Quick Atmosphere Scenes -->
    <div class="mb-6 pb-5 border-b border-zinc-800/60">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-2.5">
          <SlidersHorizontal class="w-5 h-5 text-sky-400" />
          <h2 class="text-base font-bold text-zinc-100">環境音混音台</h2>
          <span class="text-xs text-zinc-400 font-normal">（共 12 款原生音效 · 自由疊加）</span>
        </div>
        <div class="text-xs text-zinc-400 flex items-center gap-1.5">
          <Wand2 class="w-3.5 h-3.5 text-amber-400" />
          <span>快速氛圍預設</span>
        </div>
      </div>

      <!-- Quick Scenes Grid / Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
        <button
          v-for="scene in MIX_SCENES"
          :key="scene.name"
          @click="applyScene(scene)"
          :class="[
            'text-xs px-3 py-1.5 rounded-xl border transition-all duration-200 shrink-0 flex items-center gap-1.5 cursor-pointer font-medium',
            activeSceneName === scene.name
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-md shadow-sky-500/10'
              : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/70'
          ]"
          :title="scene.desc"
        >
          <component :is="iconMap[scene.icon]" :class="['w-3.5 h-3.5', scene.iconColor]" />
          <span>{{ scene.name }}</span>
          <Check v-if="activeSceneName === scene.name" class="w-3 h-3 text-sky-400 stroke-[3]" />
        </button>
      </div>
    </div>

    <!-- Sound Cards Grid (12 items) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
      <div
        v-for="item in SOUND_PRESETS"
        :key="item.id"
        :class="[
          'relative rounded-2xl border transition-all duration-300 p-4 flex flex-col justify-between group',
          channels[item.id]?.active
            ? 'bg-zinc-900/90 border-sky-500/40 shadow-lg shadow-sky-500/5 ring-1 ring-sky-500/20'
            : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700/70 hover:bg-zinc-900/40'
        ]"
      >
        <!-- Floating Tooltip on Hover showing Full Name -->
        <div class="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-zinc-900/95 border border-zinc-700/80 shadow-2xl text-xs text-zinc-100 font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:-top-9.5 transition-all duration-200 pointer-events-none z-30 flex items-center gap-1.5 backdrop-blur-md">
          <component :is="iconMap[item.icon]" class="w-3.5 h-3.5 text-sky-400" />
          <span>{{ item.name }}</span>
          <span class="text-zinc-400 font-mono text-[10px] font-normal">({{ item.nameEn }})</span>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700/80 rotate-45"></div>
        </div>

        <!-- Background Gradient Glow when active -->
        <div
          v-if="channels[item.id]?.active"
          :class="['absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20 pointer-events-none -z-0', item.color]"
        ></div>

        <!-- Top info & Play/Pause toggle -->
        <div class="flex items-center justify-between z-10 w-full">
          <div class="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
            <div
              @click="toggleSound(item.id)"
              :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 cursor-pointer',
                channels[item.id]?.active
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 group-hover:text-zinc-300 group-hover:border-zinc-700'
              ]"
              :title="channels[item.id]?.active ? '暫停音效' : '開啟音效'"
            >
              <component :is="iconMap[item.icon]" class="w-5 h-5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center space-x-1.5" :title="`${item.name} · ${item.nameEn}`">
                <span class="text-sm font-semibold text-zinc-100 truncate">{{ item.name }}</span>
                <span class="text-[11px] text-zinc-400 font-mono truncate hidden sm:inline">{{ item.nameEn }}</span>
              </div>
              <!-- Seamless Marquee Description -->
              <div class="relative overflow-hidden w-full mask-gradient-x mt-0.5" :title="item.description">
                <div class="animate-marquee text-xs text-zinc-400">
                  <span class="mr-6 inline-flex items-center gap-1.5">
                    {{ item.description }}
                    <span class="text-zinc-600 text-[9px]">✦</span>
                  </span>
                  <span class="mr-6 inline-flex items-center gap-1.5">
                    {{ item.description }}
                    <span class="text-zinc-600 text-[9px]">✦</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Compact, Never-Clipped Play/Pause Button -->
          <button
            @click.stop="toggleSound(item.id)"
            :class="[
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0',
              channels[item.id]?.active
                ? 'bg-sky-500 text-zinc-950 shadow-md shadow-sky-500/25 ring-2 ring-sky-400/30 hover:bg-sky-400'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80 border border-zinc-700/50'
            ]"
            :title="channels[item.id]?.active ? '暫停音效' : '開啟音效'"
          >
            <Pause v-if="channels[item.id]?.active" class="w-4 h-4 fill-current stroke-[2.5]" />
            <Play v-else class="w-4 h-4 fill-current ml-0.5" />
          </button>
        </div>

        <!-- Volume Slider & Wave indicator -->
        <div class="mt-4 pt-3 border-t border-zinc-800/40 z-10 flex items-center space-x-3">
          <span class="text-zinc-400 shrink-0">
            <VolumeX v-if="!channels[item.id]?.active || channels[item.id]?.volume === 0" class="w-3.5 h-3.5 text-zinc-400" />
            <Volume2 v-else class="w-3.5 h-3.5 text-sky-400" />
          </span>

          <input
            type="range"
            min="0"
            max="100"
            :value="Math.round((channels[item.id]?.volume || 0.5) * 100)"
            @input="(e) => updateVolume(item.id, e)"
            :disabled="!channels[item.id]?.active"
            :class="[
              'flex-1 h-1.5 rounded-lg appearance-none cursor-pointer transition-opacity',
              channels[item.id]?.active
                ? 'bg-zinc-700 accent-sky-400'
                : 'bg-zinc-800/50 accent-zinc-600 opacity-40 cursor-not-allowed'
            ]"
            title="調整音量"
          />

          <!-- Animated Audio Wave bars when active -->
          <div v-if="channels[item.id]?.active" class="flex items-end space-x-0.5 h-3.5 w-4 shrink-0">
            <span class="w-0.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0ms] h-full"></span>
            <span class="w-0.5 bg-sky-400 rounded-full animate-bounce [animation-delay:150ms] h-2"></span>
            <span class="w-0.5 bg-sky-400 rounded-full animate-bounce [animation-delay:300ms] h-3"></span>
          </div>
          <span v-else class="text-[11px] font-mono text-zinc-400 w-4 text-right shrink-0">
            -
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
