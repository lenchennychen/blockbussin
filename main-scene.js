import {defs, tiny} from './common.js';
import {blockbussin} from "./blockbussin.js";

// Pull these names into this module's scope for convenience:
const {
    Canvas_Widget, Code_Widget, Text_Widget
} = tiny;

// Now we have loaded everything in the files tiny-graphics.js, tiny-graphics-widgets.js, and common.js.
// This yielded "tiny", an object wrapping the stuff in the first two files, and "defs" for wrapping all the rest.

// ******************** Extra step only for when executing on a local machine:
//                      Load any more files in your directory and copy them into "defs."
//                      (On the web, a server should instead just pack all these as well
//                      as common.js into one file for you, such as "dependencies.js")

Object.assign(defs,
    {blockbussin}
);

// ******************** End extra step

// (Can define Main_Scene's class here)

const Main_Scene = blockbussin;
const Additional_Scenes = [];

export {Main_Scene, Additional_Scenes, Canvas_Widget, Code_Widget, Text_Widget, defs}