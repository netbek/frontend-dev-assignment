/**
 * App
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, document, util, undefined) {

  // Constants.
  var MEDIUM = 'medium';
  var LARGE = 'large';

  /**
   *
   * @returns {AppConfig}
   */
  function AppConfig() {
    this.config = {
      mediaqueries: {}
    };

    // Same media queries as Foundation.
    this.config.mediaqueries[MEDIUM] = 'only screen and (min-width: 47em)';
    this.config.mediaqueries[LARGE] = 'only screen and (min-width: 63em)';
  }

  /**
   *
   * @returns {Object}
   */
  AppConfig.prototype.get = function () {
    return this.config;
  };

  var flags = {
    showTOC: false, // Whether table of contents is in DOM
    stickyVisible: false, // Whether the sticky nav bar is visible
    stickyUpdate: true // Whether the visibility of sticky nav bar may be updated
  };

  var breakpoint; // {String} Name of current breakpoint (defined in AppConfig)
  var matchedBreakpoints = []; // {Array} Currently matched media queries
  var tocElm; // {Node} Table of contents DOM node
  var stickyClass = 'sticky'; // {String} Class name used for sticky table of contents nav bar
  var stickyBodyClass = 'has-sticky'; // {String} Class name added to body element if table of contents nav bar is sticky
  var bodyElm;
  var $window; // {jQuery}
  var $body; // {jQuery}
  var $sticky; // {jQuery}
  var $toc; // {jQuery}

  /**
   *
   * @returns {App}
   */
  function App() {
  }

  /**
   *
   * @param {Function} cb Callback function
   */
  App.prototype.init = function (cb) {
    bodyElm = document.body;

    $window = jQuery(window);
    $body = jQuery('body');

    buildNotes();
    buildExamples();
    buildExercises();
    buildTOC();

    if (tocElm) {
      $toc = jQuery(tocElm);
      $sticky = jQuery('.sticky', tocElm);

      jQuery('.menu a', $toc).on('click', function (event) {
        event.preventDefault();

        hideSticky();

        // Prevent the sticky nav bar from being updated until the animation has been completed.
        flags.stickyUpdate = false;

        jQuery('html, body')
          .stop()
          .animate({
            scrollTop: $toc.offset().top
          }, {
            complete: function () {
              flags.stickyUpdate = true;
            }
          });
      });
    }

    // Set the initial state.
    resize(true);

    var debouncedResize = util.debounce(function (event) {
      resize();
    }, 60);

    var debouncedScroll = util.debounce(function (event) {
      updateSticky();
    }, 60);

    if (window.addEventListener) {
      window.addEventListener('resize', debouncedResize, false);
      window.addEventListener('scroll', debouncedScroll, false);
    }
    else {
      window.attachEvent('resize', debouncedResize);
      window.attachEvent('scroll', debouncedScroll);
    }

    cb();
  };

  /**
   * Builds table of contents (not allowed to use library).
   */
  function buildTOC() {
    // Find headings for table of contents.
    var headings = [];
    findHeadings(bodyElm, headings);
    var headingsLen = headings.length;

    if (!headingsLen) {
      return;
    }

    // Exclude first heading (page title)
    headings.shift();
    headingsLen--;

    if (!headingsLen) {
      return;
    }

    var elm, depth, currentDepth = 0, open = 0, fragments = {}, fragment, id, title, html = '';

    html += '<nav role="navigation" class="toc" id="toc">';
    html += '<div class="scroll">';

    html += '<div class="toc-bar-wrapper ' + stickyClass + '">';
    html += '<div class="constrained">';
    html += '<div class="toc-bar">';

    html += '<div class="title-wrapper">';
    html += '<h2 class="title">' + document.title + '</h2>';
    html += '</div>';

    html += '<div class="menu-wrapper">';
    html += '<div class="menu"><a href="#toc">Table of Contents</a></div>';
    html += '</div>'; // .menu-wrapper

    html += '</div>'; // .toc-bar
    html += '</div>'; // .constrained
    html += '</div>'; // .toc-bar-wrapper

    html += '<div class="list-wrapper">';
    html += '<div class="constrained">';

    for (var i = 0; i < headingsLen; i++) {
      elm = headings[i].node;
      depth = headings[i].depth;

      title = util.text(elm);

      // Create fragment from lower kebab case of title.
      fragment = title.toLowerCase().replace(/[^\s\w]/gi, '').replace(/[\s_]/g, '-');

      // Set default fragment if needed.
      if (!fragment.length) {
        fragment = 'section';
      }

      // Check for duplicate fragments.
      if (fragment in fragments) {
        fragments[fragment]++;
        id = fragment + '-' + fragments[fragment];
      }
      else {
        fragments[fragment] = 1;
        id = fragment;
      }

      if (depth > currentDepth) {
        currentDepth = depth;
        open++;
        html += '<ol class="list">';
      }
      else if (depth < currentDepth) {
        currentDepth = depth;

        if (open > 1) {
          while (open > 1) {
            open--;
            html += '</li>';
            html += '</ol>';
          }

          html += '</li>';
        }
      }
      else {
        if (open > 0) {
          html += '</li>';
        }
      }

      html += '<li class="item"><a href="#' + id + '">' + title + '</a>';

      // Add ID to section title element.
      elm.setAttribute('id', id);
    }

    while (open > 0) {
      open--;
      html += '</li>';
      html += '</ol>';
    }

    html += '</div>'; // .constrained
    html += '</div>'; // .list-wrapper

    html += '</div>'; // .scroll
    html += '</nav>';

    tocElm = util.toNodeList(html)[0];
  }

  /**
   * Finds heading elements for table of contents (not allowed to use library).
   *
   * @param {Node} parentElm
   * @param {Array} matches
   * @param {Number} depth
   */
  function findHeadings(parentElm, matches, depth) {
    depth = isNaN(depth) ? 1 : depth + 1;

    var elm, headingElm, isSection, isLimited;

    for (elm = parentElm.firstChild; elm !== null; elm = elm.nextSibling) {
      if (elm.nodeType !== 1) {
        continue;
      }

      // Add headings of these elements and look deeper in DOM
      isSection = util.hasClass(elm, 'section');
      // Add headings of these elements but don't look deeper in DOM
      isLimited = util.hasClass(elm, 'worked_example') || util.hasClass(elm, 'exercises');

      if (isSection || isLimited) {
        for (headingElm = elm.firstChild; headingElm !== null; headingElm = headingElm.nextSibling) {
          if (headingElm.nodeType !== 1) {
            continue;
          }

          if (util.hasClass(headingElm, 'title')) {
            matches.push({
              depth: depth,
              node: headingElm
            });
            break;
          }
        }
      }

      if (isLimited) {
        continue;
      }

      findHeadings(elm, matches, depth);
    }
  }

  /**
   * Adds labels to notes.
   */
  function buildNotes() {
    jQuery.each(jQuery('.note'), function (index, elm) {
      var $elm = jQuery(elm), $target = jQuery('p:first-of-type', $elm), text = 'Note';

      if ($elm.hasClass('tip')) {
        text = 'Tip';
      }
      else if ($elm.hasClass('visit')) {
        text = 'Visit';
      }

      $target.before('<span class="label">' + text + '</span>');
    });
  }

  /**
   * Adds labels to examples.
   */
  function buildExamples() {
    jQuery.each(jQuery('.worked_example'), function (index, elm) {
      var $elm = jQuery(elm), $target = jQuery('> .title', $elm), text = 'Example';

      $target.before('<span class="label">' + text + '</span>');
    });
  }

  /**
   * Adds heading, and creates list of problems and answers in exercises section.
   */
  function buildExercises() {
    jQuery('.exercises').prepend('<h1 class="title">Exercises</h1>');

    var $problemset = jQuery('.exercises .problemset');
    var $entries = jQuery('.entry', $problemset);
    var entriesLen = $entries.length;

    if (!entriesLen) {
      return;
    }

    var problemList = '<ol class="list">', answerList = '<ol class="list">';

    jQuery.each($entries, function (index, elm) {
      var $entry = jQuery(elm);
      problemList += '<li class="item">' + jQuery('.problem', $entry).text() + '</li>';
      answerList += '<li class="item">' + jQuery('.solution', $entry).text() + '</li>';
    });

    problemList += '</ol>';
    answerList += '</ol>';

    $entries.remove();

    $problemset.append(problemList);

    var headingText = entriesLen > 1 ? 'Answers' : 'Answer';
    var showButtonText = entriesLen > 1 ? 'Show me the answers' : 'Show me the answer';

    var answerSection = '<div class="answers-section">';

    answerSection += '<div class="answers-actions">';
    answerSection += '<button class="show-answers primary radius">' + showButtonText + '</button>';
    answerSection += '</div>';

    answerSection += '<div class="answers-content" aria-hidden="true" style="display: none;">';
    answerSection += '<h2 class="title">' + headingText + '</h2>';
    answerSection += answerList;
    answerSection += '</div>';

    answerSection += '</div>';

    var $answerSection = jQuery(answerSection);
    var $showButton = jQuery('button.show-answers', $answerSection);
    var $content = jQuery('.answers-content', $answerSection);

    $showButton.on('click', function () {
      $content.show().attr('aria-hidden', 'false');
      $showButton.hide().attr('aria-hidden', 'true');
    });

    $problemset.append($answerSection);
  }

  /**
   * Callback fired on window resize (not allowed to use library).
   *
   * @param {Boolean} forceChange Whether to force a breakpoint change. Used to set initial state.
   */
  function resize(forceChange) {
    // Get the currently matched media queries.
    matchedBreakpoints = util.breakpoint(appConfig.get().mediaqueries);

    if (util.indexOf(matchedBreakpoints, LARGE) > -1) {
      breakpoint = LARGE;
    }
    else if (util.indexOf(matchedBreakpoints, MEDIUM) > -1) {
      breakpoint = MEDIUM;
    }
    else {
      breakpoint = undefined;
    }

    var state = (breakpoint === MEDIUM || breakpoint === LARGE);

    if (forceChange || flags.showTOC !== state) {
      flags.showTOC = state;

      if (tocElm) {
        if (state) {
          util.prepend(bodyElm, tocElm);
          util.addClass(bodyElm, 'has-toc');
        }
        else {
          util.remove(tocElm);
          util.removeClass(bodyElm, 'has-toc');
        }
      }
    }

    updateSticky();
  }

  /**
   * Updates visibility of the sticky nav bar based on breakpoint and window scroll position.
   */
  function updateSticky() {
    if (!$toc) {
      return;
    }

    if (breakpoint === MEDIUM && $window.scrollTop() > $toc.offset().top + $toc.outerHeight()) {
      showSticky();
    }
    else {
      hideSticky();
    }
  }

  /**
   * Shows the sticky nav bar.
   */
  function showSticky() {
    if (!flags.stickyUpdate || flags.stickyVisible) {
      return;
    }

    flags.stickyVisible = true;
    $body.addClass(stickyBodyClass);

    var stickyHeight = $sticky.outerHeight();

    $sticky
      .stop()
      .css('top', -stickyHeight)
      .animate({
        top: 0
      }, {
        duration: 100
      });
  }

  /**
   * Hides the sticky nav bar.
   */
  function hideSticky() {
    if (!flags.stickyUpdate || !flags.stickyVisible) {
      return;
    }

    var stickyHeight = $sticky.outerHeight();

    $toc
      .stop()
      .animate({
        'padding-top': stickyHeight
      }, {
        duration: 100
      });

    $sticky
      .stop()
      .animate({
        top: -stickyHeight
      }, {
        duration: 100,
        complete: function () {
          flags.stickyVisible = false;
          $body.removeClass(stickyBodyClass);
          $toc.stop().css('padding-top', 0);
        }
      });
  }

  var appConfig = new AppConfig();

  window.app = new App();
  window.appConfig = appConfig;

})(window, document, window.util);
