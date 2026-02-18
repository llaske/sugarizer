const { mount } = require('@vue/test-utils');

if (typeof axios == "undefined") axios = require("./mocks/axios.js")
const { Icon } = require('../js/components/icon.js');

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
	const color=5;
	const size=100;
	const x=-2;
	const y=-4;

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

		await wrapper.setData({colorData: '6'});
		expect(wrapper.vm._element.getAttribute("class")).toBe('xo-color6');

		await wrapper.setData({xData: 100, yData: 200});
		expect(wrapper.vm.$refs.icon.getAttribute("style")).toBe('margin: 200px 0px 0px 100px');

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
		expect(wrapper.vm.$refs.icon.getAttribute("style")).toBe('margin: -4px 0px 0px -2px');

		await wrapper.setData({colorData: '6'});
		expect(wrapper.vm._element.getAttribute("class")).toBe('xo-color6');

		await wrapper.setData({xData: 100, yData: 200});
		expect(wrapper.vm.$refs.icon.getAttribute("style")).toBe('margin: 200px 0px 0px 100px');
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
		expect(wrapper.vm._element.getAttribute("class")).toBeNull();
		expect(wrapper.vm._element.getAttribute("height")).toBe('55px');
		expect(wrapper.vm._element.getAttribute("width")).toBe('55px');
		expect(wrapper.vm.$refs.icon.getAttribute("style")).toBe('margin: 0px 0px 0px 0px;--stroke-color:#000000;--fill-color:#999999;');
	});

	it('should set color correctly', async () => {
        wrapper = mount(Icon, {
            props: { 
                id: id,
                svgfile: svgfileNew,
                color: 180,
                size: size,
                x: x,
                y: y,
                isNative: isSugarNative
            },
        })
        await delay(1000);
        expect(wrapper.vm._element.getAttribute("class")).toBe('xo-color0');
    });

    it('should set size correctly', async () => {
        wrapper = mount(Icon, {
            props: { 
                id: id,
                svgfile: svgfileNew,
                color: color,
                size: 200,
                x: x,
                y: y,
                isNative: isSugarNative
            },
        })
        await delay(1000);
        expect(wrapper.vm._element.getAttribute("width")).toBe('200px');
        expect(wrapper.vm._element.getAttribute("height")).toBe('200px');
    });

    it('should check if cursor is inside the icon component correctly', async () => {
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
        expect(wrapper.vm.isCursorInside(x + size / 2, y + size / 2)).toBe(true);
        expect(wrapper.vm.isCursorInside(x - 1, y - 1)).toBe(false);
    });

    it("waits for icon loading before resolving promise for non-native icon", async () => {
        // Mock for creatIcon method
        Icon.methods._createIcon = async () => await delay(1000);
        const createIconMock = jest.spyOn(Icon.methods, "_createIcon");

        wrapper = mount(Icon, {
            props: {
                id: id,
                svgfile: svgfileNew,
                color: color,
                size: size,
                x: x,
                y: y,
                isNative: "false",
            },
        });


        const promise = wrapper.vm.wait();
        expect(promise).toBeDefined();
        expect(promise).toBeInstanceOf(Promise);

		await promise
		expect(createIconMock).toHaveBeenCalled();
    });

    it("waits for icon loading before resolving promise for native icon", async () => {
        wrapper = mount(Icon, {
            props: {
                id: id,
                svgfile: svgfileOld,
                color: color,
                size: size,
                x: x,
                y: y,
                isNative: "true",
            },
        });

        const promise = wrapper.vm.wait();
        expect(promise).toBeDefined();
        expect(promise).toBeInstanceOf(Promise);

        await promise;

        // Check if the icon has been loaded by accessing its attributes
        expect(wrapper.vm._element.getAttribute("class")).toBe("xo-color5");
        expect(wrapper.vm._element.getAttribute("height")).toBe("100px");
        expect(wrapper.vm._element.getAttribute("width")).toBe("100px");
    });
})
