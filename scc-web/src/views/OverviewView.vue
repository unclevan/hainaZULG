<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowRight, CircleCheck, Clock, Files, OfficeBuilding, Warning } from "@element-plus/icons-vue";
import PageHeading from "@/shared/PageHeading.vue";
import StatusPill from "@/shared/StatusPill.vue";
import { useDemoStore } from "@/domain/store";

const store = useDemoStore();
const router = useRouter();
const isSupplier = computed(() => store.role === "supplier");
const greeting = computed(() => isSupplier.value ? store.activeSupplier?.name || "供应商" : store.role === "reviewer" ? "采购审核团队" : "业主管理团队");
const summary = computed(() => isSupplier.value ? [
  { label: "资料完整度", value: store.activeSupplier?.completion || 0, unit: "%", icon: OfficeBuilding, color: "blue", detail: "2027 年度资料" },
  { label: "业务联系人", value: store.activeSupplier?.contacts.length || 0, unit: "位", icon: Clock, color: "amber", detail: "本企业联系人" },
  { label: "资质证照", value: store.activeSupplier?.qualifications.length || 0, unit: "项", icon: Files, color: "green", detail: "已登记证照" },
  { label: "证照提醒", value: store.activeSupplier?.qualifications.filter(q => q.status === "expiring" || q.status === "expired").length || 0, unit: "项", icon: Warning, color: "red", detail: "临期或过期" }
] : [
  { label: "合作供应商", value: store.suppliers.length, unit: "家", icon: OfficeBuilding, color: "blue", detail: "已纳入平台名录" },
  { label: "待审核资料", value: store.pendingCount, unit: "份", icon: Clock, color: "amber", detail: "2027 年度更新" },
  { label: "证照提醒", value: store.expiringCount, unit: "项", icon: Warning, color: "red", detail: "临期或需补传" },
  { label: "已完成审核", value: store.suppliers.filter(s => s.submissionStatus === "approved").length, unit: "家", icon: CircleCheck, color: "green", detail: "本轮资料更新" }
]);
const progress = computed(() => store.suppliers.filter(s => s.submissionStatus === "approved" || s.submissionStatus === "pending").length);
const todo = computed(() => isSupplier.value ? [store.activeSupplier].filter(Boolean) : store.suppliers.filter(s => s.submissionStatus === "pending" || s.submissionStatus === "returned").slice(0, 4));
const activities = computed(() => isSupplier.value ? store.data.activities.filter(a => a.supplierId === store.activeSupplierId).slice(0, 4) : store.data.activities.slice(0, 4));
</script>

<template>
  <div>
    <PageHeading eyebrow="WORKSPACE / 工作台" title="工作台" :description="`你好，${greeting}。这里汇总了本年度供应商资料更新进度。`">
      <el-button @click="router.push(isSupplier ? '/my/profile' : '/suppliers')">{{ isSupplier ? "查看我的资料" : "查看供应商名录" }} <el-icon class="el-icon--right"><ArrowRight /></el-icon></el-button>
    </PageHeading>

    <section class="hero-banner">
      <div class="hero-text"><div class="hero-tag">2027 年度供应商资料更新</div><h2>{{ isSupplier ? "让企业资料保持准确、完整" : "新一年度，从准确的供应商资料开始" }}</h2><p>{{ isSupplier ? "请核对企业信息、业务联系人及资质证照，提交后由采购团队审核。" : "统一收集企业信息、联系人与证照，审核留痕，为后续供应链协同做好准备。" }}</p><el-button type="primary" class="hero-button" @click="router.push(isSupplier ? '/my/profile' : '/reviews')">{{ isSupplier ? "继续填写资料" : "处理审核待办" }} <el-icon class="el-icon--right"><ArrowRight /></el-icon></el-button></div>
      <div class="hero-art"><div class="hero-ring ring-outer"></div><div class="hero-ring ring-inner"></div><div class="hero-stat"><span>{{ isSupplier ? '我的资料完整度' : '年度更新进度' }}</span><strong>{{ isSupplier ? store.activeSupplier?.completion : progress }}<small>{{ isSupplier ? '%' : ` / ${store.suppliers.length}` }}</small></strong><em>{{ isSupplier ? '2027 年度资料' : '供应商已提交或通过' }}</em></div></div>
    </section>

    <div class="summary-cards"><div v-for="card in summary" :key="card.label" class="summary-card surface"><div class="metric-icon" :class="card.color"><el-icon><component :is="card.icon" /></el-icon></div><div class="metric-body"><span>{{ card.label }}</span><div><strong>{{ card.value }}</strong><small>{{ card.unit }}</small></div><p>{{ card.detail }}</p></div></div></div>

    <div class="grid-two lower-grid">
      <section class="surface"><div class="surface-header"><div><h2>{{ isSupplier ? "我的年度资料" : "近期审核事项" }}</h2><p>{{ isSupplier ? "查看本企业当前填报状态" : "优先关注待审核与退回补正事项" }}</p></div><el-button link type="primary" @click="router.push(isSupplier ? '/my/profile' : '/reviews')">查看全部 <el-icon><ArrowRight /></el-icon></el-button></div><div class="todo-list">
        <div v-for="item in todo" :key="item?.id" class="todo-row" @click="router.push(isSupplier ? '/my/profile' : `/suppliers/${item?.id}`)"><div class="todo-avatar">{{ item?.name.slice(0, 1) }}</div><div class="todo-main"><strong>{{ item?.name }}</strong><span>供应商编码 {{ item?.code }} · 更新于 {{ item?.lastUpdated }}</span></div><StatusPill :value="item?.submissionStatus || ''" /><el-icon class="row-arrow"><ArrowRight /></el-icon></div>
        <div v-if="!todo.length" class="empty-line">暂无待处理事项，所有提交都已完成审核。</div>
      </div></section>
      <section class="surface"><div class="surface-header"><div><h2>最新动态</h2><p>资料更新与审核记录</p></div><el-icon class="history-icon"><Files /></el-icon></div><div class="activity-list"><div v-for="activity in activities" :key="activity.id" class="activity-row"><span class="activity-dot" :class="activity.kind"></span><div><strong>{{ activity.title }}</strong><p>{{ activity.detail }}</p><small>{{ activity.date }}</small></div></div><div v-if="!activities.length" class="empty-line">暂无动态记录。</div></div></section>
    </div>
  </div>
