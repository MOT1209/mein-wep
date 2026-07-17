'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

const supabase = createClient(supabaseUrl, supabaseKey)

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'generate'>('search')

  // Search State
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([
    {
      id: "1",
      title: "سورة الكهف - بصوت هادئ",
      video_url: "https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4",
    },
    {
      id: "2",
      title: "سورة طه - تلاوة خاشعة",
      video_url: "https://flutter.github.io/assets-for-api-docs/assets/videos/bee.mp4",
    },
    {
      id: "3",
      title: "أنشودة: رحمن يا رحمن",
      video_url: "https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4",
    },
    {
      id: "4",
      title: "سورة يوسف - آيات الصبر",
      video_url: "https://flutter.github.io/assets-for-api-docs/assets/videos/bee.mp4",
    },
    {
      id: "5",
      title: "أنشودة: أشرق النور",
      video_url: "https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4",
    }
  ])
  const [isSearching, setIsSearching] = useState(false)

  // Generation State
  const [generatePrompt, setGeneratePrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReels, setGeneratedReels] = useState<any[]>([])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);

    const mockEmbedding = Array(1536).fill(0.01);
    const { data, error } = await supabase.rpc('match_content', {
      query_embedding: mockEmbedding,
      match_threshold: 0.7,
      match_count: 5
    });

    if (error) console.error(error);
    if (data) setResults(data);
    setIsSearching(false);
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatePrompt.trim()) return;
    setIsGenerating(true);

    // Mock AI Generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In the future, this will call a Supabase Edge Function:
    // const { data, error } = await supabase.functions.invoke('generate-reel', { body: { prompt: generatePrompt } })

    const newReel = {
      id: Math.random().toString(),
      title: generatePrompt,
      video_url: null, // Placeholder for generated video
      status: 'processing'
    };

    setGeneratedReels([newReel, ...generatedReels]);
    setGeneratePrompt('');
    setIsGenerating(false);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-8">
      <div className="max-w-4xl mx-auto mt-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          منصة الريلز القرآنية والأناشيد
        </h1>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'search'
              ? 'bg-emerald-500 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
          >
            البحث في المكتبة
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'generate'
              ? 'bg-cyan-500 text-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
          >
            توليد بالذكاء الاصطناعي
          </button>
        </div>

        {/* Tab Content: Search */}
        {activeTab === 'search' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto mb-16">
              <input
                type="text"
                placeholder="ابحث عن آيات للسكينة، أو اسم أنشودة معينة..."
                className="w-full p-4 md:p-5 rounded-2xl bg-slate-800/80 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg text-white shadow-xl backdrop-blur-sm placeholder:text-slate-400"
                style={{ direction: 'rtl' }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" disabled={isSearching} className="absolute left-2 top-2 bottom-2 bg-emerald-500 hover:bg-emerald-400 px-8 rounded-xl font-bold transition-all text-slate-900 shadow-md">
                {isSearching ? 'جاري البحث...' : 'ابحث'}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ direction: 'rtl' }}>
              {results.length === 0 && !isSearching && (
                <div className="col-span-full text-center text-slate-400 mt-10">
                  <p className="text-xl">اكتب شيئاً للبحث عن آيات تواسي قلبك أو أناشيد ملهمة 🤍</p>
                </div>
              )}
              {results.map((reel: any) => (
                <VideoCard key={reel.id} reel={reel} />
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Generate */}
        {activeTab === 'generate' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleGenerate} className="relative w-full max-w-2xl mx-auto mb-16">
              <textarea
                placeholder="اكتب وصفاً للأنشودة أو الآية التي تريد تصميمها... مثلاً: خلفية مطر هادئ مع آيات عن الصبر والتفاؤل"
                className="w-full p-4 md:p-5 h-32 rounded-2xl bg-slate-800/80 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-lg text-white shadow-xl backdrop-blur-sm placeholder:text-slate-400 resize-none"
                style={{ direction: 'rtl' }}
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
              />
              <button type="submit" disabled={isGenerating} className="absolute left-4 bottom-4 bg-cyan-500 hover:bg-cyan-400 px-6 py-2 rounded-xl font-bold transition-all text-slate-900 shadow-md">
                {isGenerating ? 'جاري التصميم...' : 'صمم المقطع ✨'}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ direction: 'rtl' }}>
              {generatedReels.length === 0 && (
                <div className="col-span-full text-center text-slate-400 mt-10">
                  <p className="text-xl">دع الذكاء الاصطناعي يبدع في نسج آياتك وأناشيدك المفضلة 🎨</p>
                </div>
              )}
              {generatedReels.map((reel: any) => (
                <div key={reel.id} className="group relative rounded-2xl overflow-hidden bg-slate-800 shadow-lg border border-slate-700 flex flex-col items-center justify-center p-6 min-h-[320px]">
                  {reel.status === 'processing' ? (
                    <div className="flex flex-col items-center text-cyan-400">
                      <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                      <p className="font-bold animate-pulse">جاري دمج الصوت والصورة...</p>
                    </div>
                  ) : (
                    <VideoCard reel={reel} />
                  )}
                  <h3 className="font-medium text-center text-slate-300 mt-4 leading-relaxed line-clamp-2">"{reel.title}"</h3>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function VideoCard({ reel }: { reel: any }) {
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-slate-800 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 cursor-pointer border border-slate-700 hover:border-emerald-500/50 w-full">
      {reel.video_url ? (
        <video src={reel.video_url} className="w-full h-80 object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />
      ) : (
        <div className="w-full h-80 bg-slate-900 flex flex-col items-center justify-center text-slate-500">
          <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <span>المقطع غير متوفر</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
        <h3 className="font-bold text-xl text-white mb-2">{reel.title}</h3>
        <p className="text-emerald-400 text-sm font-medium flex items-center gap-1">
          <span>شغل المقطع</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </p>
      </div>
    </div>
  )
}
