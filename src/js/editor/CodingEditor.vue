<template>
    <div class="contents">
        <!-- editor toolbar -->
        <Headline1 class="px-3 py-6">LICENSE</Headline1>
        <div
            v-show="false"
            class="block xl:fl  ex lg:justify-center sticky top-0 py-2 z-40 bg-surface leading-10"
        >
            <div
                id="toolbar"
                class="rounded-none mb-3 xl:mb-0 lg:rounded-full border-2 bg-surface z-150 shadow-lg border-foreground/20 py-2 px-4 inline-flex !text-foreground/60"
            >
                <EditorToolbar />
            </div>
            <slot name="actions"></slot>
        </div>
        <!-- editor content -->
        <div class="flex">
            <div id="lineNumber"></div>
            <div
                id="editor"
                class="flex-grow"
                @contextmenu="showContextMenu"
                @dragenter.prevent
                @dragover.prevent
                @drop.prevent
            ></div>
        </div>
        <div
            class="absolute flex items-end bottom-10 right-16"
            style="z-index: 999"
        >
      <span class="text-foreground/60 w-4 h-4 animate-spin" v-show="updating">
        <ArrowPathIcon class="w-4 h-4" />
      </span>
            <span
                id="selection-hash"
                class="w-6 h-6 text-center text-xs ArrowPathIcon border-0 bg-surface p-2 float-end"
            >0:0</span
            >
        </div>
        <CodingContextMenu @close="contextMenuClosed" />
    </div>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import './editor.css';
import { formats, redoChange, undoChange } from './EditorConfig.js';
import { LineNumber } from './LineNumber.js';
import { SelectionHighlightBG } from './SelectionHighlightBG.js';
import { SelectionHash } from './SelectionHash.js';
import EditorToolbar from './EditorToolbar.vue';
import { useCodingEditor } from './useCodingEditor.js';
import { useRange } from './useRange.js';
import { useSelections } from '../selections/useSelections.js';
import { createDelta } from './createDelta.js';
import {useContextMenu} from '../contextMenu/useContextMenu.js'
import CodingContextMenu from '../contextMenu/CodingContextMenu.vue'

const editorContent = ref('');
const {selected, open:openCTM } = useContextMenu();
const { selections,  selectionsByIndex, create:createSelection, markToDelete } = useSelections();
const { prevRange, setRange } = useRange();
const { setInstance, dispose } = useCodingEditor();
Quill.register('modules/lineNumber', LineNumber, true);
Quill.register('modules/selectionHash', SelectionHash, true);
Quill.register('modules/cursors', QuillCursors);
Quill.register('modules/highlight', SelectionHighlightBG);


let quillInstance;
onMounted(() => {
    quillInstance = new Quill('#editor', {
        theme: 'snow',
        formats: formats.concat(['id', 'title', 'class']),
        placeholder: 'Start writing or paste content...',
        modules: {
            syntax: false,
            history: {
                delay: 2000,
                maxStack: 500,
                userOnly: true,
            },
            toolbar: {
                container: '#toolbar',
                handlers: {
                    undo: undoChange,
                    redo: redoChange,
                },
            },
            lineNumber: {
                container: '#lineNumber',
            },
            selectionHash: {
                container: '#selection-hash',
            },

            // highlight selections background
            // this is the module we use to visualize selections
            highlight: {},
        },
    });

    // make available in other templates
    setInstance(quillInstance);

    quillInstance.enable(true);

    fetch("LICENSE")
        .then((res) => res.text())
        .then((text) => {
            const markup = text.split('\n').map(line => `<p>${line}</p>`).join('')
            quillInstance.clipboard.dangerouslyPasteHTML(markup);
        })
        .catch((e) => console.error(e));

    /*
     * Update selected range to shared state
     */
    quillInstance.on('selection-change', (data) => {
        const text = data ? quillInstance.getText(data) : '';
        setRange(data, text);
    });

    const hl = quillInstance.getModule('highlight');

    window.quill = quillInstance;



    const addSelections = (entries = []) => {
        entries.forEach((selection) => {
            hl.highlight({
                id: selection.code.id,
                color: selection.code.color,
                title: selection.code.name,
                start: selection.start,
                length: selection.length,
                active: selection.code.active,
            });
        });
    };
    watch(selections, entries => {
        console.debug('selections', entries.length)
        addSelections(entries)
    }, { deep: true, immediate: true })


    watch(selected, async ({ code }) => {
        // FIXME move this into composable!
        // skip if no usable selection was made
        const hasSelection = prevRange.value?.length
        const hasCode = !!code
        if (!hasSelection || !hasCode) {
            return;
        }

        const { index, length } = prevRange.value;
        const text = quillInstance.getText(index, length);
        // quillInstance.setSelection(null);

        const selection = await createSelection({
            code,
            index,
            length,
            text,
        });

        if (!selection) {
            console.error('Failed to create selection');
        }
    });
});

