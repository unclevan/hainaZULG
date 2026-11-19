<script setup lang="ts">
import { computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Check, Delete, RefreshRight } from "@element-plus/icons-vue";
import { clearAppearanceCache, themeColors, useAppearanceStore } from "./appearance";
import { clearTabsCache, useTabsStore } from "./tabs";
import { clearDemoCache } from "@/domain/store";
import { clearAccessCache } from "./access";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
const visible = computed({ get: () => props.modelValue, set: value => emit("update:modelValue", value) });
const appearance = useAppearanceStore();
const tabs = useTabsStore();

function restoreDefaults() {
  appearance.reset();
  tabs.clearPageCache();
  ElMessage.success("已恢复默认页面设置");
}

async function clearBrowserCache() {
  try {
    await ElMessageBox.confirm("将清除当前浏览器的页面数据、页签和外观设置，并返回登录页。", "清除本地缓存", {
      type: "warning", confirmButtonText: "确认清空", cancelButtonText: "取消"
    });
    clearDemoCache();
    clearAccessCache();
    clearTabsCache();
    clearAppearanceCache();
    window.location.assign(`${import.meta.env.BASE_URL}#/login`);
  } catch { /* cancelled */ }
}
</script>

<template>
  <el-drawer v-model="visible" title="系统配置" size="min(370px, 100vw)" class="system-settings-drawer">
    <div class="settings-intro">这些设置仅影响当前设备。</div>

    <section class="settings-section">
      <h3>主题色</h3>
      <p>用于主按钮、选中导航和重点操作</p>
      <div class="theme-options">
        <button v-for="item in themeColors" :key="item.value" type="button" class="theme-option" :class="{ selected: appearance.settings.themeColor === item.value }" :title="item.name" :aria-label="item.name" :style="{ backgroundColor: item.value }" @click="appearance.settings.themeColor = item.value">
          <el-icon v-if="appearance.settings.themeColor === item.value"><Check /></el-icon>
        </button>
      </div>
    </section>

    <section class="settings-section">
      <h3>页面显示</h3>
      <div class="setting-row"><div><strong>显示 Logo</strong><small>左侧导航显示品牌标识</small></div><el-switch v-model="appearance.settings.showLogo" /></div>
      <div class="setting-row"><div><strong>显示面包屑</strong><small>顶部展示当前位置</small></div><el-switch v-model="appearance.settings.showBreadcrumb" /></div>
      <div class="setting-row"><div><strong>宽屏内容</strong><small>内容区域使用可用页面宽度</small></div><el-switch v-model="appearance.settings.fullWidth" /></div>
      <div class="setting-row"><div><strong>紧凑表格</strong><small>减少结果列表的行高</small></div><el-switch v-model="appearance.settings.compactRows" /></div>
      <div class="setting-row"><div><strong>灰色模式</strong><small>以灰度查看页面</small></div><el-switch v-model="appearance.settings.grayscale" /></div>
    </section>

    <section class="settings-section">
      <h3>多页签与缓存</h3>
      <div class="setting-row"><div><strong>显示多页签</strong><small>在顶部快速切换已打开页面</small></div><el-switch v-model="appearance.settings.showTabs" /></div>
      <div class="setting-row"><div><strong>缓存页面状态</strong><small>切换页签时保留表单与筛选状态</small></div><el-switch v-model="appearance.settings.cachePages" @change="tabs.clearPageCache()" /></div>
      <el-button class="cache-button" :icon="RefreshRight" @click="tabs.clearPageCache(); ElMessage.success('页面缓存已清除')">清除页面缓存</el-button>
    </section>

    <template #footer>
      <div class="settings-footer">
        <el-button @click="restoreDefaults">恢复默认设置</el-button>
        <el-button type="danger" plain :icon="Delete" @click="clearBrowserCache">清除本地缓存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
.settings-intro { margin: 0 0 22px; padding: 11px 13px; border-radius: 8px; background: #f3f7fb; color: #718399; font-size: 12px; line-height: 1.6; }
.settings-section { padding: 0 0 22px; margin-bottom: 22px; border-bottom: 1px solid #edf0f4; }
.settings-section:last-of-type { border-bottom: 0; margin-bottom: 0; }
.settings-section h3 { margin: 0 0 7px; color: #2d4056; font-size: 14px; }
.settings-section > p { margin: 0 0 15px; color: #95a3b3; font-size: 11px; }
.theme-options { display: flex; gap: 13px; margin-top: 16px; }
.theme-option { width: 30px; height: 30px; display: grid; place-items: center; border: 2px solid #fff; border-radius: 50%; color: #fff; box-shadow: 0 0 0 1px #d7e0ea; }
.theme-option.selected { box-shadow: 0 0 0 2px var(--brand); }
.setting-row { display: flex; justify-content: space-between; align-items: center; gap: 15px; min-height: 55px; }
.setting-row > div { display: flex; flex-direction: column; gap: 4px; }
.setting-row strong { color: #41556b; font-size: 12px; font-weight: 600; }
.setting-row small { color: #9ba9b8; font-size: 11px; }
.cache-button { width: 100%; margin-top: 12px; }
.settings-footer { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }
.settings-footer .el-button + .el-button { margin-left: 0; }
</style>
