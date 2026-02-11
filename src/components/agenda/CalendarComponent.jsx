import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import useSidebar from '../../hooks/useSidebar';

const CalendarComponent = ({ events, onEventClick, onDateSelect, onEventDrop }) => {
  const calendarRef = useRef(null);
  const { isOpen } = useSidebar();

  // Recalculate calendar size when sidebar toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    }, 350); // match sidebar transition duration
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <div className="calendar-container h-full">
      <style>{`
        /* Custom styles for FullCalendar to match our project */
        .fc {
          --fc-border-color: rgba(226, 232, 240, 1);
          --fc-button-bg-color: #3b82f6;
          --fc-button-border-color: #3b82f6;
          --fc-button-hover-bg-color: #2563eb;
          --fc-button-active-bg-color: #1d4ed8;
          --fc-event-bg-color: #3b82f6;
          --fc-event-border-color: #3b82f6;
          --fc-page-bg-color: white;
          --fc-today-bg-color: rgba(239, 246, 255, 0.5);
          font-family: inherit;
        }

        .dark .fc {
          --fc-border-color: rgba(51, 65, 85, 1);
          --fc-page-bg-color: #1e293b;
          --fc-today-bg-color: rgba(30, 41, 59, 1);
          --fc-neutral-bg-color: #0f172a;
          --fc-list-event-hover-bg-color: #334155;
          color: #f1f5f9;
        }

        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .dark .fc .fc-toolbar-title {
          color: #f1f5f9;
        }

        .fc .fc-button {
          font-weight: 600;
          text-transform: capitalize;
          padding: 8px 16px;
          border-radius: 8px;
        }

        .fc .fc-button-primary:focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
        }

        .fc .fc-col-header-cell {
          padding: 12px 0;
          background: #f8fafc;
          font-weight: 600;
          color: #64748b;
        }

        .dark .fc .fc-col-header-cell {
          background: #1e293b;
          color: #94a3b8;
        }

        /* Day cell layout: center content vertically */
        .fc .fc-daygrid-day-frame {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .fc .fc-daygrid-day-top {
          flex-shrink: 0;
        }

        .fc .fc-daygrid-day-events {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2px 4px;
          min-height: 0;
          overflow: hidden;
        }

        /* Event styling — Google Calendar style */
        .fc-event {
          cursor: pointer;
          transition: transform 0.2s;
          border-radius: 8px !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          width: 100%;
          margin: 0 !important;
          overflow: hidden;
        }

        .fc-event:hover {
          transform: scale(1.03);
        }

        .fc-h-event .fc-event-main {
          font-weight: 500;
          overflow: hidden;
        }

        .fc .fc-daygrid-event-harness {
          width: 100%;
        }

        /* Custom event content */
        .event-google-style {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 4px 2px;
          line-height: 1.2;
        }

        .event-google-style .event-title {
          font-size: 11px;
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .dark .event-google-style .event-title {
          color: #f1f5f9;
        }

        .event-google-style .event-time {
          font-size: 9px;
          font-weight: 500;
          color: #64748b;
          margin-top: 1px;
        }

        .dark .event-google-style .event-time {
          color: #94a3b8;
        }

        /* Color dot before title */
        .event-google-style .event-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          margin-right: 3px;
          flex-shrink: 0;
        }

        .event-google-style .event-title-row {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 100%;
        }

        .fc .fc-daygrid-day-number {
          padding: 8px;
          font-weight: 500;
        }

        .fc .fc-daygrid-day.fc-day-today {
          background-color: rgba(59, 130, 246, 0.05);
        }

        .dark .fc .fc-daygrid-day.fc-day-today {
          background-color: rgba(59, 130, 246, 0.1);
        }

        .fc-daygrid-event-dot {
          display: none;
        }
        
        .fc-timegrid-event {
          border-radius: 4px;
        }
        
        .fc-list-event {
          cursor: pointer;
        }

        /* Custom "more events" bubble — large & centered */
        .fc .fc-daygrid-more-link {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #64748b;
          color: #ffffff !important;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
          transition: all 0.2s ease;
          margin: 4px auto;
          line-height: 1;
        }

        .fc .fc-daygrid-more-link:hover {
          background: #475569;
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }

        .dark .fc .fc-daygrid-more-link {
          background: #475569;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        }

        .dark .fc .fc-daygrid-more-link:hover {
          background: #3b82f6;
        }

        @media (max-width: 768px) {
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 8px;
          }
          .fc .fc-toolbar-title {
            font-size: 1.1rem;
          }
          .fc .fc-button {
            padding: 6px 10px;
            font-size: 0.8rem;
          }
          .fc .fc-today-button {
            display: none;
          }
          .fc .fc-daygrid-more-link {
            width: 30px;
            height: 30px;
            font-size: 12px;
          }
          .event-google-style .event-title {
            font-size: 10px;
          }
          .event-google-style .event-time {
            font-size: 8px;
          }
        }
      `}</style>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={ptBrLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        }}
        events={events}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={1}
        height="100%"
        moreLinkContent={(args) => `+${args.num}`}
        eventContent={(arg) => {
          if (arg.view.type === 'dayGridMonth') {
            const time = arg.event.start
              ? arg.event.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : '';
            const bgColor = arg.event.backgroundColor || arg.event.borderColor || '#3b82f6';
            return (
              <div className="event-google-style">
                <div className="event-title-row">
                  <span className="event-dot" style={{ backgroundColor: bgColor }}></span>
                  <span className="event-title">{arg.event.title}</span>
                </div>
                {time && <span className="event-time">{time}</span>}
              </div>
            );
          }
          return null; // default rendering for other views
        }}
        select={onDateSelect}
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        eventResize={onEventDrop} // Mesma lógica para resize
      />
    </div>
  );
};

export default CalendarComponent;
