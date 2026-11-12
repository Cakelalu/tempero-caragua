/// <reference types="vite/client" />

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { upload } from '@imagekit/react';
import { FiHash, FiImage, FiX } from 'react-icons/fi';

const API_URL = (import.meta.env.VITE_PUBLIC_API_URL).replace(/\/$/, '');
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;

interface CreatePostProps {
  authorId: string;
  onClose: () => void;
  onPostCreated: () => Promise<void>;
  userName: string;
  profileImage: string;
}

export default function CreatePost({ authorId, onClose, onPostCreated, userName, profileImage }: CreatePostProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);      // URLs (object ou ImageKit)
  const [selectedImages, setSelectedImages] = useState<File[]>([]);      // arquivos ainda não enviados
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]); // URLs já enviadas ao ImageKit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageCaption, setImageCaption] = useState('');

  // Revoga object URLs quando o componente desmonta ou a lista muda
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    // Valida cada arquivo
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setSubmitError('Selecione apenas arquivos de imagem válidos.');
        event.target.value = '';
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setSubmitError('Cada imagem deve ter no máximo 5 MB.');
        event.target.value = '';
        return;
    }
    }

    const total = selectedImages.length + files.length;
    if (total > MAX_IMAGES) {
      setSubmitError(`Limite de ${MAX_IMAGES} imagens excedido. Você já tem ${selectedImages.length} selecionada(s).`);
      event.target.value = '';
      return;
    }

    const newFiles = [...selectedImages, ...files];
    const newPreviews = [
      ...imagePreviews,
      ...files.map((file) => URL.createObjectURL(file)),
    ];

    setSelectedImages(newFiles);
    setImagePreviews(newPreviews);
    setSubmitError('');
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const removed = prev[index];
      if (removed && removed.name) {
        // Se for um arquivo já enviado (sem object URL correspondente), apenas remove da lista
        return prev.filter((_, i) => i !== index);
      }
      return prev.filter((_, i) => i !== index);
    });

    setImagePreviews((prev) => {
      const url = prev[index];
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });

    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index));
    setSubmitError('');
  };

  const handleShare = async () => {
    if (isSubmitting) return;

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
      // Faz upload das imagens selecionadas que ainda não têm URL no ImageKit
      const imagesToUpload = selectedImages.filter(
        (_, i) => !uploadedImageUrls[i]
      );

      let imagensParaEnviar = uploadedImageUrls;

      if (imagesToUpload.length > 0) {
        setUploadProgress(0);

        // Calcula o tamanho total de todas as imagens para progresso agregado
        const totalBytes = imagesToUpload.reduce((acc, file) => acc + file.size, 0);
        let uploadedBytes = 0;

        const newUrls: string[] = [];
        for (const file of imagesToUpload) {
          // Renova o token de autenticação para cada imagem (evita token já usado)
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

          const res = await upload({
            file,
            fileName: file.name,
            publicKey,
            token: imageKitToken,
            expire,
            signature,
            useUniqueFileName: true,
            folder: '/posts',
            onProgress: (event) => {
              if (event.total > 0 && totalBytes > 0) {
                const progressoAtual = Math.round(
                  ((uploadedBytes + event.loaded) / totalBytes) * 100
                );
                setUploadProgress(Math.min(progressoAtual, 100));
              }
            },
          });
          if (!res.url) throw new Error('O ImageKit não retornou a URL de uma imagem.');
          newUrls.push(res.url);

          // Atualiza os bytes já enviados para calcular o progresso da próxima imagem
          uploadedBytes += file.size;
          setUploadProgress(Math.min(Math.round((uploadedBytes / totalBytes) * 100), 100));
        }

        // Mescla URLs novas com as já existentes, preservando a ordem por índice
        const mergedUrls = [...uploadedImageUrls];
        let newUrlIdx = 0;
        for (let i = 0; i < selectedImages.length; i++) {
          if (!mergedUrls[i]) {
            mergedUrls[i] = newUrls[newUrlIdx++];
          }
        }

        setUploadedImageUrls(mergedUrls);
        setImagePreviews(mergedUrls); // substitui object URLs pelas URLs definitivas
        setUploadProgress(100);
        imagensParaEnviar = mergedUrls;
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
          imagens: imagensParaEnviar, // array de strings de URL (pode estar vazio)
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

  // Título, conteúdo e ao menos uma imagem são obrigatórios
  const formIsValid = Boolean(title.trim() && content.trim() && imagePreviews.length > 0);

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
          <button
            aria-label="Fechar"
            className="absolute left-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            onClick={onClose}
            type="button"
          >
            <FiX size={20} />
          </button>
          <h2 className="text-base font-semibold text-gray-900" id="create-post-title">
            Nova publicação
          </h2>
          <button
            className="absolute right-4 inline-flex items-center gap-2 rounded-lg bg-pallete-dark-green-2 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pallete-green disabled:cursor-not-allowed disabled:bg-gray-300"
            disabled={!formIsValid || isSubmitting}
            onClick={handleShare}
            type="button"
          >
            {isSubmitting
              ? uploadProgress < 100
                ? `Enviando ${uploadProgress}%`
                : 'Salvando...'
              : 'Compartilhar'}
          </button>
        </header>

        <div className="flex min-h-[360px] flex-1 flex-col items-center justify-center px-6 py-10 sm:min-h-[470px]">
          {imagePreviews.length > 0 ? (
            <div className="flex w-full items-center justify-center gap-2 overflow-x-auto pb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <img
                    alt={`Prévia da imagem ${index + 1}`}
                    className="h-32 w-32 rounded-lg object-cover border border-gray-200"
                    src={preview}
                  />
                  <button
                    aria-label={`Remover imagem ${index + 1}`}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition"
                    onClick={() => removeImage(index)}
                    type="button"
                  >
                    <FiX size={12} />
                  </button>
                  <span className="absolute bottom-1 left-0 right-0 text-xs text-gray-700 text-center truncate bg-white/80 backdrop-blur">
                    Imagem {index + 1}
                  </span>
                </div>
              ))}
              {imagePreviews.length < MAX_IMAGES && (
                <span
                  className="shrink-0 flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400"
                >
                  +{MAX_IMAGES - imagePreviews.length} restante(s)
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-pallete-light-orange/30 text-pallete-dark-green-2">
                <FiImage size={42} strokeWidth={1.5} />
              </div>
              <p className="text-lg font-medium text-gray-800">Selecione pelo menos uma foto</p>
              <p className="mt-2 text-sm text-gray-500">obrigatória — até {MAX_IMAGES} imagens</p>
            </div>
          )}

          <label className="mt-6 cursor-pointer rounded-lg bg-pallete-dark-green-2 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pallete-green">
            {imagePreviews.length > 0 ? 'Adicionar mais imagens' : 'Selecionar do computador'}
            <input
              accept="image/*"
              multiple
              className="sr-only"
              disabled={imagePreviews.length >= MAX_IMAGES}
              onChange={handleImageChange}
              type="file"
            />
            {imagePreviews.length >= MAX_IMAGES && (
              <span className="text-xs text-gray-400 ml-2">Limite de {MAX_IMAGES} imagens atingido</span>
            )}
          </label>

          {imagePreviews.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {selectedImages.length} de {MAX_IMAGES} selecionada(s). Use o "X" em cada foto para remover.
            </p>
          )}
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
              Imagens <span className="text-red-600">(obrigatório, até 5)</span>
              {imagePreviews.length > 0 ? (
                <p className="text-xs text-gray-500">{imagePreviews.length} imagem(ns) selecionada(s).</p>
              ) : (
                <p className="text-xs text-red-600">Selecione pelo menos uma imagem para continuar.</p>
              )}
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700">
              Título <span className="text-red-600">(obrigatório)</span>
              <input
                className={`rounded-lg border px-3 py-2.5 text-sm font-normal text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-pallete-green focus:ring-2 focus:ring-pallete-green/15 ${!title.trim() && !isSubmitting ? 'border-red-500/50' : 'border-gray-200'}`}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Dê um título à publicação"
                type="text"
                value={title}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-700">
              Conteúdo <span className="text-red-600">(obrigatório)</span>
              <textarea
                className={`min-h-24 resize-y rounded-lg border px-3 py-2.5 text-sm font-normal text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-pallete-green focus:ring-2 focus:ring-pallete-green/15 ${!content.trim() && !isSubmitting ? 'border-red-500/50' : 'border-gray-200'}`}
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
      </section>
    </div>,
    document.body,
  );
}