</template>

<style scoped>
.hero-banner { position: relative; overflow: hidden; display: flex; justify-content: space-between; min-height: 210px; padding: 28px 34px; border-radius: 13px; color: #fff; background: linear-gradient(115deg,#143e6c 0%,#226bb6 60%,#3092cf 100%); box-shadow: 0 12px 29px rgba(38,108,178,.15); }.hero-text { z-index: 1; }.hero-tag { display: inline-block; padding: 5px 11px; border: 1px solid rgba(255,255,255,.28); border-radius: 20px; color: #d9edff; font-size: 10px; letter-spacing: .06em; }.hero-text h2 { margin: 15px 0 6px; font-size: 24px; font-weight: 650; }.hero-text p { margin: 0; color: #cce2f7; font-size: 12px; }.hero-button { margin-top: 23px; border-color: #fff; background: #fff; color: #216ab8; font-weight: 650; }.hero-button:hover { background: #eaf5ff; color: #1b5fa8; }.hero-art { position: relative; width: 300px; flex: 0 0 300px; display: grid; place-items: center; }.hero-ring { position: absolute; border: 1px solid rgba(255,255,255,.2); border-radius: 50%; }.ring-outer { width: 290px; height: 290px; box-shadow: 0 0 0 30px rgba(255,255,255,.035),0 0 0 70px rgba(255,255,255,.025); }.ring-inner { width: 205px; height: 205px; border-style: dashed; }.hero-stat { z-index: 1; display: flex; flex-direction: column; gap: 6px; width: 174px; padding: 18px; border: 1px solid rgba(255,255,255,.23); border-radius: 13px; background: rgba(255,255,255,.12); backdrop-filter: blur(10px); }.hero-stat span { font-size: 11px; color: #d3e7f7; }.hero-stat strong { font-size: 34px; line-height: 1; }.hero-stat small { font-size: 18px; font-weight: 400; color: #b7d5ea; }.hero-stat em { font-style: normal; font-size: 10px; color: #c5dff2; }
.summary-cards { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 16px; margin: 19px 0; }.summary-card { display: flex; gap: 15px; align-items: flex-start; min-height: 117px; padding: 21px; }.metric-icon { width: 39px; height: 39px; flex: 0 0 39px; display: grid; place-items: center; border-radius: 11px; font-size: 19px; }.metric-icon.blue { background: #e9f3ff; color: #347fd3; }.metric-icon.amber { background: #fff5e2; color: #d79a36; }.metric-icon.red { background: #fff0f0; color: #d5737a; }.metric-icon.green { background: #eaf8ef; color: #35a371; }.metric-body span { color: #8391a4; font-size: 12px; }.metric-body div { margin: 4px 0 2px; }.metric-body strong { color: #273b51; font-size: 28px; line-height: 1; }.metric-body small { margin-left: 4px; color: #8a99a9; font-size: 11px; }.metric-body p { margin: 0; color: #a0adbb; font-size: 10px; }.lower-grid { margin-top: 2px; }.todo-list { padding: 2px 20px 13px; }.todo-row { display: flex; align-items: center; gap: 12px; padding: 14px 2px; border-bottom: 1px solid #f0f2f5; cursor: pointer; }.todo-row:last-child { border-bottom: 0; }.todo-avatar { width: 37px; height: 37px; display: grid; place-items: center; flex: 0 0 37px; border-radius: 9px; background: #eaf3fc; color: #3079bf; font-weight: 700; }.todo-main { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 4px; }.todo-main strong { overflow: hidden; color: #33475c; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }.todo-main span { color: #9ca8b7; font-size: 10px; }.row-arrow { color: #a7b4c1; }.empty-line { padding: 32px; color: #9ba8b6; text-align: center; font-size: 12px; }.activity-list { padding: 13px 22px 16px; }.activity-row { display: flex; gap: 13px; padding: 12px 0; }.activity-dot { width: 8px; height: 8px; flex: 0 0 8px; margin-top: 5px; border-radius: 50%; background: #70a0d0; box-shadow: 0 0 0 4px #ecf4fb; }.activity-dot.warning { background: #e4b35c; box-shadow: 0 0 0 4px #fff6e8; }.activity-dot.success { background: #5ab88a; box-shadow: 0 0 0 4px #eaf8f0; }.activity-row strong { color: #43566a; font-size: 11px; }.activity-row p { margin: 4px 0; color: #93a0af; font-size: 10px; }.activity-row small { color: #b4beca; font-size: 10px; }.history-icon { color: #82a1c2; font-size: 18px; }
@media (max-width: 1200px) { .summary-cards { grid-template-columns: repeat(2,minmax(0,1fr)); } }@media (max-width: 760px) { .hero-art { display: none; }.hero-banner { padding: 25px; }.hero-text h2 { font-size: 20px; }.summary-cards { grid-template-columns: 1fr 1fr; }.summary-card { padding: 15px; min-height: 95px; }.metric-icon { display: none; }.todo-row .status-pill { display: none; } }
</style>
