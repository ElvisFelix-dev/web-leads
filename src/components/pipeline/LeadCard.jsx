import { Draggable } from '@hello-pangea/dnd';

import {
  FaPhone,
  FaEye,
  FaEdit,
  FaEnvelope,
  FaHome,
  FaMapMarkerAlt,
  FaUserTie,
  FaEllipsisV,
  FaCircle,
} from 'react-icons/fa';

const priorityColors = {
  baixa: 'bg-gray-500',
  media: 'bg-blue-500',
  alta: 'bg-orange-500',
  urgente: 'bg-red-500',
};

export default function LeadCard({ lead, index }) {
  console.log('LEAD CARD:', lead);
  const priority = priorityColors[lead.priority] || 'bg-blue-500';

  return (
    <Draggable draggableId={lead._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}

          {...provided.draggableProps}

          {...provided.dragHandleProps}

          className={`
            rounded-2xl
            border
            border-gray-800
            bg-gray-950
            p-5
            transition-all
            duration-300
            cursor-pointer

            ${
              snapshot.isDragging
                ? 'rotate-2 scale-105 shadow-2xl border-blue-500'
                : 'hover:border-cyan-500 hover:-translate-y-1'
            }
          `}
        >
          {/* =====================================================
              HEADER
          ===================================================== */}

          <div
            className="
              flex
              items-start
              justify-between
              gap-3
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
                min-w-0
              "
            >
              <span
                className={`
                  mt-2
                  h-3
                  w-3
                  shrink-0
                  rounded-full
                  ${priority}
                `}
              />

              <div
                className="
                  min-w-0
                "
              >
                <h3
                  className="
                    truncate
                    font-bold
                    text-white
                  "
                >
                  {lead.name}
                </h3>

                <p
                  className="
                    text-xs
                    text-gray-400
                  "
                >
                  {lead.source || 'Manual'}
                </p>

                {/* IMÓVEL RESUMIDO */}

                {lead.property && (
                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <FaHome
                      className="
                        text-cyan-400
                      "
                    />

                    <span
                      className="
                        max-w-[170px]
                        truncate
                        text-xs
                        font-medium
                        text-cyan-300
                      "
                    >
                      {lead.property.title}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* AVATAR CORRETOR */}

            {lead.assignedTo && (
              <div>
                {lead.assignedTo.avatar ? (
                  <img
                    src={lead.assignedTo.avatar}

                    alt={lead.assignedTo.name}

                    className="
                      h-9
                      w-9
                      rounded-full
                      border
                      border-cyan-500/30
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      bg-cyan-500/10
                    "
                  >
                    <FaUserTie
                      className="
                        text-cyan-400
                      "
                    />
                  </div>
                )}
              </div>
            )}

            <button
              className="
                rounded-lg
                p-2
                text-gray-500
                transition
                hover:bg-gray-800
                hover:text-white
              "
            >
              <FaEllipsisV />
            </button>
          </div>

          {/* =====================================================
              CONTATO
          ===================================================== */}

          <div className="mt-5 space-y-3">
            {lead.phone && (
              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-sm
                  text-gray-300
                "
              >
                <FaPhone
                  className="
                    text-cyan-400
                  "
                />

                <span className="truncate">{lead.phone}</span>
              </div>
            )}

            {lead.email && (
              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-sm
                  text-gray-300
                "
              >
                <FaEnvelope
                  className="
                    text-cyan-400
                  "
                />

                <span className="truncate">{lead.email}</span>
              </div>
            )}
          </div>

          {/* =====================================================
              IMÓVEL COMPLETO
          ===================================================== */}

          <div
            className="
              mt-5
              rounded-xl
              border
              border-gray-800
              bg-gray-900
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <FaHome
                className="
                  text-cyan-400
                "
              />

              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  {lead.property?.title || 'Imóvel não informado'}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-400
                  "
                >
                  {lead.property?.type || 'Residencial'}
                </p>
              </div>
            </div>

            {lead.property?.price && (
              <div
                className="
                  mt-4
                  rounded-lg
                  bg-cyan-500/10
                  px-3
                  py-2
                  text-center
                "
              >
                <span
                  className="
                    text-lg
                    font-bold
                    text-cyan-300
                  "
                >
                  {Number(lead.property.price).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* =====================================================
              REGIÃO
          ===================================================== */}

          {lead.region && (
            <div
              className="
                mt-4
                flex
                items-center
                gap-3
                text-sm
                text-gray-300
              "
            >
              <FaMapMarkerAlt
                className="
                  text-red-400
                "
              />

              <span>{lead.region}</span>
            </div>
          )}

          {/* =====================================================
              CORRETOR RESPONSÁVEL
          ===================================================== */}

          {/* {lead.assignedTo && (
            <div
              className="
                mt-4
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-gray-800
                bg-gray-900
                px-4
                py-3
              "
            >
              {lead.assignedTo.avatar ? (
                <img
                  src={lead.assignedTo.avatar}

                  alt={lead.assignedTo.name}

                  className="
                    h-10
                    w-10
                    rounded-full
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-cyan-500/10
                  "
                >
                  <FaUserTie
                    className="
                      text-cyan-400
                    "
                  />
                </div>
              )}

              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <span
                    className="
                      text-xs
                      uppercase
                      tracking-wider
                      text-gray-500
                    "
                  >
                    Corretor
                  </span>

                  <FaCircle
                    className="
                      text-[7px]
                      text-green-400
                    "
                  />
                </div>

                <p
                  className="
                    font-semibold
                    text-white
                  "
                >
                  {lead.assignedTo.name}
                </p>

                {lead.assignedTo.email && (
                  <p
                    className="
                      text-xs
                      text-gray-400
                    "
                  >
                    {lead.assignedTo.email}
                  </p>
                )}
              </div>
            </div>
          )}
            */}

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <div
            className="
              mt-6
              flex
              items-center
              justify-between
              border-t
              border-gray-800
              pt-4
            "
          >
            <div>
              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                Criado em
              </p>

              <p
                className="
                  text-sm
                  text-gray-300
                "
              >
                {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <button
                className="
                  rounded-xl
                  p-2
                  text-green-400
                  hover:bg-green-500/10
                "
              >
                <FaPhone />
              </button>

              <button
                className="
                  rounded-xl
                  p-2
                  text-cyan-400
                  hover:bg-cyan-500/10
                "
              >
                <FaEye />
              </button>

              <button
                className="
                  rounded-xl
                  p-2
                  text-yellow-400
                  hover:bg-yellow-500/10
                "
              >
                <FaEdit />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
