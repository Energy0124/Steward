/**
 * @file del command script
 * @description delete extensions / apps by del command
 * @author  tomasy
 * @mail solopea@gmail.com
 */

import $ from 'jquery'
import util from '../common/util'
import mathexp from 'math-expression-evaluator'
import browser from 'webextension-polyfill'

var name = 'calculate';
var version = 3;
var type = 'regexp';
var key = 'calc';
var icon = browser.extension.getURL('img/calc.png');
var title = browser.i18n.getMessage(name + '_title');
var subtitle = browser.i18n.getMessage(name + '_subtitle');
var withoutKey = true;
var regExp = /^(==|~=|&&|\|\||[0-9]|[\+\-\*\/\^\.%, ""]|[\(\)\|\!\[\]])+$/;

var commands = [{
    key,
    type,
    title,
    subtitle,
    icon,
    editable: false,
    regExp
}];

function onInput(key) {
    var data = [];
    if (this.term.startsWith('calc ') && key) {
        this.render(key);
        return;
    }
    try {
        let result = mathexp.eval(this.str);
        data = [
            {
                key: title,
                icon: icon,
                title: result,
                desc: subtitle

            }
        ];
    }
    catch (e) {}

    return data;
}

function onEnter(item) {
    let text = item.title;

    util.copyToClipboard(text);
}

export default {
    version,
    name: 'Calculator',
    icon,
    title,
    commands,
    withoutKey,
    onInput: onInput,
    onEnter: onEnter
};