/**
 * @file request
 * @description chrome通信包装
 * @author tomasy
 * @email solopea@gmail.com
 */

function emptyFn() {
}

function send(obj, callback = () => {}) {
    chrome.runtime.sendMessage(obj || {}, function (response) {
        callback(response);
    });
}

function log(msg) {
    send({
        msg: msg

    }, emptyFn);
}

function get(cb) {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        cb.apply(null, arguments);
    });
}

export default {
    send: send,
    log: log,
    get: get
};
