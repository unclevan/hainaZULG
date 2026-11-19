<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowRight, Check, Document, Search } from "@element-plus/icons-vue";
import PageHeading from "@/shared/PageHeading.vue";
import ResultListFooter from "@/shared/ResultListFooter.vue";
import StatusPill from "@/shared/StatusPill.vue";
import { useDemoStore } from "@/domain/store";
import type { Supplier } from "@/domain/types";

const store = useDemoStore();
const router = useRouter();
const keyword = ref("");
const filterStatus = ref("");
const currentPage = ref(1);
const drawerOpen = ref(false);
const selected = ref<Supplier | null>(null);
const reviewNote = ref("");
const rows = computed(() => store.suppliers.filter(s => s.submissionStatus !== "not_started" && (!filterStatus.value || s.submissionStatus === filterStatus.value) && (!keyword.value || `${s.name}${s.code}`.includes(keyword.value))));
const pagedRows = computed(() => rows.value.slice((currentPage.value - 1) * 10, currentPage.value * 10));
watch([keyword, filterStatus], () => { currentPage.value = 1; });
function openReview(item: Supplier) { selected.value = item; reviewNote.value = item.reviewNote; drawerOpen.value = true; }
async function decide(approved: boolean) {
  if (!selected.value) return;
  if (!approved && !reviewNote.value.trim()) { ElMessage.warning("退回时请填写补正意见"); return; }
  try {
    await ElMessageBox.confirm(approved ? "确认通过此供应商的 2027 年度资料？" : "确认退回资料并通知供应商补正？", approved ? "审核通过" : "退回补正", { confirmButtonText: "确认", cancelButtonText: "取消", type: approved ? "success" : "warning" });
    store.reviewSupplier(selected.value.id, approved, approved ? "2027 年度资料审核通过。" : reviewNote.value.trim());
    drawerOpen.value = false;
    ElMessage.success(approved ? "已通过（演示）" : "已退回补正（演示）");
  } catch { /* cancelled */ }
}
</script>

