<template>
  <div
    class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
  >
    <!-- Поиск -->
    <div class="relative w-full sm:w-96">
      <UInput
        v-model="searchModel"
        placeholder="Поиск по названию..."
        class="w-full pr-10 transition-all duration-200 focus:ring-2 focus:ring-green-300"
      />
      <Icon
        name="lucide:search"
        class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      />
    </div>

    <!-- Фильтры -->
    <div class="flex gap-3 items-center w-full">
      <USelect
        v-model="statusModel"
        :options="statusOptions"
        class="min-w-[160px] transition-all duration-200 hover:border-green-400 focus:ring-2 focus:ring-green-300"
      />

      <USelect
        v-model="sortModel"
        :options="sortOptions"
        class="min-w-[160px] transition-all duration-200 hover:border-green-400 focus:ring-2 focus:ring-green-300"
      />

      <!-- Кнопка -->
      <UButton
        @click="$emit('create')"
        class="group transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.97] hover:shadow-md"
      >
        <span class="flex items-center gap-2">
          <Icon
            name="lucide:plus"
            class="w-10 h-10 transition-transform duration-200 group-hover:rotate-90"
          />
          <span class="font-medium">Новая задача</span>
        </span>
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTasksStore } from "@/stores/tasks";

import UInput from "@/components/ui/UInput.vue";
import USelect from "@/components/ui/USelect.vue";
import UButton from "@/components/ui/UButton.vue";

const tasksStore = useTasksStore();

// 🔎 Поиск (с debounce лучше в store вотчером)
const searchModel = computed({
  get: () => tasksStore.search,
  set: (val) => {
    tasksStore.search = val;
  },
});

// 📊 Статус (сразу триггерим fetch)
const statusModel = computed({
  get: () => tasksStore.filterStatus,
  set: (val) => {
    tasksStore.filterStatus = val;
    tasksStore.page = 1;
    tasksStore.fetchTasks();
  },
});

// 📈 Сортировка
const sortModel = computed({
  get: () => tasksStore.sortBy,
  set: (val) => {
    tasksStore.sortBy = val;
    tasksStore.page = 1;
    tasksStore.fetchTasks();
  },
});

// Опции
const statusOptions = [
  { value: "", label: "Все задачи" },
  { value: "false", label: "Активные" },
  { value: "true", label: "Выполненные" },
];

const sortOptions = [
  { value: "date", label: "По дате" },
  { value: "status", label: "По статусу" },
];

defineEmits(["create"]);
</script>
