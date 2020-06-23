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
\ based on BasicPlugin.cpp

*********************************************************************/

#include <iostream>
#include <sstream>
#include <string>

// Acrobat Headers.
#ifndef MAC_PLATFORM
#include "PIHeaders.h"
#else
#include "SafeResources.cpp"
#endif
#include "PIMain.h" // for gHINSTANCE

#include <string.h>

#ifdef WIN32
#pragma comment(lib,"ws2_32.lib")
#endif

using nlohmann::json;

using namespace::std;

/*-------------------------------------------------------
	Constants/
	Declarations
-------------------------------------------------------*/
static int capacity=0;
static char* buffer;
static int length;
boolean start;
struct sockaddr_in address;
struct hostent *server;
int WSA=-1;

time_t last_ini_read_time;

struct stat buf;

char host[128]={0};

int port=8080;

int sharetype;

int desiredSlot=1;

int verbose;

int timeout=1;

bool singleline;

json extra_items;

const char *errorJson = "[PlainDict] Error Parsing Json : ";

const char *emptyJson = "NONE";

char * CTRL = "CTRL";
char * SHIFT = "SHIFT";
char * ALT = "ALT";

BYTE* keycodes;
BYTE keycodes_len;

const char* MyPluginExtensionName = "ADBE:PlainDictPlugin";

/* A convenient function to add a menu item for your plugin. */
ACCB1 ASBool ACCB2 PluginMenuItem(const char* MyMenuItemTitle, const char* MyMenuItemName);

/* Callback on each run of the text selection. */
static ACCB1 ASBool ACCB2 PDTextSelectEnumTextProcCB (void* procObj, PDFont font, ASFixed size, PDColorValue color, char* text, ASInt32 textLen);

static AVToolButton shelfToolButton;

// UI Callbacks
static AVExecuteProc cbActivateShelfTool;

// For mac cursor
#define CURSShelfCursor			150

// For windows
#define IDC_CURSOR1                     101
#define IDI_ICON1                       102
#define IDB_BITMAP1                     103
#define IDB_BITMAP2                     104
/*-------------------------------------------------------
	Functions.
	MyPluginCommand is the function to be called when executing a menu,
	The entry point for user's code, just add your code inside.
r-------------------------------------------------------*/

/* MyPluginSetmenu Function to set up menu for the plugin. It calls a convenient function PluginMenuItem.
** @return true if successful, false if failed. */
ACCB1 ASBool ACCB2 MyPluginSetmenu()
{
	return PluginMenuItem("Plain Dictionary", MyPluginExtensionName); 
}

char* textBuff;
long textAcquired;

char* textFileRead(FILE* file)
{
	fseek(file,0,SEEK_END);
	long lSize = ftell(file);
	char* text=textBuff;
	if(!text || lSize>textAcquired){
		if(text){
			free(text);
		}
		text=(char*)malloc(textAcquired=sizeof(char)*(lSize+32));
	}
	if(text) {
		rewind(file); 
		lSize=fread(text,sizeof(char), lSize,file);
		text[lSize] = '\0';
	}
	return text;
}

void CheckConfig() {
	try {
		FILE * file=fopen("C:\\Program Files\\Adobe\\plod.ini","r");
		if(NULL != file)
		{
			int fd=fileno(file);
			fstat(fd, &buf);
			long modify_time=buf.st_mtime;	
			if(modify_time!=last_ini_read_time){
				verbose=1;
				extra_items=NULL;
				last_ini_read_time=modify_time;
				auto j3 = json::parse(textFileRead(file));

				auto val = j3["verbose"];
				if(!val.empty() && val.is_number_integer()) {
					verbose = val.get<int>();
				}

				val = j3["host"];
				if(!val.empty() && val.is_string()) {
					auto value = val.get<string>();
					if(verbose>2) {
						AVAlertNote(value.c_str());
					}
					int start=0;
					int end = value.length();
					if(value.compare(0, 4, "http") == 0){
						start = value.find("/")+2;
					}
					if(value[end-1]=='/') {
						end -= 1;
					}
					if(start<end){
						int portDeli = value.find_last_of(":");
						if(portDeli>start) {
							if(portDeli<end){
								auto portStr = value.substr(portDeli+1, end);
								port = atoi(portStr.data());
							}
							end = portDeli;
						}
					}
					memset(host, 0, 128);
					memcpy(host, value.c_str()+start, end-start);
				}

				val = j3["sendto"];
				if(!val.empty() && val.is_number_integer()) {
					sharetype = val.get<int>();
				}

				val = j3["slot"];
				if(!val.empty() && val.is_number_integer()) {
					desiredSlot = val.get<int>();
				}

				val = j3["timeout"];
				if(!val.empty() && val.is_number_integer()) {
					timeout = val.get<int>();
				}

				val = j3["singleline"];
				if(!val.empty() && val.is_boolean()) {
					singleline = val.get<bool>();
				}

				val = j3["extar"];
				if(!val.empty() && val.is_array()) {
					extra_items = val.get<json>();
					auto itemI = extra_items[0];
				}
			}
		}
	} catch(exception e) {
		if(verbose) {
			const char *firstName = errorJson;
			const char *lastName = e.what();
			if(!lastName) lastName = emptyJson;
			char *name = (char *) malloc(strlen(firstName) + strlen(lastName));
			strcpy(name, firstName);
			strcat(name, lastName);
			AVAlertNote(name);
		}
	}
}

