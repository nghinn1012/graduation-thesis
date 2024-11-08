import React, { createContext, useEffect, useRef, useState } from "react";
import {
  Language,
  LanguageCode,
  LanguageComponent,
  getLanguage,
} from "../store/i18n/language";

export type I18nReactComponent =
  | "SignUpForm"
  | "LoginForm"
  | "VerifyForm"
  | "Footer"
  | "CreatePostBox"
  | "HashtagTab"
  | "QuickPasteTab"
  | "CreatePostModal"
  | "PostInfo"
  | "PostDetails"
  | "CommentSection"
  | "MadeSection"
  | "Sidebar"
  | "HomePage"
  | "RightPanel"

interface II18nContextProviderProps {
  children: React.ReactNode;
}

export type I18Resolver = (key: string, ...params: any[]) => string;

interface II18nContext {
  language: Language;
  switchLanguage(code: LanguageCode): void;
  of(
    ...components: (I18nReactComponent | React.ComponentType<any>)[]
  ): I18Resolver;
}

export const I18nContext = createContext<II18nContext>({
  language: {
    code: "vi",
    value: {},
  },
  switchLanguage: (): void => {},
  of: () => () => "",
});

const i18nKey = "i18n.code";

export default function I18nContextProvider({
  children,
}: II18nContextProviderProps) {
  const [language, setLanguage] = useState<Language>({
    code: "vi",
    value: {},
  });
  const dictRef = useRef<{ [key: string]: string }>({});

  const switchLanguage = (code: LanguageCode | null): void => {
    getLanguage(code)
      .then((value: Language) => {
        setLanguage(value);
        dictRef.current = {};
        Object.values(value.value).forEach((component) =>
          Object.entries(component).forEach(
            ([key, val]) => (dictRef.current[key] = val)
          )
        );
        localStorage.setItem(i18nKey, value.code);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const of = (
    ...components: (I18nReactComponent | React.ComponentType<any>)[]
  ): I18Resolver => {
    const keyToLang: { [key: string]: string } = { ...dictRef.current };
    for (let i = 0; i < components.length; ++i) {
      const component = components[i];
      let componentName: string | null = null;
      if (typeof component === "string") {
        componentName = component;
      } else {
        componentName = component.name;
      }
      const componentLanguage = language.value[componentName] as
        | LanguageComponent
        | undefined;
      if (componentLanguage != null) {
        Object.entries(componentLanguage).forEach(([key, val]) => {
          keyToLang[key] = val;
        });
      }
    }
    return (key: string, ...params: any[]): string => {
      const template = keyToLang[key] as string | undefined;
      if (template == null) {
        return key;
      }

      return template.replace(/\{.*?\}/g, (match: string): string => {
        const num = match.slice(1, -1).trim();
        const index = +num;
        const replace = params[index];
        return replace != null ? replace : match;
      });
    };
  };

  useEffect(() => {
    const code = localStorage.getItem(i18nKey) as LanguageCode | null;
    switchLanguage(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <I18nContext.Provider
      value={{
        language,
        switchLanguage,
        of,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}
