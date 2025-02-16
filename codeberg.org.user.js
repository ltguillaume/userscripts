// ==UserScript==
// @name        Codeberg
// @namespace   ltguillaume
// @description CSS tweaks for Codeberg.org, F10 to open on GitHub
// @author      ltGuillaume
// @version     1.2.7
// @downloadURL https://codeberg.org/ltguillaume/userscripts/raw/branch/main/codeberg.org.user.js
// @match       https://codeberg.org/*
// @grant       GM_addStyle
// @grant       GM_openInTab
// !grant       window.close
// @run-at      document-start
// ==/UserScript==

GM_addStyle(`

:root[data-theme="codeberg-light"] {
	--color-body: #efefef !important;
	--white-bg-color: #efefef !important;
	--color-box-body: #f8f8f8 !important;
	--color-grey-light: #8f8f8f !important;
	--color-header-wrapper: var(--color-box-body);
	--color-link: var(--color-blue-dark-1);
}

`);

document.addEventListener('keydown', e => {
	if (e.key == 'F10') {
		e.preventDefault();
		let url = document.URL
			.replace('codeberg.org', 'github.com')
			.replace('/src/branch/', '/tree/')
			.replace('/branch/', '/');
		GM_openInTab(url, { active: true, insert: true });
//	window.close();
	}
});