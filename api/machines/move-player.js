module.exports = {

  description: 'Move a player',

  inputs: {
    playerId: {
      description: 'The unique id of the player to move',
      example: 8238
    },
    direction: {
      description: 'The direction to move',
      example: 90
    }
  },

  exits: {
    then: {
      example: {
        x: 23,
        y: 235
      }
    },
    badRequest: {},
    error: {},
  },

  defaultExit: 'then',

  fn: function createMap(inputs, exits){

    Player.findOne(inputs.playerId).exec(function (err, player) {
      if(err) return exits.error(err);
      var speed = 5;
      var UNIT_PIXEL = 5;
      var pxIncr = speed*UNIT_PIXEL;
      switch (inputs.direction){
        case 0:   player.y-=pxIncr; break;
        case 90:  player.x+=pxIncr; break;
        case 180: player.y+=pxIncr; break;
        case 270: player.x-=pxIncr; break;
        default: return exits.badRequest('Unknown direction:'+inputs.direction);
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
