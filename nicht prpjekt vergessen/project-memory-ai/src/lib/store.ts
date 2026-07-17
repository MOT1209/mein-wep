import { create } from 'zustand';
import { Project, Task, Note, Activity, ProjectFile, Profile } from '@/types';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AppState {
  // Data
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  activities: Activity[];
  files: ProjectFile[];

  // Auth State
  user: User | null;
  profile: Profile | null;

  // UI State
  loading: boolean;
  error: string | null;

  // Current selections
  currentProjectId: string | null;

  // Auth Actions
  checkSession: () => Promise<void>;
  signOut: () => Promise<void>;

  // Project Actions
  fetchProjects: () => Promise<void>;
  loadProjectData: (projectId: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'last_activity'>) => Promise<string>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (id: string | null) => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Note Actions
  addNote: (note: Omit<Note, 'id' | 'created_at'>) => Promise<void>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Activity Actions
  addActivity: (activity: Omit<Activity, 'id' | 'created_at'>) => Promise<void>;

  // File Actions
  uploadFile: (projectId: string, file: globalThis.File) => Promise<void>;
  deleteFile: (id: string, filePath?: string) => Promise<void>;

  // Getters (Optional but kept for compatibility)
  getProjectTasks: (projectId: string) => Task[];
  getProjectNotes: (projectId: string) => Note[];
  getProjectFiles: (projectId: string) => ProjectFile[];
  getProjectActivities: (projectId: string) => Activity[];
  getTodayTasks: () => Task[];
  getActiveProjects: () => Project[];
  getIncompleteTasks: () => Task[];
}

