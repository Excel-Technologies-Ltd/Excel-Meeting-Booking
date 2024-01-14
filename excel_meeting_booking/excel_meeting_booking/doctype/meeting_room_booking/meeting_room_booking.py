# Copyright (c) 2024, Shaid Azmin and contributors
# For license information, please see license.txt

import frappe
import datetime
from frappe.model.document import Document

class MeetingRoomBooking(Document):
    def on_cancel(self):
        self.cancel_meeting()
    def before_submit(self):
        self.create_meeting()
    #    need to stop here
    def create_meeting(self):
        all_date=self.get_dates_between()
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
                "guest":self.guest,
                "description":self.description,
                "excel_branch":self.excel_branch,
                "duration":self.duration,
                "start_datetime":start_datetime,
                "end_datetime":end_datetime,
            }).insert()
            
    def cancel_meeting(self):
        all_date=self.get_dates_between()
        for date in all_date:
            id=frappe.db.get_value("Meeting", filters={"meeting_date": date,"meeting_room":self.meeting_room, "excel_start_time":self.start_time, "excel_end_time":self.end_time,"excel_branch":self.branch}, fieldname=["name"])
            frappe.delete_doc('Meeting',id)

            

                     
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
        start_date = datetime.datetime.strptime(str(self.start_date), "%Y-%m-%d")
        end_date = datetime.datetime.strptime(str(self.end_date), "%Y-%m-%d")

        date_list = []

        current_date = start_date
        while current_date <= end_date:
            date_list.append(current_date.strftime("%Y-%m-%d"))
            current_date += datetime.timedelta(days=1)

        return date_list  
    def delete_meeting_list(self):
        print()

