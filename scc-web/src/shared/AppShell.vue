<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowDown, Bell, Box, Briefcase, ChatLineSquare, Clock, Close, Document, DocumentChecked, DocumentCopy, EditPen, Files, Fold, Goods, House, Key, List, Lock, Memo, Menu, Money, Notification, Search, Setting, Tickets, TrendCharts, User, UserFilled, Van } from "@element-plus/icons-vue";
import { useDemoStore } from "@/domain/store";
import SiteCopyright from "@/shared/SiteCopyright.vue";
import SystemSettingsPanel from "@/shared/SystemSettingsPanel.vue";
import { useAppearanceStore } from "@/shared/appearance";
import { useTabsStore } from "@/shared/tabs";
import type { DemoRole } from "@/domain/types";
import { navigation, navigationGroups, roleLabels, isSupplierRole } from "@/shared/navigation";
import { useAccessStore } from "@/shared/access";

const store = useDemoStore();
const route = useRoute();
const router = useRouter();
const appearance = useAppearanceStore();
const tabs = useTabsStore();
const access = useAccessStore();
const collapsed = ref(false);
const mobileOpen = ref(false);
const settingsOpen = ref(false);
const roleLabel = computed(() => roleLabels[store.role]);
const visibleGroups = computed(() => navigationGroups.map(title => ({
  title, items: navigation.filter(item => item.group === title && access.canVisit(store.role, item.path))
})).filter(group => group.items.length));
const menuIcons = { Bell, Box, Briefcase, ChatLineSquare, Clock, Document, DocumentChecked, DocumentCopy, EditPen, Files, Goods, House, Key, List, Lock, Memo, Money, Notification, Tickets, TrendCharts, UserFilled, Van };
const iconFor = (name: string) => menuIcons[name as keyof typeof menuIcons] || Document;
const activePath = computed(() => route.path.startsWith("/suppliers/") ? "/suppliers" : route.path);
watch(() => route.path, path => {
  if (path === "/login") return;
  const title = path.startsWith("/suppliers/")
    ? store.getSupplier(path.split("/")[2])?.name || "供应商档案"
    : String(route.meta.title || "工作台");
  tabs.open(path, title);
}, { immediate: true });

function closeTab(path: string) {
  const nextPath = tabs.close(path, route.path);
  if (nextPath) void router.push(nextPath);
}

function handleAccountCommand(command: DemoRole | "login") {
  if (command === "login") {
    mobileOpen.value = false;
    tabs.reset();
    void router.push("/login");
    return;
  }
  const role = command;
  store.setRole(role);
  tabs.reset();
  mobileOpen.value = false;
  router.push("/overview");
  ElMessage.success(`已切换至${roleLabels[role]}演示视角`);
}
async function resetDemo() {
  try {
    await ElMessageBox.confirm("将清除本浏览器内所有演示编辑，恢复初始数据。", "重置演示数据", { type: "warning", confirmButtonText: "确认重置", cancelButtonText: "取消" });
    store.reset();
    access.reset();
    tabs.reset();
    router.push("/overview");
    ElMessage.success("演示数据已恢复");
  } catch { /* cancelled */ }
}
</script>

