// ==UserScript==
// @name        GitHub
// @namespace   ltguillaume
// @description CSS, prevent . from opening devmode, F10 to open on Codeberg
// @author      ltGuillaume
// @version     2.6.13
// @icon        https://github.com/favicon.ico
// @downloadURL https://codeberg.org/ltguillaume/userscripts/raw/branch/main/github.com.user.js
// @match       *://*.github.com/*
// @grant       GM_addStyle
// @grant       GM_openInTab
// !grant       window.close
// @run-at      document-start
// ==/UserScript==

GM_addStyle(`

:root[data-color-mode="light"] {
	--bgColor-default:      #efefef !important;
	--bgColor-muted:        #f1f3f5 !important;
	--color-canvas-default: #efefef !important;
	--color-codemirror-bg:  #f8f8f8 !important;
}

:root[data-color-mode="light"] .AppHeader,
:root[data-color-mode="light"] .js-notification-shelf-offset-top {
	background-color: #f9fafb;
}

/*:root[data-color-mode="light"] [role="list"]:not(.ActionListWrap),*/
:root[data-color-mode="light"] [data-target*="styledInput"],
:root[data-color-mode="light"] button.selected,
:root[data-color-mode="light"] table,
:root[data-color-mode="light"] textarea:not(#read-only-cursor-text-area),
:root[data-color-mode="light"] .copilotPreview,
:root[data-color-mode="light"] .discussion-spotlight-container .color-bg-default,
:root[data-color-mode="light"] .feed-item-content,
:root[data-color-mode="light"] .tabnav-tab[aria-selected="true"],
:root[data-color-mode="light"] .Box,
:root[data-color-mode="light"] .Box-body,
:root[data-color-mode="light"] .comment,
:root[data-color-mode="light"] .edit-comment-hide,
:root[data-color-mode="light"] .react-issue-body,
:root[data-color-mode="light"] .react-issue-comment,
:root[data-color-mode="light"] .timeline-comment > div,
:root[data-color-mode="light"] .timeline-comment .edit-comment-hide > div,
:root[data-color-mode="light"] .js-snippet-clipboard-copy-unpositioned,
:root[data-color-mode="light"] .markdown-body img {
	background-color: #f8f8f8 !important;
}

:root[data-color-mode="light"] [itemtype="https://schema.org/abstract"] {
	background-color: var(--bgColor-muted);
}

:root[data-color-mode="light"] .CommentBox-container {
	background-color: #fff;
}

:root[data-color-mode="light"] .markdown-body .highlight pre,
:root[data-color-mode="light"] .markdown-body pre {
	background-color: #efefef !important;
}

`);

function removeHotkeys() {
	let repo, el;
	if (repo = document.querySelector('.repository-content'))
		repo.addEventListener('DOMNodeInserted', removeHotkeys);

	for (q of ['.js-github-dev-shortcut', '.js-github-dev-new-tab-shortcut'])
		if (el = document.querySelector(q)) {
			el.remove();
			console.log('Hotkey', q, 'removed');
			repo.removeEventListener('DOMNodeInserted', removeHotkeys);
			clearInterval(removeHotkeysInterval);
		}
}

let removeHotkeysInterval = setInterval(removeHotkeys, 200);

document.addEventListener('keydown', e => {
	if (e.key == 'F10') {
		e.preventDefault();
		let url = document.URL
			.replace('github.com', 'codeberg.org')
			.replace('/commits/', '/commits/branch/')
			.replace('/tree/', '/src/branch/');
		GM_openInTab(url, { active: true, insert: true });
//	window.close();
	}
});