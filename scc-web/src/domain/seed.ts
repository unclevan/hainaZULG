import type { DemoData } from "./types";

export const seedData: DemoData = {
  suppliers: [
    {
      id: "sup-1", code: "0004700", name: "杭州禾序食品有限公司", category: "食品经销",
      creditCode: "91330100MA2HN0001A", legalPerson: "林若宁", phone: "0571-88001234",
      email: "contact@hexu.example", postalCode: "310000", registeredAddress: "浙江省杭州市西湖区文一西路 88 号",
      businessAddress: "浙江省杭州市西湖区文一路 126 号", bankName: "示例银行杭州文一路支行",
      bankAccount: "6222 **** **** 1048", status: "active", submissionStatus: "draft", completion: 78,
      lastUpdated: "2026-11-18", reviewNote: "",
      contacts: [
        { id: "c-1", name: "林若宁", department: "销售部", position: "业务经理", mobile: "13800001001", email: "lin@hexu.example", primary: true },
        { id: "c-2", name: "周明朗", department: "财务部", position: "财务专员", mobile: "13800001002", email: "zhou@hexu.example", primary: false }
      ],
      qualifications: [
        { id: "q-1", type: "营业执照", number: "BL-2026-001", validUntil: "2032-12-31", uploadedAt: "2026-11-16", fileName: "营业执照.pdf", status: "valid" },
        { id: "q-2", type: "食品经营许可证", number: "FD-2026-108", validUntil: "2027-02-28", uploadedAt: "2026-11-16", fileName: "食品经营许可证.pdf", status: "expiring" }
      ]
    },
    {
      id: "sup-2", code: "0004690", name: "宁波青禾日用品有限公司", category: "百货",
      creditCode: "91330200MA2HN0002B", legalPerson: "许知远", phone: "0574-88002345",
      email: "service@qinghe.example", postalCode: "315000", registeredAddress: "浙江省宁波市鄞州区学府路 21 号",
      businessAddress: "浙江省宁波市鄞州区学府路 21 号", bankName: "示例银行宁波学府支行",
      bankAccount: "6222 **** **** 0623", status: "active", submissionStatus: "pending", completion: 100,
      lastUpdated: "2026-11-19", reviewNote: "",
      contacts: [{ id: "c-3", name: "许知远", department: "业务部", position: "负责人", mobile: "13800002001", email: "xu@qinghe.example", primary: true }],
      qualifications: [{ id: "q-3", type: "营业执照", number: "BL-2026-002", validUntil: "2031-08-15", uploadedAt: "2026-11-19", fileName: "营业执照.pdf", status: "pending" }]
    },
    {
      id: "sup-3", code: "0004680", name: "绍兴味源食品科技有限公司", category: "食品生产",
      creditCode: "91330600MA2HN0003C", legalPerson: "陈清禾", phone: "0575-88003456",
      email: "hello@weiyuan.example", postalCode: "312000", registeredAddress: "浙江省绍兴市越城区稽山路 36 号",
      businessAddress: "浙江省绍兴市越城区稽山路 36 号", bankName: "示例银行绍兴城南支行",
      bankAccount: "6222 **** **** 3176", status: "active", submissionStatus: "returned", completion: 62,
      lastUpdated: "2026-11-17", reviewNote: "食品生产许可证有效期信息请补充完整。",
      contacts: [{ id: "c-4", name: "陈清禾", department: "商务部", position: "经理", mobile: "13800003001", email: "chen@weiyuan.example", primary: true }],
      qualifications: [
        { id: "q-4", type: "营业执照", number: "BL-2026-003", validUntil: "2030-09-30", uploadedAt: "2026-11-12", fileName: "营业执照.pdf", status: "valid" },
        { id: "q-5", type: "食品生产许可证", number: "FP-2024-011", validUntil: "2026-12-06", uploadedAt: "2025-12-08", fileName: "食品生产许可证.pdf", status: "expired" }
      ]
    },
    {
      id: "sup-4", code: "0004670", name: "嘉兴田原农产品有限公司", category: "综合",
      creditCode: "91330400MA2HN0004D", legalPerson: "魏予安", phone: "0573-88004567",
      email: "office@tianyuan.example", postalCode: "314000", registeredAddress: "浙江省嘉兴市南湖区广益路 70 号",
      businessAddress: "浙江省嘉兴市南湖区广益路 70 号", bankName: "示例银行嘉兴南湖支行",
      bankAccount: "6222 **** **** 8902", status: "active", submissionStatus: "approved", completion: 100,
      lastUpdated: "2026-11-15", reviewNote: "2027 年度资料已审核通过。",
      contacts: [{ id: "c-5", name: "魏予安", department: "销售部", position: "业务主管", mobile: "13800004001", email: "wei@tianyuan.example", primary: true }],
      qualifications: [{ id: "q-6", type: "营业执照", number: "BL-2026-004", validUntil: "2030-05-20", uploadedAt: "2026-11-14", fileName: "营业执照.pdf", status: "valid" }]
    },
    {
      id: "sup-5", code: "0004660", name: "湖州南山百货贸易有限公司", category: "百货",
      creditCode: "91330500MA2HN0005E", legalPerson: "沈青岚", phone: "0572-88005678",
      email: "team@nanshan.example", postalCode: "313000", registeredAddress: "浙江省湖州市吴兴区凤凰路 18 号",
      businessAddress: "浙江省湖州市吴兴区凤凰路 18 号", bankName: "示例银行湖州凤凰支行",
      bankAccount: "6222 **** **** 4421", status: "active", submissionStatus: "not_started", completion: 35,
      lastUpdated: "2026-10-31", reviewNote: "",
      contacts: [{ id: "c-6", name: "沈青岚", department: "业务部", position: "负责人", mobile: "13800005001", email: "shen@nanshan.example", primary: true }],
      qualifications: [{ id: "q-7", type: "营业执照", number: "BL-2025-005", validUntil: "2028-08-31", uploadedAt: "2025-11-03", fileName: "营业执照.pdf", status: "valid" }]
    }
  ],
  subAccounts: [
    { id: "acct-1", supplierId: "sup-1", name: "周明朗", mobile: "13800001002", permissions: ["资料查看", "资质维护"], status: "active", lastLogin: "2026-11-18 14:26" },
    { id: "acct-2", supplierId: "sup-1", name: "唐一禾", mobile: "13800001003", permissions: ["资料查看"], status: "active", lastLogin: "2026-11-15 09:42" }
  ],
  activities: [
    { id: "a-1", supplierId: "sup-2", title: "年度资料待审核", detail: "宁波青禾日用品提交了 2027 年度企业资料", date: "11-19 09:30", kind: "warning" },
    { id: "a-2", supplierId: "sup-1", title: "证照即将到期", detail: "杭州禾序食品的食品经营许可证需要关注", date: "11-18 16:20", kind: "warning" },
    { id: "a-3", supplierId: "sup-3", title: "资料已退回补正", detail: "食品生产许可证有效期信息待完善", date: "11-17 10:45", kind: "info" },
    { id: "a-4", supplierId: "sup-4", title: "年度资料已通过", detail: "嘉兴田原农产品 2027 年度资料审核完成", date: "11-15 15:10", kind: "success" }
  ]
};
