// 用來作為表單選項的
var characters = {
    "Bomber": {
        "Bomber_1": "小白",
        "Bomber_2": "小黑"
    },
    "Attacker": {

    },
    "Shooter": {

    },
    "Blocker": {

    },
    "Test1": "測試1",
    "Test2": "測試2"
}
/*
    一個思路：
    如果表單選項有要分組，格式如下：
    {
        分類名稱: {
            角色ID_1: 角色名稱1,
            角色ID_2: 角色名稱2
            .
            .
            .
        },
        .
        .
        .
    }
    如果表單選項沒有要分組，格式如下：
    {
        角色ID_1: 角色名稱1,
        角色ID_2: 角色名稱2
        .
        .
        .
    }
*/

// module.exports = characters