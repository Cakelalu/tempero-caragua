import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useMemo } from 'react'
import { useTranslation } from "react-i18next";

interface GoogleLoginButtonProps {
  clientId: string
  onSuccess: (credentialResponse: any) => void
  onError: () => void
  disabled?: boolean
}

export function GoogleLoginButton({
  clientId,
  onSuccess,
  onError,
  disabled = false,
}: GoogleLoginButtonProps) {
  const { t } = useTranslation();
  const providerProps = useMemo(() => ({ clientId }), [clientId])

  const memoizedOnSuccess = useMemo(() => onSuccess, [onSuccess])
  const memoizedOnError = useMemo(() => onError, [onError])

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        buttonText={t("googleLoginButton.continueWithGoogle", "Continuar com o Google")}
        onSuccess={memoizedOnSuccess}
        onError={memoizedOnError}
        disabled={disabled}
      />
    </GoogleOAuthProvider>
  )
}
