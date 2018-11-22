
var imgurl = "http://www.swtychina.com/gb/images/download16.gif"; 
var playerImgUrl = "http://swtychina.com/gb/images/ting.gif";  
var evenNumber = 0;  

// 控制播放器的显示与隐藏
function toggleLoadingControls(loading) {
    if (loading) {
        document.querySelector('.spinner').setAttribute('class', "spinner");            
    }
    else {
        document.querySelector('.spinner').setAttribute('class', "spinner hidden");
    }
}

function getSwtyItemsData(valuesDate){
    var server = 'http://api.swtychina.com/api/values?';
    $.ajax({
        url: server + valuesDate,
        type: 'GET',
        dataType: 'json',
        timeout: 10000,
        error: function(data){
            alert('加载数据失败，再次点击试试~？');
        },
        success: function(data){
            // 删除原有节目
            deleteProgramList("ProgramList");
            var parent = document.getElementById("ProgramList");
            var auditonUrl = "http://swtychina.com/gb/audiodoc";
            $.each(data, function(index, val) {
                var year = val.date.substring(0, 4);
                var month = year + val.date.substring(5, 7);
                var day = month + val.date.substring(8, 10);

                // 下载地址：http://swtychina.com/gb/audiodoc/2018/201801/20180101.mp3
                var Url = auditonUrl+ "/" + year + "/" + month + "/" + day + ".mp3";

                // 去掉山外天园节目title前缀“小贝回来了(000):”
                //var mccItemTitle = val.title.slice(11, val.title.length);  
                var mccItemTitle = val.title;                     
                var item = {date:val.date, url:Url, title:mccItemTitle}; 
                //console.log("getSwtyItemsDate()->isLoadLatestItem",isLoadLatestItem);
            
                var itemDate = new Date(val.date.substring(0, 4),val.date.substring(5, 7)-1,val.date.substring(8,10));
                var todayDate = new Date();
                var weekday = itemDate.getDay();
                // console.log("weekday:",weekday);
                // console.log("itemDate:",itemDate);
                // console.log("item:",item);
                // 只显示截至到今天的，星期一和星期三的节目。
                if (itemDate <= todayDate && (weekday==1 || weekday==3)) {
                    if(isLoadLatestItem){                            
                        var loadItemDate = new Date(2018,0,1);                           
                        //var itemDate = new Date(val.date.substring(0, 4),val.date.substring(5, 7)-1,val.date.substring(8,10)); 
                        // 只过滤掉2018年之前的节目                           
                        if (loadItemDate <= itemDate) {
                            //console.log("1.item:",item);
                            loadItem(parent, item,evenNumber%2 != 0); 
                            //console.log("2.item:",item);
                        }
                    }
                    else{
                        loadItem(parent, item,evenNumber%2 != 0);
                    }
                    evenNumber++;
                }
                //allItem.push(item);                            
            }); 
            evenNumber = 0; 
            isLoadLatestItem = false;
            //console.log("Allitem:",allItem);
        }
    });
    
}

// swty:   http://api.swtychina.com/api/values
// date=2010-** 
// ?date=2010-01
// http://api.swtychina.com/api/swtymp3?path=mcchome/2018/201802

function loadLatestItem(id)
{
    isLoadLatestItem = true;
    //console.log("loadLatestItems()->isLoadLatestItem",isLoadLatestItem );
    getSwtyItemsData();
}

function deleteProgramList(id)
{
    var parent = document.getElementById(id);
    var childslength = document.getElementsByName("item").length;
    
    //console.log("parent", parent);
    //console.log("document.getElementById" ,document.getElementsByName("item"));
    //parent.remove(parent.getElementsByTagName("p"));
    for (let index = 0; index < childslength; index++) {
        parent.removeChild(document.getElementsByName("item")[0]);
        //console.log(parent);                
    }
}

function playMe(me) {
    console.log("me:",me);
    document.getElementById("player_title").innerHTML = me.parentNode.textContent.substring(10,me.parentNode.textContent.length);

    var x = document.getElementById("player");           
    x.setAttribute("src", me.getAttribute("playurl"));
    x.play();
}

function loadItem(parent,data,ishavebackgrouad) {
    // <div class="row" name="item">   //parent_div 
    //     <div class="col-sm-2 col-xs-6">2018-01-01</div>   // child_div1
    //     <div class="col-sm-1 col-xs-6"><a href="#"><img src="http://www.swtychina.com/gb/images/download16.gif" class="mccDownloadImg"></a></div>  //child_div2
    //     <div class="col-sm-4 col-xs-12"><span class="mccSpace">世外桃源再回到休斯敦本地电台传福音</span></div>  //child_div3
    // </div>
    //var parent = document.getElementById(id);
    var parent_div = document.createElement("div");
    if (ishavebackgrouad) {
        parent_div.setAttribute("class","row mccItembackground");                
    }
    else{
        parent_div.setAttribute("class","row mccItem");
    }

    //parent_div.setAttribute("className","row");
    parent_div.setAttribute("name","item");
    //console.log("parent_div",parent_div);
    parent.appendChild(parent_div);

    // date div begin
    var child_div1 = document.createElement("div");
    child_div1.setAttribute("class","col-sm-2 col-xs-6");
    var node1 = document.createTextNode(data.date);
    child_div1.appendChild(node1);
    parent_div.appendChild(child_div1);
    // date div end

    // player div begin
    var child_div_player = document.createElement("div");           
    child_div_player.setAttribute("class","col-sm-1 col-xs-3"); 
    child_div_player.setAttribute("onclick","playMe(this);"); 
    child_div_player.setAttribute("playurl",data.url);               
    parent_div.appendChild(child_div_player);

    var child_div_player_a = document.createElement("a");
    child_div_player_a.setAttribute("href","#");            
    child_div_player.appendChild(child_div_player_a);

    var child_div_player_a_img = document.createElement("img");
    child_div_player_a_img.setAttribute("src",playerImgUrl);
    child_div_player_a_img.setAttribute("class","mccDownloadImg");
    child_div_player_a.appendChild(child_div_player_a_img); 
    // player div end

    // download div begin
    var child_div2 = document.createElement("div");
    child_div2.setAttribute("class","col-sm-1 col-xs-3");                
    parent_div.appendChild(child_div2);

    var child_div2_a = document.createElement("a");
    child_div2_a.setAttribute("href",data.url);
    child_div2_a.setAttribute("target","_blank");
    child_div2.appendChild(child_div2_a);

    var child_div2_a_img = document.createElement("img");
    child_div2_a_img.setAttribute("src",imgurl);
    child_div2_a_img.setAttribute("class","mccDownloadImg");
    child_div2_a.appendChild(child_div2_a_img);
    // download div end

    // title div begin
    var child_div3 = document.createElement("div");                
    child_div3.setAttribute("class","col-sm-7 col-xs-12");                
                    
    parent_div.appendChild(child_div3);

    var node2 = document.createTextNode(data.title);
    child_div3.appendChild(node2);
    // title div end
}

function searchItem() {

    isLoadLatestItem = true;           
    var input_value = document.getElementById("itemname").value;           
    //console.log("nodeValue",input_value);
    if (input_value.length == 0) {
        alert("请输入搜素关键字~！");
        return;
    }
    // 删除原有节目
    //deleteProgramList("ProgramList"); 
    var search_value = "date=" + input_value;
    console.log("search_value:",search_value);
    console.log("isLoadLatestItem",isLoadLatestItem);
    getSwtyItemsData(search_value);
}


$(function () { $('#collapse2018').collapse('show')});

