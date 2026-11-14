(function () {
  'use strict';
  var sequence = 0, apiPromise = null, timers = new WeakMap();

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
        var s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.async = true;
        s.onerror = function () { reject(new Error('YouTube player could not be loaded.')); };
        document.head.appendChild(s);
      }
      setTimeout(function () { if (!(window.YT && window.YT.Player)) reject(new Error('YouTube player timed out.')); }, 15000);
    });
    return apiPromise;
  }

  function timeLabel(value) {
    var n = Math.max(0, Math.floor(Number(value) || 0));
    var h = Math.floor(n / 3600), m = Math.floor((n % 3600) / 60), s = n % 60;
    return h ? h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') : m + ':' + String(s).padStart(2, '0');
  }
  function safeText(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function cardHtml(v) {
    var id = 'px-yt-' + (++sequence);
    var videoId = safeText(v.id);
    return '<article class="spot-card"><div class="px-yt-shell" data-video-id="' + videoId + '">' +
      '<div class="px-yt-stage"><div class="px-yt-host" id="' + id + '"></div>' +
      '<div class="px-yt-gesture px-yt-left" aria-label="Double tap to rewind 10 seconds"></div><div class="px-yt-gesture px-yt-right" aria-label="Double tap to skip forward 10 seconds"></div>' +
      '<div class="px-yt-toast" aria-live="polite"></div></div>' +
      '<div class="px-yt-controls"><div class="px-yt-main">' +
      '<button type="button" class="px-yt-play" aria-label="Play video">Play</button>' +
      '<button type="button" class="px-yt-back" aria-label="Back 10 seconds">−10</button>' +
      '<button type="button" class="px-yt-forward" aria-label="Forward 10 seconds">+10</button>' +
      '<span class="px-yt-current">0:00</span><input class="px-yt-range" type="range" min="0" max="1000" value="0" step="1" aria-label="Video position"><span class="px-yt-duration">0:00</span>' +
      '<select class="px-yt-speed" aria-label="Playback speed"><option value="1">1×</option></select>' +
      '<label class="px-yt-volume-label">Volume <input class="px-yt-volume" type="range" min="0" max="100" value="100" aria-label="Volume"></label>' +
      '<button type="button" class="px-yt-full" aria-label="Fullscreen">Full screen</button></div>' +
      '<div class="px-yt-note">Double-tap either side to skip 10 seconds</div></div></div>' +
      '<div class="spot-meta"><b>' + safeText(v.title) + '</b><span>' + safeText(v.channel) + ' · ' + safeText(v.views) + ' views · ' + safeText(v.length) + ' · ' + safeText(v.published) + '</span>' +
      '<a href="https://www.youtube.com/watch?v=' + encodeURIComponent(v.id) + '" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></div></article>';
  }

  function setup(shell, YT) {
    if (shell.dataset.pxPlayerReady === '1') return;
    var host = shell.querySelector('.px-yt-host'), videoId = shell.getAttribute('data-video-id');
    if (!host || !videoId) return;
    shell.dataset.pxPlayerReady = '1';
    var player, range = shell.querySelector('.px-yt-range'), current = shell.querySelector('.px-yt-current');
    var duration = shell.querySelector('.px-yt-duration'), play = shell.querySelector('.px-yt-play');
    var speed = shell.querySelector('.px-yt-speed'), volume = shell.querySelector('.px-yt-volume'), toast = shell.querySelector('.px-yt-toast');
    var lastTap = { left: 0, right: 0 }, toastTimer;
    function notify(text) {
      toast.textContent = text; toast.classList.add('is-visible');
      clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 850);
    }
    function seek(delta) {
      if (!player || typeof player.getCurrentTime !== 'function') return;
      var d = player.getDuration() || 0;
      player.seekTo(Math.max(0, Math.min(d, player.getCurrentTime() + delta)), true);
      notify((delta > 0 ? '+' : '') + delta + ' seconds');
    }
    function sync() {
      if (!player || typeof player.getDuration !== 'function') return;
      var d = player.getDuration() || 0, t = player.getCurrentTime() || 0;
      range.max = Math.max(1, Math.round(d * 10));
      if (!range.matches(':active')) range.value = Math.round(t * 10);
      current.textContent = timeLabel(t); duration.textContent = timeLabel(d);
      var state = player.getPlayerState();
      play.textContent = state === YT.PlayerState.PLAYING ? 'Pause' : 'Play';
      play.setAttribute('aria-label', state === YT.PlayerState.PLAYING ? 'Pause video' : 'Play video');
    }
    player = new YT.Player(host, {
      videoId: videoId,
      playerVars: { controls: 0, rel: 0, playsinline: 1, enablejsapi: 1, modestbranding: 1, origin: location.origin },
      events: {
        onReady: function () {
          try {
            var rates = player.getAvailablePlaybackRates() || [1];
            speed.innerHTML = rates.map(function (r) { return '<option value="' + r + '"' + (r === 1 ? ' selected' : '') + '>' + r + '×</option>'; }).join('');
          } catch (_) { speed.innerHTML = '<option value="1">1×</option>'; }
          sync();
          if (timers.has(shell)) clearInterval(timers.get(shell));
          timers.set(shell, setInterval(sync, 500));
        },
        onStateChange: sync,
        onError: function () { notify('This video cannot be played here.'); }
      }
    });
    play.addEventListener('click', function () {
      if (!player) return;
      if (player.getPlayerState() === YT.PlayerState.PLAYING) player.pauseVideo(); else player.playVideo();
    });
    shell.querySelector('.px-yt-back').addEventListener('click', function () { seek(-10); });
    shell.querySelector('.px-yt-forward').addEventListener('click', function () { seek(10); });
    range.addEventListener('input', function () { current.textContent = timeLabel(Number(range.value) / 10); });
    range.addEventListener('change', function () { if (player) player.seekTo(Number(range.value) / 10, true); });
    speed.addEventListener('change', function () { if (player) { try { player.setPlaybackRate(Number(speed.value)); } catch (_) {} } });
    volume.addEventListener('input', function () { if (player) { try { player.setVolume(Number(volume.value)); if (Number(volume.value) === 0) player.mute(); else player.unMute(); } catch (_) {} } });
    var fullButton = shell.querySelector('.px-yt-full'), fullStage = shell.querySelector('.px-yt-stage');
    if (!fullStage.requestFullscreen && !document.fullscreenEnabled) fullButton.hidden = true;
    fullButton.addEventListener('click', function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (fullStage.requestFullscreen) fullStage.requestFullscreen();
    });
    [['.px-yt-left', -10], ['.px-yt-right', 10]].forEach(function (item) {
      var zone = shell.querySelector(item[0]), side = item[0];
      zone.addEventListener('pointerup', function (event) {
        var now = Date.now();
        if (now - lastTap[side] < 320) { seek(item[1]); lastTap[side] = 0; }
        else lastTap[side] = now;
      });
    });
  }

  function mount(root) {
    if (!root) return;
    var shells = Array.prototype.slice.call(root.querySelectorAll('.px-yt-shell:not([data-px-player-ready="1"])'));
    if (!shells.length) return;
    loadApi().then(function (YT) { shells.forEach(function (shell) { setup(shell, YT); }); }).catch(function () {
      shells.forEach(function (shell) {
        var stage = shell.querySelector('.px-yt-stage');
        if (stage) stage.innerHTML = '<div class="px-yt-fallback">YouTube playback is temporarily unavailable. Use the Watch on YouTube link below.</div>';
      });
    });
  }
  window.PelexYouTubePlayer = { cardHtml: cardHtml, mount: mount };
})();