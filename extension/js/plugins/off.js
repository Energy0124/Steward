/**
 * @file off command plugin script
 * @description 禁用扩展/应用
 * @author tomasy
 * @email solopea@gmail.com
 */

import $ from 'jquery'
import util from '../common/util'
import browser from 'webextension-polyfill'

var version = 2;
var name = 'offExtension';
var key = 'off';
var type = 'keyword';
var icon = browser.extension.getURL('img/off.png');
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

function setEnabled(id, enabled) {
    browser.management.setEnabled(id, enabled);
}

function getExtensions(key, enabled, callback) {
    browser.management.getAll(function (extList) {
        var matchExts = extList.filter(function (ext) {
            return util.matchText(key, ext.name) && ext.enabled === enabled;
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

function onEnter({ id }) {
    setEnabled(id, false);
    this.refresh();
    addRecord('ext', this.query, id);
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

function addRecord(type, query, id) {
    browser.storage.sync.get(type, function (data) {
        // data = {ext: {}}
        var extObj = data;
        // info = {id: {}};
        var info = extObj[type];

        if ($.isEmptyObject(extObj)) {
            info = extObj[type] = {};
        }

        var obj;

        if (!info[id]) {
            obj = info[id] = createObj4Storage(id, query);
        }
        else {
            obj = info[id];

            if (obj.querys[query]) {
                obj.querys[query].num += 1;
            }
            else {
                obj.querys[query] = {
                    num: 1,
                    update: +new Date()

                };
            }
        }

        browser.storage.sync.set(extObj, function () {});
    });
}

function createObj4Storage(id, query) {
    var obj = {
        id: id,
        querys: {}

    };

    obj.querys[query] = {
        num: 1,
        update: +new Date()

    };

    return obj;
}

export default {
    version,
    name: 'Disable Extension',
    icon,
    title,
    commands,
    onInput: onInput,
    onEnter: onEnter
};
