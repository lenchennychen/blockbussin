import { defs, tiny } from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Cube
} = tiny;

const INIT_X = 6;
const INIT_Y = 10;
const INIT_Z = 4;


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
            test2: new Material(new Gouraud_Shader(),
                { ambient: .4, diffusivity: .6, color: hex_color("#992828") }),
            ring: new Material(new Ring_Shader()),
            plastic: new Material(new defs.Phong_Shader(),
                { ambient: .4, diffusivity: .6, color: hex_color("#ffffff"), }),
        }
        this.white = new Material(new defs.Basic_Shader());

        // state stores information about the current block type and transformations
        this.current_block = 1;
        this.current_rotations = Mat4.identity();
        this.current_translations = Mat4.translation(INIT_X, INIT_Y, INIT_Z);
        this.current_transform = Mat4.translation(INIT_X, INIT_Y, INIT_Z);

        // TODO: set correct camera location
        this.initial_camera_location = Mat4.look_at(vec3(-20, 40, 80), vec3(10, 0, 0), vec3(0, 1, 0));
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
        this.key_triggered_button("Drop Block", [" "], () => {
            this.current_block = null;
            this.current_rotations = Mat4.identity();
            this.current_translations = Mat4.translation(INIT_X, INIT_Y, INIT_Z);
            this.current_transform = Mat4.translation(INIT_X, INIT_Y, INIT_Z);
        });
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
        let model_transform = this.current_transform;
        for (const element of cur_trans) {
            model_transform = this.getBlock(model_transform, element);
            this.shapes.cubeoutline.draw(context, program_state, model_transform, this.white, "LINES");
            this.shapes.cube.draw(context, program_state, model_transform, this.materials.test);
        }

        this.drawgamefield(context, program_state);
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

    }


    checkMove(move) {
        let model_translate = this.current_translations;
        let model_rotate = this.current_rotations
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
                model_translate = Mat4.translation(2, 0, 0).times(this.current_translations);
                break;
            case 'j':
                model_translate = Mat4.translation(-2, 0, 0).times(this.current_translations);
                break;
            case 'i':
                model_translate = Mat4.translation(0, 0, -2).times(this.current_translations);
                break;
            case 'k':
                model_translate = Mat4.translation(0, 0, 2).times(this.current_translations);
                break;
            default:
                break;
        }

        const cur_trans = this.transformations[this.current_block];
        let model_transform = this.combineRandT(model_rotate, model_translate);

        // out of bounds
        for (const element of cur_trans) {
            model_transform = this.getBlock(model_transform, element);
            let m = Matrix.flatten_2D_to_1D(model_transform);
            console.log(m);
            if( m[3] > 14 || m[11] < -4 ||m[3] < -4 || m[11] > 14) {
                return false;
            }
        }

        // in bounds
        this.current_rotations = model_rotate;
        this.current_translations = model_translate;
        this.current_transform = this.combineRandT(model_rotate, model_translate);
        return true;
    }

    combineRandT(rot_matrix, trans_matrix) {
        return trans_matrix.times(Mat4.translation(-1, 1, 0))
            .times(rot_matrix)
            .times(Mat4.translation(1, -1, 0));
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

    drawgamefield(context, program_state) {
        let model_transform = Mat4.identity();

        model_transform = model_transform.times(Mat4.translation(-6, -10, -6));
        // this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic);
        for (let i = 0; i < 10; i++) {
            model_transform = model_transform.times(Mat4.translation(2, 0, 0));
            for (let j = 0; j < 10; j++) {
                model_transform = model_transform.times(Mat4.translation(0, 0, 2));
                this.shapes.squareoutline.draw(context, program_state, model_transform, this.white, "LINES");
            }
            model_transform = model_transform.times(Mat4.translation(0, 0, -20));
        }
        model_transform = model_transform.times(Mat4.translation(2, -2, 0));
        for (let i = 0; i < 10; i++) {
            model_transform = model_transform.times(Mat4.translation(0, 0, 2));
            for (let j = 0; j < 10; j++) {
                model_transform = model_transform.times(Mat4.translation(0, 2, 0));
                this.shapes.squareoutline2.draw(context, program_state, model_transform, this.white, "LINES");
            }
            model_transform = model_transform.times(Mat4.translation(0, -20, 0));
        }
        model_transform = model_transform.times(Mat4.translation(-20, 0, -20));
        for (let i = 0; i < 10; i++) {
            model_transform = model_transform.times(Mat4.translation(0, 0, 2));
            for (let j = 0; j < 10; j++) {
                model_transform = model_transform.times(Mat4.translation(0, 2, 0));
                // this.shapes.squareoutline2.draw(context, program_state, model_transform, this.white,"LINES");
            }
            model_transform = model_transform.times(Mat4.translation(0, -20, 0));
        }
        model_transform = model_transform.times(Mat4.translation(-2, 0, 2));
        for (let i = 0; i < 10; i++) {
            model_transform = model_transform.times(Mat4.translation(0, 2, 0));
            for (let j = 0; j < 10; j++) {
                model_transform = model_transform.times(Mat4.translation(2, 0, 0));
                // this.shapes.squareoutline3.draw(context, program_state, model_transform, this.white,"LINES");
            }
            model_transform = model_transform.times(Mat4.translation(-20, 0, 0));
        }
        model_transform = model_transform.times(Mat4.translation(0, -20, -20));
        for (let i = 0; i < 10; i++) {
            model_transform = model_transform.times(Mat4.translation(0, 2, 0));
            for (let j = 0; j < 10; j++) {
                model_transform = model_transform.times(Mat4.translation(2, 0, 0));
                this.shapes.squareoutline3.draw(context, program_state, model_transform, this.white, "LINES");
            }
            model_transform = model_transform.times(Mat4.translation(-20, 0, 0));
        }
    }
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                // Compute an initial (ambient) color:
                gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = { color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40 };
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
          
        }`;
    }
}

