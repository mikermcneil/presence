angular.module('Presence').controller('WorldCtrl', [

      '$scope',
      '$timeout',
      'negotiateKeyboardEvent',function(
        $scope,
        $timeout,
        negotiateKeyboardEvent) {



  //------/////////////////////////////////////////////////////------//
  //------//                                                 //------//
  //------//                                                 //------//
  //------//               WHEN EVENTS OCCUR...              //------//
  //------//                                                 //------//
  //------//                                                 //------//
  //------/////////////////////////////////////////////////////------//
                  //
                  //
                  //
  //--------------//------------------------------------------------------------//


  // Type in chat box
  $scope.typeInChatBox = function (e){
    _syncPlayer($scope.myPlayer);
    // if (e.which === 13) {
    //   $scope.myPlayer.chat
    // }
  };


  /**
   * [onRemotePlayerActivity description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  function onRemotePlayerActivity(event){

    try {
      // Cast `event.id` to an integer (just to be safe)
      event.data.id = event.data.id || event.id;
      event.data.id = +event.data.id;
      event.id = event.data.id;
    }
    catch(e) {
      console.error('Malformed comet event:',event, '( Error:',e,')');
      return;
    }

    try {
      // Merge in event's bundled `previous` data to get access to colors
      event.data.red = event.data.red || event.previous.red;
      event.data.green = event.data.green || event.previous.green;
      event.data.blue = event.data.blue || event.previous.blue;
    }
    catch (e){
      // fail silently if new colors cannot be parsed
    }

    console.log('Received socket event:',event);

    try {

      switch(event.verb) {

        case 'created':
          // Add a new player to the DOM
          $scope.players.push(event.data);

          // Then refresh the DOM
          // (Re)build style object
          event.data.style = _getStyle(event.data);
          $scope.$apply();
          break;

        case 'updated':
          var existingPlayer = _.find($scope.players, { id: +event.data.id });
          if (!existingPlayer) {
            // Create the player in the DOM
            $scope.players.push(event.data);
          }
          else {
            // Player already exists in the DOM, update it
            existingPlayer = _.extend(existingPlayer, event.data);
          }

          // Finally, in either case, refresh the DOM
          // (Re)build style object
          (existingPlayer || event.data).style = _getStyle(existingPlayer || event.data);
          $scope.$apply();
          break;

        default: throw new Error('Unrecognized socket event verb: '+event.verb);
      }
    }
    catch(e) {
      console.error('Malformed comet event:',event, '( Error:',e,')');
      return;
    }
  }


  // /**
  //  * @required x
  //  * @required y
  //  *
  //  * @uses $scope
  //  */
  // function onLocalPlayerMovement(options) {

  //   // Temporarily light up own player position for context
  //   $scope.myPlayer.moving = true;

  //   // Track current player position
  //   $scope.myPlayer.x = options.x;
  //   $scope.myPlayer.y = options.y;

  //   // $scope.myPlayer.style = {
  //   //   top: ((+e.pageY||0)-6)+'px',
  //   //   left: ((+e.pageX||0)-6)+'px'
  //   // };
  //   // $scope.$apply();
  //   // console.log('moving!');

  //   // Track whether player is moving (for animation)
  //   $timeout.cancel($scope.myPlayer.movingTimer);
  //   $scope.myPlayer.movingTimer = $timeout(function (){
  //     // console.log('stopped!');
  //     $scope.myPlayer.moving = false;
  //   }, 500);

  //   // Inform other users about our new local player position
  //   _syncPlayer($scope.myPlayer);
  // }




  // -------------------- //
  //                      //
  //   GLOBAL KEYBOARD    //
  //       EVENTS         //
  //                      //
  // -------------------- //---------------------------------------------


  // When DOM is ready, bind KB events
  $(function (){
    $(document).keydown(function (e){
      negotiateKeyboardEvent(e, {

        '<UP_ARROW>': function (){
          Cloud.movePlayer({
            direction: 0
          });
        },

        '<DOWN_ARROW>': function (){
          Cloud.movePlayer({
            direction: 180
          });
        },

        '<LEFT_ARROW>': function (){
          Cloud.movePlayer({
            direction: 270
          });
        },

        '<RIGHT_ARROW>': function (){
          Cloud.movePlayer({
            direction: 90
          });
        },

      });
    });
  });











  //------/////////////////////////////////////////////////////------//
  //------//                                                 //------//
  //------//                                                 //------//
  //------//           WHEN INITIALLY RENDERED...            //------//
  //------//                                                 //------//
  //------//                                                 //------//
  //------/////////////////////////////////////////////////////------//
                  //
                  //
                  //
  //--------------//------------------------------------------------------------//



  // -------------------- //
  //                      //
  //     INITIALIZE       //
  //      UI STATE        //
  //                      //
  // -------------------- //---------------------------------------------

  // Ensure `players` is an array
  $scope.players = [];

  // Track data about the global user player
  $scope.myPlayer = {};

  // Hack for monitoring scope in dev
  SCOPE = $scope;




  // -------------------- //
  //                      //
  //    BIND HANDLERS     //
  //                      //
  // -------------------- //---------------------------------------------

  // Listen for socket events of OTHER players and update the DOM
  io.socket.on('player', onRemotePlayerActivity);





  // -------------------- //
  //                      //
  //      FETCH DATA      //
  //                      //
  // -------------------- //---------------------------------------------


  // Initial fetch to get players
  // (only get ones who've been updated recently)
  //
  // (also subscribes to subsequent updates)
  io.socket.get('/player', {
    where: {
      updatedAt: {
        '>': new Date(((new Date()).getTime() - 15000))
      }
    }
  }, function (players, res){
    if (res.statusCode >= 300 || res.statusCode < 200) {
      console.error('Error fetching players (status: %s): ', res.statusCode, '\nBody:\n',players);
      return;
    }

    // Loop through and build each style object
    // (and cast ids)
    players = _.map(players, function (eachPlayer){
      eachPlayer.id = +eachPlayer.id;
      eachPlayer.style = _getStyle(eachPlayer);
      return eachPlayer;
    });

    // Update the DOM
    $scope.players = players;
    $scope.$apply();
  });


  // Immediately create the player for the current user
  io.socket.post('/player', {
    name: 'Guest_'+(Math.floor(Math.random()*100000)),
    x: 0,
    y: 0,
    red: (Math.floor(Math.random()*255)),
    green: (Math.floor(Math.random()*255)),
    blue: (Math.floor(Math.random()*255))
  }, function(myPlayer, res) {
    if (res.statusCode >= 300 || res.statusCode < 200) {
      console.error('Error creating a player (status: %s): ', res.statusCode, '\nBody:\n',myPlayer);
      return;
    }

    // Ensure integer id
    myPlayer.id = +myPlayer.id;

    // Find player w/ my id on the page (in $scope.players) and point `$scope.myPlayer` at it
    var myPlayerAlreadyExists = _.find($scope.players, { id: myPlayer.id });

    if (myPlayerAlreadyExists) {
      $scope.myPlayer = myPlayerAlreadyExists;
      return;
    }

    // If it doesn't exist on the page yet, create it
    $scope.myPlayer = myPlayer;
    $scope.players.push($scope.myPlayer);
    return;

  });


}]);












  //------/////////////////////////////////////////////////////------//
  //------//                                                 //------//
  //------//                                                 //------//
  //------//           CTX-FREE HELPER FUNCTIONS             //------//
  //------//                                                 //------//
  //------//                                                 //------//
  //------/////////////////////////////////////////////////////------//
                  //
                  //
                  //
  //--------------//------------------------------------------------------------//




