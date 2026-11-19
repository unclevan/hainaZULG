import type { DemoRole } from "@/domain/types";

export const portal = import.meta.env.VITE_APP_PORTAL === "psi" ? "psi" : "scc";
export const portalName = portal === "psi" ? "PSI 运营后台" : "SCC 供应商门户";
export const portalRoles: DemoRole[] = portal === "psi"
  ? ["admin", "reviewer", "finance"]
  : ["supplier", "supplier_finance"];
export const defaultRole: DemoRole = portal === "psi" ? "admin" : "supplier";
export const roleBelongsToPortal = (role: DemoRole) => portalRoles.includes(role);
