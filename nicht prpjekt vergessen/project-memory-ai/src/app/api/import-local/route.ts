export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { folderPath } = await request.json();

    if (!folderPath || typeof folderPath !== 'string') {
      return NextResponse.json({ error: 'Folder path is required' }, { status: 400 });
    }

    // Basic security check (prevent checking root drive itself, etc. depending on OS)
    if (folderPath === '/' || folderPath === 'C:\\') {
      return NextResponse.json({ error: 'invalid path' }, { status: 400 });
    }

    // Check if path exists and is a directory
    if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
      return NextResponse.json({ error: 'المسار غير صالح أو المجلد غير موجود' }, { status: 404 });
    }

    const folderName = path.basename(folderPath);
    let description = '';

    // Try reading README.md
    try {
      const readmePath = path.join(folderPath, 'README.md');
      if (fs.existsSync(readmePath)) {
        description = fs.readFileSync(readmePath, 'utf8').split('\n')[0].replace('#', '').trim();
      }
    } catch (e) {
      // ignore
    }

    const projectData = {
      name: folderName,
      description: description || `مشروع مستورد من: ${folderPath}`,
      status: 'ACTIVE',
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      last_activity: fs.statSync(folderPath).mtime.toISOString(),
      path: folderPath
    };

    return NextResponse.json({ project: projectData });
  } catch (error: any) {
    console.error('Local Import Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
