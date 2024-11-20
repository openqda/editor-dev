<script setup lang="ts">
import {
  TrashIcon,
  ArrowsRightLeftIcon,
  XMarkIcon,
} from '@heroicons/vue/24/solid';
import { cn } from '../utils/css/cn';
import { ref, computed, watch } from 'vue';
import { vClickOutside } from '../components/clickOutsideDirective';
import CodingContextMenuItem from './CodingContextMenuItem.vue';
import { useSelections } from '../selections/useSelections';
import { useContextMenu } from './useContextMenu';
import { useCodes } from '../codes/useCodes';
import { useRange } from '../editor/useRange';

const { prevRange } = useRange();
const { close, isOpen } = useContextMenu();
const { codes } = useCodes();
const { toDelete, deleteSelection } = useSelections();
const emit = defineEmits(['code-selected', 'code-deleted', 'close']);
const query = ref('');
const toDeleteSize = ref(0);
watch(toDelete, (entries) => {
  const len = entries?.length;
  toDeleteSize.value = len ?? 0;
});

const reassign = ref(null);
console.debug(codes)
const onClose = () => {
  if (isOpen) {
    reassign.value = null;
    query.value = '';
    close();
    emit('close');
  }
};
</script>

<template>
  <div
    v-click-outside="{ callback: onClose }"
    id="contextMenu"
    :class="
      cn(
        'fixed p-3 z-50 bg-surface border-background border-4 max-h-screen mt-1 overflow-auto rounded-md shadow-lg overflow-y-scroll',
        isOpen !== true && 'hidden'
      )
    "
  >
    <div v-if="toDeleteSize && !prevRange?.length" class="mb-6 space-y-2">
      <div class="block w-full text-xs font-semibold">
        Edit linked selections
      </div>
      <div
        class="text-sm space-y-2"
        v-for="selection in toDelete"
        :key="selection.id"
      >
        <div class="contents" v-if="reassign ? reassign === selection : true">
          <div class="border-border border-t">
            <div class="flex items-baseline my-2">
              <span class="text-xs font-semibold font-mono flex-grow">
                {{ selection.start }}:{{ selection.end }}
              </span>
              <button
                v-if="toDeleteSize > 0"
                size="sm"
                :title="
                  reassign
                    ? 'Cancel reassign for this selection'
                    : 'Reassign another code to this selection'
                "
                variant="outline"
                class="p-2"
                @click.prevent="
                  () => {
                    reassign = reassign === selection ? null : selection;
                  }
                "
              >
                <XMarkIcon v-show="selection === reassign" class="w-4 h-4" />
                <ArrowsRightLeftIcon
                  v-show="selection !== reassign"
                  class="w-4 h-4"
                />
              </button>
              <button
                size="sm"
                title="Delete this selection"
                variant="destructive"
                class="p-2"
                @click.prevent="deleteSelection(selection) && close()"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
            <p class="line-clamp-2">{{ selection.text }}</p>
          </div>
          <div
            class="w-full p-2 my-1 rounded-md line-clamp-1"
            :style="`background: ${selection.code.color};`"
          >
            {{ selection.code.name }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="
        codes?.length &&
        (!toDeleteSize || reassign || prevRange?.length)
      "
    >
      <div class="block w-full text-xs font-semibold">
        {{
          reassign
            ? `Reassign another code to ${reassign.start}:${reassign.end}`
            : 'Assign a new code to selection'
        }}
      </div>

      <ul>
        <CodingContextMenuItem
          v-for="code in codes"
          :reassign="reassign"
          :key="code.id"
          :code="code"
          :parent="null"
        />
      </ul>
    </div>
  </div>
</template>

<style scoped></style>
