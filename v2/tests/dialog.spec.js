const { mount } = require('@vue/test-utils');
if (typeof Icon == 'undefined') Icon = require('../js/icon.js').Icon;
if (typeof SearchField == 'undefined') SearchField = require('../js/searchfield.js').SearchField;
const { Dialog } = require('../js/dialog.js');

const path = require('path');
const filename = path.dirname(__filename);

// Promise to wait a delay
const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('Dialog.vue', () => {
	let wrapper;
	const text="titleText";
	const svgfile="file://"+filename+"\\../icons/owner-icon.svg" ;

	it('renders props when passed', () => {
		wrapper = mount(Dialog, {
			props: { 
				searchField: 'true',
				okButton: 'false',
				cancelButton: 'true',
				iconData: svgfile,
				titleData: text
			},
		})
		
		expect(wrapper.props('searchField')).toBe('true');
		expect(wrapper.props('okButton')).toBe('false');
		expect(wrapper.props('cancelButton')).toBe('true');
		expect(wrapper.props('iconData')).toBe(svgfile);
		expect(wrapper.props('titleData')).toBe(text);
	});

	it('onOk emitted on clicking ok button when passed', async () => {
		wrapper = mount(Dialog, {
			props: { 
				searchField: 'true',
				okButton: 'false',
				cancelButton: 'true',
				iconData: svgfile,
				titleData: text
			},
		})
		await wrapper.setData({showDialog: true});
		expect(wrapper.find('.module-ok-button').exists()).toBe(false)

		wrapper = mount(Dialog, {
			props: { 
				searchField: 'true',
				okButton: 'true',
				cancelButton: 'true',
				iconData: svgfile,
				titleData: text
			},
		})
		await wrapper.setData({showDialog: true});
		expect(wrapper.find('.module-ok-button').exists()).toBe(true)

		await wrapper.find('.module-ok-button').trigger('click')
		expect(wrapper.emitted()).toHaveProperty('onOk')
	});

	it('onCancel emitted on clicking cancel button when passed', async () => {
		wrapper = mount(Dialog, {
			props: { 
				searchField: 'true',
				okButton: 'true',
				cancelButton: 'false',
				iconData: svgfile,
				titleData: text
			},
		})
		await wrapper.setData({showDialog: true});
		expect(wrapper.find('.module-cancel-button').exists()).toBe(false)

		wrapper = mount(Dialog, {
			props: { 
				searchField: 'true',
				okButton: 'true',
				cancelButton: 'true',
				iconData: svgfile,
				titleData: text
			},
		})
		await wrapper.setData({showDialog: true});
		expect(wrapper.find('.module-cancel-button').exists()).toBe(true)

		await wrapper.find('.module-cancel-button').trigger('click')
		expect(wrapper.emitted()).toHaveProperty('onCancel')
	});

	it('searchInput emitted on input in searchBar when passed', async () => {
		wrapper = mount(Dialog, {
			props: { 
				searchField: 'false',
				okButton: 'true',
				cancelButton: 'true',
				iconData: svgfile,
				titleData: text
			},
		})
		await wrapper.setData({showDialog: true});
		expect(wrapper.find('.settings-filter-text').exists()).toBe(false)
		
		wrapper = mount(Dialog, {
			props: { 
				searchField: 'true',
				okButton: 'true',
				cancelButton: 'true',
				iconData: svgfile,
				titleData: text
			},
		})
		await wrapper.setData({showDialog: true});
		expect(wrapper.find('.settings-filter-text').exists()).toBe(true)

		let inputElement = wrapper.find('.settings-filter-text');
		await inputElement.trigger('input-changed', 'q')
		
		expect(wrapper.emitted().searchInput).toHaveLength(1)
		let obj= wrapper.emitted().searchInput[0];
		expect(Object.values(obj[0])[0]).toEqual('q');
	});

	it('if no prop value is passed then hide particular feature', async () => {
		// searchField prop not passed
		wrapper = mount(Dialog, {
			props: { 
				okButton: 'false',
				cancelButton: 'true',
				iconData: svgfile,
				titleData: text
			},
		})
		await wrapper.setData({showDialog: true});
		expect(wrapper.find('.settings-filter-text').exists()).toBe(false)
		expect(wrapper.find('.module-cancel-button').exists()).toBe(true)
		expect(wrapper.find('.module-ok-button').exists()).toBe(false)
	});
})