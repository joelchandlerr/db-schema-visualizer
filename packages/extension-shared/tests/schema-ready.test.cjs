const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the real panel code with a delayed webview, without launching VS Code.
function createPanel() {
  const messages = [];
  let receive;
  const source = fs.readFileSync(path.join(__dirname, '../extension/views/panel.ts'), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  const diagnostics = { clear() {}, set() {} };
  const mocks = {
    vscode: { languages: { createDiagnosticCollection: () => diagnostics } },
    'shared/types/diagnostic': { DiagnosticError: class extends Error {} },
    '../constants': { DIAGRAM_UPDATER_DEBOUNCE_TIME: 10 },
    '../helper/extensionConfigs': { ExtensionConfig: class { getDefaultPageConfig() { return {}; } } },
    './helper': { WebviewHelper: { setupHtml: () => '<html></html>', setupWebviewHooks() {} } },
    '../types/webviewCommand': { WebviewCommand: { WEBVIEW_READY: 'WEBVIEW_READY' } },
  };
  vm.runInNewContext(compiled, { exports, require: (name) => {
    assert.ok(name in mocks, `Unexpected module: ${name}`);
    return mocks[name];
  }, console, setTimeout, clearTimeout });
  const MainPanel = exports.MainPanel;
  const panel = new MainPanel({
    onDidDispose() {},
    webview: {
      onDidReceiveMessage(handler) { receive = handler; },
      postMessage(message) { messages.push(message); },
      set html(value) { assert.equal(typeof receive, 'function'); },
    },
  }, {}, 'test');
  MainPanel.currentPanel = panel;
  MainPanel.parseCode = (code) => ({ tables: [{ name: code }], refs: [], enums: [] });
  const document = (name) => ({ getText: () => name, uri: { toString: () => name + '.dbml' } });
  return { MainPanel, messages, document, ready: () => receive({ command: 'WEBVIEW_READY' }) };
}

test('waits for the listener and sends the latest pending schema', () => {
  const { MainPanel, messages, document, ready } = createPanel();
  MainPanel.publishSchema(document('departments'));
  MainPanel.publishSchema(document('employees'));
  assert.equal(messages.length, 0);
  ready();
  assert.equal(messages.length, 1);
  assert.equal(messages[0].payload.tables[0].name, 'employees');
});

test('resends the document on webview reload and delivers subsequent edits', () => {
  const { MainPanel, messages, document, ready } = createPanel();
  MainPanel.publishSchema(document('departments'));
  ready();
  ready();
  assert.equal(messages.length, 2);
  MainPanel.publishSchema(document('employees'));
  assert.equal(messages[2].payload.tables[0].name, 'employees');
});

test('handles a ready event before a document is selected', () => {
  const { MainPanel, messages, document, ready } = createPanel();
  ready();
  assert.equal(messages.length, 0);
  MainPanel.publishSchema(document('employees'));
  assert.equal(messages.length, 1);
});
