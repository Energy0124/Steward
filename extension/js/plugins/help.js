/**
 * @file help command plugin script
 * @description 帮助
 * @author rong
 */

import $ from 'jquery'
import _ from 'underscore'
import browser from 'webextension-polyfill'

var version = 2;
var name = 'help';
var key = 'help';
var type = 'keyword';
var icon = browser.extension.getURL('img/help.ico');
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

// NOTE: 只在需要的时候获取commands, main.js里已经立即获取过, 这里再获取会为空对象
function getPlugins() {
    var commands = window.stewardCache.commands;
    var helpList = _.uniq(_.values(commands)).map((command) => {
        return {
            icon: command.icon,
            id: command.key,
            title: command.key + ': ' + command.title,
            desc: command.subtitle,
            type: command.type
        }
    }).filter(item => item.type === 'keyword');

    return _.sortBy(helpList, 'id');
}

function onInput(key) {

    var that = this;

    that.showItemList(getPlugins());
}

function onEnter(item) {
    this.render(item.id.split(',')[0] + '');
}

export default {
    version,
    name: 'Help',
    icon,
    title,
    commands,
    onInput: onInput,
    onEnter: onEnter
};
