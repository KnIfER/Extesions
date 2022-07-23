## What is?
The javascript part of my editor plugin [Markdown-Text](https://github.com/NotMad-Text-Editor-Plugins/MarkdownText)

for the (Notepad++ based) **Textrument Text Editor** | 图创文本编辑器。


## More than markdown!

Asciidoc and HTML renderer are supported.

Supports Simple Darkmode.

## Synchronise scrolling (not percect yet)

I.  **Line-To-Line Mapping.** Renderers should scatter in the output many top-level `<HL ln="0"></HL>` HTML tags, where the `ln` attribute stands for it's line number. See MDViewer for details.

II. **Percentage Mapping.** If the approach above is not available, `ui.js` will simply sync scroll-percentage between two panels.

<br/>

![](screenshot.png)

[Video Demo](https://drive.google.com/file/d/1GH6_Uz3kwcxn9hfmIG8Shwezr4gM2Q4G/view?usp=sharing)









