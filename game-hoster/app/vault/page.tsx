'use client';

import * as React from 'react';
import { 
  Search, 
  Terminal, 
  Image as ImageIcon, 
  FileCode, 
  Cpu,
  Copy,
  Check,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

type Category = 'All' | 'AI Prompts' | 'Premium Assets' | 'Code Snippets' | 'Custom Models';

interface VaultItem {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
}

export default function VaultPage() {
  const [items, setItems] = React.useState<VaultItem[]>([]);
  const [filteredItems, setFilteredItems] = React.useState<VaultItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<Category>('All');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchVaultItems();
  }, []);

  React.useEffect(() => {
    filterItems();
  }, [search, category, items]);

  const fetchVaultItems = async () => {
    const { data, error } = await supabase
      .from('vault_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setItems(data);
    }
  };

  const filterItems = () => {
    let result = items;

    if (category !== 'All') {
      result = result.filter(item => item.category === category);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(lowerSearch) ||
        item.description?.toLowerCase().includes(lowerSearch) ||
        item.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }

    setFilteredItems(result);
  };

  const copyToClipboard = async (item: VaultItem) => {
    await navigator.clipboard.writeText(item.content || item.title);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'AI Prompts': return Terminal;
      case 'Premium Assets': return ImageIcon;
      case 'Code Snippets': return FileCode;
      case 'Custom Models': return Cpu;
      default: return FileCode;
    }
  };

  const categories: Category[] = ['All', 'AI Prompts', 'Premium Assets', 'Code Snippets', 'Custom Models'];

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            The Vault (المخزن)
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Premium resources, prompts, code snippets, and custom models. 
            One-click copy and instant search.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search prompts, code, assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter className="h-5 w-5 text-zinc-500 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  category === cat 
                    ? "bg-white text-black" 
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const Icon = getCategoryIcon(item.category);
            return (
              <div
                key={item.id}
                className="group relative bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-white/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                      <Icon className="h-5 w-5 text-zinc-300" />
                    </div>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-zinc-400" />
                    )}
                  </button>
                </div>

                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-zinc-200 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="text-xs px-2 py-1 rounded-md bg-white/5 text-zinc-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {item.content && (
                  <div className="mt-4 p-3 rounded-lg bg-black/50 font-mono text-xs text-zinc-400 overflow-hidden">
                    <pre className="line-clamp-3">{item.content}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="p-4 rounded-full bg-zinc-900 w-fit mx-auto mb-4">
              <Search className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-zinc-400">No items found</h3>
            <p className="text-zinc-500">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}