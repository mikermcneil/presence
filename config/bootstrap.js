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
    name: 'default',
    width: 800,
    height: 600
  }).exec(function (err, defaultWorld){
    if (err) {
      sails.log.error('failed to create initial `default` world.');
      return cb(err);
    }

    // Start the play loop for the default world
    setInterval(function playLoop(){

      sails.machines.simulateRegion({
        world: defaultWorld.id,
        x: 0,
        y: 0,
        width: defaultWorld.width,
        height: defaultWorld.height
      }, {
        error: function (err){
          sails.log.error('Error simulating region in default world (#%d):',world.id, err);
          // This frame of the play loop ended w/ an error.
        },
        then: function (coordinates){
          // Successfully completed this frame of the play loop.
        }
      });
    }, 1000/30);



    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
  });

};
