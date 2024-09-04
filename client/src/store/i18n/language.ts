const langList = ["en", "vi"] as const;
export type LanguageCode = typeof langList[number];

export type LanguageComponent = { [key: string]: string };
type LanguageValue = { [key: string]: LanguageComponent };

export interface Language {
    code: LanguageCode;
    value: LanguageValue;
}

const languages: Record<LanguageCode, Language | null> = {
    en: null,
    vi: null,
};

const toLanguageValue = async (code: LanguageCode): Promise<LanguageValue> => {
    let result: any = null;
    switch (code) {
        case "vi":
            result = await import("./vi.json");
            break;
        case "en":
            result = await import("./en.json");
            break;
    }
    return result as LanguageValue;
};

export const getLanguage = async (code: LanguageCode | null): Promise<Language> => {
    const targetCode = code === null ? "vi" : langList.includes(code) ? code : "vi";
    let result = languages[targetCode];
    if (result === null) {
        const languageValue = await toLanguageValue(targetCode);
        result = {
            code: targetCode,
            value: languageValue,
        };
        languages[targetCode] = result;
    }
    return result;
};
