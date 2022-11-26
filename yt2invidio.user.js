// ==UserScript==
// @name        YT2Invidio
// @namespace   de.izzysoft
// @author      Izzy + ltGuillaume
// @description Point YouTube links to Invidious, Twitter to Nitter, Instagram to Bibliogram, Reddit to Teddit, Imgur to Rimgo, Medium to Scribe, TikTok to ProxiTok, Fandom to BreezeWiki, IMDb to libremdb. Use Ctrl+Alt+click to open in original service, or alt+o in the instances to open the the original site.
// @license     CC BY-NC-SA
// @include     *
// @version     2.9.4
// @run-at      document-idle
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.registerMenuCommand
// @grant       GM.openInTab
// @grant       unsafeWindow
// @homepageURL https://codeberg.org/ltGuillaume/yt2invidio
// @downloadURL https://codeberg.org/ltGuillaume/yt2invidio/raw/master/yt2invidio.user.js
// ==/UserScript==


// Constants
const instancesLists = {
  invidious:  'https://github.com/iv-org/documentation/blob/master/Invidious-Instances.md',
  nitter:     'https://github.com/zedeus/nitter/wiki/Instances',
  bibliogram: 'https://git.sr.ht/~cadence/bibliogram-docs/tree/master/docs/Instances.md',
  teddit:     'https://codeberg.org/teddit/teddit#instances',
  rimgo:      'https://codeberg.org/video-prize-ranch/rimgo#instances',
  scribe:     'https://git.sr.ht/~edwardloveall/scribe/tree/main/docs/instances.md',
  proxitok:   'https://github.com/pablouser1/ProxiTok',
  breezewiki: 'https://docs.breezewiki.com/Links.html#(part._.Instances)',
  libremdb:   'https://github.com/zyachel/libremdb#instances'
},

  orgHosts = { invidious: 'youtu.be', nitter: 'twitter.com', bibliogram: 'instagram.com', teddit: 'old.reddit.com', rimgo: 'imgur.com', scribe: 'medium.com', proxitok: 'tiktok.com', breezewiki: 'fandom.com', libremdb: 'imdb.com' };

// Default config
const defaultConfig = {
  hosts: { invidious: 'yewtu.be', nitter: 'nitter.net', bibliogram: 'farside.link/_/bibliogram', teddit: 'teddit.net', rimgo: 'rimgo.pussthecat.org', scribe: 'scribe.rip', proxitok: 'proxitok.pabloferreiro.es', breezewiki: 'breezewiki.pussthecat.org', libremdb: 'libremdb.pussthecat.org' },
  invProxy: 0,
  onHover: 0
};
var cfg;

GM.getValue('YT2IConfig', JSON.stringify(defaultConfig)).then(result => {
  init(result);
  rewriteEmbeddedLinks();
});

function init(config) {
  cfg = JSON.parse(config);
  for (i in defaultConfig.hosts)
    if (cfg.hosts[i] == undefined)
      cfg.hosts[i] = defaultConfig.hosts[i];
  cfg.invProxy = cfg.invProxy || defaultConfig.invProxy;
  cfg.onHover = cfg.onHover || defaultConfig.onHover;
  console.log(
    'Invidious:',     cfg.hosts.invidious,
    ', invProxy: ',   cfg.invProxy,
    '\nNitter:',      cfg.hosts.nitter,
    '\nBibliogram:',  cfg.hosts.bibliogram,
    '\nTeddit:',      cfg.hosts.teddit,
    '\nRimgo:',       cfg.hosts.rimgo,
    '\nScribe:',      cfg.hosts.scribe,
    '\nProxiTok:',    cfg.hosts.proxitok,
    '\nBreezeWiki:',  cfg.hosts.breezewiki,
    '\nlibremdb:',    cfg.hosts.libremdb,
    '\nRewriting on', cfg.onHover ? 'hover' : 'click'
  );

  if (cfg.onHover)
    document.addEventListener('mouseover', triggerRewrite, true);
  else
    document.removeEventListener('mouseover', triggerRewrite, true);
  document.addEventListener('click', triggerRewrite, true);
  document.addEventListener('auxclick', triggerRewrite, true);
  document.addEventListener('keypress', openOriginalHost);
}

function triggerRewrite(e) {
  if (e.button == 2) return; // Right-click
  for (var link of document.links)
    if (link == e.target || link.contains(e.target)) {
      if (e.altKey && e.ctrlKey) {
        if (link.hreflang.indexOf('https://') == 0) {
          link.href = link.hreflang;
          link.hreflang = '';
          console.log('Restored link to '+ link.href);
        }
      } else
        rewriteLink(link);
    }
}

