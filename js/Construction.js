const FLOOR = 1;
const STAIR = 2;

const LINE_WIDTH = 1;

class Construction {
    constructor(x1, y1, x2, y2) {
        this.x1 = parseInt(x1);
        this.y1 = parseInt(y1);
        this.x2 = parseInt(x2);
        this.y2 = parseInt(y2);

        this.angle = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
        this.normal = this.angle - Math.PI * 0.5;
    }
    crosses_line(x1, y1, x2, y2) {
        return lines_intersection(x1, y1, x2, y2, this.x1, this.y1, this.x2, this.y2)
    }
    reflected_angle(ray_angle) {
        return reflected_angle(this.normal, ray_angle);
    }
}

class Floor extends Construction {
    constructor(x1, y1, x2, y2) {
        super(x1, y1, x2, y2);

        this.k = (y2 - y1) / (x2 - x1);
        if (this.k > 0) {
            this.t_y = y1;
            this.b_y = y2;
        }
        else {
            this.t_y = y2;
            this.b_y = y1;
        }

        this.type = FLOOR;
    }

    draw() {
        this.graphics = new PIXI.Graphics();
        this.graphics.lineStyle(LINE_WIDTH, 0xFFFFFF, 1);
        this.graphics.moveTo(this.x1, this.y1);
        this.graphics.lineTo(this.x2, this.y2);

        app.stage.addChild(this.graphics);
    }

    y_at(x) {
        const dx = (x - this.x1);
        return this.y1 + dx * this.k;
    }
    standing_y(char) {
        if (char.r_x < this.x1 || char.l_x > this.x2) {
            return false;
        }
        return this.y_at(char.x);
    }
    intersects(char) {
        if (char.r_x < this.x1 || char.l_x > this.x2 || char.b_y < this.t_y || char.t_y > this.b_y) {
            return [false, false];
        }
        const dx = char.x - this.x1;
        const cy = this.y1 + dx * this.k;

        if (char.t_y < cy && char.b_y > cy) {
            return this._intersect_data(cy, char);
        }
        return [false, false];
    }
    _intersect_data(cy, char) {
        let edge = false;
        if (char.l_x < this.x1 && char.r_x > this.x1) {
            edge = 'left';
        }
        else if (char.l_x < this.x2 && char.r_x > this.x2) {
            edge = 'right';
        }
        return [cy, edge];
    }

    connected_with(that) {
        return (this.x1 == that.x2 && this.y1 == that.y2) || (this.x2 == that.x1 && this.y2 == that.y1);
    }
}

class Stair extends Floor {
    constructor(x1, y1, x2, y2) {
        super(x1, y1, x2, y2);
        this.type = STAIR;
    }

    draw() {
        this.graphics = new PIXI.Graphics();
        this.graphics.lineStyle(LINE_WIDTH, 0xAAAAAA, 1);
        this.graphics.moveTo(this.x1, this.y1);
        this.graphics.lineTo(this.x2, this.y2);

        app.stage.addChild(this.graphics);
    }

    _intersect_data(cy) {
        return [cy, false];
    }
}

class Wall extends Construction {
    constructor(x1, y1, x2, y2) {
        super(x1, y1, x2, y2);

        this.k = (this.x2 - this.x1) / (this.y2 - this.y1);

        if (this.k > 0) {
            this.l_x = this.x1;
            this.r_x = this.x2;
        }
        else {
            this.l_x = this.x2;
            this.r_x = this.x1;
        }
    }
    draw() {
        this.graphics = new PIXI.Graphics();
        this.graphics.lineStyle(LINE_WIDTH, 0xFFFFFF, 1);
        this.graphics.moveTo(this.x1, this.y1);
        this.graphics.lineTo(this.x2, this.y2);

        app.stage.addChild(this.graphics);
    }

    y_at(x) {
        return this.y1
    }
    standing_y(char) {
        if (char.l_x > this.x1 || char.r_x < this.x1) {
            return false;
        }
        return this.y1;
    }
    intersects(char) {
        if (char.r_x < this.l_x || char.l_x > this.r_x || char.b_y < this.y1 || char.t_y > this.y2) {
            return [false, false];
        }
        const dy = char.y - this.y1;
        const cx = this.x1 + dy * this.k;

        if (char.l_x < cx && char.r_x > cx) {
            let edge = false;
            if (char.t_y < this.y1 && char.b_y > this.y1) {
                edge = 'top';
            }
            else if (char.t_y < this.y2 && char.b_y > this.y2) {
                edge = 'bottom';
            }
            return [cx, edge];
        }
        return [false, false];
    }
}

