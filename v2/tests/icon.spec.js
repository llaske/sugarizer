const { mount } = require('@vue/test-utils');
const fs = require('fs');
if (typeof axios == 'undefined') axios = {
    get: function(url) {
		var content;
		if(url) content = fs.readFileSync(url.replace("file://", ""), {encoding:'utf8', flag:'r'});
        return {
            then: function(callback) {
                var result = {};
                result.data = content;
                callback(result);
                return {
                    catch: function() {
						reject(error);
                    }
                }
            }
        }
    }
}
const { Icon } = require('../js/icon.js');

const path = require('path');
const filename = path.dirname(__dirname);

// Promise to wait a delay
const delay = time => new Promise(resolve => setTimeout(resolve, time));

describe('Icon.vue', () => {
	let wrapper;
	let isSugarNative="false";
	const id="1";
	const svgfileOld="file://"+filename+"/icons/old-owner.svg" ;
	const svgfileNew="file://"+filename+"/icons/owner-icon.svg" ;
	const color="5";
	const size="100";
	const x="-2";
	const y="-4";

	it('renders props when passed', async () => {
		// HACK: Create parent in document since it's not created during mount
		let parent = document.createElement("div");
		parent.setAttribute("id", id);
		document.lastElementChild.appendChild(parent);

		// Mount object
		wrapper = mount(Icon, {
			props: { 
				id: id,
				svgfile: svgfileNew,
				color: color,
				size: size,
				x: x,
				y: y,
				isNative: isSugarNative
			},
		})
		await delay(1000);
		expect(wrapper.props('id')).toBe(id);
		expect(wrapper.props('svgfile')).toBe(svgfileNew);
		expect(wrapper.props('color')).toBe(color);
		expect(wrapper.props('size')).toBe(size);
		expect(wrapper.props('x')).toBe(x);
		expect(wrapper.props('y')).toBe(y);

		expect(wrapper.vm._element.getAttribute("height")).toBe('100px');
		expect(wrapper.vm._element.getAttribute("width")).toBe('100px');
	});

	it('changes color, position and size data when passed', async () => {
		// Mount object
		wrapper = mount(Icon, {
			props: { 
				id: id,
				svgfile: svgfileNew,
				color: color,
				size: size,
				x: x,
				y: y,
				isNative: isSugarNative
			},
		})
		await delay(1000);

		expect(wrapper.vm._element.getAttribute("class")).toBe('xo-color5'); // HACK: get SVG directly in data _element 
		expect(wrapper.vm._element.getAttribute("style")).toBe('margin: -2px -4px');

		await wrapper.setData({colorData: '6'});
		expect(wrapper.vm._element.getAttribute("class")).toBe('xo-color6');

		await wrapper.setData({xData: 100, yData: 200});
		expect(wrapper.vm._element.getAttribute("style")).toBe('margin: 100px 200px');

		await wrapper.setData({sizeData: 200});
		expect(wrapper.vm._element.getAttribute("width")).toBe('200px');
		expect(wrapper.vm._element.getAttribute("height")).toBe('200px');
	});

	it('renders icon with default color, position and size data when passed', async () => {
		wrapper = mount(Icon, {
			props: { 
				id: id,
				svgfile: svgfileNew,
			},
		})

		await delay(1000);
		expect(wrapper.vm._element.getAttribute("class")).toBe('xo-color512');
		expect(wrapper.vm._element.getAttribute("height")).toBe('55px');
		expect(wrapper.vm._element.getAttribute("width")).toBe('55px');
		expect(wrapper.vm._element.getAttribute("style")).toBe('margin: 0px 0px');
	});

	it('should not render icon if svgfile data is empty when passed', async () => {
		wrapper = mount(Icon, {
			props: { 
				id: id,
				color: color,
				size: size,
				x: x,
				y: y
			},
		})

		await delay(1000);
		expect(wrapper.vm._element).toBeNull();
	});

	// Testing for sugarnative= true

	it('renders props when passed for isSugarNative is true', async () => {
		isSugarNative= "true";
		// Mount object
		wrapper = mount(Icon, {
			props: { 
				id: id,
				svgfile: svgfileOld,
				color: color,
				size: size,
				x: x,
				y: y,
				isNative: isSugarNative
			},
		})
		await delay(1000);
		expect(wrapper.props('id')).toBe(id);
		expect(wrapper.props('svgfile')).toBe(svgfileOld);
		expect(wrapper.props('color')).toBe(color);
		expect(wrapper.props('size')).toBe(size);
		expect(wrapper.props('x')).toBe(x);
		expect(wrapper.props('y')).toBe(y);

		expect(wrapper.vm._element.getAttribute("height")).toBe('100px');
		expect(wrapper.vm._element.getAttribute("width")).toBe('100px');
	});

	it('changes color and position data when passed for isSugarNative is true', async () => {
		isSugarNative= "true";
		// Mount object
		wrapper = mount(Icon, {
			props: { 
				id: id,
				svgfile: svgfileOld,
				color: color,
				size: size,
				x: x,
				y: y,
				isNative: isSugarNative
			},
		})
		await delay(1000);

		expect(wrapper.vm._element.getAttribute("class")).toBe('xo-color5'); // HACK: get SVG directly in data _element 
		expect(wrapper.vm._element.getAttribute("style")).toBe('margin: -2px -4px');

		await wrapper.setData({colorData: '6'});
		expect(wrapper.vm._element.getAttribute("class")).toBe('xo-color6');

		await wrapper.setData({xData: 100, yData: 200});
		expect(wrapper.vm._element.getAttribute("style")).toBe('margin: 100px 200px');
	});

	it('should not render icon if svgfile data is empty when passed for isSugarNative is true', async () => {
		isSugarNative= "true";
		wrapper = mount(Icon, {
			props: { 
				id: id,
				color: color,
				size: size,
				x: x,
				y: y,
				isNative: isSugarNative
			},
		})

		await delay(1000);
		expect(wrapper.vm._element).toBeNull();
	});

	it('renders icon with default color, position and size data when passed for isSugarNative is true', async () => {
		isSugarNative= "true";
		wrapper = mount(Icon, {
			props: { 
				id: id,
				svgfile: svgfileOld,
				isNative: isSugarNative
			},
		})

		await delay(1000);
		expect(wrapper.vm._element.getAttribute("class")).toBe('xo-color512');
		expect(wrapper.vm._element.getAttribute("height")).toBe('55px');
		expect(wrapper.vm._element.getAttribute("width")).toBe('55px');
		expect(wrapper.vm._element.getAttribute("style")).toBe('margin: 0px 0px');
	});
})