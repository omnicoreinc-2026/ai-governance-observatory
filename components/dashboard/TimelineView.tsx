"use client";

import { useEffect, useState } from "react";
import {
  Scale,
  Shield,
  FileText,
  Layers,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/dates";
import { EVENT_TYPE_COLORS } from "@/lib/utils/constants";
import type { TimelineEvent, TimelineEventType } from "@/lib/supabase/types";

const EVENT_ICONS: Record<TimelineEventType, typeof Scale> = {
  regulatory: Scale,
  vendor: Shield,
  standards: FileText,
  frameworks: Layers,
  enforcement: AlertCircle,
};

export function TimelineView(): JSX.Element {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("timeline_events")
        .select("*")
        .order("event_date", { ascending: false });
      if (error) { console.error('Failed to fetch timeline events:', error); setLoading(false); return; }
      setEvents(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-sm text-[#71717A]">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs">
        {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1 text-[#A1A1AA]">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        ))}
      </div>

      <div className="relative ml-4">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-white/[0.06]" />

        <div className="space-y-1">
          {events.map((event) => {
            const Icon = EVENT_ICONS[event.event_type];
            const color = EVENT_TYPE_COLORS[event.event_type];

            return (
              <div key={event.id} className="relative flex items-start gap-4 py-3">
                {/* Icon */}
                <div
                  className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: color,
                    backgroundColor: `${color}15`,
                  }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs text-[#71717A]">
                      {formatDate(event.event_date)}
                    </span>
                    {event.is_upcoming && (
                      <span className="rounded-full bg-[#38BDF8]/10 px-2 py-0.5 text-[10px] font-medium text-[#38BDF8]">
                        UPCOMING
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#FAFAFA]">{event.label}</p>
                  {event.description && (
                    <p className="mt-0.5 text-xs text-[#A1A1AA]">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="py-12 text-center text-sm text-[#71717A]">
            No timeline events. Run the seed script.
          </div>
        )}
      </div>
    </div>
  );
}
