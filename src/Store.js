const save = (key, value) => {
    localStorage.setItem(
        `_ludr.${key}`,
        JSON.stringify({
            data: value
        })
    )
}

const get = (key) => JSON.parse(localStorage.getItem(`_ludr.${key}`)).data

const remove = (key) => localStorage.removeItem(key)

export default Object.freeze({
    save,
    get,
    remove
})