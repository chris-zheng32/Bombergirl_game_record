// import characters from '../../data/characters';
// import idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

/**
 * 欄位選項生成器
 * @param {string} fieldId 下拉式選單欄位ID(CSS Selector形式)
 */
const selectOptionsGenerator = (fieldId) => {
    let internalData = {}
    switch (fieldId) {
        case '#select_character':
            internalData = characters
            break;
        case '#select_map':
            internalData = maps
            break;
        default:
            break;
    }

    let selectOptions = {}
    Object.keys(internalData).forEach(typeOrId => {
        if (typeof internalData[typeOrId] === "object") {
            let type = typeOrId
            selectOptions[type] = []
            Object.keys(internalData[type]).forEach(id => {
                selectOptions[type].push(
                    (function () {
                        let optionElement = document.createElement('option')
                        optionElement.value = id
                        optionElement.text = internalData[type][id]
                        return optionElement
                    })()
                )
            })
        } else if (typeof internalData[typeOrId] === "string") {
            let type = "no_type"
            let id = typeOrId
            if (!selectOptions[type]) {
                selectOptions[type] = []
            }
            selectOptions[type].push(
                (function () {
                    let optionElement = document.createElement('option')
                    optionElement.value = id
                    optionElement.text = internalData[id]
                    return optionElement
                })()
            )
        }
    })
    let selectField = document.querySelector(fieldId)
    if (selectField) {
        Object.keys(selectOptions).forEach(type => {
            if (type != "no_type") {
                let optionGroupEle = document.createElement('optgroup')
                optionGroupEle.label = type
                selectOptions[type].forEach(oneOptions => {
                    optionGroupEle.appendChild(oneOptions)
                })
                selectField.appendChild(optionGroupEle)
            } else {
                selectOptions["no_type"].forEach(oneOptions => {
                    selectField.appendChild(oneOptions)
                })
            }
        })
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

    selectOptionsGenerator('#select_character')
    selectOptionsGenerator('#select_map')
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