import { toRefs, reactive } from 'vue';

const state = reactive({
  // cache of the last range until overridden by a new range
  prevRange: null,

  // current range, immediately reset if range looses focus
  range: null,

  // assciated text with current range
  text: '',
});

/**
 * Composable for editor selection ranges
 */
export const useRange = () => {
  const { range, prevRange, text } = toRefs(state);
  const setRange = (data, txt) => {
    if (data !== null) {
      const { index, length } = data;

      const end = index + length;
      const start = index;
      const r = { index, length, start, end };
      state.prevRange = r;
      state.range = r;

      if (txt) {
        state.text = txt;
      }
    } else {
      state.range = data;
      state.text = '';
    }
  };
  return {
    range,
    prevRange,
    setRange,
    text,
  };
};
