<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowRight, Lock, Message, User } from "@element-plus/icons-vue";
import { useDemoStore } from "@/domain/store";
import SiteCopyright from "@/shared/SiteCopyright.vue";
import { useTabsStore } from "@/shared/tabs";
import type { DemoRole } from "@/domain/types";

const router = useRouter();
const store = useDemoStore();
const tabs = useTabsStore();
const role = ref<DemoRole>("supplier");
const account = ref("0004700");
const password = ref("demo2027");
const smsCode = ref("");
const codeSent = ref(false);
const options: { value: DemoRole; label: string; hint: string }[] = [
  { value: "supplier", label: "供应商", hint: "资料填报与子账号" },
  { value: "reviewer", label: "采购审核", hint: "资料审核与证照" },
  { value: "admin", label: "业主管理", hint: "账号开通与名录" }
];
function choose(value: DemoRole) {
  role.value = value;
  account.value = value === "supplier" ? "0004700" : value === "reviewer" ? "reviewer.demo" : "admin.demo";
  password.value = "demo2027";
  smsCode.value = "";
  codeSent.value = false;
}
function sendCode() { codeSent.value = true; ElMessage.success("演示验证码：123456（未发送真实短信）"); }
function enter() {
  if (!account.value || !password.value) { ElMessage.warning("请填写演示账号和密码"); return; }
  if (role.value === "supplier" && codeSent.value && smsCode.value !== "123456") { ElMessage.warning("演示验证码为 123456"); return; }
  store.setRole(role.value);
  tabs.reset();
  router.push("/overview");
  ElMessage.success("已进入前端演示环境");
}
</script>

<template>
  <div class="login-page">
    <div class="login-left">
      <div class="login-brand"><span class="login-logo">海</span><span><strong>海纳</strong><small>智慧零售管理平台</small></span></div>
      <div class="login-center">
        <div class="login-copy"><div class="login-kicker">HAINA · SUPPLY CHAIN</div><h1>让供应链协同<br />更清晰、更从容。</h1><p>面向供应商与采购团队的统一工作空间。<br />从企业资料更新开始，构建可靠的业务协作体验。</p></div>
        <div class="login-illustration"><div class="orb orb-one"></div><div class="orb orb-two"></div><div class="flow-card card-one"><span>01</span><strong>资料更新</strong><small>企业信息 · 联系人 · 证照</small></div><div class="flow-line"></div><div class="flow-card card-two"><span>02</span><strong>采购审核</strong><small>差异比对 · 审核留痕</small></div><div class="flow-line"></div><div class="flow-card card-three"><span>03</span><strong>协同生效</strong><small>年度资料 · 持续维护</small></div></div>
      </div>
      <div class="login-foot"><SiteCopyright dark /></div>
    </div>
    <div class="login-right"><div class="login-panel">
      <div class="login-meta"><span class="demo-pulse"></span> 前端演示环境</div>
      <h2>欢迎使用海纳 SCC</h2><p class="login-subtitle">选择一个角色，体验供应商信息管理流程</p>
      <div class="role-tabs"><button v-for="item in options" :key="item.value" :class="{ selected: role === item.value }" @click="choose(item.value)"><strong>{{ item.label }}</strong><small>{{ item.hint }}</small></button></div>
      <label class="login-label">{{ role === "supplier" ? "供应商编码 / 子账号手机号" : "演示账号" }}</label>
      <el-input v-model="account" size="large" :prefix-icon="User" placeholder="请输入账号" />
      <label class="login-label">密码</label>
      <el-input v-model="password" size="large" :prefix-icon="Lock" type="password" show-password placeholder="请输入密码" @keyup.enter="enter" />
      <template v-if="role === 'supplier'"><label class="login-label">短信验证 <span class="optional">原型演示</span></label><div class="sms-row"><el-input v-model="smsCode" size="large" :prefix-icon="Message" placeholder="点击右侧获取演示验证码" /><el-button size="large" @click="sendCode">获取验证码</el-button></div><p v-if="codeSent" class="sms-hint">演示验证码 123456；真实短信将在后端接入后启用。</p></template>
      <el-button type="primary" size="large" class="login-submit" @click="enter">进入演示平台 <el-icon><ArrowRight /></el-icon></el-button>
      <div class="login-note">当前为可交互原型。账号、密码、短信、上传和审核均使用模拟数据，不连接真实业务系统。</div>
    </div></div>
  </div>
</template>

