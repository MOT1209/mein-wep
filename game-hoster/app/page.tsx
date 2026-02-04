import Navbar from "./components/Navbar";
import { Server, Globe, Smartphone, Shield, Zap, Cpu } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen font-sans selection:bg-primary selection:text-white pb-20">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-accent font-medium">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
              </span>
              Now Hosting 50,000+ Servers
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Hosting The <br />
              <span className="text-gradient">Next Generation</span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-lg">
              Deployment made simple. Launch your games, websites, and apps on our high-performance cloud infrastructure. DDoS protection included.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/pricing" className="px-8 py-4 bg-primary hover:bg-primary/80 text-white rounded-xl font-bold text-lg transition shadow-[0_0_20px_var(--primary-glow)] hover:shadow-[0_0_30px_var(--primary-glow)]">
                Start Hosting
              </Link>
              <Link href="/features" className="px-8 py-4 glass-panel hover:bg-white/5 rounded-xl font-bold text-lg transition">
                View Features
              </Link>
            </div>

            <div className="pt-8 flex items-center gap-8 text-sm text-gray-500 font-mono">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-emerald-400" /> DDoS Protected
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" /> Instant Setup
              </div>
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-blue-400" /> NVMe SSDs
              </div>
            </div>
          </div>

          {/* 3D / Visual Element */}
          <div className="relative z-0 hidden lg:block">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse-glow"></div>
            <div className="relative glass-panel rounded-3xl p-8 border-t border-l border-white/10 [animation:float_6s_ease-in-out_infinite]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-gray-400 font-mono">server-status: online</div>
              </div>

              <div className="space-y-4 font-mono text-sm text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>CPU Usage</span>
                  <span className="text-accent">12%</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Memory</span>
                  <span className="text-secondary">4.2GB / 16GB</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Disk I/O</span>
                  <span className="text-emerald-400">450 MB/s</span>
                </div>
                <div className="p-4 bg-black/30 rounded-lg mt-4 text-xs text-green-400">
                  $ root@host:~# docker run -d -p 25565:25565 minecraft-server:latest <br />
                  <span className="text-gray-500">[INFO] Container started. ID: 8f4a2c1</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Complete Hosting Ecosystem</h2>
            <p className="text-gray-400 font-medium">Everything you need to power your digital presence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-6">
                <Server size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Game Hosting</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Low-latency servers for Minecraft, Rust, ARK, and more. Mod support and one-click plugins included.
              </p>
              <Link href="/games" className="text-primary font-medium hover:gap-2 transition-all flex items-center gap-1">
                Explore Games &rarr;
              </Link>
            </div>

            {/* Card 2 */}
            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary mb-6">
                <Globe size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Web Hosting</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Blazing fast Node.js, Python, and PHP hosting. Free SSL, DDoS protection, and global CDN.
              </p>
              <Link href="/web" className="text-secondary font-medium hover:gap-2 transition-all flex items-center gap-1">
                View Web Plans &rarr;
              </Link>
            </div>

            {/* Card 3 */}
            <div className="glass-panel p-8 rounded-2xl hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center text-accent mb-6">
                <Smartphone size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">App Hosting</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Deploy your Mobile App backends and APIs with ease. Scalable databases and real-time logs.
              </p>
              <Link href="/apps" className="text-accent font-medium hover:gap-2 transition-all flex items-center gap-1">
                Deploy Apps &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
