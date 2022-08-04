// import characters from '../../data/characters';
// import idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

/**
 * 欄位選項生成器
 */
const selectOptionsGenerators = {
    charactersOptions: () => {
        let charactersSelectOptions = {}
        Object.keys(characters).forEach(characterTypeOrName => {
            if (typeof characters[characterTypeOrName] === "object") {
                let characterType = characterTypeOrName
                charactersSelectOptions[characterType] = []
                Object.keys(characters[characterType]).forEach(characterName => {
                    charactersSelectOptions[characterType].push(
                        (function () {
                            let optionElement = document.createElement('option')
                            optionElement.value = characters[characterType][characterName]
                            optionElement.text = characterName
                            return optionElement
                        })()
                    )
                })
            } else if (typeof characters[characterTypeOrName] === "string") {
                let characterType = "no_type"
                let characterName = characterTypeOrName
                if (!charactersSelectOptions[characterType]) {
                    charactersSelectOptions[characterType] = []
                }
                charactersSelectOptions[characterType].push(
                    (function () {
                        let optionElement = document.createElement('option')
                        optionElement.value = characters[characterName]
                        optionElement.text = characterName
                        return optionElement
                    })()
                )
            }
        })
        let selectCharactersField = document.querySelector('#select_character')
        if (selectCharactersField) {
            Object.keys(charactersSelectOptions).forEach(characterType => {
                if (characterType != "no_type") {
                    let optionGroupEle = document.createElement('optgroup')
                    optionGroupEle.label = characterType
                    charactersSelectOptions[characterType].forEach(oneOptions => {
                        optionGroupEle.appendChild(oneOptions)
                    })
                    selectCharactersField.appendChild(optionGroupEle)
                } else {
                    charactersSelectOptions["no_type"].forEach(oneOptions => {
                        selectCharactersField.appendChild(oneOptions)
                    })
                }
            })
        }
    },
    mapsOptions: () => {
        let mapsSelectOptions = {}
        Object.keys(maps).forEach(mapsTypeOrName => {
            if (typeof maps[mapsTypeOrName] === "object") {
                let mapType = mapsTypeOrName
                mapsSelectOptions[mapType] = []
                Object.keys(maps[mapType]).forEach(mapName => {
                    mapsSelectOptions[mapType].push(
                        (function () {
                            let optionElement = document.createElement('option')
                            optionElement.value = maps[mapType][mapName]
                            optionElement.text = mapName
                            return optionElement
                        })()
                    )
                })
            } else if (typeof maps[mapsTypeOrName] === "string") {
                let mapType = "no_type"
                let mapName = mapsTypeOrName
                if (!mapsSelectOptions[mapType]) {
                    mapsSelectOptions[mapType] = []
                }
                mapsSelectOptions[mapType].push(
                    (function () {
                        let optionElement = document.createElement('option')
                        optionElement.value = maps[mapName]
                        optionElement.text = mapName
                        return optionElement
                    })()
                )
            }
        })
        let selectMapsField = document.querySelector('#select_map')
        if (selectMapsField) {
            Object.keys(mapsSelectOptions).forEach(mapType => {
                if (mapType != "no_type") {
                    let optionGroupEle = document.createElement('optgroup')
                    optionGroupEle.label = mapType
                    mapsSelectOptions[mapType].forEach(oneOptions => {
                        optionGroupEle.appendChild(oneOptions)
                    })
                    selectMapsField.appendChild(optionGroupEle)
                } else {
                    mapsSelectOptions["no_type"].forEach(oneOptions => {
                        selectMapsField.appendChild(oneOptions)
                    })
                }
            })
        }
    }
}

/**
 * 表單資料驗證器
 */
const formDataValidators = {
    character: function (userInputData) {
        return (userInputData.character) ? true : false
    },
    map: function (userInputData) {
        return (userInputData.map) ? true : false
    },
    gameResult: function (userInputData) {
        return (userInputData.result) ? true : false
    }
}

// 頁面載入時，為下拉式選單塞選項
window.onload = () => {
    let form = document.querySelector('#record')

    selectOptionsGenerators.charactersOptions()
    selectOptionsGenerators.mapsOptions()
}

// 表單Submit後的Event Handler
document.querySelector('#record').addEventListener('submit', async (e) => {
    /* ------------------------------ Functions ------------------------------ */
    /**
     * 取得表單資料
     * @returns 
     */
    const retrieveFormData = async function () {
        let formData = new FormData(document.querySelector("#record"))
        let userInputData = {
            timestamp: new Date().getTime(),
            character: "",
            map: "",
            result: ""
        }
        for (let pair of formData.entries()) {
            switch (pair[0]) {
                case "選擇角色":
                    userInputData.character = pair[1]
                    break;
                case "選擇地圖":
                    userInputData.map = pair[1]
                    break;
                case "選擇勝負":
                    userInputData.result = pair[1]
                    break;
                default:
                    break;
            }
        }
        console.log("userInputData", userInputData)
        return userInputData
    }

    /**
     * 驗證表單資料
     * @param {Object} userInputData 表單資料
     * @returns 
     */
    const validateFormData = async function (userInputData) {
        let invalidFieldsNameList = []
        if (!formDataValidators.character(userInputData)) {
            invalidFieldsNameList.push("角色")
        }
        if (!formDataValidators.map(userInputData)) {
            invalidFieldsNameList.push("地圖")
        }
        if (!formDataValidators.gameResult(userInputData)) {
            invalidFieldsNameList.push("勝負")
        }
        if (invalidFieldsNameList.length > 0) {
            alert(`請填寫${invalidFieldsNameList.join('、')}`)
            throw `請填寫${invalidFieldsNameList.join('、')}`
        } else {
            return userInputData
        }
    }

    /**
     * 資料寫進資料庫
     * @param {Object} userInputData 
     */
    const writeDb = async function (userInputData) {
        console.log("open db...")
        let dbPromise = await idb.openDB("GameRecord", "1", {
            upgrade(db) {
                console.log("create db...")
                let dbStore = db.createObjectStore("gameRecords", {
                    keyPath: "timestamp"
                })
                dbStore.createIndex('timestamp', 'timestamp')
            }
        })
        
        console.log("add data to db...")
        let dataKey = await dbPromise.add('gameRecords', userInputData)
        console.log("dataKey", dataKey)
    }

    /* ------------------------------ Main ------------------------------ */
    console.log('submit', e)
    if (e.preventDefault) e.preventDefault()

    retrieveFormData()
        .then(validateFormData)
        .then(writeDb)
        .catch((formDataError) => {
            console.error("Form Data Error", formDataError)
            return false
        })
        .then(() => {
            console.log("final step...")
            if (confirm('是否繼續輸入？')) {
                return true
            } else {
                document.location.href = '../../index.html' // PS: 路徑建議不要這樣寫...
            }
        })
})