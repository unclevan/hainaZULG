<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type { UploadFile } from "element-plus";
import { Document, Plus, Search, UploadFilled, Warning } from "@element-plus/icons-vue";
import PageHeading from "@/shared/PageHeading.vue";
import ResultListFooter from "@/shared/ResultListFooter.vue";
import StatusPill from "@/shared/StatusPill.vue";
import { useDemoStore } from "@/domain/store";
import { isSupplierRole } from "@/shared/navigation";

const store = useDemoStore();
const supplierFilter = ref("");
const keyword = ref("");
const currentPage = ref(1);
const uploadOpen = ref(false);
const selectedFile = ref<File | null>(null);
const uploadForm = reactive({ type: "营业执照", number: "", validUntil: "" });
const visible = computed(() => store.suppliers.flatMap(s => s.qualifications.map(q => ({ ...q, supplierId: s.id, supplierName: s.name, supplierCode: s.code }))).filter(q => (!isSupplierRole(store.role) || q.supplierId === store.activeSupplierId) && (!supplierFilter.value || q.supplierId === supplierFilter.value) && (!keyword.value || `${q.type}${q.number}${q.supplierName}`.includes(keyword.value))));
const paged = computed(() => visible.value.slice((currentPage.value - 1) * 10, currentPage.value * 10));
watch([keyword, supplierFilter], () => { currentPage.value = 1; });
const totals = computed(() => ({ all: visible.value.length, expiring: visible.value.filter(q => q.status === "expiring").length, expired: visible.value.filter(q => q.status === "expired").length }));
function onFileChange(file: UploadFile) { selectedFile.value = file.raw || null; }
function addQualification() {
  if (!uploadForm.number.trim() || !uploadForm.validUntil || !selectedFile.value) { ElMessage.warning("请填写证照编号、有效期并选择文件"); return; }
  const target = store.role === "supplier" ? store.activeSupplierId : supplierFilter.value || store.suppliers[0].id;
  if (store.getSupplier(target)?.submissionStatus === "pending") { ElMessage.warning("资料待审核期间不可新增证照"); return; }
  store.addQualification(target, { type: uploadForm.type, number: uploadForm.number.trim(), validUntil: uploadForm.validUntil, fileName: selectedFile.value.name });
  uploadOpen.value = false;
  selectedFile.value = null;
  Object.assign(uploadForm, { type: "营业执照", number: "", validUntil: "" });
  ElMessage.success("证照信息已保存");
}
</script>

