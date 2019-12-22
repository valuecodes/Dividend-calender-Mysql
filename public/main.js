let dividendData;
let activeList={};
let searchList;
let monthsName=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
let counter=0;

class monthStack{
  constructor(name,number,count,sum,activeTickers){
    this.name = [name];
    this.number=[number];
    this.count = [count];
    this.sum = [sum];
    this.activeTickers = activeTickers;
  }
}

class portfolio{
  constructor(name,data){
    this.name = name,
    this.data=data
  }
}

class activeTicker{
  constructor(name,exDiv,payDate,dividend,country,type){
      this.name = name;
      this.exDiv = exDiv;
      this.payDate = payDate;
      this.dividend = dividend;
      this.country=country;
      this.type=type;
  }
}

// create month data
let monthTrack = new monthStack(monthsName[0],0,0,0,[]);

for(var i=1;i<monthsName.length;i++){
  monthTrack.name.push(monthsName[i]);
  monthTrack.number.push(i);
  monthTrack.count.push(0);
  monthTrack.sum.push(0);
}
async function getSearchData(){
  const response = await fetch('/public/main.js');
  const data = await response.json();
  return data;
}

startAplication();

async function startAplication() {
    let data = await getSearchData();
    dividendData=data;
    // create Dividend Lists on the left
    createDividendLists();
    // create month colums in the data char
    createMonthColums();
    // Create Month blocks
    createMonthBlocks();
    // Listen to searchbox
    autocomplete();
    
    // Add tickers from localStorage
    // addLocalList();

    // Listen dividend goal inputs
    dividendTargets();
    calculateTotal();
    createChart(monthTrack.name,monthTrack.sum)
    // Set overflow to start at the bottom
    overFlowBottom();
    listSaved();
}



let addLocalList=()=>{
  for(var i=0;i<localStorage.length;i++){
    let localData = localStorage.getItem("company"+i);
    let ticker=localData.split('.')[0];
    let shares=localData.split('.')[1];
    addTickerList(ticker,shares);
  }
}

let dividendTargets=()=>{
  let monthGoal=document.getElementById('targetMonth');
  let yearGoal=document.getElementById('targetYear');
  // Remove text from input
  monthGoal.addEventListener('focusin',() => {
    yearGoal.value=yearGoal.value.split(' ')[0];
    monthGoal.value=monthGoal.value.split(' ')[0];
  });
  yearGoal.addEventListener('focusin',() => {
    yearGoal.value=yearGoal.value.split(' ')[0];
    monthGoal.value=monthGoal.value.split(' ')[0];
  });
  // Read value from Input and update chart
  monthGoal.addEventListener('input',() => {
    yearGoal.value=monthGoal.value*12;
    createChart(monthTrack.name,monthTrack.sum);
  });
  yearGoal.addEventListener('input',() => {
    monthGoal.value=(yearGoal.value/12).toFixed(2);
    createChart(monthTrack.name,monthTrack.sum);
  });
  // Add text to input
  monthGoal.addEventListener('focusout',() => {
    if(monthGoal.value>0||monthGoal.value==' '){
      yearGoal.value+=' €/Year';
      monthGoal.value+=' €/Month';
    }else{
      yearGoal.value+='';
      monthGoal.value+='';
    }
  });
  yearGoal.addEventListener('focusout',() => {
    if(yearGoal.value>0||yearGoal.value==' '){
      yearGoal.value+=' €/Year';
      monthGoal.value+=' €/Month';
    }else{
      yearGoal.value+='';
      monthGoal.value+='';
    }
  });
}


let createMonthColums=()=>{
  for(var i=0;i<12;i++){
    let newDiv = document.createElement('div');
    newDiv.className = "monthColumn";
    newDiv.id = 'monthC.'+i;
    let dataSection = document.getElementById('data');
    dataSection.appendChild(newDiv);
    let topBlock=document.createElement('p');
    // Top block is top part of month columns so tickers align at the bottom
    topBlock.className='topBlock';
    newDiv.appendChild(topBlock);
  }
}

function createMonthBlocks(){
  for(var i=0;i<12;i++){
    let newDiv = document.createElement('h3');
    newDiv.id='monthName'+i;
    newDiv.textContent=monthTrack.name[i];
    let dataSection = document.getElementById('monthBlocks');
    dataSection.appendChild(newDiv);
  }
}


