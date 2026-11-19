import { ref, watch } from "vue";
import { defineStore } from "pinia";
import type { DemoRole } from "@/domain/types";
import { navigation, roleCanOwnMenu } from "./navigation";

const KEY = "haina-scc-menu-permissions-v1";
export function clearAccessCache() { localStorage.removeItem(KEY); }
type Overrides = Partial<Record<DemoRole, Record<string, boolean>>>;

function load(): Overrides {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") as Overrides; }
  catch { return {}; }
}

export const useAccessStore = defineStore("access", () => {
  const overrides = ref<Overrides>(load());
  watch(overrides, value => localStorage.setItem(KEY, JSON.stringify(value)), { deep: true });
  function canVisit(role: DemoRole, path: string) {
    if (path === "/overview") return true;
    const item = navigation.find(menu => menu.path === path);
    if (!item) return false;
    if (!roleCanOwnMenu(role, path)) return false;
    if (role === "admin") return item.roles.includes("admin");
    const configured = overrides.value[role]?.[path];
    return configured ?? item.roles.includes(role);
  }
  function setVisible(role: DemoRole, path: string, visible: boolean) {
    if (role === "admin" || path === "/overview" || !roleCanOwnMenu(role, path)) return;
    overrides.value[role] ||= {};
    overrides.value[role]![path] = visible;
  }
  function reset() { overrides.value = {}; }
  return { overrides, canVisit, setVisible, reset };
});
