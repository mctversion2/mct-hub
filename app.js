/* global ARTICLES_META */

(function () {
  "use strict";

  // ---- STATE ----
  var state = {
    currentView: "home",
    currentCategory: "all",
    currentTag: null,
    currentArticleId: null,
    articlesShown: 0,
    pageSize: 20,
    searchQuery: "",
    currentSource: null,
    currentPage: 1,
    sourcePageSize: 10
  };

  // ---- TEXT CACHE (lazy-loaded) ----
  var textCache = {};
  var chunkCache = {};
  var CHUNK_SIZE = 20;

  function extractNumericId(articleId) {
    // Handle both "art_5" and 5 and "5" formats
    if (typeof articleId === "number") return articleId;
    var s = String(articleId);
    if (s.indexOf("art_") === 0) return parseInt(s.substring(4), 10);
    var n = parseInt(s, 10);
    return isNaN(n) ? -1 : n;
  }

  function getChunkIndex(numId) {
    return Math.floor(numId / CHUNK_SIZE);
  }

  function loadArticleText(articleId, callback) {
    var num = extractNumericId(articleId);
    if (num < 0) { callback(""); return; }
    if (textCache[num] !== undefined) {
      callback(textCache[num]);
      return;
    }
    var chunkIdx = getChunkIndex(num);
    if (chunkCache[chunkIdx]) {
      textCache[num] = chunkCache[chunkIdx][String(num)] || "";
      callback(textCache[num]);
      return;
    }
    fetch("./chunks/text-" + chunkIdx + ".json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        chunkCache[chunkIdx] = data;
        for (var key in data) {
          textCache[parseInt(key, 10)] = data[key];
        }
        callback(textCache[num] || "");
      })
      .catch(function () {
        callback("");
      });
  }

  // ---- COMMENTS CACHE (lazy-loaded) ----
  var commentsCache = {};
  var commentsChunkCache = {};

  function loadArticleComments(articleId, callback) {
    var num = extractNumericId(articleId);
    if (num < 0) { callback([]); return; }
    if (commentsCache[num] !== undefined) {
      callback(commentsCache[num]);
      return;
    }
    var chunkIdx = getChunkIndex(num);
    if (commentsChunkCache[chunkIdx]) {
      commentsCache[num] = commentsChunkCache[chunkIdx][String(num)] || [];
      callback(commentsCache[num]);
      return;
    }
    fetch("./comments/comments-" + chunkIdx + ".json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        commentsChunkCache[chunkIdx] = data;
        for (var key in data) {
          commentsCache[parseInt(key, 10)] = data[key];
        }
        callback(commentsCache[num] || []);
      })
      .catch(function () {
        callback([]);
      });
  }

  function formatCommentTime(isoStr) {
    if (!isoStr) return "";
    try {
      var d = new Date(isoStr);
      var now = new Date();
      var diff = now - d;
      var mins = Math.floor(diff / 60000);
      if (mins < 60) return mins + "m ago";
      var hrs = Math.floor(mins / 60);
      if (hrs < 24) return hrs + "h ago";
      var days = Math.floor(hrs / 24);
      if (days < 30) return days + "d ago";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return "";
    }
  }

  function renderCommentsSection(meta, numId) {
    if (meta.source !== "facebook" || !meta.fb_post_id) return "";

    var engHtml =
      '<div class="fb-engagement-bar">' +
        '<div class="fb-engagement-stats">' +
          (meta.reactions ? '<span class="fb-stat"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' + meta.reactions.toLocaleString() + '</span>' : '') +
          (meta.comments ? '<span class="fb-stat"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' + meta.comments.toLocaleString() + '</span>' : '') +
          (meta.shares ? '<span class="fb-stat"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>' + meta.shares.toLocaleString() + '</span>' : '') +
        '</div>' +
      '</div>';

    var commentsHtml =
      '<div class="fb-comments-section" id="fb-comments-section">' +
        '<div class="fb-comments-header">' +
          '<h3 class="fb-comments-title">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-3px;margin-right:6px;"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
            'Facebook Comments' +
          '</h3>' +
        '</div>' +
        '<div class="fb-comments-list" id="fb-comments-list">' +
          '<p style="opacity:0.4;font-size:var(--text-sm);">Loading comments...</p>' +
        '</div>' +
        '<a href="' + escapeHtml(meta.url) + '" target="_blank" rel="noopener noreferrer" class="fb-join-cta">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          'Join the conversation on Facebook' +
        '</a>' +
      '</div>';

    return engHtml + commentsHtml;
  }

  function populateComments(numId) {
    var listEl = $("#fb-comments-list");
    if (!listEl) return;

    loadArticleComments(numId, function (comments) {
      if (!comments || comments.length === 0) {
        listEl.innerHTML = '<p class="fb-no-comments">No comments yet. Be the first to comment on Facebook.</p>';
        return;
      }
      var html = '';
      for (var i = 0; i < comments.length; i++) {
        var c = comments[i];
        var text = escapeHtml(c.text || "");
        var timeStr = formatCommentTime(c.time);
        var likes = c.likes || 0;
        html +=
          '<div class="fb-comment">' +
            '<div class="fb-comment-body">' + text + '</div>' +
            '<div class="fb-comment-meta">' +
              (timeStr ? '<span>' + timeStr + '</span>' : '') +
              (likes > 0 ? '<span class="fb-comment-likes"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21h4V9H2v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>' + likes + '</span>' : '') +
            '</div>' +
          '</div>';
      }
      listEl.innerHTML = html;
    });
  }

  // ---- DOM REFS ----
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return document.querySelectorAll(sel); };

  // ---- UTILITY ----
  function formatDate(dateStr) {
    if (!dateStr) return "";
    var parts = dateStr.split("-");
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  function getCategoryClass(cat) {
    if (!cat) return "news";
    return cat.toLowerCase();
  }

  function formatCount(n) {
    if (!n) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  function getFilteredArticles() {
    var articles = ARTICLES_META;
    if (state.currentSource) {
      articles = articles.filter(function (a) { return a.source === state.currentSource; });
    }
    if (state.currentCategory !== "all") {
      articles = articles.filter(function (a) { return a.category === state.currentCategory; });
    }
    if (state.currentTag) {
      articles = articles.filter(function (a) { return a.tags && a.tags.indexOf(state.currentTag) !== -1; });
    }
    // Sort by date descending — latest articles first
    articles = articles.slice().sort(function (a, b) {
      var da = a.date || "";
      var db = b.date || "";
      if (da > db) return -1;
      if (da < db) return 1;
      return 0;
    });
    return articles;
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function toTitleCase(str) {
    if (!str) return str;
    // Only convert if the entire string is uppercase
    if (str !== str.toUpperCase()) return str;
    var small = ['a','an','the','and','but','or','for','nor','on','at','to','by','in','of','up','as','is','it'];
    // Common acronyms/abbreviations to keep uppercase
    var acronyms = ['OFW','OFWS','ICC','BBM','VP','US','USA','UK','EU','UN','ASEAN','NATO','GDP','PHP','USD','NAIA','DFA','DOJ','DOF','PNP','AFP','NBI','BIR','SEC','DILG','DSWD','DOLE','DMW','BSP','PSA','WPS','EDSA','POGO','PAGCOR','SC','CA','RTC','MTC','SB','COMELEC','PCGG','COA','BI','BOC','PDEA','NICA','NSC','PSG','QC','NCR','BARMM','LGU','SOGIE','TRAIN','PBBM','SWOH','PDP','LP','NPC','NP','SARA'];
    var acronymMap = {};
    acronyms.forEach(function(a) { acronymMap[a.toLowerCase()] = a; });
    return str.toLowerCase().split(' ').map(function(word, i) {
      // Check for acronyms (strip punctuation for matching)
      var cleanWord = word.replace(/[^a-z]/g, '');
      if (acronymMap[cleanWord]) {
        return word.replace(cleanWord, acronymMap[cleanWord]);
      }
      if (i === 0 || small.indexOf(word) === -1) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    }).join(' ');
  }

  // ---- RENDER: HERO ----
  function renderHero() {
    var section = $("#hero-section");
    var articles = getFilteredArticles();
    if (articles.length === 0) {
      section.innerHTML = "";
      return;
    }
    var a = articles[0];
    var heroImgHtml = a.image
      ? '<div class="hero-image"><img src="' + escapeHtml(a.image) + '" alt="" loading="eager" onerror="this.parentNode.style.display=\'none\'"></div>'
      : '';
    section.innerHTML =
      '<div class="hero-card ' + (a.image ? 'has-image' : '') + '" data-article="' + a.id + '">' +
        heroImgHtml +
        '<div class="hero-text">' +
          '<div class="hero-meta">' +
            '<span class="category-badge ' + getCategoryClass(a.category) + '">' + escapeHtml(a.category) + '</span>' +
            (a.date ? '<span class="card-date">' + formatDate(a.date) + '</span>' : '') +
            '<span class="card-date">' + a.read_time + ' min read</span>' +
          '</div>' +
          '<h2 class="hero-title">' + escapeHtml(toTitleCase(a.title)) + '</h2>' +
          '<p class="hero-excerpt">' + escapeHtml(a.excerpt) + '</p>' +
        '</div>' +
      '</div>';
  }

  // ---- RENDER: EVENT BANNER (Google Doodle-style) ----
  function getActiveEvent() {
    if (typeof MCT_EVENTS === 'undefined') return null;
    // Use Asia/Manila timezone
    var now;
    try {
      var manilaStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
      now = new Date(manilaStr);
    } catch (e) {
      now = new Date();
    }
    var m = now.getMonth() + 1; // 1-12
    var d = now.getDate();

    // Priority map: day=1, week=2, month=3 (shorter events override longer)
    var PRIORITY = { day: 1, week: 2, month: 3 };

    var matches = [];
    for (var i = 0; i < MCT_EVENTS.length; i++) {
      var ev = MCT_EVENTS[i];
      var inRange = false;
      if (ev.startMonth === ev.endMonth) {
        inRange = (m === ev.startMonth && d >= ev.startDay && d <= ev.endDay);
      } else if (ev.startMonth < ev.endMonth) {
        inRange = (m === ev.startMonth && d >= ev.startDay) ||
                  (m === ev.endMonth && d <= ev.endDay) ||
                  (m > ev.startMonth && m < ev.endMonth);
      } else {
        // Wraps year end (e.g. Dec 31 → Jan 2)
        inRange = (m === ev.startMonth && d >= ev.startDay) ||
                  (m === ev.endMonth && d <= ev.endDay) ||
                  (m > ev.startMonth || m < ev.endMonth);
      }
      if (inRange) {
        var pri = PRIORITY[ev.duration] || 3;
        matches.push({ event: ev, priority: pri });
      }
    }
    if (matches.length === 0) return null;
    // Shortest-duration (lowest priority number) wins
    matches.sort(function(a, b) { return a.priority - b.priority; });
    return matches[0].event;
  }

  function renderEventBanner() {
    var section = $("#event-banner");
    if (!section) return;
    var ev = getActiveEvent();
    if (!ev) {
      section.hidden = true;
      section.innerHTML = '';
      return;
    }
    // Check if banner image exists
    var imgPath = './events/event-' + ev.id + '.png';
    var c1 = ev.accentColor || '#9333ea';
    var c2 = ev.accentColor2 || c1;
    var tc = ev.textColor || '#ffffff';

    section.hidden = false;
    section.innerHTML =
      '<div class="event-banner-card">' +
        '<img class="event-banner-img" src="' + imgPath + '" alt="' + escapeHtml(ev.name) + '" loading="eager" ' +
          'onerror="this.style.display=\'none\'">' +
        '<div class="event-banner-overlay" style="background:linear-gradient(135deg, ' + c1 + 'cc 0%, ' + c2 + 'aa 40%, transparent 70%)"></div>' +
        '<div class="event-banner-content" style="color:' + tc + '">' +
          '<div class="event-banner-emoji">' + (ev.emoji || '') + '</div>' +
          '<div class="event-banner-title">' + escapeHtml(ev.name) + '</div>' +
          '<div class="event-banner-subtitle">' + escapeHtml(ev.subtitle) + '</div>' +
          '<div class="event-banner-badge" style="color:' + tc + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' +
            'Morning Coffee Thoughts' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // ---- RENDER: ARTICLE CARDS ----
  function renderArticleCard(a) {
    var imgHtml = a.image
      ? '<div class="card-image"><img src="' + escapeHtml(a.image) + '" alt="" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></div>'
      : '';
    return (
      '<div class="article-card ' + (a.image ? 'has-image' : '') + '" data-article="' + a.id + '">' +
        imgHtml +
        '<div class="card-content">' +
          '<div class="card-meta">' +
            '<span class="category-badge ' + getCategoryClass(a.category) + '">' + escapeHtml(a.category) + '</span>' +
            (a.date ? '<span class="card-date">' + formatDate(a.date) + '</span>' : '') +
          '</div>' +
          '<h3 class="card-title">' + escapeHtml(toTitleCase(a.title)) + '</h3>' +
          '<p class="card-excerpt">' + escapeHtml(a.excerpt) + '</p>' +
          '<div class="card-footer">' +
            '<span>' + a.read_time + ' min read' + (a.word_count ? ' · ' + a.word_count.toLocaleString() + ' words' : '') + '</span>' +
            '<span class="card-engagement">' +
              (a.reactions ? '<span class="card-eng-item" title="Reactions">❤ ' + formatCount(a.reactions) + '</span>' : '') +
              (a.comments ? '<span class="card-eng-item" title="Comments">💬 ' + formatCount(a.comments) + '</span>' : '') +
              (a.shares ? '<span class="card-eng-item" title="Shares">↗ ' + formatCount(a.shares) + '</span>' : '') +
            '</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ---- RENDER: HOMEPAGE SECTIONS ----
  function renderHomepageSections() {
    var newsSection = $("#section-news");
    var commentarySection = $("#section-commentary");
    var newsGrid = $("#news-grid");
    var commentaryGrid = $("#commentary-grid");
    var allHeader = $("#all-articles-header");

    // Only show sections on default home (no source/category/tag filter)
    var isDefault = !state.currentSource && state.currentCategory === "all" && !state.currentTag;

    if (!isDefault) {
      newsSection.hidden = true;
      commentarySection.hidden = true;
      if (allHeader) allHeader.hidden = true;
      return;
    }

    // Get latest news (up to 4)
    var allSorted = ARTICLES_META.slice().sort(function (a, b) {
      var da = a.date || ""; var db = b.date || "";
      if (da > db) return -1; if (da < db) return 1; return 0;
    });
    var latestNews = allSorted.filter(function (a) { return a.category === "News"; }).slice(0, 4);
    var latestCommentary = allSorted.filter(function (a) { return a.category === "Commentary"; }).slice(0, 4);

    // Render news
    if (latestNews.length > 0) {
      var newsHtml = "";
      for (var i = 0; i < latestNews.length; i++) {
        newsHtml += renderArticleCard(latestNews[i]);
      }
      newsGrid.innerHTML = newsHtml;
      newsSection.hidden = false;
    } else {
      newsSection.hidden = true;
    }

    // Render commentary
    if (latestCommentary.length > 0) {
      var commHtml = "";
      for (var j = 0; j < latestCommentary.length; j++) {
        commHtml += renderArticleCard(latestCommentary[j]);
      }
      commentaryGrid.innerHTML = commHtml;
      commentarySection.hidden = false;
    } else {
      commentarySection.hidden = true;
    }

    // Show "All Articles" header
    if (allHeader) allHeader.hidden = false;
  }

  function renderArticles(reset) {
    var grid = $("#articles-grid");
    var articles = getFilteredArticles();
    var loadMoreWrap = $("#load-more-wrap");
    var paginationWrap = $("#pagination-wrap");

    // Render homepage sections
    renderHomepageSections();

    // SOURCE-FILTERED MODE: paginated, no hero
    if (state.currentSource) {
      // Hide hero and event banner when viewing a source
      $("#hero-section").innerHTML = "";
      var evBanner = $("#event-banner");
      if (evBanner) evBanner.hidden = true;

      // Show source filter header
      var sourceLabel = state.currentSource === "facebook" ? "MCT 2.0 Facebook" :
        state.currentSource === "website" ? "morningcoffeethoughts.org" : "MCT 1.0 Facebook";
      var headerEl = $("#source-filter-header");
      if (!headerEl) {
        headerEl = document.createElement("div");
        headerEl.id = "source-filter-header";
        headerEl.className = "source-filter-header";
        grid.parentNode.insertBefore(headerEl, grid);
      }
      headerEl.innerHTML =
        '<div class="source-filter-info">' +
          '<h2 class="source-filter-title">Showing articles from <span class="source-filter-name">' + escapeHtml(sourceLabel) + '</span></h2>' +
          '<span class="source-filter-count">' + articles.length + ' articles</span>' +
        '</div>' +
        '<button class="source-filter-clear" id="source-filter-clear" type="button">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
          'Show All' +
        '</button>';
      headerEl.hidden = false;

      // Paginated rendering
      var page = state.currentPage;
      var perPage = state.sourcePageSize;
      var totalPages = Math.ceil(articles.length / perPage);
      var start = (page - 1) * perPage;
      var end = Math.min(start + perPage, articles.length);

      grid.innerHTML = "";
      var html = "";
      for (var i = start; i < end; i++) {
        html += renderArticleCard(articles[i]);
      }
      grid.innerHTML = html;

      // Pagination controls
      loadMoreWrap.hidden = true;
      if (totalPages > 1) {
        paginationWrap.hidden = false;
        paginationWrap.innerHTML = renderPagination(page, totalPages);
      } else {
        paginationWrap.hidden = true;
      }
      return;
    }

    // DEFAULT MODE: hero + load-more
    // Remove source filter header if present
    var existingHeader = $("#source-filter-header");
    if (existingHeader) { existingHeader.hidden = true; }
    // Restore event banner
    renderEventBanner();
    paginationWrap.hidden = true;

    // Skip the hero article (first one)
    var displayArticles = articles.slice(1);

    if (reset) {
      state.articlesShown = 0;
      grid.innerHTML = "";
    }

    var startIdx = state.articlesShown;
    var endIdx = Math.min(startIdx + state.pageSize, displayArticles.length);

    var defaultHtml = "";
    for (var k = startIdx; k < endIdx; k++) {
      defaultHtml += renderArticleCard(displayArticles[k]);
    }
    grid.insertAdjacentHTML("beforeend", defaultHtml);
    state.articlesShown = endIdx;

    // Show/hide load more
    if (endIdx >= displayArticles.length) {
      loadMoreWrap.hidden = true;
    } else {
      loadMoreWrap.hidden = false;
    }
  }

  // ---- PAGINATION RENDERER ----
  function renderPagination(current, total) {
    var html = '<nav class="pagination" aria-label="Article pages">';

    // Previous button
    if (current > 1) {
      html += '<button class="page-btn page-prev" data-page="' + (current - 1) + '" type="button">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>' +
        'Prev</button>';
    } else {
      html += '<button class="page-btn page-prev" disabled type="button">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>' +
        'Prev</button>';
    }

    // Page numbers with ellipsis logic
    var pages = buildPageNumbers(current, total);
    for (var i = 0; i < pages.length; i++) {
      if (pages[i] === "...") {
        html += '<span class="page-ellipsis">&hellip;</span>';
      } else {
        var active = pages[i] === current ? " active" : "";
        html += '<button class="page-btn page-num' + active + '" data-page="' + pages[i] + '" type="button">' + pages[i] + '</button>';
      }
    }

    // Next button
    if (current < total) {
      html += '<button class="page-btn page-next" data-page="' + (current + 1) + '" type="button">' +
        'Next<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>' +
        '</button>';
    } else {
      html += '<button class="page-btn page-next" disabled type="button">' +
        'Next<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>' +
        '</button>';
    }

    html += '</nav>';
    return html;
  }

  function buildPageNumbers(current, total) {
    if (total <= 7) {
      var all = [];
      for (var i = 1; i <= total; i++) { all.push(i); }
      return all;
    }
    var pages = [1];
    if (current > 3) { pages.push("..."); }
    var rangeStart = Math.max(2, current - 1);
    var rangeEnd = Math.min(total - 1, current + 1);
    for (var j = rangeStart; j <= rangeEnd; j++) { pages.push(j); }
    if (current < total - 2) { pages.push("..."); }
    pages.push(total);
    return pages;
  }

  // ---- RENDER: POPULAR ----
  function renderPopular() {
    var container = $("#popular-articles");
    var sorted = ARTICLES_META.slice().sort(function (a, b) {
      return (b.reactions || 0) - (a.reactions || 0);
    });
    var top = sorted.slice(0, 8);
    var html = "";
    for (var i = 0; i < top.length; i++) {
      var a = top[i];
      html +=
        '<div class="popular-item" data-article="' + a.id + '">' +
          '<span class="popular-rank">' + (i + 1) + '</span>' +
          '<div class="popular-info">' +
            '<h3>' + escapeHtml(toTitleCase(a.title)) + '</h3>' +
            '<p>' + (a.reactions ? a.reactions.toLocaleString() + ' reactions' : '') +
              (a.date ? ' · ' + formatDate(a.date) : '') + '</p>' +
          '</div>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  // ---- RENDER: TAG CLOUD ----
  function renderTagCloud() {
    var container = $("#tag-cloud");
    var tagCounts = {};
    ARTICLES_META.forEach(function (a) {
      if (a.tags) {
        a.tags.forEach(function (t) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      }
    });
    var sorted = Object.keys(tagCounts).sort(function (a, b) {
      return tagCounts[b] - tagCounts[a];
    });
    var top = sorted.slice(0, 15);
    var html = "";
    top.forEach(function (tag) {
      var active = state.currentTag === tag ? " active" : "";
      var count = tagCounts[tag];
      // Weight by article count: high ≥100, mid 50-99, low <50
      var weightClass = count >= 100 ? " tag-weight-high" : count >= 50 ? " tag-weight-mid" : " tag-weight-low";
      html += '<button class="tag-cloud-item' + active + weightClass + '" data-tag="' + escapeHtml(tag) + '">' +
        escapeHtml(tag) + ' <span style="opacity:0.6">(' + count + ')</span></button>';
    });
    container.innerHTML = html;
  }

  // ---- RENDER: FILTER BAR TAGS ----
  function renderFilterTags() {
    var container = $("#tag-filters");
    // Dynamically compute top tags from actual article data
    var tagCounts = {};
    ARTICLES_META.forEach(function (a) {
      if (a.tags) {
        a.tags.forEach(function (t) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      }
    });
    // Sort by frequency, take top 12
    var topTags = Object.keys(tagCounts).sort(function (a, b) {
      return tagCounts[b] - tagCounts[a];
    }).slice(0, 12);

    var html = "";
    topTags.forEach(function (tag) {
      var active = state.currentTag === tag ? " active" : "";
      html += '<button class="tag-chip' + active + '" data-tag="' + escapeHtml(tag) + '">' + escapeHtml(tag) + '</button>';
    });
    container.innerHTML = html;
  }

  // ---- ARTICLE VIEW ----
  // Extract a human-readable source name from a URL
  function extractSourceName(url) {
    try {
      var hostname = url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
      // Known Philippine / international news sources
      var nameMap = {
        'inquirer.net': 'Inquirer',
        'newsinfo.inquirer.net': 'Inquirer',
        'globalnation.inquirer.net': 'Inquirer',
        'entertainment.inquirer.net': 'Inquirer',
        'cebudailynews.inquirer.net': 'Cebu Daily News',
        'technology.inquirer.net': 'Inquirer',
        'business.inquirer.net': 'Inquirer',
        'abs-cbn.com': 'ABS-CBN',
        'gmanetwork.com': 'GMA News',
        'rappler.com': 'Rappler',
        'philstar.com': 'Philstar',
        'mb.com.ph': 'Manila Bulletin',
        'manilatimes.net': 'Manila Times',
        'pna.gov.ph': 'PNA',
        'pco.gov.ph': 'PCO',
        'doe.gov.ph': 'DOE',
        'filipinotimes.net': 'Filipino Times',
        'gulfnews.com': 'Gulf News',
        'reuters.com': 'Reuters',
        'bbc.com': 'BBC',
        'cnnphilippines.com': 'CNN Philippines',
        'aljazeera.com': 'Al Jazeera',
        'facebook.com': 'Facebook',
        'x.com': 'X (Twitter)',
        'twitter.com': 'X (Twitter)',
        'youtube.com': 'YouTube',
        'diskurso.ph': 'Diskurso PH',
        'eia.gov': 'U.S. EIA',
        'sunstar.com.ph': 'SunStar',
        'dailyguardian.com.ph': 'Daily Guardian',
        'bilyonaryo.com': 'Bilyonaryo',
        'interaksyon.philstar.com': 'Interaksyon',
        'verafiles.org': 'Vera Files',
        'newsbreak.ph': 'Newsbreak',
        'bulatlat.com': 'Bulatlat',
        'mindanews.com': 'MindaNews',
        'businessworld.com.ph': 'BusinessWorld',
        'manilastandard.net': 'Manila Standard'
      };
      // Try exact hostname match first, then base domain
      if (nameMap[hostname]) return nameMap[hostname];
      // Try without subdomain: e.g. 'newsinfo.inquirer.net' -> 'inquirer.net'
      var parts = hostname.split('.');
      if (parts.length > 2) {
        var baseDomain = parts.slice(-2).join('.');
        if (nameMap[baseDomain]) return nameMap[baseDomain];
      }
      // Fallback: clean up domain into a readable name
      var base = parts.length > 2 ? parts.slice(-2, -1)[0] : parts[0];
      return base.charAt(0).toUpperCase() + base.slice(1);
    } catch (e) {
      return url.length > 40 ? url.substring(0, 37) + '...' : url;
    }
  }

  function formatArticleText(text, title) {
    if (!text) return "<p>Article content unavailable.</p>";

    // Remove leading line if it matches the title (avoid duplication)
    if (title) {
      var titleClean = title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      var lines0 = text.split('\n');
      for (var li = 0; li < Math.min(3, lines0.length); li++) {
        var lineClean = lines0[li].replace(/🟥/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (lineClean && titleClean && lineClean === titleClean) {
          lines0.splice(li, 1);
          break;
        }
      }
      text = lines0.join('\n');
    }

    // Replace 🟥 with styled red squares
    text = text.replace(/🟥/g, '<span class="red-square" aria-hidden="true"></span>');

    // Split into lines
    var lines = text.split("\n");
    var html = "";
    var inSources = false;
    var currentParagraph = [];

    function flushParagraph() {
      if (currentParagraph.length > 0) {
        var pText = currentParagraph.join(" ").trim();
        if (pText) {
          html += "<p>" + pText + "</p>";
        }
        currentParagraph = [];
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var trimmed = line.trim();

      // Detect SOURCES section
      if (/^(SOURCES?|References?|SOURCE|REFERENCES)\s*:?\s*$/i.test(trimmed) ||
          /^#{1,3}\s*(SOURCES?|References?)\s*$/i.test(trimmed)) {
        flushParagraph();
        inSources = true;
        html += '<div class="sources-section">';
        html += '<h3>Sources</h3>';
        continue;
      }

      // Headers (## or ###)
      if (/^#{2,3}\s/.test(trimmed)) {
        flushParagraph();
        var level = trimmed.startsWith("###") ? "h3" : "h2";
        var headerText = trimmed.replace(/^#{2,3}\s+/, "");
        html += "<" + level + ">" + headerText + "</" + level + ">";
        continue;
      }

      // Lines starting with red square marker are section headings
      if (/^<span class="red-square"/.test(trimmed) && trimmed.length < 200) {
        flushParagraph();
        var headingText = trimmed.replace(/<span class="red-square"[^>]*><\/span>\s*/g, "").trim();
        if (headingText.length > 3) {
          html += '<h2><span class="red-square" aria-hidden="true"></span> ' + headingText + '</h2>';
          continue;
        }
      }

      // ALL CAPS lines (section headers in the text)
      if (trimmed.length > 10 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) &&
          !trimmed.startsWith("HTTP") && !trimmed.startsWith("WWW") && !/^\d/.test(trimmed)) {
        flushParagraph();
        // Clean leading red squares
        var cleanHeader = trimmed.replace(/<span class="red-square"[^>]*><\/span>\s*/g, "");
        if (cleanHeader.length > 5) {
          html += '<h2><span class="red-square" aria-hidden="true"></span> ' + cleanHeader + '</h2>';
          continue;
        }
      }

      // Empty line = paragraph break
      if (!trimmed) {
        flushParagraph();
        continue;
      }

      // URL lines in sources (bare URL on its own line)
      if (inSources && /^https?:\/\//.test(trimmed)) {
        flushParagraph();
        var srcName = extractSourceName(trimmed);
        html += '<p><a href="' + escapeHtml(trimmed) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(srcName) + '</a></p>';
        continue;
      }

      // Numbered source lines: "1. SourceName, URL" or "1. SourceName (context), URL"
      if (inSources && /^\d+\.\s/.test(trimmed)) {
        flushParagraph();
        var srcMatch = trimmed.match(/^\d+\.\s+(.+?),?\s+(https?:\/\/\S+)/);
        if (srcMatch) {
          var sLabel = srcMatch[1].replace(/,\s*$/, '').trim();
          var sUrl = srcMatch[2];
          html += '<p style="padding-left:var(--space-4);">' +
            trimmed.match(/^\d+/)[0] + '. ' +
            '<a href="' + escapeHtml(sUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(sLabel) + '</a></p>';
        } else {
          html += '<p style="padding-left:var(--space-4);">' + trimmed + '</p>';
        }
        continue;
      }

      // List items
      if (/^[-•]\s/.test(trimmed)) {
        flushParagraph();
        html += '<p style="padding-left:var(--space-4);">' + trimmed.substring(2) + '</p>';
        continue;
      }

      // Numbered list items (outside sources section)
      if (/^\d+\.\s/.test(trimmed)) {
        flushParagraph();
        html += '<p style="padding-left:var(--space-4);">' + trimmed + '</p>';
        continue;
      }

      // Regular text — accumulate
      currentParagraph.push(trimmed);
    }

    flushParagraph();
    if (inSources) {
      html += '</div>';
    }

    // Auto-link URLs in text (show source name instead of raw URL)
    // Only match URLs that are NOT already inside an <a> tag (not preceded by href=" or >)
    html = html.replace(/(<a[^>]*>.*?<\/a>)|(https?:\/\/[^\s<"]+)/g, function (match, linkedBlock, rawUrl) {
      if (linkedBlock) return linkedBlock; // Already a complete link — leave it alone
      if (!rawUrl) return match;
      var display = extractSourceName(rawUrl);
      return '<a href="' + rawUrl + '" target="_blank" rel="noopener noreferrer">' + display + '</a>';
    });

    return html;
  }

  // ── Audio Player ──
  var audioAvailableCache = {};

  function checkAudioAvailable(artId) {
    if (artId in audioAvailableCache) return;
    var audioUrl = 'audio/' + artId + '.mp3';
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', audioUrl, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        audioAvailableCache[artId] = true;
        var player = $('#audio-player-section');
        if (player) player.style.display = 'block';
      } else {
        audioAvailableCache[artId] = false;
      }
    };
    xhr.onerror = function () { audioAvailableCache[artId] = false; };
    xhr.send();
  }

  function renderAudioPlayer(meta) {
    var artId = meta.id;
    // Check if audio exists (async, will show player when confirmed)
    setTimeout(function () { checkAudioAvailable(artId); }, 100);

    return '<div class="audio-player-section" id="audio-player-section" style="display:none;">' +
      '<div class="audio-player-header">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' +
        '<span class="audio-player-title">Listen to this article</span>' +
      '</div>' +
      '<audio controls preload="none" class="audio-player-element" id="article-audio">' +
        '<source src="audio/' + artId + '.mp3" type="audio/mpeg">' +
      '</audio>' +
      '<p class="audio-player-disclaimer">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
        'This is an AI-generated audio narration for your convenience. I wish I could voice it myself.' +
      '</p>' +
    '</div>';
  }

  function showArticle(articleId) {
    // Normalize to "art_X" string format for meta lookup
    var artId = String(articleId);
    if (artId.indexOf("art_") !== 0) artId = "art_" + artId;
    var id = extractNumericId(artId);
    var meta = ARTICLES_META.find(function (a) { return a.id === artId; });
    if (!meta) return;

    var container = $("#article-content");

    var relatedHtml = renderRelatedArticles(meta);

    var articleImgHtml = meta.image
      ? '<div class="article-cover"><img src="' + escapeHtml(meta.image) + '" alt="" loading="eager" onerror="this.parentNode.style.display=\'none\'"></div>'
      : '';

    // Show article shell immediately with loading state for body
    container.innerHTML =
      '<a href="#" class="article-back" id="article-back">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>' +
        'Back to articles' +
      '</a>' +
      articleImgHtml +
      '<div class="article-header">' +
        '<div class="card-meta">' +
          '<span class="category-badge ' + getCategoryClass(meta.category) + '">' + escapeHtml(meta.category) + '</span>' +
          (meta.tags ? meta.tags.map(function (t) {
            return '<button class="tag-chip" data-tag="' + escapeHtml(t) + '" style="font-size:var(--text-xs);padding:2px 8px;">' + escapeHtml(t) + '</button>';
          }).join('') : '') +
        '</div>' +
        '<h1 class="article-heading">' + escapeHtml(toTitleCase(meta.title)) + '</h1>' +
        '<div class="article-info">' +
          (meta.date ? '<span>' + formatDate(meta.date) + '</span><span class="article-info-divider"></span>' : '') +
          '<span>' + meta.read_time + ' min read</span>' +
          '<span class="article-info-divider"></span>' +
          '<span>' + (meta.word_count || 0).toLocaleString() + ' words</span>' +
          (meta.reactions ? '<span class="article-info-divider"></span><span>' + meta.reactions.toLocaleString() + ' reactions</span>' : '') +
          (meta.comments ? '<span class="article-info-divider"></span><span>' + meta.comments.toLocaleString() + ' comments</span>' : '') +
          (meta.shares ? '<span class="article-info-divider"></span><span>' + meta.shares.toLocaleString() + ' shares</span>' : '') +
        '</div>' +
      '</div>' +
      renderAudioPlayer(meta) +
      '<div class="article-body" id="article-body-content"><p style="opacity:0.5;">Loading article...</p></div>' +
      (meta.url ?
        '<a href="' + escapeHtml(meta.url) + '" target="_blank" rel="noopener noreferrer" class="article-source-link">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
          'View original on ' + (meta.source === 'facebook' ? 'Facebook' : 'Website') +
        '</a>' : '') +
      '<div class="share-section">' +
        '<p class="share-title">Share this article</p>' +
        '<div class="share-buttons">' +
          '<a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(meta.url || '') + '" target="_blank" rel="noopener noreferrer">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
            'Facebook' +
          '</a>' +
          '<a class="share-btn" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(meta.title) + '&url=' + encodeURIComponent(meta.url || '') + '" target="_blank" rel="noopener noreferrer">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' +
            'X / Twitter' +
          '</a>' +
          '<button class="share-btn" id="copy-link-btn" data-url="' + escapeHtml(meta.url || '') + '">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
            'Copy Link' +
          '</button>' +
        '</div>' +
      '</div>' +
      renderCommentsSection(meta, id) +
      relatedHtml;

    // Scroll to top
    window.scrollTo(0, 0);

    // Lazy-load article text
    loadArticleText(id, function (text) {
      var bodyEl = $("#article-body-content");
      if (bodyEl) {
        bodyEl.innerHTML = formatArticleText(text, meta.title);
      }
    });

    // Lazy-load comments for Facebook articles
    if (meta.source === "facebook" && meta.fb_post_id) {
      populateComments(id);
    }
  }

  function renderRelatedArticles(meta) {
    if (!meta.tags || meta.tags.length === 0) return "";

    // Find candidates with at least one matching tag, count matches
    var candidates = [];
    ARTICLES_META.forEach(function (a) {
      if (a.id === meta.id) return;
      if (!a.tags) return;
      var matchCount = 0;
      a.tags.forEach(function (t) {
        if (meta.tags.indexOf(t) !== -1) matchCount++;
      });
      if (matchCount > 0) {
        candidates.push({ article: a, matchCount: matchCount });
      }
    });

    if (candidates.length === 0) return "";

    // Sort by match count desc, then by date desc
    candidates.sort(function (x, y) {
      if (y.matchCount !== x.matchCount) return y.matchCount - x.matchCount;
      var da = x.article.date || "";
      var db = y.article.date || "";
      if (db > da) return 1;
      if (db < da) return -1;
      return 0;
    });

    var top = candidates.slice(0, 4);

    var html = '<div class="related-section"><p class="related-title">Related Articles</p><div class="related-grid">';
    top.forEach(function (c) {
      var a = c.article;
      var relImgHtml = a.image
        ? '<div class="related-image"><img src="' + escapeHtml(a.image) + '" alt="" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></div>'
        : '';
      html +=
        '<div class="related-item" data-article="' + a.id + '">' +
          relImgHtml +
          '<div>' +
            '<p class="related-cat">' + escapeHtml(a.category) + '</p>' +
            '<h3>' + escapeHtml(toTitleCase(a.title)) + '</h3>' +
            '<p>' + (a.date ? formatDate(a.date) + ' · ' : '') + a.read_time + ' min read</p>' +
          '</div>' +
        '</div>';
    });
    html += '</div></div>';
    return html;
  }

  // ---- SEARCH ----
  function performSearch(query) {
    if (!query || query.length < 2) {
      $("#search-results").innerHTML = '<div class="search-empty">Type at least 2 characters to search</div>';
      return;
    }

    var q = query.toLowerCase();
    var results = ARTICLES_META.filter(function (a) {
      return a.title.toLowerCase().indexOf(q) !== -1 ||
        a.excerpt.toLowerCase().indexOf(q) !== -1 ||
        (a.tags && a.tags.some(function (t) { return t.toLowerCase().indexOf(q) !== -1; }));
    }).slice(0, 20);

    if (results.length === 0) {
      $("#search-results").innerHTML = '<div class="search-empty">No articles found for "' + escapeHtml(query) + '"</div>';
      return;
    }

    var re = new RegExp("(" + query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    var html = "";
    results.forEach(function (a) {
      var title = escapeHtml(toTitleCase(a.title)).replace(re, "<mark>$1</mark>");
      var excerpt = escapeHtml(a.excerpt).replace(re, "<mark>$1</mark>");
      html +=
        '<div class="search-result-item" data-article="' + a.id + '">' +
          '<h3>' + title + '</h3>' +
          '<p class="search-meta">' + escapeHtml(a.category) +
            (a.date ? ' · ' + formatDate(a.date) : '') +
            ' · ' + a.read_time + ' min read</p>' +
          '<p class="search-excerpt">' + excerpt + '</p>' +
        '</div>';
    });
    $("#search-results").innerHTML = html;
  }

  // ---- READING PROGRESS BAR ----
  var progressBar = null;
  var progressRAF = null;

  function createProgressBar() {
    if (progressBar) return;
    progressBar = document.createElement("div");
    progressBar.id = "reading-progress-bar";
    document.body.appendChild(progressBar);
  }

  function removeProgressBar() {
    if (progressBar) {
      progressBar.style.width = "0%";
      // Small delay before removing to allow final transition
      setTimeout(function () {
        if (progressBar && progressBar.parentNode) {
          progressBar.parentNode.removeChild(progressBar);
        }
        progressBar = null;
      }, 150);
    }
    if (progressRAF) {
      cancelAnimationFrame(progressRAF);
      progressRAF = null;
    }
    window.removeEventListener("scroll", updateProgress, { passive: true });
  }

  function updateProgress() {
    if (progressRAF) cancelAnimationFrame(progressRAF);
    progressRAF = requestAnimationFrame(function () {
      if (!progressBar) return;
      var docEl = document.documentElement;
      var scrollTop = window.scrollY || docEl.scrollTop;
      var scrollHeight = docEl.scrollHeight - docEl.clientHeight;
      if (scrollHeight <= 0) {
        progressBar.style.width = "100%";
        return;
      }
      var pct = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      progressBar.style.width = pct + "%";
    });
  }

  function startProgressBar() {
    createProgressBar();
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  function stopProgressBar() {
    removeProgressBar();
  }

  // ---- ROUTING ----
  function navigateTo(view, data) {
    $$(".view").forEach(function (v) { v.classList.remove("active"); });

    if (view === "article" && data) {
      state.currentView = "article";
      state.currentArticleId = data;
      $("#view-article").classList.add("active");
      showArticle(data);
      window.location.hash = "article/" + data;
      startProgressBar();
    } else if (view === "about") {
      state.currentView = "about";
      $("#view-about").classList.add("active");
      window.location.hash = "about";
      window.scrollTo(0, 0);
      stopProgressBar();
    } else {
      state.currentView = "home";
      $("#view-home").classList.add("active");
      if (!window.location.hash || window.location.hash === "#") {
        // Don't change hash
      } else {
        window.location.hash = "";
      }
      stopProgressBar();
    }

    // Update nav active state
    $$(".nav-link, .mobile-nav-link").forEach(function (link) {
      link.classList.remove("active");
      if (link.dataset.nav === view || (view === "home" && link.dataset.nav === "home")) {
        link.classList.add("active");
      }
    });
  }

  function handleHashChange() {
    var hash = window.location.hash.replace("#", "");
    if (hash.startsWith("article/")) {
      var id = hash.replace("article/", "");
      navigateTo("article", id);
    } else if (hash === "about") {
      navigateTo("about");
    } else {
      navigateTo("home");
    }
  }

  // ---- THEME TOGGLE ----
  function initTheme() {
    var toggle = $("[data-theme-toggle]");
    var root = document.documentElement;
    var theme = "dark";
    root.setAttribute("data-theme", theme);
    updateThemeIcon(toggle, theme);

    toggle.addEventListener("click", function () {
      theme = theme === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", theme);
      toggle.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " mode");
      updateThemeIcon(toggle, theme);
    });
  }

  function updateThemeIcon(toggle, theme) {
    toggle.innerHTML = theme === "dark"
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  // ---- SOURCE FILTER HELPERS ----
  function clearSourceFilter() {
    state.currentSource = null;
    state.currentPage = 1;
    updateSourceBadgeActive();
    renderHero();
    renderArticles(true);
  }

  function updateSourceBadgeActive() {
    $$(".source-badge[data-source]").forEach(function (badge) {
      if (state.currentSource && badge.dataset.source === state.currentSource) {
        badge.classList.add("active");
      } else {
        badge.classList.remove("active");
      }
    });
  }

  // ---- EVENT HANDLERS ----
  function initEvents() {
    // Article card clicks (delegated)
    document.addEventListener("click", function (e) {
      var card = e.target.closest("[data-article]");
      if (card) {
        e.preventDefault();
        navigateTo("article", card.dataset.article);
        return;
      }

      // Tag clicks
      var tagBtn = e.target.closest("[data-tag]");
      if (tagBtn) {
        e.preventDefault();
        var tag = tagBtn.dataset.tag;
        // If we're in article view and click a tag, go back to home with that tag
        if (state.currentView === "article") {
          navigateTo("home");
        }
        state.currentTag = state.currentTag === tag ? null : tag;
        renderFilterTags();
        renderTagCloud();
        renderHero();
        renderArticles(true);
        return;
      }

      // Source badge clicks
      var sourceBtn = e.target.closest("[data-source]");
      if (sourceBtn) {
        e.preventDefault();
        var source = sourceBtn.dataset.source;
        // If in article or about view, navigate home first
        if (state.currentView !== "home") {
          navigateTo("home");
        }
        // Toggle: if same source clicked, clear filter
        if (state.currentSource === source) {
          clearSourceFilter();
        } else {
          state.currentSource = source;
          state.currentPage = 1;
          state.currentCategory = "all";
          state.currentTag = null;
          updateSourceBadgeActive();
          $$(".filter-btn").forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
          $('[data-category="all"]').classList.add("active");
          $('[data-category="all"]').setAttribute("aria-selected", "true");
          renderFilterTags();
          renderArticles(true);
        }
        return;
      }

      // Source filter clear button
      if (e.target.closest("#source-filter-clear")) {
        e.preventDefault();
        clearSourceFilter();
        return;
      }

      // Pagination clicks
      var pageBtn = e.target.closest("[data-page]");
      if (pageBtn && !pageBtn.disabled) {
        e.preventDefault();
        state.currentPage = parseInt(pageBtn.dataset.page, 10);
        renderArticles(true);
        // Scroll to top of grid
        var gridTop = $("#articles-grid");
        if (gridTop) { gridTop.scrollIntoView({ behavior: "smooth", block: "start" }); }
        return;
      }

      // Category filter
      var catBtn = e.target.closest("[data-category]");
      if (catBtn) {
        e.preventDefault();
        state.currentCategory = catBtn.dataset.category;
        state.currentTag = null;
        // Clear source filter when changing category
        if (state.currentSource) {
          state.currentSource = null;
          state.currentPage = 1;
          updateSourceBadgeActive();
        }
        $$(".filter-btn").forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
        catBtn.classList.add("active");
        catBtn.setAttribute("aria-selected", "true");
        renderFilterTags();
        renderTagCloud();
        renderHero();
        renderArticles(true);
        return;
      }

      // Nav links
      var navLink = e.target.closest("[data-nav]");
      if (navLink) {
        e.preventDefault();
        var dest = navLink.dataset.nav;
        if (dest === "home") {
          state.currentCategory = "all";
          state.currentTag = null;
          $$(".filter-btn").forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
          $('[data-category="all"]').classList.add("active");
          $('[data-category="all"]').setAttribute("aria-selected", "true");
          renderFilterTags();
          renderTagCloud();
          renderHero();
          renderArticles(true);
        }
        navigateTo(dest);
        closeMobileMenu();
        return;
      }

      // Back button in article view
      if (e.target.closest("#article-back")) {
        e.preventDefault();
        navigateTo("home");
        return;
      }

      // Copy link
      if (e.target.closest("#copy-link-btn")) {
        var btn = e.target.closest("#copy-link-btn");
        var url = btn.dataset.url;
        if (url && navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            btn.textContent = "Copied!";
            setTimeout(function () {
              btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Link';
            }, 2000);
          });
        }
        return;
      }
    });

    // Load more
    $("#btn-load-more").addEventListener("click", function () {
      renderArticles(false);
    });

    // Search
    $("#search-toggle").addEventListener("click", function () {
      var overlay = $("#search-overlay");
      overlay.hidden = false;
      setTimeout(function () { $("#search-input").focus(); }, 100);
    });
    $("#search-close").addEventListener("click", closeSearch);
    $("#search-input").addEventListener("input", function () {
      performSearch(this.value);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeSearch();
        closeMobileMenu();
      }
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        var overlay = $("#search-overlay");
        if (overlay.hidden) {
          overlay.hidden = false;
          setTimeout(function () { $("#search-input").focus(); }, 100);
        } else {
          closeSearch();
        }
      }
    });

    // Mobile menu
    $("#mobile-menu-toggle").addEventListener("click", function () {
      var menu = $("#mobile-menu");
      var isOpen = !menu.hidden;
      menu.hidden = isOpen;
      this.setAttribute("aria-expanded", !isOpen);
      this.innerHTML = isOpen
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    });

    // Header scroll behavior
    var header = $("#site-header");
    var lastScroll = 0;
    window.addEventListener("scroll", function () {
      var scroll = window.scrollY;
      if (scroll > 60) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
      lastScroll = scroll;
    }, { passive: true });

    // Hash change
    window.addEventListener("hashchange", handleHashChange);

    // Tag filters scroll indicator (left-edge fade on scroll)
    var tagFiltersEl = $("#tag-filters");
    var tagFiltersWrap = $("#tag-filters-wrap");
    if (tagFiltersEl && tagFiltersWrap) {
      tagFiltersEl.addEventListener("scroll", function () {
        if (tagFiltersEl.scrollLeft > 10) {
          tagFiltersWrap.classList.add("scrolled-start");
        } else {
          tagFiltersWrap.classList.remove("scrolled-start");
        }
      }, { passive: true });
    }
  }

  function closeSearch() {
    $("#search-overlay").hidden = true;
    $("#search-input").value = "";
    $("#search-results").innerHTML = "";
  }

  function closeMobileMenu() {
    var menu = $("#mobile-menu");
    menu.hidden = true;
    var toggle = $("#mobile-menu-toggle");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
  }

  // ---- RENDER: ARCHIVE TICKER ----
  function renderTicker() {
    var wrap = $("#ticker-wrap");
    var track = $("#ticker-track");
    if (!wrap || !track) return;

    // Get commentary articles with images, excluding the most recent 20
    var commentaries = ARTICLES_META.slice().filter(function (a) {
      return a.category === "Commentary" && a.image;
    }).sort(function (a, b) {
      var da = a.date || ""; var db = b.date || "";
      if (da > db) return -1; if (da < db) return 1; return 0;
    });

    // Skip the 20 most recent, pick from older ones
    var pool = commentaries.slice(20);
    if (pool.length < 5) pool = commentaries; // fallback if not enough

    // Shuffle and pick 15
    for (var s = pool.length - 1; s > 0; s--) {
      var r = Math.floor(Math.random() * (s + 1));
      var temp = pool[s]; pool[s] = pool[r]; pool[r] = temp;
    }
    var selected = pool.slice(0, 15);

    // Build ticker items — duplicate for seamless loop
    var html = "";
    function buildItem(a) {
      return (
        '<div class="ticker-item" data-article="' + a.id + '">' +
          '<img class="ticker-img" src="' + escapeHtml(a.image) + '" alt="" loading="lazy" onerror="this.parentNode.style.display=\'none\'">' +
          '<span class="ticker-title">' + escapeHtml(toTitleCase(a.title.length > 65 ? a.title.substring(0, 62) + '...' : a.title)) + '</span>' +
        '</div>'
      );
    }
    for (var i = 0; i < selected.length; i++) {
      html += buildItem(selected[i]);
    }
    // Duplicate for seamless infinite scroll
    for (var j = 0; j < selected.length; j++) {
      html += buildItem(selected[j]);
    }

    track.innerHTML = html;
    wrap.hidden = false;

    // Pause on hover
    track.addEventListener("mouseenter", function () {
      track.style.animationPlayState = "paused";
    });
    track.addEventListener("mouseleave", function () {
      track.style.animationPlayState = "running";
    });
    // Pause on touch
    track.addEventListener("touchstart", function () {
      track.style.animationPlayState = "paused";
    }, { passive: true });
    track.addEventListener("touchend", function () {
      track.style.animationPlayState = "running";
    });
  }

  // ---- INIT ----
  function fetchFollowerCount() {
    var el = $("#stat-followers");
    if (!el) return;
    var url = "https://graph.facebook.com/v21.0/893376663850463?fields=followers_count&access_token=EAA5p2tb7aWUBQxI5uuZBddZAc05uKH2ceCsrbAKJTZByZCsQjkMfZBftEYWeYnGRg246sQS2mZCIbGslIXazwCbhWwKiIvS7gTywvIlgb3u1MVbWWEBZCoKDRrqDOng2VB5pMDr60z5j6MaNSHOgOYvjqyK0bm5Xq4YLhjZAR7NN2t56sk4NveyEFNUV1vp3cQ2ZB7fiTvwxmPutOQxZA4kSaUmgZDZD";
    fetch(url).then(function(r) { return r.json(); }).then(function(data) {
      if (data.followers_count) {
        el.textContent = data.followers_count.toLocaleString();
      }
    }).catch(function() { el.textContent = "48,000+"; });
  }

  function init() {
    initTheme();
    renderEventBanner();
    renderHero();
    renderArticles(true);
    renderPopular();
    renderTagCloud();
    renderFilterTags();
    initEvents();
    handleHashChange();
    fetchFollowerCount();
    renderTicker();
  }

  // Wait for data to load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
