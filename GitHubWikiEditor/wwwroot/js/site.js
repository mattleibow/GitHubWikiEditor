/// <reference path="../types/simplemde/index.d.ts" />
/// <reference path="../types/blazor__javascript-interop/index.d.ts" />
var Editor = /** @class */ (function () {
    function Editor(editor) {
        var smde = new SimpleMDE({ element: editor });
        this.smde = smde;
        smde.codemirror.on("beforeChange", function (instance, changeObj) {
            //if (localEdit) {
            //    return;
            //}
            //// We add in line to adjust for paragraph markers
            //let from = instance.doc.indexFromPos(changeObj.from);
            //const to = instance.doc.indexFromPos(changeObj.to);
            //if (from !== to) {
            //    this.text.removeText(from, to);
            //}
            var changedText = changeObj.text;
            console.log(changedText);
            DotNet.invokeMethodAsync("GitHubWikiEditor", "SimpleMDE.UpdateTextFromServer", changedText);
            //changedText.forEach((value, index) => {
            //    // Insert the updated text
            //    if (value) {
            //        this.text.insertText(from, value);
            //        from += value.length;
            //    }
            //    // Add in a paragraph marker if this is a multi-line update
            //    if (index !== changedText.length - 1) {
            //        this.text.insertMarker(
            //            from,
            //            ReferenceType.Tile,
            //            { [reservedTileLabelsKey]: ["pg"] });
            //        from++;
            //    }
            //});
        });
    }
    Editor.init = function (editor) {
        return new Editor(editor);
    };
    return Editor;
}());
//# sourceMappingURL=site.js.map