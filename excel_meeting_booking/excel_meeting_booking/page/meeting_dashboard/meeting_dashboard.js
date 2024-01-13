frappe.pages['meeting-dashboard'].on_page_load = function(wrapper) {
    new MyPage(wrapper);
}

MyPage = Class.extend({
    init: function(wrapper) {
        this.page = frappe.ui.make_app_page({
            parent: wrapper,
            title: 'Meeting List',
            single_column: true
        });

        // Rest of your code for initializing the page goes here
    },
	make:function(){

	}

});
