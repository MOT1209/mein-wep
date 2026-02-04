"use client";

import Link from "next/link";
import { Menu, Globe, User } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 rounded-b-2xl mx-4 mt-4 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition">
                    <span className="text-gradient">Game</span>Hoster
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
                    <Link href="/games" className="hover:text-white hover:text-accent transition">Game Hosting</Link>
                    <Link href="/web" className="hover:text-white hover:text-accent transition">Web Hosting</Link>
                    <Link href="/apps" className="hover:text-white hover:text-accent transition">App Hosting</Link>
                    <Link href="/pricing" className="hover:text-white hover:text-accent transition">Pricing</Link>
                    <Link href="/support" className="hover:text-white hover:text-accent transition">Support</Link>
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <button className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Language">
                        <Globe size={20} />
                    </button>

                    <Link href="/login" className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary/20 border border-primary/50 hover:bg-primary/40 transition">
                        <User size={18} />
                        <span>Login</span>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-gray-300"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div className="md:hidden pt-4 pb-2 border-t border-glass-border mt-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                    <Link href="/games" className="block py-2 px-4 hover:bg-white/5 rounded-lg">Game Hosting</Link>
                    <Link href="/web" className="block py-2 px-4 hover:bg-white/5 rounded-lg">Web Hosting</Link>
                    <Link href="/apps" className="block py-2 px-4 hover:bg-white/5 rounded-lg">App Hosting</Link>
                    <Link href="/login" className="block py-2 px-4 bg-primary/20 rounded-lg text-center mt-2">Login / Register</Link>
                </div>
            )}
        </nav>
    );
}
