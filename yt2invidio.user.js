// ==UserScript==
// @name        YT2Invidio
// @namespace   de.izzysoft
// @author      Izzy
// @description Point YouTube links to Invidious, Twitter to Nitter, Instagram to Bibliogram, Reddit to Teddit. Use alt+click to open original links.
// @license     CC BY-NC-SA
// @include     *
// @version     2.1.1
// @run-at      document-idle
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @grant       GM_openInTab
// @grant       GM.openInTab
// @grant       unsafeWindow
// @homepageURL https://codeberg.org/izzy/userscripts
// @downloadURL https://codeberg.org/izzy/userscripts/raw/branch/master/yt2invidio.user.js
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// ==/UserScript==

var cfg, videohost, nitterhost, bibliogramhost, teddithost, invProxy, onHover, skipClick;

// Default Config
const defaultConfig = {
  hosts: {invidious: "invidious.snopyta.org", nitter: "nitter.net", bibliogram: "bibliogram.art", teddit: "teddit.net"},
  invProxy: 0,
  onHover: 0
};
/*
console.log(defaultConfig.hosts);
console.log(obj.hosts.hasOwnProperty('bibliogram')); // true
*/

GM.getValue('YT2IConfig',JSON.stringify(defaultConfig)).then(function(result) {
  init(result);
  rewriteEmbeddedLinks();
});

function init(config) {
  console.log(`Using '${config}' for rewrite`);
  var cfg = JSON.parse(config);
  videohost = cfg.hosts.invidious;
  nitterhost = cfg.hosts.nitter;
  bibliogramhost = cfg.hosts.bibliogram;
  teddithost = cfg.hosts.teddit;
  invProxy = 'local='+ (cfg.invProxy || defaultConfig.invProxy);
  onHover = cfg.onHover || defaultConfig.onHover;
  console.log('Invidious: '+videohost+', Params: '+invProxy);
  console.log('Nitter: '+nitterhost);
  console.log('Bibliogram: '+bibliogramhost);
  console.log('Teddit: '+teddithost);
  console.log('Rewriting on '+ (onHover ? 'hover' : 'click'));

  if (onHover)
    document.addEventListener('mouseover', triggerRewrite);
  else
    document.removeEventListener('mouseover', triggerRewrite);
  document.addEventListener('click', triggerRewrite);
}

