import frappe
from datetime import datetime

@frappe.whitelist()
def get_running_or_upcoming_meetings():
    date = datetime.now().strftime('%Y-%m-%d')
    room_list = get_all_rooms()
    meeting_list = []
    for room in room_list:
        meetings = find_meeting_by_room_and_date(room, date)
        meeting_list.append({
            "name": room.get("name"),  # Extract room name
            "meetings": meetings
        })
    return meeting_list

def get_all_rooms():
    # Fetch the list of all meeting rooms
    return frappe.db.get_list("ArcApps Meeting Room", fields=["name"])

def find_meeting_by_room_and_date(room_name, date):
    # Extract the name of the room and query the database
    meeting_room_name = room_name.get("name")  # Ensure we use the string value
    return frappe.db.get_list(
        "Meeting",
        filters={
            "meeting_room": meeting_room_name,  # Use the string value
            "meeting_date": ['>=', date], 
            "status": "Open"
        },
        fields=["name", "title", "meeting_room", "meeting_date", "start_datetime", "end_datetime", "status"],
        order_by="start_datetime",
        limit=4
    )

def set_meeting_status():
    # Update meeting status in the database
    frappe.db.set_value("Meeting", {"meeting_date": '2024-12-18'}, "status", 'Open')
    frappe.db.commit()
    return "Meeting status updated"