let createDividendLists=()=>{
  for(var i=0;i<11;i++){
    let list=document.createElement('div');
    list.className='tickerList';
    list.id='tickerList.'+i;
    list.style.zIndex=10-i;
    let activeTickers=document.getElementById('dividendList');
    activeTickers.appendChild(list);
  } 
}

let addMonthBlockStyle=(selectedMonth,check)=>{
  let monthBlock=document.getElementById(selectedMonth);
  if(check=='on'){  
    monthBlock.style.border='3px solid';
    monthBlock.style.borderRadius = '7px'
    monthBlock.style.backgroundColor = 'rgba(128, 128, 128, 0.5)';
  }else{
    monthBlock.style.border='';
    monthBlock.style.borderRadius = ''
    monthBlock.style.backgroundColor = '';
  }
}


function addTickerTolist(tickerKey,numberOfShares){
    let text=document.createElement('div');
    text.textContent=tickerKey;
    text.className='activeTicker';
    text.id='active,'+tickerKey;
    let input=document.createElement('input',text.id);
    input.className='activeInput';
    input.addEventListener('input',()=>{calculateTotal()});
    let deleteButton=document.createElement('div');
    deleteButton.className='deleteButton';
    deleteButton.textContent='X';
    deleteButton.addEventListener('click',()=>{removeTicker(tickerKey)});
    let list=document.getElementById('tickerList.'+Math.floor((monthTrack.activeTickers.length-1)/10));
    list.appendChild(text);
    text.appendChild(input);
    text.appendChild(deleteButton);
    overFlowBottom();
    document.getElementById('active,'+tickerKey).children[0].value=numberOfShares;
    // activeList[tickerKey].numberOfShares=numberOfShares;
    changesMade();
}

function calculateTotal(){
  let len =Object.keys(activeList).length;
  for(var i=0;i<12;i++){
    monthTrack.sum[i]=0;
  }
  for(key in activeList){
    for(var i=0;i<activeList[key].dividend.length;i++){
      let perShare=activeList[key].dividend[i];
      let shareCount=document.getElementById('active,'+key).children[0].value;
      if(shareCount!=""){
        let totalSum=perShare*shareCount;
        let month=getMonth(activeList[key].payDate[i]);
        let prev=Number(monthTrack.sum[month]);
        let total=prev+=totalSum;
        total=Math.round(total*100 )/100;
        monthTrack.sum[month]=total.toFixed(2);
      }
    }
  }
  createChart(monthTrack.name,monthTrack.sum);
  changesMade();
  
  setTimeout(function(){
    console.log('Round :'+counter);
    counter++;    
  },2000)

  saveUpdates();

}



let saveUpdates=()=>{
  if(!document.getElementById('closed').textContent==''){
  let name=document.getElementById('closed').textContent;
  let list=[];
  for(key in activeList){
    let shareCount=document.getElementById('active,'+key).children[0].value;
    if(shareCount==''){
      shareCount='0';
    }
    list.push([key,shareCount])
  }
  let myPortfolio = new portfolio(name,list)
  console.log(myPortfolio);
    savePortFolioDB(myPortfolio);
  }

}

let createNewPortfolio=()=>{
  if(document.getElementById('myPortfolio').value){
    let name=document.getElementById('myPortfolio').value;
    console.log(name);
    let listName = document.getElementById('closed');
    listName.textContent = name;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/createNewPortfolio", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({name:name}));
  }
}

let savePortFolioDB=(data)=>{
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/test", true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({name:data}));
}

function removeTicker(ticker){
  let monthBlocks=document.getElementsByClassName('monthB.'+ticker);
  // Searches month blocks by class name and deletes
  while (monthBlocks.length > 0) monthBlocks[0].remove();
  var elem = document.getElementById('active,'+ticker);
  let parent=elem.parentNode.id.split('.')[1];
  elem.parentNode.removeChild(elem);
  // Pushes rest of month blocks -1
  listPushAndPop(parent);
  delete(activeList[ticker]);
  // getNextDividend();
  calculateTotal();
  changesMade();
}

