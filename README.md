Supermodel
==========

**State management made sexy**

Supermodel.js is a general purpose observable model, to help you keep track of your application state. Supermodel allows you to `set` and `get` *keypaths*, making it easy to work with a model of arbitrary complexity.

For example, suppose your data looks like this:

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

Conversely, if something is observing `currentUser`, and `currentUser.highscore` changes, it will be notified because the observed keypath is *upstream* of the one that was set.

You can also define *computed values*, which will update themselves when requested or when their *triggers* are changed, and which can be observed like regular values.

Did that make any sense? Okay, here's some examples.


Basic usage
-----------

Include Supermodel.js on your page. Then,

    var model = new Supermodel( data );

Initialising with data is optional (see *Creating new branches* below). Once your model is setup, you can set or get data like so:

    model.set( 'foo', 'bar' );
    model.get( 'foo' ); // returns 'bar'



Setting multiple keypaths in one go
-----------------------------------

The following are basically equivalent:

    model.set( 'foo', 'bar' );
    model.set( 'bar', 'baz' );

and

    model.set({
        foo: 'bar',
        bar: 'baz'
    });

This is convenient for setting your entire model in a single go, like so:

    $.ajax({
        url: 'data.json',
        success: function ( data ) {
            model.set( data );
        }
    });

I say *basically* equivalent, but they're not exactly equivalent. If you set multiple values that share an *observer* in one go, the observer will only be *notified* once. Speaking of which...



Observing (registering callbacks)
---------------------------------

You can observe `foo` with

    model.observe( 'foo', function ( newValue, oldValue ) {
        alert( newValue );
    });

    model.set( 'foo', 'bar' ); // alerts 'bar'

`model.observe` returns an array of *observers*, which can be passed to `model.unobserve` to cancel themselves:

    var observers = model.observe( 'foo', function ( newValue, oldValue ) {
        alert( newValue );
    });

    model.unobserve( observers );

    model.set( 'foo', 'bar' ); // does nothing - the callback does not trigger

(Boring technical detail: it returns an array, because under the hood `model.observe` sets up observers for the specified keypath, and each of the *upstream keypaths*. Hence `model.observe( 'foo.bar.baz[0]', callback )` will return an array of four observers - one for 'foo.bar.baz[0]', one for 'foo.bar.baz', one for 'foo.bar', and one for 'foo'. Don't worry though - the specified `callback` is shared by all the observers, it doesn't create anonymous wrapper functions or do anything else that wastes memory.)



Initializing your observers
---------------------------

Often, you may want your observers to trigger immediately, rather than waiting for the first time `model.set` gets called. You can make that happen by passing in `true` as the third argument to `model.observe`:

    model.set( 'foo', 'bar' );

    model.observe( 'foo', function ( newValue, oldValue ) {
        alert( newValue ); // alerts 'bar' immediately, because the third argument is true
    }, true );

    model.set( 'foo', 'baz' ); // alerts 'baz' as you'd expect



Single-use observers
--------------------

If you know that a value will only be set once (for example, after some data has been loaded via AJAX or whatever), it's good hygiene to remove your observers after it has happened. `model.observeOnce` gives us a convenient way to do so:

    model.observeOnce( 'foo', function ( newValue, oldValue ) {
        alert( newValue );
    });

    model.set( 'foo', 'bar' ); // alerts 'bar'
    model.set( 'foo', 'baz' ); // does nothing - the observer has already been removed



Computed values
---------------

Sometimes what you're really interested in is a second-order property of your data - a combined string, an average, or a total, or something else entirely.

Supermodel lets you create computed values using `model.compute`. Note that the value of `this` is the `model` instance:

    model = new Supermodel({
        firstname: 'Gisele',
        lastname: 'Bündchen'
    });

    model.compute( 'fullname', {
        fn: function () {
            return this.get( 'firstname' ) + ' ' + this.get( 'lastname' );
        }
    });

    alert( model.get( 'fullname' ) ); // alerts 'Gisele Bündchen'

That's all well and good, but a) the full name will be recomputed every time you call `model.get( 'fullname' )`, and b) observers of `fullname` won't be notified when it changes. We can fix that.


Computed values with triggers
-----------------------------

