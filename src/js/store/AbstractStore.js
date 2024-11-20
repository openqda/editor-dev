import {reactive} from 'vue'

export class AbstractStore {
    constructor ({ namespace, data = {} }) {
        this.namespace = namespace
        this.data = reactive(data)
    }

    create (entry) {
        this.data[entry.id] = entry
        if (entry.children?.length) {
            entry.children.forEach(child => {
                this.create(child)
            })
        }
        return this.data[entry.id]
    }

    read (id) {
        const entry = this.data[entry.id]
        if (!entry) throw new Error(`${this.namespace}: Entry by id ${id} not found.`)
        return entry
    }

    update (id, obj) {
        const entry = this.entry(id)

        // xxx: somehow Object.assign messes up the reactivity
        Object.entries(obj).forEach(([key, value]) => {
            entry[key] = value
        })
    }

    delete (id) {
        const entry = this.entry(id)
        delete this.data[id]
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
