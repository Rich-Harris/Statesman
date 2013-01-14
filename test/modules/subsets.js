modules[ modules.length ] = {
	name: 'Subsets',
	tests: [
		{
			title: 'Statesman instances can be subsetted',
			test: function () {
				var state, todoItem;

				state = new Statesman({
					foo: 'bar',
					todoItems: [
						{
							description: 'Write some more tests',
							done: false
						},
						{
							description: 'Get some fresh air',
							done: false
						},
						{
							description: 'Eat another donut',
							done: false
						}
					]
				});
			}
		}
	]
};