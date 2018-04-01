class Character {
    constructor() {
        const self = this;

        this.x = 100;
        this.y = app.renderer.height - 75;
        this.dx = 0;
        this.dy = 0;
        this.ox = 0;

        this.dead = false;

        this.init();
    }

    init() {
        this.hw = 11;
        this.hh = 18;

        this.weapons = {
            1: new Weapon('pistol'),
            2: new Weapon('grenade launcher'),
            3: new Weapon('raygun'),
        };

        Object.values(this.weapons).forEach(w => {w.owner = self});
        this.selected_weapon = 1;
        this.target_x = this.x;
        this.target_y = this.y;
    }
    draw() {
        this.sprite = new PIXI.Sprite(PIXI.loader.resources.bunny.texture);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        app.stage.addChild(this.sprite);
    }

    set x(_x) {
        this._x = _x;
        this.l_x = this._x - this.hw;
        this.r_x = this._x + this.hw;
    }
    get x() {
        return this._x;
    }
    set y(_y) {
        this._y = _y;
        this.t_y = this._y - this.hh;
        this.b_y = this._y + this.hh;
    }
    get y() {
        return this._y;
    }

    set o_x(_x) {
        this._o_x = _x;
        this.o_lx = _x - this.hw;
        this.o_rx = _x + this.hw;
    }
    get o_x() {
        return this._o_x;
    }
    set o_y(_y) {
        this._o_y = _y;
        this.o_ty = _y - this.hh;
        this.o_by = _y + this.hh;
    }
    get o_y() {
        return this._o_y;
    }

    update(dt) {
        if (this.runs_left) {
            this.dx = -100;
        }
        else if (this.runs_right) {
            this.dx = 100;
        }
        else {
            this.dx = 0;
        }

        this.x += this.dx * dt;
        this.y += this.dy * dt;

        if (this.stands_on) {
            if (this.jumps) {
                this.dy = -600;
                this.stands_on = false;
                this.jumps  = false;
            }
            else if (this.stands_on.type == STAIR && this.drops) {
                this.dropped_from = this.stands_on;
                // console.log('dropped from', this.dropped_from);
                this.stands_on = false;
                this.drops  = false;
            }
            else {
                this.dy = 0;
                if (typeof(this.stands_on) == 'object') {
                    const standing_y = this.stands_on.standing_y(this);
                    if (standing_y !== false) {
                        this.y = standing_y - this.hh - 1;
                    }
                    else {
                        this.stands_on = false;
                    }
                }
            }
        }
        else {
            this.dy += 2000 * dt;
            // TODO: ограничить максимальную скорость
            // if (this.dy > this.
        }

        let limits_x = [];
        let limits_y = [];

        walls.forEach(wall => {
            const [intersection_x, edge] = wall.intersects(this);
            if (intersection_x !== false) {
                limits_x.push([intersection_x, wall]);
            }
            if (!this.stands_on) {
                if (edge == 'top') {
                    if ( this.dy > 0 ) {
                        limits_y.push([wall.y1, wall]);
                    }
                }
                else if (edge == 'bottom') {
                    if ( this.dy < 0 ) {
                        limits_y.push([wall.y2, wall]);
                    }
                }
            }
        });

        floors.forEach(floor => {
            if (this.dropped_from && floor == this.dropped_from) {
                return;
            }
            const [intersection_y, edge] = floor.intersects(this);
            if (intersection_y !== false) {
                // if (!this.stands_on) {
                    if (this.y > this.o_y) {
                        limits_y.push([intersection_y, floor]);
                    }
                    else if ( floor.type == FLOOR && this.y < this.o_y ) {
                        limits_y.push([intersection_y, floor]);
                    }
                // }
            }
            if (floor.type == FLOOR) {
                if (edge == 'left') {
                    if ( this.dx > 0 ) {
                        limits_x.push([floor.x1, floor]);
                    }
                }
                else if (edge == 'right') {
                    if ( this.dx < 0 ) {
                        limits_x.push([floor.x2, floor]);
                    }
                }
            }
        });

        let limited_x;
        limits_x.forEach(limit => {
            const [limit_x, limiter] = limit;
            // console.log(limit_x, limiter, this.r_x, this.o_rx);
            if (this.dx > 0) {
                if (limited_x !== undefined && limited_x < limit_x) {
                    // console.log("have better already");
                    return;
                }
                if (this.o_rx <= limit_x) {
                    // console.log("selected!");
                    limited_x = limit_x;
                    this.x = limit_x - this.hw - 1;
                }
                else {
                    // console.log("was not crossed");
                }
            }
            else if (this.dx < 0) {
                if (limited_x !== undefined && limited_x > limit_x) {
                    return;
                }
                if (this.o_lx >= limit_x) {
                    limited_x = limit_x;
                    this.x = limit_x + this.hw + 1;
                }
            }
        });

        let limited_y = undefined;
        limits_y.forEach(limit => {
            const [limit_y, limiter] = limit;
            // console.log(limit_y, limiter, this.b_y, this.o_by);
            if (this.y > this.o_y) {
                if (limited_y !== undefined && limited_y < limit_y) {
                    // console.log("have better already");
                    return;
                }
                if ( this.o_by <= limiter.y_at(this.o_x) ) {
                    // console.log("selected!");
                    limited_y = limit_y;
                    this.y = limiter.y_at(this.x) - this.hh - 1;
                    this.stands_on = limiter;
                    this.dropped_from = false;
                }
                else {
                    // console.log("was not crossed");
                }
            }
            else if (this.y < this.o_y) {
                if (limited_y !== undefined && limited_y > limit_y) {
                    // console.log("have better already");
                    return;
                }
                if ( this.o_ty >= limiter.y_at(this.o_x) ) {
                    // console.log("selected!");
                    limited_y = limit_y;
                    this.y = limit_y + this.hh + 1;
                    this.dropped_from = this.stands_on;
                    this.stands_on = false;
                }
                else {
                    // console.log("was not crossed");
                }
            }
        });

        if (limited_y !== undefined) {
            this.dy = 0;

        }

        if (!this.stands_on) {
            this.jumps = false;
            this.drops = false;
        }

        if (this.b_y > app.renderer.height) {
            this.stands_on = true;
            this.dropped_from = false;
            // console.log('stand on screen');
            this.y = app.renderer.height - this.hh;
        }
        else if (this.t_y < 0) {
            this.y = this.hh;
            this.dy = 0;
        }
        if (this.l_x < 0) {
            this.x = this.hw;
        }
        else if (this.r_x > app.renderer.width) {
            this.x = app.renderer.width - this.hw;
        }

        this.o_x = this.x;
        this.o_y = this.y;

        this.weapons[this.selected_weapon].x = this.x;
        this.weapons[this.selected_weapon].y = this.y;
        this.weapons[this.selected_weapon].cool_down(dt);
        if (this.firing) {
            this.weapons[this.selected_weapon].r = Math.atan2(this.target_y - this.y, this.target_x - this.x);
            this.weapons[this.selected_weapon].pull_trigger();
        }

        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }

    sees(who) {
        for (let wall of walls) {
            if ( wall.crosses_line(this.x, this.y, who.x, who.y) ) {
                return false;
            }
        }
        for (let floor of floors) {
            if (floor.type != FLOOR) {
                continue;
            }
            if ( floor.crosses_line(this.x, this.y, who.x, who.y) ) {
                return false;
            }
        }

        return true;
    }
    kill(angle) {
        if (this.dead || this.invincible) {
            return;
        }
        this.dead = true;
        this.runs_left = false;
        this.runs_right = false;
        this.jumps = false;
        this.drops = false;
        this.firing = false;

        // this.sprite.texture = PIXI.loader.resources.dead_bunny.texture;
        this.sprite.visible = false;

        add_particle('dead_bunny', this.x, this.y, angle);

        show_death_hint();
    }

    handle_keydown(event) {
        if (this.dead) {
            return;
        }
        switch (event.code) {
            case 'KeyA':
                this.runs_left = true;
            break;
            case 'KeyD':
                this.runs_right = true;
            break;
            case 'KeyW':
                this.jumps = true;
            break;
            case 'KeyS':
                this.drops = true;
            break;
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
                this.selected_weapon = event.code.substr(5, 1);
            break;
            case 'KeyT':
                this.x = this.o_x = this.target_x;
                this.y = this.o_y = this.target_y;
            break;
            case 'KeyI':
                this.invincible = true;
            break;
        }
    }
    handle_keyup(event) {
        if (this.dead) {
            return;
        }
        if (event.code == 'KeyA') {
            this.runs_left = false;
        }
        else if (event.code == 'KeyD') {
            this.runs_right = false;
        }
    }
    handle_click(event) {
        if (this.dead) {
            return;
        }
        this.firing = true;
    }
    handle_unclick(event) {
        if (this.dead) {
            return;
        }
        this.firing = false;
    }
    handle_mouse(event) {
        if (this.dead) {
            return;
        }
        this.target_x = event.pageX;
        this.target_y = event.pageY;
    }
}

class Weapon {
    constructor(type) {
        this.x = 0;
        this.y = 0;
        this.r = 0;
        this.type = type;
        this.cool = 0;
        switch (this.type) {
            case 'pistol':
                this.projectile = 'bullet';
                this.cooldown = 0.5;
            break
            case 'grenade launcher':
                this.projectile = 'grenade';
                this.cooldown = 1;
            break;
            case 'raygun':
                this.projectile = 'ray';
                this.cooldown = 2;
            break;
        }
    }

    cool_down(dt) {
        this.cool -= dt;
    }
    pull_trigger() {
        if (this.cool <= 0) {
            this.fire();
        }
    }
    fire() {
        // console.log('fire', this.x, this.y);
        add_particle(this.projectile, this.x, this.y, this.r).owner = this.owner;
        this.cool = this.cooldown;
    }
}

class Carrot {
    constructor() {
        this.x = 1500;
        this.y = 75;

        this.draw();
    }
    draw() {
        this.sprite = new PIXI.Sprite(PIXI.loader.resources.carrot.texture);
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.x = this.x;
        this.sprite.y = this.y;

        app.stage.addChild(this.sprite);
    }

    update() {
    }
}
