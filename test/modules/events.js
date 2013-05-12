modules[ modules.length ] = {
	name: 'Events',
	tests: [
		{
			title: '.on() and .fire() work as expected',
			test: function () {
				var model = new Statesman(), message, entity;

				model.on( 'test', function ( msg, ent ) {
					message = msg;
					entity = ent;
				});

				equal( message, undefined );
				equal( entity, undefined );

				model.fire( 'test', 'hello', 'world' );

				equal( message, 'hello' );
				equal( entity, 'world' );
			}
		},

		{
			title: '.on() can add multiple listeners simultaneously',
			test: function () {
				var model = new Statesman(), message, entity;

				model.on({
					greeting: function ( msg, ent ) {
						message = msg;
						entity = ent;
					},
					farewell: function ( msg, ent ) {
						message = msg;
						entity = ent;
					}
				});

				equal( message, undefined );
				equal( entity, undefined );

				model.fire( 'greeting', 'hello', 'world' );

				equal( message, 'hello' );
				equal( entity, 'world' );

				model.fire( 'farewell', 'goodbye', 'everybody' );

				equal( message, 'goodbye' );
				equal( entity, 'everybody' );
			}
		},

		{
			title: '.on() returns an object with a cancel property which removes listeners',
			test: function () {
				var model = new Statesman(), listener, triggered = 0;

				listener = model.on( 'test', function () {
					triggered += 1;
				});

				equal( triggered, 0 );

				model.fire( 'test' );
				equal( triggered, 1 );

				listener.cancel();
				model.fire( 'test' );
				equal( triggered, 1 );
			}
		},

		{
			title: '.on() with multiple callbacks returns an object with a cancel property which removes all listeners',
			test: function () {
				var model = new Statesman(), listener, triggered1 = 0, triggered2 = 0;

				listener = model.on({
					test1: function () {
						triggered1 += 1;
					},
					test2: function () {
						triggered2 += 1;
					}
				});

				equal( triggered1, 0 );
				equal( triggered2, 0 );

				model.fire( 'test1' );
				equal( triggered1, 1 );
				equal( triggered2, 0 );

				listener.cancel();
				model.fire( 'test1' );
				equal( triggered1, 1 );
				equal( triggered2, 0 );
			}
		},

		{
			title: '.off() without arguments removes all listeners',
			test: function () {
				var model = new Statesman(), message, entity;

				model.on({
					greeting: function ( msg, ent ) {
						message = msg;
						entity = ent;
					},
					farewell: function ( msg, ent ) {
						message = msg;
						entity = ent;
					}
				});

				equal( message, undefined );
				equal( entity, undefined );

				model.off();

				model.fire( 'greeting', 'hello', 'world' );

				equal( message, undefined );
				equal( entity, undefined );

				model.fire( 'farewell', 'goodbye', 'everybody' );

				equal( message, undefined );
				equal( entity, undefined );
			}
		}
	]
};