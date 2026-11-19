import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { portal } from "./portal";

const STORAGE_KEY = `haina-${portal}-tabs-v2`;
const home = { path: "/overview", title: "工作台" };
export interface WorkspaceTab { path: string; title: string }

function loadTabs(): WorkspaceTab[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]") as WorkspaceTab[];
    if (!Array.isArray(saved)) return [home];
    return [home, ...saved.filter(item => item && typeof item.path === "string" && item.path.startsWith("/") && item.path !== home.path && typeof item.title === "string").slice(0, 11)];
  } catch { return [home]; }
}

export function clearTabsCache() { sessionStorage.removeItem(STORAGE_KEY); }

export const useTabsStore = defineStore("tabs", () => {
  const opened = ref<WorkspaceTab[]>(loadTabs());
  const cacheVersion = ref(0);
  watch(opened, value => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value)), { deep: true });

  function open(path: string, title: string) {
    if (!opened.value.some(item => item.path === path)) opened.value.push({ path, title });
  }
  function close(path: string, activePath: string): string | null {
    if (path === home.path) return null;
    const index = opened.value.findIndex(item => item.path === path);
    if (index < 0) return null;
    opened.value.splice(index, 1);
    cacheVersion.value++;
    return activePath === path ? (opened.value[Math.min(index, opened.value.length - 1)]?.path || home.path) : null;
  }
  function closeOthers(activePath: string) {
    opened.value = opened.value.filter(item => item.path === home.path || item.path === activePath);
    cacheVersion.value++;
  }
  function reset() { opened.value = [home]; cacheVersion.value++; }
  function clearPageCache() { cacheVersion.value++; }
  return { opened, cacheVersion, open, close, closeOthers, reset, clearPageCache };
});
