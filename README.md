Supermodel
==========

A general purpose observable model, to help you keep track of your application state. Supermodel allows you to `set` and `get` *keypaths*, making it easy to work with a model of arbitrary complexity.

For example, suppose your model looks like this:

    {
        currentUser: {
            name: 'Alice',
            avatar: 'alice.jpg',
            highscore: 120,
            friends: [ 'Bob', 'Charles' ]
        }
    }

Different parts of your application might be interested in different things. You may want to display the avatar somewhere, render a highscore leaderboard somewhere else, display Alice's friends' statuses somewhere else, and so on.

With Supermodel each component *observes* the *keypath* it is interested in, e.g. `currentUser.avatar`, or even `currentUser.friends.length`. Then, when the model is updated with (for example) `model.set( 'currentUser', user )` those components will be notified, because their *observed keypaths* are *downstream* of the keypath that was *set*.




Basic usage
-----------

Include Supermodel.js on your page. Then,

    var model = new Supermodel( data );

Initialising with data is optional (see *Creating new branches* below). Once your model is setup, you can set or get data like so:

    model.set( 'foo', 'bar' );
    model.get( 'foo' ); // returns 'bar'




Observing (registering callbacks)
---------------------------------

You can observe 'foo' with

    model.observe( 'foo', function ( newValue, oldValue ) {
        alert( newValue );
    });

    model.set( 'foo', 'bar' ); // alerts 'bar'

`model.observe()` returns an array of *observers*, which can be passed to `model.unobserve()` to cancel themselves:

    var observers = model.observe( 'foo', function ( newValue, oldValue ) {
        alert( newValue );
    });

    model.unobserve( observers );

    model.set( 'foo', 'bar' ); // does nothing - the callback does not trigger

It returns an array, because under the hood `model.observe()` sets up observers for the specified keypath, and each of the *upstream keypaths*. Hence `model.observe( 'foo.bar.baz[0]', callback )` will return an array of four observers - one for 'foo.bar.baz[0]', one for 'foo.bar.baz', one for 'foo.bar', and one for 'foo'.




Creating new branches
---------------------

If you set a keypath that is downstream of a non-existent branch, that branch will be created. In other words:

    var model = new Supermodel();

    model.set( 'currentUser.name', 'Alice' );

will create a model that looks like this:

    {
        currentUser: {
            name: 'Alice'
        }
    }

even though there was no 'currentUser' property of the model. Branches will be created as objects or as arrays, depending on context:

    model.set( 'currentUser.friends[0]', 'Bob' );

The model will now look like this...

    {
        currentUser: {
            name: 'Alice',
            friends: [ 'Bob' ]
        }
    }

...and NOT like this:

    {
        currentUser: {
            name: 'Alice',
            friends: {
                '0': 'Bob'
            }
        }
    }

(That said it would obviously be more efficient for your app to do `model.set( 'currentUser.friends', [ 'Bob', 'Charles' ] )` than setting them individually.) 




License
-------

WTFPL.