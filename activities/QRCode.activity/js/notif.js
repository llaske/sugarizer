humane.baseCls = 'humane-original'
         var png-button = document.getElementsById('png-button')
         for (var i = 0; i < png-button.length; i++) { (function(el){
            el.onclick = function () {
               eval(el.innerHTML)
            }
         }(png-button[i])) }
