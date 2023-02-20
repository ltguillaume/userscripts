// ==UserScript==
// @name        GitHub
// @namespace   ltguillaume
// @description Improved colors, prevent . from opening devmode
// @author      ltGuillaume
// @version     2.4.5
// @icon        https://github.com/favicon.ico
// @match       *://*.github.com/*
// @grant       GM_addStyle
// @run-at      document-start
// ==/UserScript==

GM_addStyle(`

:root[data-color-mode="light"] {
	--color-canvas-default: var(--color-scale-gray-1);
	--color-codemirror-bg:  var(--color-scale-gray-0);
/*
	--color-canvas-subtle:  var(--color-scale-gray-2);
	--color-canvas-overlay: var(--color-scale-gray-1);
	--color-project-sidebar-bg: var(--color-scale-gray-1);
	--color-project-gradient-in: var(--color-scale-gray-1);
	--color-avatar-bg: var(--color-scale-gray-1);
	--color-header-logo: var(--color-scale-gray-1);
*/
}

:root[data-color-mode="light"] table,
:root[data-color-mode="light"] .Box-body,
:root[data-color-mode="light"] .comment,
:root[data-color-mode="light"] .markdown-body img {
	background-color: var(--color-scale-gray-0);
}

.markdown-body .highlight pre,
.markdown-body pre {
	background-color: var(--color-scale-gray-1);
}

`);

function removeHotkeys() {
	let repo = document.querySelector('.repository-content')
	if (repo)
		repo.addEventListener('DOMNodeInserted', removeHotkeys);

	for (q of ['.js-github-dev-shortcut', '.js-github-dev-new-tab-shortcut'])
		if (el = document.querySelector(q)) {
			el.remove();
			console.log('Hotkey', q, 'removed');
			repo.removeListener('DOMNodeInserted', removeHotkeys);
			clearInterval(removeHotkeysInterval);
		}
}

let removeHotkeysInterval = setInterval(removeHotkeys, 500);