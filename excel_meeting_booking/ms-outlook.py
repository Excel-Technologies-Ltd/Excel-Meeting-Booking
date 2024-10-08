import frappe
from datetime import datetime
import pytz
import requests
import json
from msal import ConfidentialClientApplication

# Define the constants required for OAuth2
CLIENT_ID = "765a9a1f-0239-4afa-ae6b-3dd4bc888b0e"  # Replace with your application client ID
CLIENT_SECRET = "Sat8Q~wCKhmqMwTGIxOGy5AjACkAWHxPCyNx1aI3"  # Replace with your client secret
AUTHORITY = "https://login.microsoftonline.com/0e9cff28-4f38-4a34-acc6-63c695f830a2"  # Replace with your actual tenant ID
SCOPES = ["https://graph.microsoft.com/.default"]  # Define the required scopes
USER_EMAIL = "shaidazmin@outlook.com"  # Replace with the actual user email or user ID

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

# Function to authenticate using ConfidentialClientApplication
def authenticate():
    # Initialize ConfidentialClientApplication
    client = ConfidentialClientApplication(
        client_id=CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET
    )

    # Acquire a token for the app (client credentials flow)
    result = client.acquire_token_for_client(scopes=SCOPES)

    # Check if the authentication was successful
    if "access_token" in result:
        print("Authentication successful!")
        return result["access_token"]
    else:
        raise Exception(f"Authentication failed: {result}")

# Function to fetch meetings from Microsoft Calendar for a specific user and create them in ERPNext
def sync_meetings():
    # Get the access token dynamically using the authenticate function
    access_token = authenticate()

    # Microsoft Graph API endpoint to get calendar events for a specific user
    endpoint = f'https://graph.microsoft.com/me/events'

    # Set up headers with the dynamically fetched access token
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    # Make the API request to get calendar events for the user
    response = requests.get(endpoint, headers=headers)

    if response.status_code == 200:
        events_data = response.json()
        meetings = events_data.get('value', [])

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

            # Format start and end times as HH:MM
            formatted_start_time = start_dt_local.strftime('%H:%M')
            formatted_end_time = end_dt_local.strftime('%H:%M')

            # Calculate duration in minutes
            duration_in_minutes = int((end_dt_local - start_dt_local).total_seconds() / 60)

            # Convert duration to human-readable format (e.g., 1h 30m, 1d 2h 40m)
            formatted_duration = format_duration(duration_in_minutes)

            print(f"Formatted Duration: {formatted_duration}")

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
                        "__islocal": 1,
                        "__unsaved": 1,
                        "owner": "azmin@excelbd.com",  # Adjust owner as needed
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
                    "__islocal": 1,
                    "__unsaved": 1,
                    "owner": "azmin@excelbd.com",  # Adjust owner as needed
                    "status": "Closed",  # Set status if needed
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
                    print(f"Meeting '{title}' created successfully in ERPNext with duration {duration_in_minutes} minutes.")
                except Exception as e:
                    print(f"Error creating meeting '{title}': {e}")
            else:
                print(f"Meeting '{title}' already exists in ERPNext. Skipping creation.")

    else:
        print(f"Error fetching meetings from Microsoft Calendar: {response.status_code} - {response.text}")

