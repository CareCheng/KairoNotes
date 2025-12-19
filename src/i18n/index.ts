import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';

// 支持的语言列表（可动态扩展）
export let supportedLanguages = [
  { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
  { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

// 初始化 i18n（先用空资源，后续从外部加载）
i18n
  .use(initReactI18next)
  .init({
    resources: {},
    lng: 'zh-CN',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// 从 Language 文件夹加载所有语言文件
export async function loadLanguagesFromFolder(): Promise<void> {
  try {
    // 调用后端获取语言文件列表
    const languages = await invoke<{ code: string; data: Record<string, unknown> }[]>('load_languages');
    
    for (const lang of languages) {
      i18n.addResourceBundle(lang.code, 'translation', lang.data, true, true);
      
      // 如果是新语言，添加到支持列表
      if (!supportedLanguages.find(l => l.code === lang.code)) {
        const langData = lang.data as { language?: { [key: string]: string } };
        const nativeName = langData.language?.[lang.code.replace('-', '')] || lang.code;
        supportedLanguages.push({
          code: lang.code,
          name: lang.code,
          nativeName: nativeName as string,
        });
      }
    }
    
    console.log('Loaded languages:', languages.map(l => l.code));
  } catch (error) {
    console.error('Failed to load languages from folder:', error);
    // 加载失败时使用内置的最小翻译
    loadFallbackLanguages();
  }
}

// 内置后备翻译（最小化）
function loadFallbackLanguages(): void {
  const fallbackZhCN = {
    app: { name: 'KairoNotes' },
    common: { loading: '加载中...', error: '错误' },
    file: { new: '新建文件', open: '打开文件', save: '保存', openFolder: '打开文件夹' },
    settings: { title: '设置', language: '语言', theme: '主题' },
  };
  
  const fallbackEn = {
    app: { name: 'KairoNotes' },
    common: { loading: 'Loading...', error: 'Error' },
    file: { new: 'New File', open: 'Open File', save: 'Save', openFolder: 'Open Folder' },
    settings: { title: 'Settings', language: 'Language', theme: 'Theme' },
  };
  
  i18n.addResourceBundle('zh-CN', 'translation', fallbackZhCN, true, true);
  i18n.addResourceBundle('en', 'translation', fallbackEn, true, true);
}

// 动态加载外部语言文件
export async function loadExternalLanguage(langCode: string, langData: Record<string, unknown>): Promise<void> {
  i18n.addResourceBundle(langCode, 'translation', langData, true, true);
}

// 获取当前语言
export function getCurrentLanguage(): string {
  return i18n.language;
}

// 切换语言
export async function changeLanguage(langCode: string): Promise<void> {
  await i18n.changeLanguage(langCode);
}

// 检查语言是否已加载
export function isLanguageLoaded(langCode: string): boolean {
  return i18n.hasResourceBundle(langCode, 'translation');
}

// 重新加载语言文件（用于热更新）
export async function reloadLanguages(): Promise<void> {
  await loadLanguagesFromFolder();
}

export default i18n;
