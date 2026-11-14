(function () {
  'use strict';
  var sequence = 0, apiPromise = null;
  function loadApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise(function (resolve, reject) {
      var previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (typeof previous === 'function') { try { previous(); } catch (_) {} }
        resolve(window.YT);
      };
      var existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existing) {
        var script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.onerror = function () { reject(new Error('YouTube player could not be loaded.')); };
        document.head.appendChild(script);
      }
      setTimeout(function () { if (!(window.YT && window.YT.Player)) reject(new Error('YouTube player timed out.')); }, 15000);
    });
    return apiPromise;
  }
  function safeText(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function cardHtml(video) {
    var id = 'px-yt-' + (++sequence), videoId = safeText(video.id);
    var meta = [video.channel, video.views ? video.views + ' views' : '', video.length, video.published].filter(Boolean).join(' · ');
    return '<article class="spot-card"><div class="px-yt-shell" data-video-id="' + videoId + '">' +
      '<div class="px-yt-stage"><div class="px-yt-host" id="' + id + '"></div></div>' +
      '<div class="px-yt-meta"><div class="px-yt-meta-main"><b>' + safeText(video.title || 'YouTube video') + '</b><span>' + safeText(meta) + '</span></div>' +
      '<a href="https://www.youtube.com/watch?v=' + encodeURIComponent(video.id) + '" target="_blank" rel="noopener noreferrer">Open on YouTube <span aria-hidden="true">↗</span></a></div></div></article>';
  }
  function setup(shell, YT) {
    if (shell.dataset.pxPlayerReady === '1') return;
    var host = shell.querySelector('.px-yt-host'), videoId = shell.getAttribute('data-video-id');
    if (!host || !videoId) return;
    shell.dataset.pxPlayerReady = '1';
    new YT.Player(host, {
      videoId: videoId,
      playerVars: { controls: 1, rel: 0, playsinline: 1, enablejsapi: 1, modestbranding: 1, iv_load_policy: 3, origin: location.origin },
      events: {
        onReady: function (event) {
          var frame = event && event.target && event.target.getIframe ? event.target.getIframe() : null;
          if (frame) frame.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope');
        },
        onError: function () {
          var stage = shell.querySelector('.px-yt-stage');
          if (stage) stage.insertAdjacentHTML('beforeend', '<div class="px-yt-fallback">This video cannot be played here. Please open it on YouTube.</div>');
        }
      }
    });
  }
  function mount(root) {
    if (!root) return;
    var shells = Array.prototype.slice.call(root.querySelectorAll('.px-yt-shell:not([data-px-player-ready="1"])'));
    if (!shells.length) return;
    loadApi().then(function (YT) { shells.forEach(function (shell) { setup(shell, YT); }); }).catch(function () {
      shells.forEach(function (shell) {
        var stage = shell.querySelector('.px-yt-stage');
        if (stage) stage.innerHTML = '<div class="px-yt-fallback">YouTube playback is temporarily unavailable. Use the Open on YouTube link below.</div>';
      });
    });
  }
  window.PelexYouTubePlayer = { cardHtml: cardHtml, mount: mount };
})();