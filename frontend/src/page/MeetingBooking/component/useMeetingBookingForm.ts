
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import { z } from "zod";

const meetingBookingSchema = z.object({
	title: z.string().min(1, "Title is required"),
	meeting_room: z.string().min(1, "Meeting Room is required"),
	excel_branch: z.string().min(1, "Branch is required"),
	start_date: z.string().min(1, "Date is required"),
	start_time: z.string().min(1, "Start Time is required"),
	// Ensure duration is handled as a number
	// duration: z.number().min(1, "Duration must be at least 1 minute"),
    duration: z.string().transform((value) => Number(value)).refine((num) => !isNaN(num) && num > 0, {
        message: "Duration must be a positive number",
    }),
	end_time: z.string().min(1, "End Time is required"),
})
.superRefine(({ start_time, end_time, duration }, ctx) => {
    const [startHour, startMinute] = start_time.split(":").map(Number);
    const [endHour, endMinute] = end_time.split(":").map(Number);   
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const calculatedDuration = endTotalMinutes - startTotalMinutes;

    if (calculatedDuration <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.invalid_date,
            message: "End Time must be after Start Time",   
        });
    }
}); 

export type MeetingBookingFormState = z.infer<typeof meetingBookingSchema>;

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
		formState: { errors },
	} = useForm<MeetingBookingFormState>({
		resolver: zodResolver(meetingBookingSchema),
		defaultValues: {
			title: "",
			meeting_room: "",
			excel_branch: "",
			start_date: "",
			start_time: "",
			duration: 0,
			end_time: "",
		},
	});

	const onSubmit = (data: MeetingBookingFormState) => {
		const docData = {
			...data,
			start_time: `${data.start_time}:00`,
			end_time: `${data.end_time}:00`,
		};
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
		handleSubmit: handleSubmit(onSubmit),
		errors,
		loading,
		error,
        meetingRooms,
        branches,
	};
};

