module.exports = {
  friendlyName: 'Spawn player',
  description: 'Spawn a new player in a world',

  inputs: {
    name: {
      description: 'The unique name of the player to create',
      example: 'Guest_3294'
    },
    world: {
      description: 'Id of the world where the player should be spawned',
      example: 23
    }
  },

  exits: {
    then: {
      description: 'New player stored in database',
      example: {
        id: 3,
        name: 'Fred',
        x: 23,
        y: 235,
        red: 24,
        green: 249,
        blue: 102
      }
    },
    nameAlreadyInUse: {},
    error: {}
  },

  defaultExit: 'then',

  fn: function createMap(inputs, exits){

    var WORLD_WIDTH = sails.config.world.width;
    var WORLD_HEIGHT = sails.config.world.height;

    Player.create({
      name: inputs.name || null,
      world: inputs.world,
      x: (Math.floor(Math.random()*WORLD_WIDTH)),
      y: (Math.floor(Math.random()*WORLD_HEIGHT)),
      red: (Math.floor(Math.random()*255)),
      green: (Math.floor(Math.random()*255)),
      blue: (Math.floor(Math.random()*255))
    }, function (err, newPlayer) {
      if (err) {
        if (err.status < 500) {
          return exits.nameAlreadyInUse(err);
        }
        return exits.error(err);
      }

      // Publish an event letting everyone who cares that a new player was created.
      // (if we didn't want to publish it to ourselves, we could have passed in `req`)
      Player.publishCreate(newPlayer);

      return exits.then(newPlayer);
    });

  }
};
