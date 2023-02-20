// ==UserScript==
// @name Darkseit
// @namespace   ltguillaume
// @description Global night mode for all websites using a minimal amount of CSS. Includes domain-wide ignore list. Hotkeys: [F8] toggle for current tab only, [Ctrl]+[F8] to toggle globally; [Alt]+[F8] add to/remove from ignore list.
// @author      ltGuillaume
// @version     2.0.6
// @match       *://*/*
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-start
// ==/UserScript==

let ignore, ignoreList, isEnabled;

window.addEventListener('DOMContentLoaded', function() {
	GM_addStyle(`
html.drk > div > img:not(:hover) { filter: none !important } /* Imagus Firefox Extension */

html.drk #mainSearch, html.drk #contentArea, html.drk .thumb:not(.category), html.drk input.text, /* Tweakers.net */
html.drk #toc, html.drk #mw-panel > #p-lang > div.body, /* WikiMuch */

html.drk, html.drk:hover,
html.drk body, html.drk body:hover { background: #141a21 !important /* 10100f */ }

html.drk div,
html.drk *:not(:hover),
html.drk :not(:hover)::after,
html.drk :not(:hover)::before {
	background: transparent !important;
	color: #b0b0b0 !important;
	text-shadow: none !important;
	box-shadow: none !important;
	border: none !important;
}
	html.drk :hover,
	html.drk :hover::after,
	html.drk :hover::before {
		background-color: transparent !important;
		text-shadow: none !important;
		box-shadow: none !important;
		border: none !important;
	}

html.drk a { color: #69695d !important }
	html.drk a:hover { color: #1d91f0 }

html.drk img,
html.drk svg { transition: filter .25s }
	html.drk img:not(:hover),
	html.drk svg:not(:hover) { filter: opacity(70%) !important }

html.drk input:not(:hover), html.drk input:hover,
html.drk textarea:not(:hover), html.drk textarea:hover { color: #69695d !important }
	`);
	update();
	setInterval(update, 2500);
});

document.addEventListener('keydown', (e) => {
	if (e.keyCode == 119) {
		e.preventDefault();
		if (e.altKey) toggleIgnore();
		else if (e.ctrlKey && !ignore) GM_setValue('isEnabled', !GM_getValue('isEnabled'));
		if (ignore) document.documentElement.classList.remove('drk');
		else document.documentElement.classList.toggle('drk');
	}
});

function update() {
	if (GM_getValue('isEnabled') == isEnabled) return;
	ignoreList = GM_getValue('ignoreList') || null;
	ignore = (ignoreList && ignoreList.includes(window.location.hostname));
	isEnabled = GM_getValue('isEnabled');
	if (!ignore && isEnabled)
		document.documentElement.classList.add('drk');
	else
		document.documentElement.classList.remove('drk');
}

function toggleIgnore() {
	if (!ignoreList) ignoreList = Array();
	let i = ignoreList.indexOf(window.location.hostname);
	if (i > -1)
		ignoreList.splice(i, 1);
	else
		ignoreList.push(window.location.hostname);
	GM_setValue('ignoreList', ignoreList);
	ignore ^= true;
}