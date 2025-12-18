# RustNote 插件开发指南

本文档详细介绍如何为 RustNote Editor 开发插件。

## 目录

1. [快速开始](#快速开始)
2. [插件结构](#插件结构)
3. [清单文件](#清单文件)
4. [插件 API](#插件-api)
5. [贡献点](#贡献点)
6. [生命周期](#生命周期)
7. [最佳实践](#最佳实践)
8. [示例插件](#示例插件)

---

## 快速开始

### 创建插件

1. 在 `Plugins/` 目录下创建插件文件夹：

```bash
mkdir Plugins/my-plugin
cd Plugins/my-plugin
```

2. 创建 `package.json` 清单文件：

```json
{
  "id": "my-plugin",
  "name": "My First Plugin",
  "version": "1.0.0",
  "description": "我的第一个 RustNote 插件",
  "author": "Your Name",
  "main": "main.js",
  "commands": [
    {
      "name": "sayHello",
      "title": "Say Hello",
      "description": "显示问候消息"
    }
  ],
  "activationEvents": ["onStartup"]
}
```

3. 创建 `main.js` 入口文件：

```javascript
function activate(context) {
  console.log('My Plugin activated!');
  
  context.registerCommand('sayHello', () => {
    context.showMessage('Hello from My Plugin!');
  });
}

function deactivate() {
  console.log('My Plugin deactivated!');
}

module.exports = { activate, deactivate };
```

4. 重启 RustNote，插件将自动加载。

---

## 插件结构

### 基本结构

```
my-plugin/
├── package.json          # 清单文件（必需）
├── main.js               # 入口文件（必需）
├── README.md             # 插件说明
├── CHANGELOG.md          # 更新日志
├── LICENSE               # 许可证
└── assets/               # 资源文件
    ├── icon.png
    └── styles.css
```

### 复杂插件结构

```
advanced-plugin/
├── package.json
├── main.js
├── lib/
│   ├── commands.js       # 命令实现
│   ├── providers.js      # 提供者
│   └── utils.js          # 工具函数
├── languages/
│   ├── zh-CN.json        # 插件本地化
│   └── en.json
├── themes/
│   └── my-theme.json     # 自定义主题
└── syntaxes/
    └── my-lang.tmLanguage.json  # 语法定义
```

---

## 清单文件

### 完整字段说明

```json
{
  "id": "unique-plugin-id",
  "name": "Plugin Display Name",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者名",
  "license": "MIT",
  "homepage": "https://github.com/...",
  "repository": {
    "type": "git",
    "url": "https://github.com/..."
  },
  "main": "main.js",
  "engines": {
    "rustnote": ">=1.0.0"
  },
  "commands": [
    {
      "name": "commandName",
      "title": "Command Title",
      "description": "命令描述",
      "category": "My Plugin"
    }
  ],
  "activationEvents": [
    "onStartup",
    "onLanguage:javascript",
    "onCommand:my-plugin.commandName",
    "onFileOpen:*.md",
    "workspaceContains:**/.myconfig"
  ],
  "contributes": {
    "menus": [...],
    "keybindings": [...],
    "themes": [...],
    "languages": [...],
    "configuration": {...}
  },
  "dependencies": {
    "other-plugin": "^1.0.0"
  }
}
```

### 字段详解

#### id (必需)

插件的唯一标识符，建议使用小写字母和连字符：

```json
"id": "my-awesome-plugin"
```

#### name (必需)

插件的显示名称：

```json
"name": "My Awesome Plugin"
```

#### version (必需)

遵循语义化版本规范：

```json
"version": "1.2.3"
```

#### main (必需)

插件入口文件路径：

```json
"main": "main.js"
// 或
"main": "dist/index.js"
```

#### commands

插件提供的命令列表：

```json
"commands": [
  {
    "name": "formatDocument",
    "title": "Format Document",
    "description": "格式化当前文档",
    "category": "Formatting"
  }
]
```

#### activationEvents

定义插件何时被激活：

| 事件 | 说明 |
|------|------|
| `onStartup` | 程序启动时激活 |
| `onLanguage:xxx` | 打开指定语言文件时激活 |
| `onCommand:xxx` | 执行指定命令时激活 |
| `onFileOpen:xxx` | 打开匹配的文件时激活 |
| `workspaceContains:xxx` | 工作区包含匹配文件时激活 |
| `*` | 始终激活（不推荐） |

---

## 插件 API

### Context 对象

插件激活时会收到一个 `context` 对象，提供以下 API：

```javascript
function activate(context) {
  // 注册命令
  context.registerCommand('commandName', (args) => {
    // 命令实现
  });
  
  // 显示消息
  context.showMessage('信息消息');
  context.showWarning('警告消息');
  context.showError('错误消息');
  
  // 插入文本
  context.insertText('要插入的文本');
  
  // 获取当前编辑器内容
  const content = context.getEditorContent();
  
  // 设置编辑器内容
  context.setEditorContent('新内容');
  
  // 获取选中文本
  const selection = context.getSelection();
  
  // 获取/设置光标位置
  const position = context.getCursorPosition();
  context.setCursorPosition(10, 5); // 行, 列
  
  // 订阅事件
  context.onDidChangeActiveEditor((editor) => {
    console.log('Active editor changed');
  });
  
  context.onDidSaveDocument((document) => {
    console.log('Document saved:', document.path);
  });
  
  // 注册提供者
  context.registerCompletionProvider('javascript', {
    provideCompletionItems(document, position) {
      return [
        { label: 'console.log', kind: 'function' }
      ];
    }
  });
  
  // 存储数据
  context.globalState.set('key', 'value');
  const value = context.globalState.get('key');
  
  // 工作区存储
  context.workspaceState.set('key', 'value');
}
```

### 完整 API 参考

#### 命令 API

```javascript
// 注册命令
context.registerCommand(name, callback);

// 执行命令
context.executeCommand(commandId, ...args);

// 获取所有命令
context.getCommands();
```

#### 编辑器 API

```javascript
// 获取活动编辑器
const editor = context.activeEditor;

// 编辑器属性
editor.document.path;      // 文件路径
editor.document.content;   // 文件内容
editor.document.language;  // 语言 ID
editor.document.isDirty;   // 是否有未保存更改

// 编辑操作
editor.edit((editBuilder) => {
  editBuilder.insert(position, 'text');
  editBuilder.delete(range);
  editBuilder.replace(range, 'newText');
});

// 选择操作
editor.selection;          // 当前选择
editor.selections;         // 多选
editor.setSelection(range);
```

#### 文件系统 API

```javascript
// 读取文件
const content = await context.fs.readFile(path);

// 写入文件
await context.fs.writeFile(path, content);

// 检查文件是否存在
const exists = await context.fs.exists(path);

// 列出目录
const files = await context.fs.readDirectory(path);
```

#### UI API

```javascript
// 显示输入框
const input = await context.showInputBox({
  prompt: '请输入名称',
  placeholder: '名称',
  value: '默认值'
});

// 显示选择列表
const selected = await context.showQuickPick([
  { label: '选项1', description: '描述1' },
  { label: '选项2', description: '描述2' }
]);

// 显示进度
await context.withProgress({
  title: '处理中...',
  cancellable: true
}, async (progress, token) => {
  progress.report({ increment: 50, message: '进行中' });
  // 执行操作
});
```

---

## 贡献点

### menus - 菜单贡献

```json
"contributes": {
  "menus": [
    {
      "command": "my-plugin.formatDocument",
      "group": "1_modification",
      "when": "editorHasSelection"
    }
  ]
}
```

### keybindings - 快捷键贡献

```json
"contributes": {
  "keybindings": [
    {
      "command": "my-plugin.formatDocument",
      "key": "ctrl+shift+f",
      "when": "editorFocus"
    },
    {
      "command": "my-plugin.toggleFeature",
      "key": "ctrl+alt+t",
      "mac": "cmd+alt+t"
    }
  ]
}
```

### themes - 主题贡献

```json
"contributes": {
  "themes": [
    {
      "id": "my-dark-theme",
      "label": "My Dark Theme",
      "uiTheme": "vs-dark",
      "path": "./themes/my-dark.json"
    }
  ]
}
```

### languages - 语言贡献

```json
"contributes": {
  "languages": [
    {
      "id": "mylang",
      "aliases": ["My Language", "mylang"],
      "extensions": [".mylang", ".ml"],
      "configuration": "./language-configuration.json"
    }
  ],
  "grammars": [
    {
      "language": "mylang",
      "scopeName": "source.mylang",
      "path": "./syntaxes/mylang.tmLanguage.json"
    }
  ]
}
```

### configuration - 配置贡献

```json
"contributes": {
  "configuration": {
    "title": "My Plugin",
    "properties": {
      "myPlugin.enableFeature": {
        "type": "boolean",
        "default": true,
        "description": "启用特性"
      },
      "myPlugin.maxItems": {
        "type": "number",
        "default": 10,
        "description": "最大项目数"
      }
    }
  }
}
```

---

## 生命周期

### 激活流程

```
1. RustNote 启动
2. 扫描 Plugins/ 目录
3. 读取 package.json
4. 检查 activationEvents
5. 满足条件时调用 activate()
6. 插件开始工作
```

### 停用流程

```
1. 用户禁用插件 / 程序关闭
2. 调用 deactivate()
3. 清理资源
4. 插件停止工作
```

### 生命周期钩子

```javascript
// 激活
function activate(context) {
  console.log('Plugin activated');
  
  // 返回 API 供其他插件使用
  return {
    getVersion: () => '1.0.0',
    doSomething: () => { /* ... */ }
  };
}

// 停用
function deactivate() {
  console.log('Plugin deactivated');
  // 清理定时器、事件监听等
}

module.exports = { activate, deactivate };
```

---

## 最佳实践

### 1. 延迟加载

```javascript
// 不好：在激活时加载所有内容
function activate(context) {
  const heavyModule = require('./heavy-module');
  heavyModule.init();
}

// 好：按需加载
function activate(context) {
  context.registerCommand('heavyCommand', async () => {
    const heavyModule = await import('./heavy-module');
    heavyModule.doWork();
  });
}
```

### 2. 错误处理

```javascript
function activate(context) {
  context.registerCommand('riskyCommand', async () => {
    try {
      await riskyOperation();
    } catch (error) {
      context.showError(`操作失败: ${error.message}`);
      console.error('Command failed:', error);
    }
  });
}
```

### 3. 资源清理

```javascript
function activate(context) {
  const disposables = [];
  
  // 注册命令并保存 disposable
  disposables.push(
    context.registerCommand('myCommand', () => {})
  );
  
  // 订阅事件
  disposables.push(
    context.onDidChangeActiveEditor(() => {})
  );
  
  // 保存以便清理
  context.subscriptions.push(...disposables);
}

function deactivate() {
  // subscriptions 会自动清理
}
```

### 4. 配置监听

```javascript
function activate(context) {
  // 获取配置
  let config = context.getConfiguration('myPlugin');
  
  // 监听配置变化
  context.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('myPlugin')) {
      config = context.getConfiguration('myPlugin');
      updateFeature(config);
    }
  });
}
```

---

## 示例插件

### 示例 1: 时间戳插入器

```javascript
// Plugins/timestamp-inserter/main.js

function activate(context) {
  context.registerCommand('insertTimestamp', () => {
    const formats = [
      { label: 'ISO 8601', value: new Date().toISOString() },
      { label: 'Local', value: new Date().toLocaleString() },
      { label: 'Unix', value: Date.now().toString() }
    ];
    
    context.showQuickPick(formats).then(selected => {
      if (selected) {
        context.insertText(selected.value);
      }
    });
  });
}

function deactivate() {}

module.exports = { activate, deactivate };
```

### 示例 2: 字数统计

```javascript
// Plugins/word-counter/main.js

function activate(context) {
  const statusBarItem = context.createStatusBarItem('left', 100);
  
  function updateWordCount() {
    const content = context.getEditorContent();
    if (content) {
      const words = content.trim().split(/\s+/).length;
      const chars = content.length;
      statusBarItem.text = `字数: ${words} | 字符: ${chars}`;
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  }
  
  context.onDidChangeActiveEditor(updateWordCount);
  context.onDidChangeTextDocument(updateWordCount);
  
  updateWordCount();
}

function deactivate() {}

module.exports = { activate, deactivate };
```

### 示例 3: 代码片段

```javascript
// Plugins/snippets/main.js

const snippets = {
  'log': 'console.log($1);',
  'fn': 'function $1($2) {\n  $3\n}',
  'arr': 'const $1 = [$2];'
};

function activate(context) {
  context.registerCompletionProvider(['javascript', 'typescript'], {
    provideCompletionItems(document, position) {
      return Object.entries(snippets).map(([key, value]) => ({
        label: key,
        kind: 'snippet',
        insertText: value,
        insertTextRules: 'InsertAsSnippet',
        documentation: `插入代码片段: ${key}`
      }));
    }
  });
}

function deactivate() {}

module.exports = { activate, deactivate };
```

---

## 发布插件

### 打包

```bash
cd Plugins/my-plugin
zip -r my-plugin-1.0.0.zip .
```

### 安装

用户只需将插件文件夹复制到 `Plugins/` 目录即可。

### 更新

替换 `Plugins/` 目录中的插件文件夹，重启程序。

---

## 调试

### 开发模式

```bash
# 启动开发模式
npm run tauri dev
```

### 控制台日志

```javascript
console.log('Debug info');
console.warn('Warning');
console.error('Error');
```

在开发模式下，按 `F12` 打开开发者工具查看日志。

---

## 常见问题

### Q: 插件没有加载？

1. 检查 `package.json` 格式是否正确
2. 检查 `main` 字段指向的文件是否存在
3. 查看控制台是否有错误信息

### Q: 命令没有执行？

1. 检查命令名称是否正确
2. 检查 `activationEvents` 是否包含该命令
3. 确保插件已激活

### Q: 如何调试插件？

1. 使用 `console.log` 输出调试信息
2. 在开发模式下打开开发者工具
3. 使用断点调试

---

## 更多资源

- [RustNote 技术文档](./TECHNICAL.md)
- [API 完整参考](./API_REFERENCE.md)
- [示例插件仓库](https://github.com/rustnote/plugins)
