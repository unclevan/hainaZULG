import { ref } from "vue";
import { defineStore } from "pinia";
import seed from "./categorySeed.json";

export type CategoryLevel = "lc" | "mc" | "sc" | "tc";
export interface Category {
  id: string;
  orgCode: string;
  level: CategoryLevel;
  code: string;
  parentId: string;
  name: string;
  receiptName: string;
  legacyFlag: string;
  enabled: boolean;
  origin: "legacy" | "new";
  deleted?: boolean;
}
type CategoryEdit = Pick<Category, "name" | "receiptName" | "enabled">;
interface CategoryData { added: Category[]; overrides: Record<string, CategoryEdit>; deletedIds: string[] }

const key = "haina-category-data-v2";
const oldKey = "haina-category-overrides-v1";
export const categoryLevels: Record<CategoryLevel, string> = { lc: "大类", mc: "中类", sc: "小类", tc: "细类" };
const nextLevel: Record<CategoryLevel, CategoryLevel | null> = { lc: "mc", mc: "sc", sc: "tc", tc: null };
const baseline: Category[] = seed.map(row => ({ ...row, level: row.level as CategoryLevel, enabled: true, origin: "legacy" }));

function readData(): CategoryData {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as CategoryData;
    return { added: [], overrides: JSON.parse(localStorage.getItem(oldKey) || "{}") as CategoryData["overrides"], deletedIds: [] };
  } catch { return { added: [], overrides: {}, deletedIds: [] }; }
}

export const useCategoryStore = defineStore("categories", () => {
  const data = ref(readData());
  window.addEventListener("storage", event => {
    if (event.key === key || event.key === null) data.value = readData();
  });
  const all = () => [...baseline, ...data.value.added].map(row => ({
    ...row, ...data.value.overrides[row.id], deleted: data.value.deletedIds.includes(row.id)
  }));
  const categories = (includeDeleted = false) => all().filter(row => includeDeleted || !row.deleted);
  const category = (id: string) => all().find(row => row.id === id);
  const children = (parentId: string) => categories().filter(row => row.parentId === parentId);
  const ancestorIds = (id: string) => {
    const rows = all();
    const ids: string[] = [];
    let current = rows.find(row => row.id === id);
    while (current) {
      ids.push(current.id);
      current = rows.find(row => row.id === current?.parentId);
    }
    return ids;
  };
  const path = (id: string) => ancestorIds(id).reverse().map(part => category(part)?.name || "").join(" / ");
  const isSelectable = (id: string) => {
    const ids = ancestorIds(id);
    return ids.length > 0 && ids.every(part => { const row = category(part); return row && !row.deleted && row.enabled; });
  };
  function write(next: CategoryData) {
    localStorage.setItem(key, JSON.stringify(next));
    data.value = next;
  }

  function suggestCode(parentId = "") {
    const parent = parentId ? category(parentId) : undefined;
    const level = parent ? nextLevel[parent.level] : "lc";
    if (!level || (parentId && (!parent || parent.deleted))) throw new Error("无法在该分类下新增");
    const prefix = level === "mc" || level === "tc" ? parent!.code : "";
    const width = level === "tc" ? 3 : 2;
    const used = new Set(all().filter(row => row.level === level).map(row => row.code));
    const existing = [...used].filter(code => code.startsWith(prefix) && /^\d+$/.test(code))
      .map(code => Number(code.slice(prefix.length)));
    const max = 10 ** width - 1;
    let suffix = Math.max(0, ...existing) + 1;
    if (suffix > max) suffix = Array.from({ length: max }, (_, index) => index + 1).find(n => !used.has(prefix + String(n).padStart(width, "0"))) || 0;
    return suffix ? prefix + String(suffix).padStart(width, "0") : "";
  }

  function add(parentId: string, code: string, edit: CategoryEdit) {
    const parent = parentId ? category(parentId) : undefined;
    const level = parent ? nextLevel[parent.level] : "lc";
    if (!level || (parentId && (!parent || parent.deleted))) throw new Error("请选择有效的上级分类");
    const name = edit.name.trim();
    if (!name) throw new Error("请填写分类名称");
    code = code.trim();
    const prefix = level === "mc" || level === "tc" ? parent!.code : "";
    const width = level === "tc" ? 3 : 2;
    if (!new RegExp(`^${prefix}\\d{${width}}$`).test(code)) throw new Error(`编码须为 ${prefix || ""}${width} 位数字`);
    if (all().some(row => row.level === level && row.code === code)) throw new Error("该层级编码已使用，不能复用");
    if (categories().some(row => row.parentId === parentId && row.name === name)) throw new Error("同级已有同名分类");
    const orgCode = parent?.orgCode || "0001";
    const row: Category = {
      id: `${orgCode}:${level}:${code}`, orgCode, level, code, parentId, name,
      receiptName: edit.receiptName.trim(), legacyFlag: "", enabled: edit.enabled, origin: "new"
    };
    write({ ...data.value, added: [...data.value.added, row] });
  }

  function save(id: string, edit: CategoryEdit) {
    const original = category(id);
    if (!original || original.deleted) throw new Error("分类不存在");
    const name = edit.name.trim();
    if (!name) throw new Error("请填写分类名称");
    if (categories().some(row => row.id !== id && row.parentId === original.parentId && row.name === name)) throw new Error("同级已有同名分类");
    write({ ...data.value, overrides: {
      ...data.value.overrides, [id]: { name, receiptName: edit.receiptName.trim(), enabled: edit.enabled }
    } });
  }

  function remove(id: string) {
    const row = category(id);
    if (!row || row.deleted) throw new Error("分类不存在");
    if (children(id).length) throw new Error("请先处理下级分类");
    write({ ...data.value, deletedIds: [...data.value.deletedIds, id] });
  }
  function restore(id: string) {
    const row = category(id);
    if (!row?.deleted) throw new Error("该分类无需恢复");
    if (row.parentId && (!category(row.parentId) || category(row.parentId)?.deleted)) throw new Error("请先恢复上级分类");
    if (categories().some(item => item.parentId === row.parentId && item.name === row.name)) throw new Error("同级已有同名分类");
    write({ ...data.value, deletedIds: data.value.deletedIds.filter(item => item !== id) });
  }
  return { categories, category, children, ancestorIds, path, isSelectable, suggestCode, add, save, remove, restore };
});
