#SingleInstance force
#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

执行复制()
{
	IfWinActive, ahk_exe IDMan.exe
	{
		MouseClick, right
		Send, a
		MouseClick, right
		return
	}
	; ClipTemp := ClipboardAll
	; Clipboard :=
	IfWinActive, ahk_exe PotPlayerMini64.exe
	{
		S := 
		WinGetTitle,S
		Clipboard := S
		弹出顺时消息("Title",Clipboard,"-500")
	} else {
		Send, ^c
		IfWinActive, ahk_exe explorer.exe
		{
			;ClipWait, 0.25
			S := Clipboard
			SplitPath,S,,,,S
			Clipboard := S
			;ClipWait, 0.25
			弹出顺时消息("Title",Clipboard,"-500")
			;MsgBox % "取得无后缀文件名 ： " . S
			return
		}
	}
}


killAlert:
progress,off
return

弹出顺时消息(Title,Message,Timeout,Width := "w120")  {
Progress, %Width% b1 zh0 fs18, %Message%,,%Title%,
		settimer, killAlert,%Timeout%
}


#IfWinNotActive, ahk_exe cmd.exe
F1::
执行复制()
return