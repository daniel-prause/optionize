/*
 Optionize 1.0, a multi select box enhancer for jQuery
 by Daniel Prause
*/

(function ( $ ) {
  var lastClicked = null;
  $.fn.optionize = function() {
    if($(this).attr('multiple') !== 'multiple') {
      console.log('sorry, currently optionize only works on multi select boxes.');
      return;
    }
    var options = this.find("optgroup, option");
    var uniq = $(this).attr('id') || $(this).attr('name') || $(this).index();
    var optionsAsList = $("<ul>").addClass("optionize optionize-"+uniq+"");
    buildList(this, optionsAsList, options);
    this.hide();
    this.before(optionsAsList);
    handleOptionSelection(this, optionsAsList);
    handleSelectUpdate(this, optionsAsList);
    handleOptgroupClick(this, optionsAsList);
    return this;
  };

  function buildOptgroup(optionsAsList, object) {
    var after = object.dataset['afterText'] || '';
    var before = object.dataset['beforeText'] || '';
    var el = $("<li>").addClass('optgroup');
    el.html(before+object.label+after);
    optionsAsList.append(el);
  }

  function buildOption(optionsAsList, object) {
    var selected_or_not = object.selected ? 'selected' : '';
    var disabled_or_not = object.disabled ? 'disabled' : '';
    var el = $("<li>", {
      "data-text": object.innerHTML,
      "data-value": object.value,
      "data-disabled": object.disabled,
      "data-selected": object.selected
    }).addClass(selected_or_not).addClass(disabled_or_not).addClass('option');
    var after = object.dataset['afterText'] || '';
    var before = object.dataset['beforeText'] || '';
    el.html(before+object.innerHTML+after);
    optionsAsList.append(el);
  }

  function buildList(originalSelector, optionsAsList, options) {
    var list_disabled = originalSelector.closest('fieldset').attr('disabled') == 'disabled';
    $.each( options, function( index, object ) {
      if(list_disabled) {
        object.disabled = true;
      }
      if(object.tagName == 'OPTGROUP') {
        buildOptgroup(optionsAsList, object);
      } else {
        buildOption(optionsAsList, object);
      }
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

  function handleSelectUpdate(originalSelector, optionsAsList) {
    originalSelector.on("change DOMSubtreeModified click", function() {
      optionsAsList.find("li").remove();
      var options = originalSelector.find("optgroup, option");
      buildList(originalSelector, optionsAsList, options);
    })
  }

  function handleOptgroupClick(originalSelector, optionsAsList) {
    optionsAsList.on("click", ".optgroup", function() {
      var optgroup_index = $(this).index('.optgroup');
      var original_optgroup = originalSelector.find('optgroup:eq('+optgroup_index+')');
      var enabled_options = original_optgroup.find('option:enabled');
      var selected_options = original_optgroup.find('option:selected');
      if(enabled_options.length == selected_options.length) {
        enabled_options.prop("selected", false);
      }
      else {
        enabled_options.prop("selected", true);
      }
      originalSelector.change();
    })
  }

}( jQuery ));
