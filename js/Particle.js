class Particle {
    constructor(id, type, x, y, direction) {
        this.id = id;
        this.type = type;
        this.direction = direction;
        this.x = x;
        this.y = y;
        this.ox = x;
        this.oy = y;

        switch (type) {
            case 'bullet':
                this.speed = 1000;
                this.dx = Math.cos(this.direction) * this.speed;
                this.dy = Math.sin(this.direction) * this.speed;
                this.ttl = 2;
                this.breaks_by_walls = true;
                this.is_projectile = true;
                this.one_hit = true;
                this.r = this.direction;
            break;
            case 'spark':
                this.speed = 300;
                this.dx = Math.cos(this.direction) * this.speed;
                this.dy = Math.sin(this.direction) * this.speed;
                this.ttl = 1;
                this.gravity = 2000;
            break;
            case 'grenade':
                this.ttl = 3;
                this.speed = 800;
                this.dx = Math.cos(this.direction) * this.speed;
                this.dy = Math.sin(this.direction) * this.speed;
                this.gravity = 2000;
                this.breakes_when_expires = true;
                this.bounces = true;
                this.is_projectile = true;
            break;
            case 'frag':
                this.ttl = 0.08 + Math.random() * 0.02;
                this.speed = 600;
                this.dx = Math.cos(this.direction) * this.speed;
                this.dy = Math.sin(this.direction) * this.speed;
                this.gravity = 2000;
                this.spawn_interval = {'fire': 0.003, 'smoke': 0.003};
                this.spawn_time = {};
                this.bounces = true;
            break;
            case 'fire':
                this.ttl = 1 - Math.random() * 0.2;
                this.dy = -50 - (Math.random() - 0.5) * 50;
                this.dx = (Math.random() - 0.5) * 50;
            break;
            case 'smoke':
                this.ttl = 1 - Math.random() * 0.2;
                this.dy = -50 - (Math.random() - 0.5) * 50;
                this.dx = (Math.random() - 0.5) * 50;
            break;
            case 'ray':
                this.ttl = 2;
                this.ex = this.x + Math.cos(this.direction) * app.renderer.width * 2;
                this.ey = this.y + Math.sin(this.direction) * app.renderer.width * 2;
                this.r = this.direction;
                this.is_projectile = true;
                let hit_what;
                let hit;
                for (let wall of walls) {
                    let crossed = wall.crosses_line(this.x, this.y, this.ex, this.ey);
                    if (crossed) {
                        [this.ex, this.ey] = crossed;
                        hit = crossed;
                        hit_what = wall;
                    }
                }
                for (let floor of floors) {
                    if (floor.type != FLOOR) {
                        continue;
                    }
                    let crossed = floor.crosses_line(this.x, this.y, this.ex, this.ey) ;
                    // console.log(crossed);
                    if (crossed) {
                        [this.ex, this.ey] = crossed;
                        hit = crossed;
                        hit_what = floor;
                    }
                }
                if (hit) {
                    this.reflected_at = [hit[0] - Math.cos(this.direction) * 2, hit[1] - Math.sin(this.direction) * 2];
                    this.reflected_from = hit_what;
                }

                this.length = Math.sqrt( Math.pow( (this.ex - this.x), 2) + Math.pow( (this.ey - this.y), 2) );
            break;
            case 'dead_bunny':
                this.speed = 400;
                this.dx = Math.cos(this.direction) * this.speed;
                this.dy = Math.sin(this.direction) * this.speed;
                this.gravity = 2000;
                this.bounces = true;
                if (this.direction < Math.PI * 0.5 && this.direction > -Math.PI * 0.5) {
                    this.dr = 10;
                }
                else {
                    this.dr = -10;
                }
                this.r = 0;
            break;
            case 'dead_turret':
                this.speed = 400;
                this.dx = Math.cos(this.direction) * this.speed;
                this.dy = Math.sin(this.direction) * this.speed;
                this.gravity = 2000;
                this.bounces = true;
                if (this.direction < Math.PI * 0.5 && this.direction > -Math.PI * 0.5) {
                    this.dr = 10;
                }
                else {
                    this.dr = -10;
                }
                this.r = 0;
                this.ttl = 3;
            break;
            case 'dead_turret_gun':
                this.direction += Math.random() - 0.5;
                this.speed = 600;
                this.dx = Math.cos(this.direction) * this.speed;
                this.dy = Math.sin(this.direction) * this.speed;
                this.gravity = 2000;
                this.bounces = true;
                this.spawn_interval = {'fire': 0.003, 'smoke': 0.003};
                this.spawn_time = {};
                if (this.direction < Math.PI * 0.5 && this.direction > -Math.PI * 0.5) {
                    this.dr = 10;
                }
                else {
                    this.dr = -10;
                }
                this.r = 0;
                this.ttl = 3;
            break;
        }

        this.draw();
    }

    draw() {
        switch (this.type) {
            case 'bullet':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.gradient.texture);
                this.graphics.anchor.set(0.5, 0.5);
                this.graphics.blendMode = PIXI.BLEND_MODES.ADD;
                this.graphics.tint = 0xFFAA00;
            break;
            case 'spark':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.circle.texture);
                this.graphics.anchor.set(0.5, 0.5);
                this.graphics.tint = 0xFFFF00;
                this.graphics.scale.set(0.03, 0.03);
                this.graphics.blendMode = PIXI.BLEND_MODES.ADD;
            break;
            case 'grenade':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.circle.texture);
                this.graphics.anchor.set(0.5, 0.5);
                this.graphics.tint = 0x00AA00;
                this.graphics.scale.set(0.06, 0.06);
            break;
            case 'ray':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.ray.texture);
                this.graphics.blendMode = PIXI.BLEND_MODES.ADD;
                this.graphics.tint = 0xFF00FF;
                this.graphics.anchor.set(0, 0.5);
                this.graphics.width = this.length;
            break;
            case 'fire':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.circle.texture);
                this.graphics.blendMode = PIXI.BLEND_MODES.ADD;
                this.graphics.anchor.set(0.5, 0.5);
                this.graphics.tint = 0xFFFFFF;
                this.graphics.scale.set(0.12, 0.12);
                break;
            case 'smoke':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.circle.texture);
                this.graphics.anchor.set(0.5, 0.5);
                this.graphics.tint = 0x999999;
                this.graphics.scale.set(0.4, 0.4);
                break;
            case 'frag':
            break;
            // case 'explosion':
            //     this.graphics = new PIXI.Sprite(PIXI.loader.resources.circle.texture);
            //     this.graphics.anchor.set(0.5, 0.5);
            //     this.graphics.tint = 0xFFFF00;
            //     this.graphics.blendMode = PIXI.BLEND_MODES.ADD;
            //     this.graphics.scale.set(1, 1);
            break;
            case 'dead_bunny':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.dead_bunny.texture);
                this.graphics.anchor.set(0.5, 0.5);
            break;
            case 'dead_turret':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.turret.texture);
                this.graphics.anchor.set(0.5, 0.5);
            break;
            case 'dead_turret_gun':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.turret_gun.texture);
                this.graphics.anchor.set(0.2, 0.5);
            break;
            default:
                this.graphics = new PIXI.Text('?', new PIXI.TextStyle({fill: '#ffffff'}));
            break;
        }

        if (this.graphics) {
            this.graphics.visible = false;
        }
    }

    update(dt) {
        if (this.gravity) {
            this.dy += this.gravity * dt;
        }
        if (this.dx !== undefined) {
            this.x += this.dx * dt;
        }
        if (this.dy !== undefined) {
            this.y += this.dy * dt;
        }
        if (this.dr !== undefined) {
            this.r += this.dr * dt;
            if (this.r > Math.PI) {
                this.r -= 2 * Math.PI;
            }
            else if (this.r < -Math.PI) {
                this.r += 2 * Math.PI;
            }
        }

        if (this.ttl !== undefined) {
            this.ttl -= dt;
            if (this.ttl < 0) {
                if (this.breakes_when_expires) {
                    this.break();
                }
                else {
                    this.destroy();
                }
                return;
            }
        }

        if (this.breaks_by_walls || this.bounces || this.splats) {
            let hit;
            let hit_what;
            for (let wall of walls) {
                if (this.splats) {
                    break;
                }
                let crossed = wall.crosses_line(this.ox, this.oy, this.x, this.y) 
                if (crossed) {
                    // console.log(wall, crossed);
                    hit = crossed;
                    hit_what = wall;
                    break;
                }
            }
            if (!hit) {
                for (let floor of floors) {
                    if (this.splats && this.dy <= 0) {
                        break;
                    }
                    if (floor.type != FLOOR) {
                        if (this.breaks_by_walls) {
                            continue;
                        }
                        else {
                            if ( this.dy <= 0 ) {
                                continue;
                            }
                        }
                    }
                    let crossed = floor.crosses_line(this.ox, this.oy, this.x, this.y) 
                    if (crossed) {
                        hit = crossed;
                        hit_what = floor;
                        break;
                    }
                }
            }
            if (hit) {
                // console.log(hit, hit_what, this.oy, this.y);
                if (this.breaks_by_walls) {
                    this.break(hit_what);
                }
                else if (this.bounces) {
                    this.bounce(hit_what);
                }
                else if (this.splats) {
                    this.splat();
                }
            }
        }

        if (this.x < 0 && this.bounces) {
            this.bounce('left');
        }
        else if (this.x > app.renderer.width && this.bounces) {
            this.bounce('right');
        }
        else if (this.y < 0 && this.bounces) {
            this.bounce('top');
        }
        else if (this.y > app.renderer.height) {
            if (this.bounces) {
                this.bounce('bottom');
            }
            else if (this.splats) {
                this.splat();
            }
        }

        if (this.type == 'ray' && this.reflected_from && this.ttl > 1) {
            add_particle(
                this.type, this.reflected_at[0], this.reflected_at[1], this.reflected_from.reflected_angle(this.direction)
            ).ttl = this.ttl - 0.4;
            this.reflected_from = undefined;
            this.reflected_at = undefined;
        }
        if (this.spawn_interval) {
            for ( let spawn of Object.keys(this.spawn_interval) ) {
                if (this.spawn_time[spawn] === undefined) {
                    this.spawn_time[spawn] = 0;
                }
                this.spawn_time[spawn] += dt;
                let x = this.x;
                let y = this.y;
                const step_x = (this.x - this.ox) * this.spawn_interval[spawn] / this.spawn_time[spawn];
                const step_y = (this.y - this.oy) * this.spawn_interval[spawn] / this.spawn_time[spawn];
                while (this.spawn_time[spawn] > this.spawn_interval[spawn]) {
                    add_particle(spawn, x, y, 0);
                    this.spawn_time[spawn] -= this.spawn_interval[spawn];
                    x -= step_x;
                    y -= step_y;
                }
            }
        }

        switch (this.type) {
            case 'spark':
            case 'ray': {
                this.graphics.alpha = this.ttl;
            } break;
            case 'smoke': {
                this.graphics.alpha = this.ttl;
                const scale = 0.4 * (1 - this.ttl);
                this.graphics.scale.set(scale, scale);
            } break;
            case 'fire': {
                const scale = 0.05 + 0.12 * (1 - this.ttl);
                this.graphics.scale.set(scale, scale);
                let green;
                let red;
                if (this.ttl > 0.5) {
                    red = 1;
                    green = 2 * (this.ttl - 0.5);
                }
                else {
                    green = 0;
                    red = 2 * this.ttl;
                }
                this.graphics.tint = ( (0xFF * red) << 16 ) + ( (0xFF * green) << 8 );
            } break;
            case 'dead_turret':
            case 'dead_turret_gun':
                if (this.ttl < 1) {
                    this.graphics.alpha = this.ttl;
                }
            break;
        }

        if (this.is_projectile) {
            if (this.owner instanceof Enemy) {
                if ( !bunny.dead && this.hits(bunny) ) {
                    this.strike_target(bunny, this.direction);
                }
            }
            else {
                for (let enemy of enemies) {
                    if (enemy.dead) {
                        continue;
                    }
                    if ( this.hits(enemy) ) {
                        if (this.type == 'grenade') {
                            this.break();
                            return;
                        }
                        else {
                            this.strike_target(enemy, this.direction);
                        }
                        if (this.one_hit) {
                            this.destroy();
                            return;
                        }
                    }
                }
            }
        }
        if (this.type == 'explosion') {
            for (let char of enemies.concat([bunny])) {
                if (char.dead) {
                    continue;
                }
                if ( distance_between(this.x, this.y, char.x, char.y) < 50 && char.sees(this) ) {
                    this.strike_target( char, Math.atan2(char.y - this.y, char.x - this.x) );
                }
            }
            this.destroy();
            return;
        }

        this.ox = this.x;
        this.oy = this.y;

        if (this.graphics) {
            this.graphics.x = this.x;
            this.graphics.y = this.y;
            if (this.r !== undefined) {
                this.graphics.rotation = this.r;
            }

            this.graphics.visible = true;
        }
        // console.log(this);
    }

    bounce(what) {
        const current_angle = Math.atan2(this.dy, this.dx);
        if (typeof(what) == 'object') {
            this.direction = what.reflected_angle(current_angle);
        }
        else if (what == 'bottom' || what == 'top') {
            this.direction = reflected_angle(Math.PI * 0.5, current_angle);
        }
        else if (what == 'right' || what == 'left') {
            this.direction = reflected_angle(0, current_angle);
        }
        // console.log(current_angle *180/Math.PI, this.direction *180/Math.PI, hit_what.normal *180/Math.PI);
        this.speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy) * 0.8;
        this.dx = Math.cos(this.direction) * this.speed;
        this.dy = Math.sin(this.direction) * this.speed;
        if (this.dr !== undefined) {
            this.dr *= 0.8;

            if (Math.abs(this.dr) < 1) {
                this.dr = 0;
            }
            if ( (this.dx < 0 && this.dr > 0) || (this.dx > 0 && this.dr < 0) ) {
                this.dr *= -1;
            }
        }
        this.x = this.ox;
        this.y = this.oy;
    }
    splat() {
        console.log("splat");
        this.splats = false;
        if (this.dx > 0) {
            this.r = Math.PI * 0.5;
        }
        else {
            this.r = -Math.PI * 0.5;
        }
        this.dr = 0;
        this.dx = 0;
        this.dy = 0;
        this.gravity = 0;
    }
    hits(target) {
        let x1, x2, y1, y2;
        x1 = this.x;
        y1 = this.y;
        if (this.type == 'ray') {
            x2 = this.ex;
            y2 = this.ey;
        }
        else {
            x2 = this.ox;
            y2 = this.oy;
        }
        // console.log(x1, y1, x2, y2, target.l_x, target.t_y, target.r_x, target.b_y);
        if (
            lines_intersection(x1, y1, x2, y2, target.l_x, target.t_y, target.l_x, target.b_y) ||
            lines_intersection(x1, y1, x2, y2, target.r_x, target.t_y, target.r_x, target.b_y) ||
            lines_intersection(x1, y1, x2, y2, target.l_x, target.t_y, target.r_x, target.t_y) ||
            lines_intersection(x1, y1, x2, y2, target.l_x, target.b_y, target.r_x, target.b_y)
        ) {
            return true;
        }
    }
    strike_target(target, angle) {
        target.kill(angle);
    }
    break(source) {
        switch (this.type) {
            case 'bullet':
                const angle = source ? source.reflected_angle(this.direction) : this.direction;
                for (let i = 0; i < Math.random() * 3 + 3; i++) {
                    add_particle('spark', this.x, this.y, angle + Math.random() * 1 - 0.5);
                }
            break;
            case 'grenade':
                const frag_num = 35;
                for (let i = 0; i < frag_num; i++) {
                    add_particle('frag', this.x, this.y - 1, 2 * Math.PI * i / frag_num + Math.random() * 0.1);
                }
                add_particle('explosion', this.x, this.y - 1);
            break;
        }
        this.destroy();
    }
    destroy() {
        remove_particle(this.id);
    }
}

