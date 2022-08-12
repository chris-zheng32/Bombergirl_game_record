// import characters from '../../data/characters';
// import idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

let db // Dexie Instance

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
                    id="statisticOverview1"
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
                </div>
                <div
                    class="ts-grid is-3-columns"
                    id="statisticOverview2"
                >
                    <div class="column">
                        <div class="ts-text is-label">勝率</div>
                        <div class="ts-statistic">
                            <div class="value">${values.winRate * 100 || "-"}</div>
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
            ${(function (values) {
                let tableBodyStr = ""
                for (let i = 0; i < 10; i++) {
                    let oneGameResult = values.recent10GameResult.results[i]
                    if (oneGameResult) {
                        tableBodyStr += `
                        <tr>
                            <td>${new Date(oneGameResult.timestamp).toLocaleString()}</td>
                            <td>${oneGameResult.characterType || "-"}</td>
                            <td>${characters[oneGameResult.character].name || "-"}</td>
                            <td>${maps[oneGameResult.map].name || "-"}</td>
                            <td>${oneGameResult.result || "-"}</td>
                            <td>${oneGameResult.score || "-"}</td>
                        </tr>
                        `
                    } else {
                        break
                    }
                }
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
    Object.keys(internalData).forEach(id => {
        let type = internalData[id].type || "no_type"
        let name = internalData[id].name
        if (!selectOptions[type])
            selectOptions[type] = []
        selectOptions[type].push(
            (function () {
                let optionElement = document.createElement('option')
                optionElement.value = id
                optionElement.text = name
                return optionElement
            })()
        )
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
    let tableCollection = db.gameRecords
    let filtersCount = 0
    let userInputData_Keys = Object.keys(userInputData)
    // 下條件
    userInputData_Keys.forEach(key => {
        if (userInputData[key]) {
            switch (key) {
                case 'characterType':
                    if (!filtersCount) {
                        tableCollection = tableCollection.where('character').startsWith(userInputData.characterType)
                    } else {
                        tableCollection = tableCollection.and((record) => record.character.includes(userInputData.characterType))
                    }
                    filtersCount++
                    break;
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
                        tableCollection = tableCollection.where("map").equals(userInputData.map)
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

    // 排序 & 取得query結果
    let queryResults
    if (userInputData_Keys.length == 0) {
        tableCollection = tableCollection.orderBy('timestamp')
        tableCollection.reverse()
        queryResults = await tableCollection.toArray()
    } else {
        tableCollection.reverse()
        queryResults = await tableCollection.sortBy('timestamp')
    }
    console.log("queryResults", queryResults)

    // 統整
    let gameRecordsResults = {
        "winAmount": 0,
        "drawAmount": 0,
        "loseAmount": 0,
        "winRate": 0,
        "avgScore": 0,
        "recent10GameResult": {
            "results": [],
            "consolidateData": {
                "winAmount": 0,
                "drawAmount": 0,
                "loseAmount": 0,
                "winRate": 0,
                "avgScore": 0
            }
        }
    }
    let queryCount = 1
    let totalScore = 0, validScoreCount = 0
    let recent10GameTotalScore = 0, recent10GameValidScoreCount = 0
    queryResults.forEach(queryResult => {
        Object.keys(queryResult).forEach(queryResultKey => {
            switch (queryResultKey) {
                case "result":
                    if (queryResult.result == "win") {
                        gameRecordsResults.winAmount++
                        if (queryCount <= 10) {
                            gameRecordsResults.recent10GameResult.consolidateData.winAmount++
                        }
                    } else if (queryResult.result == "lose") {
                        gameRecordsResults.loseAmount++
                        if (queryCount <= 10) {
                            gameRecordsResults.recent10GameResult.consolidateData.loseAmount++
                        }
                    } else if (queryResult.result == "draw") {
                        gameRecordsResults.drawAmount++
                        if (queryCount <= 10) {
                            gameRecordsResults.recent10GameResult.consolidateData.drawAmount++
                        }
                    }
                    break;
                case "score":
                    if (queryResult.score) {
                        totalScore += Number(queryResult.score)
                        validScoreCount++
                        if (queryCount <= 10) {
                            recent10GameTotalScore += Number(queryResult.score)
                            recent10GameValidScoreCount++
                        }
                    }
                default:
                    break;
            }
        })
        if (queryCount <= 10) {

            gameRecordsResults.recent10GameResult.results.push(queryResult)
        }
        queryCount++
    })
    gameRecordsResults.winRate = Math.round((gameRecordsResults.winAmount / queryResults.length) * 100) / 100
    gameRecordsResults.avgScore = Math.round(totalScore / validScoreCount)
    gameRecordsResults.recent10GameResult.consolidateData.winRate = Math.round((gameRecordsResults.recent10GameResult.consolidateData.winAmount / gameRecordsResults.recent10GameResult.results.length) * 100) / 100
    gameRecordsResults.recent10GameResult.consolidateData.avgScore = Math.round(recent10GameTotalScore / recent10GameValidScoreCount)
    console.log("gameRecordsResults", gameRecordsResults)
    return gameRecordsResults
}

const renderStatistic = async function (gameRecordsResults) {
    let statisticDiv = document.querySelector("#statistic")
    let statisticBlockNode = document.querySelector("#statisticBlock")
    if (statisticBlockNode)
        statisticDiv.removeChild(document.querySelector("#statisticBlock"))
    statisticDiv.innerHTML = statisticHTML.allData(gameRecordsResults)
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

// 頁面載入時，為下拉式選單塞選項 & 取得並秀出過往遊戲紀錄
window.onload = async () => {
    let form = document.querySelector('#record')

    selectOptionsGenerator('#select_character')
    selectOptionsGenerator('#select_map')

    db = new Dexie('GameRecord')
    db.version(0.1).stores({
        gameRecords: 'timestamp,character,map,result,timestamp'
    })
    await db.open()
    queryData({}).then(renderStatistic)

    // let statisticDiv = document.querySelector("#statistic")
    // statisticDiv.innerHTML = statisticHTML.allData({
    //     "winAmount": 500,
    //     "drawAmount": 10,
    //     "loseAmount": 490,
    //     "winRate": 0.5,
    //     "avgScore": 2000,
    //     "recent10GameResult": {
    //         "results": [
    //             {
    //                 gameDatetime: 1660111743624,
    //                 characterType: "Bomber",
    //                 character: "Bomber_1",
    //                 map: "地圖1-1",
    //                 result: "勝",
    //                 score: 2500
    //             },
    //             {
    //                 gameDatetime: 1660111443624,
    //                 characterType: "Shooter",
    //                 character: "Shooter_1",
    //                 map: "地圖2-1",
    //                 result: "負",
    //                 score: 1500
    //             }
    //         ],
    //         "consolidateData": {
    //             "winAmount": 1,
    //             "winRate": 0.5,
    //             "avgScore": 2000
    //         }
    //     }
    // })
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
            // characterType: "",
            // character: "",
            // map: "",
            // startdate: "",
            // enddate: ""
        }
        for (let pair of formData.entries()) {
            switch (pair[0]) {
                case "選擇角色類型":
                    if(pair[1])
                        userInputData.characterType = pair[1]
                    break;
                case "選擇角色":
                    if(pair[1])
                        userInputData.character = pair[1]
                    break;
                case "選擇地圖":
                    if(pair[1])
                        userInputData.map = pair[1]
                    break;
                case "起始日期":
                    if (pair[1]) {
                        let startdate = pair[1] ? new Date(pair[1]) : new Date()
                        startdate.setHours(0)
                        startdate.setMinutes(0)
                        startdate.setSeconds(0)
                        userInputData.startdate = startdate
                    }
                    break;
                case "結束日期":
                    if (pair[1]) {
                        let enddate = pair[1] ? new Date(pair[1]) : new Date()
                        enddate.setHours(23)
                        enddate.setMinutes(59)
                        enddate.setSeconds(59)
                        userInputData.enddate = enddate
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
        .then(renderStatistic)
        .catch((formDataError) => {
            console.error("Form Data Error", formDataError)
            return false
        })
})