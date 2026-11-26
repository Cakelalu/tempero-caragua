import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useMemo } from 'react'

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
  const providerProps = useMemo(() => ({ clientId }), [clientId])

  const memoizedOnSuccess = useMemo(() => onSuccess, [onSuccess])
  const memoizedOnError = useMemo(() => onError, [onError])

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        buttonText="Continuar com o Google"
        onSuccess={memoizedOnSuccess}
        onError={memoizedOnError}
        disabled={disabled}
      />
    </GoogleOAuthProvider>
  )
}
