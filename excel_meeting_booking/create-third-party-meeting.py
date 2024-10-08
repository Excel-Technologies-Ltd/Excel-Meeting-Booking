from datetime import datetime
import frappe
import pytz
import requests

# Set your local time zone (for example, Asia/Dhaka)
LOCAL_TIME_ZONE = 'Asia/Dhaka'

# Helper function to convert UTC time to local time zone
def convert_to_local_time(utc_dt):
    local_tz = pytz.timezone(LOCAL_TIME_ZONE)
    return utc_dt.astimezone(local_tz)

# Helper function to convert duration in minutes to a human-readable format
def format_duration(minutes):
    days = minutes // (24 * 60)
    hours = (minutes % (24 * 60)) // 60
    mins = minutes % 60
    
    formatted_duration = []
    
    # If the duration is 1-59 minutes, just show minutes
    if days == 0 and hours == 0:
        formatted_duration.append(f"{mins}m")
    
    # If the duration is in hours (1-5), show hours and minutes
    elif days == 0 and hours > 0:
        formatted_duration.append(f"{hours}h")
        if mins > 0:
            formatted_duration.append(f"{mins}m")
    
    # If the duration is a day or more, show days, hours, and minutes
    else:
        if days > 0:
            formatted_duration.append(f"{days}d")
        if hours > 0:
            formatted_duration.append(f"{hours}h")
        if mins > 0:
            formatted_duration.append(f"{mins}m")
    
    return " ".join(formatted_duration)

# Function to fetch meetings from Microsoft Calendar and create them in ERPNext
def sync_meetings():
    # Fetch third-party meeting configuration from ERPNext
    config = frappe.get_doc('Third Party Meeting Configuration')
    access_token = config.authorization_key  # Ensure this token has the necessary permissions

    # Microsoft Graph API endpoint to get calendar events
    endpoint = 'https://graph.microsoft.com/v1.0/me/events?$select=id,subject,start,end,attendees'

    # Set up headers with access token
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    # Make the API request to get calendar events
    response = requests.get(endpoint, headers=headers)

    if response.status_code == 200:
        events_data = response.json()
        meetings = events_data.get('value', [])

        # Get the current local time
        current_time = datetime.now(pytz.timezone(LOCAL_TIME_ZONE))

        # Loop through each meeting and create it in ERPNext
        for meeting in meetings:
            # Extract relevant data from Microsoft Calendar event
            event_id = meeting['id']  # Unique ID for the event
            title = meeting['subject']
            start_time = meeting['start']['dateTime']
            end_time = meeting['end']['dateTime']
            attendees = meeting['attendees']

            # Convert start and end time to datetime objects (assuming UTC from Microsoft API)
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))

            # Convert UTC time to local time zone
            start_dt_local = convert_to_local_time(start_dt)
            end_dt_local = convert_to_local_time(end_dt)

            # Check if the meeting's end time has passed the current time
            # if end_dt_local < current_time:
            #     print(f"Skipping meeting '{title}' as it has already ended.")
            #     continue  # Skip this meeting if the end time is in the past

            # Format start and end times as HH:MM
            formatted_start_time = start_dt_local.strftime('%H:%M:%S')
            formatted_end_time = end_dt_local.strftime('%H:%M:%S')

            # Calculate duration in minutes
            duration_in_minutes = int((end_dt_local - start_dt_local).total_seconds())

            # Convert duration to human-readable format
            formatted_duration = format_duration(duration_in_minutes)

            # Check if a meeting with the same Microsoft Calendar event ID already exists
            existing_meeting = frappe.db.exists('Meeting', {'custom_event_id': event_id})

            if not existing_meeting:
                # Prepare the guest list from attendees
                guests = []
                for idx, attendee in enumerate(attendees, start=1):
                    guests.append({
                        "docstatus": 0,  # Draft status
                        "doctype": "Guest",
                        "name": f"new-guest-{idx}",
                        "parent": "new-meeting",
                        "parentfield": "guest",
                        "parenttype": "Meeting",
                        "idx": idx,
                        "__unedited": False,
                        "full_name": attendee['emailAddress']['name'],
                        "email": attendee['emailAddress']['address'],
                        "employee": None  # Add employee ID if available
                    })

                # ERPNext Meeting doctype format
                meeting_data = {
                    "docstatus": 0,  # Draft status
                    "doctype": "Meeting",
                    "name": "new-meeting",
                    "title": title,
                    "meeting_room": "Board Room - 1",  # Customize as needed
                    "meeting_date": start_dt_local.date(),  # Meeting date in local time zone
                    "excel_start_time": formatted_start_time,
                    "excel_end_time": formatted_end_time,
                    "duration": duration_in_minutes,  # Store duration in total minutes
                    "excel_branch": "HR Tower",  # Customize as needed
                    "guest": guests,  # List of guests
                    "custom_event_id": event_id  # Store the Microsoft Calendar event ID
                }

                # Create the meeting in the Meeting doctype
                try:
                    new_meeting = frappe.get_doc(meeting_data)
                    new_meeting.insert()
                    frappe.db.commit()
                    print(f"Meeting '{title}' created successfully in ERPNext with duration {formatted_duration}.")
                except Exception as e:
                    print(f"Error creating meeting '{title}': {e}")
            else:
                print(f"Meeting '{title}' already exists in ERPNext. Skipping creation.")

    else:
        print(f"Error fetching meetings from Microsoft Calendar: {response.status_code} - {response.text}")

