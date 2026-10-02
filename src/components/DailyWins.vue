<script setup>
import { ref, computed, onMounted } from 'vue'
import { Check, Plus, Trash2, Trophy, ListTodo } from 'lucide-vue-next'

const tasks = ref([])
const newTaskTitle = ref('')

onMounted(() => {
  try {
    const saved = localStorage.getItem('focus_cabin_daily_wins')
    if (saved) {
      tasks.value = JSON.parse(saved)
    } else {
      // Default inspiring tasks
      tasks.value = [
        { id: '1', title: '完成核心功能模組重構', completed: false },
        { id: '2', title: '閱讀官方架構設計文件 30 分鐘', completed: false }
      ]
      save()
    }
  } catch (_) {}
})

const save = () => {
  try {
    localStorage.setItem('focus_cabin_daily_wins', JSON.stringify(tasks.value))
  } catch (_) {}
}

const completedCount = computed(() => tasks.value.filter(t => t.completed).length)

const addTask = () => {
  const text = newTaskTitle.value.trim()
  if (!text || tasks.value.length >= 3) return

  tasks.value.push({
    id: Date.now().toString(),
    title: text,
    completed: false
  })
  newTaskTitle.value = ''
  save()
}

const toggleTask = (index) => {
  tasks.value[index].completed = !tasks.value[index].completed
  save()
}

const deleteTask = (index) => {
  tasks.value.splice(index, 1)
  save()
}
</script>

<template>
  <div class="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-black/40">
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/60">
        <div class="flex items-center space-x-2.5">
          <ListTodo class="w-5 h-5 text-sky-400" />
          <h2 class="text-base font-bold text-zinc-100">今日 3 件事 (Three Wins)</h2>
        </div>
        <span class="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-400">
          {{ completedCount }} / {{ tasks.length }} 完成
        </span>
      </div>

      <p class="text-xs text-zinc-400 mb-4">
        專注哲學：一天只做最重要的 3 件事。減少分心，直擊核心目標。
      </p>

      <!-- Task List -->
      <div class="space-y-2.5">
        <div
          v-for="(task, idx) in tasks"
          :key="task.id"
          :class="[
            'flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 group',
            task.completed
              ? 'bg-zinc-950/40 border-zinc-800/50 text-zinc-400'
              : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-200'
          ]"
        >
          <div class="flex items-center space-x-3 flex-1 min-w-0 mr-2">
            <!-- Custom Checkbox -->
            <button
              @click="toggleTask(idx)"
              :class="[
                'w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0',
                task.completed
                  ? 'bg-sky-500 border-sky-500 text-zinc-950'
                  : 'border-zinc-700 hover:border-sky-400 bg-zinc-800/50'
              ]"
            >
              <Check v-if="task.completed" class="w-3.5 h-3.5 stroke-[3]" />
            </button>

            <!-- Title -->
            <span
              :class="[
                'text-sm truncate select-none',
                task.completed ? 'line-through text-zinc-400' : 'text-zinc-200'
              ]"
            >
              {{ task.title }}
            </span>
          </div>

          <!-- Delete Button -->
          <button
            @click="deleteTask(idx)"
            class="text-zinc-400 hover:text-rose-400 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            title="刪除任務"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

        <!-- Empty state placeholder when 0 tasks -->
        <div v-if="tasks.length === 0" class="py-6 text-center text-xs text-zinc-400">
          尚未新增今日任務。點擊下方新增第 1 個目標！
        </div>
      </div>
    </div>

    <!-- Input Add Task Area -->
    <div class="mt-6 pt-4 border-t border-zinc-800/60">
      <div v-if="tasks.length < 3" class="flex items-center space-x-2">
        <input
          v-model="newTaskTitle"
          @keyup.enter="addTask"
          type="text"
          maxlength="60"
          placeholder="新增關鍵任務（按 Enter 新增）..."
          class="flex-1 bg-zinc-950/80 border border-zinc-800/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-sky-500/60 transition-colors"
        />
        <button
          @click="addTask"
          class="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold transition-all active:scale-95 cursor-pointer shrink-0"
          title="新增"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      <div v-else class="flex items-center justify-between text-xs text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-xl">
        <div class="flex items-center space-x-1.5">
          <Trophy class="w-4 h-4 text-emerald-400" />
          <span>今日 3 大關鍵任務已滿額，請全力執行！</span>
        </div>
      </div>
    </div>
  </div>
</template>
