const { mount } = require('@vue/test-utils');
if (typeof Icon == 'undefined') Icon = require('../js/icon.js').Icon;
const { Popup } = require('../js/popup.js');

const path = require('path');
const filename = path.dirname(__filename);

// Promise to wait a delay
const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('Popup.vue', () => {
	let wrapper;
	const id= 1;
	const svgfile1="file://"+filename+"\\../icons/star.svg" ;
	const svgfile2="file://"+filename+"\\../icons/write.svg" ;
	const item1= {
		id: "4",
		icon: { id: "6", iconData:  svgfile1, color: "65", size: "30" },
		name: "Star",
		title: "Star Activity",
		itemList: [
			{ icon: { id: "7", iconData:  svgfile1, color: "65", size: "20" }, name: "item1" },
			{ icon: { id: "8", iconData:  svgfile1, color: "65", size: "20" }, name: "item2" }
		],
		footerList: [
			{ icon: { id: "9", iconData:  svgfile1, color: "1024", size: "20" }, name: "footer1" },
		],
	};
	var item2= {
		id: "5",
		icon: { id: "11", iconData:  svgfile2, color: "95", size: "30"},
		name: "Write",
		title: "Write Activity",
		itemList: [
			{ icon: { id: "12", iconData:  svgfile2, color: "95", size: "20" }, name: "item1" },
			{ icon: { id: "13", iconData:  svgfile2, color: "95", size: "20" }, name: "item2" }
		],
		footerList: [
			{ icon: { id: "14", iconData:  svgfile2, color: "1024", size: "20" }, name: "footer1" },
		],
	}
	beforeEach(() => {
		// HACK: Create parent in document since it's not created during mount
		let parent = document.createElement("div");
		parent.setAttribute("id", id);
		document.lastElementChild.appendChild(parent);

		// Mount object
		wrapper = mount(Popup, {
			props: { 
				item: item1
			},
		})
	});

	it('renders props when passed', () => {
		expect(wrapper.props('item')).toStrictEqual(item1);
	});

	it('update itemData when passed', async () => {
		await wrapper.vm.show(100,100);
		expect(wrapper.find('.popup-name-text').text()).toBe('Star');

		wrapper = mount(Popup, {
			props: { 
				item: item2
			},
		})
		await wrapper.vm.show(100,100);
		expect(wrapper.find('.popup-name-text').text()).toBe('Write');
	});

	it('emits itemisClicked when items clicked with payload when passed', async () => {
		await wrapper.vm.show(100,100);
		const item = wrapper.find('.item-icon-title')
		item.trigger('click')
		expect(wrapper.emitted('itemisClicked')).toBeTruthy()
		expect(wrapper.emitted('itemisClicked')[0]).toEqual(["4_Star"])
		
		const itemsIcon= wrapper.findAll('.item-icon')
		expect(wrapper.findAll('.item-icon').length).toBe(3)

		itemsIcon.at(1).trigger('click')
		expect(wrapper.emitted('itemisClicked')[1]).toEqual(["4_item2"])

		itemsIcon.at(2).trigger('click')
		expect(wrapper.emitted('itemisClicked')[2]).toEqual(["4_footer1"])

		const itemsName= wrapper.findAll('.item-name')
		itemsName.at(1).trigger('click')
		expect(wrapper.emitted('itemisClicked')[3]).toEqual(["4_item2"])
	});

	it('successfully show and hide the popup when passed', async () => {
		expect(wrapper.find('.popup-name-text').exists()).toBe(false);

		await wrapper.vm.show(100,100);
		expect(wrapper.find('.popup-name-text').exists()).toBe(true);

		await wrapper.vm.hide();
		expect(wrapper.find('.popup-name-text').exists()).toBe(false);
	});

	it('should render a empty component if item prop is null when passed', async () => {
		await wrapper.vm.show(100,100);
		expect(wrapper.find('.home-activity-popup').exists()).toBe(true);

		wrapper = mount(Popup, {
			props: { 
				item: null
			},
		})
		await wrapper.vm.show(100,100);
		expect(wrapper.find('.home-activity-popup').exists()).toBe(false);
	});

	it('should render prroperly even if itemList or footerList is null when passed', async () => {
		await wrapper.vm.show(100,100);
		expect(wrapper.find('.home-activity-popup').exists()).toBe(true);
		expect(wrapper.find('#items').exists()).toBe(true);
		// itemList not present
		item2= {
			id: "5",
			icon: { id: "11", iconData:  svgfile2, color: "95", size: "30"},
			name: "Write",
			title: "Write Activity",
			footerList: [
				{ icon: { id: "14", iconData:  svgfile2, color: "1024", size: "20" }, name: "footer1" },
			],
		}
		wrapper = mount(Popup, {
			props: { 
				item: item2
			},
		})
		await wrapper.vm.show(100,100);
		expect(wrapper.find('.home-activity-popup').exists()).toBe(true);
		expect(wrapper.find('#items').exists()).toBe(false);
		expect(wrapper.find('#footer').exists()).toBe(true);
		// footerList not present
		item2= {
			id: "5",
			icon: { id: "11", iconData:  svgfile2, color: "95", size: "30"},
			name: "Write",
			title: "Write Activity",
			itemList: [
				{ icon: { id: "12", iconData:  svgfile2, color: "95", size: "20" }, name: "item1" },
				{ icon: { id: "13", iconData:  svgfile2, color: "95", size: "20" }, name: "item2" }
			]
		}
		wrapper = mount(Popup, {
			props: { 
				item: item2
			},
		})
		await wrapper.vm.show(100,100);
		expect(wrapper.find('.home-activity-popup').exists()).toBe(true);
		expect(wrapper.find('#items').exists()).toBe(true);
		expect(wrapper.find('#footer').exists()).toBe(false);
	});

	it('should render a empty component if item header data is null when passed', async () => {
		await wrapper.vm.show(100,100);
		expect(wrapper.find('.home-activity-popup').exists()).toBe(true);
		// name in the header is not present
		item2= {
			id: "5",
			icon: { id: "11", iconData:  svgfile2, color: "95", size: "30"},
			title: "Write Activity",
			itemList: [
				{ icon: { id: "12", iconData:  svgfile2, color: "95", size: "20" }, name: "item1" },
				{ icon: { id: "13", iconData:  svgfile2, color: "95", size: "20" }, name: "item2" }
			]
		}

		wrapper = mount(Popup, {
			props: { 
				item: item2
			},
		})
		await wrapper.vm.show(100,100);
		expect(wrapper.find('.home-activity-popup').exists()).toBe(false);
		// icon in the header is not present
		item2= {
			id: "5",
			name: "Write",
			title: "Write Activity",
			itemList: [
				{ icon: { id: "12", iconData:  svgfile2, color: "95", size: "20" }, name: "item1" },
				{ icon: { id: "13", iconData:  svgfile2, color: "95", size: "20" }, name: "item2" }
			],
			footerList: [
				{ icon: { id: "14", iconData:  svgfile2, color: "1024", size: "20" }, name: "footer1" },
			],
		}
		wrapper = mount(Popup, {
			props: { 
				item: item2
			},
		})
		await wrapper.vm.show(100,100);
		expect(wrapper.find('.home-activity-popup').exists()).toBe(false);
	});

	// TODO: 1. Test for isCursorInside function, this test should get the component and screen dimentions
	//		 2. Test for update hook of the dom, to correct the position of popup based on it's width and screen size
})