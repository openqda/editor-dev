import { AbstractStore } from './AbstractStore';
import { describe, it, expect, beforeEach } from 'vitest';

describe(AbstractStore.constructor.name, () => {
    let id
    let store
    const namespace = 'foo'
    beforeEach(() => {
        id = Math.floor(Math.random() * 100);
        store = new AbstractStore({
            namespace,
            data: {}
        })
    })

    it('creates a new entry', () => {
        const doc = { id }
        expect(store.size.value).to.equal(0)
        expect(() => store.read(id)).toThrowError(
            `${namespace}: Entry by id ${id} not found.`
        )
        store.create(doc)
        expect(store.size.value).to.equal(1)
        expect(store.read(id)).toEqual(doc)
    })

    it('updates an entry', () => {
        const doc = { id }
        store.create(doc)
        store.update(id, { name: 'moo' })
        expect(store.read(id)).toEqual({ id, name: 'moo' })
    })

    it('deletes an entry', () => {
        const doc = { id }
        store.create(doc)
        expect(store.size.value).to.equal(1)
        store.delete(id)
        expect(store.size.value).to.equal(0)
        expect(() => store.read(id)).toThrowError(
            `${namespace}: Entry by id ${id} not found.`
        )
    })
})
