import { useI18nContext } from "../../hooks/useI18nContext";
import { LanguageCode } from "../../store/i18n/language";

export default function SettingLanguage() {
  const languageContext = useI18nContext();
  const lang = languageContext.of("Footer");

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    languageContext.switchLanguage(event.target.value as LanguageCode);
  };

  return (
    <div className="form-control no-border">
      <select
        id="select-language"
        className="select select-bordered"
        value={languageContext.language.code}
        onChange={onChange}
      >
        <option value="vi">🇻🇳 {lang("vietnamese")}</option>
        <option value="en">🇺🇸 {lang("english")}</option>
      </select>
    </div>
  );
}
