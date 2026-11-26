<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft, Check, Document, Plus, UploadFilled } from "@element-plus/icons-vue";
import BrandQualificationsPanel from "@/shared/BrandQualificationsPanel.vue";
import { useBrandStore } from "@/domain/brands";
import PageHeading from "@/shared/PageHeading.vue";
import StatusPill from "@/shared/StatusPill.vue";
import { useDemoStore } from "@/domain/store";
import type { Contact, Supplier } from "@/domain/types";

const store = useDemoStore();
const route = useRoute();
const router = useRouter();
const supplier = computed(() => route.params.id ? store.getSupplier(String(route.params.id)) : store.activeSupplier);
const editable = computed(() => store.role === "supplier" && !route.params.id);
const form = reactive({ name: "", category: "食品经销" as Supplier["category"], creditCode: "", legalPerson: "", phone: "", email: "", postalCode: "", registeredAddress: "", businessAddress: "", bankName: "", bankAccount: "" });
const contactOpen = ref(false);
const contactForm = reactive({ name: "", department: "", position: "", mobile: "", email: "", primary: false });
const activeTab = ref("company");
const brandStore = useBrandStore();
const brandSummary = computed(() => {
  const items = brandStore.data.qualifications.filter(item => item.supplierId === supplier.value?.id);
  const available = items.filter(item => ["有效", "即将到期"].includes(brandStore.qualificationState(item).label)).length;
  const pending = items.filter(item => item.status === "pending").length;
  return `有效 ${available} 项 · 待审核 ${pending} 项`;
});
watch(() => supplier.value?.id, () => { if (supplier.value) Object.assign(form, supplier.value); }, { immediate: true });
function saveDraft() {
  if (!supplier.value || supplier.value.submissionStatus === "pending") return;
  store.updateSupplier(supplier.value.id, { ...form });
  ElMessage.success("草稿已保存");
}
async function submit() {
  if (!supplier.value || supplier.value.submissionStatus === "pending") return;
  if (!form.name.trim()) { ElMessage.warning("请填写企业名称"); return; }
  try {
    await ElMessageBox.confirm("提交后，资料将进入采购审核流程。", "提交 2027 年度资料", { confirmButtonText: "确认提交", cancelButtonText: "继续编辑", type: "info" });
    store.updateSupplier(supplier.value.id, { ...form });
    store.submitSupplier(supplier.value.id);
    ElMessage.success("资料已提交，等待采购审核");
  } catch { /* cancelled */ }
}
function addContact() {
  if (!supplier.value || !contactForm.name.trim() || !contactForm.mobile.trim()) { ElMessage.warning("请填写联系人姓名和手机号"); return; }
  store.addContact(supplier.value.id, { ...contactForm } as Omit<Contact, "id">);
  contactOpen.value = false;
  Object.assign(contactForm, { name: "", department: "", position: "", mobile: "", email: "", primary: false });
  ElMessage.success("联系人已添加");
}
async function deleteContact(id: string) {
  if (!supplier.value) return;
  try { await ElMessageBox.confirm("确定从草稿中移除此联系人？", "移除联系人", { type: "warning" }); store.removeContact(supplier.value.id, id); } catch { /* cancelled */ }
}
</script>

