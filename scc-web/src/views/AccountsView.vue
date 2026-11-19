<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Key, Plus, UserFilled } from "@element-plus/icons-vue";
import PageHeading from "@/shared/PageHeading.vue";
import StatusPill from "@/shared/StatusPill.vue";
import { useDemoStore } from "@/domain/store";

const store = useDemoStore();
const isSupplier = computed(() => store.role === "supplier");
const rows = computed(() => isSupplier.value ? store.data.subAccounts.filter(item => item.supplierId === store.activeSupplierId) : store.suppliers);
const dialogOpen = ref(false);
const passwordOpen = ref(false);
const form = reactive({ name: "", mobile: "", permissions: ["资料查看"] as string[] });
const samplePassword = ref("");
function addAccount() {
  if (!form.name.trim() || !/^1\d{10}$/.test(form.mobile)) { ElMessage.warning("请填写姓名和 11 位手机号"); return; }
  if (store.data.subAccounts.some(item => item.mobile === form.mobile)) { ElMessage.warning("该手机号已存在于演示子账号中"); return; }
  const password = `Demo${Math.floor(100000 + Math.random() * 900000)}`;
  store.addSubAccount({ supplierId: store.activeSupplierId, name: form.name.trim(), mobile: form.mobile, permissions: [...form.permissions] });
  samplePassword.value = password;
  passwordOpen.value = true;
  dialogOpen.value = false;
  Object.assign(form, { name: "", mobile: "", permissions: ["资料查看"] });
  ElMessage.success("演示子账号已创建，初始密码仅在此提示中显示");
}
async function toggle(id: string, name: string) {
  try { await ElMessageBox.confirm(`确定变更 ${name} 的账号状态？`, "账号状态", { type: "warning" }); store.toggleSubAccount(id); ElMessage.success("演示状态已更新"); } catch { /* cancelled */ }
}
</script>

