/*********************************************************************

 ADOBE SYSTEMS INCORPORATED
 Copyright (C) 1994-2006 Adobe Systems Incorporated
 All rights reserved.

 NOTICE: Adobe permits you to use, modify, and distribute this file
 in accordance with the terms of the Adobe license agreement
 accompanying it. If you have received this file from a source other
 than Adobe, then your use, modification, or distribution of it
 requires the prior written permission of Adobe.

 -------------------------------------------------------------------*/ 
/**
\file StampUI.h

 - Interface to the shelf user interface set-up code. Creates an
   AVTool, AVToolButton and AVMenuItem for the shelf plug-in.

*********************************************************************/

#ifndef _H_StampUI
#define _H_StampUI

/* SetUpUI
** Creates and registers  the AVTool, AVToolButton and AVMenuItem needed
** for the shelf.
*/
void SetUpUI(void);
void CleanUpUI(void);

#endif /* !_H_StampUI */
