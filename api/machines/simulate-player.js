module.exports = {
  friendlyName: 'Simulate player',
  description: 'Simulate a moment in a player\'s life, updating position, etc.',

  inputs: {
    playerId: {
      description: 'The unique id of the player',
      example: 8238
    }
  },

  exits: {
    then: {
      example: {
        x: 23,
        y: 235
      }
    },
    error: {},
  },

  defaultExit: 'then',

  fn: function (inputs, exits){

    Player.findOne(inputs.playerId).exec(function (err, player) {
      if(err) return exits.error(err);

      // If not moving, just bail out
      if (!player.moving) return exits.then();

      var direction = player.direction;

      var speed = 1;
      var UNIT_PIXEL = 5;
      var pxIncr = speed*UNIT_PIXEL;
      switch (direction){
        case 0:   player.y-=pxIncr; break;
        case 45:   player.y-=(pxIncr/2); player.x+=(pxIncr/2); break;
        case 90:  player.x+=pxIncr; break;
        case 115:  player.x+=(pxIncr/2); player.y+=(pxIncr/2); break;
        case 180: player.y+=pxIncr; break;
        case 225: player.y+=(pxIncr/2); player.x-=(pxIncr/2); break;
        case 270: player.x-=pxIncr; break;
        case 315: player.x-=(pxIncr/2); player.y-=(pxIncr/2); break;
        default: return exits.error('Unknown direction:'+direction);
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

      player.save(function (err){
        if (err) return exits.error(err);

        // Inform all other players in world about this player's new coordinates
        Player.publishUpdate(inputs.playerId, {
          x: player.x,
          y: player.y
        });

        // Also send back new coordinates to the player herself
        return exits.then({
          x:player.x,
          y:player.y
        });
      });
    });
  }
};
