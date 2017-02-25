(function ($) {

	var catchers = {};
	var catchersCounter = 0;

	var dragItems = {};
	var dragItemsCount = 0;

	var triggers = {};
	var triggersCount = 0;

	var currentMousePos = { x: 0, y: 0 };
	var startMousePos = { x: 0, y: 0 };

	var offsetX = 0;
	var offsetY = 0;

	var $dragging = null;
	var $draggingClone = null;
	var draggingItem = {};

	var $hoverElem = null;
	var hoverElemIsCatcher = false;

	var catcherItem = null;

	var triggerItem = null;

	var queuedExits = [];

	var clickEvent = null;

	$.fn.catcher = function (arg1 = {}, arg2) {

		if (arg1 instanceof Object) {

			var opts = $.extend({}, $.fn.catcher.defaults, arg1);

			$(this).addClass("drag-catcher");

			var uid = "catcher-" + catchersCounter;

			catchers[uid] = item;

			$(this).data("uid", uid);

			catchersCounter++;

			var item = {
				element: $(this),
				options: opts,
				hasEntered: false,
				locked: false
			};

			catchers[uid] = item;
		} else if (arg1 == "locked") {
			if (arg2 === true) {
				$(this).addClass("drag-catcher-locked");
			} else if (arg2 === false) {
				$(this).removeClass("drag-catcher-locked");
			}
		}
	};

	$.fn.catcher.defaults = {
		destroyOnDrop: true,
		tagWhitelist: [],
		tagBlacklist: [],
		triggerEnterOnIllegal: false,
		onItemEnter: function () { },
		onItemExit: function () { },
		onItemDrop: function () { },
		onIllegalItem: function () { }
	};

	$.fn.dragItem = function () {

		var args = arguments;

		if (args.length <= 0) {
			args[0] = {};
		}

		if (args[0] instanceof Object) {
			var opts = $.extend({}, $.fn.dragItem.defaults, args[0]);

			$(this).addClass("drag-item");

			var uid = "dragItem-" + dragItemsCount;

			var item = {
				element: $(this),
				options: opts,
				hasEntered: false,
				locked: false,
				illegalItem: false
			};

			dragItems[uid] = item;

			$(this).data("uid", uid);

			dragItemsCount++;
		} else if (args[0] == "getData") {

			var uid = $(this).data("uid");
			var item = dragItems[uid];

			return item.options.data;

		} else if (args[0] == "setData" && typeof args[2] == "string") {
			
			var uid = $(this).data("uid");
			var item = dragItems[uid];

			var modifiedData = $.extend({}, item.options.data, args[1]);
			
			item.options.data = modifiedData;

		} else if (args[0] == "setData") {

			var uid = $(this).data("uid");
			var item = dragItems[uid];

			item.options.data = args[1];

		}
	};

	$.fn.dragItem.defaults = {
		clone: false,
		tags: [],
		data: {}
	}

	$.fn.itemTrigger = function() {
		var args = arguments;

		if (args.length <= 0) {
			args[0] = {};
		}

		if (args[0] instanceof Object) {
			var opts = $.extend({}, $.fn.itemTrigger.defaults, args[0]);

			$(this).addClass("drag-item-trigger");

			var uid = "itemTrigger-" + triggersCount;

			var item = {
				element: $(this),
				options: opts,
				hasEntered: false,
				locked: false,
				illegalItem: false
			};

			triggers[uid] = item;

			$(this).data("uid", uid);

			triggersCount++;
		}
	}

	$.fn.itemTrigger.defaults = {
		action: "click",
		hoverDelay: 500,
		tagWhitelist: [],
		tagBlacklist: [],
		triggerEnterOnIllegal: false,
		onItemEnter: function () { },
		onItemExit: function () { },
		onIllegalItem: function () { }
	};

	$(document.body).on("mousemove", dragMove);
	$(document.body).on("touchmove", dragMove);

	$(document.body).on("mousedown", ".drag-item", dragBegin);
	$(document.body).on("touchstart", ".drag-item", dragBegin);

	$(document.body).on("mouseup", dragEnd);
	$(document.body).on("touchend", dragEnd);
	
	function dragMove(e) {

		calculateMousePosition(e);

		if ($dragging) {

			e.preventDefault();

			$dragging.addClass("drag-item-dragging");
			$dragging.css({"pointer-events": "none"});
			$hoverElem = $(document.elementFromPoint(currentMousePos.x - $(window).scrollLeft(), currentMousePos.y - $(window).scrollTop()));
			$dragging.css({ "pointer-events": "" });
			hoverElemIsCatcher = isDragAnywhereElem($hoverElem, catchers);

			hoverElemIsTrigger = isDragAnywhereElem($hoverElem, triggers);

			if (!hoverElemIsCatcher && !hoverElemIsTrigger) {
				$hoverElem = $hoverElem.parents(".drag-catcher").first();
				hoverElemIsCatcher = isDragAnywhereElem($hoverElem, catchers);

				if (!hoverElemIsCatcher) {
					$hoverElem = $hoverElem.parents(".drag-item-trigger").first();
					hoverElemIsTrigger = isDragAnywhereElem($hoverElem, triggers);
				}
			}

			if (hoverElemIsCatcher) {

				catcherItem = catchers[$hoverElem.data("uid")];

				if (!catcherItem.locked && !catcherItem.illegalItem) {

					if (!catcherItem.hasEntered) {
						catcherItem.hasEntered = true;
						queuedExits.push($hoverElem.data("uid"));

						var tagWhitelist = catcherItem.options.tagWhitelist;
						var tagBlacklist = catcherItem.options.tagBlacklist;
						var tags = draggingItem.options.tags;

						var isWhitelisted = true;
						var isBlacklisted = false;

						var tagWhitelistIntersection = [];
						var tagBlacklistIntersection = [];
						
						if (tagWhitelist.length > 0) {
							isWhitelisted = false;
							tagWhitelistIntersection = intersection_destructive(tagWhitelist, tags);
						}
						if (tagBlacklist.length > 0) {
							isBlacklisted = true;
							tagBlacklistIntersection = intersection_destructive(tagBlacklist, tags);
						}

						if (tagWhitelistIntersection.length > 0) {
							isWhitelisted = true;
						}
						if (tagBlacklistIntersection.length <= 0) {
							isBlacklisted = false;
						}
						
						if ((isWhitelisted && !isBlacklisted) || catcherItem.options.triggerEnterOnIllegal) {
							$hoverElem.addClass("drag-catcher-active");
							var enterEvent = {

							};
							catcherItem.options.onItemEnter.call(catcherItem.element, enterEvent);
						}
						if (!isWhitelisted || isBlacklisted) {
							catcherItem.illegalItem = true;
							$hoverElem.addClass("drag-catcher-illegal-item");
							var illegalItemEvent = {

							};
							catcherItem.options.onIllegalItem.call(catcherItem.element, illegalItemEvent);
						}
					}
				}
			} else if (hoverElemIsTrigger) {
				triggerItem = triggers[$hoverElem.data("uid")];
				
				if (!triggerItem.locked && !triggerItem.illegalItem) {

					if (!triggerItem.hasEntered) {
						triggerItem.hasEntered = true;
						queuedExits.push($hoverElem.data("uid"));

						var tagWhitelist = triggerItem.options.tagWhitelist;
						var tagBlacklist = triggerItem.options.tagBlacklist;
						var tags = draggingItem.options.tags;

						var isWhitelisted = true;
						var isBlacklisted = false;

						var tagWhitelistIntersection = [];
						var tagBlacklistIntersection = [];

						if (tagWhitelist.length > 0) {
							isWhitelisted = false;
							tagWhitelistIntersection = intersection_destructive(tagWhitelist, tags);
						}
						if (tagBlacklist.length > 0) {
							isBlacklisted = true;
							tagBlacklistIntersection = intersection_destructive(tagBlacklist, tags);
						}

						if (tagWhitelistIntersection.length > 0) {
							isWhitelisted = true;
						}
						if (tagBlacklistIntersection.length <= 0) {
							isBlacklisted = false;
						}

						if ((isWhitelisted && !isBlacklisted) || triggerItem.options.triggerEnterOnIllegal) {
							$hoverElem.addClass("drag-trigger-active");
							var enterEvent = {

							};
							triggerItem.options.onItemEnter.call(triggerItem.element, enterEvent);
						}
						if (!isWhitelisted || isBlacklisted) {
							triggerItem.illegalItem = true;
							$hoverElem.addClass("drag-trigger-illegal-item");
							var illegalItemEvent = {

							};
							triggerItem.options.onIllegalItem.call(triggerItem.element, illegalItemEvent);
						}
					}
				}
			} else {
				if (hoverElemIsCatcher && catcherItem != null) {
					catcherItem = {};
				}

				for (var i in queuedExits) {
					var tmpCatcherItem = catchers[queuedExits[i]];
					tmpCatcherItem.hasEntered = false;
					tmpCatcherItem.illegalItem = false;
					// Possibly better way of handling classes.
					
					// if (!tmpCatcherItem.illegalItem) {
					// 	$(tmpCatcherItem.element).removeClass("drag-catcher-illegal-item");
					// }
					var exitEvent = {

					};
					catcherItem.options.onItemExit.call(tmpCatcherItem.element, exitEvent);
				}

				$(".drag-catcher-active").removeClass("drag-catcher-active");
				$(".drag-catcher-illegal-item").removeClass("drag-catcher-illegal-item");
			}

			$dragging.offset({
				left: currentMousePos.x - offsetX,
				top: currentMousePos.y - offsetY
			});
			$dragging.css("z-index", 999);
		}

	}

	function dragBegin(e) {

		clickEvent = e;

		if (e.which != 0 && e.which != 1) {
			return;
		}

		calculateMousePosition(e);
		startMousePos.x = currentMousePos.x;
		startMousePos.y = currentMousePos.y;

		$dragging = $(e.target);

		draggingItem = dragItems[$dragging.data("uid")];

		$dragging.css({
			"position": "absolute"
		});

		var draggingOffset = $dragging.offset();

		offsetX = currentMousePos.x - draggingOffset.left;
		offsetY = currentMousePos.y - draggingOffset.top;
		
		if (draggingItem.options.clone) {
			$draggingClone = $(e.target).clone().insertBefore($dragging);
		}
	}

	function dragEnd(e) {

		calculateMousePosition(e);

		$(".drag-catcher-active").removeClass("drag-catcher-active");
		$(".drag-catcher-illegal-item").removeClass("drag-catcher-illegal-item");

		if ($dragging == null) {
			return;
		}

		$dragging.removeClass("drag-item-dragging");

		if (startMousePos.x != currentMousePos.x || startMousePos.y != currentMousePos.y) {
			$dragging.bind("click", function(e) { e.preventDefault(); });
		} else {
			$dragging.unbind("click");
		}

		var dragItem = dragItems[$dragging.data("uid")];

		if (hoverElemIsCatcher && catcherItem != null) {

			if (!catcherItem.locked && !catcherItem.illegalItem) {

				var dropEvent = {
					dropped: dragItem.options
				};

				catcherItem.options.onItemDrop.call(catcherItem.element, dropEvent);

				if (catcherItem.options.destroyOnDrop) {
					$dragging.remove();
				}
			}
		}
		// if (hoverElemIsTrigger && triggerItem != null) {

		// 	if (!triggerItem.locked && !triggerItem.illegalItem) {

		// 		var dropEvent = {
		// 			dropped: dragItem.options
		// 		};

		// 		triggerItem.options.onItemDrop.call(triggerItem.element, dropEvent);
		// 	}
		// }

		if (dragItem.options.clone) {
			$draggingClone.remove();
		}

		$dragging.css({
			"top": "",
			"left": "",
			"position": "",
			"z-index": ""
		});
		
		$dragging = null;
		$draggingClone = null;
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

	function isDragAnywhereElem($elem, a) {
		return a[$($elem).data("uid")] != undefined;
	}
	
	function intersection_destructive(aRaw, bRaw) {
		var a = aRaw.slice();
		var b = bRaw.slice();
		var result = [];
		while (a.length > 0 && b.length > 0) {
			if (a[0] < b[0]) {
				a.shift();
			} else if (a[0] > b[0]) {
				b.shift();
			} else {
				result.push(a.shift());
				b.shift();
			}
		}

		return result;
	}

})(jQuery);
