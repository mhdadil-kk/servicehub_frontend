import React, { useState, useEffect } from "react";
import { Trash2, PlusCircle, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { providerApi } from "../../api/provider.service";
import { RRule, Weekday } from "rrule";

type TimeSlot = { 
  id: string; 
  start: string; 
  end: string; 
  startDate?: string; 
  endDate?: string; 
  rrule?: string;
};
type DaySchedule = { isAvailable: boolean; slots: TimeSlot[] };
type WeeklySchedule = Record<string, DaySchedule>;
type DateOverride = { id: string; date: string; isAvailable: boolean; slots: TimeSlot[] };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DAYS_MAP: Record<string, Weekday> = {
  Monday: RRule.MO,
  Tuesday: RRule.TU,
  Wednesday: RRule.WE,
  Thursday: RRule.TH,
  Friday: RRule.FR,
  Saturday: RRule.SA,
  Sunday: RRule.SU,
};

const TIME_PATTERN = /^\d{2}:\d{2}$/;

const generateRRule = (day: string, start: string, end: string, startDate?: string, endDate?: string) => {
  const weekday = DAYS_MAP[day];
  if (!weekday) return "";

  // Guard: both start and end must be valid HH:MM strings
  if (!start || !end || !TIME_PATTERN.test(start) || !TIME_PATTERN.test(end)) return "";

  const [startH, startM] = start.split(":").map(Number);
  if (isNaN(startH) || isNaN(startM)) return "";

  const startD = startDate ? new Date(startDate) : new Date();
  startD.setHours(startH, startM, 0, 0);

  // Guard: if setHours produced an invalid date, bail out
  if (isNaN(startD.getTime())) return "";

  // For 'until': RRule requires a UTC Date — use end-of-day UTC to avoid
  // "Invalid options: until" errors from local-timezone hour manipulation.
  let endD: Date | undefined = undefined;
  if (endDate) {
    endD = new Date(endDate + "T23:59:59Z");
    if (isNaN(endD.getTime())) endD = undefined;
  }

  try {
    const rule = new RRule({
      freq: RRule.WEEKLY,
      byweekday: [weekday],
      dtstart: startD,
      until: endD,
    });
    return rule.toString();
  } catch {
    return "";
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const defaultSchedule: WeeklySchedule = {
  Monday: { isAvailable: false, slots: [] },
  Tuesday: { isAvailable: false, slots: [] },
  Wednesday: { isAvailable: false, slots: [] },
  Thursday: { isAvailable: false, slots: [] },
  Friday: { isAvailable: false, slots: [] },
  Saturday: { isAvailable: false, slots: [] },
  Sunday: { isAvailable: false, slots: [] },
};

const ProviderAvailability: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "weekly" | "overrides"
  >("weekly");

  const [schedule, setSchedule] =
    useState<WeeklySchedule>(defaultSchedule);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [overrides, setOverrides] = useState<DateOverride[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  // Sync overall start date to all slot recurrence rules
  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    setSchedule((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((day) => {
        updated[day] = {
          ...updated[day],
          slots: updated[day].slots.map((slot) => {
            const updatedSlot = { ...slot, startDate: newStart };
            updatedSlot.rrule = generateRRule(day, updatedSlot.start, updatedSlot.end, newStart, updatedSlot.endDate);
            return updatedSlot;
          }),
        };
      });
      return updated;
    });
  };

  // Sync overall end date to all slot recurrence rules
  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);
    setSchedule((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((day) => {
        updated[day] = {
          ...updated[day],
          slots: updated[day].slots.map((slot) => {
            const updatedSlot = { ...slot, endDate: newEnd };
            updatedSlot.rrule = generateRRule(day, updatedSlot.start, updatedSlot.end, updatedSlot.startDate, newEnd);
            return updatedSlot;
          }),
        };
      });
      return updated;
    });
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  // -----------------------------------
  // FETCH AVAILABILITY
  // -----------------------------------

  const fetchAvailability = async () => {
  try {
    setIsLoading(true);

    const res = await providerApi.getAvailability();

    console.log("FULL API RESPONSE:", res.data);

    const data = res.data;

    if (data?.startDate) {
      setStartDate(data.startDate);
    } else {
      setStartDate("");
    }
    if (data?.endDate) {
      setEndDate(data.endDate);
    } else {
      setEndDate("");
    }

    if (data?.weeklySchedule) {
      const mergedSchedule: WeeklySchedule = {
        ...defaultSchedule,
        ...data.weeklySchedule,
      };

      // auto toggle based on slots
      Object.keys(mergedSchedule).forEach((day) => {
        mergedSchedule[day].isAvailable =
          mergedSchedule[day].slots?.length > 0;
      });

      setSchedule(mergedSchedule);
    } else {
      setSchedule(defaultSchedule);
    }

    if (data?.overrides) {
      setOverrides(data.overrides);
    }
  } catch (error) {
    console.log(error);

    toast.error("Failed to load availability.");
  } finally {
    setIsLoading(false);
  }
};

  // -----------------------------------
  // TOGGLE DAY
  // -----------------------------------

  const toggleDay = (day: string) => {
    setSchedule((prev) => {
      const currentlyAvailable = prev[day].isAvailable;
      const nextAvailable = !currentlyAvailable;
      let slots = prev[day].slots;

      if (nextAvailable && slots.length === 0) {
        const defaultStart = "09:00";
        const defaultEnd = "17:00";
        const defaultStartDate = startDate || new Date().toISOString().split('T')[0];
        const defaultEndDate = endDate || "";
        const rruleStr = generateRRule(day, defaultStart, defaultEnd, defaultStartDate, defaultEndDate);
        slots = [
          {
            id: generateId(),
            start: defaultStart,
            end: defaultEnd,
            startDate: defaultStartDate,
            endDate: defaultEndDate,
            rrule: rruleStr,
          },
        ];
      }

      return {
        ...prev,
        [day]: {
          ...prev[day],
          isAvailable: nextAvailable,
          slots: currentlyAvailable ? [] : slots,
        },
      };
    });
  };

  // -----------------------------------
  // ADD SLOT
  // -----------------------------------

  const addSlot = (day: string) => {
    const defaultStart = "09:00";
    const defaultEnd = "17:00";
    const defaultStartDate = startDate || new Date().toISOString().split('T')[0];
    const defaultEndDate = endDate || "";
    const rruleStr = generateRRule(day, defaultStart, defaultEnd, defaultStartDate, defaultEndDate);

    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isAvailable: true,
        slots: [
          ...prev[day].slots,
          {
            id: generateId(),
            start: defaultStart,
            end: defaultEnd,
            startDate: defaultStartDate,
            endDate: defaultEndDate,
            rrule: rruleStr,
          },
        ],
      },
    }));
  };

  // -----------------------------------
  // REMOVE SLOT
  // -----------------------------------

  const removeSlot = (day: string, slotId: string) => {
    setSchedule((prev) => {
      const updatedSlots = prev[day].slots.filter(
        (slot) => slot.id !== slotId
      );

      return {
        ...prev,
        [day]: {
          ...prev[day],
          slots: updatedSlots,
          isAvailable: updatedSlots.length > 0,
        },
      };
    });
  };

  // -----------------------------------
  // UPDATE SLOT
  // -----------------------------------

  const updateSlot = (
    day: string,
    slotId: string,
    field: "start" | "end" | "startDate" | "endDate",
    value: string
  ) => {
    setSchedule((prev) => {
      const slots = prev[day].slots.map((slot) => {
        if (slot.id === slotId) {
          const updated = { ...slot, [field]: value };
          // Only regenerate rrule when both time fields are fully valid HH:MM values;
          // partial values (e.g. "" or "0") during typing must not trigger RRule.
          const bothTimesValid =
            TIME_PATTERN.test(updated.start) && TIME_PATTERN.test(updated.end);
          updated.rrule = bothTimesValid
            ? generateRRule(day, updated.start, updated.end, updated.startDate, updated.endDate)
            : slot.rrule;
          return updated;
        }
        return slot;
      });
      return {
        ...prev,
        [day]: {
          ...prev[day],
          isAvailable: true,
          slots,
        },
      };
    });
  };

  // -----------------------------------
  // OVERRIDES
  // -----------------------------------

  const addOverride = () => {
    setOverrides((prev) => [
      ...prev,
      {
        id: generateId(),
        date: "",
        isAvailable: true,
        slots: [
          {
            id: generateId(),
            start: "09:00",
            end: "17:00",
          },
        ],
      },
    ]);
  };

  const removeOverride = (id: string) => {
    setOverrides((prev) =>
      prev.filter((override) => override.id !== id)
    );
  };

  const updateOverrideDate = (
    id: string,
    date: string
  ) => {
    setOverrides((prev) =>
      prev.map((override) =>
        override.id === id
          ? {
              ...override,
              date,
            }
          : override
      )
    );
  };

  const toggleOverrideAvailability = (id: string) => {
    setOverrides((prev) =>
      prev.map((override) => {
        if (override.id === id) {
          return {
            ...override,

            isAvailable: !override.isAvailable,

            slots: override.isAvailable
              ? []
              : override.slots.length > 0
              ? override.slots
              : [
                  {
                    id: generateId(),
                    start: "09:00",
                    end: "17:00",
                  },
                ],
          };
        }

        return override;
      })
    );
  };

  const addOverrideSlot = (overrideId: string) => {
    setOverrides((prev) =>
      prev.map((override) => {
        if (override.id === overrideId) {
          return {
            ...override,

            isAvailable: true,

            slots: [
              ...override.slots,
              {
                id: generateId(),
                start: "09:00",
                end: "17:00",
              },
            ],
          };
        }

        return override;
      })
    );
  };

  const removeOverrideSlot = (
    overrideId: string,
    slotId: string
  ) => {
    setOverrides((prev) =>
      prev.map((override) => {
        if (override.id === overrideId) {
          const updatedSlots = override.slots.filter(
            (slot) => slot.id !== slotId
          );

          return {
            ...override,

            slots: updatedSlots,

            isAvailable: updatedSlots.length > 0,
          };
        }

        return override;
      })
    );
  };

  const updateOverrideSlot = (
    overrideId: string,
    slotId: string,
    field: "start" | "end",
    value: string
  ) => {
    setOverrides((prev) =>
      prev.map((override) => {
        if (override.id === overrideId) {
          return {
            ...override,

            isAvailable: true,

            slots: override.slots.map((slot) =>
              slot.id === slotId
                ? {
                    ...slot,
                    [field]: value,
                  }
                : slot
            ),
          };
        }

        return override;
      })
    );
  };

  // -----------------------------------
  // SAVE
  // -----------------------------------

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        toast.error("Active End Date must be after Start Date.");
        setIsSaving(false);
        return;
      }

      await providerApi.updateAvailability({
        startDate: startDate || null,
        endDate: endDate || null,
        weeklySchedule: schedule,
        overrides,
      });

      toast.success("Availability saved successfully!");
    } catch (error) {
      toast.error("Failed to save availability.");
    } finally {
      setIsSaving(false);
    }
  };

  // -----------------------------------
  // LOADING
  // -----------------------------------

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 pb-32">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">
          Availability
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          Manage your weekly schedule and booking slots.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("weekly")}
          className={`px-5 py-2 rounded-lg text-sm font-bold ${
            activeTab === "weekly"
              ? "bg-white shadow text-slate-900"
              : "text-slate-500"
          }`}
        >
          Weekly Schedule
        </button>

        <button
          onClick={() => setActiveTab("overrides")}
          className={`px-5 py-2 rounded-lg text-sm font-bold ${
            activeTab === "overrides"
              ? "bg-white shadow text-slate-900"
              : "text-slate-500"
          }`}
        >
          Date Overrides
        </button>
      </div>

      {/* WEEKLY */}
      {activeTab === "weekly" && (
        <div className="space-y-4">
          {/* Active Period Selection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Schedule Active Period</h2>
            <p className="text-xs text-slate-500 mb-4">
              Define the overall date range during which you offer bookings. Leave blank for indefinite availability.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Active From (Start Date)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Active To (End Date)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  handleStartDateChange("");
                  handleEndDateChange("");
                }}
                className="mt-4 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
              >
                Clear Active Period (Set to Indefinite)
              </button>
            )}
          </div>

          {DAYS.map((day) => {
            const dayData = schedule[day] || {
              isAvailable: false,
              slots: [],
            };

            return (
              <div
                key={day}
                className="bg-white border border-slate-200 rounded-2xl p-5"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* DAY */}
                  <div className="flex items-center gap-3 w-44">
                    <input
                      type="checkbox"
                      checked={dayData.isAvailable}
                      onChange={() => toggleDay(day)}
                    />

                    <span className="font-bold">{day}</span>
                  </div>

                  {/* SLOTS */}
                  <div className="flex-1">
                    {!dayData.isAvailable ? (
                      <span className="text-sm text-slate-400">
                        Unavailable
                      </span>
                    ) : (
                      <div className="space-y-3">
                        {dayData.slots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex flex-wrap items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) =>
                                  updateSlot(
                                    day,
                                    slot.id,
                                    "start",
                                    e.target.value
                                  )
                                }
                                className="border rounded-lg px-2 py-1.5 text-sm"
                              />
                              <span className="text-xs text-slate-400">to</span>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) =>
                                  updateSlot(
                                    day,
                                    slot.id,
                                    "end",
                                    e.target.value
                                  )
                                }
                                className="border rounded-lg px-2 py-1.5 text-sm"
                              />
                            </div>



                            <button
                              onClick={() =>
                                removeSlot(day, slot.id)
                              }
                              className="text-red-500 hover:text-red-700 p-1 transition-colors"
                              title="Delete Slot"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => addSlot(day)}
                          className="flex items-center gap-2 text-blue-600 text-sm font-bold"
                        >
                          <PlusCircle size={16} />
                          Add Slot
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OVERRIDES */}
      {activeTab === "overrides" && (
        <div className="space-y-6">
          <button
            onClick={addOverride}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            <Plus size={16} />
            Add Date Override
          </button>

          {overrides.map((override) => (
            <div
              key={override.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
            >
              <div className="flex justify-between items-center">
                <input
                  type="date"
                  value={override.date}
                  onChange={(e) =>
                    updateOverrideDate(
                      override.id,
                      e.target.value
                    )
                  }
                  className="border rounded-lg px-3 py-2"
                />

                <button
                  onClick={() =>
                    removeOverride(override.id)
                  }
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={override.isAvailable}
                  onChange={() =>
                    toggleOverrideAvailability(
                      override.id
                    )
                  }
                />

                <span className="font-medium">
                  Available on this date
                </span>
              </div>

              {override.isAvailable && (
                <div className="space-y-3">
                  {override.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center gap-3"
                    >
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) =>
                          updateOverrideSlot(
                            override.id,
                            slot.id,
                            "start",
                            e.target.value
                          )
                        }
                        className="border rounded-lg px-3 py-2"
                      />

                      <span>to</span>

                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) =>
                          updateOverrideSlot(
                            override.id,
                            slot.id,
                            "end",
                            e.target.value
                          )
                        }
                        className="border rounded-lg px-3 py-2"
                      />

                      <button
                        onClick={() =>
                          removeOverrideSlot(
                            override.id,
                            slot.id
                          )
                        }
                        className="text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      addOverrideSlot(override.id)
                    }
                    className="flex items-center gap-2 text-blue-600 text-sm font-bold"
                  >
                    <PlusCircle size={16} />
                    Add Slot
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SAVE BAR */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t p-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold"
        >
          {isSaving ? "Saving..." : "Save Schedule"}
        </button>
      </div>
    </div>
  );
};

export default ProviderAvailability;