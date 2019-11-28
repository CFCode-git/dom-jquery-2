window.$ = window.jQuery = function (selectorOrArrayOrTemplate) {

    let elements
    if (typeof selectorOrArrayOrTemplate === 'string') {
        if (selectorOrArrayOrTemplate[0] === '<') {
            // 创建div
            elements = [createElement(selectorOrArrayOrTemplate)]
        } else {
            // 查找div
            elements = document.querySelectorAll(selectorOrArrayOrTemplate)
        }
        // 如果是数组不是字符串，那么一定是find返回的数组
    } else if (selectorOrArrayOrTemplate instanceof Array) {
        elements = selectorOrArrayOrTemplate
    }

    function createElement(string) {
        const container = document.createElement("template");
        container.innerHTML = string.trim();
        return container.content.firstChild;
    }

    // api 可以操作elements【返回一个可以操作elements的对象】
    const api = Object.create(jQuery.prototype) // 创建一个对象，这个对象的 __proto__ 为括号里面的东西
    // 相当于 const api = {__proto__:jQuery.prototype}
    Object.assign(api, {
        elements: elements,
        oldApi: selectorOrArrayOrTemplate.oldApi
    })
    // api.elements = elements
    // api.oldApi = selectorOrArrayOrTemplate.oldApi
    return api
};

jQuery.fn = jQuery.prototype = {
    constructor: jQuery,
    jquery: true, // 这个属性表示正在处理的某个（或某些）元素节点是经过jquery处理的，那么这个元素节点是一个数组，在处理的时候要get(0)取得第0个
    get(index) {
        return this.elements[index]
    },

    appendTo(node) { // 将api对象插入到某个节点（注意是某个）
        if (node instanceof Element) { // Element是一个基类，所有document对象下的属性都继承Element（也就是通过原生dom => document.xxxxx 得到的DOM对象都属于这类，比如document.body）
            this.each(el => node.appendChild(el)); // 遍历elements，对每个el进行node.appendChild操作
        } else if (node.jquery === true) {
            this.each(el => node.get(0).appendChild(el)); // 遍历elements，对每个el进行node.get(0).appendChild(el)操作
        }
    },

    append(children) {
        // 为api对象添加子节点，子节点可能是单个element元素，可能是element组成的集合，也可能是经过jQuery处理得到的数组。
        // 如果是经过jQuery处理得到的数组，可以直接调用each遍历数组进行添加。
        if (children instanceof Element) {
            this.get(0).appendChild(children)
        } else if (children instanceof HTMLCollection) { // HTMlCollection是表示一种成员为Element的通用集合。
            for (let i = 0; i < children.length; i++) {
                this.get(0).appendChild(children[i])
            }
        } else if (children.jquery === true) {
            children.each(node => this.get(0).appendChild(node))
        }
    },

    // 闭包：函数访问外部的变量
    addClass(className) {
        for (let i = 0; i < elements.length; i++) {
            this.elements[i].classList.add(className)
        }
        return this
    },

    each(fn) {
        for (let i = 0; i < this.elements.length; i++) {
            fn.call(null, this.elements[i], i)
        }
        return this
    },

    parent() {
        const array = []
        this.each((node) => {
            if (array.indexOf(node.parentNode) === -1) { //当parentNode没获取到时执行
                array.push(node.parentNode)
            }
        })
        return jQuery(array)
    },

    children() {
        const array = []
        this.each((node) => {
            array.push(...node.children) // 展开二元数组中的每一项
        })
        return jQuery(array)
    },

    print() {
        console.log(this.elements) // 打印元素们 ； 
        // 不能 console.log(selectorOrArray)，
        // 因为 selectorOrArray 可能是选择器
    },

    find(selector) {
        let array = []
        for (let i = 0; i < this.elements.length; i++) {
            const elements2 = Array.from(this.elements[i].querySelectorAll(selector))
            array = array.concat(elements2)
        }
        array.oldApi = this  // this 就是 api
        return jQuery(array)
    },

    end() {
        return this.oldApi  //this 就是当时的 api // api2
    },

}