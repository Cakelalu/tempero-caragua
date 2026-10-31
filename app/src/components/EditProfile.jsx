import { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import { upload } from "@imagekit/react";;

const API_URL = (
    import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500"
).replace(/\/$/, "");

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("user")) || {};
    } catch (error) {
        console.error("Não foi possível carregar os dados do usuário:", error);
        return {};
    }
}

const inputClassName =
    "w-full rounded-lg border-2 border-[#a0a0a0] bg-pallete-background px-3 py-2 text-secondary outline-none transition focus:border-pallete-blue-green focus:ring-2 focus:ring-pallete-blue-green/20 dark:border-pallete-light-green dark:bg-pallete-dark-gray dark:text-primary";

const labelClassName = "text-sm font-bold text-[#8f8f8f] dark:text-pallete-gray";

function getRequestErrorMessage(error, fallback) {
    if (error instanceof TypeError) {
        return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
    }
    return error instanceof Error && error.message ? error.message : fallback;
}

export default function EditProfile() {
    const [user] = useState(getStoredUser);
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState(user.imagemPerfil || "");
    const [avatarUrl, setAvatarUrl] = useState(user.imagemPerfil || "");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [nome, setNome] = useState(user.nome || user.name || "");
    const [apelido, setApelido] = useState(user.nomeUsuario || user.username || "");
    const [email, setEmail] = useState(user.email || "");
    const [telefone, setTelefone] = useState(user.numeroTel || "");
    const [biografia, setBiografia] = useState(user.biografia || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [deletePassword, setDeletePassword] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [feedback, setFeedback] = useState(() => (
        localStorage.getItem("token_login")
            ? null
            : { type: "error", message: "Entre na sua conta para editar o perfil." }
    ));

    useEffect(() => {
        return () => {
            if (avatar.startsWith("blob:")) {
                URL.revokeObjectURL(avatar);
            }
        };
    }, [avatar]);

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem("token_login");

        if (!token) {
            return () => {
                isMounted = false;
            };
        }

        async function loadProfile() {
            try {
                const response = await fetch(`${API_URL}/user/u/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await readResponse(response);
                if (!isMounted) return;

                if (!data.profile) {
                    throw new Error("O servidor não retornou os dados do perfil.");
                }
                const profile = data.profile;
                setNome(profile.nome || "");
                setApelido(profile.nomeUsuario || "");
                setEmail(profile.email || "");
                setTelefone(profile.numeroTel || "");
                setBiografia(profile.biografia || "");
                setAvatar(profile.imagemPerfil || "");
                setAvatarUrl(profile.imagemPerfil || "");
            } catch (error) {
                if (isMounted) {
                    setFeedback({
                        type: "error",
                        title: "Não foi possível carregar o perfil",
                        message: getRequestErrorMessage(
                            error,
                            "Não foi possível carregar seu perfil. Tente novamente.",
                        ),
                    });
                }
            }
        }

        loadProfile();
        return () => {
            isMounted = false;
        };
    }, []);

    async function readResponse(response) {
        let data;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Sua sessão expirou. Entre novamente para continuar.");
            }
            if (response.status === 413) {
                throw new Error("A imagem excede o limite permitido de 5 MB.");
            }
            if (response.status === 409) {
                throw new Error("Este e-mail já está sendo usado por outra conta.");
            }
            const apiError = data?.error;
            if (typeof apiError === "string") {
                throw new Error(apiError);
            }
            if (apiError && typeof apiError === "object") {
                const fieldErrors = apiError.fieldErrors || apiError;
                const fieldMessages = Object.values(fieldErrors).flat().filter(
                    (message) => typeof message === "string",
                );
                if (fieldMessages.length > 0) {
                    throw new Error(fieldMessages.join(" "));
                }
            }
            if (typeof data?.message === "string") {
                throw new Error(data.message);
            }
            if (response.status === 502 || response.status === 503) {
                throw new Error("O envio de imagens está indisponível no momento. Tente novamente mais tarde.");
            }
            throw new Error(
                `O servidor não conseguiu concluir a solicitação (erro ${response.status}). Tente novamente.`,
            );
        }

        if (!data) throw new Error("O servidor retornou uma resposta inválida.");
        return data;
    }

    async function handleSaveProfile(event) {
        event.preventDefault();
        const token = localStorage.getItem("token_login");
        if (!token) {
            setFeedback({
                type: "error",
                title: "Não foi possível editar o perfil",
                message: "Entre na sua conta para salvar as alterações.",
            });
            return;
        }

        setSaving(true);
        setFeedback(null);
        const profileData = {
            nome,
            nomeUsuario: apelido,
            email,
            numeroTel: telefone,
            biografia,
            imagemPerfil: avatarUrl
        };

        try {
            const response = await fetch(`${API_URL}/user/u/profile`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(profileData)
            });
            const data = await readResponse(response);
            const profile = data.profile;
            if (!profile) {
                throw new Error("O servidor não retornou o perfil atualizado.");
            }
            localStorage.setItem("user", JSON.stringify({
                ...user,
                name: profile.nome,
                username: profile.nomeUsuario,
                nome: profile.nome,
                nomeUsuario: profile.nomeUsuario,
                email: profile.email,
                numeroTel: profile.numeroTel,
                biografia: profile.biografia,
                imagemPerfil: profile.imagemPerfil,
            }));
            window.dispatchEvent(new Event("auth-change"));
            setAvatar(profile.imagemPerfil || "");
            setAvatarUrl(profile.imagemPerfil || "");
            setFeedback({ type: "success", message: "Perfil atualizado com sucesso." });
        } catch (error) {
            setFeedback({
                type: "error",
                title: "Não foi possível editar o perfil",
                message: getRequestErrorMessage(
                    error,
                    "Não foi possível salvar seu perfil. Tente novamente.",
                ),
            });
        } finally {
            setSaving(false);
        }
    }

    async function handleChangePassword() {
        if (newPassword !== confirmPassword) {
            setFeedback({ type: "error", message: "A nova senha e a confirmação devem ser iguais." });
            return;
        }
        if (newPassword.length < 8) {
            setFeedback({ type: "error", message: "A nova senha deve ter pelo menos 8 caracteres." });
            return;
        }

        const token = localStorage.getItem("token_login");
        if (!token) {
            setFeedback({ type: "error", message: "Entre na sua conta para alterar a senha." });
            return;
        }

        setChangingPassword(true);
        setFeedback(null);
        try {
            const response = await fetch(`${API_URL}/user/u/password`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await readResponse(response);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setFeedback({ type: "success", message: data.message });
        } catch (error) {
            setFeedback({
                type: "error",
                message: getRequestErrorMessage(
                    error,
                    "Não foi possível alterar sua senha. Tente novamente.",
                ),
            });
        } finally {
            setChangingPassword(false);
        }
    }

    async function handleDeleteAccount() {
        const token = localStorage.getItem("token_login");
        if (!token) {
            setFeedback({ type: "error", message: "Entre na sua conta para excluí-la." });
            return;
        }

        setDeletingAccount(true);
        setFeedback(null);
        try {
            const response = await fetch(`${API_URL}/user/u`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ currentPassword: deletePassword }),
            });
            await readResponse(response);
            localStorage.removeItem("token_login");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth-change"));
            navigate("/login");
        } catch (error) {
            setFeedback({
                type: "error",
                message: getRequestErrorMessage(
                    error,
                    "Não foi possível excluir sua conta. Tente novamente.",
                ),
            });
            setDeletingAccount(false);
        }
    }


    async function handleAvatarChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validação do formato
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setFeedback({
                type: "error",
                message: "Escolha uma imagem JPEG, PNG ou WebP."
            });
            event.target.value = "";
            return;
        }

        // Validação do tamanho
        if (file.size > 5 * 1024 * 1024) {
            setFeedback({
                type: "error",
                message: "A imagem deve ter no máximo 5 MB."
            });
            event.target.value = "";
            return;
        }

        const token = localStorage.getItem("token_login");

        if (!token) {
            setFeedback({
                type: "error",
                message: "Entre na sua conta para enviar uma imagem."
            });
            event.target.value = "";
            return;
        }

        // Pré-visualização temporária
        const previewUrl = URL.createObjectURL(file);

        setAvatar(previewUrl);
        setFeedback(null);
        setUploadingAvatar(true);
        setUploadProgress(0);

        try {
            // Solicita os parâmetros de autenticação ao backend
            const authResponse = await fetch(
                `${API_URL}/user/imagekit/auth`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const authData = await readResponse(authResponse);

            const {
                token: imageKitToken,
                expire,
                signature,
                publicKey
            } = authData;

            if (!imageKitToken || !expire || !signature || !publicKey) {
                throw new Error(
                    "O servidor não retornou os parâmetros de autenticação do ImageKit."
                );
            }

            // Envia a imagem diretamente ao ImageKit
            const uploadResponse = await upload({
                file,
                fileName: file.name,
                publicKey,
                token: imageKitToken,
                expire,
                signature,
                useUniqueFileName: true,
                folder: "/profile-images",

                onProgress: (event) => {
                    if (event.total > 0) {
                        const progress = Math.round(
                            (event.loaded / event.total) * 100
                        );

                        setUploadProgress(progress);
                    }
                }
            });

            if (!uploadResponse.url) {
                throw new Error(
                    "O ImageKit não retornou a URL da imagem."
                );
            }

            // Guarda a URL definitiva
            setAvatar(uploadResponse.url);
            setAvatarUrl(uploadResponse.url);

            setFeedback({
                type: "success",
                message: "Imagem enviada. Clique em Salvar alterações para atualizar seu perfil."
            });

        } catch (error) {
            console.error("Erro no upload da imagem:", error);

            // Restaura a imagem anterior
            setAvatar(avatarUrl);

            setFeedback({
                type: "error",
                title: "Não foi possível enviar a imagem",
                message: getRequestErrorMessage(
                    error,
                    "Ocorreu um erro durante o envio da imagem."
                )
            });

        } finally {
            setUploadingAvatar(false);
            setUploadProgress(0);
            event.target.value = "";
        }
    }


    return (
        <main className="w-full bg-pallete-background px-4 py-8 dark:bg-pallete-dark-gray sm:px-6 lg:py-5">
            <section className="mx-auto w-full max-w-[1120px] rounded-2xl bg-primary px-6 py-8 shadow-xl dark:bg-[#242520] sm:px-8 lg:px-8 lg:py-8">
                <h1 className="mb-8 text-3xl font-bold sm:text-4xl">Edite seu perfil</h1>
                {feedback && (
                    <div
                        className={`mb-6 rounded-xl border px-4 py-3 ${feedback.type === "error"
                            ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                            : "border-pallete-blue-green/30 bg-pallete-blue-green/10 text-pallete-blue-green dark:text-pallete-light-green"
                            }`}
                        role={feedback.type === "error" ? "alert" : "status"}
                    >
                        <p className="font-bold">
                            {feedback.title || (feedback.type === "error" ? "A operação não foi concluída" : "Sucesso")}
                        </p>
                        <p className="mt-1 text-sm">{feedback.message}</p>
                    </div>
                )}

                <form className="space-y-10" onSubmit={handleSaveProfile}>
                    <section
                        className="grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-[minmax(0,1fr)_230px]"
                        aria-label="Informações do perfil"
                    >
                        <div className="space-y-4">
                            <div>
                                <div className="mb-1 flex items-center justify-between gap-3">
                                    <label className={labelClassName} htmlFor="profile-name">
                                        Nome Completo
                                    </label>
                                    <span className="text-sm font-bold text-[#b8b8b8]">
                                        {nome.length}/300
                                    </span>
                                </div>
                                <input
                                    className={inputClassName}
                                    id="profile-name"
                                    name="nome"
                                    type="text"
                                    maxLength={300}
                                    value={nome}
                                    onChange={(event) => setNome(event.target.value)}
                                />
                            </div>

                            <div>
                                <div className="mb-1 flex items-center justify-between gap-3">
                                    <label className={labelClassName} htmlFor="profile-nickname">
                                        Apelido
                                    </label>
                                    <span className="text-sm font-bold text-[#b8b8b8]">
                                        {apelido.length}/30
                                    </span>
                                </div>
                                <input
                                    className={inputClassName}
                                    id="profile-nickname"
                                    name="apelido"
                                    type="text"
                                    maxLength={30}
                                    value={apelido}
                                    onChange={(event) => setApelido(event.target.value)}
                                />
                            </div>

                            <div>
                                <div className="mb-1 flex items-center justify-between gap-3">
                                    <label className={labelClassName} htmlFor="profile-email">
                                        E-mail
                                    </label>
                                    <span className="text-sm font-bold text-[#b8b8b8]">
                                        {email.length}/191
                                    </span>
                                </div>
                                <input
                                    className={inputClassName}
                                    id="profile-email"
                                    name="email"
                                    type="email"
                                    maxLength={191}
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-2 lg:pt-8">
                            <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-full bg-pallete-light-green">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt="Foto do perfil"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <CgProfile
                                        aria-hidden="true"
                                        className="h-44 w-44 text-white"
                                    />
                                )}
                            </div>
                            <label
                                className={`rounded-full bg-pallete-gray px-3 py-1 text-xs text-[#777] transition ${uploadingAvatar
                                        ? "cursor-not-allowed opacity-50"
                                        : "cursor-pointer hover:bg-pallete-light-green hover:text-white"
                                    }`}
                            >
                                {uploadingAvatar ? "Enviando imagem..." : "Escolher imagem"}

                                <input
                                    className="sr-only"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleAvatarChange}
                                    disabled={uploadingAvatar}
                                    aria-label="Escolher imagem de perfil"
                                />
                            </label>

                            {uploadingAvatar && (
                                <div className="w-full max-w-44">
                                    <div className="h-2 overflow-hidden rounded-full bg-pallete-gray">
                                        <div
                                            className="h-full rounded-full bg-pallete-blue-green transition-all"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>

                                    <p className="mt-1 text-center text-xs text-secondary dark:text-primary">
                                        Enviando: {uploadProgress}%
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 lg:col-span-2">
                            <div>
                                <label className={labelClassName} htmlFor="profile-phone">
                                    Telefone <span className="font-normal">(opcional)</span>
                                </label>
                                <input
                                    className={`${inputClassName} mt-1 max-w-xs`}
                                    id="profile-phone"
                                    name="telefone"
                                    type="tel"
                                    maxLength={30}
                                    value={telefone}
                                    onChange={(event) => setTelefone(event.target.value)}
                                />
                            </div>

                            <div>
                                <label className={labelClassName} htmlFor="profile-bio">
                                    Biografia <span className="font-normal">(opcional)</span>
                                </label>
                                <textarea
                                    className={`${inputClassName} mt-1 min-h-36 resize-y`}
                                    id="profile-bio"
                                    name="biografia"
                                    rows={5}
                                    maxLength={5000}
                                    value={biografia}
                                    onChange={(event) => setBiografia(event.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    <section aria-labelledby="password-title">
                        <h2 id="password-title" className="mb-5 text-3xl font-bold sm:text-4xl">
                            Senha
                        </h2>
                        <div className="grid max-w-4xl grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className={labelClassName} htmlFor="current-password">
                                    Senha atual
                                </label>
                                <input
                                    className={`${inputClassName} mt-1 max-w-sm`}
                                    id="current-password"
                                    name="currentPassword"
                                    type="password"
                                    autoComplete="current-password"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClassName} htmlFor="new-password">
                                    Nova senha
                                </label>
                                <input
                                    className={`${inputClassName} mt-1`}
                                    id="new-password"
                                    name="newPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClassName} htmlFor="confirm-password">
                                    Confirmar senha
                                </label>
                                <input
                                    className={`${inputClassName} mt-1`}
                                    id="confirm-password"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            className="mx-auto mt-8 block rounded-xl bg-pallete-orange px-5 py-2 text-sm text-white transition-colors hover:bg-pallete-dark-orange disabled:cursor-not-allowed disabled:opacity-60"
                            type="button"
                            onClick={handleChangePassword}
                            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                        >
                            {changingPassword ? "Alterando..." : "Alterar senha"}
                        </button>
                    </section>

                    <section aria-label="Excluir conta">
                        <p className="max-w-xl text-sm leading-relaxed text-red-500">
                            A exclusão da conta é permanente e remove seus dados de perfil. Essa ação
                            não poderá ser desfeita.
                        </p>
                        <button
                            className="mt-2 rounded-xl bg-red-500 px-5 py-2 text-xs text-white transition hover:bg-red-600"
                            type="button"
                            onClick={() => {
                                setConfirmDelete(true);
                                setFeedback(null);
                            }}
                        >
                            Excluir conta
                        </button>
                        {confirmDelete && (
                            <div className="mt-4 max-w-md space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                                <label className={labelClassName} htmlFor="delete-password">
                                    Digite sua senha para confirmar a exclusão
                                </label>
                                <input
                                    className={inputClassName}
                                    id="delete-password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={deletePassword}
                                    onChange={(event) => setDeletePassword(event.target.value)}
                                />
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
                                        type="button"
                                        onClick={handleDeleteAccount}
                                        disabled={deletingAccount || !deletePassword}
                                    >
                                        {deletingAccount ? "Excluindo..." : "Confirmar exclusão"}
                                    </button>
                                    <button
                                        className="rounded-lg border border-pallete-gray px-4 py-2 text-sm text-secondary dark:text-primary"
                                        type="button"
                                        onClick={() => {
                                            setConfirmDelete(false);
                                            setDeletePassword("");
                                        }}
                                        disabled={deletingAccount}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    <button
                        className="mx-auto block rounded-xl bg-pallete-orange px-5 py-2 text-sm text-white underline underline-offset-2 transition-colors hover:bg-pallete-dark-orange disabled:cursor-not-allowed disabled:opacity-60"
                        type="submit"
                        disabled={saving || uploadingAvatar}
                    >
                        {saving ? "Salvando..." : "Salvar alterações"}
                    </button>
                </form>
            </section>
        </main>
    );
}
