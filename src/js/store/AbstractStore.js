import { reactive, ref } from 'vue'

export class AbstractStore {
    constructor ({ namespace, data = {} }) {
        this.namespace = namespace
        this.data = reactive(data)
        this.size = ref(0)
    }

    create (entry) {
        this.data[entry.id] = entry
        this.size.value++

        if (entry.children?.length) {
            entry.children.forEach(child => {
                this.create(child)
            })
        }
        return this.data[entry.id]
    }

    read (id) {
        const entry = this.data[id]
        if (!entry) throw new Error(`${this.namespace}: Entry by id ${id} not found.`)
        return entry
    }

    update (id, obj) {
        const entry = this.read(id)

        // xxx: somehow Object.assign messes up the reactivity
        Object.entries(obj).forEach(([key, value]) => {
            entry[key] = value
        })
    }

    delete (id) {
        const entry = this.read(id)
        delete this.data[id]
        this.size.value--

        if (entry.children?.length) {
            entry.children.forEach(child => {
                this.delete(child)
            })
        }
    }

    all () {
        return Object.values(this.data)
    }
}
