'use strict';

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { 
  Search, 
  LayoutDashboard, 
  FileCode, 
  Image as ImageIcon, 
  Cpu, 
  Terminal,
  X,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface VaultItem {
  id: string;
  title: string;
  category: string;
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [items, setItems] = React.useState<VaultItem[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    if (open) {
      fetchVaultItems();
    }
  }, [open]);

  const fetchVaultItems = async () => {
    const { data, error } = await supabase
      .from('vault_items')
      .select('id, title, category')
      .limit(10);
    
    if (data) {
      setItems(data);
    }
  };

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setOpen(false)}
        />
      )}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Palette"
        className={cn(
          "fixed left-[50%] top-[50%] z-50 w-full max-w-[90%] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl border border-white/10 bg-zinc-900/90 shadow-2xl transition-all md:max-w-[640px]",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
      >
        <div className="flex items-center border-b border-white/10 px-4 py-3">
          <Search className="mr-2 h-5 w-5 text-zinc-400" />
          <Command.Input
            placeholder="Type a command or search The Vault..."
            value={search}
            onValueChange={setSearch}
            className="flex-1 bg-transparent text-white outline-none placeholder:text-zinc-500"
          />
          <button 
            onClick={() => setOpen(false)}
            className="rounded-md p-1 hover:bg-white/5"
          >
            <X className="h-4 w-4 text-zinc-400" />
          </button>
        </div>

        <Command.List className="max-h-[350px] overflow-y-auto p-2 scrollbar-hide">
          <Command.Empty className="px-4 py-8 text-center text-sm text-zinc-500">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            <Item icon={LayoutDashboard} onSelect={() => runCommand(() => router.push('/'))}>Dashboard</Item>
            <Item icon={Terminal} onSelect={() => runCommand(() => router.push('/vault'))}>The Vault</Item>
          </Command.Group>

          <Command.Group heading="The Vault Categories" className="mt-4 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            <Item icon={Terminal} onSelect={() => runCommand(() => router.push('/vault?cat=AI Prompts'))}>AI Prompts</Item>
            <Item icon={ImageIcon} onSelect={() => runCommand(() => router.push('/vault?cat=Premium Assets'))}>Premium Assets</Item>
            <Item icon={FileCode} onSelect={() => runCommand(() => router.push('/vault?cat=Code Snippets'))}>Code Snippets</Item>
            <Item icon={Cpu} onSelect={() => runCommand(() => router.push('/vault?cat=Custom Models'))}>Custom Models</Item>
          </Command.Group>

          {items.length > 0 && (
            <Command.Group heading="Recent Vault Items" className="mt-4 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              {items.map((item) => (
                <Item 
                  key={item.id} 
                  icon={ArrowRight} 
                  onSelect={() => runCommand(() => router.push(`/vault/${item.id}`))}
                >
                  {item.title}
                  <span className="ml-2 text-[10px] text-zinc-600">({item.category})</span>
                </Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 text-[10px] text-zinc-500">
          <div className="flex gap-2">
            <span><kbd className="rounded bg-white/5 px-1.5 py-0.5 font-sans">↑↓</kbd> to navigate</span>
            <span><kbd className="rounded bg-white/5 px-1.5 py-0.5 font-sans">Enter</kbd> to select</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-zinc-400">KING2 AI</span>
          </div>
        </div>
      </Command.Dialog>
    </>
  );
}

function Item({ 
  children, 
  icon: Icon, 
  onSelect 
}: { 
  children: React.ReactNode; 
  icon: any; 
  onSelect: () => void 
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 aria-selected:bg-white/5 aria-selected:text-white"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Command.Item>
  );
}
