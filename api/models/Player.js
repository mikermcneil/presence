/**
* Player.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    // e.g. "Guest_3192"
    name: {
      required: true,
      type: 'string',
      unique: true
    },

    // e.g. 90
    direction: {
      type: 'integer'
    },

    // e.g. true
    moving: {
      type: 'boolean',
      defaultsTo: false
    },

    // Links to the world in which this user currently resides
    world: {
      model: 'World'
    }

  }
};

