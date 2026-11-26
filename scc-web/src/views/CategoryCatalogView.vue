<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import PageHeading from "@/shared/PageHeading.vue";
import { categoryLevels, useCategoryStore, type Category, type CategoryLevel } from "@/domain/categories";
import { useDemoStore } from "@/domain/store";
import { useBrandStore } from "@/domain/brands";

type TreeCategory = Category & { children?: TreeCategory[] };
const store = useCategoryStore();
const demo = useDemoStore();
const brands = useBrandStore();
const canEdit = computed(() => demo.role === "admin" || demo.role === "reviewer");
const keyword = ref("");
const level = ref<CategoryLevel | "">("");
const showDeleted = ref(false);
const dialog = ref(false);
const selected = ref<Category>();
const form = reactive({ name: "", receiptName: "", enabled: true });
const createDialog = ref(false);
const parent = ref<Category>();
const createForm = reactive({ code: "", name: "", receiptName: "", enabled: true });
const active = computed(() => store.categories());
const all = computed(() => store.categories(showDeleted.value));
const deletedCount = computed(() => store.categories(true).filter(row => row.deleted).length);
const rows = computed<TreeCategory[]>(() => {
  const term = keyword.value.trim().toLowerCase();
  if (term || level.value) return all.value.filter(row =>
    (!level.value || row.level === level.value) &&
    (!term || [row.name, row.code, store.path(row.id)].some(value => value.toLowerCase().includes(term))));
  const byParent = (parentId: string): TreeCategory[] => all.value
    .filter(row => row.parentId === parentId)
    .map(row => ({ ...row, children: byParent(row.id) }));
  return byParent("");
});
const counts = computed(() => Object.fromEntries(
  (Object.keys(categoryLevels) as CategoryLevel[]).map(item => [item, active.value.filter(row => row.level === item).length])
) as Record<CategoryLevel, number>);

function openCreate(row?: Category) {
  if (!canEdit.value || row?.deleted || row?.level === "tc") return;
  parent.value = row;
  Object.assign(createForm, { code: store.suggestCode(row?.id), name: "", receiptName: "", enabled: true });
  createDialog.value = true;
}

function create() {
  if (!canEdit.value) return;
  try {
    store.add(parent.value?.id || "", createForm.code, createForm);
    createDialog.value = false;
    ElMessage.success("分类已新增");
  } catch (error) { ElMessage.warning((error as Error).message); }
}

function edit(row: Category) {
  if (!canEdit.value) return;
  selected.value = row;
  Object.assign(form, { name: row.name, receiptName: row.receiptName, enabled: row.enabled });
  dialog.value = true;
}

function save() {
  if (!selected.value || !canEdit.value) return;
  try {
    store.save(selected.value.id, form);
    dialog.value = false;
    ElMessage.success("分类已保存");
  } catch (error) { ElMessage.warning((error as Error).message); }
}

async function remove(row: Category) {
  if (!canEdit.value) return;
  if (store.children(row.id).length) { ElMessage.warning("请先处理下级分类"); return; }
  const ids = new Set(store.ancestorIds(row.id));
  if (brands.data.qualifications.some(item => item.scope === "category" && item.scopeItems.some(id => ids.has(id)))) {
    ElMessage.warning("该分类或其上级已被品牌资质引用，不能删除");
    return;
  }
  try {
    await ElMessageBox.confirm(`确认删除「${row.name}」？可通过「显示已删除」恢复。`, "删除商品分类", { type: "warning" });
    store.remove(row.id);
    ElMessage.success("分类已删除");
  } catch (error) {
    if (error !== "cancel" && error !== "close") ElMessage.warning((error as Error).message);
  }
}

function restore(row: Category) {
  if (!canEdit.value) return;
  try { store.restore(row.id); ElMessage.success("分类已恢复"); }
  catch (error) { ElMessage.warning((error as Error).message); }
}
</script>

