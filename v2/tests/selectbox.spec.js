const { mount } = require('@vue/test-utils');
if (typeof Icon == 'undefined') Icon = require('../js/icon.js').Icon;
if (typeof Popup == 'undefined') Popup = require('../js/popup.js').Popup;
const { SelectBox } = require('../js/selectbox.js');

const path = require('path');
const filename = path.dirname(__filename);

// Promise to wait a delay
const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('SelectBox.vue', () => {
	let wrapper;
	const id= 1;
	const ownerIcon="file://"+filename+"\\../icons/owner-icon.svg" ;
	const abcd="file://"+filename+"\\../icons/abcd.svg" ;
	const write="file://"+filename+"\\../icons/write.svg" ;
	const star="file://"+filename+"\\../icons/star.svg" ;
	const option1= {
		id: "7",
		icon: { id: "8", iconData: star, color: "65", size: "20" },
		name: "Star",
		itemList: [
			{ icon: { id: "9", iconData: ownerIcon, color: "65", size: "20" }, name: "item1" },
			{ icon: { id: "10", iconData: abcd, color: "65", size: "20" }, name: "item2" },
			{ icon: { id: "11", iconData: write, color: "65", size: "20" }, name: "item3" },
			{ icon: { id: "12", iconData: star, color: "65", size: "20" }, name: "item4" },
			{ icon: { id: "13", iconData: abcd, color: "65", size: "20" }, name: "item5" }
		]
	};
	const option2= {
		id: "2",
		icon: { id: "3", iconData: write, color: "65", size: "20" },
		name: "Write",
		itemList: [
			{ icon: { id: "4", iconData: ownerIcon, color: "65", size: "20" }, name: "item1" },
			{ icon: { id: "5", iconData: abcd, color: "65", size: "20" }, name: "item2" },
			{ icon: { id: "6", iconData: write, color: "65", size: "20" }, name: "item3" },
		]
	};
	beforeEach(() => {
		// HACK: Create parent in document since it's not created during mount
		let parent = document.createElement("div");
		parent.setAttribute("id", id);
		document.lastElementChild.appendChild(parent);

		// Mount object
		wrapper = mount(SelectBox, {
			props: { 
				options: option1
			},
		})
	});

	it('renders props when passed', () => {
		expect(wrapper.props('options')).toStrictEqual(option1);
	});

	it('update optionsData when passed', () => {
		expect(wrapper.find('.selectbox-text').text()).toBe('Star');

		wrapper = mount(SelectBox, {
			props: { 
				options: option2
			},
		})
		expect(wrapper.find('.selectbox-text').text()).toBe('Write');
	});

	it('emits message and updated select-Bar on optionSelected when passed', async () => {
		expect(wrapper.find('.selectbox-text').text()).toBe('Star');

		await wrapper.vm.optionisSelected("7_item2");
		expect(wrapper.find('.selectbox-text').text()).toBe('item2');

		expect(wrapper.emitted('optionSelected')).toBeTruthy();
		expect(wrapper.emitted('optionSelected')[0]).toEqual([option1.itemList[1]]);
	});

	it('show and hide popUp when passed', async () => {
		expect(wrapper.find('.selectbox-popup').exists()).toBe(false);

		var selectBar= wrapper.find('.selectbox-bar');
		await selectBar.trigger('click');
		expect(wrapper.find('.selectbox-popup').exists()).toBe(true);

		await wrapper.vm.optionisSelected("7_item2");
		expect(wrapper.find('.selectbox-popup').exists()).toBe(false);

		await selectBar.trigger('click');
		expect(wrapper.find('.selectbox-popup').exists()).toBe(true);
		await wrapper.find('.selectbox-popup').trigger('mouseleave');

		expect(wrapper.find('.selectbox-popup').exists()).toBe(false);
	});
})