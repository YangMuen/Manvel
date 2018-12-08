$(document).ready(function(){
    //var imgurl = "http://www.swtychina.com/gb/images/download16.gif"; 
    //var playerImgUrl = "http://swtychina.com/gb/images/ting.gif";
    var coverItem = "images/cover.jpg";
    var song = [
        {
            'cover' : 'images/cover.jpg',
            'src' : '',
            'title' : 'sdfas'
        }];

    /* 设置节目列表高度
        ItemListHeight = Body.heght - navplayer.heght - ItemListTitle.height - Searcher.hegit - ItemList.height
    */
   InitItemListHeight();
   $(window).resize(function () {
        InitItemListHeight();
    });
   InitAllYear();
    
    // 创建播放器
    var audioFn = audioPlay({
        song : song,
        autoPlay : false  //是否立即播放第一首，autoPlay为true且song为空，会alert文本提示并退出
    });
    // begin 初次加载节目数据 
    isLoadLatestItem = true;
    getSwtyItemsData();
    //toggleLoadingControls(false);
    // end 初次加载节目数据

    // 为年份列表注册 鼠标点击事件
    $("#allyear > li").click(function(){
        // 设置为当前点击年份
        var currentyear = this.value + "年";
        $("#currentyear").text(currentyear);
        $(".mccYear").text(currentyear);
        // 更新月份列表
        InitAllMonth(this.value);
    });

    // 为月份注册点击事件
    $(".mccMonth").click(function(){
        // "date=2018-01"
        var yearmonth = this.text;
        console.log(yearmonth.substring(0,4) + "-" + yearmonth.substring(4,6));        
        getSwtyItemsData("date="+yearmonth.substring(0,4) + "-" + yearmonth.substring(4,6));
    });
    // 初始化节目年份下拉菜单，月份列表从2007年开始到现在
    function InitAllYear(){        
        // 设置当前年份
        var nowYear = new Date().getFullYear();
        $("#currentyear").text( nowYear + "年");
        // 更新月份列表
        InitAllMonth(nowYear);
        // 获取父亲
        var ulObj = $("#allyear");
        for(var i=2010;i<=nowYear;i++){
            ulObj.append("<li value=" + i +"><a>" + i +"年</a></li>");
        }
    }

    // 更新月份列表
    function InitAllMonth(currentyear){
        // 获取 id 为 collapseyear 的标签下的所有 a标签
        //$("#collapseyear").find("a.mccMonth").text(currentyear);
        var aObjs = $("#collapseyear").find("a.mccMonth");
        var currentMonth = new Date().getMonth();
        console.log(currentMonth);
        for(var i = 1; i <= currentMonth+1; i++)
        {
            var strTemp = currentyear + "0" + i;
            if(i >= 10){strTemp = currentyear + "" + i;}
            aObjs[i-1].text = strTemp;
        }
       
    }

    function InitItemListHeight(){
        var heightProgramList = $(window).height()-$(".audio-box").outerHeight()-$("#ItemList").outerHeight();
        $("#ProgramList").height(heightProgramList-83);
    }


    // 控制播放器的显示与隐藏
    function toggleLoadingControls(loading) {
        if (loading) {
            document.querySelector('.spinner').setAttribute('class', "spinner");            
        }
        else {
            document.querySelector('.spinner').setAttribute('class', "spinner hidden");
        }
    }

    // swty:   http://api.swtychina.com/api/values
    // date=2010-** 
    // ?date=2010-01
    // http://api.swtychina.com/api/swtymp3?path=mcchome/2018/201802
    function getSwtyItemsData(valuesDate){
        //var server = 'http://api.swtychina.com/api/values?';
        var server = 'http://ceshnjd.imwork.net:57734/api/values?';

        // 删除原有节目
        $(".audio-inline").empty();

        // 控制spinner是否显示
        toggleLoadingControls(true);
        $.ajax({
            url: server + valuesDate,
            type: 'GET',
            dataType: 'json',
            timeout: 10000,
            error: function(data){
                alert('加载数据失败，再次点击试试~？');
                toggleLoadingControls(false);
            },
            success: function(data){    
                if(data.length == 0){
                    alert('Sorry，没有搜索到相关节目~！');
                    toggleLoadingControls(false);
                }

                song.splice(0,song.length);            
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
                
                    var itemDate = new Date(val.date.substring(0, 4),val.date.substring(5, 7)-1,val.date.substring(8,10));
                    var todayDate = new Date();
                    var startDate = new Date(2018,0,1);
                    var weekday = itemDate.getDay();
                    // 只显示截至到今天的，星期一和星期三的节目。
                    if ((itemDate <= todayDate) && (itemDate >= startDate) && (weekday==1 || weekday==3)) {
                        /* 向歌单中添加新曲目，第二个参数true为新增后立即播放该曲目，false则不播放 */
                        audioFn.newSong({
                            'cover' : coverItem,
                            'src' : item.url,
                            'title' : val.date + " " + item.title
                        },false);
                        //console.log(val.date + " " + item.title);
                    }
                                                           
                }); 
                if(audioFn.song.length ==0){                    
                    toggleLoadingControls(false);
                    alert('Sorry，没有搜索到相关节目~！');
                    return;
                }
                audioFn.selectMenu(0,false);
                audioFn.stopAudio();               
                isLoadLatestItem = false;
                toggleLoadingControls(false);
            }
        });        
    }
    
    $("#searchBtn").click(function(){
        SearchItem();
    });
    function SearchItem(){
        //isLoadLatestItem = true;           
        var input_value = document.getElementById("itemname").value;
        if (input_value.length == 0) {
            alert("请输入搜素关键字~！");
            return;
        }
       
        var search_value = "date=" + input_value;
        //console.log("search_value:",search_value);
        //console.log("isLoadLatestItem",isLoadLatestItem);
        getSwtyItemsData(search_value);        
    }
    
});   

    
