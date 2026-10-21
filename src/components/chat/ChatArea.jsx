import { useEffect, useRef, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  FaPaperPlane,
  FaUser,
  FaUsers,
  FaWhatsapp,
  FaCircle,
  FaChevronLeft,
  FaTimes,
  FaCheck,
  FaRegClock,
  FaSmile,
  FaPaperclip,
  FaEllipsisV,
  FaInfoCircle,
  FaComments,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaLink,
  FaMicrophone,
  FaStop,
  FaTrash,
} from 'react-icons/fa';

import { GifPicker } from 'gif-picker-react';
import { Klipy } from 'gif-picker-react/providers/klipy';

import { useChat } from '../../context/ChatContext';
import { UserContext } from '../../context/UserContext';

export default function ChatArea({ onBack }) {
  const {
    currentConversation,
    messages,
    loading,
    typingUsers,
    sendMessage,
    uploadChatMedia,
    sendTyping,
    isUserOnline,
    getConversationName,
    getConversationAvatar,
    getConversationSubtitle,
    getOtherParticipant,
  } = useChat();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadedAttachment, setUploadedAttachment] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState('');
  const [sendingAudio, setSendingAudio] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const gifPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingStartedAtRef = useRef(null);
  const autoSendRequestRef = useRef(null);

  /*
  ====================================================
  EMOJIS
  ====================================================
  */

  const emojiCategories = {
    recentes: ['😀', '😂', '😍', '😊', '👍', '❤️', '🔥', '👏'],
    pessoas: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣'],
    gestos: ['👍', '👎', '👌', '✌️', '🤞', '👏', '🙌', '🙏'],
    objetos: ['🔥', '⭐', '💡', '🎯', '🚀', '💼', '📌', '📅'],
  };

  /*
  ====================================================
  HELPERS
  ====================================================
  */

  const getInitials = (name = '') => {
    if (!name) return '?';

    const parts = name.trim().split(' ').filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const isSameUser = (userA, userB) => {
    if (!userA || !userB) return false;

    const idA = typeof userA === 'object' ? userA._id || userA.id : userA;
    const idB = typeof userB === 'object' ? userB._id || userB.id : userB;

    if (!idA || !idB) return false;

    return String(idA) === String(idB);
  };

  const formatTime = (date) => {
    if (!date) return '';

    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) return '';

      return parsedDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';

    try {
      const messageDate = new Date(date);

      if (Number.isNaN(messageDate.getTime())) return '';

      const today = new Date();

      const isToday =
        messageDate.getDate() === today.getDate() &&
        messageDate.getMonth() === today.getMonth() &&
        messageDate.getFullYear() === today.getFullYear();

      if (isToday) return 'Hoje';

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const isYesterday =
        messageDate.getDate() === yesterday.getDate() &&
        messageDate.getMonth() === yesterday.getMonth() &&
        messageDate.getFullYear() === yesterday.getFullYear();

      if (isYesterday) return 'Ontem';

      return messageDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrador',
      broker: 'Corretor',
      manager: 'Gestor',
      supervisor: 'Supervisor',
      user: 'Usuário',
    };

    return roles[role] || 'Usuário';
  };

  const isHttpUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return false;

    try {
      const url = new URL(value.trim());

      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const getProfileTarget = (
    conversation = currentConversation,
    participant = null,
  ) => {
    if (!conversation) return null;

    if (conversation.channel === 'whatsapp') {
      const lead =
        conversation.lead ||
        conversation.relatedLead ||
        conversation.contactLead;
      const leadId = lead?._id || lead?.id || conversation.leadId;
      return leadId
        ? { path: `/lead-detail/${leadId}`, label: 'Ver detalhes do lead' }
        : null;
    }

    const person = participant || getOtherParticipant?.(conversation);
    const personId = person?._id || person?.id;
    if (!personId || isSameUser(person, user)) return null;

    const role = String(person?.role || '').toLowerCase();
    if (
      ['broker', 'corretor', 'manager', 'admin', 'supervisor'].includes(role)
    ) {
      return {
        path: `/broker-details/${personId}`,
        label: 'Ver detalhes do corretor',
      };
    }

    const lead = conversation.lead || conversation.relatedLead;
    const leadId = lead?._id || lead?.id || conversation.leadId;
    return leadId
      ? { path: `/lead-detail/${leadId}`, label: 'Ver detalhes do lead' }
      : null;
  };

  const openProfile = (
    conversation = currentConversation,
    participant = null,
  ) => {
    const target = getProfileTarget(conversation, participant);
    if (target) navigate(target.path);
  };

  const renderMessageText = (text) => {
    const urlPattern = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
    const parts = String(text || '').split(urlPattern);

    return parts.map((part, index) => {
      if (!/^(https?:\/\/|www\.)/i.test(part)) {
        return <span key={`text-${index}`}>{part}</span>;
      }

      const match = part.match(/[.,!?;:)]*$/);
      const punctuation = match?.[0] || '';
      const rawUrl = punctuation ? part.slice(0, -punctuation.length) : part;
      const href = rawUrl.startsWith('www.') ? `https://${rawUrl}` : rawUrl;

      if (!rawUrl || !isHttpUrl(href)) {
        return <span key={`text-${index}`}>{part}</span>;
      }

      return (
        <span key={`url-${index}`}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="break-all font-medium text-sky-300 underline decoration-sky-400/40 underline-offset-2 transition hover:text-sky-200 hover:decoration-sky-300"
            onClick={(event) => event.stopPropagation()}
          >
            {rawUrl}
          </a>
          {punctuation}
        </span>
      );
    });
  };

  /*
  ====================================================
  CONVERSA
  ====================================================
  */

  const isWhatsApp = currentConversation?.channel === 'whatsapp';
  const isChannel = currentConversation?.type === 'broker_channel';

  const otherUser = currentConversation
    ? getOtherParticipant?.(currentConversation)
    : null;

  /*
  ====================================================
  CONTATO WHATSAPP
  ====================================================
  */

  const whatsappContact = currentConversation?.whatsappContact || null;

  const whatsappPhone =
    whatsappContact?.phone || currentConversation?.lead?.phone || '';

  const whatsappContactAvatar = whatsappContact?.avatar || null;

  /*
  ====================================================
  ONLINE
  ====================================================
  */

  const online =
    !isWhatsApp && !isChannel && otherUser
      ? Boolean(isUserOnline?.(otherUser._id))
      : false;

  /*
  ====================================================
  PARTICIPANTES
  ====================================================
  */

  const participants =
    currentConversation && Array.isArray(currentConversation.participants)
      ? currentConversation.participants.filter(Boolean)
      : [];

  const participantCount = participants.length;

  const onlineParticipants = participants.filter(
    (participant) => participant?._id && isUserOnline?.(participant._id),
  );

  const onlineParticipantCount = onlineParticipants.length;

  /*
  ====================================================
  GRAVAÇÃO DE ÁUDIO PELO MICROFONE
  ====================================================
  */

  const formatDuration = (totalSeconds = 0) => {
    const seconds = Math.max(0, Number(totalSeconds) || 0);
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const releaseMicrophone = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const clearRecordedAudio = () => {
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordedAudio(null);
    setRecordedAudioUrl('');
    setRecordingSeconds(0);
  };

  const startAudioRecording = async () => {
    setUploadError('');

    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setUploadError(
        'Seu navegador não oferece suporte à gravação de áudio. Atualize o navegador ou anexe um arquivo de áudio.',
      );
      return;
    }

    if (!currentConversation?._id) {
      setUploadError('Selecione uma conversa antes de gravar um áudio.');
      return;
    }

    if (typeof uploadChatMedia !== 'function') {
      setUploadError(
        'O upload de mídia ainda não está disponível no ChatContext.',
      );
      return;
    }

    try {
      clearRecordedAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/webm',
        'audio/ogg',
        'audio/mp4',
      ];
      const mimeType = supportedTypes.find((type) =>
        MediaRecorder.isTypeSupported?.(type),
      );
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recordedChunksRef.current = [];
      recordingStartedAtRef.current = Date.now();
      setRecordingSeconds(0);

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) recordedChunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setUploadError('Ocorreu um erro durante a gravação. Tente novamente.');
        setIsRecording(false);
        releaseMicrophone();
      };

      recorder.onstop = () => {
        const blobType = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(recordedChunksRef.current, { type: blobType });
        releaseMicrophone();
        setIsRecording(false);

        if (!blob.size) {
          setUploadError('Nenhum áudio foi gravado. Tente novamente.');
          return;
        }

        const extension = blobType.includes('ogg')
          ? 'ogg'
          : blobType.includes('mp4')
            ? 'm4a'
            : 'webm';
        const file = new File([blob], `audio-${Date.now()}.${extension}`, {
          type: blobType,
        });
        const previewUrl = URL.createObjectURL(blob);
        setRecordedAudio(file);
        setRecordedAudioUrl(previewUrl);
        setRecordingSeconds(
          Math.max(
            1,
            Math.round(
              (Date.now() - (recordingStartedAtRef.current || Date.now())) /
                1000,
            ),
          ),
        );
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setIsRecording(true);
    } catch (error) {
      releaseMicrophone();
      setIsRecording(false);
      const message =
        error?.name === 'NotAllowedError'
          ? 'Permita o acesso ao microfone nas configurações do navegador para gravar áudio.'
          : error?.name === 'NotFoundError'
            ? 'Nenhum microfone foi encontrado neste dispositivo.'
            : error?.message || 'Não foi possível iniciar a gravação.';
      setUploadError(message);
    }
  };

  const stopAudioRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  };

  const cancelAudioRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }
    releaseMicrophone();
    setIsRecording(false);
    recordedChunksRef.current = [];
    clearRecordedAudio();
  };

  const handleSendRecordedAudio = async () => {
    if (!recordedAudio || !currentConversation?._id || sendingAudio || sending)
      return;
    if (typeof uploadChatMedia !== 'function') {
      setUploadError(
        'O upload de mídia ainda não está disponível no ChatContext.',
      );
      return;
    }

    setSendingAudio(true);
    setUploadError('');
    try {
      const uploaded = await uploadChatMedia(recordedAudio);
      if (!uploaded?.url)
        throw new Error('O servidor não retornou a URL do áudio.');

      await sendMessage(currentConversation._id, {
        content: '',
        type: 'audio',
        attachment: {
          url: uploaded.url,
          name: uploaded.name || recordedAudio.name,
          size: uploaded.size ?? recordedAudio.size,
          mimeType: uploaded.mimeType || recordedAudio.type || 'audio/webm',
          format: uploaded.format || '',
        },
      });

      clearRecordedAudio();
    } catch (error) {
      console.error('Erro ao enviar áudio gravado:', error);
      setUploadError(
        error?.response?.data?.message ||
          error?.message ||
          'Não foi possível enviar o áudio.',
      );
    } finally {
      setSendingAudio(false);
    }
  };

  useEffect(() => {
    if (!isRecording) return undefined;
    const timer = window.setInterval(() => {
      if (recordingStartedAtRef.current) {
        setRecordingSeconds(
          Math.floor((Date.now() - recordingStartedAtRef.current) / 1000),
        );
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      releaseMicrophone();
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    };
  }, [recordedAudioUrl]);

  /*
  ====================================================
  DIGITAÇÃO
  ====================================================
  */

  const isTypingUser = !isWhatsApp && otherUser && typingUsers?.[otherUser._id];

  /*
  ====================================================
  FECHAR PICKERS AO CLICAR FORA
  ====================================================
  */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }

      if (
        gifPickerRef.current &&
        !gifPickerRef.current.contains(event.target)
      ) {
        setShowGifPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /*
  ====================================================
  INSERIR EMOJI
  ====================================================
  */

  const insertEmoji = (emoji) => {
    setInputMessage((prev) => `${prev}${emoji}`);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  /*
  ====================================================
  SCROLL AUTOMÁTICO
  ====================================================
  */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages]);

  /*
  ====================================================
  FOCUS
  ====================================================
  */

  useEffect(() => {
    if (!loading && currentConversation) {
      const timeout = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [currentConversation, loading]);

  /*
  ====================================================
  RESET AO TROCAR DE CONVERSA
  ====================================================
  */

  useEffect(() => {
    setInputMessage('');
    setShowEmojiPicker(false);
    setShowParticipants(false);
    setShowConversationInfo(false);
    setIsTyping(false);
    setShowGifPicker(false);
    setUploadedAttachment(null);
    setUploadError('');
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    releaseMicrophone();
    setIsRecording(false);
    setRecordedAudio(null);
    setRecordedAudioUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return '';
    });
    setRecordingSeconds(0);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [currentConversation?._id]);

  /*
  ====================================================
  CLEANUP TYPING
  ====================================================
  */

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  /*
  ====================================================
  UPLOAD E ENVIO DE ANEXOS
  ====================================================
  */

  const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

  const formatFileSize = (bytes = 0) => {
    if (!Number.isFinite(Number(bytes)) || Number(bytes) <= 0)
      return 'Tamanho desconhecido';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    // Permite selecionar o mesmo arquivo novamente depois de cancelar/falhar.
    event.target.value = '';

    if (!file) return;

    if (!currentConversation?._id) {
      setUploadError('Selecione uma conversa antes de anexar um arquivo.');
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      setUploadError('O arquivo não pode ultrapassar 50 MB.');
      return;
    }

    if (typeof uploadChatMedia !== 'function') {
      setUploadError(
        'O upload ainda não está conectado ao ChatContext. Adicione a função uploadChatMedia ao contexto de chat.',
      );
      return;
    }

    setUploadError('');
    setUploadedAttachment(null);
    setUploadingMedia(true);

    try {
      const uploaded = await uploadChatMedia(file);

      if (!uploaded?.url) {
        throw new Error(
          'O servidor não retornou uma URL válida para o arquivo.',
        );
      }

      setUploadedAttachment({
        url: uploaded.url,
        name: uploaded.name || file.name,
        originalName: file.name,
        size: uploaded.size ?? file.size,
        mimeType: uploaded.mimeType || file.type || 'application/octet-stream',
        format: uploaded.format || '',
      });
    } catch (error) {
      console.error('Erro ao fazer upload do anexo:', error);
      setUploadError(
        error?.response?.data?.message ||
          error?.message ||
          'Não foi possível enviar o arquivo para o armazenamento.',
      );
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSendAttachment = async () => {
    if (!uploadedAttachment || !currentConversation?._id || sending) return;

    const mimeType = String(uploadedAttachment.mimeType || '').toLowerCase();
    const isImage = mimeType.startsWith('image/');
    const isAudio = mimeType.startsWith('audio/');
    const isVideo = mimeType.startsWith('video/');

    try {
      setSending(true);
      setUploadError('');

      await sendMessage(currentConversation._id, {
        content: '',
        type: isImage
          ? 'image'
          : isAudio
            ? 'audio'
            : isVideo
              ? 'video'
              : 'file',
        attachment: {
          url: uploadedAttachment.url,
          name: uploadedAttachment.originalName || uploadedAttachment.name,
          mimeType: uploadedAttachment.mimeType,
          size: uploadedAttachment.size,
          format: uploadedAttachment.format,
        },
      });

      setUploadedAttachment(null);
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    } catch (error) {
      console.error('Erro ao enviar anexo na conversa:', error);
      setUploadError(
        error?.response?.data?.message ||
          error?.message ||
          'O upload foi concluído, mas não foi possível enviar a mensagem.',
      );
    } finally {
      setSending(false);
    }
  };

  /*
  ====================================================
  ENVIAR MENSAGEM DE TEXTO
  ====================================================
  */

  const handleSendMessage = async () => {
    const content = inputMessage.trim();

    if (!content || sending || !currentConversation?._id) return;

    try {
      setSending(true);

      await sendMessage(currentConversation._id, content);

      setInputMessage('');
      setShowEmojiPicker(false);
      setShowGifPicker(false);
      setIsTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (!isWhatsApp) {
        sendTyping?.(currentConversation._id, false);
      }

      textareaRef.current?.focus();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  /*
  ====================================================
  ENVIO AUTOMÁTICO DE LINK DO LEAD PARA O WHATSAPP DO CRM
  Recebe a solicitação encaminhada pela tela de detalhes do lead.
  O envio usa sendMessage do ChatContext, o mesmo fluxo do chat.
  ====================================================
  */
  useEffect(() => {
    const request = location.state?.crmWhatsAppSend;
    const messageText = String(request?.message || '').trim();
    const targetLeadId = request?.leadId;
    const requestId = request?.requestId;

    if (
      !messageText ||
      !targetLeadId ||
      !requestId ||
      !currentConversation?._id
    ) {
      return;
    }

    // A conversa pode trazer o vínculo do lead em campos diferentes,
    // dependendo de como o backend montou o contato WhatsApp.
    const leadCandidates = [
      currentConversation?.lead,
      currentConversation?.leadId,
      currentConversation?.relatedLead,
      currentConversation?.relatedLeadId,
      currentConversation?.contactLead,
      currentConversation?.whatsappContact?.lead,
      currentConversation?.whatsappContact?.leadId,
      currentConversation?.contact?.lead,
      currentConversation?.contact?.leadId,
    ];

    const conversationLeadId = leadCandidates
      .map((candidate) => {
        if (candidate === null || candidate === undefined) return null;
        if (typeof candidate === 'string' || typeof candidate === 'number') {
          return String(candidate);
        }
        if (typeof candidate === 'object') {
          const id = candidate._id ?? candidate.id ?? candidate.$oid;
          return id === null || id === undefined ? null : String(id);
        }
        return null;
      })
      .find(Boolean);

    if (
      currentConversation.channel !== 'whatsapp' ||
      !conversationLeadId ||
      String(conversationLeadId) !== String(targetLeadId)
    ) {
      return;
    }

    if (autoSendRequestRef.current === requestId) return;
    autoSendRequestRef.current = requestId;

    const sendProposalLink = async () => {
      setSending(true);
      setUploadError('');

      try {
        await sendMessage(currentConversation._id, messageText);

        setInputMessage('');
        setShowEmojiPicker(false);
        setShowGifPicker(false);
        setUploadError('');
        navigate(location.pathname, { replace: true, state: null });
      } catch (error) {
        console.error(
          'Erro ao enviar link da proposta pelo WhatsApp do CRM:',
          error,
        );
        setUploadError(
          error?.response?.data?.message ||
            error?.message ||
            'Não foi possível enviar o link pelo WhatsApp do CRM. Tente novamente pela conversa.',
        );
        autoSendRequestRef.current = null;
      } finally {
        setSending(false);
      }
    };

    sendProposalLink();
  }, [
    location.state,
    location.pathname,
    currentConversation,
    sendMessage,
    navigate,
  ]);

  /*
  ====================================================
  ENVIAR GIF COMO IMAGEM
  ====================================================
  */

  const handleGifSelected = async (gif) => {
    const gifUrl = gif?.imageUrl;

    if (!gifUrl || sending || !currentConversation?._id) {
      console.error('GIF inválido ou conversa não selecionada:', gif);
      return;
    }

    // Fecha o seletor imediatamente após selecionar o GIF.
    // Não precisa esperar o envio terminar.
    setShowGifPicker(false);
    setShowEmojiPicker(false);

    try {
      setSending(true);

      await sendMessage(currentConversation._id, {
        content: gifUrl,
        type: 'image',
        attachment: {
          url: gifUrl,
          name: 'gif.gif',
          mimeType: 'image/gif',
        },
      });

      setInputMessage('');
      setIsTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (!isWhatsApp) {
        sendTyping?.(currentConversation._id, false);
      }

      textareaRef.current?.focus();
    } catch (error) {
      console.error('Erro ao enviar GIF:', error);
    } finally {
      setSending(false);
    }
  };

  /*
  ====================================================
  DIGITAÇÃO
  ====================================================
  */

  const handleTyping = (value) => {
    setInputMessage(value);

    if (isWhatsApp) return;
    if (!currentConversation?._id) return;

    if (!isTyping) {
      setIsTyping(true);
      sendTyping?.(currentConversation._id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping?.(currentConversation._id, false);
    }, 1200);
  };

  /*
  ====================================================
  ENTER PARA ENVIAR
  ====================================================
  */

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }

    if (event.key === 'Escape') {
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    }
  };

  /*
  ====================================================
  ESTADO VAZIO
  ====================================================
  */

  if (!currentConversation) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-[#08090c]">
        <div className="flex max-w-sm flex-col items-center px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.06] to-white/[0.015] shadow-xl shadow-black/20">
            <FaUsers className="text-xl text-gray-500" />
          </div>

          <h3 className="text-sm font-semibold tracking-tight text-gray-200">
            Selecione uma conversa
          </h3>

          <p className="mt-2 text-xs leading-5 text-gray-500">
            Escolha uma conversa na lista para começar a trocar mensagens.
          </p>
        </div>
      </div>
    );
  }

  /*
  ====================================================
  DADOS DA CONVERSA
  ====================================================
  */

  const conversationName =
    getConversationName?.(currentConversation) || 'Conversa';

  const conversationAvatar =
    getConversationAvatar?.(currentConversation) || null;

  const conversationSubtitle =
    getConversationSubtitle?.(currentConversation) || '';

  const headerAvatar = isWhatsApp
    ? whatsappContactAvatar || conversationAvatar
    : conversationAvatar;

  /*
  ====================================================
  RENDER
  ====================================================
  */

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#08090c] text-gray-200">
      {/* HEADER */}

      <header className="relative z-20 flex h-[68px] shrink-0 items-center border-b border-white/[0.06] bg-[#0b0d11]/95 px-3 backdrop-blur-xl sm:px-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-gray-500 transition-all duration-200 hover:border-white/[0.06] hover:bg-white/[0.05] hover:text-gray-200 active:scale-95"
            title="Voltar"
          >
            <FaChevronLeft size={13} />
          </button>
        )}

        <div className="relative mr-3 shrink-0">
          <button
            type="button"
            onClick={() => openProfile()}
            disabled={!getProfileTarget()}
            aria-label={getProfileTarget()?.label || 'Avatar da conversa'}
            title={getProfileTarget()?.label || 'Detalhes indisponíveis'}
            className={`relative flex rounded-xl text-left outline-none transition focus-visible:ring-2 focus-visible:ring-sky-400/70 ${getProfileTarget() ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}`}
          >
            {headerAvatar ? (
              <img
                src={headerAvatar}
                alt={conversationName}
                className="h-10 w-10 rounded-xl border border-white/[0.08] object-cover shadow-lg shadow-black/20"
              />
            ) : (
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isWhatsApp ? 'border-emerald-500/20 bg-emerald-500/[0.08]' : 'border-white/[0.07] bg-gradient-to-br from-white/[0.06] to-white/[0.02]'}`}
              >
                {isWhatsApp ? (
                  <FaWhatsapp className="text-base text-emerald-400" />
                ) : isChannel ? (
                  <FaUsers className="text-sm text-gray-400" />
                ) : (
                  <FaUser className="text-sm text-gray-400" />
                )}
              </span>
            )}
          </button>
          {!isWhatsApp && !isChannel && (
            <span
              className={`pointer-events-none absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0d11] ${online ? 'bg-emerald-400' : 'bg-gray-600'}`}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold tracking-tight text-gray-100">
              {conversationName}
            </h2>

            {isWhatsApp && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-500/15 bg-emerald-500/[0.07] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-emerald-400">
                <FaWhatsapp size={8} />
                WhatsApp
              </span>
            )}

            {isChannel && !isWhatsApp && (
              <span className="shrink-0 rounded-md border border-indigo-400/15 bg-indigo-400/[0.07] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-indigo-300">
                Canal
              </span>
            )}
          </div>

          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            {isWhatsApp ? (
              <>
                <FaWhatsapp size={8} className="shrink-0 text-emerald-400/70" />
                <span className="truncate text-[10px] text-gray-500">
                  {whatsappPhone || conversationSubtitle || 'Contato WhatsApp'}
                </span>
              </>
            ) : isChannel ? (
              <>
                <FaUsers size={8} className="text-gray-500" />
                <span className="text-[10px] text-gray-500">
                  {participantCount}{' '}
                  {participantCount === 1 ? 'participante' : 'participantes'}
                </span>

                {onlineParticipantCount > 0 && (
                  <>
                    <span className="text-gray-700">·</span>
                    <span className="text-[10px] text-emerald-400/80">
                      {onlineParticipantCount} online
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <FaCircle
                  size={6}
                  className={online ? 'text-emerald-400' : 'text-gray-600'}
                />

                <span
                  className={`text-[10px] ${
                    online ? 'text-emerald-400/80' : 'text-gray-500'
                  }`}
                >
                  {online ? 'Online' : 'Offline'}
                </span>

                {otherUser?.role && (
                  <>
                    <span className="text-gray-700">·</span>
                    <span className="truncate text-[10px] text-gray-500">
                      {getRoleLabel(otherUser.role)}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="ml-2 flex shrink-0 items-center gap-1">
          {isChannel && (
            <button
              type="button"
              onClick={() => setShowParticipants(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-gray-200 active:scale-95"
              title="Ver participantes"
            >
              <FaUsers size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowConversationInfo(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-gray-200 active:scale-95"
            title={isChannel ? 'Dados do canal' : 'Dados da conversa'}
          >
            <FaInfoCircle size={14} />
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-gray-200 active:scale-95"
            title="Mais opções"
          >
            <FaEllipsisV size={13} />
          </button>
        </div>
      </header>

      {/* PAINEL DE PARTICIPANTES */}

      {(showParticipants || showConversationInfo) && (
        <div className="absolute inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Fechar participantes"
            onClick={() => {
              setShowParticipants(false);
              setShowConversationInfo(false);
            }}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
          />

          <aside className="relative ml-auto flex h-full w-[320px] max-w-[88vw] flex-col border-l border-white/[0.08] bg-[#0c0e12] shadow-2xl shadow-black/40">
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04]">
                  <FaUsers className="text-sm text-gray-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-100">
                    {showConversationInfo
                      ? 'Dados da conversa'
                      : 'Participantes'}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500">
                      {participantCount}{' '}
                      {participantCount === 1
                        ? 'participante'
                        : 'participantes'}
                    </span>

                    {onlineParticipantCount > 0 && (
                      <>
                        <span className="text-gray-700">·</span>
                        <span className="text-[10px] text-emerald-400/80">
                          {onlineParticipantCount} online
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowParticipants(false);
                  setShowConversationInfo(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-gray-200"
                title="Fechar"
              >
                <FaTimes size={13} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {showConversationInfo && (
                <div className="mb-4 space-y-2">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                      Conversa
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-gray-100">
                      {conversationName}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      {isWhatsApp
                        ? 'WhatsApp'
                        : isChannel
                          ? 'Canal interno'
                          : 'Conversa interna'}
                    </p>
                    {conversationSubtitle && (
                      <p className="mt-1 break-words text-[11px] text-gray-400">
                        {conversationSubtitle}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                      <FaCalendarAlt className="mb-2 text-xs text-sky-400" />
                      <p className="text-[9px] text-gray-500">Criada em</p>
                      <p className="mt-1 text-[11px] font-medium text-gray-200">
                        {formatDate(currentConversation?.createdAt) ||
                          'Não informado'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                      <FaComments className="mb-2 text-xs text-sky-400" />
                      <p className="text-[9px] text-gray-500">
                        Mensagens carregadas
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-gray-200">
                        {messages?.length || 0}
                      </p>
                    </div>
                  </div>
                  {isWhatsApp && whatsappPhone && (
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                      <p className="text-[9px] text-gray-500">Telefone</p>
                      <p className="mt-1 text-xs text-gray-200">
                        {whatsappPhone}
                      </p>
                    </div>
                  )}
                  {getProfileTarget() && (
                    <button
                      type="button"
                      onClick={() => openProfile()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-400/20 bg-sky-400/[0.07] px-3 py-2.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-400/[0.12]"
                    >
                      <FaExternalLinkAlt size={10} />
                      {getProfileTarget().label}
                    </button>
                  )}
                  <div className="flex items-center gap-2 px-1 pt-1 text-[10px] text-gray-500">
                    <FaLink size={10} />
                    Links das mensagens são abertos em uma nova aba.
                  </div>
                </div>
              )}
              {(!showConversationInfo || isChannel) &&
                (participants.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <FaUsers className="mb-3 text-xl text-gray-700" />
                    <p className="text-xs text-gray-500">
                      Nenhum participante encontrado.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {participants.map((participant) => {
                      const participantOnline = isUserOnline?.(
                        participant?._id,
                      );
                      const isCurrentUser = isSameUser(participant, user);
                      const participantName = participant?.name || 'Usuário';

                      return (
                        <div
                          key={participant?._id}
                          className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-white/[0.04] hover:bg-white/[0.035]"
                        >
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              disabled={
                                !getProfileTarget(
                                  currentConversation,
                                  participant,
                                )
                              }
                              onClick={() =>
                                openProfile(currentConversation, participant)
                              }
                              title={
                                getProfileTarget(
                                  currentConversation,
                                  participant,
                                )?.label || 'Detalhes indisponíveis'
                              }
                              aria-label={
                                getProfileTarget(
                                  currentConversation,
                                  participant,
                                )?.label || `Avatar de ${participantName}`
                              }
                              className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04] text-[11px] font-semibold text-gray-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 ${getProfileTarget(currentConversation, participant) ? 'cursor-pointer hover:border-sky-400/50' : 'cursor-default'}`}
                            >
                              {participant?.avatar ? (
                                <img
                                  src={participant.avatar}
                                  alt={participantName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                getInitials(participantName)
                              )}
                            </button>
                            <span
                              className={`pointer-events-none absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0c0e12] ${participantOnline ? 'bg-emerald-400' : 'bg-gray-700'}`}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span className="truncate text-xs font-medium text-gray-200">
                                {participantName}
                              </span>

                              {isCurrentUser && (
                                <span className="shrink-0 rounded-md border border-indigo-400/15 bg-indigo-400/[0.07] px-1.5 py-0.5 text-[8px] font-semibold text-indigo-300">
                                  Você
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex items-center gap-1.5">
                              <span
                                className={`text-[9px] ${
                                  participantOnline
                                    ? 'text-emerald-400/80'
                                    : 'text-gray-500'
                                }`}
                              >
                                {participantOnline ? 'Online' : 'Offline'}
                              </span>

                              {participant?.role && (
                                <>
                                  <span className="text-gray-700">·</span>
                                  <span className="truncate text-[9px] text-gray-500">
                                    {getRoleLabel(participant.role)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {participantOnline && (
                            <FaCircle
                              size={5}
                              className="shrink-0 text-emerald-400/80"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>
          </aside>
        </div>
      )}

      {/* MENSAGENS */}

      <div className="relative min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div
                className={`h-6 w-6 animate-spin rounded-full border-2 ${
                  isWhatsApp
                    ? 'border-emerald-500/20 border-t-emerald-400'
                    : 'border-gray-700 border-t-indigo-400'
                }`}
              />

              <span className="text-[10px] text-gray-500">
                Carregando mensagens...
              </span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div
              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-lg shadow-black/10 ${
                isWhatsApp
                  ? 'border-emerald-500/15 bg-emerald-500/[0.05]'
                  : 'border-white/[0.07] bg-gradient-to-br from-white/[0.05] to-white/[0.015]'
              }`}
            >
              {isWhatsApp ? (
                <FaWhatsapp className="text-lg text-emerald-400/80" />
              ) : isChannel ? (
                <FaUsers className="text-lg text-gray-500" />
              ) : (
                <FaUser className="text-lg text-gray-500" />
              )}
            </div>

            <h3 className="text-sm font-semibold text-gray-300">
              Nenhuma mensagem ainda
            </h3>

            <p className="mt-2 max-w-xs text-[11px] leading-5 text-gray-500">
              {isWhatsApp
                ? 'Envie uma mensagem pelo CRM para iniciar a conversa no WhatsApp.'
                : 'Envie uma mensagem para iniciar a conversa.'}
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-3">
            {messages.map((message, index) => {
              const messageIsWhatsAppContact =
                message?.senderType === 'whatsapp_contact';

              const isOwnMessage = isWhatsApp
                ? !messageIsWhatsAppContact && message?.senderType === 'user'
                : isSameUser(message?.sender, user);

              const previousMessage = messages[index - 1];

              const showDate =
                !previousMessage ||
                formatDate(previousMessage.createdAt) !==
                  formatDate(message.createdAt);

              const sender = message?.sender || {};

              const messageContact =
                message?.whatsappContact || whatsappContact || {};

              const senderName = messageIsWhatsAppContact
                ? messageContact?.name || conversationName || 'Contato WhatsApp'
                : sender?.name || 'Usuário';

              const senderAvatar = messageIsWhatsAppContact
                ? messageContact?.avatar || headerAvatar
                : sender?.avatar || sender?.profileImage || null;

              /*
              ====================================================
              DETECTAR IMAGENS, GIFS E ARQUIVOS
              ====================================================
              */

              const messageContent = String(message?.content || '').trim();
              const attachment = message?.attachment || {};
              const attachmentMimeType = String(
                attachment.mimeType || '',
              ).toLowerCase();
              const rawAttachmentUrl = String(attachment.url || '').trim();
              const contentIsUrl = isHttpUrl(messageContent);
              const urlForDetection =
                rawAttachmentUrl || (contentIsUrl ? messageContent : '');
              const mediaPath =
                `${urlForDetection} ${attachment.name || ''}`.toLowerCase();

              // Fallbacks por MIME, tipo salvo e extensão: protege mensagens antigas
              // em que o backend salvou o tipo genérico, mas preservou o anexo.
              const looksLikeImage =
                /\.(gif|jpe?g|png|webp|bmp|svg)(?:[?#\s].*)?$/i.test(mediaPath);
              const looksLikeAudio =
                /\.(ogg|oga|mp3|wav|m4a|aac|opus|webm)(?:[?#\s].*)?$/i.test(
                  mediaPath,
                );
              const looksLikeVideo =
                /\.(mp4|webm|mov|m4v|avi|mkv|mpeg|mpg)(?:[?#\s].*)?$/i.test(
                  mediaPath,
                );

              const attachmentUrl =
                rawAttachmentUrl ||
                (contentIsUrl &&
                (message?.type === 'image' ||
                  message?.type === 'audio' ||
                  message?.type === 'video' ||
                  message?.type === 'file' ||
                  looksLikeImage ||
                  looksLikeAudio ||
                  looksLikeVideo ||
                  attachmentMimeType.startsWith('application/'))
                  ? messageContent
                  : '');

              const isImageMessage =
                message?.type === 'image' ||
                attachmentMimeType.startsWith('image/') ||
                looksLikeImage;
              const isAudioMessage =
                message?.type === 'audio' ||
                attachmentMimeType.startsWith('audio/') ||
                looksLikeAudio;
              const isVideoMessage =
                message?.type === 'video' ||
                attachmentMimeType.startsWith('video/') ||
                looksLikeVideo;
              const isFileMessage =
                message?.type === 'file' ||
                Boolean(
                  attachmentUrl &&
                  !isImageMessage &&
                  !isAudioMessage &&
                  !isVideoMessage &&
                  (attachment.name ||
                    attachmentMimeType.startsWith('application/') ||
                    attachmentMimeType.startsWith('text/')),
                );

              const placeholderContents = [
                'Imagem',
                'Imagem recebida',
                'Arquivo',
                'Arquivo recebido',
                'Áudio',
                'Áudio recebido',
                'Audio',
                'Audio recebido',
                'Vídeo',
                'Vídeo recebido',
                'Video',
                'Video recebido',
                'Mensagem recebida',
                'GIF',
                'GIF enviado',
                attachment.name,
              ]
                .filter(Boolean)
                .map((value) => String(value).trim());

              const shouldShowText =
                Boolean(messageContent) &&
                messageContent !== attachmentUrl &&
                !placeholderContents.includes(messageContent) &&
                !(
                  contentIsUrl &&
                  attachmentUrl === messageContent &&
                  (isImageMessage ||
                    isAudioMessage ||
                    isVideoMessage ||
                    isFileMessage)
                );

              return (
                <div key={message?._id || message?.externalMessageId || index}>
                  {/* DATA */}

                  {showDate && (
                    <div className="my-5 flex items-center justify-center">
                      <span
                        className={`rounded-full border px-3 py-1 text-[9px] font-medium shadow-sm ${
                          isWhatsApp
                            ? 'border-emerald-500/[0.12] bg-emerald-500/[0.035] text-gray-500'
                            : 'border-white/[0.06] bg-white/[0.025] text-gray-500'
                        }`}
                      >
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex gap-2.5 ${
                      isOwnMessage ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* AVATAR DA MENSAGEM RECEBIDA */}

                    {!isOwnMessage && (
                      <div className="mt-5 shrink-0">
                        {senderAvatar ? (
                          <img
                            src={senderAvatar}
                            alt={senderName}
                            className="h-8 w-8 rounded-lg border border-white/[0.06] object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[9px] font-semibold ${
                              messageIsWhatsAppContact
                                ? 'border-emerald-500/15 bg-emerald-500/[0.05] text-emerald-400'
                                : 'border-white/[0.06] bg-white/[0.035] text-gray-400'
                            }`}
                          >
                            {messageIsWhatsAppContact ? (
                              <FaWhatsapp size={12} />
                            ) : (
                              getInitials(senderName)
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CORPO DA MENSAGEM */}

                    <div
                      className={`flex max-w-[88%] flex-col sm:max-w-[72%] ${
                        isOwnMessage ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* NOME DO REMETENTE */}

                      {!isOwnMessage && (
                        <div className="mb-1.5 ml-1 flex max-w-full items-center gap-1.5">
                          <span
                            className={`max-w-[220px] truncate text-[10px] font-medium ${
                              messageIsWhatsAppContact
                                ? 'text-emerald-400/80'
                                : 'text-gray-400'
                            }`}
                          >
                            {senderName}
                          </span>

                          {messageIsWhatsAppContact && (
                            <FaWhatsapp
                              size={8}
                              className="shrink-0 text-emerald-400/60"
                            />
                          )}

                          {!messageIsWhatsAppContact && sender?.role && (
                            <span className="text-[8px] text-gray-600">
                              {getRoleLabel(sender.role)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* BALÃO */}

                      <div
                        className={`relative max-w-full rounded-2xl border px-3.5 py-2.5 shadow-sm ${
                          isOwnMessage
                            ? isWhatsApp
                              ? 'rounded-br-md border-emerald-400/[0.12] bg-gradient-to-br from-emerald-500/[0.14] to-emerald-500/[0.07] text-gray-100'
                              : 'rounded-br-md border-indigo-400/[0.14] bg-gradient-to-br from-indigo-500/[0.15] to-indigo-500/[0.07] text-gray-100'
                            : isWhatsApp
                              ? 'rounded-bl-md border-emerald-500/[0.08] bg-[#101410] text-gray-300'
                              : 'rounded-bl-md border-white/[0.06] bg-[#111318] text-gray-300'
                        }`}
                      >
                        {/* RESPOSTA */}

                        {message.replyTo && (
                          <div
                            className={`mb-2 rounded-lg border-l-2 px-2.5 py-1.5 ${
                              isWhatsApp
                                ? 'border-emerald-400/50 bg-black/15'
                                : 'border-indigo-400/50 bg-black/15'
                            }`}
                          >
                            <p
                              className={`mb-1 text-[8px] font-semibold uppercase tracking-wider ${
                                isWhatsApp
                                  ? 'text-emerald-300/80'
                                  : 'text-indigo-300/80'
                              }`}
                            >
                              Resposta
                            </p>

                            <p className="line-clamp-2 text-[10px] leading-4 text-gray-400">
                              {message.replyTo.content}
                            </p>
                          </div>
                        )}

                        {/* IMAGEM OU GIF */}

                        {isImageMessage && attachmentUrl && (
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-1 block max-w-full overflow-hidden rounded-xl"
                            title="Abrir imagem em tamanho original"
                          >
                            <img
                              src={attachmentUrl}
                              alt={
                                attachmentMimeType === 'image/gif'
                                  ? 'GIF enviado'
                                  : 'Imagem enviada'
                              }
                              loading="lazy"
                              className="block h-auto max-h-[320px] max-w-full rounded-xl object-contain transition-opacity duration-200 hover:opacity-90"
                              onError={(event) => {
                                event.currentTarget.style.display = 'none';
                              }}
                            />
                          </a>
                        )}

                        {/* ÁUDIO */}

                        {(isAudioMessage || isVideoMessage) &&
                          attachmentUrl && (
                            <div className="mb-2 min-w-0 max-w-full">
                              {isAudioMessage ? (
                                <audio
                                  src={attachmentUrl}
                                  controls
                                  preload="metadata"
                                  className="max-w-full"
                                  aria-label="Reproduzir áudio"
                                />
                              ) : (
                                <video
                                  src={attachmentUrl}
                                  controls
                                  preload="metadata"
                                  className="max-h-[320px] max-w-full rounded-xl"
                                  aria-label="Reproduzir vídeo"
                                />
                              )}
                            </div>
                          )}

                        {/* ARQUIVO */}

                        {isFileMessage && attachmentUrl && (
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-1 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/15 px-3 py-2.5 text-xs text-indigo-300 transition hover:border-indigo-400/20 hover:bg-black/25"
                          >
                            <FaPaperclip size={12} />

                            <span className="max-w-[220px] break-all">
                              {message?.attachment?.name || 'Abrir arquivo'}
                            </span>
                          </a>
                        )}

                        {/* TEXTO */}

                        {shouldShowText && (
                          <p className="whitespace-pre-wrap break-words text-xs leading-5">
                            {renderMessageText(messageContent)}
                          </p>
                        )}

                        {/* HORÁRIO E STATUS */}

                        <div
                          className={`mt-1.5 flex items-center gap-1.5 ${
                            isOwnMessage ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span className="text-[8px] tabular-nums text-gray-500">
                            {formatTime(message.createdAt)}
                          </span>

                          {isOwnMessage && (
                            <>
                              {message.status === 'read' ? (
                                <FaCheck
                                  size={8}
                                  className={
                                    isWhatsApp
                                      ? 'text-emerald-400'
                                      : 'text-indigo-400'
                                  }
                                />
                              ) : message.status === 'delivered' ? (
                                <span className="flex items-center">
                                  <FaCheck
                                    size={8}
                                    className={
                                      isWhatsApp
                                        ? 'text-emerald-400/80'
                                        : 'text-indigo-400/80'
                                    }
                                  />
                                  <FaCheck size={8} className="-ml-1.5" />
                                </span>
                              ) : message.status === 'sent' ? (
                                <FaCheck size={8} className="text-gray-500" />
                              ) : (
                                <FaRegClock
                                  size={8}
                                  className="text-gray-500"
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* DIGITANDO — SOMENTE CHAT INTERNO */}

            {isTypingUser && !isWhatsApp && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.035]">
                  <FaUser size={10} className="text-gray-500" />
                </div>

                <div className="rounded-2xl rounded-bl-md border border-white/[0.06] bg-[#111318] px-3.5 py-2.5">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* FOOTER / INPUT */}

      <div className="relative z-30 shrink-0 border-t border-white/[0.06] bg-[#0b0d11] px-3 py-3 sm:px-5">
        {/* SELETOR DE EMOJIS */}

        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-[82px] left-3 z-40 w-[280px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111318] shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div>
                <span className="block text-xs font-semibold text-gray-200">
                  Emojis
                </span>
                <span className="mt-0.5 block text-[9px] text-gray-500">
                  Escolha uma reação
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-gray-200"
                title="Fechar emojis"
              >
                <FaTimes size={11} />
              </button>
            </div>

            <div className="max-h-[230px] overflow-y-auto p-3">
              {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <p className="mb-2 text-[8px] font-semibold uppercase tracking-wider text-gray-500">
                    {category}
                  </p>

                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji, index) => (
                      <button
                        key={`${emoji}-${index}`}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition hover:bg-white/[0.07] active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SELETOR DE GIFS — DARK PREMIUM */}

        {showGifPicker && (
          <div
            ref={gifPickerRef}
            className="absolute bottom-[82px] left-3 z-40 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#101116] shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            {/* Cabeçalho próprio do seletor */}

            <div className="flex items-center justify-between border-b border-white/[0.07] bg-gradient-to-r from-[#15171e] to-[#101116] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/[0.12]">
                  <span className="text-[11px] font-black tracking-wide text-indigo-300">
                    GIF
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-gray-100">
                    Escolha um GIF
                  </h3>
                  <p className="mt-0.5 text-[9px] text-gray-500">
                    Encontre a reação perfeita
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGifPicker(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-transparent text-gray-500 transition hover:border-white/[0.06] hover:bg-white/[0.06] hover:text-gray-200 active:scale-95"
                title="Fechar seletor de GIFs"
                aria-label="Fechar seletor de GIFs"
              >
                <FaTimes size={12} />
              </button>
            </div>

            {/* Biblioteca de GIFs */}

            <div className="gif-picker-dark-surface bg-[#101116] p-2">
              <GifPicker
                provider={Klipy(
                  'H9jbrsVDruuiPMCdinhGLHKgvl1aUsoRnmT5o4MTtmuDLZRMZQXLeZ8s3Jcp5kA6',
                )}
                onGifClick={handleGifSelected}
                width="100%"
                height={350}
                theme="dark"
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] px-3 py-2">
              <span className="text-[9px] text-gray-500">
                Selecione um GIF para enviar
              </span>

              <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-1.5 py-1 text-[8px] font-medium text-gray-500">
                KLIPY
              </span>
            </div>
          </div>
        )}

        {(isRecording || recordedAudio || sendingAudio) && (
          <div
            className={`mx-auto mb-3 flex max-w-4xl flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center ${isWhatsApp ? 'border-emerald-500/20 bg-emerald-500/[0.045]' : 'border-indigo-400/20 bg-indigo-500/[0.045]'}`}
          >
            {isRecording ? (
              <>
                <span className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
                  Gravando áudio · {formatDuration(recordingSeconds)}
                </span>
                <div className="flex flex-1 items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelAudioRecording}
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5"
                    aria-label="Cancelar gravação"
                  >
                    <FaTrash className="mr-1.5 inline" size={11} /> Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={stopAudioRecording}
                    className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500"
                    aria-label="Finalizar gravação"
                  >
                    <FaStop className="mr-1.5 inline" size={10} /> Finalizar
                  </button>
                </div>
              </>
            ) : recordedAudio ? (
              <>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-200">
                    <FaMicrophone
                      className={
                        isWhatsApp ? 'text-emerald-400' : 'text-indigo-300'
                      }
                    />
                    Prévia do áudio · {formatDuration(recordingSeconds)}
                  </div>
                  <audio
                    src={recordedAudioUrl}
                    controls
                    preload="metadata"
                    className="h-9 w-full max-w-md"
                    aria-label="Ouvir áudio gravado antes de enviar"
                  />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelAudioRecording}
                    disabled={sendingAudio}
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-50"
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={handleSendRecordedAudio}
                    disabled={sendingAudio || sending}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${isWhatsApp ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                  >
                    {sendingAudio ? (
                      'Enviando...'
                    ) : (
                      <>
                        <FaPaperPlane className="mr-1.5 inline" size={10} />{' '}
                        Enviar áudio
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <span className="text-xs text-gray-400">Enviando áudio...</span>
            )}
          </div>
        )}

        {(uploadingMedia || uploadedAttachment || uploadError) && (
          <div className="mx-auto mb-3 max-w-4xl rounded-2xl border border-white/[0.08] bg-[#101116] p-3">
            {uploadingMedia && (
              <div
                className="flex items-center gap-3 text-xs text-gray-300"
                role="status"
              >
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-sky-400" />
                Enviando arquivo para o armazenamento...
              </div>
            )}

            {uploadError && (
              <div className="mb-2 flex items-start justify-between gap-3 rounded-xl border border-rose-400/15 bg-rose-400/[0.06] px-3 py-2">
                <p className="text-xs leading-5 text-rose-300" role="alert">
                  {uploadError}
                </p>
                <button
                  type="button"
                  onClick={() => setUploadError('')}
                  className="shrink-0 text-rose-300/70 transition hover:text-rose-200"
                  aria-label="Fechar aviso de anexo"
                  title="Fechar aviso"
                >
                  <FaTimes size={11} />
                </button>
              </div>
            )}

            {uploadedAttachment && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                {String(uploadedAttachment.mimeType || '').startsWith(
                  'image/',
                ) ? (
                  <img
                    src={uploadedAttachment.url}
                    alt={uploadedAttachment.originalName || 'Prévia da imagem'}
                    className="max-h-40 max-w-full rounded-xl border border-white/[0.08] object-contain sm:max-w-[180px]"
                  />
                ) : String(uploadedAttachment.mimeType || '').startsWith(
                    'video/',
                  ) ? (
                  <video
                    src={uploadedAttachment.url}
                    controls
                    preload="metadata"
                    className="max-h-40 max-w-full rounded-xl sm:max-w-[220px]"
                  />
                ) : String(uploadedAttachment.mimeType || '').startsWith(
                    'audio/',
                  ) ? (
                  <audio
                    src={uploadedAttachment.url}
                    controls
                    preload="metadata"
                    className="w-full sm:max-w-[280px]"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-sky-400/15 bg-sky-400/[0.07] text-sky-300">
                    <FaPaperclip size={16} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="break-all text-xs font-semibold text-gray-200">
                    {uploadedAttachment.originalName || uploadedAttachment.name}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {formatFileSize(uploadedAttachment.size)} · Upload concluído
                  </p>
                  <a
                    href={uploadedAttachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex text-[10px] text-sky-300 underline underline-offset-2 hover:text-sky-200"
                  >
                    Abrir arquivo
                  </a>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSendAttachment}
                      disabled={sending || uploadingMedia}
                      className={`rounded-lg px-3 py-2 text-[11px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        isWhatsApp
                          ? 'bg-emerald-600 hover:bg-emerald-500'
                          : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                    >
                      {sending ? 'Enviando...' : 'Enviar no chat'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedAttachment(null);
                        setUploadError('');
                      }}
                      disabled={sending}
                      className="rounded-lg border border-white/[0.08] px-3 py-2 text-[11px] text-gray-400 transition hover:bg-white/[0.05] hover:text-gray-200 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mx-auto flex max-w-4xl items-end gap-2">
          {/* EMOJI */}

          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker((prev) => !prev);
              setShowGifPicker(false);
            }}
            className={`mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${
              showEmojiPicker
                ? isWhatsApp
                  ? 'border-emerald-500/20 bg-emerald-500/[0.1] text-emerald-400'
                  : 'border-indigo-400/20 bg-indigo-500/[0.1] text-indigo-300'
                : 'border-transparent text-gray-500 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-gray-300'
            }`}
            title="Inserir emoji"
            aria-label="Inserir emoji"
            aria-expanded={showEmojiPicker}
          >
            <FaSmile size={16} />
          </button>

          {/* BOTÃO GIF */}

          <button
            type="button"
            onClick={() => {
              setShowGifPicker((prev) => !prev);
              setShowEmojiPicker(false);
            }}
            className={`mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-[10px] font-extrabold tracking-wide transition-all duration-200 active:scale-95 ${
              showGifPicker
                ? 'border-indigo-400/25 bg-indigo-500/[0.12] text-indigo-300 shadow-sm shadow-indigo-950/30'
                : 'border-transparent text-gray-500 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-gray-300'
            }`}
            title="Enviar GIF"
            aria-label="Enviar GIF"
            aria-expanded={showGifPicker}
          >
            GIF
          </button>

          {/* MICROFONE / GRAVAÇÃO DE ÁUDIO */}

          <button
            type="button"
            onClick={isRecording ? stopAudioRecording : startAudioRecording}
            disabled={
              sending ||
              uploadingMedia ||
              sendingAudio ||
              Boolean(recordedAudio)
            }
            className={`mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${isRecording ? 'border-rose-400/30 bg-rose-500/15 text-rose-300 animate-pulse' : isWhatsApp ? 'border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10' : 'border-indigo-400/10 text-indigo-300 hover:bg-indigo-500/10'}`}
            title={isRecording ? 'Finalizar gravação' : 'Gravar áudio'}
            aria-label={
              isRecording
                ? 'Finalizar gravação de áudio'
                : 'Gravar áudio pelo microfone'
            }
          >
            {isRecording ? <FaStop size={13} /> : <FaMicrophone size={15} />}
          </button>

          {/* CAMPO DE TEXTO */}

          <div
            className={`relative flex min-h-[44px] flex-1 items-end rounded-2xl border bg-[#101116] transition-all duration-200 focus-within:bg-[#12141a] ${
              isWhatsApp
                ? 'border-white/[0.07] focus-within:border-emerald-400/30 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.04)]'
                : 'border-white/[0.07] focus-within:border-indigo-400/30 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.05)]'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(event) => handleTyping(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isWhatsApp
                  ? 'Digite uma mensagem para o WhatsApp...'
                  : 'Digite uma mensagem...'
              }
              rows={1}
              disabled={sending}
              className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3.5 py-3 pr-12 text-xs leading-5 text-gray-200 outline-none placeholder:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                className="hidden"
                onChange={handleFileSelected}
                aria-label="Selecionar arquivo para anexar"
              />
              <button
                type="button"
                className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-gray-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                title="Anexar imagem, áudio, vídeo ou documento (máx. 50 MB)"
                aria-label="Anexar arquivo"
                disabled={sending || uploadingMedia}
                onClick={() => {
                  setUploadError('');
                  fileInputRef.current?.click();
                }}
              >
                {uploadingMedia ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-500 border-t-sky-400" />
                ) : (
                  <FaPaperclip size={13} />
                )}
              </button>
            </>
          </div>

          {/* ENVIAR */}

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={
              !inputMessage.trim() ||
              sending ||
              isRecording ||
              Boolean(recordedAudio) ||
              sendingAudio
            }
            className={`mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/[0.04] disabled:text-gray-600 disabled:shadow-none ${
              isWhatsApp
                ? 'bg-emerald-600 shadow-emerald-950/20 hover:bg-emerald-500'
                : 'bg-indigo-500 shadow-indigo-950/20 hover:bg-indigo-400'
            }`}
            title="Enviar mensagem"
            aria-label="Enviar mensagem"
          >
            {sending ? (
              <div
                className={`h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 ${
                  isWhatsApp ? 'border-t-emerald-100' : 'border-t-white'
                }`}
              />
            ) : (
              <FaPaperPlane size={13} />
            )}
          </button>
        </div>

        <div className="mx-auto mt-2 hidden max-w-4xl items-center justify-between sm:flex">
          <span className="text-[9px] text-gray-600">
            {isWhatsApp
              ? 'Mensagem enviada pelo WhatsApp'
              : 'Enter para enviar · Shift + Enter para nova linha'}
          </span>

          {isWhatsApp && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              <FaWhatsapp size={9} className="text-emerald-400/60" />
              <span className="text-[9px] text-gray-500">WA-AKG</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
