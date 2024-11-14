# Third Party Meetings Integration

## Overview

This application integrates meetings and events from Zoom, Microsoft Teams, and Google Meet into ERPNext. It allows users to manage and view meetings from these platforms within the ERPNext ecosystem, streamlining the process of event management.

## Features

- **Integration with Zoom**: Fetch and display meetings associated with a Zoom account.
- **Integration with Microsoft Teams**: Retrieve and show meetings scheduled in Microsoft Teams.
- **Integration with Google Meet**: Access and manage Google Meet events.

## Prerequisites

Before you begin, ensure you have the following:

- An instance of ERPNext set up and running.
- API credentials for Zoom, Microsoft Teams, and Google Meet.

## Setup Instructions

### 1. Zoom Integration

To integrate Zoom meetings, follow these steps:

1. **Create a Zoom App**:

   - Go to the [Zoom App Marketplace](https://marketplace.zoom.us/).
   - Click on "Develop".
     ![alt text](image.png)

   - Then Click on "Build App".
     ![alt text](image-1.png)

   - A pop up will appear, to agree to the terms and conditions, click on "Accept".
     ![alt text](image-2.png)

   - After that another pop up will appear, asking that what kind of app you want to build, click on "Server to Server OAuth App".
     ![alt text](image-3.png)

   - Then click create. Another pop up will appear, asking for the app name, add the name and click on "Create".
     ![alt text](image-4.png)

   - This will create an app, and you will be redirected to the app dashboard.
     ![alt text](image-5.png)

   - Then in the left sidebar, click on "Information" tab. And fill the Company Name, Developer Name and Developer Email and Click "Continue".
     ![alt text](image-6.png)

   - Then in "Scopes" Tab, click on "Add Scope".
     ![alt text](image-7.png)

   - Then in Search Scope, search for "meeting:read:admin" and select all scopes and click "Done".
     ![alt text](image-8.png)

   - Then in "Activation" Tab, click on "Activate your app" Button.
     ![alt text](image-9.png)

   - This will activate your app.
     ![alt text](image-10.png)

2. **Obtain Credentials**:

   - **Account ID**: Find your account ID in the Zoom admin dashboard.
   - **Client ID**: Generated when you create the app.
   - **Client Secret**: Generated when you create the app.

### 2. Google Meet Integration

To integrate Google Meet:

1. **Create a Google Cloud Project**:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project by clicking on "Select a project" dropdown in the top left corner and click on "New Project".
     ![alt text](google-2.png)
     ![alt text](google-3.png)
   - Then give the project a name, Location can be default "No Organization" and click on "Create".
     ![alt text](google-4.png)

   - It will take to the home page and a notificaiton will appear on the top right corner, click on "Select Project".
     ![alt text](google-6.png)

   - This will take you to the home page of the project.
     ![alt text](google-7.png)

   - From the left sidebar, click on "API & Services" and then click on "Enable APIs and Services".
     ![alt text](google-8.png)

   - In the search bar, search for "Google Calendar API" and click Enter for search.
     ![alt text](google-9.png)

   - It will show the Google Calendar API, click on "Google Calendar API".
     ![alt text](google-10.png)

   - Then click on "Enable" button.
     ![alt text](google-11.png)

   - This will enable the Google Calendar API. Now click on "Create Credentials" button.
     ![alt text](google-12.png)

   - A new page will appear, to create Credentials, By default in "Select an Api" the "Google Calendar API" will be selected, for the next question "What data will you be accessing?" select "Application Data" and click on "Next".
     ![alt text](google-13.png)

   - It will ask you to create a Service Account, give the Service Account a name and click on "Done".
     ![alt text](google-14.png)

   - Then go the 'Credentials' page, you will see a email id added to the "Service Account" section, you will see a email id click on the email id.
     ![alt text](google-15.png)

   - Here You will see the email id of the service Account, copy the email id for later use.
     ![alt text](google-20.png)

   - Now, click on "Keys" tab.
     ![alt text](google-16.png)

   - Then click on "Add Key" button and select "Create New Key".
     ![alt text](google-17.png)

   - This will create a new key, now click on "Create" button.
     ![alt text](google-18.png)

   - This will download the key file, keep it safe as it will be used to authenticate the API calls.

   - Now go to your Google Calendar, you will see My Calendars section, click on the calendar you want to fetch the events from. (It should be the one with google account name). And Select 'Settings & sharing' from three dots menu
     ![alt text](google-19.png)

   - Here go to the "Share with Specific people or groups" and click add people and groups button
     ![alt text](google-21.png)

   - Then paste the email id of the service account in the Add Email or Name field and click on the email id it will be added and then click on "Send" button.
     ![alt text](google-22.png)

   - This will share the calendar with the service account email id.

   - Find the 'Calendar ID' from the settings of the calendar.
     ![alt text](google-23.png)

2. **Obtain Credentials**:

   - **User ID**: Calendar ID of the calendar you want to fetch events from.
   - **Upload Credential**: The key file downloaded from the Google Cloud Console.

### 3. Team Integration

In order to configure Teams with our meeting room management app, we can follow either one of the methods.

- **Method A** - Provide us an administrator email and password of Microsoft 365 so that we can create necessary configurations for you.
- **Method B** - You can also create necessary configurations and provide us with the following details:

  - **Client ID**: Generated when you create the app.
  - **Client Secret**: Generated when you create the app.
  - **Tenant ID**: The tenant ID of your Microsoft 365 account.
  - **User ID**: The user ID of the user whose meetings you want to fetch.

  If you choose the first method, provide us with the necessary details and we will configure the app for you.

  If you choose the second method, follow the steps below:

  #### Method B

  - First login to this portal https://entra.microsoft.com/
  - Then we have to Register an Application with necessary configuration.

    ![alt text](microsoft-1.png)

  - Enter Application Name and supported account type as shown on the image

    ![alt text](microsoft-2.png)

  - Create Certificates & Secrets

    ![alt text](microsoft-3.png)

  - Copy the Secret ID and value and save it in a note / document. We will need it.

    ![alt text](microsoft-4.png)

  - Add required permission for the Application

    ![alt text](microsoft-5.png)
    ![alt text](microsoft-6.png)

  - Allow **Grant admin consent for Default Directory** and click on **Yes**

    ![alt text](microsoft-7.png)

  - Copy the **Application (client) ID**, **Object ID**, **Directory (tenant) ID**, **Secret ID**, Value from above and share with us. We will configure the app for you.

    ![alt text](microsoft-8.png)
