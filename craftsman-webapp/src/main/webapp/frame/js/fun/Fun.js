var Fun = {};
Fun.merge = function (obj1, obj2) { // Our merge function
    var result = {}; // return result
    for (var i in obj1) { // for every property in obj1
        if ((i in obj2) && (typeof obj1[i] === "object") && (i !== null)) {
            result[i] = merge(obj1[i], obj2[i]); // if it's an object, merge
        } else {
            result[i] = obj1[i]; // add it to result
        }
    }
    for (i in obj2) { // add the remaining properties from object 2
        if (i in result) { //conflict
            continue;
        }
        result[i] = obj2[i];
    }
    return result;
};

Fun.notify = function (data) {
    if (/^(alert)|(warning)|(info)$/.test(data.status)) {
        var colors = {
            alert: "#d26911",
            warning: "#C46A69",
            info: "#1d9d74"
        };
        var icons = {
            alert: "fa fa-exclamation shake animated",
            warning: "fa fa-warning shake animated",
            info: "fa fa-info shake animated"
        };
        data = data || {};
        data.status = data.status ? data.status : 'info';
        data.title = data.title ? data.title : '提示信息';
        data.message = data.message ? data.message : '操作成功';

        $.bigBox({
            title: data.title,
            content: data.message,
            color: colors[data.status],
            icon: icons[data.status],
            timeout: 6000
        });
    }
};
Fun.notifyMessage = function (status, title, message) {
    if (!message) {
        message = title;
        title = null;
    }
    var data = {
        status: status,
        title: title,
        message: message
    }
    Fun.notify(data);
}
Fun.notifyInfo = function (title, message) {
    Fun.notifyMessage("info", title, message);
}
Fun.notifyAlert = function (title, message) {
    Fun.notifyMessage("alert", title, message);
}
Fun.notifyWarn = function (title, message) {
    Fun.notifyMessage("waring", title, message);
}

Fun.deleteMsgBox = function (yepoCallback, nopeCallback) {
    $.SmartMessageBox({
        title: "操作提示!",
        content: "是否确定删除记录!",
        buttons: '[否][是]'
    }, function (ButtonPressed) {
        if (ButtonPressed === "是") {
            yepoCallback();
        }
        else if (ButtonPressed === "否") {
            nopeCallback();
        }
    });
};