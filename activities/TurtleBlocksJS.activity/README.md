TurtleBlocks JS
===============

Turtle Blocks Javascript is an activity with a
Logo-inspired graphical "turtle" that draws colorful art based on
snap-together visual programming elements. Its "low floor" provides an
easy entry point for beginners. It also has "high ceiling"
programming, graphics, mathematics, and Computer Science features
which will challenge the more adventurous student.

> Note: Turtle Blocks JS closely parallels the Python version of Turtle
> Blocks, the version included in the Sugar distribution. Sugar users
> probably want to use Turtle Blocks rather than Turtle Blocks JS.

![Turtle Blocks](https://github.com/walterbender/turtleblocksjs/raw/master/screenshots/screenshot.png "Turtle Blocks")

Using Turtle Art JS
-------------------

Turtle Blocks Javascript is designed to run in a browser. Most of the
development has been done in Chrome, but it should also work in
Firefox. You can run it directly from index.html, from a [server
maintained by Sugar Labs](http://turtle.sugarlabs.org), from the
[github
repo](http://rawgit.com/walterbender/turtleblocksjs/master/index.html),
or by setting up a [local
server](https://github.com/walterbender/turtleblocksjs/blob/master/server.md).

Once you've launched it in your browser, start by clicking on (or
dragging) blocks from the Turtle palette. Use multiple blocks to
create drawings; as the turtle moves under your control, colorful
lines are drawn.

You add blocks to your program by clicking on or dragging them from
the palette to the main area. You can delete a block by dragging it
back onto the palette. Click anywhere on a "stack" of blocks to start
executing that stack or by clicking in the Rabbit (fast) or Turtle
(slow) on the Main Toolbar.

Getting Started Documentation
-----------------------------

The basic buttons and basic blocks are explained in detail in [Documentation](https://github.com/walterbender/turtleblocksjs/blob/master/documentation/README.md).

A guide to programming with Turtle Blocks is available in [Turtle Blocks Guide](https://github.com/walterbender/turtleblocksjs/blob/master/guide/README.md).

A quick start:

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/fast-button.png'</img>
Run your project at full speed

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/stop-turtle-button.png'</img>
Stop the current project running.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/clear-button.png'</img>
Clear the screen and return the turtles to their initial positions.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/palette-button.png'</img>
Hide or show the block palettes.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/hide-blocks-button.png'</img>
Hide or show the blocks and the palettes.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/forward.svg'</img>
Moves turtle forward.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/right.svg'</img>
Turns turtle clockwise (angle in degrees).

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/set_color.svg'</img>
Sets color of the line drawn by the turtle.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/set_pen_size.svg'</img>
Sets size of the line drawn by the turtle.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/repeat.svg'</img>
Loops specified number of times.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/action_flow.svg'</img>
Top of nameable action stack.

<img src='https://rawgithub.com/walterbender/turtleblocksjs/master/documentation/action.svg'</img>
Invokes named action stack.

Google Code-in participant Jasmine Park has created some guides to
using Turtle Blocks: [Turtle Blocks: An Introductory
Manual](http://people.sugarlabs.org/walter/TurtleBlocksIntroductoryManual.pdf)
and [Turtle Blocks: A Manual for Advanced
Blocks](http://people.sugarlabs.org/walter/TurtleBlocksAdvancedBlocksManual.pdf)

Reporting Bugs
--------------

Bugs can be reported in the [Sugar Labs bug
tracker](https://bugs.sugarlabs.org/newticket?component=Turtleart) or
in the [issues
section](https://github.com/walterbender/turtleblocksjs/issues) of
this repository.


Advanced Features
-----------------

Turtle Blocks has a plugin mechanism that is used to add new
blocks. You can learn more about how to use plugins (and how to write
them) from the [Plugins
Guide](https://github.com/walterbender/turtleblocksjs/blob/master/plugins/README.md).


List of Plugins
---------------

* [Mindstorms](https://github.com/SAMdroid-apps/turtlestorm): blocks to interact with the LEGO Mindstorms robotics kit
* [RoDi](https://github.com/walterbender/turtleblocksjs/blob/master/plugins/rodi.json): blocks to interact with RoDi wireless robot
* [Maths](https://github.com/walterbender/turtleblocksjs/blob/master/maths.json): addition blocks for some more advanced mathematics
* [Translate](https://github.com/walterbender/turtleblocksjs/blob/master/translate.json): blocks for translating strings between languages, e.g., English to Spanish
* [Dictionary](https://github.com/walterbender/turtleblocksjs/blob/master/dictionary.json): a block to look up dictionary definitions
* [Weather](https://github.com/walterbender/turtleblocksjs/blob/master/weather.json): blocks to retrieve global weather forecasts
* [Logic](https://github.com/walterbender/turtleblocksjs/blob/master/logic.json): blocks for bitwise Boolean operations
* [Finance](https://github.com/walterbender/turtleblocksjs/blob/master/finance.json): a block for looking up market prices
* [Bitcoin](https://github.com/walterbender/turtleblocksjs/blob/master/bitcoin.json): a block for looking up bitcoin exchange rates
* [Nutrition](https://github.com/walterbender/turtleblocksjs/blob/master/nutrition.json): blocks for exploring the nutritional content of food
* [Facebook](https://github.com/walterbender/turtleblocksjs/blob/master/facebook.json): a block for publishing a project to Facebook
* [Heap](https://github.com/walterbender/turtleblocksjs/blob/master/heap.json): blocks to support a heap and for loading and saving data
* [Accelerometer](https://github.com/walterbender/turtleblocksjs/blob/master/accelerometer.json): blocks for accessing an accelerometer
* [Turtle](https://github.com/walterbender/turtleblocksjs/blob/master/turtle.json): blocks to support advanced features when using multiple turtles
* [Gmap](https://github.com/walterbender/turtleblocksjs/blob/master/gmap.json): blocks to support generation of Google maps.
