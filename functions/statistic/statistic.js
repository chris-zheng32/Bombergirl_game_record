// import characters from '../../data/characters';
// import idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

let statisticData = {
    "winAmount": "",
    "drawAmount": "",
    "loseAmount": "",
    "winRate": "",
    "avgScore": "",
    "recent10GameResult": {
        "results": [
            /*
            預期格式：
            {
                "gameDatetime": 遊戲時間,
                "characterType": 角色類型,
                "character": 角色,
                "map": 地圖,
                "result": 遊戲結果,
                "score": 分數
            }
             */
        ],
        "consolidateData": {
            "winAmount": "",
            "winRate": "",
            "avgScore": ""
        }
    }
}

let statisticHTML = {
    allData: (values) => {
        return `
        <fieldset id="statisticBlock" class="ts-fieldset">
            <legend>統計數據</legend>
            <div class="ts-wrap is-vertical">
                <div
                    class="ts-grid is-3-columns"
                    id="statisticOverview"
                >
                    <!-- 概覽 -->
                    <div class="column">
                        <div class="ts-text is-label">勝場</div>
                        <div class="ts-statistic">
                            <div class="value">${values.winAmount || "-"}</div>
                            <div class="unit">場</div>
                        </div>
                    </div>
                    <div class="column">
                        <div class="ts-text is-label">平局</div>
                        <div class="ts-statistic">
                            <div class="value">${values.drawAmount || "-"}</div>
                            <div class="unit">場</div>
                        </div>
                    </div>
                    <div class="column">
                        <div class="ts-text is-label">敗場</div>
                        <div class="ts-statistic">
                            <div class="value">${values.loseAmount || "-"}</div>
                            <div class="unit">場</div>
                        </div>
                    </div>
                    <div class="column">
                        <div class="ts-text is-label">勝率</div>
                        <div class="ts-statistic">
                            <div class="value">${values.winRate*100 || "-"}</div>
                            <div class="unit">%</div>
                        </div>
                    </div>
                    <div class="column">
                        <div class="ts-text is-label">平均分</div>
                        <div class="ts-statistic">
                            <div class="value">${values.avgScore || "-"}</div>
                        </div>
                    </div>
                </div>
                <br>
                
                <!-- 近十場表現 -->
                <div class="ts-header is-center-aligned is-big">近十場表現</div>
                <table class="ts-table">
                    <thead>
                        <tr>
                            <th>時間</th>
                            <th>位置</th>
                            <th>角色</th>
                            <th>地圖</th>
                            <th>勝負</th>
                            <th>分數</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(function(values){
                            let tableBodyStr = ""
                            values.recent10GameResult.results.forEach((oneGameResult) => {
                                tableBodyStr += `
                                <tr>
                                    <td>${new Date(oneGameResult.gameDatetime).toLocaleString()}</td>
                                    <td>${oneGameResult.characterType || "-"}</td>
                                    <td>${oneGameResult.character || "-"}</td>
                                    <td>${oneGameResult.map || "-"}</td>
                                    <td>${oneGameResult.result || "-"}</td>
                                    <td>${oneGameResult.score || "-"}</td>
                                </tr>
                                `
                            })
                            return tableBodyStr
                        })(values)}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>勝場：${values.recent10GameResult.consolidateData.winAmount || "-"}</td>
                            <th colspan="2">勝率：${values.recent10GameResult.consolidateData.winRate * 100 || "-"}%</td>
                            <th colspan="3">平均分：${values.recent10GameResult.consolidateData.avgScore || "-"}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </fieldset>`
    },
    filteredData: ``
}

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

    let statisticDiv = document.querySelector("#statistic")
    statisticDiv.innerHTML = statisticHTML.allData({
        "winAmount": 500,
        "drawAmount": 10,
        "loseAmount": 490,
        "winRate": 0.5,
        "avgScore": 2000,
        "recent10GameResult": {
            "results": [
                {
                    gameDatetime: 1660111743624,
                    characterType: "Bomber",
                    character: "測試Bomber_1",
                    map: "地圖1-1",
                    result: "勝",
                    score: 2500
                },
                {
                    gameDatetime: 1660111443624,
                    characterType: "Shooter",
                    character: "測試Shooter_1",
                    map: "地圖2-1",
                    result: "負",
                    score: 1500
                }
            ],
            "consolidateData": {
                "winAmount": 1,
                "winRate": 0.5,
                "avgScore": 2000
            }
        }
    })
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