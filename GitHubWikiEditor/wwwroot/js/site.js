/// <reference path="../types/simplemde/index.d.ts" />
/// <reference path="../types/blazor__javascript-interop/index.d.ts" />
/// <reference path="../types/codemirror/index.d.ts" />
var Editor = /** @class */ (function () {
    function Editor(editor) {
        var _this = this;
        var smde = new SimpleMDE({
            element: editor,
            renderingConfig: {
                singleLineBreaks: false,
                codeSyntaxHighlighting: true,
            }
        });
        var codemirror = smde.codemirror;
        this.smde = smde;
        this.codemirror = codemirror;
        codemirror.on("beforeChange", function (_, changeObj) { return _this.onBeforeChange(changeObj); });
    }
    Editor.init = function (editor) {
        return new Editor(editor);
    };
    Editor.prototype.onBeforeChange = function (changeObj) {
        if (this.localEdit) {
            return;
        }
        // We add in line to adjust for paragraph markers
        var doc = this.codemirror.getDoc();
        var from = doc.indexFromPos(changeObj.from);
        var to = doc.indexFromPos(changeObj.to);
        if (from !== to) {
            //this.text.removeText(from, to);
        }
        var changedText = changeObj.text;
        changedText.forEach(function (value, index) {
            // Insert the updated text
            if (value) {
                //this.text.insertText(from, value);
                from += value.length;
            }
            // Add in a paragraph marker if this is a multi-line update
            if (index !== changedText.length - 1) {
                //this.text.insertMarker(
                //    from,
                //    ReferenceType.Tile,
                //    { [reservedTileLabelsKey]: ["pg"] });
                from++;
            }
        });
        DotNet.invokeMethodAsync("GitHubWikiEditor", "SimpleMDE.UpdateTextFromServer", changedText);
    };
    return Editor;
}());
//# sourceMappingURL=site.js.map