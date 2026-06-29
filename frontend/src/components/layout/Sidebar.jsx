import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ScanHeart, 
  MessageSquareHeart, 
  Apple, 
  TrendingUp, 
  UserCircle 
} from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Anemia Screening", path: "/screening", icon: ScanHeart },
    { name: "AI Health Chat", path: "/chat", icon: MessageSquareHeart },
    { name: "Nutrition Engine", path: "/nutrition", icon: Apple },
    { name: "Progress Tracking", path: "/progress", icon: TrendingUp },
    { name: "Health Profile", path: "/profile", icon: UserCircle },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 glass-panel border-r border-white/5 md:min-h-[calc(100vh-73px)] p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 shrink-0 ${
                isActive
                  ? "bg-accent-gradient text-white shadow-lg shadow-accent-primary/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </aside>
  );
}
