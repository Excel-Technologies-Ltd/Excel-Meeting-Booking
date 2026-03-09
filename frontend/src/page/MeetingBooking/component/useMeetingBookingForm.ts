import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

export const daysOfWeek = [
  { label: "Saturday", value: "saturday" },
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
];

const baseSchema = {
  title: z.string().min(1, "Title is required"),
  meeting_room: z.string().min(1, "Meeting Room is required"),
  excel_branch: z.string().min(1, "Branch is required"),
  start_date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start Time is required"),
  duration: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((num) => !isNaN(num) && num > 0, {
      message: "Duration must be a positive number",
    }),
  end_time: z.string().min(1, "End Time is required"),
  repeat_this_meeting: z.string().min(1, "Please select an option"),
  repeat_on: z.string().optional(),
  end_date: z.string().optional(),

  saturday: z.boolean().optional(),
  sunday: z.boolean().optional(),
  monday: z.boolean().optional(),
  tuesday: z.boolean().optional(),
  wednesday: z.boolean().optional(),
  thursday: z.boolean().optional(),
  friday: z.boolean().optional(),
};

const meetingBookingSchema = z.object(baseSchema).superRefine((data, ctx) => {
  const { start_time, end_time, repeat_this_meeting, repeat_on, end_date } = data;
  const [startHour, startMinute] = start_time.split(":").map(Number);
  const [endHour, endMinute] = end_time.split(":").map(Number);
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  const calculatedDuration = endTotalMinutes - startTotalMinutes;

  if (calculatedDuration <= 0) {
    ctx.addIssue({
      code: "custom",
      message: "End Time must be after Start Time",
      path: ["end_time"],
    });
  }

  if (repeat_this_meeting === "Yes") {
    if (!repeat_on) {
      ctx.addIssue({
        code: "custom",
        message: "Repeat frequency is required",
        path: ["repeat_on"],
      });
    }
    if (!end_date) {
      ctx.addIssue({
        code: "custom",
        message: "End date is required",
        path: ["end_date"],
      });
    }
  }
});

export type MeetingBookingFormState = z.output<typeof meetingBookingSchema>;
export type MeetingBookingFormInput = z.input<typeof meetingBookingSchema>;
type CalculationMode = "duration" | "end_time" | null;

const parseTimeToMinutes = (time: string) => {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
};

const minutesToTimeWithSeconds = (totalMinutes: number) => {
  const safeMinutes = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
};

