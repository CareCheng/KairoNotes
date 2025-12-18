# RustNote 插件目录

此目录用于存放 RustNote 编辑器的插件。

## 插件结构

每个插件应该是一个独立的文件夹，包含以下文件：

```
Plugins/
├── my-plugin/
│   ├── package.json      # 插件清单文件（必需）
│   ├── main.js           # 插件入口文件（必需）
│   ├── README.md         # 插件说明文档
│   └── assets/           # 插件资源文件
```

## package.json 格式

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者名",
  "main": "main.js",
  "commands": [
    {
      "name": "myCommand",
      "title": "我的命令",
      "description": "命令描述"
    }
  ],
  "activationEvents": [
    "onStartup",
    "onLanguage:javascript"
  ],
  "contributes": {
    "menus": [],
    "keybindings": [],
    "themes": [],
    "languages": []
  }
}
```

## 开发指南

请参阅 `docs/PLUGIN_DEVELOPMENT.md` 获取详细的插件开发文档。
