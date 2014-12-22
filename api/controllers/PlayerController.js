/**
 * PlayerController
 *
 * @description :: Server-side logic for managing players
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  /**
   * Player wants to move a particular direction
   */
  move: function (req, res) {
    if (!req.session.me) {
      return res.forbidden('No user session.');
    }

    sails.machines.movePlayer({
      playerId: req.session.me,
      direction: req.param('direction')
    }, {
      error: function (err){
        return res.negotiate(err);
      },
      badRequest: function (err){
        return res.badRequest(err);
      },
      then: function (coordinates){
        return res.send(coordinates);
      }
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

            sails.log('Saved %d in session', newPlayer.id);

            // Session is automatically persisted when we respond (just like in Express)
            return res.json(newPlayer);
          }
        });
      }
    });

  }
};