<template>
  <div>
    <PageHeading eyebrow="商品管理" title="商品分类" description="按大类、中类、小类、细类维护商品分类。">
      <el-button v-if="canEdit" type="primary" @click="openCreate()">新增大类</el-button>
    </PageHeading>
    <div class="category-stats">
      <div v-for="(label, item) in categoryLevels" :key="item" class="surface category-stat">
        <span>{{ label }}</span><strong>{{ counts[item] }}</strong>
      </div>
    </div>
    <section class="surface catalog">
      <div class="surface-header"><div><h2>分类目录</h2><p>展开上级查看下级；筛选时显示匹配分类及完整路径。</p></div></div>
      <el-alert title="来源：业主提供的 mdb009–mdb012 存量导出（2026-11-11）。旧字段 main_dist 的 A/C 含义尚待确认，原值单独显示，不作为启停状态。" type="info" :closable="false" show-icon />
      <div class="toolbar">
        <el-input v-model="keyword" clearable placeholder="搜索名称、编码或上级路径" style="width: 300px; max-width: 100%" />
        <el-select v-model="level" clearable placeholder="全部层级" style="width: 150px">
          <el-option v-for="(label, item) in categoryLevels" :key="item" :label="label" :value="item" />
        </el-select>
        <el-checkbox v-if="canEdit && deletedCount" v-model="showDeleted">显示已删除（{{ deletedCount }}）</el-checkbox>
        <span class="muted">在用 {{ active.length }} 条</span>
      </div>
      <el-table :data="rows" row-key="id" :tree-props="{ children: 'children' }" empty-text="暂无匹配分类">
        <el-table-column prop="name" label="分类名称" min-width="170" />
        <el-table-column label="层级" width="86"><template #default="{ row }">{{ categoryLevels[row.level as CategoryLevel] }}</template></el-table-column>
        <el-table-column prop="code" label="原编码" width="105" />
        <el-table-column label="上级路径" min-width="210" show-overflow-tooltip><template #default="{ row }">{{ row.parentId ? store.path(row.parentId) : "—" }}</template></el-table-column>
        <el-table-column prop="receiptName" label="小票名称" min-width="125" />
        <el-table-column label="旧标记" width="90"><template #default="{ row }">{{ row.legacyFlag || "—" }}</template></el-table-column>
        <el-table-column label="新业务可用" width="110"><template #default="{ row }"><el-tag :type="store.isSelectable(row.id) ? 'success' : 'info'">{{ row.deleted ? "已删除" : store.isSelectable(row.id) ? "可选" : "停用" }}</el-tag></template></el-table-column>
        <el-table-column v-if="canEdit" label="操作" width="220" fixed="right"><template #default="{ row }">
          <el-button v-if="row.deleted" link type="primary" @click="restore(row)">恢复</el-button>
          <template v-else>
            <el-button link type="primary" @click="edit(row)">编辑</el-button>
            <el-button v-if="row.level !== 'tc'" link type="primary" @click="openCreate(row)">新增下级</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </template></el-table-column>
      </el-table>
    </section>
    <el-dialog v-model="createDialog" :title="`新增${parent ? categoryLevels[{ lc: 'mc', mc: 'sc', sc: 'tc', tc: 'tc' }[parent.level] as CategoryLevel] : '大类'}`" width="min(520px, 94vw)">
      <el-form label-position="top" @submit.prevent="create">
        <el-form-item label="上级分类">{{ parent ? store.path(parent.id) : "无（新增大类）" }}</el-form-item>
        <el-form-item label="分类编码" required><el-input v-model="createForm.code" maxlength="5" /><small class="muted">按存量编码格式建议，可调整；原型中分配的编号需在正式迁移时核对。</small></el-form-item>
        <el-form-item label="分类名称" required><el-input v-model="createForm.name" maxlength="80" /></el-form-item>
        <el-form-item label="小票名称"><el-input v-model="createForm.receiptName" maxlength="80" /></el-form-item>
        <el-form-item label="允许新业务选择"><el-switch v-model="createForm.enabled" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="createDialog = false">取消</el-button><el-button type="primary" @click="create">新增分类</el-button></template>
    </el-dialog>
    <el-dialog v-model="dialog" :title="`编辑${selected ? categoryLevels[selected.level] : '分类'}`" width="min(520px, 94vw)">
      <el-form v-if="selected" label-position="top" @submit.prevent="save">
        <el-form-item label="完整路径">{{ store.path(selected.id) }}</el-form-item>
        <el-form-item label="原编码">{{ selected.code }} <small class="muted">　原编码保留，不在原型中重编</small></el-form-item>
        <el-form-item label="分类名称" required><el-input v-model="form.name" maxlength="80" /></el-form-item>
        <el-form-item label="小票名称"><el-input v-model="form.receiptName" maxlength="80" /></el-form-item>
        <el-form-item label="允许新业务选择"><el-switch v-model="form.enabled" /><small class="muted status-note">停用上级时，下级也不能用于新的品牌资质。</small></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialog = false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>
.category-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 18px 0; }
.category-stat { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
.category-stat strong { font-size: 24px; color: var(--brand); }
.catalog { padding: 18px 20px; }
.catalog .surface-header { padding: 0 0 14px; }
.toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 16px 0; padding: 0; }
.status-note { margin-left: 10px; }
@media (max-width: 640px) { .category-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
