var express = require('express');
var app = express();
let path= require('path');
// let public = path.join(__dirname,'public');

class companies{
    constructor(name,exDiv,payDate,dividend,country,type){
        this.name = name;
        this.exDiv = [exDiv];
        this.payDate = [payDate];
        this.dividend = [dividend];
        this.country=country;
        this.type=type;
    }
}

app.get('/public/main.js', async(req,res) =>{
    req.getConnection(function(error, con) {
        con.query("SELECT ticker,name FROM tickers",function(err, result, fields) {
            if(err) throw error;
            console.log(result);

			// console.log(result[1].exDiv.getDate()+"."+result[1].exDiv.getMonth()+"."+result[1].exDiv.getFullYear());
            // tickerList=result;
            // let data={};
            // for(var i=0;i<result.length;i++){
            //     let name = result[i].name;
            //     let exDiv = result[i].exDiv.getDate()+"."+result[i].exDiv.getMonth()+"."+result[i].exDiv.getFullYear();
            //     let payDate = result[i].payDate.getDate()+"."+result[i].payDate.getMonth()+"."+result[i].payDate.getFullYear();
            //     let dividend = result[i].dividend;
            //     let country = result[i].country;
            //     if(data[result[i].ticker]){
            //         data[result[i].ticker].exDiv.push(exDiv)
            //         data[result[i].ticker].payDate.push(payDate)
            //         data[result[i].ticker].dividend.push(dividend)
            //     }else{
            //         data[result[i].ticker] = new companies(name,exDiv,payDate,dividend,country);
            //     }  
            // }
            // console.log(data);
            res.send(result);
            // autocomplete();
        });
    });
});


app.get('/', function(req,res){
    res.render('index');
});

app.get('/tickerList', function(req,res){
    req.getConnection(function(error, con) {
        con.query("SELECT name FROM tickers limit 100",function(err, result, fields) {
            if(err) throw error;
            res.send(result);
        });
    });
});

app.post('/search', function(req,res){
    console.log(req.body.name);
    console.log('testing');
    req.getConnection(function(error, con) {
        con.query("SELECT * FROM tickers JOIN dividends ON tickers.id =  dividends.ticker_id WHERE ticker = '"+req.body.name+"'",function(err, result, fields) {
            if(err) throw error;
            console.log(result);
            let tickers=[];
            sendResult(result);
            res.send(result);
        });
    });
})

app.post('/createNewPortfolio', function(req,res){
    console.log(req.body.name);
    let name = req.body.name
    // let data = req.body.name.data;
    // console.log(name,data);
    req.getConnection(function(error, con) {
        let sql = "INSERT INTO portfolios (name,stocks) VALUES ('"+name+"', 'Null')";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
          });
    });
    res.send('test');
})

app.post('/test', function(req,res){
    console.log(req.body.name);
    let name = req.body.name.name;
    let data = req.body.name.data;
    console.log(name,data);
    req.getConnection(function(error, con) {
        let sql = "UPDATE portfolios SET stocks = '"+data+"' WHERE name ='"+name+"';";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record updated");
          });
    });
    res.send('test');
})

function sendResult(result){
    console.log(result[0].ticker);
    console.log('test');
    app.get('/result/'+result[0].ticker, async(req,res) =>{
        res.send(result);
    });
}

module.exports = app;