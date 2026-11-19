import { createRouter, createWebHashHistory } from "vue-router";
import AppShell from "@/shared/AppShell.vue";
import { useDemoStore } from "@/domain/store";
import { useAccessStore } from "@/shared/access";
import { navigation } from "@/shared/navigation";
import { portalName, roleBelongsToPortal } from "@/shared/portal";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/login", component: () => import("@/views/LoginView.vue"), meta: { title: "登录" } },
    {
      path: "/",
      component: AppShell,
      children: [
        { path: "", redirect: "/login" },
        { path: "overview", component: () => import("@/views/OverviewView.vue"), meta: { title: "工作台" } },
        { path: "suppliers", component: () => import("@/views/SupplierListView.vue"), meta: { title: "供应商名录" } },
        { path: "suppliers/:id", component: () => import("@/views/ProfileView.vue"), meta: { title: "供应商档案" } },
        { path: "my/profile", component: () => import("@/views/ProfileView.vue"), meta: { title: "年度资料更新" } },
        { path: "qualifications", component: () => import("@/views/QualificationsView.vue"), meta: { title: "资质证照" } },
        { path: "accounts", component: () => import("@/views/AccountsView.vue"), meta: { title: "账号管理" } },
        { path: "reviews", component: () => import("@/views/ReviewsView.vue"), meta: { title: "资料审核" } },
        { path: "settings/roles", component: () => import("@/views/RolePermissionsView.vue"), meta: { title: "角色与菜单权限" } },
        ...navigation.filter(item => item.status === "planned").map(item => ({ path: item.path.slice(1), component: () => import("@/views/PlannedView.vue"), meta: { title: item.title } }))
      ]
    },
    { path: "/:pathMatch(.*)*", redirect: "/overview" }
  ]
});

router.beforeEach(to => {
  document.title = `${String(to.meta.title || "工作台")} · 海纳 ${portalName}`;
  const role = useDemoStore().role;
  if (to.path === "/login") return;
  if (!roleBelongsToPortal(role)) return "/login";
  const menuPath = to.path.startsWith("/suppliers/") ? "/suppliers" : to.path;
  if (!useAccessStore().canVisit(role, menuPath)) return "/overview";
});
export default router;
