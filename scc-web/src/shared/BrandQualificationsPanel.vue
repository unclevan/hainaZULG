<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useDemoStore } from "@/domain/store";
import { businessDate, relationLabel, scopeLabel, useBrandStore, type BrandQualification, type BrandQualificationInput, type Evidence } from "@/domain/brands";
import { downloadEvidence, removeEvidence, saveEvidence } from "@/domain/brandEvidence";
import { useCategoryStore, type Category } from "@/domain/categories";

const props = defineProps<{ mode: "supplier" | "review" | "profile"; supplierId?: string }>();
const demo = useDemoStore();
const store = useBrandStore();
const categoryStore = useCategoryStore();
const keyword = ref("");
const filter = ref(props.mode === "review" ? "pending" : "");
const open = ref(false);
const saving = ref(false);
const source = ref<BrandQualification>();
const details = ref("");
const detailOpen = ref(false);
const note = ref("");
const requestOpen = ref(false);
const requestForm = reactive({ name: "", note: "" });
const files = ref<File[]>([]);
const fileInput = ref<HTMLInputElement>();

const blank = (): BrandQualificationInput => ({
  brandId: "", relation: "owner", rightsHolder: demo.activeSupplier?.name || "", authorizer: "",
  scope: "brand", scopeItems: [], restrictions: "", validFrom: "", validUntil: "", evidence: []
});
const form = reactive(blank());
const scopeText = ref("");
const legacyScopeNeedsRemap = ref(false);
interface CategoryOption { value: string; label: string; disabled: boolean; children?: CategoryOption[] }
const categoryProps = { multiple: true, checkStrictly: true, emitPath: false, value: "value", label: "label", children: "children" };
const categoryOptions = computed(() => {
  const rows = categoryStore.categories();
  const descendants = (parentId: string): CategoryOption[] =>
    rows.filter(row => row.parentId === parentId).map((row: Category) => {
      const children = descendants(row.id);
      return { value: row.id, label: `${row.name} (${row.code})`, disabled: !categoryStore.isSelectable(row.id), ...(children.length ? { children } : {}) };
    });
  return descendants("");
});
const scopeSummary = (item: BrandQualification) => item.scopeItems.length
  ? item.scopeItems.map(value => item.scope === "category" ? categoryStore.path(value) || value : value).join("、")
  : scopeLabel[item.scope];
const rows = computed(() => store.data.qualifications.filter(item => {
  if (props.supplierId && item.supplierId !== props.supplierId) return false;
  if (filter.value && item.status !== filter.value) return false;
  if (filter.value === "returned" && store.qualificationState(item).label === "已补正") return false;
  const text = keyword.value.trim().toLowerCase();
  return !text || [store.brandName(item.brandId), demo.getSupplier(item.supplierId)?.name || ""].some(value => value.toLowerCase().includes(text));
}));
const activeBrands = computed(() => store.data.brands.filter(brand => brand.active));
const selected = computed(() => store.data.qualifications.find(item => item.id === details.value));
const requests = computed(() => store.data.requests.filter(item => item.supplierId === props.supplierId));
const dueCount = computed(() => store.data.qualifications.filter(item =>
  item.supplierId === props.supplierId && ["即将到期", "已到期"].includes(store.qualificationState(item).label)).length);

watch(() => props.supplierId, () => {
  open.value = false;
  detailOpen.value = false;
  requestOpen.value = false;
});

function edit(item?: BrandQualification) {
  source.value = item;
  Object.assign(form, item ? {
    brandId: item.brandId, relation: item.relation, rightsHolder: item.rightsHolder, authorizer: item.authorizer,
    scope: item.scope, scopeItems: [...item.scopeItems], restrictions: item.restrictions,
    validFrom: item.status === "returned" ? item.validFrom : "",
    validUntil: item.status === "returned" ? item.validUntil : "",
    evidence: item.status === "returned" ? [...item.evidence] : []
  } : blank());
  legacyScopeNeedsRemap.value = item?.scope === "category" && item.scopeItems.some(id => !categoryStore.category(id)) || false;
  if (item?.scope === "category") form.scopeItems = item.scopeItems.filter(id => !!categoryStore.category(id));
  scopeText.value = item?.scope === "product" ? form.scopeItems.join("、") : "";
  files.value = [];
  if (fileInput.value) fileInput.value.value = "";
  open.value = true;
}

