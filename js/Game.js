let level = 0;
let bunny;
let carrot;
let hint_text;
let hint_text_ttl = 1.5;
let win = false;
let win_timer;
const enemies = [];
const particles = [];

function start_level() {
    level++;
    win_timer = 3;

    particles.length = 0;

    do {
        generate_level();
        // console.log( graph_nodes.shortestPath('0;600', '1400;0') );
    } while ( !graph_nodes.isConnected('0;600', '1400;0') )

    app.stage.removeChildren();
    bunny = new Character();
    bunny.draw();
    carrot = new Carrot();
    carrot.draw();
    draw_level();
    init_particle_containers();

    hint_text = new PIXI.Text(
        'Level ' + level + '! Grab the carrot!',
        new PIXI.TextStyle({
            fontFamily: 'Impact',
            fontSize: 100,
            fill: ['#dddddd', '#ffffff', '#dddddd'], // gradient
            stroke: '#111111',
            strokeThickness: 5,
        })
    );
    hint_text.x = app.renderer.width * 0.5;
    hint_text.y = app.renderer.height * 0.5;
    hint_text.anchor.set(0.5, 0.5);
    app.stage.addChild(hint_text);
    hint_text_ttl = 2;
}

function update_game(dt) {
    if (bunny.l_x < carrot.x && bunny.r_x > carrot.x && bunny.t_y < carrot.y && bunny.b_y > carrot.y) {
        win = true;
        show_win_hint();
        win_timer -= dt;
        if (win_timer < 0) {
            start_level();
        }
    }
    else {
        bunny.update(dt);
        carrot.update(dt);
        enemies.forEach( char => {
            char.update(dt);
        });
        particles.forEach(particle => {
            if (particle === undefined) {
                return;
            }
            particle.update(dt);
        });
    }

    update_hint(dt);
}

function show_death_hint() {
    hint_text_ttl = Infinity;
    hint_text.alpha = 1;
    hint_text.visible = true;
    hint_text.style.fill = ['#dd0000', '#ff0000', '#dd0000'];
    hint_text.text = 'You died!';
}
function show_win_hint() {
    hint_text_ttl = Infinity;
    hint_text.alpha = 1;
    hint_text.visible = true;
    hint_text.style.fill = ['#ff5500', '#ff712b', '#ff5500'];
    hint_text.text = 'Yummy!!';
}

function update_hint(dt) {
    hint_text_ttl -= dt;
    if (hint_text_ttl < 0.1 && hint_text_ttl > 0) {
        hint_text.alpha = hint_text_ttl * 10;
    }
    else if (hint_text_ttl < 0) {
        hint_text.visible = false;
    }
    else {
        hint_text.visible = true;
        hint_text.alpha = 1;
    }
}
