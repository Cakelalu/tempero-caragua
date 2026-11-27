import { useTranslation } from "react-i18next";

export default function Contact() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="">{t("contact.title", "Contact Page")}</h1>
      <p>{t("contact.description", "This is the contact page of our application.")}</p>
    </div>
  );
}