bool ensureBufferCapacity(int estimate) {
	int nowCap = capacity;
	if(estimate>nowCap) { // 扩 容
		int elta = max(nowCap*2, estimate);
		if(elta>8192) elta=8192;
		estimate = elta+nowCap;
		if(estimate<128*1024){
			char* buffer_new = (char*)malloc(capacity=estimate);
			if(!buffer_new){
				return false;
			}
			memset(buffer_new, 0, capacity);
			memcpy(buffer_new, buffer, nowCap);
			free(buffer);
			buffer = buffer_new;
		} else {
			return false;
		}
	}
	return true;
}

static ACCB1 ASBool ACCB2 PDTextSelectEnumTextProcCB(void* procObj, PDFont font, ASFixed size, PDColorValue color, char* text, ASInt32 textLen)
{
	int selen = textLen;//strlen(text);
	if(ensureBufferCapacity(length+selen+10)) {
		//length=sprintf(buffer, "%s%s", buffer, text);
		memcpy(buffer+length, text, selen);
		length+=selen;
		start=0;
		//AVAlertNote(buffer);
		return true;
	}
	return false;
}

void GetText() {
	int from = length;
	// try to get front PDF document 
	AVDoc avDoc = AVAppGetActiveDoc();

	if (avDoc == NULL) return;

	PDTextSelect ts = static_cast<PDTextSelect>(AVDocGetSelection(avDoc));

	// get this plugin's name for display

	ASAtom NameAtom = ASExtensionGetRegisteredName (gExtensionID);

	const char * name = ASAtomGetString(NameAtom);


	PDTextSelectEnumTextProc cbPDTextSelectEnumTextProc = ASCallbackCreateProto(PDTextSelectEnumTextProc, &PDTextSelectEnumTextProcCB);


	PDTextSelectEnumText(ts, cbPDTextSelectEnumTextProc, NULL);


	if(singleline) {
		for(int i=from;i<length;i++) {
			if(buffer[i]=='\n' || buffer[i]=='\r') {
				buffer[i]=' ';
			}
		}
	}

	if(capacity>=length){
		buffer[length]='\0';
	}
	for(int i=length;i<capacity;i++) {
		buffer[i]='\0';
	}
	//if(verbose) {
	//	AVAlertNote("Content too long!");
	//}

	//PDDoc pdDoc = AVDocGetPDDoc (avDoc);

	//sprintf(buffer,"%s\n\nTotal Page Count : %d %d", buffer, PDDocGetNumPages (pdDoc), length);

	//AVAlertNote(buffer);
}

void PushSelections() {
	length=0;

	GetText();
}

