/* PELEX CAPTCHA ADD-ON
   Loaded before the main app script. CAPTCHA-only; no layout or app settings are changed. */
(function (w, d) {
  'use strict';
  if (w.__pelexCaptchaAddonV1) return;
  w.__pelexCaptchaAddonV1 = true;
  w.TURNSTILE_SITE_KEY = w.PELEX_TURNSTILE_SITE_KEY || '0x4AAAAAAGA6RNkmdtmRIejC';
  w.capTok = '';
  w.capId = null;
  w.capBusy = false;
  var loaderPromise = null;
  function capDiag(scope, stage, detail) {
    try { console.warn('[Pelex CAPTCHA]', scope, stage, detail || ''); } catch (e) {}
  }
  w.capDiag = capDiag;
  function capOn() {
    var key = String(w.TURNSTILE_SITE_KEY || '');
    return !!key && key.indexOf('PASTE_') !== 0;
  }
  w.capOn = capOn;
  function tsReady() {
    if (w.turnstile) return Promise.resolve(w.turnstile);
    if (loaderPromise) return loaderPromise;
    loaderPromise = new Promise(function (resolve, reject) {
      var script = Array.prototype.slice.call(d.querySelectorAll('script[src*="turnstile/v0/api.js"]'))
        .filter(function (node) { return node.getAttribute('data-pelex-failed') !== '1'; })[0] || null;
      var createdHere = !script, settled = false, poll = null, timeout = null;
      function finish(error) {
        if (settled) return;
        settled = true;
        if (poll) clearInterval(poll);
        if (timeout) clearTimeout(timeout);
        if (error) {
          if (script) script.setAttribute('data-pelex-failed', '1');
          if (createdHere && script && script.parentNode) script.parentNode.removeChild(script);
          loaderPromise = null;
          reject(error);
        } else resolve(w.turnstile);
      }
      function check() { if (w.turnstile) finish(null); }
      if (!script) {
        script = d.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.setAttribute('data-pelex-captcha-owned', '1');
      }
      script.addEventListener('load', check);
      script.addEventListener('error', function () {
        capDiag('loader', 'script_error', 'SCRIPT_LOAD_FAILED');
        finish(new Error('Could not load the human check. Check your connection and try again. (SCRIPT_LOAD_FAILED)'));
      });
      poll = setInterval(check, 100);
      timeout = setTimeout(function () {
        capDiag('loader', 'timeout', 'SCRIPT_LOAD_TIMEOUT');
        finish(new Error('Could not load the human check. Check your connection and try again. (SCRIPT_LOAD_TIMEOUT)'));
      }, 20000);
      if (createdHere) (d.head || d.documentElement).appendChild(script);
      check();
    });
    return loaderPromise;
  }
  w.tsReady = tsReady;
  function ensureGuestBox() {
    var box = d.getElementById('guestCap');
    if (!box) {
      box = d.createElement('div');
      box.id = 'guestCap';
      (d.body || d.documentElement).appendChild(box);
    }
    box.hidden = false;
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Human verification');
    box.style.cssText = 'position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom, 0px));transform:translateX(-50%);z-index:2147483000;max-width:calc(100vw - 16px);display:block';
    return box;
  }
  function guestHumanToken() {
    if (!capOn()) return Promise.reject(new Error('The human check is not configured. Please contact Pelex support.'));
    return tsReady().then(function () {
      return new Promise(function (resolve, reject) {
        var box = ensureGuestBox();
        box.innerHTML = '';
        var settled = false, widgetId = null, timer = null;
        var message = 'Could not confirm you are human. Please try again.';
        function finish(error, value) {
          if (settled) return;
          settled = true;
          if (timer) clearTimeout(timer);
          try { if (widgetId !== null && w.turnstile) w.turnstile.remove(widgetId); } catch (e) {}
          box.innerHTML = '';
          box.hidden = true;
          box.style.display = 'none';
          if (error) reject(error); else resolve(value);
        }
        timer = setTimeout(function () {
          capDiag('guest', 'timeout', 'CHALLENGE_TIMEOUT');
          finish(new Error(message + ' (CHALLENGE_TIMEOUT)'));
        }, 90000);
        try {
          widgetId = w.turnstile.render(box, {
            sitekey: w.TURNSTILE_SITE_KEY,
            appearance: 'always',
            theme: 'auto',
            size: 'flexible',
            callback: function (token) {
              capDiag('guest', 'challenge_complete', 'token_received');
              finish(null, token);
            },
            'expired-callback': function () {
              capDiag('guest', 'expired', 'TOKEN_EXPIRED');
              try {
                if (widgetId !== null) w.turnstile.reset(widgetId);
                else finish(new Error(message + ' (TOKEN_EXPIRED)'));
              } catch (e) { finish(new Error(message + ' (TOKEN_EXPIRED)')); }
            },
            'error-callback': function (code) {
              var errorCode = String(code || 'UNKNOWN');
              capDiag('guest', 'challenge_error', errorCode);
              finish(new Error(message + ' (Turnstile ' + errorCode + ')'));
            }
          });
        } catch (e) {
          capDiag('guest', 'render_exception', 'WIDGET_RENDER_FAILED');
          finish(new Error(message + ' (WIDGET_RENDER_FAILED)'));
        }
      });
    });
  }
  w.guestHumanToken = guestHumanToken;
  function capLoad() {
    if (!capOn() || w.capId !== null || w.capBusy) return;
    w.capBusy = true;
    w.capTok = '';
    tsReady().then(function () {
      var box = d.getElementById('authCaptcha');
      if (!box) throw new Error('The human-check area is unavailable. Please reload and try again.');
      box.style.minHeight = '65px';
      box.innerHTML = '';
      var id = w.turnstile.render(box, {
        sitekey: w.TURNSTILE_SITE_KEY,
        theme: 'auto',
        appearance: 'always',
        size: 'flexible',
        callback: function (token) {
          w.capTok = token;
          w.capBusy = false;
          capDiag('auth', 'challenge_complete', 'token_received');
        },
        'expired-callback': function () {
          w.capTok = '';
          capDiag('auth', 'expired', 'TOKEN_EXPIRED');
          try {
            if (w.capId !== null) w.turnstile.reset(w.capId);
          } catch (e) {
            var oldId = w.capId;
            w.capId = null;
            w.capBusy = false;
            try { if (oldId !== null) w.turnstile.remove(oldId); } catch (ignored) {}
            setTimeout(capLoad, 0);
          }
        },
        'error-callback': function (code) {
          var errorCode = String(code || 'UNKNOWN');
          w.capTok = '';
          capDiag('auth', 'challenge_error', errorCode);
          var failedId = w.capId;
          w.capId = null;
          w.capBusy = false;
          try { if (failedId !== null) w.turnstile.remove(failedId); } catch (e) {}
          box.innerHTML = '';
          if (typeof w.authMsg === 'function') {
            w.authMsg('The security check could not complete. Please try again. (Turnstile ' + errorCode + ')', true);
          }
        }
      });
      w.capId = id;
      w.capBusy = false;
    }).catch(function (error) {
      w.capBusy = false;
      w.capTok = '';
      w.capId = null;
      capDiag('auth', 'load_failed', 'WIDGET_LOAD_FAILED');
      if (typeof w.authMsg === 'function') {
        w.authMsg(error && error.message ? error.message : 'Could not load the human check. Check your connection and try again.', true);
      }
    });
  }
  w.capLoad = capLoad;
  function capOpts(options) {
    var result = options || {};
    if (capOn() && w.capTok) result.captchaToken = w.capTok;
    return result;
  }
  w.capOpts = capOpts;
  function capReset() {
    w.capTok = '';
    try {
      if (w.capId !== null && w.turnstile) w.turnstile.reset(w.capId);
    } catch (e) {
      var oldId = w.capId;
      w.capId = null;
      w.capBusy = false;
      try { if (oldId !== null && w.turnstile) w.turnstile.remove(oldId); } catch (ignored) {}
    }
  }
  w.capReset = capReset;
})(window, document);
