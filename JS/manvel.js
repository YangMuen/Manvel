$(document).ready(function(){
    var itemStartTime = 2018;
    var noItemPrompt = "你提供的关键字太罕见了，没有相关节目，再试试别的~？";
    var seachPrompt = "请输入搜素关键字";
    var coverItem = "images/cover.jpg";
    var song = [
        {
            'cover' : 'images/cover.jpg',
            'src' : '',
            'title' : 'sdfas'
        }];
   //InitItemListHeight();

   InitAllYear();
    
    // 创建播放器
    var audioFn = audioPlay({
        song : song,
        autoPlay : false  //是否立即播放第一首，autoPlay为true且song为空，会alert文本提示并退出
    });
    // begin 初次加载节目数据 
    isLoadLatestItem = true;
    getSwtyItemsData();
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
        getSwtyItemsData("date="+yearmonth.substring(0,4) + "-" + yearmonth.substring(4,6));
    });
    // 初始化节目年份下拉菜单，月份列表从2007年开始到现在
    function InitAllYear(){        
        // 设置当前年份
        var nowYear = new Date().getFullYear();
        $("#currentyear").text( nowYear + "年");
        $(".mccYear").text(nowYear + "年");
        // 更新月份列表
        InitAllMonth(nowYear);
        // 获取父亲
        var ulObj = $("#allyear");
        for(var i=itemStartTime;i<=nowYear;i++){
            ulObj.append("<li value=" + i +"><a>" + i +"年</a></li>");
        }
    }

    // 更新月份列表
    function InitAllMonth(currentyear){
        // 获取 id 为 collapseyear 的标签下的所有 a标签
        var aObjs = $("#collapseyear").find("a.mccMonth");
        var length = aObjs.length;
        for(i = 0; i < aObjs.length; i++){
            aObjs[i].text = "";          
        }

        var currentDate = new Date();
        var currentMonth = currentDate.getMonth()+1;

        if(currentyear < currentDate.getFullYear()){
            currentMonth = 12;
        }
        
        for(var i = 0; i < currentMonth; i++)
        {
            var strTemp = currentyear + "0" + (i+1);
            if(i+1 > 9){strTemp = currentyear + "" + (i+1);}           
            aObjs[i].text = strTemp;
        }       
    }

    function showNoItemPrompt(isshow){ 
        isshow ? $(".noitemprompt").show().text(noItemPrompt) : $(".noitemprompt").hide();
    }
    // 控制播放器的显示与隐藏
    function toggleLoadingControls(loading) {        
        if (loading) {
            $(".spinner").show();            
        }
        else {
            $(".spinner").hide();
        }
    }

    // swty:   http://api.swtychina.com/api/values
    // date=2010-** 
    // ?date=2010-01
    // http://api.swtychina.com/api/swtymp3?path=mcchome/2018/201802
    function getSwtyItemsData(valuesDate){
        var server = 'http://api.swtychina.com/api/values?';
        
        // 删除原有节目
        $(".audio-inline").empty();

        // 控制spinner是否显示
        toggleLoadingControls(true);
        showNoItemPrompt(false);
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
                toggleLoadingControls(data.length);

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
                    }
                                                           
                }); 
                showNoItemPrompt(!audioFn.song.length); 
                if(audioFn.song.length ==0){                    
                    toggleLoadingControls(false);
                    return;
                }
                
                audioFn.selectMenu(0,false);
                audioFn.stopAudio();               
                isLoadLatestItem = false;
                toggleLoadingControls(false);

                
                //console.log(liObjs);
            }
        });        
    }
    
    $("#searchBtn").click(function(){
        SearchItem();
    });
    
    $("#itemname").focus(function(){
        $("#itemname").keydown(function(event){
            if(event.which == 13){
                SearchItem();
                event.preventDefault();
            }            
        });
        
    });
    function SearchItem(){
        var itemnameObj =  $("#itemname");        
        var input_value = itemnameObj.val();        
        if ($("#itemname").val().length == 0 ) {
            return ;
        }
       
        var search_value = "date=" + input_value;
        getSwtyItemsData(search_value);              
    }
    
});   

    