<template>
  <div><PageHeading eyebrow="COMPLIANCE / 资质管理" title="资质证照" description="查看供应商证照及有效期，及时处理临期与待补传事项。"><el-button v-if="store.role === 'supplier'" type="primary" :disabled="store.activeSupplier?.submissionStatus === 'pending'" @click="uploadOpen = true"><el-icon><Plus /></el-icon> 上传资质证照</el-button></PageHeading>
  <div class="qualification-summary"><div class="q-summary surface"><div class="q-icon blue"><el-icon><Document /></el-icon></div><div><span>证照总数</span><strong>{{ totals.all }}</strong></div></div><div class="q-summary surface"><div class="q-icon amber"><el-icon><Warning /></el-icon></div><div><span>即将到期</span><strong>{{ totals.expiring }}</strong></div></div><div class="q-summary surface"><div class="q-icon red"><el-icon><Warning /></el-icon></div><div><span>已过期</span><strong>{{ totals.expired }}</strong></div></div></div>
  <section class="surface"><div class="surface-header"><div><h2>证照档案</h2><p>包括历史上传记录及审核状态</p></div><span class="muted small-text">共 {{ visible.length }} 项</span></div><div class="toolbar"><el-input v-model="keyword" :prefix-icon="Search" clearable placeholder="搜索证照类型、编号或供应商" style="width:290px" /><el-select v-if="!isSupplierRole(store.role)" v-model="supplierFilter" clearable placeholder="全部供应商" style="width:240px"><el-option v-for="s in store.suppliers" :key="s.id" :label="s.name" :value="s.id" /></el-select><div class="toolbar-spacer"></div></div><div class="table-wrap"><el-table :data="paged" empty-text="暂无证照记录"><el-table-column label="证照" min-width="230"><template #default="{ row }"><div class="doc-cell"><span><el-icon><Document /></el-icon></span><div><strong>{{ row.type }}</strong><small>{{ row.fileName }}</small></div></div></template></el-table-column><el-table-column v-if="!isSupplierRole(store.role)" prop="supplierName" label="供应商" min-width="210" /><el-table-column prop="number" label="证照编号" min-width="180" /><el-table-column prop="validUntil" label="有效期至" width="130" /><el-table-column prop="uploadedAt" label="上传日期" width="130" /><el-table-column label="状态" width="120"><template #default="{ row }"><StatusPill :value="row.status" /></template></el-table-column><el-table-column label="操作" width="95" fixed="right"><template #default><el-button link type="primary" @click="ElMessage.info('附件预览功能建设中')">查看记录</el-button></template></el-table-column></el-table></div><ResultListFooter v-model:page="currentPage" :total="visible.length" /></section>
  <el-dialog v-model="uploadOpen" title="上传资质证照" width="560px"><div class="info-note" style="margin-bottom:17px">请填写证照信息并选择附件。</div><el-upload drag action="#" :auto-upload="false" :show-file-list="true" accept=".pdf,.jpg,.jpeg,.png" :limit="1" :on-change="onFileChange"><el-icon class="upload-icon"><UploadFilled /></el-icon><div>点击或拖拽 PDF / JPG / PNG 文件到此处</div><small>单次上传一个文件</small></el-upload><el-form label-position="top" class="upload-form"><el-form-item label="证照类型"><el-select v-model="uploadForm.type" style="width:100%"><el-option label="营业执照" value="营业执照" /><el-option label="食品生产许可证" value="食品生产许可证" /><el-option label="食品经营许可证" value="食品经营许可证" /><el-option label="其他资质" value="其他资质" /></el-select></el-form-item><el-form-item label="证照编号" required><el-input v-model="uploadForm.number" placeholder="请输入证照编号" /></el-form-item><el-form-item label="有效期至" required><el-date-picker v-model="uploadForm.validUntil" type="date" value-format="YYYY-MM-DD" placeholder="选择有效期" style="width:100%" /></el-form-item></el-form><template #footer><el-button @click="uploadOpen = false">取消</el-button><el-button type="primary" @click="addQualification">保存证照</el-button></template></el-dialog>
  </div>
</template>

<style scoped>
.qualification-summary { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; margin-bottom: 18px; }.q-summary { display: flex; align-items: center; gap: 16px; padding: 20px 22px; }.q-icon { display: grid; place-items: center; width: 43px; height: 43px; border-radius: 10px; font-size: 20px; }.q-icon.blue { color: #327bca; background: #eaf3ff; }.q-icon.amber { color: #cb983b; background: #fff5e5; }.q-icon.red { color: #d26b76; background: #fff0f1; }.q-summary div:last-child { display: flex; flex-direction: column; gap: 3px; }.q-summary span { color: #8797a8; font-size: 12px; }.q-summary strong { color: #32475d; font-size: 26px; }.doc-cell { display: flex; align-items: center; gap: 11px; }.doc-cell > span { display: grid; place-items: center; width: 35px; height: 35px; border-radius: 8px; color: #3680ca; background: #ebf4ff; font-size: 17px; }.doc-cell div { display: flex; flex-direction: column; gap: 4px; }.doc-cell strong { color: #3a4d63; font-size: 12px; }.doc-cell small { color: #a2afbe; font-size: 10px; }.upload-icon { margin-bottom: 8px; color: #4b8ed1; font-size: 34px; }.upload-form { margin-top: 18px; }.upload-form :deep(.el-form-item) { margin-bottom: 13px; }@media(max-width:760px) { .qualification-summary { grid-template-columns: 1fr; }.toolbar .el-input,.toolbar .el-select { width: 100% !important; } }
</style>
