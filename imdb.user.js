// ==UserScript==
// @name        IMDb Face Cake Adapted
// @namespace   ltguillaume
// @description Show large images as popups on IMDb
// @author      driver8, Guillaume
// @version     0.4.11
// @icon        http://www.imdb.com/favicon.ico
// @match       *://*.imdb.com/*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant       GM_addStyle
// ==/UserScript==

if (document.location.host.indexOf('m.imdb.com') > -1)
	location.assign(document.URL.replace('m.imdb', 'imdb'));

// IMDb Face Cake 0.4.7 Adapted (https://greasyfork.org/en/scripts/10863)
var MULT = 12;
var IMG_WIDTH = 23 * MULT;
var BORDER = 2;
var OFFSET = 2;
var IMDB_WIDTH = 640;
var IMDB_HEIGHT = 720;
var DO_THUMBS = true;

GM_addStyle('\
	.hovaImg, .hovaThumb {\
		position: absolute;\
		padding: 0px;\
		border-style: solid;\
		border-width: '+ BORDER +'px;\
		border-color: #b8b8c8;\
		z-index: 999999999;\
		pointer-events: none;\
	}\
	.hovaImg *, .hovaThumb * { pointer-events: none; }\
	.hovaImg img {\
		width: '+ IMG_WIDTH +'px;\
		display: block;\
	}\
	.hovaThumb img {\
		display: block;\
	}\
	tr.trHova {\
		background-color: #b8b8c8 !important;\
	}\
	.epspoiler:not(:hover) {\
		color: transparent;\
	}\
');

var rowDivs = [];
var thumbDivs = [];
var curPopup;

//var $rows = $('table.cast, table.cast_list').find('tr.odd, tr.even');
//var $thumbs = $('.media_strip_thumb img, .mediastrip img, .mediastrip_big img, #primary-poster, .photo img, .poster img, .media_index_thumb_list img');
var $rows = $('table.cast_list').find('tr.odd, tr.even');
var $thumbs = $('');

function setUpRows() {
		$rows.each(function(idx) {
				return makePopup(idx, $(this));
		});
}

$rows.each(function(idx) {
	var $name = $(this).find('td.character > div');
	if (!$name.length > 0) return;
	$name.html($name.html().replace(/(\(.*episode.*\))/, "<span class='epspoiler'>$&</span>"));
	$name.find('span').mouseenter(function() {
		curPopup.div.hide();
	});
});

