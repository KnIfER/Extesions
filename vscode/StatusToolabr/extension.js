'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
let t = null;
exports.activate = function (context) {
    if (t == null) {
        t = new AdamsTool();
        t.Setup();
        
        let disposable = vscode.commands.registerCommand('ez.toggleWrapTab', () => {
            //vscode.window.showInformationMessage('Hello World!');
            const config = vscode.workspace.getConfiguration();
            var sec='workbench.editor.wrapTabs';
            return config.update(
                sec,
               ! config.get(sec),
                vscode.ConfigurationTarget.Workspace
            );
        });
        context.subscriptions.push(disposable);
    }
    context.subscriptions.push(t);
};
// http://anandganesh2005.blogspot.com/2019/03/visual-studio-code-icon-names.html
// https://code.visualstudio.com/api/references/icons-in-labels
class AdamsTool {
    pushBtn(label, tip, cmd, right, clr, sep){
        if (!this.btns) this.btns={};
        if (!this.btns[cmd]) {
            var e=vscode.window.createStatusBarItem(right?vscode.StatusBarAlignment.Right:vscode.StatusBarAlignment.Left);
            this.btns[cmd]=e;
            e.text = label;
            e.tooltip = tip;
            if(!sep)e.command = cmd;
            e.color = (clr||'yellow');
            e.show();
        }
    }
    pushSep(n){
        this.pushBtn(' ', '', 'sep'+n,0,0,1);
    }
    Setup() {
        var spc=0;
        this.pushBtn('$(word-wrap)', '自动换行', 'workbench.editor.wrapTabs');

        this.pushBtn('$(bookmark)', '切换书签', 'bookmarks.toggle');
        this.pushSep(spc++);
        this.pushBtn('$(marker-navigation-previous)', '上一书签', 'bookmarks.jumpToPrevious');
        this.pushBtn('$(marker-navigation-next)', '下一书签', 'bookmarks.jumpToNext');

        this.pushSep(spc++);
        this.pushBtn('$(code)', '匹配括号', 'editor.action.jumpToBracket');

        
        this.pushSep(spc++);
        this.pushBtn('$(arrow-left)', '后退', 'workbench.action.navigateBack');
        this.pushBtn('$(arrow-right)', '前进', 'workbench.action.navigateForward');


        this.pushBtn('$(arrow-up)', '上一光标位置', 'workbench.action.navigateLast', true);
        this.pushBtn('$(extensions-view-icon)', '标签页换行', 'ez.toggleWrapTab');
        this.pushBtn('$(browser)', '控制台', 'workbench.action.toggleDevTools', true);
        this.pushBtn('$(terminal-view-icon)', '终端', 'workbench.action.terminal.new', true);
        this.pushBtn('$(triangle-right)', '调试', 'workbench.action.debug.start', true);
        this.pushBtn('$(diff-added)', '折叠全部', 'editor.foldAll', true);
        this.pushBtn('$(diff-removed)', '展开全部', 'editor.unfoldAll', true);
    }
    dispose() {
        this.btns.forEach(e => {
            e.dispose();
        });
    }
}
exports.deactivate = function deactivate() {
    t = null;
};