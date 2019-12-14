/*
 Optionize 1.0.3, a multi select box enhancer for jQuery
 by Daniel Prause
*/

(function ( $ ) {
  var lastClicked = null;
  var config = {
    searchBox: {
      enabled: false,
      placeholder: 'Search'
    },
    noEntriesText: 'no entries'
  }
  var elementConfig = {}
  $.fn.optionize = function(userConfig) {
    $(this).each(function(index, element) {
      if($(element).attr('multiple') !== 'multiple') {
        console.log('sorry, currently optionize only works on multi select boxes.');
        return;
      }

      var uniq = $(element).attr('id') || $(element).attr('name');

      if(!uniq) {
         uniq = "id-"+$("select").index($(element));
         $(element).attr('id', uniq);
      }

      if($(".optionize-"+uniq).length > 0) {
        return; // optionize already initialzed for this element
      }

      if(userConfig && (typeof userConfig  === "object")) {
        elementConfig[uniq] = {}
        $.extend( true, elementConfig[uniq], config, userConfig );
      }

      var options = $(element).find("optgroup, option");
      var optionsAsList = $("<ul>").addClass("optionize optionize-"+uniq);
      buildList($(element), optionsAsList, options, uniq);
      $(element).hide();
      $(element).before(optionsAsList);
      handleOptionSelection($(element), optionsAsList);
      handleSelectUpdate($(element), optionsAsList, uniq);
      handleOptgroupClick($(element), optionsAsList);

      if(elementConfig[uniq].searchBox.enabled) {
        addSearchBox($(element), optionsAsList, "optionize-searchbox-"+uniq, uniq)
      }
    });
    return $(this);
  };

  function buildOptgroup(optionsAsList, object) {
    var after = object.dataset['afterText'] || '';
    var before = object.dataset['beforeText'] || '';
    var el = $("<li>").addClass('optgroup');
    el.html(before+object.label+after);
    optionsAsList.append(el);
  }

  function buildOption(optionsAsList, object) {
    var selected = object.selected ? 'selected' : '';
    var disabled = object.disabled ? 'disabled' : '';
    var hidden = object.hidden || false;
    var el = $("<li>", {
      "data-text": object.innerHTML,
      "data-value": object.value,
      "data-disabled": object.disabled,
      "data-selected": object.selected,
      "data-hidden": object.hidden || false,
      "data-no-entries-element": object.noEntriesElement || false
    }).addClass(selected).addClass(disabled).addClass('option');
    if(object.hidden) {
      el.css("display", "none")
    }
    var after = object.dataset['afterText'] || '';
    var before = object.dataset['beforeText'] || '';
    el.html(before+object.innerHTML+after);
    optionsAsList.append(el);
  }

  function buildList(originalSelector, optionsAsList, options, uniq) {
    var listDisabled = originalSelector.closest('fieldset').attr('disabled') == 'disabled';
    $.each( options, function( index, object ) {
      if(listDisabled) {
        object.disabled = true;
      }
      if(object.tagName == 'OPTGROUP') {
        buildOptgroup(optionsAsList, object);
      } else {
        buildOption(optionsAsList, object);
      }
    });
    // build "no entries found option"
    buildOption(optionsAsList, {
      innerHTML: elementConfig[uniq].noEntriesText,
      disabled: true,
      selected: false,
      hidden: options.length > 0,
      value: '-',
      dataset: {},
      noEntriesElement: true
    });
  }

  function selectElement(el, option) {
    if(option.tagName != 'OPTGROUP') {
      el.addClass('selected');
      el.attr('data-selected', 'true');
      option.selected = true;
    }
  }

  function deselectElement(el, option) {
    if(option.tagName != 'OPTGROUP') {
      el.removeClass('selected');
      el.attr('data-selected', 'false');
      option.selected = false;
    }
  }

  function handleOptionSelection(originalSelector, optionsAsList) {
    optionsAsList.on("click", "li:not(.optgroup)", function(e) {
          var selector = optionsAsList.find('li');

          if(e.shiftKey) {
            var start = $(this).index();
            if (lastClicked == null) {
              lastClicked = $(this);
            }
            var end = lastClicked.index();

            if(start > end)
            {
              var helper = start;
              start = end;
              end = helper;
            }

            var options = originalSelector.find('optgroup, option');
            $.each(selector, function( index ) {
              if(index >= start && index <= end && !options[index].disabled) {
                selectElement($(this),options[index]);
              } else {
                deselectElement($(this),options[index]);
              }
            });

          } else {
            lastClicked = $(this);
            if($(this).attr('data-disabled') != 'true') {
              var value = $(this).attr('data-value');
              var option = originalSelector.find('optgroup, option').get($(this).index());
              if($(this).attr('data-selected') == 'true') {
                deselectElement($(this), option);
              } else {
                selectElement($(this), option);
              }
            }
          }
          originalSelector.change();
        }
    )
  }

  function handleSelectUpdate(originalSelector, optionsAsList, uniq) {
    originalSelector.on("change DOMSubtreeModified click", function() {
      optionsAsList.find("li").remove();
      var options = originalSelector.find("optgroup, option");
      buildList(originalSelector, optionsAsList, options, uniq);
      if(elementConfig[uniq].searchBox.enabled) {
        showOnly(originalSelector, optionsAsList, $("#optionize-searchbox-"+uniq))
      }
    })
  }

  function handleOptgroupClick(originalSelector, optionsAsList) {
    optionsAsList.on("click", ".optgroup", function() {
      var optgroupIndex = optionsAsList.find(".optgroup").index($(this))
      var originalOptgroup = originalSelector.find('optgroup:eq('+optgroupIndex+')');
      var enabledOptions = originalOptgroup.find('option:enabled');
      var selectedOptions = originalOptgroup.find('option:selected');
      if(enabledOptions.length == selectedOptions.length) {
        enabledOptions.prop("selected", false);
      }
      else {
        enabledOptions.prop("selected", true);
      }
      originalSelector.change();
    })
  }

  function addSearchBox(originalSelector, optionsAsList, id, uniq) {
    var searchBox = $(
      "<input>",
      {
        type: 'text',
        id: id,
        class: 'optionize-search-box',
        placeholder: elementConfig[uniq].searchBox.placeholder
      }
    )
    searchBox.on("keyup", function() {
      showOnly(originalSelector, optionsAsList, searchBox)
    })
    optionsAsList.before(searchBox);
  }

  function showOnly(originalSelector, optionsAsList, input) {
    if($(input).val().length > 0) {
      optionsAsList.find(".optgroup").hide()
    } else {
      optionsAsList.find(".optgroup").show()
    }
    var shown = false;
    optionsAsList
      .find("li")
      .each(
        function(index, element) {
          regex = new RegExp($(input).val(), "i")
          if(regex.test($(element).text()) && $(element).attr("data-hidden") == "false") {
            shown = true; // at least one element is shown
            $(element).show();
          } else {
            $(element).hide();
          }
          // show no entries option
          if(shown == 0 && $(element).attr("data-no-entries-element") == "true") {
            $(element).show();
          }
        }
      )
  }

}( jQuery ));
