const { ref, getCurrentInstance, defineComponent, nextTick } = Vue;
function install(app, {
  i18next,
  rerenderOn = ["languageChanged", "loaded", "added", "removed"],
  slotStart = "{",
  slotEnd = "}"
}) {
  const lastI18nChange = ref(/* @__PURE__ */ new Date());
  const invalidate = () => nextTick(() => {
    lastI18nChange.value = /* @__PURE__ */ new Date();
  });
  const usingI18n = () => lastI18nChange.value;
  rerenderOn.forEach((event) => {
    var _a;
    switch (event) {
      case "added":
      case "removed":
        (_a = i18next.store) == null ? void 0 : _a.on(event, invalidate);
        break;
      default:
        i18next.on(event, invalidate);
        break;
    }
  });
  app.component("i18next", TranslationComponent);
  const i18nextReady = () => i18next.isInitialized;
  app.config.globalProperties.$t = withAccessRecording(
    i18next.t.bind(i18next),
    usingI18n,
    i18nextReady
  );
  app.config.globalProperties.$i18next = new Proxy(i18next, {
    get(target, prop) {
      switch (prop) {
        case "__withAccessRecording": {
          return (f, translationsReady) => withAccessRecording(f, usingI18n, translationsReady);
        }
        case "__slotPattern": {
          return slotNamePattern(slotStart, slotEnd);
        }
        default: {
          usingI18n();
          return Reflect.get(target, prop);
        }
      }
    }
  });
}
function useTranslation(ns, options) {
  const i18next = getGlobalI18Next();
  let t;
  if (options == null ? void 0 : options.lng) {
    t = i18next.getFixedT(options.lng, ns, options == null ? void 0 : options.keyPrefix);
  } else {
    t = i18next.getFixedT(null, ns != null ? ns : null, options == null ? void 0 : options.keyPrefix);
  }
  return {
    i18next,
    t: i18next.__withAccessRecording(t, ensureTranslationsLoaded(i18next, ns))
  };
}
function ensureTranslationsLoaded(i18next, ns = []) {
  let loaded;
  return () => {
    if (loaded === void 0) {
      if (!i18next.isInitialized) {
        return false;
      } else {
        const toCheck = typeof ns === "string" ? [ns] : ns;
        const missing = toCheck.filter((n) => !i18next.hasLoadedNamespace(n));
        if (!missing.length) {
          loaded = true;
        } else {
          loaded = false;
          i18next.loadNamespaces(missing).then(() => loaded = true);
        }
      }
    }
    return loaded;
  };
}
function withAccessRecording(t, usingI18n, translationsReady) {
  return new Proxy(t, {
    apply: function(target, thisArgument, argumentsList) {
      usingI18n();
      if (!translationsReady()) {
        return "";
      }
      return Reflect.apply(target, thisArgument, argumentsList);
    }
  });
}
function getGlobalI18Next() {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error(
      "i18next-vue: No Vue instance in context. This needs to be called inside setup()."
    );
  }
  const globalProps = instance.appContext.config.globalProperties;
  if (!globalProps.$i18next) {
    throw new Error(
      "i18next-vue: Make sure to register the i18next-vue plugin using app.use(...)."
    );
  }
  return globalProps.$i18next;
}
function slotNamePattern(start, end) {
  const pattern = `${start}\\s*([a-z0-9\\-]+)\\s*${end}`;
  return new RegExp(pattern, "gi");
}
var TranslationComponent = defineComponent({
  props: {
    translation: {
      type: String,
      required: true
    }
  },
  setup(props, { slots }) {
    const slotPattern = getGlobalI18Next().__slotPattern;
    return () => {
      const translation = props.translation;
      const result = [];
      let match;
      let lastIndex = 0;
      while ((match = slotPattern.exec(translation)) !== null) {
        result.push(translation.substring(lastIndex, match.index));
        const slot = slots[match[1]];
        if (slot) {
          result.push(...slot());
        } else {
          result.push(match[0]);
        }
        lastIndex = slotPattern.lastIndex;
      }
      result.push(translation.substring(lastIndex));
      return result;
    };
  }
});

define(() => install)