We know when `fullname` will change in the example above - when either `firstname` or `lastname` do. We can describe that in code - note that `fn` is now passed the current values of its triggers as arguments:

    model.compute( 'fullname', {
        triggers: [ 'firstname', 'lastname' ],
        fn: function ( firstname, lastname ) {
            return firstname + ' ' + lastname;
        }
    });

Now, we can observe `fullname` and be notified of its changed value when `firstname` and/or `lastname` change (if both are set simultaneously, the observer will only be notified once):

    model.observe( 'fullname', function ( fullname ) {
        alert( fullname );
    });

    model.set({
        firstname: 'Kate',
        lastname: 'Moss'
    }); // alerts 'Kate Moss'


Computed values and caching
---------------------------

Because we've specified that `fullname` is dependent on `firstname` and `lastname`, Supermodel does some work for us: when `firstname` or `lastname` change, it recalculates `fullname` and caches the value. Then, when you do `model.get( 'fullname' )`, it refers to the cache rather than recomputing it.

Most of the time this is exactly what you want. But there are some situations - namely, where the computed value depends on things other than its triggers. In the example below, we explicitly disable caching so that the value is updated each time we `get` it:

    model = new Supermodel({
        startTime: +new Date()
    });

    // note below that you can use 'trigger' and 'triggers' interchangeably. If there is only one trigger,
    // you don't have to wrap the name in an array - just pass in a string if you want
    model.compute( 'elapsed', {
        trigger: 'startTime',
        fn: function ( startTime ) {
            return Math.floor( ( +new Date() - startTime ) / 1000 );
        },
        cache: false
    });

    markTime = function () {
        console.log( 'Seconds since start: ', model.get( 'elapsed' ) );
    };

    setInterval( markTime, 1000 ); // will count 1, 2, 3, 4... each second

Observers of `elapsed` will only be notified when `startTime` changes, in this example - **not** when it is recomputed.

Note that computed values *without* triggers are **never** cached.


Overriding computed values
--------------------------

Ordinarily, computed values are *read only*. For example, this will throw an error:

    model = new Supermodel({
        name: {
            first: 'Gisele',
            last: 'Bündchen'
        }
    });

    model.compute( 'fullname', {
        triggers: [ 'name' ],
        fn: function ( name ) {
            return name.first + ' ' + name.last;
        }
    });

    model.set( 'fullname', 'Natalia Vodianova' ); // throws an error - 'fullname' is readonly

However in some situations you may want to override a computed value. To do so set `readonly` to `false`:

    model.compute( 'fullname', {
        triggers: [ 'name' ],
        fn: function ( name ) {
            return name.first + ' ' + name.last;
        },
        readonly: false
    });

    model.set( 'fullname', 'Natalia Vodianova' );
    alert( model.get( 'fullname' ) ); // alerts 'Natalia Vodianova'

As soon as the computed value's triggers are updated, it reverts:

    model.set( 'name', { first: 'Adriana', last: 'Lima' });
    alert( model.get( 'fullname' ) ); // alerts 'Adriana Lima'


A neat (but probably inadvisable) trick
---------------------------------------

Computed values that aren't readonly can have a bi-directional relationship. Note that in this example we are creating two computed values with a single call to `model.compute`:

    
    model.compute({
        // Compute fullname based on name...
        fullname: {
            triggers: [ 'name' ],
            fn: function ( name ) {
                return name.first + ' ' + name.last;
            },
            readonly: false
        },

        // ...and vice versa...
        name: {
            triggers: 'fullname',
            fn: function ( fullname ) {
                var split = fullname.split( ' ' );
                return {
                    first: split[0],
                    last: split[1]
                };
            },
            readonly: false
        }
    });

    // ...so you can update your data from different angles without
    // descending into the infinite loop vortex of hell
    model.set( 'fullname', 'Cindy Crawford' );
    alert( model.get( 'name.first' ) ); // alerts 'Cindy'

    model.set( 'name.last', 'Margolis' );
    alert( model.get( 'fullname' ) ); // alerts 'Cindy Margolis'

I say inadvisable because if the computed values don't mirror each other exactly you'll probably eventually end up with some unexpected and hard to debug results. But it saves me a headache every now and then.


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

MIT: https://github.com/Rich-Harris/Supermodel/blob/master/LICENSE-MIT