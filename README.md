# Optionize 1.0.3

# What is Optionize?

Optionize started as an idea to be able to use HTML-elements in a
multi select box since HTML-elements are not allowed inside options.
This plugin is an enhancer to select tags with the multiple attribute supplied.

# Features

* Option to add HTML-elements before and after an option's and/or optgroup's text
* By clicking an optgroup, all options of the optgroup will be selected/deselected
* If your multi select box is wrapped in a fieldset with the disabled attribute, the options will be disabled.
* Reacts to updates on the original multi select box (adding/removing/disabling/enabling/changing elements)

## Compatibility

Optionize was tested against the following Browsers:

* IE 11
* Edge
* Firefox 61
* Chrome 67

Furthermore, it might work in other browsers as well.

# Installation and usage

### Installation

#### Prerequisites

For Optionize to work, you'll need jQuery. Optionize was developed
starting from jQuery 3.2.1 and it should work with the latest jQuery
versions as well.

You can get the latest jQuery version from https://jquery.com/.

Include jQuery and Optionize in your websites head tag:

```
<link rel="stylesheet" href="/path/to/optionize.css" />
<script src="/path/to/jquery-3.3.1.min.js"></script>
<script src="/path/to/optionize.min.js"></script>
```

#### Usage
* Create your desired multi select box, e.g. like so:
```
<select multiple id="my-list">
  <option value="1">
        One
  </option>
  <option value="2">
        Two
  </option>
  <option value="3">
        Three
  </option>
</select>
```
* Add Optionize via jQuery selector after your select box:
```
<script>
  $("#my-list").optionize();
</script>
```

#### Configuration
The following configuration options are available:
```
$("select").optionize({
  searchBox: {
    enable: true,
    placeholder: 'Your fancy placeholder'
  },
  noEntriesText: 'Text that is shown when no entries are available'
})
```

You can change the style of every Optionize you create as well.
Optionize will add a class based on the id of your initial multi select box.
To change the style of a specific Optionize element, you can use the following selector (see the example list above):
```
.optionize-my-list {

}
```

To change the style of optgroups or options of a specific Optionize instance,
you can use the following selectors:
```
.optionize-my-list .optgroup {

}

.optionize-my-list .option {

}

```

##### Additional elements

You can add HTML-elements before and/or after an option and/or optgroup.
```
<optgroup label="My Optgroup" data-before-text="<div>My HTML element</div>" data-after-text="<div>My HTML element</div>">
  <option data-before-text="<div>My HTML element</div>" data-after-text="<div>My HTML element</div>">
    Label
  </option>
</optgroup>
```

# Examples
There are some basic examples within the examples directory.

# License
Optionize is licensed under the MIT license.
Since jQuery is included for the examples page to work, see https://jquery.org/license/.
