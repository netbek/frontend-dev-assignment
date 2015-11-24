/**
 * Bootstrap
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, document, app, util, undefined) {

  var flags = {
    init: false // Whether init() has been fired.
  };

  var delay = 10, fnTimeout = setTimeout(fn, delay);

  // Fires init() when the DOM is ready.
  jQuery(document).ready(function () {
    clearTimeout(fnTimeout);

    init();
  });

  /**
   * Fires init() when document.body exists.
   */
  function fn() {
    clearTimeout(fnTimeout);

    if (document.body) {
      init();
    }
    else {
      fnTimeout = setTimeout(fn, delay);
    }
  }

  /**
   * Initializes the app, which displays the table of contents, among other
   * things. To make the table of contents appear as quickly as possible, this
   * function is fired as soon as either document.body exists or any DOM ready
   * events (document.readystatechange, document.DOMContentLoaded, window.load)
   * have been fired. Saves ~40-100ms in Firefox 38; no savings in Chrome 46.
   */
  function init() {
    if (flags.init) {
      return;
    }

    flags.init = true;

    // Init app.
    app.init(function () {
      // Init FastClick.
      FastClick.attach(document.body);

      // Configure and load MathJax.
      // http://docs.mathjax.org/en/latest/configuration.html
      // http://docs.mathjax.org/en/latest/output.html
      var mathJaxConfigFile, mathJaxConfig = {};

//      if (Modernizr.svg) {
//        mathJaxConfigFile = 'TeX-AMS-MML_SVG';
//
//        mathJaxConfig.AuthorInit = function () {
//          MathJax.Hub.Register.MessageHook('New Math', function (message) {
//            var script = MathJax.Hub.getJaxFor(message[1]).SourceElement();
//            var frame = document.getElementById(message[1] + '-Frame');
//            var svg = frame.firstChild;
//            var viewBox = svg.getAttribute('viewBox');
//
//            if (viewBox) {
//              var matches = viewBox.match(/^\s*([0-9\.\-]+)\s+([0-9\.\-]+)\s+([0-9\.\-]+)\s+([0-9\.\-]+)\s*$/);
//
//              if (matches) {
//                var minX = Number(matches[1]);
//                var minY = Number(matches[2]);
//                var w = Number(matches[3]);
//                var h = Number(matches[4]);
//
//                // Round to 2 decimals for IE.
//                var ratio = util.decimalRound(h / w * 100, 2);
//
//                var eH = svg.getAttribute('height');
//                var eW = svg.getAttribute('width');
//
//                // Aspect ratio hack from https://css-tricks.com/scale-svg/
//                // Used "display: inline-block !important" to override
//                // "MathJax_SVG_Processed" class sometimes added to frame
//                // element by MathJax if using a wrapper element.
//                // @todo Find out why MathJax does this. IE 9 throws a
//                // "math processing" error. Manipulating DOM is possibly
//                // breaking MathJax. Wrapper element is needed for hack to work.
//                frame.setAttribute('style', 'background: yellow; display: inline-block !important; font-size: 100%; position: relative; height: 0; width: ' + eW + '; max-width: 100%; padding: 0; padding-bottom: ' + ratio + '%;');
//
//                svg.setAttribute('style', 'position: absolute; height: 100%; width: 100%; left: 0; top: 0;');
//                svg.removeAttribute('height');
//                svg.removeAttribute('width');
//
//                var wrapper = document.createElement('span');
//                wrapper.innerHTML = frame.outerHTML;
//                wrapper.setAttribute('style', 'display: inline-block; max-width: 100%;');
//                frame.parentNode.insertBefore(wrapper, frame);
//                frame.remove();
//              }
//            }
//          });
//        };
//      }
//      else {
      mathJaxConfigFile = 'TeX-AMS-MML_HTMLorMML';
      mathJaxConfig['HTML-CSS'] = {
        linebreaks: {
          automatic: true
        }
      };
//      }

      window.MathJax = mathJaxConfig;
      loadJS('bower_components/MathJax/MathJax.js?config=' + mathJaxConfigFile);
    });
  }

})(window, document, window.app, window.util);
