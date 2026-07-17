export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Allowed extensions for code analysis
const ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.md', '.json', '.html', '.css', '.py', '.go', '.rs', '.php', '.c', '.cpp', '.h', '.bat', '.sh'];

export async function POST(request: Request) {
  try {
    const { filePath } = await request.json();

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    // Path sanitization - prevent directory traversal attacks
    if (filePath.includes('..')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Block system directories
    const SYSTEM_DIRS = ['Windows', 'System32', 'SysWOW64', 'Program Files', 'Program Files (x86)', 'bootmgr', 'pagefile.sys', 'hiberfil.sys'];
    const pathParts = filePath.split(/[\\/]/);
    if (pathParts.some(part => SYSTEM_DIRS.includes(part))) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return NextResponse.json({ error: 'Path is a directory, not a file' }, { status: 400 });
    }

    const ext = path.extname(filePath).toLowerCase();
    
    // Size check (max 1MB for analysis)
    if (stats.size > 1024 * 1024) {
      return NextResponse.json({ error: 'File too large for analysis (>1MB)' }, { status: 400 });
    }

    const content = fs.readFileSync(filePath, 'utf8');

    return NextResponse.json({
      name: path.basename(filePath),
      path: filePath,
      content,
      size: stats.size,
      extension: ext
    });
  } catch (error: any) {
    console.error('File Read API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
