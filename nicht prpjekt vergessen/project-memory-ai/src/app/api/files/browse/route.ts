export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  try {
    const { currentPath } = await request.json();
    
    // Path sanitization - prevent directory traversal attacks
    if (currentPath && currentPath.includes('..')) {
      return NextResponse.json({ error: 'مسار غير صالح' }, { status: 400 });
    }

    // Block system directories
    const SYSTEM_DIRS = ['Windows', 'System32', 'SysWOW64', 'Program Files', 'Program Files (x86)', 'bootmgr', 'pagefile.sys', 'hiberfil.sys'];
    const pathParts: string[] = currentPath ? currentPath.split(/[\\/]/) : [];
    if (pathParts.some((part: string) => SYSTEM_DIRS.includes(part))) {
      return NextResponse.json({ error: 'مسار غير صالح' }, { status: 400 });
    }
    
    // Default to Home directory or Projects folder
    let targetPath = currentPath || os.homedir();

    if (!fs.existsSync(targetPath)) {
      return NextResponse.json({ error: 'المسار غير موجود' }, { status: 404 });
    }

    const stats = fs.statSync(targetPath);
    if (!stats.isDirectory()) {
      return NextResponse.json({ error: 'المسار ليس مجلداً' }, { status: 400 });
    }

    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    
    const folders = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => ({
        name: entry.name,
        path: path.join(targetPath, entry.name),
        type: 'directory'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const files = entries
      .filter(entry => !entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => ({
        name: entry.name,
        path: path.join(targetPath, entry.name),
        type: 'file'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      currentPath: targetPath,
      parentPath: path.dirname(targetPath),
      folders,
      files
    });
  } catch (error: any) {
    console.error('Browse API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
