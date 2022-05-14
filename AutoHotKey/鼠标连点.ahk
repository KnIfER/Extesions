#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
#MaxThreadsPerHotkey 2 

F1::
mbutton_pressed() 
return


mbutton_pressed() 
{ 
    global running := !running 
    if running 
    run() 
} 


run() 
{ 
	global running
	while running 
	{
		Sleep, 10
		click left
	}
}