class Particle {
    constructor(id, type, x, y, r) {
        this.id = id;
        this.type = type;
        this.r = r;
        this.x = x;
        this.y = y;
        this.ox = x;
        this.oy = y;

        switch (type) {
            case 'bullet':
                this.speed = 1000;
                this.dx = Math.cos(this.r) * this.speed;
                this.dy = Math.sin(this.r) * this.speed;
                this.ttl = 2;
                this.breaks_by_walls = true;
            break;
            case 'spark':
                this.speed = 300;
                this.dx = Math.cos(this.r) * this.speed;
                this.dy = Math.sin(this.r) * this.speed;
                this.ttl = 1;
                this.gravity = 2000;
            break;
            case 'grenade':
                this.ttl = 3;
                this.speed = 800;
                this.dx = Math.cos(this.r) * this.speed;
                this.dy = Math.sin(this.r) * this.speed;
                this.gravity = 2000;
                this.breakes_when_expires = true;
                this.bounces = true;
            break;
            case 'frag':
                this.ttl = 0.2 + Math.random() * 0.1;
                this.speed = 600;
                this.dx = Math.cos(this.r) * this.speed;
                this.dy = Math.sin(this.r) * this.speed;
                this.gravity = 2000;
                this.spawns = ['fire', 'smoke'];
                this.spawn_time = {};
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
                this.ttl = 1;
                this.ex = this.x + Math.cos(this.r) * app.renderer.width * 2;
                this.ey = this.y + Math.sin(this.r) * app.renderer.width * 2;
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
                    let crossed = floor.crosses_line(this.x, this.y, this.ex, this.ey) ;
                    // console.log(crossed);
                    if (crossed) {
                        if (floor.type != FLOOR && crossed[1] < this.y) {
                            continue;
                        }
                        [this.ex, this.ey] = crossed;
                        hit = crossed;
                        hit_what = floor;
                    }
                }
                if (hit) {
                    this.reflected_at = [hit[0] - Math.cos(this.r) * 2, hit[1] - Math.sin(this.r) * 2];
                    this.reflected_from = hit_what;
                }
            break;
        }

        this.draw();
    }

    draw() {
        switch (this.type) {
            case 'bullet':
                this.graphics = new PIXI.Graphics();
                this.graphics.blendMode = PIXI.BLEND_MODES.ADD;
                this.graphics.lineStyle(2, 0xFFAA00, 1);
                this.graphics.moveTo(-8, 0);
                this.graphics.lineTo(8, 0);
                this.graphics.rotation = this.r;
            break;
            case 'spark':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.circle.texture);
                this.graphics.tint = 0xFFFF00;
                this.graphics.scale.set(0.03, 0.03);
                this.graphics.blendMode = PIXI.BLEND_MODES.ADD;
            break;
            case 'grenade':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.circle.texture);
                this.graphics.tint = 0x00AA00;
                this.graphics.scale.set(0.06, 0.06);
            break;
            case 'ray':
                this.graphics = new PIXI.Graphics();
                this.graphics.blendMode = PIXI.BLEND_MODES.ADD;
                this.graphics.lineStyle(3, 0xFF00FF, 1);
                this.graphics.moveTo(0, 0);
                this.graphics.lineTo(this.ex - this.x, this.ey - this.y);
            break;
            case 'frag':
            break;
            case 'fire':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.circle.texture);
                this.graphics.tint = 0xFFFFFF;
                this.graphics.blendMode = PIXI.BLEND_MODES.ADD;
                this.graphics.scale.set(0.12, 0.12);
                break;
            case 'smoke':
                this.graphics = new PIXI.Sprite(PIXI.loader.resources.circle.texture);
                this.graphics.tint = 0x999999;
                this.graphics.scale.set(0.4, 0.4);
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

        if (this.breaks_by_walls || this.bounces) {
            let hit;
            let hit_what;
            for (let wall of walls) {
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
            }
        }

        if (this.bounces) {
            if (this.x < 0) {
                this.bounce('left');
            }
            else if (this.x > app.renderer.width) {
                this.bounce('right');
            }
            else if (this.y < 0) {
                this.bounce('top');
            }
            else if (this.y > app.renderer.height) {
                this.bounce('bottom');
            }
        }

        if (this.type == 'ray' && this.reflected_from && this.ttl > 0.2) {
            add_particle(
                this.type, this.reflected_at[0], this.reflected_at[1], this.reflected_from.reflected_angle(this.r)
            ).ttl = this.ttl - 0.2;
            this.reflected_from = undefined;
            this.reflected_at = undefined;
        }
        if (this.spawns) {
            for (let spawn of this.spawns) {
                if (this.spawn_time[spawn] === undefined) {
                    this.spawn_time[spawn] = 0;
                }
                this.spawn_time[spawn] += dt;
                if (this.spawn_time[spawn] > 0.005) {
                    add_particle(spawn, this.x, this.y, 0);
                    this.spawn_time[spawn] = 0;
                }
            }
        }

        this.ox = this.x;
        this.oy = this.y;

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
        }

        if (this.graphics) {
            this.graphics.x = this.x;
            this.graphics.y = this.y;
            this.graphics.visible = true;
        }
        // console.log(this);
    }

    bounce(what) {
        const current_angle = Math.atan2(this.dy, this.dx);
        if (typeof(what) == 'object') {
            this.r = what.reflected_angle(current_angle);
        }
        else if (what == 'bottom' || what == 'top') {
            this.r = reflected_angle(Math.PI * 0.5, current_angle);
        }
        else if (what == 'right' || what == 'left') {
            this.r = reflected_angle(0, current_angle);
        }
        // console.log(current_angle *180/Math.PI, this.r *180/Math.PI, hit_what.normal *180/Math.PI);
        this.speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy) * 0.8;
        this.dx = Math.cos(this.r) * this.speed;
        this.dy = Math.sin(this.r) * this.speed;
        this.x = this.ox;
        this.y = this.oy;
    }

    break(source) {
        switch (this.type) {
            case 'bullet':
                const angle = source ? source.reflected_angle(this.r) : this.r;
                for (let i = 0; i < Math.random() * 3 + 3; i++) {
                    add_particle('spark', this.x, this.y, angle + Math.random() * 1 - 0.5);
                }
            break;
            case 'grenade':
                for (let i = 0; i < Math.random() * 9 + 15; i++) {
                    add_particle('frag', this.x, this.y, -Math.random() * Math.PI);
                }
            break;
        }
        this.destroy();
    }
    destroy() {
        remove_particle(this.id);
    }
}

let free_particle_ids = [];
function add_particle(type, x, y, r) {
    const new_id = free_particle_ids.length ? free_particle_ids.shift() : particles.length;
    particles[new_id] = new Particle(new_id, type, x, y, r);
    if (particles[new_id].graphics) {
        particle_container.addChild(particles[new_id].graphics);
    }
    // console.log("particle", new_id, particles[new_id]);
    return particles[new_id];
}
function remove_particle(id) {
    free_particle_ids.push(id);
    if (particles[id].graphics) {
        particle_container.removeChild(particles[id].graphics);
    }
    particles[id] = undefined;
}