<template>
  <div v-if="supplier">
    <PageHeading :eyebrow="editable ? 'ANNUAL PROFILE / 2027' : 'SUPPLIER PROFILE / 档案详情'" :title="editable ? '2027 年度资料更新' : supplier.name" :description="editable ? '请核对企业信息与联系人，保存草稿后提交采购审核。' : `供应商编码 ${supplier.code} · ${supplier.category}`">
      <el-button v-if="!editable" @click="router.back()"><el-icon><ArrowLeft /></el-icon> 返回</el-button>
      <template v-else><el-button :disabled="supplier.submissionStatus === 'pending'" @click="saveDraft">保存草稿</el-button><el-button type="primary" :disabled="supplier.submissionStatus === 'pending'" @click="submit"><el-icon><Check /></el-icon> 提交审核</el-button></template>
    </PageHeading>
    <div class="profile-intro surface"><div class="profile-badge"><el-icon><Document /></el-icon></div><div class="profile-intro-text"><div><strong>{{ supplier.name }}</strong><StatusPill :value="supplier.submissionStatus" /></div><span>供应商编码 <b>{{ supplier.code }}</b>　·　经营类型 {{ supplier.category }}　·　最近更新 {{ supplier.lastUpdated }}</span></div><div class="profile-progress"><span>资料完整度 <strong>{{ supplier.completion }}%</strong></span><el-progress :percentage="supplier.completion" :stroke-width="7" :show-text="false" /></div></div>
    <el-alert v-if="supplier.submissionStatus === 'returned'" :title="`审核退回：${supplier.reviewNote}`" type="warning" show-icon :closable="false" style="margin: 18px 0" />
    <el-alert v-if="supplier.submissionStatus === 'pending'" title="资料已提交，等待采购审核。提交版本暂不可再次编辑。" type="info" show-icon :closable="false" style="margin: 18px 0" />
    <div v-if="editable" class="annual-brands surface">
      <div><strong>品牌资质</strong><span>{{ brandSummary }}</span></div>
      <el-button link type="primary" @click="router.push('/brand-qualifications')">查看或提交品牌资质</el-button>
    </div>
    <div class="profile-layout"><section class="surface profile-main"><el-tabs v-model="activeTab" class="profile-tabs"><el-tab-pane label="企业基础信息" name="company"><div class="tab-content"><h3 class="section-title">企业身份</h3><el-form label-position="top" class="form-grid"><el-form-item label="供应商名称"><el-input v-model="form.name" :disabled="!editable || supplier.submissionStatus === 'pending'" /></el-form-item><el-form-item label="供应商编码"><el-input :model-value="supplier.code" disabled /><div class="field-hint">沿用旧系统编码，不可修改</div></el-form-item><el-form-item label="统一社会信用代码 / 税号"><el-input v-model="form.creditCode" :disabled="!editable || supplier.submissionStatus === 'pending'" /></el-form-item><el-form-item label="法定代表人"><el-input v-model="form.legalPerson" :disabled="!editable || supplier.submissionStatus === 'pending'" /></el-form-item><el-form-item label="经营类型"><el-select v-model="form.category" :disabled="!editable || supplier.submissionStatus === 'pending'" style="width:100%"><el-option label="食品经销" value="食品经销" /><el-option label="食品生产" value="食品生产" /><el-option label="百货" value="百货" /><el-option label="综合" value="综合" /></el-select></el-form-item><el-form-item label="邮政编码"><el-input v-model="form.postalCode" :disabled="!editable || supplier.submissionStatus === 'pending'" /></el-form-item><el-form-item class="span-two" label="注册地址"><el-input v-model="form.registeredAddress" :disabled="!editable || supplier.submissionStatus === 'pending'" /></el-form-item><el-form-item class="span-two" label="经营地址"><el-input v-model="form.businessAddress" :disabled="!editable || supplier.submissionStatus === 'pending'" /></el-form-item></el-form><h3 class="section-title section-space">业务与结算联系</h3><el-form label-position="top" class="form-grid"><el-form-item label="企业联系电话"><el-input v-model="form.phone" :disabled="!editable || supplier.submissionStatus === 'pending'" /></el-form-item><el-form-item label="企业邮箱"><el-input v-model="form.email" :disabled="!editable || supplier.submissionStatus === 'pending'" /></el-form-item><el-form-item label="开户银行"><el-input v-model="form.bankName" :disabled="!editable || supplier.submissionStatus === 'pending'" /></el-form-item><el-form-item label="银行账号"><el-input v-model="form.bankAccount" :disabled="!editable || supplier.submissionStatus === 'pending'" /></el-form-item></el-form><div class="info-note">银行账号等敏感资料的修改需经过授权和审核。</div></div></el-tab-pane>
      <el-tab-pane :label="`业务联系人 (${supplier.contacts.length})`" name="contacts"><div class="tab-content"><div class="tab-toolbar"><div><h3 class="section-title">业务联系人</h3><p>采购、财务等业务沟通所需的联系人信息</p></div><el-button v-if="editable && supplier.submissionStatus !== 'pending'" type="primary" plain @click="contactOpen = true"><el-icon><Plus /></el-icon> 新增联系人</el-button></div><el-table :data="supplier.contacts" empty-text="暂无联系人"><el-table-column prop="name" label="姓名" min-width="100" /><el-table-column prop="department" label="部门" min-width="100" /><el-table-column prop="position" label="职务" min-width="100" /><el-table-column prop="mobile" label="手机号码" min-width="130" /><el-table-column prop="email" label="电子邮箱" min-width="180" /><el-table-column label="类型" width="90"><template #default="{ row }"><el-tag v-if="row.primary" size="small" type="primary" effect="plain">主要联系人</el-tag><span v-else class="muted">普通</span></template></el-table-column><el-table-column v-if="editable" label="操作" width="80"><template #default="{ row }"><el-button link type="danger" :disabled="supplier.submissionStatus === 'pending'" @click="deleteContact(row.id)">移除</el-button></template></el-table-column></el-table></div></el-tab-pane>
      <el-tab-pane label="资质证照" name="qualifications"><div class="tab-content"><div class="tab-toolbar"><div><h3 class="section-title">资质证照</h3><p>查看证照状态与历史上传记录</p></div><el-button type="primary" plain @click="router.push('/qualifications')"><el-icon><UploadFilled /></el-icon> 进入证照管理</el-button></div><div v-for="q in supplier.qualifications" :key="q.id" class="mini-qualification"><span class="document-icon"><el-icon><Document /></el-icon></span><div><strong>{{ q.type }}</strong><small>证照编号 {{ q.number }} · 有效期至 {{ q.validUntil }}</small></div><StatusPill :value="q.status" /></div></div></el-tab-pane>
      <el-tab-pane label="品牌资质" name="brands" lazy>
        <div class="tab-content">
          <template v-if="editable">
            <div class="tab-toolbar">
              <div><h3 class="section-title">本企业品牌资质</h3><p>{{ brandSummary }}</p></div>
              <el-button type="primary" plain @click="router.push('/brand-qualifications')">进入品牌资质</el-button>
            </div>
          </template>
          <BrandQualificationsPanel v-else mode="profile" :supplier-id="supplier.id" />
        </div>
      </el-tab-pane>
    </el-tabs></section>
      <aside class="profile-aside"><section class="surface aside-card"><div class="surface-header"><h2>年度更新进度</h2></div><div class="aside-content"><div class="step-item done"><span>1</span><div><strong>核对现行资料</strong><small>确认企业身份与联系方式</small></div></div><div class="step-item" :class="{ done: supplier.completion >= 70 }"><span>2</span><div><strong>补充资料与证照</strong><small>完善本年度所需信息</small></div></div><div class="step-item" :class="{ done: ['pending','approved'].includes(supplier.submissionStatus) }"><span>3</span><div><strong>提交采购审核</strong><small>采购团队核对并反馈</small></div></div><div class="step-item" :class="{ done: supplier.submissionStatus === 'approved' }"><span>4</span><div><strong>审核通过</strong><small>形成可追溯的资料版本</small></div></div></div></section><section class="surface aside-card"><div class="surface-header"><h2>填报提示</h2></div><div class="aside-content aside-tip"><p>· 供应商编码由业主维护，存量编码继续可用。</p><p>· 企业资料、联系人和资质提交后需采购审核。</p><p>· 食品供应商请关注食品许可类证照的有效期。</p></div></section></aside></div>
    <el-dialog v-model="contactOpen" title="新增业务联系人" width="520px"><el-form label-position="top" class="form-grid"><el-form-item label="姓名" required><el-input v-model="contactForm.name" /></el-form-item><el-form-item label="手机号码" required><el-input v-model="contactForm.mobile" /></el-form-item><el-form-item label="部门"><el-input v-model="contactForm.department" /></el-form-item><el-form-item label="职务"><el-input v-model="contactForm.position" /></el-form-item><el-form-item class="span-two" label="电子邮箱"><el-input v-model="contactForm.email" /></el-form-item><el-form-item class="span-two"><el-checkbox v-model="contactForm.primary">设为主要联系人</el-checkbox></el-form-item></el-form><template #footer><el-button @click="contactOpen = false">取消</el-button><el-button type="primary" @click="addContact">保存联系人</el-button></template></el-dialog>
  </div>
  <el-empty v-else description="未找到供应商档案"><el-button type="primary" @click="router.push('/suppliers')">返回名录</el-button></el-empty>
