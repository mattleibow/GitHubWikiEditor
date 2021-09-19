/// <reference path='../types/simplemde/index.d.ts' />
/// <reference path='../types/blazor__javascript-interop/index.d.ts' />
/// <reference path='../types/codemirror/index.d.ts' />
var BlazorEditor;
(function (BlazorEditor) {
    var Editor = /** @class */ (function () {
        function Editor(options) {
            var _this = this;
            var smde = new SimpleMDE({
                element: options.editor,
                renderingConfig: {
                    singleLineBreaks: false,
                    codeSyntaxHighlighting: true,
                }
            });
            var codemirror = smde.codemirror;
            this.smde = smde;
            this.codemirror = codemirror;
            this.element = options.editor;
            this.callback = options.callback;
            this.clientId = options.clientId;
            this.element.blazorEditor = this;
            codemirror.on('beforeChange', function (_, changeObj) { return _this.onBeforeChange(changeObj); });
        }
        Editor.init = function (editor, callback, clientId) {
            new Editor({ editor: editor, callback: callback, clientId: clientId });
        };
        Editor.update = function (editor, changedText) {
            var blazorElement = editor;
            if (!blazorElement || !blazorElement.blazorEditor)
                return;
            blazorElement.blazorEditor.receivedChanges(changedText);
        };
        Editor.prototype.receivedChanges = function (args) {
            if (args.id === this.clientId)
                return;
            this.remoteUpdates = true;
            console.log('Recieved: ' + args);
            if (typeof args.text === 'string') {
                this.codemirror.replaceRange(args.text, this.codemirror.posFromIndex(args.from));
                // TODO: paragraphs
                //} else if (Marker.is(segment)) {
                //    smde.codemirror.replaceRange(
                //        "\n",
                //        smde.codemirror.posFromIndex(range.position));
                //}
            }
            else {
                this.codemirror.replaceRange('', this.codemirror.posFromIndex(args.from), this.codemirror.posFromIndex(args.to));
                // TODO: paragraphs
                //} else if (Marker.is(segment)) {
                //    smde.codemirror.replaceRange(
                //        "",
                //        smde.codemirror.posFromIndex(range.position),
                //        smde.codemirror.posFromIndex(range.position + 1));
                //}
            }
            this.remoteUpdates = false;
        };
        Editor.prototype.onBeforeChange = function (changeObj) {
            var _this = this;
            if (this.remoteUpdates) {
                return;
            }
            // We add in line to adjust for paragraph markers
            var doc = this.codemirror.getDoc();
            var from = doc.indexFromPos(changeObj.from);
            var to = doc.indexFromPos(changeObj.to);
            if (from !== to) {
                //this.text.removeText(from, to);
                var args = {
                    id: this.clientId,
                    text: null,
                    from: from,
                    to: to
                };
                this.callback.invokeMethodAsync('Invoke', args);
            }
            var changedText = changeObj.text;
            changedText.forEach(function (value, index) {
                // Insert the updated text
                if (value) {
                    var args = {
                        id: _this.clientId,
                        text: value,
                        from: from,
                        to: to
                    };
                    _this.callback.invokeMethodAsync('Invoke', args);
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
        };
        return Editor;
    }());
    BlazorEditor.Editor = Editor;
})(BlazorEditor || (BlazorEditor = {}));
//# sourceMappingURL=site.js.map