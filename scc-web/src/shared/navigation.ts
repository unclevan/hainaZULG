import type { DemoRole } from "@/domain/types";

export const roleLabels: Record<DemoRole, string> = {
  admin: "业主管理员", reviewer: "采购审核员", finance: "业主财务人员",
  supplier: "供应商主账号", supplier_finance: "供应商财务子账号"
};
export const editableRoles: DemoRole[] = ["reviewer", "finance", "supplier", "supplier_finance"];
export const isSupplierRole = (role: DemoRole) => role === "supplier" || role === "supplier_finance";
export function roleCanOwnMenu(role: DemoRole, path: string) {
  if (path === "/brand-qualifications") return role === "supplier";
  if (path === "/brands") return role === "admin" || role === "reviewer";
  if (path === "/categories") return role === "admin" || role === "reviewer" || role === "finance";
  if (path === "/my/profile") return role === "supplier";
  if (path === "/accounts") return role === "admin" || role === "supplier";
  if (path === "/settings/roles" || path === "/settings/notices" || path === "/settings/announcements" || path === "/settings/home-popup") return role === "admin";
  if (path === "/suppliers" || path === "/reviews") return !isSupplierRole(role);
  return true;
}

export interface NavItem {
  title: string;
  path: string;
  group: string;
  icon: string;
  description: string;
  roles: DemoRole[];
  status?: "ready" | "planned";
}

