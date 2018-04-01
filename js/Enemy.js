class Enemy extends Character {
    constructor(type, x, y) {
        super();
        this.type = type;
        this.x = x;
        this.y = y;
    }
    init() {
        this.hw = 10;
        this.hh = 10;

        this.r = (Math.random() - 0.5) * 2 * Math.PI;
        this.desired_r = this.r;
        this.turn_speed = 0.5 * level;
        this.aggressive = false;

        this.weapon = new Weapon('pistol');
        this.weapon.x = this.x;
        this.weapon.y = this.y;
        this.weapon.owner = this;
    }
    draw() {
        this.container = new PIXI.Container();
        app.stage.addChild(this.container);

        this.turret_graphics = new PIXI.Sprite(PIXI.loader.resources.turret.texture);
        this.turret_graphics.anchor.set(0.5, 0.5);
        this.container.addChild(this.turret_graphics);

        this.gun_graphics = new PIXI.Sprite(PIXI.loader.resources.turret_gun.texture);
        this.gun_graphics.anchor.set(0.2, 0.5);
        this.container.addChild(this.gun_graphics);
    }

    update(dt) {
        this.aggressive = false;

        if (!this.dead) {
            if ( this.sees(bunny) && !bunny.dead ) {
                this.aggressive = true;
                if (this.r > Math.PI) {
                    this.r -= 2 * Math.PI;
                }
                if (this.r < -Math.PI) {
                    this.r += 2 * Math.PI;
                }

                this.desired_r = Math.atan2(bunny.y - this.y, bunny.x - this.x);
            }

            if ( Math.abs(this.desired_r - this.r) < this.turn_speed * dt ) {
                this.r = this.desired_r;
            }
            else {
                if (Math.abs(this.desired_r - this.r) > Math.PI) {
                    this.desired_r -= 2 * Math.PI * Math.sign(this.desired_r);
                }
                // console.log(desired_r, this.r, Math.abs(this.r - desired_r), this.turn_speed * dt);
                this.r += this.turn_speed * dt * Math.sign(this.desired_r - this.r);
            }

            this.weapon.x = this.x;
            this.weapon.y = this.y;
            this.weapon.r = this.r;
            if (Math.abs(this.desired_r - this.r) < 0.1 && this.aggressive) {
                // console.log(this.x, this.y);
                this.weapon.pull_trigger();
            }

            this.weapon.cool_down(dt);
        }

        this.gun_graphics.rotation = this.r;
        this.container.x = this.x;
        this.container.y = this.y;
    }

    kill(angle) {
        if (this.dead) {
            return;
        }
        this.dead = true;
        this.container.visible = false;

        add_particle('dead_turret', this.x, this.y, angle);
        add_particle('dead_turret_gun', this.x, this.y, angle);

        // this.sprite.texture = PIXI.loader.resources.dead_bunny.texture;
    }
}