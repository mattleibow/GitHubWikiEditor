/// <reference path='../types/simplemde/index.d.ts' />
/// <reference path='../types/blazor__javascript-interop/index.d.ts' />
/// <reference path='../types/codemirror/index.d.ts' />

namespace BlazorEditor {

    export type Options = {
        editor: HTMLTextAreaElement;
        callback: DotNet.DotNetObject;
        clientId: string;
    };

    export type TextChangedArgs = {
        id: string;
        text: string;
        from: number;
        to: number;
    }

    type BlazorEditorElement = HTMLTextAreaElement & {
        blazorEditor: Editor;
    };

    export class Editor {
        smde: SimpleMDE;
        codemirror: CodeMirror.Editor;
        remoteUpdates: boolean;
        element: BlazorEditorElement;
        callback: DotNet.DotNetObject;
        clientId: string;

        public static init(editor: HTMLTextAreaElement, callback: DotNet.DotNetObject, clientId: string) {
            new Editor({ editor, callback, clientId });
        }

        public static update(editor: HTMLTextAreaElement, changedText: TextChangedArgs) {
            const blazorElement = editor as BlazorEditorElement;
            if (!blazorElement || !blazorElement.blazorEditor)
                return;

            blazorElement.blazorEditor.receivedChanges(changedText);
        }

        public constructor(options: Options) {
            const smde = new SimpleMDE({
                element: options.editor,
                renderingConfig: {
                    singleLineBreaks: false,
                    codeSyntaxHighlighting: true,
                }
            });
            const codemirror = smde.codemirror as CodeMirror.Editor;

            this.smde = smde;
            this.codemirror = codemirror;

            this.element = options.editor as BlazorEditorElement;
            this.callback = options.callback;
            this.clientId = options.clientId;

            this.element.blazorEditor = this;

            codemirror.on('beforeChange', (_, changeObj) => this.onBeforeChange(changeObj));
        }

        public receivedChanges(args: TextChangedArgs) {
            if (args.id === this.clientId)
                return;

            this.remoteUpdates = true;

            console.log('Recieved: ' + args);

            if (typeof args.text === 'string') {
                this.codemirror.replaceRange(
                    args.text,
                    this.codemirror.posFromIndex(args.from));

                // TODO: paragraphs
                //} else if (Marker.is(segment)) {
                //    smde.codemirror.replaceRange(
                //        "\n",
                //        smde.codemirror.posFromIndex(range.position));
                //}
            } else {
                this.codemirror.replaceRange(
                    '',
                    this.codemirror.posFromIndex(args.from),
                    this.codemirror.posFromIndex(args.to));

                // TODO: paragraphs
                //} else if (Marker.is(segment)) {
                //    smde.codemirror.replaceRange(
                //        "",
                //        smde.codemirror.posFromIndex(range.position),
                //        smde.codemirror.posFromIndex(range.position + 1));
                //}
            }

            this.remoteUpdates = false;
        }

        private onBeforeChange(changeObj: CodeMirror.EditorChangeCancellable) {
            if (this.remoteUpdates) {
                return;
            }

            // We add in line to adjust for paragraph markers
            const doc = this.codemirror.getDoc();
            let from = doc.indexFromPos(changeObj.from);
            const to = doc.indexFromPos(changeObj.to);

            if (from !== to) {
                //this.text.removeText(from, to);

                const args: TextChangedArgs = {
                    id: this.clientId,
                    text: null,
                    from: from,
                    to: to
                };

                this.callback.invokeMethodAsync('Invoke', args);
            }

            const changedText = changeObj.text as string[];
            changedText.forEach((value, index) => {
                // Insert the updated text
                if (value) {
                    const args: TextChangedArgs = {
                        id: this.clientId,
                        text: value,
                        from: from,
                        to: to
                    };
                    this.callback.invokeMethodAsync('Invoke', args);

                    from += value.length;
                }

                // TODO: paragraphs
                // Add in a paragraph marker if this is a multi-line update
                if (index !== changedText.length - 1) {
                    //this.text.insertMarker(
                    //    from,
                    //    ReferenceType.Tile,
                    //    { [reservedTileLabelsKey]: ['pg'] });

                    from++;
                }
            });
        }
    }

}