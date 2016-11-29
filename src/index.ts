import * as _ from 'lodash';
import * as pag from 'pag';
import * as ppe from 'ppe';
import * as sss from 'sss';
import * as ob from './ob/index';

ob.init(init, initGame, update);
let p: p5 = ob.p;

function init() {
  ob.screen.init(128, 128);
  ob.setTitle('ONE BUTTON', 'FOR ALL');
  //ob.setReplayFuncs(generateActor, getReplayStatus, setReplayStatus);
  //ob.setSeeds(0);
  ob.enableDebug(() => {
  });
  pag.setDefaultOptions({
    isLimitingColors: true
  });
  ppe.setOptions({
    isLimitingColors: true
  });
}

function initGame() {
  _.times(64, () => new ob.Star());
  new Player();
  ob.addModule(new ob.DoInterval(null, () => {
    new Enemy();
  }, 60, false, true));
}

function update() {
}

class Player extends ob.Player {
  ms;
  nextAsAngle = p.HALF_PI;

  constructor() {
    super();
    this.ms = new ob.MoveSin(this, 'pos.x');
    this.addModule(this.ms);
    this.pos.y = 100;
    this.angle = -p.HALF_PI;
  }

  update() {
    this.ms.speed = ob.ui.isPressed ? 0.1 : 0.03;
    if (this.ms.angle >= this.nextAsAngle) {
      ob.addScore(1, this.pos);
      this.nextAsAngle += p.PI;
      sss.play('c1');
    }
    if (ob.ui.isJustPressed) {
      new ob.Shot(this);
    }
    super.update();
  }
}

class Enemy extends ob.Enemy {
  constructor() {
    super();
    this.pos.x = p.random(128);
    this.vel.y = p.random(1, ob.getDifficulty());
    this.angle = p.HALF_PI;
  }
}