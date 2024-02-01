frappe.views.calendar['Meeting Room Booking'] = {
    field_map: {
        start: 'start_datetime',
        end: 'end_datetime',
        id: 'booking_id',
        title: 'title',

    },
    // style_map: {
    //     Public: 'success',
    //     Private: 'info'
    // },
    order_by: 'meeting_date',
    get_events_method: 'excel_meeting_booking.excel_meeting_booking.doctype.meeting_room_booking.meeting_room_booking.get_events'
}
