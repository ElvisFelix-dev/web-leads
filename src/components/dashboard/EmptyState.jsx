import { Inbox, Plus } from 'lucide-react';

export default function EmptyState({
  icon: CustomIcon = Inbox,

  title = 'Nenhum dado encontrado',

  description = 'Ainda não existem informações disponíveis.',

  actionLabel,

  onAction,
}) {
  return (
    <div
      className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-10
      flex
      flex-col
      items-center
      justify-center
      text-center
      shadow-xl
      "
    >
      {/* ICON */}

      <div
        className="
        w-16
        h-16
        rounded-2xl
        bg-slate-800
        flex
        items-center
        justify-center
        mb-5
        "
      >
        <CustomIcon
          size={32}

          className="
          text-slate-400
          "
        />
      </div>

      {/* TITLE */}

      <h2
        className="
        text-xl
        font-bold
        text-white
        "
      >
        {title}
      </h2>

      {/* DESCRIPTION */}

      <p
        className="
        text-slate-400
        max-w-md
        mt-2
        "
      >
        {description}
      </p>

      {/* ACTION */}

      {actionLabel && (
        <button
          onClick={onAction}

          className="
            mt-6
            flex
            items-center
            gap-2
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-5
            py-2.5
            rounded-xl
            transition
            "
        >
          <Plus size={18} />

          {actionLabel}
        </button>
      )}
    </div>
  );
}