export const useStore = create<AppState>((set, get) => ({
  // Initial data
  projects: [],
  tasks: [],
  notes: [],
  activities: [],
  files: [],
  user: null,
  profile: null,
  loading: false,
  error: null,
  currentProjectId: null,

  // Auth Actions
  checkSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session?.user) {
        set({ user: session.user });
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) set({ profile: profile as Profile });
      } else {
        set({ user: null, profile: null });
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, projects: [], tasks: [], notes: [], activities: [], files: [] });
  },

  // Project Actions
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch all from Supabase
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('last_activity', { ascending: false });

      if (error) throw error;
      set({ projects: data as any[] });
    } catch (error: any) {
      console.error('Failed to fetch projects:', error.message || error);
      set({ error: error.message || 'حدث خطأ غير متوقع' });
    } finally {
      set({ loading: false });
    }
  },

  loadProjectData: async (projectId: string) => {
    set({ loading: true, error: null });
    try {
      const [projectRes, tasksRes, notesRes, activitiesRes, filesRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('notes').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('activities').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('files').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      ]);

      if (projectRes.error) throw projectRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (notesRes.error) throw notesRes.error;
      if (activitiesRes.error) throw activitiesRes.error;
      if (filesRes.error) throw filesRes.error;

      set((state) => ({
        projects: state.projects.find(p => p.id === projectId) 
          ? state.projects.map(p => p.id === projectId ? projectRes.data as Project : p)
          : [projectRes.data as Project, ...state.projects],
        tasks: tasksRes.data as any[],
        notes: notesRes.data as any[],
        activities: activitiesRes.data as any[],
        files: filesRes.data as any[],
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  addProject: async (project) => {
    const currentUser = get().user;
    const projectWithUser = { ...project, user_id: currentUser?.id };
    const { data, error } = await supabase
      .from('projects')
      .insert([projectWithUser])
      .select()
      .single();

    if (error) throw error;
    set((state) => ({ projects: [data as any, ...state.projects] }));
    return data.id; // Return ID for navigation
  },

  updateProject: async (id, data) => {
    const { error } = await supabase
      .from('projects')
      .update({ ...data, last_activity: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data, last_activity: new Date().toISOString() } : p
      ),
    }));
  },

  deleteProject: async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      tasks: state.tasks.filter((t) => t.project_id !== id),
      notes: state.notes.filter((n) => n.project_id !== id),
      activities: state.activities.filter((a) => a.project_id !== id),
    }));
  },

  setCurrentProject: (id) => set({ currentProjectId: id }),

  // Task Actions
  addTask: async (task) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    set((state) => ({ tasks: [data as any, ...state.tasks] }));
    await get().addActivity({
      project_id: task.project_id,
      action: 'created_task',
      entity_type: 'task',
      entity_id: data.id,
    });
    await get().updateProject(task.project_id, { last_activity: new Date().toISOString() });
  },

  updateTask: async (id, data) => {
    const task = get().tasks.find((t) => t.id === id);
    if (task) {
      const { error } = await supabase.from('tasks').update(data).eq('id', id);
      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
      }));

      await get().addActivity({
        project_id: task.project_id,
        action: 'updated_task',
        entity_type: 'task',
        entity_id: id,
      });
      await get().updateProject(task.project_id, { last_activity: new Date().toISOString() });
    }
  },

  deleteTask: async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  // Note Actions
  addNote: async (note) => {
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select()
      .single();

    if (error) throw error;
    set((state) => ({ notes: [data as any, ...state.notes] }));
    await get().addActivity({
      project_id: note.project_id,
      action: 'added_note',
      entity_type: 'note',
      entity_id: data.id,
    });
    await get().updateProject(note.project_id, { last_activity: new Date().toISOString() });
  },

  updateNote: async (id, data) => {
    const { error } = await supabase.from('notes').update(data).eq('id', id);
    if (error) throw error;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    }));
  },

  deleteNote: async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
  },

  // Activity Actions
  addActivity: async (activity) => {
    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()
      .single();

    if (error) throw error;
    set((state) => ({ activities: [data as any, ...state.activities] }));
  },

  // File Actions
  uploadFile: async (projectId, browserFile) => {
    const user = get().user;
    if (!user) throw new Error('Not authenticated');

    const fileExt = browserFile.name.split('.').pop();
    const filePath = `${user.id}/${projectId}/${Date.now()}_${browserFile.name}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, browserFile, { upsert: false });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('project-files')
      .getPublicUrl(filePath);

    // Save metadata to DB
    const fileRecord = {
      project_id: projectId,
      file_name: browserFile.name,
      file_path: filePath,
      file_type: browserFile.type || fileExt || 'unknown',
      file_size: browserFile.size,
      file_url: urlData.publicUrl,
    };

    const { data, error: dbError } = await supabase
      .from('files')
      .insert([fileRecord])
      .select()
      .single();

    if (dbError) throw dbError;
    set((state) => ({ files: [data as any, ...state.files] }));

    await get().addActivity({
      project_id: projectId,
      action: 'uploaded_file',
      entity_type: 'file',
      entity_id: data.id,
      metadata: { file_name: browserFile.name },
    });
    await get().updateProject(projectId, { last_activity: new Date().toISOString() });
  },

  deleteFile: async (id, filePath) => {
    // Delete from Storage if path provided
    if (filePath) {
      await supabase.storage.from('project-files').remove([filePath]);
    }
    const { error } = await supabase.from('files').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ files: state.files.filter((f) => f.id !== id) }));
  },

  // Getters
  getProjectTasks: (projectId) => get().tasks.filter((t) => t.project_id === projectId),
  getProjectNotes: (projectId) => get().notes.filter((n) => n.project_id === projectId),
  getProjectFiles: (projectId) => get().files.filter((f) => f.project_id === projectId),
  getProjectActivities: (projectId) => get().activities.filter((a) => a.project_id === projectId),
  getTodayTasks: () => {
    const today = new Date().toDateString();
    return get().tasks.filter((t) => new Date(t.created_at).toDateString() === today);
  },
  getActiveProjects: () => get().projects.filter((p) => p.status === 'ACTIVE'),
  getIncompleteTasks: () => get().tasks.filter((t) => t.status !== 'DONE'),
}));
