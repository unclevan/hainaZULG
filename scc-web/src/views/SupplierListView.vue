<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Download, Plus, Search } from "@element-plus/icons-vue";
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
const dialogOpen = ref(false);
const createForm = reactive({ name: "", category: "食品经销" as Supplier["category"], creditCode: "", phone: "" });
const filtered = computed(() => store.suppliers.filter(s => {
  const matchesText = !keyword.value || `${s.name}${s.code}${s.creditCode}`.toLowerCase().includes(keyword.value.toLowerCase());
  return matchesText && (!filterStatus.value || s.submissionStatus === filterStatus.value);
}));
const paged = computed(() => filtered.value.slice((currentPage.value - 1) * 10, currentPage.value * 10));
watch([keyword, filterStatus], () => { currentPage.value = 1; });
function createSupplier() {
  if (!createForm.name.trim()) { ElMessage.warning("请输入供应商名称"); return; }
  const result = store.addSupplier({ name: createForm.name.trim(), category: createForm.category, creditCode: createForm.creditCode.trim(), phone: createForm.phone.trim() });
  dialogOpen.value = false;
  Object.assign(createForm, { name: "", category: "食品经销", creditCode: "", phone: "" });
  ElMessage.success(`供应商 ${result.code} 已创建`);
  router.push(`/suppliers/${result.id}`);
}
function exportDemo() {
  const lines = ["供应商编码,供应商名称,经营类型,年度更新状态,资料完整度", ...filtered.value.map(s => `${s.code},${s.name},${s.category},${s.submissionStatus},${s.completion}%`)];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = "供应商名录.csv"; link.click(); URL.revokeObjectURL(url);
}
</script>

<template>
  <div><PageHeading eyebrow="SUPPLIER DIRECTORY / 基础资料" title="供应商名录" description="集中管理供应商档案，跟踪 2027 年度资料更新进度。">
    <el-button @click="exportDemo"><el-icon><Download /></el-icon> 导出当前列表</el-button>
    <el-button v-if="store.role === 'admin'" type="primary" @click="dialogOpen = true"><el-icon><Plus /></el-icon> 新增供应商</el-button>
  </PageHeading>
  <div class="list-insights"><div class="insight"><span>供应商总数</span><strong>{{ store.suppliers.length }}</strong><small>家合作供应商</small></div><div class="insight"><span>已提交</span><strong>{{ store.suppliers.filter(s => s.submissionStatus === 'pending' || s.submissionStatus === 'approved').length }}</strong><small>含待审核与已通过</small></div><div class="insight"><span>待补正</span><strong>{{ store.suppliers.filter(s => s.submissionStatus === 'returned').length }}</strong><small>需供应商重新提交</small></div></div>
  <section class="surface"><div class="surface-header"><div><h2>供应商列表</h2><p>按编码、名称或年度状态查找供应商</p></div><span class="muted small-text">共 {{ filtered.length }} 条</span></div>
    <div class="toolbar"><el-input v-model="keyword" :prefix-icon="Search" clearable placeholder="搜索名称、编码或统一社会信用代码" style="width: 300px" /><el-select v-model="filterStatus" placeholder="年度更新状态" clearable style="width: 156px"><el-option label="未开始" value="not_started" /><el-option label="草稿中" value="draft" /><el-option label="待审核" value="pending" /><el-option label="待补正" value="returned" /><el-option label="已通过" value="approved" /></el-select><div class="toolbar-spacer"></div><el-button text @click="keyword = ''; filterStatus = ''">清空筛选</el-button></div>
    <div class="table-wrap"><el-table :data="paged" row-key="id" style="width: 100%" empty-text="没有符合条件的供应商"><el-table-column label="供应商" min-width="240"><template #default="{ row }"><div class="supplier-cell"><span class="supplier-icon">{{ row.name.slice(0, 1) }}</span><div><strong class="text-link" @click="router.push(`/suppliers/${row.id}`)">{{ row.name }}</strong><small>企业资料 · {{ row.category }}</small></div></div></template></el-table-column><el-table-column prop="code" label="供应商编码" width="140"><template #default="{ row }"><span class="code-text">{{ row.code }}</span></template></el-table-column><el-table-column prop="category" label="经营类型" width="120" /><el-table-column label="年度状态" width="120"><template #default="{ row }"><StatusPill :value="row.submissionStatus" /></template></el-table-column><el-table-column label="资料完整度" width="160"><template #default="{ row }"><div class="progress-cell"><el-progress :percentage="row.completion" :stroke-width="6" :show-text="false" /><span>{{ row.completion }}%</span></div></template></el-table-column><el-table-column prop="lastUpdated" label="最近更新" width="125" /><el-table-column label="操作" width="120" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="router.push(`/suppliers/${row.id}`)">查看档案</el-button></template></el-table-column></el-table></div><ResultListFooter v-model:page="currentPage" :total="filtered.length" />
  </section>
  <el-dialog v-model="dialogOpen" title="新增供应商" width="520px"><div class="info-note" style="margin-bottom: 19px">新增供应商将按现行编码规则分配七位供应商编码。</div><el-form label-position="top"><el-form-item label="供应商名称" required><el-input v-model="createForm.name" placeholder="请输入企业全称" /></el-form-item><el-form-item label="经营类型"><el-select v-model="createForm.category" style="width: 100%"><el-option label="食品经销" value="食品经销" /><el-option label="食品生产" value="食品生产" /><el-option label="百货" value="百货" /><el-option label="综合" value="综合" /></el-select></el-form-item><el-form-item label="统一社会信用代码"><el-input v-model="createForm.creditCode" placeholder="请输入统一社会信用代码" /></el-form-item><el-form-item label="联系电话"><el-input v-model="createForm.phone" placeholder="请输入联系电话" /></el-form-item></el-form><template #footer><el-button @click="dialogOpen = false">取消</el-button><el-button type="primary" @click="createSupplier">创建供应商</el-button></template></el-dialog>
  </div>
</template>

<style scoped>
.list-insights { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; margin-bottom: 18px; }.insight { display: flex; align-items: baseline; gap: 9px; padding: 18px 21px; border: 1px solid #e9edf3; border-radius: 11px; background: #fff; }.insight span { flex: 1; color: #8795a7; font-size: 12px; }.insight strong { color: #2c4866; font-size: 24px; }.insight small { color: #a4b0be; font-size: 10px; }.supplier-cell { display: flex; align-items: center; gap: 10px; }.supplier-icon { width: 34px; height: 34px; display: grid; place-items: center; flex: 0 0 34px; border-radius: 8px; background: #ebf3fb; color: #3477bb; font-size: 14px; font-weight: 700; }.supplier-cell div { display: flex; flex-direction: column; gap: 4px; min-width: 0; }.supplier-cell strong { overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }.supplier-cell small { color: #9aa9b7; font-size: 10px; }.progress-cell { display: flex; align-items: center; gap: 8px; }.progress-cell .el-progress { flex: 1; }.progress-cell span { width: 32px; color: #8191a3; font-size: 11px; }@media (max-width: 760px) { .list-insights { grid-template-columns: 1fr; }.insight small { display: none; }.toolbar .el-input,.toolbar .el-select { width: 100% !important; } }
</style>
