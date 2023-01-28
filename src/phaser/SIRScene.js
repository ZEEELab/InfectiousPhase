import Phaser from "phaser";
import React, { useEffect, useRef } from 'react';
import { store } from '../app/store';
import { useSelector } from 'react-redux'

import {    
    add_susceptible, 
    remove_susceptible, 
    add_infected, 
    remove_infected, 
    add_recovered, 
    remove_recovered,
    selectSusceptible } from '../features/compartmentCounts/counterSlice'


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
        console.log(this);
        this.infectMe();
    }
};




/*
Scene would have to handle collisions (callback in agents?)
Scene sets up world structure as well (subpopulations? migration?)
*/

class AgentLocation extends Phaser.Physics.Arcade.Group {
    constructor(config) {
        super(config.world, config.scene, {
                enable: true,
                collideWorldBounds: true,
                bounceX: 1,
                bounceY: 1,
                maxVelocityX: config.max_velocity,
                maxVelocityY: config.max_velocity,
                velocityX: config.max_velocity,
                velocityY: config.max_velocity
        });

        this.scene = config.scene;

        this.bounds_rectangle = new Phaser.Geom.Rectangle(config.x, config.y, config.width, config.height);
        
        let g = new Phaser.GameObjects.Graphics(this.scene);
        g.lineStyle(5, 0x00ffff, 0.5).strokeRectShape(this.bounds_rectangle);

        config.scene.add.existing(g);


        for (let i=0; i<config.num_agents; i++) {
            let duder = new SIRAgent({scene: this.scene, scale: 0.1});
            this.add(duder, true);
            store.dispatch(add_susceptible());
        };

        this.getChildren().forEach( (dudes) => {
            dudes.body.setBoundsRectangle(this.bounds_rectangle);
            dudes.setBounce(1,1);
            dudes.setVelocity(Phaser.Math.Between(-80,80), Phaser.Math.Between(-80,80));

        });

        this.scene.physics.add.collider(this, this, (o1, o2) => {
            o1.dudeCollide(o2);
            o2.dudeCollide(o1);
        });

        Phaser.Actions.RandomRectangle(this.getChildren(), this.bounds_rectangle);
        config.scene.add.existing(this);

    }
}





class SIRScene extends Phaser.Scene {
    constructor() {
      super("PlayGame");
      this.locations = [];
    }
    preload() {
      this.load.spritesheet('dude', './sprites/SIR_sprites.png', { frameWidth: 67, frameHeight: 125 });
    }

    create() {
        var location1 = new AgentLocation({
            world: this.physics.world, 
            scene: this, 
            x: 20, 
            y: 20, 
            width: 300, 
            height: 300,
            max_velocity: 7.5,
            num_agents: 200
        });

        var location2 = new AgentLocation({
            world: this.physics.world, 
            scene: this, 
            x: 420, 
            y: 20, 
            width: 300, 
            height: 300,
            max_velocity: 15,
            num_agents: 200
        });
     };
};




/* 
    The react component that actually has the game object 
*/
export const PhaserSimComponent = () => {
    const phaser_div = useRef(null);
    const phaser_game_ref = useRef(null);

    const susceptible_count = useSelector(selectSusceptible);
    
    useEffect(() => {
        const config = {
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

        phaser_game_ref.current = new Phaser.Game(config);


        return () => {
            phaser_game_ref.current.destroy(true);
            phaser_game_ref.current = null;
        };
    }, []);

    useEffect( () => {
        console.log(phaser_game_ref.current);
    }, [susceptible_count])

    return (
            <div ref={phaser_div}>

            </div>        
    );
}

  
  
  
  
export default SIRScene;