function makePopup(idx, $el) {
		var $hsImg = $el.find('td.hs img, td.primary_photo img');
		if (!$hsImg.length > 0) return;
		var thumbSrc = $hsImg.attr('loadlate') || $hsImg.attr('src');
		var $link = $el.find('a');
		var link = $link && $link.attr('href');
		if ($hsImg.hasClass('loadlate') && thumbSrc.match(/\/imdb\/images\/nopicture\//)) {
				thumbSrc = $hsImg.attr('loadlate');
		}
		thumbSrc = thumbSrc.replace(/(https?:\/\/(?:ia\.media-imdb\.com|.+?\.ssl-images-amazon\.com|.+?\.media-amazon\.com))\/images\/([a-zA-Z0-9@]\/[a-zA-Z0-9@]+)\._V[0-9].+\.jpg/,
				'$1/images/$2._UX' + IMG_WIDTH + '_.jpg');
		var $hovaImg = $('<img>').attr('src', thumbSrc);
		var $hovaLink = $('<a>').attr('href', link).append($hovaImg);
		var $hovaDiv = $('<div>').attr('id', 'hova' + idx).addClass('hovaImg').append($hovaLink);

		$hovaDiv.hide();
		$('body').append($hovaDiv);
		rowDivs[idx] = { 'div': $hovaDiv, 'base': $el };

		$hovaImg.on('load', function() {
				adjustPos(rowDivs[idx], false);
		});
}

function setUpThumbs() {
		$thumbs.each(function(idx) {
				var $el = $(this);
				var thumbSrc = $el.attr('loadlate') || $el.attr('src');
				var $link = $el.closest('a');
				var link = $link && $link.attr('href');
				if ($el.hasClass('loadlate') && thumbSrc.match(/\/imdb\/images\/nopicture\//)) {
						thumbSrc = $el.attr('loadlate');
				}
				thumbSrc = thumbSrc.replace(/(https?:\/\/(?:ia\.media-imdb\.com|.+?\.ssl-images-amazon\.com|.+?\.media-amazon\.com))\/images\/([a-zA-Z0-9@]\/[a-zA-Z0-9@]+)\._V[0-9].+\.jpg/,
						'$1/images/$2._V1_SX' + IMDB_WIDTH + '_SY' + IMDB_HEIGHT + '_.jpg');
				var $hovaLink = $('<a>').attr('href', link).append($hovaImg);
				var $hovaImg = $('<img>').attr('src', thumbSrc);
				var $hovaDiv = $('<div>').attr('id', 'hovat' + idx).addClass('hovaThumb').append($hovaLink);

				$hovaDiv.hide();
				$('body').append($hovaDiv);
				thumbDivs[idx] = { 'div': $hovaDiv, 'base': $el };

				$hovaImg.on('load', function() {
						adjustPos(thumbDivs[idx], true);
				});
		});
}

function adjustPos(obj, big) {
		var win = $(window);
		var pos = obj.base.offset();

		// make sure pop-up is not larger than window
		if (big) {
				var both = obj.div.children().addBack();
				both.css('max-width', (win.width() - BORDER * 2) + 'px');
				both.css('max-height', (win.height() - BORDER * 2) + 'px');
		}

		// center pop-up
		if (big) {
				pos = { 'top': pos.top + obj.base.outerHeight() + OFFSET, 'left': pos.left + ((obj.base.outerWidth() - obj.div.outerWidth()) / 2) };
		} else {
				pos = {'top': pos.top + ((obj.base.outerHeight() - obj.div.outerHeight()) / 2), 'left': pos.left - obj.div.outerWidth() + obj.base.outerWidth()};
		}

		// check for pop-up extending outside window
		pos.top = Math.min(pos.top + obj.div.outerHeight(), win.scrollTop() + win.height()) - obj.div.outerHeight(); // bottom
		pos.left = Math.min(pos.left + obj.div.outerWidth(), win.scrollLeft() + win.width()) - obj.div.outerWidth(); // right
		pos.top = Math.max(pos.top, win.scrollTop()); // left
		pos.left = Math.max(pos.left, win.scrollLeft()); // top
		obj.div.offset(pos);
}

function setupHide(obj) {
		var $base = obj.base,
				pos = $base.offset();
		let right = pos.left + $base.outerWidth(),
				bottom = pos.top + $base.outerHeight();
		$('body').on('mousemove mouseover', null, function that(event) {
				var x = event.pageX,
						y = event.pageY;
				if (x < pos.left - 1 || x > right + 1 || y < pos.top - 1 || y > bottom + 1) {
						$('body').off('mousemove mouseover', null, that);
						$base.removeClass('trHova');
						obj.div.hide();
				}
		});
}

$rows.each(function(idx) {
		var $el = $(this);
		$el.on('mouseenter', function() {
				$el.addClass('trHova');
				if (!rowDivs[idx]) {
						setUpRows();
				}
				curPopup && curPopup.div.hide()
				curPopup = rowDivs[idx];
				rowDivs[idx].div.show();
				adjustPos(rowDivs[idx], false);
				setupHide(rowDivs[idx]);
		});
});

DO_THUMBS && $thumbs.each(function(idx) {
		var $el = $(this);
		$el.on('mouseenter', function() {
				if (!thumbDivs[idx]) {
						setUpThumbs();
				}
				curPopup && curPopup.div.hide()
				curPopup = rowDivs[idx];
				thumbDivs[idx].div.show();
				adjustPos(thumbDivs[idx], true);
				setupHide(thumbDivs[idx]);
		});
});