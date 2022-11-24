//Just design it as a good old module, but not as a module

async function initShell(parentElement){
    const sqlPromise = initSqlJs({
        locateFile: file => `/js/sql/${file}`
    });
    const dataPromise = fetch("/data/publications.sqlite.db").then(res => res.arrayBuffer());
    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
    const db = new SQL.Database(new Uint8Array(buf));
    var stmt = db.prepare("SELECT * FROM publications;");
    stmt.getAsObject()
    stmt.bind();
    while(stmt.step()){
        var row = stmt.getAsObject()
        for(let k in row){
            console.log(row[k])
        }
    }
}

initShell()