export const navigation: NavItem[] = [
  { title: "工作台", path: "/overview", group: "工作台", icon: "House", description: "公告、通知和待办事项", roles: ["admin", "reviewer", "finance", "supplier", "supplier_finance"], status: "ready" },
  { title: "供应商名录", path: "/suppliers", group: "供应商管理", icon: "Briefcase", description: "业主侧查询和开通供应商", roles: ["admin", "reviewer"], status: "ready" },
  { title: "年度资料更新", path: "/my/profile", group: "供应商管理", icon: "Document", description: "本供应商企业资料与联系人", roles: ["supplier"], status: "ready" },
  { title: "资料审核", path: "/reviews", group: "供应商管理", icon: "DocumentChecked", description: "业主侧审核年度资料", roles: ["admin", "reviewer"], status: "ready" },
  { title: "资质证照", path: "/qualifications", group: "供应商管理", icon: "Files", description: "企业资质上传、查询和到期提醒", roles: ["admin", "reviewer", "supplier"], status: "ready" },
  { title: "品牌资质", path: "/brand-qualifications", group: "供应商管理", icon: "Medal", description: "提交和维护本企业的品牌权属及供货授权", roles: ["supplier"], status: "ready" },
  { title: "品牌档案", path: "/brands", group: "商品管理", icon: "Collection", description: "维护品牌档案和处理新品牌申请", roles: ["admin", "reviewer"], status: "ready" },
  { title: "商品分类", path: "/categories", group: "商品管理", icon: "Goods", description: "查阅存量四级商品分类，供品牌资质引用", roles: ["admin", "reviewer", "finance"], status: "ready" },
  { title: "商品资料查询", path: "/catalog/products", group: "资料查询", icon: "Goods", description: "查询本供应商商品和质检报告；商品主数据属于 PSI", roles: ["admin", "reviewer", "supplier"], status: "planned" },
  { title: "供应商库存查询", path: "/catalog/inventory", group: "资料查询", icon: "Box", description: "查询本供应商相关库存；库存主数据属于 PSI", roles: ["admin", "reviewer", "supplier"], status: "planned" },
  { title: "供应商销量查询", path: "/catalog/sales", group: "资料查询", icon: "TrendCharts", description: "查询授权范围内的本供应商商品销量；销售主数据属于 PSI", roles: ["admin", "reviewer", "supplier"], status: "planned" },
  { title: "订退单接收", path: "/orders/receipts", group: "订单管理", icon: "Tickets", description: "查看、确认、下载采购订单及退货单；订单主数据属于 PSI", roles: ["admin", "reviewer", "supplier"], status: "planned" },
  { title: "发货与收货", path: "/orders/delivery", group: "订单管理", icon: "Van", description: "发货通知与收货确认协同", roles: ["admin", "reviewer", "supplier"], status: "planned" },
  { title: "订退单结算查询", path: "/orders/settlement", group: "订单管理", icon: "List", description: "按本供应商查询订单、退货和结算关联", roles: ["admin", "reviewer", "finance", "supplier", "supplier_finance"], status: "planned" },
  { title: "对账单查询", path: "/finance/statements", group: "财务管理", icon: "DocumentCopy", description: "查询对账单及关联单据，供应商确认差异", roles: ["admin", "finance", "supplier", "supplier_finance"], status: "planned" },
  { title: "发票及付款查询", path: "/finance/invoices-payments", group: "财务管理", icon: "Money", description: "查看收票与付款状态", roles: ["admin", "finance", "supplier", "supplier_finance"], status: "planned" },
  { title: "发票录入", path: "/finance/invoice-entry", group: "财务管理", icon: "EditPen", description: "对账单确认后登记供应商发票信息", roles: ["admin", "finance", "supplier", "supplier_finance"], status: "planned" },
  { title: "事务管理", path: "/finance/transactions", group: "财务管理", icon: "Memo", description: "陈列、新品费等合同约定事项及凭证", roles: ["admin", "finance", "supplier", "supplier_finance"], status: "planned" },
  { title: "历史订退单结算", path: "/archive/settlement", group: "同力商贸历史数据", icon: "Clock", description: "原同力商贸历史订单结算，只读归档", roles: ["admin", "finance", "supplier", "supplier_finance"], status: "planned" },
  { title: "历史对账单", path: "/archive/statements", group: "同力商贸历史数据", icon: "Clock", description: "原同力商贸历史对账单，只读归档", roles: ["admin", "finance", "supplier", "supplier_finance"], status: "planned" },
  { title: "历史发票及付款", path: "/archive/invoices-payments", group: "同力商贸历史数据", icon: "Clock", description: "原同力商贸历史发票和付款，只读归档", roles: ["admin", "finance", "supplier", "supplier_finance"], status: "planned" },
  { title: "历史发票录入", path: "/archive/invoice-entry", group: "同力商贸历史数据", icon: "Clock", description: "原 EDI 历史发票记录，只读查看，不再新增", roles: ["admin", "finance", "supplier", "supplier_finance"], status: "planned" },
  { title: "账号管理", path: "/accounts", group: "系统设置", icon: "UserFilled", description: "业主开通主账号，供应商主账号管理子账号", roles: ["admin", "supplier"], status: "ready" },
  { title: "角色与菜单权限", path: "/settings/roles", group: "系统设置", icon: "Lock", description: "配置角色可访问的菜单", roles: ["admin"], status: "ready" },
  { title: "通知管理", path: "/settings/notices", group: "系统设置", icon: "Bell", description: "业主发布业务通知", roles: ["admin"], status: "planned" },
  { title: "公告管理", path: "/settings/announcements", group: "系统设置", icon: "Notification", description: "业主维护平台公告", roles: ["admin"], status: "planned" },
  { title: "首页弹窗管理", path: "/settings/home-popup", group: "系统设置", icon: "ChatLineSquare", description: "业主维护登录后提示弹窗", roles: ["admin"], status: "planned" },
  { title: "修改密码", path: "/settings/password", group: "系统设置", icon: "Key", description: "账号安全设置", roles: ["admin", "reviewer", "finance", "supplier", "supplier_finance"], status: "planned" }
];

export const navigationGroups = ["工作台", "供应商管理", "商品管理", "资料查询", "订单管理", "财务管理", "同力商贸历史数据", "系统设置"];
export const menuForPath = (path: string) => navigation.find(item => item.path === path);
