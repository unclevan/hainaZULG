<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { CircleCheck, Connection, Document } from "@element-plus/icons-vue";
import { menuForPath } from "@/shared/navigation";
import PageHeading from "@/shared/PageHeading.vue";
import { portalName } from "@/shared/portal";

const route = useRoute();
const item = computed(() => menuForPath(route.path));
const source = computed(() => route.path.startsWith("/archive/") ? "原同力商贸历史数据" : route.path.startsWith("/catalog/") || route.path.startsWith("/orders/") ? "PSI 进销存服务" : route.path.startsWith("/finance/") ? "PSI 财务主数据与 SCC 供应商协同" : "SCC 平台管理");
</script>

<template>
  <div>
    <PageHeading :eyebrow="`${portalName} / 功能规划`" :title="item?.title || '功能规划'" :description="item?.description || '该功能正在规划中。'" />
    <section class="surface planned-card">
      <div class="planned-symbol"><el-icon><Document /></el-icon></div>
      <div class="planned-content">
        <el-tag type="info" effect="plain">页面占位 · 暂无真实数据</el-tag>
        <h2>{{ item?.title }}</h2>
        <p>{{ item?.description }}</p>
        <div class="planned-details">
          <div><el-icon><Connection /></el-icon><span>业务数据来源</span><strong>{{ source }}</strong></div>
          <div><el-icon><CircleCheck /></el-icon><span>演示状态</span><strong>菜单与角色可见范围已配置</strong></div>
        </div>
        <p class="planned-note">正式交付时将接入鉴权接口，并按供应商、角色和业务主体限制可查询的数据。</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.planned-card { display: flex; gap: 26px; align-items: flex-start; padding: 38px; min-height: 350px; }
.planned-symbol { width: 76px; height: 76px; flex: 0 0 76px; display: grid; place-items: center; border-radius: 20px; background: #eaf3ff; color: #3688d7; font-size: 35px; }
.planned-content { width: min(680px,100%); }.planned-content h2 { margin: 18px 0 8px; color: #253b52; font-size: 24px; }.planned-content > p { color: #718399; line-height: 1.8; font-size: 14px; }
.planned-details { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 28px 0; }.planned-details > div { display: grid; grid-template-columns: 20px 1fr; gap: 7px 10px; padding: 17px; border: 1px solid #edf1f5; border-radius: 10px; color: #6c8198; font-size: 12px; }.planned-details .el-icon { color: #3885c9; }.planned-details strong { grid-column: 2; color: #30475f; font-size: 13px; font-weight: 600; }.planned-note { padding: 12px 14px; border-radius: 8px; background: #f6f9fc; font-size: 12px !important; }
@media(max-width:700px) { .planned-card { display: block; padding: 25px; }.planned-symbol { margin-bottom: 20px; }.planned-details { grid-template-columns: 1fr; } }
</style>
