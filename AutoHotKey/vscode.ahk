#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
#MaxThreadsPerHotkey 2 
#SingleInstance Force
DetectHiddenWindows, off

弹出顺时消息("","重载···","-500", "w150")


; 提前创建全局滑动控件。Val既是数值也是控件id？焯
; Fun 是回调函数
global Val
global Pin
global Target
Val:=0
Pin:=0
Target:=0
Gui, Add, Slider, x10 y5 w300 vVal gFun, %Val%
GuiControl, +AltSubmit Range0-255, Val ; 拖动也触发回调
Gui, Add, CheckBox, x10 y40 vThrough gThrough, 点击穿透
Gui, Add, CheckBox, x85 y40 vPin gPin, 窗口置顶
Gui, Add, CheckBox, x155 y40 vPinT gPinT, 工具置顶
Gui, Add, CheckBox, x230 y40 gFlip, 切换

global Wnds
Wnds := []
loop 
{	
	WinGet, wid, ID, A
	WinWaitNotActive, ahk_id %wid%
	idx := HasVal(Wnds, wid)
	if(idx) {
		Wnds.RemoveAt(idx)
	}
	Wnds.Push(wid)
	; 弹出顺时消息("","clipboard","-500", "w550")
}
LastWindow() {
	WinGet, wid, ID, A
	WinGet, p_wid, PID, A
	idx := Wnds.Length()
	While( idx > 0 )
	{
		pid := Wnds[idx]
		WinGet, p_pid, PID, ahk_id %pid% 
		if(wid != pid && p_pid!=p_wid)
		{
			WinGet, Style, Style, ahk_id %pid% 
			If (Style & 0x10000000)
			{
				WinActivate ahk_id %pid%
				break
			}
		}
		idx := idx - 1
	}
}
#Z::
	LastWindow()
return
#W::
	LastWindow()
return

TweakWnd() {
	SetTitleMatchMode, 2
	WinGetTitle, Tmp, A
	WinGet, wid, ID, A
	IfNotEqual, Tmp, 改变透明度
	{
		Winget, Val, Transparent, %Tmp%
		WinGet, ExStyle, ExStyle, A
		Through := ExStyle & 0x20 ; 0x20 is WS_EX_CLICKTHROUGH.
		Pin := ExStyle & 0x8 ; 0x8 is WS_EX_TOPMOST.
		Target := wid

		;WinGetPos, x, y, w, h, A
		;x += w/2 - 200
		;y += h/2 - 10
		;MouseGetPos,,mY
		;;y := mY

		If !Val
			Val := 255
		GuiControl ,, Val, %Val%
		tmp := Through?1:0
		GuiControl ,, Through, %tmp%
		tmp := Pin?1:0
		GuiControl ,, Pin, %tmp%
		; Gosub, Refresh
		
		Gui, Show, AutoSize Center , 改变透明度
		WinSet, AlwaysOnTop, On, 改变透明度
		Winset, Transparent, 175, 改变透明度
		; 或者显示在窗体正中 而非 AutoSize Center x%x% y%y% ？
		Return
	}
	
	Fun:
		Winset, Transparent, %Val%, ahk_id %Target%
	Return
	Through: ; 点击穿透
		WinGet, ExStyle, ExStyle, ahk_id %Target%
		Through := ExStyle & 0x20
		WinSet, ExStyle, ^0x20, ahk_id %Target%
		if Through
			WinSet, AlwaysOnTop, Off, ahk_id %Target%
		else
			WinSet, AlwaysOnTop, On, ahk_id %Target%
		tmp := Through?0:1
		GuiControl ,, Pin, %tmp%
	Return
	Pin:
		Winset, Alwaysontop, , ahk_id %Target%
		WinGet, ExStyle, ExStyle, ahk_id %Target%
		Pin := ExStyle & 0x8
		tmp := Pin?1:0
		GuiControl ,, Pin, %tmp%
		if(tmp) {
			WinSet, AlwaysOnTop, On, 改变透明度
		}
	Return
	PinT:
	Return
	Flip:
	Return
}

#F1::  
	TweakWnd()
return

^+F1::
	Reload
Return

