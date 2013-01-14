modules[ modules.length ] = {
	name: 'Extending',
	tests: [
		{
			title: 'Statesman can be extended with additional methods',
			test: function () {
				var MyStatesman, myStatesman, triggered;

				MyStatesman = Statesman.extend({
					doSomething: function () {
						triggered = true;
					}
				});

				myStatesman = new MyStatesman();

				myStatesman.doSomething();

				ok( triggered );
			}
		}
	]
};