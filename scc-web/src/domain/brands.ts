import { ref } from "vue";
import { defineStore } from "pinia";

export interface Brand {
  id: string;
  name: string;
  alias: string;
  parentId: string;
  active: boolean;
}

export interface BrandRequest {
  id: string;
  supplierId: string;
  name: string;
  note: string;
  status: "pending" | "approved" | "returned";
  brandId?: string;
  reviewNote?: string;
}

export interface Evidence {
  id: string;
  name: string;
}

export interface BrandQualificationInput {
  brandId: string;
  relation: "owner" | "authorized";
  rightsHolder: string;
  authorizer: string;
  scope: "brand" | "category" | "product";
  scopeItems: string[];
  restrictions: string;
  validFrom: string;
  validUntil: string;
  evidence: Evidence[];
}

export interface BrandQualification extends BrandQualificationInput {
  id: string;
  supplierId: string;
  previousId?: string;
  resubmissionOfId?: string;
  version: number;
  status: "pending" | "returned" | "approved";
  reviewNote?: string;
  submittedAt: string;
  reviewedAt?: string;
}

interface BrandData {
  brands: Brand[];
  requests: BrandRequest[];
  qualifications: BrandQualification[];
}

const key = "haina-brand-data-v1";
const initialData = (): BrandData => ({
  brands: [
    { id: "brand-qinghe", name: "青禾", alias: "", parentId: "", active: true },
    { id: "brand-qinghe-drinks", name: "青禾轻饮", alias: "", parentId: "brand-qinghe", active: true },
    { id: "brand-shanyu", name: "山屿", alias: "", parentId: "", active: true }
  ],
  requests: [],
  qualifications: []
});
const normalized = (value: string) => value.trim().normalize("NFKC").toLowerCase();
export const businessDate = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Shanghai" }).format(new Date());
export const relationLabel = { owner: "品牌持有者", authorized: "被授权供应商" };
export const scopeLabel = { brand: "全品牌", category: "指定商品品类", product: "指定商品" };

function readData(): BrandData {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as BrandData : initialData();
  } catch {
    return initialData();
  }
}

