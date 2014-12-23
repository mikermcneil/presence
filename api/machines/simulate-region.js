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


        // TODO: Don't just shove these values in here
        var PLAYER_WIDTH = 30;
        var PLAYER_HEIGHT = 30;
        player.width = PLAYER_WIDTH;
        player.height = PLAYER_HEIGHT;

        // Calculate player's bounding box
        var playerBox = getBoundingBox(player.x,player.y,player.width, player.height);


        // Enforce world boundaries
        var WORLD_WIDTH = sails.config.world.width;
        var WORLD_HEIGHT = sails.config.world.height;
        // TODO: allow worlds to have variable dimensions

        if (playerBox.right > WORLD_WIDTH) {
          player.x = WORLD_WIDTH - PLAYER_WIDTH;
        }
        if (playerBox.left < 0) {
          player.x = 0;
        }
        if (playerBox.bottom > WORLD_HEIGHT) {
          player.y = WORLD_HEIGHT - PLAYER_HEIGHT;
        }
        if (playerBox.top < 0) {
          player.y = 0;
        }


        // Collisions w/ other players
        _.each(players, function (otherPlayer){
          // Can't collide w/ yourself
          if (otherPlayer.id === player.id) return;

          // TODO: Don't just shove these values in here
          otherPlayer.width = PLAYER_WIDTH;
          otherPlayer.height = PLAYER_HEIGHT;

          // Calculate other player's bounding box
          var otherPlayerBox = getBoundingBox(otherPlayer.x,otherPlayer.y, otherPlayer.width, otherPlayer.height);

          // Check for a collision
          var hasCollision = (function (){


            //     ->|
            // {YOU}THEM
            if (playerBox.right > otherPlayerBox.left) {

              //   |<-
              // THEM{YOU}
              if (playerBox.left < otherPlayerBox.right) {

                // THEM
                // {YOU}
                if (playerBox.top < otherPlayerBox.bottom) {

                  // {YOU}
                  // THEM
                  if (playerBox.bottom > otherPlayerBox.top) {
                    return true;
                  }
                }
              }
            }
          })();

          // IF a collision occurred, just log for now
          if (hasCollision) {
            console.log('HAS COLLISION');
            // TODO: something better
          }



          // /////////

          // // {YOU}THEM
          // if (playerBox.right > otherPlayerBox.left) {
          //   player.x = otherPlayerBox.left - player.width;
          // }

          // // THEM{YOU}
          // if (playerBox.left < otherPlayerBox.right) {
          //   player.x = otherPlayerBox.right;
          // }

          // // THEM
          // // {YOU}
          // if (playerBox.top < otherPlayerBox.bottom) {
          //   player.y = otherPlayerBox.bottom;
          // }

          // // {YOU}
          // // THEM
          // if (playerBox.bottom > otherPlayerBox.top) {
          //   player.y = otherPlayerBox.top;
          // }

        });

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



// Calculate player's bounding box
function getBoundingBox(x,y,width,height){
  return {
    top    : y,
    right  : x+width,
    bottom : y+height,
    left   : x
  };
}
