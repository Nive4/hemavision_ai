import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Activity, LogOut, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
      {/* Logo */}
      <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 group-hover:border-accent-primary/50 transition-all duration-300">
          <Activity className="w-5 h-5 text-accent-primary group-hover:scale-110 transition-all duration-300" />
          <div className="absolute inset-0 w-full h-full rounded-xl bg-accent-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight bg-accent-gradient bg-clip-text text-transparent">
            HemaVision
          </span>
          <span className="text-xs font-mono ml-1 text-white/50 border border-white/10 px-1.5 py-0.5 rounded bg-white/5">
            AI
          </span>
        </div>
      </Link>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-medium text-text-primary">
                {user.email}
              </span>
              <span className="text-xs font-mono text-text-secondary">
                Patient Portal
              </span>
            </div>
            <Link
              to="/profile"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-text-secondary hover:text-text-primary transition-all duration-300"
              title="Health Profile"
            >
              <UserIcon className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/20 hover:border-accent-primary/40 text-accent-secondary hover:text-accent-secondary/80 font-medium text-sm transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-medium text-white bg-accent-gradient rounded-xl hover:shadow-lg hover:shadow-accent-primary/20 active:scale-95 transition-all duration-200"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