function triggerRewrite(e) {
  if (skipClick && e.type == 'click') return skipClick = 0;

  for (link of document.links)
    if (link == e.target || link.contains(e.target)) {
      if (e.altKey) {
        if (e.type != 'click') return;
        e.preventDefault();
        if (link.hreflang.indexOf('https://') == 0)
          link.href = link.hreflang;
        skipClick = 1;
        link.click();
      } else
        rewriteLink(link);
    }
}
// Do the actual rewrite
function rewriteLink(elem) {
  var before = elem.href;
  // --=[ document links ]=--
    // Youtube: https://www.youtube.com/watch?v=cRRA2xRRgl8 || https://www.youtube.com/channel/dfqwfhqQ34er || https://www.youtube.com/playlist?list=PLjV3HijScGMynGvjJrvNNd5Q9pPy255dL
    // only rewrite if we're not on Invidious already (too keep the "watch this on YouTube" links intact)
    if (videohost != '' && elem.href.match(/((www|m)\.)?youtube.com(\/(watch\?v|playlist\?list)=[a-z0-9_-]+)/i)) {
      elem.href='https://'+videohost+RegExp.$3+'&'+invProxy;
    } else if (videohost != '' && elem.href.match(/((www|m)\.)?youtu.be\/([a-z0-9_-]+)/i)) {
      elem.href='https://'+videohost+'/watch?v='+RegExp.$3+'?'+invProxy;
    } else if (videohost != '' && elem.href.match(/((www|m)\.)?youtube.com(\/channel\/[a-z0-9_-]+)/i)) {
      elem.href='https://'+videohost+RegExp.$3+'?'+invProxy;

    // Twitter
    } else if (nitterhost != '' && elem.href.match(/(mobile\.)?twitter\.com\/([^&#]+)/i)) {
      elem.href='https://'+nitterhost+'/'+RegExp.$2;
    }

    // Bibliogram
    else if (bibliogramhost != '' && elem.href.match(/(www\.)?instagram\.com\/(p|tv)\/([^&#/]+)/i)) { // profile
      elem.href = 'https://'+bibliogramhost+'/p/' + RegExp.$3;
    } else if (bibliogramhost != '' && elem.href.match(/(www\.)?instagram\.com\/([^&#/]+)/i)) { // image or video
      elem.href = 'https://'+bibliogramhost+'/u/' + RegExp.$2;
    }

    // Teddit
    else if (teddithost != '' && elem.href.match(/((www|old)\.)?reddit.com\/(.*)/i)) {
      elem.href = 'https://'+teddithost+'/'+RegExp.$3;
    }

    if (elem.href != before) {
      elem.hreflang = before;
      console.log('Rewrote link to '+ elem.href);
    }
}

function rewriteEmbeddedLinks() {
  // --=[ embedded links ]=--
  // based on https://greasyfork.org/en/scripts/394841-youtube-to-invidio-us-embed
  if (videohost != '')  {
    var src, dataSrc, iframes = document.getElementsByTagName('iframe');
    var embProxy
    console.log('Checking '+iframes.length+' frames for embedded videos');
    for (var i = 0; i < iframes.length; i++) {
      src = iframes[i].getAttribute('src');
      dataSrc = false;
      if ( src == null ) { src = iframes[i].getAttribute('data-s9e-mediaembed-src'); dataSrc = true; }
      if ( src == null ) continue;
      if ( src.match(/((www|m)\.)?youtube.com(\/(watch\?v|playlist\?list)=[a-z0-9_-]+)/i) || src.match(/((www|m)\.)?youtube.com(\/(channel|embed)\/[a-z0-9_-]+)/i) ) {
        if ( RegExp.$4 == 'channel' || RegExp.$4 == 'embed' ) { embProxy = '?'+invProxy; }
        else { embProxy = '&'+invProxy; }
        if ( dataSrc ) {
          iframes[i].setAttribute('data-s9e-mediaembed-src','https://'+videohost+RegExp.$3+embProxy);
        } else {
          iframes[i].setAttribute('src','https://'+videohost+RegExp.$3+embProxy);
        }
//      iframes[i].setAttribute('style', 'min-height:100%; min-width:100%;');
        iframes[i].setAttribute('frameborder', '0');
        iframes[i].setAttribute('allowfullscreen', '1');
      }
    }
  }

  console.log('Rewrite for embedded links done.');
}


// Give the user the possibility to set a different preferred instance
// A list of available instances can be found at
// https://github.com/omarroth/invidious/wiki/Invidious-Instances
// https://github.com/zedeus/nitter/wiki/Instances
// https://github.com/cloudrac3r/bibliogram/wiki/Instances
async function toggleRewriteOnHover() {
  let cfgs = await GM.getValue('YT2IConfig',JSON.stringify(defaultConfig));
  cfg = JSON.parse(cfgs);
  cfg.onHover ^= 1;
  alert('Rewriting on '+ (cfg.onHover ? 'hover' : 'click'));
  init(JSON.stringify(cfg));
  GM.setValue('YT2IConfig',JSON.stringify(cfg));
}
async function setInvidiousInstance() {
  let cfgs = await GM.getValue('YT2IConfig',JSON.stringify(defaultConfig));
  cfg = JSON.parse(cfgs);
  var vhost = prompt('Set Invidious instance to:', cfg.hosts.invidious);
  if ( vhost == '' || vhost.match(/^(https?)?:?[\/]*(.+?)(\/.*)?$/) ) {
    if ( vhost == '' ) { cfg.hosts.invidious = ''; }
    else { cfg.hosts.invidious = RegExp.$2; }
    init(JSON.stringify(cfg));
    GM.setValue('YT2IConfig',JSON.stringify(cfg));
  }
}
async function setNitterInstance() {
  let cfgs = await GM.getValue('YT2IConfig',JSON.stringify(defaultConfig));
  cfg = JSON.parse(cfgs);
  var vhost = prompt('Set Nitter instance to:', cfg.hosts.nitter);
  if ( vhost == '' || vhost.match(/^(https?)?:?[\/]*(.+?)(\/.*)?$/) ) {
    if ( vhost == '' ) { cfg.hosts.nitter = ''; }
    else { cfg.hosts.nitter = RegExp.$2; }
    init(JSON.stringify(cfg));
    GM.setValue('YT2IConfig',JSON.stringify(cfg));
  }
}
async function setBibliogramInstance() {
  let cfgs = await GM.getValue('YT2IConfig',JSON.stringify(defaultConfig));
  cfg = JSON.parse(cfgs);
  var vhost = prompt('Set Bibliogram instance to:', cfg.hosts.bibliogram);
  if ( vhost == '' || vhost.match(/^(https?)?:?[\/]*(.+?)(\/.*)?$/) ) {
    if ( vhost == '' ) { cfg.hosts.bibliogram = ''; }
    else { cfg.hosts.bibliogram = RegExp.$2; }
    init(JSON.stringify(cfg));
    GM.setValue('YT2IConfig',JSON.stringify(cfg));
  }
}
async function toggleInvidiousProxy() {
  let cfgs = await GM.getValue('YT2IConfig',JSON.stringify(defaultConfig));
  cfg = JSON.parse(cfgs);
  if ( cfg.invProxy == 1 ) { cfg.invProxy = 0; console.log('Invidious proxying turned off.'); }
  else { cfg.invProxy = 1; console.log('Invidious proxying turned on.'); }
  init(JSON.stringify(cfg));
  GM.setValue('YT2IConfig',JSON.stringify(cfg));
}
async function setTedditInstance() {
  let cfgs = await GM.getValue('YT2IConfig',JSON.stringify(defaultConfig));
  cfg = JSON.parse(cfgs);
  var vhost = prompt('Set Teddit instance to:', cfg.hosts.teddit);
  if ( vhost == '' || vhost.match(/^(https?)?:?[\/]*(.+?)(\/.*)?$/) ) {
    if (vhost=='') { cfg.hosts.teddit = ''; }
    else { cfg.hosts.teddit = RegExp.$2; }
    init(JSON.stringify(cfg));
    GM.setValue('YT2IConfig',JSON.stringify(cfg));
  }
}

// open tab with instance list from Invidious/Nitter/Bibliogram/Teddit wiki
function openInvidiousList() {
  GM.openInTab('https://github.com/omarroth/invidious/wiki/Invidious-Instances', { active: true, insert: true });
}
function openNitterList() {
  GM.openInTab('https://github.com/zedeus/nitter/wiki/Instances', { active: true, insert: true });
}
function openBibliogramList() {
  GM.openInTab('https://github.com/cloudrac3r/bibliogram/wiki/Instances', { active: true, insert: true });
}
function openTedditList() {
  GM.openInTab('https://codeberg.org/teddit/teddit', { active: true, insert: true });
}

GM_registerMenuCommand('Toggle rewrite on hover',toggleRewriteOnHover);
GM_registerMenuCommand('Set Invidious instance',setInvidiousInstance);
GM_registerMenuCommand('Show list of known Invidious instances', openInvidiousList );
GM_registerMenuCommand('Toggle Inviduous proxy state', toggleInvidiousProxy);
GM_registerMenuCommand('Set Nitter instance',setNitterInstance);
GM_registerMenuCommand('Show list of known Nitter instances', openNitterList );
GM_registerMenuCommand('Set Bibliogram instance',setBibliogramInstance);
GM_registerMenuCommand('Show list of known Bibliogram instances', openBibliogramList );
GM_registerMenuCommand('Set Teddit instance',setTedditInstance);
GM_registerMenuCommand('Show list of known Teddit instances', openTedditList );
