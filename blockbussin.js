import { defs, tiny } from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Cube
} = tiny;

const INIT_X = 10;
const INIT_Y = 20;
const INIT_Z = 10;


class Cube_Outline extends Shape {
    constructor() {
        super("position", "color");
        this.indices = false;
        this.white = hex_color("#FFFFFF");
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [-1, -1, -1], [-1, -1, 1], [1, -1, -1], [1, -1, 1],
            [-1, -1, -1], [-1, 1, -1], [-1, -1, 1], [-1, 1, 1], [1, -1, -1], [1, 1, -1], [1, -1, 1], [1, 1, 1],
            [-1, 1, -1], [1, 1, -1], [-1, 1, -1], [-1, 1, 1], [1, 1, -1], [1, 1, 1], [-1, 1, 1], [1, 1, 1])
        this.arrays.color = [
            this.white, this.white, this.white, this.white, this.white, this.white, this.white, this.white,
            this.white, this.white, this.white, this.white, this.white, this.white, this.white, this.white,
            this.white, this.white, this.white, this.white, this.white, this.white, this.white, this.white]
    }
}

class Square_Outline extends Shape {
    constructor() {
        super("position", "color");
        this.indices = false;
        this.white = hex_color("#FFFFFF");
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [-1, -1, -1], [-1, -1, 1], [1, -1, -1], [1, -1, 1])
        this.arrays.color = [
            this.white, this.white, this.white, this.white, this.white, this.white, this.white, this.white]
    }
}
class Square_Outline2 extends Shape {
    constructor() {
        super("position", "color");
        this.indices = false;
        this.white = hex_color("#FFFFFF");
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [-1, 1, -1], [-1, -1, 1], [-1, 1, 1], [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1])
        this.arrays.color = [
            this.white, this.white, this.white, this.white, this.white, this.white, this.white, this.white]
    }
}
class Square_Outline3 extends Shape {
    constructor() {
        super("position", "color");
        this.indices = false;
        this.white = hex_color("#FFFFFF");
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [-1, 1, -1], [1, -1, -1], [1, 1, -1], [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1])
        this.arrays.color = [
            this.white, this.white, this.white, this.white, this.white, this.white, this.white, this.white]
    }

}