ListWindow(name) {
	S := clipboard
	clipboard := "" 
	clipboard := name
	ClipWait
	WinGetTitle, title, A
	IfNotEqual, title, PowerToys.PowerLauncher
	{
		Send !{Space}
		sleep 150
	}
	else{
		Send ^a
		sleep 50
	}
	WinGetTitle, title, A
	IfEqual, title, PowerToys.PowerLauncher
	{
		Send ^v
		sleep 50
	}
	clipboard := S
	sleep 50
}

!D::
	ListWindow("Code.exe") ; Visual Studio Code
Return
!C::
	ListWindow("Code.exe") ; Visual Studio Code
Return
!S::
	ListWindow("Studio64") ; Android Studio
Return
!G::
	ListWindow("Github")
Return
!Q::
	ListWindow("Chrome")
Return
!E::
	ListWindow("Edge")
Return
!W::
	ListWindow("explorer.exe")
Return
!A::
	ListWindow("Auto")
Return
!T::
	ListWindow("Tamper")
Return


~F2::  
	;WinSet, Style, ^0x8000000, ahk_id 0x000107D6
	;弹出顺时消息("","SendMessage","-500", "w120")
Return

;!F2::  
#F2::
	弹出顺时消息("","即将关闭屏幕…","-500", "w340")
	Sleep 500
    ;SendMessage 0x112, 0xF140, 0, , Program Manager  ; Start screensaver
    SendMessage 0x112, 0xF170, 2, , Program Manager  ; Monitor off
Return

