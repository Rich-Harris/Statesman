Statesman.js
============

The JavaScript state management library
---------------------------------------


**Statesman.js** is a general purpose observable model, to help you keep track of your application state.

* [API Reference](https://github.com/Rich-Harris/Statesman/wiki/API-reference)

* [Basic usage](https://github.com/Rich-Harris/Statesman/wiki/Basic-usage) - creating a state model, getting and setting values
* [Observers](https://github.com/Rich-Harris/Statesman/wiki/Observers) - responding to changes in the model
* [Computed values](https://github.com/Rich-Harris/Statesman/wiki/Computed-values) - derived properties of the model
* [Subsets](https://github.com/Rich-Harris/Statesman/wiki/Subsets) - zooming in on part of the model


Why?
----

Our webapps are getting richer and more complex. One consequence of this is that managing *state* is exponentially harder than it used to be. Different parts of an app have different responsibilities and may be split across many different files, but they all need to reflect the same underlying state.

**Statesman.js** gives you a convenient way to model your app state, derive computed values from it, and monitor it for changes. It holds no opinions about how you structure your app, and plays nicely with whatever libraries you happen to be using. It has **no dependencies** and weighs less than **2.2kb** minifed and gzipped. It works on server or client, optionally as an AMD module.


An example
----------

Suppose you're creating a game, and your state model looks like this:

    // ignore the fact that we're hard-coding our user's data, rather than loading it from somewhere...
    var state = new Statesman({
        user: {
            name: 'Alice',
            avatar: 'alice.jpg',
            score: 120,
            friends: [ 'Bob', 'Charles' ]
        }
    });

Maybe you have a view of the user's score somewhere in the app, with markup that looks like this:

    <span id='score'></span>

When Alice's score changes, update the model:

    state.set( 'user.score', currentScore );

When the model changes, we can update the view:

    scoreView = $( '#score' );

    state.observe( 'user.score', function ( newScore, oldScore ) {
    	scoreView.text( newScore );
    });

In this way it's very easy to keep your state model, views, and application logic neatly separated from each other.


So is this like Backbone models or [insert MV* framework here]?
---------------------------------------------------------------

Yeah, I suppose, insofar as it helps you keep you maintain separation of concerns. This is a little more 'informal' - rather than having lots of models representing specific entities, the idea with **Statesman.js** is that you only have a single model to worry about (though you can have as many instances as you like, of course, and you can 'subset' the model to provide part of your app with restricted access to the part of the model that concerns it).


But wait! There's more
----------------------

In the example above, we're observing `user.score`. But let's say Alice logs out and someone else logs in:

    state.set( 'user', newUser );

The `user.score` observer **will still be notified**, even though it's not observing `user` directly.

Conversely, if something is observing `user`, and `user.score` (or, for that matter, `user.avatar`, or `user.friends[0]` or any other descendant of `user`) changes, that observer will be notified.

This is very handy.

We can also define **computed values**, which will update when their *triggers* change:

    // start a new level
    state.set( 'level', {
    	title: 'The dungeon of contrived examples',
    	baddies: 20,
    	scoreToWin: 200
    });

    // define our victory conditions
    state.compute( 'user.hasWon', {
    	triggers: [ 'user.score', 'level.scoreToWin' ],
    	fn: function ( score, scoreToWin ) {
    		return ( score >= scoreToWin ); // returns true if the user's score is high enough
    	}
    });

    // when the user wins, congratulate them with an alert box
    state.observe( 'user.hasWon', function ( userHasWon ) {
    	if ( userHasWon ) {
    		alert( 'Congratulations! You have won the game' );
    	}
    });

All the examples above are overly simplistic, of course. But hopefully they give you some idea of what **Statesman.js** is and how to use it. For more info consult the [API Reference](https://github.com/Rich-Harris/Statesman/wiki/API-reference) or the pages on [basic usage](https://github.com/Rich-Harris/Statesman/wiki/Basic-usage), [observers](https://github.com/Rich-Harris/Statesman/wiki/Observers) and [computed values](https://github.com/Rich-Harris/Statesman/wiki/Computed-values).


Feedback
--------

Issues and pull requests are welcome. Or you can reach me on Twitter at [@rich_harris](http://twitter.com/rich_harris).


License
-------

MIT: https://github.com/Rich-Harris/Statesman/blob/master/LICENSE-MIT


Changelog [here](CHANGELOG.md).