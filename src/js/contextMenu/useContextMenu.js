import { toRefs, reactive } from 'vue';

const state = reactive({
  openWith: null,
  isOpen: false,
  selected: null,
});

export const useContextMenu = () => {
  const { openWith, isOpen, selected } = toRefs(state);

  const open = (codeId) => {
    state.openWith = codeId;
    state.isOpen = true;
    return true;
  };

  const close = () => {
    state.isOpen = false;
    return true;
  };

  const select = (code) => {
      state.selected = code
  }

  return {
    openWith,
    open,
    close,
    isOpen,
    select,
    selected,
  };
};
