// FileIcon Component - 文件类型图标
import { 
  File, FileText, FileCode, FileJson, FileImage, FileVideo, FileAudio,
  FileArchive, FileSpreadsheet, Folder, FolderOpen, FolderGit,
  FileType, FileCog, FileKey, Database, Terminal, Globe, Palette,
  BookOpen, Settings, Package, Lock, Shield, Braces, Hash
} from 'lucide-react';

interface FileIconProps {
  name: string;
  isDirectory?: boolean;
  isExpanded?: boolean;
  isGitFolder?: boolean;
  size?: number;
  className?: string;
}

// 文件扩展名到图标的映射
const extensionIcons: Record<string, React.ComponentType<any>> = {
  // 编程语言
  js: FileCode,
  jsx: FileCode,
  ts: FileCode,
  tsx: FileCode,
  py: FileCode,
  rs: FileCode,
  go: FileCode,
  java: FileCode,
  c: FileCode,
  cpp: FileCode,
  h: FileCode,
  hpp: FileCode,
  cs: FileCode,
  rb: FileCode,
  php: FileCode,
  swift: FileCode,
  kt: FileCode,
  scala: FileCode,
  r: FileCode,
  lua: FileCode,
  pl: FileCode,
  sh: Terminal,
  bash: Terminal,
  zsh: Terminal,
  ps1: Terminal,
  bat: Terminal,
  cmd: Terminal,
  
  // Web
  html: Globe,
  htm: Globe,
  css: Palette,
  scss: Palette,
  sass: Palette,
  less: Palette,
  vue: FileCode,
  svelte: FileCode,
  
  // 数据格式
  json: FileJson,
  jsonc: FileJson,
  xml: Braces,
  yaml: FileCog,
  yml: FileCog,
  toml: FileCog,
  ini: FileCog,
  conf: FileCog,
  env: FileKey,
  
  // 文档
  md: BookOpen,
  markdown: BookOpen,
  txt: FileText,
  rtf: FileText,
  doc: FileText,
  docx: FileText,
  pdf: FileText,
  tex: FileText,
  rst: FileText,
  
  // 图片
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  svg: FileImage,
  ico: FileImage,
  webp: FileImage,
  bmp: FileImage,
  
  // 视频
  mp4: FileVideo,
  avi: FileVideo,
  mov: FileVideo,
  mkv: FileVideo,
  webm: FileVideo,
  
  // 音频
  mp3: FileAudio,
  wav: FileAudio,
  ogg: FileAudio,
  flac: FileAudio,
  
  // 压缩包
  zip: FileArchive,
  rar: FileArchive,
  '7z': FileArchive,
  tar: FileArchive,
  gz: FileArchive,
  
  // 表格
  csv: FileSpreadsheet,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  
  // 数据库
  sql: Database,
  db: Database,
  sqlite: Database,
  
  // 配置
  lock: Lock,
  key: FileKey,
  pem: Shield,
  crt: Shield,
  
  // 包管理
  npmrc: Package,
  yarnrc: Package,
};

// 特殊文件名到图标的映射
const filenameIcons: Record<string, React.ComponentType<any>> = {
  'package.json': Package,
  'package-lock.json': Lock,
  'yarn.lock': Lock,
  'pnpm-lock.yaml': Lock,
  'cargo.toml': Package,
  'cargo.lock': Lock,
  'go.mod': Package,
  'go.sum': Lock,
  'requirements.txt': Package,
  'pipfile': Package,
  'pipfile.lock': Lock,
  'gemfile': Package,
  'gemfile.lock': Lock,
  'dockerfile': FileCode,
  'docker-compose.yml': FileCog,
  'docker-compose.yaml': FileCog,
  '.dockerignore': FileCog,
  '.gitignore': FileCog,
  '.gitattributes': FileCog,
  '.gitmodules': FileCog,
  '.editorconfig': Settings,
  '.prettierrc': Settings,
  '.eslintrc': Settings,
  '.eslintrc.js': Settings,
  '.eslintrc.json': Settings,
  'tsconfig.json': Settings,
  'jsconfig.json': Settings,
  'vite.config.ts': Settings,
  'vite.config.js': Settings,
  'webpack.config.js': Settings,
  'rollup.config.js': Settings,
  'babel.config.js': Settings,
  '.babelrc': Settings,
  'readme.md': BookOpen,
  'readme': BookOpen,
  'license': FileText,
  'license.md': FileText,
  'changelog.md': FileText,
  'contributing.md': FileText,
  'makefile': FileCog,
  'cmakelists.txt': FileCog,
};

// 文件夹名称到图标的映射
const folderIcons: Record<string, React.ComponentType<any>> = {
  '.git': FolderGit,
  'node_modules': Folder,
  'src': Folder,
  'dist': Folder,
  'build': Folder,
  'public': Folder,
  'assets': Folder,
  'images': Folder,
  'img': Folder,
  'styles': Folder,
  'css': Folder,
  'components': Folder,
  'pages': Folder,
  'views': Folder,
  'utils': Folder,
  'lib': Folder,
  'hooks': Folder,
  'store': Folder,
  'api': Folder,
  'services': Folder,
  'models': Folder,
  'types': Folder,
  'interfaces': Folder,
  'tests': Folder,
  '__tests__': Folder,
  'test': Folder,
  'spec': Folder,
  'docs': Folder,
  'config': Folder,
  'scripts': Folder,
};

export function FileIcon({ name, isDirectory, isExpanded, isGitFolder, size = 16, className = '' }: FileIconProps) {
  const lowerName = name.toLowerCase();
  
  // 文件夹图标
  if (isDirectory) {
    if (isGitFolder || lowerName === '.git') {
      return <FolderGit size={size} className={`file-icon folder git ${className}`} />;
    }
    const FolderIcon = isExpanded ? FolderOpen : Folder;
    return <FolderIcon size={size} className={`file-icon folder ${className}`} />;
  }
  
  // 特殊文件名
  const FilenameIcon = filenameIcons[lowerName];
  if (FilenameIcon) {
    return <FilenameIcon size={size} className={`file-icon ${className}`} />;
  }
  
  // 按扩展名
  const ext = lowerName.split('.').pop() || '';
  const ExtIcon = extensionIcons[ext];
  if (ExtIcon) {
    return <ExtIcon size={size} className={`file-icon ${className}`} />;
  }
  
  // 默认文件图标
  return <File size={size} className={`file-icon ${className}`} />;
}

// 获取文件图标颜色类名
export function getFileIconColor(name: string, isDirectory?: boolean): string {
  if (isDirectory) return 'icon-folder';
  
  const ext = name.toLowerCase().split('.').pop() || '';
  
  // 编程语言颜色
  const langColors: Record<string, string> = {
    js: 'icon-javascript',
    jsx: 'icon-javascript',
    ts: 'icon-typescript',
    tsx: 'icon-typescript',
    py: 'icon-python',
    rs: 'icon-rust',
    go: 'icon-go',
    java: 'icon-java',
    c: 'icon-c',
    cpp: 'icon-cpp',
    cs: 'icon-csharp',
    rb: 'icon-ruby',
    php: 'icon-php',
    swift: 'icon-swift',
    html: 'icon-html',
    css: 'icon-css',
    scss: 'icon-scss',
    json: 'icon-json',
    md: 'icon-markdown',
    yaml: 'icon-yaml',
    yml: 'icon-yaml',
    xml: 'icon-xml',
    sql: 'icon-sql',
    sh: 'icon-shell',
    vue: 'icon-vue',
    svelte: 'icon-svelte',
  };
  
  return langColors[ext] || 'icon-default';
}