function reflected_angle(normal, ray_angle) {
    const incidence = ray_angle + Math.PI - normal;
    return normal - incidence;
}
function lines_intersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    // If d is zero, there is no intersection
    if (d == 0) return false;
     
    // Get the x and y
    const pre = (x1 * y2 - y1 * x2);
    const post = (x3 * y4 - y3 * x4);
    const x = ( pre * (x3 - x4) - (x1 - x2) * post ) / d;
    const y = ( pre * (y3 - y4) - (y1 - y2) * post ) / d;
    // console.log(d, pre, post, x, y);
     
    // Check if the x and y coordinates are within both lines
    if ( x < (Math.min(x1, x2) - 1) || x > (Math.max(x1, x2) + 1) ||
        x < (Math.min(x3, x4) - 1) || x > (Math.max(x4, x4) + 1)
    ) {
        return false;
    }
    if ( y < (Math.min(y1, y2) - 1) || y > (Math.max(y1, y2) + 1) ||
        y < (Math.min(y3, y4) - 1) || y > (Math.max(y3, y4) + 1)
    ) {
        return false;
    }

    return [x, y];
}
function distance_between(x1, y1, x2, y2) {
    return Math.sqrt( (y1 - y2) * (y1 - y2) + (x1 - x2) * (x1 - x2) );
}

let graph_nodes;
const floors = [];
const walls  = [];

const parts_map = {
    // 'normal': ['right_wall','left_ceil','right_ceil','left_half','right_half'],
    'left':   ['ceil', 'block'],
    'right':  ['wall', 'ceil', 'block'],
    'start':  ['wall', 'ceil', 'start'],
    'end':    ['end'],
};
const slots = [
    [0, 600, 'start'], [200, 600, 'left' ], [400, 600, 'right'], [600, 600, 'left' ], [800, 600, 'right'], [1000, 600, 'left' ], [1200, 600, 'right'], [1400, 600, 'left' ],
    [0, 450, 'left' ], [200, 450, 'right'], [400, 450, 'left' ], [600, 450, 'right'], [800, 450, 'left' ], [1000, 450, 'right'], [1200, 450, 'left' ], [1400, 450, 'right'],
    [0, 300, 'right'], [200, 300, 'left' ], [400, 300, 'right'], [600, 300, 'left' ], [800, 300, 'right'], [1000, 300, 'left' ], [1200, 300, 'right'], [1400, 300, 'left' ],
    [0, 150, 'left' ], [200, 150, 'right'], [400, 150, 'left' ], [600, 150, 'right'], [800, 150, 'left' ], [1000, 150, 'right'], [1200, 150, 'left' ], [1400, 150, 'right'],
    [0, 0,   'right'], [200, 0,   'left' ], [400, 0,   'right'], [600, 0,   'left' ], [800, 0,   'right'], [1000, 0,   'left' ], [1200, 0,   'right'], [1400, 0,   'end'  ],
];
const blocks = {
    'wall': [
        // 'w200,1,200,100 cr',
        'w200,1,200,100 cr',
        'w200,1,200,150',
    ],
    'ceil': [
        'f0,0,74,0 s74,0,126,0 f126,0,200,0 cu',
        'f0,0,74,0 f126,0,200,0 cu',
        'f0,0,200,0',
    ],
    'block': [
        's1,75,199,75 t25,25', // 1
        's25,120,125,50 s125,50,199,50 t175,125', // 2
        's1,50,75,50 s75,50,175,120 t25,125', // 3
        's0,75,73,75 w74,1,74,75 f125,75,199,75 t75,125', // 4
        'w25,75,25,150 s26,75,73,75 w75,75,75,150 w126,1,126,100 s127,100,174,100 w175,1,175,100 t50,25', // 5
        'f1,100,50,100 f75,50,125,50 f150,100,199,100 t125,75', // 6
        'f25,50,75,50 f75,100,125,100 f125,50,175,50 t75,25', // 7
        'f26,75,174,75 t75,125', // 8
        's1,50,199,50 s1,100,199,100 t100,75', // 9
        'w50,50,50,100 s51,50,99,50 w100,50,100,100 f100,50,100,50 s101,100,149,100 w150,50,150,100 t75,125', // 10
        'w25,50,25,100 s26,50,74,50 w75,50,75,100 s76,100,124,100 w125,50,125,100 s126,50,174,50 w175,50,175,100 t150,125', // 11
        's1,51,50,100 s1,149,50,100 f50,100,100,100 s100,100,150,50 s101,1,150,50 f150,50,199,50 t175,75', // 12
        'f1,50,50,50 s50,50,99,1 s50,50,100,100 s51,149,100,100 f100,100,150,100 s150,100,199,51 t75,100', // 13
        's1,99,50,50 f50,50,150,50 w125,1,125,49 t125,75', // 14
        's0,50,50,75 f50,75,150,75 w75,1,75,74 s150,75,200,50 t100,50', // 15
        's1,100,49,100 w50,50,50,149 s51,75,100,75 s100,125,149,125 w150,50,150,149 s151,100,199,100 t100,75', // 16
        's1,100,199,100 w75,50,75,99 w125,50,125,99 t100,125', // 17
        'f25,25,50,25 f100,25,125,25 f150,50,175,50 f50,75,75,75 f25,125,50,125 f126,125,150,125 t100,50', // 18
        'f150,25,175,25 f25,50,50,50 f75,75,100,75 f175,75,199,75 f125,100,150,100 f25,125,50,125 t125,75', // 19
        'f26,25,49,25 f26,50,49,50 w25,26,25,49 w50,26,50,49 f76,75,99,75 f76,100,99,100 w75,76,75,99 w100,76,100,99 f151,75,174,75 f151,100,174,100 w150,76,150,99 w175,75,175,99 f26,125,49,125 w25,126,25,149 w50,126,50,149 t175,50', // 20
        'f2,25,24,25 f2,50,24,50 w1,25,1,50 w25,25,25,50 f76,25,99,25 f76,50,99,50 w75,25,75,50 w100,25,100,50 f151,25,174,25 f151,50,174,50 w150,25,150,50,50 w175,25,175,50 f76,100,99,100 s25,50,75,100 s100,100,150,50 t125,75', // 21
        'f25,50,75,50 f125,50,175,50 f25,100,75,100 f125,100,175,100 t25,75', // 22*
        // '', // 23
    ],
    'start': ['w75,50,75,100 w125,50,125,100 f76,50,124,50 s50,100,150,100'],
    'end': ['w75,50,75,100 w125,50,125,100 f76,50,124,50 s76,100,124,100'],
};

