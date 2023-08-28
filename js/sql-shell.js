class SQLShell {
    
    static html = `<div class="sqlshell" id="output"></div>
    <div class="sqlshell" id="prompt">sqlite></div><input class="sqlshell" type="text">`

    static style = `<style>

    div.sqlshell, input.sqlshell {
        margin:auto;
        font-family: monospace;
        color:yellow;
        font-size:16px !important; 
        background: #2b1d1d;
        text-align:left;
        padding:5px !important;
        box-sizing: border-box !important;
    }

    div#output.sqlshell {
        width:100%;
        height:100%;
        padding:5px;
        overflow-y:scroll;
        display: flex;
        flex-direction: column-reverse;
    }

    div#output.sqlshell span.sqlerror {
        color:red;
    }

    input.sqlshell {
        vertical-align: top;
        display:inline-block;
        width:90%;
        height: 25px;
        border:none;
    }
    input.sqlshell:focus {
        outline: none;
    }

    div#prompt.sqlshell {
        vertical-align:top;
        display: inline-block;
        margin-top:-5px !important;
        width:10%;
        height:30px;
        font-size:16px !important;
    } 
    </style>`

    constructor(parent, dbfile, from_flag){
        this.parent = parent 
        this.dbfile = dbfile

        this.initDB()
        this.parent.innerHTML = SQLShell.html
        this.parent.innerHTML += SQLShell.style
        
        this.input = this.parent.querySelector('input[type="text"]')
        this.output = this.parent.querySelector('#output')
        this.history = []
        
        this.input.value = ""
        this.input.addEventListener("keydown", this.inputHandler.bind(this))
        this.parent.addEventListener("click", function(e){
            this.input.focus()
        }.bind(this))
        
    }

    inputHandler(e){
        if(e.keyCode == 13){
            let result = "sqlite> " + this.input.value + "<br>"
                //We definitely need a validator here
                if(this.input.value.trim() == ""){
                    this.output.innerHTML += result;
                    return
                }
                
                let stmt;
                
                try {
                    stmt = this.db.prepare(this.input.value);
                    
                } catch(err){
                    console.error(err);
                    result += `<span class="sqlerror">${err}</span><br>`;
                    this.output.innerHTML += result;
                    this.history.push(this.input.value)
                    this.input.value = ""
                    return;
                }
                
                stmt.getAsObject();
                stmt.bind();
                
                
                while(stmt.step()){
                    var row = stmt.getAsObject()
                    for(let k in row){
                        result += row[k] + "|"
                    }
                    result = result.substring(0, result.length-1)
                    result +="<br>"
                }
                this.output.innerHTML += result;
                this.history.push(this.input.value)
                this.input.value = ""
        }
        if(e.keyCode == 38){
            let last = this.history[this.history.length-1]
            if(last){
                this.input.value = last
            }
        }
    }

    async initDB() {
        const sqlPromise = initSqlJs({
            locateFile: file => `/js/sql/${file}`
        });
        const dataPromise = fetch(this.dbfile).then(res => res.arrayBuffer());
        const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
        this.db = new SQL.Database(new Uint8Array(buf));
    }
}
