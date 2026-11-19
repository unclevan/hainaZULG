<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  total: number;
  page: number;
  pageSize?: number;
}>(), { pageSize: 10 });
const emit = defineEmits<{ "update:page": [value: number] }>();

const start = computed(() => props.total ? (props.page - 1) * props.pageSize + 1 : 0);
const end = computed(() => Math.min(props.page * props.pageSize, props.total));
</script>

<template>
  <div class="table-footer result-list-footer">
    <span>显示第 {{ start }}–{{ end }} 条，共 {{ total }} 条</span>
    <el-pagination
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      small
      background
      layout="prev, pager, next"
      @update:current-page="emit('update:page', $event)"
    />
  </div>
</template>

<style scoped>
.result-list-footer { gap: 16px; min-height: 58px; }
@media (max-width: 580px) {
  .result-list-footer { flex-wrap: wrap; }
}
</style>
