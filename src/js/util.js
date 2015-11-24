/**
 * Utility functions
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, document, app) {

  function Util() {
  }

  /**
   * Limits frequency of execution of the given function.
   * https://remysharp.com/2010/07/21/throttling-function-calls (Remy Sharp, MIT License)
   *
   * @param {Function} fn
   * @param {Number} delay
   * @returns {Function}
   */
  Util.prototype.debounce = function (fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  };

  /**
   * Decimal adjustment of a number.
   * http://stackoverflow.com/a/21323330
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round#Example%3a_Decimal_rounding
   *
   * @param {Number} value The number.
   * @param {Integer} exp The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  Util.prototype.decimalRound = function (value, exp) {
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math.round(value);
    }

    value = +value;
    exp = +exp;

    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }

    // Shift
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

    // Shift back
    value = value.toString().split('e');

    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
  };

  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim (Mozilla Contributors, CC-BY-SA 2.5)
   *
   * @param {String} value
   * @returns {String}
   */
  Util.prototype.trim = function (value) {
    return value.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };

  /**
   * Checks whether the given element has the given class.
   *
   * @param {Node} elm
   * @param {String} className
   * @returns {Boolean}
   */
  Util.prototype.hasClass = function (elm, className) {
    return (' ' + elm.className + ' ').indexOf(' ' + className + ' ') > -1;
  };

  /**
   * Adds the given class to the given element.
   *
   * @param {Node} elm
   * @param {String} className
   */
  Util.prototype.addClass = function (elm, className) {
    if (elm.classList) {
      elm.classList.add(className);
    }
    else {
      elm.className += ' ' + className;
    }
  };

  /**
   * Removes the given class from the given element.
   *
   * @param {Node} elm
   * @param {String} className
   */
  Util.prototype.removeClass = function (elm, className) {
    if (elm.classList) {
      elm.classList.remove(className);
    }
    else {
      elm.className = elm.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  };

  /**
   * Checks if the given value is in the given array.
   *
   * @param {Array} array
   * @param {mixed} value
   * @returns {Number}
   */
  Util.prototype.indexOf = function (array, value) {
    for (var i = 0, il = array.length; i < il; i++) {
      if (value === array[i]) {
        return i;
      }
    }
    return -1;
  };

  /**
   * Returns a collection of nodes for the given HTML string.
   *
   * @param {String} html
   * @returns {NodeList}
   */
  Util.prototype.toNodeList = function (html) {
    var parent = document.createElement('div');
    parent.innerHTML = html;
    return parent.childNodes;
  };

  /**
   * Inserts the given HTML string before the given element.
   *
   * @param {Node} elm
   * @param {String} html
   */
  Util.prototype.before = function (elm, html) {
    elm.insertAdjacentHTML('beforebegin', html);
  };

  /**
   * Inserts the given HTML string after the given element.
   *
   * @param {Node} elm
   * @param {String} html
   */
  Util.prototype.after = function (elm, html) {
    elm.insertAdjacentHTML('afterend', html);
  };

  /**
   * Inserts the given element at the begining of the given parent element.
   *
   * @param {Node} parentElm
   * @param {Node} elm
   */
  Util.prototype.prepend = function (parentElm, elm) {
    parentElm.insertBefore(elm, parentElm.firstChild);
  };

  /**
   * Inserts the given element at the end of the given parent element.
   *
   * @param {Node} parentElm
   * @param {Node} elm
   */
  Util.prototype.append = function (parentElm, elm) {
    parentElm.appendChild(elm);
  };

  /**
   * Removes the given element from the DOM.
   *
   * @param {Node} elm
   */
  Util.prototype.remove = function (elm) {
    elm.parentNode.removeChild(elm);
  };

  /**
   * Returns the text content of the given element.
   * https://github.com/jquery/sizzle/blob/master/src/sizzle.js  (jQuery Foundation, MIT License)
   *
   * @param {Node} elm
   * @returns {String}
   */
  Util.prototype.text = function (elm) {
    var node,
      ret = '',
      i = 0,
      nodeType = elm.nodeType;

    if (!nodeType) {
      // If no nodeType, this is expected to be an array
      while ((node = elm[i++])) {
        // Do not traverse comment nodes
        ret += this.text(node);
      }
    }
    else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
      // Use textContent for elements
      // innerText usage removed for consistency of new lines (jQuery #11153)
      if (typeof elm.textContent === 'string') {
        return elm.textContent;
      }
      else {
        // Traverse its children
        for (elm = elm.firstChild; elm; elm = elm.nextSibling) {
          ret += this.text(elm);
        }
      }
    }
    else if (nodeType === 3 || nodeType === 4) {
      return elm.nodeValue;
    }

    return ret;
  };

  window.util = new Util();

})(window, document);
