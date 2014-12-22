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

    // This is an existing user-- instead of creating, look up her player.
    if (req.session.me) {
      Player.findOne({
        id: req.session.me
      }).exec(function (err, player) {
        if (err) return res.negotiate(err);
        if (!player) return res.notFound();
        return res.json(player);
      });
      return;
    }

    // Otherwise this is a new user-- we'll create a player for her.
    sails.machines.spawnPlayer({
      name: req.param('name')
    }, {
      error: function (err){
        return res.negotiate(err);
      },
      then: function (newPlayer){

        // Then save her player id in her session
        req.session.me = newPlayer.id;

        // Session is automatically persisted when we respond (just like in Express)
        return res.json(newPlayer);
      }
    });

  }
};

