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
    Object.keys(internalData).forEach(typeOrName => {
        if (typeof internalData[typeOrName] === "object") {
            let type = typeOrName
            selectOptions[type] = []
            Object.keys(internalData[type]).forEach(name => {
                selectOptions[type].push(
                    (function () {
                        let optionElement = document.createElement('option')
                        optionElement.value = internalData[type][name]
                        optionElement.text = name
                        return optionElement
                    })()
                )
            })
        } else if (typeof internalData[typeOrName] === "string") {
            let type = "no_type"
            let name = typeOrName
            if (!selectOptions[type]) {
                selectOptions[type] = []
            }
            selectOptions[type].push(
                (function () {
                    let optionElement = document.createElement('option')
                    optionElement.value = internalData[name]
                    optionElement.text = name
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
            character: "",
            map: "",
            startdate: "",
            enddate: ""
        }
        for (let pair of formData.entries()) {
            switch (pair[0]) {
                case "選擇角色":
                    userInputData.character = pair[1]
                    break;
                case "選擇地圖":
                    userInputData.map = pair[1]
                    break;
                case "起始日期":
                    if (pair[1]) {
                        let startdate = pair[1] ? new Date(pair[1]) : new Date()
                        startdate.setHours(0)
                        startdate.setMinutes(0)
                        startdate.setSeconds(0)
                        userInputData.startdate = startdate
                    } else {
                        userInputData.startdate = ""
                    }
                    break;
                case "結束日期":
                    if (pair[1]) {
                        let enddate = pair[1] ? new Date(pair[1]) : new Date()
                        enddate.setHours(23)
                        enddate.setMinutes(59)
                        enddate.setSeconds(59)
                        userInputData.enddate = enddate
                    } else {
                        userInputData.enddate = ""
                    }
                    break;
                default:
                    break;
            }
        }
        console.log("userInputData", userInputData)
        return userInputData
    }

    const queryData = async function (userInputData) {
        let db = new Dexie('GameRecord')
        db.version(0.1).stores({
            gameRecords: 'timestamp,character,map,result,timestamp'
        })
        db.open()
        let tableCollection = db.gameRecords
        let filtersCount = 0
        Object.keys(userInputData).forEach(key => {
            if (userInputData[key]) {
                switch (key) {
                    case 'character':
                        if (!filtersCount) {
                            tableCollection = tableCollection.where("character").equals(userInputData.character)
                        } else {
                            tableCollection = tableCollection.and((record) => record.character == userInputData.character)
                        }
                        filtersCount++
                        break;
                    case "map":
                        if (!filtersCount) {
                            tableCollection = tableCollection.where("character").equals(userInputData.character)
                        } else {
                            tableCollection = tableCollection.and((record) => record.map == userInputData.map)
                        }
                        filtersCount++
                        break;
                    case "startdate":
                        let startdateTime = userInputData.startdate.getTime()
                        if (!filtersCount) {
                            tableCollection = tableCollection.where("timestamp").aboveOrEqual(startdateTime)
                        } else {
                            tableCollection = tableCollection.and((record) => record.timestamp >= startdateTime)
                        }
                        filtersCount++
                        break;
                    case "enddate":
                        let enddateTime = userInputData.enddate.getTime()
                        if (!filtersCount) {
                            tableCollection = tableCollection.where("timestamp").belowOrEqual(enddateTime)
                        } else {
                            tableCollection = tableCollection.and((record) => record.timestamp <= enddateTime)
                        }
                        filtersCount++
                        break;
                    default:
                        break;
                }
            }
        })
        tableCollection.each((record) => {
            console.log(record)
        })
    }

    /* ------------------------------ Main ------------------------------ */
    console.log('submit', e)
    if (e.preventDefault) e.preventDefault()

    retrieveFormData()
        .then(queryData)
        .catch((formDataError) => {
            console.error("Form Data Error", formDataError)
            return false
        })
})