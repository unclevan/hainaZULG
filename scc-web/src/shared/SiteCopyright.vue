<script setup lang="ts">
import { ref } from "vue";

withDefaults(defineProps<{ dark?: boolean }>(), { dark: false });

const policeRecord = "33010602010680";
const fallbackIcon = `${import.meta.env.BASE_URL}police-filing-fallback.svg`;
const policeIcon = ref("https://beian.mps.gov.cn/img/logo01.dd7ff50e.png");
</script>

<template>
  <div class="site-copyright" :class="{ 'site-copyright-dark': dark }">
    <span>版权所有 © 浙江同力信息科技有限公司</span>
    <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">浙ICP备16033828号-5</a>
    <a :href="`https://beian.mps.gov.cn/#/query/webSearch?code=${policeRecord}`" target="_blank" rel="noopener noreferrer" class="police-record">
      <img :src="policeIcon" alt="" width="18" height="20" @error="policeIcon = fallbackIcon" />
      浙公网安备 33010602010680号
    </a>
  </div>
</template>

<style scoped>
.site-copyright { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 5px 18px; color: #8e9bad; font-size: 11px; line-height: 1.8; }
.site-copyright a { color: inherit; text-decoration: none; white-space: nowrap; }
.site-copyright a:hover { color: var(--brand); text-decoration: underline; }
.site-copyright .police-record { display: inline-flex; align-items: center; gap: 5px; }
.police-record img { display: block; flex: none; object-fit: contain; }
.site-copyright-dark { color: #a6bfd3; }
.site-copyright-dark a:hover { color: #fff; }
</style>
