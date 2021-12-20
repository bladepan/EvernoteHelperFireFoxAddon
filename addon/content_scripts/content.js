(function () {

  class EverNoteHelper {
    constructor() {
      this.attrName = "data-nierevernote-id";
      this.linkAttrName = "data-nierevernote-link";
      this.attrValueNull = "null";
      this.debug = false;
      this.helperLinkJobInterval = null;
      this.extractUserId();
    }

    extractUserId() {
      this.userId = null;
      this.shardId = null;
      this.userInfoParsed = false;

      const userInfoJsonEle = document.getElementById('baseEmbed');
      if (!userInfoJsonEle) {
        return;
      }

      const jsonStr = userInfoJsonEle.innerHTML;

      const obj = this.tryParseJson(jsonStr, 'baseEmbed object');
      if (!obj || !obj.USERID) {
        return;
      }
      this.userId = obj.USERID;
      const userObj = this.tryParseJson(obj.user, 'user object');
      if (!userObj || !userObj[14] || !userObj[14].str) {
        return;
      }
      this.shardId = userObj[14].str;
      this.userInfoParsed = true;
    }

    tryParseJson(jsonStr, jsonName) {
      if (!jsonStr) {
        return null;
      }
      try {
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error('failed to parse ' + jsonName);
        console.error(error);
      }

      return null;
    }

    startHelperLinkJob() {
      this.clearHelperLinkJobInterval();
      this.helperLinkJobInterval = setInterval(() => this.addHelperLinks(), 3000);
    }

    clearHelperLinkJobInterval() {
      if (this.helperLinkJobInterval) {
        this.log('clear helper link job interval %s', this.helperLinkJobInterval);
        clearInterval(this.helperLinkJobInterval);
      }
    }

    addHelperLinks() {
      const articleContainers = document.querySelectorAll('#qa-NOTES_SIDEBAR .rv-sticky-leaf-node');
      helper.log('article containers %s', articleContainers);
      for (let articleContainer of articleContainers) {
        this.addHelperLinkToArticleContainer(articleContainer);
      }
    }

    removeLinks() {
      this.clearHelperLinkJobInterval();
      const links = document.querySelectorAll(`[${this.linkAttrName}]`);
      for (let linkEle of links) {
        linkEle.remove();
      }
      const annotated = document.querySelectorAll(`[${this.attrName}]`);
      for (const annotatedEle of annotated) {
        annotatedEle.removeAttribute(this.attrName);
      }
    }

    addHelperLinkToArticleContainer(articleContainer) {
      if (articleContainer.hasAttribute(this.attrName)) {
        // already annotated
        return;
      }

      const articleNode = this.selectChildTag(articleContainer, 'article', 0);
      if (articleNode && articleNode.id) {
        const split = articleNode.id.split('_');
        const noteId = split[0];
        helper.log('note id %s', noteId);
        // find title
        const titleEle = this.findTitleEle(articleNode);
        if (titleEle) {
          this.insertLinks(titleEle.parentElement, noteId);
          articleContainer.setAttribute(this.attrName, noteId);
          return;
        }
        articleContainer.setAttribute(this.attrName, this.attrValueNull);
        return;
      }

      articleContainer.setAttribute(this.attrName, this.attrValueNull);
    }

    insertLinks(ele, noteId) {
      if (this.userInfoParsed) {
        const copyNoteLinkBtn = this.createCopyNoteLinkBtn(noteId);
        ele.insertBefore(copyNoteLinkBtn, ele.firstChild);
      }
      const newTabLink = this.createNewTabLink(noteId);
      ele.insertBefore(newTabLink, ele.firstChild);
    }

    createCopyNoteLinkBtn(noteId) {
      const node = document.createElement('a');
      node.onclick = (evt) => {
        // internal link web link format `https://www.evernote.com/shard/${this.shardId}/nl/${this.userId}/${noteId}?title=${noteTitle}`, the link works without the title part
        // app link `evernote:///view/${this.userId}/${this.shardId}/${noteId}/${noteBookId}`
        const noteLink = `https://www.evernote.com/shard/${this.shardId}/nl/${this.userId}/${noteId}`;
        navigator.clipboard.writeText(noteLink);
        evt.stopPropagation();
      };
      node.setAttribute(this.linkAttrName, this.attrValueNull);
      node.innerHTML = '<svg width="20" height="20" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.25 2h3.5a2.25 2.25 0 0 1 2.236 2h1.764A2.25 2.25 0 0 1 20 6.25V14h-5a5 5 0 0 0-4 8H6.25A2.25 2.25 0 0 1 4 19.75V6.25A2.25 2.25 0 0 1 6.25 4h1.764a2.25 2.25 0 0 1 2.236-2Zm3.5 1.5h-3.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5Z" fill="#27AF60"/><path d="M23 19a4 4 0 0 0-4-4l-.102.007A.75.75 0 0 0 19 16.5l.164.005A2.5 2.5 0 0 1 19 21.5l-.102.007A.75.75 0 0 0 19 23l.2-.005A4 4 0 0 0 23 19ZM15.75 15.75A.75.75 0 0 0 15 15l-.2.005A4 4 0 0 0 15 23l.102-.007A.75.75 0 0 0 15 21.5l-.164-.005A2.5 2.5 0 0 1 15 16.5l.102-.007a.75.75 0 0 0 .648-.743Z" fill="#27AF60"/><path d="M18.75 18.25h-3.5l-.102.007a.75.75 0 0 0 .102 1.493h3.5l.102-.007a.75.75 0 0 0-.102-1.493Z" fill="#27AF60"/></svg>';
      node.title = "copy note link to clipboard";
      return node;
    }

    createNewTabLink(id) {
      //icon from https://fluenticons.co/
      const node = document.createElement('a');
      node.href = `https://www.evernote.com/client/web?login=true#?fs=true&n=${id}`;
      node.target = "_blank";
      node.setAttribute(this.linkAttrName, this.attrValueNull);
      node.innerHTML = '<svg width="20" height="20" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.25 4.75a1.5 1.5 0 0 0-1.5 1.5v11.5a1.5 1.5 0 0 0 1.5 1.5h11.5a1.5 1.5 0 0 0 1.5-1.5v-4a1 1 0 1 1 2 0v4a3.5 3.5 0 0 1-3.5 3.5H6.25a3.5 3.5 0 0 1-3.5-3.5V6.25a3.5 3.5 0 0 1 3.5-3.5h4a1 1 0 1 1 0 2h-4Zm6.5-1a1 1 0 0 1 1-1h6.5a1 1 0 0 1 1 1v6.5a1 1 0 1 1-2 0V6.164l-4.793 4.793a1 1 0 1 1-1.414-1.414l4.793-4.793H13.75a1 1 0 0 1-1-1Z" fill="#212121"/></svg>';
      node.title = "open note in a new tab";
      return node;
    }

    findTitleEle(ele) {
      const spans = ele.querySelectorAll('span');
      for (const spanEle of spans) {
        const div = this.selectChildTag(spanEle, 'div', 0);
        if (!div) {
          return spanEle;
        }
      }
      return null;
    }

    selectChildTag(parentNode, tagName, index) {
      const childNodes = parentNode.children;
      if (!childNodes) {
        return null;
      }
      let matchingIndex = 0;
      const normalizedTagName = tagName.toUpperCase();
      for (const childNode of childNodes) {
        if (childNode.tagName === normalizedTagName) {
          if (matchingIndex === index) {
            return childNode;
          }
          matchingIndex++;
        }
      }
      return null;
    }

    setDebug() {
      console.log(this);
      this.debug = true;
    }

    log() {
      if (this.debug) {
        console.log.apply(console, arguments);
      }
    }

  }

  const helper = new EverNoteHelper();

  browser.runtime.onMessage.addListener((message) => {
    helper.log(message);

    const messageType = message.nierEvernoteHelperMessageType;
    if (messageType === 'removeLinks') {
      helper.removeLinks();
      return;
    }
    if (messageType === 'reset') {
      helper.addHelperLinks();
      return;
    }
    if (messageType === 'debug') {
      helper.setDebug();
      return;
    }
  });

  helper.startHelperLinkJob();

})();
