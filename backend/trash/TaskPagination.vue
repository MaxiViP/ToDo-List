<!-- <template>
  <div v-if="totalPages > 0" class="flex justify-center mt-6 gap-2">
    <UButton :disabled="loading || page === 1" @click="$emit('prev')">
      Назад
    </UButton>

    <span class="px-3 py-1 font-medium">{{ page }} / {{ totalPages }}</span>

    <UButton :disabled="loading || page >= totalPages" @click="$emit('next')">
      Вперёд
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import UButton from "@/components/ui/UButton.vue";

const props = defineProps<{
  page: number;
  totalPages: number;
  loading: boolean;
}>();
</script> -->
