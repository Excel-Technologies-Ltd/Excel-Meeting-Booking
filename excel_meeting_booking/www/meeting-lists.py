# about.py
import frappe
dynamic_template=1
def get_context(context):
    context.about_us_settings = frappe.get_doc('About Us Settings')
    context.sohan="oshan"
    context.dynamic_template=1
    return context
