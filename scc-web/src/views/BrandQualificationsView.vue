<script setup lang="ts">
import PageHeading from "@/shared/PageHeading.vue";
import BrandQualificationsPanel from "@/shared/BrandQualificationsPanel.vue";
import { useDemoStore } from "@/domain/store";

const demo = useDemoStore();
</script>

<template>
  <div>
    <PageHeading eyebrow="供应商管理" title="品牌资质" description="提交品牌权属或供货授权证明，查看审核结果及有效期。" />
    <BrandQualificationsPanel v-if="demo.activeSupplier" mode="supplier" :supplier-id="demo.activeSupplier.id" />
  </div>
</template>
