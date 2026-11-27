import { TbFaceIdError } from "react-icons/tb";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className='h-full w-full flex flex-col items-center justify-center dark:bg-[var(--color-pallete-surface-dark)]'>
      <TbFaceIdError className="text-5xl" />
      <h1 className="text-2xl font-bold dark:text-[var(--color-text-primary-dark)]" >
        {t("notFound.title", "Esta página não existe...")}
      </h1>
    </div>
  )
}
