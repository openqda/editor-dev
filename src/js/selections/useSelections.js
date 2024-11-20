import {computed, reactive, toRef, toRefs} from 'vue'
import {AbstractStore} from '../store/AbstractStore.js'
import {randomUUID} from '../utils/randomUUID.js'

const store = new AbstractStore({
    namespace: 'selections'
})

const state = reactive({
    current: null,
    toDelete: [],
})

export const useSelections = () => {
    const selections  = computed(() => store.all())
    const { selected, current, toDelete } = toRefs(state)

    const selectionsByIndex = (index) => {
        return selections.value.filter(({ start, end }) => {
            return start <= index && end >= index;
        });
    }

    const markToDelete = (codes) => {
        state.toDelete = codes;
    };
    const markCurrentByCodeId = (selection) => {
        state.current = selection;
    };
    const reassignCode = () => {}

    return {
        selections,
        selectionsByIndex,
        markToDelete,
        markCurrentByCodeId,
        reassignCode,
        create: ({ code, index, length, text }) => {
            const id = randomUUID()
            const selection = store.create({
                id,
                start: index,
                length,
                end: length - index,
                text,
                code
            })
            code.selections = code.selections ?? []
            code.selections.push(selection)
            return selection
        },
        read: store.read,
        update: store.update,
        delete: store.delete
    }
}
