// ==UserScript==
// @name        YT2Invidio
// @namespace   de.izzysoft
// @author      Izzy + ltGuillaume
// @description Point YouTube links to Invidious, Twitter to Nitter, Instagram to Bibliogram, Reddit to Teddit, Imgur to Imgin, Medium to Scribe. Use alt+click to open original links, or alt+o in the instances to open the the original site.
// @license     CC BY-NC-SA
// @include     *
// @version     2.5.0
// @run-at      document-idle
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.registerMenuCommand
// @grant       GM.openInTab
// @grant       unsafeWindow
// @homepageURL https://codeberg.org/ltGuillaume/yt2invidio
// @downloadURL https://codeberg.org/ltGuillaume/yt2invidio/raw/master/yt2invidio.user.js
// ==/UserScript==

// Default config
const defaultConfig = {
  hosts: { invidious: 'yewtu.be', nitter: 'nitter.net', bibliogram: 'bibliogram.pussthecat.org', teddit: 'teddit.net', imgin: 'imgin.voidnet.tech', scribe: 'scribe.rip' },
  invProxy: 0,
  onHover: 0
};
const orgHosts = { invidious: 'youtu.be', nitter: 'twitter.com', bibliogram: 'instagram.com', teddit: 'old.reddit.com', imgin: 'imgur.com', scribe: 'medium.com' };
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
    'Invidious: '+ cfg.hosts.invidious +', invProxy: '+ cfg.invProxy
    +'\nNitter: '+ cfg.hosts.nitter
    +'\nBibliogram: '+ cfg.hosts.bibliogram
    +'\nTeddit: '+ cfg.hosts.teddit
    +'\nImgin: '+ cfg.hosts.imgin
    +'\nScribe: '+ cfg.hosts.scribe
    +'\nRewriting on '+ (cfg.onHover ? 'hover' : 'click')
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
      if (e.altKey) {
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
    }
  }
}

function rewriteLink(elem) {
  var before = elem.href;
  // Only rewrite if we're not on Invidious already (to keep the "Watch this on YouTube" links intact)
  if (cfg.hosts.invidious != '' && elem.href.match(/((www|m)\.)?youtube.com(\/(watch\?v|playlist\?list)=[a-z0-9_-]+)/i))
    elem.href='https://'+ cfg.hosts.invidious+RegExp.$3 +'&local='+ cfg.invProxy;
  else if (cfg.hosts.invidious != '' && elem.href.match(/((www|m)\.)?youtu.be\/([a-z0-9_-]+)/i))
    elem.href='https://'+ cfg.hosts.invidious +'/watch?v='+ RegExp.$3 +'?local='+ cfg.invProxy;
  else if (cfg.hosts.invidious != '' && elem.href.match(/((www|m)\.)?youtube.com(\/(c|channel)\/[a-z0-9_-]+)/i))
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
  else if (cfg.hosts.teddit != '' && elem.href.match(/((www|old)\.)?reddit.com\/(.*)/i) && elem.href.indexOf('/duplicates/') == -1)
    elem.href = 'https://'+ cfg.hosts.teddit +'/'+ RegExp.$3;

  // Imgin
  else if (cfg.hosts.imgin != '' && elem.href.match(/((www|i)\.)?imgur.com\/(.*)/i))
    elem.href = 'https://'+ cfg.hosts.imgin +'/'+ RegExp.$3;

  // Scribe
  else if (cfg.hosts.scribe != '' && elem.href.match(/((.*)\.)?medium.com\/(.*)/i))
    elem.href = 'https://'+ cfg.hosts.scribe +'/'+ RegExp.$3;

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
      if (src.match(/((www|m)\.)?youtube.com(\/(watch\?v|playlist\?list)=[a-z0-9_-]+)/i) || src.match(/((www|m)\.)?youtube.com(\/(c|channel|embed)\/[a-z0-9_-]+)/i)) {
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

function setInvidiousInstance() {
  setInstance('invidious');
}
function setNitterInstance() {
  setInstance('nitter');
}
function setBibliogramInstance() {
  setInstance('bibliogram');
}
function setTedditInstance() {
  setInstance('teddit');
}
function setImginInstance() {
  setInstance('imgin');
}
function setScribeInstance() {
  setInstance('scribe');
}

function setInstance(host) {
  GM.getValue('YT2IConfig', JSON.stringify(defaultConfig)).then(cfgs => {
    cfg = JSON.parse(cfgs);
    var vhost = prompt('Set '+ host +' instance to:', cfg.hosts[host]);
    if (vhost == '' || vhost.match(/^(https?)?:?[\/]*(.+?)$/)) {
      if (vhost == '')
        cfg.hosts[host] = '';
      else
        cfg.hosts[host] = RegExp.$2;
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
  GM.getValue('YT2IConfig', JSON.stringify(defaultConfig)).then(cfgs => {
    cfg = JSON.parse(cfgs);
    cfg[setting] ^= 1;
    console.log('Setting '+ setting + ' has been turned '+ (cfg[setting] ? 'ON' : 'OFF'));
    GM.setValue('YT2IConfig', JSON.stringify(cfg));
    return cfg[setting];
  });
}

// Open tab with instance list/info page
function openInvidiousList() {
  GM.openInTab('https://github.com/iv-org/documentation/blob/master/Invidious-Instances.md', { active: true, insert: true });
}
function openNitterList() {
  GM.openInTab('https://github.com/zedeus/nitter/wiki/Instances', { active: true, insert: true });
}
function openBibliogramList() {
  GM.openInTab('https://git.sr.ht/~cadence/bibliogram-docs/tree/master/docs/Instances.md', { active: true, insert: true });
}
function openTedditList() {
  GM.openInTab('https://codeberg.org/teddit/teddit#instances', { active: true, insert: true });
}
function openImginList() {
  GM.openInTab('https://git.voidnet.tech/kev/imgin', { active: true, insert: true });
}
function openScribeList() {
  GM.openInTab('https://git.sr.ht/~edwardloveall/scribe/tree/main/docs/instances.md', { active: true, insert: true });
}

GM.registerMenuCommand('Bibliogram: Set instance', setBibliogramInstance);
GM.registerMenuCommand('Bibliogram: Show known instances', openBibliogramList);
GM.registerMenuCommand('Imgin: Set instance', setImginInstance);
GM.registerMenuCommand('Imgin: Show known instances', openImginList);
GM.registerMenuCommand('Invidious: Set instance', setInvidiousInstance);
GM.registerMenuCommand('Invidious: Show known instances', openInvidiousList);
GM.registerMenuCommand('Invidious: Toggle proxy state', toggleInvidiousProxy);
GM.registerMenuCommand('Nitter: Set instance', setNitterInstance);
GM.registerMenuCommand('Nitter: Show known instances', openNitterList);
GM.registerMenuCommand('Scribe: Set instance', setScribeInstance);
GM.registerMenuCommand('Scribe: Show known instances', openScribeList);
GM.registerMenuCommand('Teddit: Set instance', setTedditInstance);
GM.registerMenuCommand('Teddit: Show known instances', openTedditList);
GM.registerMenuCommand('Toggle rewrite on hover', toggleRewriteOnHover);
