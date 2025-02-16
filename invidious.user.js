// ==UserScript==
// @name        Invidious Margins (yewtu.be, inv.citw.lgbt)
// @namespace   ltguillaume
// @description Clean up Invidious UI
// @author      Guillaume
// @version     1.2.4
// @downloadURL https://codeberg.org/ltguillaume/userscripts/raw/branch/main/invidious.user.js
// @match       https://yewtu.be/*
// @match       https://invidious.privacyredirect.com/*
// @grant       GM_addStyle
// ==/UserScript==

// Based on: https://github.com/debpalash/alternative-frontends.user.css

GM_addStyle(`
	.navbar {
		margin: 0;
	}

	.player-dimensions.vjs-fluid {
		padding-top: 49.06% !important;
	}

	#player-container {
		padding-bottom: 49.06% !important
	}

	#player {
		width: 100%;
		height: fit-content;
		background-color: #000;
	}

	#player-container {
		width: 100%;
		padding: 0;
		margin: 0 auto;
	}

	@media only screen and (max-aspect-ratio: 16/9) {
		.player-dimensions.vjs-fluid {
			padding-top: 55.86% !important;
		}

		#player-container {
			padding-bottom: 55.86% !important;
		}
	}

	#contents {
		display: block;
		margin: 0 auto;
		padding: 0;
	}

	.video-js:not(:fullscreen) .vjs-tech {
		position: absolute;
		max-height: calc(100vh - 4em);
	}

	body.dark-theme {
		color: #777;
		background: #1c1a22;
	}

	.pure-u-md-20-24,
	.pure-u-md-5-6 {
		width: 100vw;
	}

	.video-js .vjs-control-bar {
		background: 0;
	}
`)