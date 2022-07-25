; SCRIPT FUNCTIONALITY Activates the last active windows
#SingleInstance Force
previous_ID := 0

loop 
{	
	WinGet, current_ID, ID, A
	
	WinWaitNotActive, ahk_id %current_ID%
	
	previous_ID := current_ID
	; 弹出顺时消息("","clipboard","-500", "w550")
}


弹出顺时消息("","重载winact···","-500", "w150")

#Z::
	; activate the previous window
	WinActivate ahk_id %previous_ID%
	
	; note that the earlier loop will take care of updating previous_ID.  
	; WinWaitNotActive doesn't care if it was this script or the user that caused the active window to change...
	; it is just looking at the handle of the current window.
return

;#Z::SendInput !{Tab}



killAlert:
progress,off
return


弹出顺时消息(Title,Message,Timeout,Width := "w120")  {
Progress, %Width% b1 zh0 fs18, %Message%,,%Title%,
		settimer, killAlert,%Timeout%
}



#IfWinActive ahk_exe Code.exe
~F1::
	WinGetTitle,Title
	TStart := SubStr(Title, 1, 10)
	IfEqual TStart, winact.ahk
	{
		Reload
	}
return