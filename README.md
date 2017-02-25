# DragAnywhere

DragAnywhere is a jQuery plugin that adds a whole new level of interactivity to
your web app by creating a seamless connection between different parts of your site.
DragAnywhere makes elements of your choice draggable and stores data along with
them to make information interchangeable across your whole site.

With a few lines of code links can be shared between chat windows, and files can be
tossed in the trash quicker than ever before.

## Table of contents

 - [Installation](#installation)
 - [Usage](#usage)
 - [Documentation](#documentation)

## Installation

1. Download and install [jQuery](https://jquery.com/download/).
2. Download DragAnywhere from this GitHub page.
3. Include DragAnywhere (`<script src="path/to/draganywhere.min.js"></script>`)
4. All done and dusted!

## Usage

Many jQuery plugins provide either ease of use or broad functionality, but there
is a lack of plugins providing both. Therefore DragAnywhare aims to do just that,
provide both.

DragAnywhere essentially consists of two elements, each represented by a method.
The **catchers** and **drag items**. **Drag items** (represented by `dragItem`) are elements that can be
moved, and **catchers** (represented by `catcher`) are elements that catch **drag items**.

### Creating a draggable elements

Creating a draggable element is as easy as writing a single line of JavaScript:

```javascript
$("#myItem").dragItem();
```

There you go! If you've got an element with the id `myItem` you will now be able to
drag it around. Awesome!

However, dragging an element around isn't any good if we can't do anything with it.
Let's create a `catcher`.

```javascript
$("#myCatcher").catcher();
```

This won't do a lot however. To make your page respond when something is dropped in
your catcher we will have to supply the catcher with a callback function. Let's
rewrite the last line of code.

```javascript
$("#myCatcher").dragCatcher({
  onDrop: function() {
    console.log("Item dropped!");
  }
});
```

If you drop your previously created `dragItem` on you new `catcher` you should
notice a message in your console saying `Item dropped!`. Congratulations on your
first DragAnywhere implementation!

## Documentation

Here follows the documentation for all methods and options in DragAnywhere.

> ## Method: _`$.dragItem([arg1 [, arg2 ...]])`_
>
> Creates a dragItem or runs specific internal function.
>
> ## Creating a `dragItem`
>
> | Argument | Value    | Required | Description |
> | ---      | ---      | ---      | ---         |
> | `arg1`   | `Object` | No       | Should contain options for creating `dragItem`.
>
> ### Possible options
>
> | Key   | Value     | Default value | Description |
> | ---   | ---       | ---           | ---         |
> | clone | `Boolean` | `false`       | If `true` the element will be cloned upon dragging. The clone will be removed upon drop.
> | tags  | `Array`   | [ ]           | Tags for the item. Tags are used to whitelist and blacklist tags in `catcher` elements.
> | data  | `Object`  | { }           | Custom data for the element. Must be of type `Object` but can contain any data.
>
> 
>
> ## Calling an internal function
> | Argument        | Value     | Required | Description |
> | ---             | ---       | ---      | ---         |
> | `arg1`          | `String`  | Yes      | Internal method name. Possible names listed further down.
> | `arg2 ... argX` | [ mixed ] |          | Additional arguments depending on method name.
>
> ### Possible method names
>
> ### `"getData"`
>
> | Argument     | Value | Description |
> | ---          | ---   | ---         |
> | No arguments 
> ----
> ### `"setData"`
>
> | Argument | Value     | Required | Description |
> | ---      | ---       | ---      | ---         |
> | `arg2`   | `Object`  | Yes      | Data to write. Will be merged if already existing.
>
> ## Examples
> ### Creating a `dragItem` without options
> ```javascript
> $("myItem").dragItem();
> ```
> 
> ### Creating a `dragItem` with options
> ```javascript
> $("myItem").dragItem({
>   clone: true,
>   tags: [ "image", "png" ],
>   data: {
>     filename: "foobar.png"
>   }
> });
> ```
> 
> ### Modifying `dragItem` data
> ```javascript
> $("myItem").dragItem("setData", {
>   filename: "foobar-2.png",
>   name: "Foo bar"
> });
> ```