let listPushAndPop=(listNumber)=>{
  for(var i=listNumber;i<10;i++){
    if(document.getElementById('tickerList.'+(parseInt(i)+1)).firstChild==null){
      let state=document.getElementById('activeNav').childNodes[1].id;
      let count=document.getElementById('tickerList.'+i).childElementCount;
      if(state=='open'&&count==0){
        document.getElementById('activeList').style.transition='all 0.6s';
        document.getElementById('activeNav').style.transition='all 0.6s';
        document.getElementsByClassName('openActive')[0].style.transition='all 0.6s';
        document.getElementById('activeList').style.width=i*170+'px';
        document.getElementById('activeNav').style.width=i*170+'px';
        document.getElementsByClassName('openActive')[0].style.marginLeft=(i*170)-170+'px';
      }
      break;
    }
    list=document.getElementById('tickerList.'+i);
    element=document.getElementById('tickerList.'+(parseInt(i)+1)).firstChild;
    document.getElementById('tickerList.'+(parseInt(i)+1)).firstChild.remove();
    list.appendChild(element);
  }
}

function getMonth(date){
    month=date.split('-');
    return month[1]-1;
}

// function getNextDividend(){
//   var currentDate = new Date();
//   var date = currentDate.getDate();
//   var month = currentDate.getMonth(); 
//   let year=2019;
//   let flag=false;
//   for(var i=month;i!=month-1;i++){
//     if(i==12){
//       i=0;
//       year++;
//     }
//     let currentMonth=document.getElementById('monthC.'+i).children;
//     if(currentMonth[1]!=null){
//         let count=document.getElementById('monthC.'+i).children.length;
//         let dividendDate=document.getElementById('monthC.'+i).children[1].id.split('.');
//         let endtime=(dividendDate[2]+' '+dividendDate[1]+' '+year);
//         if(Number(endtime.split(" ")[1])>date){
//           getTimeRemaining(endtime)
//           flag=true;
//           break;
//         }
        
//     }
//     if(monthTrack.count[i]>0){
//       let companyName=document.getElementById('month0,'+i).textContent;
//       let date=dividendData[companyName].payDate[0].split('.');  
//       let endtime = (date[1]+' '+date[0]+' '+year);
//       getTimeRemaining(endtime)
//       flag=true;
//      break;
//     }
//   }
//   if(flag==false){
//     document.getElementById('countDown').textContent="";
//   }
// }

function getTimeRemaining(endtime){
  today = new Date();
  BigDay = new Date(endtime);
  msPerDay = 24 * 60 * 60 * 1000 ;
  timeLeft = (BigDay.getTime() - today.getTime());
  e_daysLeft = timeLeft / msPerDay;
  daysLeft = Math.floor(e_daysLeft);
  e_hrsLeft = (e_daysLeft - daysLeft)*24;
  hrsLeft = Math.floor(e_hrsLeft);
  minsLeft = Math.floor((e_hrsLeft - hrsLeft)*60);
  document.getElementById('countDown').textContent=daysLeft;
}


// Autocomplete
function autocomplete(){
  const search = document.getElementById('search');
  const matchList = document.getElementById('results');
  // Search tickerList
  const searchTickers = async searchText =>{
    data=dividendData; 
    let matches = Object.keys(data).filter(tickers =>{
      const regex = new RegExp(`^${searchText}`,'gi');
      return data[tickers].ticker.match(regex) || data[tickers].name.match(regex);
    });
  
    if(searchText.length === 0){
      matches = [];
    }
    clearResults();
    outPutHTML(matches);
  }
  
  // Clear Previous results
  function clearResults(){
    const parent = document.getElementById("result");
      while (parent.firstChild) {
      parent.firstChild.remove();
    }
  }
  
  // Show results in HTML
  const outPutHTML = matches =>{
    for(var i=0;i<matches.length;i++){
      let searchResult=document.createElement('div');
      searchResult.className='searchResult';
      let tickerName=document.createElement('div');
      let companyName=document.createElement('div');
      tickerName.textContent=data[matches[i]].ticker;
      companyName.textContent=data[matches[i]].name;
      let results=document.getElementById('result');
      results.appendChild(searchResult); 
      searchResult.appendChild(tickerName);
      searchResult.appendChild(companyName);
      if(i==10){
        break;
      }
    }
    var selected = document.getElementsByClassName("searchResult");
    var listen = function() {
      var ticker = this.firstChild.textContent;
      if(activeList[ticker] === undefined){
        addTicker(ticker);
      }
      document.getElementById('search').value='';
      clearResults();
    }
    for (var i = 0; i < selected.length; i++) {  
      selected[i].addEventListener('click', listen, false);
  }
  };
  search.addEventListener('input', () => searchTickers(search.value));
}