<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': collapsed, 'mobile-open': mobileOpen, 'content-wide': appearance.settings.fullWidth }">
    <div v-if="mobileOpen" class="mobile-scrim" @click="mobileOpen = false"></div>
    <aside class="app-sidebar">
      <div class="brand" @click="router.push('/overview')">
        <div v-if="appearance.settings.showLogo" class="brand-mark">海</div>
        <div v-if="!collapsed" class="brand-copy"><strong>海纳</strong><span>智慧零售管理平台</span></div>
      </div>
      <div v-if="!collapsed" class="sidebar-caption">SUPPLY CHAIN COLLABORATION</div>
      <nav class="side-nav-scroll" aria-label="主导航">
        <section v-for="group in visibleGroups" :key="group.title" class="nav-group">
          <div v-if="!collapsed" class="nav-section-label">{{ group.title }}</div>
          <div class="side-nav">
            <router-link v-for="item in group.items" :key="item.path" :to="item.path" class="nav-item" :class="{ active: activePath === item.path }" :title="collapsed ? item.title : undefined" @click="mobileOpen = false">
              <el-icon><component :is="iconFor(item.icon)" /></el-icon><span v-if="!collapsed">{{ item.title }}</span>
              <span v-if="!collapsed && item.path === '/reviews' && store.pendingCount" class="nav-count">{{ store.pendingCount }}</span>
            </router-link>
          </div>
        </section>
      </nav>
      <div class="sidebar-bottom">
        <div v-if="!collapsed" class="sidebar-help"><el-icon><Setting /></el-icon><div><strong>原型演示环境</strong><span>数据仅保存在当前浏览器</span></div></div>
        <button class="reset-button" @click="resetDemo"><el-icon><Fold /></el-icon><span v-if="!collapsed">重置演示数据</span></button>
      </div>
    </aside>

    <div class="app-body">
      <header class="topbar">
        <div class="topbar-left">
          <button class="icon-button collapse-button" aria-label="切换侧栏" @click="collapsed = !collapsed"><el-icon><Menu /></el-icon></button>
          <button class="icon-button mobile-menu-button" aria-label="打开菜单" @click="mobileOpen = true"><el-icon><Menu /></el-icon></button>
          <div v-if="appearance.settings.showBreadcrumb" class="breadcrumb"><span>海纳 SCC</span><i>/</i><strong>{{ String(route.meta.title || "工作台") }}</strong></div>
        </div>
        <div class="topbar-actions">
          <span class="demo-chip"><span class="demo-pulse"></span> 演示模式</span>
          <el-tooltip content="全局搜索将在后续版本接入" placement="bottom"><button class="icon-button soft global-search-button" aria-label="搜索"><el-icon><Search /></el-icon></button></el-tooltip>
          <el-badge :value="store.pendingCount" :hidden="isSupplierRole(store.role) || !store.pendingCount" class="notice-badge"><button class="icon-button soft" aria-label="待办" @click="router.push(isSupplierRole(store.role) ? '/overview' : '/reviews')"><el-icon><Bell /></el-icon></button></el-badge>
          <el-tooltip content="系统配置" placement="bottom"><button class="icon-button soft settings-button" aria-label="打开系统配置" @click="settingsOpen = true"><el-icon><Setting /></el-icon></button></el-tooltip>
          <el-dropdown trigger="click" @command="handleAccountCommand">
            <button class="account-switch"><span class="avatar"><el-icon><User /></el-icon></span><span class="account-copy"><strong>{{ roleLabel }}</strong><small>{{ isSupplierRole(store.role) ? store.activeSupplier?.name : "浙江大学后勤集团" }}</small></span><el-icon><ArrowDown /></el-icon></button>
            <template #dropdown><el-dropdown-menu>
              <el-dropdown-item command="admin">业主管理员视角</el-dropdown-item>
              <el-dropdown-item command="reviewer">采购审核员视角</el-dropdown-item>
              <el-dropdown-item command="finance">业主财务人员视角</el-dropdown-item>
              <el-dropdown-item command="supplier">供应商主账号视角</el-dropdown-item>
              <el-dropdown-item command="supplier_finance">供应商财务子账号视角</el-dropdown-item>
              <el-dropdown-item command="login" divided>返回演示登录页</el-dropdown-item>
            </el-dropdown-menu></template>
          </el-dropdown>
        </div>
      </header>
      <div v-if="appearance.settings.showTabs" class="workspace-tabs" role="tablist" aria-label="已打开页面">
        <div v-for="tab in tabs.opened" :key="tab.path" role="tab" tabindex="0" class="workspace-tab" :class="{ active: tab.path === route.path }" :aria-selected="tab.path === route.path" @click="router.push(tab.path)" @keydown.enter="router.push(tab.path)">
          <span>{{ tab.title }}</span>
          <button v-if="tab.path !== '/overview'" type="button" class="tab-close" :aria-label="`关闭${tab.title}`" @click.stop="closeTab(tab.path)" @keydown.enter.stop><el-icon><Close /></el-icon></button>
        </div>
        <button v-if="tabs.opened.length > 2" type="button" class="close-other-tabs" @click="tabs.closeOthers(route.path)">关闭其他</button>
      </div>
      <main class="page-content"><router-view v-slot="{ Component, route: currentRoute }"><KeepAlive v-if="appearance.settings.cachePages" :key="tabs.cacheVersion" :max="12"><component :is="Component" :key="currentRoute.path" /></KeepAlive><component v-else :is="Component" :key="currentRoute.path" /></router-view></main>
      <footer class="app-footer"><SiteCopyright /></footer>
    </div>
    <SystemSettingsPanel v-model="settingsOpen" />
  </div>
</template>
