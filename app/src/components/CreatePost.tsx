import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { upload } from '@imagekit/react';
import { FiArrowLeft, FiArrowRight, FiHash, FiImage, FiX } from 'react-icons/fi';

const API_URL = (import.meta.env.VITE_PUBLIC_API_URL).replace(/\/$/, '');
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface CreatePostProps {
  authorId: string;
  onClose: () => void;
  onPostCreated: () => Promise<void>;
  userName: string;
  profileImage: string;
}

export default function CreatePost({ authorId, onClose, onPostCreated, userName, profileImage }: CreatePostProps) {
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageCaption, setImageCaption] = useState('');

  useEffect(() => {
    if (!imagePreview) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    if (!image) return;

    if (!image.type.startsWith('image/')) {
      setSubmitError('Selecione um arquivo de imagem válido.');
      event.target.value = '';
      return;
    }

    if (image.size > MAX_IMAGE_SIZE) {
      setSubmitError('A imagem deve ter no máximo 5 MB.');
      event.target.value = '';
      return;
    }

    setImagePreview(URL.createObjectURL(image));
    setSelectedImage(image);
    setUploadedImageUrl('');
    setUploadProgress(0);
    setSubmitError('');
    event.target.value = '';
  };

  const handleShare = async () => {
    if (!selectedImage || isSubmitting) return;

    if (!title.trim() || !content.trim()) {
      setSubmitError('Preencha o título e o conteúdo da publicação.');
      return;
    }

    const token = localStorage.getItem('token_login');
    if (!token) {
      setSubmitError('Entre na sua conta para criar uma publicação.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      let imageUrl = uploadedImageUrl;
      if (!imageUrl) {
        setUploadProgress(0);
        const authResponse = await fetch(`${API_URL}/user/imagekit/auth`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const authData = await authResponse.json().catch(() => null);

        if (!authResponse.ok) {
          const message = typeof authData?.error === 'string'
            ? authData.error
            : 'Não foi possível autenticar o envio da imagem.';
          throw new Error(message);
        }

        const { token: imageKitToken, expire, signature, publicKey } = authData ?? {};
        if (!imageKitToken || !expire || !signature || !publicKey) {
          throw new Error('O servidor não retornou os parâmetros de autenticação do ImageKit.');
        }

        const uploadResponse = await upload({
          file: selectedImage,
          fileName: selectedImage.name,
          publicKey,
          token: imageKitToken,
          expire,
          signature,
          useUniqueFileName: true,
          folder: '/posts',
          onProgress: (event) => {
            if (event.total > 0) {
              setUploadProgress(Math.round((event.loaded / event.total) * 100));
            }
          },
        });

        if (!uploadResponse.url) {
          throw new Error('O ImageKit não retornou a URL da imagem.');
        }

        imageUrl = uploadResponse.url;
        setUploadedImageUrl(imageUrl);
        setImagePreview(imageUrl);
        setUploadProgress(100);
      }

      const postResponse = await fetch(`${API_URL}/user/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          autorId: authorId,
          titulo: title.trim(),
          conteudo: content.trim(),
          tags: tags.trim(),
          imagens: [imageUrl],
          legendas: imageCaption.trim() ? [imageCaption.trim()] : [],
        }),
      });
      const postData = await postResponse.json().catch(() => null);

      if (!postResponse.ok) {
        const message = typeof postData?.error === 'string'
          ? postData.error
          : 'Não foi possível criar a publicação.';
        throw new Error(message);
      }

      onClose();
      await onPostCreated();
    } catch (error) {
      console.error('Erro ao criar publicação:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível criar a publicação. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="create-post-title"
        aria-modal="true"
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
      >
        <header className="relative flex h-14 shrink-0 items-center justify-center border-b border-gray-100 px-14">
          {step === 2 && (
            <button
              aria-label="Voltar para seleção de imagem"
              className="absolute left-4 rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setStep(1)}
              type="button"
            >
              <FiArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-base font-semibold text-gray-900" id="create-post-title">
            {step === 1 ? 'Criar nova publicação' : 'Nova publicação'}
          </h2>
          {step === 1 ? (
            <>
              <button
                aria-label="Fechar"
                className="absolute left-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                onClick={onClose}
                type="button"
              >
                <FiX size={20} />
              </button>
              <button
                className="absolute right-4 inline-flex items-center gap-2 rounded-lg bg-pallete-dark-green-2 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pallete-green disabled:cursor-not-allowed disabled:bg-gray-300"
                disabled={!imagePreview}
                onClick={() => setStep(2)}
                type="button"
              >
                Continuar <FiArrowRight size={16} />
              </button>
            </>
          ) : null}
          {step === 2 && (
            <button
              className="absolute right-14 text-sm font-semibold text-pallete-dark-green-2 transition hover:text-pallete-green disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedImage || !title.trim() || !content.trim() || isSubmitting}
              onClick={handleShare}
              type="button"
            >
              {isSubmitting
                ? uploadProgress < 100
                  ? `Enviando ${uploadProgress}%`
                  : 'Salvando...'
                : 'Compartilhar'}
            </button>
          )}
        </header>

        {step === 1 ? (
          <div className="flex min-h-[360px] flex-1 flex-col items-center justify-center px-6 py-10 sm:min-h-[470px]">
            {imagePreview ? (
              <div className="relative flex max-h-[58vh] w-full items-center justify-center">
                <img
                  alt="Prévia da imagem selecionada"
                  className="max-h-[58vh] max-w-full rounded-lg object-contain"
                  src={imagePreview}
                />
                <label className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-black/65 px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/80">
                  Trocar imagem
                  <input
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                    type="file"
                  />
                </label>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-pallete-light-orange/30 text-pallete-dark-green-2">
                  <FiImage size={42} strokeWidth={1.5} />
                </div>
                <p className="text-lg font-medium text-gray-800">Arraste uma foto para cá</p>
                <p className="mt-2 text-sm text-gray-500">ou escolha uma imagem do seu dispositivo</p>
                <label className="mt-6 cursor-pointer rounded-lg bg-pallete-dark-green-2 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pallete-green">
                  Selecionar do computador
                  <input
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                    type="file"
                  />
                </label>
              </div>
            )}

          </div>
        ) : (
          <div className="grid min-h-0 flex-1 md:grid-cols-[1.15fr_0.85fr]">
            <div className="flex min-h-56 items-center justify-center bg-gray-50 p-4 md:min-h-[430px]">
              <img
                alt="Prévia da publicação"
                className="max-h-[48vh] max-w-full object-contain md:max-h-[62vh]"
                src={imagePreview}
              />
            </div>
            <div className="flex min-h-0 flex-col overflow-y-auto">
              <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
                <img
                  alt=""
                  className="h-9 w-9 rounded-full bg-gray-100 object-cover"
                  src={profileImage}
                />
                <span className="text-sm font-semibold text-gray-800">{userName}</span>
              </div>
              <div className="flex flex-col gap-4 px-4 py-4">
                {submitError && (
                  <p className="text-sm text-red-600" role="alert">
                    {submitError}
                  </p>
                )}
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700">
                  Título <span className="sr-only">(titulo, obrigatório)</span>
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-pallete-green focus:ring-2 focus:ring-pallete-green/15"
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Dê um título à publicação"
                    type="text"
                    value={title}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700">
                  Conteúdo <span className="sr-only">(conteudo, obrigatório)</span>
                  <textarea
                    className="min-h-24 resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-pallete-green focus:ring-2 focus:ring-pallete-green/15"
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Conte mais sobre esta publicação..."
                    value={content}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700">
                  Legenda da imagem <span className="font-normal text-gray-400">(opcional)</span>
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-pallete-green focus:ring-2 focus:ring-pallete-green/15"
                    onChange={(event) => setImageCaption(event.target.value)}
                    placeholder="Descreva a imagem"
                    type="text"
                    value={imageCaption}
                  />
                  <span className="font-normal text-gray-400">Enviada como legenda da imagem (legendas).</span>
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700">
                  Tags <span className="font-normal text-gray-400">(opcional)</span>
                  <span className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 focus-within:border-pallete-green focus-within:ring-2 focus-within:ring-pallete-green/15">
                    <FiHash className="shrink-0 text-gray-400" size={16} />
                    <input
                      className="w-full border-0 py-2.5 text-sm font-normal text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0"
                      onChange={(event) => setTags(event.target.value)}
                      placeholder="Ex.: receita, caraguá, comida"
                      type="text"
                      value={tags}
                    />
                  </span>
                  <span className="font-normal text-gray-400">Separe cada tag com uma vírgula.</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>,
    document.body,
  );
}