function onFiles(event: Event) {
  const input = event.target as HTMLInputElement;
  const selectedFiles = Array.from(input.files || []);
  if (selectedFiles.some(file => !/\.(pdf|png|jpe?g)$/i.test(file.name) || !file.size || file.size > 10 * 1024 * 1024)) {
    ElMessage.warning("请选择非空的 PDF、PNG 或 JPG 文件，每份不超过 10 MB");
    input.value = "";
    return;
  }
  files.value = [...files.value, ...selectedFiles];
  input.value = "";
}

async function submit() {
  if (!props.supplierId || saving.value) return;
  const scopeItems = form.scope === "category"
    ? [...new Set(form.scopeItems)]
    : [...new Set(scopeText.value.split(/[、，,\n]/).map(item => item.trim()).filter(Boolean))];
  const target = props.supplierId;
  const input = { ...form, scopeItems, evidence: [...form.evidence] };
  const sourceId = source.value?.id;
  let uploaded: Evidence[] = [];
  saving.value = true;
  try {
    store.validateQualification(input);
    uploaded = await saveEvidence(files.value);
    store.submitQualification(target, { ...input, evidence: [...input.evidence, ...uploaded] }, sourceId);
    open.value = false;
    ElMessage.success("品牌资质已提交审核");
  } catch (error) {
    await removeEvidence(uploaded).catch(() => {});
    ElMessage.warning((error as Error)?.message || "保存证明材料失败");
  }
  finally { saving.value = false; }
}

function changeScope() {
  form.scopeItems = [];
  scopeText.value = "";
  legacyScopeNeedsRemap.value = false;
}

function view(item: BrandQualification) {
  details.value = item.id;
  note.value = "";
  detailOpen.value = true;
}

function canReplace(item: BrandQualification) {
  if (item.status === "pending") return false;
  const previousId = item.status === "returned" ? item.previousId : item.id;
  return !store.data.qualifications.some(next =>
    next.resubmissionOfId === item.id ||
    (previousId && next.previousId === previousId && next.status !== "returned"));
}

function decide(approved: boolean) {
  if (!selected.value) return;
  try {
    store.reviewQualification(selected.value.id, approved, note.value);
    detailOpen.value = false;
    ElMessage.success(approved ? "品牌资质已通过" : "品牌资质已退回");
  } catch (error) { ElMessage.warning((error as Error).message); }
}

function submitRequest() {
  if (!props.supplierId) return;
  try {
    store.submitRequest(props.supplierId, requestForm.name, requestForm.note);
    requestOpen.value = false;
    Object.assign(requestForm, { name: "", note: "" });
    ElMessage.success("品牌申请已提交");
  } catch (error) { ElMessage.warning((error as Error).message); }
}

async function download(item: Evidence) {
  try { await downloadEvidence(item); }
  catch (error) { ElMessage.warning((error as Error).message); }
}
</script>

