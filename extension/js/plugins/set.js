/**
 * @file set command script
 * @description open extension's option page
 * @author  tomasy
 * @mail solopea@gmail.com
 */

import $ from 'jquery'
import util from '../common/util'
import browser from 'webextension-polyfill'

var version = 2;
var name = 'setOption';
var key = 'set';
var type = 'keyword';
var icon = browser.extension.getURL('img/set.png');
var title = browser.i18n.getMessage(name + '_title');
var subtitle = browser.i18n.getMessage(name + '_subtitle');
var commands = [{
    key,
    type,
    title,
    subtitle,
    icon,
    editable: true
}];

function openOptionPage(item, cb) {
    var url = item.url;

    if (!url) {
        cb.call(null);
        return;
    }

    browser.tabs.create({
        url: url
    }, function () {
        cb.call(null);
    });
}

// get all
function getExtensions(key, enabled, callback) {
    browser.management.getAll(function (extList) {
        var matchExts = extList.filter(function (ext) {
            return !ext.isApp && ext.enabled === enabled && util.matchText(key, ext.name);
        });

        callback(matchExts);
    });
}

function dataFormat(rawList) {
    return rawList.map(function (item) {
        var url = item.icons instanceof Array ? item.icons[item.icons.length - 1].url : '';
        var isWarn = item.installType === 'development';
        return {
            key: key,
            id: item.id,
            icon: url,
            title: item.name,
            url: item.optionsUrl,
            desc: item.description,
            isWarn: isWarn

        };
    });
}
function onInput(key) {
    var that = this;
    getExtensions(key.toLowerCase(), true, function (matchExts) {
        sortExtensions(matchExts, key, function (matchExts) {
            that.showItemList(dataFormat(matchExts));
        });
    });
}

function onEnter(item) {
    openOptionPage(item, function () {
        // cb
    });
}

function sortExtFn(a, b) {
    return a.num === b.num ? b.update - a.upate : b.num - a.num;
}

function sortExtensions(matchExts, key, callback) {
    browser.storage.sync.get('ext', function (data) {
        var sExts = data.ext;

        if (!sExts) {
            callback(matchExts);
            return;
        }

        // sExts: {id: {id: '', querys: {'key': {num: 0, update: ''}}}}
        matchExts = matchExts.map(function (extObj) {
            var id = extObj.id;

            if (!sExts[id] || !sExts[id].querys[key]) {
                extObj.num = 0;
                extObj.upate = 0;

                return extObj;
            }

            extObj.num = sExts[id].querys[key].num;
            extObj.update = sExts[id].querys[key].update;

            return extObj;
        });

        matchExts.sort(sortExtFn);

        callback(matchExts);
    });
}

export default {
    version,
    name: 'Set Extension',
    icon,
    title,
    commands,
    onInput: onInput,
    onEnter: onEnter
};