<template>
  <div><PageHeading eyebrow="ACCESS CONTROL / 账号权限" :title="isSupplier ? '子账号管理' : '供应商账号管理'" :description="isSupplier ? '为本企业成员开通子账号，分配资料查看和维护权限。' : '业主统一开通供应商主账号，登录名为供应商编码。'"><el-button v-if="isSupplier" type="primary" @click="dialogOpen = true"><el-icon><Plus /></el-icon> 新增子账号</el-button><el-button v-else type="primary" plain @click="ElMessage.info('批量开通将在后端接入后实现；此处展示账号原型')"><el-icon><Plus /></el-icon> 批量开通</el-button></PageHeading>
  <div class="account-guide surface"><div class="guide-icon"><el-icon><Key /></el-icon></div><div><strong>{{ isSupplier ? '一个主账号，灵活管理团队成员' : '供应商编码就是主账号登录名' }}</strong><p>{{ isSupplier ? '子账号使用手机号与初始密码登录，首次需要短信验证并修改密码。' : '存量供应商编码继续可用；新增编码沿用七位数字、步进 10 的旧规则。' }}</p></div><span>ACCOUNT POLICY · 2027</span></div>
  <section class="surface"><div class="surface-header"><div><h2>{{ isSupplier ? '本企业子账号' : '供应商主账号' }}</h2><p>{{ isSupplier ? '当前企业的成员与权限' : '主账号由业主开通，不提供供应商自注册' }}</p></div><span class="muted small-text">共 {{ rows.length }} 个账号</span></div><div class="table-wrap" v-if="isSupplier"><el-table :data="store.data.subAccounts.filter(item => item.supplierId === store.activeSupplierId)" empty-text="暂无子账号"><el-table-column label="成员" min-width="160"><template #default="{ row }"><div class="member-cell"><span><el-icon><UserFilled /></el-icon></span><strong>{{ row.name }}</strong></div></template></el-table-column><el-table-column prop="mobile" label="登录手机号" min-width="145" /><el-table-column label="权限" min-width="220"><template #default="{ row }"><el-tag v-for="p in row.permissions" :key="p" size="small" type="info" effect="plain" style="margin-right:5px">{{ p }}</el-tag></template></el-table-column><el-table-column prop="lastLogin" label="最近登录" width="150" /><el-table-column label="状态" width="100"><template #default="{ row }"><StatusPill :value="row.status" /></template></el-table-column><el-table-column label="操作" width="150"><template #default="{ row }"><el-button link type="primary" @click="ElMessage.info('演示重置：正式系统会重新生成一次性初始密码')">重置密码</el-button><el-button link :type="row.status === 'active' ? 'danger' : 'success'" @click="toggle(row.id, row.name)">{{ row.status === 'active' ? '停用' : '启用' }}</el-button></template></el-table-column></el-table></div><div class="table-wrap" v-else><el-table :data="store.suppliers" empty-text="暂无主账号"><el-table-column label="供应商" min-width="250"><template #default="{ row }"><strong class="company-name">{{ row.name }}</strong></template></el-table-column><el-table-column label="主账号 / 供应商编码" width="190"><template #default="{ row }"><span class="code-text">{{ row.code }}</span></template></el-table-column><el-table-column label="绑定状态" width="115"><template #default><StatusPill value="active" /></template></el-table-column><el-table-column label="关联子账号" width="110"><template #default="{ row }">{{ store.data.subAccounts.filter(item => item.supplierId === row.id).length }} 个</template></el-table-column><el-table-column label="年度资料" width="120"><template #default="{ row }"><StatusPill :value="row.submissionStatus" /></template></el-table-column><el-table-column label="操作" width="120"><template #default><el-button link type="primary" @click="ElMessage.info('演示重置：正式系统由业主发放初始密码')">重置主账号</el-button></template></el-table-column></el-table></div><div class="table-footer"><span>所有账号信息均为虚构演示数据</span></div></section>
  <el-dialog v-model="dialogOpen" title="新增供应商子账号" width="520px"><div class="info-note" style="margin-bottom:18px">子账号以手机号登录；演示初始密码将仅展示一次。正式系统会发送短信验证码。</div><el-form label-position="top"><el-form-item label="成员姓名" required><el-input v-model="form.name" placeholder="请输入成员姓名" /></el-form-item><el-form-item label="登录手机号" required><el-input v-model="form.mobile" maxlength="11" placeholder="请输入 11 位手机号" /></el-form-item><el-form-item label="可用权限"><el-checkbox-group v-model="form.permissions"><el-checkbox label="资料查看" value="资料查看" /><el-checkbox label="资料编辑" value="资料编辑" /><el-checkbox label="资质维护" value="资质维护" /><el-checkbox label="提交审核" value="提交审核" /></el-checkbox-group></el-form-item></el-form><template #footer><el-button @click="dialogOpen = false">取消</el-button><el-button type="primary" @click="addAccount">创建演示子账号</el-button></template></el-dialog>
  <el-dialog v-model="passwordOpen" title="演示初始密码" width="430px" @closed="samplePassword = ''"><p>请在演示时记录此一次性初始密码：<strong class="password-display">{{ samplePassword }}</strong></p><p class="muted small-text">真实系统不会在短信中发送明文密码，且首次登录必须修改。</p><template #footer><el-button type="primary" @click="passwordOpen = false">我已记录</el-button></template></el-dialog>
  </div>
</template>

<style scoped>
.account-guide { display: flex; align-items: center; gap: 16px; padding: 22px 25px; margin-bottom: 18px; background: linear-gradient(110deg,#f3f8fe,#fff); }.guide-icon { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 11px; background: #e5f0fc; color: #2b77c5; font-size: 20px; }.account-guide > div:nth-child(2) { flex: 1; }.account-guide strong { color: #314a65; font-size: 14px; }.account-guide p { margin: 4px 0 0; color: #8797a9; font-size: 11px; }.account-guide > span { color: #a5b9d0; font-size: 10px; letter-spacing: .12em; }.member-cell { display: flex; align-items: center; gap: 9px; }.member-cell span { width: 31px; height: 31px; display: grid; place-items: center; border-radius: 8px; color: #3477be; background: #ecf4fc; }.member-cell strong,.company-name { color: #3d536b; font-size: 12px; }.password-display { display: inline-block; margin-left: 9px; padding: 5px 10px; border-radius: 6px; color: #256fbb; background: #eaf4ff; font: 700 15px ui-monospace,monospace; }@media(max-width:760px) { .account-guide > span { display: none; } }
</style>
