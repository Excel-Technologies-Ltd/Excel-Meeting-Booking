// Copyright (c) 2024, Shaid Azmin and contributors
// For license information, please see license.txt

frappe.ui.form.on('Meeting List', {
	// refresh: function(frm) {

	// }
});
frappe.listview_settings['Meeting List'] = {
	onload(listview) {
        // triggers once before the list is loaded
		console.log(listview)
    },
}