void RunOnTextSelection(int sendTo){
	if(sendTo>=3 && extra_items!=NULL && extra_items.size()>(sendTo=sendTo-3)) {
		json extraI = extra_items[sendTo];
		auto val=extraI["copy"];
		bool copied = 0;
		if(!val.empty() && val.is_boolean()){
			if(val.get<bool>()) {
				if(OpenClipboard(NULL))
				{
					PushSelections();
					copied=1;
					HGLOBAL global=GlobalAlloc(GHND,length+1);
					char *global_m=(char *)GlobalLock(global);
					memcpy(global_m,buffer,length);
					EmptyClipboard();
					SetClipboardData(CF_TEXT, global);
					GlobalUnlock(global);
					CloseClipboard();
					GlobalFree(global);
				}
			}
		}
		val=extraI["cutshort"];
		if(!val.empty() && val.is_string()) {
			if(keycodes==NULL) {
				keycodes = (BYTE*)malloc(sizeof(BYTE)*(keycodes_len=12));
			}
			auto value = val.get<string>();
			int len = value.length();
			auto strVal = value.data();
			int lastfound=0;
			int findIdx;
			BYTE keycode;
			int cc=-1;
			bool endNotreached=true;
			while((findIdx=value.find('+', lastfound))>=0||endNotreached){
				if(findIdx<0) {
					if(lastfound<len){
						endNotreached=false;
						findIdx=len;
					} else {
						break;
					}
				}
				int size=findIdx-lastfound;
				auto tobon2b = strVal+lastfound;
				//AVAlertNote(value.substr(lastfound, findIdx).data());
				keycode=0;
				if(size>=2){
					if(strnicmp(tobon2b, CTRL, size)==0){
						keycode=VK_CONTROL;
					} else if(strnicmp(tobon2b, SHIFT, size)==0){
						keycode=VK_SHIFT;
					} else if(strnicmp(tobon2b, ALT, size)==0){
						keycode=VK_MENU;
					}
				} else {
					keycode=tobon2b[0];
				}
				cc++;
				if(cc>keycodes_len){
					int keycodes_len_new = cc*1.2;
					BYTE* keycodes_new=(BYTE*)malloc(sizeof(BYTE)*keycodes_len_new);
					memccpy(keycodes_new, keycodes, keycodes_len, sizeof(BYTE));
					free(keycodes);
					keycodes=keycodes_new;
					keycodes_len=keycodes_len_new;
				}
				keycodes[cc]=keycode;
				//char strVal[] = {'0'+keycode, 'K', 'K'};
				//AVAlertNote(strVal);
				if(!endNotreached) {
					break;
				} else {
					lastfound = findIdx+1;
				}
			}
			for(int i=0; i<=cc;i++){// 按下
				keybd_event(keycodes[i],0, 0 ,0);
			}
			Sleep(100);
			for(int i=cc; i>=0;i--){// 释放
				keybd_event(keycodes[i],0, KEYEVENTF_KEYUP ,0);
			}

			//AVAlertNote(value.data());
			//todo handle short cuts
		}

		val=extraI["command"];
		if(!val.empty() && val.is_string()) {
			auto value = val.get<string>();
			int idx = value.find("%s");
			const char* strVal = value.data();
			int len=strlen(strVal)-2;
			if(idx==len && ensureBufferCapacity(len+12)) {	
				memcpy(buffer, strVal, length = len);
				
				GetText();
			
				strVal =  buffer;
			}
			//AVAlertNote(strVal);
			WinExec(strVal, SW_HIDE);
		}
		return;
	}
	if (WSA != 0) {
		WSADATA wsaData;
		WSA = WSAStartup(MAKEWORD(2, 2), &wsaData);
		if (WSA != 0) {
			return;
		}
	}

	// todo 从Chrome书签取值

	address.sin_addr.s_addr = inet_addr(host);
	address.sin_family = AF_INET;
	address.sin_port = htons(port); 

	if(verbose>2) {
		AVAlertNote(host);
	}

	//server = gethostbyaddr((char *)&address.sin_addr, 4, AF_INET);
	// if(server && verbose>2) AVAlertNote(server->h_name);
	SOCKET sockClient = socket(AF_INET, SOCK_STREAM, 0);

	int iMode = 1;  

	ioctlsocket(sockClient, FIONBIO, (u_long FAR*)&iMode);  // 设置为非阻塞的socket  

	int error=0;

	if(-1 == connect(sockClient,(SOCKADDR *)&address,sizeof(SOCKADDR))) {
		//printf("尝 试 去 连 接 服 务 端 \n ");
		struct timeval time{timeout, 0}; // 超 时 时 间  

		fd_set set;  
		FD_ZERO(&set);  
		FD_SET(sockClient, &set);  

		error = 1;

		if (select(-1, NULL, &set, NULL, &time) > 0) {
			int optLen = sizeof(int);  
			getsockopt(sockClient, SOL_SOCKET, SO_ERROR, (char*)&error, &optLen);   
		}  
	}

	if(error) {
		if(verbose) {
			AVAlertNote("Time out !");
		}
	} else { 
		if(sendTo==1 && sharetype==1){
			sendTo=2;
		}

		length = sprintf(buffer,"POST /PLOD/?f=%d HTTP/1.0\r\nHost: %s\r\nUser-Agent: Mozilla/5.0\r\nContent-Type:application/x-www-form-urlencoded\r\nContent-Length: -1\r\nConnection:close\r\n\r\n", sendTo, host);

		GetText();

		iMode = 0; 

		ioctlsocket(sockClient, FIONBIO, (u_long FAR*)&iMode);  // 设置为阻塞socket 
#ifdef WIN32
		send(sockClient, buffer, length, 0);  
#else
		write(sockClient,request.c_str(),request.size());
#endif
		if(verbose>1) {
			AVAlertNote("done!");
		}
	}

#ifdef WIN32
	closesocket(sockClient);
#else
	close(sockClient);
#endif
}
#include <Windows.h>

