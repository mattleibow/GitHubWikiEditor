/// <reference path="../types/simplemde/index.d.ts" />
/// <reference path="../types/blazor__javascript-interop/index.d.ts" />

class Editor {
    smde: SimpleMDE;

    public constructor(editor) {
        const smde = new SimpleMDE({ element: editor });
        this.smde = smde;

        smde.codemirror.on(
            "beforeChange",
            (instance, changeObj) => {
                //if (localEdit) {
                //    return;
                //}

                //// We add in line to adjust for paragraph markers
                //let from = instance.doc.indexFromPos(changeObj.from);
                //const to = instance.doc.indexFromPos(changeObj.to);

                //if (from !== to) {
                //    this.text.removeText(from, to);
                //}

                const changedText = changeObj.text as string[];
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

    public static init(editor) {
        return new Editor(editor);
    }
}
