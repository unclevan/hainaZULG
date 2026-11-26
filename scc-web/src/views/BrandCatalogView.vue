<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import PageHeading from "@/shared/PageHeading.vue";
import { useDemoStore } from "@/domain/store";
import { useBrandStore, type Brand, type BrandRequest } from "@/domain/brands";

const store = useBrandStore();
const demo = useDemoStore();
const tab = ref("catalog");
const keyword = ref("");
const dialog = ref(false);
const selectedId = ref("");
const form = reactive({ name: "", alias: "", parentId: "", active: true });
const requestDialog = ref(false);
const selectedRequest = ref<BrandRequest>();
const action = ref<"create" | "link" | "return">("create");
const decision = ref("");
const rows = computed(() => store.data.brands.filter(brand =>
  [brand.name, brand.alias, store.brandName(brand.parentId)].some(name => name.toLowerCase().includes(keyword.value.trim().toLowerCase()))));
const pending = computed(() => store.data.requests.filter(item => item.status === "pending").length);
const activeBrands = computed(() => store.data.brands.filter(brand => brand.active));

function edit(brand?: Brand) {
  selectedId.value = brand?.id || "";
  Object.assign(form, brand
    ? { name: brand.name, alias: brand.alias, parentId: brand.parentId, active: brand.active }
    : { name: "", alias: "", parentId: "", active: true });
  dialog.value = true;
}

async function save() {
  const current = store.data.brands.find(brand => brand.id === selectedId.value);
  if (current?.active && !form.active) {
    try {
      await ElMessageBox.confirm("停用后，供应商无法为该品牌提交新资质。已有记录仍可查询。", "停用品牌", { type: "warning" });
    } catch { return; }
  }
  try {
    store.saveBrand({ ...form }, selectedId.value);
    dialog.value = false;
    ElMessage.success("品牌档案已保存");
  } catch (error) { ElMessage.warning((error as Error).message); }
}

function openRequest(request: BrandRequest) {
  selectedRequest.value = request;
  action.value = "create";
  decision.value = "";
  requestDialog.value = true;
}

function reviewRequest() {
  if (!selectedRequest.value) return;
  try {
    store.reviewRequest(selectedRequest.value.id, action.value, decision.value);
    requestDialog.value = false;
    ElMessage.success("品牌申请已处理");
  } catch (error) { ElMessage.warning((error as Error).message); }
}
</script>

<template>
  <div>
    <PageHeading eyebrow="商品管理" title="品牌档案" description="维护品牌及其上下级关系，处理供应商提交的新品牌申请。">
      <el-button type="primary" @click="edit()">新增品牌</el-button>
    </PageHeading>
    <section class="surface brand-catalog">
      <el-tabs v-model="tab">
        <el-tab-pane label="品牌档案" name="catalog">
          <div class="toolbar"><el-input v-model="keyword" clearable placeholder="搜索品牌、别名或上级品牌" style="max-width: 300px" /></div>
          <el-table :data="rows" row-key="id" empty-text="暂无匹配品牌">
            <el-table-column prop="name" label="品牌名称" min-width="170" />
            <el-table-column label="别名" min-width="150"><template #default="{ row }">{{ row.alias || "—" }}</template></el-table-column>
            <el-table-column label="上级品牌" min-width="150"><template #default="{ row }">{{ store.brandName(row.parentId) }}</template></el-table-column>
            <el-table-column label="状态" width="120"><template #default="{ row }"><el-tag :type="row.active ? 'success' : 'info'" effect="light">{{ row.active ? "启用" : "停用" }}</el-tag></template></el-table-column>
            <el-table-column label="操作" width="100"><template #default="{ row }"><el-button link type="primary" @click="edit(row)">编辑</el-button></template></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane :label="pending ? `新品牌申请 (${pending})` : '新品牌申请'" name="requests">
          <el-table :data="store.data.requests" row-key="id" empty-text="暂无新品牌申请">
            <el-table-column prop="name" label="申请品牌" min-width="130" />
            <el-table-column label="供应商" min-width="180"><template #default="{ row }">{{ demo.getSupplier(row.supplierId)?.name || "—" }}</template></el-table-column>
            <el-table-column prop="note" label="申请说明" min-width="150" show-overflow-tooltip />
            <el-table-column label="处理结果" min-width="150"><template #default="{ row }">
              {{ row.status === "approved" ? store.brandName(row.brandId) : row.status === "returned" ? row.reviewNote : "待处理" }}
            </template></el-table-column>
            <el-table-column label="操作" width="100"><template #default="{ row }"><el-button v-if="row.status === 'pending'" link type="primary" @click="openRequest(row)">处理</el-button></template></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </section>
    <el-dialog v-model="dialog" :title="selectedId ? '编辑品牌' : '新增品牌'" width="min(520px, 94vw)">
      <el-form label-position="top" @submit.prevent="save">
        <el-form-item label="品牌名称" required><el-input v-model="form.name" maxlength="80" /></el-form-item>
        <el-form-item label="别名"><el-input v-model="form.alias" maxlength="80" /></el-form-item>
        <el-form-item label="上级品牌"><el-select v-model="form.parentId" clearable filterable placeholder="可选">
          <el-option v-for="brand in store.data.brands.filter(item => item.id !== selectedId)" :key="brand.id" :label="brand.name" :value="brand.id" />
        </el-select></el-form-item>
        <el-form-item label="启用状态"><el-switch v-model="form.active" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialog = false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
    <el-dialog v-model="requestDialog" title="处理新品牌申请" width="min(520px, 94vw)">
      <el-form v-if="selectedRequest" label-position="top">
        <el-form-item label="申请品牌">{{ selectedRequest.name }}</el-form-item>
        <el-form-item v-if="selectedRequest.note" label="申请说明">{{ selectedRequest.note }}</el-form-item>
        <el-form-item label="处理方式"><el-radio-group v-model="action" @change="decision = ''">
          <el-radio value="create">新增品牌</el-radio><el-radio value="link">关联现有品牌</el-radio><el-radio value="return">退回</el-radio>
        </el-radio-group></el-form-item>
        <el-form-item v-if="action === 'link'" label="现有品牌" required><el-select v-model="decision" filterable>
          <el-option v-for="brand in activeBrands" :key="brand.id" :label="brand.name" :value="brand.id" />
        </el-select></el-form-item>
        <el-form-item v-if="action === 'return'" label="退回原因" required><el-input v-model="decision" type="textarea" maxlength="300" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="requestDialog = false">取消</el-button><el-button type="primary" @click="reviewRequest">确认处理</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>
.brand-catalog { padding: 0 20px 18px; }
.brand-catalog .toolbar { padding-left: 0; padding-right: 0; }
</style>
