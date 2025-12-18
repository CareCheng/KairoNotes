import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 内置语言作为后备
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';
import ru from './locales/ru.json';

// 内置资源
const builtinResources = {
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
  'en': { translation: en },
  'ru': { translation: ru },
};

// 支持的语言列表
export const supportedLanguages = [
  { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
  { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

// 初始化 i18n
i18n
  .use(initReactI18next)
  .init({
    resources: builtinResources,
    lng: 'zh-CN',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

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

export default i18n;
