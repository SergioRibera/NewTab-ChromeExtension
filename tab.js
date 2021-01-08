function updateClock(){
    var currentTime = new Date(),
        currentHours = currentTime.getHours(),
        currentMinutes = ('0'+currentTime.getMinutes()).slice(-2);
    document.getElementById("clock").innerHTML = currentHours + ':' + currentMinutes;
}

updateClock();
var intervalID = window.setInterval(updateClock, 10000);

function ajax(requestType, requestUrl, data, headers, successCb) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
            if (xmlhttp.status == 200 && typeof successCb == 'function')
                successCb(xmlhttp);
            else
                console.log('Error: '+xmlhttp.status);
        }
    }
    xmlhttp.open(requestType, requestUrl, true);
    for (key in headers)
        xmlhttp.setRequestHeader(key, headers[key]);
    if (data) {
        var dataToSend = [];
        if (typeof data == 'object') {
            for (var i in data)
                dataToSend.push(i+'='+encodeURIComponent(data[i]));
            dataToSend = dataToSend.join('&');
        }
        else
            dataToSend = data;
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send(dataToSend);
    }
    else
        xmlhttp.send();
}
chrome.commands.onCommand.addListener(function (command) {
    let slide = document.getElementById("mySidepanel");
    if (command === "open-close") {
        if(slide.style.width == "0px")
            slide.style = "width:320px; padding-right: 10px;";
        else
            slide.style = "width: 0px; padding-right: 0px;";
    }
});
let settings = {
    BG: {
        useColor: true,
        useNASA: false,
        useCustomIMG: false,
        blur: false,
        color: "#313131",
        customIMG: ""
    },
    CLOCK: {
        font: "Montserrat",
        color: "#ccc",
        size: "60pt",
        pos: {
            h: "center",
            v: "center"
        }
    }
};
function ResetSettings(){
    chrome.storage.local.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
    window.location.reload();
}
function SaveData(){
    chrome.storage.local.set({conf: settings});
}
function UseNASA(){
    let root = document.documentElement.style;
    ajax('GEt', 'https://api.nasa.gov/planetary/apod?api_key=pOorkF4PZaZtmG8oQbQWJZ97scVpsKJeHlFtV7lu', false, false, r => {
        if(r.status == 200){
            let url = JSON.parse(r.response).hdurl;
            root.setProperty('--background-general', `url(${url})`);
            if(settings.BG.blur == true)
                root.setProperty('--background-effect', 'blur(3px)');
        }
    });
}
function ChangeProp (name, value){
    document.documentElement.style.setProperty(name, value);
}
(function() {
    document.getElementById('refresh-prs-btn').onclick = function() {
        ResetSettings();
    };
    chrome.storage.local.get('conf', result => {
        if(result.conf){
            settings = result.conf;
            console.log("exists");
        }else{
            console.log("not exists");
            SaveData();
        }
        console.log(result.conf);
        console.log(settings);
    });
    if(settings.BG.useNASA == true)
        UseNASA();
    else if(settings.BG.useColor)
        ChangeProp('--background-general', settings.BG.color);
    ChangeProp('--color-clock', settings.CLOCK.color)
    ChangeProp('--font-clock', settings.CLOCK.font);
    ChangeProp('--font-size-clock', settings.CLOCK.size);

    let inBlur = document.getElementById('blur');
    let inUseColor = document.getElementById('useColor');
    let inUseNASA = document.getElementById('useNASA');
    let inUseCustomIMG = document.getElementById('useCustomIMG');
    let inBgColor = document.getElementById('bg-color');
    let inBgCimage = document.getElementById('bg-cimage');

    let inCFont = document.getElementById('clock-font');
    let inCColor = document.getElementById('clock-color');
    let inCSize = document.getElementById('clock-size');
    let inCPosH = document.getElementById('clock-h');
    let inCPosV = document.getElementById('clock-v');
    inBlur.checked = settings.BG.blur;
    inUseColor.checked = settings.BG.useColor;
    inUseNASA.checked = settings.BG.useNASA;
    inUseCustomIMG.checked = settings.BG.useCustomIMG;
    inBgColor.value = settings.BG.color;
    inBgCimage.value = settings.BG.customIMG;
    // Clock Settings
    inCFont.value = settings.CLOCK.font;
    inCColor.value = settings.CLOCK.color;
    inCSize.value = settings.CLOCK.size;
    inCPosV.value = settings.CLOCK.pos.v;
    inCPosH.value = settings.CLOCK.pos.h;

    inBlur.addEventListener('change', e => {
        settings.BG.blur = e.target.checked;
        if(settings.BG.blur)
            ChangeProp('--background-effect', 'blur(3px)');
        else
            ChangeProp('--background-effect', 'none');
        SaveData();
    });
    inUseColor.addEventListener('change', e => {
        settings.BG.useColor = e.target.checked;
        if(settings.BG.useColor)
            ChangeProp('--background-general', settings.BG.color);
        else
            if(!settings.BG.useNASA)
                ChangeProp('--background-general', '');
        else if(settings.BG.customIMG)
            ChangeProp('--background-general', settings.BG.customIMG);
        else
            UseNASA();
        SaveData();
    });
    inUseNASA.addEventListener('change', e => {
        settings.BG.useNASA = e.target.checked;
        if(settings.BG.useColor)
            ChangeProp('--background-general', settings.BG.color);
        else
            if(!settings.BG.useNASA)
                ChangeProp('--background-general', '');
        else if(settings.BG.customIMG)
            ChangeProp('--background-general', settings.BG.customIMG);
        else
            UseNASA();
        SaveData();
    });
    inUseCustomIMG.addEventListener('change', e => {
        settings.BG.useCustomIMG = e.target.checked;
        if(settings.BG.useColor)
            ChangeProp('--background-general', settings.BG.color);
        else
            if(!settings.BG.useNASA)
                ChangeProp('--background-general', '');
        else if(settings.BG.customIMG)
            ChangeProp('--background-general', settings.BG.customIMG);
        else
            UseNASA();
        SaveData();
    });

    inBgColor.addEventListener('change', e => {
        settings.BG.color = e.target.value;
        settings.BG.useColor = true;
        inUseColor.checked = true;
        ChangeProp('--background-general', settings.BG.color);
        SaveData();
    });
    inBgCimage.addEventListener('change', e => {
        settings.BG.customIMG = e.target.value;
        settings.BG.useCustomIMG = true;
        inBgCimage.checked = true;
        ChangeProp('--background-general', settings.BG.customIMG);
        SaveData();
    });
    inCFont.addEventListener('change', e => {
        settings.CLOCK.font = e.target.value;
        ChangeProp('--font-clock', settings.CLOCK.font);
        SaveData();
    });
    inCColor.addEventListener('change', e => {
        settings.CLOCK.color = e.target.value;
        ChangeProp('--color-clock', settings.CLOCK.color);
        SaveData();
    });

    inCSize.addEventListener('change', e => {
        settings.CLOCK.size = e.target.value;
        ChangeProp('--font-size-clock', settings.CLOCK.size);
        SaveData();
    });
    inCPosV.addEventListener('change', e => {
        settings.CLOCK.pos.v = e.target.value;
        ChangeProp('--pos-clock-vertical', settings.CLOCK.pos.v);
        SaveData();
    });
    inCPosH.addEventListener('change', e => {
        settings.CLOCK.pos.h = e.target.value;
        ChangeProp('--pos-clock-horizontal', settings.CLOCK.pos.h);
        SaveData();
    });

}());
