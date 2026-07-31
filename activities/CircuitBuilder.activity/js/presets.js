define([], function () {
	var presets = {
		'simple-loop': {
			components: [
				{ id: 'comp_1', type: 'battery', x: 0.5, y: 0.3 },
				{ id: 'comp_2', type: 'bulb', x: 0.5, y: 0.65 }
			],
			wires: [
				{ from: 'comp_1_pos', to: 'comp_2_a' },
				{ from: 'comp_1_neg', to: 'comp_2_b' }
			],
			switchStates: {},
			nextId: 3
		},
		'switched': {
			components: [
				{ id: 'comp_1', type: 'battery', x: 0.3, y: 0.3 },
				{ id: 'comp_2', type: 'switch', x: 0.7, y: 0.3 },
				{ id: 'comp_3', type: 'bulb', x: 0.5, y: 0.65 }
			],
			wires: [
				{ from: 'comp_1_pos', to: 'comp_2_a' },
				{ from: 'comp_2_b', to: 'comp_3_a' },
				{ from: 'comp_3_b', to: 'comp_1_neg' }
			],
			switchStates: { 'comp_2': true },
			nextId: 4
		},
		'series': {
			components: [
				{ id: 'comp_1', type: 'battery', x: 0.25, y: 0.5 },
				{ id: 'comp_2', type: 'bulb', x: 0.65, y: 0.3 },
				{ id: 'comp_3', type: 'bulb', x: 0.65, y: 0.7 }
			],
			wires: [
				{ from: 'comp_1_pos', to: 'comp_2_a' },
				{ from: 'comp_2_b', to: 'comp_3_a' },
				{ from: 'comp_3_b', to: 'comp_1_neg' }
			],
			switchStates: {},
			nextId: 4
		},
		'parallel': {
			components: [
				{ id: 'comp_1', type: 'battery', x: 0.25, y: 0.5 },
				{ id: 'comp_2', type: 'bulb', x: 0.65, y: 0.3 },
				{ id: 'comp_3', type: 'bulb', x: 0.65, y: 0.7 }
			],
			wires: [
				{ from: 'comp_1_pos', to: 'comp_2_a' },
				{ from: 'comp_1_pos', to: 'comp_3_a' },
				{ from: 'comp_2_b', to: 'comp_1_neg' },
				{ from: 'comp_3_b', to: 'comp_1_neg' }
			],
			switchStates: {},
			nextId: 4
		},
		'switch-parallel': {
			components: [
				{ id: 'comp_1', type: 'battery', x: 0.15, y: 0.5 },
				{ id: 'comp_2', type: 'switch', x: 0.45, y: 0.25 },
				{ id: 'comp_3', type: 'bulb', x: 0.78, y: 0.25 },
				{ id: 'comp_4', type: 'switch', x: 0.45, y: 0.75 },
				{ id: 'comp_5', type: 'bulb', x: 0.78, y: 0.75 }
			],
			wires: [
				{ from: 'comp_1_pos', to: 'comp_2_a' },
				{ from: 'comp_2_b', to: 'comp_3_a' },
				{ from: 'comp_3_b', to: 'comp_1_neg' },
				{ from: 'comp_1_pos', to: 'comp_4_a' },
				{ from: 'comp_4_b', to: 'comp_5_a' },
				{ from: 'comp_5_b', to: 'comp_1_neg' }
			],
			switchStates: { 'comp_2': true, 'comp_4': true },
			nextId: 6
		},
		'series-chain': {
			components: [
				{ id: 'comp_1', type: 'battery', x: 0.15, y: 0.5 },
				{ id: 'comp_2', type: 'switch', x: 0.38, y: 0.25 },
				{ id: 'comp_3', type: 'bulb', x: 0.62, y: 0.25 },
				{ id: 'comp_4', type: 'bulb', x: 0.85, y: 0.5 },
				{ id: 'comp_5', type: 'bulb', x: 0.62, y: 0.75 }
			],
			wires: [
				{ from: 'comp_1_pos', to: 'comp_2_a' },
				{ from: 'comp_2_b', to: 'comp_3_a' },
				{ from: 'comp_3_b', to: 'comp_4_a' },
				{ from: 'comp_4_b', to: 'comp_5_a' },
				{ from: 'comp_5_b', to: 'comp_1_neg' }
			],
			switchStates: { 'comp_2': true },
			nextId: 6
		}
	};

	return presets;
});
