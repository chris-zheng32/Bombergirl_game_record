import characters from '../../data/characters';
// import idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

window.onload = () => {
    let form = document.querySelector('#record')

    let charactersSelectOptions
    if(characters.length){
        charactersSelectOptions = []
        Object.keys(characters).forEach(characterName => {
            charactersSelectOptions.push(
                (function() {
                    let optionElement = document.createElement('option')
                    optionElement.value = characters[characterName]
                    optionElement.text = characterName
                    return optionElement
                })()
            )
        })
        charactersSelectOptions.forEach(oneOptions => {
            
        })
    }
}

document.querySelector('#record').addEventListener('submit', (e) => {
    console.log('submit', e)
    if(confirm('是否繼續輸入？')){
        return true
    } else {
        document.location.href = '../../index.html' // PS: 路徑建議不要這樣寫...
    }
})