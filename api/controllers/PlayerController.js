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

	create: function (req,res) {

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
    Player.create(req.allParams(), function (err, newPlayer) {
      if (err) return res.negotiate(err);

      // Publish an event letting everyone who cares that a new player was created.
      // (but don't publish it to ourselves- that's why we pass in `req`)
      Player.publishCreate(newPlayer, req);

      // Then save her player id in her session
      req.session.me = newPlayer.id;

      // Session is automatically persisted when we respond (just like in Express)
      return res.json(newPlayer);
    });

  }
};

