"use strict";

/*
When content is pasted into a block take the sanitized html and create a block for each
paragraph that has been added.
*/

var scribePastePlugin = function(block) {

  function createList(node) {
    var data = {
      format: 'html',
      listItems: Array.prototype.map.call(node.childNodes, (el) => {
        return {
          content: el.innerHTML
        };
      }),
      listType: (node.tagName === 'OL') ? 'ordered' : 'unordered'
    };
    block.mediator.trigger("block:create", 'List', data, block.el);
  }

  return function(scribe) {
    var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');
    
    insertHTMLCommandPatch.execute = function (value) {
      scribe.transactionManager.run(() => {

        scribe.api.CommandPatch.prototype.execute.call(this, value);

        var fakeContent = document.createElement('div');
        fakeContent.innerHTML = scribe.getContent();

        if (fakeContent.childNodes.length > 1) {
          var nodes = Array.from(fakeContent.childNodes);
          scribe.setContent( nodes.shift().innerHTML );
          nodes.reverse().forEach(function(node) {
            if (node.tagName === 'P') {
              var data = {
                format: 'html',
                text: node.innerHTML
              };
              block.mediator.trigger("block:create", 'Text', data, block.el);
            } else if (node.tagName === 'UL' || node.tagName === 'OL') {
              createList(node)
            }
          });
          scribe.el.focus();
        } else {
          var node = fakeContent.childNodes[0];
          if (node.tagName === 'UL' || node.tagName === 'OL') {
            createList(node);
          }
        }
      });
    };

    scribe.commandPatches.insertHTML = insertHTMLCommandPatch;
  };
};

module.exports = scribePastePlugin;