async function addTicker(ticker){
  let req= await search(ticker);  
  let jsonData = await displayData(req);
  if(jsonData=='Not Found'){
    addTicker(ticker);
  }else{
    let exDiv=[];
    let payDate=[];
    let dividend=[];
    for(var i=0;i<jsonData.length;i++){
      exDiv.push(jsonData[i].exDiv.split('T')[0]);
      payDate.push(jsonData[i].payDate.split('T')[0]);
      dividend.push(jsonData[i].dividend);
    }
    activeList[ticker] = new activeTicker(jsonData[0].name,exDiv,payDate,dividend,jsonData[0].country,jsonData[0].dividendType);
    displayTicker(ticker);
    addTickerList(ticker,0);
    calculateTotal();
    overFlowBottom();
  }
}

function addTickerList(tickerKey,numberOfShares){
  let len = Object.keys(activeList).length;
  let text=document.createElement('div');
  text.textContent=tickerKey;
  text.className='activeTicker';
  text.id='active,'+tickerKey;
  let input=document.createElement('input',text.id);
  input.className='activeInput';
  input.addEventListener('input',()=>{calculateTotal()});
  let deleteButton=document.createElement('div');
  deleteButton.className='deleteButton';
  deleteButton.textContent='X';
  deleteButton.addEventListener('click',()=>{removeTicker(tickerKey)});
  let list=document.getElementById('tickerList.'+Math.floor((len-1)/10));
  list.appendChild(text);
  text.appendChild(input);
  text.appendChild(deleteButton);
  overFlowBottom();
}

let displayTicker=(ticker)=>{
  for(var i=0;i<activeList[ticker].payDate.length;i++){
    let div=document.createElement('div')
    div.textContent=ticker;
    div.className='monthB.'+ticker;
    div.id=ticker+'.'+activeList[ticker].payDate[i];
    let month=getMonth(activeList[ticker].payDate[i]);
    let selectedMonth=document.getElementById('monthC.'+month);
    selectedMonth.appendChild(div);
  } 
}

async function search(ticker){
  return new Promise(resolve =>{
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/search", true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.send(JSON.stringify({name:ticker}));
         
      resolve(ticker);
  });   
}

function displayData(ticker){
  return new Promise(resolve =>{
      var xhr = new XMLHttpRequest();
      xhr.open('GET',"http://localhost:3000/result/"+ticker,true);       
      xhr.onload = function() {
          if(this.status==404){
              resolve('Not Found');;
          }
          if(this.status == 200){
              let data = JSON.parse(this.responseText);
              resolve(data);
          }
      }
      xhr.send();
  });   
}



function createChart(name,sum){
  let divTarget=false;
  let targetData=checkTarget();
  let average=getAverage(sum);
  var ctx = document.getElementById('myChart').getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: name,
          datasets: [{
            label:'Dividends',
            data: sum,
            backgroundColor:'rgba(55, 199, 132, 0.5)',
          }, {
            label: 'Average',
            data: average,
            borderColor:'rgba(55, 99, 232, 0.6)',
            backgroundColor:'rgba(25, 140, 232, 0.3)',
            type: 'line'
        },
        {
          label:'Target',
          data: targetData,
          borderColor:'rgba(345, 129, 132, 0.9)',
          backgroundColor:'rgba(325, 159, 112, 0.9)',
          type: 'line',
          fill:false,
          hidden:divTarget
      }
        ],
      },
      options: {
        layout: {
        padding: {
            left: 0,
            right: 0,
            top: 38,
            bottom: 0
        }
    },
    tooltips: {enabled: false},
    hover: {mode: null},
        responsive: true, 
  maintainAspectRatio: false,
          legend: {
              display: true,
              position: 'right',
              align:'start',
              labels: { 
              fontSize: 30,
              filter: function(item, chart) {
                if(divTarget!=false){
                  return !item.text.includes('Target');
                }else{
                  return item.text;
                }
                
            }
              }
            
          },
          scales: {
            xAxes: [{
              ticks:{
                fontSize:20
              }
            }],
              yAxes: [{
                  ticks: {
                    margin: 100,
                      fontSize: 20,         
                      maxTicksLimit: 8,
                      beginAtZero: true,
                      callback: function(value,index,values){
                        return value+'€'+' ';
                      },
                  }
              }]
          },
          animation: {
            duration: 500,
            easing: "easeOutQuart",
            onComplete: function () {
                var ctx = this.chart.ctx;
                ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.font = '20px bold';
                this.data.datasets.forEach(function (dataset) {
                    for (var i = 0; i < dataset.data.length; i++) {
                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                            scale_max = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
                        ctx.fillStyle = '#444';
                        ctx.font = "25px ";
                        var y_pos = model.y - 5;
                        if ((scale_max - model.y) / scale_max >= 0.93)
                            y_pos = model.y + 30;
                        if(dataset.data[i]>0 && dataset.data[i]!=average[0]&& dataset.data[i]!=targetData[0]){
                          ctx.fillText(dataset.data[i]+'€', model.x, y_pos);
                        }
                    }
                });               
            }
        }
      }
  });

  // setAverageY(xPos,average[11]);
  calculateAmounts();  
  
  setTargetChart(targetData[11]);

  myChart.canvas.parentNode.style.height = '390px';
  myChart.canvas.parentNode.style.width = 1700+'px';
  updateChartWidth(myChart);
}