</template>

<style scoped>
.annual-brands { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 18px; padding: 10px 23px; }
.annual-brands strong { margin-right: 12px; }
.annual-brands span { color: var(--el-text-color-secondary); font-size: 12px; }
.profile-intro { display: flex; align-items: center; gap: 16px; padding: 21px 23px; }.profile-badge { display: grid; place-items: center; width: 46px; height: 46px; flex: 0 0 46px; border-radius: 11px; background: #eaf3fe; color: #327dca; font-size: 23px; }.profile-intro-text { flex: 1; min-width: 0; }.profile-intro-text > div { display: flex; align-items: center; gap: 12px; }.profile-intro-text strong { color: #2d425a; font-size: 16px; }.profile-intro-text span { display: block; margin-top: 6px; color: #8e9daf; font-size: 11px; }.profile-intro-text span b { color: #456383; }.profile-progress { width: 160px; }.profile-progress span { display: flex; justify-content: space-between; margin-bottom: 8px; color: #8a99aa; font-size: 11px; }.profile-progress strong { color: #2676c5; }.profile-layout { display: grid; grid-template-columns: minmax(0,1fr) 285px; gap: 18px; margin-top: 18px; }.profile-main { min-width: 0; }.profile-tabs :deep(.el-tabs__header) { margin: 0; padding: 0 23px; }.profile-tabs :deep(.el-tabs__nav-wrap::after) { height: 1px; background: #edf0f4; }.profile-tabs :deep(.el-tabs__item) { height: 53px; color: #7d8da0; font-size: 12px; }.profile-tabs :deep(.el-tabs__item.is-active) { color: #2a77c5; font-weight: 650; }.tab-content { min-height: 330px; padding: 25px 27px 30px; }.section-space { margin-top: 25px; }.field-hint { color: #a5b1be; font-size: 10px; }.tab-toolbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 17px; }.tab-toolbar .section-title { margin-bottom: 4px; }.tab-toolbar p { margin: 0 0 0 12px; color: #a1adbb; font-size: 11px; }.mini-qualification { display: flex; gap: 12px; align-items: center; padding: 14px 0; border-bottom: 1px solid #f0f2f5; }.mini-qualification .document-icon { display: grid; place-items: center; width: 33px; height: 33px; border-radius: 7px; color: #377cc6; background: #eaf3fd; }.mini-qualification div { flex: 1; display: flex; flex-direction: column; gap: 4px; }.mini-qualification strong { color: #3c5168; font-size: 12px; }.mini-qualification small { color: #9aa8b7; font-size: 10px; }.profile-aside { display: flex; flex-direction: column; gap: 17px; }.aside-content { padding: 20px 21px 22px; }.step-item { display: flex; gap: 12px; position: relative; min-height: 58px; }.step-item:not(:last-child)::after { content: ""; position: absolute; left: 12px; top: 27px; height: 29px; border-left: 1px dashed #d3dce5; }.step-item > span { z-index: 1; width: 25px; height: 25px; display: grid; place-items: center; flex: 0 0 25px; border-radius: 50%; background: #ecf1f6; color: #97a7b8; font-size: 11px; }.step-item.done > span { color: #fff; background: #3d8cd1; }.step-item div { display: flex; flex-direction: column; gap: 4px; padding-top: 1px; }.step-item strong { color: #63758a; font-size: 12px; }.step-item.done strong { color: #324b65; }.step-item small { color: #a4b0be; font-size: 10px; }.aside-tip p { margin: 0 0 12px; color: #8495a8; font-size: 11px; line-height: 1.6; }.aside-tip p:last-child { margin: 0; }@media(max-width:1000px) { .profile-layout { grid-template-columns: 1fr; }.profile-aside { display: none; } }@media(max-width:760px) { .profile-intro { flex-wrap: wrap; }.profile-progress { width: 100%; }.tab-content { padding: 21px 16px; } }
</style>
