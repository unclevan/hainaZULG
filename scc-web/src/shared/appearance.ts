import { reactive, watch } from "vue";
import { defineStore } from "pinia";

const STORAGE_KEY = "haina-scc-appearance-v1";

export const themeColors = [
  { name: "海纳蓝", value: "#2268c5" },
  { name: "青绿色", value: "#148f88" },
  { name: "紫罗兰", value: "#7656bd" },
  { name: "暖橙色", value: "#cc6b31" },
  { name: "石墨灰", value: "#4b6077" }
] as const;

interface AppearanceSettings {
  themeColor: string;
  compactRows: boolean;
  fullWidth: boolean;
  showBreadcrumb: boolean;
  showLogo: boolean;
  showTabs: boolean;
  cachePages: boolean;
  grayscale: boolean;
}

const defaults: AppearanceSettings = {
  themeColor: themeColors[0].value,
  compactRows: false,
  fullWidth: false,
  showBreadcrumb: true,
  showLogo: true,
  showTabs: true,
  cachePages: true,
  grayscale: false
};

function loadSettings(): AppearanceSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<AppearanceSettings>;
    return { ...defaults, ...saved, themeColor: themeColors.some(item => item.value === saved.themeColor) ? saved.themeColor! : defaults.themeColor };
  } catch { return { ...defaults }; }
}

function mixWithWhite(hex: string, whiteRatio: number): string {
  const channels = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
  return `#${channels.map(channel => Math.round(channel + (255 - channel) * whiteRatio).toString(16).padStart(2, "0")).join("")}`;
}

function mixWithBlack(hex: string, blackRatio: number): string {
  const channels = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
  return `#${channels.map(channel => Math.round(channel * (1 - blackRatio)).toString(16).padStart(2, "0")).join("")}`;
}

function applySettings(settings: AppearanceSettings) {
  const root = document.documentElement;
  root.style.setProperty("--brand", settings.themeColor);
  root.style.setProperty("--el-color-primary", settings.themeColor);
  root.style.setProperty("--el-color-primary-dark-2", mixWithBlack(settings.themeColor, 0.2));
  for (const [step, ratio] of [[3, 0.3], [5, 0.5], [7, 0.7], [8, 0.8], [9, 0.9]] as const) {
    root.style.setProperty(`--el-color-primary-light-${step}`, mixWithWhite(settings.themeColor, ratio));
  }
  root.classList.toggle("scc-compact", settings.compactRows);
  root.classList.toggle("scc-grayscale", settings.grayscale);
}

export function clearAppearanceCache() { localStorage.removeItem(STORAGE_KEY); }

export const useAppearanceStore = defineStore("appearance", () => {
  const settings = reactive<AppearanceSettings>(loadSettings());
  watch(settings, value => {
    applySettings(value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }, { deep: true, immediate: true });

  function reset() { Object.assign(settings, defaults); }
  return { settings, reset };
});