<template>
  <div><PageHeading eyebrow="REVIEW CENTER / 采购审核" title="资料审核" description="核对供应商年度资料、联系人与证照，保留审核意见和处理轨迹。"><el-button type="primary" plain @click="router.push('/suppliers')">查看供应商名录 <el-icon class="el-icon--right"><ArrowRight /></el-icon></el-button></PageHeading>
  <div class="review-overview"><div class="review-card surface"><span>待审核</span><strong>{{ store.pendingCount }}</strong><p>供应商新提交的资料</p></div><div class="review-card surface"><span>待补正</span><strong>{{ store.suppliers.filter(s => s.submissionStatus === 'returned').length }}</strong><p>已反馈补正意见</p></div><div class="review-card surface"><span>已通过</span><strong>{{ store.suppliers.filter(s => s.submissionStatus === 'approved').length }}</strong><p>2027 年度资料</p></div></div>
  <section class="surface"><div class="surface-header"><div><h2>年度资料申请</h2><p>演示流程：打开详情 → 核对 → 通过或退回</p></div><span class="muted small-text">共 {{ rows.length }} 条</span></div><div class="toolbar"><el-input v-model="keyword" :prefix-icon="Search" clearable placeholder="搜索供应商名称或编码" style="width:280px" /><el-select v-model="filterStatus" clearable placeholder="全部状态" style="width:150px"><el-option label="草稿中" value="draft" /><el-option label="待审核" value="pending" /><el-option label="待补正" value="returned" /><el-option label="已通过" value="approved" /></el-select></div><div class="table-wrap"><el-table :data="pagedRows" empty-text="暂无相关申请"><el-table-column label="供应商" min-width="260"><template #default="{ row }"><div class="review-supplier"><span><el-icon><Document /></el-icon></span><div><strong>{{ row.name }}</strong><small>供应商编码 {{ row.code }} · {{ row.category }}</small></div></div></template></el-table-column><el-table-column label="年度" width="95"><template #default>2027</template></el-table-column><el-table-column label="提交内容" min-width="190"><template #default="{ row }"><span class="muted">企业资料 · {{ row.contacts.length }} 位联系人 · {{ row.qualifications.length }} 项证照</span></template></el-table-column><el-table-column prop="lastUpdated" label="最近更新" width="135" /><el-table-column label="状态" width="120"><template #default="{ row }"><StatusPill :value="row.submissionStatus" /></template></el-table-column><el-table-column label="操作" width="110" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openReview(row)">{{ row.submissionStatus === 'pending' ? '开始审核' : '查看详情' }}</el-button></template></el-table-column></el-table></div><ResultListFooter v-model:page="currentPage" :total="rows.length" /></section>
  <el-drawer v-model="drawerOpen" size="min(550px, 100vw)" :title="selected?.name || '资料审核'" class="review-drawer"><div v-if="selected" class="drawer-body"><div class="drawer-heading"><div><span>2027 年度资料</span><h3>{{ selected.name }}</h3><small>供应商编码 {{ selected.code }}</small></div><StatusPill :value="selected.submissionStatus" /></div><div class="drawer-section"><h4>本次提交概览</h4><div class="review-facts"><div><span>经营类型</span><strong>{{ selected.category }}</strong></div><div><span>联系人</span><strong>{{ selected.contacts.length }} 位</strong></div><div><span>资质证照</span><strong>{{ selected.qualifications.length }} 项</strong></div><div><span>资料完整度</span><strong>{{ selected.completion }}%</strong></div></div></div><div class="drawer-section"><h4>企业信息</h4><div class="detail-list"><div><span>统一社会信用代码</span><strong>{{ selected.creditCode || '待完善' }}</strong></div><div><span>法定代表人</span><strong>{{ selected.legalPerson || '待完善' }}</strong></div><div><span>注册地址</span><strong>{{ selected.registeredAddress || '待完善' }}</strong></div><div><span>企业电话</span><strong>{{ selected.phone || '待完善' }}</strong></div></div></div><div class="drawer-section"><h4>资质证照</h4><div v-for="q in selected.qualifications" :key="q.id" class="drawer-doc"><span>{{ q.type }}</span><StatusPill :value="q.status" /></div></div><div class="drawer-section"><el-button link type="primary" @click="drawerOpen = false; router.push(`/suppliers/${selected.id}`)">查看完整供应商档案 <el-icon><ArrowRight /></el-icon></el-button></div><div v-if="selected.submissionStatus === 'pending'" class="drawer-section"><h4>审核意见</h4><el-input v-model="reviewNote" type="textarea" :rows="3" placeholder="退回时请说明需要补正的内容" /></div><div v-if="selected.reviewNote && selected.submissionStatus !== 'pending'" class="info-note">最近审核意见：{{ selected.reviewNote }}</div></div><template #footer><div v-if="selected?.submissionStatus === 'pending'" class="drawer-actions"><el-button @click="decide(false)">退回补正</el-button><el-button type="primary" @click="decide(true)"><el-icon><Check /></el-icon> 审核通过</el-button></div><el-button v-else @click="drawerOpen = false">关闭</el-button></template></el-drawer>
  </div>
</template>

<style scoped>
.review-overview { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; margin-bottom: 18px; }.review-card { padding: 20px 23px; }.review-card span { color: #8594a6; font-size: 12px; }.review-card strong { display: block; margin: 5px 0; color: #315a7e; font-size: 29px; }.review-card p { margin: 0; color: #a2afbd; font-size: 10px; }.review-supplier { display: flex; align-items: center; gap: 10px; }.review-supplier > span { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 8px; background: #edf4fb; color: #3b80c5; }.review-supplier div { display: flex; flex-direction: column; gap: 4px; }.review-supplier strong { color: #3a5067; font-size: 12px; }.review-supplier small { color: #9eabba; font-size: 10px; }.drawer-body { padding: 0 24px 24px; }.drawer-heading { display: flex; align-items: flex-start; justify-content: space-between; padding: 15px 0 22px; border-bottom: 1px solid #edf0f4; }.drawer-heading span { color: #3382c9; font-size: 10px; }.drawer-heading h3 { margin: 5px 0; color: #2d435b; font-size: 19px; }.drawer-heading small { color: #96a5b5; font-size: 11px; }.drawer-section { padding: 20px 0; border-bottom: 1px solid #eef1f4; }.drawer-section h4 { margin: 0 0 15px; color: #41566c; font-size: 12px; }.review-facts { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }.review-facts div,.detail-list div { display: flex; flex-direction: column; gap: 5px; }.review-facts span,.detail-list span { color: #9cabb9; font-size: 10px; }.review-facts strong,.detail-list strong { color: #4e6278; font-size: 12px; font-weight: 600; }.detail-list { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }.drawer-doc { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; font-size: 11px; color: #50667e; }.drawer-actions { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 8px; }@media(max-width:760px) { .review-overview { grid-template-columns: 1fr; }.toolbar .el-input,.toolbar .el-select { width: 100% !important; } }
</style>
