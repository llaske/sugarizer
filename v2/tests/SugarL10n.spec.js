const { mount } = require('@vue/test-utils');
const { SugarL10n } = require('../js/SugarL10n.js');

const axiosGetMock = jest.fn().mockResolvedValue({ data: {} });
const i18nextInitMock = jest.fn();

window.axios = {
    get: axiosGetMock,
};

window.i18next = {
    init: i18nextInitMock,
    language: 'en',
    on: jest.fn(),
    getResourceBundle: jest.fn().mockReturnValue({}),
};

describe('SugarL10n.js', () => {
    let wrapper;

    beforeEach(() => {
        jest.clearAllMocks();
        wrapper = mount(SugarL10n);
    });

    it('should load language file and initialize i18next', async () => {
        const enStrings = require('../locales/en.json');
        // Mock a successful response from axios.get
        const mockResponse = {
            data: enStrings,
        };

        // Mock the subscribeLanguageChange method
        const subscribeLanguageChangeMock = jest.spyOn(wrapper.vm, 'subscribeLanguageChange');

        await axiosGetMock.mockResolvedValue(mockResponse);

        await wrapper.vm.loadLanguageFile('en');
        await wrapper.vm.$nextTick();


        expect(axiosGetMock).toHaveBeenCalledWith('./locales/en.json');
        expect(i18nextInitMock).toHaveBeenCalledWith({
            lng: 'en',
            fallbackLng: 'en',
            debug: true,
            resources: {
                en: {
                    translation: mockResponse.data,
                }
            }
        }, expect.any(Function));

        await wrapper.vm.$nextTick();


        const initCallback = i18nextInitMock.mock.calls[0][1]; // Get the callback function from the mock

        // Manually invoke the callback and perform assertions
        initCallback();

        expect(subscribeLanguageChangeMock).toHaveBeenCalled();
        expect(wrapper.vm.l10n).toEqual(window.i18next);
        expect(wrapper.vm.dictionary).toEqual(enStrings && {});
    });

    it('should load default language file on error', async () => {
        
        await wrapper.vm.loadLanguageFile('xx'); // Assuming 'xx' language file is not available

        expect(axios.get).toHaveBeenCalledWith('./locales/xx.json');
        expect(axios.get).toHaveBeenCalledWith('./locales/en.json'); // Check if default language file is loaded
        expect(i18next.init).toHaveBeenCalledWith({
            lng: 'en',
            fallbackLng: 'en',
            debug: true,
            resources: {
                en: {
                    translation: require('../locales/en.json'),
                }
            }
        }, expect.any(Function));
    });

    it('should update code, dictionary, emit event on language change', async () => {

        const frStrings = require('../locales/fr.json');
        const mockResponse = {
            data: frStrings,
        };
        axios.get.mockResolvedValueOnce(mockResponse);

        wrapper.vm.subscribeLanguageChange('fr');

        const languageChangedCallback = window.i18next.on.mock.calls[0][1];
        languageChangedCallback('fr');

        // Wait for promises to resolve
        await wrapper.vm.$nextTick();

        // Check if the code and dictionary have been updated
        expect(wrapper.vm.code).toEqual('fr');
        expect(wrapper.vm.dictionary).toEqual(frStrings && {});

        // Check if the eventReceived flag has been set to true
        expect(wrapper.vm.eventReceived).toBe(true);
    });
});
