#Persistent

SetTimer, MoveMouse, 3000
SetTimer, SendText, 300000
return

MoveMouse:
	MoveMouseInCircle(200, 15)
return

SendText:
	SendInput, /play skyblock{Enter}
	Sleep, 10000
	SendInput, /WARP island ; no Enter?
	; don't see what waiting another 10 seconds here is supposed to accomplish. what follows it?
return

MoveMouseInCircle(r := 200, degInc := 5, start := "top", speed := 0)
{
	static radPerDeg := 3.14159265359 / 180

	MouseGetPos, cx, cy
	Switch start
	{
		Case "top":
			angle := 0
			cy += r
		Case "right":
			angle := 90 * radPerDeg
			cx -= r
		Case "bottom":
			angle := 180 * radPerDeg
			cy -= r
		Case "left":
			angle := 270 * radPerDeg
			cx += r
	}
	loop, % 360 / degInc
	{
		angle += degInc * radPerDeg
		MouseMove, cx + r * Sin(angle), cy - r * Cos(angle)
		Sleep, speed
	}
}

Esc::ExitApp