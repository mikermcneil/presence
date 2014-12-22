angular.module('negotiateKeyboardEvent', []);

angular.module('negotiateKeyboardEvent')
.factory('negotiateKeyboardEvent', [function() {


  /**
   * negotiateKeyboardEvent
   *
   * @class        {angular.factory}
   * @module       negotiateKeyboardEventession
   * @type         {Function}
   * @description
   *               Given a keyboard event object, return a human-readable
   *               string indicating which (of a number of different known
   *               special keys) key was pressed.
   *               Returns `undefined` if no special keys were matched.
   *
   * @param  {Event} e
   * @param  {Object} handlers
   */

  return function negotiateKeyboardEvent(e, handlers) {

    var fn;

    // console.log(e.which);

    // `.`
    if (e.which === 190) {
      fn = handlers['.'];
    }

    // • `<DELETE>`
    else if (e.which === 8) {
      fn = handlers['<DELETE>'];
    }

    // • `:`
    else if (e.which === 186 && e.shiftKey) {
      fn = handlers[':'];
    }

    // • `}`
    else if (e.which === 221 && e.shiftKey) {
      fn = handlers['}'];
    }

    // • `{`
    else if (e.which === 219 && e.shiftKey) {
      fn = handlers['{'];
    }

    // • `,`
    else if (e.which === 188) {
      fn = handlers[','];
    }

    // • `]`
    else if (e.which === 221 && !e.shiftKey) {
      fn = handlers[']'];
    }

    // • `[`
    else if (e.which === 219 && !e.shiftKey) {
      fn = handlers['['];
    }

    // • `<RETURN>`
    else if (e.which === 13) {
      fn = handlers['<RETURN>'];
    }


    // • `<LEFT_ARROW>`
    else if (e.which === 37) {
      // • `<CMD>+<LEFT_ARROW>`
      if (e.metaKey || e.ctrlKey) {
        fn = handlers['<CMD>+<LEFT_ARROW>'];
      }
      fn = fn || handlers['<LEFT_ARROW>'];
    }

    // • `<UP_ARROW>`
    else if (e.which === 38) {
      // • `<ALT>+<UP_ARROW>`
      if (e.alt) {
        fn = handlers['<ALT>+<UP_ARROW>'];
      }
      fn = fn || handlers['<UP_ARROW>'];
    }

    // • `<RIGHT_ARROW>`
    else if (e.which === 39) {
      // • `<CMD>+<RIGHT_ARROW>`
      if (e.metaKey || e.ctrlKey) {
        fn = handlers['<CMD>+<RIGHT_ARROW>'];
      }
      fn = fn || handlers['<RIGHT_ARROW>'];
    }

    // • `<DOWN_ARROW>`
    else if (e.which === 40) {
      // • `<ALT>+<DOWN_ARROW>`
      if (e.alt) {
        fn = handlers['<ALT>+<DOWN_ARROW>'];
      }
      fn = fn || handlers['<DOWN_ARROW>'];
    }

    else if (String.fromCharCode(e.which) == 'P' && e.ctrlKey) {
      fn = handlers['<CTRL>+P'];
    }

    // Key groups:
    // (these are matched against after everything else above)
    //////////////////////////////////////////////////////////////////////

    // numeric: 48-57
    if (e.which >= 48 && e.which <= 57) {
      fn = fn || handlers['numeric'];
      fn = fn || handlers['alphanumeric'];
    }

    // alpha: 65-90
    if (e.which >= 65 && e.which <= 90) {
      fn = fn || handlers['alpha'];
      fn = fn || handlers['alphanumeric'];
    }

    // If nothing else matches, use "default" handler, if one was provided
    fn = fn || handlers['default'];

    // Call the handler fn (if one was matched)
    if (fn) {
      fn();
    }
  };

}]);

