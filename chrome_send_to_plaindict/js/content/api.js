async function sendtoBackend(request){
    return new Promise((resolve, reject)=>{
        chrome.runtime.sendMessage(request, result => {
            resolve(result);
        });
    });
}

async function sendToPD(expression, type){
	//console.log("sendToPD..."+expression)
    try {
        return await sendtoBackend({action:'sendToPD', params:{exp:expression, extra:type}});
    } catch (err) {
        return null;
    }
}

function getFlag(win){
    chrome.runtime.sendMessage({action:'getFlag', params:{}}, 
        function(response) {
            win.pdFlag = response;
        }
    );
}