<!-- <template>
  <div class="relative w-full sm:w-96">
    <UInput
      v-model="searchValue"
      placeholder="Поиск по названию..."
      class="w-full pr-10"
    />
    <Icon
      name="lucide:search"
      class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import UInput from "@/components/ui/UInput.vue";
import { useTasksStore } from "@/stores/tasks";
// import Icon from "@/components/ui/Icon.vue";

const tasksStore = useTasksStore();

const searchValue = computed({
  get: () => tasksStore.search,
  set: (val) => {
    tasksStore.search = val;
  },
});
</script> -->
