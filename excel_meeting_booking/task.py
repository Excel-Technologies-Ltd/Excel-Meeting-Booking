import frappe
from datetime import datetime
import pytz


def printData():
    print("I'm working")

def all():
    bd_timezone = pytz.timezone('Asia/Dhaka')
    current_time = datetime.now(bd_timezone).strftime("%H:%M:%S")
    time=datetime.now().strftime("%H:%M:%S")
    today=datetime.now().strftime('%Y-%m-%d')
    data =frappe.db.get_list('Meeting',
    filters=[
        ['status','=','Open'],
        ['meeting_date', '=',today],
        ['excel_end_time','<',current_time]
        ],
    fields=['*'],)
    print("Meeting", data)
    print(today)
    print(current_time)
    print(len(data))
    for meeting in data:
        frappe.db.set_value('Meeting', meeting.name, 'status', 'Closed')
    frappe.db.commit()


def check():
    bd_timezone = pytz.timezone('Asia/Dhaka')
    current_time = datetime.now(bd_timezone).strftime("%H:%M:%S")
    time=datetime.now().strftime("%H:%M:%S")
    today=datetime.now().strftime('%Y-%m-%d')
    data =frappe.db.get_list('Meeting',
    filters=[
        ['status','=','Closed'],
        ['meeting_date', '=',today],
        ['excel_end_time','<',current_time]
        ],
    fields=['*'],)
    print(today)
    print(current_time)
    print(len(data))
    for meeting in data:
        frappe.db.set_value('Meeting', meeting.name, 'status', 'Open')
    frappe.db.commit()    

def check_third_party_meeting():
    config_doc = frappe.get_single('Third Party Meeting Configuration')
    config_doc.sync_third_party_meetings()



