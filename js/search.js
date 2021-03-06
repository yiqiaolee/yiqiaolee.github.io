
$(function (){

    $('.search-widget').click(function (){

        var $sc = $('.search-container');
        var $msk = $('.search-mask');

        if($sc.hasClass('hide')){

          $sc.removeClass('hide').addClass('show');
          $msk.removeClass('hide').addClass('show');
          $('.search-input').focus();

          searchFunc("/search.xml", 'search-input', 'search-result');

        }else {

          $sc.removeClass('show').addClass('hide');
          $msk.removeClass('show').addClass('hide');
        }
    })
    
})


var searchFunc = function (path, search_id, content_id) {  
  $.ajax({
    url: path,
    dataType: "xml",
    success: function (xmlResponse) {
      // get the contents from search data
      var datas = $("entry", xmlResponse).map(function () {
        return {
          title: $("title", this).text(),
          content: $("content", this).text(),
          url: $("url", this).text()
        };
      }).get();

      var $input = document.getElementById(search_id);
      var $resultContent = document.getElementById(content_id);

      $input.addEventListener('input', function () {
        var str = '';
        var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
        $resultContent.innerHTML = "";
        if (this.value.trim().length <= 0) {
          return;
        }
        // perform local searching
        datas.forEach(function (data) {
          var isMatch = true;
          var content_index = [];
          if (!data.title || data.title.trim() === '') {
            data.title = "Untitled";
          }
          var data_title = data.title.trim().toLowerCase();
          var data_content = data.content.trim().replace(/<[^>]+>/g, "").toLowerCase();
          var data_url = data.url;
          var index_title = -1;
          var index_content = -1;
          var first_occur = -1;
          // only match artiles with not empty contents
          if (data_content !== '') {
            keywords.forEach(function (keyword, i) {
              index_title = data_title.indexOf(keyword);
              index_content = data_content.indexOf(keyword);

              if (index_title < 0 && index_content < 0) {
                isMatch = false;
              } else {
                if (index_content < 0) {
                  index_content = 0;
                }
                if (i == 0) {
                  first_occur = index_content;
                }               
              }
            });
          } else {
            isMatch = false;
          }
          // show search results
          if (isMatch) {
            str +="<div class='search-item'>" ;
            str += "<a href='" + data_url + "' class='search-title'>" + data_title + "</a>";
            var content = data.content.trim().replace(/<[^>]+>/g, "");
            if (first_occur >= 0) {       
              var start = first_occur - 40;
              var end = first_occur + 60;

              if (start < 0) {
                start = 0;
              }
              if (start == 0) {
                end = 100;
              }
              if (end > content.length) {
                end = content.length;
              }

              var match_content = content.substr(start, end);
              // highlight all keywords
              keywords.forEach(function (keyword) {
                var regS = new RegExp(keyword, "gi");
                match_content = match_content.replace(regS, "<span class=\"search-keyword\">" + keyword + "</span>");
              });

              str += "<p class=\"search-content\">" + match_content + "</p>"
            }     
            str += "</div>";    
          }
        });     
        if (str.indexOf('<div') === -1) {
          return $resultContent.innerHTML = "<div class='search-empty'>"+getFoundNothingWord()+"</div>";
        }
        $resultContent.innerHTML =  str;
      });
    }
  });

  $('.search-cancel').click(function (){
      $('.search-widget').click();
      $('#search-input').val('');
      $('#search-result').html('');
  })

}