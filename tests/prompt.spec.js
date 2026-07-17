const { mount } = require("@vue/test-utils");
if (typeof Icon == "undefined") Icon = require("../js/components/icon.js").Icon;
if (typeof IconButton == "undefined")
	IconButton = require("../js/components/iconbutton.js").IconButton;

if (typeof axios == "undefined") axios = require("./mocks/axios.js")
const { Prompt } = require("../js/components/prompt.js");

describe("Prompt.vue", () => {
	let wrapper;
	const svgfile = "./icons/owner-icon.svg";

	it("renders props when passed", () => {
		const iconProps = { svgfile, color: 512, size: 60 };
		const button1Props = {
			text: "Button 1",
			svgfile,
			color: 1024,
			title: "First Button",
			action: jest.fn(),
		};
		const button2Props = {
			text: "Button 2",
			svgfile,
			color: 1024,
			title: "Second Button",
			action: jest.fn(),
		};

		wrapper = mount(Prompt, {
			props: {
				id: "prompt1",
				iconProps,
				heading: "Heading Text",
				subText: "Subparagraph Text",
				button1Props,
				button2Props,
			},
		});
		expect(wrapper.props("id")).toBe("prompt1");
		expect(wrapper.props("iconProps")).toMatchObject(iconProps);
		expect(wrapper.props("heading")).toBe("Heading Text");
		expect(wrapper.props("subText")).toBe("Subparagraph Text");
		expect(wrapper.props("button1Props")).toMatchObject(button1Props);
		expect(wrapper.props("button2Props")).toMatchObject(button2Props);
	});

	it("show and hide methods work correctly", async () => {
		wrapper = mount(Prompt, {
			props: {
				id: "prompt1",
				iconProps: { svgfile, color: 512, size: 40 },
				heading: "Heading Text",
				subText: "Subparagraph Text",
				button1Props: {
					text: "Button 1",
					svgfile,
					color: 1024,
					title: "First Button",
					action: jest.fn(),
				},
				button2Props: {
					text: "Button 2",
					svgfile,
					color: 1024,
					title: "Second Button",
					action: jest.fn(),
				},
			},
		});

		expect(wrapper.vm.isShown).toBe(false);
		wrapper.vm.show();
		await wrapper.vm.$nextTick();
		expect(wrapper.vm.isShown).toBe(true);
		expect(wrapper.find(".prompt-container").exists()).toBe(true);

		wrapper.vm.hide();
		await wrapper.vm.$nextTick();
		expect(wrapper.vm.isShown).toBe(false);
		expect(wrapper.find(".prompt-container").exists()).toBe(false);
	});

	it("button1 action is called on button1 click", async () => {
		const button1Action = jest.fn();
		wrapper = mount(Prompt, {
			props: {
				id: "prompt1",
				iconProps: { svgfile, color: 512, size: 40 },
				heading: "Heading Text",
				subText: "Subparagraph Text",
				button1Props: {
					text: "Button 1",
					svgfile,
					color: 1024,
					title: "First Button",
					action: button1Action,
				},
				button2Props: {
					text: "Button 2",
					svgfile,
					color: 1024,
					title: "Second Button",
					action: jest.fn(),
				},
			},
		});

		wrapper.vm.show();
		await wrapper.vm.$nextTick();

		const button1 = wrapper.find(
			"#" + wrapper.props("id") + "-btn1",
		).element;
		button1.click();
		await wrapper.vm.$nextTick();

		expect(button1Action).toHaveBeenCalled();
	});

	it("button2 action is called on button2 click", async () => {
		const button2Action = jest.fn();
		wrapper = mount(Prompt, {
			props: {
				id: "prompt1",
				iconProps: { svgfile, color: 512, size: 40 },
				heading: "Heading Text",
				subText: "Subparagraph Text",
				button1Props: {
					text: "Button 1",
					svgfile,
					color: 1024,
					title: "First Button",
					action: jest.fn(),
				},
				button2Props: {
					text: "Button 2",
					svgfile,
					color: 1024,
					title: "Second Button",
					action: button2Action,
				},
			},
		});

		wrapper.vm.show();
		await wrapper.vm.$nextTick();

		const button2 = wrapper.find(
			"#" + wrapper.props("id") + "-btn2",
		).element;
		button2.click();
		await wrapper.vm.$nextTick();

		expect(button2Action).toHaveBeenCalled();
	});
});
