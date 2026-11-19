<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{ value: string }>();
const display = computed(() => ({
  not_started: ["未开始", "neutral"], draft: ["草稿中", "blue"], pending: ["待审核", "amber"],
  returned: ["待补正", "red"], approved: ["已通过", "green"], active: ["启用", "green"],
  inactive: ["已停用", "neutral"], valid: ["有效", "green"], expiring: ["即将到期", "amber"], expired: ["已过期", "red"]
} as Record<string, [string, string]>)[props.value] || [props.value, "neutral"]);
</script>

<template><span class="status-pill" :class="`status-${display[1]}`"><span class="status-dot"></span>{{ display[0] }}</span></template>