function openOriginalHost(e) {
  if (e.altKey && e.key == 'o') {
    for (i in cfg.hosts) {
      var host = cfg.hosts[i];
      if (host.length && location.href.indexOf('https://'+ host) == 0)
        return location.assign(location.href.replace(host, orgHosts[i]));
      if (location.href.indexOf('https://'+ i) == 0)
        return location.assign(location.href.replace(location.origin, 'https://'+ orgHosts[i]));
    }
  }
}

function rewriteLink(elem) {
  var before = elem.href;
  // Only rewrite if we're not on Invidious already (to keep the "Watch this on YouTube" links intact)
  if (cfg.hosts.invidious != '' && elem.href.match(/((www|m)\.)?youtube(?:-nocookie)?\.com(\/(watch\?v|playlist\?list)=[a-z0-9_-]+)/i))
    elem.href='https://'+ cfg.hosts.invidious+RegExp.$3 +'&local='+ cfg.invProxy;
  else if (cfg.hosts.invidious != '' && elem.href.match(/((www|m)\.)?youtu\.be\/([a-z0-9_-]+)/i))
    elem.href='https://'+ cfg.hosts.invidious +'/watch?v='+ RegExp.$3 +'?local='+ cfg.invProxy;
  else if (cfg.hosts.invidious != '' && elem.href.match(/((www|m)\.)?youtube(?:-nocookie)?\.com(\/(c|channel)\/[a-z0-9_-]+)/i))
    elem.href='https://'+ cfg.hosts.invidious+RegExp.$3 +'?local='+ cfg.invProxy;

  // Nitter
  else if (cfg.hosts.nitter != '' && elem.href.match(/(mobile\.)?twitter\.com\/([^&#]+)/i))
    elem.href='https://'+ cfg.hosts.nitter +'/'+ RegExp.$2;

  // Bibliogram
  else if (cfg.hosts.bibliogram != '' && elem.href.match(/(www\.)?instagram\.com\/(p|tv)\/([^&#/]+)/i))  // Profile
    elem.href = 'https://'+ cfg.hosts.bibliogram +'/p/' + RegExp.$3;
  else if (cfg.hosts.bibliogram != '' && elem.href.match(/(www\.)?instagram\.com\/([^&#/]+)/i))  // Image or video
    elem.href = 'https://'+ cfg.hosts.bibliogram +'/u/' + RegExp.$2;

  // Teddit
  else if (cfg.hosts.teddit != '' && !elem.href.match(/\/(duplicates\/|submit\?selftext|submit$|create$)/i) && elem.href.match(/(www\.|old\.)?reddit\.com(?!\/message|\/chat|\/prefs|\/gold)(.*)/i))
    elem.href = 'https://'+ cfg.hosts.teddit + RegExp.$2 + RegExp.$3;

  // Rimgo
  else if (cfg.hosts.rimgo != '' && elem.href.match(/((www|i)\.)?imgur\.com\/(.*)/i))
    elem.href = 'https://'+ cfg.hosts.rimgo +'/'+ RegExp.$3;

  // Scribe
  else if (cfg.hosts.scribe != '' && elem.href.match(/(.*\.)?medium\.com\/(.*)/i))
    elem.href = 'https://'+ cfg.hosts.scribe +'/'+ RegExp.$2;

  // ProxiTok
  else if (cfg.hosts.tiktok != '' && elem.href.match(/:\/\/(?:.*)?\.tiktok\.com\/(.*)/i))
    elem.href = 'https://'+ cfg.hosts.proxitok +'/'+ RegExp.$1;

  // BreezeWiki
  else if (cfg.hosts.breezewiki != '' && elem.href.match(/:\/\/(.*)?\.fandom\.com\/(.*)/i))
    elem.href = 'https://'+ cfg.hosts.breezewiki +'/'+ RegExp.$1 +'/'+ RegExp.$2;

  // libremdb
  else if (cfg.hosts.libremdb != '' && elem.href.match(/:\/\/(?:.*)?\.imdb\.com\/(title\/.*)/i))
    elem.href = 'https://'+ cfg.hosts.libremdb +'/'+ RegExp.$1;

  if (elem.href != before) {
    elem.hreflang = before;
    console.log('Rewrote link to '+ elem.href);
  }
}

function rewriteEmbeddedLinks() {
  // Based on https://greasyfork.org/en/scripts/394841-youtube-to-invidio-us-embed
  if (cfg.hosts.invidious != '')  {
    var src, dataSrc, iframes = document.getElementsByTagName('iframe'), embProxy, count = 0;
    for (var i = 0; i < iframes.length; i++) {
      src = iframes[i].getAttribute('src');
      dataSrc = false;
      if (src == null) {
        src = iframes[i].getAttribute('data-s9e-mediaembed-src');
        dataSrc = true;
      }
      if (src == null) continue;
      if (src.match(/((www|m)\.)?youtube(?:-nocookie)?\.com(\/(watch\?v|playlist\?list)=[a-z0-9_-]+)/i) || src.match(/((www|m)\.)?youtube(?:-nocookie)?\.com(\/(c|channel|embed)\/[a-z0-9_-]+)/i)) {
        if (RegExp.$4 == 'channel' || RegExp.$4 == 'embed')
          embProxy = '?local='+ cfg.invProxy;
        else
          embProxy = '&local='+ cfg.invProxy;
        if (dataSrc)
          iframes[i].setAttribute('data-s9e-mediaembed-src', 'https://'+ cfg.hosts.invidious+RegExp.$3 + embProxy +'&autoplay=0');
        else
          iframes[i].setAttribute('src', 'https://'+ cfg.hosts.invidious+RegExp.$3 + embProxy +'&autoplay=0');
//      iframes[i].setAttribute('style', 'min-height:100%; min-width:100%;');
        iframes[i].setAttribute('frameborder', '0');
        iframes[i].setAttribute('allowfullscreen', '1');
        count++;
      }
    }
  }
  console.log('Rewrote '+ count +' of '+ iframes.length +' embedded links in '+ document.URL);
}

function setInstance(service) {
  GM.getValue('YT2IConfig', JSON.stringify(defaultConfig)).then(cfgs => {
    cfg = JSON.parse(cfgs);
    var vhost = prompt('Set '+ service +' instance to... (clear to disable rewrites)', cfg.hosts[service]);
    if (vhost == '' || vhost.match(/^(https?)?:?[\/]*(.+?)$/)) {
      if (vhost == '')
        cfg.hosts[service] = '';
      else
        cfg.hosts[service] = RegExp.$2;
      init(JSON.stringify(cfg));
      GM.setValue('YT2IConfig', JSON.stringify(cfg));
    }
  });
}

function toggleRewriteOnHover() {
  toggle('onHover').then(result => {
    alert('Rewriting on '+ (result ? 'hover' : 'click'));
  });
}
function toggleInvidiousProxy() {
  toggle('invProxy').then(result => {
    alert('Proxy videos is '+ (result ? 'enabled' : 'disabled'));
  });
}

function toggle(setting) {
  return new Promise(function(resolve) {
    GM.getValue('YT2IConfig', JSON.stringify(defaultConfig)).then(cfgs => {
      cfg = JSON.parse(cfgs);
      cfg[setting] ^= 1;
      console.log('Setting '+ setting + ' has been turned '+ (cfg[setting] ? 'ON' : 'OFF'));
      GM.setValue('YT2IConfig', JSON.stringify(cfg));
      resolve(cfg[setting]);
    });
  });
}

// Open tab with instances list
function openInstancesList(service) {
  GM.openInTab(instancesLists[service], { active: true, insert: true });
}

GM.registerMenuCommand('Working instances',    () => GM.openInTab('https://farside.link'));
GM.registerMenuCommand('Bibliogram instance',      () => setInstance('bibliogram'));
//GM.registerMenuCommand('Bibliogram instance list', () => openInstancesList('bibliogram'));
GM.registerMenuCommand('BreezeWiki instance',      () => setInstance('breezewiki'));
//GM.registerMenuCommand('BreezeWiki instance list', () => openInstancesList('breezewiki'));
GM.registerMenuCommand('Rimgo instance',           () => setInstance('rimgo'));
//GM.registerMenuCommand('Rimgo instance list',      () => openInstancesList('rimgo'));
GM.registerMenuCommand('Invidious instance',       () => setInstance('invidious'));
//GM.registerMenuCommand('Invidious instance list',  () => openInstancesList('invidious'));
GM.registerMenuCommand('Toggle Invidious proxy',   toggleInvidiousProxy);
GM.registerMenuCommand('libremdb instance',      () => setInstance('libremdb'));
//GM.registerMenuCommand('libremdb instance list', () => openInstancesList('libremdb'));
GM.registerMenuCommand('Nitter instance',          () => setInstance('nitter'));
//GM.registerMenuCommand('Nitter instance list',     () => openInstancesList('nitter'));
GM.registerMenuCommand('Scribe instance',          () => setInstance('scribe'));
//GM.registerMenuCommand('Scribe instance list',     () => openInstancesList('scribe'));
GM.registerMenuCommand('ProxiTok instance',          () => setInstance('proxitok'));
//GM.registerMenuCommand('ProxiTok instance list',     () => openInstancesList('proxitok'));
GM.registerMenuCommand('Teddit instance',          () => setInstance('teddit'));
//GM.registerMenuCommand('Teddit instance list',     () => openInstancesList('teddit'));
GM.registerMenuCommand('Toggle rewrite on hover',  toggleRewriteOnHover);
