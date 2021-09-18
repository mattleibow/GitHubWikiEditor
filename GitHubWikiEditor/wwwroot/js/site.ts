/// <reference path="../types/simplemde/index.d.ts" />
/// <reference path="../types/blazor__javascript-interop/index.d.ts" />
/// <reference path="../types/codemirror/index.d.ts" />

class Editor {
    smde: SimpleMDE;
    codemirror: CodeMirror.Editor;
    localEdit: boolean;

    public static init(editor) {
        return new Editor(editor);
    }

    public constructor(editor) {
        const smde = new SimpleMDE({
            element: editor,
            renderingConfig: {
                singleLineBreaks: false,
                codeSyntaxHighlighting: true,
            }
        });
        const codemirror = smde.codemirror as CodeMirror.Editor;

        this.smde = smde;
        this.codemirror = codemirror;

        codemirror.on("beforeChange", (_, changeObj) => this.onBeforeChange(changeObj));
    }

    private onBeforeChange(changeObj: CodeMirror.EditorChangeCancellable) {
        if (this.localEdit) {
            return;
        }

        // We add in line to adjust for paragraph markers
        const doc = this.codemirror.getDoc();
        let from = doc.indexFromPos(changeObj.from);
        const to = doc.indexFromPos(changeObj.to);

        if (from !== to) {
            //this.text.removeText(from, to);
        }

        const changedText = changeObj.text as string[];
        changedText.forEach((value, index) => {
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
    }
}
