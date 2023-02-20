// ==UserScript==
// @name        Gmail Direct Links
// @namespace   ltguillaume
// @description Strip Google's tracking from clicking A-tag links. A left-click presents a confirmation dialog to confirm or edit the URL first, while a middle/wheel click just opens the direct link in the background.
// @author      ltGuillaume
// @version     1.9.1
// @icon        https://ssl.gstatic.com/ui/v1/icons/mail/images/favicon5.ico
// @match       *://mail.google.com/*
// @grant       GM_openInTab
// ==/UserScript==

const
	MBUTTON_MIDDLE = 1,
	MBUTTON_RIGHT	= 2,
	PATTERN = /^https:\/\/(accounts|mail)\.google\.com/i;

function getLink(el) {
	let url, pEl = el;
	if (el.tagName == 'A')
		url = el.href;
	else
		while (pEl.parentElement) {
			pEl = pEl.parentElement;
			if (pEl.tagName == 'A') {
				url = pEl.href;
				break;
			}
		}
	return url && url != '#' && !PATTERN.test(url) ? url : false;
}

document.addEventListener('click', e => {
	if (e.button == MBUTTON_RIGHT) return;
	let link = getLink(e.target);
	if (link) {
		e.preventDefault();
		if (e.button == MBUTTON_MIDDLE || (link = prompt('Follow this link?\n'+ link.substr(0,150) + (link.length > 150 ? '...' : ''), link)))
			GM_openInTab(link, { active: e.button != MBUTTON_MIDDLE, container: 0, insert: true });
	}
}, true);