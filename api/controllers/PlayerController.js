/**
 * PlayerController
 *
 * @description :: Server-side logic for managing players
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  test: function (req, res) {
    return res.json(req.session);
  },

  /**
   * Player wants to move a particular direction
   */
  move: function (req, res) {
    if (!req.session.me) {
      return res.forbidden('req.session.me is falsy.');
    }

    req.validate({
      direction: 'integer'
    });

    // TODO: "time out" movements by setting a "startedMovingAt" attr (or something like that)

    // Set direction
    Player.update(req.session.me, {
      direction: req.param('direction'),
      moving: true
    }, function (err){
      if (err) return res.negotiate(err);
      return res.ok();
    });
  },


  /**
   * Player wants to stop moving
   */
  stopMoving: function (req, res) {
    if (!req.session.me) {
      return res.forbidden('req.session.me is falsy.');
    }

    // Set direction
    Player.update(req.session.me, {
      moving: false
    }, function (err){
      if (err) return res.negotiate(err);
      return res.ok();
    });
  },



  /**
   * Player wants to join the world.
   */
	join: function (req,res) {

    World.findOne({
      name: req.param('world')
    }).exec({
      error: function(err) {
        return res.negotiate(err);
      },
      success: function(world) {
        if (!world) return res.notFound();

        // This is an existing user-- instead of creating, look up her player.
        // If she exists in the requested world, send her back.
        // Otherwise, it as if she does not exist (for now)
        if (req.session.me) {
          Player.findOne({
            id: req.session.me,
            world: world.id
          }).exec(function (err, player) {
            if (err) return res.negotiate(err);
            if (!player) return res.notFound();
            return res.json(player);
          });
          return;
        }

        // Otherwise this is a new user-- we'll create a player for her.
        sails.machines.spawnPlayer({
          name: req.param('name'),
          world: world.id
        }, {
          error: function (err){
            return res.negotiate(err);
          },
          then: function (newPlayer){

            // Then save her player id in her session
            req.session.me = newPlayer.id;
            req.session.save(function (err){
              if (err) return res.negotiate(err);

              sails.log('Saved as player %d in session', newPlayer.id);

              // Publish an event letting everyone who cares that a new player was created.
              // (if we didn't want to publish it to ourselves, we could have passed in `req`)
              // World.publishAdd(inputs.world, 'players');
              World.message(world.id, {
                id: world.id,
                verb: 'addedTo',
                attribute: 'players',
                added: newPlayer
              });

              // Session is automatically persisted when we respond (just like in Express)
              return res.json(newPlayer);
            });

          }
        });
      }
    });

  }
};