; Win+Shift+F2
#+F2::
    Run rundll32.exe user32.dll`,LockWorkStation     ; Lock PC
    Sleep 1000
    SendMessage 0x112, 0xF170, 2, , Program Manager  ; Monitor off
    Return

;!Enter::  
;	;toggle_置顶()
;	弹出顺时消息("","SendMessage","-500", "w120")
;	;SendMessage, 0x000C, 0, "New Notepad Title"  ; 0x000C is WM_SETTEXT
;	;SendMessage, WM_SYSCOMMAND, 0xF170, 2,, Program Manager  ; 0x0112 is WM_SYSCOMMAND, 0xF170 is SC_MONITORPOWER.
;	;PostMessage, 0x0111, 33000, 0
;	;, 1, Chrome_RenderWidgetHostHWND1
;	PostMessage, 0x007B, 0, 0
;
;return


; 参考：
; https://www.autohotkey.com/board/topic/5981-using-slider-to-adjust-window-transparency/
; https://stackoverflow.com/questions/54977834/reuse-a-gui-input-in-autohotkey
; https://zhuanlan.zhihu.com/p/124677599

+AppsKey::
return

^AppsKey::
return

AppsKey::
return

Ins::
	SetStoreCapsLockMode, Off
return

CapsLock::
	Send {Tab}
return
^CapsLock::
	Send ^{Tab}
return
!CapsLock::
	Send !{Tab}
return
#CapsLock::
	Send #{Tab}
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

#IfWinActive ahk_exe XPlusPlayer.exe
F1::
	send {Fn} & {1}
	弹出顺时消息("","abc", "-500", "w720")
return

toggle_多行标签(){
	send ^k
	sleep, 750
	send {Tab}
	sleep, 20
	send {Tab}
	sleep, 20
	send {Space}
	sleep, 20
	send {Enter}
	; 弹出顺时消息("","abc", "-500", "w720")
}
#IfWinActive ahk_exe studio64.exe
F1::
	MouseGetPos, xpos, ypos 
	if ypos<0
		toggle_多行标签()
	else
		send {F2}
return
^F1::
	toggle_多行标签()
return
+F1::
	send +{F2}
	; 弹出顺时消息("","abc", "-500", "w720")
return


#IfWinActive ahk_exe explorer.exe
F1::
	ensureLdOff()
	执行复制(1)
return
!F1::
	ListWindow(执行复制())
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
		;弹出顺时消息("",title . xw, "-500", "w720")
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
	;弹出顺时消息("",var, "-500", "w120")
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



global edgeld := True

#IfWinActive ahk_exe textrument.exe
!Enter::  
	toggle_置顶()
return

#IfWinActive ahk_exe aida64.exe
F1::  
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
	WinGetTitle,WndTitle
	StringGetPos, idx, WndTitle, 哔哩哔哩
	if (idx >= 0)
		toggle_置顶()
	else
	{
		Hotkey !Enter, Off
		Send !{Enter}
		Hotkey !Enter, On
	}
return

toggle_置顶(){
	Winset, Alwaysontop, , A
	WinGet, ExStyle, ExStyle
	if (ExStyle & 0x8)  ; 0x8 is WS_EX_TOPMOST.
		弹出顺时消息("","置顶!!","-500", "w120")
	else
		弹出顺时消息("","取消置顶","-500", "w120")
}

toggle_f1(){
	global edgeld
	IfWinNotActive ahk_exe msedge.exe
		ensureLdOff()
	else
		edgeld := !edgeld
	if edgeld
		弹出顺时消息("","连点!!","-500", "w120")
	else
		弹出顺时消息("","取消连点","-500", "w120")
}

edege_f1(){
	global edgeld
	if edgeld
		连点()
	else	
	{
		; 调大edge“书签管理器”的字体
		Send {F12}
		WinGetTitle,WndTitle
		TStart := SubStr(WndTitle, 1, 9)
		IfEqual TStart, Favorites
		{
			;NewStr := StrReplace(WndTitle, "Favorites", "Favorite")
			;弹出顺时消息("",NewStr,"-500", "w520")
 			;WinSetTitle,%NewStr%
			S := clipboard
			clipboard := ""
			clipboard := "var d=document, sty=d.createElement('style'); if(d.title!='Favorite') { d.title='Favorite'; sty.innerText='.card_clickable_title{font-size:15px!important;font-weight:unset!important;white-space:unset!important;max-height: 32px;position:absolute; background:#3b3b3b!important;width:80%!important;}'; d.head.append(sty); }"
			ClipWait
			S := clipboard
			Sleep 750 ; 等待dev侧栏弹出
			;弹出顺时消息("",S,"-500", "w520")
			Send ^v
			Sleep 150 ; 等待粘贴
			Send {Enter}
			Sleep 150 ; 等待执行
			Send {F12}
			clipboard := S
		}
	}

}

#IfWinActive ahk_exe PowerToys.PowerLauncher.exe
F1::
	Send {Enter}
return

#IfWinActive ahk_exe Code.exe
;!Enter::  
;	toggle_置顶()
;return
F1::
	WinGetTitle,Title
	TStart := SubStr(Title, 1, 10)
	IfEqual TStart, vscode.ahk
	{
		Reload
	}
	else {
		Suspend On
		Send {F1}
		Suspend Off
	}
return
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


执行复制(ret=0)
{
	S := 
	IfWinActive, ahk_exe IDMan.exe
	{
		MouseClick, right
		Send, a
		MouseClick, right
	}
	else
	IfWinActive, ahk_exe PotPlayerMini64.exe
	{
		WinGetTitle,S
		clipboard := ""
		clipboard := S
		ClipWait
		弹出顺时消息("",Clipboard,"-500", "w450")
	} else {
		clipboard := ""
		Send, ^c
		ClipWait
		IfWinActive, ahk_exe explorer.exe
		{
			S := clipboard
			SplitPath,S,,,,S
			StringGetPos, idx, S, - _streamNo
			if (idx >= 0) {
				S := SubStr(S, 1, idx)
			}
			if(ret) {
				clipboard := ""
				clipboard := S
				ClipWait
				弹出顺时消息("",clipboard,"-500", "w550")
				;MsgBox % "取得无后缀文件名 ： " . S
			}
		}
	}
	return S
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
	;toggle_置顶()
	执行复制()
return

#IfWinActive ahk_exe QtScrcpy.exe
!Enter::  
	toggle_置顶()
return
F1::  
	WinGet, val, Transparent
	if(val>=255 || val==blank) {
		WinSet, Transparent, 135
		;弹出顺时消息("","半","-500", "w120")
	} else {
		WinSet, Transparent, Off
		;弹出顺时消息("","不","-500", "w120")
	}
return

HasVal(haystack, needle) {
	if !(IsObject(haystack)) || (haystack.Length() = 0)
		return 0
	for index, value in haystack
		if (value = needle)
			return index
	return 0
}
