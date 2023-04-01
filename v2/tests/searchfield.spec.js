const { mount } = require('@vue/test-utils');
const { SearchField } = require('../js/searchfield.js');

describe('SearchField.vue', () => {
	let wrapper;
	const placeholder="placeHolder for testing";
	beforeEach(() => {
		// Mount object
		wrapper = mount(SearchField, {
			props: { 
				placeholder: placeholder
			},
		})
	});

	it('renders props when passed', () => {
		expect(wrapper.props('placeholder')).toBe(placeholder);
	});

	it('changes placeholder data when passed', async () => {
		const inputElement=wrapper.find('#text')
		expect(inputElement.element.getAttribute("placeholder")).toBe('placeHolder for testing');

		await wrapper.setData({placeholderData: 'placeHolder for changed'});
		expect(inputElement.element.getAttribute("placeholder")).toBe('placeHolder for changed');
	});

	it('add and remove classes on blur and focus when passed', async () => {
		const inputElement=wrapper.find('#text')
		expect(wrapper.find('.search-field-border-nofocus').exists()).toBe(true)
		expect(wrapper.find('.search-field-border-focus').exists()).toBe(false)

		await inputElement.trigger('focus')
		expect(wrapper.find('.search-field-border-nofocus').exists()).toBe(false)
		expect(wrapper.find('.search-field-border-focus').exists()).toBe(true)

		await inputElement.trigger('blur')
		expect(wrapper.find('.search-field-border-nofocus').exists()).toBe(true)
		expect(wrapper.find('.search-field-border-focus').exists()).toBe(false)
	});

	it('inputChanged emiited on changing input value when passed', async () => {
		const inputElement= wrapper.find('input');
		inputElement.element.value = "input text";
		
		await inputElement.trigger('input')
		expect(wrapper.emitted()).toHaveProperty('inputChanged')
		expect(wrapper.emitted().inputChanged).toHaveLength(1)
		expect(wrapper.emitted().inputChanged[0]).toEqual(['input text'])
	});

	it('set input value and cleared on cancel button clicked when passed', async () => {
		expect(wrapper.find('.search-field-iconcancel').exists()).toBe(false)

		const inputElement= wrapper.find('input');
		inputElement.element.value = "input text";

		await inputElement.trigger('input')
		expect(inputElement.element.value).toBe('input text');

		expect(wrapper.find('.search-field-iconcancel').exists()).toBe(true)

		await wrapper.find('.search-field-iconcancel').trigger('click')
		expect(inputElement.element.value).toBe('');

		expect(wrapper.find('.search-field-iconcancel').exists()).toBe(false)
	});
})