// -------------------- //
//                      //
//        Cloud         //
//                      //
// -------------------- //---------------------------------------------


var Cloud = {

  // •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• ••
  // Outbound API (communicate w/ endpoints on server)
  // •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• ••

  movePlayer: function (inputs){

    io.socket.post('/player/move', {
      direction: inputs.direction
    }, function(coordinates, jwr) {
      if (jwr.error) {
        console.error('Error updating local player position (status: %s): ', jwr.statusCode, '\nBody:\n',jwr.error);
        return;
      }
      console.log('moved, new coordinates are (%s,%s)', coordinates.x, coordinates.y);

      // Refresh player in the DOM
      _.extend(SCOPE.myPlayer, coordinates);
      // (Re)build style object
      SCOPE.myPlayer.style = _getStyle(SCOPE.myPlayer || coordinates);
      SCOPE.$apply();
    });
  },



  chat: function (msg){
    io.socket._raw.emit('chat', msg);

    io.socket.post('/chat', {
      message: msg
    }, function (data, jwr) {
      if (jwr.error) {
        console.error('ERROR:',data);
        return;
      }

      console.log('response:',data);
      return;
    });
  },



  // •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• ••
  // Inbound API (listen for events server might send)
  // •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• •• ••

  when: {
    assadg: function (event){
      return mergeDiff(event);
    }
  }
};

// Listen for inbound messages from Sails
for (var eventName in Cloud.when){
  io.socket.on(eventName, Cloud.when[eventName]);
}




/**
 * [_syncPlayer description]
 * @param  {[type]} playerData [description]
 * @return {[type]}            [description]
 */
function _syncPlayer(playerData){
  io.socket.put('/player/'+playerData.id, {
    x: playerData.x,
    y: playerData.y,
    chat: playerData.chat
  }, function(data, jwr) {
    if (jwr.error) {
      console.error('Error updating local player position (status: %s): ', jwr.statusCode, '\nBody:\n',jwr.error);
      return;
    }
  });
}



// -------------------- //
//                      //
//         Misc         //
//                      //
// -------------------- //---------------------------------------------



/**
 * [_getStyle description]
 * @param  {[type]} playerObj [description]
 * @return {[type]}           [description]
 */
function _getStyle(obj) {
  obj = obj||{};

  return {
    top: (obj.y||0)+'px',
    left: (obj.x||0)+'px',
    'background-color': 'rgba('+(obj.red||255)+','+(obj.green||255)+','+(obj.blue||255)+', 0.6)'
  };
}