export class blockbussin extends Scene {
    constructor() {
        super();
        this.transformations = [['N', 'D', 'D', 'D'],
        ['N', 'D', 'R', 'D'],
        ['N', 'R', 'D', 'L'],
        ['N', 'R', 'R', 'T'],
        ['N', 'D', 'D', 'R']];
        this.colors = [
            hex_color("#ff10f0"),
            hex_color("#8810f0"),
            hex_color("#691428"),
            hex_color("#f69d28"),
            hex_color("#d64285")
        ]

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            sphere: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(1, 15),
            cube: new defs.Cube(),
            cubeoutline: new Cube_Outline(),
            squareoutline: new Square_Outline(),
            squareoutline2: new Square_Outline2(),
            squareoutline3: new Square_Outline3(),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                { ambient: .4, diffusivity: .6, color: hex_color("#ff10f0") }),
            plastic: new Material(new defs.Phong_Shader(),
                { ambient: .4, diffusivity: .6, color: hex_color("#ffffff"), }),
        }
        this.white = new Material(new defs.Basic_Shader());

        // set score to 0
        this.score = 0;

        // state stores information about the current block type and transformations
        this.current_block = null;
        this.current_rotations = Mat4.identity();
        this.current_translations = Mat4.translation(INIT_X, INIT_Y, INIT_Z);

        // sets camera location
        this.initial_camera_location = Mat4.look_at(vec3(50, 50, 50), vec3(0, 0, 0), vec3(0, 1, 0));

        //sets game blocks
        const range = new Array(10).fill(-1);
        this.game_blocks = range.map(e => range.map(e => range.map(e => e)));

        //temporary before drop block function just to visualize
        //this.game_blocks[0][0][0] = [1, hex_color("#ff10f0")];
        //this.game_blocks[0][1][0] = [1, hex_color("#ff10f0")];
        // this.game_blocks[0][1][0] = [1, hex_color("#ff10f0")];
        // this.game_blocks[2][1][0] = [1, hex_color("#ff10f0")];
        // this.game_blocks[2][0][0] = [1, hex_color("#ff10f0")];
        // this.game_blocks[1][1][0] = [1, hex_color("#ff10f0")];
        // this.game_blocks[1][2][0] = [1, hex_color("#ff10f0")];
        // this.game_blocks[1][3][0] = [1, hex_color("#ff10f0")];
        // this.game_blocks[1][4][0] = [1, hex_color("#ff10f0")];
    }

    make_control_panel() {
        // Buttons, can also probably make trigger for keyboard keys
        this.new_line();
        this.key_triggered_button("Rotate Around x-axis", ["a"], () => this.checkMove('a'));
        this.key_triggered_button("Rotate Around y-axis", ["s"], () => this.checkMove('s'));
        this.key_triggered_button("Rotate Around z-axis", ["d"], () => this.checkMove('d'));
        this.key_triggered_button("Translate right", ["l"], () => this.checkMove('l'));
        this.key_triggered_button("Translate left", ["j"], () => this.checkMove('j'));
        // forward = away
        this.key_triggered_button("Translate forward", ["i"], () => this.checkMove('i'));
        this.key_triggered_button("Translate backward", ["k"], () => this.checkMove('k'));
        this.key_triggered_button("Drop Block", [" "], () => this.dropBlock());
        this.key_triggered_button("Restart", ["g"], () => this.restart());
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            // don't uncomment camera controls until key overlap issue is fixed (TODO)
            // this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }
        this.displayUI();

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const light_position = vec4(0, 5, 5, 1);
        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        // only set new this.current_block if new block is needed
        if (this.current_block == null) {
            this.current_block = Math.floor(Math.random() * 5);
        }

        const cur_trans = this.transformations[this.current_block];
        let model_transform = this.combineRandT(this.current_rotations, this.current_translations);
        for (const element of cur_trans) {
            model_transform = this.getBlock(model_transform, element);
            this.shapes.cubeoutline.draw(context, program_state, model_transform, this.white, "LINES");
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({ color: this.colors[this.current_block] }));
        }

        this.drawgamefield(context, program_state);
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        this.drawgameblocks(context, program_state);
    }

    checkMove(move) {
        let model_translate = this.current_translations;
        let model_rotate = this.current_rotations;
        switch (move) {
            case 'a':
                model_rotate = Mat4.rotation(Math.PI / 2, 1, 0, 0).times(this.current_rotations)
                break;
            case 's':
                model_rotate = Mat4.rotation(Math.PI / 2, 0, 1, 0).times(this.current_rotations)
                break;
            case 'd':
                model_rotate = Mat4.rotation(Math.PI / 2, 0, 0, 1).times(this.current_rotations)
                break;
            case 'l':
                model_translate = Mat4.translation(0, 0, -2).times(this.current_translations);
                break;
            case 'j':
                model_translate = Mat4.translation(0, 0, 2).times(this.current_translations);
                break;
            case 'i':
                model_translate = Mat4.translation(-2, 0, 0).times(this.current_translations);
                break;
            case 'k':
                model_translate = Mat4.translation(2, 0, 0).times(this.current_translations);
                break;
            default:
                break;
        }

        const cur_trans = this.transformations[this.current_block];
        let model_transform = this.combineRandT(model_rotate, model_translate);

        // console.log(this.combineRandT(this.current_rotations, this.current_translations))

        // out of bounds
        for (const element of cur_trans) {
            model_transform = this.getBlock(model_transform, element);
            let m = Matrix.flatten_2D_to_1D(model_transform);
            // console.log(m);
            if (m[3] > 18 || m[11] < 0 || m[3] < 0 || m[11] > 18) {
                return false;
            }
        }

        // in bounds
        this.current_rotations = model_rotate;
        this.current_translations = model_translate;
        return true;
    }

    getBlockCoords(temp_matrix) {
        let model_transform = this.combineRandT(this.current_rotations, this.current_translations);
        let m = temp_matrix.times(vec4(0, 0, 0, 1))
        console.log(m);
        m = model_transform.times(m);
        let x = (m[0] | 0) / 2;
        let y = m[1] / 2;
        let z = m[2] / 2;
        return [x,y,z];
    }


    //TODO: figure out how to pass context and program state, along with checking if blocks are too far down then adding them to gameblocks matrix
    dropBlock() {
        const cur_trans = this.transformations[this.current_block];
        
        // let temp_transform2 = temp_transform1.times(Mat4.translation(2*i,2*j,2*k));
        // this.shapes.cube.draw(context, program_state, temp_transform1, this.materials.test);
        //console.log(temp_transform);
        /*let translatedown = -20;
        for (const element of cur_trans) {
            model_transform = this.getBlock(model_transform, element);
            let m = Matrix.flatten_2D_to_1D(model_transform);
            while (m[7] + translatedown < -10) {
                translatedown += 2;
            }
            //console.log(m[3], m[7], m[11]);
            //console.log(model_transform);
        }*/


        let y_drop = 20;
        let i = 0;
        let curr_coordinates = [];
        let temp_matrix = Mat4.identity();
        for (const element of cur_trans) {
            temp_matrix = this.getBlock(temp_matrix, element)
            curr_coordinates[i] = this.getBlockCoords(temp_matrix);
            let current_array = this.game_blocks[curr_coordinates[i][0]][curr_coordinates[i][2]];

            // TODO: doesn't account for gaps
            // we need to find last index of non neg number + 1
            let new_y = current_array.indexOf(-1);
            let y_transf = curr_coordinates[i][1] - new_y;
            if (y_drop > y_transf) { y_drop = y_transf; }
            i++;
        }


        for (const n of curr_coordinates) {
            //console.log(n[0], n[2], n[1]-y_drop);
            //console.log(this.game_blocks[n[0]][n[2]][n[1]-y_drop]);
            this.game_blocks[n[0]][n[2]][n[1] - y_drop] = this.current_block;
        }

        this.current_block = null;
        this.current_rotations = Mat4.identity();
        this.current_translations = Mat4.translation(INIT_X, INIT_Y, INIT_Z);
    }

    drawgameblocks(context, program_state) {
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                for (var k = 0; k < 10; k++) {
                    if (this.game_blocks[i][j][k] != -1) {
                        //console.log(this.game_blocks[i][j][k]);
                        let model_transform = Mat4.translation(2 * i, 2 * k, 2 * j);
                        this.shapes.cubeoutline.draw(context, program_state, model_transform, this.white, "LINES");
                        this.shapes.cube.draw(context, program_state, model_transform, this.materials.test.override({ color: this.colors[this.game_blocks[i][j][k]] }));
                    }
                }
            }
        }
    }

    combineRandT(rot_matrix, trans_matrix) {
        return trans_matrix.times(rot_matrix);
    }

    getBlock(model_transform, element) {
        let new_matrix = model_transform;
        switch (element) {
            case 'R':
                new_matrix = model_transform.times(Mat4.translation(2, 0, 0));
                break;
            case 'D':
                new_matrix = model_transform.times(Mat4.translation(0, -2, 0));
                break;
            case 'L':
                new_matrix = model_transform.times(Mat4.translation(-2, 0, 0));
                break;
            case 'U':
                new_matrix = model_transform.times(Mat4.translation(0, 2, 0));
                break;
            case 'T':
                new_matrix = model_transform.times(Mat4.translation(-2, -2, 0));
            default:
                break;
        }
        return new_matrix;
    }

    // TODO: this function was probably the most illegible code i read this year
    // i figured it out but next time at least add comments?
    drawgamefield(context, program_state) {
        // draw floor 
        let model_transform = Mat4.identity();
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                this.shapes.squareoutline.draw(context, program_state, model_transform, this.white, "LINES");
                model_transform = model_transform.times(Mat4.translation(0, 0, 2));
            }
            model_transform = model_transform.times(Mat4.translation(2, 0, -20));
        }

        // draw wall 1
        model_transform = Mat4.identity();
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                this.shapes.squareoutline2.draw(context, program_state, model_transform, this.white, "LINES");
                model_transform = model_transform.times(Mat4.translation(0, 2, 0));
            }
            model_transform = model_transform.times(Mat4.translation(0, -20, 2));
        }

        // draw wall 2
        model_transform = Mat4.identity();
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                this.shapes.squareoutline3.draw(context, program_state, model_transform, this.white, "LINES");
                model_transform = model_transform.times(Mat4.translation(0, 2, 0));
            }
            model_transform = model_transform.times(Mat4.translation(2, -20, 0));
        }
    }

    displayUI() {
        var score = document.getElementById("score");
        score.innerHTML = this.score;
    }

    restart() {
        var element = document.getElementById("startDisplay");
        if (element) { element.parentNode.removeChild(element) };

        // set score to 0
        this.score = 0;

        // state stores information about the current block type and transformations
        this.current_block = null;
        this.current_rotations = Mat4.identity();
        this.current_translations = Mat4.translation(INIT_X, INIT_Y, INIT_Z);

        // sets camera location
        this.initial_camera_location = Mat4.look_at(vec3(50, 50, 50), vec3(0, 0, 0), vec3(0, 1, 0));
        const range = new Array(10).fill(-1);
        this.game_blocks = range.map(e => range.map(e => range.map(e => e)));
    }

}

