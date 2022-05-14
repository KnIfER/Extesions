#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
#MaxThreadsPerHotkey 2 

~F2::mbutton_pressed() 


mbutton_pressed() 
{ 
    global running := !running 
    ;if running 
    ;run() 
	Sleep, 100
	Send {F12}
} 


run() 
{ 
	global running
	while running 
	{
		Sleep, 100
		MouseClick, left,  849,  987
		Send, {CTRLDOWN}a{CTRLUP}{BACKSPACE}
		Sleep, 100
		MouseClick, left,  1124,  879
		Send, {CTRLDOWN}a{CTRLUP}{BACKSPACE}
		Sleep, 100
		Send, {PGDN}
		Sleep, 200
	}
	;MsgBox % "haha" . running . "!"
}