ACCB1 void ACCB2 MyPluginCommand(void *clientData)
{
	if(clientData){
		if(capacity==0) {
			buffer = (char*)malloc(capacity=1024);
			memset(buffer, 0, capacity);
		}
		//AVAlertNote((char*)clientData);
		char code = *((char*)clientData);
		RunOnTextSelection(code-'0');
	}
}

/* MyPluginIsEnabled Function to control if a menu item should be enabled.
** @return true to enable it, false not to enable it.
*/
ACCB1 ASBool ACCB2 MyPluginIsEnabled(void *clientData)
{
	//return (AVAppGetActiveDoc() != NULL); // enabled only if there is a open PDF document. 
	return true; // always enabled.
}




/*-------------------------------------------------------
** Shelf
** UI 
** Callbacks
-------------------------------------------------------*/

static ACCB1 void ACCB2 ActivateshelfTool (void *clientData)
{
	CheckConfig();
	RunOnTextSelection(0);
}

/*-------------------------------------------------------
** Shelf 
** UI 
** Initialization/Cleanup
-------------------------------------------------------*/
void *GetShelfToolButtonIcon(void)
{
#ifdef MAC_PLATFORM

	extern CFBundleRef gPluginBundle;
	AVIconDataRec iconData;

	// Find a resource in the plugin bundle by name and type.
	CFURLRef pingURL = CFBundleCopyResourceURL( gPluginBundle, 
		CFSTR("shelfIcon"), 
		CFSTR("png"), 
		NULL );

	ASFile asf = NULL;
	ASPathName aspn = ASFileSysCreatePathName (NULL,ASAtomFromString("CFURLRef"),
		pingURL, NULL);
	ASFileSysOpenFile(NULL, aspn, ASFILE_READ, &asf);

	ASUns32 dataSize = ASFileGetEOF(asf);

	ASUns8 *data = (ASUns8 *)ASmalloc(dataSize + 1);
	ASFileRead(asf, (char *)data, dataSize);
	ASFileClose(asf);

	iconData.dataStm = ASMemStmRdOpen((char *)data, dataSize);
	iconData.eColorFormat = kAVIconColor;

	return AVAppCreateIconBundle6(kAVIconPNG, &iconData, 1); 

#elif WIN_PLATFORM
	return(AVCursor)LoadBitmap(gHINSTANCE, MAKEINTRESOURCE(IDB_BITMAP1));
#endif
}

void SetUpUI(void)
{
	cbActivateShelfTool = ASCallbackCreateProto (AVExecuteProc, &ActivateshelfTool);

	// Insert the shelf tool button just before the "endToolsGroup"
	// AVToolButton separator.

	void *shelfIcon = GetShelfToolButtonIcon();
	AVToolBar toolBar = AVAppGetToolBar();
	AVToolButton separator = AVToolBarGetButtonByName (toolBar, ASAtomFromString("endToolsGroup"));

	ASAtom shelf_K;
	shelfToolButton = AVToolButtonNew (shelf_K, shelfIcon, true, false);
	AVToolButtonSetExecuteProc (shelfToolButton, cbActivateShelfTool, NULL);
	AVToolButtonSetHelpText (shelfToolButton, "Send selection to PlainDict");

	AVToolBarAddButton(toolBar, shelfToolButton, true, separator);
}

/** Unregister notifications and remove the toolbutton. */
void CleanUpUI(void)
{
	if(shelfToolButton)
		AVToolButtonDestroy (shelfToolButton);
}
