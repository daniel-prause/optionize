/*
 Optionize 1.0.4, a multi select box enhancer for jQuery
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
    $(this).each(function(_index, element) {
      if($(element).attr('multiple') !== 'multiple') {
        console.log('sorry, currently optionize only works on multi select boxes.');
        return;
      }

      var identifier = $(element).attr('id') || $(element).attr('name');

      if(!identifier) {
         identifier = `id-${$("select").index($(element))}`;
         $(element).attr('id', identifier);
      }

      if($(`.optionize-${identifier}`).length > 0) {
        return; // optionize already initialized for this element
      }

      if(userConfig && (typeof userConfig  === "object")) {
        elementConfig[identifier] = {}
        $.extend( true, elementConfig[identifier], config, userConfig );
      }

      var options = $(element).find("optgroup, option");
      var optionsAsList = $("<ul>").addClass(`optionize optionize-${identifier}`);
      buildList($(element), optionsAsList, options, identifier);
      $(element).hide();
      $(element).before(optionsAsList);
      handleOptionSelection($(element), optionsAsList);
      handleSelectUpdate($(element), optionsAsList, identifier);
      handleOptgroupClick($(element), optionsAsList);

      if(elementConfig[identifier].searchBox.enabled) {
        addSearchBox(optionsAsList, `optionize-searchbox-${identifier}`, identifier)
      }
    });
    return $(this);
  };

  function buildOptgroup(optionsAsList, object) {
    var after = object.dataset['afterText'] || '';
    var before = object.dataset['beforeText'] || '';
    var el = $("<li>").addClass('optgroup');
    el.html(`${before}${object.label}${after}`);
    el.attr("data-hidden", "false")
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
      "data-hidden": hidden,
      "data-no-entries-element": object.noEntriesElement || false
    }).addClass(selected).addClass(disabled).addClass('option');
    if(object.hidden) {
      el.css("display", "none")
    }
    var after = object.dataset['afterText'] || '';
    var before = object.dataset['beforeText'] || '';
    el.html(`${before}${object.innerHTML}${after}`);
    optionsAsList.append(el);
  }

  function buildList(originalSelector, optionsAsList, options, identifier) {
    var listDisabled = originalSelector.closest('fieldset').attr('disabled') == 'disabled';
    $.each( options, function(_index, object ) {
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
      innerHTML: elementConfig[identifier].noEntriesText,
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

  function handleSelectUpdate(originalSelector, optionsAsList, identifier) {
    const swap_options = function(originalSelector, optionsAsList, identifier) {
      optionsAsList.find("li").remove();
      var options = originalSelector.find("optgroup, option");
      buildList(originalSelector, optionsAsList, options, identifier);
      if(elementConfig[identifier].searchBox.enabled) {
        showOnly(optionsAsList, $(`#optionize-searchbox-${identifier}`))
      }
    }

    // 1 jQuery events for click or change
    originalSelector.on("change click", function() {
      swap_options(originalSelector, optionsAsList, identifier)
    })

    // 2 use mutation observer for dom tree changes
    const targetNode = originalSelector[0];
    const config = { attributes: true, childList: true, subtree: true };
    const callback = (mutationList, _observer) => {
      for (const _mutation of mutationList) {
        swap_options(originalSelector, optionsAsList, identifier)
      }
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  }

  function handleOptgroupClick(originalSelector, optionsAsList) {
    optionsAsList.on("click", ".optgroup", function() {
      var optgroupIndex = optionsAsList.find(".optgroup").index($(this))
      var originalOptgroup = originalSelector.find(`optgroup:eq('${optgroupIndex}')`);
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

  function addSearchBox(optionsAsList, id, identifier) {
    var searchBox = $(
      "<input>",
      {
        type: 'text',
        id: id,
        class: 'optionize-search-box',
        placeholder: elementConfig[identifier].searchBox.placeholder
      }
    )
    searchBox.on("keyup", function() {
      showOnly(optionsAsList, searchBox)
    })
    optionsAsList.before(searchBox);
  }

  function showOnly(optionsAsList, input) {
    if($(input).val().length > 0) {
      optionsAsList.find(".optgroup").attr("data-hidden", "true").hide()
    } else {
      optionsAsList.find(".optgroup").attr("data-hidden", "false").show()
    }
    var shown = false;
    optionsAsList
      .find("li")
      .each(
        function(_index, element) {
          regex = new RegExp($(input).val(), "i")
          if(regex.test($(element).text()) && $(element).attr("data-hidden") == "false") {
            shown = true; // at least one element is shown
            $(element).show();
          } else {
            $(element).hide();
          }
          // show no entries option
          if(!shown && $(element).attr("data-no-entries-element") == "true") {
            $(element).show();
          }
        }
      )
  }

}( jQuery ));
