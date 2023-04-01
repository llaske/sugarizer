const { mount } = require('@vue/test-utils');
if (typeof Icon == 'undefined') Icon = require('../js/icon.js').Icon;
const { FilterBox } = require('../js/filterbox.js');

const path = require('path');
const filename = path.dirname(__filename);

describe('FilterBox.vue', () => {
	let wrapper;
	const id= 1;
	const ownerIcon="file://"+filename+"\\../icons/owner-icon.svg" ;
	const abcd="file://"+filename+"\\../icons/abcd.svg" ;
	const write="file://"+filename+"\\../icons/write.svg" ;
	const star="file://"+filename+"\\../icons/star.svg" ;
	const option1= {
        icon: { id: "2", iconData: abcd, color: "1024", size: "18" },
        name: "abcd",
        header: "Select FilterBox",
        filterBoxList: [
            { icon: { id: "3", iconData: ownerIcon, color: "1024", size: "20" }, name: "item1" },
            { icon: { id: "4", iconData: write, color: "1024", size: "18" }, name: "item2" },
            { icon: { id: "5", iconData: abcd, color: "1024", size: "18" }, name: "item3" },
            { icon: { id: "6", iconData: star, color: "1024", size: "18" }, name: "item4" },
            { icon: { id: "7", iconData: write, color: "1024", size: "18" }, name: "item5" }
        ]
    };
    var option2= {
        icon: { id: "8", iconData: "icons/star.svg", color: "1024", size: "18" },
        name: "Star",
        header: "Select Display",
        filterBoxList: [
            { name: "item1" },
            { name: "item2" },
            { name: "item3" },
            { name: "item4" },
            { name: "item5" }
        ]
    };
	beforeEach(() => {
		// HACK: Create parent in document since it's not created during mount
		let parent = document.createElement("div");
		parent.setAttribute("id", id);
		document.lastElementChild.appendChild(parent);

		// Mount object
		wrapper = mount(FilterBox, {
			props: { 
				options: option1
			},
			attrs: {
				name: "filterBox",
			}
		})
	});

	it('renders props when passed', () => {
		expect(wrapper.props('options')).toStrictEqual(option1);
	});

	it('update optionsData when passed', () => {
		expect(wrapper.find('.filterBox-text').text()).toBe('abcd');

		wrapper = mount(FilterBox, {
			props: { 
				options: option2
			},
			attrs: {
				name: "filterBox",
			}
		})
		expect(wrapper.find('.filterBox-text').text()).toBe('Star');
	});

	it('emits message, updated filterBox and close subPopup on selecting option when passed', async () => {
		expect(wrapper.find('.filterBox-text').text()).toBe('abcd');

		await wrapper.find('.filterBox').trigger('click');
		expect(wrapper.find('.filterBox-content').exists()).toBe(true);
		const items= wrapper.findAll('.filterBox-items-item')
		expect(wrapper.findAll('.filterBox-items-item').length).toBe(5)

		await items.at(1).trigger('click')
		expect(wrapper.emitted('filterSelected')).toBeTruthy()
		expect(wrapper.emitted('filterSelected')[0]).toEqual([option1.filterBoxList[1]])

		expect(wrapper.find('.filterBox-text').text()).toBe(option1.filterBoxList[1].name);
		expect(wrapper.find('.filterBox-content').exists()).toBe(false);
	});

	it('show and hide subPopup on clicking the filterBox when passed', async () => {
		expect(wrapper.find('.filterBox-content').exists()).toBe(false);

		await wrapper.find('.filterBox').trigger('click');
		expect(wrapper.find('.filterBox-content').exists()).toBe(true);

		await wrapper.find('.filterBox').trigger('click');
		expect(wrapper.find('.filterBox-content').exists()).toBe(false);
	});

	it('should render prroperly with different values of filterBoxList and header when passed', async () => {
		await wrapper.find('.filterBox').trigger('click');
		expect(wrapper.find('.filterBox-content').exists()).toBe(true);
		// filterBoxList is null
		option2= {
			icon: { id: "8", iconData: "icons/star.svg", color: "1024", size: "18" },
			name: "Star",
			header: "Select Display"
		};
		wrapper = mount(FilterBox, {
			props: { 
				options: option2
			},
			attrs: {
				name: "filterBox",
			}
		})
		await wrapper.find('.filterBox').trigger('click');
		expect(wrapper.find('.filterBox').exists()).toBe(true);
		expect(wrapper.find('.filterBox-content').exists()).toBe(false);
		// filterBoxList with length 0
		option2= {
			icon: { id: "8", iconData: "icons/star.svg", color: "1024", size: "18" },
			name: "Star",
			header: "Select Display",
			filterBoxList: []
		};
		wrapper = mount(FilterBox, {
			props: { 
				options: option2
			},
			attrs: {
				name: "filterBox",
			}
		})
		await wrapper.find('.filterBox').trigger('click');
		expect(wrapper.find('.filterBox').exists()).toBe(true);
		expect(wrapper.find('.filterBox-content').exists()).toBe(false);
		// filterBox with name only
		option2= {
			name: "Star",
			header: "Select Display",
			filterBoxList: [
				{ name: "item1" },
				{ name: "item2" },
				{ name: "item3" },
				{ name: "item4" },
				{ name: "item5" }
			]
		};
		wrapper = mount(FilterBox, {
			props: { 
				options: option2
			},
			attrs: {
				name: "filterBox",
			}
		})
		expect(wrapper.find('.filterBox').exists()).toBe(true);
		// filterBox with icon only
		option2= {
			icon: { id: "8", iconData: "icons/star.svg", color: "1024", size: "18" },
			header: "Select Display",
			filterBoxList: [
				{ name: "item1" },
				{ name: "item2" },
				{ name: "item3" },
				{ name: "item4" },
				{ name: "item5" }
			]
		};
		wrapper = mount(FilterBox, {
			props: { 
				options: option2
			},
			attrs: {
				name: "filterBox",
			}
		})
		expect(wrapper.find('.filterBox').exists()).toBe(true);
		// filterBox with no icon or name
		option2= {
			header: "Select Display",
			filterBoxList: [
				{ name: "item1" },
				{ name: "item2" },
				{ name: "item3" },
				{ name: "item4" },
				{ name: "item5" }
			]
		};
		wrapper = mount(FilterBox, {
			props: { 
				options: option2
			},
			attrs: {
				name: "filterBox",
			}
		})
		expect(wrapper.find('.filterBox').exists()).toBe(false);
	});

	// TODO: to test if there are two instances of filterBox then our (line 88 of component) should close the 
	// 		 subPopup of active instance and open new ones' subPopup
})