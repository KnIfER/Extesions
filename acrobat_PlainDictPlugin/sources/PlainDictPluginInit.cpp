/*********************************************************************
 ADOBE SYSTEMS INCORPORATED. Copyright (C) 2020 KnIfER
 Whatever The Liscence (WTL™).
 Copyright (C) 1998-2006 Adobe Systems Incorporated
 All rights reserved.

 NOTICE: Adobe permits you to use, modify, and distribute this file
 in accordance with the terms of the Adobe license agreement
 accompanying it. If you have received this file from a source other
 than Adobe, then your use, modification, or distribution of it
 requires the prior written permission of Adobe.

 -------------------------------------------------------------------*/
/** 
\ based on BasicPluginInit.cpp

*********************************************************************/
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>

// Acrobat Headers.
#ifndef MAC_PLATFORM
#include "PIHeaders.h"
#endif

using nlohmann::json;

/*-------------------------------------------------------
	Constants/
	Declarations
	.
-------------------------------------------------------*/
const char* pageContext = "Page";

const char*  selectionContext = "Select";

extern int sharetype;

extern int desiredSlot;

extern int verbose;

// stuff for Menu set up 
static AVMenuItem menuItem = NULL;
ACCB1 ASBool ACCB2 PluginMenuItem(const char* MyMenuItemTitle, const char* MyMenuItemName);

// callback functions implemented in file "BasicPlugin.cpp"
extern ACCB1 void ACCB2 MyPluginCommand(void *clientData);

extern ACCB1 ASBool ACCB2 MyPluginIsEnabled(void *clientData);

extern ACCB1 ASBool ACCB2 MyPluginSetmenu();

extern void CheckConfig();

extern const char* MyPluginExtensionName;

HFT gDebugWindowHFT;
/*-------------------------------------------------------
	Core 
	Handshake 
	Callbacks.
-------------------------------------------------------*/

#include "DebugWindowHFT.h"
#include "ShelfUI.h"
/** Callback invoked by the application to give the plug-in an opportunity to register an HFTServer with the application.
	@return true to indicate the plug-in should continue loading. */
ACCB1 ASBool ACCB2 PluginExportHFTs(void)
{
	gDebugWindowHFT = InitDebugWindowHFT;
	return true;
}

/** The application calls this function to allow it to Import plug-in supplied HFTs.
	Replace functions in the HFTs you're using (where allowed). Register to receive notification events. */
ACCB1 ASBool ACCB2 PluginImportReplaceAndRegister(void)
{
	return true;
}

/** PluginInit The main initialization routine. We register our action handler with the application.
	@return true to continue loading the plug-in , false to cause plug-in loading to stop. */
ACCB1 ASBool ACCB2 PluginInit(void)
{
	SetUpUI();
	return MyPluginSetmenu();
}

/** The unload routine. Called when your plug-in is being unloaded when the application quits. 
	Use this routine to release any system resources you may have allocated.
	@return false will cause an alert to display that unloading failed, true to indicate the plug-in unloaded. */
ACCB1 ASBool ACCB2 PluginUnload(void)
{
	CleanUpUI();

	if (menuItem)
		AVMenuItemRemove(menuItem);

	return true;
}

/** Return the unique ASAtom associated with your plug-in.
	@return the plug-ins name as an ASAtom. */
ASAtom GetExtensionName()
{
	return ASAtomFromString(MyPluginExtensionName);
}


/** Function that provides the initial interface between your plug-in and the application.
	This function provides the callback functions to the application that allow it to register the plug-in with the application environment.

	Required Plug-in handshaking routine: <b>Do not change it's name!</b>
	
	@param handshakeVersion the version this plug-in works with. There are two versions possible, the plug-in version 
	and the application version. The application calls the main entry point for this plug-in with its version.
	The main entry point will call this function with the version that is earliest. 
	@param handshakeData OUT the data structure used to provide the primary entry points for the plug-in. These
	entry points are used in registering the plug-in with the application and allowing the plug-in to register for 
	other plug-in services and offer its own.
	@return true to indicate success, false otherwise (the plug-in will not load). */
ACCB1 ASBool ACCB2 PIHandshake(Uns32 handshakeVersion, void *handshakeData)
{
	if (handshakeVersion == HANDSHAKE_V0200) {
		/* Cast handshakeData to the appropriate type */
		PIHandshakeData_V0200 *hsData = (PIHandshakeData_V0200 *)handshakeData;

		/* Set the name we want to go by */
		hsData->extensionName = GetExtensionName();

		/* If you export your own HFT, do so in here */
		hsData->exportHFTsCallback = (void*)ASCallbackCreateProto(PIExportHFTsProcType, &PluginExportHFTs);

		/* If you import plug-in HFTs, replace functionality, and/or want to register for notifications before
		** the user has a chance to do anything, do so in here. */
		hsData->importReplaceAndRegisterCallback = (void*)ASCallbackCreateProto(PIImportReplaceAndRegisterProcType,
																		 &PluginImportReplaceAndRegister);

		/* Perform your plug-in's initialization in here */
		hsData->initCallback = (void*)ASCallbackCreateProto(PIInitProcType, &PluginInit);

		/* Perform any memory freeing or state saving on "quit" in here */
		hsData->unloadCallback = (void*)ASCallbackCreateProto(PIUnloadProcType, &PluginUnload);

		/* All done */
		return true;

	} /* Each time the handshake version changes, add a new "else if" branch */

	/* If we reach here, then we were passed a handshake version number we don't know about.
	** This shouldn't ever happen since our main() routine chose the version number. */
	return false;
}

