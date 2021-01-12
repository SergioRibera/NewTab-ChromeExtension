let url = "https://raw.githubusercontent.com";
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
function verifyUpdate(userName, appName, branch, file, oldVersion, newVersionCb){
    let newUrl = url + "/" + userName + "/" + appName + "/" + branch + "/" + file;
    ajax('GET', newUrl, false, {}, r => {
        let res = JSON.parse(r.response);
        if(res.version != oldVersion)
            newVersionCb();
    });
}
