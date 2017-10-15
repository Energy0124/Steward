/**
 * @file yd command plugin script
 * @description 有道翻译
 * @author tomasy
 * @email solopea@gmail.com
 */

import $ from 'jquery'
import util from '../common/util'
import browser from 'webextension-polyfill'

var url = 'https://fanyi.youdao.com/openapi.do?' +
'keyfrom=mineword&key=1362458147&type=data&doctype=json&version=1.1&q=';
var emptyReg = /^\s+$/g;

var version = 2;
var name = 'youdao';
var key = 'yd';
var type = 'keyword';
var icon = browser.extension.getURL('img/youdao.png');
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

function onInput(key) {
    if (emptyReg.test(key)) {
        return;
    }

    getTranslation(this, key);
}

function onEnter({ title }) {
    util.copyToClipboard(title);
}

function dataFormat(rawList) {
    return rawList.map(function (item) {
        return {
            key: key,
            id: item.id,
            icon: icon,
            title: item.text,
            desc: item.note

        };
    });
}

function getTranslation(cmdbox, key) {
    $.get(url + key, function (data) {
        var retData = [];
        var phonetic = data.basic ? '[' + [
            data.basic.phonetic,
            data.basic['uk-phonetic'],
            data.basic['us-phonetic']
        ].join(',') + ']' : '';

        retData.push({
            text: (data.translation || []).join(';') + phonetic,
            note: '翻译结果'
        });

        var explains = data.basic && data.basic.explains && data.basic.explains.map(function (exp) {
            return {
                text: exp,
                note: '简明释义'
            };
        });

        var webs = data.web && data.web.map(function (web) {
            return {
                text: web.value.join(', '),
                note: '网络释义: ' + web.key
            };
        });

        retData = retData.concat(explains || []).concat(webs || []);

        cmdbox.showItemList(dataFormat(retData));
    });
}

export default {
    version,
    name: name,
    icon,
    title,
    commands,
    onInput: onInput,
    onEnter: onEnter
};