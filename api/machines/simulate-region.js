module.exports = {
  friendlyName: 'Simulate region',
  description: 'Simulate a moment in a region\'s life, updating player positions, etc.',

  inputs: {
    world: {
      example: 1,
      required: true
    },
    x: {
      example: 300,
      required: true
    },
    y: {
      example: 300,
      required: true
    },
    width: {
      example: 100,
      required: true
    },
    height: {
      example: 100,
      required: true
    }
  },

  exits: {
    then: {},
    error: {},
  },

  defaultExit: 'then',

  fn: function (inputs, exits){

    // Look up the various things which might exist in the region
    Player.find({
      and: [
        {
          world: inputs.world,
          x: { '>=': inputs.x },
          y: { '>=': inputs.y },
        },
        {
          x: { '<': inputs.x+inputs.width },
          y: { '<': inputs.y+inputs.height },
        }
      ]
    }).exec(function (err, players){
      if (err) return exits.error(err);

      // console.log('found players:',players);

      // Then simulate a moment for all of them
      async.each(players, function (player, next){

        // If not moving, just bail out
        if (!player.moving) return next();

        var direction = player.direction;

        var speed = 1;
        var UNIT_PIXEL = 5;
        var pxIncr = speed*UNIT_PIXEL;
        switch (direction){
          case 0:   player.y-=pxIncr; break;
          case 45:   player.y-=pxIncr; player.x+=pxIncr; break;
          case 90:  player.x+=pxIncr; break;
          case 135:  player.x+=pxIncr; player.y+=pxIncr; break;
          case 180: player.y+=pxIncr; break;
          case 225: player.y+=pxIncr; player.x-=pxIncr; break;
          case 270: player.x-=pxIncr; break;
          case 315: player.x-=pxIncr; player.y-=pxIncr; break;
          default: return next('Unknown direction:'+direction);
        }

        // Enforce world boundaries
        var WORLD_WIDTH = sails.config.world.width;
        var WORLD_HEIGHT = sails.config.world.height;

        var PLAYER_WIDTH = 30;
        var PLAYER_HEIGHT = 30;

        if (player.x+PLAYER_WIDTH > WORLD_WIDTH) {
          player.x = WORLD_WIDTH - PLAYER_WIDTH;
        }
        if (player.x < 0) {
          player.x = 0;
        }
        if (player.y+PLAYER_HEIGHT > WORLD_HEIGHT) {
          player.y = WORLD_HEIGHT - PLAYER_HEIGHT;
        }
        if (player.y < 0) {
          player.y = 0;
        }

        // Collisions w/ other players
        // TODO

        // ---OOO
        // ---OOO

        // OOO---
        // OOO---

        // OOO
        // OOO
        // ---
        // ---

        // ---
        // ---
        // OOO
        // OOO

        // _.each(players, function (otherPlayer){
        //   // Can't collide w/ yourself
        //   if (otherPlayer.id === player.id) return;

        //   if (player.x+PLAYER_WIDTH > otherPlayer.x + PLAYER_WIDTH) {
        //     player.x = WORLD_WIDTH - PLAYER_WIDTH;
        //   }
        //   if (player.x < otherPlayer.x + PLAYER_WIDTH) {
        //     player.x = otherPlayer.x + PLAYER_WIDTH;
        //   }
        //   if (player.y+PLAYER_HEIGHT > WORLD_HEIGHT) {
        //     player.y = WORLD_HEIGHT - PLAYER_HEIGHT;
        //   }
        //   if (player.y < otherPlayer.y + PLAYER_HEIGHT) {
        //     player.y = otherPlayer.y + PLAYER_HEIGHT;
        //   }
        // });

        player.save(function (err){
          if (err) return next(err);

          // Inform all other players in world about this player's new coordinates
          Player.publishUpdate(player.id, {
            x: player.x,
            y: player.y
          });

          return next();
        });
      }, function (err){
        if (err) return exits.error(err);
        return exits.then();
      });

    });

  }
};
