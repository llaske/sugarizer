const { mount } = require('@vue/test-utils');
if (typeof Icon == 'undefined') Icon = require('../js/icon.js').Icon;
const { IconButton } = require('../js/iconbutton.js');

const path = require('path');
const filename = path.dirname(__filename);

// Promise to wait a delay
const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('IconButton.vue', () => {
	let wrapper;
	const id="1";
	const text="buttonText";
	const svgfile="file://"+filename+"\\../icons/owner-icon.svg" ;
	const color="5";
	const size="100";
	const x="-2";
	const y="-4";
	const disabled=false;
	beforeEach(() => {
		// HACK: Create parent in document since it's not created during mount
		let parent = document.createElement("div");
		parent.setAttribute("id", id);
		document.lastElementChild.appendChild(parent);

		// Mount object
		wrapper = mount(IconButton, {
			props: { 
				id: id,
				svgfile: svgfile,
				color: color,
				size: size,
				x: x,
				y: y,
				text: text,
				disabled: disabled
			},
		})
	});

	it('renders props when passed', () => {
		expect(wrapper.props('id')).toBe(id);
		expect(wrapper.props('svgfile')).toBe(svgfile);
		expect(wrapper.props('color')).toBe(color);
		expect(wrapper.props('size')).toBe(size);
		expect(wrapper.props('x')).toBe(x);
		expect(wrapper.props('y')).toBe(y);
		expect(wrapper.props('text')).toBe(text);
		expect(wrapper.props('disabled')).toBe(disabled);
	});

	it('renders no icon without error if no iconData is given when passed', () => {
		expect(wrapper.find('.icon').exists()).toBe(true);

		wrapper = mount(IconButton, {
			props: { 
				id: id,
				color: color,
				size: size,
				x: x,
				y: y,
				text: text,
				disabled: disabled
			},
		})

		expect(wrapper.find('icon').exists()).toBe(false);
	});

	it('updated textData when passed', async () => {
		expect(wrapper.find('.icon-button-text').text()).toBe('buttonText');

		await wrapper.setData({textData: 'buttonTextUpdated'});
		expect(wrapper.find('.icon-button-text').text()).toBe('buttonTextUpdated');
	});

	it('disabled the button when passed', async () => {
		expect(wrapper.find('.web-activity-disable').exists()).toBe(false);
		await wrapper.setData({disabledData: 'true'});
		expect(wrapper.find('.web-activity-disable').exists()).toBe(true);
	});

	it("buttonClicked is called and emit when button is clicked", () => {
		const iconButton = wrapper.find('.icon-button')
		iconButton.trigger('click')

		expect(wrapper.emitted()).toHaveProperty('buttonClick')
		expect(wrapper.emitted().buttonClick).toHaveLength(1)
	});

	it('changed icon of button when passed',async () => {
		await delay(1000);
		expect(wrapper.getComponent(Icon).exists()).toBe(true);
		let useElement= wrapper.getComponent(Icon).vm._element.firstChild;
		expect(useElement.getAttribute("href")).toBe(svgfile +'#icon');
		
		const newIcon="file://"+filename+"\\../icons/abcd.svg";
		await wrapper.setData({iconData: newIcon});
		await delay(1000);

		useElement= wrapper.getComponent(Icon).vm._element.firstChild;
		expect(useElement.getAttribute("href")).toBe(newIcon +'#icon');
	});
})