/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  // Create the default world (if necessary)
  World.findOrCreate({
    name: 'default'
  }, {
    name: 'default'
  }).exec(function (err, defaultWorld){
    if (err) {
      sails.log.error('failed to create initial `default` world.');
      return cb(err);
    }


    // Start the play loop for the default world
    setInterval(function playLoop(){

      Player.find({
        world: defaultWorld.id
      }).exec(function (err, players){
        if (err){
          sails.log.error('Error looking up players in default world:',err);
          return;
        }

        async.each(players, function (player, next){
          sails.machines.simulatePlayer({
            playerId: player.id
          }, {
            error: function (err){
              sails.log.error('Error simulating player %d:',player.id, err);
              return next();
            },
            then: function (coordinates){
              return next();
            }
          });
        }, function (){
          // Done w/ this step of the play loop.
        });
      });
    }, 1000/30);



    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
  });

};
