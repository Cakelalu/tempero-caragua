import { useTranslation } from "react-i18next";

export default function CreatePost() {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t("createPost.title", "Criar postagem")}</p>
    </div>
  )
}
