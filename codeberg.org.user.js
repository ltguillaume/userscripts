// ==UserScript==
// @name        Codeberg
// @namespace   asymmetrics.nl
// @description CSS tweaks for Codeberg.org, F10 to open on GitHub
// @author      ltGuillaume
// @version     1.5.2
// @downloadURL https://codeberg.org/ltguillaume/userscripts/raw/branch/main/codeberg.org.user.js
// @match       https://codeberg.org/*
// @grant       GM_addStyle
// @grant       GM_openInTab
// !grant       window.close
// @run-at      document-start
// ==/UserScript==

GM_addStyle(`

:root[data-theme*="-light"] {
	--color-body: #efefef !important;
	--white-bg-color: #efefef !important;
	--color-box-body: #f8f8f8 !important;
	--color-footer: none !important;
	--color-grey-light: #8f8f8f !important;
	--color-blue-dark-1: var(--color-primary) !important;
	--color-header-wrapper: var(--color-box-body) !important;
	--color-diff-added-row-bg: #e3fae3 !important;
	--color-diff-added-word-bg: #b4f0b4 !important;
	--color-diff-added-row-border: #b4f0b4 !important;

	.chroma .gi {
		background-color: #b4f0b4;
	}

	.chroma .gd {
		background-color: #f0b9b9;
	}
}

#navbar {
	text-shadow: none !important;
}
	#navbar svg {
		filter: none !important;
	}

.flex-item a:not(.label, .button):hover,
#release-list a,
.flex-item-main > div > a, a.ref-issue,
.file-view a, .timeline-item a {
	color: var(--color-primary);
}

html:has(div.timeline) {
  scroll-padding-top: 130px;
  /* Adjust scroll position for titles of max. 2 lines */

  .view.issue.pull .issue-title-header {
    width: auto;
    position: sticky;
    top: 0;
    margin-left: calc(-1 * var(--page-margin-x));
    margin-right: calc(-1 * var(--page-margin-x));
    padding-left: var(--page-margin-x);
    padding-right: var(--page-margin-x);
    padding-bottom: 6px;
    background-color: var(--color-body);
    border-bottom: 1px solid var(--color-secondary);
    z-index: 10;
  }

  .view.issue.pull .issue-title-header .button-row {
    position: relative;
    top: 2px;
  }
}

`);

document.addEventListener('keydown', e => {
	if (e.key == 'F10') {
		e.preventDefault();
		openTab(document.URL
			.replace('codeberg.org', 'github.com')
			.replace('/src/branch/', '/tree/')
			.replace('/branch/', '/')
		);
	}
});

function openTab(url) {
	GM_openInTab(url, { active: true, insert: true });
	//	window.close();
}