export const useBrandStore = defineStore("brands", () => {
  const data = ref(readData());
  const refresh = () => { data.value = readData(); };
  window.addEventListener("storage", event => {
    if (event.key === key || event.key === null) refresh();
  });

  function update(change: (next: BrandData) => void) {
    const next = readData();
    change(next);
    localStorage.setItem(key, JSON.stringify(next));
    data.value = next;
  }

  function saveBrand(input: Omit<Brand, "id">, id = "") {
    update(next => {
      const name = input.name.trim();
      if (!name) throw new Error("请填写品牌名称");
      if (next.brands.some(brand => brand.id !== id && normalized(brand.name) === normalized(name))) {
        throw new Error("已有同名品牌");
      }
      let parentId = input.parentId;
      while (parentId) {
        if (parentId === id) throw new Error("上级品牌不能指向自身或下级品牌");
        const parent = next.brands.find(brand => brand.id === parentId);
        if (!parent) throw new Error("上级品牌不存在");
        parentId = parent.parentId;
      }
      const existing = next.brands.find(brand => brand.id === id);
      const fields = { ...input, name, alias: input.alias.trim() };
      if (existing) Object.assign(existing, fields);
      else next.brands.unshift({ ...fields, id: crypto.randomUUID() });
    });
  }

  function submitRequest(supplierId: string, name: string, note: string) {
    name = name.trim();
    if (!name) throw new Error("请填写申请的品牌名称");
    update(next => {
      if (next.brands.some(brand => [brand.name, brand.alias].some(text => normalized(text) === normalized(name)))) {
        throw new Error("已有同名或同别名品牌，请选择现有档案");
      }
      if (next.requests.some(item => item.supplierId === supplierId && item.status === "pending" && normalized(item.name) === normalized(name))) {
        throw new Error("该品牌已有待处理申请");
      }
      next.requests.unshift({ id: crypto.randomUUID(), supplierId, name, note: note.trim(), status: "pending" });
    });
  }

  function reviewRequest(id: string, action: "create" | "link" | "return", value: string) {
    update(next => {
      const request = next.requests.find(item => item.id === id && item.status === "pending");
      if (!request) throw new Error("该申请已处理");
      if (action === "return") {
        if (!value.trim()) throw new Error("请填写退回原因");
        Object.assign(request, { status: "returned", reviewNote: value.trim() });
        return;
      }
      let brand = action === "link"
        ? next.brands.find(item => item.id === value && item.active)
        : next.brands.find(item => [item.name, item.alias].some(text => normalized(text) === normalized(request.name)));
      if (action === "create" && brand) throw new Error("已有同名或同别名品牌，请关联现有档案");
      if (action === "link" && !brand) throw new Error("请选择一个启用的品牌");
      if (!brand) {
        brand = { id: crypto.randomUUID(), name: request.name, alias: "", parentId: "", active: true };
        next.brands.unshift(brand);
      }
      Object.assign(request, { status: "approved", brandId: brand.id });
    });
  }

  function validateQualification(input: BrandQualificationInput) {
    if (!input.brandId) throw new Error("请选择品牌");
    if (!input.rightsHolder.trim() || (input.relation === "authorized" && !input.authorizer.trim())) {
      throw new Error("请填写权利人及适用的直接授权方");
    }
    if (input.scope !== "brand" && !input.scopeItems.length) throw new Error("请填写允许供货的品类或商品");
    if (!input.validFrom || (input.relation === "authorized" && !input.validUntil)
      || (input.validUntil && input.validUntil < input.validFrom)) throw new Error("请填写有效的起止日期");
  }

  function submitQualification(supplierId: string, input: BrandQualificationInput, sourceId?: string) {
    validateQualification(input);
    if (!input.evidence.length) throw new Error("请添加至少一份证明材料");
    update(next => {
      if (!next.brands.some(brand => brand.id === input.brandId && brand.active)) throw new Error("请选择一个启用的品牌");
      const source = next.qualifications.find(item => item.id === sourceId && item.supplierId === supplierId);
      if (sourceId && (!source || source.status === "pending" || source.brandId !== input.brandId)) throw new Error("该资质已更新，请重新打开");
      const previousId = source?.status === "returned" ? source.previousId : source?.id;
      if (source && next.qualifications.some(item =>
        item.resubmissionOfId === source.id ||
        (previousId && item.previousId === previousId && item.status !== "returned"))) {
        throw new Error("该资质已有后续版本");
      }
      const version = Math.max(0, ...next.qualifications
        .filter(item => item.supplierId === supplierId && item.brandId === input.brandId)
        .map(item => item.version)) + 1;
      next.qualifications.unshift({
        ...input, rightsHolder: input.rightsHolder.trim(),
        authorizer: input.relation === "authorized" ? input.authorizer.trim() : "",
        scopeItems: input.scope === "brand" ? [] : input.scopeItems,
        validUntil: input.validUntil || "",
        id: crypto.randomUUID(), supplierId, version, previousId,
        resubmissionOfId: source?.status === "returned" ? source.id : undefined,
        status: "pending", submittedAt: businessDate()
      });
    });
  }

  function reviewQualification(id: string, approved: boolean, note: string) {
    update(next => {
      const item = next.qualifications.find(record => record.id === id && record.status === "pending");
      if (!item) throw new Error("该资质已处理");
      if (!approved && !note.trim()) throw new Error("请填写退回原因");
      if (approved && !next.brands.some(brand => brand.id === item.brandId && brand.active)) {
        throw new Error("该品牌已停用，请先处理品牌档案");
      }
      Object.assign(item, { status: approved ? "approved" : "returned", reviewNote: note.trim(), reviewedAt: businessDate() });
    });
  }

  function qualificationState(item: BrandQualification): { label: string; type: "info" | "primary" | "warning" | "success" | "danger" } {
    if (item.status === "pending") return { label: "待审核", type: "primary" };
    if (item.status === "returned") {
      return data.value.qualifications.some(next => next.resubmissionOfId === item.id)
        ? { label: "已补正", type: "info" }
        : { label: "待补正", type: "warning" };
    }
    const today = businessDate();
    if (data.value.qualifications.some(next => next.previousId === item.id && next.status === "approved" && next.validFrom <= today)) {
      return { label: "历史版本", type: "info" };
    }
    if (item.validUntil && item.validUntil < today) return { label: "已到期", type: "danger" };
    if (item.validFrom > today) return { label: "未生效", type: "info" };
    if (!data.value.brands.find(brand => brand.id === item.brandId)?.active) return { label: "品牌停用", type: "info" };
    if (item.validUntil && Date.parse(item.validUntil) - Date.parse(today) <= 30 * 86400000) {
      return { label: "即将到期", type: "warning" };
    }
    return { label: "有效", type: "success" };
  }

  function brandName(id: string) {
    return data.value.brands.find(brand => brand.id === id)?.name || "—";
  }

  return { data, saveBrand, submitRequest, reviewRequest, validateQualification, submitQualification, reviewQualification, qualificationState, brandName };
});
