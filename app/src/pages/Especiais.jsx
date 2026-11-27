import { useTranslation } from "react-i18next";

export default function Especiais() {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t("especiais.title", "Especiais de Caraguá")}</p>
    </div>
  )
}
