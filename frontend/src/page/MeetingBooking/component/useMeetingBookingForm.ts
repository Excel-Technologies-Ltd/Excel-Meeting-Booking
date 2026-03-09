
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const meetingBookingSchema = z.object({
	title: z.string().min(1, "Title is required"),
	meeting_room: z.string().min(1, "Meeting Room is required"),
	excel_branch: z.string().min(1, "Branch is required"),
	start_date: z.string().min(1, "Date is required"),
	start_time: z.string().min(1, "Start Time is required"),
	duration: z.union([z.string(), z.number()]).transform((value) => Number(value)).refine((num) => !isNaN(num) && num > 0, {
        message: "Duration must be a positive number",
    }),
	end_time: z.string().min(1, "End Time is required"),
	repeat_this_meeting: z.string().min(1, "Please select an option"),
	repeat_on: z.string().optional(),
	end_date: z.string().optional(),
	repeat_days: z.array(z.string()).optional(),
})
.superRefine((data, ctx) => {
    const { start_time, end_time, repeat_this_meeting, repeat_on, end_date, repeat_days } = data;
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
        if (repeat_on === "Weekly" && (!repeat_days || repeat_days.length === 0)) {
             ctx.addIssue({
                code: "custom",
                message: "Select at least one day",
                path: ["repeat_days"],
            });
        }
    }
}); 

export type MeetingBookingFormState = z.output<typeof meetingBookingSchema>;
export type MeetingBookingFormInput = z.input<typeof meetingBookingSchema>;

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
			repeat_days: [],
		},
	});

    const startTime = useWatch({ control, name: "start_time" });
    const endTime = useWatch({ control, name: "end_time" });
    const duration = useWatch({ control, name: "duration" });

    // Auto calculate end_time when duration changes
    useEffect(() => {
        if (startTime && duration && !isNaN(Number(duration))) {
             const [startHour, startMinute] = startTime.split(":").map(Number);
             const totalStartMinutes = startHour * 60 + startMinute;
             const totalEndMinutes = totalStartMinutes + Number(duration);
             
             const endHour = Math.floor(totalEndMinutes / 60) % 24;
             const endMinute = totalEndMinutes % 60;
             
             const automatedEndTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
             
             // Only update if the calculated time is different to prevent loops
             if (automatedEndTime !== endTime) {
                 setValue("end_time", automatedEndTime, { shouldValidate: true });
             }
        }
    }, [startTime, duration, setValue]); // Intentionally omitting endTime to avoid loop

    // Auto calculate duration when end_time changes
    // We need a mechanism to know WHICH field was user-edited to avoid fighting updates.
    // However, a simpler approach is to calculate duration if end_time is updated and duration doesn't match
     useEffect(() => {
        if (startTime && endTime) {
            const [startHour, startMinute] = startTime.split(":").map(Number);
            const [endHour, endMinute] = endTime.split(":").map(Number);
            
            const totalStartMinutes = startHour * 60 + startMinute;
            const totalEndMinutes = endHour * 60 + endMinute;
            
            let diff = totalEndMinutes - totalStartMinutes;
            if (diff < 0) diff += 24 * 60; // Handle midnight crossing if needed, though validation blocks it

            if (diff > 0 && diff.toString() !== duration?.toString()) {
                 // Check if the difference matches the current duration (within small margin? No, exact for now)
                 // This effect needs to be careful not to overwrite user's duration input while they are typing duration.
                 // But since duration inputs usually drive end_time, and end_time inputs drive duration...
                 // The cycle is broken by the dependency array and checks.
                 
                 // WARNING: Bi-directional sync is tricky. 
                 // If user changes duration -> end_time updates (Effect 1) -> end_time triggers Effect 2 -> duration updates.
                 // This is fine if the values are consistent.
                 // But if user changes end_time -> duration updates (Effect 2) -> duration triggers Effect 1 -> end_time updates.
                 
                 // To make this robust, we should perhaps prefer one direction or use a ref to track last changed field.
                 // For now, let's assume if endTime changed we update duration.
                 
                 // If the calculated duration for this end time is NOT the current duration, update it.
                 setValue("duration", diff.toString(), { shouldValidate: true });
            }
        }
    }, [startTime, endTime, setValue]); // Intentionally omitting duration to avoid loop

	const onSubmit = (data: MeetingBookingFormState) => {
		const docData = {
			...data,
			start_time: `${data.start_time}`,
			end_time: `${data.end_time}:00`,
			docstatus: 1, // Directly submit the booking
		};
		delete docData.repeat_days;

		createDoc("Meeting Room Booking", docData)
			.then(() => {
				reset();
				// You might want to add a success toast here
			})
			.catch((e) => {
				console.error(e);
				// You might want to add an error toast here
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
	};
};

