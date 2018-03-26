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
        const d = (x1 - x2) * (this.y1 - this.y2) - (y1 - y2) * (this.x1 - this.x2);
        // If d is zero, there is no intersection
        if (d == 0) return false;
         
        // Get the x and y
        const pre = (x1 * y2 - y1 * x2);
        const post = (this.x1 * this.y2 - this.y1 * this.x2);
        const x = ( pre * (this.x1 - this.x2) - (x1 - x2) * post ) / d;
        const y = ( pre * (this.y1 - this.y2) - (y1 - y2) * post ) / d;
        // console.log(d, pre, post, x, y);
         
        // Check if the x and y coordinates are within both lines
        if ( x < (Math.min(x1, x2) - 0.5) || x > (Math.max(x1, x2) + 0.5) ||
            x < (Math.min(this.x1, this.x2) - 0.5) || x > (Math.max(this.x1, this.x2) + 0.5)
        ) {
            return false;
        }
        if ( y < (Math.min(y1, y2) - 0.5) || y > (Math.max(y1, y2) + 0.5) ||
            y < (Math.min(this.y1, this.y2) - 0.5) || y > (Math.max(this.y1, this.y2) + 0.5)
        ) {
            return false;
        }

        return [x, y];
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

        this.draw();
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

        this.graphics = new PIXI.Graphics();
        this.graphics.lineStyle(LINE_WIDTH, 0xFFFFFF, 1);
        this.graphics.moveTo(x1, y1);
        this.graphics.lineTo(x2, y2);

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

const slots = {
    'right_wall,left_ceil,right_ceil,left_half,right_half': [
        [0, -150],
        [400, -150], [800, -150], [1200, -150],
        [-200, -300], [200, -300], [600, -300], [1000, -300],
        [0, -450], [400, -450], [800, -450], [1200, -450],
        [-200, -600], [200, -600], [600, -600], [1000, -600],
        [0, -750], [400, -750], [800, -750], [1200, -750],
    ],
    // 'right_wall': [
    //     [0, -150],
    // ],
};
const blocks = {
    'left_wall': [
        'w0,1,0,100',
        'w0,1,0,150 w1,1,1,150 f0,150,1,150',
    ],
    'right_wall': [
        'w400,1,400,100',
        'w400,1,400,100',
        'w400,1,400,149',
    ],
    'left_ceil': [
        'f0,0,74,0 s74,0,126,0 f126,0,200,0',
        'f0,0,74,0 f126,0,200,0',
        'f0,0,200,0',
    ],
    'right_ceil': [
        'f200,0,274,0 s274,0,325,0 f325,0,400,0',
        'f200,0,274,0 f326,0,400,0',
        'f200,0,400,0',
    ],
    'half_block': [
        's0,75,200,75', // 1
        's25,120,125,50 s125,50,199,50', // 2
        's1,50,75,50 s75,50,175,120', // 3
        's0,75,73,75 w74,1,74,75 f125,75,199,75', // 4
        'w25,75,25,150 s26,75,74,75 w75,75,75,150 w126,1,126,100 s127,100,174,100 w175,1,175,100', // 5
        'f1,100,50,100 f75,50,125,50 f150,100,199,100', // 6
        'f1,50,50,50 f75,100,125,100 f150,50,199,50', // 7
        'f1,75,199,75', // 8
        's1,50,199,50 s1,100,199,100', // 9
        'w50,50,50,100 s51,50,99,50 w100,50,100,100 f100,50,100,50 s101,100,149,100 w150,50,150,100', // 10
        'w25,50,25,100 s26,50,74,50 w75,50,75,100 s76,100,124,100 w125,50,125,100 s126,50,174,50 w175,50,175,100', // 11
    ],
};
function generate_level () {
    Object.keys(slots).forEach(names => {
        const parts = names.split(',');
        slots[names].forEach(slot => {
            parts.forEach(part => {
                let name = part;
                if (part == 'left_half' || part == 'right_half') {
                    name = 'half_block';
                }
                let o_x = slot[0];
                let o_y = app.renderer.height + slot[1];
                if (part == 'right_half') {
                    o_x += 200;
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
                    }
                });
            });
        });
    });
}
