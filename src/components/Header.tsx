import { Link, useLocation } from "react-router-dom";
import { FileText, BarChart3, LineChart, Map, LogIn, LogOut, History, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import AshokaChakra from "./AshokaChakra";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/", label: "Input", icon: FileText },
  { path: "/results", label: "Results", icon: BarChart3 },
  { path: "/impact", label: "Impact Graphs", icon: LineChart },
  { path: "/maps", label: "Maps", icon: Map },
  { path: "/history", label: "History", icon: History },
  { path: "/about", label: "About", icon: Info },
];

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full glass-dark">
      <div className="bg-gradient-to-r from-primary via-primary to-primary/90">
        {/* Tricolor Stripe */}
        <div className="flex h-1">
          <div className="flex-1 bg-secondary" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-success" />
        </div>
        
        <div className="container py-4">
          {/* Main Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary via-accent to-secondary flex items-center justify-center shadow-glow">
                  <AshokaChakra className="w-10 h-10 text-primary chakra-spin" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.2em] text-white/80 font-medium">
                  AI Parliament
                </span>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Law Impact Analysis System
                </h1>
                <p className="text-xs text-white/70 mt-0.5 max-w-md hidden sm:block">
                  Enabling Central and State Governments to understand law impacts
                </p>
              </div>
            </div>

            {/* Auth + Badge */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/80 hidden sm:inline">{user.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10 gap-1"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </Link>
              )}
              <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-white/90 flex items-center gap-2">
                <span>⚖️</span>
                <span className="hidden sm:inline">Academic Prototype</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-2 mt-4 pt-4 border-t border-white/10 flex-wrap">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2
                    transition-all duration-200 hover:-translate-y-0.5
                    ${isActive 
                      ? "bg-white text-primary shadow-elevated" 
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
