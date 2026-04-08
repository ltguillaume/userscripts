// ==UserScript==
// @name        Codeberg
// @namespace   asymmetrics.nl
// @description CSS tweaks for Codeberg.org, F10 to open on GitHub
// @author      ltGuillaume
// @version     1.3.2
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

html {
  scroll-padding-top: 132px;
}

.issue-title-header {
  width: unset !important;
  position: sticky;
  top: 0;
  margin: 0 calc(-1 * var(--page-margin-x));
  padding: 0 calc(var(--page-margin-x));
  padding-bottom: 6px !important;
  background-color: var(--color-body);
  border-bottom: 1px solid rgba(0, 0, 0, .059);
	z-index: 1;
}
  .issue-title-header .button-row {
    margin-top: 6px;
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
//  window.close();
  }
});