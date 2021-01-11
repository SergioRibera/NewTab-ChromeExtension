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
    },
    BOOKSMARK: {
        pointOfAction: 80,
        timeAnimation: ".5s",
        position: 'r', 
        color: "#ffffff4d",
        blur: true,
        list: []
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
function ConfigureSC(sc, sets){
    switch(sets.BOOKSMARK.position){
        case 'b':
            sc.style = "transform: translateY(1000px)";
            ChangeProp("--pos-sc-horizontal", 'center');
            ChangeProp("--pos-sc-vertical", 'flex-end');
            break;
        case 't':
            sc.style = "transform: translateY(-1000px)";
            ChangeProp("--pos-sc-horizontal", 'center');
            ChangeProp("--pos-sc-vertical", 'flex-start');
            break;
        case 'l':
            sc.style = "transform: translateX(-1000px)";
            ChangeProp("--pos-sc-horizontal", 'flex-start');
            ChangeProp("--pos-sc-vertical", 'center');
            break;
        case 'r':
            sc.style = "transform: translateX(1000px)";
            ChangeProp("--pos-sc-horizontal", 'flex-end');
            ChangeProp("--pos-sc-vertical", 'center');
            break;
    }
    if(sets.BOOKSMARK.position == 'b' || sets.BOOKSMARK.position == 't')
        ChangeProp("--orientation-sc", 'row wrap');
    else
        ChangeProp("--orientation-sc", 'column wrap');
    ChangeProp('--color-sc', sets.BOOKSMARK.color);
    ChangeProp('--sc-effect', sets.BOOKSMARK.blur ? 'blur(3px)':'none');
    ChangeProp('--animation-duration-sc', sets.BOOKSMARK.timeAnimation);
}
function AddSC(){

}
function EditSC(n){
    let nName = document.getElementById('modal-name');
    let nUrl = document.getElementById('modal-url');
    let nUrlIcon = document.getElementById('modal-icon');
    let nUseName = document.getElementById('modal-useName');
    let nUseIcon = document.getElementById('modal-useIcon');

    let sc = settings.BOOKSMARK.list[n];
    nName.value = sc.name;
    nUrl.value = sc.url;
    nUrlIcon.value = sc.urlIcon;
    nUseName.checked = sc.useName;
    nUseIcon.checked = sc.useIcon;
    let btnAceptModal = document.getElementById('modal-acept');
    btnAceptModal.onclick = function(){
        let newMark = {
            name: nName.value,
            url: nUrl.value,
            urlIcon: nUrlIcon.value,
            useName: nUseName.checked,
            useIcon: nUseIcon.checked
        };
        settings.BOOKSMARK.list[n] = newMark;
        nName.value = "";
        nUrl.value = "";
        nUrlIcon.value = "";
        nUseName.checked = false;
        nUseIcon.checked = false;
        SaveData();
        window.location.reload();
    }
    document.getElementById('modal').style.display = 'block';
}
function ActiveModal(){
    document.getElementById('modal').style.display = 'block';
}
(function() {
    document.getElementById('refresh-prs-btn').onclick = function() {
        ResetSettings();
    };
    document.addEventListener('contextmenu', e => e.preventDefault());
    chrome.storage.local.get('conf', result => {
        if(result.conf)
            settings = result.conf;
        else
            SaveData();
        if(settings.BG.useNASA == true)
            UseNASA();
        else if(settings.BG.useColor)
            ChangeProp('--background-general', settings.BG.color);
        ChangeProp('--color-clock', settings.CLOCK.color)
        ChangeProp('--font-clock', settings.CLOCK.font);
        ChangeProp('--font-size-clock', settings.CLOCK.size);
        ChangeProp('--pos-clock-vertical', settings.CLOCK.pos.v);
        ChangeProp('--pos-clock-horizontal', settings.CLOCK.pos.h);
        let shortcutsList = document.getElementById('shortcuts');
        ConfigureSC(shortcutsList, settings);

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

        let nName = document.getElementById('modal-name');
        let nUrl = document.getElementById('modal-url');
        let nUrlIcon = document.getElementById('modal-icon');
        let nUseName = document.getElementById('modal-useName');
        let nUseIcon = document.getElementById('modal-useIcon');

        let modal = document.getElementById('modal');
        let btnCancelModal = document.getElementById('modal-cancel');
        let btnCloseModal = document.getElementById('modal-close');
        let btnAceptModal = document.getElementById('modal-acept');

        let scBlur = document.getElementById('blur-sc');
        let scPos = document.getElementById('pos-sc');
        let scColor = document.getElementById('color-sc');
        let scAnim = document.getElementById('anim-dur-sc');
        let scDist = document.getElementById('distance-sc');

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

        scBlur.checked = settings.BOOKSMARK.blur;
        scPos.value = settings.BOOKSMARK.position;
        scColor.value = settings.BOOKSMARK.color;
        scAnim.value = settings.BOOKSMARK.timeAnimation;
        scDist.value = settings.BOOKSMARK.pointOfAction;

        scBlur.addEventListener('change', e => {
            settings.BOOKSMARK.blur = e.target.checked;
            if(settings.BOOKSMARK.blur)
                ChangeProp('--sc-effect', 'blur(3px)');
            else
                ChangeProp('--sc-effect', 'none');
            SaveData();
        });
        scPos.addEventListener('change', e => {
            settings.BOOKSMARK.position = e.target.value;
            ConfigureSC(document.getElementById('shortcuts'), settings);
            SaveData();
        });
        scColor.addEventListener('change', e => {
            settings.BOOKSMARK.color = e.target.value;
            ConfigureSC(document.getElementById('shortcuts'), settings);
            SaveData();
        });
        scAnim.addEventListener('change', e => {
            settings.BOOKSMARK.timeAnimation = e.target.value;
            ConfigureSC(document.getElementById('shortcuts'), settings);
            SaveData();
        });
        scDist.addEventListener('change', e => {
            settings.BOOKSMARK.pointOfAction = e.target.blur;
            SaveData();
        });

        btnCloseModal.addEventListener('click', e => modal.style.display='none');
        btnCancelModal.addEventListener('click',e => modal.style.display='none');
        btnAceptModal.addEventListener('click', e => {
            let newMark = {
                name: nName.value,
                url: nUrl.value,
                urlIcon: nUrlIcon.value,
                useName: nUseName.checked,
                useIcon: nUseIcon.checked
            };
            settings.BOOKSMARK.list.push(newMark);
            let newElement = `<a class="b-item" href="${newMark.url}">
                    <img src="${newMark.useIcon == true ? newMark.urlIcon : "http://www.google.com/s2/favicons?domain=" + newMark.url}">
                        ${newMark.useName == true ? "<span>"+newMark.name+"</span>" : ""}
                </a>`;
            document.getElementById('mark-list').innerHTML += newElement;
            nName.value = "";
            nUrl.value = "";
            nUrlIcon.value = "";
            nUseName.checked = false;
            nUseIcon.checked = false;
            SaveData();
            modal.style.display = "none";
        });
        if(settings.BOOKSMARK.list.length > 0){
            let n = 0;
            settings.BOOKSMARK.list.forEach(newMark => {
                let newElement = `<a class="b-item" href="${newMark.url}" oncontextmenu="EditSC(${n})">
                    <img src="${newMark.useIcon == true ? newMark.urlIcon : "http://www.google.com/s2/favicons?domain=" + newMark.url}">
                        ${newMark.useName == true ? "<span>"+newMark.name+"</span>" : ""}
                </a>`;
                document.getElementById('mark-list').innerHTML += newElement;
                n++;
            });
        }
        window.addEventListener("mousemove", function(e) {
            switch(settings.BOOKSMARK.position){
                case "b":
                    if(e.clientY >= (window.innerHeight - settings.BOOKSMARK.pointOfAction))
                        shortcutsList.style = "";
                    else
                        shortcutsList.style = "transform: translateY(1000px);";
                    break;
                case "t":
                    if(e.clientY <= settings.BOOKSMARK.pointOfAction)
                        shortcutsList.style = "";
                    else
                        shortcutsList.style = "transform: translateY(-1000px);";
                    break;
                case "l":
                    if(e.clientX <= settings.BOOKSMARK.pointOfAction)
                        shortcutsList.style = "";
                    else
                        shortcutsList.style = "transform: translateX(-1000px);";
                    break;
                case "r":
                    if(e.clientX >= (window.innerWidth - settings.BOOKSMARK.pointOfAction))
                        shortcutsList.style = "";
                    else
                        shortcutsList.style = "transform: translateX(1000px);";
                    break;

            }
        });

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
    });
}());
