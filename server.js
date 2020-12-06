const express = require('express');
const busboy = require('connect-busboy');
const path = require('path');
const fs = require('fs-extra');
const readlines = require('n-readlines');
const app = express();


app.use(busboy());
app.use(express.static(path.join(__dirname, 'public')));


/* ========================================================== 
Route to csv upload
============================================================ */
app.route('/upload').post(function (req, res, next) {   
    
    const publicFolder = "/public/";
   
    var fstream;
    req.pipe(req.busboy);
  
    req.busboy.on('file', function (fieldname, file, filename) {
        
        //Path where image will be uploaded
        fstream = fs.createWriteStream(__dirname + publicFolder + filename);
        file.pipe(fstream);
        fstream.on('close', function () {

            // process csv convert to json           
           
            var liner = new readlines(__dirname + publicFolder + filename);            
           
            var listMonths = [];
            var listValues = [];
            
            while (next = liner.next()) {
                var tmpValues = next.toString("utf-8").split(",");                        
                listMonths.indexOf(tmpValues[0].split("-")[1]) === -1 ? listMonths.push(tmpValues[0].split("-")[1]) : null;                
                listValues.push(tmpValues);
            }
                 
            listMonths.shift();
                     
            var listFinalTotalsByMonths = [];            
           
            listMonths.forEach(m => {
               
                var totalCases = 0;
                var totalDeaths = 0;
               
                listValues.forEach(v => {                   
                   
                    if(m === v[0].split("-")[1]) {                        
                        totalCases += parseInt(v[1]); 
                        totalDeaths += parseInt(v[2]); 
                    }                                    
                })                
              
                listFinalTotalsByMonths.push({month:m, cases: totalCases, deaths: totalDeaths});                
                
            });         
            
            fs.writeFile(__dirname + publicFolder+ 'output.json', JSON.stringify(listFinalTotalsByMonths), function(erro) {
                if(erro) {
                    throw erro;
                }
            });             
            
            res.redirect('list.html');        
        });
    });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, err => {
    if(err) throw err;
    console.log("%c Server running", "color: green");
});