export const useMeetingBookingForm = (roomSearch: string = "", branchSearch: string = "") => {
  const { createDoc, loading, error } = useFrappeCreateDoc();
  const { data: meetingRooms } = useFrappeGetDocList("ArcApps Meeting Room", {
    fields: ["name"],
    filters: roomSearch ? [["name", "like", `%${roomSearch}%`]] : undefined,
  });

  const { data: branches } = useFrappeGetDocList("ArcApps Branch", {
    fields: ["name"],
    filters: branchSearch ? [["name", "like", `%${branchSearch}%`]] : undefined,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<MeetingBookingFormInput, any, MeetingBookingFormState>({
    resolver: zodResolver(meetingBookingSchema),
    defaultValues: {
      title: "",
      meeting_room: "",
      excel_branch: "",
      start_date: "",
      start_time: "",
      duration: "0",
      end_time: "",
      repeat_this_meeting: "No",
      repeat_on: "",
      end_date: "",
    },
  });

  const [calculationMode, setCalculationMode] = useState<CalculationMode>(null);

  const syncEndTimeFromDuration = () => {
    const startTime = getValues("start_time");
    const duration = getValues("duration");

    const startMinutes = parseTimeToMinutes(startTime || "");
    const durationMinutes = Number(duration);

    if (startMinutes === null || Number.isNaN(durationMinutes) || durationMinutes <= 0) {
      return false;
    }

    const calculatedEndTime = minutesToTimeWithSeconds(startMinutes + durationMinutes);
    if (calculatedEndTime !== getValues("end_time")) {
      setValue("end_time", calculatedEndTime, { shouldValidate: true, shouldDirty: true });
    }

    return true;
  };

  const syncDurationFromEndTime = () => {
    const startTime = getValues("start_time");
    const endTime = getValues("end_time");

    const startMinutes = parseTimeToMinutes(startTime || "");
    const endMinutes = parseTimeToMinutes(endTime || "");

    if (startMinutes === null || endMinutes === null) {
      return false;
    }

    let diff = endMinutes - startMinutes;
    if (diff < 0) diff += 24 * 60;

    if (diff > 0 && diff.toString() !== String(getValues("duration") ?? "")) {
      setValue("duration", String(diff), { shouldValidate: true, shouldDirty: true });
    }

    return diff > 0;
  };

  const handleDurationBlur = () => {
    const duration = Number(getValues("duration"));
    if (Number.isNaN(duration) || duration <= 0) {
      if (calculationMode === "duration") {
        setCalculationMode(null);
      }
      return;
    }

    if (calculationMode !== "end_time") {
      setCalculationMode("duration");
      syncEndTimeFromDuration();
    }
  };

  const handleEndTimeBlur = () => {
    const endTime = getValues("end_time");
    if (parseTimeToMinutes(endTime || "") === null) {
      if (calculationMode === "end_time") {
        setCalculationMode(null);
      }
      return;
    }

    if (calculationMode !== "duration") {
      setCalculationMode("end_time");
      syncDurationFromEndTime();
    }
  };

  const handleStartTimeBlur = () => {
    if (calculationMode === "duration") {
      syncEndTimeFromDuration();
      return;
    }

    if (calculationMode === "end_time") {
      syncDurationFromEndTime();
      return;
    }

    // If no source is locked yet, lock whichever valid field user has entered first.
    const duration = Number(getValues("duration"));
    const endTime = getValues("end_time");

    if (!Number.isNaN(duration) && duration > 0) {
      setCalculationMode("duration");
      syncEndTimeFromDuration();
      return;
    }

    if (parseTimeToMinutes(endTime || "") !== null) {
      setCalculationMode("end_time");
      syncDurationFromEndTime();
    }
  };

  const durationReadOnly = calculationMode === "end_time";
  const endTimeReadOnly = calculationMode === "duration";

  const onSubmit = (data: MeetingBookingFormState) => {
    const startMinutes = parseTimeToMinutes(data.start_time);
    let computedDuration = Number(data.duration);
    let computedEndTime = data.end_time;

    if (startMinutes !== null) {
      const currentEndMinutes = parseTimeToMinutes(computedEndTime || "");

      if ((Number.isNaN(computedDuration) || computedDuration <= 0) && currentEndMinutes !== null) {
        let diff = currentEndMinutes - startMinutes;
        if (diff < 0) diff += 24 * 60;
        if (diff > 0) computedDuration = diff;
      }

      if (
        parseTimeToMinutes(computedEndTime || "") === null &&
        !Number.isNaN(computedDuration) &&
        computedDuration > 0
      ) {
        computedEndTime = minutesToTimeWithSeconds(startMinutes + computedDuration);
      }
    }

    const days = {
      saturday: data.saturday || false,
      sunday: data.sunday || false,
      monday: data.monday || false,
      tuesday: data.tuesday || false,
      wednesday: data.wednesday || false,
      thursday: data.thursday || false,
      friday: data.friday || false,
    };

    const docData = {
      docstatus: 1, // Directly submit the booking
      title: data.title,
      meeting_room: data.meeting_room,
      excel_branch: data.excel_branch,
      start_date: data.start_date,
      start_time: data.start_time,
      duration: computedDuration,
      end_time: computedEndTime,

      repeat_this_meeting: data.repeat_this_meeting,
      ...(data.repeat_this_meeting === "Yes"
        ? {
            repeat_on: data.repeat_on,
            end_date: data.end_date,
          }
        : {}),
      ...(data.repeat_this_meeting === "Yes" && data.repeat_on === "Weekly" ? days : {}),
    };

    createDoc("Meeting Room Booking", docData)
      .then(() => {
        reset();
        toast.dismiss();
        toast.success("Meeting booked successfully!");
        reset(); // Clear form after successful booking
      })
      .catch((e) => {
        console.error(e);
        toast.dismiss();
        toast.error("Failed to book meeting.");
      });
  };

  return {
    register,
    control,
    watch,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    loading,
    error,
    meetingRooms,
    branches,
    durationReadOnly,
    endTimeReadOnly,
    handleDurationBlur,
    handleEndTimeBlur,
    handleStartTimeBlur,
  };
};