let updateChartWidth=(myChart)=>{
  let width= window.innerWidth;
  myChart.canvas.parentNode.style.width = width-200+'px';
  window.addEventListener('resize', function(event){
    ;
    let width= window.innerWidth;
    myChart.canvas.parentNode.style.width = width-200+'px';
  });
}

let calculateAmounts=()=>{
  let total=0;
  for(var i=0;i<12;i++){
    total+=parseFloat(monthTrack.sum[i]);
  }
  total=total.toFixed(2);
  document.getElementById('amountYear').textContent='Year:\xa0\xa0\xa0\xa0'+total+
  ' €';
  document.getElementById('amountMonth').textContent='Month:\xa0'+(total/12).toFixed(2)+
  ' €';
  document.getElementById('amountDay').textContent='Day:\xa0\xa0\xa0\xa0\xa0'+(total/365).toFixed(2)+
  ' €';
}


// Get average for average line 
let getAverage=(data)=>{
  let total=0;
  for(var i=0;i<12;i++){
    total+=parseFloat(data[i]);
  }
  total=total/12;
  let totalArray=[];
  for(var i=0;i<12;i++){
    totalArray.push(parseFloat(total.toFixed(2)));
  }
  return totalArray;
}

// Check if target is filled and create array for target line
let checkTarget=()=>{
  let target=document.getElementById('targetMonth').value;
  let total=[];
  for(var i=0;i<12;i++){
      if(target==""){
        total.push(0);
      }else{
        total.push(parseFloat(target));
      }
      
  }
  return total;
}

let openActiveMenu=()=>{
  console.log('test');
  let len = Object.keys(activeList).length;  
  let state=document.getElementById('activeNav').childNodes[1].id;
  let count=((len-1)/10)+1;
  count=Math.floor(count);
  if(count==0){count=1};
  if(state=='closed'){
    document.getElementById('activeList').style.transition='all 0.6s';
    document.getElementById('activeNav').style.transition='all 0.6s';
    document.getElementsByClassName('openActive')[0].style.transition='all 0.6s';
    document.getElementById('activeList').style.width=count*170+'px';
    document.getElementById('activeNav').style.width=count*170+'px';
    document.getElementsByClassName('openActive')[0].style.marginLeft=(count*170)-170+'px';
    document.getElementById('activeNav').childNodes[1].id='open';
    for(var i=0;i<count;i++){
      document.getElementById('tickerList.'+i).style.transition='all 0.6s';
      document.getElementById('tickerList.'+i).style.marginLeft=170*i+'px';
    }
  }else{
    document.getElementById('activeList').style.transition='all 0.6s';
    document.getElementById('activeNav').style.transition='all 0.6s';
    document.getElementsByClassName('openActive')[0].style.transition='all 0.6s';
    document.getElementById('activeList').style.width='170px';
    document.getElementById('activeNav').style.width='170px';
    document.getElementsByClassName('openActive')[0].style.marginLeft='0px';
    document.getElementById('activeNav').childNodes[1].id='closed';
    for(var i=0;i<count;i++){
      document.getElementById('tickerList.'+i).style.transition='all 0.6s';
      document.getElementById('tickerList.'+i).style.marginLeft='0px';
    }
  }
}

