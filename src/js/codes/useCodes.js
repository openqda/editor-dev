import codes from '../../data/codes.json'
import {AbstractStore} from '../store/AbstractStore.js'
import {computed, reactive, toRefs} from 'vue'

const store = new AbstractStore({
    namespace: 'codes',
})
codes.forEach(code => store.create(code))

const state = reactive({
    initialized: false
})

export const useCodes = () => {
    const codes = computed(() => store.all())

    return {
        create: store.create,
        read: store.read,
        update: store.update,
        delete: store.delete,
        codes
    }
}