const containers = {};
const container_blend_modes = {'fire': PIXI.BLEND_MODES.ADD};
function init_particle_containers() {
    for (let contained_type of []) {
        containers[contained_type] = new PIXI.particles.ParticleContainer(10000, {
            // scale: true,
            // position: true,
            // rotation: true,
            // alpha: true,
            // uvs: true,
            scale: true,
            position: true,
            rotation: true,
            uvs: true,
            alpha: true,
            tint: true,
        })
        if (container_blend_modes[contained_type] !== undefined) {
            containers[contained_type].blendMode = container_blend_modes[contained_type];
        }
        app.stage.addChild( containers[contained_type] );
    }
}
let free_particle_ids = [];
function add_particle(type, x, y, r) {
    const new_id = free_particle_ids.length ? free_particle_ids.shift() : particles.length;
    particles[new_id] = new Particle(new_id, type, x, y, r);
    let container = app.stage;
    if (containers[type]) {
        container = containers[type];
    }
    if (particles[new_id].graphics) {
        container.addChild(particles[new_id].graphics);
    }
    // console.log(type, new_id, particles[new_id]);
    return particles[new_id];
}
function remove_particle(id) {
    free_particle_ids.push(id);
    if (particles[id].graphics) {
        let container = app.stage;
        if (containers[particles[id].type]) {
            container = containers[particles[id].type];
        }
        container.removeChild(particles[id].graphics);
    }
    particles[id] = undefined;
}