ACCB1 void ACCB2 myAVContentMenuAdditionProc(ASAtom menuName, AVMenu menu, void* menuData, void* clientData)
{ 
	if(verbose>3) {
		AVAlertNote("hello world");
	}
	AVMenuItem commonMenu = NULL;
	DURING
		CheckConfig();

		commonMenu = AVMenuItemNew ("Send To PlainDict", "topd", NULL, true, NO_SHORTCUT, 0, NULL, gExtensionID);
		AVMenuItemSetExecuteProc (commonMenu, ASCallbackCreateProto(AVExecuteProc, MyPluginCommand), "1");
		AVMenuItemSetComputeEnabledProc (commonMenu,
			ASCallbackCreateProto(AVComputeEnabledProc, MyPluginIsEnabled), (void *)pdPermEdit);

		AVMenuAddMenuItem(menu, commonMenu, desiredSlot);

		AVMenuItemRelease(commonMenu);

		if(sharetype==2) {
			commonMenu = AVMenuItemNew ("Send To PlainDict (3rd)", "topd2", NULL, true, NO_SHORTCUT, 0, NULL, gExtensionID);
			AVMenuItemSetExecuteProc (commonMenu, ASCallbackCreateProto(AVExecuteProc, MyPluginCommand), "2");
			AVMenuItemSetComputeEnabledProc (commonMenu,
				ASCallbackCreateProto(AVComputeEnabledProc, MyPluginIsEnabled), (void *)pdPermEdit);

			AVMenuAddMenuItem(menu, commonMenu, desiredSlot+1);

			AVMenuItemRelease(commonMenu);
		}
	HANDLER
		if (commonMenu)
			AVMenuItemRelease (commonMenu);
	END_HANDLER
}

/*-------------------------------------------------------
	Menu 
	Utility
	.
-------------------------------------------------------*/

/** A convenient function to add a menu item under Acrobat SDK menu.
	@param MyMenuItemTitle IN String for the menu item's title.
	@param MyMenuItemName IN String for the menu item's internal name.
	@return true if successful, false if failed.
	@see AVAppGetMenubar
	@see AVMenuItemNew
	@see AVMenuItemSetExecuteProc
	@see AVMenuItemSetComputeEnabledProc
	@see AVMenubarAcquireMenuItemByName
	@see AVMenubarAcquireMenuByName */
ACCB1 ASBool ACCB2 PluginMenuItem(const char* MyMenuItemTitle, const char* MyMenuItemName)
{
	AVMenubar menubar = AVAppGetMenubar();
	AVMenu volatile commonMenu = NULL;

	if (!menubar) return false;

	DURING
		//AVAppRegisterForContextMenuAddition( ASAtomFromString("Page"), myAVContentMenuAdditionProc, (void*)pageContext);
		AVAppRegisterForContextMenuAddition( ASAtomFromString(selectionContext), myAVContentMenuAdditionProc, (void*)selectionContext);

	   	//// Create our menuitem
		//menuItem = AVMenuItemNew (MyMenuItemTitle, MyMenuItemName, NULL, true, NO_SHORTCUT, 0, NULL, gExtensionID);
		//AVMenuItemSetExecuteProc (menuItem, ASCallbackCreateProto(AVExecuteProc, MyPluginCommand), NULL);
		//AVMenuItemSetComputeEnabledProc (menuItem,
		//			ASCallbackCreateProto(AVComputeEnabledProc, MyPluginIsEnabled), (void *)pdPermEdit);
		//
		//commonMenu = AVMenubarAcquireMenuByName (menubar, "ADBE:Acrobat_SDK");
		//// if "Acrobat SDK" menu is not existing, create one.
		//if (!commonMenu) {
		//	commonMenu = AVMenuNew ("Acrobat SDK", "ADBE:Acrobat_SDK", gExtensionID);
		//	AVMenubarAddMenu(menubar, commonMenu, APPEND_MENU);		
		//}
		//
		////AVMenuAddMenuItem(commonMenu, menuItem, APPEND_MENUITEM);
		//
		//AVMenuRelease(commonMenu);

	HANDLER
		if (commonMenu)
			AVMenuRelease (commonMenu);
		return false;
	END_HANDLER

	return true;
}

