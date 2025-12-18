/**
 * RustNote Example Plugin
 * 
 * 这是一个示例插件，展示了 RustNote 插件的基本结构和 API 使用方法。
 */

// 插件激活时调用
function activate(context) {
  console.log('Example Plugin activated!');
  
  // 注册命令
  context.registerCommand('helloWorld', () => {
    context.showMessage('Hello from Example Plugin!');
  });
  
  context.registerCommand('insertTimestamp', () => {
    const timestamp = new Date().toISOString();
    context.insertText(timestamp);
  });
  
  // 返回插件 API（可选）
  return {
    getVersion: () => '1.0.0',
    greet: (name) => `Hello, ${name}!`
  };
}

// 插件停用时调用
function deactivate() {
  console.log('Example Plugin deactivated!');
}

// 导出插件接口
module.exports = {
  activate,
  deactivate
};
