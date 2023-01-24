import Phaser from "phaser";
import { store } from '../app/store';
import {
    add_susceptible, 
    remove_susceptible, 
    add_infected, 
    remove_infected, 
    add_recovered, 
    remove_recovered
  } from '../features/compartmentCounts/counterSlice'


class SIRAgent extends Phaser.Physics.Arcade.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, 'dude');

        this.setScale(config.scale, config.scale); //BIG!
        config.scene.add.existing(this); //add this object to the scene
        this.setInteractive(); //clickable
        this.on('pointerdown', this.clicked, this);
        
        this.state = 0

        //need this to set a timer
        this.scene = config.scene;
    }

    dudeCollide(other_dude) {
        if (other_dude.state === 1 && this.state === 0) {
            this.infectMe();
        }
    }

    infectMe() {
        this.state = 1;
        this.setFrame(this.state);
        store.dispatch(remove_susceptible());
        store.dispatch(add_infected())
        
        this.scene.time.addEvent( {
            delay: 2000,
            callback: () => 
            {
                this.state = 2;
                this.setFrame(this.state);

                store.dispatch(remove_infected());
                store.dispatch(add_recovered());

            },
        } );
    }   
    
    clicked() {
        this.infectMe();
    }
};

class SIRScene extends Phaser.Scene {
    constructor() {
      super("PlayGame");
    }
    preload() {
      this.load.spritesheet('dude', './sprites/SIR_sprites.png', { frameWidth: 67, frameHeight: 125 });

    }
    create() {
        var bounds = new Phaser.Geom.Rectangle(200, 150, 400, 300);

        var group = this.physics.add.group();

        for (let i=0; i<300; i++) {
            let duder = new SIRAgent({scene: this, scale: 0.1});
            group.add(duder);

            store.dispatch(add_susceptible());
        };

        group.getChildren().forEach( (dudes) => {
            dudes.body.setBoundsRectangle(bounds);
            dudes.setBounce(1,1);
            dudes.setCollideWorldBounds(true);
            dudes.setMaxVelocity(10,10);
            dudes.setVelocity(Phaser.Math.Between(-80,80), Phaser.Math.Between(-80,80));
        });
        
        Phaser.Actions.RandomRectangle(group.getChildren(), bounds);
        
        this.physics.add.collider(group, group, (o1, o2) => {
            o1.dudeCollide(o2);
            o2.dudeCollide(o1);
        });
    
        this.add.graphics()
            .lineStyle(5, 0x00ffff, 0.5)
            .strokeRectShape(bounds);
      
    }
  }

  export const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: SIRScene
  };
  
  const game = new Phaser.Game(config);
  
  
  
  export default SIRScene;