<style scoped>
.login-page { min-height: 100vh; display: grid; grid-template-columns: minmax(450px, 54%) 1fr; background: #fff; }
.login-left { position: relative; overflow: hidden; display: flex; flex-direction: column; padding: 38px 55px 30px; color: #fff; background: radial-gradient(circle at 90% 12%, #2d658f 0,transparent 34%), linear-gradient(145deg,#10263d,#133b5b 62%,#0c2742); }
.login-left::after { content: ""; position: absolute; width: 480px; height: 480px; right: -260px; bottom: -300px; border-radius: 50%; border: 1px solid rgba(255,255,255,.1); box-shadow: 0 0 0 70px rgba(255,255,255,.025),0 0 0 145px rgba(255,255,255,.02); }
.login-brand { display: flex; align-items: center; gap: 11px; z-index: 1; }.login-logo { width: 43px; height: 43px; display: grid; place-items: center; border-radius: 12px; background: #2e89d0; font: 700 26px Georgia,serif; }.login-brand > span:last-child { display: flex; flex-direction: column; }.login-brand strong { font-size: 20px; letter-spacing: .14em; }.login-brand small { color: #a6c0d5; font-size: 10px; }
.login-center { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 0; padding: 42px 0; text-align: center; }
.login-copy { max-width: 100%; }.login-kicker { color: #85c8fa; font-size: 11px; font-weight: 700; letter-spacing: .19em; text-transform: uppercase; }.login-copy h1 { margin: 17px 0 20px; font-size: clamp(38px,4vw,54px); line-height: 1.3; letter-spacing: -.035em; }.login-copy p { margin: 0; color: #a8c0d4; font-size: 14px; line-height: 2; }
.login-illustration { position: relative; display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 50px; }.flow-card { min-width: 145px; padding: 17px; border: 1px solid rgba(255,255,255,.13); border-radius: 12px; background: rgba(255,255,255,.08); backdrop-filter: blur(10px); }.flow-card span { display: block; color: #86c6f1; font: 700 10px ui-monospace,monospace; }.flow-card strong { display: block; margin: 8px 0 5px; font-size: 14px; }.flow-card small { color: #a3bfd3; font-size: 10px; white-space: nowrap; }.flow-line { width: 28px; border-top: 1px dashed #6fa9cb; }.login-foot { position: relative; z-index: 1; color: #7fa2bb; font-size: 11px; }
.login-right { display: grid; place-items: center; padding: 48px 30px; }.login-panel { width: min(430px,100%); }.login-meta { display: flex; align-items: center; gap: 8px; color: #288659; font-size: 12px; font-weight: 600; }.login-panel h2 { margin: 18px 0 8px; color: #24374c; font-size: 29px; }.login-subtitle { margin: 0 0 26px; color: #8595a8; font-size: 13px; }.role-tabs { display: grid; grid-template-columns: repeat(3,1fr); gap: 9px; margin-bottom: 28px; }.role-tabs button { display: flex; flex-direction: column; gap: 5px; padding: 12px 9px; border: 1px solid #e3e9f0; border-radius: 9px; background: #fff; color: #4b5e73; text-align: left; }.role-tabs button.selected { border-color: #3688d7; background: #f0f7ff; color: #2169b7; box-shadow: 0 0 0 2px rgba(54,136,215,.08); }.role-tabs strong { font-size: 13px; }.role-tabs small { color: #94a2b3; font-size: 10px; white-space: nowrap; }.login-label { display: block; margin: 17px 0 8px; color: #516478; font-size: 12px; font-weight: 650; }.optional { float: right; color: #a3b0bf; font-weight: 400; }.sms-row { display: flex; gap: 9px; }.sms-row .el-input { flex: 1; }.sms-row .el-button { flex: 0 0 auto; }.sms-hint { margin: 6px 0 0; color: #2b8d69; font-size: 11px; }.login-submit { width: 100%; margin-top: 26px; height: 44px; font-weight: 650; }.login-submit .el-icon { margin-left: 8px; }.login-note { margin-top: 22px; padding: 12px 14px; border-radius: 8px; background: #f5f8fb; color: #93a0b0; font-size: 11px; line-height: 1.65; }
@media (max-width: 1180px) { .login-illustration { display: none; } }
@media (max-width: 950px) { .login-page { grid-template-columns: 1fr; }.login-left { min-height: 320px; padding: 24px; }.login-center { padding: 32px 0; }.login-copy h1 { font-size: 30px; margin: 9px 0; }.login-copy p { font-size: 12px; }.login-illustration { display: none; }.login-right { padding: 35px 18px; } }
</style>
