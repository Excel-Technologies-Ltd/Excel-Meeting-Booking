# Copyright (c) 2024, Shaid Azmin and contributors
# For license information, please see license.txt

import frappe
import uuid
import pytz
from icalendar import Calendar, Event
import datetime
from frappe.model.document import Document

class MeetingRoomBooking(Document):
    def on_cancel(self):
        self.cancel_meeting()
    def before_save(self):
        # self.check()
        self.generate_mail()
       
        self.before_check_meeting() 
        
    def on_submit(self):
        self.ics_file_sender()
        self.create_meeting()

    def on_update_after_submit(self):
        self.update_meeting()
    #    need to stop here
    def before_check_meeting(self):
        all_date=self.get_dates_between()
        days_name=self.get_day()
        if self.repeat_on =="Weekly":
            days_name=self.get_day()
            all_date=self.filter_dates_by_day_type(all_date,days_name,self.repeat_on.lower())
        if self.repeat_on=='Monthly':
            all_date=self.check_and_push_array(all_date)  
        for date in all_date:
            self.check_meeting_time(date)     

    def ics_file_sender(self):
        get_guests_mail=self.generate_mail()
        
        all_date=self.get_dates_between()
        days_name=self.get_day()
        if self.repeat_on =="Weekly":
            days_name=self.get_day()
            all_date=self.filter_dates_by_day_type(all_date,days_name,self.repeat_on.lower())
        if self.repeat_on=='Monthly':
            all_date=self.check_and_push_array(all_date) 
        # ics_string=self.generate_ics(all_date)    
        cal=Calendar()
        
        
        cal.version="2.0"
        cal.method="REQUEST"
        cal["VERSION"]="2.0"
        cal["PRODID"]="-//ical.marudot.com//iCal Event Maker"
      
        for date in all_date: 
            organizer = f"MAILTO:{self.owner}"
            timezone = pytz.timezone('Asia/Dhaka')  
            event = Event()  
            event.add('summary', self.title)
            event['organizer']=organizer
            event.add('dtstart', (datetime.datetime.strptime(f"{date} {self.start_time}", "%Y-%m-%d %H:%M:%S")))
            event.add('dtend', (datetime.datetime.strptime(f"{date} {self.end_time}", "%Y-%m-%d %H:%M:%S")))
            event.add('dtstamp', datetime.datetime.strptime(f"{date}", "%Y-%m-%d"))
            event['uid'] = f"{str(uuid.uuid4())}@ical.marudot.com"
                     
            # event.name= self.title
            # event.begin= timezone.localize(datetime.datetime.strptime(f"{date} {self.start_time}", "%Y-%m-%d %H:%M:%S"))
            # event.end= timezone.localize(datetime.datetime.strptime(f"{date} {self.end_time}", "%Y-%m-%d %H:%M:%S"))
            # event.created=timezone.localize(datetime.datetime.strptime(f"{date}", "%Y-%m-%d"))
            
            # event.last_modified=datetime.datetime.now()
            cal.add_component(event)
        attachment_name = f"{self.name}.ics"
        ics_string = cal.to_ical().decode("utf-8")  
          
        file_doc = frappe.get_doc({
            "doctype": "File",
            "file_name": attachment_name,
            "attached_to_doctype": self.doctype,
            "attached_to_name": self.name,           
            "content": ics_string,
            "is_private": 0,
            "content_type": "text/calendar"
            # Set to 1 if you want the attachment to be private
        }).insert()
        # Attach the ICS file
        

        # path = frappe.get_site_path("File",self.doctype,attachment_name,)

      
        frappe.sendmail(
            recipients=get_guests_mail,
            subject=f"Invitation: {self.title}",
            template='meeting_template',
            args=dict(
               title=self.title,
               meeting_room=self.meeting_room,
               start_date=self.start_date,
               start_time=self.start_time,
               description= self.description,
               branch=self.excel_branch
            ),
            attachments=[{"file_url": file_doc.file_url}],
        )
                
                        
    def create_meeting(self):
        all_date=self.get_dates_between()
        days_name=self.get_day()
        if self.repeat_on =="Weekly":
            days_name=self.get_day()
            all_date=self.filter_dates_by_day_type(all_date,days_name,self.repeat_on.lower())
        if self.repeat_on=='Monthly':
            all_date=self.check_and_push_array(all_date)  
        for date in all_date:
            self.check_meeting_time(date)
            start_datetime=f"{date} {self.start_time}"
            end_datetime=f"{date} {self.end_time}"
            new_data=frappe.get_doc({
                "doctype":"Meeting",
                "meeting_date":date,
                "excel_start_time":self.start_time,
                "excel_end_time":self.end_time,
                "title":self.title,
                "meeting_room":self.meeting_room,
                "guest":self.guests,
                "description":self.description,
                "excel_branch":self.excel_branch,
                "duration":self.duration,
                "start_datetime":start_datetime,
                "end_datetime":end_datetime,
                "booking_id":self.name,
                "status":'Open'
                
            })
            new_data.flags.ignore_permissions = True
            new_data.insert()

    def update_meeting(self):
        # Get all the dates for the meeting (handling repeating meetings)
        all_date = self.get_dates_between()
        days_name = self.get_day()

        if self.repeat_on == "Weekly":
            all_date = self.filter_dates_by_day_type(all_date, days_name, self.repeat_on.lower())
        if self.repeat_on == 'Monthly':
            all_date = self.check_and_push_array(all_date)

        # Loop through each date and update the corresponding meeting entry
        for date in all_date:
            # Fetch existing meeting by booking ID and date
            existing_meeting_id = frappe.db.get_value("Meeting", filters={
                "booking_id": self.name,
                "meeting_date": date
            }, fieldname="name")

            if existing_meeting_id:
                # Update the meeting details
                meeting_doc = frappe.get_doc("Meeting", existing_meeting_id)
                meeting_doc.excel_start_time = self.start_time
                meeting_doc.excel_end_time = self.end_time
                meeting_doc.duration = self.duration
                meeting_doc.start_datetime = f"{date} {self.start_time}"
                meeting_doc.end_datetime = f"{date} {self.end_time}"

                # Save the changes
                meeting_doc.flags.ignore_permissions = True
                meeting_doc.save()
                frappe.db.commit()
            else:
                # If no meeting exists for that date, you may want to create it
                self.create_meeting()          
    def cancel_meeting(self):
        all_date=self.get_dates_between()
        if self.repeat_on =="Weekly":
            days_name=self.get_day()
            all_date=self.filter_dates_by_day_type(all_date,days_name,self.repeat_on.lower())
        if self.repeat_on=='Monthly':
            all_date=self.check_and_push_array(all_date)            
        for date in all_date:
            id = frappe.db.get_value("Meeting", filters={"meeting_date": date, "meeting_room": self.meeting_room, "excel_start_time": self.start_time, "excel_end_time": self.end_time, "excel_branch": self.excel_branch}, fieldname=["name"])
            if id:
                frappe.delete_doc('Meeting', id)
                print(f"Meeting {id} deleted")
            else:
                print(f"No meeting found for date: {date}")

            

                     
    def check_meeting_time(self,date):
        existing_time_slots = frappe.db.get_list("Meeting",
            filters={
                'meeting_date': date,
                'meeting_room': self.meeting_room
            },
            fields=['excel_start_time', 'excel_end_time'],
        )
        
        new_start_time = self.start_time  
        new_end_time = self.end_time  
        if not self.is_valid_meeting(new_start_time, new_end_time, existing_time_slots):
            frappe.throw("Meeting time overlaps with existing time slots. Please choose a different time.")

    def is_valid_meeting(self, new_start_time, new_end_time, existing_time_slots):
        new_start_time = datetime.datetime.strptime(str(new_start_time), "%H:%M:%S")
        new_end_time = datetime.datetime.strptime(str(new_end_time), "%H:%M:%S")

        for existing_slot in existing_time_slots:
            try:
               
                existing_start_time = datetime.datetime.strptime(str(existing_slot["excel_start_time"]), "%H:%M:%S")
                existing_end_time = datetime.datetime.strptime(str(existing_slot["excel_end_time"]), "%H:%M:%S")

                if (
                    (existing_start_time <= new_start_time < existing_end_time) or
                    (existing_start_time < new_end_time <= existing_end_time) or
                    (new_start_time <= existing_start_time and new_end_time >= existing_end_time)
                ):
                    return False  
            except ValueError as e:
                frappe.msgprint(f"Error processing time slot: {existing_slot}. Error: {str(e)}")

        return True
    
    def get_dates_between(self):
        is_repeat=self.repeat_this_meeting
        start_date = datetime.datetime.strptime(str(self.start_date), "%Y-%m-%d")
        if is_repeat=="No":
            end_date=start_date
        else:end_date = datetime.datetime.strptime(str(self.end_date), "%Y-%m-%d")
        if is_repeat=="Yes":
            if start_date> end_date:
                return   frappe.msgprint(f"start date should not bigger than end date")
        date_list = []

        current_date = start_date
        while current_date <= end_date:
            date_list.append(current_date.strftime("%Y-%m-%d"))
            current_date += datetime.timedelta(days=1)

        return date_list  

    def filter_dates_by_day_type(self,dates, day_names, day_type):
        
        result_dates = []
        
        for date_str in dates:
            date_obj = datetime.datetime.strptime(str(date_str), "%Y-%m-%d")
            if day_type == 'weekly' and date_obj.strftime('%A') in day_names:
                result_dates.append(date_str)
            # elif day_type == 'monthly' and date_obj.strftime('%A') in day_names and date_obj.day <= 7:
            #     result_dates.append(date_str)
        if not result_dates:
            frappe.throw("No dates found for the selected criteria. May be you not selected days or selected wrong day")        
        return result_dates
    
    def get_day(self):
        days=[]
        day_attributes = {
            "Saturday": getattr(self, "saturday", 0),
            "Sunday": getattr(self, "sunday", 0),
            "Monday": getattr(self, "monday", 0),
            "Tuesday": getattr(self, "tuesday", 0),
            "Wednesday": getattr(self, "wednesday", 0),
            "Thursday": getattr(self, "thursday", 0),
            "Friday": getattr(self, "friday", 0),
        }
        for day_name, day_value in day_attributes.items():
            if day_value == 1:
                days.append(day_name)
        return days       
    def check_and_push_array(self,input_dates):
        result_array = []
        day_of_date = datetime.datetime.strptime(str(self.start_date), "%Y-%m-%d")
        for date_str in input_dates:
            # Check if the day part of the date is '13'
            if date_str.split('-')[2] == day_of_date.strftime('%d'):
                result_array.append(date_str)

        return result_array
    def send_ics_file_by_mail(self):
        print()
    def generate_ics(self,dates):
        timezone = pytz.timezone('Asia/Dhaka')  
        start_date=timezone.localize(datetime.datetime.strptime(f"{dates[0]} {self.start_time}", "%Y-%m-%d %H:%M:%S"))
        ics_content = """BEGIN:VCALENDAR
VERSION:2.0
PRODID:ics.py - http://git.io/lLljaA
METHOD:REQUEST
BEGIN:VTIMEZONE
TZID:Asia/Dhaka
BEGIN:STANDARD
TZNAME:+06
TZOFFSETFROM:+0600
TZOFFSETTO:+0600
DTSTART:{f"{}"}
UID:{f"{event_uuid}@gdyuwdg.org"}
END:STANDARD
END:VTIMEZONE
"""

        for date in dates:
            timezone = pytz.timezone('Asia/Dhaka')  
            dtstamp = datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
            dtstart = timezone.localize(datetime.datetime.strptime(f"{date} {self.start_time}", "%Y-%m-%d %H:%M:%S"))
            dtend = timezone.localize(datetime.datetime.strptime(f"{date} {self.start_time}", "%Y-%m-%d %H:%M:%S"))

            # Generate a UUID for the event
            event_uuid = str(uuid.uuid4())

            ics_content += f"""BEGIN:VEVENT
DTSTAMP:{dtstamp}
DTEND:{dtend}
DTSTART:{dtstart}
SUMMARY:{self.title}
UID:{f"{event_uuid}@gdyuwdg.org"}
END:VEVENT
"""

        ics_content += "END:VCALENDAR\n"
        return ics_content    
    def generate_mail(self):
        total_email=[]
        guests=self.guests
        for guest in guests:
            total_email.append(guest.email)
        return total_email   
                

@frappe.whitelist()
def get_events(start, end, user=None, for_reminder=False, filters=None):
    meetings=frappe.db.sql(
        """
        select tm.booking_id as name,tm.title,tm.start_datetime,tm.end_datetime,tm.meeting_date from `tabMeeting` as tm
        WHERE (
				(
					(date(tm.meeting_date) BETWEEN date(%(start)s) AND date(%(end)s) AND tm.status='Open')))
        """,
        
        	{
			"start": start,
			"end": end,
			"user": user,
		},
		as_dict=1,
    )
    existing_time_slots = frappe.db.get_list("Meeting",
            fields=['*'],
        )
    return meetings
