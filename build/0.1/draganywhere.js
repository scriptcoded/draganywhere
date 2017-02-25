(function($) {

  var catchers = {};
  var catchersCounter = 0;
  
  var dragItems = {};
  var dragItemsCount = 0;
  
  var currentMousePos = { x: 0, y: 0 };

  var offsetX = 0;
  var offsetY = 0;

  var $dragging = null;

  var $hoverElem = null;
  var hoverElemIsCatcher = false;
  
  var catcherItem = null;


  $.fn.catcher = function(attr1, attr2) {
  
    var attr1IsObject = attr1 instanceof Object;
  
    if (attr1 == undefined || attr1IsObject) {
      var defaults = {
          destroyOnDrop: true,
          onItemEnter: function() {},
          onItemExit: function() {},
          onItemDrop: function() {}
        }
      if (attr1IsObject) {
        var opt = attr1;
      } else {
        var opt = {};
      }
      var item = {
        element: $(this),
        options: {},
        hasEntered: false,
        locked: false
      };
      
      for (key in defaults) {
        if (opt[key] != undefined) {
          item.options[key] = opt[key];
        } else {
          item.options[key] = defaults[key]
        }
      }
      
      $(this).addClass("drag-catcher");
      
      var uid = "catcher-" + catchersCounter;
      
      catchers[uid] = item;
      
      $(this).data("uid", uid);
      
      catchersCounter++;
      
    } else if (attr1 == "locked") {
    	var uid = $(this).data("uid");
      var item = catchers[uid];
      
      item.locked = attr2;
      
      catchers[uid] = item;
      
			if (item.locked) {
      	$(this).addClass("drag-catcher-locked");
      } else {
      	$(this).removeClass("drag-catcher-locked");
      }
    }
  };

  $.fn.dragItem = function(attr1, attr2) {
  
    var attr1IsObject = attr1 instanceof Object;
  
    if (attr1 == undefined || attr1IsObject) {
      var defaults = {
          name: ""
        }
      if (attr1IsObject) {
        var opt = attr1;
      } else {
        var opt = {};
      }
      var item = {
        element: $(this),
        options: {}
      };
      
      for (key in defaults) {
        if (opt[key] != undefined) {
          item.options[key] = opt[key];
        } else {
          item.options[key] = defaults[key]
        }
      }
      
      $(this).addClass("drag-item");
      
      var uid = "dragItem-" + dragItemsCount;
      
      dragItems[uid] = item;
      
      $(this).data("uid", uid);
      
      dragItemsCount++;
      
    }
  };

  $(document.body).on("mousemove", dragMove);
  $(document.body).on("touchmove", dragMove);

  $(document.body).on("mousedown", ".drag-item", dragBegin);
  $(document.body).on("touchstart", ".drag-item", dragBegin);

  $(document.body).on("mouseup", dragEnd);
  $(document.body).on("touchend", dragEnd);
  
  function dragMove(e) {

    calculateMousePosition(e);
    
    $(".drag-catcher-active").removeClass("drag-catcher-active");

    if ($dragging) {
      
      $hoverElem = $(document.elementFromPoint(currentMousePos.x, currentMousePos.y));
      
      hoverElemIsCatcher = isCatcher($hoverElem, catchers);
      
      console.log(hoverElemIsCatcher);
      
      if (!hoverElemIsCatcher) {
        $hoverElem = $hoverElem.parents(".drag-catcher").first();
        hoverElemIsCatcher = isCatcher($hoverElem, catchers);
      }
      
      if (hoverElemIsCatcher) {

        catcherItem = catchers[$hoverElem.data("uid")];
        
        if (!catcherItem.locked) {
        	$hoverElem.addClass("drag-catcher-active");

          if (!catcherItem.hasEntered) {
            catcherItem.hasEntered = true;

            var enterEvent = {

            };
            catcherItem.options.onItemEnter.call(catcherItem.element, enterEvent);
          }
        }
      } else {
      	if (hoverElemIsCatcher && catcherItem != null) {
        	if (!catcherItem.locked) {
            if (catcherItem.hasEntered) {          
              catcherItem.hasEntered = false;

              var exitEvent = {

              };
              catcherItem.options.onItemExit.call(catcherItem.element, exitEvent);
            }
          }

          catcherItem = {};
        }
      }
    
      $dragging.offset({
        left: currentMousePos.x - offsetX,
        top: currentMousePos.y - offsetY
      });
      $dragging.css("z-index", 999);
    }
    
  }

  function dragBegin(e) {

    if (e.which != 0 && e.which != 1) {
      return;
    }

    e.preventDefault();

    calculateMousePosition(e);

    $dragging = $(e.target);

    $dragging.css({
      "pointer-events": "none",
      "position": "absolute"
    });

    var draggingOffset = $dragging.offset();
    
    offsetX = currentMousePos.x - draggingOffset.left;
    offsetY = currentMousePos.y - draggingOffset.top;

    dragMove(e);
  }

  function dragEnd(e) {
  
    if ($dragging == null) {
      return;
    }
    
    if (hoverElemIsCatcher && catcherItem != null) {
    
    	if (!catcherItem.locked) {
        var dragItem = dragItems[$dragging.data("uid")];

        var dropEvent = {
          name: dragItem.options.name
        };

        catcherItem.options.onItemDrop.call(catcherItem.element, dropEvent);

        if (catcherItem.options.destroyOnDrop) {
          $dragging.remove();
        }
      }
    }

    $dragging.css({
      "top": "",
      "left": "",
      "position": "",
      "pointer-events": "",
      "z-index": ""
    });

    $dragging = null;
    $hoverElem = null;
    offsetX = 0;
    offsetY = 0;
  }

  function calculateMousePosition(e) {

    var touching = e.touches != undefined;

    if (touching) {
      var touch = e.touches[0];
    }

    currentMousePos.x = touch ? touch.pageX : e.pageX;
    currentMousePos.y = touch ? touch.pageY : e.pageY;
  }
  
  function isCatcher($elem) {
    return catchers[$($elem).data("uid")] != undefined;
  }
  function isDragItem($elem) {
    return dragItems[$($elem).data("uid")] != undefined;
  }
  
  /*function isCatcher(value) {
    for (var index in catchers) {
      if ($(catchers[index].element).is(value)) {
        return true;
      }
    }
    return false;
  }*/

})(jQuery);
