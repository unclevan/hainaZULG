import { createRouter, createWebHashHistory } from "vue-router";
import AppShell from "@/shared/AppShell.vue";
import { useDemoStore } from "@/domain/store";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/login", component: () => import("@/views/LoginView.vue"), meta: { title: "演示登录" } },
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
        { path: "reviews", component: () => import("@/views/ReviewsView.vue"), meta: { title: "资料审核" } }
      ]
    },
    { path: "/:pathMatch(.*)*", redirect: "/overview" }
  ]
});

router.beforeEach(to => {
  document.title = `${String(to.meta.title || "供应链协同")} · 海纳 SCC`;
  const role = useDemoStore().role;
  if (to.path === "/login") return;
  if (role === "supplier" && (to.path === "/suppliers" || to.path.startsWith("/suppliers/") || to.path === "/reviews")) return "/overview";
  if (role === "reviewer" && (to.path === "/accounts" || to.path === "/my/profile")) return "/overview";
  if (role === "admin" && to.path === "/my/profile") return "/overview";
});
export default router;
