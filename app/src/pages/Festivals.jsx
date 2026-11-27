import { useTranslation } from "react-i18next";

export default function Festivals() {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t("festivals.title", "Festivais")}</p>
    </div>
  )
}