<template>
  <div>
    <section :class="{ surface: mode === 'supplier' }">
      <div v-if="mode === 'supplier'" class="surface-header">
        <div><h2>本企业品牌资质</h2><p v-if="dueCount">{{ dueCount }} 项资质临期或已到期</p></div>
        <div class="brand-actions">
          <el-button @click="requestOpen = true">申请新品牌</el-button>
          <el-button type="primary" @click="edit()">提交品牌资质</el-button>
        </div>
      </div>
      <div v-if="mode !== 'profile'" class="toolbar brand-toolbar">
        <el-input v-model="keyword" clearable :placeholder="mode === 'review' ? '搜索品牌或供应商' : '搜索品牌'" style="max-width: 260px" />
        <el-select v-model="filter" clearable placeholder="全部审核状态" style="max-width: 170px">
          <el-option label="待审核" value="pending" /><el-option label="待补正" value="returned" /><el-option label="已通过" value="approved" />
        </el-select>
      </div>
      <el-table :data="rows" row-key="id" empty-text="暂无品牌资质">
        <el-table-column v-if="mode === 'review'" label="供应商" min-width="170"><template #default="{ row }">{{ demo.getSupplier(row.supplierId)?.name || "—" }}</template></el-table-column>
        <el-table-column label="品牌" min-width="120"><template #default="{ row }">{{ store.brandName(row.brandId) }} · V{{ row.version }}</template></el-table-column>
        <el-table-column label="主体关系" min-width="125"><template #default="{ row }">{{ relationLabel[row.relation as BrandQualification["relation"]] }}</template></el-table-column>
        <el-table-column v-if="mode !== 'profile'" label="供货范围" min-width="140" show-overflow-tooltip><template #default="{ row }">
          {{ scopeSummary(row) }}
        </template></el-table-column>
        <el-table-column label="有效期至" min-width="105"><template #default="{ row }">{{ row.validUntil || "—" }}</template></el-table-column>
        <el-table-column label="状态" width="105"><template #default="{ row }"><el-tag :type="store.qualificationState(row).type" effect="light">{{ store.qualificationState(row).label }}</el-tag></template></el-table-column>
        <el-table-column label="操作" :width="mode === 'supplier' ? 145 : 90"><template #default="{ row }">
          <el-button link type="primary" @click="view(row)">{{ mode === "review" && row.status === "pending" ? "审核" : "详情" }}</el-button>
          <el-button v-if="mode === 'supplier' && canReplace(row)" link type="primary" @click="edit(row)">{{ row.status === "returned" ? "补正" : "续期" }}</el-button>
        </template></el-table-column>
      </el-table>
    </section>

    <section v-if="mode === 'supplier' && requests.length" class="surface requests">
      <div class="surface-header"><h2>我的新品牌申请</h2></div>
      <el-table :data="requests" row-key="id">
        <el-table-column prop="name" label="申请品牌" min-width="150" />
        <el-table-column label="处理状态" min-width="150"><template #default="{ row }">{{ { pending: "待处理", approved: "已通过", returned: "已退回" }[row.status as "pending" | "approved" | "returned"] }}</template></el-table-column>
        <el-table-column label="处理结果" min-width="200"><template #default="{ row }">{{ row.status === "approved" ? store.brandName(row.brandId) : row.reviewNote || "—" }}</template></el-table-column>
      </el-table>
    </section>

    <el-dialog v-if="mode === 'supplier'" v-model="requestOpen" title="申请新品牌" width="min(500px, 94vw)">
      <el-form label-position="top">
        <el-form-item label="品牌名称" required><el-input v-model="requestForm.name" maxlength="80" /></el-form-item>
        <el-form-item label="申请说明"><el-input v-model="requestForm.note" type="textarea" maxlength="300" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="requestOpen = false">取消</el-button><el-button type="primary" @click="submitRequest">提交申请</el-button></template>
    </el-dialog>

    <el-dialog v-if="mode === 'supplier'" v-model="open" :title="source ? (source.status === 'returned' ? '补正品牌资质' : '续期品牌资质') : '提交品牌资质'" width="min(690px, 94vw)" :close-on-click-modal="false">
      <el-alert v-if="source?.status === 'returned'" :title="source.reviewNote" type="warning" :closable="false" show-icon />
      <el-form label-position="top" class="brand-form">
        <el-form-item label="品牌" required><el-select v-model="form.brandId" :disabled="!!source" filterable placeholder="选择品牌">
          <el-option v-for="brand in activeBrands" :key="brand.id" :label="brand.name" :value="brand.id" />
        </el-select></el-form-item>
        <el-form-item label="主体关系" required><el-select v-model="form.relation">
          <el-option v-for="(label, value) in relationLabel" :key="value" :label="label" :value="value" />
        </el-select></el-form-item>
        <el-form-item label="品牌权利人" required><el-input v-model="form.rightsHolder" /></el-form-item>
        <el-form-item v-if="form.relation === 'authorized'" label="直接授权方" required><el-input v-model="form.authorizer" /></el-form-item>
        <el-form-item label="供货范围" required><el-select v-model="form.scope" @change="changeScope">
          <el-option v-for="(label, value) in scopeLabel" :key="value" :label="label" :value="value" />
        </el-select></el-form-item>
        <el-form-item v-if="form.scope === 'category'" label="指定商品品类" required>
          <el-cascader v-model="form.scopeItems" :options="categoryOptions" :props="categoryProps" filterable clearable collapse-tags :max-collapse-tags="2" placeholder="从商品分类目录选择，可多选任一层级" style="width: 100%" />
          <small v-if="legacyScopeNeedsRemap" class="scope-hint">原记录使用自由输入的品类名称，请从分类目录重新选择。</small>
          <small v-else class="muted">停用的分类不可用于新提交；选择上级表示包含其下级。</small>
        </el-form-item>
        <el-form-item v-else-if="form.scope === 'product'" label="指定商品" required>
          <el-input v-model="scopeText" placeholder="输入商品名称或条码" />
          <small class="muted">多项用顿号或逗号分隔</small>
        </el-form-item>
        <el-form-item label="生效日期" required><el-date-picker v-model="form.validFrom" value-format="YYYY-MM-DD" type="date" :placeholder="businessDate()" /></el-form-item>
        <el-form-item label="有效期至" :required="form.relation === 'authorized'"><el-date-picker v-model="form.validUntil" value-format="YYYY-MM-DD" type="date" placeholder="选择结束日期" /></el-form-item>
        <el-form-item label="渠道、地域或指定客户限制" class="wide"><el-input v-model="form.restrictions" type="textarea" maxlength="300" /></el-form-item>
        <el-form-item :label="form.relation === 'owner' ? '权属证明' : '供货授权证明及上游材料'" required class="wide">
          <div class="evidence-list">
            <input ref="fileInput" type="file" accept=".pdf,.png,.jpg,.jpeg" multiple hidden @change="onFiles" />
            <el-button @click="fileInput?.click()">选择文件</el-button>
            <small class="muted">PDF、PNG 或 JPG，每份不超过 10 MB</small>
            <div v-for="(item, index) in form.evidence" :key="item.id">{{ item.name }} <el-button link type="danger" @click="form.evidence.splice(index, 1)">移除</el-button></div>
            <div v-for="(item, index) in files" :key="index">{{ item.name }} <el-button link type="danger" @click="files.splice(index, 1)">移除</el-button></div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer><el-button :disabled="saving" @click="open = false">取消</el-button><el-button type="primary" :loading="saving" @click="submit">提交审核</el-button></template>
    </el-dialog>

    <el-drawer v-model="detailOpen" title="品牌资质详情" size="min(560px, 100vw)">
      <template v-if="selected">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="品牌">{{ store.brandName(selected.brandId) }} · V{{ selected.version }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ demo.getSupplier(selected.supplierId)?.name }}</el-descriptions-item>
          <el-descriptions-item label="主体关系">{{ relationLabel[selected.relation] }}</el-descriptions-item>
          <el-descriptions-item label="品牌权利人">{{ selected.rightsHolder }}</el-descriptions-item>
          <el-descriptions-item v-if="selected.authorizer" label="直接授权方">{{ selected.authorizer }}</el-descriptions-item>
          <el-descriptions-item label="供货范围">{{ scopeLabel[selected.scope] }}<span v-if="selected.scopeItems.length"> · {{ scopeSummary(selected) }}</span></el-descriptions-item>
          <el-descriptions-item label="供货限制">{{ selected.restrictions || "—" }}</el-descriptions-item>
          <el-descriptions-item label="有效期">{{ selected.validFrom }} 至 {{ selected.validUntil || "无截止日期" }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ store.qualificationState(selected).label }}</el-descriptions-item>
          <el-descriptions-item label="提交日期">{{ selected.submittedAt }}</el-descriptions-item>
          <el-descriptions-item v-if="selected.reviewedAt" label="审核日期">{{ selected.reviewedAt }}</el-descriptions-item>
          <el-descriptions-item v-if="selected.reviewNote" label="审核意见">{{ selected.reviewNote }}</el-descriptions-item>
          <el-descriptions-item label="证明材料"><div v-for="item in selected.evidence" :key="item.id">
            <el-button link type="primary" @click="download(item)">{{ item.name }}</el-button>
          </div></el-descriptions-item>
        </el-descriptions>
        <el-form v-if="mode === 'review' && selected.status === 'pending'" label-position="top" class="review-brand-note">
          <el-form-item label="审核意见"><el-input v-model="note" type="textarea" maxlength="300" placeholder="退回时请填写补正要求" /></el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="detailOpen = false">关闭</el-button>
        <template v-if="mode === 'review' && selected?.status === 'pending'">
          <el-button @click="decide(false)">退回补正</el-button><el-button type="primary" @click="decide(true)">审核通过</el-button>
        </template>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.brand-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.brand-actions :deep(.el-button) { margin: 0; }
.brand-toolbar :deep(.el-select) { width: 170px; }
.requests { margin-top: 18px; }
.brand-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 16px; margin-top: 12px; }
.brand-form .wide { grid-column: 1 / -1; }
.brand-form :deep(.el-date-editor) { width: 100%; }
.evidence-list { width: 100%; overflow-wrap: anywhere; }
.scope-hint { color: var(--el-color-warning); }
.evidence-list small { margin-left: 8px; }
.review-brand-note { margin-top: 18px; }
@media (max-width: 580px) { .brand-form { grid-template-columns: 1fr; } }
</style>