// Set overflow to bottom
let overFlowBottom=()=>{
  for(var i=0;i<12;i++){
    var div = document.getElementById("monthC."+i);
    div.scrollTop = div.scrollHeight
  };
}

// Set target chart
let setTargetChart=(targetMonth)=>{
  let currentMonth=document.getElementById('amountMonth').textContent.split(" ")[0].split(':')[1];
  currentMonth=parseFloat(currentMonth);
  let percent=currentMonth/targetMonth;
  percent=percent*100;
  let full=100;
  let targetPoint=document.getElementById('targetPoint');
  document.getElementById('targetPoint').style.paddingTop='65px';
  document.getElementById('targetPoint').style.textAlign='center';
  document.getElementById('targetPoint').style.fontSize='30px';
  if(!percent||percent==Infinity){
    targetPoint.textContent='0%';
    full=100;
    percent=0;
  }else{
    if(percent>100){
      targetPoint.textContent='Target reached';
      full=0;
      percent=100;
      document.getElementById('targetPoint').style.paddingTop='71px';
      document.getElementById('targetPoint').style.paddingRight='8px';
      document.getElementById('targetPoint').style.fontSize='17px';
    }else{
      targetPoint.textContent=percent.toFixed(2)+'%';
      full=full-percent;
    }
  }
  var ctt = document.getElementById('targetChart').getContext('2d');
  
  var targetChart = new Chart(ctt, {
      type: 'doughnut',
      data: {
          datasets: [{
              backgroundColor: ['rgba(275, 40, 32, 0.9)','rgba(25, 40, 32, 0.3)'],
              borderColor: 'rgba(5,9, 2, 0.9)',
              data: [percent,100-percent],
              weight:2
          }],
      },
      options: {
        cutoutPercentage: 85,
        maintainAspectRatio : false
      }
  });
  targetChart.canvas.parentNode.style.height = '165px';
}

let getCurrentPortfolio=()=>{
  let localStorageData=[];
  let localStorageArray=[];
  for(var i=0;i<monthTrack.activeTickers.length;i++){
    let ticker=monthTrack.activeTickers[i];
    let shares=document.getElementById('active,'+monthTrack.activeTickers[i]).children[0].value;
    activeList[ticker]=new currentTicker(ticker,shares);
    localStorageData[i]=ticker+'.'+shares;
    localStorageArray.push(localStorageData[i]);
  }

  for(var i=0;i<50;i++){localStorage.removeItem("company"+i);}
  for(var i=0;i<localStorageData.length;i++){
    localStorage.setItem("company"+i,localStorageData[i]);
  }
  listSaved();
}

let getOriginal=()=>{

  let restore={};

  //Add your portfolio to localList.json to use "Restore original" button
  // Example format: 
  
  // {
  //   Ticker:sharecount
  // }
  
  // {
  //   "TGT":100,
  //   "TEL":100,
  //   "YUM":100
  // }


  fetch('localList.json')
  .then(response => response.json())
  .then(jsonResponse => {
    restore=jsonResponse;
    clearPortfolio();
    for(var key in restore){
      addTickerList(key,restore[key]);
    }
    calculateTotal();
  })
}

let clearPortfolio=()=>{
  let len = monthTrack.activeTickers.length;
  for(var i=0;i<len;i++){
    removeTicker(monthTrack.activeTickers[0]);
  }
  document.getElementById('activeList').style.transition='all 0.6s';
        document.getElementById('activeNav').style.transition='all 0.6s';
        document.getElementsByClassName('openActive')[0].style.transition='all 0.6s';
        document.getElementById('activeList').style.width=170+'px';
        document.getElementById('activeNav').style.width=170+'px';
        document.getElementsByClassName('openActive')[0].style.marginLeft=0+'px';
}

let changesMade=()=>{
  let button = document.getElementById('saveButton');
  button.textContent='Save current list';
  button.style.backgroundColor='red';
}

let listSaved=()=>{
  let button = document.getElementById('saveButton');
  button.textContent='Saved';
  button.style.backgroundColor='rgb(161, 248, 79)';
}