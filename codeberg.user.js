// ==UserScript==
// @name        Codeberg Colors
// @namespace   ltguillaume
// @description More sensible colors for Codeberg's light theme
// @author      ltGuillaume
// @version     1.1
// @match       https://codeberg.org/*
// @grant       GM_addStyle
// @run-at      document-start
// ==/UserScript==

GM_addStyle(`

:root.theme-codeberg-light {
	--color-body: #efefef !important;
	--white-bg-color: #efefef !important;
	--color-box-body: #f8f8f8 !important;
	--color-grey-light: #8f8f8f !important;
}

`);