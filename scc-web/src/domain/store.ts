import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { seedData } from "./seed";
import type { Contact, DemoData, DemoRole, Qualification, SubAccount, Supplier } from "./types";

const DATA_KEY = "haina-scc-demo-v1";
const SESSION_KEY = "haina-scc-session-v1";
export function clearDemoCache() {
  localStorage.removeItem(DATA_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const today = () => new Date().toISOString().slice(0, 10);
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function loadData(): DemoData {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    return raw ? JSON.parse(raw) as DemoData : clone(seedData);
  } catch { return clone(seedData); }
}

export const useDemoStore = defineStore("demo", () => {
  const data = ref<DemoData>(loadData());
  const savedSession = (() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}"); } catch { return {}; }
  })() as { role?: DemoRole; supplierId?: string };
  const role = ref<DemoRole>(savedSession.role || "admin");
  const activeSupplierId = ref(savedSession.supplierId || "sup-1");
  const suppliers = computed(() => data.value.suppliers);
  const activeSupplier = computed(() => suppliers.value.find(item => item.id === activeSupplierId.value) || suppliers.value[0]);
  const pendingCount = computed(() => suppliers.value.filter(item => item.submissionStatus === "pending").length);
  const expiringCount = computed(() => suppliers.value.flatMap(item => item.qualifications).filter(item => item.status === "expiring" || item.status === "expired").length);

  watch(data, value => localStorage.setItem(DATA_KEY, JSON.stringify(value)), { deep: true });
  watch([role, activeSupplierId], () => sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role: role.value, supplierId: activeSupplierId.value })));

  function setRole(nextRole: DemoRole, supplierId = activeSupplierId.value) {
    role.value = nextRole;
    activeSupplierId.value = supplierId;
  }
  function reset() { data.value = clone(seedData); role.value = "admin"; activeSupplierId.value = "sup-1"; }
  function getSupplier(id: string) { return suppliers.value.find(item => item.id === id); }
  function updateSupplier(id: string, changes: Partial<Supplier>) {
    const supplier = getSupplier(id);
    if (!supplier) return;
    Object.assign(supplier, changes, { submissionStatus: "draft", lastUpdated: today() });
    supplier.completion = Math.min(100, Math.max(supplier.completion, 82));
  }
  function submitSupplier(id: string) {
    const supplier = getSupplier(id);
    if (!supplier) return;
    supplier.submissionStatus = "pending";
    supplier.completion = 100;
    supplier.lastUpdated = today();
    supplier.reviewNote = "";
    data.value.activities.unshift({ id: makeId("activity"), supplierId: id, title: "年度资料待审核", detail: `${supplier.name} 提交了 2027 年度资料`, date: today(), kind: "warning" });
  }
  function reviewSupplier(id: string, approved: boolean, note: string) {
    const supplier = getSupplier(id);
    if (!supplier) return;
    supplier.submissionStatus = approved ? "approved" : "returned";
    supplier.reviewNote = note;
    supplier.lastUpdated = today();
    data.value.activities.unshift({ id: makeId("activity"), supplierId: id, title: approved ? "年度资料已通过" : "资料已退回补正", detail: `${supplier.name}：${note}`, date: today(), kind: approved ? "success" : "info" });
  }
  function addContact(id: string, contact: Omit<Contact, "id">) {
    const supplier = getSupplier(id);
    if (!supplier) return;
    if (contact.primary) supplier.contacts.forEach(item => { item.primary = false; });
    supplier.contacts.push({ ...contact, id: makeId("contact") });
    supplier.submissionStatus = "draft";
  }
  function removeContact(id: string, contactId: string) {
    const supplier = getSupplier(id);
    if (!supplier) return;
    supplier.contacts = supplier.contacts.filter(item => item.id !== contactId);
    supplier.submissionStatus = "draft";
  }
  function addQualification(id: string, item: Omit<Qualification, "id" | "status" | "uploadedAt">) {
    const supplier = getSupplier(id);
    if (!supplier) return;
    supplier.qualifications.unshift({ ...item, id: makeId("qualification"), status: "pending", uploadedAt: today() });
    supplier.submissionStatus = "draft";
  }
  function nextSupplierCode() {
    const valid = suppliers.value.map(item => item.code).filter(code => /^\d{7}$/.test(code) && code.endsWith("0") && code !== "9999999");
    return String(Math.max(0, ...valid.map(Number)) + 10).padStart(7, "0");
  }
  function addSupplier(input: Pick<Supplier, "name" | "category" | "creditCode" | "phone">) {
    const supplier: Supplier = {
      id: makeId("supplier"), code: nextSupplierCode(), name: input.name, category: input.category,
      creditCode: input.creditCode, legalPerson: "", phone: input.phone, email: "", postalCode: "",
      registeredAddress: "", businessAddress: "", bankName: "", bankAccount: "", status: "active",
      submissionStatus: "not_started", completion: 15, lastUpdated: today(), reviewNote: "", contacts: [], qualifications: []
    };
    data.value.suppliers.unshift(supplier);
    return supplier;
  }
  function addSubAccount(input: Omit<SubAccount, "id" | "status" | "lastLogin">) {
    data.value.subAccounts.push({ ...input, id: makeId("account"), status: "active", lastLogin: "尚未登录" });
  }
  function toggleSubAccount(id: string) {
    const item = data.value.subAccounts.find(account => account.id === id);
    if (item) item.status = item.status === "active" ? "inactive" : "active";
  }

  return { data, role, activeSupplierId, suppliers, activeSupplier, pendingCount, expiringCount, setRole, reset,
    getSupplier, updateSupplier, submitSupplier, reviewSupplier, addContact, removeContact, addQualification,
    nextSupplierCode, addSupplier, addSubAccount, toggleSubAccount };
});
