export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // سنفترض أن المستخدم يريد مسح المجلد الأب للمشروع الحالي كمثال
    // في بيئة حقيقية، يمكننا السماح للمستخدم بتحديد مسار
    const baseDir = path.join(process.cwd(), '..');
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });

    const projects = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => {
        const projectPath = path.join(baseDir, entry.name);
        let description = '';
        
        // محاولة قراءة README إذا وجد
        try {
          const readmePath = path.join(projectPath, 'README.md');
          if (fs.existsSync(readmePath)) {
            description = fs.readFileSync(readmePath, 'utf8').split('\n')[0].replace('#', '').trim();
          }
        } catch (e) {
          // ignore
        }

        return {
          id: entry.name,
          name: entry.name,
          description: description || `مشروع في ${entry.name}`,
          status: 'ACTIVE',
          color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
          last_activity: fs.statSync(projectPath).mtime.toISOString(),
          created_at: fs.statSync(projectPath).birthtime.toISOString(),
          path: projectPath
        };
      });

    return NextResponse.json({ projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
