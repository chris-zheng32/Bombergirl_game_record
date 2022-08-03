// 用來作為表單選項的
var characters = {
    "Bomber": {
        "小白": "Bomber_1",
        "小黑": "Bomber_2",
    },
    "Attacker": {

    },
    "Shooter": {

    },
    "Blocker": {

    }
}
/*
    一個思路：
    如果表單選項有要分組，格式如下：
    {
        分類名稱: {
            角色名稱1: 角色ID,
            角色名稱2: 角色ID,
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
        角色名稱1: 角色ID,
        角色名稱2: 角色ID,
        .
        .
        .
    }
*/

module.exports = characters