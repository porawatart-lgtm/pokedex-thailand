import Link from "next/link";
import {
  Database, Users, Book, Sword, Package, Settings,
  BarChart3, AlertTriangle, CheckCircle, Clock, RefreshCw,
  Activity, FileEdit, ShieldCheck,
} from "lucide-react";

const QUICK_STATS = [
  { label: "โปเกมอน", value: "1,025", icon: Book, color: "text-red-400", bg: "bg-red-400/10" },
  { label: "ท่าโจมตี", value: "919", icon: Sword, color: "text-blue-400", bg: "bg-blue-400/10" },
  { label: "ไอเทม", value: "954", icon: Package, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { label: "Users", value: "0", icon: Users, color: "text-green-400", bg: "bg-green-400/10" },
  { label: "Teams", value: "0", icon: BarChart3, color: "text-purple-400", bg: "bg-purple-400/10" },
  { label: "Wiki Edits", value: "0", icon: FileEdit, color: "text-orange-400", bg: "bg-orange-400/10" },
];

const ADMIN_SECTIONS = [
  {
    title: "ข้อมูล Pokémon",
    description: "จัดการฐานข้อมูล Pokémon ทั้งหมด",
    icon: Book,
    href: "/admin/pokemon",
    color: "from-red-500/20 to-orange-500/20",
    actions: ["Import จาก PokéAPI", "แก้ไขชื่อไทย", "เพิ่ม Form ใหม่"],
  },
  {
    title: "ข้อมูลท่าโจมตี",
    description: "จัดการ Moves database",
    icon: Sword,
    href: "/admin/moves",
    color: "from-blue-500/20 to-cyan-500/20",
    actions: ["Import Moves", "แก้ไขคำอธิบายไทย", "Update Effect"],
  },
  {
    title: "จัดการ Users",
    description: "จัดการบัญชีผู้ใช้และสิทธิ์",
    icon: Users,
    href: "/admin/users",
    color: "from-green-500/20 to-emerald-500/20",
    actions: ["จัดการ Role", "Ban/Unban", "ดู Activity"],
  },
  {
    title: "Wiki Edits",
    description: "รีวิวการแก้ไขจากผู้ใช้",
    icon: FileEdit,
    href: "/admin/wiki",
    color: "from-yellow-500/20 to-amber-500/20",
    actions: ["Approve/Reject", "ดูประวัติ", "Rollback"],
  },
  {
    title: "Competitive Data",
    description: "อัพเดต Tier Lists และ Usage Stats",
    icon: BarChart3,
    href: "/admin/competitive",
    color: "from-purple-500/20 to-violet-500/20",
    actions: ["Update Tiers", "Import Stats", "Edit Meta"],
  },
  {
    title: "Settings",
    description: "ตั้งค่าระบบและการกำหนดค่า",
    icon: Settings,
    href: "/admin/settings",
    color: "from-gray-500/20 to-slate-500/20",
    actions: ["Site Config", "API Keys", "Cache"],
  },
];

const RECENT_ACTIVITIES = [
  { type: "sync", message: "Synced Pokemon data from PokéAPI", time: "ไม่นานมานี้", status: "success" },
  { type: "user", message: "New user registered", time: "5 นาทีที่แล้ว", status: "info" },
  { type: "edit", message: "Wiki edit submitted for Charizard", time: "12 นาทีที่แล้ว", status: "warning" },
  { type: "system", message: "Cache cleared", time: "1 ชั่วโมงที่แล้ว", status: "success" },
];

const SYSTEM_STATUS = [
  { name: "Database", status: "online", label: "Online" },
  { name: "Redis Cache", status: "online", label: "Online" },
  { name: "PokéAPI", status: "online", label: "Reachable" },
  { name: "AI Service", status: "warning", label: "Check API Key" },
];

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1">
            Admin <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Pokédex Thailand Management Panel</p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-400" />
          <span className="text-sm text-muted-foreground">Super Admin</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {QUICK_STATS.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-4 text-center">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} mb-3`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        {/* Admin Sections */}
        <div>
          <h2 className="text-lg font-bold mb-4">จัดการระบบ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ADMIN_SECTIONS.map((section) => (
              <Link key={section.title} href={section.href}>
                <div
                  className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${section.color} p-5 transition-all hover:border-primary/30 hover:-translate-y-0.5`}
                >
                  <section.icon className="h-6 w-6 mb-3 text-foreground" />
                  <h3 className="font-bold mb-1">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                  <div className="space-y-1">
                    {section.actions.map((action) => (
                      <div key={action} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Data Import Section */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Database Operations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium hover:bg-border transition-colors">
                <RefreshCw className="h-4 w-4 text-blue-400" />
                Sync จาก PokéAPI (Gen 1-9)
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium hover:bg-border transition-colors">
                <Database className="h-4 w-4 text-green-400" />
                Import Thai Names
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium hover:bg-border transition-colors">
                <Activity className="h-4 w-4 text-purple-400" />
                Rebuild Type Chart Cache
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium hover:bg-border transition-colors">
                <BarChart3 className="h-4 w-4 text-yellow-400" />
                Import Smogon Usage Stats
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-400" />
              System Status
            </h3>
            <div className="space-y-3">
              {SYSTEM_STATUS.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-sm">{s.name}</span>
                  <div className="flex items-center gap-2">
                    {s.status === "online" ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : s.status === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`text-xs ${s.status === "online" ? "text-green-400" : s.status === "warning" ? "text-yellow-400" : "text-red-400"}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              กิจกรรมล่าสุด
            </h3>
            <div className="space-y-3">
              {RECENT_ACTIVITIES.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    activity.status === "success" ? "bg-green-400/20" :
                    activity.status === "warning" ? "bg-yellow-400/20" :
                    "bg-blue-400/20"
                  }`}>
                    {activity.status === "success" ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                    ) : activity.status === "warning" ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                    ) : (
                      <Activity className="h-3.5 w-3.5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Prisma Studio", href: "http://localhost:5555" },
                { label: "API Docs", href: "/api" },
                { label: "GraphQL", href: "/api/graphql" },
                { label: "Redis", href: "http://localhost:8001" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-center text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
