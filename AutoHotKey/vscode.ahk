#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
#MaxThreadsPerHotkey 2 


;!Enter::  
;	;toggle_置顶()
;	弹出顺时消息("Title","SendMessage","-500", "w120")
;	;SendMessage, 0x000C, 0, "New Notepad Title"  ; 0x000C is WM_SETTEXT
;	;SendMessage, WM_SYSCOMMAND, 0xF170, 2,, Program Manager  ; 0x0112 is WM_SYSCOMMAND, 0xF170 is SC_MONITORPOWER.
;	;PostMessage, 0x0111, 33000, 0
;	;, 1, Chrome_RenderWidgetHostHWND1
;	PostMessage, 0x007B, 0, 0
;
;return


+AppsKey::
return

^AppsKey::
return

AppsKey::
return

Ins::
	SetStoreCapsLockMode, Off
return

^CapsLock::
	Send ^{Tab}
return

!CapsLock::
	Send !{Tab}
return

CapsLock::
	Send {Tab}
return

+CapsLock::
	Send +{Tab}
return


~NumpadDiv::
IfWinNotActive ahk_exe msedge.exe and IfWinNotActive ahk_exe PotPlayerMini64.exe
	click
return

~NumpadMult::
IfWinNotActive ahk_exe msedge.exe and IfWinNotActive ahk_exe PotPlayerMini64.exe
	click
return

~F1::
ensureLdOff()
;执行复制()
return

ensureLdOff() {
    global ldrun
	if ldrun
		#IfWinNotActive ahk_exe msedge.exe
			ldrun := 0
}

#IfWinActive ahk_exe explorer.exe
F1::
	ensureLdOff()
	执行复制()
return

global lastXW := 0

#IfWinActive ahk_exe chrome.exe
NumpadAdd:: ; 小键盘加号打开谷歌翻译，自带回车切换
	CoordMode, Mouse, Screen
	global lastXW
	MouseGetPos, xpos, ypos
	WinGetPos,x,y,w,h
	xw := lastXW
	WinGetTitle, title
	IfInString, title, Chrome
	{
		xw := x + w
		lastXW := xw
		;弹出顺时消息("Title",title . xw, "-500", "w720")
	}
	pY := ypos
	if pY<200
		pY := 200
	MouseClick, Right, xw - 10, pY
	MouseMove, xpos, ypos
	sleep, 20
	Send {T}
	sleep, 20
	Send {T}
	;MouseMove, lastX, ypos
	; DllCall("SetCursorPos", "int", lastX, "int", ypos)
	var=取消置顶 %lastX% - %ypos%
	;弹出顺时消息("Title",var, "-500", "w120")
return
F1::
	ensureLdOff()
	Send {F12}
return
!Enter::  
	toggle_置顶()
	; MouseGetPos, xpos, ypos
	; WinGetPos,x,y,w,h
	; MouseClick, Left, w - 10, ypos
	; MouseMove, xpos, ypos
	;MouseClick, Right
	;sleep, 20
	;Send {D}
return



global edgeld = True

#IfWinActive ahk_exe textrument.exe
!Enter::  
	toggle_置顶()
return

#IfWinActive ahk_exe msedge.exe
F1::
	edege_f1()
return
~+Del::
	MouseGetPos, xpos, ypos 
	if ypos>200
		toggle_f1()
return
F7::
	toggle_f1()
return
!Enter::  
	toggle_置顶()
return

toggle_置顶(){
	Winset, Alwaysontop, , A
	WinGet, ExStyle, ExStyle
	if (ExStyle & 0x8)  ; 0x8 is WS_EX_TOPMOST.
		弹出顺时消息("Title","置顶!!","-500", "w120")
	else
		弹出顺时消息("Title","取消置顶","-500", "w120")
}

toggle_f1(){
	global edgeld
	IfWinNotActive ahk_exe msedge.exe
		ensureLdOff()
	else
		edgeld := !edgeld
	if edgeld
		弹出顺时消息("Title","连点!!","-500", "w120")
	else
		弹出顺时消息("Title","取消连点","-500", "w120")
}

edege_f1(){
	global edgeld
	if edgeld
		连点()
	else	
		Send {F12}
}

#IfWinActive ahk_exe Code.exe
;!Enter::  
;	toggle_置顶()
;return
~MButton up::
MouseGetPos, xpos, ypos

if (ypos >= 87) {
    SendInput,{Click}{F12}
	;Send ^{Click}
}
return

#IfWinActive ahk_exe devenv.exe
~MButton::
MouseGetPos, xpos, ypos

if (ypos >= 200) {
    SendInput,{Click}{F12}
}
return

~F1::
Send ^{r}
Send ^{r}


return


连点() 
{ 
    global ldrun := !ldrun 
    if ldrun 
    ld_run() 
} 

ld_run() 
{ 
	global defSep := 75
	global step
	if(step<=defSep)
		step := defSep
	global ldrun
	global edgeld
	rewind := false
	paused := false
	while ldrun && edgeld
	{
		k1 := GetKeyState("Ctrl")
		k2 := GetKeyState("Shift")
		if(GetKeyState("Z")) {
			if(!rewind)
				step := defSep
			rewind := true
			Send {home}
			Send {home}
			paused := false
		}
		else if(GetKeyState("X") || GetKeyState("RButton")) {
			paused := true
		}
		else if(GetKeyState("C") || GetKeyState("MButton")) {
			paused := false
		}
		else if (GetKeyState("Space") || GetKeyState("H") || (k2 && k1)){
			if rewind
				step := defSep
			else
				step := defSep
		}
		else if (k1)
			step := 800
		else if (k2)
			step := 320
		Sleep, step
		if(!paused) {
			if (rewind)
				Send {down}
			else
				click left
		}
	}
}


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
			ClipWait, 0.5
			S := Clipboard
			SplitPath,S,,,,S
			Clipboard := S
			ClipWait, 0.25
			Clipboard := S
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




#IfWinActive ahk_exe PotPlayerMini64.exe
F1::  
	toggle_置顶()
return

#IfWinActive ahk_exe QtScrcpy.exe
!Enter::  
	toggle_置顶()
return
F1::  
	WinGet, val, Transparent
	if(val>=255 || val==blank) {
		WinSet, Transparent, 135
		;弹出顺时消息("Title","半透明","-500", "w120")
	} else {
		WinSet, Transparent, Off
		;弹出顺时消息("Title","不透明","-500", "w120")
	}
return