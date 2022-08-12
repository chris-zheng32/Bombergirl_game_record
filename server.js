const http = require('http')
const fs = require('fs')

let resourceList = {
    
}

let html
let css
let appJs
let swJs
let manifest

fs.readFile('./index.html', function (err, data) {
    if (err) {
        throw err
    }
    resourceList.html = data
})
fs.readFile('./style.css', function (err, data) {
    if (err) {
        throw err
    }
    resourceList.css = data
})
fs.readFile('./app.js', function (err, data) {
    if (err) {
        throw err
    }
    resourceList.appJs = data
})
fs.readFile('./sw.js', function (err, data) {
    if (err) {
        throw err
    }
    resourceList.swJs = data
})
fs.readFile('./gameRecord.webmanifest', function (err, data) {
    if (err) {
        throw err
    }
    resourceList.manifest = data
})
fs.readFile('./data/characters.js', function (err, data) {
    if (err) {
        throw err
    }
    resourceList.data_charactersJs = data
})
fs.readFile('./data/maps.js', function (err, data) {
    if (err) {
        throw err
    }
    resourceList.data_mapsJs = data
})
fs.readFile('./functions/record/record.html', function (err, data) {
    if (err) {
        throw err
    }
    resourceList.function_record_recordHtml = data
})
fs.readFile('./functions/record/record.js', function (err, data) {
    if (err) {
        throw err
    }
    resourceList.function_record_recordJs = data
})
fs.readFile('./functions/statistic/statistic.html', function (err, data) {
    if (err) {
        throw err
    }
    resourceList.function_statistic_statisticHtml = data
})
fs.readFile('./functions/statistic/statistic.js', function (err, data) {
    if (err) {
        throw err
    }
    resourceList.function_statistic_statisticJs = data
})


http.createServer((req, res) => {
    console.log("req", req)
    res.statusCode = 200
    if (req.url.indexOf('style.css') != -1) {
        res.writeHead(200, { 'Content-Type': 'text/css' })
        res.write(resourceList.css)
        res.end()
        return
    }
    if (req.url.indexOf('app.js') != -1) {
        res.writeHead(200, { 'Content-Type': 'text/javascript' })
        res.write(resourceList.appJs)
        res.end()
        return
    }
    if(req.url.indexOf('sw.js') != -1) {
        res.writeHead(200, { 'Content-Type': 'text/javascript' })
        res.write(resourceList.swJs)
        res.end()
        return
    }
    if(req.url.indexOf('gameRecord.webmanifest') != -1) {
        res.writeHead(200, { 'Content-Type': 'text/manifest+json' })
        res.write(resourceList.manifest)
        res.end()
        return
    }
    if(req.url.indexOf('/data/characters.js') != -1) {
        res.writeHead(200, { 'Content-Type': 'text/javascript' })
        res.write(resourceList.data_charactersJs)
        res.end()
        return
    }
    if(req.url.indexOf('/data/maps.js') != -1) {
        res.writeHead(200, { 'Content-Type': 'text/javascript' })
        res.write(resourceList.data_mapsJs)
        res.end()
        return
    }
    if(req.url.indexOf('/functions/record/record.html') != -1) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write(resourceList.function_record_recordHtml)
        res.end()
        return
    }
    if(req.url.indexOf('/functions/record/record.js') != -1) {
        res.writeHead(200, { 'Content-Type': 'text/javascript' })
        res.write(resourceList.function_record_recordJs)
        res.end()
        return
    }
    if(req.url.indexOf('/functions/statistic/statistic.html') != -1) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write(resourceList.function_statistic_statisticHtml)
        res.end()
        return
    }
    if(req.url.indexOf('/functions/statistic/statistic.js') != -1) {
        res.writeHead(200, { 'Content-Type': 'text/javascript' })
        res.write(resourceList.function_statistic_statisticJs)
        res.end()
        return
    }

    
    res.writeHeader(200, { "Content-Type": "text/html" })
    res.write(resourceList.html)
    res.end()
}).listen(8080)