const updating = ref(false);

onUnmounted(() => {
    if (quillInstance) {
        quillInstance = null;
        dispose();
    }
});

// TODO move to useContextMenu
const showContextMenu = (event) => {
    if (event.ctrlKey || event.metaKey) {
        // Allow the browser's context menu to appear
        return;
    }
    event.preventDefault();

    const selectedArea = quillInstance.getSelection();
    const hasSelection = selectedArea?.length;
    const linkedCodeId = event.target.getAttribute('data-code-id');
    const currentSelections = selectionsByIndex(
        selectedArea?.index,
        linkedCodeId
    );

    if (!hasSelection && !currentSelections.length) {
        return;
    }
    markToDelete(currentSelections);

    let lowest = selectedArea.index;
    let highest = selectedArea.index + selectedArea.length;

    if (currentSelections.length) {
        currentSelections.forEach((selection) => {
            if (selection.start < lowest) lowest = selection.start;
            if (selection.end > highest) highest = selection.end;
        });
    }

    const hm = quillInstance.getModule('highlight');
    hm.current({ index: lowest, length: highest - lowest });

    // use bounding rect to safely place the menu
    // const rect = quillInstance.getBounds(lowest, highest - lowest);

    openCTM();
    const contextMenuElement = document.getElementById('contextMenu');

    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    let menuWidth = windowWidth / 4;
    if (menuWidth < 320) menuWidth = 320;

    let mouseX = event.clientX;
    if (mouseX < menuWidth / 2) mouseX = menuWidth / 2;

    let menuX = mouseX - menuWidth / 2;
    const offsetX = windowWidth - (mouseX + menuWidth / 2);
    if (offsetX < 0) menuX += offsetX;

    contextMenuElement.style.left = `${menuX}px`;
    contextMenuElement.style.width = `${menuWidth}px`;
    contextMenuElement.style.maxHeight = `${windowHeight / 3}px`;
    contextMenuElement.classList.remove('hidden');

    // Force a slight layout update so we can measure the contextMenu's dimensions
    contextMenuElement.offsetHeight;

    if (event.clientY + contextMenuElement.offsetHeight > windowHeight) {
        // If the context menu would go out of bounds, adjust its top position
        contextMenuElement.style.top = `${windowHeight - contextMenuElement.offsetHeight}px`;
    } else {
        contextMenuElement.style.top = `${event.clientY + 20}px`;
    }
};

const contextMenuClosed = () => {
    if (!quillInstance) return;
    const hm = quillInstance.getModule('highlight');
    hm.current();
};

defineExpose({ editorContent });
</script>

<style scoped>
.ql-container.ql-snow {
    line-height: 18.4667;
    border: none !important;
}

#lineNumber {
    text-align: end;
    font-size: 10px;
    font-family: 'Lucida Console', monospace, sans-serif;
    padding: 12px 5px;
    line-height: 18.4667;
    vertical-align: top;
    box-sizing: border-box;
}
</style>
