'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type WorkspaceType = 'dashboard' | 'inspector' | 'studio' | 'settings'
type LanguageType = 'ar' | 'en'
type ThemeType = 'dark' | 'light'

export interface ProjectFile {
  id: string
  name: string
  path: string
  content: string
  type: 'file' | 'folder'
  children?: ProjectFile[]
}

interface WorkspaceState {
  activeWorkspace: WorkspaceType
  setActiveWorkspace: (w: WorkspaceType) => void
  activeDashboardTab: string
  setActiveDashboardTab: (t: string) => void
  activeStudioTab: string
  setActiveStudioTab: (t: string) => void
  
  // Theme & Language
  lang: LanguageType
  setLang: (l: LanguageType) => void
  theme: ThemeType
  setTheme: (t: ThemeType) => void
  t: (key: string) => string

  // Project Specific Files
  files: ProjectFile[]
  setFiles: (files: ProjectFile[]) => void
  addFiles: (newFiles: ProjectFile[]) => void
  clearProject: () => void
  
  // User Profile
  user: any
  setUser: (u: any) => void
}

const WorkspaceContext = createContext<WorkspaceState | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('dashboard')
  const [activeDashboardTab, setActiveDashboardTab] = useState('main')
  const [activeStudioTab, setActiveStudioTab] = useState('video')
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [lang, setLang] = useState<LanguageType>('ar')
  const [theme, setTheme] = useState<ThemeType>('dark')
  
  const [user, setUser] = useState<any>(null)

  const addFiles = (newFiles: ProjectFile[]) => {
    setFiles(prev => [...prev, ...newFiles])
  }

  const clearProject = () => {
    setFiles([])
  }

  // Translation Dictionary
  const translations: any = {
    ar: {
      dashboard: 'لوحة التحكم',
      inspector: 'فاحص الكود',
      studio: 'استوديو المحتوى',
      settings: 'الإعدادات',
      trends: 'رادار الترندات',
      engagement: 'بوت التفاعل',
      revenue: 'لوحة الأرباح',
      live: 'المركز المباشر',
      competitors: 'رادار المنافسين',
      dubber: 'المترجم العالمي',
      persona: 'الشخصية الرقمية',
      upload: 'رفع المشروع',
      clear: 'مسح المشروع',
      explorer: 'متصفح الملفات',
      audit: 'فحص أمني',
      agent: 'مساعد الذكاء',
      scan: 'بدأ الفحص',
      terminal: 'الطرفية',
      video: 'محرر الفيديو',
      thumbnail: 'المصمم الاحترافي',
      factory: 'مصنع المحتوى',
      audio: 'مختبر الصوت',
      generate: 'توليد',
      logout: 'خروج',
      dark: 'الوضع الداكن',
      light: 'الوضع الفاتح',
      timeline: 'شريط المونتاج',
      layers: 'الطبقات',
      export: 'تصدير الفيديو',
      history: 'سجل الوسائط',
      presets: 'الستايلات الجاهزة',
      cinematic: 'سينمائي',
      cyberpunk: 'سايبر بانك',
      realistic: 'واقعي',
      anime: 'أنمي',
      video_editor: 'محرر الفيديو الاحترافي',
      voice_talent: 'صوت المعلق',
      stability: 'الاستقرار',
      clarity: 'درجة الوضوح',
      generate_voice: 'توليد الصوت الاحترافي',
      audio_desc: 'تعليق صوتي احترافي بتقنية ElevenLabs',
      audio_placeholder: 'أدخل النص لتحويله إلى صوت احترافي...',
      ready_preview: 'جاهز للمعاينة',
      generate_scene: 'توليد مشهد جديد',
      scene_placeholder: 'صف المشهد بالتفصيل...',
      add_layer: 'إضافة طبقة',
      auto_sync: 'ضبط تلقائي',
      save_draft: 'حفظ مسودة',
      style_presets: 'الستايلات الجاهزة',
      thumbnail_placeholder: 'اكتب وصف التصميم هنا...',
      waiting_creativity: 'بانتظار إبداعك',
      content_factory_title: 'مصنع المحتوى الذكي',
      content_factory_desc: 'توليد سكربتات ومقالات في ثوانٍ',
      factory_topic_placeholder: 'أدخل موضوعك (مثال: مستقبل الذكاء الاصطناعي)...',
      video_script: 'سيناريو فيديو',
      seo_blog: 'مقال SEO',
      viral_ideas: 'أفكار فيروسية',
      generated_result: 'النتيجة المولدة',
      copy_text: 'نسخ النص',
      generating: 'جاري التوليد...',
      no_assets: 'لا يوجد ملفات مولدة بعد',
      creative_suite: 'مجموعة الأدوات',
      upgrade_pro: 'ترقية العضوية',
      upgrade_desc: 'افتح جودة 4K وتدريب الأصوات.',
      view_plans: 'عرض الخطط',
      workspace_badge: 'مساحة العمل',
      save_draft_alt: 'حفظ مسودة',
      video_desc_sidebar: 'مونتاج وتوليد فيديو',
      thumbnail_desc_sidebar: 'تصميم أغلفة احترافية',
      factory_desc_sidebar: 'كتابة النصوص والمقالات',
      audio_desc_sidebar: 'تحويل النص إلى صوت',
      video_script_desc: 'سكربت كامل يوتيوب/تيك توك مع هوك قوي.',
      seo_blog_desc: 'مقالات طويلة احترافية متوافقة مع محركات البحث.',
      viral_ideas_desc: '10 أفكار ترند لمجالك لزيادة المشاهدات.',
      // New translations
      video_generating: 'جاري توليد الفيديو...',
      video_ready: 'الفيديو جاهز',
      ocr_extract: 'استخراج النص',
      ocr_placeholder: 'اسحب صورة لاستخراج النص منها...',
      voice_clone: 'نسخ الصوت',
      voice_clone_desc: 'ارفع ملف صوتي لإنشاء صوت مخصص',
      gallery: 'المعرض',
      saved_drafts: 'المسودات المحفوظة',
      export_image: 'تصدير الصورة',
      text_size: 'حجم النص',
      est_time: 'الزمن المقدر',
      session_library: 'مكتبة الجلسة',
      hd_audio_ready: 'صوت عالي الدقة جاهز',
      save_mp3: 'حفظ MP3',
      clear_history: 'مسح السجل',
      '3d_render': '3D Rendering',
      watercolor: 'رسم مائي',
      download: 'تحميل'
    },
    en: {
      dashboard: 'Dashboard',
      inspector: 'Code Inspector',
      studio: 'Content Studio',
      settings: 'Settings',
      trends: 'Trend Radar',
      engagement: 'Engagement Bot',
      revenue: 'Revenue Dashboard',
      live: 'Live Center',
      competitors: 'Competitors Radar',
      dubber: 'Global Dubber',
      persona: 'AI Persona',
      upload: 'Upload Project',
      clear: 'Clear Project',
      explorer: 'Explorer',
      audit: 'Security Audit',
      agent: 'AI Assistant',
      scan: 'Scan Code',
      terminal: 'Terminal',
      video: 'Video Editor',
      thumbnail: 'Thumbnail Pro',
      factory: 'Content Factory',
      audio: 'Audio Lab',
      generate: 'Generate',
      logout: 'Logout',
      dark: 'Dark Mode',
      light: 'Light Mode',
      timeline: 'Timeline',
      layers: 'Layers',
      export: 'Export Video',
      history: 'Media History',
      presets: 'Style Presets',
      cinematic: 'Cinematic',
      cyberpunk: 'Cyberpunk',
      realistic: 'Realistic',
      anime: 'Anime',
      video_editor: 'Pro Video Editor',
      voice_talent: 'Voice Talent',
      stability: 'Stability',
      clarity: 'Clarity',
      generate_voice: 'Generate Voice',
      audio_desc: 'Professional Voiceovers with ElevenLabs',
      audio_placeholder: 'Enter text to speak...',
      ready_preview: 'Ready for Preview',
      generate_scene: 'Generate Scene',
      scene_placeholder: 'Describe the scene in detail...',
      add_layer: 'Add Layer',
      auto_sync: 'Auto-Sync',
      save_draft: 'Save Draft',
      style_presets: 'Style Presets',
      thumbnail_placeholder: 'A futuristic city...',
      waiting_creativity: 'Waiting for Creativity',
      content_factory_title: 'Smart Content Factory',
      content_factory_desc: 'Generate scripts and blogs in seconds',
      factory_topic_placeholder: 'Enter your topic (e.g. Future of AI)...',
      video_script: 'Video Script',
      seo_blog: 'SEO Blog',
      viral_ideas: 'Viral Ideas',
      generated_result: 'Generated Result',
      copy_text: 'Copy Text',
      generating: 'Generating...',
      no_assets: 'No assets generated yet',
      creative_suite: 'Creative Suite',
      upgrade_pro: 'Upgrade Pro',
      upgrade_desc: 'Unlock 4K Export and Custom Voice Training.',
      view_plans: 'View Plans',
      workspace_badge: 'Workspace',
      save_draft_alt: 'Save Draft',
      video_desc_sidebar: 'AI Video & Montage',
      thumbnail_desc_sidebar: 'Pollinations Engine',
      factory_desc_sidebar: 'Script & Blog AI',
      audio_desc_sidebar: 'ElevenLabs Voice',
      video_script_desc: 'Complete YouTube/TikTok scripts with hooks and CTA.',
      seo_blog_desc: 'Long-form articles optimized for search engines.',
      viral_ideas_desc: '10 trending topic ideas for your niche.',
      // New translations
      video_generating: 'Generating video...',
      video_ready: 'Video Ready',
      ocr_extract: 'Extract Text',
      ocr_placeholder: 'Drag image to extract text...',
      voice_clone: 'Voice Clone',
      voice_clone_desc: 'Upload audio to create custom voice',
      gallery: 'Gallery',
      saved_drafts: 'Saved Drafts',
      export_image: 'Export Image',
      text_size: 'Text Size',
      est_time: 'Est. Time',
      session_library: 'Session Library',
      hd_audio_ready: 'HD Audio Ready',
      save_mp3: 'Save MP3',
clear_history: 'Clear History',
      '3d_render': '3D Render',
      watercolor: 'Watercolor',
      download: 'Download'
    }
  }

  const t = (key: string) => translations[lang][key] || key

  return (
    <WorkspaceContext.Provider value={{ 
      activeWorkspace, 
      setActiveWorkspace, 
      activeDashboardTab,
      setActiveDashboardTab,
      activeStudioTab, 
      setActiveStudioTab,
      lang,
      setLang,
      theme,
      setTheme,
      t,
      files,
      setFiles,
      addFiles,
      clearProject,
      user,
      setUser
    }}>
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'} 
        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
      >
        {children}
      </div>
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be inside WorkspaceProvider')
  return ctx
}