function generate_level () {
    walls.length = 0;
    floors.length = 0;
    enemies.length = 0;
    graph_nodes = new Graph();

    slots.forEach(slot => {
        const parts = parts_map[ slot[2] ];
        parts.forEach(part => {
            let name = part;
            if (part == 'left_half' || part == 'right_half') {
                name = 'block';
            }
            let o_x = slot[0];
            let o_y = slot[1];
            if (part == 'right_half') {
                o_x += 200;
            }

            const node = o_x + ';' + o_y;
            if (!graph_nodes.vertices[node]) {
                graph_nodes.vertices[node] = {};
            }
            if (slot[2] == 'right') {
                const left_node = (o_x - 200) + ';' + o_y;
                if (!graph_nodes.vertices[left_node]) {
                    graph_nodes.vertices[left_node] = {};
                }
                graph_nodes.vertices[node][left_node] = 1;
                graph_nodes.vertices[left_node][node] = 1;
            }

            const block_idx = Math.random() * blocks[name].length;
            const block = blocks[name][Math.floor(block_idx)];
            const elements = typeof(block) == 'array' ? block : block.split(' ');

            // console.log(slot, block_idx, elements);
            elements.forEach(element => {
                const t = element.substr(0, 1);
                const [x1, y1, x2, y2] = element.substr(1).split(',').map(n => {return parseInt(n)});
                // console.log(t, slot[0], x1, slot[0] + x1);
                switch (t) {
                    case 'w':
                        walls.push( new Wall(o_x + x1, o_y + y1, o_x + x2, o_y + y2) );
                    break;
                    case 'f':
                        floors.push( new Floor(o_x + x1, o_y + y1, o_x + x2, o_y + y2) );
                    break;
                    case 's':
                        floors.push( new Stair(o_x + x1, o_y + y1, o_x + x2, o_y + y2) );
                    break;
                    case 't':
                        enemies.push( new Enemy('turret', o_x + x1, o_y + y1) );
                    break;
                    case 'c':
                        const direction = element.substr(1);
                        let neighbour_node;
                        switch (direction) {
                            case 'u':
                                neighbour_node = (o_x) + ';' + (o_y - 150);
                            break;
                            case 'r':
                                neighbour_node = (o_x + 200) + ';' + o_y;
                            break;
                        }
                        if (!graph_nodes.vertices[neighbour_node]) {
                            graph_nodes.vertices[neighbour_node] = {};
                        }
                        graph_nodes.vertices[node][neighbour_node] = 1;
                        graph_nodes.vertices[neighbour_node][node] = 1;
                    break;
                }
            });
        });
    });

    console.log(graph_nodes);
}

function draw_level() {
    for (let floor of floors) {
        floor.draw();
    }
    for (let wall of walls) {
        wall.draw();
    }
    for (let enemy of enemies) {
        enemy.draw();
    }
}
