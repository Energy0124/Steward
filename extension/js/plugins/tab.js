/**
 * @file tab command plugin script
 * @description 标签页查找
 * @author tomasy
 * @email solopea@gmail.com
 */

import $ from 'jquery'
import util from '../common/util'
import browser from 'webextension-polyfill'

var version = 2;
var name = 'locateTab';
var key = 'tab';
var type = 'keyword';
var icon = browser.extension.getURL('img/tab.png');
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

function getAllTabs(key, callback) {
    browser.windows.getAll(function (wins) {
        if (!wins.length) {
            return;
        }
        var data = [];
        for (var i = 0, len = wins.length; i < len; i++) {
            // 闭包
            (function (index) {
                browser.tabs.getAllInWindow(wins[index].id, function (tabs) {
                    var tabList = tabs.filter(function (tab) {
                        return util.matchText(key, tab.title);
                    });

                    data = data.concat(tabList);

                    if (index === len - 1) {
                        callback(data);
                    }
                });
            })(i);
        }
    });
}

function dataFormat(rawList) {
    return rawList.map(function (item) {
        return {
            key: key,
            id: item.id,
            icon: item.favIconUrl || icon,
            title: item.title,
            desc: subtitle

        };
    });
}

function onInput(key) {
    var that = this;
    getAllTabs(key, function (data) {
        that.showItemList(dataFormat(data));
    });
}

function onEnter({ id }) {
    browser.tabs.update(id, {
        active: true
    });
}

export default {
    version,
    name: 'Tabs',
    icon,
    title,
    commands,
    onInput: onInput,
    onEnter: onEnter
};
