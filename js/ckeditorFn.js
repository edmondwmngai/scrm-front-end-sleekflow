/**
 * Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* exported initEditor */

if (CKEDITOR.env.ie && CKEDITOR.env.version < 9)
    CKEDITOR.tools.enableHtml5Elements(document);

// The trick to keep the editor in the sample quite small
// unless user specified own height.
CKEDITOR.config.height = 300;
CKEDITOR.config.width = 'auto';
CKEDITOR.config.fontSize_sizes = '8/8pt;9/9pt;10/10pt;11/11pt;12/12pt;14/14pt;16/16pt;18/18pt;20/20pt;22/22pt;24/24pt;26/26pt;28/28pt;36/36pt;48/48pt;60/60pt;';
CKEDITOR.addCss(".cke_editable{cursor:text; font-size: 12pt; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif, Times, serif;}")
    // CKEDITOR.config.removeButtons = 'Newpage,Save,Cut,Copy,Paste,PasteText,Form,Checkbox,Radio,Select,Button,HiddenField,ImageButton,CreateDiv,Anchor,Flash,Iframe,PasteFromWord,Language,Templates,About';
CKEDITOR.config.toolbarGroups = [
    { name: 'document', groups: ['mode', 'document', 'doctools'] },
    { name: 'clipboard', groups: ['clipboard', 'undo'] },
    { name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
    { name: 'forms', groups: ['forms'] },
    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
    { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
    '/',
    { name: 'styles', groups: ['styles'] },
    { name: 'colors', groups: ['colors'] },
    { name: 'insert', groups: ['insert'] },
    { name: 'links', groups: ['links'] },
    { name: 'tools', groups: ['tools'] },
    { name: 'others', groups: ['others'] },
    { name: 'about', groups: ['about'] }
];

CKEDITOR.config.entities_latin = false;
CKEDITOR.config.removeButtons = 'Save,NewPage,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,SelectAll,Form,Checkbox,Radio,Select,Button,ImageButton,HiddenField,Textarea,TextField,Language,CreateDiv,Anchor,Flash,Iframe,About';
CKEDITOR.config.removePlugins = 'elementspath';

var initEditor = (function() {
    var wysiwygareaAvailable = isWysiwygareaAvailable(),
        isBBCodeBuiltIn = !!CKEDITOR.plugins.get('bbcode');

    return function() {
        var editorElement = CKEDITOR.document.getById('editor');

        // :(((
        if (isBBCodeBuiltIn) {
            editorElement.setHtml(
                'Hello world!\n\n' +
                'I\'m an instance of [url=https://ckeditor.com]CKEditor[/url].'
            );
        }

        // Depending on the wysiwygarea plugin availability initialize classic or inline editor.
        if (wysiwygareaAvailable) {
            CKEDITOR.replace('editor');
        } else {
            editorElement.setAttribute('contenteditable', 'true');
            CKEDITOR.inline('editor');

            // TODO we can consider displaying some info box that
            // without wysiwygarea the classic editor may not work.
        }
    };

    function isWysiwygareaAvailable() {
        // If in development mode, then the wysiwygarea must be available.
        // Split REV into two strings so builder does not replace it :D.
        if (CKEDITOR.revision == ('%RE' + 'V%')) {
            return true;
        }

        return !!CKEDITOR.plugins.get('wysiwygarea');
    }
})();