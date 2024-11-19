# Copyright (c) 2024, Shaid Azmin and contributors
# For license information, please see license.txt
from datetime import datetime, timedelta
import frappe
import os
import pytz
import requests
from msal import ConfidentialClientApplication
from frappe.model.document import Document
from google.oauth2 import service_account
from googleapiclient.discovery import build
import re

# Set your local time zone (for example, Asia/Dhaka)
LOCAL_TIME_ZONE = 'Asia/Dhaka'

class ThirdPartyMeetingConfiguration(Document):
    def before_save(self):
          for meeting_configuration in self.meeting_configuration:
            if meeting_configuration.platform_name == "Google":
                if not meeting_configuration.upload_credential:
                    frappe.throw("Google Service Account credential file is mandatory for Google meeting configuration")
                elif not meeting_configuration.user_id:
                    frappe.throw("User Id is mandatory for Google meeting configuration")
            elif meeting_configuration.platform_name == "Zoom":
                if not meeting_configuration.user_id:
                    frappe.throw("Zoom Account ID is mandatory for Zoom meeting configuration")
                elif not meeting_configuration.client_id:
                    frappe.throw("Client ID is mandatory for Zoom meeting configuration")
                elif not meeting_configuration.client_secret:
                    frappe.throw("Client Secret is mandatory for Zoom meeting configuration")
            elif meeting_configuration.platform_name == "Microsoft":
                
                if not meeting_configuration.user_id:
                    frappe.throw("User ID is mandatory for Microsoft meeting configuration")
                elif not meeting_configuration.client_id:
                    frappe.throw("Client ID is mandatory for Microsoft meeting configuration")
                elif not meeting_configuration.client_secret:
                    frappe.throw("Client Secret is mandatory for Microsoft meeting configuration")
                elif not meeting_configuration.tenant_id:
                    frappe.throw("Tenant ID is mandatory for Microsoft meeting configuration")
                if meeting_configuration.user_id:
                    user_ids = [email.strip() for email in meeting_configuration.user_id.split(',')]
                    email_ids=[]
                    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$'
                    for email in user_ids:
                        if not re.match(email_regex, email):
                            frappe.throw(f"Invalid email address: {email}")
        

    

    def sync_third_party_meetings(self):
        for meeting_configuration in self.meeting_configuration:
            if meeting_configuration.platform_name == "Google":     
                google_events = self.get_google_events(meeting_configuration)
                
                if isinstance(google_events, list):  
                    # Ensure it's a list before extending
                    for event in google_events:
                        self.create_google_meeting_booking(event)
                else:
                    self.create_google_meeting_booking(google_events)
            
            if meeting_configuration.platform_name == "Zoom":
                self.handle_zoom_meetings(meeting_configuration)
                
          
            if meeting_configuration.platform_name == "Microsoft":
                microsoft_events = self.get_microsoft_events(meeting_configuration)

                print("Microsoft Events", frappe.as_json(microsoft_events))

                # Spread new_meetings into the meetings list
                if isinstance(microsoft_events, list):  # Ensure it's a list before extending
                    # print("Microsoft Events", frappe.as_json(microsoft_events))
                    for event in microsoft_events:
                        print("Event", frappe.as_json(event))
                        self.create_microsoft_meeting_booking(event)
                else:
                    self.create_microsoft_meeting_booking(microsoft_events)

    def create_google_meeting_booking(self, meeting):
        # print("Creating Google Meeting Booking")
         # Get the current local time
        current_time = datetime.now(pytz.timezone(LOCAL_TIME_ZONE))

        # Extract relevant data from Google Calendar event
        event_id = meeting.get('id')  # Unique ID for the event
        title = meeting.get('summary')  # Use 'Google Meeting' if no summary is provided


        start_time = meeting.get('start').get('dateTime')
        end_time = meeting.get('end').get('dateTime') 

        if not title:
            return # Skip this meeting if no title is provided
        if not start_time or not end_time:
            print(f"Skipping meeting '{title}' as it has no start or end time.")
            return  # Skip this meeting if no start or end time is provided

        # Attendees from Google event
        attendees = meeting.get('attendees') if meeting.get('attendees') else []

        # Convert start and end time to datetime objects (assuming UTC from Google Calendar API)
     
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
    
        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
     

        # Convert UTC time to local time zone
        if start_dt:
            start_dt_local = self.convert_to_local_time(start_dt)
        else:
            start_dt_local = None

        if end_dt:
            end_dt_local = self.convert_to_local_time(end_dt)

        # Check if the meeting's end time has passed the current time
        if end_dt_local < current_time:
            print(f"Skipping meeting '{title}' as it has already ended.")
            return  # Skip this meeting if the end time is in the past

        # Format start and end times as HH:MM
        formatted_start_time = start_dt_local.strftime('%H:%M:%S')
        formatted_end_time = end_dt_local.strftime('%H:%M:%S')

        # Calculate duration in seconds
        duration_in_seconds = int((end_dt_local - start_dt_local).total_seconds())

        # Convert duration to human-readable format
        formatted_duration = self.format_duration(duration_in_seconds)

        # Check if a meeting with the same Google Calendar event ID already exists
        existing_meeting = frappe.db.exists('Meeting', {'custom_event_id': event_id})

        if not existing_meeting:
            # Prepare the guest list from attendees, extracting name from email
            guests = []
            for idx, attendee in enumerate(attendees, start=1):
                email = attendee['email']
                # Extract the name part from the email before the '@' symbol
                guests.append({
                    "docstatus": 0,  # Draft status
                    "doctype": "Guest",
                    "name": f"new-guest-{idx}",
                    "parent": "new-meeting",
                    "parentfield": "guest",
                    "parenttype": "Meeting",
                    "idx": idx,
                    "__unedited": False,
                    "email": email,
                    "employee": None  # Add employee ID if available
                })

            # ERPNext Meeting doctype format
            meeting_data = {
                "docstatus": 0,  # Draft status
                "doctype": "Meeting",
                "name": "new-meeting",
                "title": title,
                "meeting_room": "Board Room - 1",  # Customize as needed
                "start_datetime": f"{start_dt_local.date()} {formatted_start_time}",
                "end_datetime": f"{end_dt_local.date()} {formatted_end_time}",
                "meeting_date": start_dt_local.date(),  # Meeting date in local time zone
                "excel_start_time": formatted_start_time,
                "excel_end_time": formatted_end_time,
                "duration": duration_in_seconds,  # Store duration in total seconds
                "excel_branch": "HR Tower",  # Customize as needed
                "guest": guests,  # List of guests
                "custom_event_id": event_id,  # Store the Google event ID
            }

            # Create the meeting in the Meeting doctype
            try:
                # print(meeting_data)
                new_meeting = frappe.get_doc(meeting_data)
                new_meeting.insert()
                frappe.db.commit()
                # print(f"Meeting '{title}' created successfully in ERPNext with duration {formatted_duration}.")
            except Exception as e:
                print(f"Error creating meeting '{title}': {e}")
        else:
            print(f"Meeting '{title}' already exists in ERPNext. Skipping creation.")

    def get_zoom_guests_by_event_id(self, event_id, token):
        print("Getting Zoom Guests")
        api_url = f"https://api.zoom.us/v2/meetings/{event_id}"
        headers = {
            'Authorization': f'Bearer {token}'
        }
        response = requests.get(api_url, headers=headers)
        return response.json().get('settings',{}).get('meeting_invitees',[])

    def create_zoom_meeting_booking(self, meeting, token):
    # Extract relevant data from Zoom meeting object
        event_id = meeting.get('id')  # Unique ID for the event
        title = meeting.get('topic', 'Zoom Meeting')  # Use 'Zoom Meeting' if no topic is provided
        start_time = meeting.get('start_time')  # Start time from Zoom
        duration_in_minutes = meeting.get('duration', 0)  # Duration in minutes, default to 0
        timezone = meeting.get('timezone', 'UTC')  # Use UTC if no timezone is provided
        attendees = []  # Default empty attendee list

        # print("Meeting id", event_id)

        # Convert start time to a datetime object
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))

        # Set timezone based on Zoom's provided timezone
        start_dt = start_dt.astimezone(pytz.timezone(timezone))

        # Calculate the end time using the start time and duration
        end_dt = start_dt + timedelta(minutes=duration_in_minutes)

        # Calculate duration in seconds
        duration_in_seconds = duration_in_minutes * 60

        # Convert to local time zone
        start_dt_local = self.convert_to_local_time(start_dt)
        end_dt_local = self.convert_to_local_time(end_dt)

        # Format start and end times as HH:MM
        formatted_start_time = start_dt_local.strftime('%H:%M:%S')
        formatted_end_time = end_dt_local.strftime('%H:%M:%S')

        # Check if the meeting's end time has passed the current time
        current_time = datetime.now(pytz.timezone(LOCAL_TIME_ZONE))
        if end_dt_local < current_time:
            print(f"Skipping meeting '{title}' as it has already ended.")
            return  # Skip this meeting if the end time is in the past

        # Check if a meeting with the same Zoom event ID already exists
        existing_meeting = frappe.db.exists('Meeting', {'custom_event_id': event_id})

        if not existing_meeting:


            # get the guest list from attendees
            guests = []

            attendees = self.get_zoom_guests_by_event_id(event_id, token)
            
            if attendees:
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
                        "email": attendee['email'],
                        "employee": None  # Add employee ID if available
                    })

            # ERPNext Meeting doctype format
            meeting_data = {
                "docstatus": 0,  # Draft status
                "doctype": "Meeting",
                "name": "new-meeting",
                "title": title,
                "meeting_room": "Board Room - 1",  # Customize as needed
                "start_datetime": f"{start_dt_local.date()} {formatted_start_time}",
                "end_datetime": f"{start_dt_local.date()} {formatted_end_time}",
                "meeting_date": start_dt_local.date(),  # Meeting date in local time zone
                "excel_start_time": formatted_start_time,
                "excel_end_time": formatted_end_time,
                "duration": duration_in_seconds ,  # Store duration in total seconds
                "excel_branch": "HR Tower",  # Customize as needed
                "guest": attendees,  # Empty attendee list
                "custom_event_id": event_id,  # Store the Zoom event ID
            }

            # Create the meeting in the Meeting doctype
            try:
                new_meeting = frappe.get_doc(meeting_data)
                new_meeting.insert()
                frappe.db.commit()
                formatted_duration = self.format_duration(duration_in_minutes)
                print(f"Meeting '{title}' created successfully in ERPNext with duration {formatted_duration}.")
            except Exception as e:
                print(f"Error creating meeting '{title}': {e}")
        else:
            print(f"Meeting '{title}' already exists in ERPNext. Skipping creation.")

    def handle_zoom_meetings(self, meeting_configuration):
        
        # Extract required details from `meeting_configuration`
        user_id = meeting_configuration.get("user_id")
        client_id = meeting_configuration.get("client_id")
        client_secret = meeting_configuration.get("client_secret")

        # Ensure mandatory fields are present
        if not user_id or not client_id or not client_secret:
            frappe.throw("Zoom Account ID, Client ID, and Client Secret are mandatory")

        # Get the access token once
        token = self.get_zoom_access_token(user_id, client_id, client_secret)

        # Retrieve Zoom events using the access token
        zoom_events = self.fetch_zoom_meetings(token)

        print("Zoom Events", frappe.as_json(zoom_events))        

        # Process the events if it's a list
        if isinstance(zoom_events, list):
            for event in zoom_events:
                self.create_zoom_meeting_booking(event, token)
        else:
            self.create_zoom_meeting_booking(zoom_events, token)
            

    def create_microsoft_meeting_booking(self, meeting):
        # print("Meeting", frappe.as_json(meeting))
         # Get the current local time
        print("Creating Microsoft Meeting Booking")
        current_time = datetime.now(pytz.timezone(LOCAL_TIME_ZONE))
  
        # Extract relevant data from Microsoft Calendar event
        event_id = meeting.get('id') # Unique ID for the event

        print("Event ID", event_id)
        branch= self.default_branch
        room= self.default_room
        meeting_room = meeting.get('location').get('displayName') or room

        title = meeting.get('subject')
        start_time = meeting.get('start').get('dateTime')
        end_time = meeting.get('end').get('dateTime') if meeting.get('end') else None
        attendees = meeting.get('attendees') if meeting.get('attendees') else None
		
		# Convert start and end time to datetime objects (assuming UTC from Microsoft API)
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
		
		# Convert UTC time to local time zone
        start_dt_local = self.convert_to_local_time(start_dt)
        end_dt_local = self.convert_to_local_time(end_dt)
		
			# Check if the meeting's end time has passed the current time
        if end_dt_local < current_time:
            print(f"Skipping meeting '{title}' as it has already ended.")
            return  # Skip this meeting if the end time is in the past
		
		# Format start and end times as HH:MM
        formatted_start_time = start_dt_local.strftime('%H:%M:%S')
        formatted_end_time = end_dt_local.strftime('%H:%M:%S')
		
		# Calculate duration in seconds
        duration_in_seconds = int((end_dt_local - start_dt_local).total_seconds())

		# Convert duration to human-readable format
        formatted_duration = self.format_duration(duration_in_seconds)

		# Check if a meeting with the same Microsoft Calendar event ID already exists
        existing_meeting = frappe.db.exists('Meeting', {'custom_event_id': event_id})

        if not existing_meeting:
			# Prepare the guest list from attendees
            guests = []
            if attendees:
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
				"meeting_room": meeting_room,
				"start_datetime": f"{start_dt_local.date()} {formatted_start_time}",
				"end_datetime": f"{start_dt_local.date()} {formatted_end_time}",
				# Customize as needed
				"meeting_date": start_dt_local.date(),  # Meeting date in local time zone
				"excel_start_time": formatted_start_time,
				"excel_end_time": formatted_end_time,
				"duration": duration_in_seconds,  # Store duration in total seconds
				"excel_branch": branch,  # Customize as needed
				"guest": guests,  # List of guests
				"custom_event_id": event_id  # Store the Microsoft Calendar event ID
			}
			# Create the meeting in the Meeting doctype
            try:
                # print(meeting_data)
                new_meeting = frappe.get_doc(meeting_data)
                new_meeting.insert()
                frappe.db.commit()
                print(f"Meeting '{title}' created successfully in ERPNext with duration {formatted_duration}.")
            except Exception as e:
                print(f"Error creating meeting '{title}': {e}")
        else:
            print(f"Meeting '{title}' already exists in ERPNext. Skipping creation.")

    def format_duration(self, minutes):
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

    def convert_to_local_time(self, utc_time):
        """Convert UTC time to local time zone"""
        return utc_time.astimezone(pytz.timezone(LOCAL_TIME_ZONE))
    

    def get_google_events(self, meeting_configuration):
        print("Checking Google Calendar")
        # Ensure that platform is Google
        if meeting_configuration.platform_name == "Google":
            # Fetch the path to the uploaded credential file
            relative_file_path = meeting_configuration.get("upload_credential")
            user_id = meeting_configuration.get("user_id")
            
            # Get the absolute path using frappe.get_site_path
            if not relative_file_path:
                frappe.throw("Google Service Account credential file is mandatory")
            
            # Get the full absolute path to the file, handling /private/files
            credential_file_path = frappe.get_site_path('private', 'files', relative_file_path.split('/')[-1])
        
            SCOPES = [
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.events'
            ]
        
            # Create credentials from the service account file
            credentials = service_account.Credentials.from_service_account_file(
                credential_file_path, scopes=SCOPES
            )
        
            # Build the service
            service = build('calendar', 'v3', credentials=credentials)
        
            # Assuming the calendar ID is stored in meeting_configuration
            calendar_id = user_id    # Assuming user_id stores the calendar email
        
            # Fetch events from Google Calendar
            events_result = service.events().list(calendarId=calendar_id).execute()
            events = events_result.get('items', [])
        
            if not events:
                print('No upcoming events found.')
                return []
        
            # print("Google Events", frappe.as_json(events))  
        
            return events



    def get_zoom_access_token(self, user_id, client_id, client_secret):
        api_url = 'https://zoom.us/oauth/token'
        response = requests.post(api_url, {
            'grant_type': 'account_credentials',
            'account_id': user_id,
            'client_id': client_id,
            'client_secret': client_secret
        })
        return response.json().get("access_token")

    def fetch_zoom_meetings(self, access_token):
        api_url = 'https://api.zoom.us/v2/users/me/meetings'
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        params = {
            'type': 'upcoming',  
            'page_size': 30,  
        }
        response = requests.get(api_url, headers=headers, params=params)
        return response.json().get("meetings", [])
    
    def get_microsoft_events(self, meeting_configuration):
        print("Checking Microsoft Meeting")
        # print(frappe.as_json(meeting_configuration))
        if meeting_configuration.platform_name == "Microsoft":
            user_id = meeting_configuration.get("user_id")
            user_id = [email.strip() for email in user_id.split(',')]
            client_id = meeting_configuration.get("client_id")
            client_secret = meeting_configuration.get("client_secret")
            tenant_id = meeting_configuration.get("tenant_id")

            if not user_id or not client_id or not client_secret or not tenant_id:
                frappe.throw("User ID, Client ID, Client Secret, and Tenant ID are mandatory")
            
            token = self.get_microsoft_access_token(client_id, client_secret, tenant_id)
            all_events = []
            # print("token", token)
            for user in user_id:
                events = self.fetch_microsoft_events(token,user)
                frappe.msgprint('eventsfg', frappe.as_json(events))
                if events and "value" in events:
                    all_events.extend(events.get("value", []))
            return all_events


    def get_microsoft_access_token(self, client_id, client_secret, tenant_id):
        authority = f"https://login.microsoftonline.com/{tenant_id}"
        client = ConfidentialClientApplication(client_id, authority=authority, client_credential=client_secret)
        result = client.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
        return result.get("access_token")

    def fetch_microsoft_events(self, access_token, user_id):
        today = datetime.now(pytz.UTC).replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=10)
        
        start_time = today.strftime('%Y-%m-%dT%H:%M')
        end_time = tomorrow.strftime('%Y-%m-%dT%H:%M')
        
        api_url = (
            f'https://graph.microsoft.com/v1.0/users/{user_id}/events'
            f"?$select=id,subject,start,end,attendees,location"
            f"&$filter=start/dateTime ge '{start_time}' and start/dateTime lt '{end_time}'"
        )
        headers = {
            'Authorization': f'Bearer {access_token}',
            "Content-Type": "application/json"
        }
        response = requests.get(api_url, headers=headers)
        return response.json()
    
    

