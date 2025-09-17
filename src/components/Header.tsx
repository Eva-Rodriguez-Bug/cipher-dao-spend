import { Zap, Users, Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-stage opacity-50"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-neon bg-clip-text text-transparent animate-neon-flicker">
              DAO Spending, Keep It Private.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of confidential DAO governance with end-to-end encryption
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-cyber-green">
              <Zap className="w-4 h-4" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2 text-cyber-blue">
              <Users className="w-4 h-4" />
              <span>Community Driven</span>
            </div>
            <div className="flex items-center gap-2 text-cyber-purple">
              <Shield className="w-4 h-4" />
              <span>FHE Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-cyber animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-neon animate-pulse"></div>
    </header>
  );
};

export default Header;