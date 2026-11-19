<script setup lang="ts">
import { ElMessage } from "element-plus";
import PageHeading from "@/shared/PageHeading.vue";
import { useAccessStore } from "@/shared/access";
import { editableRoles, navigation, navigationGroups, roleCanOwnMenu, roleLabels } from "@/shared/navigation";

const access = useAccessStore();
const groups = navigationGroups.map(title => ({ title, items: navigation.filter(item => item.group === title && item.path !== "/overview" && item.path !== "/settings/roles") })).filter(group => group.items.length);
function reset() { access.reset(); ElMessage.success("已恢复默认角色菜单"); }
</script>

<template>
  <div>
    <PageHeading eyebrow="SYSTEM / ACCESS" title="角色与菜单权限" description="按角色设置菜单可见范围。当前演示配置保存在本浏览器，正式系统将由业主管理员统一配置并由后端鉴权。">
      <el-button @click="reset">恢复默认配置</el-button>
    </PageHeading>
    <el-alert title="演示权限说明" description="开关会立即影响左侧菜单及页面访问。业主管理员权限固定；工作台对所有角色可见。正式交付还需配置按钮操作权限和供应商数据范围。" type="info" :closable="false" show-icon class="role-alert" />
    <section class="surface role-card">
      <div class="role-table-wrap"><table class="role-table"><thead><tr><th>菜单分组 / 页面</th><th v-for="role in editableRoles" :key="role">{{ roleLabels[role] }}</th></tr></thead>
        <tbody v-for="group in groups" :key="group.title"><tr class="group-row"><td :colspan="editableRoles.length + 1">{{ group.title }}</td></tr>
          <tr v-for="item in group.items" :key="item.path"><td><strong>{{ item.title }}</strong><small>{{ item.status === "planned" ? "规划页面" : "已有页面" }}</small></td><td v-for="role in editableRoles" :key="role"><el-switch :model-value="access.canVisit(role, item.path)" :disabled="!roleCanOwnMenu(role, item.path)" :aria-label="`${roleLabels[role]}访问${item.title}`" @change="access.setVisible(role, item.path, Boolean($event))" /></td></tr>
        </tbody>
      </table></div>
    </section>
  </div>
</template>

<style scoped>
.role-alert { margin-bottom: 18px; }.role-card { padding: 0; overflow: hidden; }.role-table-wrap { overflow-x: auto; }.role-table { width: 100%; min-width: 850px; border-collapse: collapse; font-size: 12px; }.role-table th { position: sticky; top: 0; z-index: 1; padding: 16px 18px; background: #f7f9fc; color: #61758b; font-weight: 600; text-align: center; white-space: nowrap; }.role-table th:first-child { width: 35%; text-align: left; }.role-table td { padding: 11px 18px; border-top: 1px solid #eef1f5; color: #364b62; text-align: center; }.role-table td:first-child { text-align: left; }.role-table td strong { font-size: 12px; font-weight: 600; }.role-table td small { margin-left: 12px; color: #9aa9ba; }.role-table .group-row td { padding: 10px 18px; background: #f9fbfd; color: #3371a9; font-weight: 700; text-align: left; }
</style>
